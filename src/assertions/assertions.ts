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

export async function expectAutomaticParametersRouteOpened(page: Page) {
  const locator = locators(page);

  await expect(page).toHaveURL(/shell-app-ui\/#\/automatic-parameters/);
  await expect(locator.navigation.selectedSidebarMenuLink('Otomatik Parametre Tanımlama')).toBeVisible();
  await expect(locator.automaticParameters.listTitle).toBeVisible();
}

export async function expectAutomaticParametersCreateLinkAvailable(page: Page) {
  const locator = locators(page);

  await expect(locator.common.createLink).toHaveCount(1);
  await expect(locator.common.createLink).not.toHaveAttribute('aria-disabled', 'true');
}

export async function expectAutomaticParametersCreatePageOpened(page: Page) {
  const locator = locators(page);

  await expect(page).toHaveURL(/shell-app-ui\/#\/automatic-parameters\/create/);
  await expect(locator.automaticParameters.infoTitle).toBeVisible();
}
