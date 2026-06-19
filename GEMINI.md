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
  - `assessment.astro`: Deep-dive electrical assessment report (noindex, excluded from sitemap — no meaningful content without calculator data).
  - `recommendations/`: Detailed sizing guides based on load.
  - `knowledge-hub/`: SEO content cluster (see Knowledge Hub section below).
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

### Premium Iconography (SVG only)
- **No Emoji Icons:** Do not use plain text emojis (e.g., 💡, ⚠️, 📋, ⚡, ☀️) for UI layout, headings, warnings, lists, or callouts.
- **Strict SVG Usage:** Always use inline, high-contrast, modern SVGs designed to match the premium, professional Modern Industrial Dashboard aesthetic.
- **Consistent Styling:** Ensure SVGs are styled using Tailwind classes (such as `text-accent`, `text-danger`, `w-4 h-4`, etc.) and are optimized for accessibility (`aria-hidden="true"` and proper viewBox).

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

## Knowledge Hub

### URL Structure
```
/knowledge-hub                          → Hub Homepage
/knowledge-hub/load-calculation         → Cluster Landing Page
/knowledge-hub/load-calculation/[slug]  → Individual Articles (6 articles)
/knowledge-hub/mcb-sizing               → Phase 2 stub
/knowledge-hub/wire-sizing              → Phase 2 stub
/knowledge-hub/solar-inverter           → Phase 2 stub
```

### Phase Status
- **Phase 1 (Complete):** Hub homepage + Load Calculation cluster (6 full articles) + 3 Phase 2 stubs.
- **Phase 2 (Pending):** MCB Sizing, Wire Sizing, Solar & Inverter clusters — full articles.

### Key Files
- `src/data/knowledgeHub.ts` — Cluster metadata & article registry (single source of truth).
- `src/layouts/KnowledgeHubLayout.astro` — Article layout with sticky TOC sidebar, breadcrumbs, reading time.
- `src/components/ClusterCard.astro`, `QuickAnswerBox.astro`, `KnowledgeHubCTA.astro` — Shared hub components.

### SEO Per Article
Every article includes: `Article` + `FAQPage` + `BreadcrumbList` + `HowTo` JSON-LD schemas, single H1, descriptive meta description, internal links to calculator and cluster page.

---

## Typography & Readability

### Base Font Scale
- `html { font-size: clamp(16px, 1vw + 13px, 18px) }` — fluid, scales 16px (mobile) → 18px (desktop).
- `body { line-height: 1.75; letter-spacing: 0.01em }` — open tracking compensates for Hind's condensed glyphs.
- All Tailwind `text-*` utilities are overridden in `@theme` (global.css) to sit one step larger than defaults.

### Font Roles
| Font | Variable | Usage |
|---|---|---|
| **Khand** | `font-display` | Headings, labels, buttons, UI chrome |
| **Hind** | `font-body` | Body copy, descriptions, paragraph text |
| **Geist Mono** | `font-mono` | Data values, code, technical readouts |

### FAQ Answer Convention
- FAQ answers are styled standardly across pages:
  - In `FAQSection.astro` and `/recommendations/*.astro` pages: standard `<p class="text-sm text-text-muted leading-relaxed">` elements.
  - In Knowledge Hub articles: `<div class="faq-body">` elements containing description copy (styled via layout rules).


---

## Sitemap & Indexing Rules

- Sitemap filter is in `astro.config.mjs`. Currently excludes: `/404` and `/assessment`.
- `/assessment` is **excluded** from sitemap and has `noindex={true}` — Google rejected it (no data without calculator state).
- All `/knowledge-hub/**` pages are **included** in the sitemap (SEO content).
- When adding new pages: indexable content pages need no action (included by default). Add to the filter exclusion list only for pages that are dynamic/stateless like assessment.

---

## Commands
- `npm run dev`: Start local development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build locally
- `npx playwright test`: Run all E2E tests
- `node scripts/verify-logic.cjs`: Run logic verification tests

---

## Code Quality Audit — Findings & Ongoing Rules
*Audit completed: 2026-06-19 | Overall score: 8.2 / 10*

### Resolved Issues (do not re-introduce)
- **Magic number `230` (voltage):** Always use `VOLTAGE_V` from `src/data/constants.ts`. Previously leaked in `print.ts`.
- **Magic number `30` (days/month):** Always use `DAYS_PER_MONTH` from `src/data/constants.ts`. Previously leaked in the `download-report` handler in `events.ts`.
- **`any[]` types on `schemaGraph` props:** Both `BaseLayout.astro` and `KnowledgeHubLayout.astro` now use `SchemaNode[]` (imported from `src/types/index.ts`). Do not revert to `any[]`.
- **Inline `style="color: var(--accent)"` in `404.astro`:** Replaced with `class="text-accent"`. Apply the same fix on all new pages.

### Pending Architectural Debt
- **`assessment.astro` is 1,863 lines** (spec limit: 600). The `#assess-print-layout` block (~900 lines of print HTML) should be extracted into a dedicated `AssessmentPrintLayout.astro` component, and client scripts moved to `src/scripts/assessment/` modules. This is the highest-priority refactor.
- **Font weight audit:** Khand 500 and Hind 500 are imported in `BaseLayout.astro` but may be unused. Audit `font-medium` usage across all components and drop unneeded weight files if confirmed (~60 KB saving).

### Enforced Constants (never use magic numbers for these)
| Constant | Value | Description |
|---|---|---|
| `VOLTAGE_V` | 230 | Standard single-phase residential voltage (V) |
| `DAYS_PER_MONTH` | 30 | Average days per month for billing estimates |
| `MCB_SAFETY_MARGIN` | 1.25 | IEC 60898 breaker design current margin |
| `INVERTER_OVERHEAD` | 1.2 | Inverter capacity overhead above connected load |
| `SOLAR_PEAK_SUN_HOURS` | 4 | Peak sun hours/day for solar sizing |
| `STABILIZER_OVERHEAD` | 1.3 | Mainline stabilizer sizing safety factor |

All constants live in `src/data/constants.ts`.

### TypeScript Types (enforce)
- `SchemaNode = Record<string, unknown>` — use for all JSON-LD schema graph arrays (defined in `src/types/index.ts`)
- All timeout handles must be `ReturnType<typeof setTimeout> | undefined` — never `any`
- All layout `schemaGraph` props must be `SchemaNode[]`, never `any[]`

### Inline Style Policy (enforce)
- **Banned:** `style="color: var(--accent)"` → use `class="text-accent"`
- **Banned:** `style="color: var(--danger)"` → use `class="text-danger"`
- **Banned:** `style="color: var(--success)"` → use `class="text-success"`
- **Allowed (no Tailwind equivalent):** `color-mix()` glow shadows, `radial-gradient` overlays, complex multi-value `box-shadow` expressions with CSS variables
