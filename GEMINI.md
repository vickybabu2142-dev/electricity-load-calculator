# Electricity Load Calculator

## Architecture & Tech Stack
- **Framework:** Astro (Minimal template, strict TypeScript)
- **Styling:** Tailwind CSS v4
- **Design System:** Modern Industrial Dashboard aesthetic with dual-theme professional palettes.
- **Scope:** Primarily focused on **Home Appliances** and residential energy management for Version 1.
- **Deployment:** Vercel (via `@astrojs/vercel` adapter)
- **State Management:** Vanilla client-side TypeScript (native `<script>` tags, no heavy frameworks).
- **Testing:** Playwright (E2E) and Node.js (Logic verification).

## Features
- **Real-time Load Calculation:** Watts, kW, kWh/day, and kWh/month estimates.
- **Dynamic Assessment:** Instant electrical health score based on load utilization, efficiency, and safety.
- **Smart Recommendations:** Tailored MCB, Cable, Inverter, and Solar sizing based on your specific load.
- **Professional Assessment Report:** Comprehensive multi-page assessment (Assessment page) and print-ready PDF reports.
- **Insight Guides:** Deep-dive education on MCBs, Cables, Inverters, and Solar technology.
- **Persistent State:** All configurations and custom appliances are saved to `localStorage`.
- **Industrial Themes:** High-contrast Dark (Industrial) and Light (Stormy Morning) themes.

## Project Structure
- `src/components/`: Modular UI components (Hero, Category, Row, Form, Panel, Modal, etc.).
- `src/layouts/`: Global HTML shell (`BaseLayout.astro`) with immediate theme injection.
- `src/pages/`: 
  - `index.astro`: Main calculator interface.
  - `assessment.astro`: Deep-dive electrical assessment report.
  - `insights/`: Educational guides for electrical components.
  - `recommendations/`: Detailed sizing guides based on load.
  - `about-us.astro`, `contact-us.astro`, `privacy-policy.astro`, `terms-conditions.astro`, `404.astro`.
- `src/styles/`: Global CSS (`global.css`) with Tailwind `@theme` and print overrides.
- `src/utils/`: 
  - `calculations.ts`: Core math (Watts to kWh).
  - `health.ts`: Health score and savings logic.
  - `insights.ts`: Component recommendation logic.
- `tests/e2e/`:
  - `electricity-load-calculator.spec.ts`: Core calculator interactions.
  - `site-pages.spec.ts`: Navigation and secondary page verification.

## Development & Production Standards

### Client-Side Consistency
- All interactions are managed via native event delegation in `index.astro` and `assessment.astro`.
- Logic-generated HTML (e.g., custom rows) strictly mirrors the styling of SSR-rendered components to maintain visual integrity.

### Advanced Print Optimization
- The assessment report (`#assess-print-layout`) is engineered for professional physical and PDF output.
- **Document Integrity:** Forces a pure white background and high-contrast dark text regardless of the UI's active theme.
- **Ink Efficiency:** Background colors are restricted to subtle accents and borders via `print-color-adjust: exact`.

## Testing & Verification

### Automated Tests (Implemented)
1. **Calculation Logic:** Verified via `node scripts/verify-logic.cjs`.
2. **Calculator Interactions:** Playwright tests for quantity steppers, watts/hours editing, custom additions, and preset loading.
3. **Site Navigation:** Playwright tests for all static pages, 404, and cross-page data persistence (Assessment).
4. **Theme Logic:** Verification of theme toggling and persistence.
5. **Load Level Logic:** Verification of badge updates (Light/Moderate/Heavy Load).

## Commands
- `npm run dev`: Start local development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build locally
- `npx playwright test`: Run all E2E tests
- `node scripts/verify-logic.cjs`: Run logic verification tests
