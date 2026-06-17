import {
  VOLTAGE_V,
  MCB_SAFETY_MARGIN,
  INVERTER_OVERHEAD,
  SOLAR_PEAK_SUN_HOURS,
  DAYS_PER_MONTH,
  MCB_RATINGS,
  INVERTER_STANDARDS,
  CABLE_BY_MCB,
  STABILIZER_STANDARDS,
  STABILIZER_OVERHEAD,
} from '../data/constants';

export interface InsightResult {
  recommendedMCB: string;
  mcbAmps: number;
  recommendedCable: string;
  recommendedInverter: string;
  inverterKVA: number;
  recommendedSolar: string;
  solarKW: number;
  recommendedStabilizer: string;
  stabilizerKVA: number;
}

export function calculateInsights(totalLoadKW: number, monthlyKWh: number): InsightResult {
  // MCB — design current includes 25% safety margin per IEC 60898
  const current = (totalLoadKW * 1000) / VOLTAGE_V;
  const designCurrent = current * MCB_SAFETY_MARGIN;
  const mcbAmps = MCB_RATINGS.find(r => r >= designCurrent) ?? 100;
  const recommendedMCB = `${mcbAmps}A C-Curve`;

  // Cable — derived from MCB rating
  const cableSize = CABLE_BY_MCB[mcbAmps] ?? '35';
  const recommendedCable = `${cableSize} sq mm Copper`;

  // Inverter — 20% overhead above connected load
  const rawKVA = totalLoadKW * INVERTER_OVERHEAD;
  const inverterKVA = INVERTER_STANDARDS.find(s => s >= rawKVA) ?? 15;
  const recommendedInverter = `${inverterKVA} kVA`;

  // Solar — based on monthly kWh and average peak sun hours
  const monthlyPeakSunHours = SOLAR_PEAK_SUN_HOURS * DAYS_PER_MONTH;
  const rawSolar = monthlyKWh / monthlyPeakSunHours;
  const solarKW = Math.max(0.5, Math.round(rawSolar * 2) / 2);
  const recommendedSolar = `${solarKW} kW Solar System`;

  // Stabilizer — 30% overhead above connected load
  const rawStabilizer = totalLoadKW * STABILIZER_OVERHEAD;
  const stabilizerKVA = STABILIZER_STANDARDS.find(s => s >= rawStabilizer) ?? 15;
  const recommendedStabilizer = `${stabilizerKVA} kVA Mainline`;

  return {
    recommendedMCB,
    mcbAmps,
    recommendedCable,
    recommendedInverter,
    inverterKVA,
    recommendedSolar,
    solarKW,
    recommendedStabilizer,
    stabilizerKVA,
  };
}

