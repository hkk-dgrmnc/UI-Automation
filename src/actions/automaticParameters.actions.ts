import { Page } from '@playwright/test';
import { LOCATOR_REPORTS, locators } from '../locators/locators';
import { fillElement } from './common.actions';

export async function fillOperationDescription(page: Page, value: string) {
  const locator = locators(page);

  await fillElement(
    locator.automaticParameters.operationDescriptionInput,
    LOCATOR_REPORTS.automaticParameters.operationDescriptionInput,
    value,
  );
}
