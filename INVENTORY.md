# INVENTORY

> Otomatik uretildi — elle duzenleme. `npm run inventory` ile guncellenir.
> Yeni step/locator/action/assertion/flow yazmadan ONCE burada reuse ara (AGENTS.md 5.2).
> `common` ve `navigation` gruplari sadece birden fazla sayfada kullanilan
> elemanlar icindir; sayfaya ozel olanlar domain grubunda tutulur.
> Kullanim sayisi TypeScript sembol referansidir; string/reflection/runtime dispatch statik olarak sayilamaz.

## Steps

### features/step-definitions/addressTemplates.steps.ts

- `Then` Adres Şablonu sayfasının açıldığı doğrulanır
- `Then` Adres Şablonu oluşturma ekranının açıldığı doğrulanır

### features/step-definitions/auth.steps.ts

- `Given` Login ekranı açılır
- `Given` {string} kullanıcısı ile login olunur
- `When` {string} kullanıcısı bilgileri ile giriş yapılır
- `Then` Kullanıcının login oldugu dogrulanır

### features/step-definitions/common.steps.ts

- `When` {string} dropdown'ı açılır
- `When` {string} saniye beklenir
- `When` {string} dropdownından {string} seçilir
- `When` {string} butonuna tıklanır
- `When` {string} input alanına {string} değeri yazılır
- `Then` {string} input alanına {string} değeri yazıldığı doğrulanır
- `When` Tablonun {string} isimli kolon başlığının altındaki {string} değere tıklanır
- `Then` {string} dropdown listesinde aşağıdaki seçenekler listelenir
- `Then` {string} başlığı görüldüğü doğrulanır
- `Then` Tabloda aşağıdaki kolon başlıkları listelenir
- `Then` Tablonun {string} isimli kolon başlığının altında aşağıdaki değerler listelenir
- `Then` Sayfada aşağıdaki input alanları görüntülenir
- `Then` Sayfada aşağıdaki dropdown alanları görüntülenir
- `Then` {string} dropdownında {string} değeri seçili olduğu doğrulanır
- `Then` {string} input alanında girilen karakter sayısı {int} değerinden küçük veya eşit olduğu doğrulanır
- `Then` {string} butonu görüldüğü doğrulanır
- `Then` {string} butonunun görülmediği doğrulanır
- `Then` Bulunulan sayfanın görünen iş içerikleri dil kontrolü için raporlanır

### features/step-definitions/identityTemplates.steps.ts

- `Then` Kimlik Şablonu sayfasının açıldığı doğrulanır

### features/step-definitions/navigation.steps.ts

- `When` {string} menü yolundan sayfaya gidilir
- `Then` {string} menüsünün seçili olduğu doğrulanır

### features/step-definitions/ytkp1009.steps.ts

- `Then` Otomatik Parametre Tanımlama sayfasının açıldığı doğrulanır
- `Then` Otomatik Parametre oluşturma ekranının açıldığı doğrulanır
- `Then` İşlem Kodu listesinin kod ve açıklama formatında listelendiği doğrulanır
- `Then` Tür 2 alanının aktif, KDV Oranı alanının pasif olduğu doğrulanır
- `Then` Tür 2 ve KDV Oranı alanlarının pasif olduğu doğrulanır
- `Then` Tür 2 alanının pasif, KDV Oranı alanının aktif olduğu doğrulanır
- `Then` Fiş Açıklama alanının en fazla 15 karakter aldığı ve Türkçe karakteri koruduğu doğrulanır
- `Then` Fiş Açıklama alanının zorunlu olduğu doğrulanır

## Locators

### auth

- `auth.usernameInput` → #username
- `auth.passwordInput` → #password
- `auth.loginButton` → button[name="login"]
- `auth.userProfileButton` → role=button name="Kullanıcı Profil"
- `auth.fatalLoginError` → exact text 'HTTP Request Error' OR 'invalid_resource'

### automaticParameters

- `automaticParameters.listTitle` → getByText('Otomatik Parametre Listesi', { exact: true })
- `automaticParameters.infoTitle` → getByText('Otomatik Parametre Bilgileri', { exact: true })
- `automaticParameters.subTypeCombobox` → role=combobox name="Tür 2"
- `automaticParameters.kdvRateCombobox` → role=combobox name="KDV Oranı"
- `automaticParameters.operationDescriptionInput` → role=textbox name="Fiş Açıklama" (exact)
- `automaticParameters.operationDescriptionRequiredLabel` → getByText('Fiş Açıklama *', { exact: true })

### common

- `common.clickableControl` (fn) → role=button/link name="<arg>" (exact) or a#action-create has text "<arg>"
- `common.heading` (fn) → role=heading name="<arg>" (exact)
- `common.tableColumnHeader` (fn) → role=columnheader name="<arg>"
- `common.tableColumnHeaders` → role=columnheader
- `common.tableColumnCell` (fn) → tbody tr td:nth-child(<arg>) text="<arg>" (first match)
- `common.inputField` (fn) → getByLabel(/^<arg>\s*\*?$/)
- `common.listboxOptions` → role=listbox >> role=option
- `common.listboxOption` (fn) → role=listbox >> role=option name="<arg>"
- `common.dropdownCombobox` (fn) → role=combobox name=/^<arg>\s*\*?$/
- `common.optionInListbox` (fn) → #<arg> >> role=option name="<arg>" (exact)

### navigation

- `navigation.sidebarMenuButton` (fn) → nav >> role=button has exact text "<arg>"
- `navigation.sidebarMenuLink` (fn) → nav >> role=link name="<arg>"
- `navigation.selectedSidebarMenuLink` (fn) → a[aria-current="page"] has text "<arg>"

## Actions

### src/actions/auth.actions.ts

- `fillLoginUsername(page: Page, username: string): Promise<void>` — satir 5 — kullanim: 1
- `fillLoginPassword(page: Page, password: string): Promise<void>` — satir 11 — kullanim: 1
- `clickLoginButton(page: Page): Promise<void>` — satir 17 — kullanim: 1

### src/actions/common.actions.ts

- `fill(locator: Locator, locatorReport: LocatorReport, value: string, maskValue?: boolean, options?: TimeoutOptions): Promise<void>` — satir 11 — kullanim: 3
- `click(locator: Locator, locatorReport: LocatorReport, options?: ClickOptions): Promise<void>` — satir 33 — kullanim: 9
- `waitForSeconds(secondsText: string): Promise<void>` — satir 74 — kullanim: 1
- `readElementText(locator: Locator, locatorReport: LocatorReport, options?: TimeoutOptions): Promise<string>` — satir 106 — kullanim: 0 (UNUSED)
- `readElementAttribute(locator: Locator, locatorReport: LocatorReport, attribute: string, options?: TimeoutOptions): Promise<string>` — satir 127 — kullanim: 0 (UNUSED)
- `fillElement(locator: Locator, locatorReport: LocatorReport, value: string, maskValue?: boolean, options?: TimeoutOptions): Promise<void>` — satir 154 — kullanim: 1
- `clickByText(page: Page, value: string, options?: TextMatchOptions): Promise<void>` — satir 165 — kullanim: 0 (UNUSED)

### src/actions/control.actions.ts

- `clickButtonByName(page: Page, name: string, options?: TimeoutOptions): Promise<void>` — satir 6 — kullanim: 1

### src/actions/dropdown.actions.ts

- `openDropdown(page: Page, name: string, options?: TimeoutOptions): Promise<void>` — satir 6 — kullanim: 2
- `selectDropdownOption(page: Page, dropdownName: string, optionText: string, options?: TimeoutOptions): Promise<void>` — satir 20 — kullanim: 1

### src/actions/form.actions.ts

- `fillInputFieldByName(page: Page, fieldName: string, value: string, options?: TimeoutOptions): Promise<void>` — satir 6 — kullanim: 1

### src/actions/navigation.actions.ts

- `openSidebarMenuPath(page: Page, parentMenuNames: readonly string[], targetLinkName: string, options?: TimeoutOptions): Promise<void>` — satir 92 — kullanim: 1
- `clickSidebarMenuLink(page: Page, name: string, options?: TimeoutOptions): Promise<void>` — satir 119 — kullanim: 1

### src/actions/table.actions.ts

- `clickTableColumnValue(page: Page, columnName: string, value: string, options?: TimeoutOptions): Promise<void>` — satir 8 — kullanim: 1

### src/actions/uiAudit.actions.ts

- `collectVisibleBusinessTexts(page: Page): Promise<VisibleBusinessTextAudit>` — satir 10 — kullanim: 1

## Assertions

### src/assertions/addressTemplates.assertions.ts

- `expectAddressTemplatesPageOpened(page: Page): Promise<void>` — satir 6 — kullanim: 1
- `expectAddressTemplateCreatePageOpened(page: Page): Promise<void>` — satir 11 — kullanim: 1

### src/assertions/auth.assertions.ts

- `expectLoginPageVisible(page: Page): Promise<void>` — satir 48 — kullanim: 1
- `expectAuthenticationSuccess(page: Page): Promise<void>` — satir 56 — kullanim: 2
- `expectLoginSuccess(page: Page): Promise<void>` — satir 66 — kullanim: 1

### src/assertions/automaticParameters.assertions.ts

- `expectAutomaticParametersRouteOpened(page: Page): Promise<void>` — satir 14 — kullanim: 1
- `expectAutomaticParametersCreatePageOpened(page: Page): Promise<void>` — satir 26 — kullanim: 1
- `expectOperationCodeListFormatted(page: Page): Promise<void>` — satir 39 — kullanim: 1
- `expectOperationDescriptionMaxLengthAndTurkish(page: Page): Promise<void>` — satir 56 — kullanim: 1
- `expectOperationDescriptionRequired(page: Page): Promise<void>` — satir 67 — kullanim: 1
- `expectSubTypeEnabledKdvRateDisabled(page: Page): Promise<void>` — satir 80 — kullanim: 1
- `expectSubTypeAndKdvRateDisabled(page: Page): Promise<void>` — satir 93 — kullanim: 1
- `expectSubTypeDisabledKdvRateEnabled(page: Page): Promise<void>` — satir 106 — kullanim: 1

### src/assertions/common.assertions.ts

- `expectUrl(page: Page, expectedUrl: RegExp, options?: AssertionOptions): Promise<void>` — satir 12 — kullanim: 6
- `expectVisible(locator: Locator, locatorReport: LocatorReport, options?: AssertionOptions): Promise<void>` — satir 27 — kullanim: 18
- `expectNotVisible(locator: Locator, locatorReport: LocatorReport, options?: AssertionOptions): Promise<void>` — satir 46 — kullanim: 2
- `expectCount(locator: Locator, locatorReport: LocatorReport, count: number, options?: AssertionOptions): Promise<void>` — satir 65 — kullanim: 1
- `expectHasValue(locator: Locator, locatorReport: LocatorReport, expected: string | RegExp, expectedDescription: string, options?: AssertionOptions): Promise<void>` — satir 85 — kullanim: 3
- `expectEnabled(locator: Locator, locatorReport: LocatorReport, options?: AssertionOptions): Promise<void>` — satir 106 — kullanim: 2
- `expectDisabled(locator: Locator, locatorReport: LocatorReport, options?: AssertionOptions): Promise<void>` — satir 125 — kullanim: 4
- `expectHeadingVisible(page: Page, headingText: string, options?: AssertionOptions): Promise<void>` — satir 144 — kullanim: 1
- `expectTextPresent(page: Page, value: string, options?: { exact?: boolean; } & AssertionOptions): Promise<void>` — satir 166 — kullanim: 0 (UNUSED)

### src/assertions/control.assertions.ts

- `expectButtonVisible(page: Page, buttonName: string, options?: AssertionOptions): Promise<void>` — satir 9 — kullanim: 1
- `expectButtonNotVisible(page: Page, buttonName: string, options?: AssertionOptions): Promise<void>` — satir 23 — kullanim: 1

### src/assertions/dropdown.assertions.ts

- `expectListboxOptionsVisible(page: Page, listName: string, expectedTexts: readonly string[], options?: AssertionOptions): Promise<void>` — satir 106 — kullanim: 1
- `expectDropdownFieldsVisible(page: Page, expectedFields: readonly string[], options?: AssertionOptions): Promise<void>` — satir 124 — kullanim: 1
- `expectDropdownFieldSelectedValue(page: Page, fieldName: string, expectedValue: string, options?: AssertionOptions): Promise<void>` — satir 140 — kullanim: 1

### src/assertions/form.assertions.ts

- `expectInputFieldsVisible(page: Page, expectedFields: readonly string[], options?: AssertionOptions): Promise<void>` — satir 7 — kullanim: 1
- `expectInputFieldValue(page: Page, fieldName: string, expectedValue: string, options?: AssertionOptions): Promise<void>` — satir 23 — kullanim: 1
- `expectInputFieldValueLengthLessThanOrEqual(page: Page, fieldName: string, maxLength: number, options?: AssertionOptions): Promise<void>` — satir 40 — kullanim: 1

### src/assertions/identityTemplates.assertions.ts

- `expectIdentityTemplatesPageOpened(page: Page): Promise<void>` — satir 5 — kullanim: 1

### src/assertions/navigation.assertions.ts

- `expectSelectedSidebarMenu(page: Page, menuName: string): Promise<void>` — satir 6 — kullanim: 3

### src/assertions/table.assertions.ts

- `expectTableColumnHeadersVisible(page: Page, expectedHeaders: readonly string[], options?: AssertionOptions): Promise<void>` — satir 6 — kullanim: 1
- `expectTableColumnValuesVisible(page: Page, columnName: string, expectedValues: readonly string[], options?: AssertionOptions): Promise<void>` — satir 22 — kullanim: 1

## Flows

### src/flows/auth.flow.ts

- `openLoginPage(page: Page): Promise<void>` — satir 11 — kullanim: 2
- `submitLogin(page: Page, user: TestUser): Promise<void>` — satir 17 — kullanim: 2
- `verifyLoginSuccess(page: Page): Promise<void>` — satir 23 — kullanim: 1
- `login(page: Page, user: TestUser): Promise<void>` — satir 27 — kullanim: 1
