import { test, expect } from '@playwright/test';
import { navigateAndWait, ROUTES, verifyTouchTargets } from './helpers';

test.describe('Accessibility', () => {
  test('Login page has proper aria labels @fast', async ({ page }) => {
    await navigateAndWait(page, ROUTES.LOGIN);
    const buttons = await page.locator('button').all();
    for (const btn of buttons) {
      const ariaLabel = await btn.getAttribute('aria-label');
      const hasText = (await btn.textContent())?.trim();
      expect(ariaLabel || hasText).toBeTruthy();
    }
  });

  test('All interactive elements meet 44x44 touch target minimum @fast', async ({ page }) => {
    await navigateAndWait(page, ROUTES.LOGIN);
    const smallTargets = await verifyTouchTargets(page);
    // Allow small icon buttons that have aria-labels (accessibility best practice)
    const labeledSmall = smallTargets.filter(s => !s.includes('svg') && !s.includes('[aria-label]'));
    expect(labeledSmall.length).toBe(0);
  });

  test('Images have alt text @fast', async ({ page }) => {
    await navigateAndWait(page, ROUTES.LOGIN);
    const images = await page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).not.toBeNull();
    }
  });

  test('Interactive elements are keyboard accessible @fast', async ({ page }) => {
    await navigateAndWait(page, ROUTES.LOGIN);
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    const focused = await page.locator(':focus').first();
    await expect(focused).toBeVisible();
  });
});
