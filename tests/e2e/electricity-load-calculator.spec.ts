import { test, expect } from '@playwright/test';

test.describe('Electricity Load Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // ── Initial State ─────────────────────────────────────────

  test('displays initial totals as zero with no appliances active', async ({ page }) => {
    await expect(page.locator('#total-kw')).toHaveText('0.00');
    await expect(page.locator('#monthly-bill')).toContainText('₹');
    await expect(page.locator('#load-level-badge')).toHaveText('Light Load');
  });

  test('shows correct active and total appliance counts on load', async ({ page }) => {
    await expect(page.locator('#active-count')).toHaveText('0');
    await expect(page.locator('#total-count')).toHaveText('31');
  });

  test('starts in dark mode by default', async ({ page }) => {
    await expect(page.locator('html')).not.toHaveClass(/light/);
  });

  // ── Quantity Stepper ──────────────────────────────────────

  test('incrementing quantity increases total kW', async ({ page }) => {
    // LED Bulb: 9W × 1qty = 9W → 0.009 kW → "0.01"
    
    // First expand the category
    await page.locator('button.category-toggle[data-category="Lighting"]').click();
    
    await page.locator('button[aria-label="Increase quantity of LED Bulb"]').click();
    await expect(page.locator('#total-kw')).toHaveText('0.01');
    await expect(page.locator('#active-count')).toHaveText('1');
  });

  test('decrementing quantity to zero removes appliance from totals', async ({ page }) => {
    await page.locator('button.category-toggle[data-category="Lighting"]').click();
    await page.locator('button[aria-label="Increase quantity of LED Bulb"]').click();
    await expect(page.locator('#total-kw')).toHaveText('0.01');
    
    await page.locator('button[aria-label="Decrease quantity of LED Bulb"]').click();
    await expect(page.locator('#total-kw')).toHaveText('0.00');
  });

  test('decrement button does not go below zero', async ({ page }) => {
    await page.locator('button.category-toggle[data-category="Lighting"]').click();
    await page.locator('button[aria-label="Decrease quantity of LED Bulb"]').click();

    const qtyDisplay = page.locator('[data-qty-display="app-1"]');
    await expect(qtyDisplay).toHaveText('0');
  });

  // ── Watts & Hours Editing ─────────────────────────────────

  test('editing watts updates the row kWh display and total load', async ({ page }) => {
    await page.locator('button.category-toggle[data-category="Lighting"]').click();
    await page.locator('button[aria-label="Increase quantity of LED Bulb"]').click();
    
    const wattsInput = page.locator('input[aria-label="Watts for LED Bulb"]');
    await wattsInput.fill('100');
    await wattsInput.dispatchEvent('change');

    // kWh: 100W × 1qty × 8h / 1000 = 0.80 kWh/d
    await expect(page.locator('[data-kwh-display="app-1"]')).toHaveText('0.80');
    // total kW: 100W / 1000 = 0.10 kW
    await expect(page.locator('#total-kw')).toHaveText('0.10');
  });

  test('editing hours updates the row kWh display', async ({ page }) => {
    await page.locator('button.category-toggle[data-category="Lighting"]').click();
    await page.locator('button[aria-label="Increase quantity of LED Bulb"]').click();
    
    const hoursInput = page.locator('input[aria-label="Hours per day for LED Bulb"]');
    await hoursInput.fill('10');
    await hoursInput.dispatchEvent('change');

    // kWh: 9W × 1qty × 10h / 1000 = 0.09 kWh/d
    await expect(page.locator('[data-kwh-display="app-1"]')).toHaveText('0.09');
  });

  // ── Currency, Tariff & Capacity ───────────────────────────

  test('switching to USD updates currency symbol and default tariff', async ({ page }) => {
    await page.locator('#currency-select').selectOption('USD');

    await expect(page.locator('#monthly-bill')).toContainText('$');
    await expect(page.locator('#tariff-input')).toHaveValue('0.15');
    await expect(page.locator('#max-kw-input')).toHaveValue('20');
  });

  test('switching to EUR updates currency symbol and default tariff', async ({ page }) => {
    await page.locator('#currency-select').selectOption('EUR');

    await expect(page.locator('#monthly-bill')).toContainText('€');
    await expect(page.locator('#tariff-input')).toHaveValue('0.35');
  });

  test('changing tariff updates the monthly bill', async ({ page }) => {
    // Add an appliance so bill > 0
    await page.locator('button.category-toggle[data-category="Lighting"]').click();
    await page.locator('button[aria-label="Increase quantity of LED Bulb"]').click();
    
    const initialBill = await page.locator('#monthly-bill').textContent();

    // Double the tariff: 8 → 16
    await page.locator('#tariff-input').fill('16');
    await page.locator('#tariff-input').dispatchEvent('input');

    await expect(async () => {
      const newBill = await page.locator('#monthly-bill').textContent();
      expect(newBill).not.toBe(initialBill);
      expect(newBill).not.toBe('₹0');
    }).toPass();
  });

  test('changing max capacity updates the load percentage label', async ({ page }) => {
    await page.locator('#max-kw-input').fill('10');
    await page.locator('#max-kw-input').dispatchEvent('input');

    await expect(page.locator('#max-kw-label')).toHaveText('10 kW max');
  });

  // ── Custom Appliance ──────────────────────────────────────

  test('adds a custom appliance and reflects it in totals', async ({ page }) => {
    const initialKW = parseFloat((await page.locator('#total-kw').textContent()) || '0');

    await page.locator('button.category-toggle[data-category="Other"]').click();
    await page.locator('button.add-toggle-btn[data-category="Other"]').click();

    const form = page.locator('.add-appliance-form[data-category="Other"]');
    await expect(form).toBeVisible();

    await form.locator('[data-field="name"]').fill('Gaming PC High End');
    await form.locator('[data-field="watts"]').fill('800');
    await form.locator('[data-field="hours"]').fill('4');
    await form.locator('button[type="submit"]').click();

    await expect(
      page.locator('#category-body-Other').getByText('Gaming PC High End', { exact: true })
    ).toBeVisible();

    await expect(async () => {
      const kw = parseFloat((await page.locator('#total-kw').textContent()) || '0');
      expect(kw).toBeGreaterThan(initialKW);
    }).toPass();
  });

  test('custom appliance shows CUSTOM badge', async ({ page }) => {
    await page.locator('button.category-toggle[data-category="Other"]').click();
    await page.locator('button.add-toggle-btn[data-category="Other"]').click();

    const form = page.locator('.add-appliance-form[data-category="Other"]');
    await form.locator('[data-field="name"]').fill('My Device');
    await form.locator('[data-field="watts"]').fill('50');
    await form.locator('[data-field="hours"]').fill('1');
    await form.locator('button[type="submit"]').click();

    const newRow = page.locator('#category-body-Other').locator('[data-id]').filter({ hasText: 'My Device' });
    await expect(newRow.getByText('CUSTOM')).toBeVisible();
  });

  test('deletes a custom appliance and removes it from the list', async ({ page }) => {
    // First add a custom appliance
    await page.locator('button.category-toggle[data-category="Other"]').click();
    await page.locator('button.add-toggle-btn[data-category="Other"]').click();
    const form = page.locator('.add-appliance-form[data-category="Other"]');
    await form.locator('[data-field="name"]').fill('Temp Appliance');
    await form.locator('[data-field="watts"]').fill('200');
    await form.locator('[data-field="hours"]').fill('2');
    await form.locator('button[type="submit"]').click();

    const newRow = page.locator('#category-body-Other').getByText('Temp Appliance', { exact: true });
    await expect(newRow).toBeVisible();

    // Delete it
    await page.locator('button[aria-label="Remove Temp Appliance"]').click();
    await expect(newRow).not.toBeVisible();
  });

  test('cancel button closes the add form without adding', async ({ page }) => {
    await page.locator('button.category-toggle[data-category="Other"]').click();
    await page.locator('button.add-toggle-btn[data-category="Other"]').click();

    const form = page.locator('.add-appliance-form[data-category="Other"]');
    await expect(form).toBeVisible();

    await form.locator('.add-cancel-btn').click();
    await expect(form).not.toBeVisible();
  });

  test('shows validation error when appliance name is empty', async ({ page }) => {
    await page.locator('button.category-toggle[data-category="Other"]').click();
    await page.locator('button.add-toggle-btn[data-category="Other"]').click();

    const form = page.locator('.add-appliance-form[data-category="Other"]');
    await form.locator('[data-field="watts"]').fill('100');
    await form.locator('[data-field="hours"]').fill('2');
    await form.locator('button[type="submit"]').click();

    await expect(form.locator('.form-error')).toBeVisible();
    await expect(form.locator('.form-error')).toContainText('Please enter an appliance name');
  });

  test('shows validation error when watts value is missing', async ({ page }) => {
    await page.locator('button.category-toggle[data-category="Other"]').click();
    await page.locator('button.add-toggle-btn[data-category="Other"]').click();

    const form = page.locator('.add-appliance-form[data-category="Other"]');
    await form.locator('[data-field="name"]').fill('Test Appliance');
    // Leave watts empty
    await form.locator('button[type="submit"]').click();

    await expect(form.locator('.form-error')).toBeVisible();
    await expect(form.locator('.form-error')).toContainText('Watts must be at least 1');
  });

  // ── Theme Toggle ──────────────────────────────────────────

  test('toggles between dark and light themes', async ({ page }) => {
    const html = page.locator('html');

    await expect(html).not.toHaveClass(/light/);

    await page.locator('#theme-toggle').click();
    await expect(html).toHaveClass(/light/);

    await page.locator('#theme-toggle').click();
    await expect(html).not.toHaveClass(/light/);
  });

  test('theme preference persists across page reload', async ({ page }) => {
    await page.locator('#theme-toggle').click();
    await expect(page.locator('html')).toHaveClass(/light/);

    await page.reload();
    await expect(page.locator('html')).toHaveClass(/light/);
  });

  // ── Report Modal ──────────────────────────────────────────

  test('opens report modal with report content', async ({ page }) => {
    // Add an appliance to appear in the report
    await page.locator('button.category-toggle[data-category="Lighting"]').click();
    await page.locator('button[aria-label="Increase quantity of LED Bulb"]').click();

    await page.locator('#download-report-btn').click();

    const modal = page.locator('#report-modal');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('ELECTRICITY LOAD CALCULATOR REPORT');
    await expect(modal).toContainText('SUMMARY');
    await expect(modal).toContainText('LED Bulb');
  });

  test('closes report modal with the close button', async ({ page }) => {
    await page.locator('#download-report-btn').click();
    await expect(page.locator('#report-modal')).toBeVisible();

    await page.locator('#modal-close').click();
    await expect(page.locator('#report-modal')).not.toBeVisible();
  });

  test('closes report modal by clicking the backdrop', async ({ page }) => {
    await page.locator('#download-report-btn').click();
    await expect(page.locator('#report-modal')).toBeVisible();

    // Click at the top-left corner of the backdrop to avoid hitting the centered modal box
    await page.locator('#modal-backdrop').click({ position: { x: 5, y: 5 } });
    await expect(page.locator('#report-modal')).not.toBeVisible();
  });

  test('closes report modal with the Escape key', async ({ page }) => {
    await page.locator('#download-report-btn').click();
    await expect(page.locator('#report-modal')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.locator('#report-modal')).not.toBeVisible();
  });

  // ── Reset ─────────────────────────────────────────────────

  test('reset button restores all defaults', async ({ page }) => {
    // Make several changes first
    await page.locator('button.category-toggle[data-category="Lighting"]').click();
    await page.locator('#currency-select').selectOption('USD');
    await page.locator('button[aria-label="Increase quantity of LED Bulb"]').click();

    page.on('dialog', dialog => dialog.accept());
    await page.locator('#reset-all-btn').click();

    await expect(page.locator('#currency-select')).toHaveValue('INR');
    await expect(page.locator('#tariff-input')).toHaveValue('8');
    await expect(page.locator('#monthly-bill')).toContainText('₹');
    await expect(page.locator('#total-kw')).toHaveText('0.00');
  });

  // ── Category Collapse / Expand ────────────────────────────

  test('all categories start collapsed by default', async ({ page }) => {
    await expect(page.locator('#category-body-Lighting')).not.toBeVisible();
    await expect(page.locator('#category-body-Kitchen')).not.toBeVisible();
    await expect(page.locator('[id="category-body-Office-&-IT"]')).not.toBeVisible();
  });

  test('clicking a category header expands then collapses it', async ({ page }) => {
    const kitchenToggle = page.locator('button.category-toggle[data-category="Kitchen"]');
    const kitchenBody = page.locator('#category-body-Kitchen');

    await expect(kitchenBody).not.toBeVisible();
    await kitchenToggle.click();
    await expect(kitchenBody).toBeVisible();
    await kitchenToggle.click();
    await expect(kitchenBody).not.toBeVisible();
  });

  // ── Load Level Badge ──────────────────────────────────────

  test('shows Light Load badge when load is minimal', async ({ page }) => {
    await expect(page.locator('#load-level-badge')).toHaveText('Light Load');
  });

  test('shows Moderate Load badge when load is between 30–70%', async ({ page }) => {
    await page.locator('button.category-toggle[data-category="Lighting"]').click();
    await page.locator('button[aria-label="Increase quantity of LED Bulb"]').click();

    // Change watts to 2000W: 2000/5000 = 40% → Moderate
    const wattsInput = page.locator('input[aria-label="Watts for LED Bulb"]');
    await wattsInput.fill('2000');
    await wattsInput.dispatchEvent('change');

    await expect(page.locator('#load-level-badge')).toHaveText('Moderate Load');
  });

  test('shows Heavy Load badge when load exceeds 70% of capacity', async ({ page }) => {
    await page.locator('button.category-toggle[data-category="Lighting"]').click();
    await page.locator('button[aria-label="Increase quantity of LED Bulb"]').click();

    // Change watts to 5000W: 5000/5000 = 100% → Heavy
    const wattsInput = page.locator('input[aria-label="Watts for LED Bulb"]');
    await wattsInput.fill('5000');
    await wattsInput.dispatchEvent('change');

    await expect(page.locator('#load-level-badge')).toHaveText('Heavy Load');
  });

  // ── Mobile Layout ─────────────────────────────────────────

  test('categories container maintains full width on mobile when collapsed', async ({ page }) => {
    // Set to a typical mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('#category-body-Lighting')).not.toBeVisible();

    // The categories container is the first child of the main layout div
    // In our fix, we added 'w-full' to it.
    const categoriesContainer = page.locator('main > div > div').first();
    const mainContainer = page.locator('main > div');

    const containerBox = await categoriesContainer.boundingBox();
    const mainBox = await mainContainer.boundingBox();

    if (containerBox && mainBox) {
      // The categories container should be approximately the same width as the main container
      // (allowing for minor rounding or flex gap variations if any, but in flex-col it should match)
      expect(containerBox.width).toBeCloseTo(mainBox.width, 0);
    }
  });
});