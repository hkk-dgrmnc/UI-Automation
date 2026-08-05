import { Page } from '@playwright/test';
import { TIMEOUTS } from '../config/timeouts';
import { expectUrl } from './common.assertions';

export async function expectIdentityTemplatesPageOpened(page: Page) {
  await expectUrl(page, /shell-app-ui\/#\/identity-types/, { timeout: TIMEOUTS.uiOperation });
}
