import { Locator, Page, expect } from '@playwright/test';
import { LocatorReport, reportAssertion, reportError } from '../utils/action-report';
import { LOCATOR_REPORTS, locators } from '../locators/locators';
import { resolveTableColumnPosition } from '../utils/table';

export type AssertionOptions = {
  timeout?: number;
};

// Asagidaki primitive assertion wrapper'lari tum domain assertion dosyalari
// tarafindan kullanilir; yeni domain assertion dosyasi bunlari buradan import
// eder (kendi kopyasini yazmaz). Rapor expect'ten ONCE yazilir; boylece fail
// durumunda da hangi locator ve beklenen sonuc oldugu raporda gorunur.
export async function expectUrl(
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

export async function expectVisible(
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

export async function expectNotVisible(locator: Locator, locatorReport: LocatorReport) {
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

export async function expectCount(
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

export async function expectNotAttribute(
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

export async function expectHasValue(
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

export async function expectEnabled(locator: Locator, locatorReport: LocatorReport) {
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

export async function expectDisabled(locator: Locator, locatorReport: LocatorReport) {
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

export async function expectHeadingVisible(page: Page, headingText: string) {
  const locator = locators(page);

  await expectVisible(
    locator.common.heading(headingText),
    LOCATOR_REPORTS.common.heading(headingText),
  );
}

export async function expectTableColumnHeadersVisible(
  page: Page,
  expectedHeaders: readonly string[],
) {
  const locator = locators(page);

  for (const header of expectedHeaders) {
    await expectVisible(
      locator.common.tableColumnHeader(header),
      LOCATOR_REPORTS.common.tableColumnHeader(header),
    );
  }
}

export async function expectTableColumnValuesVisible(
  page: Page,
  columnName: string,
  expectedValues: readonly string[],
) {
  const locator = locators(page);

  await expectVisible(
    locator.common.tableColumnHeader(columnName),
    LOCATOR_REPORTS.common.tableColumnHeader(columnName),
  );

  const columnPosition = await resolveTableColumnPosition(page, columnName);

  for (const value of expectedValues) {
    await expectVisible(
      locator.common.tableColumnCell(columnName, value, columnPosition),
      LOCATOR_REPORTS.common.tableColumnCell(columnName, value, columnPosition),
    );
  }
}

export async function expectInputFieldsVisible(
  page: Page,
  expectedFields: readonly string[],
) {
  const locator = locators(page);

  for (const field of expectedFields) {
    await expectVisible(
      locator.common.inputField(field),
      LOCATOR_REPORTS.common.inputField(field),
    );
  }
}

export async function expectInputFieldValue(page: Page, fieldName: string, expectedValue: string) {
  const locator = locators(page);

  await expectHasValue(
    locator.common.inputField(fieldName),
    LOCATOR_REPORTS.common.inputField(fieldName),
    expectedValue,
    `"${expectedValue}" degeri yazili`,
  );
}

export async function expectInputFieldValueLengthLessThanOrEqual(
  page: Page,
  fieldName: string,
  maxLength: number,
) {
  const locator = locators(page);
  const input = locator.common.inputField(fieldName);
  const report = LOCATOR_REPORTS.common.inputField(fieldName);

  reportAssertion({
    assertion: 'To Have Value Length Less Than Or Equal',
    locatorName: report.name,
    locatorValue: report.value,
    expected: `girilen karakter sayisi <= ${maxLength}`,
  });
  try {
    await expect.poll(async () => {
      const value = await input.inputValue();
      return Array.from(value).length;
    }).toBeLessThanOrEqual(maxLength);
  } catch (error) {
    reportError({
      action: 'To Have Value Length Less Than Or Equal',
      locatorName: report.name,
      error,
    });
    throw error;
  }
}

export async function expectButtonVisible(page: Page, buttonName: string) {
  const locator = locators(page);

  await expectVisible(
    locator.common.button(buttonName),
    LOCATOR_REPORTS.common.button(buttonName),
  );
}

export async function expectButtonNotVisible(page: Page, buttonName: string) {
  const locator = locators(page);

  await expectNotVisible(
    locator.common.button(buttonName),
    LOCATOR_REPORTS.common.button(buttonName),
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
