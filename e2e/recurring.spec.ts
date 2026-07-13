import { test } from '@playwright/test';
import { ROUTES } from './helpers';

test.describe('Recurring Page', () => {
  test('redirects to login when not authenticated @fast', async ({ page }) => {
    await page.goto(ROUTES.RECURRING, { waitUntil: 'domcontentloaded' });
    await page.waitForURL(/\/login/, { timeout: 30000 });
  });
});
