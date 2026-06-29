import { Page } from '@playwright/test';
import { LOCATOR_REPORTS, locators } from '../locators/locators';
import { expectVisible } from './common.assertions';

export async function expectSelectedSidebarMenu(page: Page, menuName: string) {
  const locator = locators(page);

  await expectVisible(
    locator.navigation.selectedSidebarMenuLink(menuName),
    LOCATOR_REPORTS.navigation.selectedSidebarMenuLink(menuName),
    { timeout: 30_000 },
  );
}
