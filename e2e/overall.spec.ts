import { test, expect } from '@playwright/test';
import { navigateAndWait, ROUTES } from './helpers';

test.describe('Overall Application Health', () => {
  test('All auth pages load without console errors @fast', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('pageerror', (err) => errors.push(err.message));

    const authRoutes = [
      ROUTES.LOGIN,
      ROUTES.REGISTER,
      ROUTES.FORGOT_PASSWORD,
    ];

    for (const route of authRoutes) {
      await navigateAndWait(page, route);
      await page.waitForTimeout(300);
    }

    // Filter out favicon errors and Firebase-related errors
    const filteredErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('ERR_BLOCKED_BY_RESPONSE')
    );
    expect(filteredErrors.length).toBe(0);
  });

  test('App meta tags are present @fast', async ({ page }) => {
    await navigateAndWait(page, ROUTES.LOGIN);
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');
    expect(viewport).toContain('initial-scale=1');

    const themeColor = await page.locator('meta[name="theme-color"]').first().getAttribute('content');
    expect(themeColor).toBeTruthy();

    const appleCapable = await page.locator('meta[name="apple-mobile-web-app-capable"]').first().getAttribute('content');
    expect(appleCapable).toBe('yes');
  });

  test('Application renders without runtime errors @fast', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await navigateAndWait(page, ROUTES.LOGIN);
    expect(errors.length).toBe(0);
  });
});
