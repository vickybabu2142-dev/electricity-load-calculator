export interface InsightResult {
  recommendedMCB: string;
  mcbAmps: number;
  recommendedCable: string;
  recommendedInverter: string;
  inverterKVA: number;
  recommendedSolar: string;
  solarKW: number;
}

const MCB_RATINGS = [6, 10, 16, 20, 25, 32, 40, 63, 80, 100];
const INVERTER_STANDARDS = [1, 2, 3, 5, 7.5, 10, 15];

const CABLE_BY_MCB: Record<number, string> = {
  6: '1.0', 10: '1.5', 16: '2.5', 20: '2.5', 25: '4',
  32: '6', 40: '10', 63: '16', 80: '25', 100: '35',
};

export function calculateInsights(totalLoadKW: number, monthlyKWh: number): InsightResult {
  // MCB
  const current = (totalLoadKW * 1000) / 230;
  const designCurrent = current * 1.25;
  const mcbAmps = MCB_RATINGS.find(r => r >= designCurrent) ?? 100;
  const recommendedMCB = `${mcbAmps}A C-Curve`;

  // Cable (derived from MCB rating)
  const cableSize = CABLE_BY_MCB[mcbAmps] ?? '35';
  const recommendedCable = `${cableSize} sq mm Copper`;

  // Inverter
  const rawKVA = totalLoadKW * 1.2;
  const inverterKVA = INVERTER_STANDARDS.find(s => s >= rawKVA) ?? 15;
  const recommendedInverter = `${inverterKVA} kVA`;

  // Solar
  const rawSolar = monthlyKWh / 120;
  const solarKW = Math.max(0.5, Math.round(rawSolar * 2) / 2);
  const recommendedSolar = `${solarKW} kW Solar System`;

  return { recommendedMCB, mcbAmps, recommendedCable, recommendedInverter, inverterKVA, recommendedSolar, solarKW };
}
