const state = {
  dashboard: null,
  selectedOpportunityId: null,
  selectedProductId: null,
  filterStatus: '',
  filterCategory: '',
  theme: localStorage.getItem('straw_theme') || 'light'
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showFeedback(message) {
  const banner = document.getElementById('global-feedback');
  if (!banner) return;
  banner.textContent = message;
  banner.classList.remove('hidden');
  setTimeout(() => {
    banner.classList.add('hidden');
  }, 5500);
}

function renderRecommendationBadge(rec) {
  if (rec === 'APPROVE_FOR_VALIDATION') {
    return `<span class="badge badge-verified">[APPROVE FOR VALIDATION]</span>`;
  }
  if (rec === 'NEEDS_EVIDENCE') {
    return `<span class="badge badge-warn">[NEEDS VERIFIED EVIDENCE]</span>`;
  }
  if (rec === 'HOLD_CONFLICTING_EVIDENCE') {
    return `<span class="badge badge-danger">[HOLD: CONFLICTING EVIDENCE]</span>`;
  }
  if (rec === 'REJECT_WEAK_IDEA') {
    return `<span class="badge badge-danger">[REJECT WEAK IDEA]</span>`;
  }
  return `<span class="badge badge-info">[${escapeHtml(rec)}]</span>`;
}

function renderEvidenceTierBadge(tier) {
  if (tier === 'verified_evidence') {
    return `<span class="badge badge-verified">[VERIFIED EVIDENCE]</span>`;
  }
  if (tier === 'practitioner_observation') {
    return `<span class="badge badge-info">[PRACTITIONER OBSERVATION]</span>`;
  }
  if (tier === 'estimate') {
    return `<span class="badge badge-warn">[ESTIMATE]</span>`;
  }
  return `<span class="badge badge-danger">[ASSUMPTION]</span>`;
}

function renderEvidenceCategoryBadge(category) {
  if (category === 'verified_commercial_commitment' || category === 'willingness_to_pay') {
    return `<span class="badge badge-verified">[5. VERIFIED COMMERCIAL COMMITMENT]</span>`;
  }
  if (category === 'unverified_willingness_to_pay') {
    return `<span class="badge badge-warn">[4. UNVERIFIED BUYER WTP]</span>`;
  }
  if (category === 'competitor_activity') {
    return `<span class="badge badge-warn">[3. COMPETITOR ACTIVITY]</span>`;
  }
  if (category === 'market_demand') {
    return `<span class="badge badge-info">[2. MARKET DEMAND]</span>`;
  }
  return `<span class="badge badge-info">[1. PROBLEM EXISTENCE]</span>`;
}

function applyTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('straw_theme', theme);
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) {
    btn.textContent =
      theme === 'light'
        ? 'Appearance: Light Drafting (Switch to Dark)'
        : 'Appearance: Dark Slate (Switch to Light)';
  }
}

function switchTab(tabName) {
  document.querySelectorAll('.nav-tab').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  document.querySelectorAll('.workspace-panel').forEach((panel) => {
    panel.classList.toggle('active', panel.id === `tab-${tabName}`);
  });
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return data;
}

async function loadDashboard() {
  const data = await fetchJson('/api/dashboard');
  state.dashboard = data;

  if (!state.selectedOpportunityId && data.opportunities.length > 0) {
    state.selectedOpportunityId = data.opportunities[0].id;
  }
  if (!state.selectedProductId && data.products.length > 0) {
    state.selectedProductId = data.products[0].id;
  }

  populateCategorySelects(data.catalogs.opportunity_categories);
  renderHeaderStatus(data);
  renderOverviewWorkspace(data);
  renderOpportunitiesWorkspace(data);
  renderResearchWorkspace(data);
  await renderExecutionWorkspace(data);
  await renderGrowthWorkspace(data);
  renderApprovalsWorkspace(data);
  renderCapabilitiesWorkspace(data);
}

function populateCategorySelects(categories) {
  const filterSelect = document.getElementById('filter-opp-category');
  const formSelect = document.getElementById('opp-category');

  if (filterSelect && filterSelect.options.length <= 1) {
    for (const cat of categories) {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      filterSelect.appendChild(opt);
    }
  }

  if (formSelect && formSelect.options.length === 0) {
    for (const cat of categories) {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      formSelect.appendChild(opt);
    }
  }
}

function renderHeaderStatus(data) {
  const pillApprovals = document.getElementById('pill-approvals');
  if (pillApprovals) {
    pillApprovals.textContent = `Pending Approval Gates: ${data.summary_counts.pending_approvals}`;
  }
}

function renderOverviewWorkspace(data) {
  const kpiStrip = document.getElementById('overview-kpi-strip');
  const c = data.summary_counts;

  if (kpiStrip) {
    kpiStrip.innerHTML = `
      <div class="kpi-cell">
        <div class="kpi-label">Evaluated Opportunities</div>
        <div class="kpi-value">${c.total_opportunities}</div>
        <div class="kpi-sub">${c.approved_opportunities} Approved · ${c.evaluating_opportunities} Evaluating · ${c.rejected_opportunities} Rejected</div>
      </div>
      <div class="kpi-cell">
        <div class="kpi-label">Planned MVP Products</div>
        <div class="kpi-value">${c.active_products}</div>
        <div class="kpi-sub">Scoped MVP blueprints &amp; 15-stage roadmaps</div>
      </div>
      <div class="kpi-cell">
        <div class="kpi-label">Pending Owner Gates</div>
        <div class="kpi-value">${c.pending_approvals}</div>
        <div class="kpi-sub">Hard financial &amp; public launch locks</div>
      </div>
      <div class="kpi-cell">
        <div class="kpi-label">Owner Capability Areas</div>
        <div class="kpi-value">${c.total_capabilities}</div>
        <div class="kpi-sub">UX/UI, Figma Systems, IA, WP, AI Dev</div>
      </div>
      <div class="kpi-cell">
        <div class="kpi-label">Institutional Memory</div>
        <div class="kpi-value">${c.intelligence_records}</div>
        <div class="kpi-sub">Decisions, rejections &amp; market findings</div>
      </div>
    `;
  }

  const oppTable = document.getElementById('overview-opportunities-table');
  if (oppTable) {
    oppTable.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Opportunity &amp; Category</th>
            <th>Priority Index</th>
            <th>Commercial Readiness</th>
            <th>Technical Feasibility</th>
            <th>Decision &amp; 4-Way Verified Evidence</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${data.opportunities
            .map((opp) => {
              const eq = opp.evidence_quality_summary || {};
              return `
            <tr>
              <td>
                <strong>${escapeHtml(opp.title)}</strong>
                <div class="dossier-item-meta">${escapeHtml(opp.category)} · Status: <code>${escapeHtml(opp.status.toUpperCase())}</code></div>
              </td>
              <td>
                <strong>${opp.overall_score}/100</strong>
                <div class="dossier-item-meta">Heuristic Index</div>
              </td>
              <td>
                <strong>${opp.commercial_readiness_score ?? 'N/A'}/100</strong>
                <div class="dossier-item-meta"><code>${escapeHtml(opp.commercial_validation_status || 'UNVERIFIED')}</code></div>
              </td>
              <td>
                <strong>${opp.technical_feasibility_score ?? 'N/A'}/100</strong>
                <div class="dossier-item-meta">Cap Fit: ${opp.capability_fit_detail.fit_score}/10</div>
              </td>
              <td>
                ${renderRecommendationBadge(opp.recommendation)}
                <div class="dossier-item-meta" style="margin-top:3px;">
                  Prob: <strong>${eq.verified_problem_count || 0}</strong> ·
                  Dem: <strong>${eq.verified_demand_count || 0}</strong> ·
                  Comp: <strong>${eq.verified_competitor_count || 0}</strong> ·
                  WTP: <strong>${eq.verified_willingness_to_pay_count || 0}</strong>
                </div>
              </td>
              <td>
                <button type="button" class="btn btn-small" data-inspect-opp="${escapeHtml(opp.id)}">Inspect Dossier</button>
              </td>
            </tr>
          `;
            })
            .join('')}
        </tbody>
      </table>
    `;
  }

  const prodList = document.getElementById('overview-products-list');
  if (prodList) {
    prodList.innerHTML = data.products
      .map(
        (prod) => `
        <div class="dossier-item" style="margin-bottom: 10px;">
          <div class="dossier-item-top">
            <span class="dossier-item-title">${escapeHtml(prod.name)}</span>
            <span class="badge badge-info">[STAGE ${prod.current_stage_number}/15: ${escapeHtml(prod.current_stage_name.toUpperCase())}]</span>
          </div>
          <div class="dossier-item-meta" style="margin-bottom: 6px;">
            Real Completion: <strong>${prod.completion_pct}%</strong> (${prod.progress_metrics.completed_tasks}/${prod.progress_metrics.total_tasks} tasks · ${prod.progress_metrics.completed_estimated_hours}/${prod.progress_metrics.total_estimated_hours} hrs)
          </div>
          <div class="score-meter"><div class="score-meter-fill" style="width: ${prod.completion_pct}%"></div></div>
        </div>
      `
      )
      .join('');
  }

  const apprList = document.getElementById('overview-approvals-list');
  if (apprList) {
    if (data.pending_approvals.length === 0) {
      apprList.innerHTML = `<p class="dossier-item-meta">All financial and public checkpoints are currently clear.</p>`;
    } else {
      apprList.innerHTML = data.pending_approvals
        .map(
          (req) => `
          <div class="criteria-cell" style="margin-bottom: 8px;">
            <strong>[GATE: PENDING OWNER APPROVAL] · ${escapeHtml(req.action_category.toUpperCase())} ($${req.financial_commitment_usd})</strong>
            <div><strong>${escapeHtml(req.title)}</strong></div>
            <div class="dossier-item-meta">${escapeHtml(req.description)}</div>
            <div style="margin-top: 6px;">
              <button type="button" class="btn btn-small btn-approve" data-decide-appr="${escapeHtml(req.id)}" data-decision="approved">Approve Commitment</button>
              <button type="button" class="btn btn-small btn-reject" data-decide-appr="${escapeHtml(req.id)}" data-decision="rejected">Reject Commitment</button>
            </div>
          </div>
        `
        )
        .join('');
    }
  }
}

function renderOpportunitiesWorkspace(data) {
  const listContainer = document.getElementById('opportunity-cards-list');
  const filtered = data.opportunities.filter((o) => {
    if (state.filterStatus && o.status !== state.filterStatus) return false;
    if (state.filterCategory && o.category !== state.filterCategory) return false;
    return true;
  });

  listContainer.innerHTML = filtered
    .map(
      (opp) => `
      <div class="dossier-item ${opp.id === state.selectedOpportunityId ? 'selected' : ''}" data-select-opp="${escapeHtml(opp.id)}">
        <div class="dossier-item-top">
          <span class="dossier-item-title">${escapeHtml(opp.title)}</span>
          <strong>Index: ${opp.overall_score}/100</strong>
        </div>
        <div class="dossier-item-meta">
          ${escapeHtml(opp.category)} · Comm: <strong>${opp.commercial_readiness_score}/100</strong> · Tech: <strong>${opp.technical_feasibility_score}/100</strong>
        </div>
        <div style="margin-top: 6px; display: flex; justify-content: space-between; align-items: center;">
          ${renderRecommendationBadge(opp.recommendation)}
          <span class="mono">WTP: ${opp.evidence_quality_summary?.verified_willingness_to_pay_count || 0}</span>
        </div>
      </div>
    `
    )
    .join('');

  const selected =
    data.opportunities.find((o) => o.id === state.selectedOpportunityId) ||
    filtered[0] ||
    data.opportunities[0];

  const detailPane = document.getElementById('opportunity-detail-pane');
  if (!selected) {
    detailPane.innerHTML = `<p>No opportunity selected.</p>`;
    return;
  }

  const sb = selected.score_breakdown;
  const eq = selected.evidence_quality_summary || {};
  const warningsHtml = [
    ...(sb.blockers || []).map((b) => `<div class="badge badge-danger" style="display:block; margin-bottom:6px; white-space:normal;">[BLOCKER] ${escapeHtml(b)}</div>`),
    ...(sb.warnings || []).map((w) => `<div class="badge badge-warn" style="display:block; margin-bottom:6px; white-space:normal;">[COMMERCIAL / EVIDENCE WARNING] ${escapeHtml(w)}</div>`)
  ].join('');

  detailPane.innerHTML = `
    <div class="box-header">
      <div>
        <span class="mono">${escapeHtml(selected.category)} · ID: ${escapeHtml(selected.id)}</span>
        <h3 style="font-size: 17px; margin-top: 2px;">${escapeHtml(selected.title)}</h3>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 20px; font-weight: 700;">Priority Index: ${selected.overall_score} / 100</div>
        <div class="dossier-item-meta" style="margin-bottom: 4px;">
          Commercial Readiness: <strong>${selected.commercial_readiness_score}/100</strong> ·
          Technical Feasibility: <strong>${selected.technical_feasibility_score}/100</strong>
        </div>
        ${renderRecommendationBadge(selected.recommendation)}
      </div>
    </div>

    <div class="criteria-cell" style="margin-bottom: 12px;">
      <strong>Score Interpretation &amp; Commercial Readiness Rationale</strong>
      <div class="dossier-item-meta" style="margin-bottom: 4px;">
        <em>Disclaimer: ${escapeHtml(selected.score_disclaimer)}</em>
      </div>
      <div>${escapeHtml(selected.decision_rationale)}</div>
      <div style="margin-top: 6px;">${warningsHtml}</div>
    </div>

    <div class="criteria-grid" style="margin-bottom: 14px;">
      <div class="criteria-cell">
        <strong>1. Problem Existence</strong>
        <div><strong>${eq.verified_problem_count || 0}</strong> active verified source(s)</div>
        <div class="dossier-item-meta">Confirms regulatory or operational pain exists</div>
      </div>
      <div class="criteria-cell">
        <strong>2. Market Demand</strong>
        <div><strong>${eq.verified_demand_count || 0}</strong> active verified source(s)</div>
        <div class="dossier-item-meta">Confirms target users actively request a solution</div>
      </div>
      <div class="criteria-cell">
        <strong>3. Competitor Activity</strong>
        <div><strong>${eq.verified_competitor_count || 0}</strong> active verified source(s)</div>
        <div class="dossier-item-meta">Confirms free or commercial alternatives exist</div>
      </div>
      <div class="criteria-cell">
        <strong>4. Willingness to Pay</strong>
        <div><strong>${eq.verified_willingness_to_pay_count || 0}</strong> active verified source(s)</div>
        <div class="dossier-item-meta">Status: <code>${escapeHtml(selected.commercial_validation_status)}</code></div>
      </div>
    </div>

    <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px;">
      <button type="button" class="btn btn-small btn-primary" data-promote-opp="${escapeHtml(selected.id)}">Select &amp; Plan MVP Blueprint</button>
      <button type="button" class="btn btn-small btn-approve" data-opp-status="${escapeHtml(selected.id)}" data-status="approved">Mark Approved</button>
      <button type="button" class="btn btn-small btn-secondary" data-opp-status="${escapeHtml(selected.id)}" data-status="evaluating">Hold / Evaluating</button>
      <button type="button" class="btn btn-small btn-reject" data-opp-status="${escapeHtml(selected.id)}" data-status="rejected">Reject Weak Idea</button>
      <a class="btn btn-small btn-secondary" href="/api/opportunities/${encodeURIComponent(selected.id)}/export?format=markdown" target="_blank" rel="noopener">Export Markdown Dossier</a>
    </div>

    <h4 class="sub-box-title">15-Criteria Opportunity Dossier (Verified Facts vs. Commercial Assumptions Explicitly Labeled)</h4>
    <div class="criteria-grid">
      <div class="criteria-cell"><strong>1. Problem Addressed [FACT/OBSERVATION]</strong>${escapeHtml(selected.problem_statement)}</div>
      <div class="criteria-cell"><strong>2. Target Audience [CUSTOMER ASSUMPTION]</strong>${escapeHtml(selected.target_audience)}</div>
      <div class="criteria-cell"><strong>3. Evidence of Demand [EVIDENCE-BOUND]</strong>${escapeHtml(selected.demand_summary)}</div>
      <div class="criteria-cell"><strong>4. Existing Competitors [MARKET FACT]</strong>${escapeHtml(selected.competitors_summary)}</div>
      <div class="criteria-cell"><strong>5. Current Alternatives [WORKFLOW FACT]</strong>${escapeHtml(selected.alternatives_summary)}</div>
      <div class="criteria-cell"><strong>6. Market Gaps [ANALYSIS]</strong>${escapeHtml(selected.market_gaps)}</div>
      <div class="criteria-cell"><strong>7. Differentiation Potential [STRATEGY]</strong>${escapeHtml(selected.differentiation_potential)}</div>
      <div class="criteria-cell"><strong>8–10. Complexity, Time &amp; Op Cost [ESTIMATE]</strong>Complexity: <code>${escapeHtml(selected.dev_complexity)}</code> · Est: <strong>${selected.estimated_dev_days} days</strong> · Op Cost: <strong>$${selected.operational_cost_monthly_usd}/mo</strong></div>
      <div class="criteria-cell"><strong>11. Monetization Model [PRICING HYPOTHESIS]</strong>${escapeHtml(selected.monetization_model)}</div>
      <div class="criteria-cell"><strong>12. Acquisition Strategy [DISTRIBUTION HYPOTHESIS]</strong>${escapeHtml(selected.acquisition_strategy)}</div>
      <div class="criteria-cell"><strong>13. Revenue Potential [UNVERIFIED COMMERCIAL ASSUMPTION]</strong>${escapeHtml(selected.revenue_potential_notes)}</div>
      <div class="criteria-cell"><strong>14. Main Risks [RISK ANALYSIS]</strong>${escapeHtml(selected.main_risks)}</div>
      <div class="criteria-cell">
        <strong>15. Owner Capability Fit [DETERMINISTIC: ${selected.capability_fit_detail.fit_score}/10]</strong>
        ${escapeHtml(selected.capability_fit_detail.summary)}
        <div class="dossier-item-meta" style="margin-top:4px;">Difficulty: ${escapeHtml(selected.capability_fit_detail.execution_difficulty)}</div>
      </div>
    </div>

    <h4 class="sub-box-title">11-Dimension Transparent Score Breakdown (Commercial Readiness vs. Technical Feasibility)</h4>
    <table class="data-table">
      <thead>
        <tr>
          <th>Dimension</th>
          <th>Sub-Score Group</th>
          <th>Weight</th>
          <th>Score (1–10)</th>
          <th>Weighted Pts</th>
          <th>Evaluation Criteria</th>
        </tr>
      </thead>
      <tbody>
        ${(sb.dimensions || [])
          .map(
            (d) => `
          <tr>
            <td><strong>${escapeHtml(d.label)}</strong></td>
            <td><code>${escapeHtml(d.dimension_group || 'general')}</code></td>
            <td>${d.weight_pct}%</td>
            <td><strong>${d.score_out_of_10}/10</strong></td>
            <td>+${d.weighted_points}</td>
            <td class="dossier-item-meta">${escapeHtml(d.description)}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>

    <hr class="structural-divider" />
    <h4 class="sub-box-title">Attributed Market Evidence Ledger (${selected.evidence.length} Records · Confidence: ${Math.round((selected.evidence_quality_summary?.average_confidence_score || 0) * 100)}%)</h4>
    <div class="dossier-item-meta" style="margin-bottom: 8px;">
      Active Verified: <strong>${selected.evidence_quality_summary?.active_verified_count || 0}</strong> (${selected.evidence_quality_summary?.independent_verified_origins_count || 0} independent origin(s)) ·
      Observations: <strong>${selected.evidence_quality_summary?.practitioner_observation_count || 0}</strong> ·
      Downgraded Unverified: <strong>${selected.evidence_quality_summary?.downgraded_unverified_count || 0}</strong> ·
      Stale: <strong>${selected.evidence_quality_summary?.stale_count || 0}</strong> ·
      Contradicting: <strong>${selected.evidence_quality_summary?.contradicting_count || 0}</strong>
    </div>
    <table class="data-table" style="margin-bottom: 12px;">
      <thead>
        <tr>
          <th>Tier, Category &amp; Status</th>
          <th>Stance &amp; Conf</th>
          <th>Claim &amp; Supporting Excerpt</th>
          <th>Attributed Source &amp; SHA-256</th>
        </tr>
      </thead>
      <tbody>
        ${selected.evidence
          .map(
            (ev) => `
          <tr>
            <td>
              ${renderEvidenceTierBadge(ev.evidence_tier)}
              <div style="margin-top:4px;">${renderEvidenceCategoryBadge(ev.evidence_category)}</div>
              <div class="dossier-item-meta" style="margin-top:3px;">
                Status: <code>${escapeHtml(ev.verification_status || 'verified')}</code>
              </div>
            </td>
            <td>
              <span class="badge ${ev.stance === 'contradicting' ? 'badge-danger' : 'badge-info'}">[${escapeHtml((ev.stance || 'supporting').toUpperCase())}]</span>
              <div class="dossier-item-meta" style="margin-top:3px;">Conf: <strong>${Math.round((ev.confidence_score || 0.35) * 100)}%</strong></div>
            </td>
            <td>
              <strong>[${escapeHtml(ev.claim_type)}]</strong> ${escapeHtml(ev.statement)}
              ${ev.supporting_excerpt ? `<div class="dossier-item-meta" style="margin-top:3px;"><em>Excerpt:</em> "${escapeHtml(ev.supporting_excerpt)}"</div>` : ''}
              ${ev.verification_notes ? `<div class="dossier-item-meta" style="margin-top:2px;"><em>QC Note:</em> ${escapeHtml(ev.verification_notes)}</div>` : ''}
            </td>
            <td class="dossier-item-meta">
              <div><strong>${escapeHtml(ev.source_name || 'Source')}</strong></div>
              ${ev.source_url ? `<div><a href="${escapeHtml(ev.source_url)}" target="_blank" rel="noopener">${escapeHtml(ev.source_url)}</a></div>` : `<div>${escapeHtml(ev.source_citation)}</div>`}
              ${ev.source_content_hash ? `<div>SHA-256: <code>${escapeHtml(ev.source_content_hash.slice(0, 12))}...</code></div>` : ''}
              <div>Discovered: ${escapeHtml((ev.observed_at || '').slice(0, 10))} ${ev.published_at ? `· Pub: ${escapeHtml(ev.published_at.slice(0, 10))}` : ''}</div>
            </td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>

    <form id="form-add-evidence" data-opp-id="${escapeHtml(selected.id)}" class="structured-form">
      <div class="form-row-3">
        <div class="form-group">
          <label for="ev-claim-type">Claim Type</label>
          <select id="ev-claim-type" name="claim_type">
            <option value="demand">Demand Signal</option>
            <option value="competitor">Competitor Proof</option>
            <option value="pricing">Pricing / Willingness to Pay</option>
            <option value="audience">Audience Concentration</option>
            <option value="risk">Risk / Counterevidence</option>
          </select>
        </div>
        <div class="form-group">
          <label for="ev-tier-select">Requested Provenance Tier (Auto-Verified)</label>
          <select id="ev-tier-select" name="evidence_tier">
            <option value="verified_evidence">Verified Evidence (Requires https:// URL + Excerpt)</option>
            <option value="practitioner_observation">Practitioner Observation</option>
            <option value="estimate">Estimate</option>
            <option value="assumption">Assumption</option>
          </select>
        </div>
        <div class="form-group">
          <label for="ev-stance-select">Evidence Stance</label>
          <select id="ev-stance-select" name="stance">
            <option value="supporting" selected>Supporting Demand / Viability</option>
            <option value="contradicting">Contradicting / Counter-Evidence</option>
            <option value="neutral">Neutral Observation</option>
          </select>
        </div>
      </div>
      <div class="form-row-3">
        <div class="form-group">
          <label for="ev-url-input">Original Source URL (https:// Required for Verified)</label>
          <input type="text" id="ev-url-input" name="source_url" placeholder="https://wordpress.org/plugins/..." />
        </div>
        <div class="form-group">
          <label for="ev-source-input">Source Name (Required)</label>
          <input type="text" id="ev-source-input" name="source_citation" required placeholder="e.g., WordPress.org Plugin Directory" />
        </div>
        <div class="form-group">
          <label for="ev-pub-date">Date Published (YYYY-MM-DD, Optional)</label>
          <input type="text" id="ev-pub-date" name="published_at" placeholder="2026-10-15" />
        </div>
      </div>
      <div class="form-row-2">
        <div class="form-group">
          <label for="ev-statement-input">Original Claim Statement (Required)</label>
          <input type="text" id="ev-statement-input" name="statement" required placeholder="State the factual observation clearly" />
        </div>
        <div class="form-group">
          <label for="ev-excerpt-input">Supporting Excerpt / Factual Summary (&ge;15 chars for Verified)</label>
          <input type="text" id="ev-excerpt-input" name="supporting_excerpt" placeholder="Direct factual excerpt or metric from the source" />
        </div>
      </div>
      <button type="submit" class="btn btn-secondary btn-small">Verify, Attach Evidence &amp; Re-Score Opportunity</button>
    </form>

    <hr class="structural-divider" />
    <h4 class="sub-box-title">Structured Competitor Matrix (${(selected.competitors || []).length} Records)</h4>
    <table class="data-table" style="margin-bottom: 12px;">
      <thead>
        <tr>
          <th>Competitor &amp; Pricing</th>
          <th>Threat</th>
          <th>Provenance</th>
          <th>Strengths vs. Exploitable Gaps</th>
        </tr>
      </thead>
      <tbody>
        ${(selected.competitors || [])
          .map(
            (c) => `
          <tr>
            <td><strong>${escapeHtml(c.competitor_name)}</strong><div class="dossier-item-meta">${escapeHtml(c.pricing_model)}</div></td>
            <td><code>${escapeHtml(c.threat_level.toUpperCase())}</code></td>
            <td>${renderEvidenceTierBadge(c.evidence_tier)}</td>
            <td class="dossier-item-meta">
              <div><strong>Strengths:</strong> ${escapeHtml(c.strengths)}</div>
              <div><strong>Gaps:</strong> ${escapeHtml(c.weaknesses_and_gaps)}</div>
            </td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>

    <form id="form-add-competitor" data-opp-id="${escapeHtml(selected.id)}" class="structured-form">
      <div class="form-row-3">
        <div class="form-group">
          <label for="comp-name-input">Competitor Name (Required)</label>
          <input type="text" id="comp-name-input" name="competitor_name" required placeholder="e.g., Stark Plugin" />
        </div>
        <div class="form-group">
          <label for="comp-price-input">Pricing Model</label>
          <input type="text" id="comp-price-input" name="pricing_model" required placeholder="e.g., $19/mo SaaS" />
        </div>
        <div class="form-group">
          <label for="comp-threat-select">Threat Level</label>
          <select id="comp-threat-select" name="threat_level">
            <option value="low">Low</option>
            <option value="moderate" selected>Moderate</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
      <div class="form-row-2">
        <div class="form-group">
          <label for="comp-strengths-input">Incumbent Strengths</label>
          <input type="text" id="comp-strengths-input" name="strengths" required placeholder="Brand recognition or distribution" />
        </div>
        <div class="form-group">
          <label for="comp-gaps-input">Weaknesses &amp; Exploitable Gaps (Required)</label>
          <input type="text" id="comp-gaps-input" name="weaknesses_and_gaps" required placeholder="Specific UX or pricing weakness we exploit" />
        </div>
      </div>
      <button type="submit" class="btn btn-secondary btn-small">Add Competitor to Matrix</button>
    </form>
  `;
}

function renderResearchWorkspace(data) {
  const oppSelect = document.getElementById('run-opp-select');
  const sourceSelect = document.getElementById('run-source-select');

  if (oppSelect) {
    oppSelect.innerHTML =
      `<option value="">Standalone Discovery Run</option>` +
      data.opportunities
        .map((o) => `<option value="${escapeHtml(o.id)}">${escapeHtml(o.title)}</option>`)
        .join('');
  }

  if (sourceSelect) {
    sourceSelect.innerHTML = (data.research_sources || [])
      .map(
        (s) =>
          `<option value="${escapeHtml(s.id)}">${escapeHtml(s.name)} (Rel: ${s.base_reliability_score} · ${
            s.is_paid_service ? 'PAID/GATED' : 'Free Public'
          })</option>`
      )
      .join('');
  }

  const sourcesTable = document.getElementById('research-sources-table');
  if (sourcesTable) {
    const matrix = data.source_capability_matrix || [];
    sourcesTable.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Source Name &amp; Adapter</th>
            <th>Status &amp; Auth</th>
            <th>Data Retrieved &amp; Evidence Types</th>
            <th>Rate Limit &amp; Restrictions</th>
          </tr>
        </thead>
        <tbody>
          ${matrix
            .map(
              (s) => `
            <tr>
              <td>
                <strong>${escapeHtml(s.source_name)}</strong>
                <div class="dossier-item-meta">Adapter: <code>${escapeHtml(s.adapter_key)}</code> · Rel: <strong>${Math.round(s.base_reliability_score * 100)}%</strong></div>
              </td>
              <td>
                <span class="badge ${s.implemented ? 'badge-verified' : 'badge-danger'}">
                  [${s.implemented ? 'IMPLEMENTED' : 'UNSUPPORTED'}]
                </span>
                <div class="dossier-item-meta" style="margin-top:3px;">
                  Cost: <code>${escapeHtml(s.cost_tier.toUpperCase())}</code><br/>
                  Auth: ${escapeHtml(s.authentication_requirement)}
                </div>
              </td>
              <td class="dossier-item-meta">
                <div>${escapeHtml(s.data_actually_retrieved)}</div>
                <div style="margin-top:3px;"><strong>Types:</strong> <code>${escapeHtml((s.evidence_types_supported || []).join(', '))}</code></div>
              </td>
              <td class="dossier-item-meta">
                <div><strong>Limit:</strong> <code>${escapeHtml(s.rate_limits)}</code></div>
                <div>${escapeHtml(s.known_restrictions)}</div>
              </td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `;
  }

  const runsList = document.getElementById('research-runs-list');
  if (runsList) {
    const runs = data.research_runs || [];
    if (runs.length === 0) {
      runsList.innerHTML = `<p class="dossier-item-meta">No discovery runs recorded yet. Launch a run above.</p>`;
    } else {
      runsList.innerHTML = runs
        .map(
          (r) => `
        <div class="criteria-cell" style="margin-bottom: 8px;">
          <strong>[${escapeHtml(r.status.toUpperCase())}] Query: "${escapeHtml(r.query_topic)}" (${escapeHtml(r.started_at.slice(0, 10))})</strong>
          <div class="dossier-item-meta">
            Sources: ${escapeHtml((r.sources_queried || []).join(', '))} ·
            Findings Stored: <strong>${r.findings_created_count}</strong> ·
            Duplicates Skipped: <strong>${r.duplicates_skipped_count}</strong> ·
            Conflicts: <strong>${r.conflicts_detected_count}</strong>
          </div>
          <div class="dossier-item-meta">${escapeHtml(r.execution_notes)}</div>
          ${
            r.ai_synthesis && r.ai_synthesis.discussion_summary
              ? `<div class="dossier-item-meta" style="margin-top:4px; padding-top:4px; border-top:1px dashed var(--border-color);">
                  <span class="badge badge-info">[${escapeHtml(r.ai_synthesis.epistemic_label)}]</span>
                  ${escapeHtml(r.ai_synthesis.discussion_summary)}
                </div>`
              : ''
          }
        </div>
      `
        )
        .join('');
    }
  }

  const libTable = document.getElementById('central-evidence-library-table');
  if (libTable) {
    const evList = data.evidence_library || [];
    libTable.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Opportunity</th>
            <th>Tier, Category &amp; Verification Status</th>
            <th>Confidence &amp; SHA-256</th>
            <th>Claim, Excerpt &amp; Source URL</th>
            <th>Manual Review Control</th>
          </tr>
        </thead>
        <tbody>
          ${evList
            .map(
              (ev) => `
            <tr>
              <td><strong>${escapeHtml(ev.opportunity_title || ev.opportunity_id)}</strong></td>
              <td>
                ${renderEvidenceTierBadge(ev.evidence_tier)}
                <div style="margin-top:4px;">${renderEvidenceCategoryBadge(ev.evidence_category)}</div>
                <div class="dossier-item-meta">Status: <code>${escapeHtml(ev.verification_status)}</code></div>
                <div class="dossier-item-meta">Method: <code>${escapeHtml(ev.verification_method || 'unverified')}</code></div>
              </td>
              <td>
                <strong>${Math.round((ev.confidence_score || 0.35) * 100)}%</strong>
                <div class="dossier-item-meta">Rel: ${ev.source_reliability_score} · <code>${escapeHtml(ev.stance)}</code></div>
                ${ev.http_status ? `<div class="dossier-item-meta">HTTP: <code>${ev.http_status}</code> · SHA-256: <code>${escapeHtml((ev.source_content_hash || '').slice(0, 12))}...</code></div>` : ''}
              </td>
              <td>
                <div>${escapeHtml(ev.statement)}</div>
                ${ev.supporting_excerpt ? `<div class="dossier-item-meta"><em>Excerpt:</em> "${escapeHtml(ev.supporting_excerpt)}"</div>` : ''}
                ${ev.verification_notes ? `<div class="dossier-item-meta"><em>QC:</em> ${escapeHtml(ev.verification_notes)}</div>` : ''}
                <div class="dossier-item-meta">
                  Source: <strong>${escapeHtml(ev.source_name)}</strong>
                  ${ev.source_url ? `(<a href="${escapeHtml(ev.source_url)}" target="_blank" rel="noopener">${escapeHtml(ev.source_url)}</a>)` : ''}
                </div>
              </td>
              <td>
                ${ev.source_url ? `<button type="button" class="btn btn-small btn-secondary" data-verify-http-ev="${escapeHtml(ev.id)}" style="margin-bottom:4px;">Fetch &amp; Verify HTTP</button>` : ''}
                <button type="button" class="btn btn-small btn-approve" data-review-ev="${escapeHtml(ev.id)}" data-ev-status="verified">Verify</button>
                <button type="button" class="btn btn-small btn-reject" data-review-ev="${escapeHtml(ev.id)}" data-ev-status="rejected">Reject</button>
              </td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `;
  }
}

async function renderExecutionWorkspace(data) {
  const selectEl = document.getElementById('select-active-product');
  const container = document.getElementById('product-execution-container');
  if (!selectEl || !container) return;

  selectEl.innerHTML = data.products
    .map(
      (p) =>
        `<option value="${escapeHtml(p.id)}" ${p.id === state.selectedProductId ? 'selected' : ''}>${escapeHtml(p.name)} (${p.completion_pct}%)</option>`
    )
    .join('');

  const product = data.products.find((p) => p.id === state.selectedProductId) || data.products[0];
  if (!product) {
    container.innerHTML = `<div class="ledger-box"><p>No planned MVP products yet. Select an opportunity in View 2 ("Evaluate &amp; Compare") and click "Select &amp; Plan MVP Blueprint".</p></div>`;
    return;
  }

  const m = product.progress_metrics;

  container.innerHTML = `
    <div class="ledger-box" style="margin-bottom: 18px;">
      <div class="box-header">
        <div>
          <span class="mono">Category: ${escapeHtml(product.category)} · Status: ${escapeHtml(product.status.toUpperCase())}</span>
          <h3>${escapeHtml(product.name)} — ${escapeHtml(product.tagline)}</h3>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 22px; font-weight: 700;">${product.completion_pct}% Real Completion</div>
          <span class="badge badge-info">[ACTIVE STAGE ${product.current_stage_number}/15: ${escapeHtml(product.current_stage_name.toUpperCase())}]</span>
        </div>
      </div>

      <div class="score-meter" style="height: 10px; margin-bottom: 12px;">
        <div class="score-meter-fill" style="width: ${product.completion_pct}%"></div>
      </div>

      <h4 class="sub-box-title">Selected Opportunity MVP Blueprint &amp; Commercial Validation Gate</h4>
      <div class="criteria-grid" style="margin-bottom: 14px;">
        <div class="criteria-cell">
          <strong>Target Customer Segment [ASSUMPTION UNTIL VALIDATED]</strong>
          <div>${escapeHtml(product.target_audience)}</div>
        </div>
        <div class="criteria-cell">
          <strong>Must-Have V1 Features (&le;14-Day Build Wedge)</strong>
          <div>${escapeHtml(product.mvp_must_have_features)}</div>
        </div>
        <div class="criteria-cell">
          <strong>Explicitly Excluded Non-Goals (Anti-Scope-Creep Boundary)</strong>
          <div>${escapeHtml(product.mvp_excluded_scope)}</div>
        </div>
        <div class="criteria-cell">
          <strong>Pricing &amp; Monetization Hypothesis [UNVERIFIED]</strong>
          <div>${escapeHtml(product.pricing_hypothesis)}</div>
        </div>
        <div class="criteria-cell" style="grid-column: 1 / -1;">
          <strong>Buyer Validation Criteria (Explicit Build / Pivot / Abandon Thresholds)</strong>
          <div>${escapeHtml(product.buyer_validation_criteria)}</div>
        </div>
      </div>

      <div class="criteria-grid">
        <div class="criteria-cell"><strong>Positioning</strong>${escapeHtml(product.positioning)}</div>
        <div class="criteria-cell"><strong>UX Architecture Spec</strong>${escapeHtml(product.ux_architecture_notes)}</div>
        <div class="criteria-cell"><strong>Pragmatic Tech Stack</strong>${escapeHtml(product.tech_stack)}</div>
        <div class="criteria-cell">
          <strong>Effort &amp; Remaining Work</strong>
          Completed Tasks: <strong>${m.completed_tasks}/${m.total_tasks}</strong> ·
          Completed Effort: <strong>${m.completed_estimated_hours}/${m.total_estimated_hours} hrs</strong> ·
          Remaining Effort: <strong>${m.remaining_estimated_hours} hrs</strong> ·
          Actual Logged: <strong>${m.total_actual_hours} hrs</strong>
        </div>
      </div>

      <details style="margin-top: 12px;">
        <summary style="cursor: pointer; font-weight: 600; padding: 6px 0;">
          Edit Selected Opportunity MVP Blueprint (Must-Have Features, Excluded Non-Goals, Pricing Hypothesis &amp; Validation Criteria)
        </summary>
        <form id="form-update-mvp-plan" data-prod-id="${escapeHtml(product.id)}" class="structured-form" style="margin-top: 10px;">
          <div class="form-row-2">
            <div class="form-group">
              <label for="mvp-target-audience">Target Buyer Segment</label>
              <input type="text" id="mvp-target-audience" name="target_audience" value="${escapeHtml(product.target_audience)}" required />
            </div>
            <div class="form-group">
              <label for="mvp-pricing-hyp">Pricing &amp; Monetization Hypothesis</label>
              <input type="text" id="mvp-pricing-hyp" name="pricing_hypothesis" value="${escapeHtml(product.pricing_hypothesis)}" required />
            </div>
          </div>
          <div class="form-group">
            <label for="mvp-must-have">Must-Have V1 Features (Core Wedge Only)</label>
            <textarea id="mvp-must-have" name="mvp_must_have_features" rows="2" required>${escapeHtml(product.mvp_must_have_features)}</textarea>
          </div>
          <div class="form-group">
            <label for="mvp-excluded">Explicitly Excluded Non-Goals (Scope Boundary)</label>
            <textarea id="mvp-excluded" name="mvp_excluded_scope" rows="2" required>${escapeHtml(product.mvp_excluded_scope)}</textarea>
          </div>
          <div class="form-group">
            <label for="mvp-validation-criteria">Buyer Validation Criteria (Build / Pivot / Abandon Thresholds)</label>
            <textarea id="mvp-validation-criteria" name="buyer_validation_criteria" rows="2" required>${escapeHtml(product.buyer_validation_criteria)}</textarea>
          </div>
          <button type="submit" class="btn btn-primary btn-small">Save MVP Plan Updates</button>
        </form>
      </details>

      ${
        product.dependency_diagnostics?.next_critical_task
          ? `<div class="criteria-cell" style="margin-top: 10px;">
              <strong>Next Critical-Path Milestone</strong>
              Stage ${product.dependency_diagnostics.next_critical_task.stage_number} (${escapeHtml(
                product.dependency_diagnostics.next_critical_task.stage_name
              )}): ${escapeHtml(product.dependency_diagnostics.next_critical_task.title)} (${
                product.dependency_diagnostics.next_critical_task.estimated_hours
              }h est)
              ${(product.dependency_diagnostics.warnings || [])
                .map((w) => `<div class="badge badge-warn" style="display:block; margin-top:4px; white-space:normal;">${escapeHtml(w)}</div>`)
                .join('')}
            </div>`
          : ''
      }
    </div>

    <div class="ledger-box">
      <div class="box-header">
        <h3>15-Stage Product Development Workflow, Milestones &amp; Acceptance Criteria</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Stage &amp; Phase</th>
            <th>Milestone &amp; Task</th>
            <th>Effort (Est / Actual)</th>
            <th>Dependencies &amp; Risks</th>
            <th>Acceptance Criteria</th>
            <th>Status Control</th>
          </tr>
        </thead>
        <tbody>
          ${product.tasks
            .map(
              (t) => `
            <tr>
              <td>
                <strong>Stage ${t.stage_number}: ${escapeHtml(t.stage_name)}</strong>
                <div class="dossier-item-meta">${escapeHtml(t.phase_name)}</div>
              </td>
              <td>
                <strong>${escapeHtml(t.milestone_name)}</strong>
                <div>${escapeHtml(t.title)}</div>
              </td>
              <td class="mono">${t.estimated_hours}h est / ${t.actual_hours}h actual</td>
              <td class="dossier-item-meta">
                <div><strong>Dep:</strong> ${escapeHtml(t.dependencies)}</div>
                <div><strong>Risk:</strong> ${escapeHtml(t.risks)}</div>
              </td>
              <td class="dossier-item-meta">${escapeHtml(t.acceptance_criteria)}</td>
              <td>
                <select class="task-status-select" data-task-id="${escapeHtml(t.id)}" data-est="${t.estimated_hours}" aria-label="Status for Stage ${t.stage_number} ${escapeHtml(t.stage_name)}">
                  <option value="todo" ${t.status === 'todo' ? 'selected' : ''}>To Do</option>
                  <option value="in_progress" ${t.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                  <option value="blocked" ${t.status === 'blocked' ? 'selected' : ''}>Blocked</option>
                  <option value="done" ${t.status === 'done' ? 'selected' : ''}>Done (Verified)</option>
                </select>
              </td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;
}

async function renderGrowthWorkspace(data) {
  const container = document.getElementById('growth-workspace-container');
  if (!container) return;
  const product = data.products.find((p) => p.id === state.selectedProductId) || data.products[0];
  if (!product) {
    container.innerHTML = `<div class="ledger-box"><p>Promote an approved opportunity into an active product to configure acquisition channels and monetization.</p></div>`;
    return;
  }

  const gw = await fetchJson(`/api/products/${encodeURIComponent(product.id)}/growth`);

  container.innerHTML = `
    <div class="split-grid-2col">
      <div class="ledger-box">
        <div class="box-header">
          <h3>Acquisition &amp; Distribution Channels — ${escapeHtml(product.name)}</h3>
        </div>
        <p class="dossier-item-meta">
          SEO is one channel, not the identity of the product. Paid channels automatically trigger an Owner Financial Approval Gate.
        </p>
        <table class="data-table" style="margin-bottom: 14px;">
          <thead>
            <tr>
              <th>Channel &amp; Category</th>
              <th>Fit</th>
              <th>Monthly Cost</th>
              <th>Status</th>
              <th>Playbook &amp; Expected Return</th>
            </tr>
          </thead>
          <tbody>
            ${gw.channels
              .map(
                (ch) => `
              <tr>
                <td>
                  <strong>${escapeHtml(ch.channel_name)}</strong>
                  <div class="dossier-item-meta">Category: <code>${escapeHtml(ch.channel_category)}</code></div>
                </td>
                <td><strong>${ch.fit_score}/10</strong></td>
                <td>$${ch.estimated_monthly_cost_usd}/mo</td>
                <td>
                  <span class="badge ${ch.status === 'gated_approval' ? 'badge-warn' : 'badge-verified'}">
                    [${escapeHtml(ch.status.toUpperCase())}]
                  </span>
                </td>
                <td class="dossier-item-meta">
                  <div><strong>ROI Rationale:</strong> ${escapeHtml(ch.expected_return_rationale)}</div>
                  <div><strong>Playbook:</strong> ${escapeHtml(ch.execution_playbook)}</div>
                </td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <h4 class="sub-box-title">Add Acquisition Channel</h4>
        <form id="form-add-channel" data-prod-id="${escapeHtml(product.id)}" class="structured-form">
          <div class="form-row-3">
            <div class="form-group">
              <label for="gc-name">Channel Name (Required)</label>
              <input type="text" id="gc-name" name="channel_name" required placeholder="e.g., Reddit r/designsystems Teardown" />
            </div>
            <div class="form-group">
              <label for="gc-cat">Channel Category</label>
              <select id="gc-cat" name="channel_category">
                <option value="product_directories">Product Directories &amp; Ecosystems</option>
                <option value="search_intent">Search Intent / Utility SEO</option>
                <option value="community_distribution">Community Distribution</option>
                <option value="content_marketing">Content Marketing</option>
                <option value="email_marketing">Email Marketing</option>
                <option value="partnerships">Partnerships &amp; Affiliates</option>
                <option value="social_media">Organic Social Media</option>
                <option value="paid_advertising">Paid Advertising (Gated Approval)</option>
              </select>
            </div>
            <div class="form-group">
              <label for="gc-cost">Est. Monthly Cost (USD)</label>
              <input type="number" id="gc-cost" name="estimated_monthly_cost_usd" min="0" value="0" required />
            </div>
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label for="gc-rationale">Expected Return Rationale (Required)</label>
              <input type="text" id="gc-rationale" name="expected_return_rationale" required placeholder="Why this channel reaches buyers efficiently" />
            </div>
            <div class="form-group">
              <label for="gc-playbook">Execution Playbook (Required)</label>
              <input type="text" id="gc-playbook" name="execution_playbook" required placeholder="Concrete execution steps" />
            </div>
          </div>
          <button type="submit" class="btn btn-secondary btn-small">Add Distribution Channel</button>
        </form>

        <hr class="structural-divider" />
        <h4 class="sub-box-title">Search Intent &amp; Conversion Asset Clusters (${(gw.search_intent_clusters || []).length})</h4>
        <table class="data-table" style="margin-bottom: 12px;">
          <thead>
            <tr>
              <th>Topic Cluster &amp; Intent</th>
              <th>Target Query Pattern</th>
              <th>Conversion Asset</th>
              <th>Provenance</th>
            </tr>
          </thead>
          <tbody>
            ${(gw.search_intent_clusters || [])
              .map(
                (cl) => `
              <tr>
                <td><strong>${escapeHtml(cl.topic_cluster)}</strong><div class="dossier-item-meta"><code>${escapeHtml(cl.intent_type)}</code> · ${escapeHtml(cl.status)}</div></td>
                <td><code>${escapeHtml(cl.target_query_pattern)}</code></td>
                <td>${escapeHtml(cl.conversion_asset)}</td>
                <td>${renderEvidenceTierBadge(cl.demand_evidence_tier)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>

      <div class="ledger-box">
        <div class="box-header">
          <h3>Monetization Strategy &amp; Honest Performance Telemetry</h3>
        </div>
        <div class="criteria-cell" style="margin-bottom: 12px;">
          <strong>Active Monetization Model: ${escapeHtml(product.monetization_model)}</strong>
          <div class="dossier-item-meta">${escapeHtml(product.monetization_tradeoffs)}</div>
          ${
            gw.unit_economics
              ? `<div class="dossier-item-meta" style="margin-top:6px;">
                  <strong>Unit Economics:</strong> Active Burn: <code>$${gw.unit_economics.active_channel_monthly_burn_usd}/mo</code> ·
                  Recorded Revenue: <code>$${gw.unit_economics.recorded_revenue_total_usd}</code> ·
                  Net Cashflow: <code>$${gw.unit_economics.net_cashflow_usd}</code> ·
                  LTV:CAC: <code>${escapeHtml(gw.unit_economics.ltv_cac_status)}</code>
                </div>`
              : ''
          }
        </div>

        <h4 class="sub-box-title">Comparative Monetization Models &amp; Tradeoffs</h4>
        <div class="dossier-list" style="margin-bottom: 14px;">
          ${gw.monetization_recommendations
            .slice(0, 3)
            .map(
              (m) => `
            <div class="criteria-cell">
              <strong>${escapeHtml(m.model)} (${escapeHtml(m.recommended_price_band)}) ${m.is_category_match ? '— [CATEGORY MATCH]' : ''}</strong>
              <div class="dossier-item-meta"><strong>Pros:</strong> ${escapeHtml(m.pros)}</div>
              <div class="dossier-item-meta"><strong>Tradeoffs:</strong> ${escapeHtml(m.cons)}</div>
            </div>
          `
            )
            .join('')}
        </div>

        <h4 class="sub-box-title">Business Performance Ledger (Never Fabricated)</h4>
        <p class="dossier-item-meta">${escapeHtml(gw.honest_telemetry_status)}</p>
        <table class="data-table">
          <thead>
            <tr>
              <th>Period</th>
              <th>Visitors</th>
              <th>Conv %</th>
              <th>Revenue</th>
              <th>Op Cost</th>
              <th>Provenance</th>
            </tr>
          </thead>
          <tbody>
            ${gw.metrics
              .map(
                (pm) => `
              <tr>
                <td><strong>${escapeHtml(pm.period_label)}</strong><div class="dossier-item-meta">${escapeHtml(pm.notes)}</div></td>
                <td>${pm.visitors === null ? '<code>N/A</code>' : pm.visitors}</td>
                <td>${pm.conversion_rate_pct === null ? '<code>N/A</code>' : `${pm.conversion_rate_pct}%`}</td>
                <td><strong>$${pm.revenue_usd ?? 0}</strong></td>
                <td>$${pm.operating_cost_usd ?? 0}</td>
                <td><span class="badge badge-info">[${escapeHtml(pm.data_provenance)}]</span></td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderApprovalsWorkspace(data) {
  const listEl = document.getElementById('approvals-queue-list');
  listEl.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Gate Status</th>
          <th>Category &amp; Financial Impact</th>
          <th>Commitment Details</th>
          <th>Owner Decision Control</th>
        </tr>
      </thead>
      <tbody>
        ${data.all_approvals
          .map(
            (req) => `
          <tr>
            <td>
              <span class="badge ${
                req.status === 'approved'
                  ? 'badge-verified'
                  : req.status === 'rejected'
                    ? 'badge-danger'
                    : 'badge-warn'
              }">[GATE: ${escapeHtml(req.status.toUpperCase())}]</span>
            </td>
            <td>
              <code>${escapeHtml(req.action_category)}</code>
              <div><strong>$${req.financial_commitment_usd} USD</strong></div>
            </td>
            <td>
              <strong>${escapeHtml(req.title)}</strong>
              <div class="dossier-item-meta">${escapeHtml(req.description)}</div>
              ${
                req.owner_decision_notes
                  ? `<div class="dossier-item-meta"><strong>Owner Notes:</strong> ${escapeHtml(req.owner_decision_notes)}</div>`
                  : ''
              }
            </td>
            <td>
              ${
                req.status === 'pending'
                  ? `
                <button type="button" class="btn btn-small btn-approve" data-decide-appr="${escapeHtml(req.id)}" data-decision="approved">Approve</button>
                <button type="button" class="btn btn-small btn-reject" data-decide-appr="${escapeHtml(req.id)}" data-decision="rejected">Reject</button>
              `
                  : `<span class="mono">Decided: ${escapeHtml(req.decided_at ? req.decided_at.slice(0, 10) : 'Recorded')}</span>`
              }
            </td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  `;
}

function renderCapabilitiesWorkspace(data) {
  const profileCard = document.getElementById('owner-profile-card');
  const p = data.owner.profile;

  profileCard.innerHTML = `
    <div class="criteria-cell" style="margin-bottom: 12px;">
      <strong>Primary Strategic Direction: ${escapeHtml(p.primary_direction)}</strong>
      <div style="margin-top: 4px;">${escapeHtml(p.engineering_constraint_summary)}</div>
      <div class="dossier-item-meta" style="margin-top: 4px;"><strong>Secondary Options:</strong> ${escapeHtml(p.secondary_options.join(' · '))}</div>
    </div>
  `;

  const capTable = document.getElementById('capabilities-matrix-table');
  capTable.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Capability</th>
          <th>Category</th>
          <th>Proficiency</th>
          <th>Execution Leverage &amp; Notes</th>
        </tr>
      </thead>
      <tbody>
        ${data.owner.capabilities
          .map(
            (cap) => `
          <tr>
            <td><strong>${escapeHtml(cap.name)}</strong></td>
            <td><code>${escapeHtml(cap.category)}</code></td>
            <td><strong>${cap.proficiency_level} / 5</strong></td>
            <td>
              <span class="badge badge-info">[${escapeHtml(cap.execution_leverage)}]</span>
              <div class="dossier-item-meta" style="margin-top: 3px;">${escapeHtml(cap.notes)}</div>
            </td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  `;

  const biList = document.getElementById('intelligence-memory-list');
  const proactive = data.proactive_intelligence || { proactive_action_queue: [], unexplored_high_fit_categories: [] };

  biList.innerHTML = `
    <div class="criteria-cell" style="margin-bottom: 12px;">
      <strong>Proactive AI Business Intelligence Recommendations</strong>
      ${(proactive.proactive_action_queue || [])
        .map(
          (item) => `
        <div style="margin-top: 6px;">
          <span class="badge ${item.priority === 'URGENT' ? 'badge-warn' : 'badge-info'}">[${escapeHtml(item.type)}]</span>
          <strong>${escapeHtml(item.target)}:</strong> ${escapeHtml(item.recommendation)}
        </div>
      `
        )
        .join('')}
      ${
        (proactive.unexplored_high_fit_categories || []).length > 0
          ? `<div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid var(--border-color);">
              <strong>Unexplored High-Fit Product Categories Aligned with Level-5 Capabilities:</strong>
              ${proactive.unexplored_high_fit_categories
                .map(
                  (u) => `<div class="dossier-item-meta" style="margin-top:4px;">• <strong>${escapeHtml(u.category)}</strong> — ${escapeHtml(u.concept)}: ${escapeHtml(u.why_it_fits)}</div>`
                )
                .join('')}
            </div>`
          : ''
      }
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th>Type &amp; Provenance</th>
          <th>Title &amp; Summary</th>
          <th>Future Recommendation Implication</th>
        </tr>
      </thead>
      <tbody>
        ${data.recent_intelligence
          .map(
            (entry) => `
          <tr>
            <td>
              <code>${escapeHtml(entry.entry_type)}</code>
              <div style="margin-top: 4px;">${renderEvidenceTierBadge(entry.evidence_tier)}</div>
            </td>
            <td>
              <strong>${escapeHtml(entry.title)}</strong>
              <div class="dossier-item-meta">${escapeHtml(entry.summary)}</div>
            </td>
            <td class="dossier-item-meta">${escapeHtml(entry.future_implication)}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  `;
}

// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
  applyTheme(state.theme);

  document.getElementById('theme-toggle-btn').addEventListener('click', () => {
    applyTheme(state.theme === 'light' ? 'dark' : 'light');
  });

  document.querySelectorAll('.nav-tab').forEach((btn) => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  document.body.addEventListener('click', async (e) => {
    const gotoBtn = e.target.closest('[data-goto-tab]');
    if (gotoBtn) {
      switchTab(gotoBtn.dataset.gotoTab);
      return;
    }

    const inspectBtn = e.target.closest('[data-inspect-opp]');
    if (inspectBtn) {
      state.selectedOpportunityId = inspectBtn.dataset.inspectOpp;
      switchTab('opportunities');
      renderOpportunitiesWorkspace(state.dashboard);
      return;
    }

    const selectOppCard = e.target.closest('[data-select-opp]');
    if (selectOppCard) {
      state.selectedOpportunityId = selectOppCard.dataset.selectOpp;
      renderOpportunitiesWorkspace(state.dashboard);
      return;
    }

    const statusBtn = e.target.closest('[data-opp-status]');
    if (statusBtn) {
      const oppId = statusBtn.dataset.oppStatus;
      const newStatus = statusBtn.dataset.status;
      await fetchJson(`/api/opportunities/${encodeURIComponent(oppId)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: newStatus,
          rejection_reason:
            newStatus === 'rejected'
              ? 'Rejected by owner after evaluating 11-dimension score and evidence.'
              : ''
        })
      });
      showFeedback(`Opportunity status updated to ${newStatus.toUpperCase()}.`);
      await loadDashboard();
      return;
    }

    const promoteBtn = e.target.closest('[data-promote-opp]');
    if (promoteBtn) {
      const oppId = promoteBtn.dataset.promoteOpp;
      const res = await fetchJson(`/api/opportunities/${encodeURIComponent(oppId)}/promote`, {
        method: 'POST',
        body: JSON.stringify({})
      });
      state.selectedProductId = res.product.id;
      showFeedback(`Promoted "${res.product.name}" into active 15-stage product execution!`);
      await loadDashboard();
      switchTab('execution');
      return;
    }

    const simBtn = e.target.closest('[data-simulate-opp]');
    if (simBtn) {
      const oppId = simBtn.dataset.simulateOpp;
      const res = await fetchJson(`/api/opportunities/${encodeURIComponent(oppId)}/simulate`, {
        method: 'POST',
        body: JSON.stringify({ simulate_verified_evidence: true, dev_complexity: 'low' })
      });
      const s = res.simulation;
      const simBox = document.getElementById('simulation-result-box');
      if (simBox) {
        simBox.classList.remove('hidden');
        simBox.className = 'criteria-cell';
        simBox.innerHTML = `
          <strong>Sensitivity Simulation Result (Non-Destructive)</strong>
          <div>If 1+ Verified Demand Evidence record is acquired and complexity is scoped to <code>low</code>:</div>
          <div>Baseline: <strong>${s.baseline_score}/100</strong> (<code>${escapeHtml(s.baseline_recommendation)}</code>) &rarr; Simulated: <strong>${s.simulated_score}/100</strong> (<code>${escapeHtml(s.simulated_recommendation)}</code>) [Delta: <strong>${s.score_delta >= 0 ? '+' : ''}${s.score_delta} pts</strong>]</div>
        `;
      }
      return;
    }

    const decideApprBtn = e.target.closest('[data-decide-appr]');
    if (decideApprBtn) {
      const apprId = decideApprBtn.dataset.decideAppr;
      const decision = decideApprBtn.dataset.decision;
      await fetchJson(`/api/approvals/${encodeURIComponent(apprId)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          decision,
          owner_decision_notes: `Owner explicitly marked ${decision} via STRAW Command Workspace.`
        })
      });
      showFeedback(`Approval checkpoint marked as ${decision.toUpperCase()}.`);
      await loadDashboard();
      return;
    }

    const verifyHttpBtn = e.target.closest('[data-verify-http-ev]');
    if (verifyHttpBtn) {
      const evId = verifyHttpBtn.dataset.verifyHttpEv;
      try {
        const res = await fetchJson(`/api/research/evidence/${encodeURIComponent(evId)}/verify-source`, {
          method: 'POST',
          body: JSON.stringify({})
        });
        showFeedback(
          `HTTP Source Check Complete: Status=${res.evidence.verification_status.toUpperCase()} (Method: ${res.evidence.verification_method}).`
        );
        await loadDashboard();
      } catch (err) {
        showFeedback(`HTTP Source Verification Failed: ${err.message}`);
      }
      return;
    }

    const reviewEvBtn = e.target.closest('[data-review-ev]');
    if (reviewEvBtn) {
      const evId = reviewEvBtn.dataset.reviewEv;
      const evStatus = reviewEvBtn.dataset.evStatus;
      try {
        await fetchJson(`/api/research/evidence/${encodeURIComponent(evId)}`, {
          method: 'PATCH',
          body: JSON.stringify({
            verification_status: evStatus,
            reviewer_notes: `Owner reviewed finding and set status to ${evStatus}.`
          })
        });
        showFeedback(`Evidence verification status updated to ${evStatus.toUpperCase()}.`);
        await loadDashboard();
      } catch (err) {
        showFeedback(`Verification Blocked: ${err.message}`);
      }
    }
  });

  document.body.addEventListener('change', async (e) => {
    if (e.target.id === 'filter-opp-status') {
      state.filterStatus = e.target.value;
      renderOpportunitiesWorkspace(state.dashboard);
    } else if (e.target.id === 'filter-opp-category') {
      state.filterCategory = e.target.value;
      renderOpportunitiesWorkspace(state.dashboard);
    } else if (e.target.id === 'select-active-product') {
      state.selectedProductId = e.target.value;
      await renderExecutionWorkspace(state.dashboard);
      await renderGrowthWorkspace(state.dashboard);
    } else if (e.target.classList.contains('task-status-select')) {
      const taskId = e.target.dataset.taskId;
      const newStatus = e.target.value;
      const est = Number(e.target.dataset.est) || 2;
      await fetchJson(`/api/tasks/${encodeURIComponent(taskId)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: newStatus,
          actual_hours: newStatus === 'done' ? est : 0
        })
      });
      showFeedback(`Task updated to ${newStatus.toUpperCase()} — real completion percentage recalculated.`);
      await loadDashboard();
    }
  });

  document.body.addEventListener('submit', async (e) => {
    if (e.target.id === 'form-new-opportunity') {
      e.preventDefault();
      const fd = new FormData(e.target);
      const dimInputs = {};
      e.target.querySelectorAll('[data-dim]').forEach((inp) => {
        dimInputs[inp.dataset.dim] = Number(inp.value);
      });

      const evStatement = fd.get('initial_evidence_statement')?.trim();
      const evidence = evStatement
        ? [
            {
              claim_type: 'demand',
              statement: evStatement,
              evidence_tier: fd.get('initial_evidence_tier'),
              source_citation: fd.get('initial_evidence_source')?.trim() || 'Initial intake citation'
            }
          ]
        : [];

      const res = await fetchJson('/api/opportunities', {
        method: 'POST',
        body: JSON.stringify({
          title: fd.get('title'),
          category: fd.get('category'),
          dev_complexity: fd.get('dev_complexity'),
          problem_statement: fd.get('problem_statement'),
          target_audience: fd.get('target_audience'),
          demand_summary: fd.get('demand_summary'),
          competitors_summary: fd.get('competitors_summary'),
          alternatives_summary: fd.get('alternatives_summary'),
          market_gaps: fd.get('market_gaps'),
          differentiation_potential: fd.get('differentiation_potential'),
          estimated_dev_days: Number(fd.get('estimated_dev_days')),
          operational_cost_monthly_usd: Number(fd.get('operational_cost_monthly_usd')),
          monetization_model: fd.get('monetization_model'),
          acquisition_strategy: fd.get('acquisition_strategy'),
          revenue_potential_notes: fd.get('revenue_potential_notes'),
          main_risks: fd.get('main_risks'),
          dimension_inputs: dimInputs,
          evidence
        })
      });

      state.selectedOpportunityId = res.opportunity.id;
      e.target.reset();
      showFeedback(
        `Evaluated "${res.opportunity.title}": Score ${res.opportunity.overall_score}/100 (${res.opportunity.recommendation})`
      );
      await loadDashboard();
    } else if (e.target.id === 'form-add-evidence') {
      e.preventDefault();
      const oppId = e.target.dataset.oppId;
      const fd = new FormData(e.target);
      try {
        const res = await fetchJson(`/api/opportunities/${encodeURIComponent(oppId)}/evidence`, {
          method: 'POST',
          body: JSON.stringify({
            claim_type: fd.get('claim_type'),
            evidence_tier: fd.get('evidence_tier'),
            stance: fd.get('stance'),
            source_url: fd.get('source_url'),
            source_name: fd.get('source_citation'),
            source_citation: fd.get('source_citation'),
            published_at: fd.get('published_at') || null,
            supporting_excerpt: fd.get('supporting_excerpt'),
            statement: fd.get('statement'),
            research_methodology: 'direct_url_inspection'
          })
        });
        showFeedback(
          `Processed finding (Classified: ${res.evidence.evidence_tier.toUpperCase()} | Status: ${res.evidence.verification_status}). New Score: ${res.opportunity.overall_score}/100.`
        );
        await loadDashboard();
      } catch (err) {
        showFeedback(`Evidence Guardrail: ${err.message}`);
      }
    } else if (e.target.id === 'form-discovery-run') {
      e.preventDefault();
      const fd = new FormData(e.target);
      const res = await fetchJson('/api/research/runs', {
        method: 'POST',
        body: JSON.stringify({
          query_topic: fd.get('query_topic'),
          opportunity_id: fd.get('opportunity_id') || null,
          source_ids: [fd.get('source_id')],
          fetch_live_public: fd.get('fetch_live_public') === 'true'
        })
      });
      showFeedback(`Discovery Run "${res.run.query_topic}" finished with status: ${res.run.status.toUpperCase()}.`);
      await loadDashboard();
    } else if (e.target.id === 'form-add-competitor') {
      e.preventDefault();
      const oppId = e.target.dataset.oppId;
      const fd = new FormData(e.target);
      await fetchJson(`/api/opportunities/${encodeURIComponent(oppId)}/competitors`, {
        method: 'POST',
        body: JSON.stringify({
          competitor_name: fd.get('competitor_name'),
          pricing_model: fd.get('pricing_model'),
          threat_level: fd.get('threat_level'),
          strengths: fd.get('strengths'),
          weaknesses_and_gaps: fd.get('weaknesses_and_gaps'),
          evidence_tier: 'practitioner_observation',
          source_ref: 'Competitive Matrix Entry'
        })
      });
      showFeedback('Added competitor to opportunity matrix.');
      await loadDashboard();
    } else if (e.target.id === 'form-update-mvp-plan') {
      e.preventDefault();
      const prodId = e.target.dataset.prodId;
      const fd = new FormData(e.target);
      await fetchJson(`/api/products/${encodeURIComponent(prodId)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          target_audience: fd.get('target_audience'),
          pricing_hypothesis: fd.get('pricing_hypothesis'),
          mvp_must_have_features: fd.get('mvp_must_have_features'),
          mvp_excluded_scope: fd.get('mvp_excluded_scope'),
          buyer_validation_criteria: fd.get('buyer_validation_criteria')
        })
      });
      showFeedback('Saved updated MVP Blueprint & Buyer Validation Criteria.');
      await loadDashboard();
    } else if (e.target.id === 'form-add-channel') {
      e.preventDefault();
      const prodId = e.target.dataset.prodId;
      const fd = new FormData(e.target);
      await fetchJson(`/api/products/${encodeURIComponent(prodId)}/growth`, {
        method: 'POST',
        body: JSON.stringify({
          channel_name: fd.get('channel_name'),
          channel_category: fd.get('channel_category'),
          estimated_monthly_cost_usd: Number(fd.get('estimated_monthly_cost_usd')),
          expected_return_rationale: fd.get('expected_return_rationale'),
          execution_playbook: fd.get('execution_playbook')
        })
      });
      showFeedback('Added distribution channel (paid channels automatically queued in Approval Gates).');
      await loadDashboard();
    } else if (e.target.id === 'form-new-approval') {
      e.preventDefault();
      const fd = new FormData(e.target);
      await fetchJson('/api/approvals', {
        method: 'POST',
        body: JSON.stringify({
          title: fd.get('title'),
          action_category: fd.get('action_category'),
          financial_commitment_usd: Number(fd.get('financial_commitment_usd')),
          description: fd.get('description')
        })
      });
      e.target.reset();
      showFeedback('Registered new gated action in the Owner Approval Queue.');
      await loadDashboard();
    } else if (e.target.id === 'form-add-capability') {
      e.preventDefault();
      const fd = new FormData(e.target);
      await fetchJson('/api/capabilities', {
        method: 'POST',
        body: JSON.stringify({
          name: fd.get('name'),
          category: fd.get('category'),
          proficiency_level: Number(fd.get('proficiency_level')),
          execution_leverage: fd.get('execution_leverage'),
          notes: fd.get('notes')
        })
      });
      e.target.reset();
      showFeedback('Owner capability saved to profile.');
      await loadDashboard();
    } else if (e.target.id === 'form-add-intelligence') {
      e.preventDefault();
      const fd = new FormData(e.target);
      await fetchJson('/api/intelligence', {
        method: 'POST',
        body: JSON.stringify({
          entry_type: fd.get('entry_type'),
          evidence_tier: fd.get('evidence_tier'),
          title: fd.get('title'),
          summary: fd.get('summary'),
          future_implication: fd.get('future_implication')
        })
      });
      e.target.reset();
      showFeedback('Logged entry to Personal Business Intelligence Memory.');
      await loadDashboard();
    }
  });

  loadDashboard();
});
