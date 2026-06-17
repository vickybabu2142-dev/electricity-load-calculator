// ─────────────────────────────────────────────────────────
// INIT — entry point for the calculator on every page load.
// Importing './events' registers all document listeners as
// a one-time side-effect (ES module singleton pattern).
// ─────────────────────────────────────────────────────────

import { CATEGORIES } from '@/data/appliances';
import { buildRowHTML } from '@/utils/rowTemplate';
import { appState, loadState } from './state';
import { updateRowStyle } from './rowUpdaters';
import { calculate } from './calculate';
import { resetReportId } from './print';

// Register all event handlers (side-effect import — runs once)
import './events';
// Wire confirm modal listeners (side-effect import — runs once)
import './confirm';

function onStickyDetailsClick(e: Event): void {
  e.preventDefault();
  document.getElementById('results-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function initCalculator(): void {
  if (!document.getElementById('results-panel')) return;

  // Reset stable report ID on each new page session
  resetReportId();

  // Sticky bar smooth scroll
  const stickyLink = document.getElementById('sticky-details-link');
  if (stickyLink) {
    stickyLink.removeEventListener('click', onStickyDetailsClick);
    stickyLink.addEventListener('click', onStickyDetailsClick);
  }

  const hasSavedState = loadState();

  if (hasSavedState) {
    // Sync max-kw input to restored state
    const maxKWInput = document.getElementById('max-kw-input') as HTMLInputElement | null;
    if (maxKWInput) maxKWInput.value = String(appState.maxCapacityKW);

    // Re-hydrate all appliance rows from saved state
    CATEGORIES.forEach(cat => {
      const bodyId = `category-body-${cat.replace(/\s/g, '-')}`;
      const body = document.getElementById(bodyId);
      const container = body?.querySelector('[data-rows-container]');
      if (!container) return;

      container.innerHTML = '';
      appState.appliances
        .filter(a => a.category === cat)
        .forEach(a => container.insertAdjacentHTML('beforeend', buildRowHTML(a)));

      // Auto-expand Lighting if it has active appliances
      if (cat === 'Lighting' && appState.appliances.some(a => a.category === cat && a.qty > 0) && body) {
        body.classList.add('is-open');
        const section = body.closest('.category-section');
        const toggleBtn = section?.querySelector<HTMLButtonElement>('[data-action="toggle-category"]');
        const chevron = toggleBtn?.querySelector<SVGElement>('.chevron');
        if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
        if (chevron) (chevron as HTMLElement).style.transform = '';
      }
    });

    appState.appliances.forEach(a => updateRowStyle(a));
  }

  // Auto-expand Lighting if no appliances are active
  const activeCount = appState.appliances.filter(a => a.qty > 0).length;
  if (activeCount === 0) {
    const body = document.getElementById('category-body-Lighting');
    if (body) {
      body.classList.add('is-open');
      const section = body.closest('.category-section');
      const toggleBtn = section?.querySelector<HTMLButtonElement>('[data-action="toggle-category"]');
      const chevron = toggleBtn?.querySelector<SVGElement>('.chevron');
      if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
      if (chevron) (chevron as HTMLElement).style.transform = '';
    }
  }

  calculate();
}

document.addEventListener('astro:page-load', initCalculator);
