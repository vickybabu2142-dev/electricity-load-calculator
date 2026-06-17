// ─────────────────────────────────────────────────────────
// DOMAIN CONSTANTS — single source of truth for all
// electrical engineering values and shared numeric constants.
//
// Previously these were magic numbers scattered across:
//   insights.ts (230, 1.25, 1.2, 120)
//   calculations.ts (30, 100)
//   dom.ts (350)
// ─────────────────────────────────────────────────────────

/** Standard single-phase residential supply voltage (volts) */
export const VOLTAGE_V = 230;

/** MCB design current safety margin (IEC 60898 standard) */
export const MCB_SAFETY_MARGIN = 1.25;

/** Inverter capacity overhead above connected load */
export const INVERTER_OVERHEAD = 1.2;

/** Average days per month for energy billing estimates */
export const DAYS_PER_MONTH = 30;

/** Peak sun hours per day used for solar sizing */
export const SOLAR_PEAK_SUN_HOURS = 4; // 120 hrs/month ÷ 30 days

/** Animation duration for counter transitions (ms) */
export const COUNTER_ANIMATION_MS = 350;

/** Maximum appliance quantity allowed per row */
export const MAX_APPLIANCE_QTY = 500;

/** Standard MCB ampere ratings available in market */
export const MCB_RATINGS = [6, 10, 16, 20, 25, 32, 40, 63, 80, 100] as const;

/** Standard inverter kVA ratings available in market */
export const INVERTER_STANDARDS = [1, 2, 3, 5, 7.5, 10, 15] as const;

/** Standard mainline stabilizer kVA ratings available in market */
export const STABILIZER_STANDARDS = [1, 2, 3, 5, 7.5, 10, 15] as const;

/** Sizing safety factor overhead for mainline stabilizer */
export const STABILIZER_OVERHEAD = 1.3;

/** Copper cable size (sq mm) recommended per MCB rating */
export const CABLE_BY_MCB: Record<number, string> = {
  6: '1.0', 10: '1.5', 16: '2.5', 20: '2.5', 25: '4',
  32: '6',  40: '10',  63: '16',  80: '25',   100: '35',
};

