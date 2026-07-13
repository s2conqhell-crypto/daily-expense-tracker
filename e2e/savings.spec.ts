import { test } from '@playwright/test';
import { ROUTES } from './helpers';

test.describe('Savings Page', () => {
  test('redirects to login when not authenticated @fast', async ({ page }) => {
    await page.goto(ROUTES.SAVINGS, { waitUntil: 'domcontentloaded' });
    await page.waitForURL(/\/login/, { timeout: 30000 });
  });
});
