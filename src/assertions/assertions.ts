import { Page, expect } from '@playwright/test';
import { locators } from '../locators/locators';

export async function expectLoginPageVisible(page: Page) {
  const locator = locators(page);

  await expect(locator.auth.usernameInput).toBeVisible();
  await expect(locator.auth.passwordInput).toBeVisible();
  await expect(locator.auth.loginButton).toBeVisible();
}

export async function expectLoginSuccess(page: Page) {
  const locator = locators(page);

  await expect(page).toHaveURL(/shell-app-ui\/#\/journal-audits/);
  await expect(locator.auth.usernameInput).not.toBeVisible();
  await expect(locator.auth.userProfileButton).toBeVisible({ timeout: 45_000 });
}
