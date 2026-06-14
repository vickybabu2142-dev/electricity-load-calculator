import { test, expect } from '@playwright/test';

test.describe('Site Pages & Navigation', () => {

  test('About Us page loads correctly', async ({ page }) => {
    await page.goto('/about-us');
    await expect(page.locator('main h1')).toContainText('About Us');
  });

  test('Contact Us page loads correctly', async ({ page }) => {
    await page.goto('/contact-us');
    await expect(page.locator('main h1')).toContainText('Contact Us');
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('Privacy Policy page loads correctly', async ({ page }) => {
    await page.goto('/privacy-policy');
    await expect(page.locator('main h1')).toContainText('Privacy Policy');
  });

  test('Terms & Conditions page loads correctly', async ({ page }) => {
    await page.goto('/terms-conditions');
    await expect(page.locator('main h1')).toContainText('Terms & Conditions');
  });

  test('404 page loads correctly for non-existent routes', async ({ page }) => {
    await page.goto('/non-existent-page');
    await expect(page.locator('main h1')).toContainText('Circuit Broken');
    await expect(page.locator('text=Error 404')).toBeVisible();
    // Use a more specific selector for the back button to avoid strict mode violation
    await expect(page.locator('main a[href="/"]')).toBeVisible();
  });

  test('Assessment page shows empty state when no data', async ({ page }) => {
    await page.goto('/assessment');
    // It starts with a loading state then should show empty state
    await expect(page.locator('#assess-empty')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=No Assessment Data')).toBeVisible();
  });

  test('Assessment page displays data after configuration', async ({ page }) => {
    await page.goto('/');
    
    // Add an appliance (LED Bulb)
    await page.locator('button[aria-label="Increase quantity of LED Bulb"]').click();
    
    // Navigate to assessment
    await page.goto('/assessment');
    
    await expect(page.locator('#assess-content')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#assess-total-kw')).not.toHaveText('—');
    
    // Check if sections are visible - using more specific selectors to avoid ambiguity
    // Target only the ones in the main assessment content, not the print layout
    const assessContent = page.locator('#assess-content');
    await expect(assessContent.locator('h2', { hasText: 'Load Summary' })).toBeVisible();
    await expect(assessContent.locator('h2', { hasText: 'Electrical Health Score' })).toBeVisible();
    await expect(assessContent.locator('h2', { hasText: 'Smart Recommendations' })).toBeVisible();
  });

  test('Insights pages load correctly', async ({ page }) => {
    const insights = ['cable', 'inverter', 'mcb', 'solar'];
    for (const insight of insights) {
      await page.goto(`/insights/${insight}`);
      await expect(page.locator('main h1')).toBeVisible();
      // Most of these have breadcrumbs
      await expect(page.locator('nav[aria-label="Breadcrumb"]')).toBeVisible();
    }
  });

  test('Recommendations pages load correctly', async ({ page }) => {
    const recommendations = ['cable', 'inverter', 'mcb', 'solar'];
    for (const rec of recommendations) {
      await page.goto(`/recommendations/${rec}`);
      await expect(page.locator('main h1')).toBeVisible();
    }
  });

});
