import { Page } from '@playwright/test';
import type { LocatorReport } from '../utils/action-report';

// Selector ve UI metinleri tek kaynaktir: ayni string hem locator kurulumunda
// hem LOCATOR_REPORTS value alaninda kullanilir. Boylece locator degistirilip
// rapor metadatasi unutuldugunda rapor sessizce yanlis bilgi gosteremez.
const SELECTORS = {
  auth: {
    usernameInput: '#username',
    passwordInput: '#password',
    loginButton: 'button[name="login"]',
  },
  common: {
    createLink: 'a#action-create',
  },
  navigation: {
    selectedSidebarMenuLink: 'a[aria-current="page"]',
  },
} as const;

const TEXTS = {
  auth: {
    userProfileButton: 'Kullanıcı Profil',
  },
  automaticParameters: {
    listTitle: 'Otomatik Parametre Listesi',
    infoTitle: 'Otomatik Parametre Bilgileri',
  },
} as const;

export const locators = (page: Page) => ({
  auth: {
    usernameInput: page.locator(SELECTORS.auth.usernameInput),
    passwordInput: page.locator(SELECTORS.auth.passwordInput),
    loginButton: page.locator(SELECTORS.auth.loginButton),
    userProfileButton: page.getByRole('button', { name: TEXTS.auth.userProfileButton }),
  },
  common: {
    createLink: page.locator(SELECTORS.common.createLink),
  },
  navigation: {
    sidebarMenuButton: (name: string) => page.getByRole('button').filter({
      has: page.getByText(name, { exact: true }),
    }),
    sidebarMenuLink: (name: string) => page.getByRole('link', { name }),
    selectedSidebarMenuLink: (name: string) => page.locator(SELECTORS.navigation.selectedSidebarMenuLink).filter({
      hasText: name,
    }),
  },
  automaticParameters: {
    listTitle: page.getByText(TEXTS.automaticParameters.listTitle, { exact: true }),
    infoTitle: page.getByText(TEXTS.automaticParameters.infoTitle, { exact: true }),
  },
});

// LOCATOR_REPORTS, locators ile ayni grup/anahtar yapisina sahip olmak zorundadir.
// Asagidaki tip, bir locator eklenip rapor metadatasi unutulursa (veya tersi)
// `npm run typecheck`'i derleme zamaninda patlatir; sessiz yanlis rapor olusmaz.
type Locators = ReturnType<typeof locators>;

type LocatorReportsShape = {
  [Group in keyof Locators]: {
    [Key in keyof Locators[Group]]: Locators[Group][Key] extends (...args: infer Args) => unknown
      ? (...args: Args) => LocatorReport
      : LocatorReport;
  };
};

export const LOCATOR_REPORTS = {
  auth: {
    usernameInput: { name: 'auth.usernameInput', value: SELECTORS.auth.usernameInput },
    passwordInput: { name: 'auth.passwordInput', value: SELECTORS.auth.passwordInput },
    loginButton: { name: 'auth.loginButton', value: SELECTORS.auth.loginButton },
    userProfileButton: { name: 'auth.userProfileButton', value: `role=button name="${TEXTS.auth.userProfileButton}"` },
  },
  common: {
    createLink: { name: 'common.createLink', value: SELECTORS.common.createLink },
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
      value: `${SELECTORS.navigation.selectedSidebarMenuLink} has text "${name}"`,
    }),
  },
  automaticParameters: {
    listTitle: { name: 'automaticParameters.listTitle', value: `getByText('${TEXTS.automaticParameters.listTitle}', { exact: true })` },
    infoTitle: { name: 'automaticParameters.infoTitle', value: `getByText('${TEXTS.automaticParameters.infoTitle}', { exact: true })` },
  },
} satisfies LocatorReportsShape;
