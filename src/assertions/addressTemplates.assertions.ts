import { Page } from '@playwright/test';
import { TIMEOUTS } from '../config/timeouts';
import { expectUrl } from './common.assertions';
import { expectSelectedSidebarMenu } from './navigation.assertions';

export async function expectAddressTemplatesPageOpened(page: Page) {
  await expectUrl(page, /shell-app-ui\/#\/address-types/, { timeout: TIMEOUTS.uiOperation });
  await expectSelectedSidebarMenu(page, 'Adres Şablonu');
}

export async function expectAddressTemplateCreatePageOpened(page: Page) {
  await expectUrl(page, /shell-app-ui\/#\/address-types\/create/, {
    timeout: TIMEOUTS.uiOperation,
  });
}
