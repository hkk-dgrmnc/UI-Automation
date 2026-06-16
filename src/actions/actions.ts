import { Locator, Page } from '@playwright/test';
import { LocatorReport, reportAction, reportError } from '../utils/action-report';
import { LOCATOR_REPORTS, locators } from '../locators/locators';

async function fillWithReport(
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

async function clickWithReport(locator: Locator, locatorReport: LocatorReport) {
  reportAction({
    action: 'Click',
    locatorName: locatorReport.name,
    locatorValue: locatorReport.value,
  });
  try {
    await locator.click();
  } catch (error) {
    reportError({ action: 'Click', locatorName: locatorReport.name, error });
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

export async function openOperationCodeDropdown(page: Page) {
  const locator = locators(page);

  await clickWithReport(
    locator.automaticParameters.operationCodeCombobox,
    LOCATOR_REPORTS.automaticParameters.operationCodeCombobox,
  );
}

// MUI Select (Tür/Tür 2/KDV) menusu acikken modal backdrop bir sonraki tiklamayi
// engeller. Yeni bir dropdown'a/secime gecmeden once acik menuyu Escape ile kapatir.
async function dismissOpenMenu(page: Page) {
  await page.keyboard.press('Escape');
}

export async function selectOperationCode(page: Page, optionText: string) {
  const locator = locators(page);
  const combobox = locator.automaticParameters.operationCodeCombobox;

  // Onceki adim baska bir dropdown'i acik birakmis olabilir; once onu kapat.
  await dismissOpenMenu(page);

  // Dropdown zaten acik degilse ac (combobox tiklamasi toggle'dir; acikken tekrar
  // tiklarsak kapanir).
  if ((await combobox.getAttribute('aria-expanded')) !== 'true') {
    await clickWithReport(combobox, LOCATOR_REPORTS.automaticParameters.operationCodeCombobox);
  }

  await clickWithReport(
    locator.common.listboxOption(optionText),
    LOCATOR_REPORTS.common.listboxOption(optionText),
  );
}

export async function openTypeDropdown(page: Page) {
  const locator = locators(page);

  await dismissOpenMenu(page);
  await clickWithReport(
    locator.automaticParameters.typeCombobox,
    LOCATOR_REPORTS.automaticParameters.typeCombobox,
  );
}

export async function openSubTypeDropdown(page: Page) {
  const locator = locators(page);

  await dismissOpenMenu(page);
  await clickWithReport(
    locator.automaticParameters.subTypeCombobox,
    LOCATOR_REPORTS.automaticParameters.subTypeCombobox,
  );
}

export async function openKdvRateDropdown(page: Page) {
  const locator = locators(page);

  await dismissOpenMenu(page);
  await clickWithReport(
    locator.automaticParameters.kdvRateCombobox,
    LOCATOR_REPORTS.automaticParameters.kdvRateCombobox,
  );
}

export async function fillOperationDescription(page: Page, value: string) {
  const locator = locators(page);

  await fillElement(
    locator.automaticParameters.operationDescriptionInput,
    LOCATOR_REPORTS.automaticParameters.operationDescriptionInput,
    value,
  );
}

// --- Dinamik deger: oku / yaz / metne gore tikla ----------------------------
// Bu fonksiyonlar ScenarioStore'dan bagimsizdir: deger alir veya dondurur.
// Store'a saklama/okuma step katmaninda `this.store.save/get` ile yapilir
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
  await fillWithReport(locator, locatorReport, value, maskValue);
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

  await clickWithReport(target, report);
}
