import { test, expect } from '@playwright/test';

test.describe('Knowledge Hub E2E Tests', () => {

  test('Main Knowledge Hub page loads and renders key sections', async ({ page }) => {
    await page.goto('/knowledge-hub');
    
    // Check main title
    await expect(page.locator('h1').first()).toContainText('Knowledge Hub');
    
    // Check that four topic cards are displayed
    const clusterCards = page.locator('a[aria-label*="Explore"], a[aria-label*="Coming Soon"]');
    await expect(clusterCards).toHaveCount(4);
    
    // Check that 'Coming Soon' badges exist for 3 clusters
    const comingSoonBadges = page.locator('#topics').locator('text=Coming Soon');
    await expect(comingSoonBadges).toHaveCount(3);
    
    // Check Featured Tool CTA presence
    await expect(page.locator('main h2:has-text("Electricity Load Calculator")')).toBeVisible();
    await expect(page.locator('a:has-text("Open Calculator")')).toHaveAttribute('href', '/');

    // Check FAQs accordion
    const faqDetails = page.locator('details');
    await expect(faqDetails.first()).toBeVisible();
  });

  test('Load Calculation cluster index page loads and renders correctly', async ({ page }) => {
    await page.goto('/knowledge-hub/load-calculation');

    // Check header title
    await expect(page.locator('h1').first()).toContainText('Electrical Load Calculation');

    // Check Pillar Guide card
    await expect(page.locator('span:has-text("Pillar Guide")')).toBeVisible();

    // Check that other articles list is present
    const articleLinks = page.locator('section[aria-labelledby="guides-heading"] a[href^="/knowledge-hub/load-calculation/"]');
    await expect(articleLinks).toHaveCount(5);

    // Verify quick reference wattage table is present
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('text=Typical (W)')).toBeVisible();

    // Verify sidebar "Free Tool" card is visible (assuming desktop viewport size in tests)
    const sidebarCTA = page.locator('aside a:has-text("Try Free")');
    await expect(sidebarCTA).toBeVisible();
    await expect(sidebarCTA).toHaveAttribute('href', '/');
  });

  // Array of all 6 load-calculation articles
  const articles = [
    'how-to-calculate-electrical-load-for-a-house',
    'electrical-load-chart-for-home-appliances',
    'connected-load-vs-demand-load',
    'single-phase-vs-three-phase-load',
    'how-many-units-of-electricity-does-a-home-use',
    'kw-vs-kva-vs-kwh-explained'
  ];

  for (const slug of articles) {
    test(`Article Page [${slug}] loads, renders layout, and satisfies SEO standards`, async ({ page }) => {
      await page.goto(`/knowledge-hub/load-calculation/${slug}`);

      // Verify article title exists as exactly one h1 tag inside the main content
      await expect(page.locator('main h1')).toHaveCount(1);

      // Verify meta description is present and populated
      const metaDesc = page.locator('meta[name="description"]');
      await expect(metaDesc).toHaveAttribute('content', /.+/);

      // Verify Table of Contents (TOC) is present in sidebar
      const desktopSidebar = page.locator('aside');
      await expect(desktopSidebar.locator('text=On This Page')).toBeVisible();

      // Verify the newly fixed "Free Tool" card is at the top of the sidebar
      const firstSidebarWidget = desktopSidebar.locator('> div').first();
      await expect(firstSidebarWidget.locator('text=Free Tool')).toBeVisible();
      await expect(firstSidebarWidget.locator('text=Electricity Load Calculator')).toBeVisible();

      const tryFreeButton = firstSidebarWidget.locator('a[href="/"]');
      await expect(tryFreeButton).toBeVisible();
      await expect(tryFreeButton).toContainText('Try Free');

      // Verify other articles list in sidebar
      await expect(desktopSidebar.locator('text=More in Load Calculation')).toBeVisible();

      // Verify main content has at least one of the body CTA blocks (block or inline)
      const bodyCTA = page.locator('main a[href="/"]').filter({ hasText: /Calculator/i });
      await expect(bodyCTA.first()).toBeVisible();

      // Verify JSON-LD structured data is present in head and valid
      const jsonLdScript = page.locator('head script[type="application/ld+json"]').first();
      await expect(jsonLdScript).toBeAttached();
      
      const jsonLdContent = await jsonLdScript.textContent();
      expect(jsonLdContent).toBeTruthy();
      
      const parsed = JSON.parse(jsonLdContent!);
      expect(parsed).toHaveProperty('@context', 'https://schema.org');
      expect(parsed).toHaveProperty('@graph');
      
      const types = parsed['@graph'].map((item: any) => item['@type']);
      expect(types).toContain('Article');
      expect(types).toContain('FAQPage');
      expect(types).toContain('BreadcrumbList');
      expect(types).toContain('WebSite');
    });
  }

  // Stubs for Phase 2 clusters
  const stubs = [
    { slug: 'mcb-sizing', title: 'MCB Sizing' },
    { slug: 'wire-sizing', title: 'Wire & Cable Sizing' },
    { slug: 'solar-inverter', title: 'Solar & Inverter Sizing' }
  ];

  for (const stub of stubs) {
    test(`Stub Page [${stub.slug}] loads and shows Coming Soon state`, async ({ page }) => {
      await page.goto(`/knowledge-hub/${stub.slug}`);

      // Verify main heading has the correct title
      await expect(page.locator('h1').first()).toContainText(stub.title);

      // Verify "Coming Soon" badge is present
      await expect(page.locator('main').locator('text=Coming Soon').first()).toBeVisible();

      // Verify there are upcoming topics listed
      await expect(page.locator('text=What\'s Coming')).toBeVisible();

      // Verify free calculator CTA is present
      const calcCTA = page.locator('main a.btn-primary[href="/"]');
      await expect(calcCTA).toBeVisible();
      await expect(calcCTA).toContainText('Try Free');
    });
  }
});
