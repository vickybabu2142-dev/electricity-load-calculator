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
- **Professional Assessment Report:** Comprehensive multi-page assessment and print-ready PDF reports with QR codes, shareability features, and report verification metadata (V4).
- **Insight Guides:** Deep-dive education on MCBs, Cables, Inverters, and Solar technology.
- **Persistent State:** All configurations and custom appliances are saved to `localStorage`.
- **Industrial Themes:** High-contrast Dark (Industrial) and Light (Stormy Morning) themes.

## Project Structure
- `src/components/`: Modular UI components (Hero, Category, Row, Form, Panel, Modal, etc.).
- `src/layouts/`: Global HTML shell (`BaseLayout.astro`) with immediate theme injection.
- `src/pages/`: 
  - `index.astro`: Main calculator interface.
  - `assessment.astro`: Deep-dive electrical assessment report.
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

## Code Health & Architecture Guidelines (Optimization Principles)

To prevent code smell regression, adhere strictly to these architectural practices when modifying or extending this application:

### 1. Code Duplication & Shared Templates
- **No HTML template duplication:** Never replicate HTML generation logic between SSR (.astro files) and client-side scripts.
- **Shared Row Templates:** Dynamic rows must be constructed using a single-source template engine (such as `src/utils/rowTemplate.ts`) which is shared by both client-side DOM builders and server-side components (`ApplianceRow.astro`).
- Ensure all interactive elements within dynamically generated rows have unique `id`/`label` pairs to maintain proper accessibility (a11y).

### 2. Modularity & Monolithic Files
- Keep component layout (HTML/CSS) and interactive logic (TypeScript) separated. Do not exceed 600 lines for page templates (e.g. `index.astro`).
- Client-side logic belongs in dedicated modular directories under `src/scripts/calculator/` (such as `calculate.ts`, `events.ts`, `dom.ts`, `presets.ts`, `print.ts`, `state.ts`).
- Avoid "God functions" like the original `calculate()`. Break down rendering, DOM updating, printing setup, health evaluation, and computations into small, single-responsibility functions.

### 3. State Management & Data Processing
- Do not double-parse the local storage context. Manage states in a unified reactive model.
- Prevent O(N) recalculations on rendering. Pre-group collections or execute single-pass reductions where possible to optimize high-frequency event loops.
- Report IDs should remain stable per session rather than being regenerated on every keystroke. Regenerate them only when printing or starting a new session.

### 4. DOM Selectors & Styling Rules
- **Avoid Fragile Selectors:** Do not query elements using nested structural selectors (e.g. `.flex-1 span`). Tag elements with expressive data attributes (e.g., `data-appliance-name`) to isolate DOM query logic from layout shifts.
- **CSS Variable & Style Consistency:** Avoid static inline style attributes like `style="color: var(--accent)"` when Tailwind utilities (like `text-accent`) exist. Maintain native UI element theme states through `color-scheme` updates in `global.css`.
- **Typings:** Set explicitly typed timeout handlers instead of using `any` (e.g., `ReturnType<typeof setTimeout> | undefined`).

### 5. Magic Numbers & Configuration
- All engineering constraints (voltage levels, safety margins, days per month, sun hours, MCB options) must be imported from the central configuration module (`src/data/constants.ts`).

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
