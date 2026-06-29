import { Page } from '@playwright/test';
import { expectUrl } from './common.assertions';

export async function expectIdentityTemplatesPageOpened(page: Page) {
  await expectUrl(page, /shell-app-ui\/#\/identity-types/, { timeout: 30_000 });
}
