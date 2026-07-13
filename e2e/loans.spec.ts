import { test } from '@playwright/test';
import { ROUTES } from './helpers';

test.describe('Loans Page', () => {
  test('redirects to login when not authenticated @fast', async ({ page }) => {
    await page.goto(ROUTES.LOANS, { waitUntil: 'domcontentloaded' });
    await page.waitForURL(/\/login/, { timeout: 30000 });
  });
});
