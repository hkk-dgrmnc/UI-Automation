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


Bu projede klasik Page Object Model kullanilmayacaktir. Her sayfa icin ayri `Page.ts` class dosyasi olusturulmayacaktir. Guncel repoda `data` ve `locator` katmanlari buyume esigi asilmadigi icin tek dosyadir; `action` katmani `control`/`dropdown`/`form`/`table`/`uiAudit`, `assertion` katmani `control`/`dropdown`/`form`/`table` capability'lerine ve business domain dosyalarina ayrilmistir. `common` dosyalari yalniz gercek ortak primitive'leri ve dinamik deger motorunu tasir.

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
Action    -> src/actions/  (common primitive + capability + business domain)
Assertion -> src/assertions/  (common primitive + capability + business domain)
Flow      -> src/flows
Cucumber  -> features
Step Def  -> features/step-definitions
Support   -> features/support
Config    -> src/config (environment + merkezi timeout)
Quality   -> scripts, config, tests
Feature   -> features/cases/smoke veya features/cases/regression
```

Katmanlarin sorumluluklari:

```text
src/data/data.ts
  Tum test verilerini tek dosyada tutar.

src/locators/locators.ts
  Tum reusable element locator tanimlarini tek dosyada tutar.

src/actions/
  Paylasilan alt seviye primitive'leri ve dinamik deger motorunu common.actions.ts'te,
  ortak UI davranislarini capability dosyalarinda, business davranislarini domain
  dosyalarinda tutar.

src/assertions/
  Paylasilan expect primitive'lerini common.assertions.ts'te, ortak UI
  dogrulamalarini capability dosyalarinda, business expected result'larini domain
  dosyalarinda tutar.

src/flows
  Birden fazla action ve assertion iceren business akislarini tutar.

features/cases/smoke
  Kritik smoke Cucumber feature dosyalarini tutar.

features/cases/regression
  Regression Cucumber feature dosyalarini tutar.

features/step-definitions
  `*` ile yazilan Gherkin adimlarinin TypeScript `Given/When/Then` karsiliklarini tutar.

features/support
  Cucumber World, hook, login session ve Playwright browser/page lifecycle yapilarini tutar.

src/config
  Ortam ayarlarini ve merkezi timeout sozlesmesini tutar.

scripts, config, tests
  Kalite kapilarini, Allure kosu/metadata yonetimini ve saf unit testleri tutar.

```

---

## 3. Klasor Yapisi

```text
playwright-automation/
|
├── .github/workflows/cucumber.yml
├── .mcp.json
├── .nvmrc
├── .prettierrc.json
├── AGENTS.md
├── cucumber.js
├── eslint.config.js
├── package.json
├── tsconfig.json
├── config/
│   └── gherkin-policy-baseline.json
├── scripts/
│   ├── check-gherkin-policy.js
│   ├── run-allure-report.js
│   ├── run-cucumber-dry.js
│   └── lib/
│       ├── allure-metadata.js
│       └── gherkin-policy.js
├── tests/
│   └── unit/
│       └── *.test.js
|
├── features/
│   ├── cases/
│   │   ├── smoke/
│   │   │   └── TC_001_login.feature
│   │   └── regression/
│   │       ├── TC-001_adres_sablonu.feature
│   │       ├── YTKP-1009.feature
│   │       └── YTKP-deneme.feature
│   │
│   ├── step-definitions/
│   │   └── *.steps.ts
│   │
│   └── support/
│       ├── action-reporting.ts
│       ├── grouped-test-result-formatter.js
│       ├── hooks.ts
│       ├── scenario-store.ts
│       └── world.ts
|
└── src/
    ├── data/
    │   └── data.ts
    │
    ├── locators/
    │   └── locators.ts
    │
    ├── actions/                    # Common primitive + capability + domain
    │   ├── common.actions.ts       # Paylasilan primitive + dinamik deger motoru
    │   ├── control.actions.ts
    │   ├── dropdown.actions.ts
    │   ├── form.actions.ts
    │   ├── table.actions.ts
    │   ├── uiAudit.actions.ts
    │   ├── auth.actions.ts
    │   ├── navigation.actions.ts
    │   └── automaticParameters.actions.ts
    │
    ├── assertions/                 # Common primitive + capability + domain
    │   ├── common.assertions.ts    # Paylasilan expect* primitive + generic text
    │   ├── control.assertions.ts
    │   ├── dropdown.assertions.ts
    │   ├── form.assertions.ts
    │   ├── table.assertions.ts
    │   ├── addressTemplates.assertions.ts
    │   ├── auth.assertions.ts
    │   ├── automaticParameters.assertions.ts
    │   ├── identityTemplates.assertions.ts
    │   └── navigation.assertions.ts
    │
    ├── flows/
    │   └── auth.flow.ts
    │
    ├── config/
    │   ├── env.ts
    │   └── timeouts.ts
    │
    └── utils/
        ├── action-report.ts
        ├── best-effort.ts
        ├── console-format.ts
        ├── regex.ts
        └── table.ts
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
features/cases/smoke/TC_001_login.feature
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

Projenin ilk kurulumunda domain bazli data, action, assertion ve locator dosyalari olusturulmamistir. Bu, tarihsel baslangic modelidir; guncel `action`/`assertion` ayrimi icin Bolum 5.1 esas alinir.

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

- `actions` ve `assertions` katmanlari buyume esigini (200-300 satir) astigi icin domain ve capability bazli dosyalara BOLUNMUSTUR. Gecerli yapi:
  - `src/actions/`: `common.actions.ts` (paylasilan `click`/`fill` + dinamik deger motoru), capability dosyalari (`control`/`dropdown`/`form`/`table`/`uiAudit`), `auth.actions.ts`, `navigation.actions.ts`, `automaticParameters.actions.ts`
  - `src/assertions/`: `common.assertions.ts` (paylasilan `expectVisible`/`expectCount`/... primitive'leri + generic text), capability dosyalari (`control`/`dropdown`/`form`/`table`), `auth.assertions.ts`, `automaticParameters.assertions.ts`
- `src/data/data.ts` ve `src/locators/locators.ts` hala TEK dosyadir (esik asilmadi); buyuyunce ayni strateji ile bolunur.
- Yeni ortak UI action/assertion eklerken once mevcut capability dosyasini kullan: `control`, `dropdown`, `form`, `table` veya `uiAudit`. Business'e ozel davranis ilgili domain dosyasinda kalir. Yalniz en alt seviye ortak primitive veya dinamik deger motoru `common.actions` / `common.assertions` icine eklenir.
- Yeni capability veya domain dosyasi ancak gercek tekrar ya da buyume esigi varsa acilir. Tek bir `actions.ts` / `assertions.ts` dosyasina veya buyumus `common` dosyalarina GERI DONME.

---

## 5.2 Ortak Akil, Reuse ve Standardizasyon Kurallari

Bu projede farkli branch ve farkli PC'lerde calisan kisilerin ayni otomasyon dilini kullanmasi hedeflenir. Codex veya gelistirici yeni test uretirken once mevcut sozlugu ve reusable parcalari aramalidir.

Reuse aramasinin hizli yolu `INVENTORY.md` dosyasidir. Bu dosya otomatik uretilir (`npm run inventory`) ve mevcut tum step / locator / action / assertion / flow sozlugunu tek yerde listeler. Yeni test yazmadan once once bu dosya okunmali, ardindan gerekiyorsa `rg` ile derinlemesine arama yapilmalidir:

```powershell
rg "Oluştur|Kaydet|Sil|Ara|Temizle|Vazgeç|Onayla|Geri" src features
rg "step metni veya beklenen ekran basligi" features src
rg "locator adi veya UI metni" src/locators src/actions src/assertions src/flows features/step-definitions
```

Reuse kurallari mekanik kapilarla da korunur. `npm run check`; typecheck, ESLint, Prettier, unit test, Gherkin policy, Cucumber dry-run ve `inventory:check` kapilarini birlikte calistirir. Asagidaki reuse ihlallerinde de hata verir:

- Ayni selector (locator value) iki farkli locator isminde tanimliysa.
- `LOCATOR_REPORTS` icindeki `name`, kendi `grup.key` yolu ile uyusmuyorsa.
- Normalize edildiginde (kucuk harf, noktalama, bosluk) ayni metne dusen iki step tanimi varsa.
- `INVENTORY.md` guncel degilse (step/locator/action/assertion/flow ekleyip `npm run inventory` calistirilmamissa).

`npm run check` statik ve dry-run kalite kapisidir; canli browser senaryosunun yerine gecmez. Kapidan sonra ilgili scenario/feature gercek ortamda ayrica calistirilmalidir.

Yeni locator/step/action/assertion/flow ekledikten sonra `npm run inventory` calistirilip uretilen `INVENTORY.md` commit edilmelidir.

Reuse karari su sirayla verilmelidir:

```text
1. Ayni business step zaten varsa ayni step metni kullanilir.
2. Ayni locator zaten varsa mevcut locator kullanilir.
3. Ayni action/assertion/flow zaten varsa mevcut fonksiyon kullanilir.
4. Ayni is icin sayfadan bagimsiz dinamik/generic step yazilabiliyorsa sayfa-ozel step yazilmaz; generic step uretilir.
5. Ortak UI elemaniysa `common` veya `navigation` gruplarina eklenir.
6. Sadece ilgili sayfaya aitse ilgili domain/sayfa grubunda tutulur.
7. Gercekten yeni ihtiyacsa dogru katmana kucuk ve temiz ekleme yapilir.
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
- Once `features/step-definitions` ve `features/cases` icinde ayni anlamda step aranmalidir.
- Varsa mevcut step metni aynen kullanilmalidir.
- Yoksa once sayfadan bagimsiz, parametreli ve tekrar kullanilabilir dinamik step yazilabilir mi degerlendirilmelidir.
- Yeni step Turkce, kisa, business seviyesinde ve tekrar kullanilabilir yazilmalidir.
- `Oluştur butonuna tıklanır`, `Create butonuna basılır`, `Kullanıcı oluşturur` gibi ayni isi yapan farkli step'ler birlikte bulunmamalidir.
- Sayfaya ozel beklenen sonuc varsa step metni test case ID veya ekran anlami ile ayrismalidir.

Dinamik/generic step uretim kurallari:

- Codex'in varsayilan tercihi sayfaya ozel paket step yazmak degil, mevcut dinamik sozlugu kullanmaktir.
- Mevcut dinamik step yoksa, once bu ihtiyac her sayfada kullanilabilecek parametreli bir common/navigation step'i olabilir mi degerlendirilmelidir.
- Sayfaya ozel step sadece URL, secili menu, domain business sonucu, o sayfaya ozel algoritma veya gercekten sayfaya ozel davranis gerekiyorsa yazilir.
- Action ve assertion ayrilmalidir. Bir action step'i click/fill/select gibi islemi yapar; o islemden sonra beklenen ekran veya sonuc ayri assertion step'i ile dogrulanir.
- Generic action step icinde sayfaya ozel URL, baslik veya business assertion yazilmaz.
- Expected Result icindeki baslik, kolon, input, buton, dropdown secenekleri gibi tekrar kullanilabilir UI beklentileri mumkunse feature Data Table veya string parametresi ile verilir; koda sabit liste olarak gomulmez.
- Codex yeni step yazmadan once su soruyu sormalidir: "Bu step baska bir ekranda sadece parametreleri degistirilerek kullanilabilir mi?" Cevap evetse generic step yazilir.

Tercih edilen dinamik step ornekleri:

```gherkin
* Oluştur butonuna tıklanır
* "Adres Şablonları" başlığı görüldüğü doğrulanır
* Tabloda aşağıdaki kolon başlıkları listelenir
  | Kod  |
  | Ad   |
  | Ülke |
* Sayfada aşağıdaki input alanları görüntülenir
  | Kod  |
  | Ad   |
  | Ülke |
* "Kaydet" butonu görüldüğü doğrulanır
* "İşlem Kodu" dropdownından "[001] KAPAMA" seçilir
* "Tür" dropdown listesinde aşağıdaki seçenekler listelenir
  | MERKEZ |
  | GENEL MÜDÜRLÜK |
```

Kacinilacak sayfa-ozel paket step ornekleri:

```gherkin
* Adres Şablonu oluşturma ekranına geçiş yapılır
* Otomatik Parametre oluşturma ekranına geçiş yapılır
* İşlem Kodu olarak "[001] KAPAMA" seçilir
* Adres Şablonları kolonlarının görüntülendiği doğrulanır
* Adres Şablonu input alanlarının görüntülendiği doğrulanır
```

Dogru ayrim ornegi:

```gherkin
* Oluştur butonuna tıklanır
* Adres Şablonu oluşturma ekranının açıldığı doğrulanır
* "Address Şablonu" başlığı görüldüğü doğrulanır
* Sayfada aşağıdaki input alanları görüntülenir
  | Kod  |
  | Ad   |
  | Ülke |
```

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
- Playwright MCP browser kodu Node dosya sistemi veya `.env` okuyamayabilir; `require`, `process` veya `.env` okuma varsayilmaz. Hassas degerler MCP koduna veya prompt'a yazilmaz.
- Login/yetki gerektiren canli dogrulamalarda once `npm run env:check -- --user USER1` ile zorunlu env bloklari degerleri yazdirilmadan kontrol edilir. MCP oturumu login olamiyorsa ve dogrulama mevcut framework locator/action/assertion'lari ile yapilabiliyorsa `npm run live:check -- ...` fallback olarak kullanilir. Bu fallback yeni selector tahminini mesrulastirmaz; yeni selector yine gercek UI kaniti olmadan koda birakilmaz.
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

Action metotlari `src/actions/` altinda ortak primitive, capability ve business domain sorumluluklarina gore tutulmalidir. `common.actions.ts` paylasilan `click`/`fill` primitive'lerini ve dinamik deger motorunu; `control`/`dropdown`/`form`/`table`/`uiAudit` dosyalari ortak UI capability'lerini; `auth`/`navigation` gibi dosyalar business davranislarini tasir. (Bkz. 5.1 Guncel durum.)

Action, tekil ve reusable kullanici islemini temsil eder.

Ornek:

```ts
// src/actions/auth.actions.ts
import { Page } from '@playwright/test';
import { LOCATOR_REPORTS, locators } from '../locators/locators';
import { click, fill } from './common.actions';

export async function fillLoginUsername(page: Page, username: string) {
  const locator = locators(page);

  await fill(locator.auth.usernameInput, LOCATOR_REPORTS.auth.usernameInput, username);
}

export async function fillLoginPassword(page: Page, password: string) {
  const locator = locators(page);

  await fill(locator.auth.passwordInput, LOCATOR_REPORTS.auth.passwordInput, password, true);
}

export async function clickLoginButton(page: Page) {
  const locator = locators(page);

  await click(locator.auth.loginButton, LOCATOR_REPORTS.auth.loginButton);
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
- Bekleme yapan reusable action, varsayilan timeout'i `resolveUiTimeout` ile merkezi sozlesmeden alir. Ozel sure gerektiren capability/composite fonksiyonlari trailing `{ timeout }` kabul eder ve ayni override'i tum alt cagrilara iletir.

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

Assertion metotlari `src/assertions/` altinda ortak primitive, capability ve business domain sorumluluklarina gore tutulmalidir. `common.assertions.ts` web-first expect primitive'lerini ve generic text kontrolunu; `control`/`dropdown`/`form`/`table` dosyalari ortak UI capability'lerini; `auth` ve diger domain dosyalari business expected result'larini tasir. (Bkz. 5.1 Guncel durum.)

Assertion, reusable dogrulama metodunu temsil eder.

Guncel public akisin ozeti (`expectStableHealthyLoginLanding` private helper'inin tam implementation'i icin mevcut dosya referanstir):

```ts
// src/assertions/auth.assertions.ts
import { Page } from '@playwright/test';
import { LOCATOR_REPORTS, locators } from '../locators/locators';
import { expectNotVisible, expectUrl, expectVisible } from './common.assertions';

export async function expectAuthenticationSuccess(page: Page) {
  const locator = locators(page);

  await expectUrl(page, /shell-app-ui\/#\/journal-audits/);
  await expectNotVisible(locator.auth.usernameInput, LOCATOR_REPORTS.auth.usernameInput);
  await expectVisible(locator.auth.userProfileButton, LOCATOR_REPORTS.auth.userProfileButton);
}

export async function expectLoginSuccess(page: Page) {
  const locator = locators(page);

  await expectAuthenticationSuccess(page);
  await expectStableHealthyLoginLanding(page);
  await expectVisible(locator.auth.userProfileButton, LOCATOR_REPORTS.auth.userProfileButton);
}

export async function expectLoginPageVisible(page: Page) {
  const locator = locators(page);

  await expectVisible(locator.auth.usernameInput, LOCATOR_REPORTS.auth.usernameInput);
  await expectVisible(locator.auth.passwordInput, LOCATOR_REPORTS.auth.passwordInput);
  await expectVisible(locator.auth.loginButton, LOCATOR_REPORTS.auth.loginButton);
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
- Login success sadece URL/profil gorunurluguyle kanitlanmaz. `expectStableHealthyLoginLanding`, gercek UI'da dogrulanmis exact `HTTP Request Error` / `invalid_resource` fatal hata indikatorunu `TIMEOUTS.loginLandingStability` penceresi boyunca izler; indikator gorunurse test fail olur. Tek anlik `not.toBeVisible()` gecikmeli bozuk landing'i yakalamadigi icin login oracle olarak kullanilmaz.
- Regression/setup `login()` akisi, hedef ekrana ilerleyebilmek icin yalniz `expectAuthenticationSuccess` teknik on kosulunu kullanir. Acik login smoke senaryosu `verifyLoginSuccess()` -> `expectLoginSuccess()` ile tam landing saglik oracle'ini calistirir; setup kontrolu smoke expected result yerine kullanilmaz.
- Oracle eklenirken yapilan 2026-08-05 canli dogrulamasinda ortam bozuk landing gosterdigi icin saglikli ekrana ait yeni pozitif ready locator'i dogrulanamamistir. Gercek UI kaniti olmadan pozitif locator uydurulmaz; uygulama duzeldiginde dogrulanmis bir ready indikatoru bulunursa oracle bilincli olarak guclendirilebilir.

Iyi assertion ornekleri:

```ts
await expectUrl(page, /shell-app-ui\/#\/journal-audits/);
await expectVisible(locator.auth.userProfileButton, LOCATOR_REPORTS.auth.userProfileButton);
await expectNotVisible(locator.auth.usernameInput, LOCATOR_REPORTS.auth.usernameInput);
```

Kacinilacak ornek:

```ts
expect(await locator.auth.userProfileButton.isVisible()).toBe(true);
```

---

## 9.1 Liste / Dropdown Secenek Dogrulama Standardi

Dropdown acma islemi icin sayfa-ozel step yazilmaz. Alan adi parametre olarak
verilen ortak step kullanilir:

```gherkin
* "İşlem Kodu" dropdown'ı açılır
* "Tür" dropdown'ı açılır
* "Tür 2" dropdown'ı açılır
* "KDV Oranı" dropdown'ı açılır
```

Step       -> `features/step-definitions/common.steps.ts`
Action     -> `src/actions/dropdown.actions.ts -> openDropdown(page, dropdownName)`
Locator    -> `src/locators/locators.ts -> common.dropdownCombobox(dropdownName)`

Bir dropdown / listbox icinde "su secenekler listelenmis mi" dogrulamasi icin sayfa-ozel assertion ve sayfa-ozel step YAZILMAZ. Bu, navigation step (`{string} menü yolundan sayfaya gidilir`) ve save/use step (12.1) ile ayni felsefededir: mekanizma ortak, beklenen veri parametre olarak gelir.

Hedef: her yeni dropdown icin yeni `expectXOptionsVisible` + yeni step + yeni sabit uretmek yerine tek generic step ve tek generic assertion kullanmak.

Beklenen secenekler nerede durur:

- Beklenen secenek listesi feature dosyasinda **Data Table** olarak verilir. Bu bir **beklenen sonuc** (Expected Result) oldugu icin feature'da business-okunur durmasi dogrudur; girdi datasi degildir, bu yuzden 7. bolumdeki "feature'a data gomme" yasagina girmez.
- Secenek listesi koda (locators `TEXTS`, ayri sabit vb.) gomulmez. Boylece feature metni ile dogrulanan deger ayni kaynaktir; drift olmaz.

Kullanilacak generic yapi:

```text
Step       -> features/step-definitions/common.steps.ts
              "{string} dropdown listesinde aşağıdaki seçenekler listelenir" + Data Table
Assertion  -> src/assertions/dropdown.assertions.ts -> expectListboxOptionsVisible(page, listName, expectedTexts)
Locator    -> src/locators/locators.ts -> common.optionInListbox(listboxId, name)
```

Feature kullanimi:

```gherkin
* "Tür" dropdown'ı açılır
* "Tür" dropdown listesinde aşağıdaki seçenekler listelenir
  | MERKEZ |
  | BAŞMÜDÜRLÜK |
  | GENEL MÜDÜRLÜK |
```

Secili deger dogrulamasi da generic yapidir:

```text
Step       -> features/step-definitions/common.steps.ts
              "{string} dropdownında {string} değeri seçili olduğu doğrulanır"
Assertion  -> src/assertions/dropdown.assertions.ts -> expectDropdownFieldSelectedValue(...)
```

Kurallar:

- Once ilgili dropdown'i acan step cagrilir; ardindan generic dogrulama step'i kullanilir.
- Secili dropdown degeri gorunmez karakterler/bosluklar normalize edildikten sonra TAM ESITLIK ile dogrulanir; substring (`contains`) bir basari olcutu olarak kullanilmaz.
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
import {
  expectAuthenticationSuccess,
  expectLoginPageVisible,
  expectLoginSuccess,
} from '../assertions/auth.assertions';
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
  await expectAuthenticationSuccess(page);
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

Hook lifecycle deseni (browser secimi ve `Before` kurulumu icin tam referans mevcut `hooks.ts` dosyasidir):

```ts
// features/support/hooks.ts
import { After, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { TIMEOUTS } from '../../src/config/timeouts';
import { runBestEffort, SecondaryFailure } from '../../src/utils/best-effort';
import { CustomWorld } from './world';

setDefaultTimeout(TIMEOUTS.cucumberStep);

After(async function (this: CustomWorld, scenario) {
  const secondaryFailures: SecondaryFailure[] = [];
  const attempt = async (operation: string, callback: () => unknown | Promise<unknown>) => {
    const failure = await runBestEffort(operation, callback);
    if (failure) secondaryFailures.push(failure);
    return failure;
  };

  try {
    // Failed senaryoda screenshot ve attachment ayri best-effort adimlaridir.
  } finally {
    if (this.context) await attempt('Close context', () => this.context?.close());
    if (this.browser) await attempt('Close browser', () => this.browser?.close());
    this.page = undefined;
    this.context = undefined;
    this.browser = undefined;
  }

  if (scenario.result?.status === Status.PASSED && secondaryFailures.length > 0) {
    throw new AggregateError(secondaryFailures.map(({ error }) => error));
  }
});
```

`Before` hook, browser'i world parameter / `BROWSER` / varsayilan Chromium sirasi ile cozer ve page default/navigation timeout'larini `TIMEOUTS.uiOperation` olarak ayarlar. Yukaridaki kod lifecycle desenini gosterir; calisan browser secimi, screenshot ve attachment detaylari icin tek referans `features/support/hooks.ts` dosyasidir.

Kurallar:

- Playwright `browser`, `context` ve `page` lifecycle'i Cucumber hook'lari ile yonetilmelidir.
- `getPage(world)` yardimci fonksiyonu `features/support/world.ts` icinde tanimli ve export edilmistir. Step definition dosyalari bu fonksiyonu `../support/world`'dan import etmelidir; her dosyada ayri tanimlanmamalidir.
- Cucumber World gereksiz data deposuna donusturulmemelidir.
- Test data icin yine `src/data/data.ts` kullanilmalidir.
- Statik test datasi World'e konmaz; ancak test sirasinda yakalanan runtime degerler (orn. secilen dropdown) `CustomWorld.store` (ScenarioStore) ile isimle saklanir. Bkz. 12.1.
- Browser secimi world parameter, `BROWSER` environment variable veya varsayilan `chromium` ile yonetilir; metadata da ayni kaynaktan cozulur.
- Screenshot ve attachment hatalari cleanup'i engellemez; context ve browser birbirinden bagimsiz best-effort adimlariyla kapatilir.
- Senaryo zaten basarisizsa raporlama/cleanup gibi secondary failure asli step hatasini maskelemez. Senaryo basariliysa gercek teardown failure `AggregateError` ile testi basarisiz yapar.
- Action report attachment'i diagnostiktir; attachment hatasi callback/step'in asli sonucunun yerine gecmez.

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
- Dinamik dropdown secimi ve sonraki adimda kullanma ihtiyacinda step metni kaynak alan/listenin adini ve hedef kullanim baglamini parametre olarak tasimalidir. Boylece ayni mekanizma farkli dropdown, tablo, liste veya arama alanlarinda tekrar kullanilabilir.
- Yeni step uretirken tercih edilen kalip:
  ```gherkin
  * "{Dropdown Adi}" dropdown'ından rastgele bir seçenek seçilir ve "{degerAnahtari}" olarak kaydedilir
  * "{degerAnahtari}" olarak kaydedilen değer "{Hedef Tablo/Liste/Alan}" ile kayıt aranır
  ```
- Bu kalipta ilk `{string}` secimin yapildigi UI alanini, ikinci `{string}` ScenarioStore anahtarini, ucuncu `{string}` ise kaydedilen degerin kullanilacagi hedef baglami ifade eder. Action/store fonksiyonlari bu metinleri hard-code etmez; locator dogrulamasi ve hedef baglam eslemesi ilgili domain katmaninda yapilir.
- `ScenarioStore` saf tutulur; reporting bagimliligi icermez. SAVE/USE raporlamasi World'un `saveValue`/`getValue` sarmalayicilarinda (`reportValue`) yapilir.
- Statik veya sabit deger store'a konmaz; o `src/data/data.ts`'e gider.
- Henuz olmayan save/use step'leri "varmis gibi" yazilmaz; ilk gercek dropdown'li test geldiginde yukaridaki desen ile eklenir.

Ornek (gelecekteki kullanim):

```gherkin
* "Para birimi" dropdown'ından rastgele bir seçenek seçilir ve "option-1" olarak kaydedilir
* "option-1" olarak kaydedilen değer "Para tablosu" ile kayıt aranır
```

---

## 12.2 Cucumber Login Session Kurallari

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
import { expectAuthenticationSuccess } from '../../src/assertions/auth.assertions';
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

  await expectAuthenticationSuccess(this.page);

  await this.context.storageState({ path: '.auth/user.json' });
});
```

Kurallar:

- Login cok fazla testte gerekiyorsa `storageState` kullanilmalidir.
- Login testleri ayrica yazilmalidir.
- Regression on kosulu icin uretilen storage state, acik login smoke oracle'inin yerine gecmez; login smoke yine `expectLoginSuccess` ile landing sagligini kanitlar.
- Login olmayan senaryolar icin storage state kullanilmamalidir.
- Storage state ihtiyaci Cucumber hook'lari ile yonetilmelidir; Playwright Test on hazirlik dosyasi olusturulmayacaktir.
- `.auth/user.json` gibi session dosyalari git'e commit edilmemelidir.
- `.auth/` klasoru `.gitignore` icine eklenmelidir.

---

## 13. Config ve Environment Kurallari

Ortam bilgileri `src/config/env.ts` uzerinden yonetilmelidir.
Uygulama URL'i sadece `BASE_URL` environment variable uzerinden yonetilmelidir.
Timeout varsayilanlari `src/config/timeouts.ts` uzerinden tek kaynaktan yonetilmelidir.

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
- `TIMEOUTS.cucumberStep`, `TIMEOUTS.uiOperation` ve `TIMEOUTS.loginLandingStability` anahtarlarinin degerleri yalniz `src/config/timeouts.ts` icinde tutulur; sayisal degerler dokumanlara veya domain dosyalarina ikinci kaynak olarak kopyalanmaz.
- Runtime override `TimeoutOptions` ve `resolveUiTimeout` uzerinden pozitif/finite olarak dogrulanir; reusable capability/composite fonksiyonlari override'i alt cagrilara iletir.

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

Feature dosyalari test tipine gore `features/cases/smoke` veya `features/cases/regression` altinda olusturulmalidir.

Ornek:

```gherkin
# features/cases/smoke/TC_001_login.feature
@smoke @auth
Feature: Authentication login

  Scenario: TC_001 - Kullanici gecerli bilgilerle login olur
    * Login ekrani acilir
    * Kullanici bilgileri ile giris yapilir
    * Kullanicinin login oldugu dogrulanir
```

Kurallar:

- Her scenario adi, yetkili manuel kaynakta bulunan test case ID ile baslamalidir; ID tahmin edilmez veya uydurulmaz.
- Her scenario feature seviyesinden en az bir tag miras almali veya scenario seviyesinde tag tanimlamalidir.
- `features/cases/smoke` altindaki her scenario `@smoke`, `features/cases/regression` altindaki her scenario `@regression` tag'ini miras almali veya tanimlamalidir.
- Feature dosyasinda locator, selector veya teknik Playwright detayi olmamalidir.
- Feature dosyasi business senaryo gibi okunmalidir.
- Beklenen sonuclar business anlamli `*` adimlari ile ifade edilmelidir.
- Step implementation `features/step-definitions` altinda olmalidir.
- Step definition icinden action/assertion dogrudan karistirilmak yerine mumkunse `src/flows` fonksiyonlari cagrilmalidir.
- Test data mumkunse `src/data/data.ts` icinden gelmelidir.
- `npm run gherkin:check`; feature lokasyonu, en az bir scenario, authoritative scenario ID, tag/category tag ve yalniz `*` step keyword kurallarini mekanik olarak uygular.
- `config/gherkin-policy-baseline.json` yalniz yetkili ID'si henuz bulunamayan belgelenmis legacy senaryolar icindir. Yeni bir testin ihlalini gizlemek icin baseline genisletilmez; ID yoksa kodda test birakilmaz ve blokaj raporlanir. Legacy ihlal duzeldiginde stale baseline girdisi kaldirilir; stale girdi de kalite kapisini kirar.

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
- Cucumber step ve UI operation timeout'lari `TIMEOUTS` sabitinden alinmalidir; domain dosyalarina `5_000`, `10_000`, `45_000` gibi farkli sabitler dagitilmamalidir.
- Reusable action/assertion wrapper'lari varsayilan olarak merkezi UI timeout'ini kullanmali ve trailing `{ timeout }` override'ini alt cagrilara iletmelidir.
- `live:check -- --timeout-ms <ms>` override'i navigation, heading, table, form ve control kontrollerinin tamaminda uygulanmalidir.
- Navigation retry'lari timeout'i her denemede sifirlamamali; tek operation deadline butcesini paylasmalidir.

---

## 17.1 Allure ve Browser Metadata Kurallari

- `npm test` ve `npm run test:*` komutlari `scripts/run-allure-report.js` uzerinden calisir. Varsayilan sonuc modu `current run (clean)`'dir: eski `allure-results` silinir ve `allure-report` her kosuda yeniden uretilir.
- Sonuclar yalniz bilincli birlestirme icin acik `--append` ile korunur. `--append` ve `--clean` birlikte kullanilamaz. `npm run test:all`, Chromium kosusunu clean baslatir; basarili sonraki Firefox/WebKit komutlarini `--append` ile ekler.
- `historyId` kosuya ozel/rastgele bir ID ile degistirilmez. Reporter'in temel test kimligi ile gercek browser adindan kararli, browser-specific history uretilir; `testCaseId` korunur.
- Her yeni Allure result `Browser` parametresi tasir. Browser world parameters -> `BROWSER` -> `chromium` sirasi ile cozulur; Firefox/WebKit sonucu Chromium olarak hard-code edilmez. `environment.properties` birikmis result'lardaki gercek browser listesini sirali ve tekil yazar.
- Cucumber sonucu basarisiz olsa bile uretilen result varsa rapor olusturulmaya calisilir; process exit code asli Cucumber basarisizligini korur.
- Dogrudan `cucumber-js` cagirmak clean/append ve metadata post-processing wrapper'ini bypass edebilir. Raporlu kosular icin proje `npm` scriptleri tercih edilir.

---

## 17.2 Toolchain, MCP ve CI Hijyeni

- Proje paketi `private: true` kalir; olmayan bir entry point'e isaret eden `main` alani eklenmez.
- Node/npm sozlesmesinin kaynaklari `.nvmrc`, `package.json#engines` ve `packageManager` alanlaridir. Guncel pin Node `24.15.0` / npm `11.12.1`'dir; local ve CI ayni kaynaklari kullanir.
- Dependency kurulumu lockfile ile `npm ci` kullanir. Dependency degisikliginde `package-lock.json` birlikte guncellenir ve `npm audit` sonucu kontrol edilir.
- Playwright MCP, exact devDependency ve lockfile'daki `@playwright/mcp` surumunden calisir. `.mcp.json`, local `node_modules/@playwright/mcp/cli.js` yolunu cagirir; runtime'da `npx` ile lockfile disi indirme yapilmaz.
- CI `.nvmrc` ve `packageManager` pinlerini kullanir; `npm ci` -> `npm run check` -> gerekli browser kurulumu -> UI suite sirasini izler.
- Mevcut CI yalniz Chromium suite'ini calistirdigi icin yalniz `playwright:install:chromium` kurar. Firefox/WebKit ancak gercek bir CI job/matrix kosusu eklendiginde kurulmalidir.
- `BASE_URL`, kullanici credential'lari, ortam/network/VPN ve sertifika erisimi CI dis konfigurasidir; kalite kapisinin yesil olmasi canli UI erisiminin hazir oldugunu kanitlamaz.

---

## 18. Codex Test Uretim Kurallari

Codex yeni test uretirken asagidaki sirayi izlemelidir:

```text
1. Manuel test case'i oku.
2. Test case ID, title, steps ve expected result alanlarini analiz et.
3. Once `INVENTORY.md`, sonra gerekirse `rg` ile mevcut step/locator/action/assertion/flow reuse'u ara.
4. Mevcut dinamik/generic step varsa once onu kullan; yoksa sayfaya ozel step yazmadan once her yerde kullanilabilecek parametreli generic step tasarla.
5. Action ve assertion'i ayir: click/fill/select step'i sadece aksiyonu yapsin, sonuc dogrulamasi ayri assertion step'i olsun.
6. Ilgili mevcut flow var mi kontrol et.
7. Ilgili flow varsa onu kullan.
8. Flow yoksa src/data/data.ts, src/actions/ (common/capability/domain), src/assertions/ (common/capability/domain) ve src/locators/locators.ts yapisini kontrol et.
8b. Login regression on kosulunda mevcut `login()` akisini kullan; acik login smoke expected result'inda `verifyLoginSuccess()` ile gecikmeli fatal landing oracle'ini mutlaka calistir. URL/profil kontrolunu tek basina smoke basarisi sayma.
9. Sidebar navigasyon ihtiyaci varsa `features/step-definitions/navigation.steps.ts` icindeki genel step'i kullan: `"UstMenu > AltMenu > SayfaAdi" menü yolundan sayfaya gidilir`. Ayri navigasyon step yazma.
9b. Diger ortak UI ihtiyaci varsa once `common` veya `navigation` gruplarini kullan. Ornek: `Oluştur butonuna tıklanır`, `"{string} başlığı görüldüğü doğrulanır"`, `Tabloda aşağıdaki kolon başlıkları listelenir`, `Sayfada aşağıdaki input alanları görüntülenir`.
9c. Bir degeri kaydedip baska adimda kullanacaksan (12.1) hazir generic fonksiyonlari kullan (`readElementText`/`readElementAttribute`/`fillElement`/`clickByText`/`expectTextPresent`); degeri `this.saveValue`/`this.getValue` ile sakla/oku (rapora SAVE/USE duser), `data.ts`'e veya feature'a hard-code etme. Dinamik dropdown secimi + arama gibi akislar icin kaynak alan ve hedef baglam parametreli kalibi tercih et: `"{Dropdown Adi}" dropdown'ından rastgele bir seçenek seçilir ve "{degerAnahtari}" olarak kaydedilir` -> `"{degerAnahtari}" olarak kaydedilen değer "{Hedef Tablo/Liste/Alan}" ile kayıt aranır`.
9d. Dropdown'dan belirli bir secenek sececeksen generic step'i kullan: `"{Dropdown Adi}" dropdownından "{Secenek}" seçilir`. Secili deger dogrulamasinda normalize edilmis tam esitlik kullan; substring basarisini kabul etme. Sayfa-ozel `İşlem Kodu olarak {string} seçilir` gibi step yazma.
9e. Bir dropdown/listbox secenek listesini dogrulayacaksan (9.1) generic step'i kullan: `"{Dropdown Adi}" dropdown listesinde aşağıdaki seçenekler listelenir` + Data Table. Sayfa-ozel `expectXOptionsVisible` veya sayfa-ozel step yazma; beklenen listeyi koda gomme.
10. Eksik reusable parca varsa dogru yere kucuk ve temiz ekleme yap: ortak UI davranisini mevcut capability dosyasina, business davranisini ilgili domain dosyasina, yalniz alt seviye primitive/dinamik motoru common'a; data/locators icin tek dosyaya.
11. Tek dosya kalan bir katman (data/locators) buyume esigini asiyorsa, sadece o katmani domain bazli dosyalara ayir (POM'a donme).
12. Feature dosyasini test tipine gore `features/cases/smoke` veya `features/cases/regression` altinda business seviyesinde olustur.
13. Scenario adinda authoritative manuel ID ve klasorle uyumlu category tag kullan; ID yoksa uydurma veya yeni baseline girdisiyle gizleme.
14. Eksik Gherkin step karsiliklarini `features/step-definitions` icinde olustur; step definition icinden mumkunse `src/flows` fonksiyonlarini cagir.
15. Yeni step/locator/action/assertion/flow eklendiyse `npm run inventory` calistir.
16. `npm run check` ile tum statik/dry kalite kapisini calistir.
17. Ilgili scenario/feature'i gercek browser ve ortamda calistir; check sonucunu canli test yerine sayma.
18. Hata varsa minimum degisiklikle duzelt; hayali locator, dogrulanmamis assertion veya TODO birakma.
19. Zorunlu bir parca dogrulanamiyorsa o promptta yaptigin test degisikliklerini geri al ve engeli raporla.
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
- Mevcut dinamik/generic step varken sayfaya ozel paket step uretme.
- Bir action step'ine sayfaya ozel assertion gomerek onu sadece tek ekrana baglama.
- Ortak UI elemanini sayfa sayfa yeniden tanimlama.
- Ortak capability davranisini business domain dosyalarina kopyalama veya buyumus `common` dosyalarina geri toplama.
- Sidebar navigasyon icin sayfa bazli ozel step yazma; genel `{string} menü yolundan sayfaya gidilir` step'ini kullan.
- Dropdown/listbox secenek dogrulamasi icin sayfa-ozel `expectXOptionsVisible` veya sayfa-ozel step yazma; generic `{string} dropdown listesinde aşağıdaki seçenekler listelenir` step'i + Data Table kullan (9.1). Beklenen listeyi koda gomme.
- Secili dropdown degerini substring/`contains` ile basarili sayma; normalize edilmis tam esitlik kullan.
- Login smoke testini yalniz URL/profil veya regression `login()` setup kontroluyle yesil gecirme; tam landing health oracle'ini calistir.
- Yeni testte eksik authoritative ID'yi uydurma veya keyfi baseline girdisi ekleyerek Gherkin ihlalini gizleme.
- Merkezi `TIMEOUTS` sozlesmesi disinda daginik timeout sabitleri veya her retry'da sifirlanan yeni deadline uretme.
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
- Kullanici sadece `docs/prompt-template.md dosyasindaki promptu uygula.` derse NORMAL MOD calisir: Codex bu dokumandaki standart akisi tek basina uygular.
- Kullanici herhangi bir talepte acikca `orchestration mode aktif` ifadesini kullanirsa ORCHESTRATION MOD calisir (bkz. 19.1). Bu tetikleyici prompt-template'e ozel degildir.
- Bos alan birakilmamalidir; bilinmeyen alanlara `yok` yazilmalidir.
- Senaryo kararindan emin olunmuyorsa `Senaryo islemi` alanina `repo yapisindan karar ver` yazilmalidir.
- Prompt icinde bu dokumandaki kurallar tekrar cogaltilmamalidir; ana kural kaynagi her zaman `AGENTS.md`, reuse sozlugu ise `INVENTORY.md` dosyasidir.
- Eski uzun prompt kopyalari kullanilmamalidir. Prompt standardi degisecekse `docs/prompt-template.md` guncellenmelidir.

---

## 19.1 Orchestration Mode

Orchestration mode sadece kullanici acikca `orchestration mode aktif` derse
calisir. Bu tetikleyici herhangi bir manuel task promptunda da gecerlidir;
prompt-template kullanimi sart degildir.
Normal `docs/prompt-template.md dosyasindaki promptu uygula.` komutu bu modu
tetiklemez; normal tek-Codex akisi korunur.

Ornek orchestration mode tetikleyicileri:

```text
docs/prompt-template.md dosyasindaki promptu orchestration mode aktif sekilde uygula.
* "Adres Şablonları" başlığı görüldüğü doğrulanır adimini "Adres Şablonu" olarak degistir, orchestration mode aktif.
YTKP-1009 feature'ini review edip riskleri duzelt, orchestration mode aktif.
```

Amac:

```text
Codex  -> writer + Playwright MCP/browser driver
Claude -> read-only reviewer + itiraz eden mimar
```

Rol kurallari:

- Codex tek writer'dir. Kod, feature, step, locator, action, assertion, data, config veya dokuman degisikligini sadece Codex yapar.
- Playwright MCP/browser kontrolu sadece Codex tarafindadir. Claude browser session kullanmaz.
- Claude read-only reviewer'dir; dosya degistirmez, komutla kod yazmaz, sadece risk ve itiraz raporu uretir.
- Claude review en ust seviye akilla calisir: `opus` model, `xhigh` effort ve `UltraCode` workflow. Claude Code tarafinda ayri bir "thinking mode" bayragi kullanilmiyorsa `xhigh` effort bu istegin karsiligidir.
- Claude'dan ham gizli dusunce istenmez; sadece gozlem, kanit, varsayim, blocker/non-blocker itiraz ve oneriler istenir.
- Claude review, Codex'in AGENTS.md kurallarina gore verecegi karar yerine gecmez; nihai uygulama karari Codex'tedir.

Orchestration akisi:

```text
1. Codex once AGENTS.md, INVENTORY.md ve docs/prompt-template.md dosyalarini okur.
2. Claude review kullanilabilirligini `npm run claude:review:self-test` ile kontrol eder.
   Session limit, auth veya CLI hatasi varsa orchestration baslamadan blokaj raporlar.
3. Manuel test case'i analiz eder; mevcut step/locator/action/assertion/flow reuse arar.
4. Login gerekiyorsa `npm run env:check -- --user <Kullanici>` ile env preflight yapar.
5. Gerekli locator veya ekran davranisi varsa repoya pinlenmis local Playwright MCP ile gercek browser'da dogrular.
   MCP `.env` okuyamadigi veya login oturumu kuramadigi icin dogrulama yapilamiyorsa,
   mevcut framework locator/action/assertion'lariyla `npm run live:check -- ...` fallback'i
   kullanilabilir; bu da dogrulayamazsa Bolum 5.3'e gore blokaj raporlanir.
6. Kod yazmadan once kisa bir "Codex Evidence + Codex Plan" ozeti hazirlar.
7. Claude review icin `npm run claude:review -- --input <review-context-file>` komutunu kullanir
   veya ayni promptu stdin ile `node scripts/claude-review.js` aracina verir.
   Bu helper Claude'u `opus` + `xhigh` + `UltraCode` review akliyla cagirir.
8. Claude ciktisinda `BLOCKER` varsa Codex once ek kanit toplar, plani duzeltir veya Bolum 5.3'e gore blokaj raporlar.
9. Claude ciktisi sadece non-blocker/oneriler iceriyorsa Codex uygun olanlari uygular ve kodu yazar.
10. Yeni scenario authoritative ID/tag/category kurallarina gore kontrol edilir; bilinmeyen ID uydurulmaz veya yeni baseline girdisiyle gizlenmez.
11. Yeni step/locator/action/assertion/flow eklendiyse `npm run inventory` calistirilir.
12. Sonunda `npm run check` (PowerShell execution-policy engelinde `npm.cmd run check`) ve ilgili canli scenario/feature calistirilir.
13. Final cevapta Claude review sonucu, uygulanan karar, degisen dosyalar ve kontrol/test sonucu kisa raporlanir.
```

Claude review baglami su formatta verilmelidir:

```text
Task:
[kullanici talebi ve prompt-template DOLDUR alani]

Relevant AGENTS/INVENTORY summary:
[reuse ve uygulanacak kurallar]

Codex Evidence:
[browser gozlemleri, dogrulanan locatorlar, route, UI metni, varsayimlar]

Codex Plan:
[degisecek dosyalar, kullanilacak mevcut step/action/assertion/locator, yeni parca ihtiyaci]

Questions for Claude:
- AGENTS.md mimarisine aykiri bir nokta var mi?
- Duplicate step/locator/action/assertion riski var mi?
- Yeni yazilan step/action/assertion/locator gercekten gerekli mi, yoksa mevcut generic/dynamic yapi parametreyle kullanilabilir miydi?
- Sayfaya ozel yazilan bir step common/navigation generic step olarak tasarlanmali miydi?
- Assertion expected result'i gercekten karsiliyor mu?
- Locator ve browser kaniti yeterli mi?
- Flaky veya bakim riski var mi?
```

Claude review ciktisi su basliklarla istenmelidir:

```text
BLOCKER:
- yok veya net blocker maddeleri

NON-BLOCKER:
- iyilestirme / dikkat notlari

RECOMMENDATION:
- APPROVE / REVISE / BLOCK
```

Claude review self-test veya review komutu calismazsa (Claude kurulu degil, auth yok,
session limit dolu, CLI hata verir, timeout olur veya ciktisi okunamazsa)
orchestration mode basarili sayilmaz.
Bu durumda Codex kod yazmaya devam etmez; kullaniciya Claude review'un neden
alinamadigini soyler. Kullanici isterse ayni promptu normal modda tekrar
calistirabilir.

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
[ ] TC ID authoritative manuel kaynaktan mi; eksik ID uydurulmamis veya yeni baseline girdisiyle gizlenmemis mi?
[ ] Smoke/regression klasoru ile `@smoke`/`@regression` category tag'i uyumlu mu?
[ ] Feature dosyasi test tipine gore `features/cases/smoke` veya `features/cases/regression` altinda mi?
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
[ ] Dropdown/listbox secenek dogrulamasi icin sayfa-ozel assertion/step yazilmamis, generic `"{string} dropdown listesinde aşağıdaki seçenekler listelenir"` step'i + Data Table kullanilmis mi (9.1)?
[ ] Beklenen secenek listesi koda gomulmemis, feature Data Table'inda mi?
[ ] Secili dropdown degeri normalize edilmis tam esitlikle mi dogrulaniyor; substring basarisi dislanmis mi?
[ ] Ortak UI elemani `common`, ortak navigasyon elemani `navigation` grubunda mi?
[ ] Sayfaya ozel locator yanlislikla common gruba alinmamis mi?
[ ] Locator mevcut mimariye gore dogru locator dosyasinda mi?
[ ] Data mevcut mimariye gore dogru data dosyasinda mi?
[ ] (Varsa) Test sirasinda yakalanan dinamik deger `data.ts`'e/feature'a hard-code edilmemis, `ScenarioStore` (`this.store`, 12.1) ile mi yonetilmis?
[ ] Reusable action mevcut mimariye gore dogru action dosyasinda mi?
[ ] Yeni action yazmadan once mevcut action'lar `rg` ile aranmis mi?
[ ] Assertion mevcut mimariye gore dogru assertion dosyasinda mi?
[ ] Ortak UI davranisi dogru capability dosyasinda, business davranisi domain dosyasinda ve yalniz primitive/dinamik motor common'da mi?
[ ] Flow business anlamli mi?
[ ] Page Object class olusturulmamis mi?
[ ] Domain bazli data/action/assertion/locator dosyasi gereksiz olusturulmamis mi veya buyume esigi gerekcesi var mi?
[ ] Test bagimsiz calisabilir mi?
[ ] Assertion expected result ile uyumlu mu?
[ ] Login smoke varsa tam landing health oracle'i gecikmeli fatal indikatoru izliyor mu?
[ ] Timeout'lar merkezi `TIMEOUTS`/`resolveUiTimeout` sozlesmesinden geliyor ve override alt cagrilara iletiliyor mu?
[ ] Rapor/screenshot/attachment/cleanup hatasi asli step hatasini maskelemiyor mu?
[ ] Yeni step/locator/action/assertion/flow varsa `npm run inventory` calistirilmis mi?
[ ] `npm run check` temiz gecmis mi?
[ ] Ilgili scenario/feature canli browser'da calistirilmis mi?
[ ] Allure sonuc modu amaca uygun mu (varsayilan clean; bilincli birlestirmede `--append`) ve browser metadata/history kararliligi korunmus mu?
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
- Action katmani: `common` primitive/dinamik motoru + `control|dropdown|form|table|uiAudit` capability'leri + `auth|navigation|automaticParameters` business domain'leri
- Assertion katmani: `common` primitive/text motoru + `control|dropdown|form|table` capability'leri + `auth|navigation|addressTemplates|identityTemplates|automaticParameters` business domain'leri
- Kalan tek dosyali katmanlar (data/locators) esigi asildiginda domain bazli dosyalara gecer
- Feature dosyalari: features/cases/smoke ve features/cases/regression
- Step definitions: features/step-definitions
- Cucumber World/Hooks: features/support
- Config: `src/config/env.ts` + `src/config/timeouts.ts`
- Genis kalite kapisi: typecheck + ESLint + Prettier + unit + Gherkin policy + Cucumber dry-run + inventory
- Allure current-run clean varsayilani, acik append ve kararli browser-specific history
- Lockfile'a bagli local Playwright MCP ve pinli Node/npm toolchain
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
