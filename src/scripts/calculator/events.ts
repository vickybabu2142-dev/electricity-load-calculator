// ─────────────────────────────────────────────────────────
// EVENTS — all document-level event handlers.
// Imported as a side-effect by init.ts. Listeners are
// registered once at module load (ES module singleton)
// and persist across Astro View Transition navigations.
// ─────────────────────────────────────────────────────────

import type { Appliance, ApplianceCategory } from '@/types';
import { DEFAULT_APPLIANCES, CATEGORIES, SECTIONS } from '@/data/appliances';
import { calculateRowKWh } from '@/utils/calculations';
import { calculateInsights } from '@/utils/insights';
import { buildRowHTML } from '@/utils/rowTemplate';
import { appState, saveState, getAppliance } from './state';
import { formatNumber } from './dom';
import { updateRowKWh, updateRowQtyDisplay, updateRowStyle } from './rowUpdaters';
import { updatePresetButtons, loadPreset } from './presets';
import { calculate, debouncedCalculate } from './calculate';
import { REGION_SETTINGS, STORAGE_KEY } from './constants';
import { DAYS_PER_MONTH } from '@/data/constants';
import { showConfirm } from './confirm';

// ── Modal ─────────────────────────────────────────────────
function closeModal(): void {
  const modal = document.getElementById('report-modal');
  modal?.classList.add('hidden');
  modal?.classList.remove('flex');
}

// ── Change: watts / hours inputs ──────────────────────────
document.addEventListener('change', (e) => {
  const target = e.target as HTMLElement;
  const action = target.dataset.action;
  const id = target.dataset.id;
  if (!action || !id) return;

  const a = getAppliance(id);
  if (!a) return;

  if (action === 'update-watts') {
    const val = parseFloat((target as HTMLInputElement).value);
    if (!isNaN(val) && val >= 1) {
      a.watts = val;
      updateRowKWh(a);
      saveState();
      debouncedCalculate();
    }
    return;
  }

  if (action === 'update-hours') {
    const val = parseFloat((target as HTMLInputElement).value);
    const errorEl = document.querySelector(`[data-error-id="${id}"]`);
    if (!isNaN(val)) {
      if (val > 24) {
        target.classList.add('border-danger');
        target.classList.remove('border-border');
        errorEl?.classList.remove('hidden');
      } else {
        target.classList.remove('border-danger');
        target.classList.add('border-border');
        errorEl?.classList.add('hidden');
      }
      a.hours = Math.min(24, val);
      updateRowKWh(a);
      saveState();
      debouncedCalculate();
    }
  }
});

// ── Input: max capacity (debounced, was missing debounce) ─
document.addEventListener('input', (e) => {
  const target = e.target as HTMLElement;
  if (target.dataset.action !== 'update-max-kw') return;
  const val = parseFloat((target as HTMLInputElement).value);
  if (!isNaN(val) && val > 0) {
    appState.maxCapacityKW = val;
    saveState();
    debouncedCalculate();
  }
});

// ── Click: all button actions ─────────────────────────────
document.addEventListener('click', async (e) => {
  const target = e.target as HTMLElement;

  // Close modal (direct or delegated)
  if (target.dataset.action === 'close-modal' || target.closest('[data-action="close-modal"]')) {
    closeModal();
    return;
  }

  const btn = target.closest<HTMLElement>('[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;
  const id = btn.dataset.id;
  if (!action) return;

  if (action === 'load-preset') {
    const presetId = btn.dataset.presetId;
    if (presetId) loadPreset(presetId);
    return;
  }

  if (action === 'toggle-category') {
    const category = btn.dataset.category!;
    const body = document.getElementById(`category-body-${category.replace(/\s/g, '-')}`);
    const chevron = btn.querySelector<SVGElement>('.chevron');
    if (!body) return;
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    body.classList.toggle('is-open', !isOpen);
    if (chevron) chevron.style.transform = isOpen ? 'rotate(-90deg)' : '';
    return;
  }

  if (action === 'toggle-add-form') {
    const wrapper = btn.closest('.add-appliance-wrapper');
    const form = wrapper?.querySelector<HTMLFormElement>('.add-appliance-form');
    if (!form) return;
    const isHidden = form.classList.contains('hidden');
    form.classList.toggle('hidden', !isHidden);
    btn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
    return;
  }

  if (action === 'cancel-add-form') {
    const wrapper = btn.closest('.add-appliance-wrapper');
    const form = wrapper?.querySelector<HTMLFormElement>('.add-appliance-form');
    const toggleBtn = wrapper?.querySelector<HTMLButtonElement>('.add-toggle-btn');
    form?.classList.add('hidden');
    form?.reset();
    toggleBtn?.setAttribute('aria-expanded', 'false');
    return;
  }

  if ((action === 'increment-qty' || action === 'decrement-qty') && id) {
    const a = getAppliance(id);
    if (!a) return;
    if (action === 'increment-qty') a.qty = Math.min(a.qty + 1, 500);
    else a.qty = Math.max(a.qty - 1, 0);
    updateRowQtyDisplay(a);
    updateRowKWh(a);
    updateRowStyle(a);
    saveState();
    calculate();
    return;
  }

  if (action === 'delete-appliance' && id) {
    appState.appliances = appState.appliances.filter(a => a.id !== id);
    document.querySelector(`[data-id="${id}"]`)?.remove();
    saveState();
    calculate();
    return;
  }

  if (action === 'reset-all') {
    const confirmed = await showConfirm(
      'This will reset all appliances to their default quantities. Your custom appliances will be removed.',
      { title: 'Reset Calculator', okLabel: 'Yes, Reset' }
    );
    if (!confirmed) return;

    localStorage.removeItem(STORAGE_KEY);
    appState.appliances = structuredClone(DEFAULT_APPLIANCES).filter(a => !a.hidden);
    appState.customIdCounter = 1000;

    CATEGORIES.forEach(cat => {
      const body = document.getElementById(`category-body-${cat.replace(/\s/g, '-')}`);
      const container = body?.querySelector('[data-rows-container]');
      if (!container) return;
      container.innerHTML = '';
      appState.appliances.filter(a => a.category === cat)
        .forEach(a => container.insertAdjacentHTML('beforeend', buildRowHTML(a)));

      if (body) {
        const shouldExpand = cat === 'Lighting';
        body.classList.toggle('is-open', shouldExpand);
        const section = body.closest('.category-section');
        const toggleBtn = section?.querySelector<HTMLButtonElement>('[data-action="toggle-category"]');
        const chevron = toggleBtn?.querySelector<SVGElement>('.chevron');
        if (toggleBtn) toggleBtn.setAttribute('aria-expanded', shouldExpand ? 'true' : 'false');
        if (chevron) (chevron as HTMLElement).style.transform = shouldExpand ? '' : 'rotate(-90deg)';
      }
    });

    appState.appliances.forEach(a => updateRowStyle(a));
    appState.activePresetId = null;
    updatePresetButtons();
    appState.maxCapacityKW = REGION_SETTINGS.INR.defaultMaxKW;
    const maxKWInput = document.getElementById('max-kw-input') as HTMLInputElement | null;
    if (maxKWInput) maxKWInput.value = String(appState.maxCapacityKW);
    calculate();

    // Reset page scroll to top and clear any focus (emulate first landing)
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    return;
  }

  if (action === 'download-report') {
    const included = appState.appliances.filter(a => a.qty > 0);
    const totalWatts = included.reduce((s, a) => s + a.watts * a.qty, 0);
    const dailyKWh = included.reduce((s, a) => s + calculateRowKWh(a), 0);
    const monthlyKWh = dailyKWh * DAYS_PER_MONTH;
    const date = new Date().toLocaleDateString(navigator.language || 'en', { dateStyle: 'long' });
    const insights = calculateInsights(totalWatts / 1000, monthlyKWh);

    let report = `ELECTRICITY LOAD CALCULATOR REPORT\nGenerated: ${date}\n${'─'.repeat(48)}\n\n`;
    report += `SUMMARY\n`;
    report += `  Total Load          : ${formatNumber(totalWatts)} W (${(totalWatts / 1000).toFixed(2)} kW)\n`;
    report += `  Daily Consumption   : ${formatNumber(dailyKWh, 2)} kWh(unit)/day\n`;
    report += `  Monthly Estimate    : ${formatNumber(monthlyKWh)} kWh(unit)/month\n`;
    report += `  Max Load Capacity   : ${appState.maxCapacityKW} kW\n\n${'─'.repeat(48)}\n\n`;
    report += `SMART INSIGHTS\n`;
    report += `  Recommended MCB         : ${insights.recommendedMCB}\n`;
    report += `  Recommended Cable       : ${insights.recommendedCable}\n`;
    report += `  Recommended Inverter    : ${insights.recommendedInverter}\n`;
    report += `  Recommended Solar       : ${insights.recommendedSolar}\n`;
    report += `  Recommended Stabilizer  : ${insights.recommendedStabilizer}\n\n${'─'.repeat(48)}\n\nAPPLIANCE BREAKDOWN\n\n`;

    SECTIONS.forEach(section => {
      const sectionItems = included.filter(a => section.categories.includes(a.category));
      if (!sectionItems.length) return;
      report += `[ ${section.title.toUpperCase()} ]\n`;
      section.categories.forEach(cat => {
        const catItems = sectionItems.filter(a => a.category === cat);
        if (!catItems.length) return;
        report += `  ${cat.toUpperCase()}\n`;
        catItems.forEach(a => {
          report += `    ${a.name.padEnd(28)} ${String(a.qty).padStart(2)}× ${String(a.watts).padStart(5)}W  ${calculateRowKWh(a).toFixed(2)} kWh(unit)/d\n`;
        });
        report += '\n';
      });
      report += '\n';
    });
    report += `${'─'.repeat(48)}\nSource: ${window.location.origin}\n© ${new Date().getFullYear()} Electricity Load Calculator\n`;

    const modal = document.getElementById('report-modal');
    const content = document.getElementById('report-content');
    if (modal && content) { content.textContent = report; modal.classList.remove('hidden'); modal.classList.add('flex'); }
    return;
  }

  if (action === 'print-report') {
    e.stopImmediatePropagation();
    const originalTitle = document.title;
    document.title = `electricity-load-calculator-assessment-report-${new Date().toISOString().split('T')[0]}`;
    window.print();
    document.title = originalTitle;
    return;
  }

  if (action === 'download-txt') {
    const content = document.getElementById('report-content')?.textContent || '';
    if (!content) return;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `electricity-load-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }
});

// ── Submit: add custom appliance form ─────────────────────
document.addEventListener('submit', (e) => {
  const form = e.target as HTMLFormElement;
  if (!form.classList.contains('add-appliance-form')) return;
  e.preventDefault();
  e.stopImmediatePropagation();

  const nameInput  = form.querySelector<HTMLInputElement>('[data-field="name"]');
  const wattsInput = form.querySelector<HTMLInputElement>('[data-field="watts"]');
  const hoursInput = form.querySelector<HTMLInputElement>('[data-field="hours"]');
  const catSelect  = form.querySelector<HTMLSelectElement>('[data-field="category"]');
  const errorEl    = form.querySelector<HTMLParagraphElement>('.form-error');

  const name  = nameInput?.value.trim();
  const watts = parseFloat(wattsInput?.value || '0');
  const hours = parseFloat(hoursInput?.value || '0');
  const cat   = (catSelect?.value || 'Other') as ApplianceCategory;

  if (!name) {
    if (errorEl) { errorEl.textContent = 'Please enter an appliance name.'; errorEl.classList.remove('hidden'); }
    nameInput?.focus(); return;
  }
  if (!watts || watts < 1) {
    if (errorEl) { errorEl.textContent = 'Watts must be at least 1.'; errorEl.classList.remove('hidden'); }
    wattsInput?.focus(); return;
  }
  if (isNaN(hours) || hours < 0 || hours > 24) {
    if (errorEl) { errorEl.textContent = 'Hours must be between 0 and 24.'; errorEl.classList.remove('hidden'); }
    hoursInput?.focus(); return;
  }

  errorEl?.classList.add('hidden');

  const newAppliance: Appliance = {
    id: `custom-${++appState.customIdCounter}`,
    category: cat, name,
    defaultWatts: watts, defaultQty: 1, defaultHours: hours,
    watts, qty: 1, hours, custom: true,
  };
  appState.appliances.push(newAppliance);

  const body = document.getElementById(`category-body-${cat.replace(/\s/g, '-')}`);
  const container = body?.querySelector('[data-rows-container]');
  if (container) {
    container.insertAdjacentHTML('beforeend', buildRowHTML(newAppliance));
    if (body && !body.classList.contains('is-open')) {
      body.classList.add('is-open');
      const section = body.closest('.category-section');
      const toggleBtn = section?.querySelector<HTMLButtonElement>('[data-action="toggle-category"]');
      const chevron = toggleBtn?.querySelector<SVGElement>('.chevron');
      toggleBtn?.setAttribute('aria-expanded', 'true');
      if (chevron) chevron.style.transform = '';
    }
  }

  form.reset();
  form.classList.add('hidden');
  form.closest('.add-appliance-wrapper')?.querySelector<HTMLButtonElement>('.add-toggle-btn')?.setAttribute('aria-expanded', 'false');
  saveState();
  calculate();
}, true);

// ── Keydown: close modal on Escape ────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});
