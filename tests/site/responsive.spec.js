// @ts-check
const { test, expect } = require('@playwright/test');
const {
  PAGES,
  VIEWPORTS,
  waitForTableLoaded,
  waitForLayoutStable,
  isColumnVisible,
  isColumnHidden
} = require('./helpers');

/**
 * Responsive Design Tests
 *
 * These tests verify that the application responds correctly to different
 * screen sizes. The site uses Tailwind CSS breakpoints (sm, md, lg, xl)
 * to show/hide content and adjust layouts for optimal mobile and desktop
 * experiences.
 *
 * Tests are organized by BREAKPOINT (viewport size) to make it easy to
 * verify all behaviors at each screen size according to RESPONSIVE_DESIGN.md
 *
 * Breakpoints:
 * - Mobile: < 640px (shows core metrics only)
 * - sm: 640px+ (adds reliability metrics)
 * - md: 768px+ (adds efficiency metrics)
 * - lg: 1024px+ (adds resource metrics)
 * - xl: 1280px+ (adds attribution on main page)
 */

test.describe('Mobile viewport (< 640px)', () => {
  // Parameterized tests for both pages
  for (const [pageName, config] of Object.entries(PAGES)) {
    test(`${pageName} page shows only core columns`, async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto(config.url);
      await waitForTableLoaded(page);

      // Verify core columns are visible
      const rankHeader = page.locator('th:has-text("#")');
      const primaryHeader = page.locator(`th:has-text("${config.primaryColumn}")`);
      const roundHeader = page.locator('th:has-text("Round")');

      await expect(rankHeader).toBeVisible();
      await expect(primaryHeader).toBeVisible();
      await expect(roundHeader).toBeVisible();

      // Verify all other columns are hidden
      expect(await isColumnHidden(page, config.secondaryColumn)).toBe(true);
      expect(await isColumnHidden(page, 'Valid tool calls executable in state')).toBe(true);
      expect(await isColumnHidden(page, 'Valid tool calls not executable in state')).toBe(true);
      expect(await isColumnHidden(page, 'Responses without valid tool calls')).toBe(true);
      expect(await isColumnHidden(page, 'Average input tokens')).toBe(true);
      expect(await isColumnHidden(page, 'Average output tokens')).toBe(true);
      expect(await isColumnHidden(page, 'Average time per tool call')).toBe(true);
      expect(await isColumnHidden(page, 'Average cost per tool call')).toBe(true);
    });

    test(`${pageName} page - expandable rows disabled`, async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto(config.url);
      await waitForTableLoaded(page);

      const firstRow = page.locator('tbody tr').first();
      await firstRow.click();
      await waitForLayoutStable(page);

      const detailRows = page.locator('tr.detail-row');
      const detailRowCount = await detailRows.count();
      expect(detailRowCount).toBe(0);
    });

    test(`${pageName} page - navigation accessible [mobile]`, async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto(config.url);

      const nav = page.locator('nav');
      await expect(nav).toBeVisible();

      // Navigate to the other page
      const targetPage = pageName === 'index' ? 'Community' : 'BalatroBench';
      const targetUrl = pageName === 'index' ? /community\.html/ : /\/$|index\.html/;
      await page.getByRole('link', { name: targetPage }).click();
      await expect(page).toHaveURL(targetUrl);
    });

    test(`${pageName} page - footer visible [mobile]`, async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto(config.url);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
    });
  }

  /**
   * Performance chart visibility (index-specific)
   */
  test('main page - performance chart hidden', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/');
    await waitForTableLoaded(page);

    const chartContainer = page.locator('#performance-chart').locator('..');
    const isVisible = await chartContainer.isVisible();
    expect(isVisible).toBe(false);
  });

  test('community page - no performance chart', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto('/community.html');
    await waitForTableLoaded(page);

    const chartCanvas = page.locator('#performance-chart');
    const count = await chartCanvas.count();
    expect(count).toBe(0);
  });
});

test.describe('sm breakpoint (640px+)', () => {
  for (const [pageName, config] of Object.entries(PAGES)) {
    test(`${pageName} page shows tool call columns`, async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.sm);
      await page.goto(config.url);
      await waitForTableLoaded(page);

      // Tool call columns should now be visible
      expect(await isColumnVisible(page, 'Valid tool calls executable in state')).toBe(true);
      expect(await isColumnVisible(page, 'Valid tool calls not executable in state')).toBe(true);
      expect(await isColumnVisible(page, 'Responses without valid tool calls')).toBe(true);

      // Token and secondary columns should still be hidden
      expect(await isColumnHidden(page, 'Average input tokens')).toBe(true);
      expect(await isColumnHidden(page, 'Average output tokens')).toBe(true);
      expect(await isColumnHidden(page, config.secondaryColumn)).toBe(true);
    });
  }
});

test.describe('md breakpoint (768px+)', () => {
  for (const [pageName, config] of Object.entries(PAGES)) {
    test(`${pageName} page shows time and cost columns`, async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.md);
      await page.goto(config.url);
      await waitForTableLoaded(page);

      // Time and cost columns should now be visible
      expect(await isColumnVisible(page, 'Average time per tool call')).toBe(true);
      expect(await isColumnVisible(page, 'Average cost per tool call')).toBe(true);

      // Tool call columns should still be visible
      expect(await isColumnVisible(page, 'Valid tool calls executable in state')).toBe(true);

      // Token and secondary columns should still be hidden
      expect(await isColumnHidden(page, 'Average input tokens')).toBe(true);
      expect(await isColumnHidden(page, 'Average output tokens')).toBe(true);
      expect(await isColumnHidden(page, config.secondaryColumn)).toBe(true);
    });
  }
});

test.describe('lg breakpoint (1024px+)', () => {
  for (const [pageName, config] of Object.entries(PAGES)) {
    test(`${pageName} page shows token columns`, async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.lg);
      await page.goto(config.url);
      await waitForTableLoaded(page);

      // Token columns should now be visible
      expect(await isColumnVisible(page, 'Average input tokens')).toBe(true);
      expect(await isColumnVisible(page, 'Average output tokens')).toBe(true);

      // All previous columns should still be visible
      expect(await isColumnVisible(page, 'Valid tool calls executable in state')).toBe(true);
      expect(await isColumnVisible(page, 'Average time per tool call')).toBe(true);

      // Secondary column should still be hidden at lg (appears at xl)
      expect(await isColumnHidden(page, config.secondaryColumn)).toBe(true);
    });
  }
});

test.describe('xl breakpoint (1280px+)', () => {
  // Parameterized tests for both pages
  for (const [pageName, config] of Object.entries(PAGES)) {
    test(`${pageName} page shows all columns including secondary`, async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.xl);
      await page.goto(config.url);
      await waitForTableLoaded(page);

      // Secondary column (Vendor/Author) should now be visible
      const secondaryHeader = page.locator(`th:has-text("${config.secondaryColumn}")`);
      await expect(secondaryHeader).toBeVisible();

      // All other columns should still be visible
      expect(await isColumnVisible(page, 'Average input tokens')).toBe(true);
      expect(await isColumnVisible(page, 'Valid tool calls executable in state')).toBe(true);
      expect(await isColumnVisible(page, 'Average time per tool call')).toBe(true);
    });

    test(`${pageName} page - expandable rows work [xl]`, async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.xl);
      await page.goto(config.url);
      await waitForTableLoaded(page);

      await page.locator('tbody tr').first().click();
      await page.waitForSelector('tr.detail-row', { timeout: 5000 });

      const detailRow = page.locator('tr.detail-row').first();
      await expect(detailRow).toBeVisible();
    });

    test(`${pageName} page - navigation accessible [xl]`, async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.xl);
      await page.goto(config.url);

      const nav = page.locator('nav');
      await expect(nav).toBeVisible();

      await page.getByRole('link', { name: 'About' }).click();
      await expect(page).toHaveURL(/about\.html/);
    });

    test(`${pageName} page - footer visible [xl]`, async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.xl);
      await page.goto(config.url);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
    });
  }

  /**
   * Page-specific features
   */
  test('vendor column appears on main page only', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.xl);

    await page.goto('/');
    await waitForTableLoaded(page);
    await expect(page.locator('th:has-text("Vendor")')).toBeVisible();

    await page.goto('/community.html');
    await waitForTableLoaded(page);
    expect(await page.locator('th:has-text("Vendor")').count()).toBe(0);
  });

  test('author column appears on community page only', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.xl);

    await page.goto('/community.html');
    await waitForTableLoaded(page);
    await expect(page.locator('th:has-text("Author")')).toBeVisible();

    await page.goto('/');
    await waitForTableLoaded(page);
    expect(await page.locator('th:has-text("Author")').count()).toBe(0);
  });

  test('performance chart only on main page', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.xl);

    await page.goto('/');
    await waitForTableLoaded(page);
    await expect(page.locator('#performance-chart')).toBeVisible();

    await page.goto('/community.html');
    await waitForTableLoaded(page);
    expect(await page.locator('#performance-chart').count()).toBe(0);
  });
});

/**
 * Cross-breakpoint features
 * These features work consistently across all viewport sizes
 */
test.describe('Cross-breakpoint features', () => {
  const viewportsToTest = [
    { name: 'mobile', viewport: VIEWPORTS.mobile },
    { name: 'desktop', viewport: VIEWPORTS.xl }
  ];

  for (const [pageName, config] of Object.entries(PAGES)) {
    for (const { name: vpName, viewport } of viewportsToTest) {
      test(`${pageName} page - version selector works on ${vpName}`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto(config.url);
        await waitForTableLoaded(page);

        const versionSelector = page.locator('select');
        await expect(versionSelector).toBeVisible();

        if (vpName === 'mobile') {
          const options = versionSelector.locator('option');
          const optionCount = await options.count();
          expect(optionCount).toBeGreaterThan(0);
        }
      });
    }

    test(`${pageName} page - table scrollable on mobile`, async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto(config.url);
      await waitForTableLoaded(page);

      const table = page.locator('table');
      await expect(table).toBeVisible();

      const tableWidth = await table.evaluate(el => el.offsetWidth);
      expect(tableWidth).toBeGreaterThan(0);
    });
  }
});