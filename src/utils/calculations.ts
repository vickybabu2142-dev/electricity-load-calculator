import type { Appliance, CalculationResult, CategorySummary, ApplianceCategory } from '../types';

export function calculateRowKWh(appliance: Appliance): number {
  const watts = Math.max(0, appliance.watts);
  const qty = Math.max(0, appliance.qty);
  const hours = Math.max(0, Math.min(24, appliance.hours));
  return (watts * qty * hours) / 1000;
}

export function calculateTotals(
  appliances: Appliance[],
  tariff: number,
  maxCapacityKW: number
): CalculationResult {
  const included = appliances.filter((a) => a.qty > 0);

  const totalWatts = included.reduce((s, a) => s + Math.max(0, a.watts) * Math.max(0, a.qty), 0);
  const totalKW = totalWatts / 1000;
  const dailyKWh = included.reduce((s, a) => s + calculateRowKWh(a), 0);
  const monthlyKWh = dailyKWh * 30;
  const monthlyBill = monthlyKWh * tariff;
  const maxWatts = Math.max(0.1, maxCapacityKW) * 1000;
  const loadPercent = Math.min((totalWatts / maxWatts) * 100, 100);

  // Determine load level
  let loadLevel: CalculationResult['loadLevel'] = 'light';
  if (loadPercent >= 70) {
    loadLevel = 'heavy';
  } else if (loadPercent >= 30) {
    loadLevel = 'moderate';
  }

  // Find top consumer
  const topAppliance = included.reduce<Appliance | null>((best, a) => {
    if (!best) return a;
    const currentPower = a.watts * a.qty;
    const bestPower = best.watts * best.qty;
    return currentPower > bestPower ? a : best;
  }, null);

  // Calculate category summaries
  const categories: ApplianceCategory[] = [
    'Lighting', 'Fans & Cooling', 'Kitchen', 'Entertainment', 'Office & IT', 'Industrial', 'Other'
  ];

  const categorySummaries: CategorySummary[] = categories.map(cat => {
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
