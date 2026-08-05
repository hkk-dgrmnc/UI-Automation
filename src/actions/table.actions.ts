import { Page } from '@playwright/test';
import { TimeoutOptions } from '../config/timeouts';
import { LOCATOR_REPORTS, locators } from '../locators/locators';
import { reportError } from '../utils/action-report';
import { resolveTableColumnPosition } from '../utils/table';
import { click } from './common.actions';

export async function clickTableColumnValue(
  page: Page,
  columnName: string,
  value: string,
  options: TimeoutOptions = {},
) {
  const locator = locators(page);
  let columnPosition: number;

  try {
    columnPosition = await resolveTableColumnPosition(page, columnName, options);
  } catch (error) {
    reportError({
      action: 'Resolve table column position',
      locatorName: LOCATOR_REPORTS.common.tableColumnHeader(columnName).name,
      error,
    });
    throw error;
  }

  await click(
    locator.common.tableColumnCell(columnName, value, columnPosition),
    LOCATOR_REPORTS.common.tableColumnCell(columnName, value, columnPosition),
    options,
  );
}
