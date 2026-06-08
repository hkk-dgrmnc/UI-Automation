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

export const LOCATOR_REPORTS = {
  auth: {
    usernameInput: { name: 'auth.usernameInput', value: '#username' },
    passwordInput: { name: 'auth.passwordInput', value: '#password' },
    loginButton: { name: 'auth.loginButton', value: 'button[name="login"]' },
    userProfileButton: { name: 'auth.userProfileButton', value: 'role=button name="Kullanıcı Profil"' },
  },
  common: {
    createLink: { name: 'common.createLink', value: 'a#action-create' },
  },
  navigation: {
    sidebarMenuButton: (name: string) => ({
      name: `navigation.sidebarMenuButton('${name}')`,
      value: `role=button has exact text "${name}"`,
    }),
    sidebarMenuLink: (name: string) => ({
      name: `navigation.sidebarMenuLink('${name}')`,
      value: `role=link name="${name}"`,
    }),
    selectedSidebarMenuLink: (name: string) => ({
      name: `navigation.selectedSidebarMenuLink('${name}')`,
      value: `a[aria-current="page"] has text "${name}"`,
    }),
  },
  automaticParameters: {
    listTitle: { name: 'automaticParameters.listTitle', value: "getByText('Otomatik Parametre Listesi', { exact: true })" },
    infoTitle: { name: 'automaticParameters.infoTitle', value: "getByText('Otomatik Parametre Bilgileri', { exact: true })" },
  },
};
