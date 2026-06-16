@regression @mfys @ytkp1009
Feature: YTKP-1009 Otomatik Parametre Tanımlama

  Scenario: YTKP-1009 - Otomatik Parametre Tanımlama ekranı erişim ve yönlendirme kontrolü
    * "USER1" kullanıcısı ile login olunur
    * "MFYS > Genel Parametre Ayarları > Tanımlama İşlemleri > Otomatik Parametre Tanımlama" menü yolundan sayfaya gidilir
    * Otomatik Parametre Tanımlama sayfasının açıldığı doğrulanır
    * Yeni kayıt oluşturma ekranına geçiş yapılır
    * İşlem Kodu dropdown'ı açılır
    * İşlem Kodu listesinin kod ve açıklama formatında listelendiği doğrulanır
    * İşlem Kodu olarak "[001] KAPAMA" seçilir
    * Tür 2 alanının aktif, KDV Oranı alanının pasif olduğu doğrulanır
    * İşlem Kodu olarak "[002] VERGİSEL ŞUBE KAPAMA" seçilir
    * Tür 2 ve KDV Oranı alanlarının pasif olduğu doğrulanır
    * İşlem Kodu olarak "[003] DÖKÜM" seçilir
    * Tür 2 alanının pasif, KDV Oranı alanının aktif olduğu doğrulanır
    * Fiş Açıklama alanına "Yıl Sonu Kapanışı" yazılır
    * Fiş Açıklama alanının en fazla 15 karakter aldığı ve Türkçe karakteri koruduğu doğrulanır
    * Fiş Açıklama alanının zorunlu olduğu doğrulanır
    * Tür dropdown'ı açılır
    * "Tür" listesinde aşağıdaki seçenekler listelenir
      | MERKEZ |
      | BAŞMÜDÜRLÜK |
      | GENEL MÜDÜRLÜK |
    * İşlem Kodu olarak "[001] KAPAMA" seçilir
    * Tür 2 dropdown'ı açılır
    * "Tür 2" listesinde aşağıdaki seçenekler listelenir
      | KDV-1 |
      | KDV-2 |
      | DAMGA |
      | BSMV |
      | KAMBİYO |
      | KONAKLAMA |
    * İşlem Kodu olarak "[003] DÖKÜM" seçilir
    * KDV Oranı dropdown'ı açılır
    * "KDV Oranı" listesinde aşağıdaki seçenekler listelenir
      | %18 |
      | %8 |
      | %1 |
      | YOK(%0) |
      | %10 |
      | %20 |