# 🌌 Vega-7.5B-Code — Tarayıcıda Öğrenen Yapay Zekâ Platformu

Vega; kod ağırlıklı, **gerçekten öğrenen**, tamamen tarayıcıda çalışan bir yapay zekâ platformudur. Sunucu yok, API anahtarı yok, dışa veri gönderimi yok — `index.html`'i açmanız yeterli.

> **Dürüstlük notu:** "7.5B-Code" ürün adıdır. Gerçek bir 7,5 milyar parametreli model tarayıcıda eğitilemez; Vega'nın motoru dürüst bir hibrittir: TF-IDF anlamsal arama + n-gram dil modeli + çevrimiçi öğrenme. Küçüktür ama öğrenmesi sahicidir.

## Çalıştırma

```bash
# Dosyayı doğrudan açın:
open index.html
# veya bir yerel sunucuyla:
python -m http.server 8000   # http://localhost:8000
```

## Özellikler

| Modül | Açıklama |
|---|---|
| 💬 **Sohbet** | 110+ doğrulanmış gerçek programlama bilgisi (JS, TS, Python, React, Node, CSS, Linux, ağ, algoritmalar, veri yapıları, tasarım desenleri, Git, SQL, güvenlik, ML). Güven skoru, ilgili konular, kod örnekleri, çoklu kaynak birleştirme. |
| 🔍 **Güçlü arama** | TF-IDF + bigram indeksleme, Türkçe-İngilizce eşanlamlı genişletme (90+ köprü), Levenshtein tabanlı yazım hatası toleransı. |
| 🎯 **Öğrenme kuyruğu** | Cevaplanamayan sorular otomatik kaydedilir; admin panelinden tek tıkla öğretilir — kapalı öğrenme döngüsü. |
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
├── css/style.css        # arayüz
└── js/
    ├── vega-data.js     # çekirdek bilgi tabanı, wiki, kod derlemi, doğrulama seti
    ├── vega-data-ext.js # genişletme paketi: +70 kayıt, +40 kod satırı, eşanlamlı sözlük
    ├── vega-engine.js   # TF-IDF + bigram + kosinüs arama, eşanlamlı genişletme,
    │                    # fuzzy eşleme, trigram LM, perplexity, çevrimiçi öğrenme,
    │                    # öğrenme kuyruğu, kalıcılık, model export/import
    ├── vega-media.js    # üretken görsel (canvas) + algoritmik müzik (Web Audio)
    └── app.js           # UI bağlantıları: sohbet, stüdyolar, wiki, admin
```

### Motor nasıl çalışıyor?

1. **Anlamsal arama** — Her bilgi kaydı TF-IDF vektörüne dönüştürülür; soru aynı uzaya izdüşürülüp kosinüs benzerliğiyle eşlenir. Eşik altında kalan sorulara Vega uydurmak yerine "bilmiyorum" der ve en yakın konuları önerir.
2. **N-gram dil modeli** — Kod derlemi üzerinde 2/3-gram geçiş tabloları sayılır; kod tamamlama bu tablodan ağırlıklı örnekler. Kalite, Laplace düzeltmeli perplexity ile ölçülür.
3. **Çevrimiçi öğrenme** — Öğretilen kayıtlar ve geri bildirim ağırlıkları anında indekse işlenir ve localStorage'da saklanır; sayfa yenilense de model hatırlar.
