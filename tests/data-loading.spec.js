// @ts-check
const {
  test,
  expect
} = require('@playwright/test');

/**
 * Data Loading Tests
 *
 * These tests verify that data loads correctly and renders in the tables.
 * We check that the leaderboard tables render with rows and headers,
 * and that the version selector exists and functions.
 *
 * Note: These tests verify structure only, not specific data values.
 */

test.describe('Leaderboard data loading', () => {
  /**
   * Test: Main leaderboard table renders on index page
   * Verifies that the table exists, has headers, and contains data rows
   */
  test('main leaderboard table loads with data', async ({
    page
  }) => {
    // Navigate to the main leaderboard page
    await page.goto('/');

    // Wait for the table to be visible (data should load automatically)
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // Verify table headers exist (checking for key columns)
    await expect(page.locator('thead th:has-text("#")')).toBeVisible();
    await expect(page.locator('thead th:has-text("Model")')).toBeVisible();
    await expect(page.locator('thead th:has-text("Round")')).toBeVisible();

    // Verify that at least one data row exists in the table body
    const tableRows = page.locator('tbody tr');
    await expect(tableRows.first()).toBeVisible();

    // Verify the table has multiple rows (leaderboard should have data)
    const rowCount = await tableRows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  /**
   * Test: Community leaderboard table renders on community page
   * Verifies that the community strategy table loads with appropriate columns
   */
  test('community leaderboard table loads with data', async ({
    page
  }) => {
    // Navigate to the community leaderboard page
    await page.goto('/community.html');

    // Wait for the table to be visible
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // Verify table headers exist (checking for community-specific columns)
    await expect(page.locator('thead th:has-text("#")')).toBeVisible();
    await expect(page.locator('thead th:has-text("Strategy")')).toBeVisible();
    await expect(page.locator('thead th:has-text("Author")')).toBeVisible();

    // Verify that at least one data row exists
    const tableRows = page.locator('tbody tr');
    await expect(tableRows.first()).toBeVisible();

    // Verify the table has data
    const rowCount = await tableRows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  /**
   * Test: Version selector exists and is populated
   * Verifies that the version dropdown is present and contains options
   */
  test('version selector exists on index page', async ({
    page
  }) => {
    // Navigate to the main leaderboard
    await page.goto('/');

    // Wait for the version selector to be visible
    const versionSelector = page.locator('select');
    await expect(versionSelector).toBeVisible();

    // Verify the selector has options (at least one version available)
    const options = versionSelector.locator('option');
    const optionCount = await options.count();
    expect(optionCount).toBeGreaterThan(0);
  });

  test('version selector exists on community page', async ({
    page
  }) => {
    // Navigate to the community page
    await page.goto('/community.html');

    // Wait for the version selector to be visible
    const versionSelector = page.locator('select');
    await expect(versionSelector).toBeVisible();

    // Verify the selector has options
    const options = versionSelector.locator('option');
    const optionCount = await options.count();
    expect(optionCount).toBeGreaterThan(0);
  });

  /**
   * Test: Table data structure is correct
   * Verifies that table rows contain expected data cells
   */
  test('table rows have expected structure on index page', async ({
    page
  }) => {
    // Navigate to the main leaderboard
    await page.goto('/');

    // Wait for table rows to load
    await page.waitForSelector('tbody tr');

    // Get the first row and verify it has cells
    const firstRow = page.locator('tbody tr').first();
    const cells = firstRow.locator('td');

    // Verify the row has multiple cells (rank, model, metrics, etc.)
    const cellCount = await cells.count();
    expect(cellCount).toBeGreaterThan(3);
  });

  test('table rows have expected structure on community page', async ({
    page
  }) => {
    // Navigate to the community page
    await page.goto('/community.html');

    // Wait for table rows to load with extended timeout (community data may take longer)
    await page.waitForSelector('tbody tr', {
      timeout: 15000
    });

    // Verify table has rows
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();

    // Should have at least one row
    expect(rowCount).toBeGreaterThan(0);

    // Verify at least one row has cells (indicates data is present)
    const firstRowCells = rows.first().locator('td');
    const cellCount = await firstRowCells.count();

    // Should have at least one cell (structure may vary)
    expect(cellCount).toBeGreaterThan(0);
  });

  /**
   * Test: Page loading performance
   * Verifies that pages load quickly (static site should be fast)
   */
  test('index page loads within reasonable time', async ({
    page
  }) => {
    // Measure page load time
    const startTime = Date.now();

    await page.goto('/');

    // Wait for the table to be visible
    await page.waitForSelector('table tbody tr');

    const loadTime = Date.now() - startTime;

    // Static site should load quickly (< 5 seconds even with data)
    expect(loadTime).toBeLessThan(5000);
  });

  /**
   * Test: Error handling - verify no console errors
   * Checks that data loading doesn't produce JavaScript errors
   */
  test('no console errors on page load', async ({
    page
  }) => {
    // Collect console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Navigate to the main leaderboard
    await page.goto('/');

    // Wait for table to load
    await page.waitForSelector('table tbody tr');

    // Verify no console errors occurred during load
    expect(errors).toHaveLength(0);
  });
});
