import { Page, expect } from '@playwright/test';

export const TEST_USER = {
  email: 'test@expenseflow.demo',
  password: 'TestPassword123',
  name: 'Test User',
};

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  DASHBOARD: '/dashboard',
  EXPENSES: '/expenses',
  INCOME: '/income',
  BUDGETS: '/budgets',
  SAVINGS: '/savings',
  ANALYTICS: '/analytics',
  CALENDAR: '/calendar',
  REPORTS: '/reports',
  SETTINGS: '/settings',
  PROFILE: '/profile',
  SEARCH: '/search',
  RECURRING: '/recurring',
  SUBSCRIPTIONS: '/subscriptions',
  LOANS: '/loans',
};

export async function navigateAndWait(page: Page, route: string) {
  await page.goto(route, { waitUntil: 'domcontentloaded' });
  // Wait for React hydration and Firebase init
  await page.waitForTimeout(3000);
}

export async function isMobile(page: Page): Promise<boolean> {
  const width = page.viewportSize()?.width || 1024;
  return width < 1024;
}

export async function clickMobileMenuItem(page: Page, label: string) {
  const mobile = await isMobile(page);
  if (mobile) {
    const moreBtn = page.locator('button[aria-label="More"]');
    if (await moreBtn.isVisible().catch(() => false)) {
      await moreBtn.click();
      await page.waitForTimeout(300);
    }
  }
}

export async function expectVisible(page: Page, selector: string) {
  await expect(page.locator(selector)).toBeVisible({ timeout: 10000 });
}

export async function expectNotVisible(page: Page, selector: string) {
  await expect(page.locator(selector)).not.toBeVisible({ timeout: 5000 });
}

export async function expectText(page: Page, text: string) {
  await expect(page.getByText(text, { exact: false }).first()).toBeVisible({ timeout: 15000 });
}

export async function fillInput(page: Page, placeholder: string, value: string) {
  const input = page.locator(`input[placeholder="${placeholder}"]`);
  await input.fill(value);
}

export async function clickButton(page: Page, label: string) {
  const btn = page.locator(`button:has-text("${label}")`).first();
  await btn.click();
}

export async function clickLink(page: Page, label: string) {
  const link = page.locator(`a:has-text("${label}")`).first();
  await link.click();
}

export async function checkPageLoads(page: Page, route: string, headingText?: string) {
  await navigateAndWait(page, route);
  if (headingText) {
    await expectText(page, headingText);
  }
  // Verify no error messages
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  return consoleErrors;
}

export async function expectNoHorizontalScroll(page: Page) {
  const hasScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  expect(hasScroll).toBe(false);
}

export async function verifyTouchTargets(page: Page) {
  // Check that interactive elements are at least 44x44
  const smallTargets = await page.evaluate(() => {
    const buttons = document.querySelectorAll('button, a, [role="button"]');
    const small: string[] = [];
    buttons.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44)) {
        const label = el.textContent?.trim() || el.getAttribute('aria-label') || '';
        const hasAria = !!el.getAttribute('aria-label');
        if (label) {
          small.push(`${el.tagName}: "${label}" (${rect.width}x${rect.height})${hasAria ? ' [aria-label]' : ''}`);
        }
      }
    });
    return small;
  });
  return smallTargets;
}
