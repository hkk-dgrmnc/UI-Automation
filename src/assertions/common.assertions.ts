import { Locator, Page, expect } from '@playwright/test';
import { resolveUiTimeout, TimeoutOptions } from '../config/timeouts';
import { LocatorReport, reportAssertion, reportError } from '../utils/action-report';
import { LOCATOR_REPORTS, locators } from '../locators/locators';

export type AssertionOptions = TimeoutOptions;

// Asagidaki primitive assertion wrapper'lari tum domain assertion dosyalari
// tarafindan kullanilir; yeni domain assertion dosyasi bunlari buradan import
// eder (kendi kopyasini yazmaz). Rapor expect'ten ONCE yazilir; boylece fail
// durumunda da hangi locator ve beklenen sonuc oldugu raporda gorunur.
export async function expectUrl(page: Page, expectedUrl: RegExp, options: AssertionOptions = {}) {
  reportAssertion({
    assertion: 'To Have URL',
    locatorName: 'page',
    locatorValue: 'current page URL',
    expected: expectedUrl.toString(),
  });
  try {
    await expect(page).toHaveURL(expectedUrl, { timeout: resolveUiTimeout(options) });
  } catch (error) {
    reportError({ action: 'To Have URL', locatorName: 'page', error });
    throw error;
  }
}

export async function expectVisible(
  locator: Locator,
  locatorReport: LocatorReport,
  options: AssertionOptions = {},
) {
  reportAssertion({
    assertion: 'To Be Visible',
    locatorName: locatorReport.name,
    locatorValue: locatorReport.value,
    expected: 'visible',
  });
  try {
    await expect(locator).toBeVisible({ timeout: resolveUiTimeout(options) });
  } catch (error) {
    reportError({ action: 'To Be Visible', locatorName: locatorReport.name, error });
    throw error;
  }
}

export async function expectNotVisible(
  locator: Locator,
  locatorReport: LocatorReport,
  options: AssertionOptions = {},
) {
  reportAssertion({
    assertion: 'Not To Be Visible',
    locatorName: locatorReport.name,
    locatorValue: locatorReport.value,
    expected: 'not visible',
  });
  try {
    await expect(locator).not.toBeVisible({ timeout: resolveUiTimeout(options) });
  } catch (error) {
    reportError({ action: 'Not To Be Visible', locatorName: locatorReport.name, error });
    throw error;
  }
}

export async function expectCount(
  locator: Locator,
  locatorReport: LocatorReport,
  count: number,
  options: AssertionOptions = {},
) {
  reportAssertion({
    assertion: 'To Have Count',
    locatorName: locatorReport.name,
    locatorValue: locatorReport.value,
    expected: count.toString(),
  });
  try {
    await expect(locator).toHaveCount(count, { timeout: resolveUiTimeout(options) });
  } catch (error) {
    reportError({ action: 'To Have Count', locatorName: locatorReport.name, error });
    throw error;
  }
}

export async function expectHasValue(
  locator: Locator,
  locatorReport: LocatorReport,
  expected: string | RegExp,
  expectedDescription: string,
  options: AssertionOptions = {},
) {
  reportAssertion({
    assertion: 'To Have Value',
    locatorName: locatorReport.name,
    locatorValue: locatorReport.value,
    expected: expectedDescription,
  });
  try {
    await expect(locator).toHaveValue(expected, { timeout: resolveUiTimeout(options) });
  } catch (error) {
    reportError({ action: 'To Have Value', locatorName: locatorReport.name, error });
    throw error;
  }
}

export async function expectEnabled(
  locator: Locator,
  locatorReport: LocatorReport,
  options: AssertionOptions = {},
) {
  reportAssertion({
    assertion: 'To Be Enabled',
    locatorName: locatorReport.name,
    locatorValue: locatorReport.value,
    expected: 'enabled (aktif)',
  });
  try {
    await expect(locator).toBeEnabled({ timeout: resolveUiTimeout(options) });
  } catch (error) {
    reportError({ action: 'To Be Enabled', locatorName: locatorReport.name, error });
    throw error;
  }
}

export async function expectDisabled(
  locator: Locator,
  locatorReport: LocatorReport,
  options: AssertionOptions = {},
) {
  reportAssertion({
    assertion: 'To Be Disabled',
    locatorName: locatorReport.name,
    locatorValue: locatorReport.value,
    expected: 'disabled (pasif)',
  });
  try {
    await expect(locator).toBeDisabled({ timeout: resolveUiTimeout(options) });
  } catch (error) {
    reportError({ action: 'To Be Disabled', locatorName: locatorReport.name, error });
    throw error;
  }
}

export async function expectHeadingVisible(
  page: Page,
  headingText: string,
  options: AssertionOptions = {},
) {
  const locator = locators(page);

  await expectVisible(
    locator.common.heading(headingText),
    LOCATOR_REPORTS.common.heading(headingText),
    options,
  );
}

// --- Dinamik deger: metne gore varlik dogrulama -----------------------------
// Store'dan bagimsizdir: deger alir. Kayitli degerle kullanim step katmaninda
// `this.getValue(name)` ile yapilir (AGENTS.md 12.1). Baska sayfada da calisir.

/**
 * Sayfada metni verilen degere ESIT (exact) ya da ICEREN en az bir gorunur
 * eleman bulundugunu dogrular.
 */
export async function expectTextPresent(
  page: Page,
  value: string,
  options: { exact?: boolean } & AssertionOptions = {},
) {
  const { exact = true } = options;
  const target = page.getByText(value, { exact }).first();
  const name = `getByText(${exact ? '=' : '~'} "${value}")`;

  reportAssertion({
    assertion: 'To Be Visible',
    locatorName: name,
    locatorValue: `text ${exact ? 'equals' : 'contains'} "${value}"`,
    expected: `metni "${value}" ${exact ? 'degerine esit' : 'degerini iceren'} eleman var`,
  });
  try {
    await expect(target).toBeVisible({ timeout: resolveUiTimeout(options) });
  } catch (error) {
    reportError({ action: 'To Be Visible', locatorName: name, error });
    throw error;
  }
}
