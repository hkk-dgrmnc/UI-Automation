import { test } from '../src/fixtures/test';

test.skip('Example - BASE_URL env ile acilir', async ({ page }) => {
  await page.goto('/');
});
