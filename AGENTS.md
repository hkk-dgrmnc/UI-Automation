# AGENTS.md - Playwright Automation Agent Guide

Bu dokuman, bu projede Codex ile Cucumber + Playwright TypeScript otomasyon testleri uretirken uyulacak mimariyi, klasor yapisini, kodlama standartlarini ve test uretim kurallarini tanimlar.

Amac:
Manuel test case'leri hizli, stabil, okunabilir ve bakimi kolay Cucumber + Playwright otomasyon testlerine donusturmek.

Codex calisma prensibi:
- Bu dosya proje kok dizininde `AGENTS.md` olarak tutulmalidir.
- Codex proje uzerinde calisirken bu dosyadaki kurallari ana kaynak kabul etmelidir.
- Büyük refactor, framework degisikligi veya dependency ekleme gibi islemlerden once kullaniciya plan sunulmalidir.
- Kullanici onayi olmadan proje mimarisi kokten degistirilmemelidir.
- Var olan kod stili, klasor yapisi ve test uretim standardi korunmalidir.


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
Action    -> src/actions/  (domain bazli: common/auth/navigation/... .actions.ts)
Assertion -> src/assertions/  (domain bazli: common/auth/... .assertions.ts)
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

src/actions/  (common.actions.ts, auth.actions.ts, navigation.actions.ts, ...)
  Tekil ve reusable kullanici aksiyonlarini domain bazli dosyalarda tutar.
  Paylasilan primitive'ler (click/fill) ve generic motor common.actions.ts'tedir.

src/assertions/  (common.assertions.ts, auth.assertions.ts, ...)
  Reusable dogrulama metotlarini domain bazli dosyalarda tutar.
  Paylasilan primitive'ler (expectVisible/expectCount ...) ve generic dogrulamalar common.assertions.ts'tedir.

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
    ├── actions/                    # Domain bazli (esik asildi, bolundu)
    │   ├── common.actions.ts       # Paylasilan click/fill + generic motor
    │   ├── auth.actions.ts
    │   ├── navigation.actions.ts
    │   └── automaticParameters.actions.ts
    │
    ├── assertions/                 # Domain bazli (esik asildi, bolundu)
    │   ├── common.assertions.ts    # Paylasilan expect* + generic dropdown/text
    │   ├── auth.assertions.ts
    │   └── automaticParameters.assertions.ts
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
    -> actions/auth.actions.ts
    -> assertions/auth.assertions.ts
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

Ileride dosyalar cok buyurse veya bakim zorlasirsa, bu tek dosyalar domain bazli ayrilmalidir. Bu ayrim `actions` ve `assertions` katmanlari icin ZATEN yapilmistir (bkz. 5.1 "Guncel durum"); `data` ve `locators` hala tek dosyadir.

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

Guncel durum (bu repo):

- `actions` ve `assertions` katmanlari buyume esigini (200-300 satir) astigi icin domain bazli dosyalara BOLUNMUSTUR. Gecerli yapi:
  - `src/actions/`: `common.actions.ts` (paylasilan `click`/`fill` + generic motor: `readElementText`/`readElementAttribute`/`fillElement`/`clickByText` + `clickCreateLink`), `auth.actions.ts`, `navigation.actions.ts`, `automaticParameters.actions.ts`
  - `src/assertions/`: `common.assertions.ts` (paylasilan `expectVisible`/`expectCount`/... primitive'leri + generic `expectListboxOptionsVisible`/`expectTextPresent`), `auth.assertions.ts`, `automaticParameters.assertions.ts`
- `src/data/data.ts` ve `src/locators/locators.ts` hala TEK dosyadir (esik asilmadi); buyuyunce ayni strateji ile bolunur.
- Yeni action/assertion eklerken: dogru domain dosyasina ekle; paylasilan bir primitive gerekiyorsa `common.actions`/`common.assertions`'tan import et; uygun domain dosyasi yoksa yeni bir `<domain>.actions.ts` / `<domain>.assertions.ts` ac. Tek bir `actions.ts` / `assertions.ts` dosyasina GERI DONME.

---

## 5.2 Ortak Akil, Reuse ve Standardizasyon Kurallari

Bu projede farkli branch ve farkli PC'lerde calisan kisilerin ayni otomasyon dilini kullanmasi hedeflenir. Codex veya gelistirici yeni test uretirken once mevcut sozlugu ve reusable parcalari aramalidir.

Reuse aramasinin hizli yolu `INVENTORY.md` dosyasidir. Bu dosya otomatik uretilir (`npm run inventory`) ve mevcut tum step / locator / action / flow sozlugunu tek yerde listeler. Yeni test yazmadan once once bu dosya okunmali, ardindan gerekiyorsa `rg` ile derinlemesine arama yapilmalidir:

```powershell
rg "Oluştur|Kaydet|Sil|Ara|Temizle|Vazgeç|Onayla|Geri" src features
rg "step metni veya beklenen ekran basligi" features src
rg "locator adi veya UI metni" src/locators src/actions src/assertions src/flows features/step-definitions
```

Reuse kurallari mekanik kapilarla da korunur. `npm run check` (typecheck + `inventory:check`) su durumlarda hata verir ve test gecmez:

- Ayni selector (locator value) iki farkli locator isminde tanimliysa.
- `LOCATOR_REPORTS` icindeki `name`, kendi `grup.key` yolu ile uyusmuyorsa.
- Normalize edildiginde (kucuk harf, noktalama, bosluk) ayni metne dusen iki step tanimi varsa.
- `INVENTORY.md` guncel degilse (locator/step ekleyip `npm run inventory` calistirilmamissa).

Yeni locator/step ekledikten sonra `npm run inventory` calistirilip uretilen `INVENTORY.md` commit edilmelidir.

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

Sidebar navigasyon step standardi:

Bir sayfaya sidebar menu uzerinden erisim icin sayfa bazli ozel step yazilmamalidir. `features/step-definitions/navigation.steps.ts` icindeki genel step kullanilmalidir:

```gherkin
* "MFYS > Genel Parametre Ayarları > Tanımlama İşlemleri > Otomatik Parametre Tanımlama" menü yolundan sayfaya gidilir
```

Format: `"UstMenu > AltMenu > ... > SayfaAdi"` — soldan saga her seviye ` > ` ile ayrilir, son eleman tiklanan link adidir.

Step DERINLIKTEN BAGIMSIZDIR: seviye sayisi sabit degildir (1..N). String ` > ` ile bolunur; SON eleman tiklanan link, geri kalan TUM elemanlar sirayla acilacak ust menulerdir. Acma dongusu parent sayisi kadar doner (kodda sabit "4 seviye" varsayimi yoktur). Yani ayni step farkli derinliklerde calisir:

```gherkin
* "Para Transferi > Başka Hesaba > Başka Banka" menü yolundan sayfaya gidilir
* "Raporlama > Keşfet" menü yolundan sayfaya gidilir
* "Ana Sayfa" menü yolundan sayfaya gidilir
```

Onemli: Cucumber ifadesi `{string} menü yolundan sayfaya gidilir` oldugundan kapanis tirnagi ile `menü` arasinda BIR BOSLUK olmalidir (`"...Banka" menü`, `"...Banka"menü` degil); bosluk yoksa step eslesmez.

Bu step tum uygulamada gecerlidir; yeni sayfa icin ayri navigation step yazilmaz, sadece menü yolu string olarak verilir.

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

Tek dosyada locator gruplama ornegi (`SELECTORS`/`TEXTS` sabitleri + `locators` + `LOCATOR_REPORTS` birlikte):

```ts
// src/locators/locators.ts
import { Page } from '@playwright/test';

// Selector ve UI metinleri tek kaynaktir: ayni string hem locator kurulumunda
// hem LOCATOR_REPORTS value alaninda kullanilir. Elle iki kez yazilmaz.
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
});

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
};
```

Kurallar:

- Hayali locator yazilmayacaktir.
- Locator gercek sayfada dogrulanmadan kullanilmayacaktir.
- Emin olunmayan locator once Playwright ile browser uzerinde denenmelidir.
- Yeni locator/senaryo uretirken locator'lar Playwright MCP server (`playwright`) ile gercek sayfada acilip dogrulanmalidir; tahmin edilen selector dogrulanmadan koda yazilmaz.
- Playwright MCP ile locator dogrulanamiyorsa (ekran acilmiyor, yetki/data yok, eleman yok) Bolum 5.3 geregi o promptta yapilan degisiklikler geri alinir ve engel raporlanir; TODO veya gecici locator birakilmaz.
- Ayni locator birden fazla yerde kullanilacaksa `src/locators/locators.ts` icine alinmalidir.
- Tek kullanimlik locator test icinde kalabilir; tekrar ederse locator dosyasina tasinmalidir.
- Ortak toolbar/form aksiyonlari `common` grubunda tutulmalidir.
- Sidebar, ust menu, breadcrumb gibi ortak navigasyon locator'lari `navigation` grubunda tutulmalidir.
- Sayfaya ozel baslik, kolon, alan ve business durum locator'lari ilgili sayfa/domain grubunda tutulmalidir.
- Her locator ile birlikte `LOCATOR_REPORTS` icine de rapor metadatasi (`name`, `value`) eklenmelidir. Action ve assertion dosyalari bu sabiti import ederek kullanir; inline string yazilmaz.
- CSS selector ve UI metni gibi string'ler hem `locators` hem `LOCATOR_REPORTS` icinde elle iki kez yazilmamalidir; dosya basindaki `SELECTORS` / `TEXTS` sabitlerinde bir kez tanimlanir ve her iki yerde de o sabit kullanilir. Boylece locator degisip rapor value'su unutuldugunda rapor sessizce yanlis bilgi gosteremez.

---

## 7. Data Yazim Kurallari

Test datalari `src/data/data.ts` icinde tutulmalidir.

Ornek:

Kullanicilar `.env` icinde numarali `USER<N>` bloklari olarak tutulur; her blok `USER<N>_USERNAME` ve `USER<N>_PASSWORD` ciftinden olusur. Step'ten kullanici, blok anahtari ile secilir (ornek: `"USER1"`); `getUser(userKey)` ilgili blogun username ve password degerlerini dondurur. Boylece gercek kullanici adi ve sifre koda veya feature dosyasina hard-code edilmez.

```ts
// src/data/data.ts
export type TestUser = {
  username: string;
  password: string;
};

/**
 * Step'ten gelen kullanici anahtarini (.env'deki blok adi) ilgili
 * USER<N>_USERNAME / USER<N>_PASSWORD degerleri ile eslestirir.
 * Ornek: "USER1" -> USER1_USERNAME ve USER1_PASSWORD okunur.
 */
export function getUser(userKey: string): TestUser {
  const username = process.env[`${userKey}_USERNAME`];
  const password = process.env[`${userKey}_PASSWORD`];

  if (!username) {
    throw new Error(`"${userKey}" kullanıcısı .env içinde tanımlı değil.`);
  }

  if (!password) {
    throw new Error(`"${userKey}" kullanıcısının şifresi tanımlı değil.`);
  }

  return { username, password };
}
```

`.env` / `.env.example` karsiligi:

```bash
USER1_USERNAME=gm1
USER1_PASSWORD=
# USER2_USERNAME=gm2
# USER2_PASSWORD=
```

Kurallar:

- Feature dosyasi icinde hard-coded data mumkun oldugunca kullanilmamalidir; kullanici secimi `"USER1"` gibi `.env` blok anahtari ile yapilir, gercek kullanici adi ve sifre asla feature'a yazilmaz.
- Kullanici, urun, adres, odeme bilgileri ayni data dosyasinda gruplu olarak tutulmalidir.
- Tek testte kullanilan gecici data test icinde olabilir.
- Bir data iki veya daha fazla testte kullanilacaksa `src/data/data.ts` icine tasinmalidir.
- Hassas bilgi, gercek sifre veya gercek kullanici datası commit edilmemelidir; sifreler sadece lokal `.env` icindedir.
- Ortama gore degisen degerler environment variable uzerinden alinmalidir.
- `data.ts` sadece statik/sabit test verisi icindir. Test sirasinda yakalanan runtime degerler (secilen dropdown vb.) buraya yazilmaz; `CustomWorld.store` (ScenarioStore, bkz. 12.1) ile yonetilir.

---

## 8. Action Yazim Kurallari

Action metotlari `src/actions/` altinda domain bazli dosyalarda tutulmalidir (`common.actions.ts`, `auth.actions.ts`, `navigation.actions.ts`, ...). Paylasilan primitive'ler (`click`/`fill`) ve generic motor `common.actions.ts`'tedir; yeni domain dosyasi bunlari oradan import eder. (Bkz. 5.1 Guncel durum.)

Action, tekil ve reusable kullanici islemini temsil eder.

Ornek:

```ts
// src/actions/auth.actions.ts
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
- Reusable action wrapper yazilirken Playwright cagrisi (click, fill vb.) try-catch icine alinmalidir; hata durumunda `reportError` ile Action adi ve Locator Name console ve Cucumber raporuna yazilmali, hata yeniden fırlatilmalidir (`throw error`).
- Sifre, token, gizli cevap gibi hassas degerler rapora acik yazilmamalidir; maskelenmelidir.
- Raporlama/loglama bu projede her reusable wrapper'in VARSAYILAN davranisidir. Bu yuzden fonksiyon ismine `WithReport`, `WithLog`, `Reported` gibi son ek EKLENMEZ. Isim fonksiyonun ne yaptigini soyler, raporladigini degil: `click`, `fill`, `selectOption` (`clickWithReport`, `fillWithReport` degil). Ayni mantik assertion wrapper'lari icin de gecerlidir: `expectVisible`, `expectCount` (`expectVisibleWithReport` degil).

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

Assertion metotlari `src/assertions/` altinda domain bazli dosyalarda tutulmalidir (`common.assertions.ts`, `auth.assertions.ts`, ...). Paylasilan primitive'ler (`expectVisible`/`expectCount` ...) `common.assertions.ts`'tedir; yeni domain dosyasi bunlari oradan import eder. (Bkz. 5.1 Guncel durum.)

Assertion, reusable dogrulama metodunu temsil eder.

Ornek:

```ts
// src/assertions/auth.assertions.ts
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
- Reusable assertion wrapper yazilirken `expect(...)` cagrisi try-catch icine alinmalidir; hata durumunda `reportError` ile Assertion adi ve Locator Name console ve Cucumber raporuna yazilmali, hata yeniden fırlatilmalidir (`throw error`).
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

## 9.1 Liste / Dropdown Secenek Dogrulama Standardi

Bir dropdown / listbox icinde "su secenekler listelenmis mi" dogrulamasi icin sayfa-ozel assertion ve sayfa-ozel step YAZILMAZ. Bu, navigation step (`{string} menü yolundan sayfaya gidilir`) ve save/use step (12.1) ile ayni felsefededir: mekanizma ortak, beklenen veri parametre olarak gelir.

Hedef: her yeni dropdown icin yeni `expectXOptionsVisible` + yeni step + yeni sabit uretmek yerine tek generic step ve tek generic assertion kullanmak.

Beklenen secenekler nerede durur:

- Beklenen secenek listesi feature dosyasinda **Data Table** olarak verilir. Bu bir **beklenen sonuc** (Expected Result) oldugu icin feature'da business-okunur durmasi dogrudur; girdi datasi degildir, bu yuzden 7. bolumdeki "feature'a data gomme" yasagina girmez.
- Secenek listesi koda (locators `TEXTS`, ayri sabit vb.) gomulmez. Boylece feature metni ile dogrulanan deger ayni kaynaktir; drift olmaz.

Kullanilacak generic yapi:

```text
Step       -> features/step-definitions/common.steps.ts
              "{string} listesinde aşağıdaki seçenekler listelenir" + Data Table
Assertion  -> src/assertions/common.assertions.ts -> expectListboxOptionsVisible(page, listName, expectedTexts)
Locator    -> src/locators/locators.ts -> common.optionInListbox(listboxId, name)
```

Feature kullanimi:

```gherkin
* Tür dropdown'ı açılır
* "Tür" listesinde aşağıdaki seçenekler listelenir
  | MERKEZ |
  | BAŞMÜDÜRLÜK |
  | GENEL MÜDÜRLÜK |
```

Kurallar:

- Once ilgili dropdown'i acan step cagrilir; ardindan generic dogrulama step'i kullanilir.
- `"{string}"` listenin adidir (Tür, Tür 2, ...) ve listeyi DARALTMAK icin kullanilir. Assertion acik listbox'lar arasindan adi listName olani secer: MUI'de acik listbox'in `aria-labelledby`'i ilgili alanin label'ina isaret eder (orn. Tür listesi -> "Tür" label'i; gercek sayfada dogrulandi). Secenekler SADECE o listbox icinde aranir. Boylece "Tür" dendiginde fiziksel olarak Tür listesine bakilir; ekranda baska bir liste acik kalsa bile dogru olan ada gore secilir, yanlis listeden eslesme olmaz. Label metni "Tür *" gibi zorunlu yildizi icerebilir; normalize edilip (yildiz cikarilip trim) tam esleslenir, boylece "Tür" istenince "Tür 2" secilmez.
- Bu generic step "verilen secenekler gorunur" dogrulamasi yapar (count/"tam olarak bunlar" degil). "Tam N adet ve format" gibi daha guclu dogrulama gerekiyorsa (orn. İşlem Kodu kod+aciklama formati) ayri, amaca ozel assertion yazilir; generic step bununla degistirilmez.
- Yeni dropdown geldiginde kod yazilmaz; sadece feature'a yeni Data Table eklenir.
- Reuse araması (`rg` / `INVENTORY.md`) bu step ve assertion'i once bulmali; ayni isi yapan ikinci bir varyant uretilmemelidir.

---

## 10. Flow Yazim Kurallari

Flow dosyalari `src/flows` altinda tutulmalidir.

Flow, birden fazla action ve assertion iceren business akisidir. Flow dosyalari domain bazli kalabilir; cunku test okunabilirligini artirir ve tek locator/action/assertion dosyasi ile cakismaz.

Ornek:

```ts
// src/flows/auth.flow.ts
import { Page } from '@playwright/test';
import {
  clickLoginButton,
  fillLoginPassword,
  fillLoginUsername,
} from '../actions/auth.actions';
import { expectLoginPageVisible, expectLoginSuccess } from '../assertions/auth.assertions';
import { env } from '../config/env';
import { TestUser } from '../data/data';

export async function openLoginPage(page: Page) {
  await page.goto(env.baseUrl);

  await expectLoginPageVisible(page);
}

export async function submitLogin(page: Page, user: TestUser) {
  await fillLoginUsername(page, user.username);
  await fillLoginPassword(page, user.password);
  await clickLoginButton(page);
}

export async function verifyLoginSuccess(page: Page) {
  await expectLoginSuccess(page);
}

export async function login(page: Page, user: TestUser) {
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
Scenario: TC_001 - Kullanıcı geçerli bilgilerle login olur
  * Login ekranı açılır
  * "USER1" kullanıcısı bilgileri ile giriş yapılır
  * Kullanıcının login oldugu dogrulanır
```

```ts
import { Given, Then, When } from '@cucumber/cucumber';
import { getUser } from '../../src/data/data';
import { submitLogin } from '../../src/flows/auth.flow';
import { CustomWorld, getPage } from '../support/world';

When('{string} kullanıcısı bilgileri ile giriş yapılır', async function (this: CustomWorld, userKey: string) {
  await submitLogin(getPage(this), getUser(userKey));
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
import { ScenarioStore } from './scenario-store';

export class CustomWorld extends World {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;

  // Senaryo boyunca isimle saklanan runtime degerler (bkz. 12.1)
  readonly store = new ScenarioStore();
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
- `getPage(world)` yardimci fonksiyonu `features/support/world.ts` icinde tanimli ve export edilmistir. Step definition dosyalari bu fonksiyonu `../support/world`'dan import etmelidir; her dosyada ayri tanimlanmamalidir.
- Cucumber World gereksiz data deposuna donusturulmemelidir.
- Test data icin yine `src/data/data.ts` kullanilmalidir.
- Statik test datasi World'e konmaz; ancak test sirasinda yakalanan runtime degerler (orn. secilen dropdown) `CustomWorld.store` (ScenarioStore) ile isimle saklanir. Bkz. 12.1.
- Browser secimi script, world parameter veya environment variable ile yonetilebilir.

---

## 12.1 Runtime Dinamik Deger Saklama (ScenarioStore)

Test sirasinda ekranda olusan veya secilen dinamik bir degeri (orn. dropdown'dan secilen secenek, uretilen kayit ID'si, ekrandaki bir metin) bir sonraki adimda kullanmak gerekebilir. Bu degerler **test datasi degildir** — statik veri `src/data/data.ts`'tedir; bunlar senaryo-anlik runtime state'tir ve `features/support/scenario-store.ts` icindeki `ScenarioStore` ile yonetilir.

`ScenarioStore`, `CustomWorld.store` olarak compose edilmistir. Cucumber her senaryo icin yeni bir World urettiginden her senaryo kendi bos store'u ile baslar; bir senaryoda saklanan deger digerine sizmaz (izolasyon otomatik).

API (step'lerde bunlari kullan — rapora/console'a SAVE/USE satiri dusurur):

```ts
this.saveValue(name, value);      // isimle sakla + rapora "SAVE 'name' = value"
this.getValue<T = string>(name);  // isimle oku  + rapora "USE 'name' = value" (yoksa hata)
this.store.has(name);             // saklanmis mi? (raporsuz boolean kontrol)
```

`saveValue`/`getValue` saf `ScenarioStore`'u (`this.store.save/get`) cagirir, ustune `reportValue` ile olayi rapora yazar. Raporsuz dogrudan erisim gerekirse `this.store.*` hala mevcuttur ama step'lerde `saveValue`/`getValue` tercih edilir.

Deger tipi `unknown` tutulur (string disi degerler de saklanabilsin diye); okurken beklenen tip `getValue<T>()` ile verilir, varsayilan `string`.

Hazir generic motor (store'dan bagimsiz; deger alir/dondurur, store islemi step'te yapilir):

```text
src/actions/common.actions.ts
  readElementText(locator, report)               -> elementin text'ini okur ve dondurur
  readElementAttribute(locator, report, attr)    -> elementin attribute degerini okur ve dondurur
  fillElement(locator, report, value)            -> verilen degeri input'a yazar
  clickByText(page, value, { exact })            -> metni degere ESIT/ICEREN ilk elemana tiklar

src/assertions/common.assertions.ts
  expectTextPresent(page, value, { exact })      -> metni degere ESIT/ICEREN eleman var mi dogrular (baska sayfada da)
```

`exact: true` (varsayilan) "esit", `exact: false` "iceren" demektir. Bu fonksiyonlar hazirdir; eksik olan sadece bunlari `this.saveValue`/`this.getValue` ile baglayan sayfa-bazli step'lerdir (asagidaki desen).

Kullanim deseni:

```text
1. actions.ts'e secip SECILEN DEGERI DONDUREN reusable action yaz.
   - page-only imza (`page: Page`), store'u bilmez, sadece degeri return eder.
   - reportAction'li, locator Bolum 6 kurali ile MCP'de dogrulanmis.
2. Step, action'in donen degerini `this.saveValue(name, ...)` ile saklar (rapora SAVE duser).
   - `name` step'e `{string}` parametresi olarak gelir.
3. Sonraki step `this.getValue(name)` ile okuyup (rapora USE duser) ilgili action'a verir.
```

Kurallar:

- Saklama/okuma icin GENERIC step yazilir; sayfa-bazli "X kaydet" step'i acilmaz (navigation step mantigi gibi). Dropdown locatorı sayfaya ozeldir, saklama mekanizmasi ortaktir.
- `ScenarioStore` saf tutulur; reporting bagimliligi icermez. SAVE/USE raporlamasi World'un `saveValue`/`getValue` sarmalayicilarinda (`reportValue`) yapilir.
- Statik veya sabit deger store'a konmaz; o `src/data/data.ts`'e gider.
- Henuz olmayan save/use step'leri "varmis gibi" yazilmaz; ilk gercek dropdown'li test geldiginde yukaridaki desen ile eklenir.

Ornek (gelecekteki kullanim):

```gherkin
* Para birimi dropdown'ından rastgele bir seçenek seçilir ve "option-1" olarak kaydedilir
* "option-1" olarak kaydedilen değer ile kayıt aranır
```

---

## 12. Cucumber Login Session Kurallari

Eger testlerin buyuk bolumu login gerektiriyorsa her testte tekrar login yapmak yerine storage state kullanilmalidir.

Ornek hook:

```ts
// features/support/hooks.ts
import { Before } from '@cucumber/cucumber';
import { chromium } from '@playwright/test';
import { getUser } from '../../src/data/data';
import {
  clickLoginButton,
  fillLoginPassword,
  fillLoginUsername,
} from '../../src/actions/auth.actions';
import { expectLoginSuccess } from '../../src/assertions/auth.assertions';
import { env } from '../../src/config/env';
import { CustomWorld } from './world';

Before({ tags: '@authState' }, async function (this: CustomWorld) {
  this.browser = await chromium.launch();
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();

  const user = getUser('USER1');

  await this.page.goto(env.baseUrl);
  await fillLoginUsername(this.page, user.username);
  await fillLoginPassword(this.page, user.password);
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
- `dotenv/config` import'u sadece `features/support/hooks.ts` ve `src/config/env.ts` icinde bulunmalidir. `src/data/data.ts` gibi diger dosyalar dotenv import etmemelidir; env yuklemesi entry point tarafindan zaten yapilmis olur.

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
6. Flow yoksa src/data/data.ts, src/actions/ (domain dosyalari), src/assertions/ (domain dosyalari) ve src/locators/locators.ts yapisini kontrol et.
7. Sidebar navigasyon ihtiyaci varsa `features/step-definitions/navigation.steps.ts` icindeki genel step'i kullan: `"UstMenu > AltMenu > SayfaAdi" menü yolundan sayfaya gidilir`. Ayri navigasyon step yazma.
7b. Diger ortak UI ihtiyaci varsa once `common` veya `navigation` gruplarini kullan.
7c. Bir degeri kaydedip baska adimda kullanacaksan (12.1) hazir generic fonksiyonlari kullan (`readElementText`/`readElementAttribute`/`fillElement`/`clickByText`/`expectTextPresent`); degeri `this.saveValue`/`this.getValue` ile sakla/oku (rapora SAVE/USE duser), `data.ts`'e veya feature'a hard-code etme.
7d. Bir dropdown/listbox secenek listesini dogrulayacaksan (9.1) generic step'i kullan: `"{Liste Adi}" listesinde aşağıdaki seçenekler listelenir` + Data Table. Sayfa-ozel `expectXOptionsVisible` veya sayfa-ozel step yazma; beklenen listeyi koda gomme.
8. Eksik reusable parca varsa dogru yere kucuk ve temiz ekleme yap: actions/assertions icin ilgili domain dosyasina (yoksa yeni domain dosyasi ac, paylasilan primitive'leri common'dan import et); data/locators icin tek dosyaya.
9. Tek dosya kalan bir katman (data/locators) buyume esigini asiyorsa, sadece o katmani domain bazli dosyalara ayir (POM'a donme).
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
- Sidebar navigasyon icin sayfa bazli ozel step yazma; genel `{string} menü yolundan sayfaya gidilir` step'ini kullan.
- Dropdown/listbox secenek dogrulamasi icin sayfa-ozel `expectXOptionsVisible` veya sayfa-ozel step yazma; generic `{string} listesinde aşağıdaki seçenekler listelenir` step'i + Data Table kullan (9.1). Beklenen listeyi koda gomme.
- waitForTimeout kullanma.
- Hayali data, hayali locator veya hayali assertion yazma.
- TODO, placeholder step, bos assertion veya gecici locator birakma.
- Ayni fonksiyonu farkli dosyalarda tekrar tekrar uretme.
- Test sirasinda yakalanan runtime degeri (secilen dropdown, okunan text/attribute) `data.ts`'e veya feature'a hard-code etme; `CustomWorld.store` (ScenarioStore, 12.1) ile sakla.
```

---

## 19. Ortak Prompt Kullanim Standardi

Bu projede yeni test uretirken tek standart prompt dosyasi kullanilmalidir:

```text
docs/prompt-template.md
```

Kullanim:

```text
docs/prompt-template.md dosyasindaki promptu uygula.
```

Kurallar:

- `docs/prompt-template.md` icindeki `DOLDUR` alani ilgili test turu icin doldurulmalidir.
- Bos alan birakilmamalidir; bilinmeyen alanlara `yok` yazilmalidir.
- Senaryo kararindan emin olunmuyorsa `Senaryo islemi` alanina `repo yapisindan karar ver` yazilmalidir.
- Prompt icinde bu dokumandaki kurallar tekrar cogaltilmamalidir; ana kural kaynagi her zaman `AGENTS.md`, reuse sozlugu ise `INVENTORY.md` dosyasidir.
- Eski uzun prompt kopyalari kullanilmamalidir. Prompt standardi degisecekse `docs/prompt-template.md` guncellenmelidir.

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
- user: USER1   # .env icindeki USER1_USERNAME / USER1_PASSWORD blogu

Steps:
1. Login sayfasina git.
2. Kullanici adi alanina gecerli kullanici adi gir.
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
[ ] Yeni locator eklendiyse `LOCATOR_REPORTS` icine de rapor metadatasi eklendi mi?
[ ] `getPage` fonksiyonu her step definition dosyasinda ayri tanimlanmamis, `../support/world`'dan import edilmis mi?
[ ] Sidebar navigasyon icin sayfa bazli ozel step yazilmamis, `"{string} menü yolundan sayfaya gidilir"` step'i kullanilmis mi?
[ ] Dropdown/listbox secenek dogrulamasi icin sayfa-ozel assertion/step yazilmamis, generic `"{string} listesinde aşağıdaki seçenekler listelenir"` step'i + Data Table kullanilmis mi (9.1)?
[ ] Beklenen secenek listesi koda gomulmemis, feature Data Table'inda mi?
[ ] Ortak UI elemani `common`, ortak navigasyon elemani `navigation` grubunda mi?
[ ] Sayfaya ozel locator yanlislikla common gruba alinmamis mi?
[ ] Locator mevcut mimariye gore dogru locator dosyasinda mi?
[ ] Data mevcut mimariye gore dogru data dosyasinda mi?
[ ] (Varsa) Test sirasinda yakalanan dinamik deger `data.ts`'e/feature'a hard-code edilmemis, `ScenarioStore` (`this.store`, 12.1) ile mi yonetilmis?
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
- Tek data dosyasi: src/data/data.ts (esik asilmadi)
- Tek locator dosyasi: src/locators/locators.ts (esik asilmadi)
- Domain bazli action dosyalari: src/actions/common|auth|navigation|automaticParameters.actions.ts (esik asildi, bolundu)
- Domain bazli assertion dosyalari: src/assertions/common|auth|automaticParameters.assertions.ts (esik asildi, bolundu)
- Kalan tek dosyali katmanlar (data/locators) esigi asildiginda domain bazli dosyalara gecer
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
