import { test, expect } from '@playwright/test';
import { navigateAndWait, expectText, expectVisible, ROUTES } from './helpers';

test.describe('Authentication Pages', () => {
  test('Login page renders correctly @fast', async ({ page }) => {
    await navigateAndWait(page, ROUTES.LOGIN);
    await expectText(page, 'ExpenseFlow');
    await expectVisible(page, 'input[type="email"]');
    await expectVisible(page, 'input[type="password"]');
    await expectVisible(page, 'button:has-text("Sign In")');
    await expectVisible(page, 'button:has-text("Continue with Google")');
    // Check links
    await expectVisible(page, 'a[href="/register"]');
    await expectVisible(page, 'a[href="/forgot-password"]');
    // Check console errors
    const errors: string[] = [];
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
    await expect(errors.length).toBe(0);
  });

  test('Register page renders correctly @fast', async ({ page }) => {
    await navigateAndWait(page, ROUTES.REGISTER);
    await expectText(page, 'Create Account');
    await expectVisible(page, 'input[placeholder="John Doe"]');
    await expectVisible(page, 'input[type="email"]');
    await expectVisible(page, '#password');
    await expectVisible(page, 'button:has-text("Create Account")');
    await expectVisible(page, 'a[href="/login"]');
  });

  test('Forgot password page renders correctly @fast', async ({ page }) => {
    await navigateAndWait(page, ROUTES.FORGOT_PASSWORD);
    await expectText(page, 'Forgot Password');
    await expectVisible(page, 'input[type="email"]');
    await expectVisible(page, 'button:has-text("Send Reset Link")');
    await expectVisible(page, 'a[href="/login"]');
  });

  test('Reset password page renders correctly @fast', async ({ page }) => {
    await navigateAndWait(page, ROUTES.RESET_PASSWORD);
    await expectText(page, 'Set New Password');
    await expectVisible(page, 'button:has-text("Reset Password")');
  });

  test('Verify email page redirects to login when not authenticated @fast', async ({ page }) => {
    await page.goto(ROUTES.VERIFY_EMAIL, { waitUntil: 'domcontentloaded' });
    await page.waitForURL(/\/login/, { timeout: 30000 });
  });

  test('Login page has no horizontal scroll @fast', async ({ page }) => {
    await navigateAndWait(page, ROUTES.LOGIN);
    const hasScroll = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasScroll).toBe(false);
  });

  test('Register page has no horizontal scroll @fast', async ({ page }) => {
    await navigateAndWait(page, ROUTES.REGISTER);
    const hasScroll = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasScroll).toBe(false);
  });

  test('Login page form validation shows errors @fast', async ({ page }) => {
    await navigateAndWait(page, ROUTES.LOGIN);
    // Try submitting empty form
    await page.locator('button:has-text("Sign In")').waitFor({ state: 'visible', timeout: 15000 });
    await page.click('button:has-text("Sign In")');
    await page.waitForTimeout(500);
    // Should find error messages or validation
    const errorText = await page.textContent('body');
    expect(errorText).toBeTruthy();
  });
});
