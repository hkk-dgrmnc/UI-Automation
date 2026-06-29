# INVENTORY

> Otomatik uretildi — elle duzenleme. `npm run inventory` ile guncellenir.
> Yeni step/locator/action/flow yazmadan ONCE burada reuse ara (AGENTS.md 5.2).
> `common` ve `navigation` gruplari sadece birden fazla sayfada kullanilan
> elemanlar icindir; sayfaya ozel olanlar domain grubunda tutulur.

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

- `When` {string} dropdown\'ı açılır
- `When` {string} dropdownından {string} seçilir
- `When` {string} butonuna tıklanır
- `When` {string} input alanına {string} değeri yazılır
- `Then` {string} input alanına {string} değeri yazıldığı doğrulanır
- `When` Tablonun {string} isimli kolon başlığının altındandaki {string} değere tıklanır
- `Then` {string} dropdown listesinde aşağıdaki seçenekler listelenir
- `Then` {string} başlığı görüldüğü doğrulanır
- `Then` Tabloda aşağıdaki kolon başlıkları listelenir
- `Then` Tablonun {string} isimli kolon başlığının altında aşağıdaki değerler listelenir
- `Then` Sayfada aşağıdaki input alanları görüntülenir
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
- `When` Fiş Açıklama alanına {string} yazılır
- `Then` Fiş Açıklama alanının en fazla 15 karakter aldığı ve Türkçe karakteri koruduğu doğrulanır
- `Then` Fiş Açıklama alanının zorunlu olduğu doğrulanır

## Locators

### auth

- `auth.usernameInput` → #username
- `auth.passwordInput` → #password
- `auth.loginButton` → button[name="login"]
- `auth.userProfileButton` → role=button name="Kullanıcı Profil"

### automaticParameters

- `automaticParameters.listTitle` → getByText('Otomatik Parametre Listesi', { exact: true })
- `automaticParameters.infoTitle` → getByText('Otomatik Parametre Bilgileri', { exact: true })
- `automaticParameters.operationCodeCombobox` → role=combobox name="İşlem Kodu"
- `automaticParameters.typeCombobox` → role=combobox name="Tür" (exact)
- `automaticParameters.subTypeCombobox` → role=combobox name="Tür 2"
- `automaticParameters.kdvRateCombobox` → role=combobox name="KDV Oranı"
- `automaticParameters.operationDescriptionInput` → role=textbox name="Fiş Açıklama" (exact)
- `automaticParameters.operationDescriptionRequiredLabel` → getByText('Fiş Açıklama *', { exact: true })

### common

- `common.createLink` → a#action-create
- `common.clickableControl` (fn) → role=button/link name="<arg>" (exact) or a#action-create has text "<arg>"
- `common.heading` (fn) → role=heading name="<arg>" (exact)
- `common.tableColumnHeader` (fn) → role=columnheader name="<arg>"
- `common.tableColumnHeaders` → role=columnheader
- `common.tableColumnCell` (fn) → tbody tr td:nth-child(<arg>) text="<arg>" (first match)
- `common.inputField` (fn) → getByLabel(/^<arg>\s*\*?$/)
- `common.button` (fn) → role=button name="<arg>" (exact)
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

- `fillLoginUsername()`
- `fillLoginPassword()`
- `clickLoginButton()`

### src/actions/automaticParameters.actions.ts

- `fillOperationDescription()`

### src/actions/common.actions.ts

- `fill()`
- `click()`
- `clickButtonByName()`
- `fillInputFieldByName()`
- `clickTableColumnValue()`
- `openDropdown()`
- `selectDropdownOption()`
- `readElementText()`
- `readElementAttribute()`
- `fillElement()`
- `clickByText()`
- `collectVisibleBusinessTexts()`

### src/actions/navigation.actions.ts

- `openSidebarMenuPath()`
- `clickSidebarMenuLink()`

## Flows

### src/flows/auth.flow.ts

- `openLoginPage()`
- `submitLogin()`
- `verifyLoginSuccess()`
- `login()`
