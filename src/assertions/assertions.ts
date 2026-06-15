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
  reportAssertion({
    assertion: 'To Have URL',
    locatorName: 'page',
    locatorValue: 'current page URL',
    expected: expectedUrl.toString(),
  });
  try {
    await expect(page).toHaveURL(expectedUrl, options);
  } catch (error) {
    reportError({ action: 'To Have URL', locatorName: 'page', error });
    throw error;
  }
}

async function expectVisible(
  locator: Locator,
  locatorReport: LocatorReport,
  options?: AssertionOptions,
) {
  reportAssertion({
    assertion: 'To Be Visible',
    locatorName: locatorReport.name,
    locatorValue: locatorReport.value,
    expected: 'visible',
  });
  try {
    await expect(locator).toBeVisible(options);
  } catch (error) {
    reportError({ action: 'To Be Visible', locatorName: locatorReport.name, error });
    throw error;
  }
}

async function expectNotVisible(locator: Locator, locatorReport: LocatorReport) {
  reportAssertion({
    assertion: 'Not To Be Visible',
    locatorName: locatorReport.name,
    locatorValue: locatorReport.value,
    expected: 'not visible',
  });
  try {
    await expect(locator).not.toBeVisible();
  } catch (error) {
    reportError({ action: 'Not To Be Visible', locatorName: locatorReport.name, error });
    throw error;
  }
}

async function expectCount(
  locator: Locator,
  locatorReport: LocatorReport,
  count: number,
) {
  reportAssertion({
    assertion: 'To Have Count',
    locatorName: locatorReport.name,
    locatorValue: locatorReport.value,
    expected: count.toString(),
  });
  try {
    await expect(locator).toHaveCount(count);
  } catch (error) {
    reportError({ action: 'To Have Count', locatorName: locatorReport.name, error });
    throw error;
  }
}

async function expectNotAttribute(
  locator: Locator,
  locatorReport: LocatorReport,
  attributeName: string,
  attributeValue: string,
) {
  reportAssertion({
    assertion: 'Not To Have Attribute',
    locatorName: locatorReport.name,
    locatorValue: locatorReport.value,
    expected: `${attributeName} is not "${attributeValue}"`,
  });
  try {
    await expect(locator).not.toHaveAttribute(attributeName, attributeValue);
  } catch (error) {
    reportError({ action: 'Not To Have Attribute', locatorName: locatorReport.name, error });
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

// --- Dinamik deger: metne gore varlik dogrulama -----------------------------
// Store'dan bagimsizdir: deger alir. Kayitli degerle kullanim step katmaninda
// `this.store.get(name)` ile yapilir (AGENTS.md 12.1). Baska sayfada da calisir.

/**
 * Sayfada metni verilen degere ESIT (exact) ya da ICEREN en az bir gorunur
 * eleman bulundugunu dogrular.
 */
export async function expectTextPresent(
  page: Page,
  value: string,
  options: { exact?: boolean } & AssertionOptions = {},
) {
  const { exact = true, timeout } = options;
  const target = page.getByText(value, { exact }).first();
  const name = `getByText(${exact ? '=' : '~'} "${value}")`;

  reportAssertion({
    assertion: 'To Be Visible',
    locatorName: name,
    locatorValue: `text ${exact ? 'equals' : 'contains'} "${value}"`,
    expected: `metni "${value}" ${exact ? 'degerine esit' : 'degerini iceren'} eleman var`,
  });
  try {
    await expect(target).toBeVisible({ timeout });
  } catch (error) {
    reportError({ action: 'To Be Visible', locatorName: name, error });
    throw error;
  }
}
