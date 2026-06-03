# AGENTS.md - Playwright Automation Agent Guide

Bu dokuman, bu projede Codex ile Playwright TypeScript otomasyon testleri uretirken uyulacak mimariyi, klasor yapisini, kodlama standartlarini ve test uretim kurallarini tanimlar.

Amac:
Manuel test case'leri hizli, stabil ve bakimi kolay Playwright otomasyon testlerine donusturmek.

Bu projede klasik Page Object Model kullanilmayacaktir. Her sayfa icin ayri `Page.ts` class dosyasi olusturulmayacaktir. Baslangic mimarisi sade tutulacaktir: data, locator, action ve assertion katmanlari tek dosya olarak yonetilecektir. Bu tek dosya modeli baslangic hizini artirmak icindir; proje buyudukce best practice, POM'a donmeden domain bazli katman dosyalarina ayrilmaktir.

---

## 1. Kullanilacak Teknolojiler

- TypeScript
- Playwright Test
- VS Code
- Codex
- Native Playwright test runner

Bu projede asagidaki yapilar kullanilmayacaktir:

- Gauge
- Cucumber
- Gherkin
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
Fixture   -> src/fixtures
Setup     -> src/setup
Config    -> src/config
Utils     -> src/utils
Test      -> tests/generated
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

src/fixtures
  Ortak test context ve fixture tanimlarini tutar.

src/setup
  Login session, storage state gibi on hazirliklari tutar.

src/config
  Ortam ve environment ayarlarini tutar.

src/utils
  Random data, tarih, fiyat formatlama gibi genel yardimci fonksiyonlari tutar.

tests/generated
  Manuel test case'lerden uretilen Playwright spec dosyalarini tutar.
```

---

## 3. Klasor Yapisi

```text
playwright-automation/
|
├── AGENTS.md
├── playwright.config.ts
├── package.json
├── tsconfig.json
|
├── tests/
│   └── generated/
│       ├── TC_001_login.spec.ts
│       ├── TC_002_product_search.spec.ts
│       ├── TC_003_add_to_basket.spec.ts
│       └── TC_004_checkout.spec.ts
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
    │   ├── auth.flow.ts
    │   ├── product.flow.ts
    │   ├── basket.flow.ts
    │   └── checkout.flow.ts
    │
    ├── fixtures/
    │   └── test.ts
    │
    ├── setup/
    │   └── auth.setup.ts
    │
    ├── config/
    │   └── env.ts
    │
    └── utils/
        ├── random.ts
        ├── price.ts
        └── date.ts
```

`components/` klasoru baslangicta kullanilmayacaktir. Modal, ortak component veya tekrar eden kompleks UI yapilari ortaya cikarsa daha sonra eklenebilir.

---

## 4. Mimari Akis

Bir test yazilirken akis su sekilde olmalidir:

```text
Test
  -> Flow
    -> Action
      -> Locator
    -> Assertion
      -> Locator
    -> Data
```

Ornek kullanim mantigi:

```text
tests/generated/TC_003_add_to_basket.spec.ts
  -> flows/basket.flow.ts
    -> actions/actions.ts
    -> assertions/assertions.ts
    -> locators/locators.ts
    -> data/data.ts
```

Test dosyasi mumkun oldugunca sade kalmalidir. Test dosyasinda locator karmasasi olmamalidir.

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
    emailInput: page.getByLabel('E-posta'),
    passwordInput: page.getByLabel('Sifre'),
    loginButton: page.getByRole('button', { name: 'Giris Yap' }),
    accountMenu: page.getByTestId('account-menu'),
  },

  product: {
    searchInput: page.getByPlaceholder('Urun ara'),
    productCards: page.getByTestId('product-card'),
    firstProductCard: page.getByTestId('product-card').first(),
    productTitle: page.getByTestId('product-title'),
    addToBasketButton: page.getByRole('button', { name: 'Sepete Ekle' }),
  },

  basket: {
    basketLink: page.getByRole('link', { name: /Sepet|Basket/ }),
    basketItems: page.getByTestId('basket-item'),
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
    email: process.env.VALID_USER_EMAIL ?? '',
    password: process.env.VALID_USER_PASSWORD ?? '',
  },
} as const;

export const products = {
  defaultSearchKeyword: process.env.DEFAULT_PRODUCT_SEARCH_KEYWORD ?? '',
} as const;
```

Kurallar:

- Test dosyasi icinde hard-coded data mumkun oldugunca kullanilmamalidir.
- Kullanici, urun, adres, odeme bilgileri ayni data dosyasinda gruplu olarak tutulmalidir.
- Tek testte kullanilan gecici data test icinde olabilir.
- Bir data iki veya daha fazla testte kullanilacaksa `src/data/data.ts` icine tasinmalidir.
- Hassas bilgi, gercek sifre veya gercek kullanici datası commit edilmemelidir.
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

export async function fillLoginForm(
  page: Page,
  email: string,
  password: string
) {
  const locator = locators(page);

  await locator.auth.emailInput.fill(email);
  await locator.auth.passwordInput.fill(password);
}

export async function clickLoginButton(page: Page) {
  const locator = locators(page);

  await locator.auth.loginButton.click();
}

export async function searchProduct(page: Page, keyword: string) {
  const locator = locators(page);

  await locator.product.searchInput.fill(keyword);
  await locator.product.searchInput.press('Enter');
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

  await expect(locator.auth.accountMenu).toBeVisible();
}

export async function expectProductListVisible(page: Page) {
  const locator = locators(page);

  await expect(locator.product.productCards.first()).toBeVisible();
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
await expect(page).toHaveURL(/basket|sepet/);
await expect(locator.product.productCards.first()).toBeVisible();
await expect(locator.basket.basketItems).toHaveCount(1);
```

Kacinilacak ornek:

```ts
expect(await locator.basket.basketItems.first().isVisible()).toBe(true);
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
import { fillLoginForm, clickLoginButton } from '../actions/actions';
import { expectLoginSuccess } from '../assertions/assertions';

export async function login(page: Page, user = users.validUser) {
  await page.goto('/login');

  await fillLoginForm(page, user.email, user.password);
  await clickLoginButton(page);

  await expectLoginSuccess(page);
}
```

Kurallar:

- Flow business anlamli olmalidir.
- Flow icinde birden fazla action ve assertion olabilir.
- Flow testin okunabilirligini artirmalidir.
- Flow icine asiri ozel test case mantigi konulmamalidir.
- Sadece bir testte kullanilacak cok ozel akis dogrudan test dosyasinda yazilabilir.
- Ayni akis iki veya daha fazla testte kullanilacaksa flow haline getirilmelidir.

---

## 11. Fixture Kullanim Kurallari

Fixture dosyasi `src/fixtures/test.ts` altinda tutulmalidir.

Ornek:

```ts
// src/fixtures/test.ts
import { test as base, expect } from '@playwright/test';
import { users } from '../data/data';

export const test = base.extend<{
  validUser: typeof users.validUser;
}>({
  validUser: async ({}, use) => {
    await use(users.validUser);
  },
});

export { expect };
```

Test dosyasinda kullanim:

```ts
import { test, expect } from '../../src/fixtures/test';
import { login } from '../../src/flows/auth.flow';

test('TC_001 - Kullanici gecerli bilgilerle login olur @smoke @auth', async ({ page, validUser }) => {
  await login(page, validUser);

  await expect(page).toHaveURL(/account|home/);
});
```

Kurallar:

- Testlerde `@playwright/test` dogrudan import etmek yerine mumkunse `src/fixtures/test` import edilmelidir.
- Ortak test context, default user, ortak setup gibi ihtiyaclar fixture uzerinden saglanabilir.
- Fixture gereksiz karmasik hale getirilmemelidir.
- Her kucuk data icin fixture yazilmamalidir.

---

## 12. Setup ve Login Session Kurallari

Eger testlerin buyuk bolumu login gerektiriyorsa her testte tekrar login yapmak yerine storage state kullanilmalidir.

Ornek setup:

```ts
// src/setup/auth.setup.ts
import { test as setup } from '@playwright/test';
import { users } from '../data/data';
import { fillLoginForm, clickLoginButton } from '../actions/actions';
import { expectLoginSuccess } from '../assertions/assertions';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');

  await fillLoginForm(page, users.validUser.email, users.validUser.password);
  await clickLoginButton(page);

  await expectLoginSuccess(page);

  await page.context().storageState({ path: '.auth/user.json' });
});
```

Kurallar:

- Login cok fazla testte gerekiyorsa `storageState` kullanilmalidir.
- Login testleri ayrica yazilmalidir.
- Login olmayan senaryolar icin storage state kullanilmamalidir.
- `.auth/user.json` gibi session dosyalari git'e commit edilmemelidir.
- `.auth/` klasoru `.gitignore` icine eklenmelidir.

---

## 13. Config ve Environment Kurallari

Ortam bilgileri `src/config/env.ts` veya `playwright.config.ts` uzerinden yonetilmelidir.
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

Genel yardimci fonksiyonlar `src/utils` altinda tutulmalidir.

Ornek:

```ts
// src/utils/random.ts
export function randomEmail() {
  return `test_${Date.now()}@test.com`;
}
```

Kurallar:

- `utils` klasoru genel amacli yardimcilar icin kullanilmalidir.
- Sayfaya veya business akisina ozel islemler utils icine konulmamalidir.
- `utils` klasoru copluk haline getirilmemelidir.
- Bir fonksiyon sadece tek domain icinse ilgili action, assertion veya flow dosyasinda kalmalidir.

---

## 15. Test Dosyasi Yazim Kurallari

Test dosyalari `tests/generated` altinda olusturulmalidir.

Ornek:

```ts
// tests/generated/TC_003_add_to_basket.spec.ts
import { test, expect } from '../../src/fixtures/test';
import { addDefaultProductToBasket } from '../../src/flows/basket.flow';

test('TC_003 - Kullanici urunu sepete ekler @smoke @basket', async ({ page }) => {
  await test.step('Kullanici varsayilan urunu sepete ekler', async () => {
    await addDefaultProductToBasket(page);
  });

  await test.step('Sepet sayfasi basariyla dogrulanir', async () => {
    await expect(page).toHaveURL(/basket|sepet/);
  });
});
```

Kurallar:

- Test adi manuel test case ID ile baslamalidir.
- Test adinda ilgili tag'ler bulunmalidir.
- Test icinde mumkunse locator detayi olmamalidir.
- Test business senaryo gibi okunmalidir.
- Test icinde gereksiz teknik detay olmamalidir.
- Testte `test.step()` kullanilmalidir.
- Testte beklenen sonuclar assertion veya flow icinde dogrulanmalidir.
- Test bagimsiz calisabilir olmalidir.
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

## 16. test.step Kullanim Standardi

Her onemli business adimi `test.step()` ile ayrilmalidir.

Kurallar:

- `test.step()` aciklamalari Turkce ve anlasilir olmalidir.
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
8. Test dosyasini tests/generated altinda olustur.
9. Testte test.step kullan.
10. Testi calistir.
11. Hata varsa minimum degisiklikle duzelt.
12. Hayali locator veya dogrulanmamis assertion birakma.
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
Bu projede Playwright TypeScript kullaniliyor.

Lutfen AGENTS.md dosyasindaki mimari ve kurallara gore ilerle.

Ozet mimari:
- Data: src/data/data.ts
- Locator: src/locators/locators.ts
- Action: src/actions/actions.ts
- Assertion: src/assertions/assertions.ts
- Flow: src/flows
- Fixture: src/fixtures
- Setup: src/setup
- Config: src/config
- Utils: src/utils
- Testler: tests/generated

Klasik Page Object Model kullanilmayacak.
Her sayfa icin ayri Page class olusturulmayacak.
Gauge, Cucumber veya Gherkin kullanilmayacak.
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
9. Testleri tests/generated altinda olustur.
10. Test isimleri TC ID ile baslasin.
11. test.step kullan.
12. Testi calistir ve hata varsa minimum degisiklikle duzelt.

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
[ ] test.step kullanilmis mi?
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
- Native Playwright Test
- TypeScript
- Data / Locator / Action / Assertion / Flow ayrimi
- Tek data dosyasi: src/data/data.ts
- Tek locator dosyasi: src/locators/locators.ts
- Tek action dosyasi: src/actions/actions.ts
- Tek assertion dosyasi: src/assertions/assertions.ts
- Buyume esigi asildiginda domain bazli katman dosyalarina gecis
- Fixture
- Setup
- Config
- Utils
- test.step
- Playwright expect assertions
```

Kullanilmayacak:

```text
- Gauge
- Cucumber
- Gherkin
- Klasik Page Object Model
- Her sayfa icin ayri Page class
- Buyume esigi yokken domain bazli data/action/assertion/locator dosyalari
- Gereksiz abstraction
- waitForTimeout
- Hayali locator
```

Bu dokumandaki kurallar, Codex'in proje icinde yeni test uretirken ve mevcut kodu duzenlerken uymasi gereken temel standarttir.
