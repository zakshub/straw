import {
  t,
  getSupportedLanguage,
  renderExplainTerm,
  renderGettingStartedBanner,
  renderHelpCenterContent
} from './i18n.js';

const state = {
  dashboard: null,
  selectedOpportunityId: null,
  selectedProductId: null,
  filterStatus: '',
  filterCategory: '',
  theme: localStorage.getItem('straw_theme') || 'light',
  lang: getSupportedLanguage(localStorage.getItem('straw_lang') || 'en'),
  gsCollapsed: localStorage.getItem('straw_gs_collapsed') === 'true',
  helpSection: 'getting-started',
  helpSearch: ''
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
  const label = t(`rec_${rec}`, {}, state.lang);
  if (rec === 'APPROVE_FOR_VALIDATION') {
    return `<span class="badge badge-verified">[${escapeHtml(label)}]</span>`;
  }
  if (rec === 'NEEDS_EVIDENCE') {
    return `<span class="badge badge-warn">[${escapeHtml(label)}]</span>`;
  }
  if (rec === 'HOLD_CONFLICTING_EVIDENCE' || rec === 'REJECT_WEAK_IDEA') {
    return `<span class="badge badge-danger">[${escapeHtml(label)}]</span>`;
  }
  return `<span class="badge badge-info">[${escapeHtml(label || rec)}]</span>`;
}

function renderEvidenceTierBadge(tier) {
  const label = t(`tier_${tier}`, {}, state.lang);
  if (tier === 'verified_evidence') {
    return `<span class="badge badge-verified">[${escapeHtml(label)}]</span>`;
  }
  if (tier === 'practitioner_observation') {
    return `<span class="badge badge-info">[${escapeHtml(label)}]</span>`;
  }
  if (tier === 'estimate') {
    return `<span class="badge badge-warn">[${escapeHtml(label)}]</span>`;
  }
  return `<span class="badge badge-danger">[${escapeHtml(label)}]</span>`;
}

function renderEvidenceCategoryBadge(category) {
  const label = t(`cat_${category}`, {}, state.lang);
  if (category === 'verified_commercial_commitment' || category === 'willingness_to_pay') {
    return `<span class="badge badge-verified">[${escapeHtml(label)}]</span>`;
  }
  if (category === 'unverified_willingness_to_pay') {
    return `<span class="badge badge-warn">[${escapeHtml(label)}]</span>`;
  }
  if (category === 'competitor_activity') {
    return `<span class="badge badge-warn">[${escapeHtml(label)}]</span>`;
  }
  if (category === 'market_demand') {
    return `<span class="badge badge-info">[${escapeHtml(label)}]</span>`;
  }
  return `<span class="badge badge-info">[${escapeHtml(label)}]</span>`;
}

function applyTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('straw_theme', theme);
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) {
    btn.textContent =
      theme === 'light'
        ? t('theme_light_to_dark', {}, state.lang)
        : t('theme_dark_to_light', {}, state.lang);
  }
}

function applyLanguage(lang) {
  state.lang = getSupportedLanguage(lang);
  localStorage.setItem('straw_lang', state.lang);

  const html = document.documentElement;
  html.setAttribute('lang', state.lang);
  html.setAttribute('dir', state.lang === 'ur' ? 'rtl' : 'ltr');

  // Update switcher button active states
  const btnEn = document.getElementById('lang-btn-en');
  const btnUr = document.getElementById('lang-btn-ur');
  if (btnEn) btnEn.classList.toggle('active', state.lang === 'en');
  if (btnUr) btnUr.classList.toggle('active', state.lang === 'ur');

  // Update static UI header & navigation labels
  const brandSub = document.getElementById('brand-subtitle-text');
  if (brandSub) brandSub.textContent = t('brand_subtitle', {}, state.lang);

  const pillAi = document.getElementById('pill-ai-mode');
  if (pillAi) pillAi.textContent = t('pill_ai_mode', {}, state.lang);

  const pillDir = document.getElementById('pill-direction');
  if (pillDir) pillDir.textContent = t('pill_budget', {}, state.lang);

  const helpNavBtn = document.getElementById('help-nav-btn');
  if (helpNavBtn) helpNavBtn.textContent = t('help_btn_label', {}, state.lang);

  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    themeBtn.textContent =
      state.theme === 'light'
        ? t('theme_light_to_dark', {}, state.lang)
        : t('theme_dark_to_light', {}, state.lang);
  }

  // Update navigation buttons
  const tabResearch = document.getElementById('tab-btn-research');
  if (tabResearch) tabResearch.innerHTML = t('nav_tab_research', {}, state.lang);

  const tabOpps = document.getElementById('tab-btn-opportunities');
  if (tabOpps) tabOpps.innerHTML = t('nav_tab_opportunities', {}, state.lang);

  const tabExec = document.getElementById('tab-btn-execution');
  if (tabExec) tabExec.innerHTML = t('nav_tab_execution', {}, state.lang);

  const tabAppr = document.getElementById('tab-btn-approvals');
  if (tabAppr) tabAppr.innerHTML = t('nav_tab_approvals', {}, state.lang);

  const tabHelp = document.getElementById('tab-btn-help');
  if (tabHelp) tabHelp.innerHTML = t('nav_tab_help', {}, state.lang);

  // Render ExplainTerm triggers inside headers
  const expV1 = document.getElementById('explain-v1-heading');
  if (expV1) expV1.innerHTML = renderExplainTerm('cat_problem_existence', state.lang);

  const expV1Run = document.getElementById('explain-v1-run');
  if (expV1Run) expV1Run.innerHTML = renderExplainTerm('source_adapter', state.lang);

  const expV1Src = document.getElementById('explain-v1-source');
  if (expV1Src) expV1Src.innerHTML = renderExplainTerm('source_adapter', state.lang);

  const expV1Ev = document.getElementById('explain-v1-evidence');
  if (expV1Ev) expV1Ev.innerHTML = renderExplainTerm('evidence_verification', state.lang);

  const expV2 = document.getElementById('explain-v2-heading');
  if (expV2) expV2.innerHTML = renderExplainTerm('score_separation', state.lang);

  const expV3 = document.getElementById('explain-v3-heading');
  if (expV3) expV3.innerHTML = renderExplainTerm('mvp_scope', state.lang);

  const expV4 = document.getElementById('explain-v4-heading');
  if (expV4) expV4.innerHTML = renderExplainTerm('approval_gate', state.lang);

  const expV4Gate = document.getElementById('explain-v4-gate');
  if (expV4Gate) expV4Gate.innerHTML = renderExplainTerm('approval_gate', state.lang);

  const expV4Cap = document.getElementById('explain-v4-cap');
  if (expV4Cap) expV4Cap.innerHTML = renderExplainTerm('capability_fit', state.lang);

  // Render Getting Started banner & Help Center
  renderGettingStarted();
  renderHelpCenter();

  // Re-render data-bound panels if dashboard is loaded
  if (state.dashboard) {
    renderHeaderStatus(state.dashboard);
    renderOverviewWorkspace(state.dashboard);
    renderOpportunitiesWorkspace(state.dashboard);
    renderResearchWorkspace(state.dashboard);
    renderExecutionWorkspace(state.dashboard);
    renderApprovalsWorkspace(state.dashboard);
    renderCapabilitiesWorkspace(state.dashboard);
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

function renderGettingStarted() {
  const container = document.getElementById('getting-started-container');
  if (!container) return;
  container.innerHTML = renderGettingStartedBanner(state.lang, state.gsCollapsed);
}

function renderHelpCenter() {
  const container = document.getElementById('help-center-container');
  if (!container) return;
  container.innerHTML = renderHelpCenterContent(state.lang, state.helpSection, state.helpSearch);
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
  renderApprovalsWorkspace(data);
  renderCapabilitiesWorkspace(data);
  renderHelpCenter();
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
    pillApprovals.textContent = t('pill_approvals', { count: data.summary_counts.pending_approvals }, state.lang);
  }
}

function renderOverviewWorkspace(data) {
  const kpiStrip = document.getElementById('overview-kpi-strip');
  const c = data.summary_counts;

  if (kpiStrip) {
    kpiStrip.innerHTML = `
      <div class="kpi-cell">
        <div class="kpi-label">${escapeHtml(t('kpi_opportunities_label', {}, state.lang))}</div>
        <div class="kpi-value">${c.total_opportunities}</div>
        <div class="kpi-sub">${escapeHtml(
          t('kpi_opportunities_sub', {
            approved: c.approved_opportunities,
            evaluating: c.evaluating_opportunities,
            rejected: c.rejected_opportunities
          }, state.lang)
        )}</div>
      </div>
      <div class="kpi-cell">
        <div class="kpi-label">${escapeHtml(t('kpi_products_label', {}, state.lang))}</div>
        <div class="kpi-value">${c.active_products}</div>
        <div class="kpi-sub">${escapeHtml(t('kpi_products_sub', {}, state.lang))}</div>
      </div>
      <div class="kpi-cell">
        <div class="kpi-label">${escapeHtml(t('kpi_approvals_label', {}, state.lang))}</div>
        <div class="kpi-value">${c.pending_approvals}</div>
        <div class="kpi-sub">${escapeHtml(t('kpi_approvals_sub', {}, state.lang))}</div>
      </div>
      <div class="kpi-cell">
        <div class="kpi-label">${escapeHtml(t('kpi_capabilities_label', {}, state.lang))}</div>
        <div class="kpi-value">${c.total_capabilities}</div>
        <div class="kpi-sub">${escapeHtml(t('kpi_capabilities_sub', {}, state.lang))}</div>
      </div>
      <div class="kpi-cell">
        <div class="kpi-label">${escapeHtml(t('kpi_memory_label', {}, state.lang))}</div>
        <div class="kpi-value">${c.intelligence_records}</div>
        <div class="kpi-sub">${escapeHtml(t('kpi_memory_sub', {}, state.lang))}</div>
      </div>
    `;
  }

  const oppTable = document.getElementById('overview-opportunities-table');
  if (oppTable) {
    oppTable.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>${escapeHtml(t('v2_th_idea', {}, state.lang))}</th>
            <th>${escapeHtml(t('v2_th_priority', {}, state.lang))} ${renderExplainTerm('priority_index', state.lang)}</th>
            <th>${escapeHtml(t('v2_th_commercial', {}, state.lang))} ${renderExplainTerm('commercial_readiness', state.lang)}</th>
            <th>${escapeHtml(t('v2_th_technical', {}, state.lang))} ${renderExplainTerm('technical_feasibility', state.lang)}</th>
            <th>${escapeHtml(t('v2_th_decision', {}, state.lang))}</th>
            <th>${escapeHtml(t('v2_th_action', {}, state.lang))}</th>
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
              </td>
              <td>
                <strong>${opp.commercial_readiness_score ?? 'N/A'}/100</strong>
                <div class="dossier-item-meta"><code>${escapeHtml(opp.commercial_validation_status || 'UNVERIFIED')}</code></div>
              </td>
              <td>
                <strong>${opp.technical_feasibility_score ?? 'N/A'}/100</strong>
                <div class="dossier-item-meta">Fit: ${opp.capability_fit_detail.fit_score}/10</div>
              </td>
              <td>
                ${renderRecommendationBadge(opp.recommendation)}
                <div class="dossier-item-meta" style="margin-top:3px;">
                  ${state.lang === 'ur' ? 'مسئلہ' : 'Prob'}: <strong>${eq.verified_problem_count || 0}</strong> ·
                  ${state.lang === 'ur' ? 'طلب' : 'Dem'}: <strong>${eq.verified_demand_count || 0}</strong> ·
                  ${state.lang === 'ur' ? 'حریف' : 'Comp'}: <strong>${eq.verified_competitor_count || 0}</strong> ·
                  ${state.lang === 'ur' ? 'ادائیگی' : 'WTP'}: <strong>${eq.verified_willingness_to_pay_count || 0}</strong>
                </div>
              </td>
              <td>
                <button type="button" class="btn btn-small" data-inspect-opp="${escapeHtml(opp.id)}">${escapeHtml(t('v2_btn_inspect', {}, state.lang))}</button>
              </td>
            </tr>
          `;
            })
            .join('')}
        </tbody>
      </table>
    `;
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
          <strong>${opp.overall_score}/100</strong>
        </div>
        <div class="dossier-item-meta">
          ${escapeHtml(opp.category)} · ${state.lang === 'ur' ? 'فروخت' : 'Comm'}: <strong>${opp.commercial_readiness_score}/100</strong> · ${state.lang === 'ur' ? 'بنانا' : 'Tech'}: <strong>${opp.technical_feasibility_score}/100</strong>
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
    detailPane.innerHTML = `<p>${escapeHtml(state.lang === 'ur' ? 'کوئی آئیڈیا منتخب نہیں کیا گیا۔' : 'No opportunity selected.')}</p>`;
    return;
  }

  const sb = selected.score_breakdown;
  const eq = selected.evidence_quality_summary || {};
  const warningsHtml = [
    ...(sb.blockers || []).map((b) => `<div class="badge badge-danger" style="display:block; margin-bottom:6px; white-space:normal;">[${state.lang === 'ur' ? 'روکاوٹ' : 'BLOCKER'}] ${escapeHtml(b)}</div>`),
    ...(sb.warnings || []).map((w) => `<div class="badge badge-warn" style="display:block; margin-bottom:6px; white-space:normal;">[${state.lang === 'ur' ? 'انتباہ' : 'WARNING'}] ${escapeHtml(w)}</div>`)
  ].join('');

  detailPane.innerHTML = `
    <div class="box-header">
      <div>
        <span class="mono">${escapeHtml(selected.category)} · ID: ${escapeHtml(selected.id)}</span>
        <h3 style="font-size: 17px; margin-top: 2px;">${escapeHtml(selected.title)}</h3>
      </div>
      <div style="text-align: end;">
        <div style="font-size: 20px; font-weight: 700;">
          ${escapeHtml(t('dossier_overall_score', {}, state.lang))}: ${selected.overall_score} / 100
          ${renderExplainTerm('priority_index', state.lang)}
        </div>
        <div class="dossier-item-meta" style="margin-bottom: 4px;">
          ${escapeHtml(t('dossier_commercial_score', {}, state.lang))}: <strong>${selected.commercial_readiness_score}/100</strong> ${renderExplainTerm('commercial_readiness', state.lang)} ·
          ${escapeHtml(t('dossier_technical_score', {}, state.lang))}: <strong>${selected.technical_feasibility_score}/100</strong> ${renderExplainTerm('technical_feasibility', state.lang)}
        </div>
        ${renderRecommendationBadge(selected.recommendation)}
      </div>
    </div>

    <div class="criteria-cell" style="margin-bottom: 12px;">
      <strong>${escapeHtml(t('dossier_rationale_heading', {}, state.lang))}</strong>
      <div class="dossier-item-meta" style="margin-bottom: 4px;">
        <em><strong>${escapeHtml(t('dossier_disclaimer_prefix', {}, state.lang))}</strong> ${escapeHtml(selected.score_disclaimer)}</em>
      </div>
      <div>${escapeHtml(selected.decision_rationale)}</div>
      <div style="margin-top: 6px;">${warningsHtml}</div>
    </div>

    <div class="criteria-grid" style="margin-bottom: 14px;">
      <div class="criteria-cell">
        <strong>${escapeHtml(t('dossier_cat1_title', {}, state.lang))} ${renderExplainTerm('cat_problem_existence', state.lang)}</strong>
        <div><strong>${eq.verified_problem_count || 0}</strong> ${escapeHtml(t('dossier_cat1_sub', {}, state.lang))}</div>
      </div>
      <div class="criteria-cell">
        <strong>${escapeHtml(t('dossier_cat2_title', {}, state.lang))} ${renderExplainTerm('cat_market_demand', state.lang)}</strong>
        <div><strong>${eq.verified_demand_count || 0}</strong> ${escapeHtml(t('dossier_cat2_sub', {}, state.lang))}</div>
      </div>
      <div class="criteria-cell">
        <strong>${escapeHtml(t('dossier_cat3_title', {}, state.lang))} ${renderExplainTerm('cat_competitor_activity', state.lang)}</strong>
        <div><strong>${eq.verified_competitor_count || 0}</strong> ${escapeHtml(t('dossier_cat3_sub', {}, state.lang))}</div>
      </div>
      <div class="criteria-cell">
        <strong>${escapeHtml(t('dossier_cat4_title', {}, state.lang))} ${renderExplainTerm('cat_unverified_wtp', state.lang)}</strong>
        <div><strong>${eq.verified_willingness_to_pay_count || 0}</strong> ${escapeHtml(t('dossier_cat4_sub', {}, state.lang))}</div>
        <div class="dossier-item-meta">Status: <code>${escapeHtml(selected.commercial_validation_status)}</code></div>
      </div>
    </div>

    <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px;">
      <button type="button" class="btn btn-small btn-primary" data-promote-opp="${escapeHtml(selected.id)}">${escapeHtml(t('dossier_btn_promote', {}, state.lang))}</button>
      <button type="button" class="btn btn-small btn-approve" data-opp-status="${escapeHtml(selected.id)}" data-status="approved">${escapeHtml(t('dossier_btn_approve', {}, state.lang))}</button>
      <button type="button" class="btn btn-small btn-secondary" data-opp-status="${escapeHtml(selected.id)}" data-status="evaluating">${escapeHtml(t('dossier_btn_hold', {}, state.lang))}</button>
      <button type="button" class="btn btn-small btn-reject" data-opp-status="${escapeHtml(selected.id)}" data-status="rejected">${escapeHtml(t('dossier_btn_reject', {}, state.lang))}</button>
      <a class="btn btn-small btn-secondary" href="/api/opportunities/${encodeURIComponent(selected.id)}/export?format=markdown" target="_blank" rel="noopener">${escapeHtml(t('dossier_btn_export', {}, state.lang))}</a>
    </div>

    <h4 class="sub-box-title">${escapeHtml(t('dossier_15_heading', {}, state.lang))}</h4>
    <div class="criteria-grid">
      <div class="criteria-cell"><strong>1. Problem Addressed [FACT]</strong>${escapeHtml(selected.problem_statement)}</div>
      <div class="criteria-cell"><strong>2. Target Customer [GUESS UNTIL PROVEN]</strong>${escapeHtml(selected.target_audience)}</div>
      <div class="criteria-cell"><strong>3. Evidence of Demand [EVIDENCE-BOUND]</strong>${escapeHtml(selected.demand_summary)}</div>
      <div class="criteria-cell"><strong>4. Existing Competitors [MARKET FACT]</strong>${escapeHtml(selected.competitors_summary)}</div>
      <div class="criteria-cell"><strong>5. Current Alternatives [WORKFLOW FACT]</strong>${escapeHtml(selected.alternatives_summary)}</div>
      <div class="criteria-cell"><strong>6. Market Gaps [ANALYSIS]</strong>${escapeHtml(selected.market_gaps)}</div>
      <div class="criteria-cell"><strong>7. Differentiation Potential [STRATEGY]</strong>${escapeHtml(selected.differentiation_potential)}</div>
      <div class="criteria-cell"><strong>8–10. Complexity &amp; Cost [ESTIMATE]</strong>Complexity: <code>${escapeHtml(selected.dev_complexity)}</code> · Days: <strong>${selected.estimated_dev_days}</strong> · Op Cost: <strong>$${selected.operational_cost_monthly_usd}/mo</strong></div>
      <div class="criteria-cell"><strong>11. Pricing Hypothesis [UNVERIFIED]</strong>${escapeHtml(selected.monetization_model)}</div>
      <div class="criteria-cell"><strong>12. Acquisition Strategy [HYPOTHESIS]</strong>${escapeHtml(selected.acquisition_strategy)}</div>
      <div class="criteria-cell"><strong>13. Revenue Potential [UNVERIFIED ASSUMPTION]</strong>${escapeHtml(selected.revenue_potential_notes)}</div>
      <div class="criteria-cell"><strong>14. Main Risks [ANALYSIS]</strong>${escapeHtml(selected.main_risks)}</div>
      <div class="criteria-cell">
        <strong>15. Your Skill Match [${selected.capability_fit_detail.fit_score}/10] ${renderExplainTerm('capability_fit', state.lang)}</strong>
        ${escapeHtml(selected.capability_fit_detail.summary)}
        <div class="dossier-item-meta" style="margin-top:4px;">Difficulty: ${escapeHtml(selected.capability_fit_detail.execution_difficulty)}</div>
      </div>
    </div>

    <h4 class="sub-box-title">${escapeHtml(t('dossier_11_heading', {}, state.lang))}</h4>
    <table class="data-table">
      <thead>
        <tr>
          <th>${escapeHtml(t('dossier_th_dim', {}, state.lang))}</th>
          <th>${escapeHtml(t('dossier_th_group', {}, state.lang))}</th>
          <th>${escapeHtml(t('dossier_th_weight', {}, state.lang))}</th>
          <th>${escapeHtml(t('dossier_th_score10', {}, state.lang))}</th>
          <th>${escapeHtml(t('dossier_th_pts', {}, state.lang))}</th>
          <th>${escapeHtml(t('dossier_th_why', {}, state.lang))}</th>
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
    <h4 class="sub-box-title">${escapeHtml(
      t('dossier_ev_heading', {
        count: selected.evidence.length,
        conf: Math.round((selected.evidence_quality_summary?.average_confidence_score || 0) * 100)
      }, state.lang)
    )}</h4>
    <table class="data-table" style="margin-bottom: 12px;">
      <thead>
        <tr>
          <th>Tier, Category &amp; Status</th>
          <th>Stance &amp; Trust</th>
          <th>Fact Claim &amp; Direct Quote</th>
          <th>Source Website &amp; SHA-256</th>
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
              <div class="dossier-item-meta" style="margin-top:3px;">Status: <code>${escapeHtml(ev.verification_status || 'verified')}</code></div>
            </td>
            <td>
              <span class="badge ${ev.stance === 'contradicting' ? 'badge-danger' : 'badge-info'}">[${escapeHtml((ev.stance || 'supporting').toUpperCase())}]</span>
              <div class="dossier-item-meta" style="margin-top:3px;">Trust: <strong>${Math.round((ev.confidence_score || 0.35) * 100)}%</strong></div>
            </td>
            <td>
              <strong>[${escapeHtml(ev.claim_type)}]</strong> ${escapeHtml(ev.statement)}
              ${ev.supporting_excerpt ? `<div class="dossier-item-meta" style="margin-top:3px;"><em>Excerpt:</em> "${escapeHtml(ev.supporting_excerpt)}"</div>` : ''}
              ${ev.verification_notes ? `<div class="dossier-item-meta" style="margin-top:2px;"><em>QC:</em> ${escapeHtml(ev.verification_notes)}</div>` : ''}
            </td>
            <td class="dossier-item-meta">
              <div><strong>${escapeHtml(ev.source_name || 'Source')}</strong></div>
              ${ev.source_url ? `<div><a href="${escapeHtml(ev.source_url)}" target="_blank" rel="noopener">${escapeHtml(ev.source_url)}</a></div>` : `<div>${escapeHtml(ev.source_citation)}</div>`}
              ${ev.source_content_hash ? `<div>SHA-256: <code>${escapeHtml(ev.source_content_hash.slice(0, 12))}...</code></div>` : ''}
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
          <label for="ev-tier-select">Evidence Tier ${renderExplainTerm('evidence_tiers', state.lang)}</label>
          <select id="ev-tier-select" name="evidence_tier">
            <option value="verified_evidence">Verified Web Proof (Requires https:// URL &amp; Excerpt)</option>
            <option value="practitioner_observation">Personal Work Observation</option>
            <option value="estimate">Rough Estimate</option>
            <option value="assumption">Unproven Guess</option>
          </select>
        </div>
        <div class="form-group">
          <label for="ev-stance-select">Evidence Stance</label>
          <select id="ev-stance-select" name="stance">
            <option value="supporting" selected>Supporting Viability</option>
            <option value="contradicting">Contradicting / Counterevidence</option>
            <option value="neutral">Neutral Observation</option>
          </select>
        </div>
      </div>
      <div class="form-row-3">
        <div class="form-group">
          <label for="ev-url-input">Source URL (https:// Required for Verified)</label>
          <input type="text" id="ev-url-input" name="source_url" placeholder="https://..." />
        </div>
        <div class="form-group">
          <label for="ev-source-input">Source Name (Required)</label>
          <input type="text" id="ev-source-input" name="source_citation" required placeholder="e.g., WordPress Plugin Directory" />
        </div>
        <div class="form-group">
          <label for="ev-pub-date">Date Published (YYYY-MM-DD)</label>
          <input type="text" id="ev-pub-date" name="published_at" placeholder="2026-10-15" />
        </div>
      </div>
      <div class="form-row-2">
        <div class="form-group">
          <label for="ev-statement-input">Factual Observation Statement (Required)</label>
          <input type="text" id="ev-statement-input" name="statement" required placeholder="State the factual observation clearly" />
        </div>
        <div class="form-group">
          <label for="ev-excerpt-input">Direct Excerpt from Web Page (&ge;15 chars for Verified)</label>
          <input type="text" id="ev-excerpt-input" name="supporting_excerpt" placeholder="Exact quote from the website" />
        </div>
      </div>
      <button type="submit" class="btn btn-secondary btn-small">${escapeHtml(t('dossier_ev_add_btn', {}, state.lang))}</button>
    </form>

    <hr class="structural-divider" />
    <h4 class="sub-box-title">${escapeHtml(t('dossier_comp_heading', { count: (selected.competitors || []).length }, state.lang))}</h4>
    <table class="data-table" style="margin-bottom: 12px;">
      <thead>
        <tr>
          <th>Competitor &amp; Pricing</th>
          <th>Threat</th>
          <th>Evidence Tier</th>
          <th>Strengths vs. Gaps We Exploit</th>
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
          <label for="comp-strengths-input">Competitor Strengths</label>
          <input type="text" id="comp-strengths-input" name="strengths" required placeholder="Brand recognition or existing distribution" />
        </div>
        <div class="form-group">
          <label for="comp-gaps-input">Weaknesses &amp; Gaps We Can Win On (Required)</label>
          <input type="text" id="comp-gaps-input" name="weaknesses_and_gaps" required placeholder="Clunky UX, slow performance or missing feature" />
        </div>
      </div>
      <button type="submit" class="btn btn-secondary btn-small">${escapeHtml(t('dossier_comp_add_btn', {}, state.lang))}</button>
    </form>
  `;
}

function renderResearchWorkspace(data) {
  const oppSelect = document.getElementById('run-opp-select');
  const sourceSelect = document.getElementById('run-source-select');

  if (oppSelect) {
    oppSelect.innerHTML =
      `<option value="">${escapeHtml(t('v1_run_opp_standalone', {}, state.lang))}</option>` +
      data.opportunities
        .map((o) => `<option value="${escapeHtml(o.id)}">${escapeHtml(o.title)}</option>`)
        .join('');
  }

  if (sourceSelect) {
    sourceSelect.innerHTML = (data.research_sources || [])
      .map(
        (s) =>
          `<option value="${escapeHtml(s.id)}">${escapeHtml(s.name)} (${s.is_paid_service ? 'PAID / LOCKED' : 'Free Public ($0)'})</option>`
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
            <th>${escapeHtml(t('v1_th_source_name', {}, state.lang))}</th>
            <th>${escapeHtml(t('v1_th_source_status', {}, state.lang))}</th>
            <th>${escapeHtml(t('v1_th_source_data', {}, state.lang))}</th>
            <th>${escapeHtml(t('v1_th_source_limits', {}, state.lang))}</th>
          </tr>
        </thead>
        <tbody>
          ${matrix
            .map(
              (s) => `
            <tr>
              <td>
                <strong>${escapeHtml(s.source_name)}</strong>
                <div class="dossier-item-meta">Adapter: <code>${escapeHtml(s.adapter_key)}</code> · Trust: <strong>${Math.round(s.base_reliability_score * 100)}%</strong></div>
              </td>
              <td>
                <span class="badge ${s.implemented ? 'badge-verified' : 'badge-danger'}">
                  [${s.implemented ? 'READY' : 'UNSUPPORTED'}]
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
      runsList.innerHTML = `<p class="dossier-item-meta">${escapeHtml(t('v1_runs_empty', {}, state.lang))}</p>`;
    } else {
      runsList.innerHTML = runs
        .map(
          (r) => `
        <div class="criteria-cell" style="margin-bottom: 8px;">
          <strong>[${escapeHtml(r.status.toUpperCase())}] Query: "${escapeHtml(r.query_topic)}" (${escapeHtml(r.started_at.slice(0, 10))})</strong>
          <div class="dossier-item-meta">
            Sources: ${escapeHtml((r.sources_queried || []).join(', '))} ·
            Findings Stored: <strong>${r.findings_created_count}</strong> ·
            Duplicates Skipped: <strong>${r.duplicates_skipped_count}</strong>
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
            <th>${escapeHtml(t('v1_th_ev_opp', {}, state.lang))}</th>
            <th>${escapeHtml(t('v1_th_ev_tier', {}, state.lang))}</th>
            <th>${escapeHtml(t('v1_th_ev_conf', {}, state.lang))}</th>
            <th>${escapeHtml(t('v1_th_ev_claim', {}, state.lang))}</th>
            <th>${escapeHtml(t('v1_th_ev_actions', {}, state.lang))}</th>
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
              </td>
              <td>
                <strong>${Math.round((ev.confidence_score || 0.35) * 100)}%</strong>
                <div class="dossier-item-meta">Rel: ${ev.source_reliability_score}</div>
                ${ev.http_status ? `<div class="dossier-item-meta">HTTP: <code>${ev.http_status}</code> · SHA: <code>${escapeHtml((ev.source_content_hash || '').slice(0, 10))}...</code></div>` : ''}
              </td>
              <td>
                <div>${escapeHtml(ev.statement)}</div>
                ${ev.supporting_excerpt ? `<div class="dossier-item-meta"><em>Quote:</em> "${escapeHtml(ev.supporting_excerpt)}"</div>` : ''}
                <div class="dossier-item-meta">
                  Source: <strong>${escapeHtml(ev.source_name)}</strong>
                  ${ev.source_url ? `(<a href="${escapeHtml(ev.source_url)}" target="_blank" rel="noopener">${escapeHtml(ev.source_url)}</a>)` : ''}
                </div>
              </td>
              <td>
                ${ev.source_url ? `<button type="button" class="btn btn-small btn-secondary" data-verify-http-ev="${escapeHtml(ev.id)}" style="margin-bottom:4px;">${escapeHtml(t('v1_btn_verify_http', {}, state.lang))}</button>` : ''}
                <button type="button" class="btn btn-small btn-approve" data-review-ev="${escapeHtml(ev.id)}" data-ev-status="verified">${escapeHtml(t('v1_btn_mark_verified', {}, state.lang))}</button>
                <button type="button" class="btn btn-small btn-reject" data-review-ev="${escapeHtml(ev.id)}" data-ev-status="rejected">${escapeHtml(t('v1_btn_mark_rejected', {}, state.lang))}</button>
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
    container.innerHTML = `<div class="ledger-box"><p>${escapeHtml(t('v3_empty_products', {}, state.lang))}</p></div>`;
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
        <div style="text-align: end;">
          <div style="font-size: 22px; font-weight: 700;">${product.completion_pct}% ${state.lang === 'ur' ? 'مکمل' : 'Completed'}</div>
          <span class="badge badge-info">[STAGE ${product.current_stage_number}/15: ${escapeHtml(product.current_stage_name.toUpperCase())}]</span>
        </div>
      </div>

      <div class="score-meter" style="height: 10px; margin-bottom: 12px;">
        <div class="score-meter-fill" style="width: ${product.completion_pct}%"></div>
      </div>

      <h4 class="sub-box-title">${escapeHtml(t('v3_blueprint_heading', {}, state.lang))}</h4>
      <div class="criteria-grid" style="margin-bottom: 14px;">
        <div class="criteria-cell">
          <strong>${escapeHtml(t('v3_cell_customer', {}, state.lang))}</strong>
          <div>${escapeHtml(product.target_audience)}</div>
        </div>
        <div class="criteria-cell">
          <strong>${escapeHtml(t('v3_cell_must_have', {}, state.lang))} ${renderExplainTerm('mvp_scope', state.lang)}</strong>
          <div>${escapeHtml(product.mvp_must_have_features)}</div>
        </div>
        <div class="criteria-cell">
          <strong>${escapeHtml(t('v3_cell_excluded', {}, state.lang))} ${renderExplainTerm('excluded_scope', state.lang)}</strong>
          <div>${escapeHtml(product.mvp_excluded_scope)}</div>
        </div>
        <div class="criteria-cell">
          <strong>${escapeHtml(t('v3_cell_pricing', {}, state.lang))}</strong>
          <div>${escapeHtml(product.pricing_hypothesis)}</div>
        </div>
        <div class="criteria-cell" style="grid-column: 1 / -1;">
          <strong>${escapeHtml(t('v3_cell_validation', {}, state.lang))} ${renderExplainTerm('buyer_validation_criteria', state.lang)}</strong>
          <div>${escapeHtml(product.buyer_validation_criteria)}</div>
        </div>
      </div>

      <details style="margin-top: 12px;">
        <summary style="cursor: pointer; font-weight: 600; padding: 6px 0;">
          ${escapeHtml(t('v3_edit_summary', {}, state.lang))}
        </summary>
        <form id="form-update-mvp-plan" data-prod-id="${escapeHtml(product.id)}" class="structured-form" style="margin-top: 10px;">
          <div class="form-row-2">
            <div class="form-group">
              <label for="mvp-target-audience">${escapeHtml(t('v3_cell_customer', {}, state.lang))}</label>
              <input type="text" id="mvp-target-audience" name="target_audience" value="${escapeHtml(product.target_audience)}" required />
            </div>
            <div class="form-group">
              <label for="mvp-pricing-hyp">${escapeHtml(t('v3_cell_pricing', {}, state.lang))}</label>
              <input type="text" id="mvp-pricing-hyp" name="pricing_hypothesis" value="${escapeHtml(product.pricing_hypothesis)}" required />
            </div>
          </div>
          <div class="form-group">
            <label for="mvp-must-have">${escapeHtml(t('v3_cell_must_have', {}, state.lang))}</label>
            <textarea id="mvp-must-have" name="mvp_must_have_features" rows="2" required>${escapeHtml(product.mvp_must_have_features)}</textarea>
          </div>
          <div class="form-group">
            <label for="mvp-excluded">${escapeHtml(t('v3_cell_excluded', {}, state.lang))}</label>
            <textarea id="mvp-excluded" name="mvp_excluded_scope" rows="2" required>${escapeHtml(product.mvp_excluded_scope)}</textarea>
          </div>
          <div class="form-group">
            <label for="mvp-validation-criteria">${escapeHtml(t('v3_cell_validation', {}, state.lang))}</label>
            <textarea id="mvp-validation-criteria" name="buyer_validation_criteria" rows="2" required>${escapeHtml(product.buyer_validation_criteria)}</textarea>
          </div>
          <button type="submit" class="btn btn-primary btn-small">${escapeHtml(t('v3_save_plan_btn', {}, state.lang))}</button>
        </form>
      </details>
    </div>

    <div class="ledger-box">
      <div class="box-header">
        <h3>${escapeHtml(t('v3_roadmap_heading', {}, state.lang))}</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Stage</th>
            <th>Task &amp; Goal</th>
            <th>Effort (Est / Logged)</th>
            <th>Acceptance Criteria</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${product.tasks
            .map(
              (tItem) => `
            <tr>
              <td>
                <strong>Stage ${tItem.stage_number}</strong>
                <div class="dossier-item-meta">${escapeHtml(tItem.stage_name)}</div>
              </td>
              <td>
                <strong>${escapeHtml(tItem.title)}</strong>
                <div class="dossier-item-meta">${escapeHtml(tItem.milestone_name)}</div>
              </td>
              <td class="mono">${tItem.estimated_hours}h / ${tItem.actual_hours}h</td>
              <td class="dossier-item-meta">${escapeHtml(tItem.acceptance_criteria)}</td>
              <td>
                <select class="task-status-select" data-task-id="${escapeHtml(tItem.id)}" data-est="${tItem.estimated_hours}">
                  <option value="todo" ${tItem.status === 'todo' ? 'selected' : ''}>To Do</option>
                  <option value="in_progress" ${tItem.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                  <option value="blocked" ${tItem.status === 'blocked' ? 'selected' : ''}>Blocked</option>
                  <option value="done" ${tItem.status === 'done' ? 'selected' : ''}>Done</option>
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

function renderApprovalsWorkspace(data) {
  const listEl = document.getElementById('approvals-queue-list');
  if (!listEl) return;

  listEl.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Status</th>
          <th>Cost</th>
          <th>Action Title &amp; Risk Notes</th>
          <th>Your Decision</th>
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
              }">[${escapeHtml(req.status.toUpperCase())}]</span>
            </td>
            <td>
              <strong>$${req.financial_commitment_usd} USD</strong>
              <div class="dossier-item-meta"><code>${escapeHtml(req.action_category)}</code></div>
            </td>
            <td>
              <strong>${escapeHtml(req.title)}</strong>
              <div class="dossier-item-meta">${escapeHtml(req.description)}</div>
            </td>
            <td>
              ${
                req.status === 'pending'
                  ? `
                <button type="button" class="btn btn-small btn-approve" data-decide-appr="${escapeHtml(req.id)}" data-decision="approved">${state.lang === 'ur' ? 'منظور کریں' : 'Approve'}</button>
                <button type="button" class="btn btn-small btn-reject" data-decide-appr="${escapeHtml(req.id)}" data-decision="rejected">${state.lang === 'ur' ? 'مسترد کریں' : 'Reject'}</button>
              `
                  : `<span class="mono">Decided: ${escapeHtml((req.decided_at || '').slice(0, 10))}</span>`
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
  if (profileCard) {
    profileCard.innerHTML = `
      <div class="criteria-cell" style="margin-bottom: 12px;">
        <strong>Direction: ${escapeHtml(p.primary_direction)}</strong>
        <div style="margin-top: 4px;">${escapeHtml(p.engineering_constraint_summary)}</div>
      </div>
    `;
  }

  const capTable = document.getElementById('capabilities-matrix-table');
  if (capTable) {
    capTable.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Skill Name</th>
            <th>Category</th>
            <th>Proficiency</th>
            <th>Leverage Notes</th>
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
              <td class="dossier-item-meta">${escapeHtml(cap.notes)}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `;
  }

  const biList = document.getElementById('intelligence-memory-list');
  if (biList) {
    biList.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Title &amp; Summary</th>
            <th>Future Recommendation Note</th>
          </tr>
        </thead>
        <tbody>
          ${data.recent_intelligence
            .map(
              (entry) => `
            <tr>
              <td><code>${escapeHtml(entry.entry_type)}</code></td>
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
}

// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
  applyTheme(state.theme);
  applyLanguage(state.lang);

  // Appearance & Language controls
  document.getElementById('theme-toggle-btn').addEventListener('click', () => {
    applyTheme(state.theme === 'light' ? 'dark' : 'light');
  });

  document.getElementById('lang-btn-en').addEventListener('click', () => {
    applyLanguage('en');
    showFeedback(t('fb_lang_switched', {}, 'en'));
  });

  document.getElementById('lang-btn-ur').addEventListener('click', () => {
    applyLanguage('ur');
    showFeedback(t('fb_lang_switched', {}, 'ur'));
  });

  document.querySelectorAll('.nav-tab').forEach((btn) => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Global event delegation
  document.body.addEventListener('click', async (e) => {
    // ExplainTerm toggle
    const explainBtn = e.target.closest('[data-explain-toggle]');
    if (explainBtn) {
      const wrapper = explainBtn.closest('.explain-term-wrapper');
      const card = wrapper ? wrapper.querySelector('.explain-term-card') : null;
      if (card) {
        const isHidden = card.classList.contains('hidden');
        card.classList.toggle('hidden', !isHidden);
        explainBtn.setAttribute('aria-expanded', String(isHidden));
      }
      return;
    }

    // Getting Started banner toggle
    const gsToggle = e.target.closest('[data-gs-toggle]');
    if (gsToggle) {
      const mode = gsToggle.dataset.gsToggle;
      state.gsCollapsed = mode === 'collapse';
      localStorage.setItem('straw_gs_collapsed', String(state.gsCollapsed));
      renderGettingStarted();
      return;
    }

    // Help topic switch
    const helpBtn = e.target.closest('[data-help-topic]');
    if (helpBtn) {
      state.helpSection = helpBtn.dataset.helpTopic;
      renderHelpCenter();
      return;
    }

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
            newStatus === 'rejected' ? 'Rejected by owner after evaluating evidence.' : ''
        })
      });
      showFeedback(t('fb_opp_status', { status: newStatus.toUpperCase() }, state.lang));
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
      showFeedback(t('fb_opp_promoted', { name: res.product.name }, state.lang));
      await loadDashboard();
      switchTab('execution');
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
          owner_decision_notes: `Owner marked ${decision} via Command Workspace.`
        })
      });
      showFeedback(t('fb_appr_decided', { decision: decision.toUpperCase() }, state.lang));
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
          t('fb_http_verified', {
            status: res.evidence.verification_status.toUpperCase(),
            method: res.evidence.verification_method
          }, state.lang)
        );
        await loadDashboard();
      } catch (err) {
        showFeedback(`Source Verification Failed: ${err.message}`);
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
            reviewer_notes: `Owner set status to ${evStatus}.`
          })
        });
        showFeedback(t('fb_ev_reviewed', { status: evStatus.toUpperCase() }, state.lang));
        await loadDashboard();
      } catch (err) {
        showFeedback(`Verification Blocked: ${err.message}`);
      }
    }
  });

  // Inputs and change listeners
  document.body.addEventListener('input', (e) => {
    if (e.target.id === 'help-search-input') {
      state.helpSearch = e.target.value;
      renderHelpCenter();
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
      showFeedback(t('fb_task_updated', { status: newStatus.toUpperCase() }, state.lang));
      await loadDashboard();
    }
  });

  // Form submissions
  document.body.addEventListener('submit', async (e) => {
    if (e.target.id === 'form-new-opportunity') {
      e.preventDefault();
      const fd = new FormData(e.target);
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
          estimated_dev_days: Number(fd.get('estimated_dev_days') || 14),
          operational_cost_monthly_usd: Number(fd.get('operational_cost_monthly_usd') || 0),
          monetization_model: fd.get('monetization_model'),
          acquisition_strategy: fd.get('acquisition_strategy'),
          revenue_potential_notes: fd.get('revenue_potential_notes'),
          main_risks: fd.get('main_risks'),
          evidence
        })
      });

      state.selectedOpportunityId = res.opportunity.id;
      e.target.reset();
      showFeedback(
        t('fb_opp_created', {
          title: res.opportunity.title,
          score: res.opportunity.overall_score,
          rec: res.opportunity.recommendation
        }, state.lang)
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
          t('fb_ev_added', {
            tier: res.evidence.evidence_tier.toUpperCase(),
            status: res.evidence.verification_status,
            score: res.opportunity.overall_score
          }, state.lang)
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
      showFeedback(
        t('fb_run_done', {
          query: res.run.query_topic,
          status: res.run.status.toUpperCase()
        }, state.lang)
      );
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
      showFeedback(t('fb_comp_added', {}, state.lang));
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
      showFeedback(t('fb_mvp_saved', {}, state.lang));
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
      showFeedback(t('fb_appr_created', {}, state.lang));
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
      showFeedback(t('fb_cap_saved', {}, state.lang));
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
      showFeedback(t('fb_bi_saved', {}, state.lang));
      await loadDashboard();
    }
  });

  loadDashboard();
});
