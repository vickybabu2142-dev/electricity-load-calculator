import type { Appliance } from '../types';

// ── Category Colors ───────────────────────────────────────
export const CATEGORY_COLORS: Record<string, string> = {
  'Lighting':      '#FCD34D', // bright yellow   — distinct warm
  'Fans & Cooling':'#38BDF8', // sky blue         — cool/air
  'Kitchen':       '#4ADE80', // lime green       — fresh/food
  'Entertainment': '#818CF8', // indigo/violet    — screens
  'Other':         '#F87171', // coral red        — neutral catch-all
  'Office & IT':   '#2DD4BF', // teal             — tech/professional
  'Industrial':    '#94A3B8', // slate grey       — heavy machinery
};

// ── Consumption Breakdown ─────────────────────────────────
export interface CategoryBreakdownItem {
  category: string;
  kWhDay: number;
  percent: number;
  color: string;
}

export interface CategoryBreakdownResult {
  items: CategoryBreakdownItem[];
  topCategory: string;
  topPercent: number;
}

export function calculateCategoryBreakdown(appliances: Appliance[]): CategoryBreakdownResult {
  const active = appliances.filter(a => a.qty > 0);
  const totalKWh = active.reduce((s, a) => s + (a.watts * a.qty * Math.min(24, a.hours)) / 1000, 0);

  if (totalKWh === 0) return { items: [], topCategory: '—', topPercent: 0 };

  const ORDER = ['Fans & Cooling', 'Kitchen', 'Lighting', 'Entertainment', 'Other', 'Office & IT', 'Industrial'];

  const items: CategoryBreakdownItem[] = ORDER
    .map(cat => {
      const kWhDay = active
        .filter(a => a.category === cat)
        .reduce((s, a) => s + (a.watts * a.qty * Math.min(24, a.hours)) / 1000, 0);
      return { category: cat, kWhDay, percent: (kWhDay / totalKWh) * 100, color: CATEGORY_COLORS[cat] ?? '#94A3B8' };
    })
    .filter(i => i.kWhDay > 0)
    .sort((a, b) => b.kWhDay - a.kWhDay);

  const top = items[0];
  return { items, topCategory: top?.category ?? '—', topPercent: top?.percent ?? 0 };
}

// ── Energy Saving Tips ───────────────────────────────────
export interface SavingsTipsResult {
  topConsumerName: string;
  potentialSavings: number;
  tips: string[];
}

const TIPS_MAP: Array<{ keywords: string[]; tips: string[] }> = [
  {
    keywords: ['air conditioner', '1.5t', '2.0t', '1t', '2t', 'ac ('],
    tips: [
      'Raise thermostat by 1–2°C — saves ~6% energy per degree',
      'Use sleep / timer mode during night hours',
      'Clean or replace filters every month',
      'Keep doors and windows sealed while running',
      'Upgrade to a BEE 5-star inverter AC on next replacement',
    ],
  },
  {
    keywords: ['air cooler', 'cooler'],
    tips: [
      'Fill the water tank with ice-cold water for extra cooling',
      'Place the cooler near a window for fresh air intake',
      'Run only when humidity is low for best efficiency',
      'Clean the cooling pads monthly to maintain airflow',
    ],
  },
  {
    keywords: ['refrigerator', 'fridge'],
    tips: [
      'Check door gasket seal — replace if worn or loose',
      'Set temperature to 3–5°C, freezer to -18°C',
      'Maintain 5 cm clearance around the rear for ventilation',
      'Avoid placing hot food directly inside',
      'Defrost regularly if not auto-defrost model',
    ],
  },
  {
    keywords: ['geyser', 'water heater'],
    tips: [
      'Install a timer — heat water only 30 min before use',
      'Lower thermostat to 50°C (safe and efficient)',
      'Insulate hot water pipes to reduce heat loss',
      'Take shorter showers to reduce heating cycles',
    ],
  },
  {
    keywords: ['led', 'bulb', 'tube', 'spotlight', 'light'],
    tips: [
      'Replace any remaining CFLs with LED equivalents',
      'Install occupancy sensors in low-traffic areas',
      'Use task lighting instead of overhead floods',
      'Turn off lights when leaving a room',
    ],
  },
  {
    keywords: ['washing machine'],
    tips: [
      'Run only with full loads to maximise efficiency',
      'Use cold water wash — saves up to 90% of wash energy',
      'Schedule during off-peak tariff hours',
      'Clean the lint filter after every cycle',
    ],
  },
  {
    keywords: ['water pump', 'pump'],
    tips: [
      'Install a timer to avoid running during peak tariff hours',
      'Check pipes for leaks that force longer run times',
      'Use a pressure tank to reduce motor cycling',
    ],
  },
  {
    keywords: ['microwave', 'induction', 'cooktop', 'toaster', 'kettle', 'mixer'],
    tips: [
      'Use microwave instead of oven for smaller portions',
      'Match pot size to burner / induction zone',
      'Keep lids on pots to retain heat and cook faster',
      'Batch-cook meals to reduce total appliance run time',
    ],
  },
  {
    keywords: ['television', 'tv', 'home theater', 'monitor'],
    tips: [
      'Enable auto-brightness to reduce screen power draw',
      'Use sleep timer so the screen turns off automatically',
      'Unplug set-top box and soundbar when not in use',
      'Switch to a smaller or OLED screen on next replacement',
    ],
  },
];

const DEFAULT_TIPS = [
  'Turn off devices completely — avoid standby power drain',
  'Choose BEE 5-star rated appliances on next replacement',
  'Schedule high-wattage tasks during off-peak tariff hours',
  'Unplug chargers and adapters when not in use',
];

export function generateSavingsTips(appliances: Appliance[], monthlyBill: number): SavingsTipsResult {
  const active = appliances.filter(a => a.qty > 0);

  const top = active.reduce<Appliance | null>((best, a) => {
    if (!best) return a;
    const aKwh  = (a.watts * a.qty * Math.min(24, a.hours)) / 1000;
    const bKwh  = (best.watts * best.qty * Math.min(24, best.hours)) / 1000;
    return aKwh > bKwh ? a : best;
  }, null);

  if (!top) return { topConsumerName: '—', potentialSavings: 0, tips: DEFAULT_TIPS };

  const nameLower = top.name.toLowerCase();
  const matched = TIPS_MAP.find(entry => entry.keywords.some(kw => nameLower.includes(kw)));
  const tips = (matched?.tips ?? DEFAULT_TIPS).slice(0, 4);

  return { topConsumerName: top.name, potentialSavings: monthlyBill * 0.12, tips };
}

// ── High Consumption Alerts ───────────────────────────────
export interface HighConsumptionAlert {
  name: string;
  kWhDay: number;
  percent: number;
  reason: string;
}

export function getHighConsumptionAlerts(appliances: Appliance[], totalDailyKWh: number): HighConsumptionAlert[] {
  if (totalDailyKWh === 0) return [];

  return appliances
    .filter(a => a.qty > 0)
    .map(a => {
      const kWhDay = (a.watts * a.qty * Math.min(24, a.hours)) / 1000;
      const percent = (kWhDay / totalDailyKWh) * 100;
      return { name: a.name, kWhDay, percent, reason: `Accounts for ${Math.round(percent)}% of daily usage` };
    })
    .filter(a => a.percent >= 15)
    .sort((a, b) => b.kWhDay - a.kWhDay);
}

// ── Health Score ──────────────────────────────────────────
export interface HealthScoreResult {
  score: number;
  label: 'Poor' | 'Fair' | 'Good' | 'Excellent';
  color: string;
  subScores: {
    utilization: number;
    efficiency: number;
    safety: number;
    renewable: number;
  };
}

export function calculateHealthScore(params: {
  loadPercent: number;
  dailyKWh: number;
  topConsumerDailyKWh: number;
  monthlyKWh: number;
  hasMCB: boolean;
  hasCable: boolean;
}): HealthScoreResult {
  const { loadPercent, dailyKWh, topConsumerDailyKWh, monthlyKWh, hasMCB, hasCable } = params;

  // Load Utilization (30 pts) — optimal is 50–80% of configured capacity
  let utilization: number;
  if (loadPercent < 50) utilization = 20;
  else if (loadPercent < 80) utilization = 30;
  else if (loadPercent < 95) utilization = 20;
  else utilization = 10;

  // Energy Efficiency (30 pts) — penalises over-reliance on a single appliance
  const topPercent = dailyKWh > 0 ? (topConsumerDailyKWh / dailyKWh) * 100 : 0;
  let efficiency: number;
  if (topPercent < 40) efficiency = 30;
  else if (topPercent < 60) efficiency = 20;
  else efficiency = 10;

  // Safety Readiness (20 pts) — MCB and cable recommendations available
  let safety: number;
  if (hasMCB && hasCable) safety = 20;
  else if (hasMCB || hasCable) safety = 10;
  else safety = 0;

  // Renewable Readiness (20 pts) — higher consumption = stronger solar ROI
  let renewable: number;
  if (monthlyKWh < 200) renewable = 10;
  else if (monthlyKWh < 500) renewable = 15;
  else renewable = 20;

  const score = utilization + efficiency + safety + renewable;

  let label: HealthScoreResult['label'];
  let color: string;
  // Colors chosen to be distinct from both theme accents (amber dark / blue light)
  if (score <= 40) { label = 'Poor';      color = '#ef4444'; } // red
  else if (score <= 60) { label = 'Fair'; color = '#fb923c'; } // coral-orange
  else if (score <= 80) { label = 'Good'; color = '#3ecf6e'; } // emerald green
  else                  { label = 'Excellent'; color = '#22d3ee'; } // cyan

  return { score, label, color, subScores: { utilization, efficiency, safety, renewable } };
}
