/* =========================================================
   VEGA Genişletme Paketi 4 — paralel ajan üretimi (öz-denetimli)
   Veri Bilimi, Mobil, Gömülü & IoT, Oyun Geliştirme
   ========================================================= */
const VEGA_KNOWLEDGE_EXT4 = [
 {
  "id": "ds-numpy-array-vs-list",
  "cat": "Veri Bilimi",
  "q": "numpy array python list fark vektörleştirme vectorization hız performans dizi liste ndarray döngü loop bellek",
  "title": "NumPy Dizisi ve Python Listesi Farkı",
  "a": "Python listesi her türden nesne tutabilen esnek ama yavaş bir yapıdır; NumPy dizisi ise tek tipte, bellekte ardışık saklanan verilerle çalışır. NumPy işlemleri C seviyesinde vektörleştirildiği için eleman eleman Python döngüsünden çoğu zaman onlarca kat hızlıdır. Yaygın tuzak: NumPy dizisi üzerinde yine de for döngüsü yazmak; bu, NumPy'ın hız avantajını yok eder.",
  "code": "import numpy as np\n\nliste = list(range(1_000_000))\ndizi = np.arange(1_000_000)\n\n# Python listesi: yorumlayıcı her eleman için ayrı çalışır (yavaş)\nkareler_liste = [x * x for x in liste]\n\n# NumPy: işlem C seviyesinde vektörleştirilmiş (hızlı)\nkareler_dizi = dizi * dizi\nprint(kareler_dizi[:3])  # [0 1 4]",
  "weight": 1.0
 },
 {
  "id": "ds-numpy-broadcasting",
  "cat": "Veri Bilimi",
  "q": "numpy broadcasting yayınlama şekil shape boyut uyumu dizi toplama matris vektör axis kural eksen",
  "title": "NumPy Broadcasting (Yayınlama)",
  "a": "Broadcasting, farklı şekillerdeki dizilerin kopyalama yapmadan birlikte işleme sokulmasını sağlar: boyutlar sağdan sola karşılaştırılır ve eşit olan ya da 1 olan boyutlar uyumlu sayılır. Uzunluğu 1 olan eksen, diğer dizinin boyutuna 'yayılmış' gibi davranır. Yaygın tuzak: (3,) ile (3,1) şekillerini toplamak (3,3) sonuç üretir; bu çoğu zaman istenmeyen bir dış çarpım benzeri davranıştır.",
  "code": "import numpy as np\n\na = np.array([[1, 2, 3],\n              [4, 5, 6]])      # şekil (2, 3)\nb = np.array([10, 20, 30])     # şekil (3,)\nprint(a + b)                   # b her satıra yayılır\n\ns = np.array([[100], [200]])   # şekil (2, 1)\nprint(a + s)                   # s her sütuna yayılır",
  "weight": 1.0
 },
 {
  "id": "ds-pandas-dataframe-series",
  "cat": "Veri Bilimi",
  "q": "pandas DataFrame Series temel tablo sütun column satır index veri çerçevesi oluşturma dict seçme",
  "title": "Pandas DataFrame ve Series Temelleri",
  "a": "Series, etiketli tek boyutlu bir dizidir; DataFrame ise her sütunu bir Series olan iki boyutlu tablodur. df[\"sütun\"] tek köşeli parantezle Series, df[[\"sütun\"]] çift köşeli parantezle tek sütunlu DataFrame döner; bu fark özellikle scikit-learn'e veri verirken önemlidir. Her ikisi de satır etiketi görevi gören bir index taşır.",
  "code": "import pandas as pd\n\ndf = pd.DataFrame({\n    \"ad\": [\"Ali\", \"Ayşe\", \"Can\"],\n    \"yas\": [25, 31, 19],\n})\nsutun = df[\"yas\"]         # tek köşeli parantez -> Series\nprint(type(sutun).__name__)   # Series\nprint(df[[\"yas\"]].shape)      # çift köşeli parantez -> DataFrame (3, 1)",
  "weight": 1.0
 },
 {
  "id": "ds-pandas-filtreleme-loc-iloc",
  "cat": "Veri Bilimi",
  "q": "pandas filtreleme loc iloc fark boolean maske mask satır seçme slicing etiket konum indexing koşul",
  "title": "Pandas Filtreleme ve loc/iloc Farkı",
  "a": "loc etikete (index adına) göre, iloc ise konuma (sıra numarasına) göre seçim yapar. Kritik tuzak: loc ile dilimlemede bitiş etiketi DAHİLDİR, iloc'ta ise Python geleneğine uygun olarak HARİÇTİR. Koşullu filtreleme boolean maske ile yapılır; filtrelenmiş kopyaya atama yapmak SettingWithCopyWarning üretir, atama için df.loc[maske, \"sütun\"] kullanın.",
  "code": "import pandas as pd\n\ndf = pd.DataFrame({\"yas\": [25, 31, 19]}, index=[\"a\", \"b\", \"c\"])\nprint(df.loc[\"a\":\"b\"])   # etikete göre, \"b\" DAHİL\nprint(df.iloc[0:2])      # konuma göre, 2. satır HARİÇ\n\ngenc = df[df[\"yas\"] < 30]                 # boolean maske ile filtre\ndf.loc[df[\"yas\"] < 30, \"grup\"] = \"genç\"   # güvenli koşullu atama\nprint(df)",
  "weight": 1.0
 },
 {
  "id": "ds-groupby-agg",
  "cat": "Veri Bilimi",
  "q": "pandas groupby agg gruplama toplulaştırma aggregation sum mean count özet named aggregation split apply combine",
  "title": "GroupBy ve Agg Desenleri",
  "a": "groupby, 'böl-uygula-birleştir' desenini uygular: veri anahtara göre gruplanır, her gruba fonksiyon uygulanır ve sonuçlar birleştirilir. agg ile birden çok istatistik aynı anda hesaplanabilir; adlandırılmış toplulaştırma (named aggregation) sonuç sütunlarına okunaklı isim verir. Yaygın tuzak: sonuçta grup anahtarı index olur; düz sütun istiyorsanız as_index=False veya reset_index() kullanın.",
  "code": "import pandas as pd\n\ndf = pd.DataFrame({\n    \"sehir\": [\"Ankara\", \"Ankara\", \"İstanbul\", \"İstanbul\"],\n    \"satis\": [10, 20, 30, 40],\n})\nozet = df.groupby(\"sehir\")[\"satis\"].agg([\"sum\", \"mean\"])\nprint(ozet)\n\n# Adlandırılmış toplulaştırma: sütun adını sen belirlersin\nadli = df.groupby(\"sehir\", as_index=False).agg(toplam=(\"satis\", \"sum\"))\nprint(adli)",
  "weight": 1.0
 },
 {
  "id": "ds-merge-join",
  "cat": "Veri Bilimi",
  "q": "pandas merge join birleştirme inner left outer right tablo anahtar key on how sql concat",
  "title": "Pandas'ta Merge ve Join",
  "a": "pd.merge, SQL join mantığıyla iki tabloyu ortak anahtar üzerinden birleştirir: how parametresi inner (yalnız eşleşenler), left (sol tablonun tamamı), right ve outer seçeneklerini alır. Left join'de eşleşmeyen satırların sağ taraftaki sütunları NaN olur. Yaygın tuzak: anahtar sütunda yinelenen değerler varsa satır sayısı beklenmedik şekilde artar (çoktan-çoğa eşleşme); birleştirme öncesi anahtarın tekilliğini kontrol edin.",
  "code": "import pandas as pd\n\nmusteri = pd.DataFrame({\"id\": [1, 2, 3], \"ad\": [\"Ali\", \"Ayşe\", \"Can\"]})\nsiparis = pd.DataFrame({\"id\": [1, 1, 3], \"tutar\": [50, 70, 20]})\n\nic = pd.merge(musteri, siparis, on=\"id\", how=\"inner\")\nprint(ic)   # yalnız eşleşen id'ler (1 iki kez, 3 bir kez)\n\nsol = pd.merge(musteri, siparis, on=\"id\", how=\"left\")\nprint(sol)  # Ayşe'nin tutar sütunu NaN olur",
  "weight": 1.0
 },
 {
  "id": "ds-eksik-veri-nan",
  "cat": "Veri Bilimi",
  "q": "eksik veri missing NaN null isna fillna dropna doldurma silme imputation ffill ortalama medyan strateji",
  "title": "Eksik Veri (NaN) Stratejileri",
  "a": "Eksik veriyle başa çıkmanın üç ana yolu vardır: satır/sütun silme (dropna), sabit veya istatistiksel değerle doldurma (fillna ile ortalama/medyan) ve önceki/sonraki değerle doldurma (ffill/bfill, özellikle zaman serilerinde). Kritik tuzak: NaN kendine eşit değildir, yani x == np.nan her zaman False döner; kontrol için mutlaka isna() kullanın. Doldurma yöntemi seçmeden önce eksikliğin rastgele mi yoksa sistematik mi olduğunu düşünün.",
  "code": "import pandas as pd\nimport numpy as np\n\ns = pd.Series([1.0, np.nan, 3.0, np.nan])\nprint(s.isna().sum())        # 2 eksik değer (== np.nan ÇALIŞMAZ!)\nprint(s.dropna())            # eksikleri at\nprint(s.fillna(s.mean()))    # ortalama ile doldur\nprint(s.ffill())             # önceki değerle doldur (zaman serisi)",
  "weight": 1.0
 },
 {
  "id": "ds-kategorik-kodlama",
  "cat": "Veri Bilimi",
  "q": "kategorik veri kodlama encoding one-hot label ordinal get_dummies category cat codes makine öğrenmesi özellik",
  "title": "Kategorik Veri Kodlama: One-Hot ve Label",
  "a": "Makine öğrenmesi modelleri sayısal girdi bekler; one-hot kodlama her kategoriyi ayrı 0/1 sütununa çevirir, label kodlama ise her kategoriye bir tam sayı atar. Kritik tuzak: label kodlama kategoriler arasında yapay bir sıralama ('mavi' < 'kırmızı') ima eder; sırasız (nominal) kategorilerde doğrusal modeller için one-hot tercih edin. Çok sayıda kategori varsa one-hot sütun patlamasına yol açabilir.",
  "code": "import pandas as pd\n\ndf = pd.DataFrame({\"renk\": [\"kırmızı\", \"mavi\", \"kırmızı\"]})\n\n# One-hot: her kategori ayrı 0/1 sütunu olur\nonehot = pd.get_dummies(df, columns=[\"renk\"], dtype=int)\nprint(onehot)\n\n# Label kodlama: her kategoriye bir tam sayı\ndf[\"renk_kod\"] = df[\"renk\"].astype(\"category\").cat.codes\nprint(df)",
  "weight": 1.0
 },
 {
  "id": "ds-veri-gorsellestirme-ilkeleri",
  "cat": "Veri Bilimi",
  "q": "veri görselleştirme matplotlib grafik chart plot figure axes eksen başlık etiket çizgi bar ilke visualization",
  "title": "Veri Görselleştirme İlkeleri (Matplotlib)",
  "a": "Grafik türünü veri belirler: zaman içinde değişim için çizgi, kategori karşılaştırması için çubuk, dağılım için histogram, iki değişken ilişkisi için saçılım grafiği uygundur. Matplotlib'de figür (tuval) ve eksen (çizim alanı) ayrı nesnelerdir; plt.subplots() ile nesne yönelimli arayüzü kullanmak, plt.plot gibi global durum tutan arayüzden daha kontrollüdür. Eksen etiketi ve başlık olmayan grafik eksik sayılır; ayrıca çubuk grafikte y eksenini sıfırdan başlatmamak yanıltıcıdır.",
  "code": "import matplotlib.pyplot as plt\n\naylar = [\"Oca\", \"Şub\", \"Mar\", \"Nis\"]\nsatis = [10, 14, 9, 17]\n\nfig, ax = plt.subplots()            # figür ve eksen ayrı nesneler\nax.plot(aylar, satis, marker=\"o\")  # zaman için çizgi grafik uygun\nax.set_xlabel(\"Ay\")\nax.set_ylabel(\"Satış\")\nax.set_title(\"Aylık Satış\")\nplt.show()",
  "weight": 1.0
 },
 {
  "id": "ds-korelasyon-nedensellik",
  "cat": "Veri Bilimi",
  "q": "korelasyon nedensellik correlation causation corr pearson gizli değişken confounder ilişki istatistik yanılgı sahte",
  "title": "Korelasyon Nedensellik Değildir",
  "a": "Korelasyon iki değişkenin birlikte hareket ettiğini ölçer (-1 ile +1 arası), ama birinin diğerine neden olduğunu kanıtlamaz. Yüksek korelasyon üç şeyden kaynaklanabilir: gerçek nedensellik, ters yönlü nedensellik veya her ikisini etkileyen gizli bir değişken (confounder) — klasik örnek: dondurma satışı ile boğulma vakaları, ikisini de sıcaklık artırır. Ayrıca Pearson korelasyonu yalnızca doğrusal ilişkiyi yakalar; 0'a yakın korelasyon güçlü doğrusal olmayan bir ilişkiyi gizleyebilir.",
  "code": "import pandas as pd\n\ndf = pd.DataFrame({\n    \"dondurma_satisi\": [10, 20, 30, 40],\n    \"bogulma_vakasi\":  [1, 2, 3, 4],\n})\n# Korelasyon 1.0 ama neden dondurma değil; gizli değişken: sıcaklık\nprint(df[\"dondurma_satisi\"].corr(df[\"bogulma_vakasi\"]))  # 1.0",
  "weight": 1.0
 },
 {
  "id": "ds-veri-temizleme-kontrol-listesi",
  "cat": "Veri Bilimi",
  "q": "veri temizleme cleaning kontrol listesi checklist duplicate yinelenen aykırı outlier tip dtype tutarsız etiket strip",
  "title": "Veri Temizleme Kontrol Listesi",
  "a": "Analiz öncesi tipik kontrol listesi: df.info() ile veri tipleri ve eksik sayıları, describe() ile aykırı değer ipuçları, duplicated() ile yinelenen satırlar, unique() ile tutarsız kategori etiketleri ('İst', 'ist ', 'Istanbul' gibi). Metin sütunlarında boşluk kırpma ve büyük/küçük harf normalizasyonu en sık atlanan adımdır. Kural: ham veriyi asla üzerine yazmayın; temizlenmiş veriyi ayrı değişkende veya dosyada tutun.",
  "code": "import pandas as pd\n\ndf = pd.DataFrame({\"sehir\": [\"Ist\", \"ist \", \"Ank\", \"Ank\"],\n                   \"satis\": [10.0, 12.0, 5.0, None]})\ndf.info()                                 # tipler ve eksik değerler\nprint(df.duplicated().sum())              # yinelenen satır sayısı\ndf[\"sehir\"] = df[\"sehir\"].str.strip().str.lower()  # etiketleri normalle\nprint(df[\"sehir\"].unique())               # tutarsızlık kaldı mı?\ntemiz = df.drop_duplicates().dropna()     # ham df'yi ezme, ayrı tut\nprint(temiz)",
  "weight": 1.0
 },
 {
  "id": "ds-buyuk-csv-chunk-dtype",
  "cat": "Veri Bilimi",
  "q": "büyük csv chunk chunksize dtype bellek memory read_csv usecols category parça parça okuma pandas optimizasyon",
  "title": "Büyük CSV Dosyalarıyla Çalışma",
  "a": "Belleğe sığmayan CSV'ler için üç temel teknik vardır: chunksize ile dosyayı parça parça işlemek, usecols ile yalnızca gerekli sütunları okumak ve dtype ile küçük tipler (int32, float32, category) belirtmek. Tekrarlı metin sütununu category tipine çevirmek belleği çoğu zaman onlarca kat düşürür. Yaygın tuzak: dtype verilmezse pandas tip çıkarımı için ek bellek harcar ve metinleri pahalı object tipinde tutar.",
  "code": "import pandas as pd\n\ntipler = {\"id\": \"int32\", \"kategori\": \"category\"}  # belleği küçültür\ntoplam = 0.0\nfor parca in pd.read_csv(\"buyuk.csv\",\n                         chunksize=100_000,      # 100 bin satırlık parçalar\n                         usecols=[\"id\", \"kategori\", \"tutar\"],\n                         dtype=tipler):\n    toplam += parca[\"tutar\"].sum()  # her parçayı ayrı işle, biriktir\nprint(toplam)",
  "weight": 1.0
 },
 {
  "id": "ds-jupyter-iyi-pratikler",
  "cat": "Veri Bilimi",
  "q": "jupyter notebook iyi pratik best practice hücre sırası restart run all gizli durum hidden state modülerlik versiyon",
  "title": "Jupyter Notebook İyi Pratikleri",
  "a": "Notebook'un en büyük tuzağı gizli durumdur: hücreleri sıra dışı çalıştırmak, silinen hücrelerin değişkenlerinin bellekte yaşamaya devam etmesi gibi tutarsızlıklar yaratır; bu yüzden paylaşmadan önce mutlaka 'Restart Kernel & Run All' ile baştan sona çalıştığını doğrulayın. İçe aktarmaları ilk hücrede toplayın, uzun/tekrarlanan mantığı .py modüllerine taşıyıp notebook'tan import edin. Sürüm kontrolünde hücre çıktıları gürültü yarattığı için commit öncesi çıktıları temizlemek (veya nbstripout kullanmak) iyi pratiktir.",
  "code": null,
  "weight": 1.0
 },
 {
  "id": "ds-tekrarlanabilirlik-seed",
  "cat": "Veri Bilimi",
  "q": "tekrarlanabilirlik reproducibility seed random_state numpy random ortam environment requirements sürüm sabitleme deney",
  "title": "Tekrarlanabilirlik: Seed ve Ortam Sabitleme",
  "a": "Tekrarlanabilir sonuç için rastgelelik kullanan her yerde seed sabitlenmelidir; ancak dikkat: numpy, Python'un random modülü ve scikit-learn'ün random_state parametresi ayrı üreteçlerdir, birini sabitlemek diğerini etkilemez. NumPy'da modern yol np.random.default_rng(seed) ile üreteç nesnesi kullanmaktır. Kod aynı olsa bile kütüphane sürümleri farklıysa sonuç değişebilir; ortamı requirements.txt veya environment.yml ile sabitleyin.",
  "code": "import random\nimport numpy as np\n\nrng = np.random.default_rng(42)   # modern NumPy üreteci\nprint(rng.normal(size=3))         # aynı seed -> her çalıştırmada aynı\n\nrandom.seed(42)                   # standart kütüphane AYRI seed ister\nprint(random.random())\n\n# Ortamı da sabitle (terminalde):\n# pip freeze > requirements.txt",
  "weight": 1.0
 },
 {
  "id": "mob-native-vs-cross-platform",
  "cat": "Mobil",
  "q": "native cross-platform react native flutter kotlin swift platform seçimi hibrit uygulama çapraz platform mobil framework dart tek kod tabanı performans karşılaştırma mobil geliştirme",
  "title": "Native mi, cross-platform mu?",
  "a": "Native geliştirme (Kotlin/Swift) platform API'lerine tam erişim ve en iyi performansı sunar; React Native ve Flutter ise tek kod tabanıyla iki platformu hedefleyerek geliştirme maliyetini düşürür. Seçim; ekip yetkinliği, platforma özgü özellik ihtiyacı (ör. yoğun kamera/AR, arka plan servisleri) ve uzun vadeli bakım planına göre yapılmalıdır. Yaygın tuzak: cross-platform'un 'sıfır platform bilgisi' gerektirdiğini sanmaktır; native köprüler, izinler ve mağaza süreçleri için yine platform bilgisi gerekir.",
  "code": null,
  "weight": 1.0
 },
 {
  "id": "mob-uygulama-yasam-dongusu",
  "cat": "Mobil",
  "q": "yaşam döngüsü lifecycle activity viewcontroller onCreate onResume viewDidLoad arka plan background foreground onPause state kaybı process death ekran döndürme",
  "title": "Mobil uygulama yaşam döngüsü",
  "a": "Mobil ekranlar işletim sistemi tarafından yönetilen bir yaşam döngüsünden geçer: oluşturulma, görünür olma, odak kazanma, arka plana alınma ve yok edilme (Android'de Activity, iOS'ta ViewController kavramları). Sistem, bellek baskısında arka plandaki süreci haber vermeden öldürebilir; bu yüzden kritik durum (state) uygun kancalarda kalıcı hale getirilmelidir. Yaygın tuzak: durumu yalnızca bellekte tutup ekran döndürme veya process death sonrası veri kaybı yaşamaktır.",
  "code": "// Kavramsal yaşam döngüsü akışı (platform-tarafsız)\noluşturuldu()      // UI kurulumu, tek seferlik işler\ngörünürOldu()      // veri yenileme, dinleyici kaydı\nodakKazandı()      // animasyon/sensör başlat\n// --- kullanıcı başka uygulamaya geçti ---\nodakKaybetti()     // animasyonları durdur\narkaPlanaAlındı()  // durumu KALICI kaydet (kritik nokta!)\nyokEdildi()        // kaynakları serbest bırak\n// Uyarı: arkaPlanaAlındı sonrası süreç habersiz ölebilir",
  "weight": 1.0
 },
 {
  "id": "mob-ui-thread-anr",
  "cat": "Mobil",
  "q": "ui thread main thread anr donma freeze application not responding ana iş parçacığı asenkron coroutine async await jank 16ms frame drop arayüz kilitleme",
  "title": "UI thread ve ANR/donma",
  "a": "Mobil arayüz tek bir ana iş parçacığında (UI/main thread) çizilir; bu thread'de yapılan ağ isteği, disk okuma gibi uzun işlemler arayüzü dondurur ve Android'de ANR (Application Not Responding) hatasına yol açar. Akıcı 60 fps için her kare yaklaşık 16 ms içinde işlenmelidir; ağır işler arka plan thread'ine taşınıp sonuç ana thread'e döndürülür. Yaygın tuzak: arka plan thread'inden doğrudan UI güncellemeye çalışmaktır; UI yalnızca ana thread'den güncellenmelidir.",
  "code": "// Kavramsal doğru desen\narkaPlandaÇalıştır {\n  val veri = agIstegiYap()       // uzun iş: UI thread'de DEĞİL\n  val sonuc = veriyiIsle(veri)   // ağır hesaplama da arka planda\n  anaThreadeGec {\n    listeyiGuncelle(sonuc)       // UI güncellemesi SADECE burada\n  }\n}\n// Yanlış: UI thread'de senkron ağ/disk çağrısı => ANR/donma",
  "weight": 1.0
 },
 {
  "id": "mob-izin-modeli",
  "cat": "Mobil",
  "q": "permission izin runtime permission çalışma zamanı izni kamera izni konum izni izin isteme rationale izin reddi privacy gizlilik en az yetki android izin ios izin",
  "title": "İzin (permission) modeli iyi pratikleri",
  "a": "Modern mobil platformlarda hassas izinler (kamera, konum, bildirim vb.) çalışma zamanında, kullanım anında istenir. İyi pratik: izni özelliğe ihtiyaç duyulan anda (in-context) istemek, öncesinde kısa bir gerekçe göstermek ve en az yetki ilkesine uymaktır (ör. tam konum yerine yaklaşık konum). Yaygın tuzak: açılışta tüm izinleri toplu istemek ve kalıcı ret durumunu ele almamaktır; kullanıcı 'bir daha sorma' dediyse ayarlara yönlendiren bir akış gerekir.",
  "code": "// Kavramsal izin akışı\nfun fotografCek() {\n  when (izinDurumu(KAMERA)) {\n    VERILDI -> kamerayiAc()\n    GEREKCE_GOSTER -> {          // kullanıcı daha önce reddetti\n      gerekceDialoguGoster()     // \"Fotoğraf için kamera gerekli\"\n      izinIste(KAMERA)\n    }\n    KALICI_RET -> ayarlaraYonlendir() // sistem artık sormaz\n    else -> izinIste(KAMERA)     // kullanım anında iste\n  }\n}",
  "weight": 1.0
 },
 {
  "id": "mob-depolama-secenekleri",
  "cat": "Mobil",
  "q": "mobil depolama storage sqlite room core data shared preferences userdefaults keychain keystore dosya sistemi yerel veritabanı key-value cache kalıcı veri",
  "title": "Mobil depolama seçenekleri",
  "a": "Mobilde depolama katmanları amaca göre seçilir: küçük ayarlar için key-value depoları (SharedPreferences/UserDefaults), yapılandırılmış ve sorgulanabilir veri için yerel veritabanı (SQLite ve üzerine Room/Core Data gibi katmanlar), büyük ikili içerik için dosya sistemi, gizli anahtar ve token'lar için ise Keystore/Keychain. Yaygın tuzak: token gibi hassas verileri düz metin olarak key-value deposuna yazmaktır; bu depolar şifreli değildir ve root'lu/jailbreak'li cihazda okunabilir.",
  "code": "// Veri türüne göre doğru depo seçimi (şema)\nayarlar/bayraklar      -> key-value (Preferences/UserDefaults)\nyapısal, sorgulanan    -> SQLite (Room / Core Data)\nbüyük dosya/medya      -> dosya sistemi (cache vs kalıcı dizin ayrımı)\ntoken, şifre, anahtar  -> Keystore / Keychain (donanım destekli)\ngeçici ağ yanıtı       -> önbellek dizini (sistem silebilir)\n// Tuzak: hassas veriyi düz metin key-value'ya YAZMA",
  "weight": 1.0
 },
 {
  "id": "mob-push-bildirim",
  "cat": "Mobil",
  "q": "push notification push bildirim fcm apns firebase cloud messaging device token cihaz token bildirim mimarisi silent push notification payload topic bildirim kanalı sunucu push",
  "title": "Push bildirim mimarisi",
  "a": "Push bildirimleri uygulama sunucusundan cihaza doğrudan gitmez; platform aracı servisleri (Android için FCM, iOS için APNs) üzerinden iletilir. Akış: uygulama platform servisinden bir cihaz token'ı alır, bunu kendi backend'ine kaydeder; backend bildirim göndermek istediğinde token ile FCM/APNs'e istek yapar. Yaygın tuzak: token'ın değişebileceğini unutmaktır; token yenilenmesini dinleyip backend'de güncellemeyen sistemler zamanla 'ölü' token'lara gönderim yapar.",
  "code": "// Push mimarisi (kavramsal akış)\n[Uygulama] --kayıt--> [FCM/APNs] --token--> [Uygulama]\n[Uygulama] --token'ı kaydet--> [Kendi Backend'in]\n[Backend]  --bildirim + token--> [FCM/APNs] --push--> [Cihaz]\n\n// Token yenilenmesi (kritik!)\ntokenYenilendiginde { yeniToken ->\n  backendeGonder(yeniToken)   // eskisi geçersiz olabilir\n}",
  "weight": 1.0
 },
 {
  "id": "mob-deep-link",
  "cat": "Mobil",
  "q": "deep link universal link app link derin bağlantı url scheme intent filter associated domains assetlinks.json apple-app-site-association bağlantı yönlendirme deferred deep link uygulama içi sayfa açma",
  "title": "Deep link ve universal/app link",
  "a": "Deep link, bir URL ile uygulamanın belirli bir ekranını açmayı sağlar. Özel URL şemaları (myapp://) basittir ama herhangi bir uygulama aynı şemayı sahiplenebilir; universal link (iOS) ve app link (Android) ise https URL'lerini sunucuya konan doğrulama dosyasıyla (apple-app-site-association / assetlinks.json) uygulamaya bağlar ve uygulama yüklü değilse web'e düşer. Yaygın tuzak: link parametrelerini doğrulamadan kullanmaktır; deep link dışarıdan gelen güvenilmez girdi olarak ele alınmalıdır.",
  "code": "// https tabanlı link doğrulama (kavramsal)\n// Sunucu: https://ornek.com/.well-known/assetlinks.json (Android)\n//         https://ornek.com/.well-known/apple-app-site-association (iOS)\n\nlinkGeldiginde(url) {\n  val id = url.parametre(\"urunId\")\n  if (!gecerliMi(id)) { anaSayfayaDus(); return }  // güvenilmez girdi!\n  urunEkraniniAc(id)\n}\n// Uygulama yüklü değilse aynı URL web sayfasını açar (fallback)",
  "weight": 1.0
 },
 {
  "id": "mob-ag-dayanikliligi",
  "cat": "Mobil",
  "q": "offline-first çevrimdışı retry yeniden deneme exponential backoff ağ dayanıklılığı network resilience senkronizasyon sync cache bağlantı kopması kuyruk idempotent timeout",
  "title": "Mobil ağ dayanıklılığı ve offline-first",
  "a": "Mobil ağlar yavaş, kesintili ve değişkendir; sağlam uygulamalar offline-first yaklaşır: yerel veritabanı tek doğruluk kaynağıdır, UI yerelden beslenir, ağ senkronizasyonu arka planda yapılır. Başarısız istekler exponential backoff ve jitter ile yeniden denenmeli, yazma işlemleri bağlantı gelince gönderilmek üzere kuyruklanmalıdır. Yaygın tuzak: retry yapılan yazma isteklerini idempotent tasarlamamaktır; aynı istek iki kez işlenince çift kayıt oluşur.",
  "code": "// Exponential backoff + jitter (kavramsal)\nvar bekleme = 1_000L                    // 1 sn ile başla\nrepeat(maksDeneme) {\n  try { return istekGonder(istek) }     // istek idempotent olmalı!\n  catch (e: GeciciAgHatasi) {\n    delay(bekleme + rastgele(0, 500))   // jitter: yığılmayı önler\n    bekleme = minOf(bekleme * 2, 60_000)// üst sınır koy\n  }\n}\nkuyrugaEkle(istek)  // hâlâ olmadıysa bağlantı gelince dene",
  "weight": 1.0
 },
 {
  "id": "mob-batarya-dostu",
  "cat": "Mobil",
  "q": "batarya pil tüketimi battery doze mode wakelock arka plan işi background job workmanager konum takibi polling batch enerji verimliliği gps tüketimi battery drain",
  "title": "Batarya dostu geliştirme",
  "a": "Bataryayı en çok tüketen kalemler radyo (ağ) kullanımı, GPS ve cihazı uyanık tutan arka plan işleridir. İyi pratik: ağ isteklerini toplu (batch) yapmak, sunucuyu sürekli yoklamak (polling) yerine push kullanmak, konum hassasiyetini ihtiyaca göre düşürmek ve arka plan işlerini sistemin zamanlayıcısına (WorkManager/BGTaskScheduler gibi) bırakmaktır. Yaygın tuzak: kısa aralıklı timer/polling ile cihazın uyku (Doze) moduna girmesini engellemektir; sistem bu tür uygulamaları kısıtlar veya öldürür.",
  "code": "// Batarya dostu arka plan işi (kavramsal)\nisPlanla(\"senkronizasyon\") {\n  kosullar = [ AG_VAR, SARJDA_OLMASI_TERCIH ]  // sistem uygun anı seçer\n  periyot = 6.saat                              // sık polling yerine seyrek\n}\n// Kaçınılacaklar:\n// - while(true) + kısa sleep ile sunucu yoklama\n// - sürekli yüksek hassasiyetli GPS dinleme\n// - gereksiz wakelock tutup Doze'u engelleme",
  "weight": 1.0
 },
 {
  "id": "mob-uygulama-boyutu",
  "cat": "Mobil",
  "q": "apk boyutu app size uygulama boyutu küçültme app bundle aab app thinning proguard r8 minify code shrinking resim sıkıştırma webp kaynak optimizasyonu split apk",
  "title": "Uygulama boyutu küçültme",
  "a": "Büyük uygulama boyutu indirme oranını ve kısıtlı depolamalı cihazlarda kalıcılığı düşürür. Temel teknikler: kullanılmayan kodu ayıklayan shrinker'lar (R8/ProGuard, iOS'ta linker), cihaza özel paket üreten Android App Bundle ve iOS App Thinning, görselleri WebP gibi verimli formatlara çevirme ve kullanılmayan kütüphane/kaynakları temizleme. Yaygın tuzak: code shrinking açıkken reflection ile erişilen sınıfların silinmesidir; keep kuralları tanımlanmazsa uygulama üretimde çöker.",
  "code": "# Boyut küçültme kontrol listesi\n- App Bundle / App Thinning kullan (cihaza özel paket)\n- R8/ProGuard ile kod ayıklama + obfuscation aç\n- reflection kullanan sınıflar için keep kuralı ekle  # kritik tuzak\n- PNG/JPEG -> WebP; büyük medyayı isteğe bağlı indir\n- kullanılmayan bağımlılıkları ve kaynakları temizle\n- boyut raporu üret ve CI'da regresyonu izle",
  "weight": 1.0
 },
 {
  "id": "mob-store-yayin-sureci",
  "cat": "Mobil",
  "q": "app store google play yayınlama release inceleme süreci review staged rollout aşamalı dağıtım testflight internal testing sürüm notları store listing imzalama mağaza reddi",
  "title": "App store yayın süreci",
  "a": "Yayın süreci kavramsal olarak benzerdir: imzalı paket üretilir, mağaza konsoluna yüklenir, meta veriler (açıklama, ekran görüntüleri, gizlilik beyanı) doldurulur ve inceleme sürecinden geçilir; Apple incelemesi genellikle daha sıkı ve uzundur. Riski azaltmak için önce dahili/kapalı test kanalları (TestFlight, internal testing), sonra aşamalı dağıtım (staged rollout) kullanılır. Yaygın tuzak: web'deki gibi 'anında düzeltme' yayınlanabileceğini varsaymaktır; inceleme günler sürebilir, bu yüzden kritik davranışlar feature flag ve sunucu yapılandırmasıyla uzaktan kontrol edilebilir tutulmalıdır.",
  "code": null,
  "weight": 1.0
 },
 {
  "id": "mob-guvenlik-temelleri",
  "cat": "Mobil",
  "q": "mobil güvenlik keystore keychain sertifika pinning certificate pinning token saklama root detection jailbreak obfuscation https mitm hassas veri api anahtarı güvenli depolama",
  "title": "Mobil güvenlik temelleri",
  "a": "Temel ilkeler: gizli veriler (token, anahtar) düz depolama yerine donanım destekli Keystore/Keychain'de tutulur, tüm trafik TLS üzerinden akar ve kritik uygulamalarda sertifika pinning ile araya girme (MITM) zorlaştırılır. Uygulama paketi kullanıcının elindedir; içine gömülen API anahtarları tersine mühendislikle çıkarılabilir, bu yüzden asıl sırlar sunucu tarafında kalmalıdır. Yaygın tuzak: pinning'i tek sertifikaya sabitleyip yenileme planı yapmamaktır; sertifika rotasyonunda uygulama toplu şekilde çalışamaz hale gelir.",
  "code": "// Güvenli saklama ve pinning (kavramsal)\ntokenKaydet(token) {\n  keystoreKeychain.yaz(\"auth_token\", token)  // düz dosyaya DEĞİL\n}\n\nagIstemcisi {\n  sertifikaPinleri = [\n    \"sha256/AAAA...\",  // aktif sertifikanın public key hash'i\n    \"sha256/BBBB...\"   // yedek pin: rotasyon planı ŞART\n  ]\n}\n// Kural: uygulamaya gömülen her sır 'ifşa olmuş' sayılır",
  "weight": 1.0
 },
 {
  "id": "mob-responsive-adaptive",
  "cat": "Mobil",
  "q": "responsive adaptive ekran boyutları tablet katlanabilir foldable dp density yoğunluk breakpoint size class constraint layout auto layout uyarlanabilir tasarım yönlendirme",
  "title": "Responsive/adaptive mobil tasarım",
  "a": "Mobil arayüzler piksel yerine yoğunluktan bağımsız birimlerle (dp/pt) ve esnek yerleşimlerle (constraint/auto layout, flex) tasarlanır; adaptive yaklaşımda ise telefon, tablet ve katlanabilir cihazlar için breakpoint/size class'lara göre farklı yerleşimler sunulur. Sistem yazı boyutu ölçekleme, çentik/güvenli alan (safe area) ve yatay yönlendirme de hesaba katılmalıdır. Yaygın tuzak: tek bir telefon ekranına sabit boyutlarla tasarlayıp küçük ekranlarda taşma, büyük ekranlarda boşluk sorunları yaşamaktır.",
  "code": "// Genişliğe göre uyarlanabilir yerleşim (kavramsal)\nekranGenisligi = mevcutGenislikDp()\nwhen {\n  ekranGenisligi < 600  -> tekSutunListe()        // telefon\n  ekranGenisligi < 840  -> listeVeDetayYanYana()  // küçük tablet/katlanabilir\n  else                  -> ucBolmeliYerlesim()    // büyük tablet\n}\n// Kurallar: dp/pt kullan, sabit piksel verme,\n// safe area'ya ve sistem yazı ölçeğine saygı göster",
  "weight": 1.0
 },
 {
  "id": "mob-crash-raporlama",
  "cat": "Mobil",
  "q": "crash raporlama crashlytics sentry crash-free rate stack trace symbolication dsym mapping dosyası hata izleme monitoring breadcrumb anr izleme loglama üretim hatası",
  "title": "Crash raporlama ve izleme",
  "a": "Üretimdeki çökmeleri görmek için crash raporlama araçları (Crashlytics, Sentry vb.) entegre edilir; bunlar stack trace, cihaz/OS bilgisi ve çökme öncesi olay izlerini (breadcrumb) toplayıp hataları gruplar. Sağlıklı takip için sürüm bazlı crash-free kullanıcı oranı izlenir ve ANR gibi donmalar da ayrıca raporlanır. Yaygın tuzak: obfuscation/strip sonrası sembol dosyalarını (mapping.txt / dSYM) yüklememektir; bu durumda stack trace'ler okunamaz hale gelir.",
  "code": "// Crash izleme kurulumu (kavramsal)\ncrashRaporlayiciBaslat(surum = uygulamaSurumu)\n\nkullaniciAksiyonu(\"sepete_ekle\") {\n  izBirak(\"sepete_ekle tıklandı\")     // breadcrumb: bağlam sağlar\n}\n\ntry { odemeyiTamamla() }\ncatch (e: Exception) {\n  yakalananHatayiRaporla(e)           // fatal olmayanları da izle\n}\n// CI: her sürümde mapping.txt / dSYM yüklemeyi unutma!",
  "weight": 1.0
 },
 {
  "id": "iot-mikrodenetleyici-vs-mikroislemci",
  "cat": "Gömülü & IoT",
  "q": "mikrodenetleyici mikroişlemci fark arduino raspberry pi microcontroller microprocessor difference embedded gömülü sistem MCU CPU işletim sistemi seçim",
  "title": "Mikrodenetleyici mi, Mikroişlemci mi? (Arduino vs Raspberry Pi)",
  "a": "Mikrodenetleyici (ör. Arduino'daki ATmega328P veya ESP32), CPU'yu, RAM'i, flash belleği ve çevre birimlerini tek çipte toplar; genellikle işletim sistemi olmadan tek bir programı çalıştırır ve açılışı milisaniyeler sürer. Mikroişlemci tabanlı kartlar (ör. Raspberry Pi) ise Linux gibi tam bir işletim sistemi çalıştırır, çok daha güçlüdür ama daha fazla güç tüketir ve gerçek zamanlı tepki garantisi vermez. Yaygın tuzak: Raspberry Pi'ı hassas zamanlama gerektiren işlerde (ör. mikrosaniye düzeyinde sinyal üretimi) kullanmak; işletim sisteminin zamanlayıcısı araya girip gecikmelere yol açar. Basit sensör/aktüatör kontrolü için mikrodenetleyici, kamera/ağ/veritabanı gibi ağır işler için mikroişlemci tercih edilir.",
  "code": null,
  "weight": 1.0
 },
 {
  "id": "iot-gpio-temelleri",
  "cat": "Gömülü & IoT",
  "q": "GPIO nedir pin giriş çıkış input output pinMode digitalWrite digitalRead pull-up direnç arduino led buton genel amaçlı",
  "title": "GPIO Temelleri: Dijital Giriş/Çıkış Pinleri",
  "a": "GPIO (General Purpose Input/Output), yazılımla giriş veya çıkış olarak yapılandırılabilen dijital pinlerdir; çıkışta HIGH/LOW seviyesi üretir, girişte bu seviyeleri okur. Kullanmadan önce pinin yönü mutlaka ayarlanmalıdır (Arduino'da pinMode). Yaygın tuzak: girişi boşta (floating) bırakmak; bağlı olmayan bir giriş pini rastgele değerler okur, bu yüzden dahili pull-up/pull-down dirençleri kullanılmalıdır. Ayrıca pinlerin akım sınırı vardır (AVR'de pin başına ~20-40 mA); motor gibi yükleri doğrudan pinden sürmek çipi bozabilir.",
  "code": "const int ledPin = 13;\nconst int butonPin = 2;\n\nvoid setup() {\n  pinMode(ledPin, OUTPUT);          // LED pini çıkış\n  pinMode(butonPin, INPUT_PULLUP);  // Dahili pull-up: boşta HIGH okunur\n}\n\nvoid loop() {\n  // Pull-up nedeniyle basılıyken LOW okunur (ters mantık!)\n  digitalWrite(ledPin, digitalRead(butonPin) == LOW ? HIGH : LOW);\n}",
  "weight": 1.0
 },
 {
  "id": "iot-pwm-nedir",
  "cat": "Gömülü & IoT",
  "q": "PWM nedir pulse width modulation darbe genişlik modülasyonu analogWrite duty cycle görev döngüsü led parlaklık motor hız servo frekans",
  "title": "PWM (Darbe Genişlik Modülasyonu) Nedir?",
  "a": "PWM, dijital bir pini çok hızlı açıp kapatarak ortalama gerilimi ayarlama tekniğidir; sinyalin açık kalma oranına görev döngüsü (duty cycle) denir. LED parlaklığı, DC motor hızı ve servo kontrolü gibi işlerde kullanılır. Yaygın tuzak: Arduino'daki analogWrite() fonksiyonunun gerçek analog gerilim ürettiğini sanmak; çıkış hâlâ kare dalgadır, sadece ortalaması değişir. Ayrıca her pin PWM desteklemez (Uno'da yalnızca ~ işaretli 3, 5, 6, 9, 10, 11 numaralı pinler) ve analogWrite değeri 0-255 aralığındadır.",
  "code": "const int ledPin = 9;  // Uno'da PWM destekleyen (~) bir pin\n\nvoid setup() {\n  pinMode(ledPin, OUTPUT);\n}\n\nvoid loop() {\n  // 0-255: %0 ile %100 görev döngüsü arasında parlaklık tara\n  for (int duty = 0; duty <= 255; duty += 5) {\n    analogWrite(ledPin, duty);  // Ortalama gerilim = 5V * duty/255\n    delay(20);\n  }\n}",
  "weight": 1.0
 },
 {
  "id": "iot-analog-dijital-adc",
  "cat": "Gömülü & IoT",
  "q": "analog dijital sinyal fark ADC analogRead çözünürlük resolution 10 bit 12 bit referans gerilim voltage sensör okuma dönüştürücü converter",
  "title": "Analog/Dijital Sinyal ve ADC",
  "a": "Dijital sinyal yalnızca iki seviye (HIGH/LOW) taşırken, analog sinyal sürekli bir gerilim aralığında değer alır; ADC (Analog-Digital Converter) bu sürekli gerilimi sayısal bir değere çevirir. Arduino Uno'nun ADC'si 10 bittir: 0-5V arası 0-1023'e eşlenir, yani çözünürlük yaklaşık 4.9 mV'tur (ESP32'de 12 bit, 0-4095). Yaygın tuzak: ADC değerini doğrudan volt sanmak; gerçek gerilim = okunan değer × referans gerilim / (2^bit - 1) formülüyle hesaplanır. Yüksek empedanslı sensörlerde art arda hızlı okumalar hatalı sonuç verebilir; araya kısa gecikme koymak veya ilk okumayı atmak iyi bir pratiktir.",
  "code": "const int sensorPin = A0;\n\nvoid setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int ham = analogRead(sensorPin);        // 10 bit: 0-1023\n  float volt = ham * (5.0 / 1023.0);      // Ham değeri gerilime çevir\n  Serial.print(\"Gerilim: \");\n  Serial.println(volt, 2);                // 2 ondalık basamak\n  delay(500);\n}",
  "weight": 1.0
 },
 {
  "id": "iot-i2c-spi-uart-karsilastirma",
  "cat": "Gömülü & IoT",
  "q": "I2C SPI UART fark karşılaştırma seri haberleşme protokol comparison SDA SCL MISO MOSI TX RX adres hız kablo sayısı sensör",
  "title": "I2C, SPI ve UART Protokol Karşılaştırması",
  "a": "UART iki cihaz arasında asenkron, iki telli (TX/RX) haberleşmedir; ortak saat yoktur, iki tarafın baud hızı aynı olmalıdır. I2C iki hatla (SDA veri, SCL saat) tek veri yolunda 7 bitlik adreslerle 100'den fazla cihazı destekler ama görece yavaştır (standart 100 kHz, hızlı mod 400 kHz). SPI dört hat (MISO, MOSI, SCK, CS) kullanır, adres yerine her cihaza ayrı CS (chip select) hattı gerekir ama MHz'ler düzeyinde çok daha hızlıdır; SD kart ve ekranlarda tercih edilir. Yaygın tuzaklar: UART'ta TX-TX bağlamak (TX-RX çapraz bağlanmalı), I2C'de pull-up dirençlerini unutmak ve aynı adrese sahip iki cihazı tek veri yoluna takmak.",
  "code": "#include <Wire.h>\n\nvoid setup() {\n  Serial.begin(9600);   // UART: PC ile haberleşme\n  Wire.begin();         // I2C: master olarak başlat\n}\n\nvoid loop() {\n  Wire.beginTransmission(0x48);      // 0x48 adresli cihaza (ör. sıcaklık sensörü)\n  byte hata = Wire.endTransmission(); // 0 dönerse cihaz hatta var\n  Serial.println(hata == 0 ? \"Cihaz bulundu\" : \"Cihaz yok\");\n  delay(1000);\n}",
  "weight": 1.0
 },
 {
  "id": "iot-kesme-vs-polling",
  "cat": "Gömülü & IoT",
  "q": "kesme interrupt polling fark attachInterrupt ISR volatile arduino olay event tetikleme RISING FALLING sorgulama döngü",
  "title": "Kesmeler (Interrupt) vs Polling",
  "a": "Polling'de program bir olayı döngü içinde sürekli sorgular; kesmede ise olay gerçekleştiği anda donanım ana akışı durdurup ISR (kesme servis rutini) adlı kısa fonksiyonu çalıştırır. Kesmeler hızlı ve nadir olaylar için verimlidir; polling basit ama olayı kaçırabilir ve CPU'yu meşgul eder. Yaygın tuzaklar: ISR ile ana kod arasında paylaşılan değişkeni volatile yapmamak (derleyici optimizasyonu güncel değeri gizler) ve ISR içinde delay(), Serial.print() gibi uzun/kesme-bağımlı işlemler çağırmak. ISR olabildiğince kısa tutulmalı, ağır iş ana döngüde yapılmalıdır.",
  "code": "const int butonPin = 2;               // Uno'da kesme destekli pin\nvolatile bool basildi = false;        // ISR ile paylaşılan değişken volatile olmalı\n\nvoid butonISR() {\n  basildi = true;                     // ISR kısa: sadece bayrak kaldır\n}\n\nvoid setup() {\n  pinMode(butonPin, INPUT_PULLUP);\n  attachInterrupt(digitalPinToInterrupt(butonPin), butonISR, FALLING);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  if (basildi) { basildi = false; Serial.println(\"Butona basildi\"); }\n}",
  "weight": 1.0
 },
 {
  "id": "iot-debounce-buton-siciramasi",
  "cat": "Gömülü & IoT",
  "q": "debounce buton sıçraması bounce çoklu tetikleme switch mekanik anahtar millis yazılımsal filtre arduino button titreşim kararlı okuma",
  "title": "Debounce: Buton Sıçraması Sorunu",
  "a": "Mekanik bir buton basıldığında kontaklar birkaç milisaniye boyunca titreşir (bounce) ve tek basış, mikrodenetleyici tarafından onlarca basış gibi okunabilir. Çözüm debounce'tur: okunan değerin belirli bir süre (tipik 20-50 ms) kararlı kalmasını beklemek. Yazılımda millis() ile zaman damgası tutmak en yaygın yöntemdir; donanımda ise RC filtresi kullanılabilir. Yaygın tuzak: delay() ile debounce yapmak; program o sürede tamamen bloke olur ve diğer işler aksar, bu yüzden bloklamayan millis() tabanlı yaklaşım tercih edilmelidir.",
  "code": "const int butonPin = 2;\nint sonKararliDurum = HIGH, sonOkunan = HIGH;\nunsigned long sonDegisim = 0;\nconst unsigned long debounceSuresi = 30;  // ms\n\nvoid loop() {\n  int okunan = digitalRead(butonPin);\n  if (okunan != sonOkunan) sonDegisim = millis();  // Değişim: sayacı sıfırla\n  if (millis() - sonDegisim > debounceSuresi && okunan != sonKararliDurum) {\n    sonKararliDurum = okunan;                      // 30 ms kararlı: kabul et\n    if (okunan == LOW) Serial.println(\"Gecerli basis\");\n  }\n  sonOkunan = okunan;\n}",
  "weight": 1.0
 },
 {
  "id": "iot-watchdog-timer",
  "cat": "Gömülü & IoT",
  "q": "watchdog timer bekçi köpeği zamanlayıcı WDT reset donma kilitleme wdt_enable wdt_reset arduino gömülü güvenilirlik otomatik yeniden başlatma",
  "title": "Watchdog Timer (Bekçi Zamanlayıcı)",
  "a": "Watchdog timer, program tarafından düzenli olarak sıfırlanması gereken bir geri sayım sayacıdır; yazılım donar ve sayaç sıfırlanmazsa süre dolduğunda mikrodenetleyiciyi otomatik resetler. Sahada gözetimsiz çalışan IoT cihazlarında donmaya karşı temel güvenlik ağıdır. Yaygın tuzaklar: watchdog süresinden uzun süren bir işlem (ör. ağ bağlantısı beklemek) sırasında wdt_reset() çağırmayı unutup gereksiz reset döngüsüne girmek ve eski Arduino bootloader'larında WDT resetinin sonsuz reset döngüsü yaratabilmesi. Süre, en uzun meşru işlemden pay bırakacak şekilde seçilmelidir.",
  "code": "#include <avr/wdt.h>\n\nvoid setup() {\n  Serial.begin(9600);\n  wdt_enable(WDTO_2S);   // 2 saniyelik watchdog başlat\n}\n\nvoid loop() {\n  sensorOkuVeGonder();   // Normal işler\n  wdt_reset();           // Sayacı sıfırla: \"hala hayattayim\"\n  // Program donarsa wdt_reset() çağrılamaz,\n  // 2 saniye sonra cihaz otomatik resetlenir.\n}",
  "weight": 1.0
 },
 {
  "id": "iot-bellek-kisitlari",
  "cat": "Gömülü & IoT",
  "q": "gömülü bellek kısıtı RAM flash SRAM EEPROM PROGMEM F makrosu memory constraint arduino string heap fragmentation yığın optimizasyon",
  "title": "Gömülü Sistemlerde Bellek Kısıtları (RAM/Flash)",
  "a": "Mikrodenetleyicilerde bellek çok kısıtlıdır: Arduino Uno'da yalnızca 2 KB SRAM (değişkenler) ve 32 KB flash (program kodu) bulunur. Flash yalnızca yükleme sırasında yazılır; çalışma zamanı verileri SRAM'de yaşar ve taşarsa program sessizce kararsız davranır çünkü çoğu MCU'da işletim sistemi veya bellek koruması yoktur. Yaygın tuzaklar: string sabitlerinin varsayılan olarak SRAM'e kopyalanması (Arduino'da F() makrosu ile flash'ta tutulmalı) ve String sınıfı/malloc kullanımının küçük RAM'de heap parçalanmasına yol açması. Büyük tamponlardan kaçınmak ve statik ayırmayı tercih etmek temel kuraldır.",
  "code": "void setup() {\n  Serial.begin(9600);\n  // KOTU: metin sabiti SRAM'de yer kaplar\n  // Serial.println(\"Cok uzun bir aciklama metni...\");\n\n  // IYI: F() makrosu metni flash'ta tutar, SRAM'i korur\n  Serial.println(F(\"Cok uzun bir aciklama metni...\"));\n\n  // Dinamik String yerine sabit boyutlu char dizisi tercih et\n  char mesaj[32];\n  snprintf(mesaj, sizeof(mesaj), \"Sicaklik: %d C\", 25);\n  Serial.println(mesaj);\n}",
  "weight": 1.0
 },
 {
  "id": "iot-dusuk-guc-modlari",
  "cat": "Gömülü & IoT",
  "q": "düşük güç modu deep sleep uyku modu low power pil ömrü battery esp32 deep light sleep wakeup uyanma güç tüketimi enerji tasarrufu",
  "title": "Düşük Güç Modları (Sleep/Deep Sleep)",
  "a": "Pil ile çalışan IoT cihazlarında işlemci çoğu zaman boştadır; düşük güç modları CPU'yu ve çevre birimlerini uyutarak tüketimi miliamperlerden mikroamperlere düşürür. ESP32'de deep sleep modunda tüketim ~10 µA'ya iner; cihaz zamanlayıcı, GPIO veya dokunmatik pin ile uyandırılabilir. Yaygın tuzak: deep sleep'ten uyanmanın reset gibi davrandığını unutmak; RAM'deki değişkenler kaybolur, program setup()'tan yeniden başlar ve korunacak veri RTC belleğine (RTC_DATA_ATTR) yazılmalıdır. Ayrıca karttaki güç LED'i ve regülatör gibi bileşenler, çip uyusa bile pili tüketebilir.",
  "code": "#define uS_TO_S 1000000ULL\nRTC_DATA_ATTR int uyanmaSayisi = 0;  // RTC bellek: deep sleep'te korunur\n\nvoid setup() {\n  Serial.begin(115200);\n  uyanmaSayisi++;\n  Serial.printf(\"Uyanma no: %d\\n\", uyanmaSayisi);\n  olcumYapVeGonder();\n  esp_sleep_enable_timer_wakeup(60 * uS_TO_S); // 60 sn sonra uyan\n  esp_deep_sleep_start();  // Buradan sonrası çalışmaz; uyanınca setup() yeniden başlar\n}\n\nvoid loop() {}  // Deep sleep kullanıldığında loop'a hiç gelinmez",
  "weight": 1.0
 },
 {
  "id": "iot-sensor-okuma-kalibrasyon",
  "cat": "Gömülü & IoT",
  "q": "sensör okuma kalibrasyon calibration offset gürültü noise ortalama filtreleme map doğrusal eşleme sıcaklık nem ölçüm hata düzeltme",
  "title": "Sensör Okuma ve Kalibrasyon",
  "a": "Ham sensör verisi genellikle gürültülüdür ve gerçek fiziksel değerden bir ofset/kazanç hatasıyla sapar; kalibrasyon, bilinen referans değerlerle bu sapmayı düzeltme işlemidir. En basit yöntem iki noktalı doğrusal kalibrasyondur: ham değerler bilinen alt-üst referanslara eşlenir. Gürültüye karşı çoklu okumanın ortalaması veya medyanı alınır. Yaygın tuzaklar: Arduino'nun map() fonksiyonunun tamsayı aritmetiği yapması nedeniyle hassasiyet kaybı (float dönüşümde kesme yapar) ve sensörün ısınma/oturma süresini beklemeden ilk okumalara güvenmek.",
  "code": "const int sensorPin = A0;\n// Kalibrasyon: bilinen referanslarla ölçülen ham değerler\nconst float hamKuru = 520.0, hamIslak = 210.0;  // ör. toprak nem sensörü\n\nfloat nemYuzdesiOku() {\n  long toplam = 0;\n  for (int i = 0; i < 10; i++) {   // Gürültüyü azaltmak için 10 okuma ortala\n    toplam += analogRead(sensorPin);\n    delay(5);\n  }\n  float ham = toplam / 10.0;\n  // İki noktalı doğrusal kalibrasyon (float ile, map() kullanmadan)\n  float yuzde = (hamKuru - ham) / (hamKuru - hamIslak) * 100.0;\n  return constrain(yuzde, 0.0, 100.0);\n}",
  "weight": 1.0
 },
 {
  "id": "iot-mqtt-protokolu",
  "cat": "Gömülü & IoT",
  "q": "MQTT nedir protokol broker publish subscribe topic yayınla abone ol QoS paho mosquitto IoT haberleşme hafif mesajlaşma retain",
  "title": "MQTT Protokolü ve IoT'deki Rolü",
  "a": "MQTT, IoT için tasarlanmış hafif bir yayınla/abone ol (publish/subscribe) mesajlaşma protokolüdür: cihazlar birbirine değil, merkezi bir broker'a bağlanır ve konu (topic) bazlı mesaj alışverişi yapar. Üç QoS seviyesi vardır: 0 (en fazla bir kez), 1 (en az bir kez, tekrar mümkün), 2 (tam bir kez, en yavaş). Yaygın tuzaklar: QoS 1'de aynı mesajın birden fazla gelebileceğini hesaba katmamak ve retain bayraklı eski bir mesajın yeni abonelere hâlâ iletildiğini unutmak. Konu adlarında + tek seviyeyi, # kalan tüm seviyeleri eşleyen joker karakterlerdir.",
  "code": "import paho.mqtt.client as mqtt\n\ndef mesaj_gelince(client, userdata, msg):\n    # Gelen mesaj: konu ve içerik yazdırılır\n    print(f\"{msg.topic}: {msg.payload.decode()}\")\n\nclient = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)\nclient.on_message = mesaj_gelince\nclient.connect(\"test.mosquitto.org\", 1883)      # Broker'a bağlan\nclient.subscribe(\"ev/salon/sicaklik\", qos=1)     # Konuya abone ol\nclient.publish(\"ev/salon/sicaklik\", \"23.5\", qos=1)  # Veri yayınla\nclient.loop_forever()  # Ağ döngüsü: mesajları dinle",
  "weight": 1.0
 },
 {
  "id": "iot-ota-guncelleme",
  "cat": "Gömülü & IoT",
  "q": "OTA güncelleme over the air firmware update uzaktan yazılım güncelleme esp32 bootloader rollback imza doğrulama partisyon güvenlik",
  "title": "OTA (Over-The-Air) Güncelleme Kavramı",
  "a": "OTA, sahadaki cihazın firmware'ini fiziksel bağlantı olmadan, ağ üzerinden güncelleme yöntemidir; binlerce dağıtık IoT cihazında tek pratik bakım yoludur. Tipik uygulamada flash iki uygulama bölümüne (partition) ayrılır: yeni firmware pasif bölüme yazılır, doğrulanır ve bootloader bir sonraki açılışta oraya geçer; sorun çıkarsa eski sürüme geri dönülür (rollback). Yaygın tuzaklar: güncelleme imza/sağlama (checksum) doğrulaması yapmamak (bozuk veya sahte firmware cihazı tuğlaya çevirebilir) ve OTA sırasında güç kesintisi senaryosunu planlamamak. Bu yüzden 'önce yaz, doğrula, sonra geçiş yap' ilkesi ve watchdog ile birleşik bir geri dönüş mekanizması şarttır.",
  "code": null,
  "weight": 1.0
 },
 {
  "id": "iot-rtos-gercek-zamanli",
  "cat": "Gömülü & IoT",
  "q": "RTOS gerçek zamanlı işletim sistemi FreeRTOS task görev scheduler zamanlayıcı öncelik priority deadline hard soft real time esp32",
  "title": "Gerçek Zamanlı Sistemler ve RTOS",
  "a": "Gerçek zamanlı sistemde doğruluk yalnızca sonuca değil, sonucun zamanında üretilmesine de bağlıdır: hard real-time'da süre aşımı felakettir (hava yastığı), soft real-time'da kalite düşer (video akışı). RTOS (ör. FreeRTOS), işi bağımsız görevlere (task) böler ve öncelik tabanlı bir zamanlayıcıyla en yüksek öncelikli hazır görevi çalıştırır; ESP32'nin Arduino çekirdeği zaten FreeRTOS üstünde koşar. Yaygın tuzaklar: gerçek zamanlıyı 'hızlı' sanmak (asıl mesele öngörülebilirlik/determinizmdir), bir görevde vTaskDelay yerine meşgul bekleme yapıp düşük öncelikli görevleri açlığa mahkûm etmek ve paylaşılan verilere mutex olmadan erişmek.",
  "code": "// ESP32 (Arduino çekirdeği FreeRTOS üstünde çalışır)\nvoid ledGorevi(void *param) {\n  for (;;) {\n    digitalWrite(2, !digitalRead(2));   // LED'i tersle\n    vTaskDelay(pdMS_TO_TICKS(500));     // 500 ms: CPU'yu diğer görevlere bırak\n  }\n}\n\nvoid setup() {\n  pinMode(2, OUTPUT);\n  // Görev oluştur: fonksiyon, ad, yığın (byte), parametre, öncelik, tutamaç\n  xTaskCreate(ledGorevi, \"led\", 2048, NULL, 1, NULL);\n}\n\nvoid loop() { /* loop da düşük öncelikli bir FreeRTOS görevidir */ }",
  "weight": 1.0
 },
 {
  "id": "game-oyun-dongusu-delta-time",
  "cat": "Oyun Geliştirme",
  "q": "oyun döngüsü game loop delta time requestAnimationFrame update render kare zaman farkı fixed timestep döngü tick fps zamanlama",
  "title": "Oyun Döngüsü ve Delta Time",
  "a": "Oyun döngüsü her karede girdiyi okur, oyun durumunu günceller ve ekrana çizer; delta time ise iki kare arasında geçen süredir ve güncellemeleri gerçek zamana bağlar. Milisaniyeyi saniyeye çevirmeyi unutmak klasik bir hatadır. Yaygın tuzak: sekme arka plana alınınca dönen dev delta değerleri fiziği patlatır — delta'yı üst sınırla kırpın veya fizik için sabit zaman adımı (fixed timestep) kullanın.",
  "code": "let son = performance.now();\nfunction dongu(simdi) {\n  // milisaniyeyi saniyeye cevir\n  let dt = (simdi - son) / 1000;\n  son = simdi;\n  dt = Math.min(dt, 0.1); // sekme donusundeki dev sicramayi kirp\n  guncelle(dt); // once mantik\n  ciz();        // sonra cizim\n  requestAnimationFrame(dongu);\n}\nrequestAnimationFrame(dongu);",
  "weight": 1.0
 },
 {
  "id": "game-kare-hizindan-bagimsiz-hareket",
  "cat": "Oyun Geliştirme",
  "q": "kare hızından bağımsız hareket frame rate independent movement delta time çarpma hız fps lerp yumuşatma smoothing 60fps 144hz",
  "title": "Kare Hızından Bağımsız Hareket",
  "a": "Hızı 'kare başına piksel' yerine 'saniye başına piksel' olarak tanımlayıp her karede delta time ile çarparsanız oyun 30 FPS'te de 144 FPS'te de aynı hızda oynanır. Yaygın tuzak: her karede sabit oranlı lerp (örn. x += (hedef - x) * 0.1) yapmak kare hızına bağlıdır; yüksek FPS'te yumuşatma hızlanır. Üstel form olan 1 - Math.pow(k, dt) ile bu da zamandan bağımsız hale gelir.",
  "code": "// YANLIS: x += 5;              -> 144 Hz ekranda 2.4 kat hizli\n// DOGRU: hiz saniye cinsinden tanimlanir\nconst hiz = 300; // piksel/saniye\nfunction guncelle(dt) {\n  x += hiz * dt; // her donanimda ayni hiz\n  // kare hizindan bagimsiz yumusatma (lerp):\n  const t = 1 - Math.pow(0.001, dt);\n  kameraX += (x - kameraX) * t;\n}",
  "weight": 1.0
 },
 {
  "id": "game-carpisma-algilama-aabb-daire",
  "cat": "Oyun Geliştirme",
  "q": "çarpışma algılama collision detection AABB bounding box daire circle kesişim overlap intersect hitbox tünelleme tunneling mesafe",
  "title": "Çarpışma Algılama: AABB ve Daire",
  "a": "AABB (eksen hizalı sınırlayıcı kutu) testi iki dikdörtgenin her eksende örtüşüp örtüşmediğine bakar; daire testi ise merkezler arası mesafeyi yarıçaplar toplamıyla karşılaştırır. Performans için Math.sqrt çağırmak yerine karelerini karşılaştırın. Yaygın tuzak: çok hızlı nesneler bir karede ince duvarın öte yanına 'ışınlanıp' çarpışmayı atlar (tünelleme); çözüm sürekli çarpışma testi veya hareketi alt adımlara bölmektir.",
  "code": "function aabbCarpisma(a, b) { // a,b: {x, y, w, h}\n  return a.x < b.x + b.w && a.x + a.w > b.x &&\n         a.y < b.y + b.h && a.y + a.h > b.y;\n}\nfunction daireCarpisma(a, b) { // a,b: {x, y, r}\n  const dx = a.x - b.x, dy = a.y - b.y;\n  const rToplam = a.r + b.r;\n  // sqrt yerine karelerle karsilastir: daha hizli\n  return dx * dx + dy * dy < rToplam * rToplam;\n}",
  "weight": 1.0
 },
 {
  "id": "game-sprite-ve-atlas",
  "cat": "Oyun Geliştirme",
  "q": "sprite atlas texture atlas spritesheet doku kare animasyon draw call batching kırpma padding bleeding kaynak dikdörtgen",
  "title": "Sprite ve Texture Atlas",
  "a": "Sprite, ekranda çizilen 2B görsel birimdir; atlas ise birçok sprite'ı tek büyük dokuda toplayarak GPU'nun doku değiştirme ve draw call sayısını azaltır, bu da performansı ciddi artırır. Her kare, atlas içindeki bir kaynak dikdörtgeniyle tanımlanır. Yaygın tuzak: kareler bitişik paketlenirse ölçekleme/filtreleme sırasında komşu pikseller sızar (texture bleeding); kareler arasına padding veya kenar uzatma (extrusion) ekleyin.",
  "code": "const atlas = new Image();\natlas.src = \"atlas.png\"; // tum kareler tek resimde\nconst kareler = { // atlas icindeki kaynak dikdortgenleri\n  yuru0: { sx: 0,  sy: 0, sw: 32, sh: 32 },\n  yuru1: { sx: 34, sy: 0, sw: 32, sh: 32 } // 2px padding\n};\nfunction spriteCiz(ctx, ad, dx, dy) {\n  const k = kareler[ad];\n  ctx.drawImage(atlas, k.sx, k.sy, k.sw, k.sh, dx, dy, k.sw, k.sh);\n}",
  "weight": 1.0
 },
 {
  "id": "game-ecs-vs-kalitim",
  "cat": "Oyun Geliştirme",
  "q": "ECS entity component system kalıtım inheritance bileşim composition varlık bileşen sistem veri odaklı data oriented mimari cache",
  "title": "ECS ve Kalıtım Karşılaştırması",
  "a": "Kalıtım hiyerarşilerinde 'UçanYüzenDüşman' gibi kombinasyonlar sınıf ağacını patlatır; ECS'te varlık sadece bir kimliktir, davranış bileşenlerin (veri) sistemlerce (mantık) işlenmesiyle oluşur. Bileşenler bellekte ardışık tutulduğunda CPU önbelleği verimli kullanılır. Yaygın tuzak: küçük bir oyuna tam teşekküllü ECS kurmak gereksiz karmaşıklıktır; çoğu zaman basit bileşim (composition) yeterlidir.",
  "code": "// Kalitim yerine bilesim: varlik = kimlik, veri bilesenlerde\nconst konumlar = new Map(), hizlar = new Map();\nlet sonId = 0;\nconst varlikOlustur = () => ++sonId;\nconst e = varlikOlustur();\nkonumlar.set(e, { x: 0, y: 0 });\nhizlar.set(e, { x: 50, y: 0 });\nfunction hareketSistemi(dt) { // iki bileseni de olanlari isler\n  for (const [id, h] of hizlar) {\n    const k = konumlar.get(id);\n    if (k) { k.x += h.x * dt; k.y += h.y * dt; }\n  }\n}",
  "weight": 1.0
 },
 {
  "id": "game-durum-makinesi",
  "cat": "Oyun Geliştirme",
  "q": "durum makinesi state machine FSM finite state oyun durumu geçiş transition enter exit AI davranış menü duraklat",
  "title": "Oyun Durum Makinesi (FSM)",
  "a": "Durum makinesi; menü/oyun/duraklama gibi oyun akışını veya bekle/koş/zıpla gibi karakter davranışını, her an tek bir aktif durum ve tanımlı geçişlerle yönetir. Her duruma giriş (enter) ve çıkış (exit) kancaları eklemek animasyon başlatma ve temizlik işlerini düzenler. Yaygın tuzak: durumları dev bir if/else ve boolean bayrak yığınıyla yönetmek; bayraklar çelişince 'hem ölü hem zıplayan' karakter gibi tutarsız durumlar doğar.",
  "code": "class DurumMakinesi {\n  constructor(durumlar, ilk) {\n    this.durumlar = durumlar; this.aktif = ilk;\n    durumlar[ilk].gir?.();\n  }\n  gecis(yeni) {\n    this.durumlar[this.aktif].cik?.(); // eski durumu temizle\n    this.aktif = yeni;\n    this.durumlar[yeni].gir?.(); // yeni durumu baslat\n  }\n  guncelle(dt) { this.durumlar[this.aktif].guncelle?.(dt); }\n}",
  "weight": 1.0
 },
 {
  "id": "game-pathfinding-a-star",
  "cat": "Oyun Geliştirme",
  "q": "pathfinding yol bulma A* a star algoritması heuristic sezgisel grid graf en kısa yol dijkstra manhattan öklid navigasyon",
  "title": "A* ile Yol Bulma (Kavramsal)",
  "a": "A*, her düğümü f = g + h skoruyla değerlendirir: g başlangıçtan o düğüme kadar ödenen gerçek maliyet, h ise hedefe kalan maliyetin sezgisel (heuristic) tahminidir; en düşük f'li düğüm bir öncelik kuyruğundan seçilerek genişletilir. h = 0 olursa A* Dijkstra'ya dönüşür. Yaygın tuzak: sezgisel gerçek maliyeti aşarsa (admissible değilse) A* en kısa yolu garanti etmez; 4 yönlü gridde Manhattan, serbest harekette Öklid mesafesi güvenli seçimlerdir.",
  "code": "// Kabul edilebilir (admissible) sezgisel: gercek maliyeti ASMAMALI\nfunction manhattan(a, b) { // 4 yonlu grid icin ideal\n  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);\n}\nfunction oklid(a, b) { // her yone serbest hareket icin\n  return Math.hypot(a.x - b.x, a.y - b.y);\n}\n// A* skoru: f = g (odenen maliyet) + h (hedefe tahmin)\nconst f = (dugum, hedef) => dugum.g + manhattan(dugum, hedef);",
  "weight": 1.0
 },
 {
  "id": "game-fizik-temelleri",
  "cat": "Oyun Geliştirme",
  "q": "oyun fiziği physics hız velocity ivme acceleration yerçekimi gravity euler entegrasyon integration zıplama platform düşme",
  "title": "Oyun Fiziği: Hız, İvme, Yerçekimi",
  "a": "Temel model: ivme hızı, hız da konumu değiştirir; yerçekimi düşey hıza her karede eklenen sabit bir ivmedir. Önce hızı sonra konumu güncelleyen yarı-örtük (semi-implicit) Euler, oyunlarda standarttır çünkü ters sıralı naif Euler'e göre daha kararlıdır. Yaygın tuzak: zemine çarpınca düşey hızı sıfırlamayı unutmak; yerçekimi birikmeye devam eder ve karakter zemine 'yapışıp' titrer veya içinden geçer.",
  "code": "const YERCEKIMI = 1800; // piksel/s^2 (oyuna gore olcekle)\nfunction fizikGuncelle(o, dt) {\n  // yari-ortuk Euler: ONCE hiz, SONRA konum\n  o.hizY += YERCEKIMI * dt;\n  o.x += o.hizX * dt;\n  o.y += o.hizY * dt;\n  if (o.y >= ZEMIN) { // zemin carpismasi\n    o.y = ZEMIN;\n    o.hizY = 0; // sifirlamazsan yercekimi birikir!\n  }\n}",
  "weight": 1.0
 },
 {
  "id": "game-nesne-havuzu",
  "cat": "Oyun Geliştirme",
  "q": "nesne havuzu object pooling pool mermi bullet parçacık particle GC garbage collection performans yeniden kullanım instantiate destroy takılma",
  "title": "Nesne Havuzu (Object Pooling)",
  "a": "Mermi ve parçacık gibi sık doğup ölen nesneleri her seferinde oluşturup yok etmek, çöp toplayıcıyı (GC) tetikleyip kare atlatan takılmalara yol açar; havuz deseni nesneleri önceden ayırır ve kullanılıp bırakılınca geri dönüştürür. Unity'de Instantiate/Destroy yerine havuz kullanmak yaygın bir optimizasyondur. Yaygın tuzak: havuzdan alınan nesnenin eski durumunu (konum, can, hız) sıfırlamayı unutmak; 'hayalet' davranışlar buradan çıkar.",
  "code": "class MermiHavuzu {\n  constructor(boyut) {\n    this.bos = Array.from({ length: boyut }, () => new Mermi());\n  }\n  al(x, y) {\n    const m = this.bos.pop() ?? new Mermi(); // havuz bosalirsa buyut\n    m.sifirla(x, y); // ESKI DURUMU MUTLAKA TEMIZLE\n    m.aktif = true;\n    return m;\n  }\n  birak(m) { m.aktif = false; this.bos.push(m); }\n}",
  "weight": 1.0
 },
 {
  "id": "game-ses-ve-miksaj",
  "cat": "Oyun Geliştirme",
  "q": "oyun sesi audio miksaj mixing Web Audio API gain bus müzik efekt sfx ses seviyesi volume clipping autoplay kanal",
  "title": "Oyun Sesleri ve Miksaj Temelleri",
  "a": "Sesleri müzik ve efekt gibi ayrı bus'lara (GainNode) yönlendirmek, kullanıcıya bağımsız ses seviyesi ayarı sunmayı ve toplu susturmayı kolaylaştırır. Aynı anda çalan çok sayıda ses toplandığında sinyal 1.0'ı aşıp kırpılma (clipping) ve cızırtı üretir; bus kazançlarını düşük tutun veya compressor ekleyin. Yaygın tuzak: tarayıcılar kullanıcı etkileşimi olmadan sesi engeller; AudioContext'i ilk tıklamada oluşturun veya resume() edin.",
  "code": "// AudioContext'i ilk kullanici tiklamasinda olustur (autoplay engeli)\nconst ses = new AudioContext();\nconst muzikBus = ses.createGain();\nconst efektBus = ses.createGain();\nmuzikBus.gain.value = 0.4; // toplam 1.0'i asip kirpilmasin\nefektBus.gain.value = 0.7;\nmuzikBus.connect(ses.destination);\nefektBus.connect(ses.destination);\n// bir efekt calarken: kaynak.connect(efektBus)",
  "weight": 1.0
 },
 {
  "id": "game-tile-map",
  "cat": "Oyun Geliştirme",
  "q": "tile map tilemap karo harita grid tileset katman layer indeks satır sütun Tiled seviye tasarımı culling render",
  "title": "Tile Map Sistemleri",
  "a": "Tile map, seviyeyi küçük karoların (tile) grid üzerinde tekrarıyla kurar; harita genellikle tek boyutlu bir dizide satır-öncelikli tutulur ve hücreye indeks = y * genişlik + x ile erişilir. Karo görselleri bir tileset/atlas'tan çizilir, çarpışma da aynı gridden okunabilir. Yaygın tuzak: x ile y'yi indeks formülünde ters yazmak (x * genişlik + y) haritayı sessizce bozar; ayrıca tüm haritayı değil sadece kameradaki karoları çizin.",
  "code": "// harita: satir-oncelikli tek boyutlu dizi, 0 = bos\nfunction haritayiCiz(harita, genislikTile, tileBoy) {\n  const yukseklikTile = harita.length / genislikTile;\n  for (let y = 0; y < yukseklikTile; y++) {\n    for (let x = 0; x < genislikTile; x++) {\n      const id = harita[y * genislikTile + x]; // dikkat: y * genislik + x\n      if (id !== 0) karoCiz(id, x * tileBoy, y * tileBoy);\n    }\n  }\n}",
  "weight": 1.0
 },
 {
  "id": "game-kamera-viewport",
  "cat": "Oyun Geliştirme",
  "q": "kamera camera viewport takip follow scroll dünya koordinatı ekran koordinatı world to screen clamp sınır jitter titreme",
  "title": "Kamera ve Viewport",
  "a": "Kamera, dünya koordinatlarından ekran koordinatlarına bir kaydırmadır: nesneler (dünyaKonumu - kameraKonumu) noktasına çizilir, viewport ise dünyanın ekranda görünen penceresidir. Kamerayı harita sınırlarına kenetlemek (clamp) kenarlarda boşluk görünmesini önler. Yaygın tuzak: kamerayı kesirli piksel konumlarında bırakmak piksel-art oyunlarda titremeye (jitter) yol açar; çizim öncesi konumu tam sayıya yuvarlayın.",
  "code": "function kameraGuncelle() {\n  // oyuncuyu ortala, sonra harita sinirlarina kenetle\n  kamX = Math.max(0, Math.min(oyuncu.x - ekranW / 2, haritaW - ekranW));\n  kamY = Math.max(0, Math.min(oyuncu.y - ekranH / 2, haritaH - ekranH));\n}\nfunction ciz(ctx) {\n  ctx.save();\n  ctx.translate(-Math.round(kamX), -Math.round(kamY)); // yuvarla: titreme onlenir\n  dunyayiCiz(ctx); // nesneler dunya koordinatiyla cizilir\n  ctx.restore();\n}",
  "weight": 1.0
 },
 {
  "id": "game-kayit-sistemleri",
  "cat": "Oyun Geliştirme",
  "q": "oyun kaydetme save system serileştirme serialization JSON localStorage sürüm version migration yükleme load checkpoint kayıt dosyası",
  "title": "Oyun Kaydetme Sistemleri",
  "a": "Kayıt sistemi oyun durumunu (seviye, envanter, ilerleme) JSON gibi bir biçime serileştirip diske veya localStorage'a yazar; türetilebilir verileri (örn. toplam hasar istatistiği yerine ekipmandan hesaplanan değerler) kaydetmeyin, yeniden hesaplayın. Yaygın tuzak: kayda sürüm numarası koymamak; oyun güncellenince eski kayıtlar açılamaz olur. Ayrıca JSON.stringify döngüsel referansları ve Map/Set'i olduğu gibi yazamaz, düz veri yapısına çevirin.",
  "code": "const SURUM = 2;\nfunction kaydet(oyun) {\n  const veri = { surum: SURUM, seviye: oyun.seviye,\n                 altin: oyun.altin, envanter: [...oyun.envanter] };\n  localStorage.setItem(\"kayit\", JSON.stringify(veri));\n}\nfunction yukle() {\n  const veri = JSON.parse(localStorage.getItem(\"kayit\") ?? \"null\");\n  if (!veri) return null;\n  if (veri.surum < 2) veri.envanter ??= []; // eski kaydi tasi (migrate)\n  return veri;\n}",
  "weight": 1.0
 },
 {
  "id": "game-motor-secimi",
  "cat": "Oyun Geliştirme",
  "q": "oyun motoru seçimi game engine Unity Godot Unreal karşılaştırma comparison C# GDScript C++ Blueprint 2D 3D indie lisans",
  "title": "Motor Seçimi: Unity, Godot, Unreal",
  "a": "Unity C# kullanır; devasa ekosistemi, asset store'u ve mobil/çoklu platform desteğiyle geniş bir orta yoldur. Godot açık kaynaklıdır (MIT), hafiftir, GDScript ve C# destekler ve özellikle 2D'de çok güçlüdür; Unreal ise C++ ve görsel Blueprint'leriyle üst düzey 3D grafik ve AAA ölçeğinde öne çıkar, belirli bir gelir eşiğini aşan oyunlardan telif payı alır. Yaygın tuzak: motoru popülerliğe göre seçmek; doğru ölçüt projenin türü (2D/3D), hedef platform, ekibin bildiği dil ve lisans/maliyet modelidir — küçük 2D oyun için Unreal genellikle gereksiz ağırlıktır.",
  "code": null,
  "weight": 1.0
 }
];
