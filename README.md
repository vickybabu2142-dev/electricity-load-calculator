# Electricity Load Calculator

A professional, industrial-grade web application for calculating household electrical load requirements, assessing electrical health, and receiving smart component recommendations. Built with Astro, Tailwind CSS v4, and strict TypeScript.

## Features

- **Real-time Load Calculation** — Instant total wattage, kW, and kWh estimates as you configure appliances.
- **Electrical Health Assessment** — Instant score based on load utilization, energy efficiency, and safety readiness.
- **Smart Recommendations** — Engineering-grade sizing for MCBs, Cables, Inverters, and Solar systems tailored to your specific load.
- **Interactive Assessment Report** — Deep-dive analysis of your home's electrical profile with smart insights.
- **Insight Guides** — Educational resources for understanding electrical components (MCBs, Cables, Solar, etc.).
- **Home Appliance Catalog** — Pre-loaded with common residential appliances organized by category.
- **Custom Appliances** — Add any household appliance with a custom name and wattage.
- **Dual Theme**
  - *Industrial Dark* (default) — High-contrast technical dashboard.
  - *Stormy Morning* (light) — Professional blue-gray palette.
- **Professional PDF Reports** — Ink-optimized assessment reports ready for printing or sharing with electricians.
- **Full Test Coverage** — Complete E2E test suite ensuring reliability across all pages and interactions.

## Tech Stack

| Layer | Technology |
| :---- | :--------- |
| Framework | [Astro](https://astro.build/) v6 |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Language | TypeScript (strict) |
| Typography | Khand · Hind · Geist Mono |
| Deployment | [Vercel](https://vercel.com/) |
| E2E Testing | [Playwright](https://playwright.dev/) |

## Project Structure

```
src/
├── components/       # UI components (Hero, Results, Modal, etc.)
├── data/             # Appliance catalog and default settings
├── layouts/          # Base page layout with theme injection
├── pages/            # Multi-page architecture (Assessment, Insights, Recommendations)
├── styles/           # Tailwind v4 configuration and global CSS
├── utils/            # Logic for calculations, health scores, and insights
└── types/            # Strict TypeScript interfaces
tests/
└── e2e/              # Comprehensive Playwright test suite
scripts/
└── verify-logic.cjs  # Standalone logic verification script
```

## Commands

| Command | Action |
| :------ | :----- |
| `npm run dev` | Start local development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npx playwright test` | Run all E2E tests |
| `node scripts/verify-logic.cjs` | Run calculation logic verification |

## Getting Started

```sh
npm install
npm run dev
```

Open `http://localhost:4321` in your browser.

## Testing

**End-to-end tests** (Ensures UI and logic integrity):
```sh
npx playwright test
```

**Logic verification** (Fast unit-style checks):
```sh
node scripts/verify-logic.cjs
```

---

*Engineered for precision. Built for reliability.*
