import { test } from '@playwright/test';
import { ROUTES } from './helpers';

test.describe('Settings Page', () => {
  test('redirects to login when not authenticated @fast', async ({ page }) => {
    await page.goto(ROUTES.SETTINGS, { waitUntil: 'domcontentloaded' });
    await page.waitForURL(/\/login/, { timeout: 30000 });
  });
});
