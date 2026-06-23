import { Page } from '@playwright/test';
import { LOCATOR_REPORTS, locators } from '../locators/locators';
import { click, fillElement } from './common.actions';

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

export async function fillOperationDescription(page: Page, value: string) {
  const locator = locators(page);

  await fillElement(
    locator.automaticParameters.operationDescriptionInput,
    LOCATOR_REPORTS.automaticParameters.operationDescriptionInput,
    value,
  );
}
