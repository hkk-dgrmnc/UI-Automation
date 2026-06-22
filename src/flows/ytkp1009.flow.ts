import { Page } from '@playwright/test';
import { clickCreateLink } from '../actions/common.actions';
import {
  expectAutomaticParametersCreateLinkAvailable,
  expectAutomaticParametersCreatePageOpened,
} from '../assertions/automaticParameters.assertions';

export async function openAutomaticParametersCreatePage(page: Page) {
  await expectAutomaticParametersCreateLinkAvailable(page);
  await clickCreateLink(page);
  await expectAutomaticParametersCreatePageOpened(page);
}
