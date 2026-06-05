import { Locator, Page } from '@playwright/test';
import { locators } from '../locators/locators';
import { reportAction } from '../utils/action-report';

type LocatorReport = {
  name: string;
  value: string;
};

async function fillWithReport(
  locator: Locator,
  locatorReport: LocatorReport,
  value: string,
  maskValue = false,
) {
  await reportAction({
    action: 'Fill',
    locatorName: locatorReport.name,
    locatorValue: locatorReport.value,
    value,
    maskValue,
  });
  await locator.fill(value);
}

async function clickWithReport(locator: Locator, locatorReport: LocatorReport) {
  await reportAction({
    action: 'Click',
    locatorName: locatorReport.name,
    locatorValue: locatorReport.value,
  });
  await locator.click();
}

export async function fillLoginUsername(page: Page, username: string) {
  const locator = locators(page);

  await fillWithReport(
    locator.auth.usernameInput,
    { name: 'auth.usernameInput', value: '#username' },
    username,
  );
}

export async function fillLoginPassword(page: Page, password: string) {
  const locator = locators(page);

  await fillWithReport(
    locator.auth.passwordInput,
    { name: 'auth.passwordInput', value: '#password' },
    password,
    true,
  );
}

export async function clickLoginButton(page: Page) {
  const locator = locators(page);

  await clickWithReport(
    locator.auth.loginButton,
    { name: 'auth.loginButton', value: 'button[name="login"]' },
  );
}

async function isVisible(locator: Locator) {
  return locator.filter({ visible: true }).first().isVisible().catch(() => false);
}

async function openMenuIfChildHidden(
  menuButton: Locator,
  childLocator: Locator,
  menuButtonReport: LocatorReport,
) {
  if (!await isVisible(childLocator)) {
    await clickWithReport(menuButton.filter({ visible: true }).first(), menuButtonReport);
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
      {
        name: `navigation.sidebarMenuButton('${parentMenuName}')`,
        value: `role=button has exact text "${parentMenuName}"`,
      },
    );
  }
}

export async function clickSidebarMenuLink(page: Page, name: string) {
  const locator = locators(page);

  await clickWithReport(
    locator.navigation.sidebarMenuLink(name).filter({ visible: true }).first(),
    {
      name: `navigation.sidebarMenuLink('${name}')`,
      value: `role=link name="${name}"`,
    },
  );
}

export async function clickCreateLink(page: Page) {
  const locator = locators(page);

  await clickWithReport(
    locator.common.createLink,
    { name: 'common.createLink', value: 'a#action-create' },
  );
}
