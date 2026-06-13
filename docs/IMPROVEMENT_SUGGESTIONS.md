# Website Improvement & SEO Suggestions
**Project:** Electricity Load Calculator  
**Reviewed:** 2026-06-09  
**Branch:** `feature-seo-optimization`

---

## Table of Contents
1. [Critical Bugs](#1-critical-bugs)
2. [SEO — High Priority](#2-seo--high-priority)
3. [SEO — Medium Priority](#3-seo--medium-priority)
4. [Performance](#4-performance)
5. [UX / Content](#5-ux--content)
6. [Priority Summary Table](#6-priority-summary-table)

---

## 1. Critical Bugs

### 1.1 Missing `site-image.png` in `/public/`
**File:** `public/` (file absent)  
The `og:image` and `twitter:image` meta tags in `BaseLayout.astro` reference `/site-image.png`, but this file does not exist in the `public/` folder. Every social media share (WhatsApp, Twitter/X, LinkedIn, Facebook) will show a broken or empty image card.

**Fix:** Create and place a 1200×630px image at `public/site-image.png`.

---

### 1.2 Contact Form is Disconnected
**File:** `src/pages/contact-us.astro:155`  
The form submission handler fires an `alert()` saying it is a demo. Any real user who submits a message or bug report receives no response and their message is discarded.

**Fix:** Connect the form to a backend service:
- [Formspree](https://formspree.io) — free tier, no backend needed
- [Web3Forms](https://web3forms.com) — free, no server
- [Netlify Forms](https://www.netlify.com/products/forms/) — if deployed on Netlify

---

## 2. SEO — High Priority

### 2.1 No Canonical URL Tag
**File:** `src/layouts/BaseLayout.astro`  
There is no `<link rel="canonical">` tag. This is one of the most important on-page SEO elements — it prevents duplicate content penalties from URL variants (http vs https, www vs non-www, trailing slash vs none).

**Fix:** Add inside `<head>` in `BaseLayout.astro`:
```astro
<link rel="canonical" href={new URL(Astro.url.pathname, Astro.site).href} />
```
> Requires `site` to be set in `astro.config.mjs` — see item 4.1.

---

### 2.2 No Sitemap
**File:** `astro.config.mjs`  
No sitemap integration is configured. Without a sitemap, search engines cannot efficiently discover all pages (`/about-us`, `/contact-us`, `/privacy-policy`, `/terms-conditions`).

**Fix:**
```bash
npm install @astrojs/sitemap
```
```js
// astro.config.mjs
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://your-domain.com',
  integrations: [sitemap()],
  ...
});
```

---

### 2.3 No `robots.txt`
**File:** `public/` (file absent)  
There is no `robots.txt`. Without it, crawlers use default permissive rules and you cannot provide any guidance (e.g., pointing to the sitemap).

**Fix:** Create `public/robots.txt`:
```
User-agent: *
Allow: /

Sitemap: https://your-domain.com/sitemap-index.xml
```

---

### 2.4 Inner Pages Have No Unique Meta Descriptions
**Files:** `src/pages/about-us.astro`, `contact-us.astro`, `privacy-policy.astro`, `terms-conditions.astro`  
All inner pages call `<BaseLayout title="...">` without a `description` prop, so they all inherit the home page description about the calculator. Google will display the wrong snippet for every inner page in search results.

**Fix:** Pass a unique `description` to each page. Example:
```astro
<!-- about-us.astro -->
<BaseLayout
  title="About Us | Electricity Load Calculator"
  description="Learn about the free electricity load calculator — how it works, our privacy-first approach, and our mission to simplify energy management."
>

<!-- contact-us.astro -->
<BaseLayout
  title="Contact Us | Electricity Load Calculator"
  description="Have a question, feature request, or bug to report? Get in touch with the Electricity Load Calculator team."
>
```

---

### 2.5 `og:url` Passes a URL Object Instead of a String
**File:** `src/layouts/BaseLayout.astro:27,34`  
`content={Astro.url}` passes a URL object, not a string. This can cause malformed Open Graph metadata.

**Fix:**
```astro
<meta property="og:url" content={Astro.url.href} />
<meta property="twitter:url" content={Astro.url.href} />
```

---

### 2.6 Incomplete JSON-LD Structured Data
**File:** `src/layouts/BaseLayout.astro:40–54`  
The `SoftwareApplication` schema is missing several properties that enable Google Rich Results:

| Missing Property | Why It Matters |
|---|---|
| `url` | Identifies the tool's canonical page |
| `author` | Signals ownership/organization |
| `screenshot` | Enables visual rich results in Google |
| `WebSite` schema | Enables Google Sitelinks Search Box |
| `BreadcrumbList` for inner pages | Enables breadcrumb display in SERP |

**Fix:** Expand the schema and add a `WebSite` schema alongside it:
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Electricity Load Calculator",
  "url": "https://your-domain.com",
  "operatingSystem": "Web",
  "applicationCategory": "UtilitiesApplication",
  "description": "...",
  "screenshot": "https://your-domain.com/site-image.png",
  "author": { "@type": "Organization", "name": "Electricity Load Calculator" },
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
}
```

---

## 3. SEO — Medium Priority

### 3.1 Two Separate Google Fonts Requests
**Files:** `src/styles/global.css:1`, `src/layouts/BaseLayout.astro:78`  
The site makes two separate round-trips to `fonts.googleapis.com`:
1. `global.css` requests `Hind` and `Khand` via CSS `@import`
2. `BaseLayout.astro` requests `Geist Mono` via HTML `<link>`

Each round-trip adds latency and harms First Contentful Paint (FCP).

**Fix:** Remove the `@import` from `global.css` and combine both font families into a single `<link>` in `BaseLayout.astro`:
```html
<link
  href="https://fonts.googleapis.com/css2?family=Hind:wght@400;500;600;700&family=Khand:wght@300;400;500;600;700&family=Geist+Mono:wght@400;600&display=swap"
  rel="stylesheet"
/>
```

---

### 3.2 Render-Blocking CSS `@import` for Fonts
**File:** `src/styles/global.css:1`  
`@import url(...)` inside a CSS file is the slowest way to load external resources. The browser must first download `global.css`, parse it, then discover and fetch the Google Fonts URL — a serial waterfall.

**Fix:** Move the font `@import` to an HTML `<link rel="stylesheet">` tag (as shown in 3.1). Add preconnect hints (already present in `BaseLayout.astro`) to reduce connection latency.

---

### 3.3 Meta Keywords Not Configurable Per Page
**File:** `src/layouts/BaseLayout.astro:22`  
The `keywords` meta tag is a single hardcoded string applied to every page. While Google ignores this tag, Bing still reads it, and having calculator-focused keywords on the Privacy Policy or About page is semantically incorrect.

**Fix:** Make keywords a prop with a default:
```astro
interface Props {
  title?: string;
  description?: string;
  keywords?: string;
}

const { keywords = 'electricity load calculator, bijli load calculator, house electricity load calculator' } = Astro.props;
```

---

### 3.4 `<header>` Landmark Conflict in PageHero
**File:** `src/components/PageHero.astro:5`  
`PageHero` uses a `<header>` HTML element, but `SiteHeader.astro` is also a `<header>`. Having two `<header>` landmark regions on one page violates ARIA best practices, confuses screen readers, and can negatively affect accessibility scores (which Google now uses as a ranking signal).

**Fix:** Change the `<header>` in `PageHero.astro` to `<section>` or `<div>`:
```astro
<section class="relative pt-4 pb-4 px-6 text-center overflow-hidden no-print">
  ...
</section>
```

---

### 3.5 Hardcoded Hero Stats May Become Inaccurate
**File:** `src/components/PageHero.astro:35–38`  
"36 Appliances" and "7 Categories" are hardcoded strings. Adding new appliances to `appliances.ts` without updating `PageHero.astro` will cause the hero to display stale numbers.

**Fix:** Compute them from the data at build time:
```astro
---
import { DEFAULT_APPLIANCES, CATEGORIES } from '@/data/appliances';
---
{ label: `${DEFAULT_APPLIANCES.length} Appliances`, icon: '🔌' },
{ label: `${CATEGORIES.length} Categories`,  icon: '📂' },
```

---

## 4. Performance

### 4.1 `site` Not Configured in `astro.config.mjs`
**File:** `astro.config.mjs`  
The `site` property is not set. This is required for:
- Sitemap generation (absolute URLs)
- Canonical tags (absolute URLs)
- Correct OG image URLs

**Fix:**
```js
export default defineConfig({
  site: 'https://your-domain.com',
  ...
});
```

---

### 4.2 No Font Preloading for Critical Display Font
The site uses a custom display font (`Khand` or `Hind`) for headings and UI. Without preloading, the browser discovers these fonts late in page load, causing a Flash of Invisible Text (FOIT) or Flash of Unstyled Text (FOUT).

**Fix:** Add a `<link rel="preload">` for the most critical font weight:
```html
<link
  rel="preload"
  as="font"
  type="font/woff2"
  href="https://fonts.gstatic.com/..."
  crossorigin
/>
```

---

### 4.3 No Web Analytics
There is no analytics integration. Without it, you have no data on traffic sources, popular pages, user behavior, or the impact of SEO changes.

**Fix (easiest — free on Vercel):** Add Vercel Analytics:
```bash
npm install @vercel/analytics
```
```astro
<!-- BaseLayout.astro -->
import { Analytics } from '@vercel/analytics/astro';
<Analytics />
```

---

## 5. UX / Content

### 5.1 Footer Lacks Descriptive Text
**File:** `src/components/SiteFooter.astro`  
The footer only contains navigation links and a copyright notice. A brief one-line description of the site would give crawlers more topical context and improve trust for new visitors.

**Suggested addition:**
```html
<p class="text-xs text-text-muted mb-3 max-w-md">
  Free electricity load calculator for home, office, and industry. Estimate your total kW load and monthly electricity bill instantly.
</p>
```

---

### 5.2 No Breadcrumb Navigation on Inner Pages
Inner pages (`/about-us`, `/contact-us`, etc.) have no breadcrumb. Breadcrumbs help users orient themselves and enable Google to show breadcrumb rich results in the SERP, replacing the plain URL.

**Fix:** Add a simple breadcrumb component to inner page layouts and pair it with `BreadcrumbList` JSON-LD.

---

### 5.3 Hero Stats Use Emoji as Icons
**File:** `src/components/PageHero.astro:36–38`  
The stats strip uses emoji (🔌 📂 ⚡) as visual icons. Emoji rendering differs across operating systems and can appear pixelated or incorrect. The rest of the site uses inline SVGs consistently.

**Fix:** Replace emoji with inline SVGs matching the style used in `SiteHeader.astro` and `index.astro`.

---

### 5.4 No "Last Updated" Date on Content Pages
The About Us and Privacy Policy pages have no publication or last-updated date. Google uses content freshness as a ranking factor for informational pages.

**Fix:** Add a visible date to static content pages:
```astro
<p class="text-xs text-text-muted mt-2">Last updated: June 2026</p>
```

---

## 6. Priority Summary Table

| # | Priority | Issue | File(s) | Impact |
|---|---|---|---|---|
| 1.1 | 🔴 Critical | Missing `site-image.png` | `public/` | Broken social sharing |
| 1.2 | 🔴 Critical | Contact form unconnected | `contact-us.astro:155` | Zero user feedback |
| 2.1 | 🔴 Critical | No canonical URL tag | `BaseLayout.astro` | Duplicate content risk |
| 2.2 | 🟠 High | No sitemap | `astro.config.mjs` | Poor crawl coverage |
| 2.3 | 🟠 High | No `robots.txt` | `public/` | No crawl guidance |
| 2.4 | 🟠 High | Inner pages missing description | 4 page files | Wrong SERP snippets |
| 2.5 | 🟠 High | `og:url` is object not string | `BaseLayout.astro:27,34` | Broken OG metadata |
| 2.6 | 🟠 High | Incomplete JSON-LD schema | `BaseLayout.astro:40–54` | Missed rich results |
| 3.1 | 🟡 Medium | Two Google Fonts requests | `global.css`, `BaseLayout.astro` | Slower FCP |
| 3.2 | 🟡 Medium | Render-blocking font CSS `@import` | `global.css:1` | Slower FCP |
| 3.3 | 🟡 Medium | Keywords not configurable per page | `BaseLayout.astro:22` | Incorrect keyword signals |
| 3.4 | 🟡 Medium | `<header>` conflict in PageHero | `PageHero.astro:5` | A11y / SEO landmark issue |
| 3.5 | 🟡 Medium | Hardcoded hero stats | `PageHero.astro:35–38` | Stale count on content change |
| 4.1 | 🟡 Medium | `site` missing in config | `astro.config.mjs` | Breaks canonical + sitemap |
| 4.2 | 🟢 Low | No font preloading | `BaseLayout.astro` | FOIT / FOUT on load |
| 4.3 | 🟢 Low | No analytics | — | No traffic visibility |
| 5.1 | 🟢 Low | Footer lacks descriptive text | `SiteFooter.astro` | Minor SEO signal |
| 5.2 | 🟢 Low | No breadcrumbs on inner pages | Inner page layouts | Missed breadcrumb rich results |
| 5.3 | 🟢 Low | Emoji used as icons in hero | `PageHero.astro:36–38` | Cross-OS rendering inconsistency |
| 5.4 | 🟢 Low | No "last updated" date on pages | `about-us.astro`, etc. | Freshness signal |

---

*End of suggestions document.*
