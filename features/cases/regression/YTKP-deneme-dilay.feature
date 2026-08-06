@regression @mfys @ytkp-deneme-dilay
Feature: Dağıtım Tipi Tanımlama

  Scenario: TC-001, TC-002, TC-003, TC-004 - Dağıtım Tipi Tanımlama ekranı ve oluşturma alanları doğrulanır
    * "USER1" kullanıcısı ile login olunur
    * "MFYS > Genel Parametre Ayarları > Tip Tanımlama > Dağıtım Tipi Tanımlama" menü yolundan sayfaya gidilir
    * "Dağıtım Tipi Tanımlama" menüsünün seçili olduğu doğrulanır
    * "Oluştur" butonu görüldüğü doğrulanır
    * Sayfada aşağıdaki dropdown alanları görüntülenir
      | Dağıtım Durumu |
    * "Oluştur" butonuna tıklanır
    * "Dağıtım Tipi Bilgileri" başlığı görüldüğü doğrulanır
    * Sayfada aşağıdaki dropdown alanları görüntülenir
      | Dağıtım Tipi   |
      | Dağıtım Durumu |
    * Sayfada aşağıdaki input alanları görüntülenir
      | Dağıtım Kodu |
      | Açıklama     |
    * "Dağıtım Tipi" dropdown'ı açılır
    * "Dağıtım Tipi" dropdown listesinde aşağıdaki seçenekler listelenir
      | [AT] AMORTİSMAN |
      | [DV] DVS        |
      | [MD] MDV        |
      | [ST] STOK       |
      | [YP] DÖVİZ      |
      | [YT] YATIRIM    |
      | [YK] YOK        |
    * "Dağıtım Tipi" dropdownından "[YP] DÖVİZ" seçilir
    * "Dağıtım Tipi" dropdownında "[YP] DÖVİZ" değeri seçili olduğu doğrulanır
    * "20" saniye beklenir
