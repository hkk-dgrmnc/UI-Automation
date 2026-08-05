import { Page } from '@playwright/test';
import { TimeoutOptions } from '../config/timeouts';
import { LOCATOR_REPORTS, locators } from '../locators/locators';
import { click } from './common.actions';

export async function clickButtonByName(page: Page, name: string, options: TimeoutOptions = {}) {
  const locator = locators(page);

  await click(
    locator.common.clickableControl(name).filter({ visible: true }).first(),
    LOCATOR_REPORTS.common.clickableControl(name),
    options,
  );
}
