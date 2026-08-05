import { Locator, Page, expect } from '@playwright/test';
import { resolveUiTimeout } from '../config/timeouts';
import { LOCATOR_REPORTS, locators } from '../locators/locators';
import { LocatorReport, reportAssertion, reportError } from '../utils/action-report';
import { escapeRegExp } from '../utils/regex';
import { AssertionOptions, expectVisible } from './common.assertions';

function escapeAttributeValue(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function normalizeControlValue(value: string) {
  return value
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function resolveDropdownControlByLabel(
  page: Page,
  fieldName: string,
  options: AssertionOptions,
) {
  const labelText = new RegExp(`^\\s*${escapeRegExp(fieldName)}[\\s\\u2009]*\\*?\\s*$`);
  const label = page.locator('label').filter({ hasText: labelText }).first();

  await label.waitFor({ state: 'visible', timeout: resolveUiTimeout(options) });

  const controlId = await label.getAttribute('for', { timeout: resolveUiTimeout(options) });
  if (!controlId) {
    throw new Error(`"${fieldName}" dropdown etiketi icin bagli kontrol id'si bulunamadi.`);
  }

  const locator = page.locator(`[id="${escapeAttributeValue(controlId)}"]`);
  // Bu locator KAYITLI common.dropdownCombobox degildir: secili degeri okumak icin
  // label[for] -> gercek kontrol id'si uzerinden cozulur. Rapor adi bu yuzden kayitli
  // locator'i taklit etmez, gercek cozum yolunu yansitir (AGENTS.md 6).
  const locatorReport: LocatorReport = {
    name: `dropdownControlByLabel('${fieldName}')`,
    value: `label "${fieldName}" for="${controlId}" -> #${controlId}`,
  };

  return { locator, locatorReport };
}

async function readControlValue(locator: Locator, options: AssertionOptions) {
  await locator.waitFor({ state: 'attached', timeout: resolveUiTimeout(options) });

  return locator.evaluate((element) => {
    if (
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement ||
      element instanceof HTMLSelectElement
    ) {
      return element.value;
    }

    return element.textContent ?? '';
  });
}

// Acik listboxlar arasindan adi listName olani secip id'sini dondurur. MUI'de acik
// listbox'in aria-labelledby'i ilgili alanin label'ina isaret eder (orn. Tür listesi
// -> "Tür" label'i). Gercek sayfada dogrulandi. Boylece ekranda birden fazla liste
// acik olsa bile dogru olan ada gore secilir; yanlis listeden eslesme olmaz.
async function resolveOpenListboxId(
  page: Page,
  listName: string,
  options: AssertionOptions,
): Promise<string> {
  const listboxes = page.getByRole('listbox');
  const timeout = resolveUiTimeout(options);

  // En az bir acik liste olusana kadar bekle (retriable); aksi halde getAttribute
  // erken calisip listeyi bulamaz.
  await listboxes.first().waitFor({
    state: 'visible',
    timeout,
  });

  const count = await listboxes.count();
  for (let index = 0; index < count; index += 1) {
    const listbox = listboxes.nth(index);
    const labelledBy = (await listbox.getAttribute('aria-labelledby', { timeout }))?.split(' ')[0];
    if (!labelledBy) continue;

    // Label metni "Tür *" gibi zorunlu yildizi icerebilir; normalize edip karsilastir.
    const labelText = (await page.locator(`[id="${labelledBy}"]`).innerText({ timeout }))
      .replace('*', '')
      .trim();
    if (labelText !== listName) continue;

    const id = await listbox.getAttribute('id', { timeout });
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
  options: AssertionOptions = {},
) {
  const locator = locators(page);
  const listboxId = await resolveOpenListboxId(page, listName, options);

  for (const text of expectedTexts) {
    await expectVisible(
      locator.common.optionInListbox(listboxId, text),
      LOCATOR_REPORTS.common.optionInListbox(listboxId, text),
      options,
    );
  }
}

export async function expectDropdownFieldsVisible(
  page: Page,
  expectedFields: readonly string[],
  options: AssertionOptions = {},
) {
  const locator = locators(page);

  for (const field of expectedFields) {
    await expectVisible(
      locator.common.dropdownCombobox(field),
      LOCATOR_REPORTS.common.dropdownCombobox(field),
      options,
    );
  }
}

export async function expectDropdownFieldSelectedValue(
  page: Page,
  fieldName: string,
  expectedValue: string,
  options: AssertionOptions = {},
) {
  const { locator, locatorReport } = await resolveDropdownControlByLabel(page, fieldName, options);
  const normalizedExpectedValue = normalizeControlValue(expectedValue);

  reportAssertion({
    assertion: 'To Have Exact Selected Dropdown Value',
    locatorName: locatorReport.name,
    locatorValue: locatorReport.value,
    expected: `secili degerin tam olarak "${normalizedExpectedValue}" olmasi`,
  });
  try {
    await expect
      .poll(async () => normalizeControlValue(await readControlValue(locator, options)), {
        timeout: resolveUiTimeout(options),
      })
      .toBe(normalizedExpectedValue);
  } catch (error) {
    reportError({
      action: 'To Have Exact Selected Dropdown Value',
      locatorName: locatorReport.name,
      error,
    });
    throw error;
  }
}
