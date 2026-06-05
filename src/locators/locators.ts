import { Page } from '@playwright/test';

export const locators = (page: Page) => ({
  auth: {
    usernameInput: page.locator('#username'),
    passwordInput: page.locator('#password'),
    loginButton: page.locator('button[name="login"]'),
    userProfileButton: page.getByRole('button', { name: 'Kullanıcı Profil' }),
  },
  common: {
    createLink: page.locator('a#action-create'),
  },
  navigation: {
    sidebarMenuButton: (name: string) => page.getByRole('button').filter({
      has: page.getByText(name, { exact: true }),
    }),
    sidebarMenuLink: (name: string) => page.getByRole('link', { name }),
    selectedSidebarMenuLink: (name: string) => page.locator('a[aria-current="page"]').filter({
      hasText: name,
    }),
  },
  automaticParameters: {
    listTitle: page.getByText('Otomatik Parametre Listesi', { exact: true }),
    infoTitle: page.getByText('Otomatik Parametre Bilgileri', { exact: true }),
  },
});
