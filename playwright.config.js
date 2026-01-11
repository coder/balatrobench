// @ts-check
const {
    defineConfig,
    devices
} = require('@playwright/test');

/**
 * Playwright configuration for BalatroBench test suite
 * Optimized for fast, headless testing of static web application
 *
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
    // Look for test files in the tests directory
    testDir: './tests',

    // Run tests in files in parallel
    fullyParallel: true,

    // Fail the build on CI if you accidentally left test.only in the source code
    forbidOnly: !!process.env.CI,

    // No retries for faster testing (static site should be reliable)
    retries: 0,

    // Single worker for speed (static site, no backend contention)
    workers: 10,

    // Reporter to use - dot gives concise output
    reporter: 'dot',

    use: {
        // Base URL for tests - all page navigations will be relative to this
        baseURL: 'http://localhost:8000',

        // Collect trace on failure for debugging
        trace: 'on-first-retry',

        // Screenshot on failure
        screenshot: 'only-on-failure',

        // Reasonable timeout for static site (10 seconds)
        actionTimeout: 10000,
    },

    // Configure projects for Chromium only (fast, single browser)
    projects: [{
        name: 'chromium',
        use: {
            ...devices['Desktop Chrome'],
            // Force headless mode for speed
            headless: true,
        },
    }, ],

    // Auto-start local dev server before running tests
    webServer: {
        // Use Python's built-in HTTP server (no dependencies needed)
        command: 'python3 -m http.server 8000 --directory site',
        url: 'http://localhost:8000',
        reuseExistingServer: !process.env.CI,
        // Give the server time to start
        timeout: 5000,
        // Suppress server logs for cleaner test output
        stdout: 'ignore',
        stderr: 'ignore',
    },
});