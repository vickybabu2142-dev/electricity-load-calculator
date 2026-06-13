# Gemini CLI Prompt — Home Load Calculator (Brand New AstroJS Project)

> Paste everything below this line directly into your Gemini CLI session.

---

## ROLE

You are a senior full-stack frontend engineer who scaffolds production-ready projects from zero. You write clean, well-structured code with meticulous attention to design quality, accessibility, and developer experience.

---

## TASK

Scaffold a **brand new AstroJS project** from scratch — including all config files, dependencies, folder structure, and source code — for a **Home Load Calculator** web app.

The tool helps homeowners calculate:
- Their home's **total electrical load** (Watts / kW)
- **Daily energy consumption** (kWh/day)
- **Monthly energy estimate** (kWh/month)
- **Estimated monthly electricity bill** (₹)
- Which appliance is their **top power consumer**

Reference for feature inspiration: https://www.luminousindia.com/load-calculator

---

## STEP 1 — PROJECT SCAFFOLDING

Run the following commands in sequence to create the project:

```bash
# 1. Create new Astro project (use the minimal/empty template, no framework)
npm create astro@latest home-load-calculator -- --template minimal --no-install --typescript strict --git false

cd home-load-calculator

# 2. Install dependencies
npm install

# 3. Add Tailwind CSS v4 integration
npx astro add tailwind --yes

# 4. Verify dev server works
npm run dev
```

After scaffolding, the working directory is `home-load-calculator/`. All subsequent files are relative to this root.

---

## STEP 2 — CONFIGURATION FILES

### `astro.config.mjs`

```js
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwind()],
  output: 'static',
});
```

### `tailwind.config.mjs`

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Barlow Condensed', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        base: '#0f1117',
        card: '#1a1d27',
        'card-hover': '#20232f',
        accent: '#f5a623',
        'accent-dim': '#c4811a',
        border: '#2a2d3a',
      },
      keyframes: {
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.4s ease both',
        'fade-in': 'fade-in 0.3s ease both',
      },
    },
  },
  plugins: [],
};
```

### `tsconfig.json`

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### `src/styles/global.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg-base: #0f1117;
  --bg-card: #1a1d27;
  --bg-card-hover: #20232f;
  --accent: #f5a623;
  --accent-dim: #c4811a;
  --text-primary: #f0f0ee;
  --text-muted: #7a7f96;
  --border: #2a2d3a;
  --danger: #ef4444;
  --warning: #f59e0b;
  --success: #22c55e;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: 'DM Sans', sans-serif;
  background-color: var(--bg-base);
  color: var(--text-primary);
  min-height: 100vh;
  /* Subtle dot-grid background texture */
  background-image: radial-gradient(circle, #2a2d3a 1px, transparent 1px);
  background-size: 28px 28px;
}

/* Remove number input arrows */
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  -moz-appearance: textfield;
}

/* Custom scrollbar */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--bg-base); }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--accent-dim); }

/* Toggle switch */
.toggle-checkbox:checked + .toggle-label {
  background-color: var(--accent);
}
.toggle-checkbox:checked + .toggle-label::after {
  transform: translateX(20px);
}
.toggle-label {
  transition: background-color 0.2s ease;
}
.toggle-label::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  transition: transform 0.2s ease;
}

/* Print styles */
@media print {
  body { background: white; color: black; background-image: none; }
  .no-print { display: none !important; }
  .print-only { display: block !important; }
}
```

---

## STEP 3 — COMPLETE FILE STRUCTURE

Create every file listed below. The project must work with `npm run dev` immediately after generation with zero errors.

```
home-load-calculator/
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── package.json                        (auto-generated by scaffolding)
├── public/
│   └── favicon.svg                     (simple lightning bolt SVG)
└── src/
    ├── styles/
    │   └── global.css
    ├── data/
    │   └── appliances.ts               ← all default appliance data
    ├── types/
    │   └── index.ts                    ← shared TypeScript interfaces
    ├── layouts/
    │   └── BaseLayout.astro            ← HTML shell, fonts, global CSS
    ├── components/
    │   ├── PageHero.astro              ← hero heading section
    │   ├── ApplianceCategory.astro     ← collapsible category wrapper
    │   ├── ApplianceRow.astro          ← single appliance row
    │   ├── AddApplianceForm.astro      ← inline add-custom form
    │   ├── ResultsPanel.astro          ← sticky results sidebar
    │   └── ReportModal.astro           ← print/download report modal
    └── pages/
        └── index.astro                 ← main page, assembles everything
```

---

## STEP 4 — SOURCE FILES (generate each completely, no placeholders)

---

### `src/types/index.ts`

```typescript
export interface Appliance {
  id: string;
  category: AplianceCategory;
  name: string;
  defaultWatts: number;
  defaultQty: number;
  defaultHours: number;
  watts: number;
  qty: number;
  hours: number;
  included: boolean;
  custom: boolean;
}

export type ApplianceCategory =
  | 'Lighting'
  | 'Fans & Cooling'
  | 'Kitchen'
  | 'Entertainment'
  | 'Other';

export interface CategorySummary {
  name: ApplianceCategory;
  totalWatts: number;
  dailyKWh: number;
  applianceCount: number;
}

export interface CalculationResult {
  totalWatts: number;
  totalKW: number;
  loadPercent: number;
  dailyKWh: number;
  monthlyKWh: number;
  monthlyBill: number;
  topConsumerName: string;
  topConsumerWatts: number;
  loadLevel: 'light' | 'moderate' | 'heavy';
  categorySummaries: CategorySummary[];
}
```

---

### `src/data/appliances.ts`

```typescript
import type { Appliance } from '@/types';

let idCounter = 1;
const makeId = () => `app-${idCounter++}`;

export const DEFAULT_APPLIANCES: Appliance[] = [
  // Lighting
  { id: makeId(), category: 'Lighting',      name: 'LED Bulb',               defaultWatts: 9,    defaultQty: 4, defaultHours: 8,    watts: 9,    qty: 4, hours: 8,    included: true,  custom: false },
  { id: makeId(), category: 'Lighting',      name: 'Tube Light',             defaultWatts: 36,   defaultQty: 2, defaultHours: 6,    watts: 36,   qty: 2, hours: 6,    included: true,  custom: false },
  { id: makeId(), category: 'Lighting',      name: 'CFL',                    defaultWatts: 15,   defaultQty: 2, defaultHours: 5,    watts: 15,   qty: 2, hours: 5,    included: true,  custom: false },
  { id: makeId(), category: 'Lighting',      name: 'Spotlight / Downlight',  defaultWatts: 12,   defaultQty: 4, defaultHours: 4,    watts: 12,   qty: 4, hours: 4,    included: false, custom: false },

  // Fans & Cooling
  { id: makeId(), category: 'Fans & Cooling', name: 'Ceiling Fan',           defaultWatts: 75,   defaultQty: 3, defaultHours: 10,   watts: 75,   qty: 3, hours: 10,   included: true,  custom: false },
  { id: makeId(), category: 'Fans & Cooling', name: 'Table Fan',             defaultWatts: 50,   defaultQty: 1, defaultHours: 6,    watts: 50,   qty: 1, hours: 6,    included: true,  custom: false },
  { id: makeId(), category: 'Fans & Cooling', name: 'Air Conditioner (1.5T)',defaultWatts: 1500, defaultQty: 1, defaultHours: 8,    watts: 1500, qty: 1, hours: 8,    included: true,  custom: false },
  { id: makeId(), category: 'Fans & Cooling', name: 'Air Cooler',            defaultWatts: 180,  defaultQty: 1, defaultHours: 8,    watts: 180,  qty: 1, hours: 8,    included: false, custom: false },
  { id: makeId(), category: 'Fans & Cooling', name: 'Exhaust Fan',           defaultWatts: 35,   defaultQty: 2, defaultHours: 4,    watts: 35,   qty: 2, hours: 4,    included: false, custom: false },

  // Kitchen
  { id: makeId(), category: 'Kitchen',       name: 'Refrigerator',          defaultWatts: 150,  defaultQty: 1, defaultHours: 24,   watts: 150,  qty: 1, hours: 24,   included: true,  custom: false },
  { id: makeId(), category: 'Kitchen',       name: 'Microwave Oven',        defaultWatts: 1200, defaultQty: 1, defaultHours: 0.5,  watts: 1200, qty: 1, hours: 0.5,  included: true,  custom: false },
  { id: makeId(), category: 'Kitchen',       name: 'Mixer / Grinder',       defaultWatts: 750,  defaultQty: 1, defaultHours: 0.5,  watts: 750,  qty: 1, hours: 0.5,  included: true,  custom: false },
  { id: makeId(), category: 'Kitchen',       name: 'Electric Kettle',       defaultWatts: 1500, defaultQty: 1, defaultHours: 0.25, watts: 1500, qty: 1, hours: 0.25, included: true,  custom: false },
  { id: makeId(), category: 'Kitchen',       name: 'Induction Cooktop',     defaultWatts: 2000, defaultQty: 1, defaultHours: 1,    watts: 2000, qty: 1, hours: 1,    included: false, custom: false },
  { id: makeId(), category: 'Kitchen',       name: 'Dishwasher',            defaultWatts: 1200, defaultQty: 1, defaultHours: 1,    watts: 1200, qty: 1, hours: 1,    included: false, custom: false },

  // Entertainment
  { id: makeId(), category: 'Entertainment', name: 'LED TV (32")',          defaultWatts: 60,   defaultQty: 1, defaultHours: 6,    watts: 60,   qty: 1, hours: 6,    included: true,  custom: false },
  { id: makeId(), category: 'Entertainment', name: 'LED TV (55")',          defaultWatts: 120,  defaultQty: 1, defaultHours: 4,    watts: 120,  qty: 1, hours: 4,    included: false, custom: false },
  { id: makeId(), category: 'Entertainment', name: 'Set-top Box',           defaultWatts: 15,   defaultQty: 1, defaultHours: 6,    watts: 15,   qty: 1, hours: 6,    included: true,  custom: false },
  { id: makeId(), category: 'Entertainment', name: 'Wi-Fi Router',          defaultWatts: 10,   defaultQty: 1, defaultHours: 24,   watts: 10,   qty: 1, hours: 24,   included: true,  custom: false },
  { id: makeId(), category: 'Entertainment', name: 'Gaming Console',        defaultWatts: 150,  defaultQty: 1, defaultHours: 2,    watts: 150,  qty: 1, hours: 2,    included: false, custom: false },

  // Other
  { id: makeId(), category: 'Other',         name: 'Washing Machine',       defaultWatts: 500,  defaultQty: 1, defaultHours: 1,    watts: 500,  qty: 1, hours: 1,    included: true,  custom: false },
  { id: makeId(), category: 'Other',         name: 'Clothes Iron',          defaultWatts: 1000, defaultQty: 1, defaultHours: 0.5,  watts: 1000, qty: 1, hours: 0.5,  included: true,  custom: false },
  { id: makeId(), category: 'Other',         name: 'Water Pump (0.5 HP)',   defaultWatts: 373,  defaultQty: 1, defaultHours: 1,    watts: 373,  qty: 1, hours: 1,    included: true,  custom: false },
  { id: makeId(), category: 'Other',         name: 'Laptop / Charger',      defaultWatts: 65,   defaultQty: 1, defaultHours: 6,    watts: 65,   qty: 1, hours: 6,    included: true,  custom: false },
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
```

---

### `src/layouts/BaseLayout.astro`

```astro
---
interface Props {
  title?: string;
  description?: string;
}

const {
  title = 'Home Load Calculator — Know Your Power',
  description = "Calculate your home's total electrical load, daily energy consumption, and estimated monthly electricity bill.",
} = Astro.props;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />
    <title>{title}</title>

    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

    <!-- Google Fonts: Barlow Condensed + DM Sans + JetBrains Mono -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=JetBrains+Mono:wght@400;600&display=swap"
      rel="stylesheet"
    />

    <!-- Global styles -->
    <link rel="stylesheet" href="/src/styles/global.css" />
  </head>
  <body>
    <slot />
  </body>
</html>
```

---

### `src/components/PageHero.astro`

```astro
---
// No props needed
---

<header class="relative pt-14 pb-10 px-6 text-center overflow-hidden no-print">
  <!-- Glow blob behind heading -->
  <div
    class="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full opacity-20 blur-3xl pointer-events-none"
    style="background: radial-gradient(ellipse, #f5a623 0%, transparent 70%);"
  ></div>

  <p class="font-mono text-xs tracking-[0.25em] text-[#f5a623] uppercase mb-3 animate-fade-in">
    ⚡ Electrical Load Calculator
  </p>

  <h1
    class="font-display font-bold text-5xl sm:text-6xl lg:text-7xl text-[#f0f0ee] leading-none tracking-tight mb-4 animate-slide-up"
    style="animation-delay: 0.05s"
  >
    Home Load
    <span class="block" style="color: var(--accent);">Calculator</span>
  </h1>

  <p
    class="max-w-xl mx-auto text-[#7a7f96] text-base sm:text-lg leading-relaxed animate-slide-up"
    style="animation-delay: 0.12s"
  >
    Add your appliances and instantly see your home's total electrical load,
    daily energy consumption, and estimated monthly electricity bill.
  </p>

  <!-- Stats strip -->
  <div
    class="mt-8 inline-flex flex-wrap justify-center gap-6 text-sm animate-slide-up"
    style="animation-delay: 0.2s"
  >
    {[
      { label: '26 Appliances', icon: '🔌' },
      { label: '5 Categories',  icon: '📂' },
      { label: 'Real-time Calc',icon: '⚡' },
    ].map(s => (
      <span class="flex items-center gap-1.5 text-[#7a7f96]">
        <span>{s.icon}</span>
        <span>{s.label}</span>
      </span>
    ))}
  </div>
</header>
```

---

### `src/components/ApplianceRow.astro`

```astro
---
import type { Appliance } from '@/types';

interface Props {
  appliance: Appliance;
  index: number;
}

const { appliance: a, index } = Astro.props;
const kwh = ((a.watts * a.qty * a.hours) / 1000).toFixed(2);
---

<div
  class="appliance-row group flex flex-wrap lg:flex-nowrap items-center gap-3 px-4 py-3 border-b border-[#2a2d3a] hover:bg-[#20232f] transition-colors duration-150 animate-slide-up"
  data-id={a.id}
  data-included={a.included.toString()}
  style={`animation-delay: ${index * 0.03}s`}
>
  <!-- Toggle -->
  <div class="flex-shrink-0">
    <label class="relative inline-block w-11 h-6 cursor-pointer" title="Include in calculation">
      <input
        type="checkbox"
        class="toggle-checkbox sr-only"
        checked={a.included}
        data-action="toggle-include"
        data-id={a.id}
        aria-label={`Include ${a.name} in calculation`}
      />
      <span
        class="toggle-label absolute inset-0 rounded-full bg-[#2a2d3a] cursor-pointer"
        style={a.included ? 'background-color: var(--accent);' : ''}
      ></span>
    </label>
  </div>

  <!-- Name -->
  <div class="flex-1 min-w-[140px]">
    <span
      class="text-sm font-medium transition-colors duration-150"
      style={a.included ? 'color: var(--text-primary);' : 'color: var(--text-muted);'}
    >
      {a.name}
    </span>
    {a.custom && (
      <span class="ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#2a2d3a] text-[#f5a623]">
        CUSTOM
      </span>
    )}
  </div>

  <!-- Watts -->
  <div class="flex items-center gap-1.5">
    <label class="sr-only" for={`watts-${a.id}`}>Watts</label>
    <input
      id={`watts-${a.id}`}
      type="number"
      value={a.watts}
      min="1"
      max="99999"
      class="w-20 bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-2 py-1.5 text-center font-mono text-sm text-[#f0f0ee] focus:border-[#f5a623] focus:outline-none transition-colors"
      data-action="update-watts"
      data-id={a.id}
      aria-label={`Watts for ${a.name}`}
    />
    <span class="text-[11px] text-[#7a7f96] font-mono">W</span>
  </div>

  <!-- Qty stepper -->
  <div class="flex items-center gap-1" role="group" aria-label={`Quantity for ${a.name}`}>
    <button
      type="button"
      class="stepper-btn w-8 h-8 rounded-md bg-[#2a2d3a] text-[#f0f0ee] font-bold text-base hover:bg-[#f5a623] hover:text-[#0f1117] transition-colors focus:outline-none focus:ring-2 focus:ring-[#f5a623]"
      data-action="decrement-qty"
      data-id={a.id}
      aria-label={`Decrease quantity of ${a.name}`}
    >−</button>
    <span
      class="w-8 text-center font-mono text-sm font-semibold tabular-nums"
      data-qty-display={a.id}
    >{a.qty}</span>
    <button
      type="button"
      class="stepper-btn w-8 h-8 rounded-md bg-[#2a2d3a] text-[#f0f0ee] font-bold text-base hover:bg-[#f5a623] hover:text-[#0f1117] transition-colors focus:outline-none focus:ring-2 focus:ring-[#f5a623]"
      data-action="increment-qty"
      data-id={a.id}
      aria-label={`Increase quantity of ${a.name}`}
    >+</button>
  </div>

  <!-- Hours -->
  <div class="flex items-center gap-1.5">
    <label class="sr-only" for={`hours-${a.id}`}>Hours per day</label>
    <input
      id={`hours-${a.id}`}
      type="number"
      value={a.hours}
      min="0"
      max="24"
      step="0.25"
      class="w-16 bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-2 py-1.5 text-center font-mono text-sm text-[#f0f0ee] focus:border-[#f5a623] focus:outline-none transition-colors"
      data-action="update-hours"
      data-id={a.id}
      aria-label={`Hours per day for ${a.name}`}
    />
    <span class="text-[11px] text-[#7a7f96] font-mono">h/d</span>
  </div>

  <!-- kWh/day result -->
  <div class="flex-shrink-0 text-right min-w-[80px]">
    <span
      class="font-mono text-sm font-semibold tabular-nums"
      style="color: var(--accent);"
      data-kwh-display={a.id}
    >{kwh}</span>
    <span class="text-[10px] text-[#7a7f96] ml-0.5">kWh/d</span>
  </div>

  <!-- Delete (custom only) -->
  {a.custom && (
    <button
      type="button"
      class="flex-shrink-0 w-7 h-7 rounded-md text-[#7a7f96] hover:text-[#ef4444] hover:bg-[#2a2d3a] transition-colors focus:outline-none"
      data-action="delete-appliance"
      data-id={a.id}
      aria-label={`Remove ${a.name}`}
      title="Remove appliance"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 mx-auto">
        <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd"/>
      </svg>
    </button>
  )}
</div>
```

---

### `src/components/ApplianceCategory.astro`

```astro
---
import type { Appliance, ApplianceCategory } from '@/types';
import { CATEGORY_ICONS } from '@/data/appliances';
import ApplianceRow from './ApplianceRow.astro';
import AddApplianceForm from './AddApplianceForm.astro';

interface Props {
  name: ApplianceCategory;
  appliances: Appliance[];
  index: number;
}

const { name, appliances, index } = Astro.props;

const totalWatts = appliances
  .filter(a => a.included)
  .reduce((s, a) => s + a.watts * a.qty, 0);

const dailyKWh = appliances
  .filter(a => a.included)
  .reduce((s, a) => s + (a.watts * a.qty * a.hours) / 1000, 0);

const icon = CATEGORY_ICONS[name];
---

<section
  class="category-section rounded-xl border border-[#2a2d3a] bg-[#1a1d27] overflow-hidden animate-slide-up"
  data-category={name}
  style={`animation-delay: ${index * 0.08}s`}
>
  <!-- Category header -->
  <button
    type="button"
    class="category-toggle w-full flex items-center gap-3 px-5 py-4 hover:bg-[#20232f] transition-colors text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#f5a623]"
    aria-expanded="true"
    aria-controls={`category-body-${name.replace(/\s/g, '-')}`}
    data-category={name}
  >
    <!-- Icon -->
    <span class="text-[#f5a623] flex-shrink-0" set:html={icon} />

    <!-- Name -->
    <span class="font-display font-bold text-lg text-[#f0f0ee] flex-1 tracking-wide">
      {name}
    </span>

    <!-- Live badges -->
    <span class="hidden sm:flex items-center gap-2 mr-2">
      <span
        class="font-mono text-xs px-2 py-1 rounded-md bg-[#0f1117] border border-[#2a2d3a] tabular-nums"
        data-category-watts={name}
      >
        ⚡ {totalWatts.toLocaleString()} W
      </span>
      <span
        class="font-mono text-xs px-2 py-1 rounded-md bg-[#0f1117] border border-[#2a2d3a] tabular-nums"
        data-category-kwh={name}
      >
        📊 {dailyKWh.toFixed(2)} kWh/d
      </span>
    </span>

    <!-- Appliance count -->
    <span class="text-xs text-[#7a7f96] mr-3 flex-shrink-0">
      <span data-category-count={name}>{appliances.length}</span> appliances
    </span>

    <!-- Chevron -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      class="chevron w-5 h-5 text-[#7a7f96] flex-shrink-0 transition-transform duration-200"
    >
      <path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
    </svg>
  </button>

  <!-- Category body -->
  <div
    id={`category-body-${name.replace(/\s/g, '-')}`}
    class="category-body"
  >
    <!-- Column headers (desktop only) -->
    <div class="hidden lg:flex items-center gap-3 px-4 py-2 bg-[#0f1117]/50 border-b border-[#2a2d3a] text-[10px] font-mono uppercase tracking-widest text-[#7a7f96]">
      <div class="w-11 flex-shrink-0">On/Off</div>
      <div class="flex-1 min-w-[140px]">Appliance</div>
      <div class="w-[90px] text-center">Watts</div>
      <div class="w-[100px] text-center">Quantity</div>
      <div class="w-[80px] text-center">Hrs/Day</div>
      <div class="w-[80px] text-right">Usage</div>
      <div class="w-7"></div>
    </div>

    <!-- Appliance rows -->
    <div data-rows-container={name}>
      {appliances.map((a, i) => (
        <ApplianceRow appliance={a} index={i} />
      ))}
    </div>

    <!-- Add appliance form -->
    <AddApplianceForm category={name} />
  </div>
</section>
```

---

### `src/components/AddApplianceForm.astro`

```astro
---
import type { ApplianceCategory } from '@/types';
import { CATEGORIES } from '@/data/appliances';

interface Props {
  category: ApplianceCategory;
}

const { category } = Astro.props;
---

<div class="add-appliance-wrapper px-4 py-3 border-t border-[#2a2d3a] border-dashed">
  <button
    type="button"
    class="add-toggle-btn flex items-center gap-2 text-sm text-[#7a7f96] hover:text-[#f5a623] transition-colors focus:outline-none group"
    data-category={category}
    aria-expanded="false"
    aria-label={`Add custom appliance to ${category}`}
  >
    <span class="w-6 h-6 rounded-full border border-dashed border-[#7a7f96] group-hover:border-[#f5a623] flex items-center justify-center text-base leading-none transition-colors">+</span>
    <span>Add custom appliance</span>
  </button>

  <form
    class="add-appliance-form hidden mt-3 flex flex-wrap gap-3 items-end"
    data-category={category}
    novalidate
  >
    <div class="flex flex-col gap-1">
      <label class="text-[10px] font-mono uppercase tracking-widest text-[#7a7f96]" for={`new-name-${category}`}>Name</label>
      <input
        id={`new-name-${category}`}
        type="text"
        placeholder="e.g. Hair Dryer"
        class="bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3 py-1.5 text-sm text-[#f0f0ee] w-44 focus:border-[#f5a623] focus:outline-none placeholder:text-[#7a7f96]"
        data-field="name"
        required
      />
    </div>

    <div class="flex flex-col gap-1">
      <label class="text-[10px] font-mono uppercase tracking-widest text-[#7a7f96]" for={`new-watts-${category}`}>Watts</label>
      <input
        id={`new-watts-${category}`}
        type="number"
        placeholder="1000"
        min="1"
        max="99999"
        class="bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3 py-1.5 text-sm text-center font-mono text-[#f0f0ee] w-24 focus:border-[#f5a623] focus:outline-none"
        data-field="watts"
        required
      />
    </div>

    <div class="flex flex-col gap-1">
      <label class="text-[10px] font-mono uppercase tracking-widest text-[#7a7f96]" for={`new-hours-${category}`}>Hrs/Day</label>
      <input
        id={`new-hours-${category}`}
        type="number"
        placeholder="2"
        min="0"
        max="24"
        step="0.25"
        class="bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3 py-1.5 text-sm text-center font-mono text-[#f0f0ee] w-20 focus:border-[#f5a623] focus:outline-none"
        data-field="hours"
        required
      />
    </div>

    <div class="flex flex-col gap-1">
      <label class="text-[10px] font-mono uppercase tracking-widest text-[#7a7f96]" for={`new-category-${category}`}>Category</label>
      <select
        id={`new-category-${category}`}
        class="bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3 py-1.5 text-sm text-[#f0f0ee] focus:border-[#f5a623] focus:outline-none"
        data-field="category"
      >
        {CATEGORIES.map(c => (
          <option value={c} selected={c === category}>{c}</option>
        ))}
      </select>
    </div>

    <div class="flex gap-2">
      <button
        type="submit"
        class="px-4 py-1.5 rounded-lg bg-[#f5a623] text-[#0f1117] text-sm font-semibold hover:bg-[#c4811a] transition-colors focus:outline-none focus:ring-2 focus:ring-[#f5a623] focus:ring-offset-2 focus:ring-offset-[#1a1d27]"
      >
        Add
      </button>
      <button
        type="button"
        class="add-cancel-btn px-4 py-1.5 rounded-lg border border-[#2a2d3a] text-[#7a7f96] text-sm hover:border-[#7a7f96] transition-colors focus:outline-none"
        data-category={category}
      >
        Cancel
      </button>
    </div>

    <!-- Validation error -->
    <p class="form-error hidden w-full text-xs text-[#ef4444] font-mono"></p>
  </form>
</div>
```

---

### `src/components/ResultsPanel.astro`

```astro
---
// No props — all values updated via JS
---

<aside
  id="results-panel"
  class="sticky top-6 h-fit rounded-xl border border-[#2a2d3a] bg-[#1a1d27] overflow-hidden animate-slide-up no-print"
  style="animation-delay: 0.1s"
  aria-label="Calculation results"
>
  <!-- Panel header -->
  <div class="px-5 py-4 border-b border-[#2a2d3a] flex items-center justify-between">
    <h2 class="font-display font-bold text-lg tracking-wide text-[#f0f0ee]">Your Load Summary</h2>
    <!-- Load level badge -->
    <span
      id="load-level-badge"
      class="text-xs font-mono px-2.5 py-1 rounded-full border font-semibold"
      style="border-color: var(--success); color: var(--success);"
    >
      Light Load
    </span>
  </div>

  <div class="px-5 py-5 space-y-5">

    <!-- Total Load -->
    <div>
      <p class="text-[10px] font-mono uppercase tracking-widest text-[#7a7f96] mb-1">Total Load</p>
      <div class="flex items-end gap-2">
        <span id="total-watts" class="font-display font-bold text-4xl tabular-nums" style="color: var(--accent);">0</span>
        <span class="font-mono text-sm text-[#7a7f96] mb-1">W</span>
        <span class="font-mono text-base text-[#7a7f96] mb-1">/</span>
        <span id="total-kw" class="font-mono font-semibold text-xl tabular-nums text-[#f0f0ee] mb-0.5">0.00</span>
        <span class="font-mono text-sm text-[#7a7f96] mb-1">kW</span>
      </div>
      <!-- Progress bar -->
      <div class="mt-2 h-2 rounded-full bg-[#2a2d3a] overflow-hidden" role="progressbar" aria-label="Load percentage" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" id="load-progress">
        <div
          id="load-bar"
          class="h-full rounded-full transition-all duration-500 ease-out"
          style="width: 0%; background: linear-gradient(90deg, #f5a623, #ef4444);"
        ></div>
      </div>
      <div class="flex justify-between mt-1">
        <span class="font-mono text-[10px] text-[#7a7f96]">0 W</span>
        <span id="load-percent" class="font-mono text-[10px] tabular-nums" style="color: var(--accent);">0%</span>
        <span class="font-mono text-[10px] text-[#7a7f96]">5,000 W</span>
      </div>
    </div>

    <!-- Divider -->
    <hr class="border-[#2a2d3a]" />

    <!-- Energy stats -->
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <span class="text-sm text-[#7a7f96]">Daily Consumption</span>
        <div>
          <span id="daily-kwh" class="font-mono font-semibold tabular-nums text-[#f0f0ee]">0.00</span>
          <span class="font-mono text-xs text-[#7a7f96] ml-1">kWh/day</span>
        </div>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm text-[#7a7f96]">Monthly Estimate</span>
        <div>
          <span id="monthly-kwh" class="font-mono font-semibold tabular-nums text-[#f0f0ee]">0</span>
          <span class="font-mono text-xs text-[#7a7f96] ml-1">kWh/mo</span>
        </div>
      </div>
    </div>

    <!-- Divider -->
    <hr class="border-[#2a2d3a]" />

    <!-- Bill estimate -->
    <div class="rounded-lg bg-[#0f1117] border border-[#2a2d3a] px-4 py-3">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm text-[#7a7f96]">Est. Monthly Bill</span>
        <span id="monthly-bill" class="font-display font-bold text-2xl tabular-nums" style="color: var(--accent);">₹0</span>
      </div>
      <div class="flex items-center gap-2 text-xs text-[#7a7f96]">
        <span>Tariff:</span>
        <span class="font-mono">₹</span>
        <input
          id="tariff-input"
          type="number"
          value="8"
          min="1"
          max="50"
          step="0.5"
          class="w-14 bg-[#1a1d27] border border-[#2a2d3a] rounded px-2 py-0.5 font-mono text-xs text-[#f0f0ee] text-center focus:border-[#f5a623] focus:outline-none"
          aria-label="Electricity tariff in rupees per kWh"
        />
        <span class="font-mono">/ kWh</span>
      </div>
    </div>

    <!-- Divider -->
    <hr class="border-[#2a2d3a]" />

    <!-- Top consumer -->
    <div>
      <p class="text-[10px] font-mono uppercase tracking-widest text-[#7a7f96] mb-2">Top Consumer</p>
      <div class="flex items-center justify-between">
        <span id="top-consumer-name" class="text-sm font-medium text-[#f0f0ee]">—</span>
        <div>
          <span id="top-consumer-watts" class="font-mono font-semibold tabular-nums text-[#f0f0ee]">0</span>
          <span class="font-mono text-xs text-[#7a7f96] ml-1">W</span>
        </div>
      </div>
    </div>

    <!-- Divider -->
    <hr class="border-[#2a2d3a]" />

    <!-- Actions -->
    <div class="flex gap-3">
      <button
        id="download-report-btn"
        type="button"
        class="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-[#2a2d3a] text-sm text-[#7a7f96] hover:border-[#f5a623] hover:text-[#f5a623] transition-colors focus:outline-none focus:ring-2 focus:ring-[#f5a623]"
        aria-label="Download report"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
          <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z"/>
          <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z"/>
        </svg>
        Report
      </button>
      <button
        id="reset-all-btn"
        type="button"
        class="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-[#2a2d3a] text-sm text-[#7a7f96] hover:border-[#ef4444] hover:text-[#ef4444] transition-colors focus:outline-none focus:ring-2 focus:ring-[#ef4444]"
        aria-label="Reset all appliances to defaults"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
          <path fill-rule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z" clip-rule="evenodd"/>
        </svg>
        Reset
      </button>
    </div>

  </div>
</aside>
```

---

### `src/components/ReportModal.astro`

```astro
---
// No props — content populated via JS
---

<div
  id="report-modal"
  class="fixed inset-0 z-50 hidden items-center justify-center p-4 no-print"
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
>
  <!-- Backdrop -->
  <div id="modal-backdrop" class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

  <!-- Modal box -->
  <div class="relative w-full max-w-lg bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl shadow-2xl overflow-hidden">
    <div class="flex items-center justify-between px-6 py-4 border-b border-[#2a2d3a]">
      <h3 id="modal-title" class="font-display font-bold text-xl text-[#f0f0ee]">Load Report</h3>
      <button
        id="modal-close"
        type="button"
        class="w-8 h-8 rounded-lg text-[#7a7f96] hover:text-[#f0f0ee] hover:bg-[#2a2d3a] transition-colors focus:outline-none"
        aria-label="Close report"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 mx-auto">
          <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"/>
        </svg>
      </button>
    </div>

    <div class="px-6 py-5">
      <pre
        id="report-content"
        class="font-mono text-xs text-[#f0f0ee] whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto"
      ></pre>
    </div>

    <div class="px-6 py-4 border-t border-[#2a2d3a] flex gap-3">
      <button
        id="print-btn"
        type="button"
        class="flex-1 px-4 py-2.5 rounded-lg bg-[#f5a623] text-[#0f1117] text-sm font-semibold hover:bg-[#c4811a] transition-colors focus:outline-none"
      >
        Print / Save PDF
      </button>
      <button
        id="copy-report-btn"
        type="button"
        class="px-4 py-2.5 rounded-lg border border-[#2a2d3a] text-[#7a7f96] text-sm hover:border-[#7a7f96] transition-colors focus:outline-none"
      >
        Copy Text
      </button>
    </div>
  </div>
</div>
```

---

### `src/pages/index.astro`

This is the main page. It imports all components and contains the **complete client-side TypeScript** in a `<script>` tag.

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
import PageHero from '@/components/PageHero.astro';
import ApplianceCategory from '@/components/ApplianceCategory.astro';
import ResultsPanel from '@/components/ResultsPanel.astro';
import ReportModal from '@/components/ReportModal.astro';
import { DEFAULT_APPLIANCES, CATEGORIES } from '@/data/appliances';
import type { ApplianceCategory as CategoryType } from '@/types';

// Group appliances by category for SSR rendering
const grouped = CATEGORIES.map(cat => ({
  name: cat as CategoryType,
  appliances: DEFAULT_APPLIANCES.filter(a => a.category === cat),
}));
---

<BaseLayout>
  <PageHero />

  <main class="max-w-[1400px] mx-auto px-4 sm:px-6 pb-24">
    <div class="flex flex-col lg:flex-row gap-6 items-start">

      <!-- Left: appliance categories -->
      <div class="flex-1 min-w-0 space-y-4">
        {grouped.map((group, i) => (
          <ApplianceCategory
            name={group.name}
            appliances={group.appliances}
            index={i}
          />
        ))}
      </div>

      <!-- Right: results panel -->
      <div class="w-full lg:w-80 xl:w-96 flex-shrink-0">
        <ResultsPanel />
      </div>

    </div>
  </main>

  <ReportModal />
</BaseLayout>

<script>
// ─────────────────────────────────────────────────────────
// HOME LOAD CALCULATOR — CLIENT-SIDE LOGIC
// All state management, calculations, and DOM updates
// ─────────────────────────────────────────────────────────

import { DEFAULT_APPLIANCES, CATEGORIES } from '@/data/appliances';
import type { Appliance, ApplianceCategory } from '@/types';

// ── State ─────────────────────────────────────────────────
let appliances: Appliance[] = structuredClone(DEFAULT_APPLIANCES);
let tariff = 8; // ₹/kWh
let customIdCounter = 1000;

// ── Helpers ───────────────────────────────────────────────
function getAppliance(id: string): Appliance | undefined {
  return appliances.find(a => a.id === id);
}

function rowKWh(a: Appliance): number {
  return (a.watts * a.qty * a.hours) / 1000;
}

// ── Calculation ───────────────────────────────────────────
function calculate() {
  const included = appliances.filter(a => a.included && a.qty > 0);

  const totalWatts = included.reduce((s, a) => s + a.watts * a.qty, 0);
  const dailyKWh   = included.reduce((s, a) => s + rowKWh(a), 0);
  const monthlyKWh = dailyKWh * 30;
  const monthlyBill = monthlyKWh * tariff;
  const loadPercent = Math.min((totalWatts / 5000) * 100, 100);

  const top = included.reduce<Appliance | null>((best, a) => {
    if (!best) return a;
    return a.watts * a.qty > best.watts * best.qty ? a : best;
  }, null);

  // ── Update Results Panel ──
  animateCounter('total-watts', totalWatts, 0);
  setText('total-kw', (totalWatts / 1000).toFixed(2));
  animateCounter('daily-kwh', dailyKWh, 2);
  animateCounter('monthly-kwh', monthlyKWh, 0);
  setText('monthly-bill', `₹${Math.round(monthlyBill).toLocaleString('en-IN')}`);
  setText('top-consumer-name', top ? top.name : '—');
  setText('top-consumer-watts', top ? (top.watts * top.qty).toLocaleString() : '0');
  setText('load-percent', `${Math.round(loadPercent)}%`);

  // Progress bar
  const bar = document.getElementById('load-bar');
  if (bar) bar.style.width = `${loadPercent}%`;
  const progress = document.getElementById('load-progress');
  if (progress) progress.setAttribute('aria-valuenow', String(Math.round(loadPercent)));

  // Load level badge
  const badge = document.getElementById('load-level-badge');
  if (badge) {
    if (totalWatts < 1000) {
      badge.textContent = 'Light Load';
      badge.style.borderColor = 'var(--success)';
      badge.style.color = 'var(--success)';
    } else if (totalWatts < 3000) {
      badge.textContent = 'Moderate Load';
      badge.style.borderColor = 'var(--warning)';
      badge.style.color = 'var(--warning)';
    } else {
      badge.textContent = 'Heavy Load';
      badge.style.borderColor = 'var(--danger)';
      badge.style.color = 'var(--danger)';
    }
  }

  // ── Update Category Badges ──
  CATEGORIES.forEach(cat => {
    const catAppliances = appliances.filter(a => a.category === cat && a.included && a.qty > 0);
    const catWatts = catAppliances.reduce((s, a) => s + a.watts * a.qty, 0);
    const catKWh   = catAppliances.reduce((s, a) => s + rowKWh(a), 0);
    const catCount = appliances.filter(a => a.category === cat).length;

    const wattEl = document.querySelector(`[data-category-watts="${cat}"]`);
    const kwhEl  = document.querySelector(`[data-category-kwh="${cat}"]`);
    const cntEl  = document.querySelector(`[data-category-count="${cat}"]`);

    if (wattEl) wattEl.textContent = `⚡ ${catWatts.toLocaleString()} W`;
    if (kwhEl)  kwhEl.textContent  = `📊 ${catKWh.toFixed(2)} kWh/d`;
    if (cntEl)  cntEl.textContent  = String(catCount);
  });
}

// ── Animated Counter ──────────────────────────────────────
function animateCounter(id: string, target: number, decimals: number) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = parseFloat(el.textContent?.replace(/[^0-9.]/g, '') || '0') || 0;
  const duration = 350;
  const startTime = performance.now();

  function step(now: number) {
    const progress = Math.min((now - startTime) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
    const value = start + (target - start) * ease;
    el.textContent = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString('en-IN');
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function setText(id: string, value: string) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// ── kWh display update for a single row ──────────────────
function updateRowKWh(a: Appliance) {
  const kwhEl = document.querySelector(`[data-kwh-display="${a.id}"]`);
  if (kwhEl) kwhEl.textContent = rowKWh(a).toFixed(2);
}

function updateRowQtyDisplay(a: Appliance) {
  const el = document.querySelector(`[data-qty-display="${a.id}"]`);
  if (el) el.textContent = String(a.qty);
}

function updateRowNameStyle(a: Appliance) {
  const row = document.querySelector<HTMLElement>(`[data-id="${a.id}"]`);
  if (!row) return;
  const nameEl = row.querySelector<HTMLElement>('.flex-1 span');
  if (nameEl) nameEl.style.color = a.included ? 'var(--text-primary)' : 'var(--text-muted)';
  const toggle = row.querySelector<HTMLElement>('.toggle-label');
  if (toggle) toggle.style.backgroundColor = a.included ? 'var(--accent)' : '';
}

// ── Debounce ──────────────────────────────────────────────
function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}

const debouncedCalculate = debounce(calculate, 80);

// ── DOM Event Delegation ──────────────────────────────────
document.addEventListener('change', (e) => {
  const target = e.target as HTMLElement;
  const action = target.dataset.action;
  const id     = target.dataset.id;

  if (!action || !id) return;
  const a = getAppliance(id);
  if (!a) return;

  if (action === 'toggle-include') {
    a.included = (target as HTMLInputElement).checked;
    updateRowNameStyle(a);
    calculate();
  }

  if (action === 'update-watts') {
    const val = parseFloat((target as HTMLInputElement).value);
    if (!isNaN(val) && val >= 1) {
      a.watts = val;
      updateRowKWh(a);
      debouncedCalculate();
    }
  }

  if (action === 'update-hours') {
    const val = parseFloat((target as HTMLInputElement).value);
    if (!isNaN(val) && val >= 0 && val <= 24) {
      a.hours = val;
      updateRowKWh(a);
      debouncedCalculate();
    }
  }
});

document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const btn = target.closest<HTMLElement>('[data-action]');
  if (!btn) return;

  const action = btn.dataset.action;
  const id     = btn.dataset.id;

  if (!action) return;

  // Stepper buttons
  if ((action === 'increment-qty' || action === 'decrement-qty') && id) {
    const a = getAppliance(id);
    if (!a) return;
    if (action === 'increment-qty') a.qty = Math.min(a.qty + 1, 20);
    if (action === 'decrement-qty') a.qty = Math.max(a.qty - 1, 0);
    updateRowQtyDisplay(a);
    updateRowKWh(a);
    calculate();
  }

  // Delete custom appliance
  if (action === 'delete-appliance' && id) {
    appliances = appliances.filter(a => a.id !== id);
    const row = document.querySelector(`[data-id="${id}"]`);
    row?.remove();
    calculate();
  }
});

// ── Tariff input ──────────────────────────────────────────
document.getElementById('tariff-input')?.addEventListener('input', (e) => {
  const val = parseFloat((e.target as HTMLInputElement).value);
  if (!isNaN(val) && val > 0) {
    tariff = val;
    debouncedCalculate();
  }
});

// ── Category collapse/expand ──────────────────────────────
document.querySelectorAll<HTMLButtonElement>('.category-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const category = btn.dataset.category!;
    const bodyId   = `category-body-${category.replace(/\s/g, '-')}`;
    const body     = document.getElementById(bodyId);
    const chevron  = btn.querySelector<SVGElement>('.chevron');
    if (!body) return;

    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    body.style.display = isOpen ? 'none' : '';
    if (chevron) chevron.style.transform = isOpen ? 'rotate(-90deg)' : '';
  });
});

// ── Add custom appliance forms ────────────────────────────
document.querySelectorAll<HTMLButtonElement>('.add-toggle-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const category = btn.dataset.category!;
    const wrapper  = btn.closest('.add-appliance-wrapper');
    const form     = wrapper?.querySelector<HTMLFormElement>('.add-appliance-form');
    if (!form) return;
    const isHidden = form.classList.contains('hidden');
    form.classList.toggle('hidden', !isHidden);
    btn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
  });
});

document.querySelectorAll<HTMLButtonElement>('.add-cancel-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const wrapper = btn.closest('.add-appliance-wrapper');
    const form = wrapper?.querySelector<HTMLFormElement>('.add-appliance-form');
    const toggleBtn = wrapper?.querySelector<HTMLButtonElement>('.add-toggle-btn');
    form?.classList.add('hidden');
    form?.reset();
    toggleBtn?.setAttribute('aria-expanded', 'false');
  });
});

document.querySelectorAll<HTMLFormElement>('.add-appliance-form').forEach(form => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput  = form.querySelector<HTMLInputElement>('[data-field="name"]');
    const wattsInput = form.querySelector<HTMLInputElement>('[data-field="watts"]');
    const hoursInput = form.querySelector<HTMLInputElement>('[data-field="hours"]');
    const catSelect  = form.querySelector<HTMLSelectElement>('[data-field="category"]');
    const errorEl    = form.querySelector<HTMLParagraphElement>('.form-error');

    const name  = nameInput?.value.trim();
    const watts = parseFloat(wattsInput?.value || '0');
    const hours = parseFloat(hoursInput?.value || '0');
    const cat   = (catSelect?.value || 'Other') as ApplianceCategory;

    // Validate
    if (!name) {
      if (errorEl) { errorEl.textContent = 'Please enter an appliance name.'; errorEl.classList.remove('hidden'); }
      nameInput?.focus();
      return;
    }
    if (!watts || watts < 1) {
      if (errorEl) { errorEl.textContent = 'Watts must be at least 1.'; errorEl.classList.remove('hidden'); }
      wattsInput?.focus();
      return;
    }
    if (hours < 0 || hours > 24) {
      if (errorEl) { errorEl.textContent = 'Hours must be between 0 and 24.'; errorEl.classList.remove('hidden'); }
      hoursInput?.focus();
      return;
    }

    errorEl?.classList.add('hidden');

    const newAppliance: Appliance = {
      id: `custom-${++customIdCounter}`,
      category: cat,
      name,
      defaultWatts: watts,
      defaultQty: 1,
      defaultHours: hours,
      watts,
      qty: 1,
      hours,
      included: true,
      custom: true,
    };

    appliances.push(newAppliance);

    // Inject row into the correct category DOM section
    const container = document.querySelector(`[data-rows-container="${cat}"]`);
    if (container) {
      const rowHtml = buildRowHTML(newAppliance);
      container.insertAdjacentHTML('beforeend', rowHtml);
    }

    // Reset form and hide
    form.reset();
    form.classList.add('hidden');
    const toggleBtn = form.closest('.add-appliance-wrapper')?.querySelector<HTMLButtonElement>('.add-toggle-btn');
    toggleBtn?.setAttribute('aria-expanded', 'false');

    calculate();
  });
});

// ── Build row HTML dynamically (mirrors ApplianceRow.astro) ──
function buildRowHTML(a: Appliance): string {
  const kwh = rowKWh(a).toFixed(2);
  return `
    <div class="appliance-row group flex flex-wrap lg:flex-nowrap items-center gap-3 px-4 py-3 border-b border-[#2a2d3a] hover:bg-[#20232f] transition-colors duration-150 animate-slide-up" data-id="${a.id}" data-included="true">
      <div class="flex-shrink-0">
        <label class="relative inline-block w-11 h-6 cursor-pointer" title="Include in calculation">
          <input type="checkbox" class="toggle-checkbox sr-only" checked data-action="toggle-include" data-id="${a.id}" aria-label="Include ${a.name} in calculation" />
          <span class="toggle-label absolute inset-0 rounded-full cursor-pointer" style="background-color: var(--accent);"></span>
        </label>
      </div>
      <div class="flex-1 min-w-[140px]">
        <span class="text-sm font-medium" style="color: var(--text-primary);">${a.name}</span>
        <span class="ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#2a2d3a] text-[#f5a623]">CUSTOM</span>
      </div>
      <div class="flex items-center gap-1.5">
        <input type="number" value="${a.watts}" min="1" max="99999"
          class="w-20 bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-2 py-1.5 text-center font-mono text-sm text-[#f0f0ee] focus:border-[#f5a623] focus:outline-none transition-colors"
          data-action="update-watts" data-id="${a.id}" aria-label="Watts for ${a.name}" />
        <span class="text-[11px] text-[#7a7f96] font-mono">W</span>
      </div>
      <div class="flex items-center gap-1">
        <button type="button" class="stepper-btn w-8 h-8 rounded-md bg-[#2a2d3a] text-[#f0f0ee] font-bold text-base hover:bg-[#f5a623] hover:text-[#0f1117] transition-colors focus:outline-none" data-action="decrement-qty" data-id="${a.id}" aria-label="Decrease quantity">−</button>
        <span class="w-8 text-center font-mono text-sm font-semibold tabular-nums" data-qty-display="${a.id}">${a.qty}</span>
        <button type="button" class="stepper-btn w-8 h-8 rounded-md bg-[#2a2d3a] text-[#f0f0ee] font-bold text-base hover:bg-[#f5a623] hover:text-[#0f1117] transition-colors focus:outline-none" data-action="increment-qty" data-id="${a.id}" aria-label="Increase quantity">+</button>
      </div>
      <div class="flex items-center gap-1.5">
        <input type="number" value="${a.hours}" min="0" max="24" step="0.25"
          class="w-16 bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-2 py-1.5 text-center font-mono text-sm text-[#f0f0ee] focus:border-[#f5a623] focus:outline-none transition-colors"
          data-action="update-hours" data-id="${a.id}" aria-label="Hours per day for ${a.name}" />
        <span class="text-[11px] text-[#7a7f96] font-mono">h/d</span>
      </div>
      <div class="flex-shrink-0 text-right min-w-[80px]">
        <span class="font-mono text-sm font-semibold tabular-nums" style="color: var(--accent);" data-kwh-display="${a.id}">${kwh}</span>
        <span class="text-[10px] text-[#7a7f96] ml-0.5">kWh/d</span>
      </div>
      <button type="button"
        class="flex-shrink-0 w-7 h-7 rounded-md text-[#7a7f96] hover:text-[#ef4444] hover:bg-[#2a2d3a] transition-colors focus:outline-none"
        data-action="delete-appliance" data-id="${a.id}" aria-label="Remove ${a.name}" title="Remove appliance">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 mx-auto">
          <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd"/>
        </svg>
      </button>
    </div>`;
}

// ── Reset All ─────────────────────────────────────────────
document.getElementById('reset-all-btn')?.addEventListener('click', () => {
  if (!confirm('Reset all appliances to their default values?')) return;

  appliances = structuredClone(DEFAULT_APPLIANCES);

  // Re-render all rows
  CATEGORIES.forEach(cat => {
    const container = document.querySelector(`[data-rows-container="${cat}"]`);
    if (!container) return;

    // Remove all rows
    container.innerHTML = '';

    // Re-insert default rows
    const catAppliances = appliances.filter(a => a.category === cat);
    catAppliances.forEach(a => {
      container.insertAdjacentHTML('beforeend', buildRowHTML(a));
    });
  });

  // Re-sync toggle visual state
  appliances.forEach(a => updateRowNameStyle(a));

  // Reset tariff
  tariff = 8;
  const tariffInput = document.getElementById('tariff-input') as HTMLInputElement;
  if (tariffInput) tariffInput.value = '8';

  calculate();
});

// ── Download / Print Report ───────────────────────────────
document.getElementById('download-report-btn')?.addEventListener('click', () => {
  const included = appliances.filter(a => a.included && a.qty > 0);
  const totalWatts  = included.reduce((s, a) => s + a.watts * a.qty, 0);
  const dailyKWh    = included.reduce((s, a) => s + rowKWh(a), 0);
  const monthlyKWh  = dailyKWh * 30;
  const monthlyBill = monthlyKWh * tariff;

  const date = new Date().toLocaleDateString('en-IN', { dateStyle: 'long' });

  let report = `HOME LOAD CALCULATOR — REPORT\n`;
  report += `Generated: ${date}\n`;
  report += `${'─'.repeat(48)}\n\n`;
  report += `SUMMARY\n`;
  report += `  Total Load          : ${totalWatts.toLocaleString('en-IN')} W (${(totalWatts / 1000).toFixed(2)} kW)\n`;
  report += `  Daily Consumption   : ${dailyKWh.toFixed(2)} kWh/day\n`;
  report += `  Monthly Estimate    : ${Math.round(monthlyKWh).toLocaleString('en-IN')} kWh/month\n`;
  report += `  Estimated Bill      : ₹${Math.round(monthlyBill).toLocaleString('en-IN')} / month\n`;
  report += `  Tariff Used         : ₹${tariff}/kWh\n\n`;
  report += `${'─'.repeat(48)}\n\n`;
  report += `APPLIANCE BREAKDOWN\n\n`;

  CATEGORIES.forEach(cat => {
    const catItems = included.filter(a => a.category === cat);
    if (!catItems.length) return;
    report += `  ${cat.toUpperCase()}\n`;
    catItems.forEach(a => {
      report += `    ${a.name.padEnd(28)} ${String(a.qty).padStart(2)}× ${String(a.watts).padStart(5)}W  ${rowKWh(a).toFixed(2)} kWh/d\n`;
    });
    report += '\n';
  });

  const modal   = document.getElementById('report-modal');
  const content = document.getElementById('report-content');
  if (modal && content) {
    content.textContent = report;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
});

document.getElementById('modal-close')?.addEventListener('click', closeModal);
document.getElementById('modal-backdrop')?.addEventListener('click', closeModal);
document.getElementById('print-btn')?.addEventListener('click', () => window.print());
document.getElementById('copy-report-btn')?.addEventListener('click', async () => {
  const content = document.getElementById('report-content')?.textContent || '';
  try {
    await navigator.clipboard.writeText(content);
    const btn = document.getElementById('copy-report-btn');
    if (btn) { btn.textContent = 'Copied!'; setTimeout(() => { btn.textContent = 'Copy Text'; }, 2000); }
  } catch { /* silent fail */ }
});

function closeModal() {
  const modal = document.getElementById('report-modal');
  modal?.classList.add('hidden');
  modal?.classList.remove('flex');
}

// Close modal on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// ── Init ──────────────────────────────────────────────────
calculate();
</script>
```

---

### `public/favicon.svg`

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <rect width="32" height="32" rx="8" fill="#0f1117"/>
  <path d="M18 4L8 18h8l-2 10 14-16h-8l2-8z" fill="#f5a623"/>
</svg>
```

---

## STEP 5 — FINAL VERIFICATION

After generating all files, run these checks:

```bash
# 1. Install deps and start dev server
cd home-load-calculator
npm install
npm run dev

# 2. Confirm no TypeScript errors
npx tsc --noEmit

# 3. Confirm Tailwind is processing
# Open http://localhost:4321 — page should render with dark background and amber accents

# 4. Build for production
npm run build
npm run preview
```

---

## ACCEPTANCE CRITERIA

The project is complete when:

- [ ] `npm run dev` starts with zero errors on first run
- [ ] `npm run build` produces a static site with zero errors
- [ ] All 26 default appliances render across 5 collapsible categories
- [ ] Results panel updates in real-time on every input change
- [ ] Qty steppers work (min 0, max 20); values never go negative
- [ ] Watts and Hours inputs update kWh display per row instantly
- [ ] Include toggle greys out the row and excludes from totals
- [ ] Add custom appliance form validates, injects new row into correct category
- [ ] Delete button removes custom appliances only
- [ ] Reset All restores all defaults and clears custom appliances
- [ ] Tariff input recalculates monthly bill live
- [ ] Top Consumer shows correct appliance name and wattage
- [ ] Load level badge changes color: green / amber / red
- [ ] Progress bar fills proportionally (0–5,000 W range)
- [ ] Category badges show live watt and kWh totals
- [ ] Download Report opens modal with formatted text
- [ ] Print button triggers `window.print()`
- [ ] Copy Text copies report to clipboard
- [ ] Mobile layout is usable with no horizontal scroll
- [ ] Google Fonts (Barlow Condensed, DM Sans, JetBrains Mono) load and render
- [ ] No console errors in browser DevTools

Generate all files now. Do not skip any file. Do not use placeholder comments like `// ... implement here`. Every function must be fully implemented.
