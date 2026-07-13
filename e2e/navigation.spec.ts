import { test, expect } from '@playwright/test';
import { navigateAndWait, expectText, expectVisible, ROUTES } from './helpers';

test.describe('Navigation', () => {
  // Test header elements (present on all dashboard pages)
  test.describe('Header', () => {
    test('Login page has theme toggle @fast', async ({ page }) => {
      await navigateAndWait(page, ROUTES.LOGIN);
      await expectVisible(page, 'button[aria-label*="mode"]');
    });
  });

  // Test navigation between pages via URL
  test.describe('Page Routing', () => {
    const pages = [
      { route: ROUTES.LOGIN, heading: 'ExpenseFlow' },
      { route: ROUTES.REGISTER, heading: 'Create Account' },
      { route: ROUTES.FORGOT_PASSWORD, heading: 'Forgot Password' },
    ];

    for (const { route, heading } of pages) {
      test(`${route} loads with heading "${heading}" @fast`, async ({ page }) => {
        await navigateAndWait(page, route);
        await expectText(page, heading);
      });
    }
  });

  test('404 page shows error message @fast', async ({ page }) => {
    const response = await page.goto('/nonexistent-page');
    expect(response?.status()).toBe(404);
  });
});
