import type { Appliance } from '../types';

export function calculateRowKWh(appliance: Appliance): number {
  return (appliance.watts * appliance.qty * appliance.hours) / 1000;
}

export interface CalculationResult {
  totalWatts: number;
  dailyKWh: number;
  monthlyKWh: number;
  monthlyBill: number;
  loadPercent: number;
  topConsumer: Appliance | null;
}

export function calculateTotals(
  appliances: Appliance[],
  tariff: number,
  maxCapacityKW: number
): CalculationResult {
  const included = appliances.filter((a) => a.qty > 0);

  const totalWatts = included.reduce((s, a) => s + a.watts * a.qty, 0);
  const dailyKWh = included.reduce((s, a) => s + calculateRowKWh(a), 0);
  const monthlyKWh = dailyKWh * 30;
  const monthlyBill = monthlyKWh * tariff;
  const maxWatts = maxCapacityKW * 1000;
  const loadPercent = Math.min((totalWatts / maxWatts) * 100, 100);

  const topConsumer = included.reduce<Appliance | null>((best, a) => {
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
