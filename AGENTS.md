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
  `*` ile yazilan Gherkin adimlarinin TypeScript `Given/When/Then` karsiliklarini tutar.

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

## 5.2 Ortak Akil, Reuse ve Standardizasyon Kurallari

Bu projede farkli branch ve farkli PC'lerde calisan kisilerin ayni otomasyon dilini kullanmasi hedeflenir. Codex veya gelistirici yeni test uretirken once mevcut sozlugu ve reusable parcalari aramalidir.

Yeni locator, action, assertion, flow veya step definition yazmadan once asagidaki aramalar yapilmalidir:

```powershell
rg "Oluştur|Kaydet|Sil|Ara|Temizle|Vazgeç|Onayla|Geri" src features
rg "step metni veya beklenen ekran basligi" features src
rg "locator adi veya UI metni" src/locators src/actions src/assertions src/flows features/step-definitions
```

Reuse karari su sirayla verilmelidir:

```text
1. Ayni business step zaten varsa ayni step metni kullanilir.
2. Ayni locator zaten varsa mevcut locator kullanilir.
3. Ayni action/assertion/flow zaten varsa mevcut fonksiyon kullanilir.
4. Ortak UI elemaniysa `common` veya `navigation` gruplarina eklenir.
5. Sadece ilgili sayfaya aitse ilgili domain/sayfa grubunda tutulur.
6. Gercekten yeni ihtiyacsa dogru katmana kucuk ve temiz ekleme yapilir.
```

Ortak UI elemani tanimi:

- Birden fazla sayfada ayni selector, ayni rol veya ayni davranisla kullanilan eleman ortak kabul edilir.
- `Oluştur`, `Kaydet`, `Sil`, `Ara`, `Temizle`, `Vazgeç`, `Onayla`, `Geri` gibi global toolbar/form aksiyonlari once ortak kullanim adayi olarak degerlendirilmelidir.
- Sidebar menu acma, menu path takip etme, secili menu linkini dogrulama gibi navigasyon davranislari `navigation` grubu ve reusable action ile yonetilmelidir.
- Ortak eleman eklenmeden once gercek sitede locator dogrulanmalidir.
- Sadece tek sayfaya ozel baslik, kolon, alan veya business durumlari ortak gruba alinmamalidir.

Ortak locator gruplama standardi:

```ts
locators(page).common.createLink
locators(page).navigation.sidebarMenuButton('MFYS')
locators(page).navigation.sidebarMenuLink('Otomatik Parametre Tanımlama')
locators(page).navigation.selectedSidebarMenuLink('Otomatik Parametre Tanımlama')
locators(page).automaticParameters.listTitle
```

Step sozlugu kurallari:

- Ayni anlama gelen farkli step metinleri uretilmemelidir.
- Once `features/step-definitions` ve `features/generated` icinde ayni anlamda step aranmalidir.
- Varsa mevcut step metni aynen kullanilmalidir.
- Yoksa yeni step Turkce, kisa, business seviyesinde ve tekrar kullanilabilir yazilmalidir.
- `Oluştur butonuna tıklanır`, `Create butonuna basılır`, `Kullanıcı oluşturur` gibi ayni isi yapan farkli step'ler birlikte bulunmamalidir.
- Sayfaya ozel beklenen sonuc varsa step metni test case ID veya ekran anlami ile ayrismalidir.

Yeni ortak parca ekleme kurallari:

- Ortak parca sadece gercek tekrar veya mevcut testin acik ortak ihtiyaci varsa eklenir.
- Kullanilmayan genel helper, kullanilmayan common locator veya ileride lazim olur diye action yazilmaz.
- Ortak action icinde assertion yazilmaz.
- Ortak assertion icinde click/fill gibi action yazilmaz.
- Ortak step definition mumkunse flow cagirir; locator veya Playwright detayi icermez.
- Yeni ortak parca eklendiyse mevcut ilgili test de o ortak parcayi kullanacak sekilde guncellenir.

Branch ve PR standardi:

- PR review'da ayni step metninin, ayni locator'in veya ayni action'in tekrar uretilip uretilmedigi kontrol edilir.
- Ayni is icin iki farkli isim varsa yeni isim eklenmez; mevcut isim tercih edilir.
- Ortak sozlukte degisiklik yapildiysa ilgili mevcut testler minimum degisiklikle guncellenir.
- Farkli branch'lerde ayni common alan degistiriliyorsa merge sonrasi tekrar `rg` ile duplicate kontrolu yapilir.

---

## 5.3 TODO Birakmama ve Engelde Geri Alma Kurali

Bu projede test kodu icinde TODO, gecici locator, bos step veya calismayan placeholder birakilmayacaktir. Kodu okuyamayan veya automation detayina hakim olmayan ekip uyeleri icin test ya calisan ve dogrulanmis halde kalmali ya da hic eklenmemelidir.

Asagidaki durumlarda yeni test veya ilgili ekleme koda birakilmaz:

- Zorunlu locator gercek sitede dogrulanamiyorsa.
- Expected Result icin anlamli ve dogrulanabilir assertion yazilamiyorsa.
- Ekran yetki, data, environment veya uygulama hatasi nedeniyle acilamiyorsa.
- Manuel test case aksiyonu uygulamada mantikli bir karsilik bulmuyorsa.
- Testi gecirmek icin fake selector, zorlama click, gereksiz hard-code veya anlamsiz assertion gerekecekse.

Bu durumda Codex su sekilde davranmalidir:

```text
1. O prompt/turn icinde yaptigi yeni feature, step, flow, action, assertion, locator ve data degisikliklerini geri al.
2. Kullaniciya veya onceki branch calismasina ait degisiklikleri geri alma.
3. Kodda TODO, placeholder step, bos assertion veya gecici locator birakma.
4. Final cevapta neyin denendigini, nerede bloklandigini ve neyin duzeltilmesi gerektigini net yaz.
5. Gerekliyse kullanicidan istenecek bilgiyi soyle: dogru locator, yetki, test data, ekran yolu, beklenen sonuc veya uygulama fix'i.
```

Engel raporu su formata yakin olmalidir:

```text
Bu test kodda birakilmadi.
Sebep: [dogrulanamayan locator / eksik yetki / beklenen sonuc belirsiz / ekran acilmiyor]
Denendi: [login sonrasi izlenen ekran yolu veya aksiyon]
Gereken duzeltme: [kullanicidan veya uygulamadan beklenen net bilgi]
Geri alinanlar: [bu promptta olusturulan dosya veya degisiklik ozeti]
```

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
});
```

Kurallar:

- Hayali locator yazilmayacaktir.
- Locator gercek sayfada dogrulanmadan kullanilmayacaktir.
- Emin olunmayan locator once Playwright ile browser uzerinde denenmelidir.
- Ayni locator birden fazla yerde kullanilacaksa `src/locators/locators.ts` icine alinmalidir.
- Tek kullanimlik locator test icinde kalabilir; tekrar ederse locator dosyasina tasinmalidir.
- Ortak toolbar/form aksiyonlari `common` grubunda tutulmalidir.
- Sidebar, ust menu, breadcrumb gibi ortak navigasyon locator'lari `navigation` grubunda tutulmalidir.
- Sayfaya ozel baslik, kolon, alan ve business durum locator'lari ilgili sayfa/domain grubunda tutulmalidir.

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
- Birden fazla sayfada ortak kullanilan toolbar/form aksiyonu icin tek reusable action yazilmalidir.
- Sidebar menu path acma gibi tekrar eden navigasyon davranislari sayfa sayfa kopyalanmamalidir.
- Ortak action parametre alabiliyorsa hard-coded sayfa adi veya menu adi action icine gomulmemelidir.
- Reusable action icinde raporlanabilir click/fill yapiliyorsa `reportAction` ile Action, Locator Name, Locator Value ve gerekiyorsa Value bilgisi Cucumber raporuna eklenmelidir.
- Sifre, token, gizli cevap gibi hassas degerler rapora acik yazilmamalidir; maskelenmelidir.

Ortak reusable action isimleri bu mantikta tutulabilir:

```ts
openSidebarMenuPath(page, ['MFYS', 'Genel Parametre Ayarları'], 'Hedef Ekran')
clickSidebarMenuLink(page, 'Hedef Ekran')
clickCreateLink(page)
```

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
- Reusable assertion icinde dogrulanacak locator icin `reportAssertion` ile Assertion, Locator Name, Locator Value ve Expected bilgisi Cucumber raporuna eklenmelidir.
- Assertion raporu expect'ten once yazilmalidir; boylece fail durumunda da hangi locator ve beklenen sonuc oldugu raporda gorunur.
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
  * Login ekrani acilir
  * Kullanici bilgileri ile giris yapilir
  * Kullanicinin login oldugu dogrulanir
```

```ts
import { Given, Then, When } from '@cucumber/cucumber';

When('Kullanici bilgileri ile giris yapilir', async function (this: CustomWorld) {
  await submitLogin(getPage(this), users.validUser);
});
```

Kurallar:

- Feature dosyasinda business seviyesinde anlamli adimlar yazilmalidir.
- Feature dosyalarinda step keyword olarak `Given`, `When`, `Then`, `And`, `But` yerine `*` kullanilmalidir.
- Step definition dosyalarinda adimin anlamina gore `Given`, `When`, `Then` kullanilmalidir.
- `defineStep as Step` kullanilmayacaktir.
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
    * Login ekrani acilir
    * Kullanici bilgileri ile giris yapilir
    * Kullanicinin login oldugu dogrulanir
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
  * Login ekrani acilir
  * Kullanici bilgileri ile giris yapilir
  * Kullanicinin login oldugu dogrulanir
```

Kurallar:

- Step metinleri Turkce, kisa ve anlasilir olmalidir.
- Feature dosyalarinda step keyword olarak sadece `*` kullanilmalidir.
- `Given`, `When`, `Then`, `And`, `But` keyword'leri yeni feature dosyalarinda kullanilmamalidir.
- Step definition dosyalarinda adimin anlamina gore `Given`, `When`, `Then` kullanilmalidir.
- `defineStep as Step` kullanilmamalidir.
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
3. Mevcut step/locator/action/assertion/flow icin `rg` ile reuse aramasi yap.
4. Ilgili mevcut flow var mi kontrol et.
5. Ilgili flow varsa onu kullan.
6. Flow yoksa src/data/data.ts, src/actions/actions.ts, src/assertions/assertions.ts ve src/locators/locators.ts yapisini kontrol et.
7. Ortak UI veya navigasyon ihtiyaci varsa once `common` veya `navigation` gruplarini kullan.
8. Eksik reusable parca varsa once mevcut tek dosya yapisina kucuk ve temiz ekleme yap.
9. Tek dosya buyume esigini asiyorsa, sadece ilgili katmani/domain'i domain bazli dosyaya ayir.
10. Feature dosyasini `features/generated` altinda business seviyesinde olustur.
11. Eksik Gherkin step karsiliklarini `features/step-definitions` icinde olustur.
12. Step definition icinden mumkunse `src/flows` fonksiyonlarini cagir.
13. Testi calistir.
14. Hata varsa minimum degisiklikle duzelt.
15. Hayali locator, dogrulanmamis assertion veya TODO birakma.
16. Zorunlu bir parca dogrulanamiyorsa o promptta yaptigin test degisikliklerini geri al ve engeli raporla.
```

Codex sunlari yapmamalidir:

```text
- Her test icin yeni Page Object class olusturma.
- Her sayfa icin yeni dosya olusturma.
- Buyume esigi yokken domain bazli data/action/assertion/locator dosyasi olusturma.
- Domain bazli ayrima gecilecekse POM class olusturma.
- Gereksiz abstraction uretme.
- Locator'lari test dosyalarina kontrolsuz sekilde dagitma.
- Var olan step/locator/action/assertion varken ayni is icin yenisini uretme.
- Ortak UI elemanini sayfa sayfa yeniden tanimlama.
- waitForTimeout kullanma.
- Hayali data, hayali locator veya hayali assertion yazma.
- TODO, placeholder step, bos assertion veya gecici locator birakma.
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
1. Once `rg` ile mevcut step/flow/data/action/assertion/locator aramasi yap.
2. Var olan reusable yapilari kullan.
3. Ayni anlama gelen yeni step metni uretme; mevcut step metnini kullan.
4. Ortak UI elemaniysa `common`, ortak navigasyonsa `navigation` grubunu kullan.
5. Eksikse dogru katmana kucuk ve temiz ekleme yap.
6. Tek dosya buyume esigini asiyorsa sadece ilgili katmani/domain'i ayir.
7. Locator seciminde oncelik:
   getByTestId > getByRole > getByLabel > getByPlaceholder > getByText > CSS > XPath
8. Hayali locator yazma.
9. waitForTimeout kullanma.
10. Assertion icin Playwright expect kullan.
11. Feature dosyalarini features/generated altinda business seviyesinde olustur.
12. Scenario isimleri TC ID ile baslasin.
13. Feature adimlarinda `Given/When/Then` yerine `*` kullan.
14. Step definition dosyalarini features/step-definitions altinda `Given/When/Then` ile olustur ve mumkunse flow fonksiyonlarini cagir.
15. Gereksiz mikro step uretme; business seviyesindeki step'leri reusable flow'lara bagla.
16. Yeni reusable click/fill action yazilirse Cucumber raporuna Action, Locator Name, Locator Value ve gerekiyorsa Value bilgisi dusmelidir; hassas degerler maskelenmelidir.
17. Yeni reusable assertion yazilirse Cucumber raporuna Assertion, Locator Name, Locator Value ve Expected bilgisi expect'ten once dusmelidir; fail durumunda hangi elementin fail verdigi raporda gorunmelidir.
18. Testi calistir ve hata varsa minimum degisiklikle duzelt.
19. Eksik locator, belirsiz expected result veya anlamsiz akis varsa TODO birakma; bu promptta yaptigin degisiklikleri geri al ve neyin duzeltilmesi gerektigini raporla.

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
[ ] Step definition dosyasinda adimin anlamina gore `Given/When/Then` kullanilmis mi?
[ ] Step definition'lar mumkunse `src/flows` fonksiyonlarini mi cagiriyor?
[ ] Yeni step yazmadan once mevcut step sozlugu `rg` ile aranmis mi?
[ ] Ayni anlama gelen duplicate step metni uretilmemis mi?
[ ] Gereksiz mikro Cucumber step uretiminden kacinilmis mi?
[ ] Gereksiz waitForTimeout var mi?
[ ] Kodda TODO, placeholder step, bos assertion veya gecici locator yok mu?
[ ] Hayali locator var mi?
[ ] Yeni locator yazmadan once mevcut locator'lar `rg` ile aranmis mi?
[ ] Ortak UI elemani `common`, ortak navigasyon elemani `navigation` grubunda mi?
[ ] Sayfaya ozel locator yanlislikla common gruba alinmamis mi?
[ ] Locator mevcut mimariye gore dogru locator dosyasinda mi?
[ ] Data mevcut mimariye gore dogru data dosyasinda mi?
[ ] Reusable action mevcut mimariye gore dogru action dosyasinda mi?
[ ] Yeni action yazmadan once mevcut action'lar `rg` ile aranmis mi?
[ ] Assertion mevcut mimariye gore dogru assertion dosyasinda mi?
[ ] Flow business anlamli mi?
[ ] Page Object class olusturulmamis mi?
[ ] Domain bazli data/action/assertion/locator dosyasi gereksiz olusturulmamis mi veya buyume esigi gerekcesi var mi?
[ ] Test bagimsiz calisabilir mi?
[ ] Assertion expected result ile uyumlu mu?
[ ] Test calistirilmis mi?
[ ] Hata varsa minimum degisiklikle duzeltilmis mi?
[ ] Zorunlu locator/assertion dogrulanamadiysa bu prompttaki degisiklikler geri alinip engel raporlanmis mi?
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
