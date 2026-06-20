import { test, expect } from '@playwright/test';

test.describe('Knowledge Hub E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const style = document.createElement('style');
      style.innerHTML = 'astro-dev-toolbar { display: none !important; }';
      document.head.appendChild(style);
    }).catch(() => {});
  });

  test('Main Knowledge Hub page loads and renders key sections', async ({ page }) => {
    await page.goto('/knowledge-hub');
    
    // Check main title
    await expect(page.locator('h1').first()).toContainText('Knowledge Hub');
    
    // Check that four topic cards are displayed
    const clusterCards = page.locator('a[aria-label*="Explore"], a[aria-label*="Coming Soon"]');
    await expect(clusterCards).toHaveCount(4);
    
    // Check that 'Coming Soon' badges do not exist anymore
    const comingSoonBadges = page.locator('#topics').locator('text=Coming Soon');
    await expect(comingSoonBadges).toHaveCount(0);
    
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
    await expect(articleLinks).toHaveCount(7);

    // Verify quick reference wattage table is present
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('text=Typical (W)')).toBeVisible();

    // Verify sidebar "Free Tool" card is visible (assuming desktop viewport size in tests)
    const sidebarCTA = page.locator('aside a:has-text("Try Free")');
    await expect(sidebarCTA).toBeVisible();
    await expect(sidebarCTA).toHaveAttribute('href', '/');
  });

  test('MCB Sizing cluster index page loads and renders correctly', async ({ page }) => {
    await page.goto('/knowledge-hub/mcb-sizing');

    // Check header title
    await expect(page.locator('h1').first()).toContainText('MCB Sizing');

    // Check Pillar Guide card
    await expect(page.locator('span:has-text("Pillar Guide")')).toBeVisible();

    // Check that upcoming section is present
    await expect(page.locator('text=Upcoming MCB Sizing Guides')).toBeVisible();

    // Verify sidebar "Free Tool" card is visible
    const sidebarCTA = page.locator('aside a:has-text("Start Sizing")');
    await expect(sidebarCTA).toBeVisible();
    await expect(sidebarCTA).toHaveAttribute('href', '/');
  });

  test('Wire Sizing cluster index page loads and renders correctly', async ({ page }) => {
    await page.goto('/knowledge-hub/wire-sizing');

    // Check header title
    await expect(page.locator('h1').first()).toContainText('Wire & Cable Sizing');

    // Check Pillar Guide card
    await expect(page.locator('span:has-text("Pillar Guide")')).toBeVisible();

    // Check that upcoming section is present
    await expect(page.locator('text=Upcoming Wire Sizing Guides')).toBeVisible();

    // Verify sidebar "Free Tool" card is visible
    const sidebarCTA = page.locator('aside a:has-text("Start Sizing")');
    await expect(sidebarCTA).toBeVisible();
    await expect(sidebarCTA).toHaveAttribute('href', '/');
  });

  test('Solar & Inverter cluster index page loads and renders correctly', async ({ page }) => {
    await page.goto('/knowledge-hub/solar-inverter');

    // Check header title
    await expect(page.locator('h1').first()).toContainText('Solar & Inverter');

    // Check Pillar Guide card
    await expect(page.locator('span:has-text("Pillar Guide")')).toBeVisible();

    // Check that upcoming section is present
    await expect(page.locator('text=Upcoming Solar & Inverter Guides')).toBeVisible();

    // Verify sidebar "Free Tool" card is visible
    const sidebarCTA = page.locator('aside a:has-text("Start Sizing")');
    await expect(sidebarCTA).toBeVisible();
    await expect(sidebarCTA).toHaveAttribute('href', '/');
  });

  // Array of all published articles across clusters
  const articles = [
    { cluster: 'load-calculation', slug: 'how-to-calculate-electrical-load-for-a-house', title: 'Load Calculation' },
    { cluster: 'load-calculation', slug: 'electrical-load-chart-for-home-appliances', title: 'Load Calculation' },
    { cluster: 'load-calculation', slug: 'connected-load-vs-demand-load', title: 'Load Calculation' },
    { cluster: 'load-calculation', slug: 'single-phase-vs-three-phase-load', title: 'Load Calculation' },
    { cluster: 'load-calculation', slug: 'how-many-units-of-electricity-does-a-home-use', title: 'Load Calculation' },
    { cluster: 'load-calculation', slug: 'kw-vs-kva-vs-kwh-explained', title: 'Load Calculation' },
    { cluster: 'load-calculation', slug: 'ac-power-consumption-and-load-explained', title: 'Load Calculation' },
    { cluster: 'load-calculation', slug: 'electrical-mistakes-home-builders-regret', title: 'Load Calculation' },
    { cluster: 'mcb-sizing', slug: 'how-to-choose-the-right-mcb-rating', title: 'MCB Sizing' },
    { cluster: 'mcb-sizing', slug: 'why-does-my-mcb-keep-tripping', title: 'MCB Sizing' },
    { cluster: 'wire-sizing', slug: 'how-to-choose-the-right-wire-size', title: 'Wire Sizing' },
    { cluster: 'solar-inverter', slug: 'how-to-size-a-solar-panel-system-for-home', title: 'Solar & Inverter' },
    { cluster: 'solar-inverter', slug: 'how-to-choose-the-right-inverter-capacity', title: 'Solar & Inverter' }
  ];

  for (const article of articles) {
    test(`Article Page [${article.slug}] loads, renders layout, and satisfies SEO standards`, async ({ page }) => {
      await page.goto(`/knowledge-hub/${article.cluster}/${article.slug}`);

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

      // Verify other articles list in sidebar
      await expect(desktopSidebar.locator(`text=More in ${article.title}`)).toBeVisible();

      // Verify main content has at least one of the body CTA blocks (block or inline)
      const bodyCTA = page.locator('main a[href="/"]').filter({ hasText: /Calculator|Sizing/i });
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
    });
  }

});
