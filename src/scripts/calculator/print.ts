// ─────────────────────────────────────────────────────────
// PRINT POPULATOR — all print layout DOM population functions.
// Extracted from the 400-line calculate() God Function.
//
// Fixes (Phase 1):
//   - Task 4  : subsidyUnits read from appState, no double parse
//   - Audit #11: sessionReportId generated once per page load,
//               not on every calculate() call (every 80ms!)
// ─────────────────────────────────────────────────────────

import type { Appliance } from '@/types';
import type { CalculationResult } from '@/types';
import type { InsightResult } from '@/utils/insights';
import type { HealthScoreResult } from '@/utils/health';
import { SECTIONS } from '@/data/appliances';
import { calculateRowKWh } from '@/utils/calculations';
import { calculateCategoryBreakdown, generateSavingsTips, getHighConsumptionAlerts } from '@/utils/health';
import { escapeHtml } from '@/utils/rowTemplate';
import { setText } from './dom';
import { appState } from './state';
import { REGION_SETTINGS } from './constants';
import { VOLTAGE_V } from '@/data/constants';

// ── Report ID (stable per session — FIX audit #11) ───────
let sessionReportId: string | null = null;

/** Call on astro:page-load to refresh report ID for each new session. */
export function resetReportId(): void {
  sessionReportId = null;
}

function getOrCreateReportId(): string {
  if (!sessionReportId) {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    sessionReportId = `ELC-${year}${month}${day}-${Math.floor(Math.random() * 90000 + 10000)}`;
  }
  return sessionReportId;
}

// ── Print Population Functions ────────────────────────────

export function populatePrintBasic(result: CalculationResult): void {
  const localDate = new Date();
  setText('print-report-id', getOrCreateReportId());
  setText('print-date', localDate.toLocaleDateString(navigator.language || 'en', { dateStyle: 'long' }));
  setText('print-total-kw', (result.totalWatts / 1000).toFixed(2));
  setText('print-daily-kwh', result.dailyKWh.toFixed(2));
  setText('print-monthly-kwh', Math.round(result.monthlyKWh).toString());

  const pOrigEl = document.getElementById('print-monthly-kwh-original');
  if (pOrigEl) pOrigEl.classList.add('hidden');

  document.querySelectorAll<HTMLElement>('.print-brand-url').forEach(el => {
    el.innerHTML = '<a href="https://electricityloadcalculator.com" style="color:var(--accent) !important;text-decoration:underline;">electricityloadcalculator.com</a>';
  });
}

export function populatePrintAppliances(appliances: Appliance[]): void {
  const printList = document.getElementById('print-appliances-list');
  if (!printList) return;

  let html = `
    <div class="flex text-[10px] font-bold uppercase tracking-widest py-2 mb-1 border-b-2 border-border text-text-muted">
      <span class="flex-1">Home Appliance</span>
      <span class="w-32 text-right">kWh(unit)/day</span>
    </div>
  `;

  const included = appliances.filter(a => a.qty > 0);
  SECTIONS.forEach(section => {
    const sectionItems = included.filter(a => section.categories.includes(a.category));
    if (sectionItems.length === 0) return;
    html += `<div class="pt-2"><h3 class="text-[10px] font-bold uppercase tracking-widest mb-2 border-l-2 pl-2" style="color:#F4A826; border-color:#F4A826">${section.title}</h3><div class="space-y-1">`;
    section.categories.forEach(cat => {
      included.filter(a => a.category === cat).forEach(a => {
        html += `
          <div class="flex justify-between items-center text-[11px] py-0.5">
            <div class="flex-1"><span class="font-medium text-text-primary">${escapeHtml(a.name)}</span><span class="text-text-muted ml-2 text-[9px]">${a.qty} × ${a.watts}W</span></div>
            <div class="text-right font-mono font-medium text-text-primary">${calculateRowKWh(a).toFixed(2)}</div>
          </div>`;
      });
    });
    html += `</div></div>`;
  });

  printList.innerHTML = html || '<p class="text-text-muted italic">No active appliances selected.</p>';
}

export function populatePrintInsights(result: CalculationResult, insights: InsightResult): void {
  const operatingCurrent = result.totalWatts / VOLTAGE_V;

  setText('print-analysis-load', result.totalKW.toFixed(2));
  setText('print-analysis-daily', result.dailyKWh.toFixed(2));
  setText('print-analysis-monthly', Math.round(result.monthlyKWh).toString());
  setText('print-analysis-current', operatingCurrent.toFixed(1));

  setText('print-matrix-mcb', insights.recommendedMCB);
  setText('print-matrix-cable', insights.recommendedCable);
  setText('print-matrix-inverter', insights.recommendedInverter);
  setText('print-matrix-solar', insights.recommendedSolar);
  setText('print-matrix-stabilizer', insights.recommendedStabilizer);

  setText('print-det-mcb', insights.recommendedMCB);
  setText('print-det-mcb-load', result.totalKW.toFixed(2));
  setText('print-det-mcb-curr', operatingCurrent.toFixed(1));

  setText('print-det-cable', insights.recommendedCable);
  setText('print-det-cab-curr', operatingCurrent.toFixed(1));
  setText('print-det-cab-mcb', insights.recommendedMCB);

  setText('print-det-inverter', insights.recommendedInverter);
  setText('print-det-inv-load', result.totalKW.toFixed(2));
  setText('print-det-inv-req', (result.totalKW * 1.2).toFixed(2));

  setText('print-det-solar', insights.recommendedSolar);
  setText('print-det-sol-units', Math.round(result.monthlyKWh).toString());

  setText('print-det-stabilizer', insights.recommendedStabilizer);
  setText('print-det-stab-load', result.totalKW.toFixed(2));
  setText('print-det-stab-req', (result.totalKW * 1.3).toFixed(2));
}

const HEALTH_DESC: Record<string, string> = {
  Excellent: 'Your electrical setup is highly efficient and safe. Load distribution is well-balanced across appliances.',
  Good:      'Overall healthy configuration. Some minor energy optimization opportunities identified.',
  Fair:      'Functional but inefficient. High reliance on specific appliances or near-capacity load levels detected.',
  Poor:      'Immediate attention recommended. System is operating at inefficient levels with potential safety risks.',
};

export function populatePrintHealth(health: HealthScoreResult, result: CalculationResult): void {
  setText('print-health-score', String(health.score));
  setText('print-health-score-large', String(health.score));
  setText('print-health-label', health.label);
  setText('print-health-desc', HEALTH_DESC[health.label] ?? '');

  const sub = health.subScores;
  const printDetails = document.getElementById('print-health-details');
  if (printDetails) {
    printDetails.innerHTML = `
      <div class="space-y-1"><p class="text-[10px] text-text-muted uppercase font-bold">Load Utilization</p><div class="flex items-center gap-4"><div class="flex-1 h-1.5 bg-border/40 rounded-full overflow-hidden"><div class="h-full bg-accent" style="width:${(sub.utilization / 30) * 100}%"></div></div><span class="text-xs font-mono font-bold">${sub.utilization}/30</span></div></div>
      <div class="space-y-1"><p class="text-[10px] text-text-muted uppercase font-bold">Energy Efficiency</p><div class="flex items-center gap-4"><div class="flex-1 h-1.5 bg-border/40 rounded-full overflow-hidden"><div class="h-full bg-accent" style="width:${(sub.efficiency / 30) * 100}%"></div></div><span class="text-xs font-mono font-bold">${sub.efficiency}/30</span></div></div>
      <div class="space-y-1"><p class="text-[10px] text-text-muted uppercase font-bold">Safety Readiness</p><div class="flex items-center gap-4"><div class="flex-1 h-1.5 bg-border/40 rounded-full overflow-hidden"><div class="h-full bg-accent" style="width:${(sub.safety / 20) * 100}%"></div></div><span class="text-xs font-mono font-bold">${sub.safety}/20</span></div></div>
      <div class="space-y-1"><p class="text-[10px] text-text-muted uppercase font-bold">Solar Readiness</p><div class="flex items-center gap-4"><div class="flex-1 h-1.5 bg-border/40 rounded-full overflow-hidden"><div class="h-full bg-accent" style="width:${(sub.renewable / 20) * 100}%"></div></div><span class="text-xs font-mono font-bold">${sub.renewable}/20</span></div></div>
    `;
  }

  const reasons: string[] = [];
  const improvements: string[] = [];
  let potentialGain = 0;

  if (sub.utilization < 30) {
    const deduction = 30 - sub.utilization;
    if (result.loadPercent > 80) {
      reasons.push(`<li class="flex items-start gap-2"><span class="text-danger font-bold">⚠</span><span><strong>Load Utilization:</strong> High connected load concentration near maximum capacity reduced the score by ${deduction} points.</span></li>`);
      improvements.push(`<li class="flex items-start gap-2"><span class="text-accent font-bold">✓</span><span><strong>Improve Load Balance:</strong> Avoid simultaneous operation of high-load devices (e.g., AC and Geyser together).</span></li>`);
    } else if (result.loadPercent < 20) {
      reasons.push(`<li class="flex items-start gap-2"><span class="text-warning font-bold">⚠</span><span><strong>Load Utilization:</strong> Very low utilization of sanctioned capacity resulted in a ${deduction} point deduction.</span></li>`);
      improvements.push(`<li class="flex items-start gap-2"><span class="text-accent font-bold">✓</span><span><strong>Improve Load Balance:</strong> Consider downgrading sanctioned load if future expansion is not planned to save on fixed charges.</span></li>`);
    }
    potentialGain += deduction;
  } else {
    reasons.push(`<li class="flex items-start gap-2"><span class="text-success font-bold">✓</span><span class="text-text-muted"><strong>Load Utilization:</strong> Load is optimally balanced. Full points awarded.</span></li>`);
  }

  if (sub.efficiency < 30) {
    const deduction = 30 - sub.efficiency;
    reasons.push(`<li class="flex items-start gap-2"><span class="text-warning font-bold">⚠</span><span><strong>Energy Efficiency:</strong> Specific appliances contribute disproportionately to total energy use, causing a ${deduction} point deduction.</span></li>`);
    improvements.push(`<li class="flex items-start gap-2"><span class="text-accent font-bold">✓</span><span><strong>Improve Energy Efficiency:</strong> Replace older models of the top consumer (${result.topConsumerName}) with BEE 5-star rated equivalents.</span></li>`);
    improvements.push(`<li class="flex items-start gap-2"><span class="text-accent font-bold">✓</span><span><strong>Improve Energy Efficiency:</strong> Reduce unnecessary standby consumption by unplugging devices when not in use.</span></li>`);
    potentialGain += deduction;
  } else {
    reasons.push(`<li class="flex items-start gap-2"><span class="text-success font-bold">✓</span><span class="text-text-muted"><strong>Energy Efficiency:</strong> Energy distribution is efficient. Full points awarded.</span></li>`);
  }

  if (sub.safety === 20) {
    reasons.push(`<li class="flex items-start gap-2"><span class="text-success font-bold">✓</span><span class="text-text-muted"><strong>Safety Readiness:</strong> Electrical recommendations are within acceptable residential standards. No major safety concerns detected.</span></li>`);
  }
  if (sub.renewable === 20) {
    reasons.push(`<li class="flex items-start gap-2"><span class="text-success font-bold">✓</span><span class="text-text-muted"><strong>Solar Readiness:</strong> Current energy profile is highly suitable for solar integration.</span></li>`);
  } else {
    const deduction = 20 - sub.renewable;
    reasons.push(`<li class="flex items-start gap-2"><span class="text-warning font-bold">⚠</span><span><strong>Solar Readiness:</strong> Low monthly consumption reduces the immediate ROI of a solar installation (-${deduction} points).</span></li>`);
    improvements.push(`<li class="flex items-start gap-2"><span class="text-accent font-bold">✓</span><span><strong>Improve Solar Readiness:</strong> Monitor monthly energy usage trends before considering solar installation.</span></li>`);
    potentialGain += deduction;
  }

  const printReasons = document.getElementById('print-health-reasons');
  if (printReasons) printReasons.innerHTML = reasons.join('');

  const printImprovements = document.getElementById('print-health-improvements');
  if (printImprovements) {
    printImprovements.innerHTML = improvements.length > 0
      ? improvements.join('')
      : '<li class="text-text-muted italic">Your system is highly optimized. Maintain current usage patterns.</li>';
  }

  const potentialScore = Math.min(100, health.score + Math.round(potentialGain * 0.8));
  setText('print-health-potential-score', `${potentialScore} / 100`);

  const verdictList = document.getElementById('print-verdict-findings');
  if (verdictList) {
    const findings: string[] = [];
    if (result.loadPercent < 50) findings.push('✓ Electrical load is within normal residential range.');
    else if (result.loadPercent < 80) findings.push('✓ Electrical load is moderate but within safe operating limits.');
    else findings.push('⚠ High load density detected; ensure main breaker is rated correctly.');

    findings.push('✓ Existing electrical sizing recommendations are suitable for your load profile.');
    if (sub.renewable > 10) findings.push('✓ Solar adoption is highly feasible based on consumption units.');
    if (result.totalKW > 2) findings.push('✓ Inverter backup planning is recommended for essential services.');

    const breakdown = calculateCategoryBreakdown(appState.appliances);
    if (breakdown.items[0]) {
      findings.push(`⚠ ${breakdown.items[0].category} contributes significant energy usage (${Math.round(breakdown.items[0].percent)}%).`);
    }
    findings.push('⚠ Energy optimization opportunities identified in your consumption profile.');
    verdictList.innerHTML = findings.map(f => `<li>${f}</li>`).join('');
  }
}

export function populatePrintConsumption(appliances: Appliance[], result: CalculationResult): void {
  if (result.dailyKWh === 0) return;
  const breakdown = calculateCategoryBreakdown(appliances);

  const printBreakdown = document.getElementById('print-breakdown-table');
  if (printBreakdown) {
    printBreakdown.innerHTML = breakdown.items.map(item => `
      <div class="flex text-sm py-1.5 border-b border-border">
        <span class="flex-1 text-text-muted">${item.category}</span>
        <span class="w-32 text-right font-mono">${item.kWhDay.toFixed(2)}</span>
        <span class="w-20 text-right font-mono font-semibold" style="color:var(--accent)">${Math.round(item.percent)}%</span>
      </div>
    `).join('');
  }
  setText('print-consumption-observation',
    `${breakdown.topCategory} contributes ${Math.round(breakdown.topPercent)}% of total energy consumption, representing the largest optimization opportunity.`
  );
}

export function populatePrintSavings(appliances: Appliance[], result: CalculationResult, health: HealthScoreResult): void {
  const savings = generateSavingsTips(appliances, result.monthlyKWh);
  setText('print-opt-priority', health.score > 80 ? 'Low' : (health.score > 50 ? 'Medium' : 'High'));
  setText('print-opt-target', savings.topConsumerName);
  setText('print-opt-impact', `${savings.potentialSavings.toFixed(1)} kWh(unit)/mo`);

  const printSaving = document.getElementById('print-saving-tips');
  if (printSaving) {
    printSaving.innerHTML = savings.tips.map(tip =>
      `<div class="flex items-start gap-2 text-sm text-text-muted"><span class="text-accent font-bold">✓</span><span>${tip}</span></div>`
    ).join('');
  }

  const actionPlan = document.getElementById('print-action-plan');
  if (actionPlan) {
    const topApp = appliances.filter(a => a.qty > 0).sort((a, b) => calculateRowKWh(b) - calculateRowKWh(a))[0];
    actionPlan.innerHTML = `
      <div class="space-y-4">
        <p class="text-xs font-bold uppercase tracking-widest text-accent">Immediate</p>
        <ul class="text-xs space-y-2 text-text-primary">
          <li>✓ Review ${topApp?.name || 'top appliance'} usage patterns</li>
          <li>✓ Implement standby power reduction</li>
          <li>✓ Verify MCB &amp; Cable sizes with electrician</li>
        </ul>
      </div>
      <div class="space-y-4 border-l border-border pl-6">
        <p class="text-xs font-bold uppercase tracking-widest text-accent">Short-Term</p>
        <ul class="text-xs space-y-2 text-text-primary">
          <li>✓ Consider inverter sizing for backup</li>
          <li>✓ Improve energy efficiency of lighting</li>
          <li>✓ Monitor weekly unit consumption</li>
        </ul>
      </div>
      <div class="space-y-4 border-l border-border pl-6">
        <p class="text-xs font-bold uppercase tracking-widest text-accent">Long-Term</p>
        <ul class="text-xs space-y-2 text-text-primary">
          <li>✓ Evaluate rooftop solar installation</li>
          <li>✓ Upgrade to 5-star rated appliances</li>
          <li>✓ Plan for future expansion capacity</li>
        </ul>
      </div>
    `;
  }
}

export function populatePrintAlerts(appliances: Appliance[], result: CalculationResult): void {
  const alerts = getHighConsumptionAlerts(appliances, result.dailyKWh);
  if (alerts.length === 0) return;
  const printAlerts = document.getElementById('print-high-consumption');
  if (printAlerts) {
    printAlerts.innerHTML = alerts.map(alert => `
      <div class="flex justify-between text-sm py-1.5 border-b border-border">
        <div>
          <span class="font-medium text-text-primary">⚠ ${alert.name}</span>
          <span class="text-text-muted ml-2 text-xs">${alert.reason}</span>
        </div>
        <span class="font-mono font-semibold flex-shrink-0 ml-4" style="color:var(--accent)">${alert.kWhDay.toFixed(1)}</span>
      </div>
    `).join('');
  }
}

/** FIX (Task 4): subsidyUnits now read from appState — no double JSON.parse() */
export function populatePrintCost(result: CalculationResult): void {
  const pCost = document.getElementById('aprint-cost-estimator');
  if (!pCost) return;

  if (!appState.tariff || appState.tariff <= 0) {
    pCost.style.display = 'none';
    return;
  }

  const symbol = appState.currentCurrencySymbol || REGION_SETTINGS[appState.currentCurrency]?.symbol || '₹';
  const billableUnits = Math.max(0, result.monthlyKWh - appState.subsidyUnits);
  const fmt = (v: number) => `${symbol}${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  pCost.style.display = '';
  setText('aprint-cost-rate', `${symbol}${appState.tariff}/kWh(unit)`);
  setText('aprint-estimated-cost', fmt(billableUnits * appState.tariff));
  setText('aprint-cost-daily', `${fmt((billableUnits * appState.tariff) / 30)} / day`);
  setText('aprint-cost-yearly', `${fmt(billableUnits * appState.tariff * 12)} / year`);

  const billableEl = document.getElementById('aprint-cost-billable');
  const origEl = document.getElementById('aprint-cost-monthly-kwh-original');
  const noteEl = document.getElementById('aprint-cost-subsidy-note');

  if (billableEl) billableEl.textContent = Math.round(billableUnits).toString();

  if (appState.subsidyUnits > 0) {
    if (origEl) { origEl.textContent = Math.round(result.monthlyKWh).toString(); origEl.classList.remove('hidden'); }
    if (noteEl) { noteEl.textContent = `Includes ${Math.round(appState.subsidyUnits)} kWh(unit) subsidy reduction`; noteEl.classList.remove('hidden'); }
  } else {
    origEl?.classList.add('hidden');
    noteEl?.classList.add('hidden');
  }

  // Sync executive summary section
  const pSummaryVal = document.getElementById('print-monthly-kwh');
  const pAnalysisVal = document.getElementById('print-analysis-monthly');
  const pSummaryOrigEl = document.getElementById('print-monthly-kwh-original');
  if (pSummaryVal) pSummaryVal.textContent = Math.round(result.monthlyKWh).toString();
  if (pAnalysisVal) pAnalysisVal.textContent = Math.round(result.monthlyKWh).toString();
  pSummaryOrigEl?.classList.add('hidden');
}
