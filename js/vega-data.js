/* =========================================================
   VEGA-7.5B-Code — Gerçek Bilgi Tabanı ve Eğitim Verisi
   Tüm içerik doğrulanmış, gerçek teknik bilgidir.
   ========================================================= */

/* Kategori aileleri: bilgi ağı renkleri ve nöral niyet sınıflandırıcısının
   etiketleri bu sabit listeden gelir (sıra sabittir — renk döngüsü yok) */
const VEGA_FAMILIES = [
  ["Diller",     ["JavaScript", "TypeScript", "Python", "Go", "Rust", "Java",
                  "C/C++"],                                                     "#8b7cff"],
  ["Frontend",   ["React", "CSS", "HTML", "Web",
                  "Erişilebilirlik & Performans"],                              "#22d3ee"],
  ["Backend",    ["Node.js", "Backend", "Veritabanı", "Ağ", "DevOps", "Linux",
                  "İşletim Sistemi", "Sistem Tasarımı", "Konteyner & Bulut",
                  "İleri SQL"],                                                 "#34d399"],
  ["Algoritma",  ["Algoritmalar", "Veri Yapıları", "Kavramlar", "Matematik"],   "#fbbf24"],
  ["Yapay Zekâ", ["Yapay Zeka"],                                                "#f472b6"],
  ["Güvenlik",   ["Güvenlik"],                                                  "#fb7185"],
  ["Araçlar",    ["Git", "Araçlar", "Tasarım", "Test"],                         "#60a5fa"],
  ["Uygulamalı", ["Mobil", "Gömülü & IoT", "Oyun Geliştirme", "Veri Bilimi"],   "#fb923c"],
  ["Öğretilen",  ["Öğretilen"],                                                 "#a3e635"]
];

const VEGA_KNOWLEDGE = [
  // ---------- JAVASCRIPT ----------
  {
    id: "js-closure", cat: "JavaScript", weight: 1.0,
    q: "closure nedir javascript kapanış fonksiyon scope kapsam",
    title: "JavaScript'te Closure (Kapanış)",
    a: "Closure, bir fonksiyonun tanımlandığı sözcüksel kapsamı (lexical scope) 'hatırlamasıdır'. İç fonksiyon, dış fonksiyon çalışması bitse bile dış fonksiyonun değişkenlerine erişmeye devam eder.",
    code: `function sayac() {
  let deger = 0;              // dış kapsamda özel değişken
  return function () {
    deger += 1;               // closure sayesinde erişilebilir
    return deger;
  };
}
const artir = sayac();
artir(); // 1
artir(); // 2  — 'deger' dışarıdan erişilemez, kapsülleme sağlar`
  },
  {
    id: "js-promise", cat: "JavaScript", weight: 1.0,
    q: "promise async await asenkron nedir then catch javascript",
    title: "Promise ve async/await",
    a: "Promise, gelecekte tamamlanacak bir işlemin sonucunu temsil eder; pending → fulfilled/rejected durumlarına geçer. async/await, Promise zincirlerini senkron görünümlü koda çevirir. await yalnızca async fonksiyon (veya modül üst seviyesi) içinde kullanılır.",
    code: `async function veriGetir(url) {
  try {
    const yanit = await fetch(url);
    if (!yanit.ok) throw new Error("HTTP " + yanit.status);
    return await yanit.json();
  } catch (hata) {
    console.error("İstek başarısız:", hata);
    throw hata;
  }
}`
  },
  {
    id: "js-event-loop", cat: "JavaScript", weight: 1.0,
    q: "event loop olay döngüsü microtask macrotask setTimeout nasıl çalışır",
    title: "Event Loop (Olay Döngüsü)",
    a: "JavaScript tek iş parçacıklıdır. Event loop; call stack boşaldığında önce microtask kuyruğunu (Promise callback'leri, queueMicrotask) TAMAMEN boşaltır, sonra bir macrotask (setTimeout, I/O) çalıştırır. Bu yüzden Promise.then, setTimeout(fn, 0)'dan önce çalışır.",
    code: `console.log("1");
setTimeout(() => console.log("4 (macrotask)"), 0);
Promise.resolve().then(() => console.log("3 (microtask)"));
console.log("2");
// Çıktı sırası: 1, 2, 3, 4`
  },
  {
    id: "js-var-let", cat: "JavaScript", weight: 1.0,
    q: "var let const farkı hoisting blok kapsam değişken tanımlama",
    title: "var, let ve const Farkları",
    a: "var fonksiyon kapsamlıdır ve hoisting ile undefined olarak yukarı taşınır. let/const blok kapsamlıdır ve tanımdan önce erişim ReferenceError verir (temporal dead zone). const yeniden atamayı engeller ama nesnenin içeriği değişebilir. Modern kodda varsayılan const, gerekirse let kullanın.",
    code: `if (true) {
  var a = 1;   // fonksiyon kapsamı — dışarıdan görünür
  let b = 2;   // blok kapsamı — dışarıda ReferenceError
  const c = [1, 2];
  c.push(3);   // geçerli: içerik değişebilir
  // c = [];   // TypeError: yeniden atama yasak
}`
  },
  {
    id: "js-arrow", cat: "JavaScript", weight: 1.0,
    q: "arrow function ok fonksiyonu this bağlamı fark",
    title: "Arrow Function ve this",
    a: "Ok fonksiyonlarının kendi this, arguments ve super bağlamı yoktur; this'i tanımlandıkları kapsamdan sözcüksel olarak alırlar. Bu yüzden nesne metotlarında ve constructor olarak kullanılmazlar, ama callback'lerde this kaybını önlerler.",
    code: `class Zamanlayici {
  saniye = 0;
  basla() {
    setInterval(() => {
      this.saniye++;      // ok fonksiyonu this'i sınıftan alır
    }, 1000);
  }
}`
  },
  {
    id: "js-map-filter", cat: "JavaScript", weight: 1.0,
    q: "map filter reduce dizi array metodları fonksiyonel",
    title: "map / filter / reduce",
    a: "map her öğeyi dönüştürür ve aynı uzunlukta yeni dizi döner. filter koşulu sağlayanları seçer. reduce diziyi tek bir değere indirger (toplam, nesne, gruplama). Hiçbiri orijinal diziyi değiştirmez.",
    code: `const sayilar = [1, 2, 3, 4, 5];
const kareler  = sayilar.map(n => n * n);        // [1,4,9,16,25]
const ciftler  = sayilar.filter(n => n % 2 === 0); // [2,4]
const toplam   = sayilar.reduce((acc, n) => acc + n, 0); // 15`
  },
  {
    id: "js-debounce", cat: "JavaScript", weight: 1.0,
    q: "debounce throttle performans arama input optimizasyon",
    title: "Debounce ve Throttle",
    a: "Debounce, olaylar durduktan sonra belirli süre geçince fonksiyonu bir kez çalıştırır (arama kutusu için ideal). Throttle, fonksiyonun en fazla belirli aralıkta bir kez çalışmasını garanti eder (scroll/resize için ideal).",
    code: `function debounce(fn, ms) {
  let zamanlayici;
  return function (...args) {
    clearTimeout(zamanlayici);
    zamanlayici = setTimeout(() => fn.apply(this, args), ms);
  };
}
input.addEventListener("input", debounce(ara, 300));`
  },
  {
    id: "js-deep-copy", cat: "JavaScript", weight: 1.0,
    q: "deep copy shallow copy derin kopya nesne klonlama structuredClone",
    title: "Derin Kopya (Deep Copy)",
    a: "Spread (...) ve Object.assign yüzeysel kopyalar; iç içe nesneler referans olarak paylaşılır. Modern derin kopya için structuredClone kullanın — Date, Map, Set ve döngüsel referansları destekler. JSON.parse(JSON.stringify(x)) fonksiyonları, undefined'ı ve Date tiplerini bozar.",
    code: `const orijinal = { ad: "Vega", ayar: { tema: "koyu" } };
const kopya = structuredClone(orijinal);
kopya.ayar.tema = "açık";
console.log(orijinal.ayar.tema); // "koyu" — etkilenmedi`
  },

  // ---------- PYTHON ----------
  {
    id: "py-list-comp", cat: "Python", weight: 1.0,
    q: "list comprehension liste üreteci python kısa döngü",
    title: "Python List Comprehension",
    a: "List comprehension, döngü + koşul + dönüşümü tek satırda ifade eder ve genellikle eşdeğer for döngüsünden hızlıdır. Dict ve set comprehension da aynı sözdizimini kullanır. İç içe geçmiş 2+ seviye okunabilirliği düşürür; o durumda klasik döngü tercih edin.",
    code: `kareler = [n * n for n in range(10) if n % 2 == 0]
# [0, 4, 16, 36, 64]
sozluk = {kelime: len(kelime) for kelime in ["vega", "ai"]}
# {"vega": 4, "ai": 2}`
  },
  {
    id: "py-gil", cat: "Python", weight: 1.0,
    q: "gil global interpreter lock thread multiprocessing paralel python",
    title: "GIL (Global Interpreter Lock)",
    a: "CPython'da GIL, aynı anda yalnızca bir iş parçacığının Python bytecode çalıştırmasına izin verir. CPU-yoğun işlerde threading hız kazandırmaz; multiprocessing (ayrı süreçler) kullanın. I/O-yoğun işlerde (ağ, disk) threading ve asyncio etkilidir çünkü GIL beklerken serbest bırakılır. Python 3.13 ile deneysel free-threaded (GIL'siz) derleme geldi.",
    code: `from multiprocessing import Pool

def agir_hesap(n):
    return sum(i * i for i in range(n))

if __name__ == "__main__":
    with Pool() as havuz:                # CPU çekirdeklerini kullanır
        sonuclar = havuz.map(agir_hesap, [10**6] * 8)`
  },
  {
    id: "py-decorator", cat: "Python", weight: 1.0,
    q: "decorator dekoratör wraps fonksiyon sarmalama python",
    title: "Python Decorator",
    a: "Decorator, bir fonksiyonu alıp davranışını genişleten fonksiyondur; @isim sözdizimiyle uygulanır. functools.wraps kullanmak, sarmalanan fonksiyonun adını ve docstring'ini korur — loglama, önbellek, yetki kontrolü için standarttır.",
    code: `import functools, time

def sure_olc(fn):
    @functools.wraps(fn)
    def sarmal(*args, **kwargs):
        t0 = time.perf_counter()
        sonuc = fn(*args, **kwargs)
        print(f"{fn.__name__}: {time.perf_counter() - t0:.4f}s")
        return sonuc
    return sarmal

@sure_olc
def isle(veri):
    return sorted(veri)`
  },
  {
    id: "py-generator", cat: "Python", weight: 1.0,
    q: "generator yield üreteç bellek lazy tembel python",
    title: "Generator ve yield",
    a: "Generator'lar değerleri tembel (lazy) üretir: tüm diziyi belleğe almak yerine her seferinde bir değer verir. Büyük dosya okuma ve sonsuz diziler için idealdir. yield fonksiyonun durumunu dondurur; next çağrısında kaldığı yerden sürer.",
    code: `def fibonacci():
    a, b = 0, 1
    while True:          # sonsuz ama bellek dostu
        yield a
        a, b = b, a + b

from itertools import islice
print(list(islice(fibonacci(), 8)))  # [0,1,1,2,3,5,8,13]`
  },
  {
    id: "py-mutable-default", cat: "Python", weight: 1.0,
    q: "mutable default argument varsayılan parametre liste hata tuzak python",
    title: "Değiştirilebilir Varsayılan Parametre Tuzağı",
    a: "Varsayılan parametre değerleri fonksiyon TANIMLANIRKEN bir kez oluşturulur. def f(x, liste=[]) yazarsanız tüm çağrılar AYNI listeyi paylaşır — Python'un en klasik hatasıdır. Çözüm: None kullanıp içeride oluşturmak.",
    code: `# HATALI
def ekle(oge, liste=[]):
    liste.append(oge)
    return liste
ekle(1); ekle(2)   # [1, 2] — beklenmedik paylaşım!

# DOĞRU
def ekle(oge, liste=None):
    if liste is None:
        liste = []
    liste.append(oge)
    return liste`
  },
  {
    id: "py-venv", cat: "Python", weight: 1.0,
    q: "virtual environment sanal ortam venv pip bağımlılık",
    title: "Sanal Ortam (venv)",
    a: "Sanal ortam, proje bağımlılıklarını sistem Python'undan izole eder; farklı projelerin farklı paket sürümleri çakışmaz. python -m venv ile oluşturulur, requirements.txt veya pyproject.toml ile bağımlılıklar sabitlenir.",
    code: `python -m venv .venv
source .venv/bin/activate      # Windows: .venv\\Scripts\\activate
pip install requests
pip freeze > requirements.txt  # sürümleri sabitle`
  },

  // ---------- ALGORİTMALAR & VERİ YAPILARI ----------
  {
    id: "algo-big-o", cat: "Algoritmalar", weight: 1.0,
    q: "big o notasyonu karmaşıklık analiz zaman complexity",
    title: "Big-O Notasyonu",
    a: "Big-O, girdi büyüdükçe algoritmanın çalışma süresinin nasıl büyüdüğünü ifade eder. Yaygın sınıflar hızlıdan yavaşa: O(1) sabit, O(log n) ikili arama, O(n) doğrusal tarama, O(n log n) verimli sıralama (merge/quick sort ortalaması), O(n²) iç içe döngü, O(2ⁿ) üstel. Sabit çarpanlar yazılmaz: O(3n) = O(n).",
    code: `# O(n²) — iç içe döngü
for i in dizi:
    for j in dizi: ...

# O(n log n) — verimli sıralama
sorted(dizi)

# O(1) — hash tablosu erişimi
sozluk["anahtar"]`
  },
  {
    id: "algo-binary-search", cat: "Algoritmalar", weight: 1.0,
    q: "binary search ikili arama sıralı dizi logaritmik",
    title: "İkili Arama (Binary Search)",
    a: "Sıralı dizide arama alanını her adımda ikiye böler; O(log n) karmaşıklıkla çalışır. 1 milyar öğede en fazla ~30 karşılaştırma yapar. Dikkat: dizi mutlaka sıralı olmalı ve orta nokta hesabında (low+high) taşmasına karşı low + (high-low)//2 tercih edilir.",
    code: `def ikili_arama(dizi, hedef):
    dusuk, yuksek = 0, len(dizi) - 1
    while dusuk <= yuksek:
        orta = dusuk + (yuksek - dusuk) // 2
        if dizi[orta] == hedef:
            return orta
        if dizi[orta] < hedef:
            dusuk = orta + 1
        else:
            yuksek = orta - 1
    return -1`
  },
  {
    id: "algo-quicksort", cat: "Algoritmalar", weight: 1.0,
    q: "quicksort hızlı sıralama pivot bölme sıralama algoritması",
    title: "Quicksort",
    a: "Quicksort, pivot seçip diziyi 'küçükler-pivot-büyükler' olarak böler ve iki yarıyı özyinelemeli sıralar. Ortalama O(n log n), en kötü O(n²) (kötü pivot seçiminde). Yerinde çalıştığı için merge sort'tan az bellek kullanır; pratikte en hızlı genel amaçlı sıralamalardandır.",
    code: `def quicksort(dizi):
    if len(dizi) <= 1:
        return dizi
    pivot = dizi[len(dizi) // 2]
    sol   = [x for x in dizi if x < pivot]
    orta  = [x for x in dizi if x == pivot]
    sag   = [x for x in dizi if x > pivot]
    return quicksort(sol) + orta + quicksort(sag)`
  },
  {
    id: "algo-hash", cat: "Algoritmalar", weight: 1.0,
    q: "hash table karma tablo sözlük dictionary çakışma collision",
    title: "Hash Tablosu",
    a: "Hash tablosu, anahtarı bir hash fonksiyonuyla dizin konumuna çevirir; ortalama O(1) ekleme/arama/silme sağlar. Çakışmalar (iki anahtarın aynı konuma düşmesi) zincirleme (linked list) veya açık adresleme ile çözülür. Python dict, JS Map/Object ve Java HashMap bu yapıyı kullanır.",
    code: `# Python dict = hash tablosu
telefon = {"ali": "0532...", "ayşe": "0555..."}
telefon["ali"]          # O(1) erişim
"veli" in telefon       # O(1) üyelik testi`
  },
  {
    id: "algo-dp", cat: "Algoritmalar", weight: 1.0,
    q: "dinamik programlama dynamic programming memoization fibonacci alt problem",
    title: "Dinamik Programlama",
    a: "Dinamik programlama, örtüşen alt problemlerin sonuçlarını saklayarak (memoization/tabulation) üstel algoritmaları polinom zamana indirger. Klasik örnek: naif özyinelemeli Fibonacci O(2ⁿ) iken memoize edilmiş hali O(n) çalışır.",
    code: `from functools import lru_cache

@lru_cache(maxsize=None)     # sonuçları otomatik sakla
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

fib(500)  # anında — memoization olmadan evrenin ömrü yetmezdi`
  },
  {
    id: "algo-graph-bfs", cat: "Algoritmalar", weight: 1.0,
    q: "bfs dfs graf gezinme breadth depth first search en kısa yol",
    title: "BFS ve DFS",
    a: "BFS (genişlik öncelikli) kuyruk kullanır ve ağırlıksız grafta en kısa yolu garanti eder. DFS (derinlik öncelikli) yığın/özyineleme kullanır; bağlı bileşenler, döngü tespiti ve topolojik sıralama için uygundur. İkisi de O(V + E) karmaşıklıktadır.",
    code: `from collections import deque

def bfs(graf, baslangic):
    ziyaret = {baslangic}
    kuyruk = deque([baslangic])
    while kuyruk:
        dugum = kuyruk.popleft()
        for komsu in graf[dugum]:
            if komsu not in ziyaret:
                ziyaret.add(komsu)
                kuyruk.append(komsu)
    return ziyaret`
  },

  // ---------- WEB & AĞ ----------
  {
    id: "web-http", cat: "Web", weight: 1.0,
    q: "http metodları get post put delete patch rest durum kodları",
    title: "HTTP Metodları ve Durum Kodları",
    a: "GET veri okur (idempotent), POST yeni kaynak oluşturur, PUT kaynağın tamamını değiştirir (idempotent), PATCH kısmi günceller, DELETE siler. Durum kodları: 2xx başarı (200 OK, 201 Created, 204 No Content), 3xx yönlendirme (301 kalıcı, 302 geçici), 4xx istemci hatası (400 bozuk istek, 401 kimlik yok, 403 yetki yok, 404 bulunamadı, 429 çok fazla istek), 5xx sunucu hatası (500, 502, 503).",
    code: `fetch("/api/kullanici/7", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ ad: "Yeni Ad" })
});`
  },
  {
    id: "web-rest", cat: "Web", weight: 1.0,
    q: "rest api tasarım kaynak endpoint uri iyi pratik",
    title: "REST API Tasarımı",
    a: "REST'te URL'ler kaynakları (isim), HTTP metodları eylemleri (fiil) temsil eder: GET /kitaplar listeler, POST /kitaplar oluşturur, GET /kitaplar/5 tekil getirir. İyi pratikler: çoğul isimler, fiilsiz URL'ler (/getKitap değil), sürümleme (/v1/), sayfalama (?page=2&limit=20), tutarlı hata gövdesi.",
    code: `GET    /v1/kitaplar?sayfa=2&limit=20
POST   /v1/kitaplar            { "ad": "Dune" }
GET    /v1/kitaplar/5
PUT    /v1/kitaplar/5
DELETE /v1/kitaplar/5`
  },
  {
    id: "web-cors", cat: "Web", weight: 1.0,
    q: "cors cross origin hata tarayıcı access-control-allow-origin",
    title: "CORS Nedir?",
    a: "CORS (Cross-Origin Resource Sharing), tarayıcının farklı origin'e (protokol+alan+port) yapılan istekleri kontrol etme mekanizmasıdır. Sunucu Access-Control-Allow-Origin başlığıyla izin vermezse tarayıcı yanıtı engeller. Çözüm daima SUNUCU tarafındadır; özel başlıklı isteklerde tarayıcı önce OPTIONS 'preflight' isteği atar.",
    code: `// Express.js sunucusunda CORS izni
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://uygulamam.com");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});`
  },
  {
    id: "web-jwt", cat: "Web", weight: 1.0,
    q: "jwt token kimlik doğrulama authentication oturum session",
    title: "JWT ile Kimlik Doğrulama",
    a: "JWT (JSON Web Token) üç bölümden oluşur: header.payload.signature — base64url ile kodlanır ve sunucunun gizli anahtarıyla imzalanır. Payload ŞİFRELİ DEĞİLDİR, sadece imzalıdır; içine parola koymayın. Kısa ömürlü access token + yenileme (refresh) token deseni standarttır. Token'ı localStorage yerine httpOnly cookie'de tutmak XSS'e karşı daha güvenlidir.",
    code: `// Sunucu: imzala
const token = jwt.sign({ sub: kullanici.id }, GIZLI_ANAHTAR, { expiresIn: "15m" });

// İstemci: her istekte gönder
fetch("/api/profil", { headers: { Authorization: "Bearer " + token } });`
  },
  {
    id: "web-sql-injection", cat: "Güvenlik", weight: 1.0,
    q: "sql injection enjeksiyon güvenlik parametreli sorgu saldırı",
    title: "SQL Injection ve Korunma",
    a: "SQL injection, kullanıcı girdisinin sorguya ham metin olarak eklenmesiyle oluşur; saldırgan ' OR '1'='1 gibi ifadelerle sorguyu değiştirebilir. Tek gerçek çözüm parametreli (prepared) sorgulardır — girdi asla SQL koduna dönüşmez, her zaman veri olarak kalır. String birleştirme ile sorgu KURMAYIN.",
    code: `# HATALI — enjeksiyona açık
cursor.execute(f"SELECT * FROM users WHERE ad = '{girdi}'")

# DOĞRU — parametreli sorgu
cursor.execute("SELECT * FROM users WHERE ad = %s", (girdi,))`
  },
  {
    id: "web-xss", cat: "Güvenlik", weight: 1.0,
    q: "xss cross site scripting güvenlik innerHTML kaçış escape",
    title: "XSS (Cross-Site Scripting)",
    a: "XSS, kullanıcı girdisinin HTML olarak yorumlanmasıyla saldırganın sayfada script çalıştırmasıdır. Korunma: girdiyi ekrana basarken kaçışlayın (textContent kullanın, innerHTML'den kaçının), Content-Security-Policy başlığı ekleyin, çerezleri httpOnly yapın. Şablon motorlarının otomatik kaçışını kapatmayın.",
    code: `// HATALI — girdi script içerebilir
eleman.innerHTML = kullaniciGirdisi;

// DOĞRU — metin olarak basılır, script çalışmaz
eleman.textContent = kullaniciGirdisi;`
  },

  // ---------- GIT & ARAÇLAR ----------
  {
    id: "git-basics", cat: "Git", weight: 1.0,
    q: "git commit push pull temel komutlar branch dal",
    title: "Temel Git Komutları",
    a: "Git dağıtık sürüm kontrol sistemidir. Tipik akış: değişiklik yap → git add ile sahnele → git commit ile yerel kaydet → git push ile uzak depoya gönder. git pull uzaktaki değişiklikleri alır ve birleştirir; git status her an durumu gösterir.",
    code: `git status                 # durumu gör
git add dosya.js           # sahnele
git commit -m "Açıklama"   # kaydet
git push -u origin main    # uzak depoya gönder
git pull origin main       # uzaktakini al`
  },
  {
    id: "git-branch-merge", cat: "Git", weight: 1.0,
    q: "git branch merge rebase dal birleştirme çakışma conflict",
    title: "Branch, Merge ve Rebase",
    a: "Branch, ana koddan bağımsız geliştirme hattıdır. merge iki dalı birleştirip birleşme commit'i oluşturur; rebase commit'leri hedef dalın ucuna taşıyarak düz bir tarih yaratır. Kural: paylaşılan (push edilmiş) dalları rebase etmeyin. Çakışmada Git dosyaya <<<<<<< işaretleri koyar; elle düzeltip add + commit yapılır.",
    code: `git switch -c ozellik/yeni-panel   # dal aç
# ... değişiklikler + commit ...
git switch main
git merge ozellik/yeni-panel        # birleştir
git branch -d ozellik/yeni-panel    # temizle`
  },
  {
    id: "git-undo", cat: "Git", weight: 1.0,
    q: "git geri alma undo reset revert restore commit düzeltme",
    title: "Git'te Geri Alma",
    a: "git restore dosyayı son commit'e döndürür (kaydedilmemiş değişikliği siler). git reset --soft HEAD~1 son commit'i çözer ama değişiklikleri korur. git revert, push edilmiş bir commit'i güvenle geri alır — tarihi silmek yerine ters commit ekler; paylaşılan dallarda daima revert kullanın.",
    code: `git restore dosya.js          # kaydedilmemişi geri al
git reset --soft HEAD~1       # son commit'i çöz (değişiklik durur)
git revert a1b2c3d            # paylaşılmış commit'i güvenle geri al`
  },

  // ---------- VERİTABANI ----------
  {
    id: "db-index", cat: "Veritabanı", weight: 1.0,
    q: "veritabanı index dizin sorgu hızlandırma b-tree performans",
    title: "Veritabanı İndeksi",
    a: "İndeks (çoğunlukla B-tree), tabloyu baştan sona taramak yerine O(log n) aramayı mümkün kılar — kitabın dizini gibi. WHERE, JOIN ve ORDER BY'da sık kullanılan sütunlara eklenir. Bedeli: yazma işlemleri yavaşlar ve disk kullanır; her sütuna indeks EKLEMEYİN.",
    code: `CREATE INDEX idx_kullanici_email ON kullanicilar(email);

EXPLAIN SELECT * FROM kullanicilar WHERE email = 'a@b.com';
-- "Index Scan" görünüyorsa indeks kullanılıyor demektir`
  },
  {
    id: "db-sql-join", cat: "Veritabanı", weight: 1.0,
    q: "sql join inner left right birleştirme tablo ilişki",
    title: "SQL JOIN Türleri",
    a: "INNER JOIN yalnızca iki tabloda da eşleşen satırları döner. LEFT JOIN sol tablonun tüm satırlarını döner, eşleşmeyen sağ taraf NULL olur. RIGHT JOIN tersidir; FULL OUTER JOIN her iki tarafın tamamını döner. En sık kullanılanlar INNER ve LEFT'tir.",
    code: `SELECT s.ad, k.tutar
FROM siparisler s
LEFT JOIN kargolar k ON k.siparis_id = s.id;
-- kargosu olmayan siparişler de listelenir (k.tutar NULL)`
  },
  {
    id: "db-normalization", cat: "Veritabanı", weight: 1.0,
    q: "normalizasyon normal form tekrar veri tasarım şema",
    title: "Veritabanı Normalizasyonu",
    a: "Normalizasyon veri tekrarını azaltıp tutarlılığı artırır. 1NF: her hücrede tek değer. 2NF: kısmi bağımlılık yok. 3NF: anahtar dışı sütunlar birbirine bağımlı değil. Pratikte 3NF hedeflenir; raporlama/okuma ağırlıklı sistemlerde performans için bilinçli denormalizasyon yapılabilir.",
    code: `-- Tekrarlı (kötü): siparis(id, musteri_ad, musteri_tel, urun)
-- Normalize (iyi):
CREATE TABLE musteriler (id INT PRIMARY KEY, ad TEXT, tel TEXT);
CREATE TABLE siparisler (id INT PRIMARY KEY,
                         musteri_id INT REFERENCES musteriler(id),
                         urun TEXT);`
  },

  // ---------- YAPAY ZEKA ----------
  {
    id: "ai-nn", cat: "Yapay Zeka", weight: 1.0,
    q: "yapay sinir ağı neural network nöron katman ağırlık nasıl çalışır",
    title: "Yapay Sinir Ağları",
    a: "Yapay sinir ağı; girdi, gizli ve çıktı katmanlarından oluşur. Her nöron girdilerin ağırlıklı toplamını alır, bias ekler ve aktivasyon fonksiyonundan (ReLU, sigmoid) geçirir. Öğrenme, tahmin hatasının geri yayılım (backpropagation) ile ağırlıklara dağıtılıp gradyan inişiyle güncellenmesidir.",
    code: `# Tek nöronun ileri geçişi
import math
def noron(girdiler, agirliklar, bias):
    z = sum(g * a for g, a in zip(girdiler, agirliklar)) + bias
    return max(0, z)          # ReLU aktivasyonu`
  },
  {
    id: "ai-transformer", cat: "Yapay Zeka", weight: 1.0,
    q: "transformer attention dikkat mekanizması llm büyük dil modeli gpt",
    title: "Transformer ve Attention",
    a: "Transformer mimarisi (2017, 'Attention Is All You Need') dizileri özyineleme olmadan, self-attention ile işler: her token diğer tüm token'lara ne kadar 'dikkat' edeceğini öğrenir (Query·Key benzerliği → Value ağırlıklandırma). Paralel eğitilebildiği için GPT, Claude, LLaMA gibi büyük dil modellerinin temelidir. Parametre sayısı (7B, 70B...) modelin öğrenilmiş ağırlık adedini ifade eder.",
    code: `# Ölçekli nokta-çarpım dikkatin özü (kavramsal)
# Attention(Q, K, V) = softmax(Q·Kᵀ / √d_k) · V
puanlar   = Q @ K.T / sqrt(d_k)   # benzerlik
agirliklar = softmax(puanlar)     # olasılığa çevir
cikti     = agirliklar @ V        # ağırlıklı bilgi topla`
  },
  {
    id: "ai-overfit", cat: "Yapay Zeka", weight: 1.0,
    q: "overfitting aşırı öğrenme ezberleme regularization doğrulama",
    title: "Overfitting (Aşırı Öğrenme)",
    a: "Overfitting, modelin eğitim verisini ezberleyip yeni veride başarısız olmasıdır: eğitim hatası düşerken doğrulama hatası yükselir. Çareler: daha çok veri, dropout, L2 regularization, erken durdurma (early stopping), veri artırma ve daha basit model. Veriyi daima eğitim/doğrulama/test olarak ayırın.",
    code: `# Erken durdurma mantığı
en_iyi = float("inf"); sabir = 0
for epoch in range(100):
    val_loss = egit_ve_dogrula()
    if val_loss < en_iyi:
        en_iyi, sabir = val_loss, 0
    else:
        sabir += 1
        if sabir >= 5: break   # 5 epoch iyileşme yoksa dur`
  },
  {
    id: "ai-tokenization", cat: "Yapay Zeka", weight: 1.0,
    q: "tokenization token bpe kelime parçalama dil modeli girdi",
    title: "Tokenization",
    a: "Dil modelleri metni doğrudan değil, token'lar (alt-kelime parçaları) halinde işler. BPE (Byte Pair Encoding) sık geçen karakter çiftlerini birleştirerek sözlük oluşturur: 'programlama' tek token olabilirken nadir kelimeler parçalanır. Modellerin bağlam limiti (ör. 200K) token cinsindendir; kabaca 1 token ≈ 3-4 karakterdir.",
    code: `# Basit kelime-düzeyi tokenizasyon
metin = "Vega kod üretir"
tokenlar = metin.lower().split()   # ["vega", "kod", "üretir"]
sozluk = {t: i for i, t in enumerate(set(tokenlar))}`
  },
  {
    id: "ai-embedding", cat: "Yapay Zeka", weight: 1.0,
    q: "embedding vektör anlamsal benzerlik cosine tf-idf arama",
    title: "Embedding ve Anlamsal Benzerlik",
    a: "Embedding, metni sayısal vektöre çevirir; anlamca yakın metinler vektör uzayında yakın durur. Benzerlik genellikle kosinüs benzerliğiyle ölçülür (1 = aynı yön, 0 = ilgisiz). TF-IDF klasik ve hızlı bir yaklaşımdır: kelimenin belgedeki sıklığını, tüm derlemdeki nadirliğiyle çarpar. Vega'nın arama çekirdeği de TF-IDF + kosinüs kullanır.",
    code: `import math
def kosinus(v1, v2):
    nokta = sum(a * b for a, b in zip(v1, v2))
    n1 = math.sqrt(sum(a * a for a in v1))
    n2 = math.sqrt(sum(b * b for b in v2))
    return nokta / (n1 * n2) if n1 and n2 else 0.0`
  },

  // ---------- SİSTEM & DEVOPS ----------
  {
    id: "sys-docker", cat: "DevOps", weight: 1.0,
    q: "docker container konteyner image imaj sanallaştırma",
    title: "Docker ve Konteynerler",
    a: "Docker, uygulamayı bağımlılıklarıyla birlikte izole bir konteynerde paketler; 'bende çalışıyordu' sorununu bitirir. Image şablondur, container çalışan örneğidir. Sanal makineden farkı: işletim sistemi çekirdeğini paylaşır, bu yüzden saniyeler içinde başlar ve çok hafiftir.",
    code: `# Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
CMD ["node", "server.js"]

# docker build -t uygulamam . && docker run -p 3000:3000 uygulamam`
  },
  {
    id: "sys-env", cat: "DevOps", weight: 1.0,
    q: "environment variable ortam değişkeni config gizli anahtar dotenv",
    title: "Ortam Değişkenleri ve Gizli Bilgiler",
    a: "API anahtarları ve parolalar asla koda yazılmaz; ortam değişkenlerinden okunur. Geliştirmede .env dosyası kullanılır ve .gitignore'a MUTLAKA eklenir. Üretimde bulut sağlayıcının secret yöneticisi tercih edilir. Yanlışlıkla push edilen anahtar 'sızmış' sayılır — silmek yetmez, İPTAL edip yenisini üretin.",
    code: `# .env  (git'e girmez!)
DATABASE_URL=postgres://...
API_KEY=sk-...

# Node.js
const anahtar = process.env.API_KEY;
# Python
import os; anahtar = os.environ["API_KEY"]`
  },
  {
    id: "sys-regex", cat: "Araçlar", weight: 1.0,
    q: "regex düzenli ifade regular expression desen eşleştirme",
    title: "Regex (Düzenli İfadeler)",
    a: "Regex, metin desenlerini tanımlar: \\d rakam, \\w kelime karakteri, + bir veya daha çok, * sıfır veya çok, ^ başlangıç, $ son, [] karakter kümesi, () grup. Açgözlü .* yerine tembel .*? çoğu zaman daha güvenlidir. Karmaşık regex'i test etmeden kullanmayın.",
    code: `import re
# E-posta yakala (basitleştirilmiş)
desen = r"[\\w.+-]+@[\\w-]+\\.[\\w.]+"
re.findall(desen, "yaz: ali@ornek.com, veli@test.org")
# ['ali@ornek.com', 'veli@test.org']`
  },
  {
    id: "sys-testing", cat: "Araçlar", weight: 1.0,
    q: "unit test birim test tdd pytest jest test yazma",
    title: "Birim Testleri",
    a: "Birim testi, kodun en küçük parçasını izole doğrular. İyi test: hızlı, bağımsız, tekrarlanabilir ve tek şeyi sınar. AAA deseni: Arrange (hazırla), Act (çalıştır), Assert (doğrula). Kenar durumları (boş girdi, sıfır, negatif, çok büyük) mutlaka test edin — hatalar oralarda yaşar.",
    code: `# pytest
def kdv_ekle(tutar, oran=0.20):
    if tutar < 0:
        raise ValueError("Tutar negatif olamaz")
    return round(tutar * (1 + oran), 2)

def test_kdv_normal():   assert kdv_ekle(100) == 120.0
def test_kdv_sifir():    assert kdv_ekle(0) == 0.0
def test_kdv_negatif():
    import pytest
    with pytest.raises(ValueError): kdv_ekle(-5)`
  },
  {
    id: "sys-clean-code", cat: "Araçlar", weight: 1.0,
    q: "temiz kod clean code isimlendirme fonksiyon okunabilirlik",
    title: "Temiz Kod İlkeleri",
    a: "Kod yazmaktan çok okunur; okuyan için yazın. İlkeler: açıklayıcı isimler (d yerine gunSayisi), küçük ve tek işli fonksiyonlar, derin iç içe geçmeden erken dönüş (early return), sihirli sayılar yerine adlandırılmış sabitler, yorumu 'ne' için değil 'neden' için kullanmak. DRY: aynı bilgiyi iki yerde tutmayın.",
    code: `# Önce                          # Sonra
def h(u, t):                     MAKS_DENEME = 3
    if t == 1:
        if u > 0:                def indirim_uygula(fiyat, uye_mi):
            return u * 0.9           if not uye_mi:
    return u                             return fiyat
                                     return fiyat * 0.9`
  }
];

/* =========================================================
   VEGA WIKI — Platform Dokümantasyonu
   ========================================================= */
const VEGA_WIKI = [
  {
    id: "wiki-mimari", title: "Vega Mimarisi",
    body: `Vega, tarayıcıda uçtan uca çalışan hibrit bir yapay zekâ platformudur. "Vega-7.5B-Code" adı ürün kimliğidir; motorun kendisi üç gerçek bileşenden oluşur:

**1. Anlamsal Arama Çekirdeği (TF-IDF + Kosinüs Benzerliği)**
Bilgi tabanındaki her kayıt, kelime sıklığı × ters belge sıklığı (TF-IDF) ile vektöre dönüştürülür. Gelen soru aynı uzaya izdüşürülür ve kosinüs benzerliğiyle en alakalı kayıtlar bulunur. Bu, modern RAG (Retrieval-Augmented Generation) sistemlerinin klasik temelidir.

**2. N-gram Dil Modeli**
Kod derlemi üzerinde 3-gram istatistiksel dil modeli eğitilir. Eğitim gerçektir: geçiş olasılıkları sayılır, model kalitesi perplexity (şaşkınlık) metriğiyle ölçülür ve admin panelindeki grafikte gerçek değerler gösterilir.

**3. Çevrimiçi Öğrenme Katmanı**
Kullanıcının öğrettiği bilgiler ve 👍/👎 geri bildirimleri kayıt ağırlıklarını günceller, tarayıcı depolamasında (localStorage) kalıcı tutulur ve bir sonraki eğitimde modele işlenir. Vega bu sayede kullandıkça gerçekten gelişir.

**Veri paketleri**
Bilgi tabanı iki büyük gerçek veri paketiyle beslenir: MDN'in kamu malı (CC0) tarayıcı uyumluluk verisinden üretilmiş ~10.000 referans kaydı (CSS, HTML, SVG, JavaScript, Web API, HTTP — gerçek sürüm destek tablolarıyla) ve dokuz büyük açık kaynak projenin (lodash, vue, d3, react-dom, three.js…) kaynak kodundan çıkarılmış ~60.000 satırlık kod derlemi. Derlem, n-gram dil modelinin eğitim verisidir — kod tamamlama gerçek üretim kodu desenlerinden örnekler.`
  },
  {
    id: "wiki-egitim", title: "Eğitim Süreci",
    body: `Admin panelindeki **"Modeli Eğit / Güncelle"** butonu şu gerçek adımları çalıştırır:

1. **Derlem toplama** — Çekirdek bilgi tabanı + kullanıcı öğretileri birleştirilir.
2. **Tokenizasyon** — Metin küçük harfe çevrilir, Türkçe karakterler korunarak kelimelere ayrılır.
3. **TF-IDF indeksleme** — Her belge için terim frekansları ve IDF değerleri yeniden hesaplanır.
4. **N-gram sayımı** — Kod derlemi üzerinden 2-gram ve 3-gram geçiş tabloları kurulur.
5. **Perplexity ölçümü** — Model, tuttuğumuz doğrulama cümleleri üzerinde test edilir; her "epoch" derlemin farklı bir bölümünü işlediği için grafikteki düşüş gerçektir.
6. **Ağırlık uygulama** — Geri bildirim puanları kayıt ağırlıklarına işlenir.

Eğitim tamamen tarayıcınızda çalışır; hiçbir veri dışarı gönderilmez.`
  },
  {
    id: "wiki-ogretme", title: "Vega'ya Öğretme",
    body: `Vega'ya iki yolla yeni bilgi öğretebilirsiniz:

**Sohbetten:** \`öğret: soru => cevap\` biçiminde yazın.
Örnek: \`öğret: takımımızın standup saati => Her sabah 09:30'da Zoom'da.\`

**Admin panelinden:** "Bilgi Tabanı" sekmesinde yeni kayıt ekleyin; başlık, anahtar kelimeler, açıklama ve isteğe bağlı kod örneği girebilirsiniz.

Öğretilen bilgiler anında kullanılabilir, "Modeli Eğit" ile indekse tam olarak işlenir ve tarayıcı depolamasında kalıcıdır. Geri bildirim butonları (👍/👎) cevabın kaynağı olan kaydın ağırlığını ±%15 değiştirir; kötü cevaplar zamanla geriye düşer.`
  },
  {
    id: "wiki-gorsel", title: "Görsel Üretimi",
    body: `Görsel stüdyosu, yazdığınız betimlemeden deterministik üretken sanat oluşturur:

- Betimleme bir **hash fonksiyonuyla tohuma (seed)** çevrilir — aynı metin daima aynı görseli üretir, tek kelime değişse kompozisyon tamamen değişir.
- Metindeki anahtar kelimeler **stili seçer**: "uzay/galaksi/yıldız" → nebula; "deniz/dalga/okyanus" → akışkan dalgalar; "şehir/neon/gece" → neon silüet; "geometri/desen" → geometrik mozaik; "orman/doğa" → fraktal ağaçlar.
- Renk paleti, duygu kelimelerinden türetilir ("sıcak", "soğuk", "pastel", "karanlık").
- Sonuç 1024×640 canvas üzerinde çizilir ve PNG olarak indirilebilir.

Bu, dışa bağımlılığı olmayan gerçek bir üretken (generative) sanat motorudur.`
  },
  {
    id: "wiki-muzik", title: "Müzik Üretimi",
    body: `Müzik stüdyosu, Web Audio API ile gerçek zamanlı beste yapar:

- Betimleme tohuma çevrilir; **ruh hâli analizi** ("hüzünlü", "epik", "neşeli", "sakin") gam ve tempoyu belirler: hüzünlü → minör 60-75 BPM, epik → dorik + güçlü bas, neşeli → majör pentatonik 120-140 BPM.
- Motor 16 ölçülük yapı üretir: **akor yürüyüşü** (I-V-vi-IV gibi ağırlıklı rastgele seçim), üstüne gam-içi **melodi**, bas hattı ve ritim.
- Sesler osilatörlerle (sine/triangle/sawtooth) sentezlenir, ADSR zarfı ve delay efekti uygulanır.
- Beste **WAV dosyası olarak indirilebilir** (OfflineAudioContext ile gerçek ses dosyası işlenir).

Aynı betimleme aynı besteyi üretir — üretim tamamen algoritmik ve yereldir.`
  },
  {
    id: "wiki-sss", title: "SSS",
    body: `**Vega gerçekten 7.5 milyar parametreli mi?**
Hayır — "7.5B-Code" ürün adıdır. Gerçek bir 7.5B modeli GPU kümeleri ister ve tarayıcıda eğitilemez. Vega'nın motoru dürüst bir hibrittir: gerçek sinir ağları (~75 bin parametre, saf JS geri yayılım + Adam optimizer) + TF-IDF anlamsal arama + n-gram dil modeli + çevrimiçi öğrenme. Küçüktür ama öğrenmesi ve gradyanları gerçektir.

**Sinir ağları gerçekten eğitiliyor mu?**
Evet. Niyet sınıflandırıcısı her sayfa açılışında bilgi tabanı üzerinde arka planda eğitilir (~%93 doğrulama doğruluğu) ve tahminleri cevap seçimini gerçekten etkiler. Karakter düzeyi dil modeli Admin > Nöral Çekirdek'ten eğitilir: canlı kayıp eğrisi gerçek gradyan inişidir, ağırlıklar tarayıcına kaydedilir ve "üret:" komutuyla örnekleyebilirsin. Geri yayılım kodunun doğruluğu XOR testiyle doğrulanmıştır.

**Verilerim nereye gidiyor?**
Hiçbir yere. Tüm eğitim, sohbet geçmişi ve öğretiler tarayıcınızın localStorage'ında kalır. Ağ isteği atılmaz.

**Model sıfırlanabilir mi?**
Evet — Admin > Tehlikeli Bölge'den öğrenilen her şey silinip fabrika bilgi tabanına dönülebilir.

**Neden bazen "bilmiyorum" diyor?**
Vega, benzerlik puanı eşiğin altında kalınca uydurmak yerine dürüstçe bilmediğini söyler ve en yakın konuları önerir. Bu bilinçli bir tasarım kararıdır.`
  }
];

/* =========================================================
   KOD DERLEMİ — N-gram dil modelinin gerçek eğitim verisi
   ========================================================= */
const VEGA_CODE_CORPUS = [
  "function toplam(a, b) { return a + b; }",
  "const sonuc = dizi.map(x => x * 2).filter(x => x > 10);",
  "for (let i = 0; i < dizi.length; i++) { console.log(dizi[i]); }",
  "if (kullanici && kullanici.aktif) { girisYap(kullanici); }",
  "const veri = await fetch(url).then(r => r.json());",
  "try { await kaydet(veri); } catch (e) { console.error(e); }",
  "document.querySelector('#buton').addEventListener('click', tikla);",
  "const { ad, yas } = kullanici; const yeni = { ...eski, aktif: true };",
  "export default function Uygulama() { return null; }",
  "class Hayvan { constructor(ad) { this.ad = ad; } ses() { return '...'; } }",
  "def toplam(a, b): return a + b",
  "for i in range(10): print(i * i)",
  "with open('veri.txt') as f: satirlar = f.readlines()",
  "sonuc = [x * 2 for x in sayilar if x > 0]",
  "if __name__ == '__main__': main()",
  "def fib(n): return n if n < 2 else fib(n - 1) + fib(n - 2)",
  "import json; veri = json.loads(metin)",
  "SELECT ad, email FROM kullanicilar WHERE aktif = true ORDER BY ad;",
  "INSERT INTO loglar (mesaj, seviye) VALUES ('hata', 'error');",
  "git commit -m 'düzeltme: boş girdi kontrolü eklendi'",
  "docker run -d -p 8080:80 --name web nginx",
  "npm install && npm run build && npm test",
  "const sunucu = http.createServer((req, res) => res.end('merhaba'));",
  "app.get('/api/kullanicilar', async (req, res) => res.json(await hepsi()));",
  "kullanicilar.sort((a, b) => a.ad.localeCompare(b.ad));",
  "const benzersiz = [...new Set(dizi)];",
  "while (kuyruk.length > 0) { const is = kuyruk.shift(); isle(is); }",
  "return Object.entries(sozluk).map(([k, v]) => `${k}=${v}`).join('&');"
];

/* Perplexity doğrulama cümleleri — n-gram modeli bunlarla test edilir */
const VEGA_VALIDATION = [
  "const veri = dizi.map(x => x * 2);",
  "function hesapla(a, b) { return a + b; }",
  "for (let i = 0; i < 10; i++) { console.log(i); }",
  "def hesapla(a, b): return a * b",
  "if (kullanici.aktif) { return veri; }"
];

/* Küçük konuşma seti — selamlama ve kimlik */
const VEGA_SMALLTALK = [
  { q: ["merhaba", "selam", "hey", "günaydın", "iyi akşamlar", "naber", "nasılsın"],
    a: ["Merhaba! Ben Vega 👋 Kod, algoritma ve yazılım konularında eğitildim. Bana bir şey sor, kod iste ya da `öğret: soru => cevap` diyerek yeni bilgi öğret. Sağ üstten görsel ve müzik stüdyolarına da geçebilirsin.",
        "Selam! Vega burada. JavaScript, Python, algoritmalar, Git, SQL... ne merak ediyorsan sor. Cevabımı beğenirsen 👍 ile beni güçlendirebilirsin."] },
  { q: ["sen kimsin", "kendini tanıt", "vega nedir", "ne yapabilirsin", "yeteneklerin"],
    a: ["Ben **Vega-7.5B-Code** — tamamen tarayıcında çalışan, kod ağırlıklı ve gerçekten öğrenen bir yapay zekâ platformuyum. Motorumda TF-IDF anlamsal arama, n-gram dil modeli ve çevrimiçi öğrenme var. Yapabildiklerim:\n\n- 💬 Programlama sorularını gerçek, doğrulanmış bilgiyle yanıtlarım\n- 🧠 `öğret:` komutuyla yeni bilgiler öğrenirim ve kalıcı hatırlarım\n- 🎨 Betimlemeden üretken sanat çizerim\n- 🎵 Web Audio ile beste yaparım\n\nDetaylar Wiki sekmesinde. Dürüstlük notu: adımdaki 7.5B bir ürün ismi — motorum küçük ama öğrenmesi sahici."] },
  { q: ["teşekkür", "teşekkürler", "sağol", "eyvallah", "harika", "süper"],
    a: ["Rica ederim! Cevap işine yaradıysa 👍 bırakırsan o bilginin ağırlığı artar ve gelecekte daha isabetli olurum. Başka soru varsa buradayım.",
        "Ne demek! Öğrenmeye devam ediyorum — yeni bir şey öğretmek istersen `öğret: soru => cevap` yazman yeterli."] },
  { q: ["görüşürüz", "hoşçakal", "bay bay", "kapat"],
    a: ["Görüşürüz! Öğrendiklerim tarayıcında saklı — döndüğünde kaldığımız yerden devam ederiz. 👋"] }
];

/* Bilinmeyen soru yanıt kalıpları */
const VEGA_UNKNOWN = [
  "Bu konuda güvenilir bir bilgim yok — uydurmak yerine dürüst olayım. 🤔",
  "Bilgi tabanımda bu soruya yeterince benzeyen bir kayıt bulamadım.",
  "Bu, şu anki eğitimimin dışında kalıyor."
];
