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
  helpSearch: '',
  detailSubtab: 'overview'
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
    const sun = btn.querySelector('.theme-icon.sun');
    const moon = btn.querySelector('.theme-icon.moon');
    if (sun && moon) {
      sun.classList.toggle('active', theme === 'light');
      moon.classList.toggle('active', theme === 'dark');
    } else {
      btn.textContent =
        theme === 'light'
          ? t('theme_light_to_dark', {}, state.lang)
          : t('theme_dark_to_light', {}, state.lang);
    }
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
  if (pillAi) {
    pillAi.innerHTML = `<span class="pill-dot green"></span> ${escapeHtml(state.lang === 'ur' ? 'محفوظ لوکل موڈ' : 'Safe Local Mode')}`;
  }

  const pillDir = document.getElementById('pill-direction');
  if (pillDir) {
    pillDir.textContent = state.lang === 'ur' ? '$0 خرچ کا اصول' : '$0 Spend Rule';
  }

  const helpNavBtn = document.getElementById('help-nav-btn');
  if (helpNavBtn) helpNavBtn.textContent = t('help_btn_label', {}, state.lang);

  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn && !themeBtn.querySelector('.theme-icon')) {
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
  document.querySelectorAll('.sidebar-nav-item').forEach((btn) => {
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

function getOpportunityVisuals(category, index = 0) {
  const cat = (category || '').toLowerCase();
  if (cat.includes('marketplace') || cat.includes('ecommerce') || cat.includes('commerce') || cat.includes('store') || cat.includes('local')) {
    return {
      colorClass: 'opp-icon-orange',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>'
    };
  }
  if (cat.includes('health') || cat.includes('well') || cat.includes('fitness') || cat.includes('medical') || cat.includes('remote')) {
    return {
      colorClass: 'opp-icon-purple',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>'
    };
  }
  if (cat.includes('learn') || cat.includes('education') || cat.includes('skill') || cat.includes('academy') || cat.includes('course')) {
    return {
      colorClass: 'opp-icon-blue',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>'
    };
  }
  if (cat.includes('sustain') || cat.includes('green') || cat.includes('eco') || cat.includes('energy') || cat.includes('living')) {
    return {
      colorClass: 'opp-icon-green',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>'
    };
  }
  // Palette rotation
  const palette = [
    {
      colorClass: 'opp-icon-orange',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>'
    },
    {
      colorClass: 'opp-icon-purple',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>'
    },
    {
      colorClass: 'opp-icon-blue',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>'
    },
    {
      colorClass: 'opp-icon-green',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>'
    },
    {
      colorClass: 'opp-icon-amber',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>'
    }
  ];
  return palette[index % palette.length];
}

function renderHeaderStatus(data) {
  const pillApprovals = document.getElementById('pill-approvals');
  if (pillApprovals) {
    const count = data.summary_counts ? data.summary_counts.pending_approvals : 0;
    pillApprovals.innerHTML = `<span class="pill-number">${count}</span> ${escapeHtml(state.lang === 'ur' ? 'زیر التواء منظوری' : 'Pending Approvals')}`;
  }
  const skillsCount = document.getElementById('sidebar-skills-count');
  if (skillsCount) {
    const total = data.owner && data.owner.capabilities ? data.owner.capabilities.length : 10;
    skillsCount.textContent = `${total} / 10 Skills`;
  }
}

function renderOverviewWorkspace(data) {
  const kpiStrip = document.getElementById('overview-kpi-strip');
  const c = data.summary_counts;
  const opps = data.opportunities || [];
  const avgScore = opps.length ? Math.round(opps.reduce((acc, o) => acc + o.overall_score, 0) / opps.length) : 78;

  if (kpiStrip) {
    kpiStrip.innerHTML = `
      <!-- Card 1: New Opportunities (Orange) -->
      <div class="kpi-card kpi-orange">
        <div class="kpi-card-left">
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
          </div>
          <div class="kpi-info">
            <div class="kpi-value">${c.total_opportunities || 12}</div>
            <div class="kpi-label">${state.lang === 'ur' ? 'نئے مواقع' : 'New Opportunities'}</div>
            <div class="kpi-trend">&uarr; +2 this week</div>
          </div>
        </div>
        <svg class="kpi-sparkline" viewBox="0 0 90 36" fill="none">
          <path d="M2 26C16 26 24 16 38 20C52 24 64 6 88 8" stroke="#EB5A28" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      </div>

      <!-- Card 2: Avg. Market Score (Blue) -->
      <div class="kpi-card kpi-blue">
        <div class="kpi-card-left">
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          </div>
          <div class="kpi-info">
            <div class="kpi-value">${avgScore}%</div>
            <div class="kpi-label">${state.lang === 'ur' ? 'اوسط مارکیٹ اسکور' : 'Avg. Market Score'}</div>
            <div class="kpi-trend">&uarr; +5%</div>
          </div>
        </div>
        <svg class="kpi-sparkline" viewBox="0 0 90 36" fill="none">
          <path d="M2 28C18 28 26 18 42 22C58 26 68 8 88 12" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      </div>

      <!-- Card 3: Ready for MVP (Green) -->
      <div class="kpi-card kpi-green">
        <div class="kpi-card-left">
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div class="kpi-info">
            <div class="kpi-value">${c.approved_opportunities || 3}</div>
            <div class="kpi-label">${state.lang === 'ur' ? 'ایم وی پی کے لیے تیار' : 'Ready for MVP'}</div>
            <div class="kpi-trend">&uarr; +1</div>
          </div>
        </div>
        <svg class="kpi-sparkline" viewBox="0 0 90 36" fill="none">
          <path d="M2 30C14 30 24 22 38 24C52 26 62 10 88 6" stroke="#16A34A" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      </div>

      <!-- Card 4: Require Review (Purple) -->
      <div class="kpi-card kpi-purple">
        <div class="kpi-card-left">
          <div class="kpi-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div class="kpi-info">
            <div class="kpi-value">${c.pending_approvals || 5}</div>
            <div class="kpi-label">${state.lang === 'ur' ? 'جائزہ درکار ہے' : 'Require Review'}</div>
            <div class="kpi-trend purple" data-goto-tab="approvals">&rarr; ${state.lang === 'ur' ? 'تمام دیکھیں' : 'View All'}</div>
          </div>
        </div>
        <svg class="kpi-sparkline" viewBox="0 0 90 36" fill="none">
          <path d="M2 22C16 22 26 30 42 20C58 10 68 28 88 14" stroke="#7C3AED" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
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

  if (listContainer) {
    listContainer.innerHTML = filtered
      .map((opp, idx) => {
        const visual = getOpportunityVisuals(opp.category, idx);
        const isSelected = opp.id === state.selectedOpportunityId;
        const score = Math.round(opp.overall_score);
        const scoreClass = score >= 75 ? 'score-high' : 'score-med';
        const sourceLabel = opp.initial_evidence_source ? opp.initial_evidence_source.replace(/^https?:\/\/(www\.)?([^/]+).*/i, '$2') : (opp.category || 'Discovery Source');
        return `
          <div class="opportunity-card-item ${isSelected ? 'selected' : ''}" data-select-opp="${escapeHtml(opp.id)}">
            <div class="opp-left-cluster">
              <div class="opp-icon-box ${visual.colorClass}">
                ${visual.svg}
              </div>
              <div class="opp-text-info">
                <span class="opp-card-title">${escapeHtml(opp.title)}</span>
                <span class="opp-card-sub">${escapeHtml(sourceLabel)} · 2 days ago</span>
              </div>
            </div>
            <div class="opp-right-cluster">
              <span class="opp-score-pill ${scoreClass}">${score}%</span>
              <span class="opp-chevron">&rsaquo;</span>
            </div>
          </div>
        `;
      })
      .join('');
  }

  const selected =
    data.opportunities.find((o) => o.id === state.selectedOpportunityId) ||
    filtered[0] ||
    data.opportunities[0];

  const detailPane = document.getElementById('opportunity-detail-pane');
  if (!detailPane) return;

  if (!selected) {
    detailPane.innerHTML = `<p>${escapeHtml(state.lang === 'ur' ? 'کوئی آئیڈیا منتخب نہیں کیا گیا۔' : 'No opportunity selected.')}</p>`;
    return;
  }

  const visual = getOpportunityVisuals(selected.category, 0);
  const overallScore = Math.round(selected.overall_score);
  const commScore = Math.round(selected.commercial_readiness_score || 85);
  const techScore = Math.round(selected.technical_feasibility_score || 83);
  const demandScore = Math.min(99, Math.round(commScore * 1.08));
  const riskBadgeClass = selected.dev_complexity === 'low' ? 'score-high' : (selected.dev_complexity === 'extreme' ? 'badge-danger' : 'score-med');
  const riskLabel = selected.dev_complexity === 'low' ? 'Low' : (selected.dev_complexity === 'extreme' ? 'High' : 'Moderate');

  const sb = selected.score_breakdown || {};
  const eq = selected.evidence_quality_summary || {};
  const warningsHtml = [
    ...(sb.blockers || []).map((b) => `<div class="badge badge-danger" style="display:block; margin-bottom:6px; white-space:normal;">[${state.lang === 'ur' ? 'روکاوٹ' : 'BLOCKER'}] ${escapeHtml(b)}</div>`),
    ...(sb.warnings || []).map((w) => `<div class="badge badge-warn" style="display:block; margin-bottom:6px; white-space:normal;">[${state.lang === 'ur' ? 'انتباہ' : 'WARNING'}] ${escapeHtml(w)}</div>`)
  ].join('');

  const subtabsHtml = `
    <div class="detail-subtabs" role="tablist">
      <button type="button" class="subtab-btn ${state.detailSubtab === 'overview' ? 'active' : ''}" data-detail-tab="overview">
        ${state.lang === 'ur' ? 'جائزہ' : 'Overview'}
      </button>
      <button type="button" class="subtab-btn ${state.detailSubtab === 'evidence' ? 'active' : ''}" data-detail-tab="evidence">
        ${state.lang === 'ur' ? 'مارکیٹ شواہد' : 'Market Evidence'}
      </button>
      <button type="button" class="subtab-btn ${state.detailSubtab === 'competitors' ? 'active' : ''}" data-detail-tab="competitors">
        ${state.lang === 'ur' ? 'حریف' : 'Competitors'}
      </button>
      <button type="button" class="subtab-btn ${state.detailSubtab === 'analysis' ? 'active' : ''}" data-detail-tab="analysis">
        ${state.lang === 'ur' ? 'تجزیہ' : 'Analysis'}
      </button>
      <button type="button" class="subtab-btn ${state.detailSubtab === 'mvp' ? 'active' : ''}" data-detail-tab="mvp">
        ${state.lang === 'ur' ? 'ایم وی پی پلان' : 'MVP Plan'}
      </button>
    </div>
  `;

  // Overview Tab Content
  const overviewHtml = `
    <div class="overview-split-grid">
      <!-- Business Potential -->
      <div>
        <div class="overview-col-title">${state.lang === 'ur' ? 'کاروباری صلاحیت' : 'Business Potential'}</div>
        <div class="business-potential-wrap">
          <div class="gauge-wrap">
            <svg class="gauge-svg" width="120" height="120" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border-color)" stroke-width="8" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="#10b981" stroke-width="8" stroke-dasharray="264" stroke-dashoffset="${Math.max(0, 264 - (264 * overallScore / 100))}" stroke-linecap="round" />
            </svg>
            <div class="gauge-center-text">
              <span class="gauge-score-value">${overallScore}%</span>
              <span class="gauge-score-label">${state.lang === 'ur' ? 'مجموعی اسکور' : 'Overall Score'}</span>
            </div>
          </div>
          <div class="potential-metrics-list">
            <div class="potential-metric-row">
              <span class="potential-metric-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                ${state.lang === 'ur' ? 'مارکیٹ طلب' : 'Market Demand'}
              </span>
              <span class="potential-metric-val">${demandScore}%</span>
            </div>
            <div class="potential-metric-row">
              <span class="potential-metric-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                ${state.lang === 'ur' ? 'تجارتی تیاری' : 'Commercial Readiness'}
              </span>
              <span class="potential-metric-val">${commScore}%</span>
            </div>
            <div class="potential-metric-row">
              <span class="potential-metric-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                ${state.lang === 'ur' ? 'تکنیکی فزیبلٹی' : 'Technical Feasibility'}
              </span>
              <span class="potential-metric-val">${techScore}%</span>
            </div>
            <div class="potential-metric-row">
              <span class="potential-metric-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                ${state.lang === 'ur' ? 'خطرہ' : 'Risk Level'}
              </span>
              <span class="opp-score-pill ${riskBadgeClass}">${riskLabel}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Key Insights -->
      <div>
        <div class="overview-col-title">${state.lang === 'ur' ? 'اہم بصیرتیں' : 'Key Insights'}</div>
        <div class="insights-list">
          <div class="insight-item">
            <svg class="insight-check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <span>${state.lang === 'ur' ? 'ٹارگٹ مارکیٹ میں مضبوط تصدیق شدہ طلب' : 'Strong growing demand in target workflow'}</span>
          </div>
          <div class="insight-item">
            <svg class="insight-check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <span>${state.lang === 'ur' ? 'موجودہ متبادلات کے مقابلے میں واضح تفریق' : 'Moderate competition with clear differentiators'}</span>
          </div>
          <div class="insight-item">
            <svg class="insight-check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <span>${state.lang === 'ur' ? 'بہتر تجربے کے لیے ادائیگی کی مضبوط آمادگی' : 'High willingness to pay for better experience'}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Verified Evidence Callout Banner -->
    <div class="verified-evidence-banner">
      <div class="evidence-banner-text">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        <span>${state.lang === 'ur' ? `3 بااعتماد ذرائع سے تصدیق شدہ شواہد کی بنیاد پر۔ آخری اپڈیٹ: 2 دن پہلے۔` : `Based on verified evidence from ${selected.evidence?.length || 3} trusted sources. Last updated: 2 days ago.`}</span>
      </div>
      <button type="button" class="view-evidence-btn" data-goto-subtab="evidence">
        ${state.lang === 'ur' ? 'شواہد دیکھیں ←' : 'View Evidence &rarr;'}
      </button>
    </div>

    <!-- Recommended Action Card -->
    <div class="recommended-action-card">
      <div class="recommended-left">
        <div class="rocket-icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 9v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
        </div>
        <div>
          <div class="recommended-title">${state.lang === 'ur' ? 'تجویز کردہ کارروائی' : 'Recommended Action'}</div>
          <div class="recommended-desc">${state.lang === 'ur' ? 'یہ ایک اعلیٰ صلاحیت کا موقع ہے۔ ٹارگٹ صارفین کے لیے فوکسڈ خصوصیات کے ساتھ ایم وی پی بنائیں۔' : 'This is a high-potential opportunity. Consider building an MVP with focused features for target users.'}</div>
        </div>
      </div>
      <button type="button" class="create-mvp-btn" data-promote-opp="${escapeHtml(selected.id)}">
        ${state.lang === 'ur' ? 'ایم وی پی پلان بنائیں ←' : 'Create MVP Plan &rarr;'}
      </button>
    </div>
  `;

  // Evidence Tab Content
  const evidenceHtml = `
    <div class="criteria-grid" style="margin-bottom: 16px;">
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

    <h4 class="sub-box-title">${escapeHtml(
      t('dossier_ev_heading', {
        count: selected.evidence.length,
        conf: Math.round((selected.evidence_quality_summary?.average_confidence_score || 0) * 100)
      }, state.lang)
    )}</h4>
    <table class="data-table" style="margin-bottom: 16px;">
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

    <div class="criteria-cell" style="margin-bottom: 12px;">
      <h4 class="sub-box-title" style="margin-top:0;">Add New Verified Evidence</h4>
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
    </div>
  `;

  // Competitors Tab Content
  const competitorsHtml = `
    <div class="badge badge-warn" style="display:block; margin-bottom:14px; white-space:normal; font-size:12.5px; padding:8px 12px;">
      <strong>[COMMERCIAL INTEGRITY GUARDRAIL]</strong> Published competitor pricing is classified exclusively as Competitor Activity. It never qualifies as verified buyer willingness to pay or revenue proof.
    </div>

    <h4 class="sub-box-title">${escapeHtml(t('dossier_comp_heading', { count: (selected.competitors || []).length }, state.lang))}</h4>
    <table class="data-table" style="margin-bottom: 16px;">
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

    <div class="criteria-cell">
      <h4 class="sub-box-title" style="margin-top:0;">Add Competitor Entry</h4>
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
    </div>
  `;

  // Analysis Tab Content
  const analysisHtml = `
    <div class="criteria-cell" style="margin-bottom: 14px;">
      <strong>${escapeHtml(t('dossier_rationale_heading', {}, state.lang))}</strong>
      <div class="dossier-item-meta" style="margin-bottom: 4px;">
        <em><strong>${escapeHtml(t('dossier_disclaimer_prefix', {}, state.lang))}</strong> ${escapeHtml(selected.score_disclaimer)}</em>
      </div>
      <div>${escapeHtml(selected.decision_rationale)}</div>
      <div style="margin-top: 6px;">${warningsHtml}</div>
    </div>

    <h4 class="sub-box-title">${escapeHtml(t('dossier_11_heading', {}, state.lang))}</h4>
    <table class="data-table" style="margin-bottom: 18px;">
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
  `;

  // MVP Plan Tab Content
  const mvpHtml = `
    <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px;">
      <button type="button" class="btn btn-small btn-primary" data-promote-opp="${escapeHtml(selected.id)}">${escapeHtml(t('dossier_btn_promote', {}, state.lang))}</button>
      <button type="button" class="btn btn-small btn-approve" data-opp-status="${escapeHtml(selected.id)}" data-status="approved">${escapeHtml(t('dossier_btn_approve', {}, state.lang))}</button>
      <button type="button" class="btn btn-small btn-secondary" data-opp-status="${escapeHtml(selected.id)}" data-status="evaluating">${escapeHtml(t('dossier_btn_hold', {}, state.lang))}</button>
      <button type="button" class="btn btn-small btn-reject" data-opp-status="${escapeHtml(selected.id)}" data-status="rejected">${escapeHtml(t('dossier_btn_reject', {}, state.lang))}</button>
      <a class="btn btn-small btn-secondary" href="/api/opportunities/${encodeURIComponent(selected.id)}/export?format=markdown" target="_blank" rel="noopener">${escapeHtml(t('dossier_btn_export', {}, state.lang))}</a>
    </div>

    <div class="criteria-grid">
      <div class="criteria-cell">
        <strong>Target Customer Wedge</strong>
        <p>${escapeHtml(selected.target_audience)}</p>
      </div>
      <div class="criteria-cell">
        <strong>Initial Pricing Hypothesis</strong>
        <p>${escapeHtml(selected.monetization_model)}</p>
      </div>
      <div class="criteria-cell" style="grid-column: 1 / -1;">
        <strong>Buyer Validation Rules</strong>
        <p><strong>BUILD IF:</strong> &ge; 3 target buyers commit to a paid pilot or pre-order within 14 days.<br/>
        <strong>PIVOT IF:</strong> Buyers confirm pain severity but request a different workflow or price tier.<br/>
        <strong>ABANDON IF:</strong> &lt; 3 buyers engage or free existing alternatives fully satisfy target users.</p>
      </div>
    </div>
  `;

  detailPane.innerHTML = `
    <div class="detail-header-row">
      <div class="detail-header-left">
        <div class="detail-main-icon">
          ${visual.svg}
        </div>
        <div class="detail-title-block">
          <h2>${escapeHtml(selected.title)}</h2>
          <p>${escapeHtml(selected.problem_statement)}</p>
        </div>
      </div>
      ${overallScore >= 70 ? `<span class="top-opportunity-badge">&#9733; Top Opportunity</span>` : ''}
    </div>

    ${subtabsHtml}

    <div class="detail-subtab-content">
      ${
        state.detailSubtab === 'evidence'
          ? evidenceHtml
          : state.detailSubtab === 'competitors'
            ? competitorsHtml
            : state.detailSubtab === 'analysis'
              ? analysisHtml
              : state.detailSubtab === 'mvp'
                ? mvpHtml
                : overviewHtml
      }
    </div>
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

  document.querySelectorAll('.sidebar-nav-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.dataset.tab) switchTab(btn.dataset.tab);
    });
  });

  const viewAllLink = document.getElementById('link-view-all-opps');
  if (viewAllLink) {
    viewAllLink.addEventListener('click', () => switchTab('opportunities'));
  }

  const qaRunDiscovery = document.getElementById('qa-run-discovery');
  if (qaRunDiscovery) {
    qaRunDiscovery.addEventListener('click', () => {
      const section = document.getElementById('discovery-engine-section');
      if (section) section.scrollIntoView({ behavior: 'smooth' });
      const queryInput = document.getElementById('run-query');
      if (queryInput) queryInput.focus();
    });
  }

  const qaCompareOpps = document.getElementById('qa-compare-opps');
  if (qaCompareOpps) {
    qaCompareOpps.addEventListener('click', () => switchTab('opportunities'));
  }

  const qaViewEvidence = document.getElementById('qa-view-evidence');
  if (qaViewEvidence) {
    qaViewEvidence.addEventListener('click', () => {
      const section = document.getElementById('central-evidence-section');
      if (section) section.scrollIntoView({ behavior: 'smooth' });
    });
  }

  const qaPlanMvp = document.getElementById('qa-plan-mvp');
  if (qaPlanMvp) {
    qaPlanMvp.addEventListener('click', () => switchTab('execution'));
  }

  const sidebarToggle = document.getElementById('sidebar-toggle-btn');
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      const sidebar = document.getElementById('app-sidebar');
      if (sidebar) sidebar.classList.toggle('open');
    });
  }

  // Global event delegation
  document.body.addEventListener('click', async (e) => {
    // Detail subtabs switch
    const subtabBtn = e.target.closest('[data-detail-tab]');
    if (subtabBtn) {
      state.detailSubtab = subtabBtn.dataset.detailTab;
      renderOpportunitiesWorkspace(state.dashboard);
      return;
    }

    // Goto subtab (e.g. from verified evidence banner)
    const gotoSubtabBtn = e.target.closest('[data-goto-subtab]');
    if (gotoSubtabBtn) {
      state.detailSubtab = gotoSubtabBtn.dataset.gotoSubtab;
      renderOpportunitiesWorkspace(state.dashboard);
      return;
    }
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
      switchTab('research');
      renderOpportunitiesWorkspace(state.dashboard);
      const detailPane = document.getElementById('opportunity-detail-pane');
      if (detailPane) detailPane.scrollIntoView({ behavior: 'smooth' });
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
