import { test, expect } from '@playwright/test';

test.describe('Electricity Load Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // ── Initial State ─────────────────────────────────────────

  test('displays initial totals as zero with no appliances active', async ({ page }) => {
    await expect(page.locator('#total-kw')).toHaveText('0.00');
    await expect(page.locator('#monthly-kwh')).toHaveText('0');
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
    // Lighting category is expanded by default
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

  // ── Capacity & Energy Cost Estimator ─────────────────────

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

  // ── Report & Assessment ──────────────────────────────────

  test('navigates to assessment page with the CTA button', async ({ page }) => {
    // Add an appliance to ensure data exists
    await page.locator('button.category-toggle[data-category="Lighting"]').click();
    await page.locator('button[aria-label="Increase quantity of LED Bulb"]').click();
    await page.waitForTimeout(300);

    await page.locator('#generate-assessment-btn').click();
    await expect(page).toHaveURL(/\/assessment/);
    
    // Check for unique content on the assessment page
    await expect(page.locator('#assess-content')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#assess-content h1')).toContainText('Your Electrical Assessment');
  });

  // ── Energy Cost Estimator ─────────────────────────────────

  test('Energy Cost Estimator shows result when rate is entered', async ({ page }) => {
    // Add an appliance so data exists
    await page.locator('button.category-toggle[data-category="Lighting"]').click();
    await page.locator('button[aria-label="Increase quantity of LED Bulb"]').click();
    await page.waitForTimeout(300);

    // Navigate to assessment page where the estimator is located
    await page.goto('/assessment');

    // Wait for content to load
    await expect(page.locator('#assess-content')).toBeVisible({ timeout: 10000 });

    // Enter a rate in the estimator
    const rateInput = page.locator('#assess-rate');
    await expect(rateInput).toBeVisible();
    await rateInput.fill('0.15');
    await rateInput.dispatchEvent('input');

    await expect(page.locator('#assess-est-result')).toBeVisible();
    await expect(page.locator('#assess-est-monthly')).not.toHaveText('—');
  });

  // ── Reset ─────────────────────────────────────────────────

  test('reset button restores all defaults', async ({ page }) => {
    // Make several changes first (Lighting is already expanded by default)
    await page.locator('button.category-toggle[data-category="Lighting"]').click();
    await page.locator('button[aria-label="Increase quantity of LED Bulb"]').click();
    await page.locator('#max-kw-input').fill('30');
    await page.locator('#max-kw-input').dispatchEvent('input');

    page.on('dialog', dialog => dialog.accept());
    await page.locator('button[data-action="reset-all"]').filter({ visible: true }).first().click();

    await expect(page.locator('#total-kw')).toHaveText('0.00');
    await expect(page.locator('#active-count')).toHaveText('0');
  });

  // ── Category Collapse / Expand ────────────────────────────

  test('all categories start collapsed by default', async ({ page }) => {
    await expect(page.locator('#category-body-Lighting')).not.toBeVisible();
    await expect(page.locator('#category-body-Kitchen')).not.toBeVisible();
    await expect(page.locator('[id="category-body-Fans-&-Cooling"]')).not.toBeVisible();
  });

  test('Lighting expands when a Quick Start preset is loaded while others stay collapsed', async ({ page }) => {
    await expect(page.locator('#category-body-Lighting')).not.toBeVisible();
    await page.locator('button[data-preset-id="budget-home"]').click();
    await expect(page.locator('#category-body-Lighting')).toBeVisible();
    // Others should remain collapsed even if they have active appliances in the preset
    await expect(page.locator('[id="category-body-Fans-&-Cooling"]')).not.toBeVisible();
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

    await expect(page.locator('#category-body-Kitchen')).not.toBeVisible();

    // The main flex layout is the second direct child of main (after the Quick Start presets div).
    // The categories container is the first child of that flex layout.
    const mainFlexLayout = page.locator('main > div').nth(1);
    const categoriesContainer = mainFlexLayout.locator('> div').first();

    const containerBox = await categoriesContainer.boundingBox();
    const mainBox = await mainFlexLayout.boundingBox();

    if (containerBox && mainBox) {
      // On mobile (flex-col), categories container should match the flex layout width
      expect(containerBox.width).toBeCloseTo(mainBox.width, 0);
    }
  });

  // ── Quick Start Presets ───────────────────────────────────

  test('loading a preset increases total kW above zero', async ({ page }) => {
    await page.locator('[data-preset-id="budget-home"]').click();

    await expect(async () => {
      const kw = parseFloat((await page.locator('#total-kw').textContent()) || '0');
      expect(kw).toBeGreaterThan(0);
    }).toPass();
  });

  test('loading a preset only expands the Lighting category', async ({ page }) => {
    // budget-home includes Kitchen appliances (Refrigerator, Mixer), but they should stay collapsed
    await page.locator('[data-preset-id="budget-home"]').click();

    await expect(page.locator('#category-body-Lighting')).toBeVisible();
    await expect(page.locator('#category-body-Kitchen')).not.toBeVisible();
  });

  test('loading a preset collapses categories with no active appliances', async ({ page }) => {
    // budget-home has no Water Heating appliances
    await page.locator('[data-preset-id="budget-home"]').click();

    await expect(page.locator('#category-body-Water-Heating')).not.toBeVisible();
  });

  test('loading a preset highlights the active preset button', async ({ page }) => {
    const presetBtn = page.locator('[data-preset-id="budget-home"]');
    await presetBtn.click();

    const boxShadow = await presetBtn.evaluate(el => (el as HTMLElement).style.boxShadow);
    expect(boxShadow).not.toBe('');
  });

  test('loading a second preset clears the first preset highlight', async ({ page }) => {
    const btn1 = page.locator('[data-preset-id="budget-home"]');
    const btn2 = page.locator('[data-preset-id="typical-2bhk"]');

    await btn1.click();
    await btn2.click();

    const shadow1 = await btn1.evaluate(el => (el as HTMLElement).style.boxShadow);
    const shadow2 = await btn2.evaluate(el => (el as HTMLElement).style.boxShadow);
    expect(shadow1).toBe('');
    expect(shadow2).not.toBe('');
  });

  test('reset clears active preset highlight', async ({ page }) => {
    await page.locator('[data-preset-id="budget-home"]').click();

    page.on('dialog', dialog => dialog.accept());
    await page.locator('button[data-action="reset-all"]').filter({ visible: true }).click();

    const shadow = await page.locator('[data-preset-id="budget-home"]').evaluate(
      el => (el as HTMLElement).style.boxShadow
    );
    expect(shadow).toBe('');
  });

  // ── LocalStorage Persistence ──────────────────────────────

  test('appliance quantities persist across page reload', async ({ page }) => {
    await page.locator('button.category-toggle[data-category="Lighting"]').click();
    await page.locator('button[aria-label="Increase quantity of LED Bulb"]').click();
    await expect(page.locator('#total-kw')).toHaveText('0.01');

    await page.reload();

    await expect(page.locator('#total-kw')).toHaveText('0.01');
    await expect(page.locator('#active-count')).toHaveText('1');
  });

  test('max capacity setting persists across page reload', async ({ page }) => {
    await page.locator('#max-kw-input').fill('25');
    await page.locator('#max-kw-input').dispatchEvent('input');

    await page.reload();

    await expect(page.locator('#max-kw-input')).toHaveValue('25');
  });

  test('only Lighting category with saved active appliances re-expands after reload', async ({ page }) => {
    // budget-home activates Lighting and Kitchen appliances
    await page.locator('[data-preset-id="budget-home"]').click();
    await expect(page.locator('#category-body-Lighting')).toBeVisible();
    await expect(page.locator('#category-body-Kitchen')).not.toBeVisible(); // Kitchen stays collapsed per new rule

    await page.reload();

    await expect(page.locator('#category-body-Lighting')).toBeVisible();
    await expect(page.locator('#category-body-Kitchen')).not.toBeVisible();
  });
});