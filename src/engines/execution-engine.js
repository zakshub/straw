import crypto from 'node:crypto';

export const PRODUCT_LIFECYCLE_STAGES = [
  { number: 1, name: 'Problem Definition', phase: 'Phase A: Discovery & Validation', defaultTask: 'Document exact target user pain, workflow bottleneck, and cost of inaction', hours: 3 },
  { number: 2, name: 'Market Validation', phase: 'Phase A: Discovery & Validation', defaultTask: 'Verify buyer willingness-to-pay and inspect 3 real competitor offerings', hours: 4 },
  { number: 3, name: 'Product Requirements', phase: 'Phase B: Strategy & Scoping', defaultTask: 'Define minimum viable product boundaries, non-goals, and core functional specs', hours: 4 },
  { number: 4, name: 'Product Positioning', phase: 'Phase B: Strategy & Scoping', defaultTask: 'Craft value proposition, category wedge, and differentiation messaging', hours: 3 },
  { number: 5, name: 'Feature Prioritization', phase: 'Phase B: Strategy & Scoping', defaultTask: 'Rank V1 must-have features vs V2 backlog to prevent scope creep', hours: 2 },
  { number: 6, name: 'UX Architecture', phase: 'Phase C: UX/UI & System Design', defaultTask: 'Design information architecture, navigation hierarchy, and core state model', hours: 5 },
  { number: 7, name: 'User Flows', phase: 'Phase C: UX/UI & System Design', defaultTask: 'Map onboarding, core value execution, and conversion user flows', hours: 4 },
  { number: 8, name: 'UI Design Requirements', phase: 'Phase C: UX/UI & System Design', defaultTask: 'Establish Sentinel-grounded Light/Dark visual tokens, WCAG 2.2 labels, and screen specs', hours: 6 },
  { number: 9, name: 'Technical Architecture', phase: 'Phase D: Engineering & Build', defaultTask: 'Select pragmatic stack, data schema, and API boundaries within capability limits', hours: 4 },
  { number: 10, name: 'Development Roadmap', phase: 'Phase D: Engineering & Build', defaultTask: 'Break build into small verifiable milestones with explicit acceptance criteria', hours: 2 },
  { number: 11, name: 'Implementation', phase: 'Phase D: Engineering & Build', defaultTask: 'Build core application functionality, persistence, and UI workflows', hours: 16 },
  { number: 12, name: 'Testing and Quality Assurance', phase: 'Phase E: Verification & Release', defaultTask: 'Run functional tests, edge-case validation, and mobile/desktop responsive checks', hours: 5 },
  { number: 13, name: 'Deployment', phase: 'Phase E: Verification & Release', defaultTask: 'Configure production hosting, environment variables, and backup persistence', hours: 3 },
  { number: 14, name: 'Launch Preparation', phase: 'Phase F: Launch & Post-Launch', defaultTask: 'Prepare landing copy, pricing checkout, directory assets, and request Owner Launch Approval Gate', hours: 4 },
  { number: 15, name: 'Post Launch Improvements', phase: 'Phase F: Launch & Post-Launch', defaultTask: 'Review real user feedback, conversion bottlenecks, and iterate V1.1 improvements', hours: 6 }
];

export class ExecutionEngine {
  constructor(db, approvalEngine, intelligenceEngine) {
    this.db = db;
    this.approvalEngine = approvalEngine;
    this.intelligenceEngine = intelligenceEngine;
  }

  listProducts() {
    const rows = this.db.prepare('SELECT * FROM products ORDER BY updated_at DESC').all();
    return rows.map((row) => this.hydrateProduct(row));
  }

  getProductById(id) {
    const row = this.db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!row) return null;
    return this.hydrateProduct(row);
  }

  hydrateProduct(row) {
    const tasks = this.db
      .prepare('SELECT * FROM product_tasks WHERE product_id = ? ORDER BY stage_number ASC, id ASC')
      .all(row.id);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'done').length;
    const blockedTasks = tasks.filter((t) => t.status === 'blocked').length;
    const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;

    const totalEstimatedHours = tasks.reduce((sum, t) => sum + (Number(t.estimated_hours) || 0), 0);
    const completedEstimatedHours = tasks
      .filter((t) => t.status === 'done')
      .reduce((sum, t) => sum + (Number(t.estimated_hours) || 0), 0);
    const totalActualHours = tasks.reduce((sum, t) => sum + (Number(t.actual_hours) || 0), 0);
    const remainingEstimatedHours = Math.max(0, totalEstimatedHours - completedEstimatedHours);

    const realCompletionPct =
      totalEstimatedHours > 0
        ? Number(((completedEstimatedHours / totalEstimatedHours) * 100).toFixed(1))
        : totalTasks > 0
          ? Number(((completedTasks / totalTasks) * 100).toFixed(1))
          : 0;

    // Group by phase for clear milestone reporting
    const phasesMap = new Map();
    for (const task of tasks) {
      if (!phasesMap.has(task.phase_name)) {
        phasesMap.set(task.phase_name, {
          phase_name: task.phase_name,
          total_tasks: 0,
          done_tasks: 0,
          estimated_hours: 0,
          done_hours: 0,
          tasks: []
        });
      }
      const p = phasesMap.get(task.phase_name);
      p.total_tasks += 1;
      p.estimated_hours += Number(task.estimated_hours) || 0;
      if (task.status === 'done') {
        p.done_tasks += 1;
        p.done_hours += Number(task.estimated_hours) || 0;
      }
      p.tasks.push(task);
    }

    const phases = Array.from(phasesMap.values()).map((p) => ({
      ...p,
      completion_pct: p.estimated_hours > 0 ? Number(((p.done_hours / p.estimated_hours) * 100).toFixed(1)) : 0
    }));

    return {
      ...row,
      completion_pct: realCompletionPct,
      progress_metrics: {
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        in_progress_tasks: inProgressTasks,
        blocked_tasks: blockedTasks,
        remaining_tasks: totalTasks - completedTasks,
        total_estimated_hours: totalEstimatedHours,
        completed_estimated_hours: completedEstimatedHours,
        remaining_estimated_hours: remainingEstimatedHours,
        total_actual_hours: totalActualHours,
        completion_pct: realCompletionPct
      },
      phases,
      tasks
    };
  }

  /**
   * Promotes an approved opportunity into a full 15-stage Product Execution project.
   */
  promoteOpportunityToProduct(opportunityId, customOverrides = {}) {
    const opp = this.db.prepare('SELECT * FROM opportunities WHERE id = ?').get(opportunityId);
    if (!opp) {
      throw new Error(`Opportunity ${opportunityId} not found.`);
    }

    const existing = this.db.prepare('SELECT * FROM products WHERE opportunity_id = ?').get(opportunityId);
    if (existing) {
      return this.getProductById(existing.id);
    }

    const now = new Date().toISOString();
    if (opp.status !== 'approved') {
      this.db
        .prepare("UPDATE opportunities SET status = 'approved', updated_at = ? WHERE id = ?")
        .run(now, opportunityId);
    }

    const productId = customOverrides.id || `prod-${crypto.randomUUID().slice(0, 8)}`;
    const name = customOverrides.name || opp.title;
    const tagline = customOverrides.tagline || `Targeted ${opp.category} solving: ${opp.problem_statement.slice(0, 90)}`;
    const positioning =
      customOverrides.positioning ||
      `Built for ${opp.target_audience}. Differentiated by: ${opp.differentiation_potential}`;
    const uxNotes =
      customOverrides.ux_architecture_notes ||
      'Task-focused workflow prioritizing immediate user value, transparent feedback, Light/Dark companion modes, and WCAG 2.2 accessible controls.';
    const techStack =
      customOverrides.tech_stack ||
      'Pragmatic AI-Assisted Web Stack (HTML/CSS Design Tokens, Modular JS/Node or WordPress/Figma System depending on asset delivery)';
    const monetizationTradeoffs =
      customOverrides.monetization_tradeoffs ||
      `Selected ${opp.monetization_model} to minimize time-to-first-revenue while preserving low support overhead.`;

    this.db
      .prepare(`
        INSERT INTO products (
          id, opportunity_id, name, tagline, category,
          current_stage_number, current_stage_name,
          problem_definition, positioning, ux_architecture_notes,
          tech_stack, monetization_model, monetization_tradeoffs,
          primary_acquisition_channel, status, completion_pct,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        productId,
        opportunityId,
        name,
        tagline,
        opp.category,
        1,
        PRODUCT_LIFECYCLE_STAGES[0].name,
        opp.problem_statement,
        positioning,
        uxNotes,
        techStack,
        opp.monetization_model,
        monetizationTradeoffs,
        opp.acquisition_strategy,
        'planning',
        0,
        now,
        now
      );

    // Populate all 15 lifecycle stages with concrete, verifiable milestone tasks
    const insertTask = this.db.prepare(`
      INSERT INTO product_tasks (
        id, product_id, stage_number, stage_name, phase_name, milestone_name,
        title, estimated_hours, actual_hours, status, dependencies, risks, acceptance_criteria, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?)
    `);

    for (const stage of PRODUCT_LIFECYCLE_STAGES) {
      const taskId = `task-${productId.slice(-4)}-s${String(stage.number).padStart(2, '0')}`;
      const dep = stage.number === 1 ? 'Opportunity Approval' : `Stage ${stage.number - 1}: ${PRODUCT_LIFECYCLE_STAGES[stage.number - 2].name}`;
      const risk =
        stage.number === 11
          ? 'Scope creep or over-engineering beyond core user wedge'
          : stage.number === 14
            ? 'Requires explicit Owner Launch Approval Gate before public release'
            : 'Skipping validation evidence';
      const criteria = `Verified artifact completed for ${stage.name} and reviewed against product requirements.`;

      insertTask.run(
        taskId,
        productId,
        stage.number,
        stage.name,
        stage.phase,
        `M${stage.number}: ${stage.name}`,
        stage.defaultTask,
        stage.hours,
        'todo',
        dep,
        risk,
        criteria,
        now
      );
    }

    return this.recalculateProductProgress(productId);
  }

  updateTask(taskId, { status, actual_hours, title, risks, acceptance_criteria }) {
    const task = this.db.prepare('SELECT * FROM product_tasks WHERE id = ?').get(taskId);
    if (!task) throw new Error(`Task ${taskId} not found.`);

    const now = new Date().toISOString();
    const nextStatus = status || task.status;
    const nextActual = actual_hours !== undefined ? Number(actual_hours) : task.actual_hours;

    // If marking Stage 14 (Launch Preparation) as done, automatically trigger Owner Launch Approval Gate if not already requested
    if (task.stage_number === 14 && nextStatus === 'done' && this.approvalEngine) {
      const existingGate = this.db
        .prepare("SELECT * FROM approval_requests WHERE entity_type = 'product' AND entity_id = ? AND action_category = 'launch_product'")
        .get(task.product_id);

      if (!existingGate) {
        const prod = this.db.prepare('SELECT * FROM products WHERE id = ?').get(task.product_id);
        this.approvalEngine.createRequest({
          entity_type: 'product',
          entity_id: task.product_id,
          action_category: 'launch_product',
          title: `Public Product Launch Authorization: ${prod.name}`,
          description: `Stage 14 (Launch Preparation) completed. Explicit owner approval is required before publishing ${prod.name} publicly or opening live checkout.`,
          financial_commitment_usd: 0,
          is_public_action: true
        });
      }
    }

    this.db
      .prepare(`
        UPDATE product_tasks
        SET status = ?,
            actual_hours = ?,
            title = ?,
            risks = ?,
            acceptance_criteria = ?,
            updated_at = ?
        WHERE id = ?
      `)
      .run(
        nextStatus,
        nextActual,
        title ? title.trim() : task.title,
        risks ? risks.trim() : task.risks,
        acceptance_criteria ? acceptance_criteria.trim() : task.acceptance_criteria,
        now,
        taskId
      );

    return this.recalculateProductProgress(task.product_id);
  }

  addTask(productId, { stage_number = 11, title, estimated_hours = 3, dependencies = 'None', risks = 'None', acceptance_criteria }) {
    const stageObj = PRODUCT_LIFECYCLE_STAGES.find((s) => s.number === Number(stage_number)) || PRODUCT_LIFECYCLE_STAGES[10];
    const id = `task-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    this.db
      .prepare(`
        INSERT INTO product_tasks (
          id, product_id, stage_number, stage_name, phase_name, milestone_name,
          title, estimated_hours, actual_hours, status, dependencies, risks, acceptance_criteria, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 'todo', ?, ?, ?, ?)
      `)
      .run(
        id,
        productId,
        stageObj.number,
        stageObj.name,
        stageObj.phase,
        `M${stageObj.number}: ${stageObj.name}`,
        title.trim(),
        Number(estimated_hours) || 2,
        dependencies,
        risks,
        acceptance_criteria || `Complete and verify: ${title.trim()}`,
        now
      );

    return this.recalculateProductProgress(productId);
  }

  recalculateProductProgress(productId) {
    const hydrated = this.getProductById(productId);
    if (!hydrated) return null;

    // Determine current active stage (first stage with incomplete tasks, or 15 if all done)
    const firstIncomplete = hydrated.tasks.find((t) => t.status !== 'done');
    const currentStageNumber = firstIncomplete ? firstIncomplete.stage_number : 15;
    const stageObj = PRODUCT_LIFECYCLE_STAGES.find((s) => s.number === currentStageNumber) || PRODUCT_LIFECYCLE_STAGES[0];

    let nextProductStatus = hydrated.status;
    if (hydrated.status !== 'launched') {
      if (hydrated.completion_pct === 0) {
        nextProductStatus = 'planning';
      } else if (currentStageNumber >= 14) {
        nextProductStatus = 'launch_gated';
      } else if (currentStageNumber >= 12) {
        nextProductStatus = 'testing';
      } else {
        nextProductStatus = 'in_development';
      }
    }

    const now = new Date().toISOString();
    this.db
      .prepare(`
        UPDATE products
        SET current_stage_number = ?,
            current_stage_name = ?,
            completion_pct = ?,
            status = ?,
            updated_at = ?
        WHERE id = ?
      `)
      .run(
        stageObj.number,
        stageObj.name,
        hydrated.completion_pct,
        nextProductStatus,
        now,
        productId
      );

    return this.getProductById(productId);
  }
}
