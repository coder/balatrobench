// @ts-check
const { test, expect } = require('@playwright/test');
const {
  PAGES,
  DEFAULT_VIEWPORT,
  waitForTableLoaded,
  waitForDetailTable,
  DATA_PATTERNS,
  normalizeWhitespace
} = require('./helpers');

/**
 * Data Loading Tests
 *
 * These tests verify that data loads correctly and displays expected values.
 * Tests check table structure, cell content, expandable rows, runs tables,
 * and total statistics.
 *
 * All tests run at XL viewport (1280x720) where all columns are visible.
 */

test.use({ viewport: DEFAULT_VIEWPORT });

test.describe('Leaderboard data loading [xl]', () => {
  /**
   * Parameterized tests for both index and community pages
   */
  for (const [pageName, config] of Object.entries(PAGES)) {
    /**
     * Test: Leaderboard table first row contains expected columns
     * Verifies: #, model/strategy, vendor/author, round, tool calls, tokens ±, time ±, price ±
     */
    test(`first row contains all expected values [${pageName}]`, async ({ page }) => {
      await page.goto(config.url);
      await waitForTableLoaded(page);

      const firstRow = page.locator('tbody tr').first();
      const cells = firstRow.locator('td');

      // Get cell contents
      const rank = await cells.nth(0).textContent();
      const primary = await cells.nth(1).textContent();  // model or strategy
      const secondary = await cells.nth(2).textContent(); // vendor or author
      const round = await cells.nth(3).textContent();
      const successPct = await cells.nth(4).textContent();
      const warningPct = await cells.nth(5).textContent();
      const errorPct = await cells.nth(6).textContent();
      const inTokens = await cells.nth(7).textContent();
      const outTokens = await cells.nth(8).textContent();
      const time = await cells.nth(9).textContent();
      const price = await cells.nth(10).textContent();

      // Validate rank is a number
      expect(rank?.trim()).toMatch(DATA_PATTERNS.rank);

      // Validate primary column (model/strategy) is non-empty
      expect(primary?.trim()).toBeTruthy();
      expect(primary?.trim().length).toBeGreaterThan(0);

      // Validate secondary column (vendor/author) is non-empty
      expect(secondary?.trim()).toBeTruthy();
      expect(secondary?.trim().length).toBeGreaterThan(0);

      // Validate round has ± pattern
      expect(normalizeWhitespace(round)).toMatch(DATA_PATTERNS.valueWithStdDev);

      // Validate tool calls (3 percentage columns)
      expect(successPct?.trim()).toMatch(DATA_PATTERNS.percentage);
      expect(warningPct?.trim()).toMatch(DATA_PATTERNS.percentage);
      expect(errorPct?.trim()).toMatch(DATA_PATTERNS.percentage);

      // Validate tokens (in/out) have ± pattern
      expect(normalizeWhitespace(inTokens)).toMatch(DATA_PATTERNS.valueWithStdDev);
      expect(normalizeWhitespace(outTokens)).toMatch(DATA_PATTERNS.valueWithStdDev);

      // Validate time has ± pattern
      expect(normalizeWhitespace(time)).toMatch(DATA_PATTERNS.valueWithStdDev);

      // Validate price has ± pattern
      expect(normalizeWhitespace(price)).toMatch(DATA_PATTERNS.valueWithStdDev);
    });

    /**
     * Test: Runs table appears after clicking first row
     * Verifies: seed, round, success%, failed%, error%, tokens ±, time ±, price ±
     */
    test(`runs table first row contains expected values [${pageName}]`, async ({ page }) => {
      await page.goto(config.url);
      await waitForTableLoaded(page);

      // Click first row to expand
      await page.locator('tbody tr').first().click();
      await waitForDetailTable(page);

      // Get the first row of the runs table
      const runsFirstRow = page.locator('#detail-runs-table tbody tr').first();
      const cells = runsFirstRow.locator('td');

      // Get cell contents
      const seed = await cells.nth(0).textContent();
      const round = await cells.nth(1).textContent();
      const successPct = await cells.nth(2).textContent();
      const failedPct = await cells.nth(3).textContent();
      const errorPct = await cells.nth(4).textContent();
      const inTokens = await cells.nth(5).textContent();
      const outTokens = await cells.nth(6).textContent();
      const time = await cells.nth(7).textContent();
      const price = await cells.nth(8).textContent();

      // Validate seed is 7-character pattern
      expect(seed?.trim()).toMatch(DATA_PATTERNS.seed);

      // Validate round is a number
      expect(round?.trim()).toMatch(DATA_PATTERNS.rank);

      // Validate tool calls (3 percentage columns)
      expect(successPct?.trim()).toMatch(DATA_PATTERNS.percentage);
      expect(failedPct?.trim()).toMatch(DATA_PATTERNS.percentage);
      expect(errorPct?.trim()).toMatch(DATA_PATTERNS.percentage);

      // Validate tokens (in/out) have ± pattern
      expect(normalizeWhitespace(inTokens)).toMatch(DATA_PATTERNS.valueWithStdDev);
      expect(normalizeWhitespace(outTokens)).toMatch(DATA_PATTERNS.valueWithStdDev);

      // Validate time has ± pattern
      expect(normalizeWhitespace(time)).toMatch(DATA_PATTERNS.valueWithStdDev);

      // Validate price has ± pattern
      expect(normalizeWhitespace(price)).toMatch(DATA_PATTERNS.valueWithStdDev);
    });

    /**
     * Test: Total stats section
     * Verifies: in/out tokens, total price, time
     */
    test(`total stats contains expected values [${pageName}]`, async ({ page }) => {
      await page.goto(config.url);
      await waitForTableLoaded(page);

      // Click first row to expand
      await page.locator('tbody tr').first().click();

      // Wait for Totals heading to appear
      await page.getByRole('heading', { name: 'Totals' }).waitFor({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: 'Totals' })).toBeVisible();

      // Verify each total stat row
      const inputTokens = page.locator('#total-input-tokens');
      await expect(inputTokens).toBeVisible();
      await expect(inputTokens).toContainText('in');
      await expect(inputTokens).toContainText(/[\d.]+\s*M/);

      const outputTokens = page.locator('#total-output-tokens');
      await expect(outputTokens).toBeVisible();
      await expect(outputTokens).toContainText('out');
      await expect(outputTokens).toContainText(/[\d.]+\s*M/);

      const totalPrice = page.locator('#total-total-price');
      await expect(totalPrice).toBeVisible();
      await expect(totalPrice).toContainText('total');
      await expect(totalPrice).toContainText(/[\d.]+\s*\$/);

      const time = page.locator('#total-time');
      await expect(time).toBeVisible();
      await expect(time).toContainText('time');
      await expect(time).toContainText(/[\d]+\s*s/);
    });
  }

  /**
   * Test: Gamestate view (index page only)
   * Note: Community (strategies) view doesn't generate request-level files,
   * so the run viewer won't open. Only index page has this test.
   * Verifies: header format, strategy/gamestate/memory/reasoning content length,
   * tool call not empty, screenshot loaded
   */
  test('gamestate view contains expected values [index]', async ({ page }) => {
    await page.goto('/');
    await waitForTableLoaded(page);

    // Click first row to expand
    await page.locator('tbody tr').first().click();
    await waitForDetailTable(page);

    // Click first row in runs table to open gamestate view
    await page.locator('#detail-runs-table tbody tr').first().click();

    // Wait for gamestate modal to appear
    await page.waitForSelector('#run-title', { timeout: 5000 });

    // Get header text
    const header = await page.locator('#run-title').textContent();

    // Validate header format: model • seed • Run X/Y • Request X/Y • in/out X/Y • $ in/out X.X/X.X
    expect(header?.trim()).toMatch(
      /^.+\s*•\s*[A-Z]{7}\s*•\s*Run\s+\d+\/\d+\s*•\s*Request\s+\d+\/\d+\s*•\s*in\/out\s+\d+\/\d+\s*•\s*\$\s*in\/out\s+[\d.]+\/[\d.]+$/
    );

    // Validate content length for each section
    const strategy = await page.locator('#run-strategy').textContent();
    const gamestate = await page.locator('#run-gamestate').textContent();
    const memory = await page.locator('#run-memory').textContent();
    const reasoning = await page.locator('#run-reasoning').textContent();
    const toolCall = await page.locator('#run-tool-call').textContent();

    expect(strategy?.trim().length).toBeGreaterThan(80);
    expect(gamestate?.trim().length).toBeGreaterThan(80);
    expect(memory?.trim().length).toBeGreaterThan(80);
    expect(reasoning?.trim().length).toBeGreaterThan(80);
    expect(toolCall?.trim().length).toBeGreaterThan(0);

    // Validate screenshot is loaded
    await expect(page.locator('#run-screenshot')).toHaveAttribute('src', /.+/);
  });

  /**
   * Skipped: Community page doesn't generate request-level files
   */
  test.skip('gamestate view contains expected values [community]', async ({ page }) => {
    // Community (strategies) view doesn't generate request-level files,
    // so the run viewer won't open.
  });
});