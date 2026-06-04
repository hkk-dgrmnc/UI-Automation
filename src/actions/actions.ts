import { Page } from '@playwright/test';
import { locators } from '../locators/locators';

export async function fillLoginUsername(page: Page, username: string) {
  const locator = locators(page);

  await locator.auth.usernameInput.fill(username);
}

export async function fillLoginPassword(page: Page, password: string) {
  const locator = locators(page);

  await locator.auth.passwordInput.fill(password);
}

export async function clickLoginButton(page: Page) {
  const locator = locators(page);

  await locator.auth.loginButton.click();
}
