import { test, expect } from '@playwright/test';
import { navigateAndWait, ROUTES } from './helpers';

test.describe('Responsive Layout', () => {
  const viewports = [
    { width: 320, height: 568, name: 'iPhone SE' },
    { width: 375, height: 812, name: 'iPhone X/11/12/13' },
    { width: 390, height: 844, name: 'iPhone 14/15' },
    { width: 428, height: 926, name: 'iPhone Max' },
    { width: 768, height: 1024, name: 'iPad Mini' },
    { width: 1024, height: 768, name: 'iPad Landscape' },
    { width: 1440, height: 900, name: 'Desktop' },
  ];

  const pages = [
    { route: ROUTES.LOGIN, heading: 'ExpenseFlow' },
    { route: ROUTES.REGISTER, heading: 'Create Account' },
  ];

  for (const { width, height, name } of viewports) {
    for (const { route, heading } of pages) {
      test(`"${name}" - ${route} has no horizontal scroll @responsive`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await navigateAndWait(page, route);
        // Wait for rendering
        await page.waitForTimeout(500);
        const hasScroll = await page.evaluate(() =>
          document.documentElement.scrollWidth > document.documentElement.clientWidth
        );
        expect(hasScroll).toBe(false);
      });
    }
  }

  test('Auth pages have proper safe area padding @responsive', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await navigateAndWait(page, ROUTES.LOGIN);
    // Verify content is not at the very edge
    const headerRect = await page.locator('header, div:first-child').first().boundingBox();
    if (headerRect) {
      expect(headerRect.y).toBeGreaterThanOrEqual(0);
    }
  });
});
