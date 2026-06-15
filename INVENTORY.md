# INVENTORY

> Otomatik uretildi — elle duzenleme. `npm run inventory` ile guncellenir.
> Yeni step/locator/action/flow yazmadan ONCE burada reuse ara (AGENTS.md 5.2).
> `common` ve `navigation` gruplari sadece birden fazla sayfada kullanilan
> elemanlar icindir; sayfaya ozel olanlar domain grubunda tutulur.

## Steps

### features/step-definitions/auth.steps.ts

- `Given` Login ekranı açılır
- `Given` {string} kullanıcısı ile login olunur
- `When` {string} kullanıcısı bilgileri ile giriş yapılır
- `Then` Kullanıcının login oldugu dogrulanır

### features/step-definitions/navigation.steps.ts

- `When` {string} menü yolundan sayfaya gidilir

### features/step-definitions/ytkp1009.steps.ts

- `Then` Otomatik Parametre Tanımlama sayfasının açıldığı doğrulanır
- `When` Yeni kayıt oluşturma ekranına geçiş yapılır

## Locators

### auth

- `auth.usernameInput` → #username
- `auth.passwordInput` → #password
- `auth.loginButton` → button[name="login"]
- `auth.userProfileButton` → role=button name="Kullanıcı Profil"

### automaticParameters

- `automaticParameters.listTitle` → getByText('Otomatik Parametre Listesi', { exact: true })
- `automaticParameters.infoTitle` → getByText('Otomatik Parametre Bilgileri', { exact: true })

### common

- `common.createLink` → a#action-create

### navigation

- `navigation.sidebarMenuButton` (fn) → role=button has exact text "<arg>"
- `navigation.sidebarMenuLink` (fn) → role=link name="<arg>"
- `navigation.selectedSidebarMenuLink` (fn) → a[aria-current="page"] has text "<arg>"

## Actions

_src/actions/actions.ts_

- `fillLoginUsername()`
- `fillLoginPassword()`
- `clickLoginButton()`
- `openSidebarMenuPath()`
- `clickSidebarMenuLink()`
- `clickCreateLink()`
- `readElementText()`
- `readElementAttribute()`
- `fillElement()`
- `clickByText()`

## Flows

### src/flows/auth.flow.ts

- `openLoginPage()`
- `submitLogin()`
- `verifyLoginSuccess()`
- `login()`

### src/flows/ytkp1009.flow.ts

- `openAutomaticParametersCreatePage()`
