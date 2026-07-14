@regression @mfys @ytkp-deneme
Feature: YTKP Deneme GM Kasa Limit Girişi

  Scenario: TC-001, TC-002, TC-003, TC-004 - GM Kasa Limit Girişi ekranı ve kriter alanları doğrulanır
    * "USER1" kullanıcısı ile login olunur
    * "MFYS > Merkezi Muhasebe Yönetim Sistemi > Tanımlama ve Yardımcı İşlemler > GM Kasa Limit Girişi" menü yolundan sayfaya gidilir
    * "GM Kasa Limit Girişi" menüsünün seçili olduğu doğrulanır
    * "GM Para Limit Giriş Listesi" başlığı görüldüğü doğrulanır
    * Sayfada aşağıdaki dropdown alanları görüntülenir
      | Bölge Kodu |
      | Para Türü  |
    * Sayfada aşağıdaki input alanları görüntülenir
      | Limit Tutarı |
    * "Bölge Kodu" dropdownından "[006] 4. BÖLGE MÜDÜRLÜĞÜ (006)" seçilir
    * "Bölge Kodu" dropdownında "[006] 4. BÖLGE MÜDÜRLÜĞÜ (006)" değeri seçili olduğu doğrulanır
    * "Para Türü" dropdownından "AMERİKA DOLARI" seçilir
    * "Para Türü" dropdownında "AMERİKA DOLARI" değeri seçili olduğu doğrulanır
    * "Limit Tutarı" input alanına "115000" değeri yazılır
    * "Limit Tutarı" input alanına "115.000,00" değeri yazıldığı doğrulanır
    * "Filtrele" butonuna tıklanır
    * Tabloda aşağıdaki kolon başlıkları listelenir
      | Bölge Adı |
      | Para Türü |
