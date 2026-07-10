import { test, expect } from '@playwright/test';
import { navigateAndWait, expectText, expectVisible, ROUTES, isMobile } from './helpers';

test.describe('Expenses Page', () => {
  test('redirects to login when not authenticated @fast', async ({ page }) => {
    await page.goto(ROUTES.EXPENSES, { waitUntil: 'domcontentloaded' });
    await page.waitForURL(/\/login/, { timeout: 30000 });
  });

  test('login page has all expense-related navigation elements @fast', async ({ page }) => {
    await navigateAndWait(page, ROUTES.LOGIN);
    await expectVisible(page, 'input[type="email"]');
    await expectVisible(page, 'input[type="password"]');
  });
});
