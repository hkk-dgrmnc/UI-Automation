import { test as base, expect } from '@playwright/test';
import { users } from '../data/data';

export const test = base.extend<{
  validUser: typeof users.validUser;
}>({
  validUser: async ({}, use) => {
    await use(users.validUser);
  },
});

export { expect };
