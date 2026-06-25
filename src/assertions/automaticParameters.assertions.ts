import { Page } from '@playwright/test';
import {
  LOCATOR_REPORTS,
  OPERATION_CODE_OPTIONS,
  locators,
} from '../locators/locators';
import {
  expectCount,
  expectDisabled,
  expectEnabled,
  expectHasValue,
  expectUrl,
  expectVisible,
} from './common.assertions';

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
