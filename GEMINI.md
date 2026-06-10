# Electricity Load Calculator

## Architecture & Tech Stack
- **Framework:** Astro (Minimal template, strict TypeScript)
- **Styling:** Tailwind CSS v4
- **Design System:** Modern Industrial Dashboard aesthetic with dual-theme professional palettes.
- **Deployment:** Cloudflare Pages (via `@astrojs/cloudflare` adapter)
- **State Management:** Vanilla client-side TypeScript (native `<script>` tags, no heavy frameworks).

## Design System & Themes

### 1. Industrial Dark (Default)
- **Palette:** High-contrast technical dashboard.
  - Base: `#0f0f0f` | Surface: `#111111` | Elevated: `#141414`
  - Accent: `#F4A826` (Industrial Amber) — used for branding, highlights, and primary CTAs.
  - Text: `#f0ebe2` (Primary) | `#a1a1aa` (Muted)
- **Vibe:** Power hardware, command center, authoritative.

### 2. Stormy Morning (Light Mode)
- **Palette:** Professional blue-gray hues reminiscent of technical documentation.
  - Base: `#F2F5F8` | Surface: `#FFFFFF`
  - Accent: `#4A76A8` (Stormy Steel Blue) — sharpened for visibility on light backgrounds.
  - Text: `#1D2939` (Dark Charcoal Blue) | `#4B5565` (Muted)
- **Vibe:** Trustworthy, reliable, clean professional output.

### Typography
- **Display/Headers:** [Khand](https://fonts.google.com/specimen/Khand) Bold — High-impact, industrial, condensed. Used for Hero, Section Titles, and Calculation Totals.
- **Body/Labels:** [Hind](https://fonts.google.com/specimen/Hind) Regular — Professional and clean. Used for appliance names, descriptions, and metadata.
- **Buttons:** Khand Medium — Balanced for small-scale legibility.
- **Values/Data:** [Geist Mono](https://vercel.com/font/mono) — Technical, tabular-nums for perfect digit alignment.

## Project Structure
- `src/components/`: Modular UI components (Hero, Category, Row, Form, Panel, Modal).
- `src/layouts/`: Global HTML shell (`BaseLayout.astro`) with immediate theme injection.
- `src/pages/`: Route definitions and core application logic (`index.astro`).
- `src/styles/`: Global CSS (`global.css`) containing the central theme variables, Tailwind `@theme` configuration, and advanced print overrides.
- `src/types/`: Shared TypeScript interfaces for type safety.
- `src/data/`: Default appliance lists and category configurations.

## Development & Production Standards

### Client-Side Consistency
- All interactions (steppers, toggles, custom adds) are managed via native event delegation in `index.astro`.
- Logic-generated HTML (e.g., custom rows) must strictly mirror the styling of SSR-rendered components (e.g., `ApplianceRow.astro`) to maintain visual integrity.

### Advanced Print Optimization
- The report layout (`#print-layout`) is engineered for professional physical and PDF output.
- **Document Integrity:** Forces a pure white background and high-contrast dark text (`#0f0f0f`) regardless of the UI's active theme.
- **Branding Sync:** The report header follows the Hero branding ("Electricity Load **Report**") and utilizes theme-based accent colors (Industrial Amber for Dark Mode users, Stormy Blue for Light Mode users).
- **Ink Efficiency:** Background colors are enabled via `print-color-adjust: exact` but restricted to subtle accents and borders.

## Security & Safeguards

### Never Commit Sensitive Files
To prevent accidental exposure of credentials or local state, the following files MUST NEVER be pushed to version control:
- `.dev.vars`: Local secrets for Cloudflare Workers (API keys, etc.).
- `.env` / `.env.*`: Standard environment variables.
- `.wrangler/`: Local development data and state.

These are ignored in `.gitignore` by default. Always verify your staged changes before committing.

## Testing & Verification

### Calculation Logic
- **Utility:** `src/utils/calculations.ts` contains pure functions for all math operations.
- **Verification:** Run `node scripts/verify-logic.cjs` to execute the standalone calculation test suite.

### Missing UI Tests (Recommended)
The following UI interactions are currently verified manually but should ideally be automated using a tool like **Playwright** or **Cypress**:
1. **Appliance Toggles:** Verify inclusion/exclusion updates totals.
2. **Custom Addition:** Verify form validation and dynamic row injection.
3. **Theme Switching:** Verify persistence and CSS variable updates.
4. **Region/Currency Logic:** Verify tariff updates and currency formatting.
5. **Reset All:** Verify restoration of default state.

## Commands
- `npm run dev`: Start local development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build locally
