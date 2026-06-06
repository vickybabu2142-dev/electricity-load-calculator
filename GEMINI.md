# Home Load Calculator

## Architecture & Tech Stack
- **Framework:** Astro (Minimal template, strict TypeScript)
- **Styling:** Tailwind CSS v4
- **Design System:** Vercel-inspired minimalist monochrome (Inter/JetBrains Mono fonts, black/white/gray color palette)
- **Deployment:** Vercel (via `@astrojs/vercel` adapter)
- **State Management:** Vanilla client-side TypeScript (in `<script>` tags within Astro components)

## Project Structure
- `src/components/`: Reusable UI components (Hero, Row, Form, Panel, Modal).
- `src/layouts/`: Global HTML shell and font loading.
- `src/pages/`: Route definitions and main client-side logic (`index.astro`).
- `src/styles/`: Global CSS and Tailwind directives/theme overrides.
- `src/types/`: Shared TypeScript interfaces.
- `src/data/`: Default application data (appliances, categories).

## Development Conventions
- **Client-Side Logic:** Keep client interactions and state management in native `<script>` tags within Astro pages/components. Do not introduce UI frameworks (React, Vue, Svelte, etc.).
- **Styling:** Use Tailwind utility classes. CSS variables defined in `src/styles/global.css` dictate the core theme. Maintain the minimalist monochrome aesthetic.
- **TypeScript:** Strict typing is enforced. Use explicit interfaces from `src/types`.

## Commands
- `npm run dev`: Start local development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build locally
