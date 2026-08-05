import { Page } from '@playwright/test';
import { TimeoutOptions } from '../config/timeouts';
import { LOCATOR_REPORTS, locators } from '../locators/locators';
import { fillElement } from './common.actions';

export async function fillInputFieldByName(
  page: Page,
  fieldName: string,
  value: string,
  options: TimeoutOptions = {},
) {
  const locator = locators(page);

  await fillElement(
    locator.common.inputField(fieldName),
    LOCATOR_REPORTS.common.inputField(fieldName),
    value,
    false,
    options,
  );
}
