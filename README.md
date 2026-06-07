# Electricity Load Calculator

A professional, industrial-grade web application for calculating household electrical load requirements. Built with Astro, Tailwind CSS v4, and strict TypeScript.

## 🚀 Features

- **Dynamic Load Calculation**: Real-time calculation of total wattage and estimated energy costs.
- **Appliance Management**:
  - Comprehensive catalog of standard household appliances.
  - **Custom Additions**: Add your own appliances with specific power ratings.
  - **Interactive Controls**: Use steppers for quantity and toggles to include/exclude items from the final report.
- **Dual-Theme System**:
  - **Industrial Dark (Default)**: A high-contrast, technical dashboard aesthetic (Industrial Amber accent).
  - **Stormy Morning (Light)**: A clean, professional blue-gray palette for high-visibility environments.
  - **Persistence**: Theme selection is remembered across sessions.
- **Professional Reporting**:
  - **Print Optimization**: Dedicated report layout for PDF and physical printing.
  - **Ink Efficiency**: Automatically switches to a high-contrast, ink-saving format for print.
- **Localization**: Supports regional tariff updates and currency formatting.
- **Performance First**: Minimal client-side JavaScript, leveraging Astro's islands-like architecture (vanilla TS) for speed.

## 🛠️ Tech Stack

- **Framework**: [Astro](https://astro.build/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Typography**: Khand (Headers), Hind (Body), Geist Mono (Data)
- **Deployment**: Vercel

## 🧞 Commands

All commands are run from the root of the project:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server                          |
| `npm run build`           | Build for production                             |
| `npm run preview`         | Preview your build locally                       |
| `node scripts/verify-logic.cjs` | Run calculation logic test suite            |

## 🧪 Testing

The project includes a verification script for core calculation logic:
```sh
node scripts/verify-logic.cjs
```

E2E tests are located in `tests/e2e/` and can be run with Playwright.

---
*Built for precision and reliability.*
