// ─────────────────────────────────────────────────────────
// PRESETS — quick-start preset loading and button state
// ─────────────────────────────────────────────────────────

import { CATEGORIES } from '@/data/appliances';
import { buildRowHTML } from '@/utils/rowTemplate';
import { appState, saveState } from './state';
import { updateRowStyle } from './rowUpdaters';
import { PRESETS } from './constants';
import { calculate } from './calculate';

export function updatePresetButtons(): void {
  document.querySelectorAll<HTMLElement>('.preset-card').forEach(btn => {
    const isActive = btn.dataset.presetId === appState.activePresetId;
    btn.style.borderColor = '';
    btn.style.boxShadow = isActive ? '0 0 0 1px color-mix(in srgb, var(--accent), transparent 65%)' : '';
    btn.style.background = isActive ? 'color-mix(in srgb, var(--accent), transparent 93%)' : '';
  });
}

export function loadPreset(presetId: string): void {
  const quantities = PRESETS[presetId];
  if (!quantities) return;

  // Reset all quantities, then apply preset
  appState.appliances.forEach(a => { a.qty = 0; });
  appState.appliances.forEach(a => { if (quantities[a.name] !== undefined) a.qty = quantities[a.name]; });
  appState.activePresetId = presetId;

  // Re-render every category and sync accordion state
  CATEGORIES.forEach(cat => {
    const bodyId = `category-body-${cat.replace(/\s/g, '-')}`;
    const body = document.getElementById(bodyId);
    const container = body?.querySelector('[data-rows-container]');
    if (!container) return;

    container.innerHTML = '';
    const catAppliances = appState.appliances.filter(a => a.category === cat);
    catAppliances.forEach(a => container.insertAdjacentHTML('beforeend', buildRowHTML(a)));

    if (body) {
      const hasActive = catAppliances.some(a => a.qty > 0);
      const shouldExpand = cat === 'Lighting' && hasActive;
      body.classList.toggle('is-open', shouldExpand);

      const section = body.closest('.category-section');
      const toggleBtn = section?.querySelector<HTMLButtonElement>('[data-action="toggle-category"]');
      const chevron = toggleBtn?.querySelector<SVGElement>('.chevron');
      if (toggleBtn) toggleBtn.setAttribute('aria-expanded', shouldExpand ? 'true' : 'false');
      if (chevron) chevron.style.transform = shouldExpand ? '' : 'rotate(-90deg)';
    }
  });

  appState.appliances.forEach(a => updateRowStyle(a));
  updatePresetButtons();
  saveState();
  calculate();
}
