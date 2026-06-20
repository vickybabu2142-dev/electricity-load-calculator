// ─────────────────────────────────────────────────────────
// Knowledge Hub — Central Data Registry
// ─────────────────────────────────────────────────────────

export interface KHArticle {
  slug: string;
  title: string;
  description: string;
  readingTime: number;
  isPillar?: boolean;
  datePublished: string;
  dateModified: string;
}

export interface KHCluster {
  slug: string;
  shortTitle: string;
  title: string;
  description: string;
  /** SVG path data for the icon */
  iconPath: string;
  articles: KHArticle[];
  comingSoon?: boolean;
}

// ─── Load Calculation Articles ────────────────────────────

export const LOAD_CALC_ARTICLES: KHArticle[] = [
  {
    slug: 'how-to-calculate-electrical-load-for-a-house',
    title: 'How to Calculate Electrical Load for a House',
    description:
      'A complete, practical guide to calculating your home electrical load step by step — no engineering degree required.',
    readingTime: 8,
    isPillar: true,
    datePublished: '2026-06-18',
    dateModified: '2026-06-18',
  },
  {
    slug: 'electrical-load-chart-for-home-appliances',
    title: 'Electrical Load Chart for Home Appliances',
    description:
      'A complete wattage reference chart for every common home appliance — from ceiling fans to air conditioners.',
    readingTime: 5,
    datePublished: '2026-06-18',
    dateModified: '2026-06-18',
  },
  {
    slug: 'connected-load-vs-demand-load',
    title: 'Connected Load vs Demand Load Explained',
    description:
      'Understand the difference between connected load and demand load — and why it matters for your electrical planning.',
    readingTime: 5,
    datePublished: '2026-06-18',
    dateModified: '2026-06-18',
  },
  {
    slug: 'single-phase-vs-three-phase-load',
    title: 'Single Phase vs Three Phase Electrical Load',
    description:
      'Learn when to use single-phase and when three-phase power is needed — explained simply for homeowners and contractors.',
    readingTime: 6,
    datePublished: '2026-06-18',
    dateModified: '2026-06-18',
  },
  {
    slug: 'how-many-units-of-electricity-does-a-home-use',
    title: 'How Many Units of Electricity Does a Home Use?',
    description:
      'Find out how many kWh (units) a typical home uses per day and per month, and what factors drive up your consumption.',
    readingTime: 5,
    datePublished: '2026-06-18',
    dateModified: '2026-06-18',
  },
  {
    slug: 'kw-vs-kva-vs-kwh-explained',
    title: 'kW vs kVA vs kWh — The Simple Explanation',
    description:
      'kW, kVA, and kWh confuse most people. This guide explains all three clearly with real-world examples.',
    readingTime: 5,
    datePublished: '2026-06-18',
    dateModified: '2026-06-18',
  },
  {
    slug: 'ac-power-consumption-and-load-explained',
    title: 'Air Conditioner (AC) Power Consumption & Load Explained',
    description:
      'Understand AC tonnage, power consumption, ISEER ratings, and startup surge currents — explained simply for homeowners.',
    readingTime: 6,
    datePublished: '2026-06-20',
    dateModified: '2026-06-20',
  },
  {
    slug: 'electrical-mistakes-home-builders-regret',
    title: 'Electrical Planning Mistakes People Regret After Building Their House',
    description:
      'Learn the most common electrical load-planning mistakes homeowners make during construction—and how to avoid them.',
    readingTime: 7,
    datePublished: '2026-06-20',
    dateModified: '2026-06-20',
  },
];

// ─── MCB Sizing Articles ───────────────────────────────────

export const MCB_SIZING_ARTICLES: KHArticle[] = [
  {
    slug: 'how-to-choose-the-right-mcb-rating',
    title: 'How to Choose the Right MCB Rating',
    description:
      'The definitive guide to MCB sizing — covering the 4-step formula, B/C/D curve types, wire-gauge pairing, and real worked examples for every common home circuit.',
    readingTime: 9,
    isPillar: true,
    datePublished: '2026-06-19',
    dateModified: '2026-06-20',
  },
  {
    slug: 'why-does-my-mcb-keep-tripping',
    title: 'Why Does My MCB Keep Tripping?',
    description:
      'An expert diagnostic deep-dive into the five real reasons your breaker trips — with the Bouncer analogy, a trip-behaviour chart, Common Mistakes section, and a safe 4-step reset checklist.',
    readingTime: 8,
    datePublished: '2026-06-20',
    dateModified: '2026-06-20',
  },
];

// ─── Wire Sizing Articles ──────────────────────────────────

export const WIRE_SIZING_ARTICLES: KHArticle[] = [
  {
    slug: 'how-to-choose-the-right-wire-size',
    title: 'How to Choose the Right Wire Size for Home Sockets and Appliances',
    description:
      'The definitive guide to home wire sizing — covering current load math, wire cross-sections (sq.mm), circuit types, voltage drop, and safety margins.',
    readingTime: 8,
    isPillar: true,
    datePublished: '2026-06-20',
    dateModified: '2026-06-20',
  },
];

// ─── Solar & Inverter Articles ─────────────────────────────

export const SOLAR_INVERTER_ARTICLES: KHArticle[] = [
  {
    slug: 'how-to-size-a-solar-panel-system-for-home',
    title: 'How to Size a Solar Panel System for Your Home',
    description:
      'The complete rooftop solar guide — learn how to calculate required kW capacity, panel count, roof area, and expected daily generation based on your daily electricity consumption.',
    readingTime: 8,
    isPillar: true,
    datePublished: '2026-06-20',
    dateModified: '2026-06-20',
  },
  {
    slug: 'how-to-choose-the-right-inverter-capacity',
    title: 'Inverter Selection: Which Capacity is Right?',
    description:
      'Choose the correct VA/kVA inverter rating for your backup needs — covering pure sine wave vs modified sine wave, battery compatibility, and load types.',
    readingTime: 7,
    datePublished: '2026-06-20',
    dateModified: '2026-06-20',
  },
];

// ─── All Clusters ─────────────────────────────────────────

export const CLUSTERS: KHCluster[] = [
  {
    slug: 'load-calculation',
    shortTitle: 'Load Calculation',
    title: 'Electrical Load Calculation',
    description:
      'Master electrical load calculation for homes and buildings. Learn how to calculate total load, understand kW vs kWh, and plan your electrical connection the right way.',
    iconPath: 'M13 2 L4.5 13 H10 L8.5 22 L19.5 11 H14 Z',
    articles: LOAD_CALC_ARTICLES,
  },
  {
    slug: 'mcb-sizing',
    shortTitle: 'MCB Sizing',
    title: 'MCB Sizing & Selection',
    description:
      'Learn how to select the right MCB rating for your home, circuits, and specific appliances. Avoid common breaker tripping problems.',
    iconPath:
      'M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 0-2-2V9m0 0h18',
    articles: MCB_SIZING_ARTICLES,
  },
  {
    slug: 'wire-sizing',
    shortTitle: 'Wire Sizing',
    title: 'Wire & Cable Sizing',
    description:
      'Understand how to choose the right wire gauge and cable size for your home wiring, circuits, and appliances safely.',
    iconPath: 'M4 12h16M4 6h16M4 18h16',
    articles: WIRE_SIZING_ARTICLES,
  },
  {
    slug: 'solar-inverter',
    shortTitle: 'Solar & Inverter',
    title: 'Solar & Inverter Sizing',
    description:
      'Plan your solar panel system and inverter selection the right way. Size your system based on your actual electrical load.',
    iconPath:
      'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364-.707-.707M6.343 6.343l-.707-.707m12.728 0-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
    articles: SOLAR_INVERTER_ARTICLES,
  },
];

/** Lookup helper — get a cluster by slug */
export function getCluster(slug: string): KHCluster | undefined {
  return CLUSTERS.find((c) => c.slug === slug);
}

/** Lookup helper — get an article within a cluster by slug */
export function getArticle(
  clusterSlug: string,
  articleSlug: string,
): KHArticle | undefined {
  return getCluster(clusterSlug)?.articles.find((a) => a.slug === articleSlug);
}

/** Get the pillar article of a cluster (first one marked isPillar, or first article) */
export function getPillarArticle(clusterSlug: string): KHArticle | undefined {
  const cluster = getCluster(clusterSlug);
  return cluster?.articles.find((a) => a.isPillar) ?? cluster?.articles[0];
}
