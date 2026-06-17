// ─────────────────────────────────────────────────────────
// ROW TEMPLATE — shared by both SSR (ApplianceRow.astro)
// and client-side dynamic row creation (events.ts / presets.ts).
//
// This is the single source of truth for appliance row HTML.
// Previously buildRowHTML() in index.astro was a 100% duplicate
// of ApplianceRow.astro with subtle differences (e.g. truncated
// aria-labels, missing id/label pairs). Now both use this file.
//
// Fixes (Phase 1):
//   - Task 1 : Eliminates HTML duplication
//   - Task 14: Adds proper id/label pairs on inputs (a11y fix)
//   - Audit #7: Replaced style="color:var(--accent)" → class="text-accent"
// ─────────────────────────────────────────────────────────

import type { Appliance } from '../types';
import { calculateRowKWh } from './calculations';

/** Minimal HTML escaping to prevent XSS in user-supplied appliance names. */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Builds the full HTML string for a single appliance row.
 * Used by ApplianceRow.astro (SSR) via set:html and by
 * client-side scripts for dynamic row insertion.
 */
export function buildRowHTML(a: Appliance): string {
  const kwh = calculateRowKWh(a).toFixed(2);
  const safeName = escapeHtml(a.name);
  const isActive = a.qty > 0;

  return `
    <div
      class="appliance-row group grid grid-cols-2 lg:grid-cols-[1fr_90px_100px_80px_80px_28px] items-center gap-y-3 gap-x-4 lg:gap-3 px-4 py-5 hover:bg-card-hover transition-colors duration-150 border-l-4 ${isActive ? 'border-accent' : 'border-transparent'}"
      data-id="${a.id}"
    >
      <!-- Mobile header: Name & Reading Row -->
      <!-- Name -->
      <div class="flex items-center gap-2 col-span-1 lg:col-span-1 min-w-0">
        <span
          class="text-sm font-normal text-text-primary transition-colors duration-150 truncate"
          data-appliance-name
        >${safeName}</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
          class="w-4 h-4 text-success transition-opacity duration-150 flex-shrink-0 ${isActive ? '' : 'hidden'}"
          data-selection-icon="${a.id}" aria-hidden="true">
          <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" />
        </svg>
        ${a.custom ? `<span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-border text-accent flex-shrink-0">CUSTOM</span>` : ''}
      </div>

      <!-- Mobile kWh display (Hidden on Desktop because desktop uses the dedicated column at the end) -->
      <div class="flex-shrink-0 text-right col-span-1 lg:hidden">
        <span
          class="font-mono text-xs sm:text-sm font-semibold tabular-nums text-accent"
          data-kwh-display="${a.id}"
        >${kwh}</span>
        <span class="text-[9px] sm:text-[10px] text-text-muted ml-0.5">kWh</span>
      </div>

      <!-- Watts (Col 2) -->
      <div class="flex flex-col items-center lg:items-stretch gap-1 col-span-1 lg:col-span-1 justify-center lg:justify-start">
        <span class="lg:hidden text-[9px] font-mono uppercase tracking-wider text-text-muted">Watts</span>
        <div class="flex items-center gap-1 w-full justify-center">
          <label class="sr-only" for="watts-${a.id}">Watts for ${safeName}</label>
          <input
            id="watts-${a.id}"
            type="number" value="${a.watts}" min="1" max="99999"
            class="w-full sm:w-20 rounded-lg px-1 text-center font-mono text-xs sm:text-sm focus:outline-none transition-colors border border-accent/20 hover:border-accent cursor-pointer bg-input/50 h-11 sm:h-8"
            data-action="update-watts" data-id="${a.id}"
            aria-label="Watts for ${safeName}"
          />
          <span class="hidden lg:block text-[9px] sm:text-[11px] text-text-muted font-mono uppercase w-3 text-center flex-shrink-0">W</span>
        </div>
      </div>

      <!-- Qty stepper (Col 3) -->
      <div class="flex flex-col items-center gap-1 col-span-1 lg:col-span-1 justify-center">
        <span class="lg:hidden text-[9px] font-mono uppercase tracking-wider text-text-muted">Qty</span>
        <div class="flex items-center w-full justify-center" role="group" aria-label="Quantity for ${safeName}">
          <button type="button"
            class="stepper-btn flex-1 lg:flex-none max-w-[40px]"
            data-action="decrement-qty" data-id="${a.id}"
            aria-label="Decrease quantity of ${safeName}"
          >−</button>
          <span class="w-6 sm:w-8 text-center font-mono text-xs sm:text-sm font-semibold tabular-nums" data-qty-display="${a.id}">${a.qty}</span>
          <button type="button"
            class="stepper-btn stepper-add-btn flex-1 lg:flex-none max-w-[40px] relative"
            data-action="increment-qty" data-id="${a.id}"
            aria-label="Increase quantity of ${safeName}"
          >+</button>
        </div>
      </div>

      <!-- Hours (Col 4) -->
      <div class="flex flex-col items-center gap-1 col-span-1 lg:col-span-1 justify-center relative">
        <span class="lg:hidden text-[9px] font-mono uppercase tracking-wider text-text-muted">Hrs/Day</span>
        <div class="flex items-center gap-1 w-full justify-center">
          <label class="sr-only" for="hours-${a.id}">Hours per day for ${safeName}</label>
          <input
            id="hours-${a.id}"
            type="number" value="${a.hours}" min="0" max="24" step="0.25"
            class="w-full sm:w-16 rounded-lg px-1 text-center font-mono text-xs sm:text-sm focus:outline-none transition-colors border border-accent/20 hover:border-accent cursor-pointer bg-input/50 h-11 sm:h-8"
            data-action="update-hours" data-id="${a.id}"
            aria-label="Hours per day for ${safeName}"
          />
          <span class="hidden lg:block text-[9px] sm:text-[11px] text-text-muted font-mono uppercase w-5 text-center flex-shrink-0">h/d</span>
        </div>
        <span class="hours-error hidden text-[8px] sm:text-[9px] text-danger font-mono font-bold uppercase absolute mt-6" data-error-id="${a.id}">Max 24h</span>
      </div>

      <!-- Usage kWh display — desktop only (Col 5) -->
      <div class="hidden lg:block text-right lg:col-span-1">
        <span
          class="font-mono text-xs sm:text-sm font-semibold tabular-nums text-accent"
          data-kwh-display="${a.id}"
        >${kwh}</span>
        <span class="text-[9px] sm:text-[10px] text-text-muted ml-0.5 block">kWh</span>
      </div>

      <!-- Delete action (custom appliances only) (Col 6) -->
      <div class="col-span-2 lg:col-span-1 flex items-center justify-center h-11 sm:h-8 mt-1 lg:mt-0">
        ${a.custom ? `
          <button type="button"
            class="w-10 h-10 sm:w-8 sm:h-8 rounded-md text-text-muted hover:text-danger active:text-danger hover:bg-border transition-colors focus:outline-none"
            data-action="delete-appliance" data-id="${a.id}"
            aria-label="Remove ${safeName}" title="Remove appliance"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 mx-auto" aria-hidden="true">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </button>
        ` : ''}
      </div>
    </div>`;
}
