// @ts-check
/**
 * Shared Test Helpers
 *
 * Common utilities and configurations for Playwright tests.
 * Reduces duplication and improves maintainability across test files.
 */

// ============================================================================
// Page Configurations
// ============================================================================

/**
 * Page configurations for parameterized testing.
 * Maps page names to their URLs and specific features.
 */
const PAGES = {
  index: {
    url: '/',
    tag: 'index',
    hasVendorColumn: true,
    hasAuthorColumn: false,
    primaryColumn: 'Model',
    secondaryColumn: 'Vendor'
  },
  community: {
    url: '/community.html',
    tag: 'community',
    hasVendorColumn: false,
    hasAuthorColumn: true,
    primaryColumn: 'Strategy',
    secondaryColumn: 'Author'
  }
};

/**
 * All pages including about (for navigation tests)
 */
const ALL_PAGES = ['/', '/community.html', '/about.html'];

// ============================================================================
// Viewport Presets
// ============================================================================

/**
 * Viewport configurations matching Tailwind CSS breakpoints.
 * See RESPONSIVE_DESIGN.md for column visibility at each breakpoint.
 */
const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  sm: { width: 640, height: 800 },
  md: { width: 768, height: 900 },
  lg: { width: 1024, height: 900 },
  xl: { width: 1280, height: 720 }
};

/**
 * Default viewport for most tests (XL - full visibility)
 */
const DEFAULT_VIEWPORT = VIEWPORTS.xl;

// ============================================================================
// Wait Helpers
// ============================================================================

/**
 * Wait for the leaderboard table to load with data.
 * Replaces magic timeouts with observable state.
 * @param {import('@playwright/test').Page} page - Playwright page
 */
async function waitForTableLoaded(page) {
  await page.waitForSelector('#leaderboard tbody tr', { state: 'attached', timeout: 10000 });
  // Wait for actual data to appear (not loading placeholder)
  await page.waitForFunction(() => {
    const rows = document.querySelectorAll('#leaderboard tbody tr');
    if (rows.length === 0) return false;
    // Check first row has actual content (not a loading state)
    const firstCell = rows[0].querySelector('td');
    return firstCell && firstCell.textContent && firstCell.textContent.trim().length > 0;
  }, { timeout: 10000 });
}

/**
 * Wait for the detail runs table to appear (after expanding a row).
 * @param {import('@playwright/test').Page} page - Playwright page
 */
async function waitForDetailTable(page) {
  await page.waitForSelector('#detail-runs-table tbody tr', { timeout: 5000 });
}

/**
 * Wait for chart canvas to be ready.
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {string} canvasSelector - Selector for canvas element
 */
async function waitForChart(page, canvasSelector) {
  const canvas = page.locator(canvasSelector).first();
  await canvas.waitFor({ timeout: 5000 });
  return canvas;
}

/**
 * Wait for responsive layout to settle after viewport change.
 * More reliable than waitForTimeout(500).
 * @param {import('@playwright/test').Page} page - Playwright page
 */
async function waitForLayoutStable(page) {
  // Wait for any CSS transitions to complete
  await page.waitForFunction(() => {
    return document.readyState === 'complete';
  });
  // Small buffer for layout recalculation
  await page.waitForTimeout(100);
}

// ============================================================================
// Column Visibility Helpers
// ============================================================================

/**
 * Check if a column header is visible by aria-label.
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {string} ariaLabel - The aria-label of the column header
 * @returns {Promise<boolean>} True if visible
 */
async function isColumnVisible(page, ariaLabel) {
  const locator = page.locator(`th[aria-label="${ariaLabel}"]`);
  const count = await locator.count();
  if (count === 0) return false;
  return await locator.first().isVisible();
}

/**
 * Check if a column header exists but is hidden.
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {string} ariaLabel - The aria-label of the column header
 * @returns {Promise<boolean>} True if hidden (or not in DOM)
 */
async function isColumnHidden(page, ariaLabel) {
  const locator = page.locator(`th[aria-label="${ariaLabel}"]`);
  const count = await locator.count();
  if (count === 0) return true; // Not in DOM = hidden
  return await locator.first().isHidden();
}

// ============================================================================
// Chart Helpers
// ============================================================================

/**
 * Get Chart.js chart data from a canvas element.
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {string} canvasId - Canvas element ID
 * @returns {Promise<{labels: string[], datasets: any[]}>} Chart data
 */
async function getChartData(page, canvasId) {
  return await page.evaluate((id) => {
    const canvas = document.getElementById(id);
    // @ts-ignore - Chart is a global from Chart.js
    const chart = Chart.getChart(canvas);
    if (!chart) return { labels: [], datasets: [] };
    return {
      labels: chart.data.labels || [],
      datasets: chart.data.datasets || []
    };
  }, canvasId);
}

/**
 * Get legend labels from a Chart.js chart.
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {string} canvasId - Canvas element ID
 * @returns {Promise<string[]>} Array of legend labels
 */
async function getChartLegendLabels(page, canvasId) {
  return await page.evaluate((id) => {
    const canvas = document.getElementById(id);
    // @ts-ignore - Chart is a global from Chart.js
    const chart = Chart.getChart(canvas);
    if (!chart) return [];
    // For pie charts, labels are in data.labels
    if (chart.data.labels) return chart.data.labels;
    // For bar/line charts, labels come from datasets
    return chart.data.datasets?.map(ds => ds.label) || [];
  }, canvasId);
}

// ============================================================================
// Data Validation Patterns
// ============================================================================

/**
 * Regex patterns for validating data formats.
 */
const DATA_PATTERNS = {
  /** Matches numeric rank (e.g., "1", "10") */
  rank: /^\d+$/,
  /** Matches percentage (e.g., "95%") */
  percentage: /^\d+%$/,
  /** Matches value ± stddev (e.g., "10.5 ± 2.3") */
  valueWithStdDev: /^[\d.]+\s*±\s*[\d.]+$/,
  /** Matches 7-character seed (e.g., "AAAAAAA") */
  seed: /^[A-Z]{7}$/
};

/**
 * Normalize whitespace in text (collapse multiple spaces/newlines to single space).
 * @param {string|null} text - Text to normalize
 * @returns {string} Normalized text
 */
function normalizeWhitespace(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  // Page configs
  PAGES,
  ALL_PAGES,
  // Viewports
  VIEWPORTS,
  DEFAULT_VIEWPORT,
  // Wait helpers
  waitForTableLoaded,
  waitForDetailTable,
  waitForChart,
  waitForLayoutStable,
  // Column helpers
  isColumnVisible,
  isColumnHidden,
  // Chart helpers
  getChartData,
  getChartLegendLabels,
  // Data validation
  DATA_PATTERNS,
  normalizeWhitespace
};
