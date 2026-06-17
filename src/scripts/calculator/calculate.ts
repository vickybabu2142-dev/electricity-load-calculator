// ─────────────────────────────────────────────────────────
// CALCULATE — main orchestrator (was a 400-line God Function)
// Now 40 clean lines that call focused sub-functions.
// ─────────────────────────────────────────────────────────

import { calculateTotals, calculateRowKWh } from '@/utils/calculations';
import { calculateInsights } from '@/utils/insights';
import { calculateHealthScore } from '@/utils/health';
import { appState } from './state';
import { updateMainPanel, updateCategoryBadges, updateHealthScoreUI } from './panel';
import {
  populatePrintBasic,
  populatePrintAppliances,
  populatePrintInsights,
  populatePrintHealth,
  populatePrintConsumption,
  populatePrintSavings,
  populatePrintAlerts,
  populatePrintCost,
} from './print';

export function calculate(): void {
  const result = calculateTotals(appState.appliances, appState.tariff, appState.maxCapacityKW);
  const activeCount = appState.appliances.filter(a => a.qty > 0).length;

  const topConsumerDailyKWh = appState.appliances
    .filter(a => a.qty > 0)
    .reduce((best, a) => Math.max(best, calculateRowKWh(a)), 0);

  const health = calculateHealthScore({
    loadPercent: result.loadPercent,
    dailyKWh: result.dailyKWh,
    topConsumerDailyKWh,
    monthlyKWh: result.monthlyKWh,
    hasMCB: activeCount > 0,
    hasCable: activeCount > 0,
  });

  const insights = calculateInsights(result.totalKW, result.monthlyKWh);

  // ── Live UI panel ─────────────────────────────────────
  updateMainPanel(result, activeCount);
  updateCategoryBadges();
  updateHealthScoreUI(health, activeCount);

  // ── Print layout (only populated when content exists) ─
  if (activeCount > 0) {
    populatePrintBasic(result);
    populatePrintAppliances(appState.appliances);
    populatePrintInsights(result, insights);
    populatePrintHealth(health, result);
    populatePrintConsumption(appState.appliances, result);
    populatePrintSavings(appState.appliances, result, health);
    populatePrintAlerts(appState.appliances, result);
  }
  populatePrintCost(result); // always run — hides section when tariff is 0
}

/** FIX (audit #8): ReturnType<typeof setTimeout> instead of `any` */
export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return ((...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}

export const debouncedCalculate = debounce(calculate, 80);
