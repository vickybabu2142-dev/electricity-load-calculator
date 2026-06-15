import { test, expect } from '@playwright/test';

test.describe('Site Pages & Navigation', () => {

  test('About Us page loads correctly', async ({ page }) => {
    await page.goto('/about-us');
    // Ensure we are on the right page and content is visible
    await expect(page.locator('main h1')).toContainText('About Us');
  });

  test('Contact Us page loads correctly', async ({ page }) => {
    await page.goto('/contact-us');
    await expect(page.locator('main h1')).toContainText('Contact Us');
    await expect(page.locator('form#contact-form')).toBeVisible();
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
    await expect(page.locator('main a[href="/"]')).toBeVisible();
  });

  test('Assessment page shows empty state when no data', async ({ page }) => {
    await page.goto('/assessment');
    // Initially shows loading, then should show empty
    await expect(page.locator('#assess-empty')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('#assess-empty h1')).toContainText('No Assessment Data');
  });

  test('Assessment page displays data after configuration', async ({ page }) => {
    await page.goto('/');
    
    // Expand lighting category first so appliances are visible
    await page.locator('button.category-toggle[data-category="Lighting"]').click();
    
    // Add an appliance (LED Bulb) and wait for state to save
    await page.locator('button[aria-label="Increase quantity of LED Bulb"]').click();
    // Give it a tiny bit of time to save to localStorage
    await page.waitForTimeout(500);
    
    // Navigate to assessment
    await page.goto('/assessment');
    
    // Wait for the assessment content to be visible
    await expect(page.locator('#assess-content')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('#assess-total-kw')).not.toHaveText('—');
    
    // Use very specific selectors for headers in the content section
    const content = page.locator('#assess-content');
    await expect(content.getByRole('heading', { name: 'Load Summary' })).toBeVisible();
    await expect(content.getByRole('heading', { name: 'Smart Recommendations' })).toBeVisible();
    await expect(content.getByRole('heading', { name: 'Electrical Health Score' })).toBeVisible();
  });

  test('Recommendations pages load correctly', async ({ page }) => {
    const recommendations = ['cable', 'inverter', 'mcb', 'solar'];
    for (const rec of recommendations) {
      await page.goto(`/recommendations/${rec}`);
      await expect(page.locator('main h1')).toBeVisible({ timeout: 10000 });
    }
  });

});
