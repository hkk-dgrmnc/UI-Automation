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
    operationCodeLabel: 'İşlem Kodu',
    operationCodeOptions: [
      '[001] KAPAMA',
      '[002] VERGİSEL ŞUBE KAPAMA',
      '[003] DÖKÜM',
    ],
    typeLabel: 'Tür',
    subTypeLabel: 'Tür 2',
    kdvRateLabel: 'KDV Oranı',
    operationDescriptionLabel: 'Fiş Açıklama',
  },
} as const;

// İşlem Kodu listesi format/count dogrulamasinda (kod + aciklama) tek kaynak olarak
// kullanilir. Tür / Tür 2 gibi salt "su secenekler listede mi" dogrulamalarinda
// beklenen liste feature Data Table'indan gelir; koda gomulmez (bkz. AGENTS.md 9.1).
export const OPERATION_CODE_OPTIONS = TEXTS.automaticParameters.operationCodeOptions;

export const locators = (page: Page) => ({
  auth: {
    usernameInput: page.locator(SELECTORS.auth.usernameInput),
    passwordInput: page.locator(SELECTORS.auth.passwordInput),
    loginButton: page.locator(SELECTORS.auth.loginButton),
    userProfileButton: page.getByRole('button', { name: TEXTS.auth.userProfileButton }),
  },
  common: {
    createLink: page.locator(SELECTORS.common.createLink),
    // İşlem Kodu format/count dogrulamasi (expectOperationCodeListFormatted) tek acik
    // listbox uzerinden calisir; o anda tek dropdown acik oldugu icin yeterlidir.
    listboxOptions: page.getByRole('listbox').getByRole('option'),
    listboxOption: (name: string) => page.getByRole('listbox').getByRole('option', { name, exact: true }),
    // Generic dropdown dogrulamasi (AGENTS.md 9.1): belirli bir ACIK listbox'in (id ile)
    // icindeki secenegi hedefler. id, o anda acik ve adi listName olan listbox'tan
    // runtime'da cozulur (assertions.ts -> resolveOpenListboxId). Boylece "Tür" dendiginde
    // sadece Tür listesine bakilir; ekranda baska liste acik kalsa bile karismaz.
    optionInListbox: (listboxId: string, name: string) =>
      page.locator(`[id="${listboxId}"]`).getByRole('option', { name, exact: true }),
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
    operationCodeCombobox: page.getByRole('combobox', { name: TEXTS.automaticParameters.operationCodeLabel }),
    typeCombobox: page.getByRole('combobox', { name: TEXTS.automaticParameters.typeLabel, exact: true }),
    subTypeCombobox: page.getByRole('combobox', { name: TEXTS.automaticParameters.subTypeLabel }),
    kdvRateCombobox: page.getByRole('combobox', { name: TEXTS.automaticParameters.kdvRateLabel }),
    operationDescriptionInput: page.getByRole('textbox', { name: TEXTS.automaticParameters.operationDescriptionLabel, exact: true }),
    operationDescriptionRequiredLabel: page.getByText(`${TEXTS.automaticParameters.operationDescriptionLabel} *`, { exact: true }).first(),
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
    listboxOptions: { name: 'common.listboxOptions', value: 'role=listbox >> role=option' },
    listboxOption: (name: string) => ({
      name: `common.listboxOption('${name}')`,
      value: `role=listbox >> role=option name="${name}"`,
    }),
    optionInListbox: (listboxId: string, name: string) => ({
      name: `common.optionInListbox('${name}')`,
      value: `#${listboxId} >> role=option name="${name}" (exact)`,
    }),
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
    operationCodeCombobox: { name: 'automaticParameters.operationCodeCombobox', value: `role=combobox name="${TEXTS.automaticParameters.operationCodeLabel}"` },
    typeCombobox: { name: 'automaticParameters.typeCombobox', value: `role=combobox name="${TEXTS.automaticParameters.typeLabel}" (exact)` },
    subTypeCombobox: { name: 'automaticParameters.subTypeCombobox', value: `role=combobox name="${TEXTS.automaticParameters.subTypeLabel}"` },
    kdvRateCombobox: { name: 'automaticParameters.kdvRateCombobox', value: `role=combobox name="${TEXTS.automaticParameters.kdvRateLabel}"` },
    operationDescriptionInput: { name: 'automaticParameters.operationDescriptionInput', value: `role=textbox name="${TEXTS.automaticParameters.operationDescriptionLabel}" (exact)` },
    operationDescriptionRequiredLabel: { name: 'automaticParameters.operationDescriptionRequiredLabel', value: `getByText('${TEXTS.automaticParameters.operationDescriptionLabel} *', { exact: true })` },
  },
} satisfies LocatorReportsShape;
