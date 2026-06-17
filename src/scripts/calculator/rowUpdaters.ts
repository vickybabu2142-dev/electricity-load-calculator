// ─────────────────────────────────────────────────────────
// ROW UPDATERS — per-appliance-row DOM mutations
// Fixes: Removed fragile '.flex-1 span' selector (audit #6)
//        replaced with data-appliance-name attribute.
// ─────────────────────────────────────────────────────────

import type { Appliance } from '@/types';
import { calculateRowKWh } from '@/utils/calculations';
import { formatNumber } from './dom';

export function updateRowKWh(a: Appliance): void {
  document.querySelectorAll(`[data-kwh-display="${a.id}"]`).forEach(el => {
    el.textContent = formatNumber(calculateRowKWh(a), 2);
  });
}

export function updateRowQtyDisplay(a: Appliance): void {
  const el = document.querySelector(`[data-qty-display="${a.id}"]`);
  if (el) el.textContent = String(a.qty);
}

export function updateRowStyle(a: Appliance): void {
  const row = document.querySelector<HTMLElement>(`[data-id="${a.id}"]`);
  if (!row) return;

  // Active Row Highlighting via left border
  row.classList.toggle('border-accent', a.qty > 0);
  row.classList.toggle('border-transparent', a.qty === 0);

  // Clear any lingering opacity/grayscale from old dimming feature
  const controlsRow = row.querySelector<HTMLElement>('[data-controls-row]');
  if (controlsRow) {
    controlsRow.classList.remove('opacity-40', 'grayscale-[50%]');
    controlsRow.classList.add('opacity-100');
  }

  // Show/hide selection checkmark icon
  const icon = row.querySelector<HTMLElement>('[data-selection-icon]');
  if (icon) icon.classList.toggle('hidden', a.qty === 0);
}
