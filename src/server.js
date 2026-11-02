import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStrawContext } from './context.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml'
};

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer'
  });
  res.end(body);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) {
        reject(new Error('Request payload too large'));
      }
    });
    req.on('end', () => {
      if (!data.trim()) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch {
        reject(new Error('Invalid JSON payload'));
      }
    });
    req.on('error', reject);
  });
}

export function createAppServer(customContext) {
  const ctx = customContext || createStrawContext();

  const server = http.createServer(async (req, res) => {
    try {
      const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      const pathname = urlObj.pathname;
      const method = req.method || 'GET';

      // --- API ROUTES ---
      if (pathname === '/api/health' && method === 'GET') {
        return sendJson(res, 200, {
          status: 'ok',
          service: 'straw-business-os',
          ai_orchestrator: ctx.aiOrchestrator.getProviderStatus(),
          timestamp: new Date().toISOString()
        });
      }

      if (pathname === '/api/dashboard' && method === 'GET') {
        return sendJson(res, 200, ctx.getDashboardOverview());
      }

      if (pathname === '/api/capabilities' && method === 'GET') {
        return sendJson(res, 200, ctx.capabilityEngine.getOwnerProfile());
      }

      if (pathname === '/api/capabilities' && method === 'POST') {
        const body = await readJsonBody(req);
        if (!body.name || !body.category) {
          return sendJson(res, 400, { error: 'Capability name and category are required.' });
        }
        const cap = ctx.capabilityEngine.upsertCapability({
          name: body.name,
          category: body.category,
          proficiency_level: body.proficiency_level ?? 3,
          execution_leverage: body.execution_leverage || 'AI-Augmented Execution',
          notes: body.notes || ''
        });
        return sendJson(res, 201, { capability: cap });
      }

      if (pathname === '/api/opportunities' && method === 'GET') {
        const category = urlObj.searchParams.get('category') || undefined;
        const status = urlObj.searchParams.get('status') || undefined;
        return sendJson(res, 200, {
          opportunities: ctx.opportunityEngine.listOpportunities({ category, status })
        });
      }

      if (pathname === '/api/opportunities' && method === 'POST') {
        const body = await readJsonBody(req);
        if (!body.title || !body.category || !body.problem_statement) {
          return sendJson(res, 400, {
            error: 'title, category, and problem_statement are required to evaluate an opportunity.'
          });
        }
        const created = ctx.opportunityEngine.createOpportunity({
          title: body.title,
          category: body.category,
          problem_statement: body.problem_statement,
          target_audience: body.target_audience || 'Unspecified target segment',
          demand_summary: body.demand_summary || 'Pending verification',
          competitors_summary: body.competitors_summary || 'Pending competitive scan',
          alternatives_summary: body.alternatives_summary || 'Manual workflows / spreadsheets',
          market_gaps: body.market_gaps || 'UX and workflow specialization gap',
          differentiation_potential: body.differentiation_potential || 'Senior UX/IA execution',
          dev_complexity: body.dev_complexity || 'manageable',
          estimated_dev_days: body.estimated_dev_days ?? 14,
          operational_cost_monthly_usd: body.operational_cost_monthly_usd ?? 0,
          monetization_model: body.monetization_model || 'One-Time Purchase / License',
          acquisition_strategy: body.acquisition_strategy || 'Organic search & ecosystem directories',
          revenue_potential_notes: body.revenue_potential_notes || 'Unverified estimate',
          main_risks: body.main_risks || 'Unverified buyer conversion rate',
          required_capabilities: body.required_capabilities || ['Senior UX and UI Design', 'AI Assisted Development'],
          new_skills_needed: body.new_skills_needed || [],
          dimension_inputs: body.dimension_inputs || {},
          evidence: body.evidence || []
        });
        return sendJson(res, 201, created);
      }

      // Single opportunity operations: /api/opportunities/:id
      const oppMatch = pathname.match(/^\/api\/opportunities\/([^/]+)$/);
      if (oppMatch) {
        const oppId = decodeURIComponent(oppMatch[1]);
        if (method === 'GET') {
          const opp = ctx.opportunityEngine.getOpportunityById(oppId);
          if (!opp) return sendJson(res, 404, { error: 'Opportunity not found' });
          return sendJson(res, 200, { opportunity: opp });
        }
        if (method === 'PATCH') {
          const body = await readJsonBody(req);
          const updated = ctx.opportunityEngine.updateOpportunityStatus(oppId, body);
          return sendJson(res, 200, { opportunity: updated });
        }
      }

      // Add evidence to opportunity: /api/opportunities/:id/evidence
      const evMatch = pathname.match(/^\/api\/opportunities\/([^/]+)\/evidence$/);
      if (evMatch && method === 'POST') {
        const oppId = decodeURIComponent(evMatch[1]);
        const body = await readJsonBody(req);
        if (!body.statement || (!body.source_citation && !body.source_url)) {
          return sendJson(res, 400, {
            error: 'statement and source_url (or source_citation) are required for market evidence.'
          });
        }
        try {
          const evidence = ctx.opportunityEngine.addEvidence(oppId, {
            claim_type: body.claim_type || 'demand',
            statement: body.statement,
            evidence_tier: body.evidence_tier || 'assumption',
            source_citation: body.source_citation || body.source_url,
            source_url: body.source_url || '',
            source_name: body.source_name || '',
            supporting_excerpt: body.supporting_excerpt || '',
            published_at: body.published_at || null,
            research_methodology: body.research_methodology || 'manual_entry',
            stance: body.stance || 'supporting'
          });
          const opportunity = ctx.opportunityEngine.getOpportunityById(oppId);
          return sendJson(res, 201, { evidence, opportunity });
        } catch (err) {
          if (err.message && err.message.includes('Duplicate research finding')) {
            return sendJson(res, 409, { error: err.message });
          }
          throw err;
        }
      }

      // Generate & save 10-step research dossier: /api/opportunities/:id/dossier
      const dossierMatch = pathname.match(/^\/api\/opportunities\/([^/]+)\/dossier$/);
      if (dossierMatch && method === 'POST') {
        const oppId = decodeURIComponent(dossierMatch[1]);
        const dossier = ctx.researchEngine.generateAndSaveResearchDossier(oppId);
        return sendJson(res, 201, { dossier });
      }

      // Phase 7 Research Engine endpoints
      if (pathname === '/api/research/sources' && method === 'GET') {
        return sendJson(res, 200, { sources: ctx.researchEngine.listSources() });
      }

      if (pathname === '/api/research/runs' && method === 'GET') {
        const opportunityId = urlObj.searchParams.get('opportunity_id') || undefined;
        return sendJson(res, 200, { runs: ctx.researchEngine.listResearchRuns({ opportunityId }) });
      }

      if (pathname === '/api/research/runs' && method === 'POST') {
        const body = await readJsonBody(req);
        if (!body.query_topic) {
          return sendJson(res, 400, { error: 'query_topic is required to run market discovery.' });
        }
        const run = await ctx.researchEngine.executeDiscoveryRun({
          query_topic: body.query_topic,
          target_category: body.target_category || 'Browser Based Utilities',
          opportunity_id: body.opportunity_id || null,
          source_ids: body.source_ids || ['src-hn-algolia', 'src-wp-plugin-api'],
          ingested_findings: body.ingested_findings || [],
          fetch_live_public: Boolean(body.fetch_live_public),
          allow_paid_apis: Boolean(body.allow_paid_apis)
        });
        return sendJson(res, 201, { run });
      }

      if (pathname === '/api/research/evidence' && method === 'GET') {
        const opportunityId = urlObj.searchParams.get('opportunity_id') || undefined;
        const verificationStatus = urlObj.searchParams.get('verification_status') || undefined;
        const evidenceTier = urlObj.searchParams.get('evidence_tier') || undefined;
        return sendJson(res, 200, {
          evidence: ctx.researchEngine.listAllEvidence({ opportunityId, verificationStatus, evidenceTier })
        });
      }

      const reviewEvMatch = pathname.match(/^\/api\/research\/evidence\/([^/]+)$/);
      if (reviewEvMatch && method === 'PATCH') {
        const evId = decodeURIComponent(reviewEvMatch[1]);
        const body = await readJsonBody(req);
        try {
          const updated = ctx.researchEngine.reviewEvidenceRecord(evId, body);
          return sendJson(res, 200, { evidence: updated });
        } catch (err) {
          return sendJson(res, 400, { error: err.message });
        }
      }

      // Add competitor to opportunity: /api/opportunities/:id/competitors
      const compMatch = pathname.match(/^\/api\/opportunities\/([^/]+)\/competitors$/);
      if (compMatch && method === 'POST') {
        const oppId = decodeURIComponent(compMatch[1]);
        const body = await readJsonBody(req);
        if (!body.competitor_name) {
          return sendJson(res, 400, { error: 'competitor_name is required.' });
        }
        const competitor = ctx.opportunityEngine.addCompetitor(oppId, body);
        const opportunity = ctx.opportunityEngine.getOpportunityById(oppId);
        return sendJson(res, 201, { competitor, opportunity });
      }

      // Simulate score sensitivity: /api/opportunities/:id/simulate
      const simMatch = pathname.match(/^\/api\/opportunities\/([^/]+)\/simulate$/);
      if (simMatch && method === 'POST') {
        const oppId = decodeURIComponent(simMatch[1]);
        const body = await readJsonBody(req);
        const simulation = ctx.opportunityEngine.simulateOpportunityScore(oppId, body);
        return sendJson(res, 200, { simulation });
      }

      // Export opportunity dossier: /api/opportunities/:id/export
      const expMatch = pathname.match(/^\/api\/opportunities\/([^/]+)\/export$/);
      if (expMatch && method === 'GET') {
        const oppId = decodeURIComponent(expMatch[1]);
        const format = urlObj.searchParams.get('format') || 'markdown';
        const opp = ctx.opportunityEngine.getOpportunityById(oppId);
        if (!opp) return sendJson(res, 404, { error: 'Opportunity not found' });

        if (format === 'json') {
          return sendJson(res, 200, { dossier: opp });
        }
        const md = ctx.opportunityEngine.exportOpportunityDossierMarkdown(oppId);
        res.writeHead(200, {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Content-Disposition': `attachment; filename="${opp.slug}-dossier.md"`,
          'X-Content-Type-Options': 'nosniff'
        });
        return res.end(md);
      }

      // Promote opportunity to active product: /api/opportunities/:id/promote
      const promoteMatch = pathname.match(/^\/api\/opportunities\/([^/]+)\/promote$/);
      if (promoteMatch && method === 'POST') {
        const oppId = decodeURIComponent(promoteMatch[1]);
        const body = await readJsonBody(req);
        const product = ctx.executionEngine.promoteOpportunityToProduct(oppId, body);
        return sendJson(res, 201, { product });
      }

      // Products routes
      if (pathname === '/api/products' && method === 'GET') {
        return sendJson(res, 200, { products: ctx.executionEngine.listProducts() });
      }

      const prodMatch = pathname.match(/^\/api\/products\/([^/]+)$/);
      if (prodMatch && method === 'GET') {
        const prodId = decodeURIComponent(prodMatch[1]);
        const product = ctx.executionEngine.getProductById(prodId);
        if (!product) return sendJson(res, 404, { error: 'Product not found' });
        return sendJson(res, 200, { product });
      }

      const addTaskMatch = pathname.match(/^\/api\/products\/([^/]+)\/tasks$/);
      if (addTaskMatch && method === 'POST') {
        const prodId = decodeURIComponent(addTaskMatch[1]);
        const body = await readJsonBody(req);
        if (!body.title) return sendJson(res, 400, { error: 'Task title is required.' });
        const product = ctx.executionEngine.addTask(prodId, body);
        return sendJson(res, 201, { product });
      }

      const updateTaskMatch = pathname.match(/^\/api\/tasks\/([^/]+)$/);
      if (updateTaskMatch && method === 'PATCH') {
        const taskId = decodeURIComponent(updateTaskMatch[1]);
        const body = await readJsonBody(req);
        const product = ctx.executionEngine.updateTask(taskId, body);
        return sendJson(res, 200, { product });
      }

      const growthMatch = pathname.match(/^\/api\/products\/([^/]+)\/growth$/);
      if (growthMatch) {
        const prodId = decodeURIComponent(growthMatch[1]);
        if (method === 'GET') {
          return sendJson(res, 200, ctx.growthEngine.getProductGrowthWorkspace(prodId));
        }
        if (method === 'POST') {
          const body = await readJsonBody(req);
          if (body.record_type === 'metric') {
            if (!body.period_label) return sendJson(res, 400, { error: 'period_label is required.' });
            const metric = ctx.growthEngine.recordPerformanceMetric(prodId, body);
            return sendJson(res, 201, { metric, workspace: ctx.growthEngine.getProductGrowthWorkspace(prodId) });
          } else {
            if (!body.channel_name || !body.channel_category) {
              return sendJson(res, 400, { error: 'channel_name and channel_category are required.' });
            }
            const channel = ctx.growthEngine.addGrowthChannel(prodId, {
              channel_name: body.channel_name,
              channel_category: body.channel_category,
              fit_score: body.fit_score ?? 8,
              estimated_monthly_cost_usd: body.estimated_monthly_cost_usd ?? 0,
              expected_return_rationale: body.expected_return_rationale || 'Targeted acquisition channel',
              execution_playbook: body.execution_playbook || 'Execute organic distribution workflow'
            });
            return sendJson(res, 201, { channel, workspace: ctx.growthEngine.getProductGrowthWorkspace(prodId) });
          }
        }
      }

      const clusterMatch = pathname.match(/^\/api\/products\/([^/]+)\/clusters$/);
      if (clusterMatch && method === 'POST') {
        const prodId = decodeURIComponent(clusterMatch[1]);
        const body = await readJsonBody(req);
        if (!body.topic_cluster || !body.target_query_pattern || !body.conversion_asset) {
          return sendJson(res, 400, {
            error: 'topic_cluster, target_query_pattern, and conversion_asset are required.'
          });
        }
        const cluster = ctx.growthEngine.addSearchIntentCluster(prodId, body);
        return sendJson(res, 201, {
          cluster,
          workspace: ctx.growthEngine.getProductGrowthWorkspace(prodId)
        });
      }

      // Approval gates
      if (pathname === '/api/approvals' && method === 'GET') {
        const status = urlObj.searchParams.get('status') || undefined;
        return sendJson(res, 200, { approvals: ctx.approvalEngine.listRequests({ status }) });
      }

      if (pathname === '/api/approvals' && method === 'POST') {
        const body = await readJsonBody(req);
        if (!body.title || !body.action_category) {
          return sendJson(res, 400, { error: 'title and action_category are required.' });
        }
        const request = ctx.approvalEngine.createRequest({
          entity_type: body.entity_type || 'system',
          entity_id: body.entity_id || 'manual',
          action_category: body.action_category,
          title: body.title,
          description: body.description || '',
          financial_commitment_usd: body.financial_commitment_usd ?? 0,
          is_public_action: body.is_public_action ?? true
        });
        return sendJson(res, 201, { approval: request });
      }

      const decideApprovalMatch = pathname.match(/^\/api\/approvals\/([^/]+)$/);
      if (decideApprovalMatch && method === 'PATCH') {
        const apprId = decodeURIComponent(decideApprovalMatch[1]);
        const body = await readJsonBody(req);
        const decided = ctx.approvalEngine.decideRequest(apprId, {
          decision: body.decision,
          owner_decision_notes: body.owner_decision_notes || ''
        });
        return sendJson(res, 200, { approval: decided });
      }

      // Personal Business Intelligence Memory
      if (pathname === '/api/intelligence/recommendations' && method === 'GET') {
        const overview = ctx.getDashboardOverview();
        return sendJson(res, 200, { proactive_intelligence: overview.proactive_intelligence });
      }

      if (pathname === '/api/intelligence' && method === 'GET') {
        const entryType = urlObj.searchParams.get('entry_type') || undefined;
        return sendJson(res, 200, { entries: ctx.intelligenceEngine.listEntries({ entryType }) });
      }

      if (pathname === '/api/intelligence' && method === 'POST') {
        const body = await readJsonBody(req);
        if (!body.title || !body.summary || !body.entry_type) {
          return sendJson(res, 400, { error: 'entry_type, title, and summary are required.' });
        }
        const entry = ctx.intelligenceEngine.recordEntry({
          entry_type: body.entry_type,
          related_opportunity_id: body.related_opportunity_id || null,
          related_product_id: body.related_product_id || null,
          title: body.title,
          summary: body.summary,
          evidence_tier: body.evidence_tier || 'practitioner_observation',
          future_implication: body.future_implication || 'Apply to future venture selection.'
        });
        return sendJson(res, 201, { entry });
      }

      // AI Strategic Concept Critique
      if (pathname === '/api/ai/evaluate' && method === 'POST') {
        const body = await readJsonBody(req);
        const evaluation = ctx.aiOrchestrator.evaluateConceptBrief(body);
        return sendJson(res, 200, { evaluation });
      }

      // --- STATIC WORKSPACE FILES ---
      let filePath = pathname === '/' ? path.join(PUBLIC_DIR, 'index.html') : path.join(PUBLIC_DIR, pathname);
      if (!filePath.startsWith(PUBLIC_DIR)) {
        res.writeHead(403);
        return res.end('Forbidden');
      }

      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath);
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-cache' });
        fs.createReadStream(filePath).pipe(res);
        return;
      }

      sendJson(res, 404, { error: `Route ${method} ${pathname} not found.` });
    } catch (err) {
      sendJson(res, 500, { error: err.message || 'Internal server error' });
    }
  });

  return { server, ctx };
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const port = Number(process.env.PORT) || 4310;
  const host = process.env.HOST || '127.0.0.1';
  const { server } = createAppServer();
  server.listen(port, host, () => {
    console.log(`STRAW Business Operating System listening on http://${host}:${port}`);
  });
}
