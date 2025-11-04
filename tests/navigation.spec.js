// @ts-check
const {
  test,
  expect
} = require('@playwright/test');

/**
 * Navigation Tests (XL Viewport - 1280x720)
 *
 * Simplified navigation and external link validation tests.
 * All tests run at XL viewport (1280px) which corresponds to desktop view
 * where all columns and features are visible per RESPONSIVE_DESIGN.md.
 */

// Default viewport for all tests
const DEFAULT_VIEWPORT = {
  width: 1280,
  height: 720
};

test.describe('Navigation', () => {
  test.beforeEach(async ({
    page
  }) => {
    await page.setViewportSize(DEFAULT_VIEWPORT);
  });

  /**
   * Test: Navigation bar exists on all pages
   * Verifies navigation component is present on index, community, and about pages
   */
  test('navigation bar exists on all pages', async ({
    page
  }) => {
    const pages = [{
        path: '/',
        name: 'index'
      },
      {
        path: '/community.html',
        name: 'community'
      },
      {
        path: '/about.html',
        name: 'about'
      }
    ];

    for (const {
        path,
        name
      }
      of pages) {
      await page.goto(path);

      const nav = page.locator('nav');
      await expect(nav).toBeVisible();

      // Verify all navigation links are present
      await expect(nav.getByRole('link', {
        name: 'BalatroBench'
      })).toBeVisible();
      await expect(nav.getByRole('link', {
        name: 'Community'
      })).toBeVisible();
      await expect(nav.getByRole('link', {
        name: 'About'
      })).toBeVisible();
    }
  });

  /**
   * Test: Complete navigation journey
   * Verifies clicking navigation links works correctly: index → community → about → index
   */
  test('can navigate between all pages', async ({
    page
  }) => {
    // Start at index
    await page.goto('/');
    await expect(page).toHaveURL(/\/(index\.html)?$/);
    await expect(page.getByRole('heading', {
      name: 'BalatroBench'
    })).toBeVisible();

    // Navigate to community
    await page.getByRole('link', {
      name: 'Community'
    }).click();
    await expect(page).toHaveURL(/community\.html/);
    await expect(page.getByRole('link', {
      name: 'Contribute Your Strategy'
    })).toBeVisible();

    // Navigate to about
    await page.getByRole('link', {
      name: 'About'
    }).click();
    await expect(page).toHaveURL(/about\.html/);
    await expect(page.getByRole('heading', {
      name: 'What is BalatroBench?'
    })).toBeVisible();

    // Navigate back to index
    await page.locator('nav').getByRole('link', {
      name: 'BalatroBench'
    }).click();
    await expect(page).toHaveURL(/\/(index\.html)?$/);
    await expect(page.getByRole('heading', {
      name: 'BalatroBench'
    })).toBeVisible();
  });

  /**
   * Test: Footer exists on all pages
   * Verifies footer component is visible on all pages
   */
  test('footer exists on all pages', async ({
    page
  }) => {
    const pages = ['/', '/community.html', '/about.html'];

    for (const path of pages) {
      await page.goto(path);
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
    }
  });
});

test.describe('External Links', () => {
  test.beforeEach(async ({
    page
  }) => {
    await page.setViewportSize(DEFAULT_VIEWPORT);
  });

  /**
   * Test: All external links have correct URLs
   * Verifies that all external links exist and point to the correct destinations
   */
  test('external links have correct URLs', async ({
    page
  }) => {
    // Test Contribute Your Strategy link (community.html)
    await page.goto('/community.html');
    const contributeLink = page.getByRole('link', {
      name: 'Contribute Your Strategy'
    });
    await expect(contributeLink).toBeVisible();
    await expect(contributeLink).toHaveAttribute('href',
      'https://coder.github.io/balatrollm/strategies/'
    );

    // Test Balatro game link (about.html)
    await page.goto('/about.html');
    const balatroLink = page.locator('a[href="https://www.playbalatro.com/"]');
    await expect(balatroLink).toBeVisible();

    // Test GitHub project links (about.html)
    const projectLinks = [{
        name: 'BalatroBot',
        url: 'https://github.com/coder/balatrobot'
      },
      {
        name: 'BalatroLLM',
        url: 'https://github.com/coder/balatrollm'
      },
      {
        name: 'BalatroBench',
        url: 'https://github.com/coder/balatrobench'
      }
    ];

    for (const {
        name,
        url
      }
      of projectLinks) {
      // Find link by href to avoid navigation bar matches
      const link = page.locator(`a[href="${url}"]`);
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href', url);
    }

    // Test Coder.com footer link (check on index page)
    await page.goto('/');
    const footer = page.locator('footer');
    const coderLink = footer.locator('a[href="https://coder.com/"]');
    await expect(coderLink).toBeVisible();
  });

  /**
   * Test: Coder.com footer link exists on all pages
   * Verifies that the footer Coder link is present on every page
   */
  test('coder.com footer link exists on all pages', async ({
    page
  }) => {
    const pages = ['/', '/community.html', '/about.html'];
    const coderUrl = 'https://coder.com/';

    for (const path of pages) {
      await page.goto(path);

      const footer = page.locator('footer');
      const link = footer.locator(`a[href="${coderUrl}"]`);
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href', coderUrl);
    }
  });
});
