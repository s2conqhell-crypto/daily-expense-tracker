import { test, expect } from '@playwright/test';
import { navigateAndWait, ROUTES } from './helpers';

test.describe('Calendar Page', () => {
  test('redirects to login when not authenticated @fast', async ({ page }) => {
    await page.goto(ROUTES.CALENDAR, { waitUntil: 'domcontentloaded' });
    await page.waitForURL(/\/login/, { timeout: 30000 });
  });
});
