// @ts-check
const {
  test,
  expect
} = require('@playwright/test');

/**
 * Data Loading Tests
 *
 * These tests verify that data loads correctly and displays expected values.
 * Tests check table structure, cell content, expandable rows, runs tables,
 * and total statistics.
 */

// Set viewport to XL breakpoint for all tests
test.use({
  viewport: {
    width: 1280,
    height: 720
  }
});

test.describe('Leaderboard data loading [xl]', () => {
  /**
   * Test: Main leaderboard table first row contains expected columns
   * Verifies: #, model, vendor, round, tool calls, tokens ±, time ±, price ±
   */
  test('first row contains all expected values [index]', async ({
    page
  }) => {
    await page.goto('/');

    // Wait for table to load
    await page.waitForSelector('tbody tr');

    const firstRow = page.locator('tbody tr').first();
    const cells = firstRow.locator('td');

    // Get cell contents
    const rank = await cells.nth(0).textContent();
    const model = await cells.nth(1).textContent();
    const vendor = await cells.nth(2).textContent();
    const round = await cells.nth(3).textContent();
    const successPct = await cells.nth(4).textContent();
    const warningPct = await cells.nth(5).textContent();
    const errorPct = await cells.nth(6).textContent();
    const inTokens = await cells.nth(7).textContent();
    const outTokens = await cells.nth(8).textContent();
    const time = await cells.nth(9).textContent();
    const price = await cells.nth(10).textContent();

    // Validate rank is a number
    expect(rank?.trim()).toMatch(/^\d+$/);

    // Validate model is non-empty text
    expect(model?.trim()).toBeTruthy();
    expect(model?.trim().length).toBeGreaterThan(0);

    // Validate vendor is non-empty text
    expect(vendor?.trim()).toBeTruthy();
    expect(vendor?.trim().length).toBeGreaterThan(0);

    // Validate round has ± pattern
    expect(round?.replace(/\s+/g, ' ').trim()).toMatch(/^[\d.]+\s*±\s*[\d.]+$/);

    // Validate tool calls (3 percentage columns)
    expect(successPct?.trim()).toMatch(/^\d+%$/);
    expect(warningPct?.trim()).toMatch(/^\d+%$/);
    expect(errorPct?.trim()).toMatch(/^\d+%$/);

    // Validate tokens (in/out) have ± pattern (normalize whitespace including newlines)
    expect(inTokens?.replace(/\s+/g, ' ').trim()).toMatch(/^[\d.]+\s*±\s*[\d.]+$/);
    expect(outTokens?.replace(/\s+/g, ' ').trim()).toMatch(/^[\d.]+\s*±\s*[\d.]+$/);

    // Validate time has ± pattern (normalize whitespace including newlines)
    expect(time?.replace(/\s+/g, ' ').trim()).toMatch(/^[\d.]+\s*±\s*[\d.]+$/);

    // Validate price has ± pattern (normalize whitespace including newlines)
    expect(price?.replace(/\s+/g, ' ').trim()).toMatch(/^[\d.]+\s*±\s*[\d.]+$/);
  });

  /**
   * Test: Community leaderboard table first row contains expected columns
   * Verifies: #, strategy, author, round, tool calls, tokens ±, time ±, price ±
   */
  test('first row contains all expected values [community]', async ({
    page
  }) => {
    await page.goto('/community.html');

    // Wait for table to load
    await page.waitForSelector('tbody tr');

    const firstRow = page.locator('tbody tr').first();
    const cells = firstRow.locator('td');

    // Get cell contents
    const rank = await cells.nth(0).textContent();
    const strategy = await cells.nth(1).textContent();
    const author = await cells.nth(2).textContent();
    const round = await cells.nth(3).textContent();
    const successPct = await cells.nth(4).textContent();
    const warningPct = await cells.nth(5).textContent();
    const errorPct = await cells.nth(6).textContent();
    const inTokens = await cells.nth(7).textContent();
    const outTokens = await cells.nth(8).textContent();
    const time = await cells.nth(9).textContent();
    const price = await cells.nth(10).textContent();

    // Validate rank is a number
    expect(rank?.trim()).toMatch(/^\d+$/);

    // Validate strategy is non-empty text
    expect(strategy?.trim()).toBeTruthy();
    expect(strategy?.trim().length).toBeGreaterThan(0);

    // Validate author is non-empty text
    expect(author?.trim()).toBeTruthy();
    expect(author?.trim().length).toBeGreaterThan(0);

    // Validate round has ± pattern
    expect(round?.replace(/\s+/g, ' ').trim()).toMatch(/^[\d.]+\s*±\s*[\d.]+$/);

    // Validate tool calls (3 percentage columns)
    expect(successPct?.trim()).toMatch(/^\d+%$/);
    expect(warningPct?.trim()).toMatch(/^\d+%$/);
    expect(errorPct?.trim()).toMatch(/^\d+%$/);

    // Validate tokens (in/out) have ± pattern (normalize whitespace including newlines)
    expect(inTokens?.replace(/\s+/g, ' ').trim()).toMatch(/^[\d.]+\s*±\s*[\d.]+$/);
    expect(outTokens?.replace(/\s+/g, ' ').trim()).toMatch(/^[\d.]+\s*±\s*[\d.]+$/);

    // Validate time has ± pattern (normalize whitespace including newlines)
    expect(time?.replace(/\s+/g, ' ').trim()).toMatch(/^[\d.]+\s*±\s*[\d.]+$/);

    // Validate price has ± pattern (normalize whitespace including newlines)
    expect(price?.replace(/\s+/g, ' ').trim()).toMatch(/^[\d.]+\s*±\s*[\d.]+$/);
  });

  /**
   * Test: Runs table appears after clicking first row on index page
   * Verifies first row contains: seed, round, success%, failed%, error%, in tokens ±, out tokens ±, time ±, price ±
   */
  test('runs table first row contains expected values [index]', async ({
    page
  }) => {
    await page.goto('/');

    // Wait for main table to load
    await page.waitForSelector('tbody tr');

    // Click first row to expand
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    // Wait for runs table to appear
    await page.waitForSelector('#detail-runs-table tbody tr', {
      timeout: 5000
    });

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

    // Validate seed is a repeated letter pattern (e.g., "AAAAAA", "BBBBBB")
    expect(seed?.trim()).toMatch(/^[A-Z]{7}$/);

    // Validate round is a number
    expect(round?.trim()).toMatch(/^\d+$/);

    // Validate tool calls (3 percentage columns)
    expect(successPct?.trim()).toMatch(/^\d+%$/);
    expect(failedPct?.trim()).toMatch(/^\d+%$/);
    expect(errorPct?.trim()).toMatch(/^\d+%$/);

    // Validate tokens (in/out) have ± pattern (normalize whitespace including newlines)
    expect(inTokens?.replace(/\s+/g, ' ').trim()).toMatch(/^[\d.]+\s*±\s*[\d.]+$/);
    expect(outTokens?.replace(/\s+/g, ' ').trim()).toMatch(/^[\d.]+\s*±\s*[\d.]+$/);

    // Validate time has ± pattern (normalize whitespace including newlines)
    expect(time?.replace(/\s+/g, ' ').trim()).toMatch(/^[\d.]+\s*±\s*[\d.]+$/);

    // Validate price has ± pattern (normalize whitespace including newlines)
    expect(price?.replace(/\s+/g, ' ').trim()).toMatch(/^[\d.]+\s*±\s*[\d.]+$/);
  });

  /**
   * Test: Runs table appears after clicking first row on community page
   * Verifies first row contains: seed, round, success%, failed%, error%, in tokens ±, out tokens ±, time ±, price ±
   */
  test('runs table first row contains expected values [community]', async ({
    page
  }) => {
    await page.goto('/community.html');

    // Wait for main table to load
    await page.waitForSelector('tbody tr');

    // Click first row to expand
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    // Wait for runs table to appear
    await page.waitForSelector('#detail-runs-table tbody tr', {
      timeout: 5000
    });

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

    // Validate seed is a repeated letter pattern (e.g., "AAAAAA", "BBBBBB")
    expect(seed?.trim()).toMatch(/^[A-Z]{7}$/);

    // Validate round is a number
    expect(round?.trim()).toMatch(/^\d+$/);

    // Validate tool calls (3 percentage columns)
    expect(successPct?.trim()).toMatch(/^\d+%$/);
    expect(failedPct?.trim()).toMatch(/^\d+%$/);
    expect(errorPct?.trim()).toMatch(/^\d+%$/);

    // Validate tokens (in/out) have ± pattern (normalize whitespace including newlines)
    expect(inTokens?.replace(/\s+/g, ' ').trim()).toMatch(/^[\d.]+\s*±\s*[\d.]+$/);
    expect(outTokens?.replace(/\s+/g, ' ').trim()).toMatch(/^[\d.]+\s*±\s*[\d.]+$/);

    // Validate time has ± pattern (normalize whitespace including newlines)
    expect(time?.replace(/\s+/g, ' ').trim()).toMatch(/^[\d.]+\s*±\s*[\d.]+$/);

    // Validate price has ± pattern (normalize whitespace including newlines)
    expect(price?.replace(/\s+/g, ' ').trim()).toMatch(/^[\d.]+\s*±\s*[\d.]+$/);
  });

  /**
   * Test: Total stats section on index page
   * Verifies: in/out tokens, in/out/total price, time
   */
  test('total stats contains expected values [index]', async ({
    page
  }) => {
    await page.goto('/');

    // Wait for main table to load
    await page.waitForSelector('tbody tr');

    // Click first row to expand
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    // Wait for Totals heading to appear
    await page.getByRole('heading', {
      name: 'Totals'
    }).waitFor({
      timeout: 5000
    });

    // Find the totals section
    const totalsHeading = page.getByRole('heading', {
      name: 'Totals'
    });
    await expect(totalsHeading).toBeVisible();

    // Verify each total stat row individually using IDs
    const inputTokens = page.locator('#total-input-tokens');
    await expect(inputTokens).toBeVisible();
    await expect(inputTokens).toContainText('in');
    await expect(inputTokens).toContainText(/[\d.]+\s*M/);

    const outputTokens = page.locator('#total-output-tokens');
    await expect(outputTokens).toBeVisible();
    await expect(outputTokens).toContainText('out');
    await expect(outputTokens).toContainText(/[\d.]+\s*M/);

    const inputPrice = page.locator('#total-input-price');
    await expect(inputPrice).toBeVisible();
    await expect(inputPrice).toContainText('in');
    await expect(inputPrice).toContainText(/[\d.]+\s*\$/);

    const outputPrice = page.locator('#total-output-price');
    await expect(outputPrice).toBeVisible();
    await expect(outputPrice).toContainText('out');
    await expect(outputPrice).toContainText(/[\d.]+\s*\$/);

    const totalPrice = page.locator('#total-total-price');
    await expect(totalPrice).toBeVisible();
    await expect(totalPrice).toContainText('total');
    await expect(totalPrice).toContainText(/[\d.]+\s*\$/);

    const time = page.locator('#total-time');
    await expect(time).toBeVisible();
    await expect(time).toContainText('time');
    await expect(time).toContainText(/[\d]+\s*s/);
  });

  /**
   * Test: Total stats section on community page
   * Verifies: in/out tokens, in/out/total price, time
   */
  test('total stats contains expected values [community]', async ({
    page
  }) => {
    await page.goto('/community.html');

    // Wait for main table to load
    await page.waitForSelector('tbody tr');

    // Click first row to expand
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    // Wait for Totals heading to appear
    await page.getByRole('heading', {
      name: 'Totals'
    }).waitFor({
      timeout: 5000
    });

    // Find the totals section
    const totalsHeading = page.getByRole('heading', {
      name: 'Totals'
    });
    await expect(totalsHeading).toBeVisible();

    // Verify each total stat row individually using IDs
    const inputTokens = page.locator('#total-input-tokens');
    await expect(inputTokens).toBeVisible();
    await expect(inputTokens).toContainText('in');
    await expect(inputTokens).toContainText(/[\d.]+\s*M/);

    const outputTokens = page.locator('#total-output-tokens');
    await expect(outputTokens).toBeVisible();
    await expect(outputTokens).toContainText('out');
    await expect(outputTokens).toContainText(/[\d.]+\s*M/);

    const inputPrice = page.locator('#total-input-price');
    await expect(inputPrice).toBeVisible();
    await expect(inputPrice).toContainText('in');
    await expect(inputPrice).toContainText(/[\d.]+\s*\$/);

    const outputPrice = page.locator('#total-output-price');
    await expect(outputPrice).toBeVisible();
    await expect(outputPrice).toContainText('out');
    await expect(outputPrice).toContainText(/[\d.]+\s*\$/);

    const totalPrice = page.locator('#total-total-price');
    await expect(totalPrice).toBeVisible();
    await expect(totalPrice).toContainText('total');
    await expect(totalPrice).toContainText(/[\d.]+\s*\$/);

    const time = page.locator('#total-time');
    await expect(time).toBeVisible();
    await expect(time).toContainText('time');
    await expect(time).toContainText(/[\d]+\s*s/);
  });

  /**
   * Test: Gamestate view on index page
   * Verifies: header format, strategy/gamestate/memory/reasoning content length,
   * tool call not empty, screenshot loaded
   */
  test('gamestate view contains expected values [index]', async ({
    page
  }) => {
    await page.goto('/');

    // Wait for main table to load
    await page.waitForSelector('tbody tr');

    // Click first row to expand
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    // Wait for runs table to appear
    await page.waitForSelector('#detail-runs-table tbody tr', {
      timeout: 5000
    });

    // Click first row in runs table to open gamestate view
    const runsFirstRow = page.locator('#detail-runs-table tbody tr').first();
    await runsFirstRow.click();

    // Wait for gamestate modal to appear
    await page.waitForSelector('#run-title', {
      timeout: 5000
    });

    // Get header text
    const header = await page.locator('#run-title').textContent();

    // Validate header format: model • seed • Run X/Y • Request X/Y • in/out X/Y • $ in/out X.X/X.X
    expect(header?.trim()).toMatch(
      /^.+\s*•\s*[A-Z]{7}\s*•\s*Run\s+\d+\/\d+\s*•\s*Request\s+\d+\/\d+\s*•\s*in\/out\s+\d+\/\d+\s*•\s*\$\s*in\/out\s+[\d.]+\/[\d.]+$/
    );

    // Get text content from each section
    const strategy = await page.locator('#run-strategy').textContent();
    const gamestate = await page.locator('#run-gamestate').textContent();
    const memory = await page.locator('#run-memory').textContent();
    const reasoning = await page.locator('#run-reasoning').textContent();
    const toolCall = await page.locator('#run-tool-call').textContent();

    // Validate strategy has text length > 80 chars
    expect(strategy?.trim().length).toBeGreaterThan(80);

    // Validate gamestate has text length > 80 chars
    expect(gamestate?.trim().length).toBeGreaterThan(80);

    // Validate memory has text length > 80 chars
    expect(memory?.trim().length).toBeGreaterThan(80);

    // Validate reasoning has text length > 80 chars
    expect(reasoning?.trim().length).toBeGreaterThan(80);

    // Validate tool call is not empty
    expect(toolCall?.trim().length).toBeGreaterThan(0);

    // Validate screenshot is loaded (has src attribute)
    const screenshot = page.locator('#run-screenshot');
    await expect(screenshot).toHaveAttribute('src', /.+/);
  });

  /**
   * Test: Gamestate view on community page
   * Verifies: header format, strategy/gamestate/memory/reasoning content length,
   * tool call not empty, screenshot loaded
   */
  test('gamestate view contains expected values [community]', async ({
    page
  }) => {
    await page.goto('/community.html');

    // Wait for main table to load
    await page.waitForSelector('tbody tr');

    // Click first row to expand
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    // Wait for runs table to appear
    await page.waitForSelector('#detail-runs-table tbody tr', {
      timeout: 5000
    });

    // Click first row in runs table to open gamestate view
    const runsFirstRow = page.locator('#detail-runs-table tbody tr').first();
    await runsFirstRow.click();

    // Wait for gamestate modal to appear
    await page.waitForSelector('#run-title', {
      timeout: 5000
    });

    // Get header text
    const header = await page.locator('#run-title').textContent();

    // Validate header format: model • seed • Run X/Y • Request X/Y • in/out X/Y • $ in/out X.X/X.X
    expect(header?.trim()).toMatch(
      /^.+\s*•\s*[A-Z]{7}\s*•\s*Run\s+\d+\/\d+\s*•\s*Request\s+\d+\/\d+\s*•\s*in\/out\s+\d+\/\d+\s*•\s*\$\s*in\/out\s+[\d.]+\/[\d.]+$/
    );

    // Get text content from each section
    const strategy = await page.locator('#run-strategy').textContent();
    const gamestate = await page.locator('#run-gamestate').textContent();
    const memory = await page.locator('#run-memory').textContent();
    const reasoning = await page.locator('#run-reasoning').textContent();
    const toolCall = await page.locator('#run-tool-call').textContent();

    // Validate strategy has text length > 80 chars
    expect(strategy?.trim().length).toBeGreaterThan(80);

    // Validate gamestate has text length > 80 chars
    expect(gamestate?.trim().length).toBeGreaterThan(80);

    // Validate memory has text length > 80 chars
    expect(memory?.trim().length).toBeGreaterThan(80);

    // Validate reasoning has text length > 80 chars
    expect(reasoning?.trim().length).toBeGreaterThan(80);

    // Validate tool call is not empty
    expect(toolCall?.trim().length).toBeGreaterThan(0);

    // Validate screenshot is loaded (has src attribute)
    const screenshot = page.locator('#run-screenshot');
    await expect(screenshot).toHaveAttribute('src', /.+/);
  });
});
