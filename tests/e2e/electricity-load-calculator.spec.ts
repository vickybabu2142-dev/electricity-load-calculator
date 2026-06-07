import { test, expect } from '@playwright/test';

test.describe('Electricity Load Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display initial calculation results', async ({ page }) => {
    const totalKW = page.locator('#total-kw');
    await expect(totalKW).not.toHaveText('0.00');
    
    const monthlyBill = page.locator('#monthly-bill');
    await expect(monthlyBill).toContainText('₹');
  });

  test('should update totals when toggling an appliance', async ({ page }) => {
    const initialKWText = await page.locator('#total-kw').textContent();
    const initialKW = parseFloat(initialKWText || '0');

    // Find first appliance toggle and uncheck it
    // Use force: true because the actual checkbox is sr-only
    const firstToggle = page.locator('input[data-action="toggle-include"]').first();
    await firstToggle.uncheck({ force: true });

    // Wait for animation/debounce
    await expect(async () => {
      const currentKWText = await page.locator('#total-kw').textContent();
      const currentKW = parseFloat(currentKWText || '0');
      expect(currentKW).toBeLessThan(initialKW);
    }).toPass();
  });

  test('should update totals when changing quantity', async ({ page }) => {
    const initialKWText = await page.locator('#total-kw').textContent();
    const initialKW = parseFloat(initialKWText || '0');

    // Find first increment button
    const firstIncrement = page.locator('button[data-action="increment-qty"]').first();
    await firstIncrement.click();

    // Wait for animation
    await expect(async () => {
      const currentKWText = await page.locator('#total-kw').textContent();
      const currentKW = parseFloat(currentKWText || '0');
      expect(currentKW).toBeGreaterThan(initialKW);
    }).toPass();
  });

  test('should add a custom appliance and update totals', async ({ page }) => {
    const initialKWText = await page.locator('#total-kw').textContent();
    const initialKW = parseFloat(initialKWText || '0');

    // Open the "Other" category first (it's collapsed by default)
    const otherCategoryToggle = page.locator('button.category-toggle[data-category="Other"]');
    await otherCategoryToggle.click();

    // Open "Add Custom" in "Other" category
    const addToggle = page.locator('.add-toggle-btn').last();
    await addToggle.click();

    const form = page.locator('.add-appliance-form').last();
    await expect(form).toBeVisible();

    await form.locator('[data-field="name"]').fill('Gaming PC High End');
    await form.locator('[data-field="watts"]').fill('800');
    await form.locator('[data-field="hours"]').fill('4');
    
    await form.locator('button[type="submit"]').click();

    // Check if new row is added (use specific locator to avoid strict mode violation)
    const newRow = page.locator('#category-body-Other').getByText('Gaming PC High End', { exact: true });
    await expect(newRow).toBeVisible();

    // Check if totals increased
    await expect(async () => {
      const currentKWText = await page.locator('#total-kw').textContent();
      const currentKW = parseFloat(currentKWText || '0');
      expect(currentKW).toBeGreaterThan(initialKW);
    }).toPass();
  });

  test('should switch themes', async ({ page }) => {
    const html = page.locator('html');
    
    // Default should be dark (no .light class)
    await expect(html).not.toHaveClass(/light/);

    const themeToggle = page.locator('#theme-toggle');
    await themeToggle.click();

    // Should now have .light class
    await expect(html).toHaveClass(/light/);

    // Refresh and check persistence
    await page.reload();
    await expect(html).toHaveClass(/light/);
  });

  test('should change region and currency', async ({ page }) => {
    const currencySelect = page.locator('#currency-select');
    await currencySelect.selectOption('USD');

    // Check if currency symbol changed in ResultsPanel
    const monthlyBill = page.locator('#monthly-bill');
    await expect(monthlyBill).toContainText('$');

    // Check if tariff input updated
    const tariffInput = page.locator('#tariff-input');
    await expect(tariffInput).toHaveValue('0.15');
  });

  test('should open and close the report modal', async ({ page }) => {
    const downloadBtn = page.locator('#download-report-btn');
    await downloadBtn.click();

    const modal = page.locator('#report-modal');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('ELECTRICITY LOAD CALCULATOR REPORT');

    const closeBtn = page.locator('#modal-close');
    await closeBtn.click();
    await expect(modal).not.toBeVisible();
  });

  test('should reset all to defaults', async ({ page }) => {
    // First make some changes
    await page.locator('#currency-select').selectOption('USD');
    await page.locator('button[data-action="increment-qty"]').first().click();

    // Click reset
    page.on('dialog', dialog => dialog.accept()); // Handle confirmation dialog
    await page.locator('#reset-all-btn').click();

    // Check if back to INR/Default
    await expect(page.locator('#currency-select')).toHaveValue('INR');
    const monthlyBill = page.locator('#monthly-bill');
    await expect(monthlyBill).toContainText('₹');
  });
});
