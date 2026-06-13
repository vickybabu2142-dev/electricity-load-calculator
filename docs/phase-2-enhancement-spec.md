# Phase 2 Enhancement: Electrical Health Report & Consumption Intelligence

**Document Type:** Technical Specification  
**Project:** Electricity Load Calculator  
**Status:** In Progress  
**Last Updated:** 2026-06-13

---

## 1. Overview

### 1.1 Objective

Transform the calculator from a raw data tool into a professional **Electrical Health Assessment** experience. After completing a calculation, users should immediately understand:

- Is my electrical setup healthy?
- What is consuming the most electricity?
- Where can I save money?
- What actions should I take next?

### 1.2 Design Constraints

- **Do NOT redesign** the current layout — build upon it
- No backend changes — fully client-side
- Reuse existing calculation results (no duplicate computation)
- Responsive on mobile and desktop
- Follow existing Astro component architecture
- Maintain dark/amber design language throughout
- Keep calculations deterministic

### 1.3 Existing Baseline

| Feature | Status |
|---------|--------|
| Appliance-based load calculation | ✅ Live |
| Total Connected Load (kW / W) | ✅ Live |
| Daily Consumption (kWh/day) | ✅ Live |
| Monthly Consumption (kWh/month) | ✅ Live |
| Estimated Electricity Bill | ✅ Live |
| Top Consumer Analysis | ✅ Live |
| PDF / Print Export | ✅ Live |
| Smart Insights (MCB, Cable, Inverter, Solar) | ✅ Live |
| Electrical Health Score | ✅ Implemented |
| Consumption Breakdown Visualization | 🔲 Planned |
| Energy Saving Opportunities | ✅ Implemented |
| High Consumption Alerts | ✅ Implemented |
| Enhanced PDF Report | 🔲 Planned |

---

## 2. Feature 1: Electrical Health Score

**Status:** ✅ Implemented  
**File:** `src/utils/health.ts` → `calculateHealthScore()`

### 2.1 Placement

In `ResultsPanel.astro`, immediately after Smart Insights (`#smart-insights-section`) and before the empty-state prompt. Hidden when no appliances are active.

### 2.2 Scoring Model

Score is computed from four weighted categories (maximum total = 100 points).

#### 2.2.1 Load Utilization — 30 pts

Evaluates: Current Load vs Configured Capacity (`loadPercent`)

| Load % | Points |
|--------|--------|
| < 50% | 20 |
| 50% – 80% | 30 |
| 80% – 95% | 20 |
| ≥ 95% | 10 |

#### 2.2.2 Energy Efficiency — 30 pts

Evaluates: Top appliance's daily kWh as a percentage of total daily kWh.

| Top Appliance Share | Points |
|--------------------|--------|
| < 40% | 30 |
| 40% – 60% | 20 |
| ≥ 60% | 10 |

#### 2.2.3 Safety Readiness — 20 pts

Evaluates: Whether MCB and Cable recommendations are available.

| Condition | Points |
|-----------|--------|
| Both MCB + Cable available | 20 |
| Only one available | 10 |
| Neither available | 0 |

#### 2.2.4 Renewable Readiness — 20 pts

Evaluates: Monthly consumption in kWh (higher = stronger solar ROI case).

| Monthly kWh | Points |
|-------------|--------|
| < 200 | 10 |
| 200 – 500 | 15 |
| ≥ 500 | 20 |

### 2.3 Score Bands

| Score | Label | Color |
|-------|-------|-------|
| 0 – 40 | Poor | Red `#ef4444` |
| 41 – 60 | Fair | Coral-orange `#fb923c` |
| 61 – 80 | Good | Emerald `#3ecf6e` |
| 81 – 100 | Excellent | Cyan `#22d3ee` |

### 2.4 UI Card

```
┌─────────────────────────────────────────────┐
│ ♥ Electrical Health Score                   │
│                                             │
│   87           / 100      [ Excellent ]     │
│                                             │
│  Load Utilization    ████████████░░  30/30  │
│  Energy Efficiency   ████████████░░  30/30  │
│  Safety Readiness    ████████░░░░░░  20/20  │
│  Renewable Readiness ███████░░░░░░░  15/20  │
└─────────────────────────────────────────────┘
```

- Score number: large (`text-5xl font-display`), color = score band color
- Label badge: pill shape, color-coded border + background
- Sub-score rows: label | animated progress bar | `pts/max`
- Card background: subtle amber tint (`color-mix`)

### 2.5 DOM IDs

| Element | ID |
|---------|----|
| Section wrapper | `#health-score-section` |
| Score number | `#health-score-value` |
| Label badge | `#health-score-label` |
| Utilization bar | `#health-sub-utilization-bar` |
| Efficiency bar | `#health-sub-efficiency-bar` |
| Safety bar | `#health-sub-safety-bar` |
| Renewable bar | `#health-sub-renewable-bar` |
| Utilization pts | `#health-sub-utilization-pts` |
| Efficiency pts | `#health-sub-efficiency-pts` |
| Safety pts | `#health-sub-safety-pts` |
| Renewable pts | `#health-sub-renewable-pts` |
| Print score | `#print-health-score` |
| Print label | `#print-health-label` |
| Print details | `#print-health-details` |

---

## 3. Feature 2: Consumption Breakdown Visualization

**Status:** 🔲 Planned

### 3.1 Placement

In `ResultsPanel.astro`, after Feature 1 (Health Score). Hidden when no appliances are active.

### 3.2 Goal

Give users a visual representation of where their energy is actually going, grouped by appliance category.

### 3.3 Category Grouping

Group all active appliances into the following categories (matching `ApplianceCategory` type):

| Category | Display Name |
|----------|-------------|
| `Lighting` | Lighting |
| `Fans & Cooling` | Fans & Cooling |
| `Kitchen` | Kitchen |
| `Entertainment` | Entertainment |
| `Office & IT` | Office & IT |
| `Industrial` | Industrial |
| `Other` | Other |

### 3.4 Computation (`calculateCategoryBreakdown()` in `src/utils/health.ts`)

**Input:** Active appliances array  
**Output:** `Array<{ category, kWhDay, percent }>` sorted descending by `kWhDay`, plus `topCategoryName` and `topCategoryPercent`

**Logic:**
1. For each category, sum `kWh/day` across active appliances in that category
2. Compute each category's share: `(categoryKWh / totalKWh) * 100`
3. Exclude categories with 0 contribution
4. Return sorted array + top category metadata

### 3.5 Visualization

Preferred: **SVG Donut Chart** (no external library — pure SVG `circle` stroke technique)

```
        ╭──────╮
       ╱  68%   ╲
      │  Cooling  │    • Cooling      68%   20.0 kWh/d
      │   20.0    │    • Kitchen      15%    4.4 kWh/d
       ╲  kWh/d  ╱    • Lighting      8%    2.4 kWh/d
        ╰──────╯     • Entertainment  5%    1.5 kWh/d
                       • Other         4%    1.2 kWh/d
```

Alternative (simpler): **Horizontal Percentage Bars**

```
Cooling      ████████████████████░░░░  68%
Kitchen      ████░░░░░░░░░░░░░░░░░░░░  15%
Lighting     ██░░░░░░░░░░░░░░░░░░░░░░   8%
```

**SVG Donut Implementation:**
- Radius `R = 45`, circumference `C = 2π × 45 ≈ 283`
- Each slice: `stroke-dasharray = (percent/100 × C) + " " + C`
- Offset accumulated per slice via `stroke-dashoffset`
- Center text: total kWh/day

**Category Colors:**

| Category | Color | Note |
|----------|-------|------|
| Lighting | `#FCD34D` (Bright Yellow) | Warm, distinct from orange |
| Fans & Cooling | `#38BDF8` (Sky Blue) | Cool/air association |
| Kitchen | `#4ADE80` (Lime Green) | Fresh/food |
| Entertainment | `#818CF8` (Indigo/Violet) | Screens/media |
| Other | `#F87171` (Coral Red) | Neutral catch-all, distinct from yellow |
| Office & IT | `#2DD4BF` (Teal) | Tech/professional |
| Industrial | `#94A3B8` (Slate Grey) | Heavy machinery |

### 3.6 Additional Information

Display a contextual insight below the chart:

> "Fans & Cooling consumes 68% of your total energy usage."

### 3.7 DOM IDs

| Element | ID |
|---------|----|
| Section wrapper | `#consumption-breakdown-section` |
| SVG donut | `#donut-chart-svg` |
| Center kWh label | `#donut-center-kwh` |
| Legend container | `#breakdown-legend` |
| Insight text | `#breakdown-insight-text` |

---

## 4. Feature 3: Energy Saving Opportunities

**Status:** 🔲 Planned

### 4.1 Placement

In `ResultsPanel.astro`, after Feature 2 (Consumption Breakdown). Hidden when no appliances are active.

### 4.2 Goal

Auto-generate 3–5 actionable, appliance-specific recommendations based on the user's top energy consumer.

### 4.3 Computation (`generateSavingsTips()` in `src/utils/health.ts`)

**Input:** Active appliances array, `monthlyBill`, currency formatter  
**Output:** `{ topConsumerName, potentialSavings, tips: string[] }`

**Logic:**
1. Find the appliance with highest `kWh/day` (watts × qty × hours / 1000)
2. Match its name against keyword patterns to select a tip set
3. Estimate potential savings: `monthlyBill × 0.12` (12% conservative baseline)

### 4.4 Appliance-Specific Tip Sets

| Keyword Match | Tips |
|--------------|------|
| `air conditioner` / `AC` / `1.5T` / `2.0T` | Increase thermostat by 1–2°C; Use timer/sleep mode; Clean filters monthly; Switch to inverter-type AC |
| `refrigerator` / `fridge` | Check door seal integrity; Avoid frequent opening; Maintain 5 cm rear clearance |
| `geyser` / `water heater` | Use timer scheduling; Lower temperature to 50°C; Insulate hot water pipes |
| `lighting` / `LED` / `tube` / `bulb` | Replace remaining CFLs with LED; Turn off unused lights; Install occupancy sensors |
| `washing machine` | Run only full loads; Use cold water wash; Schedule during off-peak hours |
| *(default — any other)* | Turn off standby devices; Use BEE 5-star rated appliances; Schedule heavy loads off-peak |

### 4.5 UI Card

```
┌─────────────────────────────────────────────┐
│ 💡 Energy Saving Opportunities              │
│                                             │
│  Top Consumer: Air Conditioner (1.5T)       │
│  ┌─────────────────────────────────────┐   │
│  │ Potential Monthly Savings  ₹1,800   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ✓ Increase thermostat by 1–2°C            │
│  ✓ Use timer / sleep mode                  │
│  ✓ Clean filters monthly                   │
│  ✓ Switch to inverter-type AC              │
└─────────────────────────────────────────────┘
```

### 4.6 DOM IDs

| Element | ID |
|---------|----|
| Section wrapper | `#energy-saving-section` |
| Top consumer name | `#saving-top-consumer` |
| Potential savings | `#saving-potential` |
| Tips list | `#saving-tips-list` |

---

## 5. Feature 4: High Consumption Alerts

**Status:** 🔲 Planned

### 5.1 Placement

In `ResultsPanel.astro`, after Feature 3 (Energy Saving Opportunities). Hidden when no appliances are active, or when no appliances cross the threshold.

### 5.2 Goal

Flag individual appliances that are disproportionately heavy contributors to daily energy use.

### 5.3 Computation (`getHighConsumptionAlerts()` in `src/utils/health.ts`)

**Input:** Active appliances array, total `dailyKWh`  
**Output:** `Array<{ name, kWhDay, percent, reason }>`

**Threshold:** Flag any appliance where:

```
applianceKWhDay / totalDailyKWh >= 0.15  (≥ 15% of daily usage)
```

**Reason string:** `"Accounts for {percent}% of daily usage"`

### 5.4 UI Card

```
┌─────────────────────────────────────────────┐
│ ⚠ High Consumption Devices                  │
│                                             │
│  ⚠ Air Conditioner (1.5T)                  │
│    20.0 kWh/day · Accounts for 68% of usage│
│                                             │
│  ⚠ Refrigerator                            │
│    7.2 kWh/day · Accounts for 24% of usage │
└─────────────────────────────────────────────┘
```

- Card uses amber warning border
- Each alert row: warning icon + appliance name (header), kWh/day + reason (subtext)

### 5.5 DOM IDs

| Element | ID |
|---------|----|
| Section wrapper | `#high-consumption-section` |
| Alert list | `#high-consumption-list` |

---

## 6. Feature 5: Enhanced PDF Report

**Status:** 🔲 Planned

### 6.1 Goal

Convert the existing print/PDF output into a professional multi-page electrical assessment report suitable for sharing with electricians, homeowners, solar installers, and energy consultants.

### 6.2 New PDF Structure

| Page | Content |
|------|---------|
| **Page 1** | Executive Summary — Load, Consumption, Bill, Health Score |
| **Page 2** | Smart Insights — MCB, Cable, Inverter, Solar |
| **Page 3** | Consumption Breakdown — Category distribution table + analysis |
| **Page 4** | Energy Saving Opportunities + High Consumption Devices |

### 6.3 Implementation

All changes are in the existing `print-only` section within `src/pages/index.astro`. No new pages or routes.

**New print DOM IDs to add:**

| Section | IDs |
|---------|-----|
| Health Score | `#print-health-score`, `#print-health-label`, `#print-health-details` |
| Consumption Breakdown | `#print-breakdown-table` |
| Energy Saving | `#print-saving-tips` |
| High Consumption | `#print-high-consumption` |

### 6.4 Design Requirements

- Maintain existing dark/amber branding (CSS handles print color overrides via `@media print`)
- Preserve all current sections — only add new ones
- `break-inside-avoid` on each major section card
- `page-break-before: always` between the 4 logical pages
- Professional appearance — suitable for client-facing sharing
- No SVG charts in print (use text tables for reliability across printers)

---

## 7. Technical Architecture

### 7.1 Helper Functions (all in `src/utils/health.ts`)

| Function | Purpose | Inputs | Output |
|----------|---------|--------|--------|
| `calculateHealthScore()` | Health score engine | loadPercent, dailyKWh, topConsumerDailyKWh, monthlyKWh, hasMCB, hasCable | `HealthScoreResult` |
| `calculateCategoryBreakdown()` | Category energy distribution | `Appliance[]` | `CategoryBreakdownResult` |
| `generateSavingsTips()` | Appliance-specific advice | `Appliance[]`, monthlyBill | `SavingsTipsResult` |
| `getHighConsumptionAlerts()` | Flag heavy consumers | `Appliance[]`, dailyKWh | `HighConsumptionAlert[]` |

### 7.2 Integration Point

All four functions are called inside `calculate()` in `src/pages/index.astro`, immediately after the existing Smart Insights block (~line 608). The pattern mirrors the existing insights integration.

### 7.3 Data Flow

```
User Interaction
      │
      ▼
calculate() in index.astro
      │
      ├── calculateTotals()     → result (existing)
      ├── calculateInsights()   → insights (existing)
      ├── calculateHealthScore() → health (Feature 1) ✅
      ├── calculateCategoryBreakdown() → breakdown (Feature 2)
      ├── generateSavingsTips() → tips (Feature 3)
      └── getHighConsumptionAlerts() → alerts (Feature 4)
            │
            ▼
      DOM update via setText(), animateCounter(), innerHTML
```

### 7.4 Rendering Architecture

- All new section cards follow the `display:none` / `display:''` toggle pattern tied to `activeCount === 0`
- No new Astro components needed — HTML added directly to `ResultsPanel.astro`
- No external chart libraries — SVG donut via native `<svg>` with `stroke-dasharray`
- Print sections populated by JS (same pattern as `#print-appliances-list`)

---

## 8. Verification Checklist

### Feature 1 (Health Score)
- [ ] "Typical 2BHK" preset → score appears, ~75–85 (Good/Excellent)
- [ ] "Budget Home" preset → score improves vs 2BHK
- [ ] "Summer Heavy" preset → score drops (high load + AC dominance)
- [ ] Clear all appliances → health score card hides
- [ ] Print preview includes health score section

### Feature 2 (Consumption Breakdown)
- [ ] Chart shows correct category percentages summing to 100%
- [ ] Highest consumption category is highlighted in insight text
- [ ] Chart/legend updates live on appliance changes
- [ ] Categories with 0% share are excluded

### Feature 3 (Energy Saving)
- [ ] AC preset → AC-specific tips shown
- [ ] Geyser as top consumer → water heater tips shown
- [ ] Potential savings figure = monthlyBill × 12%
- [ ] Default tips show for uncategorised top consumers

### Feature 4 (High Consumption Alerts)
- [ ] Appliance at ≥15% daily share → flagged with ⚠
- [ ] Multiple appliances can be flagged simultaneously
- [ ] Section hidden when no appliance crosses threshold
- [ ] "Budget Home" preset → alerts section likely hidden

### Feature 5 (Enhanced PDF)
- [ ] Print preview shows 4 distinct logical pages
- [ ] All new sections present in print layout
- [ ] No SVG chart in print (text table used instead)
- [ ] Existing print sections unchanged

### Regression
- [ ] `node scripts/verify-logic.cjs` → all tests pass
- [ ] `npm run build` → no TypeScript/Astro errors
- [ ] `npx playwright test` → existing E2E tests pass
- [ ] Mobile layout — all new cards are responsive
