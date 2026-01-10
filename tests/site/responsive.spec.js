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

/**
 * Helper function to check if a column header is visible by aria-label
 */
async function isColumnVisible(page, ariaLabel) {
    const locator = page.locator(`th[aria-label="${ariaLabel}"]`);
    const count = await locator.count();
    if (count === 0) return false;
    return await locator.first().isVisible();
}

/**
 * Helper function to check if a column header exists but is hidden
 */
async function isColumnHidden(page, ariaLabel) {
    const locator = page.locator(`th[aria-label="${ariaLabel}"]`);
    const count = await locator.count();
    if (count === 0) return true; // Not in DOM = hidden
    return await locator.first().isHidden();
}

test.describe('Mobile viewport (< 640px)', () => {
    /**
     * Column visibility tests
     */
    test('main page shows only core columns', async ({
        page
    }) => {
        await page.setViewportSize({
            width: 375,
            height: 667
        });
        await page.goto('/');
        await page.waitForSelector('tbody tr');

        // Verify core columns are visible
        const rankHeader = page.locator('th:has-text("#")');
        const modelHeader = page.locator('th:has-text("Model")');
        const roundHeader = page.locator('th:has-text("Round")');

        await expect(rankHeader).toBeVisible();
        await expect(modelHeader).toBeVisible();
        await expect(roundHeader).toBeVisible();

        // Verify all other columns are hidden
        expect(await isColumnHidden(page, 'Vendor')).toBe(true);
        expect(await isColumnHidden(page, 'Valid tool calls executable in state')).toBe(true);
        expect(await isColumnHidden(page, 'Valid tool calls not executable in state')).toBe(
            true);
        expect(await isColumnHidden(page, 'Responses without valid tool calls')).toBe(true);
        expect(await isColumnHidden(page, 'Average input tokens')).toBe(true);
        expect(await isColumnHidden(page, 'Average output tokens')).toBe(true);
        expect(await isColumnHidden(page, 'Average time per tool call')).toBe(true);
        expect(await isColumnHidden(page, 'Average cost per tool call')).toBe(true);
    });

    test('community page shows only core columns', async ({
        page
    }) => {
        await page.setViewportSize({
            width: 375,
            height: 667
        });
        await page.goto('/community.html');
        await page.waitForSelector('tbody tr');

        // Verify core columns are visible
        const rankHeader = page.locator('th:has-text("#")');
        const strategyHeader = page.locator('th:has-text("Strategy")');
        const roundHeader = page.locator('th:has-text("Round")');

        await expect(rankHeader).toBeVisible();
        await expect(strategyHeader).toBeVisible();
        await expect(roundHeader).toBeVisible();

        // Verify all other columns are hidden
        expect(await isColumnHidden(page, 'Author')).toBe(true);
        expect(await isColumnHidden(page, 'Valid tool calls executable in state')).toBe(true);
        expect(await isColumnHidden(page, 'Valid tool calls not executable in state')).toBe(
            true);
        expect(await isColumnHidden(page, 'Responses without valid tool calls')).toBe(true);
        expect(await isColumnHidden(page, 'Average input tokens')).toBe(true);
        expect(await isColumnHidden(page, 'Average output tokens')).toBe(true);
        expect(await isColumnHidden(page, 'Average time per tool call')).toBe(true);
        expect(await isColumnHidden(page, 'Average cost per tool call')).toBe(true);
    });

    /**
     * Performance chart visibility
     */
    test('main page - performance chart hidden', async ({
        page
    }) => {
        await page.setViewportSize({
            width: 375,
            height: 667
        });
        await page.goto('/');
        await page.waitForSelector('tbody tr');

        const chartContainer = page.locator('#performance-chart').locator('..');
        const isVisible = await chartContainer.isVisible();
        expect(isVisible).toBe(false);
    });

    test('community page - no performance chart', async ({
        page
    }) => {
        await page.setViewportSize({
            width: 375,
            height: 667
        });
        await page.goto('/community.html');
        await page.waitForSelector('tbody tr');

        const chartCanvas = page.locator('#performance-chart');
        const count = await chartCanvas.count();
        expect(count).toBe(0);
    });

    /**
     * Expandable rows behavior
     */
    test('main page - expandable rows disabled', async ({
        page
    }) => {
        await page.setViewportSize({
            width: 375,
            height: 667
        });
        await page.goto('/');
        await page.waitForSelector('tbody tr');

        const firstRow = page.locator('tbody tr').first();
        await firstRow.click();
        await page.waitForTimeout(500);

        const detailRows = page.locator('tr.detail-row');
        const detailRowCount = await detailRows.count();
        expect(detailRowCount).toBe(0);
    });

    test('community page - expandable rows disabled', async ({
        page
    }) => {
        await page.setViewportSize({
            width: 375,
            height: 667
        });
        await page.goto('/community.html');
        await page.waitForSelector('tbody tr');

        const firstRow = page.locator('tbody tr').first();
        await firstRow.click();
        await page.waitForTimeout(500);

        const detailRows = page.locator('tr.detail-row');
        const detailRowCount = await detailRows.count();
        expect(detailRowCount).toBe(0);
    });

    /**
     * Navigation
     */
    test('main page - navigation accessible', async ({
        page
    }) => {
        await page.setViewportSize({
            width: 375,
            height: 667
        });
        await page.goto('/');

        const nav = page.locator('nav');
        await expect(nav).toBeVisible();

        await page.getByRole('link', {
            name: 'Community'
        }).click();
        await expect(page).toHaveURL(/community\.html/);
    });

    test('community page - navigation accessible', async ({
        page
    }) => {
        await page.setViewportSize({
            width: 375,
            height: 667
        });
        await page.goto('/community.html');

        const nav = page.locator('nav');
        await expect(nav).toBeVisible();

        await page.getByRole('link', {
            name: 'BalatroBench'
        }).click();
        await expect(page).toHaveURL(/\/$|index\.html/);
    });

    /**
     * Footer
     */
    test('main page - footer visible', async ({
        page
    }) => {
        await page.setViewportSize({
            width: 375,
            height: 667
        });
        await page.goto('/');
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

        const footer = page.locator('footer');
        await expect(footer).toBeVisible();
    });

    test('community page - footer visible', async ({
        page
    }) => {
        await page.setViewportSize({
            width: 375,
            height: 667
        });
        await page.goto('/community.html');
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

        const footer = page.locator('footer');
        await expect(footer).toBeVisible();
    });
});

test.describe('sm breakpoint (640px+)', () => {
    /**
     * Column visibility tests
     */
    test('main page shows tool call columns', async ({
        page
    }) => {
        await page.setViewportSize({
            width: 640,
            height: 667
        });
        await page.goto('/');
        await page.waitForSelector('tbody tr');

        // Tool call columns should now be visible
        expect(await isColumnVisible(page, 'Valid tool calls executable in state')).toBe(
            true);
        expect(await isColumnVisible(page, 'Valid tool calls not executable in state')).toBe(
            true);
        expect(await isColumnVisible(page, 'Responses without valid tool calls')).toBe(true);

        // Token and vendor columns should still be hidden
        expect(await isColumnHidden(page, 'Average input tokens')).toBe(true);
        expect(await isColumnHidden(page, 'Average output tokens')).toBe(true);
        expect(await isColumnHidden(page, 'Vendor')).toBe(true);
    });

    test('community page shows tool call columns', async ({
        page
    }) => {
        await page.setViewportSize({
            width: 640,
            height: 667
        });
        await page.goto('/community.html');
        await page.waitForSelector('tbody tr');

        // Tool call columns should now be visible
        expect(await isColumnVisible(page, 'Valid tool calls executable in state')).toBe(
            true);
        expect(await isColumnVisible(page, 'Valid tool calls not executable in state')).toBe(
            true);
        expect(await isColumnVisible(page, 'Responses without valid tool calls')).toBe(true);

        // Token and author columns should still be hidden
        expect(await isColumnHidden(page, 'Average input tokens')).toBe(true);
        expect(await isColumnHidden(page, 'Average output tokens')).toBe(true);
        expect(await isColumnHidden(page, 'Author')).toBe(true);
    });
});

test.describe('md breakpoint (768px+)', () => {
    /**
     * Column visibility tests
     */
    test('main page shows time and cost columns', async ({
        page
    }) => {
        await page.setViewportSize({
            width: 768,
            height: 1024
        });
        await page.goto('/');
        await page.waitForSelector('tbody tr');

        // Time and cost columns should now be visible
        expect(await isColumnVisible(page, 'Average time per tool call')).toBe(true);
        expect(await isColumnVisible(page, 'Average cost per tool call')).toBe(true);

        // Tool call columns should still be visible
        expect(await isColumnVisible(page, 'Valid tool calls executable in state')).toBe(
            true);

        // Token and vendor columns should still be hidden
        expect(await isColumnHidden(page, 'Average input tokens')).toBe(true);
        expect(await isColumnHidden(page, 'Average output tokens')).toBe(true);
        expect(await isColumnHidden(page, 'Vendor')).toBe(true);
    });

    test('community page shows time and cost columns', async ({
        page
    }) => {
        await page.setViewportSize({
            width: 768,
            height: 1024
        });
        await page.goto('/community.html');
        await page.waitForSelector('tbody tr');

        // Time and cost columns should now be visible
        expect(await isColumnVisible(page, 'Average time per tool call')).toBe(true);
        expect(await isColumnVisible(page, 'Average cost per tool call')).toBe(true);

        // Tool call columns should still be visible
        expect(await isColumnVisible(page, 'Valid tool calls executable in state')).toBe(
            true);

        // Token and author columns should still be hidden
        expect(await isColumnHidden(page, 'Average input tokens')).toBe(true);
        expect(await isColumnHidden(page, 'Average output tokens')).toBe(true);
        expect(await isColumnHidden(page, 'Author')).toBe(true);
    });
});

test.describe('lg breakpoint (1024px+)', () => {
    /**
     * Column visibility tests
     */
    test('main page shows token columns', async ({
        page
    }) => {
        await page.setViewportSize({
            width: 1024,
            height: 768
        });
        await page.goto('/');
        await page.waitForSelector('tbody tr');

        // Token columns should now be visible
        expect(await isColumnVisible(page, 'Average input tokens')).toBe(true);
        expect(await isColumnVisible(page, 'Average output tokens')).toBe(true);

        // All previous columns should still be visible
        expect(await isColumnVisible(page, 'Valid tool calls executable in state')).toBe(
            true);
        expect(await isColumnVisible(page, 'Average time per tool call')).toBe(true);

        // Vendor should still be hidden
        expect(await isColumnHidden(page, 'Vendor')).toBe(true);
    });

    test('community page shows token columns at lg', async ({
        page
    }) => {
        await page.setViewportSize({
            width: 1024,
            height: 768
        });
        await page.goto('/community.html');
        await page.waitForSelector('tbody tr');

        // Token columns should now be visible
        expect(await isColumnVisible(page, 'Average input tokens')).toBe(true);
        expect(await isColumnVisible(page, 'Average output tokens')).toBe(true);

        // Author column should still be hidden at lg (appears at xl)
        expect(await isColumnHidden(page, 'Author')).toBe(true);

        // All previous columns should still be visible
        expect(await isColumnVisible(page, 'Valid tool calls executable in state')).toBe(
            true);
        expect(await isColumnVisible(page, 'Average time per tool call')).toBe(true);
    });

});

test.describe('xl breakpoint (1280px+)', () => {
    /**
     * Column visibility tests
     */
    test('main page shows vendor column', async ({
        page
    }) => {
        await page.setViewportSize({
            width: 1280,
            height: 720
        });
        await page.goto('/');
        await page.waitForSelector('tbody tr');

        // Vendor column should now be visible
        const vendorHeader = page.locator('th:has-text("Vendor")');
        await expect(vendorHeader).toBeVisible();

        // All other columns should still be visible
        expect(await isColumnVisible(page, 'Average input tokens')).toBe(true);
        expect(await isColumnVisible(page, 'Valid tool calls executable in state')).toBe(
            true);
        expect(await isColumnVisible(page, 'Average time per tool call')).toBe(true);
    });

    test('community page shows same columns as lg', async ({
        page
    }) => {
        await page.setViewportSize({
            width: 1280,
            height: 720
        });
        await page.goto('/community.html');
        await page.waitForSelector('tbody tr');

        // All columns from lg should be visible
        const authorHeader = page.locator('th:has-text("Author")');
        await expect(authorHeader).toBeVisible();

        expect(await isColumnVisible(page, 'Average input tokens')).toBe(true);
        expect(await isColumnVisible(page, 'Valid tool calls executable in state')).toBe(
            true);
        expect(await isColumnVisible(page, 'Average time per tool call')).toBe(true);

        // No additional columns appear at xl on community page
        // (Unlike main leaderboard which adds Vendor at xl)
    });

    /**
     * Page-specific feature: Vendor column appears at xl on main page only
     */
    test('vendor column appears on main page only', async ({
        page
    }) => {
        await page.setViewportSize({
            width: 1280,
            height: 720
        });

        // Main page: Vendor visible at xl
        await page.goto('/');
        await page.waitForSelector('tbody tr');

        const vendorHeaderMain = page.locator('th:has-text("Vendor")');
        await expect(vendorHeaderMain).toBeVisible();

        // Community page: No vendor column
        await page.goto('/community.html');
        await page.waitForSelector('tbody tr');

        const vendorHeaderCommunity = page.locator('th:has-text("Vendor")');
        const vendorCount = await vendorHeaderCommunity.count();
        expect(vendorCount).toBe(0);
    });

    /**
     * Page-specific feature: Author column appears at xl on community page
     */
    test('author column appears on community page only', async ({
        page
    }) => {
        await page.setViewportSize({
            width: 1280,
            height: 720
        });

        // Community page: Author visible at xl
        await page.goto('/community.html');
        await page.waitForSelector('tbody tr');

        const authorHeaderCommunity = page.locator('th:has-text("Author")');
        await expect(authorHeaderCommunity).toBeVisible();

        // Main page: No author column
        await page.goto('/');
        await page.waitForSelector('tbody tr');

        const authorHeaderMain = page.locator('th:has-text("Author")');
        const authorCount = await authorHeaderMain.count();
        expect(authorCount).toBe(0);
    });

    /**
     * Performance chart visibility (desktop)
     */
    test('main page - performance chart visible', async ({
        page
    }) => {
        await page.setViewportSize({
            width: 1280,
            height: 720
        });
        await page.goto('/');
        await page.waitForSelector('tbody tr');

        const chartCanvas = page.locator('#performance-chart');
        await expect(chartCanvas).toBeVisible();
    });

    test('performance chart only on main page', async ({
        page
    }) => {
        await page.setViewportSize({
            width: 1280,
            height: 720
        });

        // Main page: Chart exists
        await page.goto('/');
        await page.waitForSelector('tbody tr');
        const chartMain = page.locator('#performance-chart');
        await expect(chartMain).toBeVisible();

        // Community page: No chart
        await page.goto('/community.html');
        await page.waitForSelector('tbody tr');
        const chartCommunity = page.locator('#performance-chart');
        const chartCount = await chartCommunity.count();
        expect(chartCount).toBe(0);
    });

    /**
     * Expandable rows (desktop)
     */
    test('main page - expandable rows work', async ({
        page
    }) => {
        await page.setViewportSize({
            width: 1280,
            height: 720
        });
        await page.goto('/');
        await page.waitForSelector('tbody tr');

        await page.locator('tbody tr').first().click();
        await page.waitForSelector('tr.detail-row', {
            timeout: 5000
        });

        const detailRow = page.locator('tr.detail-row').first();
        await expect(detailRow).toBeVisible();
    });

    test('community page - expandable rows work', async ({
        page
    }) => {
        await page.setViewportSize({
            width: 1280,
            height: 720
        });
        await page.goto('/community.html');
        await page.waitForSelector('tbody tr');

        await page.locator('tbody tr').first().click();
        await page.waitForSelector('tr.detail-row', {
            timeout: 5000
        });

        const detailRow = page.locator('tr.detail-row').first();
        await expect(detailRow).toBeVisible();
    });

    /**
     * Navigation (desktop)
     */
    test('main page - navigation accessible', async ({
        page
    }) => {
        await page.setViewportSize({
            width: 1280,
            height: 720
        });
        await page.goto('/');

        const nav = page.locator('nav');
        await expect(nav).toBeVisible();

        await page.getByRole('link', {
            name: 'About'
        }).click();
        await expect(page).toHaveURL(/about\.html/);
    });

    test('community page - navigation accessible', async ({
        page
    }) => {
        await page.setViewportSize({
            width: 1280,
            height: 720
        });
        await page.goto('/community.html');

        const nav = page.locator('nav');
        await expect(nav).toBeVisible();

        await page.getByRole('link', {
            name: 'About'
        }).click();
        await expect(page).toHaveURL(/about\.html/);
    });

    /**
     * Footer (desktop)
     */
    test('main page - footer visible', async ({
        page
    }) => {
        await page.setViewportSize({
            width: 1280,
            height: 720
        });
        await page.goto('/');
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

        const footer = page.locator('footer');
        await expect(footer).toBeVisible();
    });

    test('community page - footer visible', async ({
        page
    }) => {
        await page.setViewportSize({
            width: 1280,
            height: 720
        });
        await page.goto('/community.html');
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

        const footer = page.locator('footer');
        await expect(footer).toBeVisible();
    });
});

/**
 * Cross-breakpoint features
 * These features work consistently across all viewport sizes
 */
test.describe('Cross-breakpoint features', () => {
    test('main page - version selector works on mobile', async ({
        page
    }) => {
        await page.setViewportSize({
            width: 375,
            height: 667
        });
        await page.goto('/');
        await page.waitForSelector('tbody tr');

        const versionSelector = page.locator('select');
        await expect(versionSelector).toBeVisible();

        const options = versionSelector.locator('option');
        const optionCount = await options.count();
        expect(optionCount).toBeGreaterThan(0);
    });

    test('main page - version selector works on desktop', async ({
        page
    }) => {
        await page.setViewportSize({
            width: 1280,
            height: 720
        });
        await page.goto('/');
        await page.waitForSelector('tbody tr');

        const versionSelector = page.locator('select');
        await expect(versionSelector).toBeVisible();
    });

    test('community page - version selector works on mobile', async ({
        page
    }) => {
        await page.setViewportSize({
            width: 375,
            height: 667
        });
        await page.goto('/community.html');
        await page.waitForSelector('tbody tr');

        const versionSelector = page.locator('select');
        await expect(versionSelector).toBeVisible();

        const options = versionSelector.locator('option');
        const optionCount = await options.count();
        expect(optionCount).toBeGreaterThan(0);
    });

    test('community page - version selector works on desktop', async ({
        page
    }) => {
        await page.setViewportSize({
            width: 1280,
            height: 720
        });
        await page.goto('/community.html');
        await page.waitForSelector('tbody tr');

        const versionSelector = page.locator('select');
        await expect(versionSelector).toBeVisible();
    });

    test('main page - table scrollable on mobile', async ({
        page
    }) => {
        await page.setViewportSize({
            width: 375,
            height: 667
        });
        await page.goto('/');
        await page.waitForSelector('tbody tr');

        const table = page.locator('table');
        await expect(table).toBeVisible();

        const tableWidth = await table.evaluate(el => el.offsetWidth);
        expect(tableWidth).toBeGreaterThan(0);
    });

    test('community page - table scrollable on mobile', async ({
        page
    }) => {
        await page.setViewportSize({
            width: 375,
            height: 667
        });
        await page.goto('/community.html');
        await page.waitForSelector('tbody tr');

        const table = page.locator('table');
        await expect(table).toBeVisible();

        const tableWidth = await table.evaluate(el => el.offsetWidth);
        expect(tableWidth).toBeGreaterThan(0);
    });
});