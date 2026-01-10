// @ts-check
const { test, expect } = require('@playwright/test');
const {
  PAGES,
  DEFAULT_VIEWPORT,
  waitForTableLoaded,
  waitForDetailTable,
  waitForChart,
  getChartData
} = require('./helpers');

/**
 * Chart Loading Tests
 *
 * These tests verify that charts load correctly and display expected values.
 * Tests check performance chart labels, histogram legends, pie chart legends,
 * and their correspondence with table data.
 *
 * All tests run at XL viewport (1280x720) where all columns and charts are visible.
 */

test.use({ viewport: DEFAULT_VIEWPORT });

test.describe('Chart data loading [xl]', () => {
  /**
   * Test: Performance chart x-axis labels match main table model names (index only)
   * Note: Community page doesn't have a performance chart
   */
  test('performance chart labels match table models [index]', async ({ page }) => {
    await page.goto('/');
    await waitForTableLoaded(page);
    await page.waitForSelector('#performance-chart');

    // Get model names from the main table (2nd column)
    const tableModelNames = await page.locator('#leaderboard tbody tr td:nth-child(2)')
      .allTextContents();
    const cleanTableNames = tableModelNames.map(name => name.trim());

    // Get x-axis labels from the performance chart
    const chartData = await getChartData(page, 'performance-chart');

    expect(chartData.labels.length).toBeGreaterThan(0);
    expect(chartData.labels).toEqual(cleanTableNames);
  });

  // Parameterized tests for both index and community pages
  for (const [pageName, config] of Object.entries(PAGES)) {
    /**
     * Test: Round distribution histogram legend seeds match runs table
     * Verifies: Histogram legend labels correspond to seeds in runs table
     */
    test(`histogram legend seeds match runs table [${pageName}]`, async ({ page }) => {
      await page.goto(config.url);
      await waitForTableLoaded(page);

      // Click first row to expand detail view
      const firstRow = page.locator('tbody tr').first();
      await firstRow.click();
      await waitForDetailTable(page);

      // Wait for histogram canvas
      const histogramCanvas = await waitForChart(page, 'canvas[id^="histogram-"]');

      // Get seeds from the runs table (1st column)
      const tableSeeds = await page.locator('#detail-runs-table tbody tr td:first-child')
        .allTextContents();
      const uniqueTableSeeds = [...new Set(tableSeeds.map(s => s.trim()))].sort();

      // Get legend labels from the histogram
      const histogramCanvasId = await histogramCanvas.getAttribute('id');
      const legendLabels = await page.evaluate((canvasId) => {
        const canvas = document.getElementById(canvasId);
        // @ts-ignore - Chart is a global from Chart.js
        const chart = Chart.getChart(canvas);
        if (!chart || !chart.data.datasets) return [];
        return chart.data.datasets.map(dataset => dataset.label);
      }, histogramCanvasId);

      expect(legendLabels.length).toBeGreaterThan(0);
      expect(legendLabels.sort()).toEqual(uniqueTableSeeds);
    });

    /**
     * Test: Provider pie chart legend has at least one member
     * Verifies: Pie chart legend contains provider data
     */
    test(`pie chart legend has members [${pageName}]`, async ({ page }) => {
      await page.goto(config.url);
      await waitForTableLoaded(page);

      // Click first row to expand detail view
      const firstRow = page.locator('tbody tr').first();
      await firstRow.click();
      await waitForDetailTable(page);

      // Wait for pie chart canvas
      const pieCanvas = await waitForChart(page, 'canvas[id^="pie-"]');

      // Get legend labels from the pie chart
      const pieCanvasId = await pieCanvas.getAttribute('id');
      const legendLabels = await page.evaluate((canvasId) => {
        const canvas = document.getElementById(canvasId);
        // @ts-ignore - Chart is a global from Chart.js
        const chart = Chart.getChart(canvas);
        if (!chart || !chart.data.labels) return [];
        return chart.data.labels;
      }, pieCanvasId);

      expect(legendLabels.length).toBeGreaterThan(0);
      legendLabels.forEach(label => {
        expect(label).toBeTruthy();
        expect(typeof label).toBe('string');
        expect(label.length).toBeGreaterThan(0);
      });
    });
  }
});