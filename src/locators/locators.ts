import { Page } from '@playwright/test';

export const locators = (page: Page) => ({
  auth: {
    usernameInput: page.locator('#username'),
    passwordInput: page.locator('#password'),
    loginButton: page.locator('button[name="login"]'),
    userProfileButton: page.getByRole('button', { name: /User Profile/i }),
  },
});
