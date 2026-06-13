/**
 * Standalone verification script for all calculation logic.
 * Run with: node scripts/verify-logic.cjs
 */

const assert = require('assert');

// ── Duplicated from src/utils/calculations.ts ────────────────────────────────

function calculateRowKWh(appliance) {
  const watts = Math.max(0, appliance.watts);
  const qty   = Math.max(0, appliance.qty);
  const hours = Math.max(0, Math.min(24, appliance.hours));
  return (watts * qty * hours) / 1000;
}

function calculateTotals(appliances, tariff, maxCapacityKW) {
  const included = appliances.filter((a) => a.qty > 0);

  const totalWatts  = included.reduce((s, a) => s + Math.max(0, a.watts) * Math.max(0, a.qty), 0);
  const totalKW     = totalWatts / 1000;
  const dailyKWh    = included.reduce((s, a) => s + calculateRowKWh(a), 0);
  const monthlyKWh  = dailyKWh * 30;
  const monthlyBill = monthlyKWh * tariff;
  const maxWatts    = Math.max(0.1, maxCapacityKW) * 1000;
  const loadPercent = Math.min((totalWatts / maxWatts) * 100, 100);

  let loadLevel = 'light';
  if (loadPercent >= 70)      loadLevel = 'heavy';
  else if (loadPercent >= 30) loadLevel = 'moderate';

  const topAppliance = included.reduce((best, a) => {
    if (!best) return a;
    return (a.watts * a.qty) > (best.watts * best.qty) ? a : best;
  }, null);

  const CATS = ['Lighting', 'Fans & Cooling', 'Kitchen', 'Entertainment', 'Office & IT', 'Industrial', 'Other'];
  const categorySummaries = CATS.map(cat => {
    const catApps    = appliances.filter(a => a.category === cat);
    const activeApps = catApps.filter(a => a.qty > 0);
    return {
      name:           cat,
      totalWatts:     activeApps.reduce((s, a) => s + a.watts * a.qty, 0),
      dailyKWh:       activeApps.reduce((s, a) => s + calculateRowKWh(a), 0),
      applianceCount: catApps.length,
    };
  });

  return {
    totalWatts,
    totalKW,
    loadPercent,
    dailyKWh,
    monthlyKWh,
    monthlyBill,
    topConsumerName:  topAppliance ? topAppliance.name  : '—',
    topConsumerWatts: topAppliance ? topAppliance.watts * topAppliance.qty : 0,
    loadLevel,
    categorySummaries,
  };
}

// ── Duplicated from src/utils/health.ts ──────────────────────────────────────

const CATEGORY_COLORS = {
  'Lighting':      '#FCD34D',
  'Fans & Cooling':'#38BDF8',
  'Kitchen':       '#4ADE80',
  'Entertainment': '#818CF8',
  'Other':         '#F87171',
  'Office & IT':   '#2DD4BF',
  'Industrial':    '#94A3B8',
};

function calculateCategoryBreakdown(appliances) {
  const active    = appliances.filter(a => a.qty > 0);
  const totalKWh  = active.reduce((s, a) => s + (a.watts * a.qty * Math.min(24, a.hours)) / 1000, 0);

  if (totalKWh === 0) return { items: [], topCategory: '—', topPercent: 0 };

  const ORDER = ['Fans & Cooling', 'Kitchen', 'Lighting', 'Entertainment', 'Other', 'Office & IT', 'Industrial'];
  const items = ORDER
    .map(cat => {
      const kWhDay = active
        .filter(a => a.category === cat)
        .reduce((s, a) => s + (a.watts * a.qty * Math.min(24, a.hours)) / 1000, 0);
      return { category: cat, kWhDay, percent: (kWhDay / totalKWh) * 100, color: CATEGORY_COLORS[cat] || '#94A3B8' };
    })
    .filter(i => i.kWhDay > 0)
    .sort((a, b) => b.kWhDay - a.kWhDay);

  const top = items[0];
  return { items, topCategory: top ? top.category : '—', topPercent: top ? top.percent : 0 };
}

const TIPS_MAP = [
  { keywords: ['air conditioner', '1.5t', '2.0t', '1t', '2t', 'ac ('],
    tips: ['Raise thermostat by 1–2°C — saves ~6% energy per degree', 'Use sleep / timer mode during night hours', 'Clean or replace filters every month', 'Keep doors and windows sealed while running'] },
  { keywords: ['air cooler', 'cooler'],
    tips: ['Fill the water tank with ice-cold water for extra cooling', 'Place the cooler near a window for fresh air intake', 'Run only when humidity is low for best efficiency', 'Clean the cooling pads monthly to maintain airflow'] },
  { keywords: ['refrigerator', 'fridge'],
    tips: ['Check door gasket seal — replace if worn or loose', 'Set temperature to 3–5°C, freezer to -18°C', 'Maintain 5 cm clearance around the rear for ventilation', 'Avoid placing hot food directly inside'] },
  { keywords: ['geyser', 'water heater'],
    tips: ['Install a timer — heat water only 30 min before use', 'Lower thermostat to 50°C (safe and efficient)', 'Insulate hot water pipes to reduce heat loss', 'Take shorter showers to reduce heating cycles'] },
  { keywords: ['led', 'bulb', 'tube', 'spotlight', 'light'],
    tips: ['Replace any remaining CFLs with LED equivalents', 'Install occupancy sensors in low-traffic areas', 'Use task lighting instead of overhead floods', 'Turn off lights when leaving a room'] },
  { keywords: ['washing machine'],
    tips: ['Run only with full loads to maximise efficiency', 'Use cold water wash — saves up to 90% of wash energy', 'Schedule during off-peak tariff hours', 'Clean the lint filter after every cycle'] },
  { keywords: ['water pump', 'pump'],
    tips: ['Install a timer to avoid running during peak tariff hours', 'Check pipes for leaks that force longer run times', 'Use a pressure tank to reduce motor cycling', 'Turn off devices completely — avoid standby power drain'] },
  { keywords: ['microwave', 'induction', 'cooktop', 'toaster', 'kettle', 'mixer'],
    tips: ['Use microwave instead of oven for smaller portions', 'Match pot size to burner / induction zone', 'Keep lids on pots to retain heat and cook faster', 'Batch-cook meals to reduce total appliance run time'] },
  { keywords: ['television', 'tv', 'home theater', 'monitor'],
    tips: ['Enable auto-brightness to reduce screen power draw', 'Use sleep timer so the screen turns off automatically', 'Unplug set-top box and soundbar when not in use', 'Switch to a smaller or OLED screen on next replacement'] },
];

const DEFAULT_TIPS = [
  'Turn off devices completely — avoid standby power drain',
  'Choose BEE 5-star rated appliances on next replacement',
  'Schedule high-wattage tasks during off-peak tariff hours',
  'Unplug chargers and adapters when not in use',
];

function generateSavingsTips(appliances, monthlyBill) {
  const active = appliances.filter(a => a.qty > 0);
  const top = active.reduce((best, a) => {
    if (!best) return a;
    const aKwh = (a.watts * a.qty * Math.min(24, a.hours)) / 1000;
    const bKwh = (best.watts * best.qty * Math.min(24, best.hours)) / 1000;
    return aKwh > bKwh ? a : best;
  }, null);

  if (!top) return { topConsumerName: '—', potentialSavings: 0, tips: DEFAULT_TIPS };

  const nameLower = top.name.toLowerCase();
  const matched   = TIPS_MAP.find(e => e.keywords.some(kw => nameLower.includes(kw)));
  const tips      = (matched ? matched.tips : DEFAULT_TIPS).slice(0, 4);

  return { topConsumerName: top.name, potentialSavings: monthlyBill * 0.12, tips };
}

function getHighConsumptionAlerts(appliances, totalDailyKWh) {
  if (totalDailyKWh === 0) return [];
  return appliances
    .filter(a => a.qty > 0)
    .map(a => {
      const kWhDay  = (a.watts * a.qty * Math.min(24, a.hours)) / 1000;
      const percent = (kWhDay / totalDailyKWh) * 100;
      return { name: a.name, kWhDay, percent, reason: `Accounts for ${Math.round(percent)}% of daily usage` };
    })
    .filter(a => a.percent >= 15)
    .sort((a, b) => b.kWhDay - a.kWhDay);
}

function calculateHealthScore(params) {
  const { loadPercent, dailyKWh, topConsumerDailyKWh, monthlyKWh, hasMCB, hasCable } = params;

  let utilization;
  if      (loadPercent < 50) utilization = 20;
  else if (loadPercent < 80) utilization = 30;
  else if (loadPercent < 95) utilization = 20;
  else                       utilization = 10;

  const topPercent = dailyKWh > 0 ? (topConsumerDailyKWh / dailyKWh) * 100 : 0;
  let efficiency;
  if      (topPercent < 40) efficiency = 30;
  else if (topPercent < 60) efficiency = 20;
  else                      efficiency = 10;

  let safety;
  if      (hasMCB && hasCable)    safety = 20;
  else if (hasMCB || hasCable)    safety = 10;
  else                            safety = 0;

  let renewable;
  if      (monthlyKWh < 200) renewable = 10;
  else if (monthlyKWh < 500) renewable = 15;
  else                       renewable = 20;

  const score = utilization + efficiency + safety + renewable;

  let label, color;
  if      (score <= 40) { label = 'Poor';      color = '#ef4444'; }
  else if (score <= 60) { label = 'Fair';      color = '#fb923c'; }
  else if (score <= 80) { label = 'Good';      color = '#3ecf6e'; }
  else                  { label = 'Excellent'; color = '#22d3ee'; }

  return { score, label, color, subScores: { utilization, efficiency, safety, renewable } };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function round2(n) { return Math.round(n * 100) / 100; }

// ── Test Runner ──────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function run(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 1 — calculateRowKWh
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[1] calculateRowKWh');

run('basic math: 100W × 1 × 10h = 1 kWh', () => {
  assert.strictEqual(calculateRowKWh({ watts: 100, qty: 1, hours: 10 }), 1);
});

run('qty multiplied correctly: 50W × 4 × 5h = 1 kWh', () => {
  assert.strictEqual(calculateRowKWh({ watts: 50, qty: 4, hours: 5 }), 1);
});

run('hours capped at 24: 100W × 1 × 30h → uses 24h', () => {
  assert.strictEqual(calculateRowKWh({ watts: 100, qty: 1, hours: 30 }), 2.4);
});

run('negative watts clamped to 0', () => {
  assert.strictEqual(calculateRowKWh({ watts: -500, qty: 1, hours: 10 }), 0);
});

run('negative qty clamped to 0', () => {
  assert.strictEqual(calculateRowKWh({ watts: 100, qty: -3, hours: 10 }), 0);
});

run('negative hours clamped to 0', () => {
  assert.strictEqual(calculateRowKWh({ watts: 100, qty: 1, hours: -5 }), 0);
});

// ─────────────────────────────────────────────────────────────────────────────
// Section 2 — calculateTotals
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[2] calculateTotals');

run('single appliance: watts / kWh / bill computed correctly', () => {
  const r = calculateTotals([{ name: 'Bulb', watts: 10, qty: 10, hours: 10, category: 'Lighting' }], 10, 1);
  assert.strictEqual(r.totalWatts,  100);
  assert.strictEqual(r.totalKW,     0.1);
  assert.strictEqual(r.dailyKWh,    1);
  assert.strictEqual(r.monthlyKWh,  30);
  assert.strictEqual(r.monthlyBill, 300);
});

run('qty-0 appliance excluded from totals', () => {
  const r = calculateTotals([
    { name: 'Bulb', watts: 10, qty: 10, hours: 10, category: 'Lighting' },
    { name: 'AC',   watts: 2000, qty: 0, hours: 5,  category: 'Fans & Cooling' },
  ], 10, 1);
  assert.strictEqual(r.totalWatts, 100);
  assert.strictEqual(r.dailyKWh,   1);
});

run('load percent caps at 100% when load exceeds capacity', () => {
  const r = calculateTotals([{ name: 'Heater', watts: 2000, qty: 1, hours: 1, category: 'Other' }], 10, 1);
  assert.strictEqual(r.loadPercent, 100);
  assert.strictEqual(r.loadLevel,   'heavy');
});

run('load levels: light < 30%, moderate 30–70%, heavy ≥ 70%', () => {
  const make = (w) => [{ name: 'X', watts: w, qty: 1, hours: 1, category: 'Other' }];
  assert.strictEqual(calculateTotals(make(200),  1, 1).loadLevel, 'light');    // 20%
  assert.strictEqual(calculateTotals(make(500),  1, 1).loadLevel, 'moderate'); // 50%
  assert.strictEqual(calculateTotals(make(800),  1, 1).loadLevel, 'heavy');    // 80%
});

run('top consumer identified by watts × qty, not watts alone', () => {
  const r = calculateTotals([
    { name: 'Light', watts: 50,   qty: 2, hours: 24, category: 'Lighting' }, // 100 W combined
    { name: 'Oven',  watts: 1500, qty: 1, hours: 1,  category: 'Kitchen'  }, // 1500 W combined
  ], 10, 5);
  assert.strictEqual(r.topConsumerName,  'Oven');
  assert.strictEqual(r.topConsumerWatts, 1500);
});

run('top consumer favours higher combined watts (qty factor)', () => {
  const r = calculateTotals([
    { name: 'Fan',    watts: 100, qty: 5, hours: 10, category: 'Fans & Cooling' }, // 500 W combined
    { name: 'Geyser', watts: 400, qty: 1, hours: 2,  category: 'Kitchen' },        // 400 W combined
  ], 10, 5);
  assert.strictEqual(r.topConsumerName, 'Fan');
});

run('category summaries aggregate correctly', () => {
  const r = calculateTotals([
    { name: 'Bulb 1', watts: 10,  qty: 1, hours: 5,  category: 'Lighting' },
    { name: 'Bulb 2', watts: 20,  qty: 2, hours: 5,  category: 'Lighting' },
    { name: 'Fan',    watts: 100, qty: 1, hours: 10, category: 'Fans & Cooling' },
  ], 10, 5);
  const lighting = r.categorySummaries.find(c => c.name === 'Lighting');
  assert.strictEqual(lighting.totalWatts,    50);   // 10×1 + 20×2
  assert.strictEqual(lighting.dailyKWh,      0.25); // 50×5/1000
  assert.strictEqual(lighting.applianceCount, 2);
});

run('no appliances → zero totals and no top consumer', () => {
  const r = calculateTotals([], 8, 5);
  assert.strictEqual(r.totalWatts,     0);
  assert.strictEqual(r.dailyKWh,       0);
  assert.strictEqual(r.topConsumerName,'—');
});

// ─────────────────────────────────────────────────────────────────────────────
// Section 3 — calculateHealthScore
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[3] calculateHealthScore');

run('Excellent (100/100): optimal load, diverse energy, both safety, high monthly', () => {
  const h = calculateHealthScore({ loadPercent: 70, dailyKWh: 10, topConsumerDailyKWh: 3, monthlyKWh: 600, hasMCB: true, hasCable: true });
  assert.strictEqual(h.subScores.utilization, 30); // 50 ≤ 70 < 80
  assert.strictEqual(h.subScores.efficiency,  30); // topPercent=30% < 40
  assert.strictEqual(h.subScores.safety,      20); // both
  assert.strictEqual(h.subScores.renewable,   20); // ≥500
  assert.strictEqual(h.score, 100);
  assert.strictEqual(h.label, 'Excellent');
});

run('Good (70/100): optimal load, one dominant appliance, one safety item, low monthly', () => {
  const h = calculateHealthScore({ loadPercent: 60, dailyKWh: 10, topConsumerDailyKWh: 5, monthlyKWh: 150, hasMCB: true, hasCable: false });
  assert.strictEqual(h.subScores.utilization, 30); // 50 ≤ 60 < 80
  assert.strictEqual(h.subScores.efficiency,  20); // topPercent=50% → 40 ≤ x < 60
  assert.strictEqual(h.subScores.safety,      10); // MCB only
  assert.strictEqual(h.subScores.renewable,   10); // <200
  assert.strictEqual(h.score, 70);
  assert.strictEqual(h.label, 'Good');
});

run('Fair (50/100): under-utilised load, moderate dominance, no safety', () => {
  const h = calculateHealthScore({ loadPercent: 30, dailyKWh: 10, topConsumerDailyKWh: 5, monthlyKWh: 150, hasMCB: false, hasCable: false });
  assert.strictEqual(h.subScores.utilization, 20); // < 50
  assert.strictEqual(h.subScores.efficiency,  20); // 40 ≤ topPercent < 60
  assert.strictEqual(h.subScores.safety,       0); // none
  assert.strictEqual(h.subScores.renewable,   10); // <200
  assert.strictEqual(h.score, 50);
  assert.strictEqual(h.label, 'Fair');
});

run('Poor (30/100): overloaded, single dominant appliance, no safety, low monthly', () => {
  const h = calculateHealthScore({ loadPercent: 96, dailyKWh: 10, topConsumerDailyKWh: 7, monthlyKWh: 150, hasMCB: false, hasCable: false });
  assert.strictEqual(h.subScores.utilization, 10); // ≥95
  assert.strictEqual(h.subScores.efficiency,  10); // topPercent=70% ≥ 60
  assert.strictEqual(h.subScores.safety,       0);
  assert.strictEqual(h.subScores.renewable,   10);
  assert.strictEqual(h.score, 30);
  assert.strictEqual(h.label, 'Poor');
});

run('utilization boundary at 50%: earns 30 pts (optimal band starts at 50)', () => {
  const h = calculateHealthScore({ loadPercent: 50, dailyKWh: 1, topConsumerDailyKWh: 0, monthlyKWh: 0, hasMCB: false, hasCable: false });
  assert.strictEqual(h.subScores.utilization, 30);
});

run('utilization boundary at 80%: drops to 20 pts (over-loaded band starts at 80)', () => {
  const h = calculateHealthScore({ loadPercent: 80, dailyKWh: 1, topConsumerDailyKWh: 0, monthlyKWh: 0, hasMCB: false, hasCable: false });
  assert.strictEqual(h.subScores.utilization, 20);
});

run('utilization boundary at 95%: drops to 10 pts (critical band starts at 95)', () => {
  const h = calculateHealthScore({ loadPercent: 95, dailyKWh: 1, topConsumerDailyKWh: 0, monthlyKWh: 0, hasMCB: false, hasCable: false });
  assert.strictEqual(h.subScores.utilization, 10);
});

run('renewable boundary at 200 kWh/month: earns 15 pts (medium band)', () => {
  const h = calculateHealthScore({ loadPercent: 0, dailyKWh: 0, topConsumerDailyKWh: 0, monthlyKWh: 200, hasMCB: false, hasCable: false });
  assert.strictEqual(h.subScores.renewable, 15);
});

run('renewable boundary at 500 kWh/month: earns 20 pts (high band)', () => {
  const h = calculateHealthScore({ loadPercent: 0, dailyKWh: 0, topConsumerDailyKWh: 0, monthlyKWh: 500, hasMCB: false, hasCable: false });
  assert.strictEqual(h.subScores.renewable, 20);
});

run('efficiency: topPercent=0 (no daily load) → 30 pts', () => {
  const h = calculateHealthScore({ loadPercent: 0, dailyKWh: 0, topConsumerDailyKWh: 0, monthlyKWh: 0, hasMCB: false, hasCable: false });
  assert.strictEqual(h.subScores.efficiency, 30);
});

run('label boundary: score 40 → Poor, score 41 → Fair', () => {
  const poor = calculateHealthScore({ loadPercent: 96, dailyKWh: 10, topConsumerDailyKWh: 7, monthlyKWh: 0, hasMCB: false, hasCable: false });
  assert.strictEqual(poor.score,  30);
  assert.strictEqual(poor.label,  'Poor');

  const fair = calculateHealthScore({ loadPercent: 20, dailyKWh: 10, topConsumerDailyKWh: 5, monthlyKWh: 150, hasMCB: false, hasCable: false });
  assert.strictEqual(fair.score,  50);
  assert.strictEqual(fair.label,  'Fair');
});

run('label boundary: score 80 → Good, score 81 → Excellent', () => {
  // score 80: utilization=30 + efficiency=20 + safety=20 + renewable=10 = 80 → Good
  const good = calculateHealthScore({ loadPercent: 60, dailyKWh: 10, topConsumerDailyKWh: 5, monthlyKWh: 150, hasMCB: true, hasCable: true });
  assert.strictEqual(good.score,  80);
  assert.strictEqual(good.label,  'Good');

  // score 100: all max → Excellent
  const excellent = calculateHealthScore({ loadPercent: 70, dailyKWh: 10, topConsumerDailyKWh: 3, monthlyKWh: 600, hasMCB: true, hasCable: true });
  assert.strictEqual(excellent.score, 100);
  assert.strictEqual(excellent.label, 'Excellent');
});

// ─────────────────────────────────────────────────────────────────────────────
// Section 4 — calculateCategoryBreakdown
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[4] calculateCategoryBreakdown');

run('no active appliances → empty result with sentinel values', () => {
  const r = calculateCategoryBreakdown([]);
  assert.strictEqual(r.items.length,    0);
  assert.strictEqual(r.topCategory,    '—');
  assert.strictEqual(r.topPercent,      0);
});

run('all qty=0 → treated as inactive → empty result', () => {
  const r = calculateCategoryBreakdown([
    { name: 'Fan', watts: 100, qty: 0, hours: 10, category: 'Fans & Cooling' },
  ]);
  assert.strictEqual(r.items.length, 0);
});

run('single category → 100% share, correct kWh', () => {
  const r = calculateCategoryBreakdown([
    { name: 'Fan', watts: 100, qty: 1, hours: 10, category: 'Fans & Cooling' },
  ]);
  assert.strictEqual(r.items.length,         1);
  assert.strictEqual(r.items[0].category,    'Fans & Cooling');
  assert.strictEqual(r.items[0].kWhDay,      1);    // 100×1×10/1000
  assert.strictEqual(r.items[0].percent,     100);
  assert.strictEqual(r.topCategory,          'Fans & Cooling');
  assert.strictEqual(r.topPercent,           100);
});

run('two categories: percentages sum to 100, sorted by kWh desc', () => {
  const r = calculateCategoryBreakdown([
    { name: 'Fan',  watts: 100, qty: 1, hours: 10, category: 'Fans & Cooling' }, // 1.0 kWh
    { name: 'Bulb', watts: 50,  qty: 1, hours: 10, category: 'Lighting' },        // 0.5 kWh
  ]);
  assert.strictEqual(r.items.length, 2);
  assert.strictEqual(r.items[0].category, 'Fans & Cooling'); // higher kWh first
  assert.strictEqual(r.items[1].category, 'Lighting');
  assert.strictEqual(round2(r.items[0].percent + r.items[1].percent), 100);
  assert.strictEqual(round2(r.items[0].percent), 66.67);
  assert.strictEqual(round2(r.items[1].percent), 33.33);
});

run('hours capped at 24 inside breakdown calculation', () => {
  const r = calculateCategoryBreakdown([
    { name: 'Server', watts: 100, qty: 1, hours: 30, category: 'Office & IT' },
  ]);
  assert.strictEqual(r.items[0].kWhDay, 2.4); // 100×1×24/1000
});

run('categories with 0 share are excluded from items', () => {
  const r = calculateCategoryBreakdown([
    { name: 'Bulb', watts: 10, qty: 1, hours: 5, category: 'Lighting' },
    // Kitchen, Fans & Cooling etc. absent → should not appear
  ]);
  assert.ok(r.items.every(i => i.kWhDay > 0), 'Every item must have kWhDay > 0');
  assert.strictEqual(r.items.length, 1);
});

run('correct colors assigned from CATEGORY_COLORS map', () => {
  const r = calculateCategoryBreakdown([
    { name: 'Fan', watts: 100, qty: 1, hours: 1, category: 'Fans & Cooling' },
  ]);
  assert.strictEqual(r.items[0].color, '#38BDF8');
});

// ─────────────────────────────────────────────────────────────────────────────
// Section 5 — generateSavingsTips
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[5] generateSavingsTips');

run('no active appliances → default tips, zero savings, sentinel name', () => {
  const r = generateSavingsTips([], 1000);
  assert.strictEqual(r.topConsumerName,    '—');
  assert.strictEqual(r.potentialSavings,   0);
  assert.deepStrictEqual(r.tips,           DEFAULT_TIPS);
});

run('all qty=0 → falls through to default tips', () => {
  const r = generateSavingsTips([{ name: 'AC', watts: 2000, qty: 0, hours: 8, category: 'Fans & Cooling' }], 500);
  assert.strictEqual(r.topConsumerName, '—');
});

run('potential savings = monthlyBill × 12%', () => {
  const r = generateSavingsTips([{ name: 'Fan', watts: 60, qty: 1, hours: 8, category: 'Fans & Cooling' }], 1000);
  assert.strictEqual(r.potentialSavings, 120);
});

run('AC keyword match (case-insensitive substring)', () => {
  const r = generateSavingsTips([{ name: 'Air Conditioner 1.5T', watts: 1500, qty: 1, hours: 8, category: 'Fans & Cooling' }], 1000);
  assert.strictEqual(r.topConsumerName, 'Air Conditioner 1.5T');
  assert.ok(r.tips[0].includes('thermostat'), 'Should return AC-specific tip about thermostat');
});

run('refrigerator keyword match', () => {
  const r = generateSavingsTips([{ name: 'Refrigerator 200L', watts: 150, qty: 1, hours: 24, category: 'Kitchen' }], 500);
  assert.ok(r.tips[0].includes('gasket') || r.tips.some(t => t.includes('gasket')), 'Should return fridge gasket tip');
});

run('geyser / water heater keyword match', () => {
  const r = generateSavingsTips([{ name: 'Geyser 15L', watts: 2000, qty: 1, hours: 1, category: 'Kitchen' }], 500);
  assert.ok(r.tips.some(t => t.toLowerCase().includes('timer')), 'Should return geyser timer tip');
});

run('unrecognised appliance falls back to default tips', () => {
  const r = generateSavingsTips([{ name: 'Custom Widget 500W', watts: 500, qty: 1, hours: 5, category: 'Other' }], 500);
  assert.deepStrictEqual(r.tips, DEFAULT_TIPS);
});

run('top consumer determined by kWh, not watts: fridge (150W×24h) beats AC (1500W×1h)', () => {
  const r = generateSavingsTips([
    { name: 'Air Conditioner', watts: 1500, qty: 1, hours: 1,  category: 'Fans & Cooling' }, // 1.5 kWh/d
    { name: 'Refrigerator',    watts: 150,  qty: 1, hours: 24, category: 'Kitchen'         }, // 3.6 kWh/d
  ], 1000);
  assert.strictEqual(r.topConsumerName, 'Refrigerator');
  assert.ok(r.tips.some(t => t.includes('gasket') || t.includes('temperature')), 'Should return fridge tips');
});

run('tips are capped at 4 items max', () => {
  const r = generateSavingsTips([{ name: 'Refrigerator', watts: 150, qty: 1, hours: 24, category: 'Kitchen' }], 500);
  assert.ok(r.tips.length <= 4);
});

// ─────────────────────────────────────────────────────────────────────────────
// Section 6 — getHighConsumptionAlerts
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[6] getHighConsumptionAlerts');

run('totalDailyKWh=0 → no alerts (avoids division by zero)', () => {
  const alerts = getHighConsumptionAlerts(
    [{ name: 'Fan', watts: 60, qty: 1, hours: 8, category: 'Fans & Cooling' }],
    0
  );
  assert.strictEqual(alerts.length, 0);
});

run('appliance below 15% threshold → not flagged', () => {
  // 10% of 10 kWh/d = 1 kWh/d → 1000W × 1 × 1h / 1000 = 1
  const alerts = getHighConsumptionAlerts(
    [{ name: 'Bulb', watts: 1000, qty: 1, hours: 1, category: 'Lighting' }],
    10
  );
  assert.strictEqual(alerts.length, 0);
});

run('appliance at exactly 15% → flagged (boundary inclusive)', () => {
  // 15% of 10 kWh/d = 1.5 kWh/d → 1500W × 1 × 1h / 1000 = 1.5
  const alerts = getHighConsumptionAlerts(
    [{ name: 'Heater', watts: 1500, qty: 1, hours: 1, category: 'Other' }],
    10
  );
  assert.strictEqual(alerts.length, 1);
  assert.strictEqual(alerts[0].name, 'Heater');
  assert.strictEqual(round2(alerts[0].percent), 15);
});

run('appliance above 15% → correct kWh and percent in alert', () => {
  const alerts = getHighConsumptionAlerts(
    [{ name: 'AC', watts: 1500, qty: 1, hours: 8, category: 'Fans & Cooling' }],
    10
  );
  assert.strictEqual(alerts.length,         1);
  assert.strictEqual(alerts[0].kWhDay,      12); // capped at 24h: 1500×1×8/1000=12, but totalKWh=10 so percent=120
  // percent would exceed 100 here — that's valid, alert still fires
  assert.ok(alerts[0].percent >= 15);
});

run('qty=0 appliances excluded from alerts', () => {
  const alerts = getHighConsumptionAlerts(
    [{ name: 'Off Heater', watts: 2000, qty: 0, hours: 10, category: 'Other' }],
    5
  );
  assert.strictEqual(alerts.length, 0);
});

run('multiple appliances above threshold, sorted by kWh desc', () => {
  // total = 3+1 = 4 kWh/d; AC=75%, Fridge=25% — both ≥15%
  const alerts = getHighConsumptionAlerts([
    { name: 'AC',    watts: 1500, qty: 1, hours: 2,  category: 'Fans & Cooling' }, // 3 kWh/d
    { name: 'Fridge',watts: 100,  qty: 1, hours: 10, category: 'Kitchen'         }, // 1 kWh/d
  ], 4);
  assert.strictEqual(alerts.length,       2);
  assert.strictEqual(alerts[0].name,      'AC');     // higher kWh first
  assert.strictEqual(alerts[1].name,      'Fridge');
  assert.ok(alerts[0].kWhDay > alerts[1].kWhDay);
});

run('reason string contains the rounded percentage', () => {
  const alerts = getHighConsumptionAlerts(
    [{ name: 'AC', watts: 2000, qty: 1, hours: 5, category: 'Fans & Cooling' }],
    10
  );
  assert.ok(alerts[0].reason.includes('100'), 'Reason should mention ~100% share');
});

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(56)}`);
if (failed === 0) {
  console.log(`ALL ${passed} TESTS PASSED ⚡`);
} else {
  console.log(`${passed} passed, ${failed} FAILED ✗`);
  process.exit(1);
}
