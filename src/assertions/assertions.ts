import { Locator, Page, expect } from '@playwright/test';
import { LocatorReport, reportAssertion, reportError } from '../utils/action-report';
import {
  LOCATOR_REPORTS,
  OPERATION_CODE_OPTIONS,
  locators,
} from '../locators/locators';

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

async function expectHasValue(
  locator: Locator,
  locatorReport: LocatorReport,
  expected: string | RegExp,
  expectedDescription: string,
) {
  reportAssertion({
    assertion: 'To Have Value',
    locatorName: locatorReport.name,
    locatorValue: locatorReport.value,
    expected: expectedDescription,
  });
  try {
    await expect(locator).toHaveValue(expected);
  } catch (error) {
    reportError({ action: 'To Have Value', locatorName: locatorReport.name, error });
    throw error;
  }
}

async function expectEnabled(locator: Locator, locatorReport: LocatorReport) {
  reportAssertion({
    assertion: 'To Be Enabled',
    locatorName: locatorReport.name,
    locatorValue: locatorReport.value,
    expected: 'enabled (aktif)',
  });
  try {
    await expect(locator).toBeEnabled();
  } catch (error) {
    reportError({ action: 'To Be Enabled', locatorName: locatorReport.name, error });
    throw error;
  }
}

async function expectDisabled(locator: Locator, locatorReport: LocatorReport) {
  reportAssertion({
    assertion: 'To Be Disabled',
    locatorName: locatorReport.name,
    locatorValue: locatorReport.value,
    expected: 'disabled (pasif)',
  });
  try {
    await expect(locator).toBeDisabled();
  } catch (error) {
    reportError({ action: 'To Be Disabled', locatorName: locatorReport.name, error });
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

export async function expectOperationCodeListFormatted(page: Page) {
  const locator = locators(page);

  await expectCount(
    locator.common.listboxOptions,
    LOCATOR_REPORTS.common.listboxOptions,
    OPERATION_CODE_OPTIONS.length,
  );

  for (const optionText of OPERATION_CODE_OPTIONS) {
    await expectVisible(
      locator.common.listboxOption(optionText),
      LOCATOR_REPORTS.common.listboxOption(optionText),
    );
  }
}

// Acik listboxlar arasindan adi listName olani secip id'sini dondurur. MUI'de acik
// listbox'in aria-labelledby'i ilgili alanin label'ina isaret eder (orn. Tür listesi
// -> "Tür" label'i). Gercek sayfada dogrulandi. Boylece ekranda birden fazla liste
// acik olsa bile dogru olan ada gore secilir; yanlis listeden eslesme olmaz.
async function resolveOpenListboxId(page: Page, listName: string): Promise<string> {
  const listboxes = page.getByRole('listbox');

  // En az bir acik liste olusana kadar bekle (retriable); aksi halde getAttribute
  // erken calisip listeyi bulamaz.
  await listboxes.first().waitFor({ state: 'visible' });

  const count = await listboxes.count();
  for (let index = 0; index < count; index += 1) {
    const listbox = listboxes.nth(index);
    const labelledBy = (await listbox.getAttribute('aria-labelledby'))?.split(' ')[0];
    if (!labelledBy) continue;

    // Label metni "Tür *" gibi zorunlu yildizi icerebilir; normalize edip karsilastir.
    const labelText = (await page.locator(`[id="${labelledBy}"]`).innerText())
      .replace('*', '')
      .trim();
    if (labelText !== listName) continue;

    const id = await listbox.getAttribute('id');
    if (id) return id;
  }

  throw new Error(`"${listName}" adlı açık bir liste (listbox) bulunamadı.`);
}

// Generic dropdown secenek dogrulamasi (AGENTS.md 9.1). Beklenen secenekler step'ten
// (feature Data Table) gelir; sayfa-ozel secenek listesi koda gomulmez.
// listName ("Tür" / "Tür 2" / "KDV Oranı" ...) ile ACIK dropdown'in KENDI listbox'i
// hedeflenir (resolveOpenListboxId) ve secenekler SADECE o listbox icinde aranir.
// Boylece "Tür" dendiginde fiziksel olarak Tür listesine bakilir; baska bir liste
// acik kalsa bile yanlis listeden eslesme olmaz.
export async function expectListboxOptionsVisible(
  page: Page,
  listName: string,
  expectedTexts: readonly string[],
) {
  const locator = locators(page);
  const listboxId = await resolveOpenListboxId(page, listName);

  for (const text of expectedTexts) {
    await expectVisible(
      locator.common.optionInListbox(listboxId, text),
      LOCATOR_REPORTS.common.optionInListbox(listboxId, text),
    );
  }
}

export async function expectOperationDescriptionMaxLengthAndTurkish(page: Page) {
  const locator = locators(page);
  const report = LOCATOR_REPORTS.automaticParameters.operationDescriptionInput;
  const input = locator.automaticParameters.operationDescriptionInput;

  // 15 karakterden uzun bir deger girilince alan tam 15 karaktere kirpilir (max sinir).
  await expectHasValue(input, report, /^.{15}$/, 'tam 15 karakter (max 15)');
  // Girilen Türkçe karakterler korunur (ı/ş gibi).
  await expectHasValue(input, report, /[ışğüçöİŞĞÜÇÖ]/, 'Türkçe karakter korunur');
}

export async function expectOperationDescriptionRequired(page: Page) {
  const locator = locators(page);

  await expectVisible(
    locator.automaticParameters.operationDescriptionRequiredLabel,
    LOCATOR_REPORTS.automaticParameters.operationDescriptionRequiredLabel,
  );
}

// İşlem Kodu secimine gore Tür 2 / KDV Oranı alanlarinin aktif/pasif durumu.
// Gercek ekranda dogrulandi: [001] -> Tür 2 aktif, KDV pasif; [002] -> ikisi de
// pasif; [003] -> Tür 2 pasif, KDV aktif.

export async function expectSubTypeEnabledKdvRateDisabled(page: Page) {
  const locator = locators(page);

  await expectEnabled(locator.automaticParameters.subTypeCombobox, LOCATOR_REPORTS.automaticParameters.subTypeCombobox);
  await expectDisabled(locator.automaticParameters.kdvRateCombobox, LOCATOR_REPORTS.automaticParameters.kdvRateCombobox);
}

export async function expectSubTypeAndKdvRateDisabled(page: Page) {
  const locator = locators(page);

  await expectDisabled(locator.automaticParameters.subTypeCombobox, LOCATOR_REPORTS.automaticParameters.subTypeCombobox);
  await expectDisabled(locator.automaticParameters.kdvRateCombobox, LOCATOR_REPORTS.automaticParameters.kdvRateCombobox);
}

export async function expectSubTypeDisabledKdvRateEnabled(page: Page) {
  const locator = locators(page);

  await expectDisabled(locator.automaticParameters.subTypeCombobox, LOCATOR_REPORTS.automaticParameters.subTypeCombobox);
  await expectEnabled(locator.automaticParameters.kdvRateCombobox, LOCATOR_REPORTS.automaticParameters.kdvRateCombobox);
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
