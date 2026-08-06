@regression @mfys @ytkp1009
Feature: YTKP-1009 Otomatik Parametre Tanımlama

  Scenario: YTKP-1009 - Otomatik Parametre Tanımlama ekranı erişim ve yönlendirme kontrolü
    * "USER1" kullanıcısı ile login olunur
    * "MFYS > Genel Parametre Ayarları > Tanımlama İşlemleri > Otomatik Parametre Tanımlama" menü yolundan sayfaya gidilir
    * Otomatik Parametre Tanımlama sayfasının açıldığı doğrulanır
    * "Oluştur" butonuna tıklanır
    * Otomatik Parametre oluşturma ekranının açıldığı doğrulanır
    * "İşlem Kodu" dropdown'ı açılır
    * İşlem Kodu listesinin kod ve açıklama formatında listelendiği doğrulanır
    * "İşlem Kodu" dropdownından "[001] KAPAMA" seçilir
    * Tür 2 alanının aktif, KDV Oranı alanının pasif olduğu doğrulanır
    * "İşlem Kodu" dropdownından "[002] VERGİSEL ŞUBE KAPAMA" seçilir
    * Tür 2 ve KDV Oranı alanlarının pasif olduğu doğrulanır
    * "İşlem Kodu" dropdownından "[003] DÖKÜM" seçilir
    * Tür 2 alanının pasif, KDV Oranı alanının aktif olduğu doğrulanır
    * "Fiş Açıklama" input alanına "Yıl Sonu Kapanışı" değeri yazılır
    * Fiş Açıklama alanının en fazla 15 karakter aldığı ve Türkçe karakteri koruduğu doğrulanır
    * Fiş Açıklama alanının zorunlu olduğu doğrulanır
    * "Tür" dropdown'ı açılır
    * "Tür" dropdown listesinde aşağıdaki seçenekler listelenir
      | MERKEZ |
      | BAŞMÜDÜRLÜK |
      | GENEL MÜDÜRLÜK |
    * "İşlem Kodu" dropdownından "[001] KAPAMA" seçilir
    * "Tür 2" dropdown'ı açılır
    * "Tür 2" dropdown listesinde aşağıdaki seçenekler listelenir
      | KDV-1 |
      | KDV-2 |
      | DAMGA |
      | BSMV |
      | KAMBİYO |
      | KONAKLAMA |
    * "İşlem Kodu" dropdownından "[003] DÖKÜM" seçilir
    * "KDV Oranı" dropdown'ı açılır
    * "KDV Oranı" dropdown listesinde aşağıdaki seçenekler listelenir
      | %18 |
      | %8 |
      | %1 |
      | YOK(%0) |
      | %10 |
      | %20 |
    * "KDV Oranı" dropdownından "%20" seçilir
