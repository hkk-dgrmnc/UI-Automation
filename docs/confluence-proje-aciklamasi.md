# UI Automation Projesi

Bu sayfa, UI Automation projesinin genel tanıtımıdır ve hem teknik hem teknik olmayan okuyucular için hazırlanmıştır. Teknik kural kitabı [AGENTS.md](../AGENTS.md), geliştirici onboarding rehberi [README.md](../README.md), güncel reuse sözlüğü ise [INVENTORY.md](../INVENTORY.md) olarak repoda tutulur.

## Amaç

Proje, manuel test senaryolarını Cucumber + Playwright + TypeScript ile **okunabilir, tekrar kullanılabilir ve bakımı kolay** otomasyon testlerine dönüştürmek için kurulmuştur. Öne çıkan hedefler:

- Manuel test adımlarını iş dilinde okunan Gherkin senaryolarına çevirmek
- Testleri hızlı, stabil ve tekrar kullanılabilir hale getirmek
- Locator, action, assertion ve flow tekrarını kontrol altında tutmak
- Farklı ekip üyelerinin (ve yapay zekânın) aynı otomasyon diliyle test üretmesini sağlamak
- Çalışan her adımı ve doğrulamayı raporda izlenebilir kılmak
- Proje büyüdükçe yapının karmaşıklaşmadan sürdürülebilir kalmasını sağlamak

## Çözülen Problem

Test otomasyonu projelerinde sık görülen üç sorun ve bu projenin yaklaşımı:

| Sorun | Bu projedeki çözüm |
| --- | --- |
| **Dağınık dil:** Aynı işi yapan farklı adım/locator isimleri üretilir (`Oluştur'a tıkla` vs `Create'e bas`), bakım zorlaşır. | Ortak sözlük otomatik üretilir ve denetlenir; tekrar üretim mekanik olarak engellenir. |
| **Kırılgan kod:** Tahmini, doğrulanmamış locator'lar ekran değişince sessizce çöker. | Locator'lar gerçek uygulamada doğrulanır; doğrulanmayan locator koda yazılmaz. |
| **Bilgi tekeli:** Testleri yalnızca yazan kişi anlar; rapor okunmaz. | Her adım, hangi elemana ne yapıldığı ve ne beklendiğiyle birlikte raporlanır. |

## Mimari Yaklaşım

Bu projede **klasik Page Object Model kullanılmaz.** Her ekran için ayrı `Page` sınıfı açmak yerine; veri, locator, aksiyon, doğrulama ve iş akışı net katmanlara ayrılır. Akış tek yönlü ve okunabilirdir:

```text
Feature  (iş dili senaryo)
  └─ Step Definition  (Gherkin → TypeScript köprüsü)
       └─ Flow  (iş akışı)
            ├─ Action      (kullanıcı hareketi)  ─┐
            └─ Assertion   (doğrulama)            ─┴─ Locator / Data
```

| Katman | Konum | Sorumluluk |
| --- | --- | --- |
| Feature | `features/generated/` | Manuel test case'lerden üretilen, iş dilinde okunan senaryolar |
| Step Definition | `features/step-definitions/` | Gherkin adımlarını koda bağlar (locator/teknik detay içermez) |
| Flow | `src/flows/` | Birden çok aksiyon/doğrulamadan oluşan iş akışları |
| Action | `src/actions/` *(domain bazlı)* | Tekrar kullanılabilir kullanıcı hareketleri |
| Assertion | `src/assertions/` *(domain bazlı)* | Tekrar kullanılabilir doğrulamalar |
| Locator | `src/locators/locators.ts` | Tüm element tanımları ve rapor metadatası (tek kaynak) |
| Data | `src/data/data.ts` | Statik test verisi ve `.env`'den kullanıcı bilgisi okuma |
| Support | `features/support/` | Tarayıcı yaşam döngüsü, World, hook ve raporlama altyapısı |

### Neden Klasik POM Kullanılmıyor?

Başlangıç ihtiyacı hızlı test üretimi, sade dosya yapısı ve ortak otomasyon sözlüğüydü. Bu yüzden her ekran için `LoginPage`, `HomePage`, `BasketPage` gibi sınıf dosyaları açılmaz; locator/action/assertion'lar net katmanlarda toplanır.

Proje büyüdüğünde hedef yine POM'a dönmek değil, **ihtiyaç oluşan katmanı domain bazlı bölmektir.** Böylece hem hızlı başlamak hem de uzun vadede temiz kalmak birlikte sağlanır. Bu strateji sahada uygulanmıştır (bkz. *Sürdürülebilirlik*).

## Ortak Otomasyon Dili ve Reuse

Projenin temel ilkesi, aynı işi yapan farklı adım veya locator isimlerinin üretilmemesidir. Bu, iyi niyete değil **araçlara** dayanır:

- **`INVENTORY.md` (canlı sözlük):** Mevcut tüm adım, locator, aksiyon ve flow'lar tek dosyada otomatik listelenir. Yeni test yazılmadan önce buraya bakılarak "bu zaten var mı?" sorusu hızlıca yanıtlanır.
- **`npm run check` (kalite kapısı):** Aşağıdaki durumlarda hata verir ve test geçmez:

| Kontrol | Yakaladığı durum |
| --- | --- |
| Duplicate selector | Aynı element iki farklı isimle tanımlanmışsa |
| Duplicate adım | Normalize edildiğinde aynı metne düşen iki Gherkin adımı |
| İsim ↔ yol uyumu | Kopyala-yapıştır sonucu yanlış raporlanan locator |
| Envanter güncelliği | Locator/adım eklenip `INVENTORY.md` güncellenmemişse |
| Tip güvenliği | TypeScript derleme hatası |

Bu sayede farklı PC veya branch'lerde çalışan kişiler birbirinden kopuk otomasyon dili üretmez.

Tekrar eden ihtiyaçlar ayrıca **tek generic mekanizma** ile çözülür; her yeni ekran için sıfırdan kod yazılmaz:

- **Navigasyon:** Tüm sidebar menü geçişleri tek adımla → `"MFYS > Genel Parametre Ayarları > ... > Hedef Ekran" menü yolundan sayfaya gidilir`
- **Liste doğrulama:** Tüm dropdown seçenek kontrolleri tek adım + Data Table ile → `"Tür" listesinde aşağıdaki seçenekler listelenir`
- **Dinamik değer taşıma:** Ekranda oluşan değerlerin adımlar arası taşınması (ScenarioStore)

## Yapay Zekâ ile Üretim ve Bakım

Proje, testlerin yapay zekâ (Claude / Codex) tarafından üretilmesine ve bakımının yapılmasına uygun şekilde tasarlanmıştır. Bu, kontrolsüz "kod üretimi" değil, kurallı bir akıştır:

- **Gerçek ekran doğrulaması:** Locator'lar Playwright MCP ile canlı uygulama üzerinde doğrulanır; tahmini selector koda yazılmaz.
- **Tek doğruluk kaynağı:** Locator ve rapor metadatası tek yerden üretilir; biri değişip diğeri unutulursa derleme zamanında yakalanır.
- **Yarım iş bırakma yasağı:** Bir locator doğrulanamıyor veya beklenen sonuç belirsizse; TODO/placeholder bırakılmaz, yapılan değişiklik geri alınır ve engel net biçimde raporlanır.
- **Kolay bakım:** UI değiştiğinde, raporlardaki net locator bilgisi ve canlı ekran kullanılarak ilgili tek nokta güncellenir.

Yapay zekânın uyacağı tüm mimari ve davranış kuralları [AGENTS.md](../AGENTS.md) dosyasında tek kaynak olarak tanımlıdır.

## İzlenebilirlik ve Raporlama

Tekrar kullanılabilir her aksiyon ve doğrulama; ne yaptığını, hangi elemanı kullandığını ve ne beklediğini hem konsola hem Cucumber raporuna yazar. Örnek rapor satırları:

```text
ASSERT  To Be Enabled   automaticParameters.subTypeCombobox   → enabled (aktif)
ACTION  Fill            auth.passwordInput                    ▸ ••••••••
```

- Çıktılar: `cucumber-report.html` (görsel) ve `cucumber-report.json` (entegrasyon)
- Hata anında otomatik tam ekran görüntüsü rapora eklenir
- Şifre/token gibi hassas değerler raporda maskelenir
- Koşu sonunda renkli özet: geçen/kalan senaryo sayısı ve toplam süre

Bu yapı, raporu teknik olmayan okuyucular için de anlaşılır kılar.

## Kalite Güvencesi

| Mekanizma | Açıklama |
| --- | --- |
| CI kapısı | Her `push` ve `pull request`'te GitHub Actions; `npm run check` + tüm suite koşar, rapor artifact olarak saklanır. |
| Çoklu tarayıcı | Chromium, Firefox ve WebKit üzerinde çalıştırılabilir. |
| Stabilite | `waitForTimeout` (sabit bekleme) yasak; Playwright'ın otomatik bekleme ve web-first assertion mekanizması kullanılır. |
| Locator önceliği | `getByTestId > getByRole > getByLabel > getByPlaceholder > getByText > CSS > XPath` |
| Sır yönetimi | Kullanıcı bilgileri yalnızca lokal `.env`'dedir; gerçek kullanıcı/şifre koda veya feature'a yazılmaz, commit edilmez. |

## Sürdürülebilirlik

Tek dosya modeli bilinçli bir başlangıç tercihidir; kalıcı değildir. Bir katman büyüme eşiğini (≈200–300 satır) aştığında, POM'a dönmeden domain bazlı dosyalara bölünür.

Bu strateji sahada uygulanmıştır: `actions` ve `assertions` katmanları eşiği aştığında domain bazlı dosyalara (`common`, `auth`, `navigation`, `automaticParameters`) bölünmüştür. Paylaşılan parçalar tek yerde toplanmış, davranış birebir korunmuş ve bölme sonrası tüm kalite kapıları ile testler temiz geçmiştir. `data` ve `locators` katmanları eşiği aşmadığı için tek dosya olarak korunmaktadır.

## Mevcut Kapsam

| Senaryo | İçerik |
| --- | --- |
| Login (`TC_001`) | Geçerli kullanıcı ile giriş ve oturum doğrulaması |
| YTKP-1009 — Otomatik Parametre Tanımlama | Menüden ekrana erişim, oluşturma ekranına yönlendirme, İşlem Kodu liste formatı, İşlem Kodu seçimine göre alanların aktif/pasif olması, Fiş Açıklama uzunluk + Türkçe karakter + zorunluluk kontrolü, Tür / Tür 2 / KDV Oranı dropdown seçenek doğrulamaları |

## Teknoloji Yığını

| Alan | Teknoloji |
| --- | --- |
| Dil | TypeScript (strict) |
| Tarayıcı otomasyonu | Playwright |
| Test runner / senaryo dili | Cucumber + Gherkin |
| Yapay zekâ entegrasyonu | Playwright MCP (canlı ekran locator doğrulama) |
| Ortam yönetimi | dotenv (`.env`) |
| Raporlama | Cucumber HTML/JSON + özel konsol formatlayıcı |
| CI | GitHub Actions |

## Çalıştırma

```powershell
npm install                 # bağımlılıklar
Copy-Item .env.example .env # ortam dosyası (sonra .env doldurulur)

npm test                    # tüm senaryolar (varsayılan: chromium, headless)
npm run test:headed         # tarayıcı görünür
npm run test:debug          # yavaşlatılmış görünür koşu (inceleme için)
npm run test:all            # chromium + firefox + webkit

npm run check               # kalite kapısı: typecheck + envanter/duplicate denetimi
npm run inventory           # INVENTORY.md sözlüğünü yeniden üretir
```

## Yeni Test Ekleme Akışı

1. Manuel test case ve beklenen sonuç netleştirilir.
2. `INVENTORY.md` içinde mevcut adım/locator/action/flow reuse'u aranır; gerekirse `rg` ile derin arama yapılır.
3. Locator gerçek uygulamada doğrulanır.
4. Feature dosyası `features/generated` altına eklenir/güncellenir.
5. Step definition içinde teknik detay yazılmaz; mümkün olduğunca flow çağrılır.
6. Gerekli action/assertion/locator/data, ilgili domain dosyasına eklenir; yeni locator eklendiyse `LOCATOR_REPORTS` metadatası da güncellenir.
7. `npm run inventory` ve `npm run check` çalıştırılır.

Belirsiz locator, yetki, veri veya beklenen sonuç varsa koda TODO/placeholder bırakılmaz; ekleme geri alınır ve engel raporlanır.

## Özet

Bu proje, manuel testleri sürdürülebilir UI otomasyonuna dönüştürmek için ortak bir dil ve kontrollü bir mimari sağlar. Cucumber senaryoları iş akışını okunur tutar, Playwright uygulama etkileşimlerini yürütür, TypeScript katmanları reuse'u yönetir, `inventory`/`check` mekanizması ve CI ise ekip genelinde standardı korur. Detaylı kurallar için [AGENTS.md](../AGENTS.md) referans alınmalıdır.
