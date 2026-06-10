/**
 * Standalone verification script for calculation logic.
 * Run with: node scripts/verify-logic.cjs
 */

const assert = require('assert');

// Logic duplicated from src/utils/calculations.ts for easy execution via standard node
function calculateRowKWh(appliance) {
  const watts = Math.max(0, appliance.watts);
  const qty = Math.max(0, appliance.qty);
  const hours = Math.max(0, Math.min(24, appliance.hours));
  return (watts * qty * hours) / 1000;
}

function calculateTotals(appliances, tariff, maxCapacityKW) {
  const included = appliances.filter((a) => a.qty > 0);

  const totalWatts = included.reduce((s, a) => s + Math.max(0, a.watts) * Math.max(0, a.qty), 0);
  const totalKW = totalWatts / 1000;
  const dailyKWh = included.reduce((s, a) => s + calculateRowKWh(a), 0);
  const monthlyKWh = dailyKWh * 30;
  const monthlyBill = monthlyKWh * tariff;
  const maxWatts = Math.max(0.1, maxCapacityKW) * 1000;
  const loadPercent = Math.min((totalWatts / maxWatts) * 100, 100);

  let loadLevel = 'light';
  if (loadPercent >= 70) {
    loadLevel = 'heavy';
  } else if (loadPercent >= 30) {
    loadLevel = 'moderate';
  }

  const topAppliance = included.reduce((best, a) => {
    if (!best) return a;
    const currentPower = a.watts * a.qty;
    const bestPower = best.watts * best.qty;
    return currentPower > bestPower ? a : best;
  }, null);

  const categories = [
    'Lighting', 'Fans & Cooling', 'Kitchen', 'Entertainment', 'Office & IT', 'Industrial', 'Other'
  ];

  const categorySummaries = categories.map(cat => {
    const catApps = appliances.filter(a => a.category === cat);
    const activeApps = catApps.filter(a => a.qty > 0);
    
    return {
      name: cat,
      totalWatts: activeApps.reduce((s, a) => s + a.watts * a.qty, 0),
      dailyKWh: activeApps.reduce((s, a) => s + calculateRowKWh(a), 0),
      applianceCount: catApps.length
    };
  });

  return {
    totalWatts,
    totalKW,
    loadPercent,
    dailyKWh,
    monthlyKWh,
    monthlyBill,
    topConsumerName: topAppliance ? topAppliance.name : '—',
    topConsumerWatts: topAppliance ? topAppliance.watts * topAppliance.qty : 0,
    loadLevel,
    categorySummaries,
  };
}

// ── Test Cases ──

console.log('Running calculation logic tests...');

try {
  // Test Case 1: Simple single appliance
  const testAppliances1 = [
    { name: 'Bulb', watts: 10, qty: 10, hours: 10, category: 'Lighting' }
  ];
  const res1 = calculateTotals(testAppliances1, 10, 1);
  
  assert.strictEqual(res1.totalWatts, 100, 'Total watts should be 100');
  assert.strictEqual(res1.totalKW, 0.1, 'Total KW should be 0.1');
  assert.strictEqual(res1.dailyKWh, 1, 'Daily kWh should be 1 (10*10*10/1000)');
  assert.strictEqual(res1.monthlyKWh, 30, 'Monthly kWh should be 30');
  assert.strictEqual(res1.monthlyBill, 300, 'Monthly bill should be 300 (30 * 10)');
  assert.strictEqual(res1.loadPercent, 10, 'Load percent should be 10% of 1kW (1000W)');
  assert.strictEqual(res1.loadLevel, 'light', 'Load level should be light');
  console.log('✓ Test Case 1 passed');

  // Test Case 2: Multiple appliances, one with qty 0
  const testAppliances2 = [
    { name: 'Bulb', watts: 10, qty: 10, hours: 10, category: 'Lighting' },
    { name: 'AC', watts: 2000, qty: 0, hours: 5, category: 'Fans & Cooling' }
  ];
  const res2 = calculateTotals(testAppliances2, 10, 1);
  assert.strictEqual(res2.totalWatts, 100, 'Qty 0 appliance should not count towards total watts');
  assert.strictEqual(res2.dailyKWh, 1, 'Qty 0 appliance should not count towards daily kWh');
  console.log('✓ Test Case 2 passed');

  // Test Case 3: Load Overlap / Max Capacity
  const testAppliances3 = [
    { name: 'Heater', watts: 2000, qty: 1, hours: 1, category: 'Other' }
  ];
  const res3 = calculateTotals(testAppliances3, 10, 1); // 1kW max
  assert.strictEqual(res3.loadPercent, 100, 'Load percent should cap at 100');
  assert.strictEqual(res3.loadLevel, 'heavy', 'Load level should be heavy at 100%');
  console.log('✓ Test Case 3 passed');

  // Test Case 4: Top Consumer identification
  const testAppliances4 = [
    { name: 'Light', watts: 50, qty: 2, hours: 24, category: 'Lighting' },
    { name: 'Oven', watts: 1500, qty: 1, hours: 1, category: 'Kitchen' }
  ];
  const res4 = calculateTotals(testAppliances4, 10, 5);
  assert.strictEqual(res4.topConsumerName, 'Oven', 'Oven should be top consumer');
  assert.strictEqual(res4.topConsumerWatts, 1500, 'Oven watts should be 1500');
  console.log('✓ Test Case 4 passed');

  // Test Case 5: Category Summaries
  const testAppliances5 = [
    { name: 'Bulb 1', watts: 10, qty: 1, hours: 5, category: 'Lighting' },
    { name: 'Bulb 2', watts: 20, qty: 2, hours: 5, category: 'Lighting' },
    { name: 'Fan', watts: 100, qty: 1, hours: 10, category: 'Fans & Cooling' }
  ];
  const res5 = calculateTotals(testAppliances5, 10, 5);
  const lighting = res5.categorySummaries.find(c => c.name === 'Lighting');
  assert.strictEqual(lighting.totalWatts, 50, 'Lighting total watts should be 50 (10*1 + 20*2)');
  assert.strictEqual(lighting.dailyKWh, 0.25, 'Lighting daily kWh should be 0.25 (50*5/1000)');
  assert.strictEqual(lighting.applianceCount, 2, 'Lighting appliance count should be 2');
  console.log('✓ Test Case 5 passed');

  // Test Case 6: Edge Case - 24h Cap and Negative Inputs
  const testAppliances6 = [
    { name: 'Impossible Fan', watts: -100, qty: 1, hours: 25, category: 'Fans & Cooling' }, // Watts -100 -> 0, Hours 25 -> 24
    { name: 'Ghost TV', watts: 500, qty: -2, hours: 5, category: 'Entertainment' } // Qty -2 -> 0
  ];
  const res6 = calculateTotals(testAppliances6, 10, 5);
  assert.strictEqual(res6.totalWatts, 0, 'Negative inputs should result in 0 watts');
  assert.strictEqual(res6.dailyKWh, 0, 'Negative inputs should result in 0 kWh');
  
  // Verify row-level clamping directly
  const clampedKWh = calculateRowKWh({ watts: 100, qty: 1, hours: 30 }); // 100W * 1 * 24h / 1000 = 2.4
  assert.strictEqual(clampedKWh, 2.4, 'Hours should be capped at 24 for row calculation');
  
  console.log('✓ Test Case 6 (Edge Cases) passed');

  console.log('\nALL CALCULATION TESTS PASSED SUCCESSFULLY! ⚡');
} catch (err) {
  console.error('\n❌ TEST FAILED:');
  console.error(err.message);
  process.exit(1);
}
