import { Locator, Page } from '@playwright/test';
import { LocatorReport, reportAction, reportError } from '../utils/action-report';
import { LOCATOR_REPORTS, locators } from '../locators/locators';

export type ClickOptions = {
  timeout?: number;
};

// Raporlama bu projede her reusable wrapper'in varsayilan davranisidir; isim
// "ne yaptigini" soyler, "raporladigini" degil. Bu yuzden suffix yok: fill/click.
// Bu iki primitive tum domain action dosyalari tarafindan kullanilir; yeni domain
// action dosyasi bunlari buradan import eder (kendi kopyasini yazmaz).
export async function fill(
  locator: Locator,
  locatorReport: LocatorReport,
  value: string,
  maskValue = false,
) {
  reportAction({
    action: 'Fill',
    locatorName: locatorReport.name,
    locatorValue: locatorReport.value,
    value,
    maskValue,
  });
  try {
    await locator.fill(value);
  } catch (error) {
    reportError({ action: 'Fill', locatorName: locatorReport.name, error });
    throw error;
  }
}

export async function click(
  locator: Locator,
  locatorReport: LocatorReport,
  options: ClickOptions = {},
) {
  reportAction({
    action: 'Click',
    locatorName: locatorReport.name,
    locatorValue: locatorReport.value,
  });
  try {
    await locator.click(options);
  } catch (error) {
    reportError({ action: 'Click', locatorName: locatorReport.name, error });
    throw error;
  }
}

export async function clickCreateLink(page: Page) {
  const locator = locators(page);

  await click(
    locator.common.createLink,
    LOCATOR_REPORTS.common.createLink,
  );
}

export async function openDropdown(page: Page, name: string) {
  const locator = locators(page);

  if (await page.getByRole('listbox').count() > 0) {
    await page.keyboard.press('Escape');
  }

  await click(
    locator.common.dropdownCombobox(name),
    LOCATOR_REPORTS.common.dropdownCombobox(name),
  );
}

export async function selectDropdownOption(page: Page, dropdownName: string, optionText: string) {
  const locator = locators(page);

  await openDropdown(page, dropdownName);
  await click(
    locator.common.listboxOption(optionText),
    LOCATOR_REPORTS.common.listboxOption(optionText),
  );
}

// --- Dinamik deger: oku / yaz / metne gore tikla ----------------------------
// Bu fonksiyonlar ScenarioStore'dan bagimsizdir: deger alir veya dondurur.
// Store'a saklama/okuma step katmaninda `this.saveValue/getValue` ile yapilir
// (AGENTS.md 12.1). Boylece ayni fonksiyonlar literal degerle de kullanilabilir.

type TextMatchOptions = {
  /** true: metin verilen degere ESIT olmali; false: ICERMELI. Varsayilan true. */
  exact?: boolean;
};

/** Verilen elementin gorunur metnini okur, raporlar ve dondurur (store'a yazmaz). */
export async function readElementText(
  locator: Locator,
  locatorReport: LocatorReport,
): Promise<string> {
  try {
    const text = (await locator.innerText()).trim();
    reportAction({
      action: 'Read text',
      locatorName: locatorReport.name,
      locatorValue: locatorReport.value,
      value: text,
    });
    return text;
  } catch (error) {
    reportError({ action: 'Read text', locatorName: locatorReport.name, error });
    throw error;
  }
}

/** Verilen elementin bir attribute degerini okur, raporlar ve dondurur (store'a yazmaz). */
export async function readElementAttribute(
  locator: Locator,
  locatorReport: LocatorReport,
  attribute: string,
): Promise<string> {
  try {
    const value = await locator.getAttribute(attribute);
    if (value === null) {
      throw new Error(`"${locatorReport.name}" elementinde "${attribute}" attribute'u yok.`);
    }
    reportAction({
      action: `Read @${attribute}`,
      locatorName: locatorReport.name,
      locatorValue: locatorReport.value,
      value,
    });
    return value;
  } catch (error) {
    reportError({ action: `Read @${attribute}`, locatorName: locatorReport.name, error });
    throw error;
  }
}

/** Verilen elemana verilen degeri yazar (deger store'dan da gelebilir). */
export async function fillElement(
  locator: Locator,
  locatorReport: LocatorReport,
  value: string,
  maskValue = false,
) {
  await fill(locator, locatorReport, value, maskValue);
}

/** Metni verilen degere ESIT (exact) ya da ICEREN ilk gorunur elemana tiklar. */
export async function clickByText(
  page: Page,
  value: string,
  options: TextMatchOptions = {},
) {
  const exact = options.exact ?? true;
  const target = page.getByText(value, { exact }).first();

  // Runtime degerine bagli dinamik locator: LOCATOR_REPORTS'a statik giremez,
  // bu yuzden rapor metadatasi burada uretilir.
  const report: LocatorReport = {
    name: `getByText(${exact ? '=' : '~'} "${value}")`,
    value: `text ${exact ? 'equals' : 'contains'} "${value}"`,
  };

  await click(target, report);
}
