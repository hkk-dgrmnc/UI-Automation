import { Locator, Page } from '@playwright/test';
import { resolveUiTimeout, TIMEOUTS, TimeoutOptions } from '../config/timeouts';
import { LocatorReport, reportAction, reportError } from '../utils/action-report';

export type ClickOptions = TimeoutOptions;

// Raporlama bu projede her reusable wrapper'in varsayilan davranisidir; isim
// "ne yaptigini" soyler, "raporladigini" degil. Bu yuzden suffix yok: fill/click.
// Bu iki primitive tum domain action dosyalari tarafindan kullanilir; yeni domain
// action dosyasi bunlari buradan import eder (kendi kopyasini yazmaz).
export async function fill(
  locator: Locator,
  locatorReport: LocatorReport,
  value: string,
  maskValue = false,
  options: TimeoutOptions = {},
) {
  reportAction({
    action: 'Fill',
    locatorName: locatorReport.name,
    locatorValue: locatorReport.value,
    value,
    maskValue,
  });
  try {
    await locator.fill(value, { timeout: resolveUiTimeout(options) });
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
    await locator.click({ timeout: resolveUiTimeout(options) });
  } catch (error) {
    reportError({ action: 'Click', locatorName: locatorReport.name, error });
    throw error;
  }
}

function resolveWaitMilliseconds(secondsText: string) {
  const normalized = secondsText.trim().replace(',', '.');
  const maximumWaitMilliseconds = TIMEOUTS.cucumberStep - 1_000;

  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,3})?$/.test(normalized)) {
    throw new RangeError(`Bekleme suresi pozitif bir sayi olmalidir. Alinan: "${secondsText}"`);
  }

  const milliseconds = Number(normalized) * 1_000;
  if (
    !Number.isSafeInteger(milliseconds) ||
    milliseconds <= 0 ||
    milliseconds > maximumWaitMilliseconds
  ) {
    throw new RangeError(
      `Bekleme suresi 0 ile ${maximumWaitMilliseconds / 1_000} saniye arasinda olmalidir. Alinan: "${secondsText}"`,
    );
  }

  return milliseconds;
}

/** Feature'dan string olarak gelen saniye degeri kadar raporlanan dinamik bekleme yapar. */
export async function waitForSeconds(secondsText: string) {
  const timerReport: LocatorReport = {
    name: 'timer',
    value: 'duration-based delay; no UI locator',
  };

  try {
    const milliseconds = resolveWaitMilliseconds(secondsText);
    reportAction({
      action: 'Wait',
      locatorName: timerReport.name,
      locatorValue: timerReport.value,
      value: `${milliseconds / 1_000} saniye`,
    });
    await new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
  } catch (error) {
    reportError({ action: 'Wait', locatorName: timerReport.name, error });
    throw error;
  }
}

// --- Dinamik deger: oku / yaz / metne gore tikla ----------------------------
// Bu fonksiyonlar ScenarioStore'dan bagimsizdir: deger alir veya dondurur.
// Store'a saklama/okuma step katmaninda `this.saveValue/getValue` ile yapilir
// (AGENTS.md 12.1). Boylece ayni fonksiyonlar literal degerle de kullanilabilir.

type TextMatchOptions = {
  /** true: metin verilen degere ESIT olmali; false: ICERMELI. Varsayilan true. */
  exact?: boolean;
} & TimeoutOptions;

/** Verilen elementin gorunur metnini okur, raporlar ve dondurur (store'a yazmaz). */
export async function readElementText(
  locator: Locator,
  locatorReport: LocatorReport,
  options: TimeoutOptions = {},
): Promise<string> {
  try {
    const text = (await locator.innerText({ timeout: resolveUiTimeout(options) })).trim();
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
  options: TimeoutOptions = {},
): Promise<string> {
  try {
    const value = await locator.getAttribute(attribute, {
      timeout: resolveUiTimeout(options),
    });
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
  options: TimeoutOptions = {},
) {
  await fill(locator, locatorReport, value, maskValue, options);
}

/** Metni verilen degere ESIT (exact) ya da ICEREN ilk gorunur elemana tiklar. */
export async function clickByText(page: Page, value: string, options: TextMatchOptions = {}) {
  const exact = options.exact ?? true;
  const target = page.getByText(value, { exact }).first();

  // Runtime degerine bagli dinamik locator: LOCATOR_REPORTS'a statik giremez,
  // bu yuzden rapor metadatasi burada uretilir.
  const report: LocatorReport = {
    name: `getByText(${exact ? '=' : '~'} "${value}")`,
    value: `text ${exact ? 'equals' : 'contains'} "${value}"`,
  };

  await click(target, report, options);
}
