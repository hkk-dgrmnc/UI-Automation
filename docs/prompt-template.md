# Otomasyon Üretim Prompt Şablonu

Bu dosya, manuel test case'leri Cucumber + Playwright + TypeScript otomasyonuna
çevirmek için kullanılan tek standart prompt'tur.

Kullanım:

1. Yalnız `DOLDUR` alanını ilgili test için güncelle.
2. AI'a `docs/prompt-template.md dosyasındaki promptu uygula` demen yeterlidir.
3. Claude read-only reviewer olarak da devreye girsin istersen
   `docs/prompt-template.md dosyasındaki promptu uygula, orchestration mode aktif`
   de. Aynı `orchestration mode aktif` ifadesi manuel yazılan diğer task
   promptlarında da kullanılabilir. Orchestration mode'da önce
   `npm run claude:review:self-test` ile Claude CLI kullanılabilirliği kontrol edilir.
4. Kuralları farklı promptlarda çoğaltma. Ana kaynak `AGENTS.md`, güncel reuse
   sözlüğü `INVENTORY.md` dosyasıdır.

Dolduran kişi için not:

- `DOLDUR` alanında boş satır bırakma.
- Bilinmeyen alanlara `yok` yaz.
- Senaryo kararından emin değilsen `Senaryo işlemi` alanına
  `repo yapısından karar ver` yaz.
- Yetkili manuel test case ID'si bilinmiyorsa ID uydurma; durumu `Ek not`
  alanında açıkça belirt.

AI için not: Bu üst kısım kullanım açıklamasıdır. Uygulanacak asıl prompt
`## Prompt` başlığından başlar.

---

## Prompt

Bu repo Cucumber + Playwright + TypeScript UI otomasyon projesidir.

Ana kural kaynağı `AGENTS.md` dosyasıdır. Önce `AGENTS.md` ve `INVENTORY.md`
dosyalarını baştan sona oku. Mevcut step, locator, action, assertion veya flow
varsa yenisini yazma; mevcut reusable yapıyı kullan.

### DOLDUR

```text
Manuel test dosyası: YTKP-deneme-test-cases-codex.md
Bu turda otomasyona alınacak TC'ler: TC-003 ve TC-004
Hariç tutulacak TC'ler: TC-003 ve TC-004 hariç hepsi
Senaryo işlemi: mevcut senaryoya devam et
Kullanıcı: USER1
Ek not: yok
```

### Çalışma Sırası

1. Manuel test case'i oku; authoritative test case ID, action, data, expected
   result, test kategorisi ve başlangıç ekranını netleştir. Bilinmeyen ID'yi
   tahmin etme.
2. Önce `INVENTORY.md` içinde step, locator, action, assertion ve flow reuse'u
   ara; gerekirse `rg` ile `src` ve `features` altında derin arama yap.
3. `Senaryo işlemi` alanına göre hareket et:

   - `mevcut senaryoya devam et`: mevcut feature ve scenario korunur, yeni TC
     adımları mevcut scenario sonuna eklenir.
   - `mevcut feature içinde yeni scenario aç`: ilgili feature korunur ve aynı
     feature içinde yeni scenario oluşturulur.
   - `yeni feature aç`: `features/cases/smoke` veya
     `features/cases/regression` altında yeni feature oluşturulur.
   - `repo yapısından karar ver`: mevcut yapı ve manuel akış incelenir; güvenli
     karar verilemiyorsa tahminle kod yazılmadan blokaj raporlanır.

4. Her scenario adını authoritative manuel test case ID'siyle başlat. Scenario
   en az bir tag miras almalı veya tanımlamalı; klasörle uyumlu `@smoke` ya da
   `@regression` category tag'i bulunmalı. Feature adımlarında yalnız `*` kullan.
   `config/gherkin-policy-baseline.json` yalnız belgelenmiş legacy istisnalar
   içindir; yeni ihlali gizlemek için genişletme. Stale baseline girdisini de
   bırakma.
5. Mevcut dinamik/generic step varsa önce onu kullan. Yoksa sayfaya özel paket
   step yazmadan önce aynı davranışın parametreli, ekran bağımsız bir step olup
   olamayacağını değerlendir.
6. Action ile assertion'ı ayır: click/fill/select step'i yalnız aksiyon yapsın;
   expected result ayrı assertion step'inde doğrulansın.
7. Yeni action/assertion gerçekten gerekiyorsa doğru yere ekle:

   - alt seviye ortak primitive ve dinamik değer motoru: `common.*`
   - ortak UI davranışı: action için mevcut `control`, `dropdown`, `form`,
     `table` veya `uiAudit`; assertion için mevcut `control`, `dropdown`,
     `form` veya `table` capability dosyası
   - business'e özel davranış: ilgili domain dosyası

   Büyümüş `common` dosyalarına geri dönme; yeni capability/domain dosyasını
   yalnız gerçek tekrar veya büyüme eşiği varsa aç.
8. Login gerekiyorsa önce `npm run env:check -- --user <Kullanıcı>` ile env
   preflight yap ve mevcut auth step/flow'unu kullan. Regression/setup `login()`
   akışı yalnız teknik authentication ön koşulunu doğrular. Açık login smoke
   expected result'ında `verifyLoginSuccess()` ile tam landing sağlık oracle'ı
   çalışmalıdır; URL ve profil görünürlüğü tek başına başarı sayılmaz. Doğrulanmış
   fatal landing göstergesi stabilite penceresinde görünürse testi yeşile
   çevirmek için oracle'ı zayıflatma; uygulama hatasını raporla.
9. Sidebar geçişinde mevcut genel navigation step'ini kullan:
   `"{string} menü yolundan sayfaya gidilir"`. Menü derinliğini koda sabitleme.
10. Dropdown/listbox işlemlerinde mevcut generic sözlüğü kullan:

    - açma: `"{string}" dropdown'ı açılır`
    - seçme: `"{Dropdown Adı}" dropdownından "{Seçenek}" seçilir`
    - seçili değer: `"{Dropdown Adı}" dropdownında "{Değer}" değeri seçili olduğu doğrulanır`
    - seçenekler: `"{string} dropdown listesinde aşağıdaki seçenekler listelenir"`
      + Data Table

    Seçili gerçek ve beklenen değer görünmez karakter/boşluk normalizasyonundan
    sonra tam eşitlikle karşılaştırılmalı; substring/`contains` başarı sayılmamalı.
11. Dropdown'dan seçilen veya ekrandan okunan runtime değer sonraki adımda
    kullanılacaksa `ScenarioStore` standardını uygula. Değeri
    `this.saveValue` / `this.getValue` ile sakla/oku; `data.ts`'e veya feature'a
    hard-code etme. Kaynak UI alanı ve hedef kullanım bağlamı step metninde
    parametre olarak görünmeli.
12. Yeni locator gerekiyorsa repo içindeki `.mcp.json` ile lockfile'a pinlenmiş
    local Playwright MCP'yi kullanarak gerçek uygulamada doğrula. Runtime `npx`
    indirmesi yapma. MCP login oturumu kuramıyorsa, yalnız mevcut framework
    locator/action/assertion'larıyla `npm run live:check -- ...` fallback'i
    kullanılabilir; bu fallback yeni selector tahminini meşrulaştırmaz.
13. Timeout gerektiğinde `src/config/timeouts.ts` içindeki `TIMEOUTS`,
    `TimeoutOptions` ve `resolveUiTimeout` sözleşmesini kullan. Dağınık
    `5_000`/`10_000`/`45_000`, `waitForTimeout` veya her retry'da sıfırlanan
    deadline üretme. Reusable composite fonksiyon trailing `{ timeout }`
    override'ını tüm alt çağrılara iletsin; `live:check -- --timeout-ms` ilgili
    navigation/heading/table/form/control kontrollerine ulaşsın.
14. Doğrulanmayan locator, tahmini selector, TODO, placeholder step veya boş
    assertion bırakma. Yeni locator eklenirse `locators` ile `LOCATOR_REPORTS`
    birlikte güncellensin.
15. Lifecycle/reporting koduna dokunuluyorsa mevcut best-effort desenini koru:
    screenshot, attachment veya cleanup hatası asli step hatasını maskelemesin;
    context ve browser kapanışı birbirinden bağımsız denensin.
16. Yeni step, locator, action, assertion veya flow eklendiyse
    `npm run inventory` çalıştır ve `INVENTORY.md` dosyasını güncelle.
17. `npm run check` çalıştır. Bu komut typecheck, ESLint, Prettier, unit test,
    Gherkin policy, env/browser gerektirmeyen Cucumber dry-run ve inventory
    kapılarını birlikte çalıştırır. PowerShell execution-policy engelinde
    `npm.cmd run check` kullan.
18. İlgili scenario/feature'i proje `npm` runner'ıyla gerçek browser'da çalıştır.
    `npm run check` canlı testin yerine geçmez. Allure varsayılanı current-run
    clean rapordur; `--append` yalnız bilinçli çoklu browser birleştirmesinde
    kullanılır. Browser metadata'sını, browser-specific kararlı `historyId`yi ve
    özgün `testCaseId`yi bozma.
19. Test veya kalite kapısı hata verirse kök nedeni kanıtla ve minimum değişiklikle
    düzelt. Zorunlu locator, yetki, data, ekran veya expected result
    doğrulanamıyorsa bu turdaki test değişikliklerini geri alıp blokaj raporla.

### Çıktı Beklentisi

- Kod `AGENTS.md` mimarisine uygun olmalı; klasik Page Object Model veya ekran
  bazlı `Page` class'ı oluşturulmamalı.
- Duplicate step, locator, action, assertion veya flow üretilmemeli.
- Yeni locator gerçek uygulamada doğrulanmış olmalı.
- Hassas veri feature'a, koda veya rapora açık yazılmamalı.
- Scenario ID/tag/category ve yalnız `*` Gherkin kuralları sağlanmalı.
- Dropdown seçili değerleri normalize edilmiş tam eşitlikle doğrulanmalı.
- Login smoke bozuk landing ekranını yeşil geçirmemeli.
- Merkezi timeout ve best-effort lifecycle/reporting sözleşmeleri korunmalı.
- Gerekiyorsa `INVENTORY.md` güncellenmiş, `npm run check` temiz geçmiş olmalı.
- İlgili canlı test ve Allure sonuç modu final cevapta açıkça raporlanmalı.

### Blokaj Kuralı

Locator, yetki, test data, ekran erişimi, authoritative ID veya expected result
doğrulanamıyorsa bu turda yaptığın test değişikliklerini geri al. Kullanıcıya
veya önceki branch'e ait değişikliklere dokunma. Kodda yarım iş bırakma.

Final cevabı şu formatta ver:

```text
Bu test kodda bırakılmadı.
Sebep:
Denendi:
Gereken düzeltme:
Geri alınanlar:
```

### Final Cevap Formatı

İş tamamlandıysa final cevapta kısaca şunları yaz:

```text
Tamamlandı:
Değişen dosyalar:
Çalıştırılan kontroller:
Test sonucu:
Notlar:
```
