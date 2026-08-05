import { Page } from '@playwright/test';
import { LOCATOR_REPORTS, locators } from '../locators/locators';
import { resolveTableColumnPosition } from '../utils/table';
import { AssertionOptions, expectVisible } from './common.assertions';

export async function expectTableColumnHeadersVisible(
  page: Page,
  expectedHeaders: readonly string[],
  options: AssertionOptions = {},
) {
  const locator = locators(page);

  for (const header of expectedHeaders) {
    await expectVisible(
      locator.common.tableColumnHeader(header),
      LOCATOR_REPORTS.common.tableColumnHeader(header),
      options,
    );
  }
}

export async function expectTableColumnValuesVisible(
  page: Page,
  columnName: string,
  expectedValues: readonly string[],
  options: AssertionOptions = {},
) {
  const locator = locators(page);

  await expectVisible(
    locator.common.tableColumnHeader(columnName),
    LOCATOR_REPORTS.common.tableColumnHeader(columnName),
    options,
  );

  const columnPosition = await resolveTableColumnPosition(page, columnName, options);

  for (const value of expectedValues) {
    await expectVisible(
      locator.common.tableColumnCell(columnName, value, columnPosition),
      LOCATOR_REPORTS.common.tableColumnCell(columnName, value, columnPosition),
      options,
    );
  }
}
