// ─────────────────────────────────────────────────────────
// CALCULATOR CONSTANTS — single source of truth
// ─────────────────────────────────────────────────────────

export const STORAGE_KEY = 'electricity_load_calculator_state';

export const REGION_SETTINGS: Record<string, {
  locale: string;
  symbol: string;
  defaultTariff: number;
  step: number;
  defaultMaxKW: number;
}> = {
  INR: { locale: 'en-IN', symbol: '₹', defaultTariff: 8,    step: 0.5,  defaultMaxKW: 5  },
  USD: { locale: 'en-US', symbol: '$', defaultTariff: 0.15, step: 0.01, defaultMaxKW: 20 },
  EUR: { locale: 'de-DE', symbol: '€', defaultTariff: 0.35, step: 0.01, defaultMaxKW: 15 },
  GBP: { locale: 'en-GB', symbol: '£', defaultTariff: 0.28, step: 0.01, defaultMaxKW: 15 },
  CAD: { locale: 'en-CA', symbol: '$', defaultTariff: 0.14, step: 0.01, defaultMaxKW: 20 },
  AUD: { locale: 'en-AU', symbol: '$', defaultTariff: 0.30, step: 0.01, defaultMaxKW: 20 },
};

export const PRESETS: Record<string, Record<string, number>> = {
  'typical-2bhk': {
    'LED Bulb': 4, 'Tube Light': 2,
    'Ceiling Fan': 3, 'Air Conditioner (1.5T)': 1,
    'Refrigerator': 1, 'Microwave Oven': 1, 'Mixer / Grinder': 1, 'Water Purifier (RO)': 1,
    'LED TV (32")': 1, 'Set-top Box': 1, 'Wi-Fi Router': 1,
    'Washing Machine': 1, 'Laptop / Charger': 1, 'Water Pump (0.5 HP)': 1,
  },
  'budget-home': {
    'LED Bulb': 3, 'Tube Light': 1,
    'Ceiling Fan': 2, 'Table Fan': 1,
    'Refrigerator': 1, 'Mixer / Grinder': 1,
    'LED TV (32")': 1, 'Wi-Fi Router': 1, 'Laptop / Charger': 1,
  },
  'summer-heavy': {
    'LED Bulb': 6, 'Spotlight / Downlight': 2,
    'Ceiling Fan': 3, 'Air Conditioner (1.5T)': 2, 'Air Cooler': 1, 'Exhaust Fan': 2,
    'Refrigerator': 1, 'Microwave Oven': 1, 'Water Purifier (RO)': 1, 'Induction Cooktop': 1,
    'LED TV (55")': 1, 'Wi-Fi Router': 1,
    'Washing Machine': 1, 'Laptop / Charger': 2, 'Geyser / Water Heater': 1, 'Water Pump (0.5 HP)': 1,
  },
};
