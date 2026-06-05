import { Locator, Page } from '@playwright/test';
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

async function isVisible(locator: Locator) {
  return locator.filter({ visible: true }).first().isVisible().catch(() => false);
}

async function openMenuIfChildHidden(menuButton: Locator, childLocator: Locator) {
  if (!await isVisible(childLocator)) {
    await menuButton.filter({ visible: true }).first().click();
  }
}

export async function openSidebarMenuPath(
  page: Page,
  parentMenuNames: readonly string[],
  targetLinkName: string,
) {
  const locator = locators(page);

  for (let index = 0; index < parentMenuNames.length; index += 1) {
    const parentMenuName = parentMenuNames[index];
    const childMenuName = parentMenuNames[index + 1];
    const childLocator = childMenuName
      ? locator.navigation.sidebarMenuButton(childMenuName)
      : locator.navigation.sidebarMenuLink(targetLinkName);

    await openMenuIfChildHidden(
      locator.navigation.sidebarMenuButton(parentMenuName),
      childLocator,
    );
  }
}

export async function clickSidebarMenuLink(page: Page, name: string) {
  const locator = locators(page);

  await locator.navigation.sidebarMenuLink(name).filter({ visible: true }).first().click();
}

export async function clickCreateLink(page: Page) {
  const locator = locators(page);

  await locator.common.createLink.click();
}
