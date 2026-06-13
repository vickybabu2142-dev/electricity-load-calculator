# Gemini CLI Prompt — Production Readiness Tasks
# Home Load Calculator (AstroJS + Tailwind CSS v4)

> Run this prompt from inside the `home-load-calculator/` project directory.
> Gemini will edit existing files in-place across 8 categories.
> Do NOT regenerate the whole project — apply only what is described below.

---

## ROLE

You are a senior DevOps and frontend engineer preparing an AstroJS static site
for production deployment. You fix, configure, and harden existing code — you
do not rewrite working features. Every change must leave `npm run dev` and
`npm run build` working with zero errors.

---

## PROJECT SUMMARY

- Framework : AstroJS (latest), output: static
- CSS       : Tailwind CSS v4
- Pages     : src/pages/index.astro (single-page app)
- Layout    : src/layouts/BaseLayout.astro
- Components: src/components/*.astro
- Styles    : src/styles/global.css
- Data      : src/data/appliances.ts
- Types     : src/types/index.ts

---

## ══════════════════════════════════════════
## CATEGORY 1 — BUILD & CONFIGURATION
## ══════════════════════════════════════════

### TASK 1.1 — Fix all TypeScript errors

Run:
```bash
npx tsc --noEmit
```
Fix every error reported. Common issues to look for:
- Missing return types on exported functions
- `any` types that should be typed properly
- Unused imports
- Missing `?` on optional properties

Do not suppress errors with `// @ts-ignore` — fix them properly.

---

### TASK 1.2 — Disable sourcemaps in production build

**File:** `astro.config.mjs`

Add Vite config to disable sourcemaps:

```js
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwind()],
  output: 'static',
  vite: {
    build: {
      sourcemap: false,
    },
  },
});
```

---

### TASK 1.3 — Pin Node.js version

Create `.nvmrc` in the project root:

```
20
```

Add `engines` field to `package.json`:

```json
"engines": {
  "node": ">=20.0.0",
  "npm": ">=10.0.0"
}
```

---

### TASK 1.4 — Create .env.example

Create `.env.example` in the project root:

```bash
# Home Load Calculator — Environment Variables
# Copy this file to .env and fill in values

# Analytics (optional — Plausible)
# PUBLIC_PLAUSIBLE_DOMAIN=yourdomain.com

# No backend or secret keys required for this static app.
```

Also create `.env` (empty, gitignored):

```bash
# Local environment — do not commit
```

Add `.env` to `.gitignore` if not already present.

---

### TASK 1.5 — Verify static output and confirm no server runtime

Run:
```bash
npm run build
```

Check that `dist/` contains only static HTML, CSS, and JS files.
Confirm `astro.config.mjs` has `output: 'static'`.
If any server-side rendering is detected, convert to static.

---

## ══════════════════════════════════════════
## CATEGORY 2 — PERFORMANCE
## ══════════════════════════════════════════

### TASK 2.1 — Add font-display=swap to Google Fonts URL

**File:** `src/layouts/BaseLayout.astro`

Find the Google Fonts `<link>` tag and append `&display=swap` to the URL if
not already present. Also ensure both `preconnect` links are present:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=Geist+Mono:wght@400;600&display=swap"
  rel="stylesheet"
/>
```

---

### TASK 2.2 — Ensure no render-blocking scripts

**File:** `src/layouts/BaseLayout.astro` and all `*.astro` files

Search for any `<script src="...">` tags in `<head>`. Any external script that
is NOT an Astro `<script>` block must have `defer` or `async` attribute:

```html
<!-- Good -->
<script src="https://example.com/lib.js" defer></script>

<!-- Bad — blocks rendering -->
<script src="https://example.com/lib.js"></script>
```

Astro's own `<script>` blocks (without `src`) are already bundled — leave them.

---

### TASK 2.3 — Add preload for critical font

**File:** `src/layouts/BaseLayout.astro`

Add a preload hint for the primary display font immediately after `<meta charset>`:

```html
<link
  rel="preload"
  href="https://fonts.gstatic.com/s/spacegrotesk/v16/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gowFR-0.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>
```

---

### TASK 2.4 — Add @media prefers-reduced-motion to animations

**File:** `src/styles/global.css`

Wrap ALL keyframe animation declarations and transition rules inside a
`prefers-reduced-motion` media query so users who have requested reduced motion
are not shown animations:

```css
@media (prefers-reduced-motion: no-preference) {
  @keyframes slide-up {
    0%   { opacity: 0; transform: translateY(16px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  @keyframes fade-in {
    0%   { opacity: 0; }
    100% { opacity: 1; }
  }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Also update the `animateCounter` function in `src/pages/index.astro` to skip
animation when reduced motion is preferred:

```typescript
function animateCounter(id: string, target: number, decimals: number) {
  const el = document.getElementById(id);
  if (!el) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    el.textContent = decimals > 0
      ? target.toFixed(decimals)
      : Math.round(target).toLocaleString('en-IN');
    return;
  }

  // ... existing requestAnimationFrame animation code unchanged
}
```

---

### TASK 2.5 — Verify Tailwind CSS purging is working

**File:** `tailwind.config.mjs`

Ensure the `content` array covers all source files:

```js
content: [
  './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
  './public/**/*.html',
],
```

Run `npm run build` and check `dist/_astro/*.css` — the file should be under
20 KB. If it is larger, a wildcard is missing.

---

## ══════════════════════════════════════════
## CATEGORY 3 — SEO & META
## ══════════════════════════════════════════

### TASK 3.1 — Add Open Graph and Twitter Card meta tags

**File:** `src/layouts/BaseLayout.astro`

Add the following inside `<head>`, after the existing `<meta description>`:

```html
<!-- Open Graph -->
<meta property="og:type"        content="website" />
<meta property="og:title"       content={title} />
<meta property="og:description" content={description} />
<meta property="og:url"         content={Astro.url} />
<meta property="og:image"       content={new URL('/og-image.png', Astro.url)} />
<meta property="og:site_name"   content="Home Load Calculator" />

<!-- Twitter Card -->
<meta name="twitter:card"        content="summary_large_image" />
<meta name="twitter:title"       content={title} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image"       content={new URL('/og-image.png', Astro.url)} />
```

Create a placeholder `public/og-image.png` (1200×630px). For now create a
simple SVG placeholder saved as `public/og-image.svg` — note it in a
`TODO.md` that a proper OG image needs to be designed before launch.

---

### TASK 3.2 — Add canonical URL

**File:** `src/layouts/BaseLayout.astro`

Add inside `<head>`:

```html
<link rel="canonical" href={Astro.url} />
```

---

### TASK 3.3 — Create robots.txt

Create `public/robots.txt`:

```
User-agent: *
Allow: /

Sitemap: https://yourdomain.com/sitemap-index.xml
```

Replace `yourdomain.com` with a `TODO` comment noting it needs to be updated
before deployment.

---

### TASK 3.4 — Add sitemap integration

Run:
```bash
npx astro add sitemap --yes
```

Update `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://yourdomain.com',   // TODO: update before deploy
  integrations: [tailwind(), sitemap()],
  output: 'static',
  vite: {
    build: { sourcemap: false },
  },
});
```

---

### TASK 3.5 — Add JSON-LD structured data

**File:** `src/pages/index.astro`

Add inside `<head>` (via BaseLayout slot or directly):

```html
<script type="application/ld+json">
{JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Home Load Calculator",
  "description": "Calculate your home's total electrical load, daily energy consumption, and estimated monthly electricity bill.",
  "url": "https://yourdomain.com",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "Any",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "INR"
  }
})}
</script>
```

---

## ══════════════════════════════════════════
## CATEGORY 4 — ACCESSIBILITY
## ══════════════════════════════════════════

### TASK 4.1 — Add aria-live to results panel

**File:** `src/components/ResultsPanel.astro`

The results panel must announce changes to screen readers when values update.
Add `aria-live="polite"` and `aria-atomic="false"` to the stats container:

```html
<!-- Add these attributes to the <div class="px-5 py-5 space-y-5"> wrapper -->
<div class="px-5 py-5 space-y-5" aria-live="polite" aria-atomic="false">
```

Add `aria-label` to the key readout spans:

```html
<span id="total-kw"    aria-label="Total load in kilowatts">0.00</span>
<span id="daily-kwh"   aria-label="Daily consumption in kilowatt hours">0.00</span>
<span id="monthly-bill" aria-label="Estimated monthly bill in rupees">₹0</span>
```

---

### TASK 4.2 — Fix colour contrast for amber accent

**File:** `src/styles/global.css`

The amber colour `#f5a623` on dark background `#0f1117` has a contrast ratio
of ~4.3:1 — just below the WCAG AA threshold of 4.5:1 for normal text.

Update the CSS variable:

```css
:root {
  --accent: #f7aa28;       /* slightly lighter — contrast ratio 4.6:1 on #0f1117 */
  --accent-dim: #d4901f;
}
```

Update the matching Tailwind config value:

```js
colors: {
  accent:      '#f7aa28',
  'accent-dim':'#d4901f',
}
```

---

### TASK 4.3 — Add focus-visible rings to all interactive elements

**File:** `src/styles/global.css`

Add a global focus-visible policy so no interactive element is ever
without a visible focus ring:

```css
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Remove default outline only when custom ring is present */
:focus:not(:focus-visible) {
  outline: none;
}
```

Check every `focus:outline-none` class in `.astro` files — replace each with
`focus-visible:ring-2 focus-visible:ring-[var(--accent)]` instead.

---

### TASK 4.4 — Trap focus inside report modal

**File:** `src/pages/index.astro`

Find the modal open/close logic and add focus trapping so keyboard users
cannot tab outside the modal while it is open:

```typescript
function openModal() {
  const modal = document.getElementById('report-modal');
  modal?.classList.remove('hidden');
  modal?.classList.add('flex');

  // Trap focus inside modal
  const focusable = modal?.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusable?.[0];
  const last  = focusable?.[focusable.length - 1];

  first?.focus();

  modal?.addEventListener('keydown', function trapFocus(e: KeyboardEvent) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first?.focus(); }
    }
  });
}

function closeModal() {
  const modal = document.getElementById('report-modal');
  modal?.classList.add('hidden');
  modal?.classList.remove('flex');
  // Return focus to trigger button
  document.getElementById('download-report-btn')?.focus();
}
```

---

### TASK 4.5 — Add skip-to-content link

**File:** `src/layouts/BaseLayout.astro`

Add as the very first element inside `<body>`:

```html
<a
  href="#main-content"
  class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[#f5a623] focus:text-[#0f1117] focus:font-semibold focus:text-sm"
>
  Skip to main content
</a>
```

Add `id="main-content"` to the `<main>` element in `src/pages/index.astro`.

---

## ══════════════════════════════════════════
## CATEGORY 5 — SECURITY
## ══════════════════════════════════════════

### TASK 5.1 — Add Content Security Policy meta tag

**File:** `src/layouts/BaseLayout.astro`

Add inside `<head>`:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="
    default-src 'self';
    script-src  'self' 'unsafe-inline';
    style-src   'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src    'self' https://fonts.gstatic.com;
    img-src     'self' data:;
    connect-src 'none';
  "
/>
```

Note: `unsafe-inline` is required for Astro's inline scripts and Tailwind's
inline styles. Document this in a comment above the tag.

---

### TASK 5.2 — Add security headers via Netlify/Vercel config

Create `public/_headers` (Netlify format — also works as reference for other hosts):

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  X-XSS-Protection: 1; mode=block
```

Also create `vercel.json` in the project root for Vercel deployments:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options",           "value": "DENY" },
        { "key": "X-Content-Type-Options",    "value": "nosniff" },
        { "key": "Referrer-Policy",           "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy",        "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

---

### TASK 5.3 — Audit for eval() and innerHTML usage

Search the entire codebase:

```bash
grep -rn "eval("     src/
grep -rn "innerHTML" src/
```

For each `innerHTML` found:
- If it is setting static HTML (no user input), it is acceptable — add a comment
  `// safe: static content only`
- If any user-controlled string flows into `innerHTML`, replace with
  `textContent` or DOM construction methods

---

### TASK 5.4 — Ensure .env and secrets are gitignored

Create or update `.gitignore`:

```gitignore
# Dependencies
node_modules/

# Build output
dist/
.astro/

# Environment variables — NEVER commit these
.env
.env.local
.env.production

# OS files
.DS_Store
Thumbs.db

# Editor files
.vscode/settings.json
.idea/
```

---

## ══════════════════════════════════════════
## CATEGORY 6 — UX & CROSS-BROWSER
## ══════════════════════════════════════════

### TASK 6.1 — Handle empty state gracefully (all qty = 0)

**File:** `src/pages/index.astro`

In the `calculate()` function, add an empty-state guard so that when no
appliances are included or all quantities are 0, the results panel shows
a friendly state rather than `0 W` with no context:

```typescript
function calculate() {
  const included = appliances.filter(a => a.included && a.qty > 0);

  // Empty state
  const isEmpty = included.length === 0;
  const emptyMsg = document.getElementById('empty-state-msg');
  const statsArea = document.getElementById('results-stats');
  if (emptyMsg)  emptyMsg.style.display  = isEmpty ? 'block' : 'none';
  if (statsArea) statsArea.style.display = isEmpty ? 'none'  : 'block';

  if (isEmpty) return;

  // ... rest of existing calculate() logic unchanged
}
```

In `src/components/ResultsPanel.astro`, add an empty state message and wrap
the stats in a `results-stats` div:

```html
<!-- Add before the stats content -->
<div id="empty-state-msg" style="display:none;" class="px-5 py-8 text-center">
  <p class="text-[#7a7f96] text-sm">Enable at least one appliance to see your load summary.</p>
</div>

<!-- Wrap existing stats content -->
<div id="results-stats" class="px-5 py-5 space-y-5">
  <!-- all existing content -->
</div>
```

---

### TASK 6.2 — Prevent layout break on very large values

**File:** `src/components/ResultsPanel.astro`

On the total-kw and total-watts display spans, add overflow protection:

```html
<span
  id="total-kw"
  class="font-display font-bold text-5xl tabular-nums leading-none"
  style="color: var(--accent); word-break: break-all; max-width: 100%;"
>0.00</span>
```

In the `calculate()` function in `src/pages/index.astro`, cap the displayed
kW value to a maximum of 2 decimal places and format with `toLocaleString`:

```typescript
const kwDisplay = (totalWatts / 1000);
setText('total-kw', kwDisplay >= 100
  ? kwDisplay.toFixed(1)   // e.g. 123.4 kW
  : kwDisplay.toFixed(2)); // e.g. 7.54 kW
```

---

### TASK 6.3 — Improve reset confirmation message

**File:** `src/pages/index.astro`

Find the `confirm()` call in the reset handler and update the message:

```typescript
// Replace existing confirm message
const userConfirmed = confirm(
  'Reset all appliances to defaults?\n\n' +
  'This will:\n' +
  '• Restore all 26 default appliances\n' +
  '• Remove any custom appliances you added\n' +
  '• Reset all quantities, watts, and hours to defaults\n\n' +
  'This cannot be undone.'
);
if (!userConfirmed) return;
```

---

### TASK 6.4 — Create 404 page

Create `src/pages/404.astro`:

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
---

<BaseLayout title="Page Not Found — Home Load Calculator">
  <main class="min-h-screen flex items-center justify-center px-6">
    <div class="text-center max-w-md">
      <p class="font-mono text-[#f5a623] text-xs tracking-widest uppercase mb-4">404</p>
      <h1 class="font-display font-bold text-5xl text-[#f0f0ee] mb-4">Page not found</h1>
      <p class="text-[#7a7f96] mb-8">
        The page you're looking for doesn't exist. Head back to the calculator.
      </p>
      <a
        href="/"
        class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#f5a623] text-[#0f1117] font-semibold hover:bg-[#c4811a] transition-colors"
      >
        ← Back to Calculator
      </a>
    </div>
  </main>
</BaseLayout>
```

---

## ══════════════════════════════════════════
## CATEGORY 7 — DEPLOYMENT
## ══════════════════════════════════════════

### TASK 7.1 — Create GitHub Actions CI/CD workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Build & Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    name: Build and type-check
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npx tsc --noEmit

      - name: Build
        run: npm run build

      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
          retention-days: 1
```

---

### TASK 7.2 — Create TODO.md for pre-launch manual steps

Create `TODO.md` in the project root:

```markdown
# Pre-Launch Checklist — Manual Steps

These items cannot be automated and must be done manually before going live.

## Before deploying

- [ ] Replace `yourdomain.com` in astro.config.mjs → site field
- [ ] Replace `yourdomain.com` in public/robots.txt → Sitemap URL
- [ ] Design and export a proper OG image (1200×630px) → save as public/og-image.png
- [ ] Choose and configure hosting (Vercel / Netlify / Cloudflare Pages)
- [ ] Point custom domain DNS records to host
- [ ] Verify SSL certificate is provisioned

## After deploying

- [ ] Run Lighthouse audit on live URL — all scores ≥ 90
- [ ] Run axe DevTools scan — zero critical violations
- [ ] Test on real iPhone Safari and Android Chrome
- [ ] Submit sitemap to Google Search Console
- [ ] Set up UptimeRobot monitor for the live URL
- [ ] Add Plausible / Fathom analytics script to BaseLayout.astro
```

---

## ══════════════════════════════════════════
## CATEGORY 8 — ANALYTICS & MONITORING
## ══════════════════════════════════════════

### TASK 8.1 — Add Plausible analytics (privacy-first, no cookie banner)

**File:** `src/layouts/BaseLayout.astro`

Add the Plausible script inside `<head>`. Use an environment variable so it
only loads in production and is easy to swap for another provider:

```astro
---
const plausibleDomain = import.meta.env.PUBLIC_PLAUSIBLE_DOMAIN;
---

<!-- Analytics — loads only when PUBLIC_PLAUSIBLE_DOMAIN is set -->
{plausibleDomain && (
  <script
    defer
    data-domain={plausibleDomain}
    src="https://plausible.io/js/script.js"
  ></script>
)}
```

Update `.env.example`:

```bash
# Set this to your domain to enable Plausible analytics
# Get your domain at https://plausible.io
PUBLIC_PLAUSIBLE_DOMAIN=yourdomain.com
```

---

### TASK 8.2 — Add Sentry error tracking

Install Sentry:

```bash
npx astro add @sentry/astro --yes
```

Update `astro.config.mjs`:

```js
import sentry from '@sentry/astro';

export default defineConfig({
  integrations: [
    tailwind(),
    sitemap(),
    sentry({
      dsn: import.meta.env.PUBLIC_SENTRY_DSN,
      sourceMapsUploadOptions: {
        project: 'home-load-calculator',
        authToken: import.meta.env.SENTRY_AUTH_TOKEN,
      },
    }),
  ],
  // ...
});
```

Update `.env.example`:

```bash
# Sentry error tracking (optional)
# Get DSN at https://sentry.io
PUBLIC_SENTRY_DSN=https://xxx@oXXX.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=
```

---

## ══════════════════════════════════════════
## FINAL VERIFICATION
## ══════════════════════════════════════════

After completing all tasks, run the following in sequence:

```bash
# 1. Type check — must be zero errors
npx tsc --noEmit

# 2. Lint check (if ESLint is configured)
npm run lint

# 3. Dev server — visually verify all features still work
npm run dev

# 4. Production build — must complete with zero errors
npm run build

# 5. Preview production build locally
npm run preview
```

Then open http://localhost:4321 and manually verify:

- [ ] Page loads under 3 seconds on a throttled 3G connection (DevTools → Network)
- [ ] Lighthouse Performance score ≥ 90
- [ ] Lighthouse Accessibility score ≥ 90
- [ ] Lighthouse SEO score ≥ 90
- [ ] Lighthouse Best Practices score ≥ 90
- [ ] Tab through entire page with keyboard — every element reachable
- [ ] Resize to 375px — no horizontal scroll, all controls usable
- [ ] Open report modal — Escape key closes it, focus returns to trigger button
- [ ] Set all quantities to 0 — empty state message appears in results panel
- [ ] Set 20× AC units — no layout overflow in results panel
- [ ] View source — no API keys, secrets, or sensitive data visible
- [ ] Network tab — total transferred under 500 KB
- [ ] Console tab — zero errors and zero warnings

---

## IMPORTANT CONSTRAINTS

- Do NOT rewrite any calculation logic in `src/pages/index.astro`
- Do NOT change the appliance data in `src/data/appliances.ts`
- Do NOT change TypeScript interfaces in `src/types/index.ts`
- Do NOT remove any existing features — only add, fix, or configure
- All new dependencies must be added via `npm install` or `npx astro add`
- Every task is independent — if one fails, continue with the others
- Leave a `// TODO:` comment anywhere a domain name or secret needs to be
  filled in before going live

Apply all tasks now. Report which tasks were completed and flag any that
could not be applied automatically.
