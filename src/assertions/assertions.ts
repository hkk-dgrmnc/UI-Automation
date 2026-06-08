import { Locator, Page, expect } from '@playwright/test';
import { LocatorReport, reportAssertion, reportError } from '../utils/action-report';
import { LOCATOR_REPORTS, locators } from '../locators/locators';

type AssertionOptions = {
  timeout?: number;
};

async function expectUrl(
  page: Page,
  expectedUrl: RegExp,
  options?: AssertionOptions,
) {
  await reportAssertion({
    assertion: 'To Have URL',
    locatorName: 'page',
    locatorValue: 'current page URL',
    expected: expectedUrl.toString(),
  });
  try {
    await expect(page).toHaveURL(expectedUrl, options);
  } catch (error) {
    await reportError({ action: 'To Have URL', locatorName: 'page', error });
    throw error;
  }
}

async function expectVisible(
  locator: Locator,
  locatorReport: LocatorReport,
  options?: AssertionOptions,
) {
  await reportAssertion({
    assertion: 'To Be Visible',
    locatorName: locatorReport.name,
    locatorValue: locatorReport.value,
    expected: 'visible',
  });
  try {
    await expect(locator).toBeVisible(options);
  } catch (error) {
    await reportError({ action: 'To Be Visible', locatorName: locatorReport.name, error });
    throw error;
  }
}

async function expectNotVisible(locator: Locator, locatorReport: LocatorReport) {
  await reportAssertion({
    assertion: 'Not To Be Visible',
    locatorName: locatorReport.name,
    locatorValue: locatorReport.value,
    expected: 'not visible',
  });
  try {
    await expect(locator).not.toBeVisible();
  } catch (error) {
    await reportError({ action: 'Not To Be Visible', locatorName: locatorReport.name, error });
    throw error;
  }
}

async function expectCount(
  locator: Locator,
  locatorReport: LocatorReport,
  count: number,
) {
  await reportAssertion({
    assertion: 'To Have Count',
    locatorName: locatorReport.name,
    locatorValue: locatorReport.value,
    expected: count.toString(),
  });
  try {
    await expect(locator).toHaveCount(count);
  } catch (error) {
    await reportError({ action: 'To Have Count', locatorName: locatorReport.name, error });
    throw error;
  }
}

async function expectNotAttribute(
  locator: Locator,
  locatorReport: LocatorReport,
  attributeName: string,
  attributeValue: string,
) {
  await reportAssertion({
    assertion: 'Not To Have Attribute',
    locatorName: locatorReport.name,
    locatorValue: locatorReport.value,
    expected: `${attributeName} is not "${attributeValue}"`,
  });
  try {
    await expect(locator).not.toHaveAttribute(attributeName, attributeValue);
  } catch (error) {
    await reportError({ action: 'Not To Have Attribute', locatorName: locatorReport.name, error });
    throw error;
  }
}

export async function expectLoginPageVisible(page: Page) {
  const locator = locators(page);

  await expectVisible(locator.auth.usernameInput, LOCATOR_REPORTS.auth.usernameInput);
  await expectVisible(locator.auth.passwordInput, LOCATOR_REPORTS.auth.passwordInput);
  await expectVisible(locator.auth.loginButton, LOCATOR_REPORTS.auth.loginButton);
}

export async function expectLoginSuccess(page: Page) {
  const locator = locators(page);

  await expectUrl(page, /shell-app-ui\/#\/journal-audits/);
  await expectNotVisible(locator.auth.usernameInput, LOCATOR_REPORTS.auth.usernameInput);
  await expectVisible(locator.auth.userProfileButton, LOCATOR_REPORTS.auth.userProfileButton, { timeout: 45_000 });
}

export async function expectAutomaticParametersRouteOpened(page: Page) {
  const locator = locators(page);

  await expectUrl(page, /shell-app-ui\/#\/automatic-parameters/, { timeout: 30_000 });
  await expectVisible(
    locator.navigation.selectedSidebarMenuLink('Otomatik Parametre Tanımlama'),
    LOCATOR_REPORTS.navigation.selectedSidebarMenuLink('Otomatik Parametre Tanımlama'),
  );
  await expectVisible(
    locator.automaticParameters.listTitle,
    LOCATOR_REPORTS.automaticParameters.listTitle,
    { timeout: 30_000 },
  );
}

export async function expectAutomaticParametersCreateLinkAvailable(page: Page) {
  const locator = locators(page);

  await expectCount(locator.common.createLink, LOCATOR_REPORTS.common.createLink, 1);
  await expectNotAttribute(
    locator.common.createLink,
    LOCATOR_REPORTS.common.createLink,
    'aria-disabled',
    'true',
  );
}

export async function expectAutomaticParametersCreatePageOpened(page: Page) {
  const locator = locators(page);

  await expectUrl(page, /shell-app-ui\/#\/automatic-parameters\/create/, { timeout: 30_000 });
  await expectVisible(
    locator.automaticParameters.infoTitle,
    LOCATOR_REPORTS.automaticParameters.infoTitle,
    { timeout: 30_000 },
  );
}
