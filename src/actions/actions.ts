import { Locator, Page } from '@playwright/test';
import { LocatorReport, reportAction, reportError } from '../utils/action-report';
import { LOCATOR_REPORTS, locators } from '../locators/locators';

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
  try {
    await locator.fill(value);
  } catch (error) {
    await reportError({ action: 'Fill', locatorName: locatorReport.name, error });
    throw error;
  }
}

async function clickWithReport(locator: Locator, locatorReport: LocatorReport) {
  await reportAction({
    action: 'Click',
    locatorName: locatorReport.name,
    locatorValue: locatorReport.value,
  });
  try {
    await locator.click();
  } catch (error) {
    await reportError({ action: 'Click', locatorName: locatorReport.name, error });
    throw error;
  }
}

export async function fillLoginUsername(page: Page, username: string) {
  const locator = locators(page);

  await fillWithReport(
    locator.auth.usernameInput,
    LOCATOR_REPORTS.auth.usernameInput,
    username,
  );
}

export async function fillLoginPassword(page: Page, password: string) {
  const locator = locators(page);

  await fillWithReport(
    locator.auth.passwordInput,
    LOCATOR_REPORTS.auth.passwordInput,
    password,
    true,
  );
}

export async function clickLoginButton(page: Page) {
  const locator = locators(page);

  await clickWithReport(
    locator.auth.loginButton,
    LOCATOR_REPORTS.auth.loginButton,
  );
}

async function isVisible(locator: Locator) {
  return (await locator.filter({ visible: true }).count()) > 0;
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
      LOCATOR_REPORTS.navigation.sidebarMenuButton(parentMenuName),
    );
  }
}

export async function clickSidebarMenuLink(page: Page, name: string) {
  const locator = locators(page);

  await clickWithReport(
    locator.navigation.sidebarMenuLink(name).filter({ visible: true }).first(),
    LOCATOR_REPORTS.navigation.sidebarMenuLink(name),
  );
}

export async function clickCreateLink(page: Page) {
  const locator = locators(page);

  await clickWithReport(
    locator.common.createLink,
    LOCATOR_REPORTS.common.createLink,
  );
}
