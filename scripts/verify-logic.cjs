/**
 * Standalone verification script for calculation logic.
 * Run with: node scripts/verify-logic.js
 */

const assert = require('assert');

// Logic duplicated from src/utils/calculations.ts for easy execution via standard node
function calculateRowKWh(appliance) {
  return (appliance.watts * appliance.qty * appliance.hours) / 1000;
}

function calculateTotals(appliances, tariff, maxCapacityKW) {
  const included = appliances.filter((a) => a.included && a.qty > 0);
  const totalWatts = included.reduce((s, a) => s + a.watts * a.qty, 0);
  const dailyKWh = included.reduce((s, a) => s + calculateRowKWh(a), 0);
  const monthlyKWh = dailyKWh * 30;
  const monthlyBill = monthlyKWh * tariff;
  const maxWatts = maxCapacityKW * 1000;
  const loadPercent = Math.min((totalWatts / maxWatts) * 100, 100);

  const topConsumer = included.reduce((best, a) => {
    if (!best) return a;
    return a.watts * a.qty > best.watts * best.qty ? a : best;
  }, null);

  return {
    totalWatts,
    dailyKWh,
    monthlyKWh,
    monthlyBill,
    loadPercent,
    topConsumer,
  };
}

// ── Test Cases ──

console.log('Running calculation logic tests...');

try {
  // Test Case 1: Simple single appliance
  const testAppliances1 = [
    { name: 'Bulb', watts: 10, qty: 10, hours: 10, included: true }
  ];
  const res1 = calculateTotals(testAppliances1, 10, 1);
  
  assert.strictEqual(res1.totalWatts, 100, 'Total watts should be 100');
  assert.strictEqual(res1.dailyKWh, 1, 'Daily kWh should be 1 (10*10*10/1000)');
  assert.strictEqual(res1.monthlyKWh, 30, 'Monthly kWh should be 30');
  assert.strictEqual(res1.monthlyBill, 300, 'Monthly bill should be 300 (30 * 10)');
  assert.strictEqual(res1.loadPercent, 10, 'Load percent should be 10% of 1kW (1000W)');
  console.log('✓ Test Case 1 passed');

  // Test Case 2: Multiple appliances, one excluded
  const testAppliances2 = [
    { name: 'Bulb', watts: 10, qty: 10, hours: 10, included: true },
    { name: 'AC', watts: 2000, qty: 1, hours: 5, included: false }
  ];
  const res2 = calculateTotals(testAppliances2, 10, 1);
  assert.strictEqual(res2.totalWatts, 100, 'Excluded appliance should not count towards total watts');
  assert.strictEqual(res2.dailyKWh, 1, 'Excluded appliance should not count towards daily kWh');
  console.log('✓ Test Case 2 passed');

  // Test Case 3: Load Overlap / Max Capacity
  const testAppliances3 = [
    { name: 'Heater', watts: 2000, qty: 1, hours: 1, included: true }
  ];
  const res3 = calculateTotals(testAppliances3, 10, 1); // 1kW max
  assert.strictEqual(res3.loadPercent, 100, 'Load percent should cap at 100');
  console.log('✓ Test Case 3 passed');

  // Test Case 4: Top Consumer identification
  const testAppliances4 = [
    { name: 'Light', watts: 50, qty: 2, hours: 24, included: true },
    { name: 'Oven', watts: 1500, qty: 1, hours: 1, included: true }
  ];
  const res4 = calculateTotals(testAppliances4, 10, 5);
  assert.strictEqual(res4.topConsumer.name, 'Oven', 'Oven should be top consumer based on wattage * qty (1500 vs 100)');
  console.log('✓ Test Case 4 passed');

  console.log('\nALL CALCULATION TESTS PASSED SUCCESSFULLY! ⚡');
} catch (err) {
  console.error('\n❌ TEST FAILED:');
  console.error(err.message);
  process.exit(1);
}
