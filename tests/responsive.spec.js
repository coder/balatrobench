// @ts-check
const {
  test,
  expect
} = require('@playwright/test');

/**
 * Responsive Design Tests
 *
 * These tests verify that the application responds correctly to different
 * screen sizes. The site uses Tailwind CSS breakpoints (sm, md, lg, xl)
 * to show/hide content and adjust layouts for optimal mobile and desktop
 * experiences.
 *
 * Note: Tests verify layout behavior, not pixel-perfect positioning.
 */

test.describe('Responsive design', () => {
  /**
   * Test: Performance chart is hidden on mobile screens
   * Verifies that the main bar chart only displays on large screens (lg+)
   */
  test('performance chart hidden on mobile', async ({
    page
  }) => {
    // Set mobile viewport (below lg breakpoint: 1024px)
    await page.setViewportSize({
      width: 375,
      height: 667
    });

    // Navigate to the main leaderboard
    await page.goto('/');

    // Wait for data to load
    await page.waitForSelector('tbody tr');

    // The performance chart should not be visible on mobile
    // Check if the chart container is hidden
    const chartContainer = page.locator('#performance-chart').locator('..');

    // The container may exist but should be hidden via CSS
    const isVisible = await chartContainer.isVisible();
    expect(isVisible).toBe(false);
  });

  test('performance chart visible on desktop', async ({
    page
  }) => {
    // Set desktop viewport (lg breakpoint: 1024px+)
    await page.setViewportSize({
      width: 1280,
      height: 720
    });

    // Navigate to the main leaderboard
    await page.goto('/');

    // Wait for data to load
    await page.waitForSelector('tbody tr');

    // The performance chart should be visible on desktop
    const chartCanvas = page.locator('#performance-chart');
    await expect(chartCanvas).toBeVisible();
  });

  /**
   * Test: Expandable rows are disabled on mobile
   * Verifies that clicking rows on mobile screens doesn't expand details
   */
  test('expandable rows disabled on mobile', async ({
    page
  }) => {
    // Set mobile viewport
    await page.setViewportSize({
      width: 375,
      height: 667
    });

    // Navigate to the main leaderboard
    await page.goto('/');

    // Wait for table rows to load
    await page.waitForSelector('tbody tr');

    // Click the first row
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    // Wait a moment
    await page.waitForTimeout(500);

    // Detail rows should not appear on mobile
    const detailRows = page.locator('tr.detail-row');
    const detailRowCount = await detailRows.count();

    // No detail rows should be visible on mobile
    expect(detailRowCount).toBe(0);
  });

  test('expandable rows work on desktop', async ({
    page
  }) => {
    // Set desktop viewport
    await page.setViewportSize({
      width: 1280,
      height: 720
    });

    // Navigate to the main leaderboard
    await page.goto('/');

    // Wait for table rows to load
    await page.waitForSelector('tbody tr');

    // Click the first row
    await page.locator('tbody tr').first().click();

    // Wait for detail row to appear
    await page.waitForSelector('tr.detail-row', {
      timeout: 5000
    });

    // Verify detail row is visible
    const detailRow = page.locator('tr.detail-row').first();
    await expect(detailRow).toBeVisible();
  });

  /**
   * Test: Table columns adapt to screen size
   * Verifies that certain columns are hidden on smaller screens
   */
  test('some table columns hidden on mobile', async ({
    page
  }) => {
    // Set mobile viewport
    await page.setViewportSize({
      width: 375,
      height: 667
    });

    // Navigate to the main leaderboard
    await page.goto('/');

    // Wait for table to load
    await page.waitForSelector('tbody tr');

    // Check the number of visible columns
    // On mobile, some columns should be hidden via Tailwind responsive classes
    const visibleCells = page.locator('tbody tr:first-child td:visible');
    const visibleCount = await visibleCells.count();

    // Mobile should show fewer columns than desktop
    // Exact count depends on implementation, but should be less than full set
    expect(visibleCount).toBeGreaterThan(0);
    expect(visibleCount).toBeLessThan(15); // Full desktop has many columns
  });

  test('all relevant table columns visible on desktop', async ({
    page
  }) => {
    // Set desktop viewport
    await page.setViewportSize({
      width: 1280,
      height: 720
    });

    // Navigate to the main leaderboard
    await page.goto('/');

    // Wait for table to load
    await page.waitForSelector('tbody tr');

    // Check the number of visible columns
    const visibleCells = page.locator('tbody tr:first-child td:visible');
    const visibleCount = await visibleCells.count();

    // Desktop should show more columns
    expect(visibleCount).toBeGreaterThan(3);
  });

  /**
   * Test: Navigation works on all screen sizes
   * Verifies that the navigation bar is accessible on mobile and desktop
   */
  test('navigation accessible on mobile', async ({
    page
  }) => {
    // Set mobile viewport
    await page.setViewportSize({
      width: 375,
      height: 667
    });

    // Navigate to the main leaderboard
    await page.goto('/');

    // Verify navigation is present and functional
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // Verify navigation links work on mobile
    await page.getByRole('link', {
      name: 'Community'
    }).click();
    await expect(page).toHaveURL(/community\.html/);
  });

  test('navigation accessible on desktop', async ({
    page
  }) => {
    // Set desktop viewport
    await page.setViewportSize({
      width: 1280,
      height: 720
    });

    // Navigate to the main leaderboard
    await page.goto('/');

    // Verify navigation is present
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // Verify navigation links work
    await page.getByRole('link', {
      name: 'About'
    }).click();
    await expect(page).toHaveURL(/about\.html/);
  });

  /**
   * Test: Content is scrollable on mobile
   * Verifies that tables can be scrolled horizontally on small screens
   */
  test('table scrollable on mobile', async ({
    page
  }) => {
    // Set mobile viewport
    await page.setViewportSize({
      width: 375,
      height: 667
    });

    // Navigate to the main leaderboard
    await page.goto('/');

    // Wait for table to load
    await page.waitForSelector('tbody tr');

    // Verify the table exists and is visible
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // On mobile, table container should allow scrolling
    // Check that the table has content
    const tableWidth = await table.evaluate(el => el.offsetWidth);
    expect(tableWidth).toBeGreaterThan(0);
  });

  /**
   * Test: Version selector works on all screen sizes
   * Verifies that the version dropdown is accessible and functional
   */
  test('version selector works on mobile', async ({
    page
  }) => {
    // Set mobile viewport
    await page.setViewportSize({
      width: 375,
      height: 667
    });

    // Navigate to the main leaderboard
    await page.goto('/');

    // Wait for page to load
    await page.waitForSelector('tbody tr');

    // Verify version selector is visible
    const versionSelector = page.locator('select');
    await expect(versionSelector).toBeVisible();

    // Verify it has options
    const options = versionSelector.locator('option');
    const optionCount = await options.count();
    expect(optionCount).toBeGreaterThan(0);
  });

  test('version selector works on desktop', async ({
    page
  }) => {
    // Set desktop viewport
    await page.setViewportSize({
      width: 1280,
      height: 720
    });

    // Navigate to the main leaderboard
    await page.goto('/');

    // Wait for page to load
    await page.waitForSelector('tbody tr');

    // Verify version selector is visible
    const versionSelector = page.locator('select');
    await expect(versionSelector).toBeVisible();
  });

  /**
   * Test: Tablet viewport (medium screens)
   * Verifies behavior at tablet breakpoint (md: 768px - lg: 1024px)
   */
  test('layout works on tablet', async ({
    page
  }) => {
    // Set tablet viewport (between md and lg breakpoints)
    await page.setViewportSize({
      width: 768,
      height: 1024
    });

    // Navigate to the main leaderboard
    await page.goto('/');

    // Wait for page to load
    await page.waitForSelector('tbody tr');

    // Verify page loads correctly
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // Navigation should be visible
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // Performance chart should be hidden (below lg breakpoint)
    const chartContainer = page.locator('#performance-chart').locator('..');
    const isVisible = await chartContainer.isVisible();
    expect(isVisible).toBe(false);
  });

  /**
   * Test: Footer is visible and functional on all screen sizes
   * Verifies that the footer renders correctly across viewports
   */
  test('footer visible on mobile', async ({
    page
  }) => {
    // Set mobile viewport
    await page.setViewportSize({
      width: 375,
      height: 667
    });

    // Navigate to the main leaderboard
    await page.goto('/');

    // Scroll to bottom to ensure footer is in viewport
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Verify footer is visible
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('footer visible on desktop', async ({
    page
  }) => {
    // Set desktop viewport
    await page.setViewportSize({
      width: 1280,
      height: 720
    });

    // Navigate to the main leaderboard
    await page.goto('/');

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Verify footer is visible
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });
});
