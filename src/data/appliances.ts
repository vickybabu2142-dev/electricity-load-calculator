import type { Appliance } from '@/types';

let idCounter = 1;
const makeId = () => `app-${idCounter++}`;

export const DEFAULT_APPLIANCES: Appliance[] = [
  // Lighting
  { id: makeId(), category: 'Lighting',      name: 'LED Bulb',               defaultWatts: 9,    defaultQty: 1, defaultHours: 8,    watts: 9,    qty: 1, hours: 8,    included: false, custom: false },
  { id: makeId(), category: 'Lighting',      name: 'Tube Light',             defaultWatts: 36,   defaultQty: 1, defaultHours: 6,    watts: 36,   qty: 1, hours: 6,    included: false, custom: false },
  { id: makeId(), category: 'Lighting',      name: 'CFL',                    defaultWatts: 15,   defaultQty: 1, defaultHours: 5,    watts: 15,   qty: 1, hours: 5,    included: false, custom: false },
  { id: makeId(), category: 'Lighting',      name: 'Spotlight / Downlight',  defaultWatts: 12,   defaultQty: 1, defaultHours: 4,    watts: 12,   qty: 1, hours: 4,    included: false, custom: false },

  // Fans & Cooling
  { id: makeId(), category: 'Fans & Cooling', name: 'Ceiling Fan',           defaultWatts: 75,   defaultQty: 1, defaultHours: 10,   watts: 75,   qty: 1, hours: 10,   included: false, custom: false },
  { id: makeId(), category: 'Fans & Cooling', name: 'Table Fan',             defaultWatts: 50,   defaultQty: 1, defaultHours: 6,    watts: 50,   qty: 1, hours: 6,    included: false, custom: false },
  { id: makeId(), category: 'Fans & Cooling', name: 'Air Conditioner (1.5T)',defaultWatts: 1500, defaultQty: 1, defaultHours: 8,    watts: 1500, qty: 1, hours: 8,    included: false, custom: false },
  { id: makeId(), category: 'Fans & Cooling', name: 'Air Cooler',            defaultWatts: 180,  defaultQty: 1, defaultHours: 8,    watts: 180,  qty: 1, hours: 8,    included: false, custom: false },
  { id: makeId(), category: 'Fans & Cooling', name: 'Exhaust Fan',           defaultWatts: 35,   defaultQty: 1, defaultHours: 4,    watts: 35,   qty: 1, hours: 4,    included: false, custom: false },

  // Kitchen
  { id: makeId(), category: 'Kitchen',       name: 'Refrigerator',          defaultWatts: 150,  defaultQty: 1, defaultHours: 24,   watts: 150,  qty: 1, hours: 24,   included: false, custom: false },
  { id: makeId(), category: 'Kitchen',       name: 'Microwave Oven',        defaultWatts: 1200, defaultQty: 1, defaultHours: 0.5,  watts: 1200, qty: 1, hours: 0.5,  included: false, custom: false },
  { id: makeId(), category: 'Kitchen',       name: 'Mixer / Grinder',       defaultWatts: 750,  defaultQty: 1, defaultHours: 0.5,  watts: 750,  qty: 1, hours: 0.5,  included: false, custom: false },
  { id: makeId(), category: 'Kitchen',       name: 'Electric Kettle',       defaultWatts: 1500, defaultQty: 1, defaultHours: 0.25, watts: 1500, qty: 1, hours: 0.25, included: false, custom: false },
  { id: makeId(), category: 'Kitchen',       name: 'Induction Cooktop',     defaultWatts: 2000, defaultQty: 1, defaultHours: 1,    watts: 2000, qty: 1, hours: 1,    included: false, custom: false },
  { id: makeId(), category: 'Kitchen',       name: 'Dishwasher',            defaultWatts: 1200, defaultQty: 1, defaultHours: 1,    watts: 1200, qty: 1, hours: 1,    included: false, custom: false },

  // Entertainment
  { id: makeId(), category: 'Entertainment', name: 'LED TV (32")',          defaultWatts: 60,   defaultQty: 1, defaultHours: 6,    watts: 60,   qty: 1, hours: 6,    included: false, custom: false },
  { id: makeId(), category: 'Entertainment', name: 'LED TV (55")',          defaultWatts: 120,  defaultQty: 1, defaultHours: 4,    watts: 120,  qty: 1, hours: 4,    included: false, custom: false },
  { id: makeId(), category: 'Entertainment', name: 'Set-top Box',           defaultWatts: 15,   defaultQty: 1, defaultHours: 6,    watts: 15,   qty: 1, hours: 6,    included: false, custom: false },
  { id: makeId(), category: 'Entertainment', name: 'Wi-Fi Router',          defaultWatts: 10,   defaultQty: 1, defaultHours: 24,   watts: 10,   qty: 1, hours: 24,   included: false, custom: false },
  { id: makeId(), category: 'Entertainment', name: 'Gaming Console',        defaultWatts: 150,  defaultQty: 1, defaultHours: 2,    watts: 150,  qty: 1, hours: 2,    included: false, custom: false },

  // Other
  { id: makeId(), category: 'Other',         name: 'Washing Machine',       defaultWatts: 500,  defaultQty: 1, defaultHours: 1,    watts: 500,  qty: 1, hours: 1,    included: false, custom: false },
  { id: makeId(), category: 'Other',         name: 'Clothes Iron',          defaultWatts: 1000, defaultQty: 1, defaultHours: 0.5,  watts: 1000, qty: 1, hours: 0.5,  included: false, custom: false },
  { id: makeId(), category: 'Other',         name: 'Water Pump (0.5 HP)',   defaultWatts: 373,  defaultQty: 1, defaultHours: 1,    watts: 373,  qty: 1, hours: 1,    included: false, custom: false },
  { id: makeId(), category: 'Other',         name: 'Laptop / Charger',      defaultWatts: 65,   defaultQty: 1, defaultHours: 6,    watts: 65,   qty: 1, hours: 6,    included: false, custom: false },
  { id: makeId(), category: 'Other',         name: 'Desktop PC + Monitor',  defaultWatts: 300,  defaultQty: 1, defaultHours: 4,    watts: 300,  qty: 1, hours: 4,    included: false, custom: false },
  { id: makeId(), category: 'Other',         name: 'Geyser / Water Heater', defaultWatts: 2000, defaultQty: 1, defaultHours: 0.5,  watts: 2000, qty: 1, hours: 0.5,  included: false, custom: false },
];

export const CATEGORIES: Appliance['category'][] = [
  'Lighting',
  'Fans & Cooling',
  'Kitchen',
  'Entertainment',
  'Other',
];

export const CATEGORY_ICONS: Record<Appliance['category'], string> = {
  'Lighting':      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>`,
  'Fans & Cooling':`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/><path d="M12 12m-8 0a8 8 0 1 0 16 0a8 8 0 1 0 -16 0"/><path d="M12 2l0 2"/><path d="M12 20l0 2"/><path d="M2 12l2 0"/><path d="M20 12l2 0"/></svg>`,
  'Kitchen':       `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M6 2v20"/><path d="M18 2v4"/><path d="M18 10v12"/><path d="M6 13h12"/><path d="M18 6a2 2 0 0 0-2-2H8"/></svg>`,
  'Entertainment': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><rect x="2" y="7" width="20" height="15" rx="2"/><path d="M17 2l-5 5-5-5"/></svg>`,
  'Other':         `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></svg>`,
};
