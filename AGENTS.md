# AGENTS.md - Playwright Automation Agent Guide

Bu dokuman, bu projede Codex ile Cucumber + Playwright TypeScript otomasyon testleri uretirken uyulacak mimariyi, klasor yapisini, kodlama standartlarini ve test uretim kurallarini tanimlar.

Amac:
Manuel test case'leri hizli, stabil, okunabilir ve bakimi kolay Cucumber + Playwright otomasyon testlerine donusturmek.

Bu projede klasik Page Object Model kullanilmayacaktir. Her sayfa icin ayri `Page.ts` class dosyasi olusturulmayacaktir. Baslangic mimarisi sade tutulacaktir: data, locator, action ve assertion katmanlari tek dosya olarak yonetilecektir. Bu tek dosya modeli baslangic hizini artirmak icindir; proje buyudukce best practice, POM'a donmeden domain bazli katman dosyalarina ayrilmaktir.

---

## 1. Kullanilacak Teknolojiler

- TypeScript
- Playwright
- Cucumber
- Gherkin
- @cucumber/cucumber
- VS Code
- Codex

Bu projede asagidaki yapilar kullanilmayacaktir:

- Gauge runner
- Klasik Page Object Model
- Her sayfa icin ayri Page class yapisi

---

## 2. Ana Mimari Mantik

Bu projede temel katmanlar asagidaki gibidir:

```text
Data      -> src/data/data.ts
Locator   -> src/locators/locators.ts
Action    -> src/actions/actions.ts
Assertion -> src/assertions/assertions.ts
Flow      -> src/flows
Cucumber  -> features
Step Def  -> features/step-definitions
Support   -> features/support
Config    -> src/config
Feature   -> features/generated
```

Katmanlarin sorumluluklari:

```text
src/data/data.ts
  Tum test verilerini tek dosyada tutar.

src/locators/locators.ts
  Tum reusable element locator tanimlarini tek dosyada tutar.

src/actions/actions.ts
  Tum tekil ve reusable kullanici aksiyonlarini tek dosyada tutar.

src/assertions/assertions.ts
  Tum reusable dogrulama metotlarini tek dosyada tutar.

src/flows
  Birden fazla action ve assertion iceren business akislarini tutar.

features/generated
  Manuel test case'lerden uretilen Cucumber feature dosyalarini tutar.

features/step-definitions
  `*` ile yazilan Gherkin adimlarinin TypeScript `Step(...)` karsiliklarini tutar.

features/support
  Cucumber World, hook, login session ve Playwright browser/page lifecycle yapilarini tutar.

src/config
  Ortam ve environment ayarlarini tutar.

```

---

## 3. Klasor Yapisi

```text
playwright-automation/
|
├── AGENTS.md
├── cucumber.js
├── package.json
├── tsconfig.json
|
├── features/
│   ├── generated/
│   │   └── TC_001_login.feature
│   │
│   ├── step-definitions/
│   │   └── auth.steps.ts
│   │
│   └── support/
│       ├── world.ts
│       └── hooks.ts
|
└── src/
    ├── data/
    │   └── data.ts
    │
    ├── locators/
    │   └── locators.ts
    │
    ├── actions/
    │   └── actions.ts
    │
    ├── assertions/
    │   └── assertions.ts
    │
    ├── flows/
    │   └── auth.flow.ts
    │
    ├── config/
    │   └── env.ts
    │
    └── utils/              # Sadece gercek ortak helper ihtiyaci olursa eklenir
```

`components/` klasoru baslangicta kullanilmayacaktir. Modal, ortak component veya tekrar eden kompleks UI yapilari ortaya cikarsa daha sonra eklenebilir.

---

## 4. Mimari Akis

Bir scenario yazilirken akis su sekilde olmalidir:

```text
Feature
  -> Step Definition
    -> Flow
      -> Action
        -> Locator
      -> Assertion
        -> Locator
      -> Data
```

Ornek kullanim mantigi:

```text
features/generated/TC_001_login.feature
  -> features/step-definitions/auth.steps.ts
    -> flows/auth.flow.ts
    -> actions/actions.ts
    -> assertions/assertions.ts
    -> locators/locators.ts
    -> data/data.ts
```

Feature dosyasi mumkun oldugunca sade kalmalidir. Feature dosyasinda locator karmasasi olmamalidir.

---

## 5. Page Object Model Kullanim Kurali

Bu projede klasik POM kullanilmayacaktir.

Yapilmayacak ornek:

```text
pages/
  LoginPage.ts
  HomePage.ts
  ProductListPage.ts
  ProductDetailPage.ts
  BasketPage.ts
  CheckoutPage.ts
  AccountPage.ts
```

Bu projede baslangic icin domain bazli data, action, assertion ve locator dosyalari da olusturulmayacaktir.

Baslangicta yapilmayacak ornek:

```text
src/data/users.ts
src/data/products.ts
src/locators/auth.locators.ts
src/locators/product.locators.ts
src/actions/auth.actions.ts
src/actions/product.actions.ts
src/assertions/auth.assertions.ts
src/assertions/product.assertions.ts
```

Kullanilacak baslangic yapisi:

```text
src/data/data.ts
src/locators/locators.ts
src/actions/actions.ts
src/assertions/assertions.ts
```

Ileride dosyalar cok buyurse veya bakim zorlasirsa, bu tek dosyalar domain bazli ayrilmalidir.

---

## 5.1 Buyume Stratejisi

Tek dosya modeli baslangic icin bilincli bir tercihtir; proje buyudukce kalici best practice degildir. Buyume basladiginda hedef, klasik Page Object Model'e donmeden katmanlari domain bazli bolmektir.

Baslangic modeli:

```text
src/data/data.ts
src/locators/locators.ts
src/actions/actions.ts
src/assertions/assertions.ts
```

Buyume sonrasi hedef model:

```text
src/data/auth.data.ts
src/data/product.data.ts
src/data/basket.data.ts
src/data/checkout.data.ts

src/locators/auth.locators.ts
src/locators/product.locators.ts
src/locators/basket.locators.ts
src/locators/checkout.locators.ts

src/actions/auth.actions.ts
src/actions/product.actions.ts
src/actions/basket.actions.ts
src/actions/checkout.actions.ts

src/assertions/auth.assertions.ts
src/assertions/product.assertions.ts
src/assertions/basket.assertions.ts
src/assertions/checkout.assertions.ts
```

Domain bazli ayrima gecis esikleri:

- `data.ts`, `locators.ts`, `actions.ts` veya `assertions.ts` dosyasi yaklasik 200-300 satiri gecerse.
- Ayni domain icin 10 veya daha fazla locator, action, assertion veya data grubu olusursa.
- Bir dosyada `auth`, `product`, `basket`, `checkout` gibi domain bloklari belirgin sekilde buyur ve dosya taramasi zorlasirsa.
- Yeni test uretirken ayni dosyada degisiklik yapmak riskli hale gelirse.
- Tek dosyadaki conflict veya yanlis yeri duzenleme riski artarsa.

Gecis kurallari:

- Ayrim sadece ihtiyac olan katmanda ve ihtiyac olan domain icin yapilmalidir.
- Ayrim yaparken POM class olusturulmayacaktir.
- `pages/` klasoru veya `LoginPage`, `BasketPage` gibi class dosyalari olusturulmayacaktir.
- Mevcut test ve flow davranisi korunmalidir.
- Import'lar minimum degisiklikle guncellenmelidir.
- Ayrim sonrasi ayni fonksiyon iki yerde birakilmamalidir.
- Buyume esigi yoksa tek dosya yapisi korunmalidir.

---

## 6. Locator Yazim Kurallari

Locator tanimlari `src/locators/locators.ts` icinde tutulmalidir.

Locator secim onceligi:

```text
1. getByTestId
2. getByRole
3. getByLabel
4. getByPlaceholder
5. getByText
6. CSS locator
7. XPath sadece zorunluysa
```

Kacinilacak locator ornekleri:

```ts
page.locator('div:nth-child(3) > button')
page.locator('//div[4]/span[2]/button')
page.locator('.css-1x2y3z')
```

Tercih edilen locator ornekleri:

```ts
page.getByTestId('login-button')
page.getByRole('button', { name: 'Giris Yap' })
page.getByLabel('E-posta')
page.getByPlaceholder('Urun ara')
page.getByText('Sepete Ekle')
```

Tek dosyada locator gruplama ornegi:

```ts
// src/locators/locators.ts
import { Page } from '@playwright/test';

export const locators = (page: Page) => ({
  auth: {
    usernameInput: page.locator('#username'),
    passwordInput: page.locator('#password'),
    loginButton: page.locator('button[name="login"]'),
    userProfileButton: page.getByRole('button', { name: /User Profile/i }),
  },
});
```

Kurallar:

- Hayali locator yazilmayacaktir.
- Locator gercek sayfada dogrulanmadan kullanilmayacaktir.
- Emin olunmayan locator once Playwright ile browser uzerinde denenmelidir.
- Ayni locator birden fazla yerde kullanilacaksa `src/locators/locators.ts` icine alinmalidir.
- Tek kullanimlik locator test icinde kalabilir; tekrar ederse locator dosyasina tasinmalidir.

---

## 7. Data Yazim Kurallari

Test datalari `src/data/data.ts` icinde tutulmalidir.

Ornek:

```ts
// src/data/data.ts
export const users = {
  validUser: {
    username: process.env.VALID_USER_USERNAME ?? '',
    email: process.env.VALID_USER_EMAIL ?? '',
    password: process.env.VALID_USER_PASSWORD ?? '',
  },
} as const;
```

Kurallar:

- Feature dosyasi icinde hard-coded data mumkun oldugunca kullanilmamalidir.
- Kullanici, urun, adres, odeme bilgileri ayni data dosyasinda gruplu olarak tutulmalidir.
- Tek testte kullanilan gecici data test icinde olabilir.
- Bir data iki veya daha fazla testte kullanilacaksa `src/data/data.ts` icine tasinmalidir.
- Hassas bilgi, gercek sifre veya gercek kullanici datasÄ± commit edilmemelidir.
- Ortama gore degisen degerler environment variable uzerinden alinmalidir.

---

## 8. Action Yazim Kurallari

Action metotlari `src/actions/actions.ts` icinde tutulmalidir.

Action, tekil ve reusable kullanici islemini temsil eder.

Ornek:

```ts
// src/actions/actions.ts
import { Page } from '@playwright/test';
import { locators } from '../locators/locators';

export async function fillLoginUsername(page: Page, username: string) {
  const locator = locators(page);

  await locator.auth.usernameInput.fill(username);
}

export async function fillLoginPassword(page: Page, password: string) {
  const locator = locators(page);

  await locator.auth.passwordInput.fill(password);
}

export async function clickLoginButton(page: Page) {
  const locator = locators(page);

  await locator.auth.loginButton.click();
}
```

Kurallar:

- Action dosyasi assertion icermemelidir.
- Action sadece islem yapmalidir.
- `click`, `fill`, `press`, `selectOption`, `hover` gibi kullanici aksiyonlari burada bulunabilir.
- Cok basit Playwright fonksiyonlari gereksiz wrapper haline getirilmemelidir.
- Ancak ozel davranis veya tekrar varsa reusable action yazilabilir.

Kacinilacak ornek:

```ts
export async function click(locator: Locator) {
  await locator.click();
}
```

---

## 9. Assertion Yazim Kurallari

Assertion metotlari `src/assertions/assertions.ts` icinde tutulmalidir.

Assertion, reusable dogrulama metodunu temsil eder.

Ornek:

```ts
// src/assertions/assertions.ts
import { Page, expect } from '@playwright/test';
import { locators } from '../locators/locators';

export async function expectLoginSuccess(page: Page) {
  const locator = locators(page);

  await expect(page).toHaveURL(/shell-app-ui\/#\/journal-audits/);
  await expect(locator.auth.usernameInput).not.toBeVisible();
  await expect(locator.auth.userProfileButton).toBeVisible();
}

export async function expectLoginPageVisible(page: Page) {
  const locator = locators(page);

  await expect(locator.auth.usernameInput).toBeVisible();
  await expect(locator.auth.passwordInput).toBeVisible();
  await expect(locator.auth.loginButton).toBeVisible();
}
```

Kurallar:

- Assertion dosyasinda Playwright web-first assertion kullanilmalidir.
- `expect(locator).toBeVisible()` gibi retry mekanizmali assertion'lar tercih edilmelidir.
- `expect(await locator.isVisible()).toBe(true)` kullanimindan kacinilmalidir.
- Assertion metodu sadece dogrulama yapmalidir.
- Assertion icinde gereksiz click/fill gibi action yapilmamalidir.
- Business expected result netse assertion ona gore yazilmalidir.
- Sadece gorunurluk degil, mumkunse URL, text, count, state veya business sonuc dogrulanmalidir.

Iyi assertion ornekleri:

```ts
await expect(page).toHaveURL(/shell-app-ui\/#\/journal-audits/);
await expect(locator.auth.userProfileButton).toBeVisible();
await expect(locator.auth.usernameInput).not.toBeVisible();
```

Kacinilacak ornek:

```ts
expect(await locator.auth.userProfileButton.isVisible()).toBe(true);
```

---

## 10. Flow Yazim Kurallari

Flow dosyalari `src/flows` altinda tutulmalidir.

Flow, birden fazla action ve assertion iceren business akisidir. Flow dosyalari domain bazli kalabilir; cunku test okunabilirligini artirir ve tek locator/action/assertion dosyasi ile cakismaz.

Ornek:

```ts
// src/flows/auth.flow.ts
import { Page } from '@playwright/test';
import { users } from '../data/data';
import {
  clickLoginButton,
  fillLoginPassword,
  fillLoginUsername,
} from '../actions/actions';
import { expectLoginSuccess } from '../assertions/assertions';
import { env } from '../config/env';

export async function openLoginPage(page: Page) {
  await page.goto(env.baseUrl);
}

export async function submitLogin(page: Page, user = users.validUser) {
  await fillLoginUsername(page, user.username || user.email);
  await fillLoginPassword(page, user.password);
  await clickLoginButton(page);
}

export async function verifyLoginSuccess(page: Page) {
  await expectLoginSuccess(page);
}

export async function login(page: Page, user = users.validUser) {
  await openLoginPage(page);
  await submitLogin(page, user);
  await verifyLoginSuccess(page);
}
```

Kurallar:

- Flow business anlamli olmalidir.
- Flow icinde birden fazla action ve assertion olabilir.
- Flow Cucumber step definition tarafindan cagrilacak reusable business akisini tutmalidir.
- Flow icinde Cucumber/Gherkin metni veya `test.step()` bulunmamalidir.
- Raporlanacak step metinleri `.feature` dosyalarinda ve `features/step-definitions` icinde tutulmalidir.
- Flow testin okunabilirligini artirmalidir.
- Flow icine asiri ozel test case mantigi konulmamalidir.
- Ayni akis iki veya daha fazla senaryoda kullanilacaksa flow olarak tanimlanmalidir.

---

## 11. Cucumber Step Definition Best Practice

Bu projede Gauge concept veya `.cpt` katalogu kullanilmayacaktir. Cucumber feature dosyalari business seviyesinde okunur kalacak, step definition dosyalari ise bu business step'leri `src/flows` fonksiyonlarina baglayacaktir.

Ornek:

```gherkin
Scenario: TC_001 - Kullanici gecerli bilgilerle login olur
  * kullanici login ekranini acar
  * Kullanici gecerli bilgilerle giris yapar
  * kullanici basarili sekilde login olur
```

```ts
import { defineStep as Step } from '@cucumber/cucumber';

Step('Kullanici gecerli bilgilerle giris yapar', async function (this: CustomWorld) {
  await submitLogin(getPage(this), users.validUser);
});
```

Kurallar:

- Feature dosyasinda business seviyesinde anlamli adimlar yazilmalidir.
- Feature dosyalarinda step keyword olarak `Given`, `When`, `Then`, `And`, `But` yerine `*` kullanilmalidir.
- Step definition dosyalarinda `Given`, `When`, `Then` import edilmemelidir; `defineStep as Step` kullanilmalidir.
- Step definition dosyasi Gherkin metnini teknik akisa baglamalidir.
- Step definition icinde locator veya Playwright detayi bulunmamalidir; mumkunse `src/flows` fonksiyonu cagrilmalidir.
- Cok kucuk teknik islemler icin `kullanici adi girilir`, `sifre girilir` gibi gereksiz mikro Cucumber step'leri olusturulmamalidir.
- Tekrarlanan business akislar `src/flows` icinde reusable fonksiyon olarak tutulmalidir.
- Gauge runner, `.cpt` dosyasi veya concept expansion runner kullanilmayacaktir.

---

## 12. Cucumber Support ve World Kurallari

Cucumber support dosyalari `features/support` altinda tutulmalidir.

Ornek:

```ts
// features/support/world.ts
import { World, setWorldConstructor } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page } from '@playwright/test';

export class CustomWorld extends World {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
}

setWorldConstructor(CustomWorld);
```

Hook ornegi:

```ts
// features/support/hooks.ts
import { Before, After } from '@cucumber/cucumber';
import { chromium } from '@playwright/test';
import { CustomWorld } from './world';

Before(async function (this: CustomWorld) {
  this.browser = await chromium.launch();
  this.context = await this.browser.newContext({ ignoreHTTPSErrors: true });
  this.page = await this.context.newPage();
});

After(async function (this: CustomWorld) {
  await this.context?.close();
  await this.browser?.close();
});
```

Kurallar:

- Playwright `browser`, `context` ve `page` lifecycle'i Cucumber hook'lari ile yonetilmelidir.
- Step definition dosyalari `this.page` uzerinden ilerlemelidir.
- Cucumber World gereksiz data deposuna donusturulmemelidir.
- Test data icin yine `src/data/data.ts` kullanilmalidir.
- Browser secimi script, world parameter veya environment variable ile yonetilebilir.

---

## 12. Cucumber Login Session Kurallari

Eger testlerin buyuk bolumu login gerektiriyorsa her testte tekrar login yapmak yerine storage state kullanilmalidir.

Ornek hook:

```ts
// features/support/hooks.ts
import { Before } from '@cucumber/cucumber';
import { chromium } from '@playwright/test';
import { users } from '../../src/data/data';
import {
  clickLoginButton,
  fillLoginPassword,
  fillLoginUsername,
} from '../../src/actions/actions';
import { expectLoginSuccess } from '../../src/assertions/assertions';
import { env } from '../../src/config/env';
import { CustomWorld } from './world';

Before({ tags: '@authState' }, async function (this: CustomWorld) {
  this.browser = await chromium.launch();
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();

  await this.page.goto(env.baseUrl);
  await fillLoginUsername(this.page, users.validUser.username || users.validUser.email);
  await fillLoginPassword(this.page, users.validUser.password);
  await clickLoginButton(this.page);

  await expectLoginSuccess(this.page);

  await this.context.storageState({ path: '.auth/user.json' });
});
```

Kurallar:

- Login cok fazla testte gerekiyorsa `storageState` kullanilmalidir.
- Login testleri ayrica yazilmalidir.
- Login olmayan senaryolar icin storage state kullanilmamalidir.
- Storage state ihtiyaci Cucumber hook'lari ile yonetilmelidir; Playwright Test on hazirlik dosyasi olusturulmayacaktir.
- `.auth/user.json` gibi session dosyalari git'e commit edilmemelidir.
- `.auth/` klasoru `.gitignore` icine eklenmelidir.

---

## 13. Config ve Environment Kurallari

Ortam bilgileri `src/config/env.ts` uzerinden yonetilmelidir.
Uygulama URL'i sadece `BASE_URL` environment variable uzerinden yonetilmelidir.

Ornek:

```ts
// src/config/env.ts
import 'dotenv/config';

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} environment variable is required.`);
  }

  return value;
}

export const env = {
  baseUrl: getRequiredEnv('BASE_URL'),
  runningEnv: process.env.RUNNING_ENV ?? 'test',
} as const;
```

Kurallar:

- URL ve ortam degerleri test dosyalarina hard-coded yazilmamalidir.
- Gercek uygulama URL'i `.env` icindeki `BASE_URL` ile verilmelidir.
- Ornek env degerleri `.env.example` icinde tutulmalidir.
- `page.goto('/')` gibi baseURL uyumlu kullanim tercih edilmelidir.
- Ortama gore degisen data veya URL environment variable ile yonetilmelidir.

---

## 14. Utils Kullanim Kurallari

`src/utils` klasoru baslangicta olusturulmayacaktir. Gercekten birden fazla domain tarafindan kullanilan ortak helper ihtiyaci ortaya cikarsa eklenmelidir.

Kurallar:

- Genel amacli helper yoksa `src/utils` klasoru bos iskelet olarak tutulmamalidir.
- Sayfaya veya business akisina ozel islemler utils icine konulmamalidir.
- `utils` klasoru copluk haline getirilmemelidir.
- Bir fonksiyon sadece tek domain icinse ilgili action, assertion veya flow dosyasinda kalmalidir.

---

## 15. Feature Dosyasi Yazim Kurallari

Feature dosyalari `features/generated` altinda olusturulmalidir.

Ornek:

```gherkin
# features/generated/TC_001_login.feature
@smoke @auth
Feature: Authentication login

  Scenario: TC_001 - Kullanici gecerli bilgilerle login olur
    * kullanici login ekranini acar
    * Kullanici gecerli bilgilerle giris yapar
    * kullanici basarili sekilde login olur
```

Kurallar:

- Feature dosyasi manuel test case ID ile baslayan scenario icermelidir.
- Tag'ler feature veya scenario seviyesinde yazilmalidir.
- Feature dosyasinda locator, selector veya teknik Playwright detayi olmamalidir.
- Feature dosyasi business senaryo gibi okunmalidir.
- Beklenen sonuclar business anlamli `*` adimlari ile ifade edilmelidir.
- Step implementation `features/step-definitions` altinda olmalidir.
- Step definition icinden action/assertion dogrudan karistirilmak yerine mumkunse `src/flows` fonksiyonlari cagrilmalidir.
- Test data mumkunse `src/data/data.ts` icinden gelmelidir.

Ornek tag'ler:

```text
@smoke
@regression
@auth
@product
@basket
@checkout
```

---

## 16. Gherkin Step Kullanim Standardi

Her onemli business adimi Cucumber step'i olarak `.feature` dosyasinda gorunmelidir. Raporlanabilir adim metinleri `*` satirlarinda tutulur; Playwright `test.step()` kullanilmaz.

Ornek:

```gherkin
Scenario: TC_001 - Kullanici gecerli bilgilerle login olur
  * kullanici login ekranini acar
  * Kullanici gecerli bilgilerle giris yapar
  * kullanici basarili sekilde login olur
```

Kurallar:

- Step metinleri Turkce, kisa ve anlasilir olmalidir.
- Feature dosyalarinda step keyword olarak sadece `*` kullanilmalidir.
- `Given`, `When`, `Then`, `And`, `But` keyword'leri yeni feature dosyalarinda kullanilmamalidir.
- Step definition dosyalarinda tum adimlar `defineStep as Step` ile tanimlanmalidir.
- Step metinlerinde teknik locator, CSS, XPath veya implementation detayi olmamalidir.
- Step definition dosyasi sadece Gherkin adimini TypeScript akisi ile baglamalidir.
- Cok kucuk teknik islemler icin gereksiz step acilmamalidir.
- Business anlamli adimlar icin step kullanilmalidir.
- Rapor okunabilirligi hedeflenmelidir.
---

## 17. Wait Kullanim Kurallari

Kacinilacak kullanim:

```ts
await page.waitForTimeout(3000);
```

Tercih edilen kullanim:

```ts
await expect(locator).toBeVisible();
await expect(page).toHaveURL(/basket|sepet/);
await locator.click();
await locator.fill('test');
```

Kurallar:

- `waitForTimeout` kullanilmamalidir.
- Playwright auto-wait ve web-first assertion mekanizmasi kullanilmalidir.
- Gerekirse belirli state beklenmelidir.
- Zorunlu olmadikca manuel bekleme yazilmamalidir.

---

## 18. Codex Test Uretim Kurallari

Codex yeni test uretirken asagidaki sirayi izlemelidir:

```text
1. Manuel test case'i oku.
2. Test case ID, title, steps ve expected result alanlarini analiz et.
3. Ilgili mevcut flow var mi kontrol et.
4. Ilgili flow varsa onu kullan.
5. Flow yoksa src/data/data.ts, src/actions/actions.ts, src/assertions/assertions.ts ve src/locators/locators.ts yapisini kontrol et.
6. Eksik reusable parca varsa once mevcut tek dosya yapisina kucuk ve temiz ekleme yap.
7. Tek dosya buyume esigini asiyorsa, sadece ilgili katmani/domain'i domain bazli dosyaya ayir.
8. Feature dosyasini `features/generated` altinda business seviyesinde olustur.
9. Eksik Gherkin step karsiliklarini `features/step-definitions` icinde olustur.
10. Step definition icinden mumkunse `src/flows` fonksiyonlarini cagir.
11. Testi calistir.
12. Hata varsa minimum degisiklikle duzelt.
13. Hayali locator veya dogrulanmamis assertion birakma.
```

Codex sunlari yapmamalidir:

```text
- Her test icin yeni Page Object class olusturma.
- Her sayfa icin yeni dosya olusturma.
- Buyume esigi yokken domain bazli data/action/assertion/locator dosyasi olusturma.
- Domain bazli ayrima gecilecekse POM class olusturma.
- Gereksiz abstraction uretme.
- Locator'lari test dosyalarina kontrolsuz sekilde dagitma.
- waitForTimeout kullanma.
- Hayali data, hayali locator veya hayali assertion yazma.
- Ayni fonksiyonu farkli dosyalarda tekrar tekrar uretme.
```

---

## 19. Codex'e Verilecek Ana Prompt

Bu projede yeni test uretirken asagidaki prompt kullanilabilir:

```text
Bu projede Cucumber + Playwright TypeScript kullaniliyor.

Lutfen AGENTS.md dosyasindaki mimari ve kurallara gore ilerle.

Ozet mimari:
- Data: src/data/data.ts
- Locator: src/locators/locators.ts
- Action: src/actions/actions.ts
- Assertion: src/assertions/assertions.ts
- Flow: src/flows
- Cucumber Feature: features/generated
- Cucumber Step Definition: features/step-definitions
- Cucumber Support: features/support
- Config: src/config

Klasik Page Object Model kullanilmayacak.
Her sayfa icin ayri Page class olusturulmayacak.
Gauge runner kullanilmayacak.
Cucumber ve Gherkin kullanilacak.
Gauge concept veya `.cpt` kullanilmayacak.
Baslangicta data/locator/action/assertion katmanlari tek dosya olacak.
Dosyalar buyume esigini asarsa POM'a donmeden domain bazli katman dosyalarina ayrilacak.

Yeni test uretirken:
1. Once mevcut flow/data/action/assertion/locator dosyalarini kontrol et.
2. Var olan reusable yapilari kullan.
3. Eksikse dogru katmana kucuk ve temiz ekleme yap.
4. Tek dosya buyume esigini asiyorsa sadece ilgili katmani/domain'i ayir.
5. Locator seciminde oncelik:
   getByTestId > getByRole > getByLabel > getByPlaceholder > getByText > CSS > XPath
6. Hayali locator yazma.
7. waitForTimeout kullanma.
8. Assertion icin Playwright expect kullan.
9. Feature dosyalarini features/generated altinda business seviyesinde olustur.
10. Scenario isimleri TC ID ile baslasin.
11. Feature adimlarinda `Given/When/Then` yerine `*` kullan.
12. Step definition dosyalarini features/step-definitions altinda `defineStep as Step` ile olustur ve mumkunse flow fonksiyonlarini cagir.
13. Gereksiz mikro step uretme; business seviyesindeki step'leri reusable flow'lara bagla.
14. Testi calistir ve hata varsa minimum degisiklikle duzelt.

Simdi asagidaki manuel test case'i Playwright otomasyon testine cevir:
[TEST CASE BURAYA]
```

---

## 20. Manuel Test Case Formati

Codex'e verilecek manuel test case mumkunse su formatta olmalidir:

```text
Test Case ID:
TC_001

Baslik:
Kullanici gecerli bilgilerle login olur

URL:
/

Precondition:
- Kullanici login sayfasina erisebilir.
- Gecerli kullanici bilgisi vardir.

Test Data:
- user: validUser

Steps:
1. Login sayfasina git.
2. E-posta alanina gecerli e-posta gir.
3. Sifre alanina gecerli sifre gir.
4. Giris Yap butonuna tikla.

Expected Result:
- Kullanici basarili sekilde login olur.
- Hesap menusu gorunur.
- URL ana sayfa veya hesap sayfasina yonlenir.

Tags:
@smoke @auth
```

Kurallar:

- Test case adimlari acik olmalidir.
- Expected Result belirsiz birakilmamalidir.
- "Islem basarili olur" gibi genel ifadeler yerine neyin dogrulanacagi acik yazilmalidir.
- Kullanilacak test data belirtilmelidir.
- URL veya baslangic sayfasi belirtilmelidir.
- Tag belirtilmelidir.

---

## 21. Review Checklist

Yeni bir test veya kod uretildikten sonra asagidaki kontrol listesi uygulanmalidir:

```text
[ ] Test adi TC ID ile basliyor mu?
[ ] Test gerekli tag'leri iceriyor mu?
[ ] Feature dosyasi `features/generated` altinda mi?
[ ] Scenario adi TC ID ile basliyor mu?
[ ] Gherkin step'leri business dilinde mi?
[ ] Feature dosyasinda step keyword olarak sadece `*` kullanilmis mi?
[ ] Step definition karsiliklari `features/step-definitions` altinda mi?
[ ] Step definition dosyasinda `defineStep as Step` kullanilmis mi?
[ ] Step definition'lar mumkunse `src/flows` fonksiyonlarini mi cagiriyor?
[ ] Gereksiz mikro Cucumber step uretiminden kacinilmis mi?
[ ] Gereksiz waitForTimeout var mi?
[ ] Hayali locator var mi?
[ ] Locator mevcut mimariye gore dogru locator dosyasinda mi?
[ ] Data mevcut mimariye gore dogru data dosyasinda mi?
[ ] Reusable action mevcut mimariye gore dogru action dosyasinda mi?
[ ] Assertion mevcut mimariye gore dogru assertion dosyasinda mi?
[ ] Flow business anlamli mi?
[ ] Page Object class olusturulmamis mi?
[ ] Domain bazli data/action/assertion/locator dosyasi gereksiz olusturulmamis mi veya buyume esigi gerekcesi var mi?
[ ] Test bagimsiz calisabilir mi?
[ ] Assertion expected result ile uyumlu mu?
[ ] Test calistirilmis mi?
[ ] Hata varsa minimum degisiklikle duzeltilmis mi?
```

---

## 22. Son Karar

Bu projede hedef hizli ama surdurulebilir Playwright otomasyon gelistirmektir.

Kullanilacak:

```text
- Cucumber
- Gherkin
- @cucumber/cucumber
- Playwright browser automation
- TypeScript
- Data / Locator / Action / Assertion / Flow ayrimi
- Tek data dosyasi: src/data/data.ts
- Tek locator dosyasi: src/locators/locators.ts
- Tek action dosyasi: src/actions/actions.ts
- Tek assertion dosyasi: src/assertions/assertions.ts
- Buyume esigi asildiginda domain bazli katman dosyalarina gecis
- Feature dosyalari: features/generated
- Step definitions: features/step-definitions
- Cucumber World/Hooks: features/support
- Config
- Playwright expect assertions
```

Kullanilmayacak:

```text
- Gauge runner
- Gauge concept / `.cpt`
- Klasik Page Object Model
- Her sayfa icin ayri Page class
- Buyume esigi yokken domain bazli data/action/assertion/locator dosyalari
- Gereksiz abstraction
- waitForTimeout
- Hayali locator
```

Bu dokumandaki kurallar, Codex'in proje icinde yeni test uretirken ve mevcut kodu duzenlerken uymasi gereken temel standarttir.
