# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
npm run dev                   # Dev server at localhost:4321
npm run build                 # Production build
npm run preview               # Preview production build
node scripts/verify-logic.cjs # Run calculation logic tests (no browser needed)
npx playwright test           # Run all E2E tests (auto-starts dev server)
npx playwright test --grep "test name"  # Run a single test by name
npx playwright test --ui      # Open Playwright UI mode
```

TypeScript path alias `@/` maps to `src/` (defined in `tsconfig.json`).

## Architecture

### Rendering Model
Astro renders all pages as static HTML at build time (SSR components). The **only** client-side JavaScript lives in the `<script>` block at the bottom of `src/pages/index.astro`. There is no React, Vue, or Svelte — just vanilla TypeScript with native DOM APIs.

### Data Flow
1. **SSR (build time):** `src/data/appliances.ts` → `DEFAULT_APPLIANCES[]` is imported in `index.astro` and rendered into HTML by `ApplianceCategory.astro` + `ApplianceRow.astro`.
2. **Client-side (runtime):** `index.astro`'s `<script>` clones `DEFAULT_APPLIANCES` into a mutable `appliances: Appliance[]` array in module scope. All interactions (toggle, stepper, watts/hours edit) mutate this array, then call `calculate()` which updates the DOM directly via `getElementById` / `querySelector`.

### Critical Invariant: `buildRowHTML()` must mirror `ApplianceRow.astro`
When a custom appliance is added at runtime, `buildRowHTML()` in `index.astro` injects HTML dynamically. This function must stay in sync with `ApplianceRow.astro` — same `data-action`, `data-id`, `aria-label`, and CSS class patterns. Breaking this sync causes custom rows to be unresponsive to event delegation.

### Event Delegation
All appliance interactions use two top-level listeners on `document`:
- `'change'` — handles `toggle-include`, `update-watts`, `update-hours`
- `'click'` — handles `increment-qty`, `decrement-qty`, `delete-appliance`

Buttons/inputs use `data-action` and `data-id` attributes to identify their intent and target appliance.

### Category DOM IDs
Category body elements use `id="category-body-{name.replace(/\s/g, '-')}"`. Categories with special characters produce IDs like `category-body-Fans-&-Cooling` and `category-body-Office-&-IT`. In CSS selectors, use the attribute form `[id="category-body-Fans-&-Cooling"]` to avoid escaping issues.

### Calculation Logic
`src/utils/calculations.ts` exports two pure functions:
- `calculateRowKWh(appliance)` → `watts × qty × hours / 1000`
- `calculateTotals(appliances, tariff, maxCapacityKW)` → filters `included && qty > 0`, computes watts/kWh/bill/load%/topConsumer

`scripts/verify-logic.cjs` duplicates these functions (CommonJS) for fast Node.js verification without a build step.

### Theme System
Theme is stored in `localStorage` as `'light'` or absent (dark). `BaseLayout.astro` injects an inline script in `<head>` that applies `.light` to `<html>` before first paint to prevent flash. All colors are CSS custom properties defined in `src/styles/global.css` under `:root` (dark) and `.light` selectors. The accent color differs between themes: Industrial Amber (`#F4A826`) in dark, Electric Blue (`#2563EB`) in light.

### Currency / Region Settings
`REGION_SETTINGS` in `index.astro`'s script maps currency codes (INR, USD, EUR, GBP, CAD, AUD) to `{ locale, symbol, defaultTariff, step, defaultMaxKW }`. Switching currency resets tariff and max capacity to regional defaults and reformats all displayed values using `Intl.NumberFormat` with the new locale.

## Testing

### E2E Tests (`tests/e2e/`)
- Use `aria-label` selectors (e.g., `'input[aria-label="Include LED Bulb in calculation"]'`) — more reliable than positional selectors.
- Only the **Lighting** category is expanded by default; all others start collapsed (`display: none`). Tests that interact with collapsed categories must first click `button.category-toggle[data-category="..."]`.
- Initial state: only `LED Bulb` (9W, qty 1, 8h/day) has `included: true` → total kW displays as `"0.01"`.
- The `calculate()` result animates over 350ms via `requestAnimationFrame`. Playwright's built-in retry on `expect()` handles this.

### Logic Verification (`scripts/verify-logic.cjs`)
Four test cases covering: single appliance math, excluded appliance filtering, load percent capping at 100%, and top-consumer identification by `watts × qty`.

## Security & Safeguards

### Never Commit Sensitive Files
To prevent accidental exposure of credentials or local state, the following files MUST NEVER be pushed to version control:
- `.dev.vars`: Local secrets for Cloudflare Workers (API keys, etc.).
- `.env` / `.env.*`: Standard environment variables.
- `.wrangler/`: Local development data and state.

These are ignored in `.gitignore` by default. Always verify your staged changes before committing.
