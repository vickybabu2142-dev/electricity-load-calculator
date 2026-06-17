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
      class="appliance-row group flex flex-wrap lg:flex-nowrap items-center gap-y-3 gap-x-4 px-4 py-5 hover:bg-card-hover transition-colors duration-150 border-l-4 ${isActive ? 'border-accent' : 'border-transparent'}"
      data-id="${a.id}"
    >
      <!-- Name & Reading Row -->
      <div class="flex items-center justify-between gap-3 flex-1 min-w-[200px] lg:min-w-0 lg:contents">
        <!-- Name -->
        <div class="flex-1 lg:order-1 flex items-center gap-2">
          <span
            class="text-sm font-normal text-text-primary transition-colors duration-150"
            data-appliance-name
          >${safeName}</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
            class="w-4 h-4 text-success transition-opacity duration-150 ${isActive ? '' : 'hidden'}"
            data-selection-icon="${a.id}" aria-hidden="true">
            <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" />
          </svg>
          ${a.custom ? `<span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-border text-accent">CUSTOM</span>` : ''}
        </div>

        <!-- kWh display — class="text-accent" replaces inline style -->
        <div class="flex-shrink-0 text-right min-w-[65px] sm:min-w-[80px] lg:order-5">
          <span
            class="font-mono text-xs sm:text-sm font-semibold tabular-nums text-accent"
            data-kwh-display="${a.id}"
          >${kwh}</span>
          <span class="text-[9px] sm:text-[10px] text-text-muted ml-0.5">kWh(unit)</span>
        </div>
      </div>

      <!-- Controls Row -->
      <div
        class="flex items-center justify-between w-full lg:w-auto lg:contents gap-2 lg:gap-3 order-3 mt-1 lg:mt-0 transition-opacity duration-150"
        data-controls-row="${a.id}"
      >
        <!-- Watts -->
        <div class="flex flex-col items-center lg:items-start gap-1 flex-1 lg:flex-none justify-center lg:justify-start lg:order-2">
          <span class="lg:hidden text-[9px] font-mono uppercase tracking-wider text-text-muted">Watts</span>
          <div class="flex items-center gap-1 w-full justify-center lg:justify-start">
            <label class="sr-only" for="watts-${a.id}">Watts for ${safeName}</label>
            <input
              id="watts-${a.id}"
              type="number" value="${a.watts}" min="1" max="99999"
              class="w-full sm:w-20 rounded-lg px-1.5 h-11 sm:h-8 text-center font-mono text-xs sm:text-sm focus:outline-none transition-colors border border-accent/20 hover:border-accent cursor-pointer bg-input/50"
              data-action="update-watts" data-id="${a.id}"
              aria-label="Watts for ${safeName}"
            />
            <span class="hidden lg:block text-[9px] sm:text-[11px] text-text-muted font-mono uppercase w-3 text-center">W</span>
          </div>
        </div>

        <!-- Qty stepper -->
        <div class="flex flex-col items-center gap-1 flex-1 lg:flex-none justify-center lg:order-3">
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

        <!-- Hours -->
        <div class="flex flex-col items-center gap-1 flex-1 lg:flex-none justify-center lg:order-4">
          <span class="lg:hidden text-[9px] font-mono uppercase tracking-wider text-text-muted">Hrs/Day</span>
          <div class="flex items-center gap-1 w-full justify-center">
            <label class="sr-only" for="hours-${a.id}">Hours per day for ${safeName}</label>
            <input
              id="hours-${a.id}"
              type="number" value="${a.hours}" min="0" max="24" step="0.25"
              class="w-full sm:w-16 rounded-lg px-1.5 h-11 sm:h-8 text-center font-mono text-xs sm:text-sm focus:outline-none transition-colors border border-accent/20 hover:border-accent cursor-pointer bg-input/50"
              data-action="update-hours" data-id="${a.id}"
              aria-label="Hours per day for ${safeName}"
            />
            <span class="hidden lg:block text-[9px] sm:text-[11px] text-text-muted font-mono uppercase w-5 text-center">h/d</span>
          </div>
          <span class="hours-error hidden text-[8px] sm:text-[9px] text-danger font-mono font-bold uppercase absolute mt-6" data-error-id="${a.id}">Max 24h</span>
        </div>

        <!-- Delete action (custom appliances only) -->
        <div class="flex-shrink-0 w-8 h-11 sm:w-8 sm:h-8 flex items-center justify-center lg:order-6 ml-auto">
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
      </div>
    </div>`;
}
