import { Page } from '@playwright/test';
import { LOCATOR_REPORTS, locators } from '../locators/locators';
import { click, fillElement } from './common.actions';

export async function openOperationCodeDropdown(page: Page) {
  const locator = locators(page);

  await click(
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
    await click(combobox, LOCATOR_REPORTS.automaticParameters.operationCodeCombobox);
  }

  await click(
    locator.common.listboxOption(optionText),
    LOCATOR_REPORTS.common.listboxOption(optionText),
  );
}

export async function openTypeDropdown(page: Page) {
  const locator = locators(page);

  await dismissOpenMenu(page);
  await click(
    locator.automaticParameters.typeCombobox,
    LOCATOR_REPORTS.automaticParameters.typeCombobox,
  );
}

export async function openSubTypeDropdown(page: Page) {
  const locator = locators(page);

  await dismissOpenMenu(page);
  await click(
    locator.automaticParameters.subTypeCombobox,
    LOCATOR_REPORTS.automaticParameters.subTypeCombobox,
  );
}

export async function openKdvRateDropdown(page: Page) {
  const locator = locators(page);

  await dismissOpenMenu(page);
  await click(
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
