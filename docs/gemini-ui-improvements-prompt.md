# Gemini CLI Prompt — Home Load Calculator UI Improvements

> Run this prompt from inside the `home-load-calculator/` project directory.
> Gemini will edit existing files in-place. Do NOT regenerate the whole project.

---

## ROLE

You are a senior UI/UX engineer and design systems expert. You refine existing frontend code for visual polish, usability, and accessibility — without breaking existing functionality.

---

## CONTEXT

I have a working **AstroJS + Tailwind CSS v4** Home Load Calculator at `src/`. The app calculates home electrical load and shows a results sidebar. The current UI has several design and usability issues that need to be fixed. All changes are **styling and layout only** — do not change any calculation logic, data files, or TypeScript business logic.

---

## TASK OVERVIEW

Apply all 10 improvements listed below across the relevant source files. After all changes, the app must:
- Still run with `npm run dev` and `npm run build` — zero errors
- Have no broken layouts on mobile (`375px`) or desktop (`1440px`)
- Preserve all existing functionality (toggles, steppers, calculations, modals)

---

## IMPROVEMENT 1 — Font Upgrade

**Files to edit:** `src/layouts/BaseLayout.astro`, `tailwind.config.mjs`

Replace the current Google Fonts import with this new pairing:

```html
<!-- Remove the old font link and replace with this -->
<link
  href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=Geist+Mono:wght@400;600&display=swap"
  rel="stylesheet"
/>
```

In `tailwind.config.mjs`, update `fontFamily`:

```js
fontFamily: {
  display: ['Space Grotesk', 'sans-serif'],   // was: Barlow Condensed
  body:    ['Inter', 'sans-serif'],            // was: DM Sans
  mono:    ['Geist Mono', 'monospace'],        // was: JetBrains Mono
},
```

In `src/styles/global.css`, update the body font stack:

```css
body {
  font-family: 'Inter', sans-serif;
}
```

Update every reference to `font-[JetBrains_Mono]` in `.astro` files to `font-mono`.
Update every reference to `font-display` to remain `font-display` (Tailwind will pick up the new value automatically).

---

## IMPROVEMENT 2 — Compact Hero Section

**File to edit:** `src/components/PageHero.astro`

The hero is too tall. Users should reach the appliance list without scrolling.

- Change `pt-14 pb-10` on the `<header>` to `pt-8 pb-6`
- Change the `<h1>` from `text-5xl sm:text-6xl lg:text-7xl` to `text-4xl sm:text-5xl lg:text-6xl`
- Remove the glow blob `<div>` entirely (the absolute-positioned radial gradient div)
- Change the stats strip `mt-8` to `mt-4`
- Make the subheading `text-sm` instead of `text-base sm:text-lg`

The hero should feel like a tight page header, not a landing page splash.

---

## IMPROVEMENT 3 — Fix Progress Bar Overflow & Color

**File to edit:** `src/components/ResultsPanel.astro` and the `<script>` in `src/pages/index.astro`

**Problem:** When totalWatts exceeds 5,000W the bar overflows its container and stays white.

Changes in `ResultsPanel.astro`:

1. Change the progress bar track label from `5,000 W` to `Max: 5 kW` for clarity.
2. Split the progress bar into two zones with a threshold marker at the 5kW mark:

```html
<!-- Replace the existing progress bar div with this -->
<div class="mt-2 relative h-2.5 rounded-full bg-[#2a2d3a] overflow-hidden"
  role="progressbar" aria-label="Load percentage"
  aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" id="load-progress">
  <div
    id="load-bar"
    class="h-full rounded-full transition-all duration-500 ease-out"
    style="width: 0%; background: linear-gradient(90deg, #22c55e 0%, #f5a623 60%, #ef4444 100%);"
  ></div>
</div>
<!-- Threshold labels -->
<div class="flex justify-between mt-1.5">
  <span class="font-mono text-[10px] text-[#7a7f96]">0 W</span>
  <span id="load-percent" class="font-mono text-[10px] tabular-nums" style="color: var(--accent);">0%</span>
  <span class="font-mono text-[10px] text-[#7a7f96]">5 kW max</span>
</div>
```

Changes in the `<script>` in `src/pages/index.astro`:

In the `calculate()` function, find the line that sets `load-bar` width and update the color dynamically:

```typescript
// After computing loadPercent:
const bar = document.getElementById('load-bar');
if (bar) {
  bar.style.width = `${Math.min(loadPercent, 100)}%`;  // cap at 100%
  if (totalWatts > 5000) {
    bar.style.background = '#ef4444';  // solid red when over limit
  } else if (totalWatts > 3000) {
    bar.style.background = 'linear-gradient(90deg, #f5a623, #ef4444)';
  } else {
    bar.style.background = 'linear-gradient(90deg, #22c55e, #f5a623)';
  }
}
```

---

## IMPROVEMENT 4 — Results Panel Typography Hierarchy

**File to edit:** `src/components/ResultsPanel.astro`

**Problem:** `7,536 W / 7.54 kW` runs together in one line — hard to scan.

Replace the total load display block with a two-line layout:

```html
<!-- Replace the existing total load number block -->
<div>
  <p class="text-[10px] font-mono uppercase tracking-widest text-[#7a7f96] mb-1">Total Load</p>

  <!-- Primary: kW (more useful unit) — large -->
  <div class="flex items-end gap-1.5 mb-0.5">
    <span id="total-kw" class="font-display font-bold text-5xl tabular-nums leading-none" style="color: var(--accent);">0.00</span>
    <span class="font-mono text-lg text-[#7a7f96] mb-1">kW</span>
  </div>

  <!-- Secondary: Watts — smaller, muted -->
  <div class="flex items-center gap-1">
    <span id="total-watts" class="font-mono text-sm tabular-nums text-[#7a7f96]">0</span>
    <span class="font-mono text-xs text-[#7a7f96]">watts</span>
  </div>
</div>
```

Also update the `animateCounter` calls in `src/pages/index.astro` to match: `total-kw` now shows the large number, `total-watts` shows the secondary. Swap their logic:

```typescript
// In calculate():
animateCounter('total-kw', totalWatts / 1000, 2);   // kW is now the primary big number
animateCounter('total-watts', totalWatts, 0);        // W is now secondary
```

---

## IMPROVEMENT 5 — Category Header Badge Icons

**File to edit:** `src/components/ApplianceCategory.astro`

**Problem:** Emoji (`⚡`, `📊`) render inconsistently across operating systems.

Replace the emoji badges with SVG icon + text pill badges:

```html
<!-- Replace the existing badge span elements with these -->
<span
  class="hidden sm:inline-flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-full bg-[#0f1117] border border-[#2a2d3a] tabular-nums"
  data-category-watts={name}
>
  <!-- Lightning bolt SVG -->
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="#f5a623" class="w-3 h-3 flex-shrink-0">
    <path d="M9.5 1.5 L4 9 H8 L6.5 14.5 L13 7 H9 Z"/>
  </svg>
  <span>{totalWatts.toLocaleString()} W</span>
</span>

<span
  class="hidden sm:inline-flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-full bg-[#0f1117] border border-[#2a2d3a] tabular-nums"
  data-category-kwh={name}
>
  <!-- Bar chart SVG -->
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="#7a7f96" class="w-3 h-3 flex-shrink-0">
    <rect x="1" y="8" width="3" height="7" rx="0.5"/>
    <rect x="6" y="5" width="3" height="10" rx="0.5"/>
    <rect x="11" y="2" width="3" height="13" rx="0.5"/>
  </svg>
  <span>{dailyKWh.toFixed(2)} kWh/d</span>
</span>
```

Also update the JS in `src/pages/index.astro` — the `calculate()` function currently sets `textContent` on these elements which overwrites the SVG. Fix by targeting only the `<span>` text child:

```typescript
// Replace the wattEl / kwhEl textContent lines with:
const wattTextEl = wattEl?.querySelector('span:last-child');
const kwhTextEl  = kwhEl?.querySelector('span:last-child');
if (wattTextEl) wattTextEl.textContent = `${catWatts.toLocaleString()} W`;
if (kwhTextEl)  kwhTextEl.textContent  = `${catKWh.toFixed(2)} kWh/d`;
```

---

## IMPROVEMENT 6 — Toggle Switch Visibility

**File to edit:** `src/styles/global.css`

**Problem:** Off-state toggle track is nearly invisible against the dark background.

Update the toggle styles:

```css
/* Replace existing toggle styles with these */
.toggle-label {
  background-color: #3a3d4a;   /* lighter off-state track — was #2a2d3a */
  transition: background-color 0.2s ease;
  display: block;
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  cursor: pointer;
  border: 1px solid #4a4d5a;  /* subtle border so it's always visible */
}

.toggle-label::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #f0f0ee;
  box-shadow: 0 1px 3px rgba(0,0,0,0.4);
  transition: transform 0.2s ease;
}

.toggle-checkbox:checked + .toggle-label {
  background-color: var(--accent);
  border-color: var(--accent-dim);
}

.toggle-checkbox:checked + .toggle-label::after {
  transform: translateX(20px);
}

/* Focus ring for keyboard users */
.toggle-checkbox:focus-visible + .toggle-label {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

---

## IMPROVEMENT 7 — Alternating Row Backgrounds

**File to edit:** `src/components/ApplianceRow.astro`

**Problem:** All appliance rows look identical — hard to track which row you're editing.

In the `<div class="appliance-row ...">` root element, add a subtle alternating background using a CSS custom property driven by the `index` prop:

```astro
<!-- Replace the opening div of ApplianceRow with: -->
<div
  class="appliance-row group flex flex-wrap lg:flex-nowrap items-center gap-3 px-4 py-3 border-b border-[#2a2d3a] hover:bg-[#20232f] transition-colors duration-150 animate-slide-up"
  data-id={a.id}
  data-included={a.included.toString()}
  style={`animation-delay: ${index * 0.03}s; background-color: ${index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.018)'};`}
>
```

---

## IMPROVEMENT 8 — Mobile Touch Target Size for Steppers

**File to edit:** `src/components/ApplianceRow.astro` and `src/styles/global.css`

**Problem:** Stepper `−` / `+` buttons are 32px — below the 44px minimum for touch targets.

In `ApplianceRow.astro`, change stepper button classes from `w-8 h-8` to `w-11 h-11 sm:w-8 sm:h-8`:

```astro
<!-- Both stepper buttons: change size classes -->
class="stepper-btn w-11 h-11 sm:w-8 sm:h-8 rounded-md bg-[#2a2d3a] text-[#f0f0ee] font-bold text-base hover:bg-[#f5a623] hover:text-[#0f1117] transition-colors focus:outline-none focus:ring-2 focus:ring-[#f5a623]"
```

Also fix the same size in `buildRowHTML()` in `src/pages/index.astro` — find both stepper button strings in the template literal and apply the same class change.

---

## IMPROVEMENT 9 — Remove Non-functional Light Mode Toggle

**File to edit:** `src/layouts/BaseLayout.astro` or wherever the sun icon button is rendered

**Problem:** There is a sun/theme toggle icon in the top-right corner that does nothing — it confuses users.

If light mode is not yet implemented, remove the toggle button entirely. Add it back only when light mode CSS is actually implemented.

Search for any element containing:
- A sun SVG icon
- Class like `rounded-full` in the top-right corner
- Any `id` like `theme-toggle` or `light-mode-btn`

Delete that element completely. Also delete any related JS event listener that references it.

---

## IMPROVEMENT 10 — Active Appliance Counter in Results Panel

**File to edit:** `src/components/ResultsPanel.astro` and `src/pages/index.astro`

**Problem:** Users can't tell how many appliances are active at a glance.

In `ResultsPanel.astro`, add a stat row between the "Top Consumer" section and the action buttons:

```html
<!-- Add this block after the Top Consumer section, before the final <hr> -->
<hr class="border-[#2a2d3a]" />

<div class="flex items-center justify-between">
  <span class="text-sm text-[#7a7f96]">Active Appliances</span>
  <div class="flex items-center gap-1.5">
    <span id="active-count" class="font-mono font-semibold tabular-nums text-[#f0f0ee]">0</span>
    <span class="font-mono text-xs text-[#7a7f96]">/</span>
    <span id="total-count" class="font-mono text-xs tabular-nums text-[#7a7f96]">0</span>
    <span class="font-mono text-xs text-[#7a7f96]">appliances</span>
  </div>
</div>
```

In the `calculate()` function in `src/pages/index.astro`, add these two lines after the existing DOM updates:

```typescript
const activeCount = appliances.filter(a => a.included && a.qty > 0).length;
const totalCount  = appliances.length;
setText('active-count', String(activeCount));
setText('total-count',  String(totalCount));
```

---

## AFTER ALL CHANGES — Verification

Run these commands and confirm zero errors:

```bash
# Start dev server and visually check all 10 improvements
npm run dev

# TypeScript check
npx tsc --noEmit

# Production build
npm run build
```

**Visual QA checklist:**

- [ ] Fonts changed to Space Grotesk / Inter / Geist Mono — headings look rounder and more modern
- [ ] Hero is compact — appliances are visible above the fold on a 768px screen
- [ ] Progress bar caps at 100% width, turns red when load > 5 kW
- [ ] kW is the large primary number in results panel; W is smaller and muted below it
- [ ] Category badges show SVG icons instead of emoji — consistent across Mac/Windows
- [ ] Toggle off-state is clearly visible (lighter grey track with border)
- [ ] Odd/even rows have subtly different backgrounds — easier to scan
- [ ] Stepper buttons are 44px tall on mobile, 32px on desktop
- [ ] No sun/theme toggle icon visible in top-right corner
- [ ] Results panel shows "Active Appliances: X / Y" counter updating live

Do not regenerate any file from scratch. Edit only what is necessary for each improvement.
