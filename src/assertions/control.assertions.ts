import { Page } from '@playwright/test';
import { LOCATOR_REPORTS, locators } from '../locators/locators';
import { AssertionOptions, expectNotVisible, expectVisible } from './common.assertions';

// "Buton" gorunurluk dogrulamasi, tiklama step'i ile AYNI kontrol ailesini hedefler
// (common.clickableControl: role=button / role=link / a#action-create). Boylece
// "X butonuna tiklanir" ile tiklanabilen bir kontrol (orn. link olan "Oluştur")
// "X butonu görüldüğü doğrulanır" ile de tutarli sekilde dogrulanabilir.
export async function expectButtonVisible(
  page: Page,
  buttonName: string,
  options: AssertionOptions = {},
) {
  const locator = locators(page);

  await expectVisible(
    locator.common.clickableControl(buttonName).filter({ visible: true }).first(),
    LOCATOR_REPORTS.common.clickableControl(buttonName),
    options,
  );
}

export async function expectButtonNotVisible(
  page: Page,
  buttonName: string,
  options: AssertionOptions = {},
) {
  const locator = locators(page);

  await expectNotVisible(
    locator.common.clickableControl(buttonName).filter({ visible: true }).first(),
    LOCATOR_REPORTS.common.clickableControl(buttonName),
    options,
  );
}
