import { Page } from '@playwright/test';
import { LOCATOR_REPORTS, locators } from '../locators/locators';
import { click, fill } from './common.actions';

export async function fillLoginUsername(page: Page, username: string) {
  const locator = locators(page);

  await fill(locator.auth.usernameInput, LOCATOR_REPORTS.auth.usernameInput, username);
}

export async function fillLoginPassword(page: Page, password: string) {
  const locator = locators(page);

  await fill(locator.auth.passwordInput, LOCATOR_REPORTS.auth.passwordInput, password, true);
}

export async function clickLoginButton(page: Page) {
  const locator = locators(page);

  await click(locator.auth.loginButton, LOCATOR_REPORTS.auth.loginButton);
}
