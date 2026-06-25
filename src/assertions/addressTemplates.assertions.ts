import { Page } from '@playwright/test';
import { LOCATOR_REPORTS, locators } from '../locators/locators';
import { expectUrl, expectVisible } from './common.assertions';

export async function expectAddressTemplatesPageOpened(page: Page) {
  const locator = locators(page);

  await expectUrl(page, /shell-app-ui\/#\/address-types/, { timeout: 30_000 });
  await expectVisible(
    locator.navigation.selectedSidebarMenuLink('Adres Şablonu'),
    LOCATOR_REPORTS.navigation.selectedSidebarMenuLink('Adres Şablonu'),
  );
}

export async function expectAddressTemplateCreatePageOpened(page: Page) {
  await expectUrl(page, /shell-app-ui\/#\/address-types\/create/, { timeout: 30_000 });
}
