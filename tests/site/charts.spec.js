// @ts-check
const {
  test,
  expect
} = require('@playwright/test');

/**
 * Chart Loading Tests
 *
 * These tests verify that charts load correctly and display expected values.
 * Tests check performance chart labels, histogram legends, pie chart legends,
 * and their correspondence with table data.
 */

// Set viewport to XL breakpoint for all tests
test.use({
  viewport: {
    width: 1280,
    height: 720
  }
});

test.describe('Chart data loading [xl]', () => {
  /**
   * Test: Performance chart x-axis labels match main table model names
   * Verifies: Chart labels correspond to models in leaderboard table
   */
  test('performance chart labels match table models [index]', async ({
    page
  }) => {
    await page.goto('/');

    // Wait for table to load
    await page.waitForSelector('tbody tr');

    // Wait for performance chart to load
    await page.waitForSelector('#performance-chart');

    // Get model names from the main table (2nd column)
    const tableModelNames = await page.locator('#leaderboard tbody tr td:nth-child(2)')
      .allTextContents();

    // Clean up whitespace from table data
    const cleanTableNames = tableModelNames.map(name => name.trim());

    // Get x-axis labels from the performance chart using Chart.js API
    const chartLabels = await page.evaluate(() => {
      const canvas = document.getElementById('performance-chart');
      const chart = Chart.getChart(canvas);
      return chart ? chart.data.labels : [];
    });

    // Verify that chart labels match table model names
    expect(chartLabels.length).toBeGreaterThan(0);
    expect(chartLabels).toEqual(cleanTableNames);
  });

  /**
   * Test: Round distribution histogram legend seeds match runs table
   * Verifies: Histogram legend labels correspond to seeds in runs table
   */
  test('histogram legend seeds match runs table [index]', async ({
    page
  }) => {
    await page.goto('/');

    // Wait for main table to load
    await page.waitForSelector('tbody tr');

    // Click first row to expand detail view
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    // Wait for runs table to appear
    await page.waitForSelector('#detail-runs-table tbody tr', {
      timeout: 5000
    });

    // Wait for histogram canvas to appear (using a pattern since ID is dynamic)
    const histogramCanvas = page.locator('canvas[id^="histogram-"]').first();
    await histogramCanvas.waitFor({
      timeout: 5000
    });

    // Get seeds from the runs table (1st column)
    const tableSeeds = await page.locator('#detail-runs-table tbody tr td:first-child')
      .allTextContents();

    // Get unique seeds and sort (matching the chart's behavior)
    const uniqueTableSeeds = [...new Set(tableSeeds.map(s => s.trim()))].sort();

    // Get legend labels from the histogram using Chart.js API
    const histogramCanvasId = await histogramCanvas.getAttribute('id');
    const legendLabels = await page.evaluate((canvasId) => {
      const canvas = document.getElementById(canvasId);
      const chart = Chart.getChart(canvas);
      if (!chart || !chart.data.datasets) return [];
      // Extract dataset labels (each seed is a dataset in the stacked bar chart)
      return chart.data.datasets.map(dataset => dataset.label);
    }, histogramCanvasId);

    // Verify that legend labels match table seeds
    expect(legendLabels.length).toBeGreaterThan(0);
    expect(legendLabels.sort()).toEqual(uniqueTableSeeds);
  });

  /**
   * Test: Provider pie chart legend has at least one member
   * Verifies: Pie chart legend contains provider data
   */
  test('pie chart legend has members [index]', async ({
    page
  }) => {
    await page.goto('/');

    // Wait for main table to load
    await page.waitForSelector('tbody tr');

    // Click first row to expand detail view
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    // Wait for runs table to appear
    await page.waitForSelector('#detail-runs-table tbody tr', {
      timeout: 5000
    });

    // Wait for pie chart canvas to appear (using a pattern since ID is dynamic)
    const pieCanvas = page.locator('canvas[id^="pie-"]').first();
    await pieCanvas.waitFor({
      timeout: 5000
    });

    // Get legend labels from the pie chart using Chart.js API
    const pieCanvasId = await pieCanvas.getAttribute('id');
    const legendLabels = await page.evaluate((canvasId) => {
      const canvas = document.getElementById(canvasId);
      const chart = Chart.getChart(canvas);
      if (!chart || !chart.data.labels) return [];
      return chart.data.labels;
    }, pieCanvasId);

    // Verify that legend has at least one provider
    expect(legendLabels.length).toBeGreaterThan(0);

    // Verify that each label is a non-empty string
    legendLabels.forEach(label => {
      expect(label).toBeTruthy();
      expect(typeof label).toBe('string');
      expect(label.length).toBeGreaterThan(0);
    });
  });

  /**
   * Test: Round distribution histogram legend seeds match runs table (community page)
   * Verifies: Histogram legend labels correspond to seeds in runs table
   */
  test('histogram legend seeds match runs table [community]', async ({
    page
  }) => {
    await page.goto('/community.html');

    // Wait for main table to load
    await page.waitForSelector('tbody tr');

    // Click first row to expand detail view
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    // Wait for runs table to appear
    await page.waitForSelector('#detail-runs-table tbody tr', {
      timeout: 5000
    });

    // Wait for histogram canvas to appear (using a pattern since ID is dynamic)
    const histogramCanvas = page.locator('canvas[id^="histogram-"]').first();
    await histogramCanvas.waitFor({
      timeout: 5000
    });

    // Get seeds from the runs table (1st column)
    const tableSeeds = await page.locator('#detail-runs-table tbody tr td:first-child')
      .allTextContents();

    // Get unique seeds and sort (matching the chart's behavior)
    const uniqueTableSeeds = [...new Set(tableSeeds.map(s => s.trim()))].sort();

    // Get legend labels from the histogram using Chart.js API
    const histogramCanvasId = await histogramCanvas.getAttribute('id');
    const legendLabels = await page.evaluate((canvasId) => {
      const canvas = document.getElementById(canvasId);
      const chart = Chart.getChart(canvas);
      if (!chart || !chart.data.datasets) return [];
      // Extract dataset labels (each seed is a dataset in the stacked bar chart)
      return chart.data.datasets.map(dataset => dataset.label);
    }, histogramCanvasId);

    // Verify that legend labels match table seeds
    expect(legendLabels.length).toBeGreaterThan(0);
    expect(legendLabels.sort()).toEqual(uniqueTableSeeds);
  });

  /**
   * Test: Provider pie chart legend has at least one member (community page)
   * Verifies: Pie chart legend contains provider data
   */
  test('pie chart legend has members [community]', async ({
    page
  }) => {
    await page.goto('/community.html');

    // Wait for main table to load
    await page.waitForSelector('tbody tr');

    // Click first row to expand detail view
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    // Wait for runs table to appear
    await page.waitForSelector('#detail-runs-table tbody tr', {
      timeout: 5000
    });

    // Wait for pie chart canvas to appear (using a pattern since ID is dynamic)
    const pieCanvas = page.locator('canvas[id^="pie-"]').first();
    await pieCanvas.waitFor({
      timeout: 5000
    });

    // Get legend labels from the pie chart using Chart.js API
    const pieCanvasId = await pieCanvas.getAttribute('id');
    const legendLabels = await page.evaluate((canvasId) => {
      const canvas = document.getElementById(canvasId);
      const chart = Chart.getChart(canvas);
      if (!chart || !chart.data.labels) return [];
      return chart.data.labels;
    }, pieCanvasId);

    // Verify that legend has at least one provider
    expect(legendLabels.length).toBeGreaterThan(0);

    // Verify that each label is a non-empty string
    legendLabels.forEach(label => {
      expect(label).toBeTruthy();
      expect(typeof label).toBe('string');
      expect(label.length).toBeGreaterThan(0);
    });
  });
});
