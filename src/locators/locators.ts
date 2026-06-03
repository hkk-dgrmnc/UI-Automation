import { Page } from '@playwright/test';

export const locators = (_page: Page) => ({
  auth: {},
  header: {},
  product: {},
  basket: {},
  checkout: {},
});
