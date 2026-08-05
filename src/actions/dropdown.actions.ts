import { Page } from '@playwright/test';
import { TimeoutOptions } from '../config/timeouts';
import { LOCATOR_REPORTS, locators } from '../locators/locators';
import { click } from './common.actions';

export async function openDropdown(page: Page, name: string, options: TimeoutOptions = {}) {
  const locator = locators(page);

  if ((await page.getByRole('listbox').count()) > 0) {
    await page.keyboard.press('Escape');
  }

  await click(
    locator.common.dropdownCombobox(name),
    LOCATOR_REPORTS.common.dropdownCombobox(name),
    options,
  );
}

export async function selectDropdownOption(
  page: Page,
  dropdownName: string,
  optionText: string,
  options: TimeoutOptions = {},
) {
  const locator = locators(page);

  await openDropdown(page, dropdownName, options);
  await click(
    locator.common.listboxOption(optionText),
    LOCATOR_REPORTS.common.listboxOption(optionText),
    options,
  );
}
