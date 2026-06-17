// ─────────────────────────────────────────────────────────
// PANEL UPDATER — live UI panel update sub-functions
// Extracted from the 400-line calculate() God Function.
// ─────────────────────────────────────────────────────────

import type { CalculationResult } from '@/types';
import type { HealthScoreResult } from '@/utils/health';
import { CATEGORIES } from '@/data/appliances';
import { calculateRowKWh } from '@/utils/calculations';
import { animateCounter, setText, formatNumber } from './dom';
import { appState } from './state';

// ── Main Panel ────────────────────────────────────────────
export function updateMainPanel(result: CalculationResult, activeCount: number): void {
  animateCounter('total-kw', result.totalKW, 2);
  animateCounter('sticky-total-kw', result.totalKW, 2);
  animateCounter('total-watts', result.totalWatts, 0);
  animateCounter('daily-kwh', result.dailyKWh, 2);
  animateCounter('monthly-kwh', result.monthlyKWh, 0);
  setText('sticky-monthly-kwh', String(Math.round(result.monthlyKWh)));

  setText('top-consumer-name', result.topConsumerName);
  setText('top-consumer-watts', formatNumber(result.topConsumerWatts));
  setText('load-percent', `${Math.round(result.loadPercent)}%`);
  setText('max-kw-label', `${appState.maxCapacityKW} kW max`);

  const bar = document.getElementById('load-bar');
  if (bar) bar.style.width = `max(4px, ${Math.min(result.loadPercent, 100)}%)`;

  const progress = document.getElementById('load-progress');
  if (progress) progress.setAttribute('aria-valuenow', String(Math.round(result.loadPercent)));

  _updateLoadLevelBadge(result.loadPercent);
  _updateEmptyState(activeCount);
}

// ── Load Level Badge ──────────────────────────────────────
function _updateLoadLevelBadge(loadPercent: number): void {
  const badge = document.getElementById('load-level-badge');
  if (!badge) return;
  badge.style.boxShadow = 'none';
  if (loadPercent < 30) {
    badge.textContent = 'Light Load';
    badge.style.borderColor = 'var(--success)';
    badge.style.color = 'var(--success)';
  } else if (loadPercent < 70) {
    badge.textContent = 'Moderate Load';
    badge.style.borderColor = 'var(--warning)';
    badge.style.color = 'var(--warning)';
  } else {
    badge.textContent = 'Heavy Load';
    badge.style.borderColor = 'transparent';
    badge.style.color = 'var(--danger)';
    badge.style.boxShadow = 'var(--danger-glow)';
  }
}

// ── Empty State ───────────────────────────────────────────
function _updateEmptyState(activeCount: number): void {
  document.body.classList.toggle('is-empty-state', activeCount === 0);

  const emptyPrompt = document.getElementById('empty-state-prompt');
  if (emptyPrompt) emptyPrompt.style.display = activeCount === 0 ? '' : 'none';

  const stickySummary = document.getElementById('sticky-summary');
  const stickyHint = document.getElementById('sticky-empty-hint');
  if (stickySummary) stickySummary.style.display = activeCount === 0 ? 'none' : '';
  if (stickyHint) stickyHint.style.display = activeCount === 0 ? 'flex' : 'none';
}

// ── Category Badges ───────────────────────────────────────
export function updateCategoryBadges(): void {
  const totalCount = appState.appliances.filter(a => !a.hidden).length;
  const activeCount = appState.appliances.filter(a => a.qty > 0).length;
  setText('active-count', String(activeCount));
  setText('total-count', String(totalCount));
  setText('hero-total-count', String(totalCount));

  CATEGORIES.forEach(cat => {
    const catAppliances = appState.appliances.filter(a => a.category === cat);
    const activeCatAppliances = catAppliances.filter(a => a.qty > 0);
    const catWatts = activeCatAppliances.reduce((s, a) => s + a.watts * a.qty, 0);
    const catKWh = activeCatAppliances.reduce((s, a) => s + calculateRowKWh(a), 0);
    const catActiveCount = activeCatAppliances.length;
    const catTotalCount = catAppliances.length;

    const body = document.getElementById(`category-body-${cat.replace(/\s/g, '-')}`);
    const section = body?.closest('.category-section');

    const wattTextEl = section?.querySelector('[data-category-watts] span:last-child');
    const kwhTextEl = section?.querySelector('[data-category-kwh] span:last-child');
    const cntEl = section?.querySelector('[data-category-count]');
    const cntBadge = section?.querySelector('[data-category-count-badge]');

    if (wattTextEl) wattTextEl.textContent = `${catWatts.toLocaleString()} W`;
    if (kwhTextEl) kwhTextEl.textContent = `${catKWh.toFixed(2)} kWh(unit)/d`;
    if (cntEl) cntEl.textContent = `${catActiveCount}/${catTotalCount}`;

    if (cntBadge) {
      if (catActiveCount > 0) {
        cntBadge.classList.add('bg-accent', 'text-accent-text', 'px-2', 'py-0.5', 'rounded-full', 'font-bold');
      } else {
        cntBadge.classList.remove('bg-accent', 'text-accent-text', 'px-2', 'py-0.5', 'rounded-full', 'font-bold');
      }
    }
  });
}

// ── Health Score UI ───────────────────────────────────────
export function updateHealthScoreUI(health: HealthScoreResult, activeCount: number): void {
  const healthCompact = document.getElementById('health-score-compact');
  if (healthCompact) healthCompact.style.display = activeCount === 0 ? 'none' : '';
  if (activeCount === 0) return;

  const scoreEl = document.getElementById('health-score-value');
  if (scoreEl) scoreEl.style.color = health.color;
  animateCounter('health-score-value', health.score, 0);

  const scoreCard = document.getElementById('health-score-card');
  if (scoreCard) {
    scoreCard.style.borderColor = `color-mix(in srgb, ${health.color}, transparent 62%)`;
    scoreCard.style.background = `color-mix(in srgb, ${health.color}, transparent 93%)`;
  }

  const iconEl = document.getElementById('health-score-icon') as HTMLElement | null;
  if (iconEl) iconEl.style.color = health.color;

  const labelEl = document.getElementById('health-score-label') as HTMLElement | null;
  if (labelEl) {
    labelEl.textContent = health.label;
    labelEl.style.color = health.color;
    labelEl.style.background = `color-mix(in srgb, ${health.color}, transparent 85%)`;
    labelEl.style.borderColor = `color-mix(in srgb, ${health.color}, transparent 55%)`;
  }
}
