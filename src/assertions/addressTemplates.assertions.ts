import { Page } from '@playwright/test';
import { TIMEOUTS } from '../config/timeouts';
import { LOCATOR_REPORTS, locators } from '../locators/locators';
import { expectUrl, expectVisible } from './common.assertions';

export async function expectAddressTemplatesPageOpened(page: Page) {
  const locator = locators(page);

  await expectUrl(page, /shell-app-ui\/#\/address-types/, { timeout: TIMEOUTS.uiOperation });
  await expectVisible(
    locator.navigation.selectedSidebarMenuLink('Adres Şablonu'),
    LOCATOR_REPORTS.navigation.selectedSidebarMenuLink('Adres Şablonu'),
  );
}

export async function expectAddressTemplateCreatePageOpened(page: Page) {
  await expectUrl(page, /shell-app-ui\/#\/address-types\/create/, {
    timeout: TIMEOUTS.uiOperation,
  });
}
