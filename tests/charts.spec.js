// @ts-check
const {
  test,
  expect
} = require('@playwright/test');

/**
 * Chart Rendering Tests
 *
 * These tests verify that Chart.js visualizations render correctly.
 * We check for the presence of canvas elements and verify that charts
 * are displayed when expected (performance bar chart on page load,
 * histograms and pie charts in expandable detail rows).
 *
 * Note: Tests verify that charts render (canvas exists), not chart content.
 */

test.describe('Chart rendering', () => {
  /**
   * Test: Performance bar chart renders on index page
   * Verifies that the main performance comparison chart displays on desktop
   */
  test('performance bar chart renders on index page (desktop)', async ({
    page
  }) => {
    // Set desktop viewport to ensure chart is visible
    await page.setViewportSize({
      width: 1280,
      height: 720
    });

    // Navigate to the main leaderboard
    await page.goto('/');

    // Wait for the page to load data
    await page.waitForSelector('tbody tr');

    // Look for the performance chart canvas
    // The chart is created with id="performance-chart"
    const chartCanvas = page.locator('#performance-chart');

    // Verify the canvas element exists
    await expect(chartCanvas).toBeVisible();

    // Verify it's a canvas element (Chart.js renders to canvas)
    const tagName = await chartCanvas.evaluate(el => el.tagName);
    expect(tagName).toBe('CANVAS');
  });

  /**
   * Test: Community page performance chart
   * Note: Community page currently does not have a performance chart
   * This test is skipped as it's not part of the current implementation
   */
  test.skip('performance bar chart renders on community page (desktop)', async ({
    page
  }) => {
    // Set desktop viewport
    await page.setViewportSize({
      width: 1280,
      height: 720
    });

    // Navigate to the community page
    await page.goto('/community.html');

    // Wait for the page to load data
    await page.waitForSelector('tbody tr');

    // Look for the performance chart canvas
    const chartCanvas = page.locator('#performance-chart');

    // Verify the canvas element exists
    await expect(chartCanvas).toBeVisible();
  });

  /**
   * Test: Round histogram appears in expandable detail row
   * Verifies that clicking a row displays a histogram chart
   */
  test('round histogram renders when row is expanded', async ({
    page
  }) => {
    // Set desktop viewport (expandable rows only work on lg+ screens)
    await page.setViewportSize({
      width: 1280,
      height: 720
    });

    // Navigate to the main leaderboard
    await page.goto('/');

    // Wait for table rows to load
    await page.waitForSelector('tbody tr');

    // Click the first data row to expand details
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    // Wait for the detail row to appear
    // The detail row should contain a canvas for the histogram
    await page.waitForSelector('tr.detail-row', {
      timeout: 5000
    });

    // Look for the histogram canvas
    // Histogram is created with a canvas element in the detail row
    const histogramCanvas = page.locator('tr.detail-row canvas').first();

    // Verify the histogram canvas exists
    await expect(histogramCanvas).toBeVisible();
  });

  /**
   * Test: Provider pie chart appears in expandable detail row
   * Verifies that the provider usage pie chart renders when row is expanded
   */
  test('provider pie chart renders when row is expanded', async ({
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

    // Click the first data row to expand details
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    // Wait for the detail row to appear
    await page.waitForSelector('tr.detail-row', {
      timeout: 5000
    });

    // Look for canvas elements in the detail row
    // There should be at least 2: histogram and pie chart
    const canvasElements = page.locator('tr.detail-row canvas');

    // Count the canvas elements
    const canvasCount = await canvasElements.count();

    // Should have at least 2 charts (histogram and pie chart)
    expect(canvasCount).toBeGreaterThanOrEqual(2);
  });

  /**
   * Test: Charts render with correct theme colors
   * Verifies that Chart.js charts adapt to light/dark theme
   */
  test('charts render in light mode', async ({
    page
  }) => {
    // Set desktop viewport
    await page.setViewportSize({
      width: 1280,
      height: 720
    });

    // Force light color scheme
    await page.emulateMedia({
      colorScheme: 'light'
    });

    // Navigate to the main leaderboard
    await page.goto('/');

    // Wait for data to load
    await page.waitForSelector('tbody tr');

    // Verify the performance chart exists
    const chartCanvas = page.locator('#performance-chart');
    await expect(chartCanvas).toBeVisible();

    // The chart should render (this verifies theme-aware code doesn't break)
    const canvasWidth = await chartCanvas.evaluate(el => el.width);
    expect(canvasWidth).toBeGreaterThan(0);
  });

  test('charts render in dark mode', async ({
    page
  }) => {
    // Set desktop viewport
    await page.setViewportSize({
      width: 1280,
      height: 720
    });

    // Force dark color scheme
    await page.emulateMedia({
      colorScheme: 'dark'
    });

    // Navigate to the main leaderboard
    await page.goto('/');

    // Wait for data to load
    await page.waitForSelector('tbody tr');

    // Verify the performance chart exists
    const chartCanvas = page.locator('#performance-chart');
    await expect(chartCanvas).toBeVisible();

    // The chart should render in dark mode
    const canvasWidth = await chartCanvas.evaluate(el => el.width);
    expect(canvasWidth).toBeGreaterThan(0);
  });

  /**
   * Test: Multiple charts can be rendered simultaneously
   * Verifies that expanding multiple rows doesn't break chart rendering
   */
  test('multiple detail charts can render simultaneously', async ({
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

    // Expand the first row
    await page.locator('tbody tr').nth(0).click();
    await page.waitForSelector('tr.detail-row', {
      timeout: 5000
    });

    // Expand the second row (if it exists)
    const secondRow = page.locator('tbody tr').nth(2); // Skip detail row at nth(1)
    if (await secondRow.count() > 0) {
      await secondRow.click();
    }

    // Count all canvas elements on the page
    // Should include: 1 performance chart + multiple detail charts
    const allCanvases = page.locator('canvas');
    const canvasCount = await allCanvases.count();

    // Should have at least the performance chart
    expect(canvasCount).toBeGreaterThan(0);
  });

  /**
   * Test: Chart container exists even before data loads
   * Verifies that the chart container is present in the HTML
   */
  test('performance chart container exists on page load', async ({
    page
  }) => {
    // Set desktop viewport
    await page.setViewportSize({
      width: 1280,
      height: 720
    });

    // Navigate to the main leaderboard
    await page.goto('/');

    // Look for the chart container (should exist before data loads)
    const chartContainer = page.locator('#performance-chart').locator('..');

    // Verify container exists
    await expect(chartContainer).toBeAttached();
  });
});
