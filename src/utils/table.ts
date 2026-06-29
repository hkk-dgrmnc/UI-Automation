import { Page } from '@playwright/test';
import { locators } from '../locators/locators';

function normalizeTableText(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

export async function resolveTableColumnPosition(page: Page, columnName: string) {
  const locator = locators(page);

  await locator.common.tableColumnHeader(columnName).waitFor({ state: 'visible' });

  const columnHeaders = locator.common.tableColumnHeaders;
  const headerCount = await columnHeaders.count();
  const expectedColumnName = normalizeTableText(columnName);

  for (let index = 0; index < headerCount; index += 1) {
    const headerText = normalizeTableText(await columnHeaders.nth(index).innerText());
    if (headerText === expectedColumnName) {
      return index + 1;
    }
  }

  throw new Error(`"${columnName}" kolon başlığının tablo sırası bulunamadı.`);
}
