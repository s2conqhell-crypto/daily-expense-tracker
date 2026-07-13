import { test, expect } from '@playwright/test';
import { ROUTES } from './helpers';

test.describe('Dashboard Page (unauthenticated redirect)', () => {
  test('redirects to login when not authenticated @fast', async ({ page }) => {
    await page.goto(ROUTES.DASHBOARD, { waitUntil: 'domcontentloaded' });
    await page.waitForURL(/\/login/, { timeout: 30000 });
  });

  test('has clean URL structure @fast', async ({ page }) => {
    const response = await page.goto(ROUTES.LOGIN);
    expect(response?.status()).toBe(200);
  });
});
