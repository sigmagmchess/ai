# 🌌 Vega-7.5B-Code — Tarayıcıda Öğrenen Yapay Zekâ Platformu

Vega; kod ağırlıklı, **gerçekten öğrenen**, tamamen tarayıcıda çalışan bir yapay zekâ platformudur. Sunucu yok, API anahtarı yok, dışa veri gönderimi yok — `index.html`'i açmanız yeterli.

> **Dürüstlük notu:** "7.5B-Code" ürün adıdır. Gerçek bir 7,5 milyar parametreli model tarayıcıda eğitilemez; Vega'nın motoru dürüst bir hibrittir: **gerçek sinir ağları** (saf JS geri yayılım + Adam, ~75 bin parametre) + TF-IDF anlamsal arama + n-gram dil modeli + çevrimiçi öğrenme. Küçüktür ama öğrenmesi ve gradyanları sahicidir.

## 🧬 Nöral Çekirdek — gerçek makine öğrenmesi

`js/vega-ml.js` hiçbir kütüphane kullanmadan gerçek ML uygular: ileri geçiş, **elle türetilmiş geri yayılım**, softmax çapraz entropi, **Adam optimizer**, mini-batch eğitim, eğitim/doğrulama ayrımı. (Geri yayılımın doğruluğu XOR problemiyle test edilir: kayıp 0.654 → 0.0001.)

| Model | Mimari | Görev | Ölçülen |
|---|---|---|---|
| **IntentNet** | bag-of-words(900) → ReLU(48) → softmax(7) · ~37k parametre | Sorunun kategori ailesini öngörür; tahmin **cevap seçimini gerçekten etkiler** (eşleşen aile skor desteği alır). Sayfa açılışında arka planda ~1 sn'de eğitilir. | doğrulama doğruluğu **%93** |
| **CodeNet** | karakter embedding(20) × bağlam(14) → ReLU(96) → softmax(96) · ~38k parametre | Açık kaynak kod derleminden karakter karakter üretmeyi öğrenir; `üret: function ` komutuyla örnekler. Admin'den ~10 sn'de eğitilir, ağırlıklar localStorage'a kaydedilir. | doğrulama kaybı 3.79 → **2.28** |
| **Lyra-1 / Lyra-1.5** | WordNet mimarisi × 2 bağımsız örnek, **meta-öğrenmeli**: 4 hiperparametre reçetesini (lr × gizli katman) kısa denemelerle eğitip doğrulama kaybıyla ölçer, kazananla tam eğitim yapar — nasıl öğreneceğini kendisi seçer. Lyra-1 kod+matematik karışımıyla (135k+ kelime, kod derlemi dahil), Lyra-1.5 sözel/kavramsal karışımla beslenir. Ezber karşıtı: dropout(0.15) + erken durdurma + her üretimde **özgünlük skoru** (üretilen üçlü dizilimlerin eğitim verisinde birebir geçmeme oranı; Lyra-1 ~%50 özgün dizilim üretir). `lyra1: const dizi` / `lyra1.5: yapay zeka` komutları. | ölçülü: iki model farklı reçete seçti (0.006/96 vs 0.012/72) |
| **WordNet** | kelime embedding(24) × bağlam(6) → ReLU(72) → softmax(1000) · ~107k parametre | Bilgi tabanının Türkçe metinlerinden (dengeli karışım: küratörlü ×3 + referans şablonları) **kelime kelime** üretmeyi öğrenir; ürettiği her token gerçek bir Türkçe kelimedir. Üretimde **nöral + kelime-trigram harmanı** (λ=0.5), **nucleus top-p=0.92 örnekleme**, tekrar cezası ve erken durdurma kullanır — tam gramatik cümle kalıpları üretir. `kelime: yapay zeka` komutu. | doğrulama kaybı 5.38 → **3.63** |

## Çalıştırma

**En kolay yol — tek dosya:** depodaki hazır **`vega.html`** dosyasını indir ve çift tıkla. Tüm CSS, JS ve veri paketleri içine gömülüdür (~15 MB); klasör yapısı, sunucu, internet gerektirmez.

```bash
# Tek dosyayı yeniden üretmek istersen:
node scripts/build-single.mjs      # → vega.html

# Klasik yol (depo klasör yapısıyla birlikte):
python -m http.server 8000         # http://localhost:8000
# veya index.html'i doğrudan aç (css/ ve js/ klasörleri yanında olmalı!)
```

> ⚠️ Yalnızca `index.html`'i tek başına indirirsen sayfa stilsiz/bozuk açılır — o dosya `css/` ve `js/` klasörlerine bağımlıdır. Tek dosya istiyorsan `vega.html` kullan.

## Özellikler

| Modül | Açıklama |
|---|---|
| 💬 **Sohbet** | 110+ doğrulanmış gerçek programlama bilgisi (JS, TS, Python, React, Node, CSS, Linux, ağ, algoritmalar, veri yapıları, tasarım desenleri, Git, SQL, güvenlik, ML). Güven skoru, ilgili konular, kod örnekleri, çoklu kaynak birleştirme. |
| 🔍 **Güçlü arama** | TF-IDF + bigram indeksleme, Türkçe-İngilizce eşanlamlı genişletme (90+ köprü), Levenshtein tabanlı yazım hatası toleransı. |
| 🎯 **Öğrenme kuyruğu** | Cevaplanamayan sorular otomatik kaydedilir; admin panelinden tek tıkla öğretilir — kapalı öğrenme döngüsü. |
| 🕸️ **Bilgi Ağı** | Kavramlar arası **hesaplanmış** ilişkiler grafı: kenarlar TF-IDF kosinüs benzerliğinden türetilir, elle yazılmaz. Öğretilen bilgiler ağa kendiliğinden bağlanır (kesikli hale). Düğüme tıkla → sohbette sor. Cevaplardaki "İlgili" çipleri de aynı hesaplamadan gelir ve tıklanabilir. |
| 🧠 **Gerçek öğrenme** | `öğret: soru => cevap` ile kalıcı bilgi öğretme; 👍/👎 geri bildirimi kayıt ağırlıklarını ±%15 günceller; localStorage'da kalıcı. |
| ⌨️ **Kod tamamlama** | `tamamla: const veri =` — kod derlemi üzerinde eğitilmiş trigram dil modelinden ağırlıklı örnekleme. |
| ⚡ **Eğitim butonu** | Gerçek eğitim: TF-IDF indeksi kurulur, n-gram tabloları sayılır, doğrulama seti üzerinde **gerçek perplexity** ölçülüp grafiğe çizilir. |
| 🎨 **Görsel stüdyosu** | Betimlemeden deterministik üretken sanat: nebula, neon şehir, dalgalar, fraktal orman, geometrik mozaik. PNG indirme. |
| 🎵 **Müzik stüdyosu** | Ruh hâli analizi → gam/tempo/akor yürüyüşü → Web Audio sentezi (ADSR + delay). WAV indirme (OfflineAudioContext). |
| 📚 **Wiki** | Mimari, eğitim süreci, öğretme, stüdyolar ve SSS dokümantasyonu. |
| ⚙️ **Admin paneli** | Model istatistikleri, perplexity grafiği, bilgi tabanı CRUD, model dışa/içe aktarma (JSON), fabrika sıfırlama. |

## Mimari

```
index.html
├── css/style.css          # arayüz (kenar çubuklu düzen, cam yüzeyler)
├── scripts/
│   └── build-data.mjs     # veri paketlerini MDN/npm kaynaklarından yeniden üretir
└── js/
    ├── vega-data.js       # çekirdek bilgi tabanı, wiki, kod derlemi, doğrulama seti
    ├── vega-data-ext.js   # genişletme: +70 kayıt, +40 kod satırı, eşanlamlı sözlük
    ├── vega-data-ref.js   # ~4.3 MB · 10.289 gerçek referans kaydı — MDN
    │                      # browser-compat-data + mdn-data'dan üretildi (CC0):
    │                      # CSS özellik/seçici, HTML, SVG, JS yerleşik/operatör,
    │                      # Web API arayüz+üyeleri, HTTP başlıkları + destek tabloları
    ├── vega-corpus-big.js # ~2.5 MB · 59.768 benzersiz satır GERÇEK kaynak kod
    │                      # (lodash, vue, d3, react-dom, three.js, axios, jquery,
    │                      # moment, express — MIT/ISC) → n-gram eğitim derlemi
    ├── vega-engine.js     # TF-IDF + bigram + kosinüs arama, eşanlamlı genişletme,
    │                      # fuzzy eşleme, trigram LM (bağlam haritalı), perplexity,
    │                      # çevrimiçi öğrenme, öğrenme kuyruğu, kalıcılık, export/import
    ├── vega-media.js      # üretken görsel (canvas) + algoritmik müzik (Web Audio)
    └── app.js             # UI bağlantıları: sohbet, stüdyolar, wiki, admin
```

### Veri paketleri ve lisanslar

| Paket | Boyut | İçerik | Kaynak / Lisans |
|---|---|---|---|
| `vega-data-ref.js` | ~6 MB | 15.041 referans kaydı: CSS özellik+değer+seçici+tür+at-kural yönergeleri, HTML eleman+öznitelik+global, SVG eleman+öznitelik, MathML, JS yerleşik+operatör+deyim+derinlik-3, Web API arayüz+üye+alt seçenek, HTTP başlık+yönerge+metod, WebAssembly, 1.255 tarayıcı sürüm tarihçesi — gerçek destek sürümleriyle | [mdn/browser-compat-data](https://github.com/mdn/browser-compat-data) + [mdn/data](https://github.com/mdn/data) — CC0 (kamu malı) |
| `vega-corpus-big.js` | ~11 MB | 249.502 benzersiz gerçek kod satırı, **çok dilli** (JS + TS + Python) — n-gram + nöral eğitim | JS: lodash, vue, d3, react-dom, three.js, axios, jquery, rxjs, handlebars, luxon, moment, underscore, backbone, typescript, babel · **Python: django, sqlalchemy, flask, requests** — MIT/ISC/Apache-2.0/BSD-3 |
| `vega-data-ext2.js` | ~150 KB | 113 küratörlü Türkçe kayıt: **Go, Rust, Java, İşletim Sistemi, Sistem Tasarımı, Test, Ağ (derin), Matematik** — çok-ajanlı üretim + her paket bağımsız hakem ajanla olgusal doğrulama | özgün içerik |
| `vega-data-ext3.js` | ~80 KB | 56 küratörlü Türkçe kayıt: **Konteyner & Bulut (Docker/K8s), C/C++, İleri SQL, Erişilebilirlik & Performans** — paralel ajan üretimi, öz-denetimli | özgün içerik |

Paketleri güncellemek için: `node scripts/build-data.mjs` (kaynakları npm'den indirip yeniden üretir).

### Motor nasıl çalışıyor?

1. **BM25 arama + ters indeks** — Sorgular, modern arama motorlarının kullandığı BM25 sıralamasıyla (terim doygunluğu k1=1.4, uzunluk normalizasyonu b=0.55) puanlanır; ters indeks sayesinde yalnız sorgu terimlerini içeren belgeler taranır (~0.5 ms/sorgu). Sorgu **kapsama sinyali** (özgün terimlerin kaçı eşleşti) yanlış-pozitifleri keser: eşik altında Vega uydurmak yerine "bilmiyorum" der. TF-IDF kosinüs, ilişki grafı ve ilgili-konular için ayrıca korunur.
2. **Konuşma bağlamı** — Kısa/işaret zamirli takip soruları ("peki en kötü durumu?") önceki konunun terimleriyle zenginleştirilir.
3. **Nöral katman** — Niyet sınıflandırıcısı (gerçek MLP) sorunun kategori ailesini öngörüp sıralamayı destekler; karakter düzeyi sinir ağı `üret:` komutunu besler.
4. **N-gram dil modeli** — Kod derlemi üzerinde 2/3-gram geçiş tabloları; kod tamamlama ağırlıklı örnekleme, kalite Laplace düzeltmeli perplexity.
5. **Çevrimiçi öğrenme** — Öğretilen kayıtlar ve geri bildirim ağırlıkları anında indekse işlenir, localStorage'da kalıcıdır.
6. **Ölçüm** — Admin > Değerlendirme, gerçek getirme kıyaslaması çalıştırır: Top-1 **%99.2** / Top-3 **%99.2** (252 sorgu, 0.5 ms/sorgu).
