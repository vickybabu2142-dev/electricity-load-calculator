# Electricity Load Calculator

A professional, industrial-grade web application for calculating household electrical load requirements and estimating energy costs. Built with Astro, Tailwind CSS v4, and strict TypeScript.

## Features

- **Real-time Load Calculation** — Instant total wattage and monthly cost estimates as you configure appliances.
- **Home Appliance Catalog** — Pre-loaded with common residential appliances (Lighting, Cooling, Kitchen, etc.) organized by category.
- **Custom Appliances** — Add any household appliance with a custom name and wattage.
- **Quantity & Toggle Controls** — Stepper inputs for quantity; toggle switches to include/exclude items from the report.
- **Dual Theme**
  - *Industrial Dark* (default) — High-contrast dashboard with amber accent.
  - *Stormy Morning* (light) — Clean blue-gray palette. Theme persists across sessions.
- **Print / PDF Report** — Ink-optimized layout that switches automatically on print.
- **SEO Optimized** — Sitemap, structured metadata, breadcrumbs, and a custom 404 page.
- **Performance First** — Minimal client-side JavaScript; Astro static output with vanilla TypeScript.

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
├── components/       # UI components (Astro)
├── data/             # Appliance catalog data
├── layouts/          # Base page layout
├── pages/            # Route pages (index, about, contact, 404, …)
├── types/            # Shared TypeScript types
└── utils/            # Calculation logic
scripts/
└── verify-logic.cjs  # Unit-style logic verification script
tests/
└── e2e/              # Playwright end-to-end tests
```

## Commands

Run from the project root:

| Command | Action |
| :------ | :----- |
| `npm install` | Install dependencies |
| `npm run dev` | Start local dev server at `localhost:4321` |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build locally |
| `node scripts/verify-logic.cjs` | Run calculation logic verification |
| `npx playwright test` | Run Playwright E2E tests |

## Getting Started

```sh
npm install
npm run dev
```

Open `http://localhost:4321` in your browser.

## Testing

**Logic verification** (fast, no browser required):
```sh
node scripts/verify-logic.cjs
```

**End-to-end tests** (requires a running dev or preview server):
```sh
npx playwright test
```

Test artifacts (`test-results/`, `playwright-report/`) are git-ignored.

---

*Built for precision and reliability.*
