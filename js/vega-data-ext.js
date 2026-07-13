/* =========================================================
   VEGA-7.5B-Code — Genişletilmiş Bilgi Tabanı (v2)
   +70 doğrulanmış kayıt: TypeScript, React, Node, CSS, Linux,
   ağ, tasarım desenleri, veri yapıları, ML, kriptografi...
   ========================================================= */

const VEGA_KNOWLEDGE_EXT = [
  // ---------- TYPESCRIPT ----------
  { id: "ts-nedir", cat: "TypeScript", weight: 1.0,
    q: "typescript nedir javascript farkı tip güvenliği neden",
    title: "TypeScript Nedir?",
    a: "TypeScript, JavaScript'in statik tipli üst kümesidir; derleme anında tip hatalarını yakalar ve düz JavaScript'e derlenir. Tipler çalışma zamanında SİLİNİR — TS güvenliği derleme anındadır, çalışma zamanı doğrulaması (ör. zod) ayrıca gerekir.",
    code: `function selamla(ad: string): string {
  return "Merhaba " + ad;
}
selamla(42); // Derleme hatası: number, string'e atanamaz` },
  { id: "ts-interface-type", cat: "TypeScript", weight: 1.0,
    q: "interface type farkı typescript hangisi tercih",
    title: "interface vs type",
    a: "İkisi de nesne şekli tanımlar. interface birleştirilebilir (declaration merging) ve extends ile genişler; type birleşim (union), kesişim ve koşullu tipler gibi her şeyi ifade eder. Pratik kural: genel API/nesne şekli için interface, union ve yardımcı tipler için type.",
    code: `interface Kullanici { ad: string; }
interface Kullanici { yas: number; }  // birleşir!

type Durum = "yukleniyor" | "hazir" | "hata";  // union sadece type ile` },
  { id: "ts-generics", cat: "TypeScript", weight: 1.0,
    q: "generic jenerik tip parametresi typescript yeniden kullanım",
    title: "TypeScript Generics",
    a: "Generics, tipin parametre olarak geçilmesini sağlar: fonksiyon her tip için çalışır ama tip bilgisi kaybolmaz. extends ile kısıt konur; any kullanmaktan farkı tip güvenliğinin korunmasıdır.",
    code: `function ilk<T>(dizi: T[]): T | undefined {
  return dizi[0];
}
const s = ilk(["a", "b"]);  // s: string | undefined
const n = ilk([1, 2, 3]);    // n: number | undefined` },
  { id: "ts-unknown-any", cat: "TypeScript", weight: 1.0,
    q: "any unknown never farkı typescript güvenli tip",
    title: "any / unknown / never",
    a: "any tip denetimini tamamen kapatır — kaçının. unknown 'tipini bilmiyorum' demektir ama kullanmadan önce daraltma (narrowing) zorunludur, güvenlidir. never 'asla olmaz' demektir: hata fırlatan fonksiyonların dönüşü ve tüketilmiş union'lar için kullanılır.",
    code: `function isle(veri: unknown) {
  if (typeof veri === "string") {
    veri.toUpperCase();   // daraltmadan sonra güvenli
  }
}` },

  // ---------- REACT & FRONTEND ----------
  { id: "react-state", cat: "React", weight: 1.0,
    q: "usestate state durum react hook nasıl kullanılır",
    title: "React useState",
    a: "useState, bileşene durum ekler; setter çağrılınca bileşen yeniden render edilir. Durum güncellemesi asenkrondur ve mevcut değere bağlıysa fonksiyonel form (prev => prev + 1) kullanılmalıdır — art arda çağrılarda kaybolmayı önler.",
    code: `const [sayac, setSayac] = useState(0);
// HATALI: setSayac(sayac + 1); setSayac(sayac + 1);  → +1 artar
setSayac(p => p + 1);
setSayac(p => p + 1);  // → +2 artar` },
  { id: "react-useeffect", cat: "React", weight: 1.0,
    q: "useeffect yan etki bağımlılık dizisi cleanup temizlik react",
    title: "React useEffect",
    a: "useEffect, render sonrası yan etkileri (veri çekme, abonelik) çalıştırır. Bağımlılık dizisi boşsa yalnızca ilk render'da çalışır; içindeki her dış değer diziye yazılmalıdır. Dönülen fonksiyon temizlik (cleanup) yapar — abonelik iptali, zamanlayıcı temizliği.",
    code: `useEffect(() => {
  const id = setInterval(tik, 1000);
  return () => clearInterval(id);   // unmount'ta temizle
}, []);` },
  { id: "react-props-state", cat: "React", weight: 1.0,
    q: "props state farkı veri akışı react bileşen iletişim",
    title: "Props vs State",
    a: "Props, üst bileşenden gelen salt-okunur girdilerdir; state bileşenin kendi değişebilir verisidir. Veri akışı tek yönlüdür: yukarıdan aşağı props ile iner, çocuk değişiklik isterse üstten gelen callback'i çağırır ('state'i yukarı kaldır' deseni).",
    code: `function Ebeveyn() {
  const [ad, setAd] = useState("");
  return <Girdi deger={ad} onDegis={setAd} />;  // state yukarıda
}` },
  { id: "react-key", cat: "React", weight: 1.0,
    q: "key liste render neden index kullanma react uyarı",
    title: "Liste Render ve key",
    a: "key, React'in liste öğelerini yeniden render'da eşlemesini sağlar. Dizi indeksini key yapmak, öğe eklenip silindiğinde durum karışmasına yol açar — kararlı, benzersiz kimlik (veritabanı id'si) kullanın.",
    code: `{urunler.map(u => (
  <Urun key={u.id} veri={u} />   // index DEĞİL, kalıcı id
))}` },
  { id: "react-vdom", cat: "React", weight: 1.0,
    q: "virtual dom sanal dom reconciliation diff react nasıl çalışır",
    title: "Virtual DOM",
    a: "React, UI'ın bellekteki hafif kopyasını (virtual DOM) tutar. State değişince yeni ağaç eskiyle karşılaştırılır (diffing/reconciliation) ve yalnızca değişen gerçek DOM düğümleri güncellenir — çünkü gerçek DOM işlemleri pahalıdır.",
    code: `// Siz bildirimsel yazarsınız:
return <h1>{baslik}</h1>;
// React minimum DOM değişikliğini kendisi hesaplar` },

  // ---------- CSS & HTML ----------
  { id: "css-flexbox", cat: "CSS", weight: 1.0,
    q: "flexbox esnek kutu hizalama ortala düzen css",
    title: "CSS Flexbox",
    a: "Flexbox tek eksenli (satır veya sütun) düzen sistemidir. justify-content ana ekseni, align-items çapraz ekseni hizalar. Bir öğeyi tam ortalamak flexbox ile üç satırdır. gap ile öğe arası boşluk verilir.",
    code: `.kapsayici {
  display: flex;
  justify-content: center;  /* yatay ortala */
  align-items: center;      /* dikey ortala */
  gap: 16px;
}` },
  { id: "css-grid", cat: "CSS", weight: 1.0,
    q: "grid ızgara düzen iki boyutlu css layout kolon",
    title: "CSS Grid",
    a: "Grid iki boyutlu (satır + sütun) düzen sistemidir; sayfa iskeletleri için flexbox'tan uygundur. fr birimi kalan alanı oranlar; repeat(auto-fill, minmax(...)) medya sorgusu olmadan duyarlı kart ızgarası kurar.",
    code: `.galeri {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;   /* ekrana sığdığı kadar sütun, otomatik sarma */
}` },
  { id: "css-specificity", cat: "CSS", weight: 1.0,
    q: "specificity özgüllük css hangi kural kazanır important",
    title: "CSS Özgüllük (Specificity)",
    a: "Çakışan kurallarda özgüllüğü yüksek olan kazanır: inline stil > id (#) > sınıf/öznitelik/sözde-sınıf (.) > etiket. Eşitse sonra yazılan kazanır. !important her şeyi ezer ama bakımı zorlaştırır — son çare olarak kullanın.",
    code: `p { color: blue; }            /* (0,0,1) */
.metin { color: green; }       /* (0,1,0) kazanır */
#ozel { color: red; }          /* (1,0,0) hepsini ezer */` },
  { id: "css-boxmodel", cat: "CSS", weight: 1.0,
    q: "box model kutu modeli padding margin border box-sizing",
    title: "CSS Kutu Modeli",
    a: "Her eleman içerik + padding + border + margin katmanlarından oluşur. Varsayılan content-box'ta width yalnızca içeriktir; box-sizing: border-box ile width padding ve border'ı da kapsar — modern projelerde evrensel resetin parçasıdır.",
    code: `*, *::before, *::after {
  box-sizing: border-box;   /* width = içerik + padding + border */
}` },
  { id: "html-semantic", cat: "HTML", weight: 1.0,
    q: "semantik html etiket erişilebilirlik seo neden div yerine",
    title: "Semantik HTML",
    a: "header, nav, main, article, section, footer gibi etiketler içeriğin ANLAMINI taşır; ekran okuyucular ve arama motorları sayfayı doğru yorumlar. Her şeyi div yapmak çalışır ama erişilebilirliği ve SEO'yu zayıflatır. Tıklanabilir öğe için div değil button kullanın — klavye desteği bedavaya gelir.",
    code: `<header><nav>...</nav></header>
<main>
  <article><h1>Başlık</h1>...</article>
</main>
<footer>...</footer>` },

  // ---------- NODE.JS & BACKEND ----------
  { id: "node-nedir", cat: "Node.js", weight: 1.0,
    q: "node.js nedir sunucu tarafı javascript v8 çalışma ortamı",
    title: "Node.js Nedir?",
    a: "Node.js, Chrome'un V8 motorunu tarayıcı dışına taşıyan JavaScript çalışma ortamıdır. Olay güdümlü, engellemesiz I/O modeli sayesinde tek iş parçacığıyla binlerce eşzamanlı bağlantıyı yönetir — API sunucuları ve gerçek zamanlı uygulamalar için idealdir; CPU-yoğun işler için worker_threads gerekir.",
    code: `import http from "node:http";
http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ mesaj: "merhaba" }));
}).listen(3000);` },
  { id: "node-npm", cat: "Node.js", weight: 1.0,
    q: "npm package.json bağımlılık semver sürüm yönetimi",
    title: "npm ve package.json",
    a: "package.json projenin kimliği ve bağımlılık listesidir; package-lock.json tam sürümleri kilitler ve commit edilmelidir. Semver: MAJOR.MINOR.PATCH — ^1.2.3 minor günceller, ~1.2.3 yalnız patch. dependencies üretimde, devDependencies yalnız geliştirmede gerekir. CI'da npm install yerine npm ci kullanın: lock dosyasına birebir uyar.",
    code: `npm ci                    # lock'a birebir kurulum (CI için)
npm outdated              # eskiyen paketleri gör
npm audit                 # bilinen güvenlik açıklarını tara` },
  { id: "node-middleware", cat: "Node.js", weight: 1.0,
    q: "middleware ara katman express next istek zinciri",
    title: "Express Middleware",
    a: "Middleware, istek-yanıt döngüsünde sırayla çalışan fonksiyonlardır: loglama, kimlik doğrulama, gövde ayrıştırma... next() çağrısı zinciri sürdürür; çağrılmazsa istek asılı kalır. Hata middleware'i 4 parametrelidir (err, req, res, next) ve en sona yazılır.",
    code: `app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();                          // zinciri sürdür
});
app.use((err, req, res, next) => { // hata yakalayıcı en sonda
  res.status(500).json({ hata: err.message });
});` },
  { id: "backend-cache", cat: "Backend", weight: 1.0,
    q: "cache önbellek redis ttl invalidation performans strateji",
    title: "Önbellekleme (Caching)",
    a: "Önbellek, pahalı işlem sonuçlarını hızlı erişimli katmanda (bellek, Redis) saklar. Cache-aside deseni en yaygınıdır: önce önbelleğe bak, yoksa kaynaktan getir ve yaz. En zor problem geçersiz kılmadır (invalidation) — TTL (süre aşımı) en güvenli başlangıçtır. Ünlü söz: 'Bilgisayar biliminde iki zor şey vardır: cache invalidation ve isimlendirme.'",
    code: `async function kullaniciGetir(id) {
  const k = await redis.get("user:" + id);
  if (k) return JSON.parse(k);                 // önbellek isabet
  const veri = await db.query("...", [id]);    // ıskalama → kaynak
  await redis.set("user:" + id, JSON.stringify(veri), "EX", 300);
  return veri;
}` },
  { id: "backend-queue", cat: "Backend", weight: 1.0,
    q: "message queue mesaj kuyruğu rabbitmq kafka asenkron işleme",
    title: "Mesaj Kuyrukları",
    a: "Mesaj kuyruğu (RabbitMQ, Kafka, SQS) üretici ile tüketiciyi ayrıştırır: e-posta gönderimi gibi yavaş işler kuyruğa atılır, API anında yanıt döner, işçi süreçler arkada tüketir. Kazançlar: yük tepelerini emme, hata halinde yeniden deneme, servislerin bağımsız ölçeklenmesi. Mesajlar en-az-bir-kez teslim edilebilir; tüketiciler idempotent olmalıdır.",
    code: `// API: işi kuyruğa at, bekletme
await kuyruk.add("eposta", { kime, konu });
res.status(202).json({ durum: "kuyrukta" });

// İşçi süreç: arkada tüket
kuyruk.process("eposta", async is => await gonder(is.data));` },
  { id: "backend-microservice", cat: "Backend", weight: 1.0,
    q: "microservice mikroservis monolith monolit mimari karşılaştırma",
    title: "Monolit vs Mikroservis",
    a: "Monolit tek dağıtılabilir uygulamadır: basit, hızlı geliştirilir, tek veritabanı işlemi kolaydır. Mikroservisler bağımsız dağıtılan küçük servislerdir: ekipler ve ölçekleme bağımsızlaşır ama ağ hataları, dağıtık izleme ve veri tutarlılığı maliyeti gelir. Doğru sıra çoğunlukla: iyi modüllenmiş monolitle başla, gerçek ihtiyaç doğunca böl.",
    code: `# Monolit: tek dağıtım
app/ ├── siparis/ ├── odeme/ ├── kullanici/

# Mikroservis: ayrı dağıtımlar + ağ üzerinden konuşma
siparis-servisi/   odeme-servisi/   kullanici-servisi/` },

  // ---------- LINUX & KOMUT SATIRI ----------
  { id: "linux-temel", cat: "Linux", weight: 1.0,
    q: "linux temel komutlar ls cd dosya dizin gezinme terminal",
    title: "Temel Linux Komutları",
    a: "ls listeler (-la gizli+detay), cd dizin değiştirir, pwd konumu gösterir, cp kopyalar, mv taşır/yeniden adlandırır, rm siler (-r dizin için), mkdir dizin açar, cat dosya basar, less sayfalayarak gösterir. rm geri alınamaz — özellikle -rf ile iki kez düşünün.",
    code: `ls -lah              # detaylı + gizli + okunur boyut
cd projeler/api      # dizine gir
cp ayar.json ayar.bak
mv eski.txt yeni.txt
mkdir -p a/b/c       # iç içe oluştur` },
  { id: "linux-grep-find", cat: "Linux", weight: 1.0,
    q: "grep find arama dosya içerik bulma komut satırı",
    title: "grep ve find ile Arama",
    a: "grep dosya İÇERİĞİNDE desen arar (-r özyinelemeli, -i harf duyarsız, -n satır numarası). find dosya ADI/özelliğiyle arar (isim, boyut, tarih). İkisi birleşir: find ile bul, grep ile içine bak.",
    code: `grep -rn "TODO" src/            # içerikte ara
find . -name "*.log" -mtime +7  # 7 günden eski loglar
find . -name "*.js" -exec grep -l "fetch" {} +` },
  { id: "linux-pipe", cat: "Linux", weight: 1.0,
    q: "pipe boru yönlendirme stdout stdin komut zinciri",
    title: "Pipe ve Yönlendirme",
    a: "| bir komutun çıktısını diğerinin girdisine bağlar; küçük araçlar zincirlenerek güçlü işlemler kurulur. > dosyaya yazar (üzerine), >> ekler, 2> hata akışını yönlendirir, 2>&1 hatayı çıktıya birleştirir.",
    code: `ps aux | grep node | wc -l        # kaç node süreci var
sort erisim.log | uniq -c | sort -rn | head   # en sık satırlar
komut > cikti.txt 2>&1            # her şeyi dosyaya` },
  { id: "linux-permission", cat: "Linux", weight: 1.0,
    q: "chmod chown izin yetki dosya sahiplik 755 644",
    title: "Dosya İzinleri",
    a: "İzinler kullanıcı/grup/diğerleri için okuma(4) yazma(2) çalıştırma(1) toplamıdır: 755 = sahibi her şey, diğerleri okur+çalıştırır; 644 = sahibi okur+yazar, diğerleri okur. chmod izin değiştirir, chown sahiplik. Betiklere +x gerekir; 777'den kaçının — herkese tam yetki güvenlik deliğidir.",
    code: `chmod +x dagit.sh        # çalıştırılabilir yap
chmod 644 ayar.conf      # standart dosya izni
chown deploy:web /var/www -R` },
  { id: "linux-ssh", cat: "Linux", weight: 1.0,
    q: "ssh uzak sunucu bağlantı anahtar scp güvenli",
    title: "SSH ile Uzak Bağlantı",
    a: "SSH, uzak makineye şifreli kabuk erişimidir. Parola yerine anahtar çifti kullanın: ssh-keygen ile üret, ssh-copy-id ile sunucuya kur. scp/rsync dosya kopyalar; rsync yalnız farkları taşıdığı için büyük dizinlerde çok hızlıdır.",
    code: `ssh-keygen -t ed25519
ssh-copy-id kullanici@sunucu
ssh kullanici@sunucu
rsync -avz ./site/ kullanici@sunucu:/var/www/` },

  // ---------- AĞ ----------
  { id: "net-tcp-udp", cat: "Ağ", weight: 1.0,
    q: "tcp udp fark protokol güvenilir hızlı paket",
    title: "TCP vs UDP",
    a: "TCP bağlantılıdır: paket sırası, teslim garantisi ve akış kontrolü sağlar — web, e-posta, dosya aktarımı. UDP garantisiz ama düşük gecikmelidir — canlı yayın, oyun, DNS. HTTP/3'ün altındaki QUIC, UDP üstüne güvenilirlik ekleyerek ikisinin iyi yanlarını birleştirir.",
    code: `TCP: el sıkışma → sıralı, garantili akış (web, API)
UDP: ateşle-unut → hızlı, kayıp olabilir (oyun, canlı ses)` },
  { id: "net-dns", cat: "Ağ", weight: 1.0,
    q: "dns alan adı çözümleme ip kayıt a cname nasıl çalışır",
    title: "DNS Nasıl Çalışır?",
    a: "DNS, alan adını IP adresine çevirir: tarayıcı → işletim sistemi önbelleği → çözümleyici → kök → TLD (.com) → yetkili sunucu zinciri. Kayıt türleri: A (IPv4), AAAA (IPv6), CNAME (takma ad), MX (e-posta), TXT (doğrulama). TTL, kaydın önbellekte kalma süresidir — taşınma öncesi TTL'i düşürmek geçişi hızlandırır.",
    code: `dig ornek.com A +short      # IP'yi sorgula
dig ornek.com MX            # e-posta sunucuları
nslookup ornek.com 8.8.8.8  # belirli DNS'e sor` },
  { id: "net-https-tls", cat: "Ağ", weight: 1.0,
    q: "https tls ssl sertifika şifreleme el sıkışma güvenli",
    title: "HTTPS ve TLS",
    a: "HTTPS = HTTP + TLS şifrelemesi. El sıkışmada sunucu sertifikasını sunar; tarayıcı, sertifika otoritesi (CA) zinciriyle doğrular; ardından simetrik oturum anahtarı üzerinde anlaşılır. Sertifika alan adını ve sahipliği kanıtlar, Let's Encrypt ile ücretsizdir. TLS 1.2 asgari, 1.3 tercihtir.",
    code: `# Ücretsiz sertifika (Let's Encrypt)
certbot --nginx -d ornek.com
# Sertifikayı incele
openssl s_client -connect ornek.com:443 | openssl x509 -text` },
  { id: "net-websocket", cat: "Ağ", weight: 1.0,
    q: "websocket gerçek zamanlı çift yönlü bağlantı socket sse",
    title: "WebSocket",
    a: "WebSocket, tek HTTP el sıkışmasıyla açılan kalıcı çift yönlü kanaldır: sunucu istemciye anında veri itebilir — sohbet, canlı skor, işbirliği araçları. Tek yönlü sunucu→istemci akışı yeterliyse daha basit olan SSE (Server-Sent Events) düşünün; istek-yanıt yapısı yetiyorsa normal HTTP kalsın.",
    code: `const ws = new WebSocket("wss://sunucu/kanal");
ws.onmessage = e => goster(JSON.parse(e.data));
ws.send(JSON.stringify({ tip: "mesaj", metin: "selam" }));` },
  { id: "net-graphql", cat: "Ağ", weight: 1.0,
    q: "graphql rest karşılaştırma sorgu şema over-fetching",
    title: "GraphQL vs REST",
    a: "GraphQL'de istemci tam olarak istediği alanları sorgular — REST'in fazla/eksik veri çekme (over/under-fetching) sorununu çözer ve tek istekte ilişkili verileri getirir. Bedeli: sunucu tarafı karmaşıklık, önbellekleme zorluğu, sorgu maliyet kontrolü ihtiyacı. Basit CRUD API'lerde REST çoğunlukla yeterlidir.",
    code: `query {
  kullanici(id: 7) {
    ad
    siparisler(son: 3) { tutar tarih }
  }
}  # tek istek, tam istenen alanlar` },

  // ---------- VERİ YAPILARI ----------
  { id: "ds-stack-queue", cat: "Veri Yapıları", weight: 1.0,
    q: "stack queue yığın kuyruk lifo fifo veri yapısı",
    title: "Stack ve Queue",
    a: "Stack (yığın) LIFO'dur: son giren ilk çıkar — geri al (undo), fonksiyon çağrı yığını, parantez eşleme. Queue (kuyruk) FIFO'dur: ilk giren ilk çıkar — iş kuyrukları, BFS. JS'te stack için push/pop; kuyruk için shift O(n) olduğundan büyük veride deque mantığı kurun.",
    code: `const yigin = [];
yigin.push(1); yigin.push(2);
yigin.pop();        // 2 — LIFO

const kuyruk = [];
kuyruk.push(1); kuyruk.push(2);
kuyruk.shift();     // 1 — FIFO` },
  { id: "ds-linkedlist", cat: "Veri Yapıları", weight: 1.0,
    q: "linked list bağlı liste düğüm pointer dizi farkı",
    title: "Bağlı Liste (Linked List)",
    a: "Bağlı listede her düğüm veriyi ve sonraki düğümün referansını tutar. Başa ekleme/silme O(1)'dir ama i. öğeye erişim O(n) — dizinin tam tersi. Bellekte dağınık durduğu için önbellek dostluğu düşüktür; pratikte dinamik diziler çoğu senaryoda kazanır ama mülakatların klasiğidir.",
    code: `class Dugum {
  constructor(deger) { this.deger = deger; this.sonraki = null; }
}
// başa ekleme O(1):
const yeni = new Dugum(5);
yeni.sonraki = bas;
bas = yeni;` },
  { id: "ds-heap", cat: "Veri Yapıları", weight: 1.0,
    q: "heap öncelik kuyruğu priority queue min max en küçük",
    title: "Heap ve Öncelik Kuyruğu",
    a: "Heap, en küçük (min-heap) veya en büyük (max-heap) öğeye O(1) bakış, O(log n) ekleme/çıkarma sağlayan ağaç yapısıdır. Öncelik kuyruklarının standart gerçeklemesidir: görev zamanlayıcılar, Dijkstra, 'en büyük K öğe' problemleri. Python'da heapq modülü min-heap sunar.",
    code: `import heapq
h = []
heapq.heappush(h, (2, "orta"))
heapq.heappush(h, (1, "acil"))
heapq.heappop(h)   # (1, 'acil') — en küçük öncelik önce` },
  { id: "ds-trie", cat: "Veri Yapıları", weight: 1.0,
    q: "trie önek ağacı otomatik tamamlama prefix arama",
    title: "Trie (Önek Ağacı)",
    a: "Trie, kelimeleri karakter karakter ağaçta saklar; ortak önekler paylaşılır. Bir önekle başlayan tüm kelimeleri O(önek uzunluğu) sürede bulur — otomatik tamamlama, sözlük denetimi, IP yönlendirme tablolarının temelidir.",
    code: `           kök
          /   \\
        k       s
        |       |
        o       u   → "kod", "kota" ortak 'ko' dalını paylaşır
       / \\
      d   t` },
  { id: "ds-set-map", cat: "Veri Yapıları", weight: 1.0,
    q: "set map küme benzersiz üyelik hızlı arama javascript python",
    title: "Set ve Map",
    a: "Set benzersiz değerler tutar; üyelik testi O(1)'dir — 'daha önce gördüm mü?' sorusunun doğru yapısıdır, dizide includes O(n) taramaya düşmeyin. Map anahtar-değer tutar ve JS'te düz nesneden farklı olarak her tipte anahtar kabul eder, ekleme sırasını korur ve size özelliği vardır.",
    code: `const gorulen = new Set();
for (const x of veri) {
  if (gorulen.has(x)) continue;   // O(1)
  gorulen.add(x);
}` },

  // ---------- ALGORİTMALAR (EK) ----------
  { id: "algo-mergesort", cat: "Algoritmalar", weight: 1.0,
    q: "merge sort birleştirme sıralaması kararlı stable böl fethet",
    title: "Merge Sort",
    a: "Merge sort diziyi ikiye böler, yarıları özyinelemeli sıralar ve birleştirir. HER durumda O(n log n) garantidir ve kararlıdır (eşit öğelerin sırası korunur) — quicksort'un en kötü O(n²) riskine karşı güvenli seçimdir. Bedeli O(n) ek bellek.",
    code: `def merge_sort(d):
    if len(d) <= 1: return d
    orta = len(d) // 2
    sol, sag = merge_sort(d[:orta]), merge_sort(d[orta:])
    out, i, j = [], 0, 0
    while i < len(sol) and j < len(sag):
        if sol[i] <= sag[j]: out.append(sol[i]); i += 1
        else:                out.append(sag[j]); j += 1
    return out + sol[i:] + sag[j:]` },
  { id: "algo-dijkstra", cat: "Algoritmalar", weight: 1.0,
    q: "dijkstra en kısa yol ağırlıklı graf navigasyon rota",
    title: "Dijkstra En Kısa Yol",
    a: "Dijkstra, ağırlıklı grafta tek kaynaktan tüm düğümlere en kısa yolu bulur: her adımda öncelik kuyruğundan en yakın işlenmemiş düğümü alır ve komşularının mesafesini gevşetir. Karmaşıklık O((V+E) log V). Negatif kenar ağırlığında çalışmaz — o durumda Bellman-Ford gerekir. Navigasyon ve ağ yönlendirmenin temelidir.",
    code: `import heapq
def dijkstra(graf, kaynak):
    mesafe = {d: float("inf") for d in graf}; mesafe[kaynak] = 0
    pq = [(0, kaynak)]
    while pq:
        m, d = heapq.heappop(pq)
        if m > mesafe[d]: continue
        for komsu, agirlik in graf[d]:
            yeni = m + agirlik
            if yeni < mesafe[komsu]:
                mesafe[komsu] = yeni
                heapq.heappush(pq, (yeni, komsu))
    return mesafe` },
  { id: "algo-two-pointer", cat: "Algoritmalar", weight: 1.0,
    q: "two pointer iki işaretçi sliding window kayan pencere teknik",
    title: "İki İşaretçi ve Kayan Pencere",
    a: "İki işaretçi, sıralı dizide iki uçtan yaklaşarak O(n²) çözümleri O(n)'e indirir (ör. toplamı hedef olan çift). Kayan pencere, ardışık alt dizi problemlerinde pencereyi kaydırıp yalnızca giren/çıkan öğeyi günceller — 'en uzun tekrarsız alt dize' klasiğinin anahtarıdır.",
    code: `def cift_bul(sirali, hedef):     # iki işaretçi, O(n)
    i, j = 0, len(sirali) - 1
    while i < j:
        t = sirali[i] + sirali[j]
        if t == hedef: return (i, j)
        if t < hedef:  i += 1
        else:          j -= 1
    return None` },
  { id: "algo-recursion", cat: "Algoritmalar", weight: 1.0,
    q: "recursion özyineleme taban durumu stack overflow kendini çağırma",
    title: "Özyineleme (Recursion)",
    a: "Özyinelemeli fonksiyon kendini daha küçük girdiyle çağırır. İki zorunlu parça: taban durumu (durma koşulu) ve her çağrıda ona yaklaşma — yoksa stack overflow. Ağaç/graf gezinme ve böl-fethet için doğaldır; derin özyineleme döngüye veya açık yığına çevrilebilir.",
    code: `def faktoriyel(n):
    if n <= 1:                 # taban durumu — şart!
        return 1
    return n * faktoriyel(n - 1)   # küçülen problem` },
  { id: "algo-greedy", cat: "Algoritmalar", weight: 1.0,
    q: "greedy açgözlü algoritma yerel optimum seçim para üstü",
    title: "Açgözlü (Greedy) Algoritmalar",
    a: "Açgözlü yaklaşım her adımda yerel en iyi seçimi yapar ve geri dönmez. Doğru problemde (para üstü — standart madeni paralarla, aralık zamanlama, Huffman, Dijkstra) optimal ve çok hızlıdır; ama her problemde çalışmaz — yerel en iyi, küresel en iyiyi garanti etmez, kanıt ister.",
    code: `def para_ustu(tutar, paralar=[200, 100, 50, 25, 10, 5, 1]):
    sonuc = []
    for p in paralar:                # en büyükten küçüğe
        while tutar >= p:
            sonuc.append(p); tutar -= p
    return sonuc` },

  // ---------- OOP & TASARIM ----------
  { id: "oop-temel", cat: "Tasarım", weight: 1.0,
    q: "oop nesne yönelimli kalıtım kapsülleme polimorfizm soyutlama",
    title: "OOP'nin 4 Temeli",
    a: "Kapsülleme: veri ve davranış birlikte, iç durum gizli. Soyutlama: karmaşıklık arayüz arkasında. Kalıtım: ortak davranışın üst sınıftan devri ('bir türüdür' ilişkisi). Polimorfizm: aynı arayüzün farklı tiplerce farklı gerçeklenmesi. Modern eğilim: derin kalıtım hiyerarşisi yerine bileşim (composition over inheritance).",
    code: `class Sekil:
    def alan(self): raise NotImplementedError
class Daire(Sekil):
    def __init__(self, r): self.r = r
    def alan(self): return 3.14159 * self.r ** 2
class Kare(Sekil):
    def __init__(self, k): self.k = k
    def alan(self): return self.k ** 2
# polimorfizm: sum(s.alan() for s in sekiller)` },
  { id: "design-solid", cat: "Tasarım", weight: 1.0,
    q: "solid ilkeleri single responsibility open closed tasarım prensip",
    title: "SOLID İlkeleri",
    a: "S — Tek Sorumluluk: sınıfın tek değişme nedeni olsun. O — Açık/Kapalı: davranış eklerken mevcut kodu değiştirme, genişlet. L — Liskov: alt sınıf, üst sınıfın yerine sorunsuz geçebilmeli. I — Arayüz Ayrımı: dev arayüz yerine küçük odaklı arayüzler. D — Bağımlılık Tersine Çevirme: somut sınıfa değil soyutlamaya bağlan — test edilebilirliğin anahtarı.",
    code: `# D örneği: somuta değil soyuta bağlan
class Bildirici(Protocol):
    def gonder(self, mesaj: str): ...

class SiparisServisi:
    def __init__(self, bildirici: Bildirici):  # e-posta? SMS? fark etmez
        self.bildirici = bildirici` },
  { id: "design-singleton-factory", cat: "Tasarım", weight: 1.0,
    q: "singleton factory tasarım deseni design pattern nesne oluşturma",
    title: "Singleton ve Factory Desenleri",
    a: "Singleton, sınıftan tek örnek olmasını garantiler (ayar, bağlantı havuzu) — ama küresel durum yarattığı için testleri zorlaştırır, dikkatli kullanın. Factory, nesne oluşturma mantığını merkezileştirir: çağıran 'ne' istediğini söyler, 'nasıl' kurulduğunu factory bilir.",
    code: `function odemeOlustur(tip) {          // factory
  switch (tip) {
    case "kart":   return new KartOdeme();
    case "havale": return new HavaleOdeme();
    default: throw new Error("Bilinmeyen tip: " + tip);
  }
}` },
  { id: "design-observer", cat: "Tasarım", weight: 1.0,
    q: "observer gözlemci event emitter yayıncı abone pub sub deseni",
    title: "Observer / Pub-Sub Deseni",
    a: "Observer'da nesne (yayıncı) durum değişince kayıtlı dinleyicilere haber verir; taraflar birbirini tanımaz, gevşek bağlılık doğar. DOM olayları, Node EventEmitter, React state abonelikleri ve mesaj sistemleri hep bu desendir.",
    code: `class Yayinci {
  #dinleyiciler = [];
  abone(fn) { this.#dinleyiciler.push(fn); }
  yayinla(veri) { this.#dinleyiciler.forEach(fn => fn(veri)); }
}
const y = new Yayinci();
y.abone(v => console.log("geldi:", v));
y.yayinla({ olay: "kayit" });` },
  { id: "design-dry-kiss", cat: "Tasarım", weight: 1.0,
    q: "dry kiss yagni ilke tekrar basitlik gereksiz özellik",
    title: "DRY, KISS, YAGNI",
    a: "DRY: aynı BİLGİYİ iki yerde tutma — ama tesadüfen benzeyen kodu erken soyutlamak yanlış DRY'dır. KISS: çalışan en basit çözümü seç; zekice kod, okunabilir kodun düşmanıdır. YAGNI: 'ileride lazım olur' diye özellik yazma — ihtiyaç somutlaşınca yaz. Üçü birlikte aşırı mühendisliğe karşı pusuladır.",
    code: `# YAGNI ihlali: kimse istememişken
def hesapla(veri, mod="v1", legacy=False, plugin=None, cache_strategy=None): ...
# Yeterli olan:
def hesapla(veri): ...` },

  // ---------- PYTHON (EK) ----------
  { id: "py-asyncio", cat: "Python", weight: 1.0,
    q: "asyncio async await python eşzamanlı görev gather",
    title: "Python asyncio",
    a: "asyncio, tek iş parçacığında işbirlikçi eşzamanlılık sağlar: await noktalarında kontrol döngüye bırakılır, I/O beklerken başka görevler koşar. asyncio.gather görevleri paralel bekler. CPU-yoğun işte faydası yoktur (GIL'e takılır); ağ-yoğun binlerce istek için mükemmeldir.",
    code: `import asyncio, aiohttp

async def getir(oturum, url):
    async with oturum.get(url) as y:
        return await y.json()

async def main(urller):
    async with aiohttp.ClientSession() as o:
        return await asyncio.gather(*(getir(o, u) for u in urller))
# 100 istek ardışık ~100 sn ise, gather ile ~1-2 sn` },
  { id: "py-typehints", cat: "Python", weight: 1.0,
    q: "type hint tip ipucu mypy annotation python statik",
    title: "Python Type Hints",
    a: "Tip ipuçları çalışma zamanını değiştirmez; mypy/pyright gibi araçlar ve IDE'ler için bildirimdir. Büyük kod tabanlarında hataları erkenden yakalar ve dokümantasyon görevi görür. Python 3.10+ ile X | None sözdizimi Optional'ın yerini aldı.",
    code: `def bul(kimlik: int, varsayilan: str | None = None) -> dict[str, str]:
    ...
# mypy: yanlış tiple çağrıyı commit'ten önce yakalar` },
  { id: "py-context", cat: "Python", weight: 1.0,
    q: "with context manager bağlam yöneticisi dosya kaynak kapatma",
    title: "Context Manager (with)",
    a: "with bloğu, kaynakların hata olsa bile kapatılmasını garantiler — dosyalar, kilitler, veritabanı bağlantıları. Protokol __enter__/__exit__ metotlarıdır; contextlib.contextmanager dekoratörüyle generator'dan kolayca üretilir.",
    code: `from contextlib import contextmanager

@contextmanager
def zamanla(ad):
    import time; t0 = time.perf_counter()
    try:
        yield
    finally:
        print(f"{ad}: {time.perf_counter()-t0:.3f}s")

with zamanla("sorgu"):
    calistir()` },
  { id: "py-dunder", cat: "Python", weight: 1.0,
    q: "dunder magic method __init__ __repr__ __eq__ özel metot",
    title: "Dunder (Magic) Metotlar",
    a: "Çift alt çizgili metotlar Python'un operatörlerini ve yerleşiklerini sınıfınıza bağlar: __init__ kurucu, __repr__ hata ayıklama gösterimi, __eq__ eşitlik, __len__ len(), __iter__ döngü desteği. dataclass dekoratörü __init__/__repr__/__eq__'i otomatik üretir.",
    code: `from dataclasses import dataclass

@dataclass
class Nokta:
    x: float
    y: float
# __init__, __repr__, __eq__ hazır:
Nokta(1, 2) == Nokta(1, 2)   # True` },
  { id: "py-pandas", cat: "Python", weight: 1.0,
    q: "pandas dataframe veri analizi csv filtreleme groupby",
    title: "Pandas Temelleri",
    a: "Pandas, tablo verisini DataFrame yapısında işler: CSV/Excel/SQL okuma, filtreleme, gruplama, birleştirme. Satır satır döngü yerine vektörel işlemler kullanın — 10-100 kat hızlıdır. groupby + agg, SQL'in GROUP BY karşılığıdır.",
    code: `import pandas as pd
df = pd.read_csv("satis.csv")
buyuk = df[df["tutar"] > 1000]                 # filtre
ozet = df.groupby("sehir")["tutar"].agg(["sum", "mean"])
df["kdvli"] = df["tutar"] * 1.20               # vektörel — döngüsüz` },

  // ---------- JAVASCRIPT (EK) ----------
  { id: "js-modules", cat: "JavaScript", weight: 1.0,
    q: "es module import export commonjs require modül sistemi",
    title: "ES Modülleri",
    a: "ESM (import/export) standarttır: statik analiz edilebilir, tree-shaking'e (kullanılmayan kodun atılması) izin verir. CommonJS (require) Node'un eski sistemidir. Named export birden çok olur; default tektir. Tarayıcıda type=\"module\" gerekir.",
    code: `// util.js
export function topla(a, b) { return a + b; }
export default class Hesap {}

// app.js
import Hesap, { topla } from "./util.js";` },
  { id: "js-optional-chain", cat: "JavaScript", weight: 1.0,
    q: "optional chaining nullish coalescing soru işareti güvenli erişim",
    title: "?. ve ?? Operatörleri",
    a: "Optional chaining (?.) ara değer null/undefined ise hata yerine undefined döner — derin nesne erişimini güvenli kılar. Nullish coalescing (??) yalnızca null/undefined'da varsayılan uygular; || ise 0 ve boş dizeyi de ezer, bu farkı bilmek hataları önler.",
    code: `const sehir = kullanici?.adres?.sehir;   // güvenli erişim
const adet = ayar.adet ?? 10;   // 0 girilmişse 0 KALIR
const yanlis = ayar.adet || 10; // 0 girilse bile 10 olur!` },
  { id: "js-destructure", cat: "JavaScript", weight: 1.0,
    q: "destructuring yapı bozma spread rest operatörü üç nokta",
    title: "Destructuring ve Spread/Rest",
    a: "Destructuring, nesne/diziden değişkenleri tek satırda söker; varsayılan değer ve yeniden adlandırma destekler. Spread (...) yayar: dizileri birleştirme, nesneyi kopyalayıp alan değiştirme (immutable güncelleme). Rest, kalan öğeleri toplar.",
    code: `const { ad, yas = 18 } = kullanici;
const [ilk, ...kalan] = [1, 2, 3, 4];
const guncel = { ...eski, aktif: true };   // kopya + değişiklik` },
  { id: "js-strict-eq", cat: "JavaScript", weight: 1.0,
    q: "== === fark tip dönüşümü karşılaştırma eşitlik",
    title: "== vs ===",
    a: "=== tip dönüşümü yapmadan karşılaştırır; == önce tipleri zorla dönüştürür ve '0' == 0, [] == false gibi sürpriz sonuçlar üretir. Kural nettir: daima === kullanın. Tek yaygın istisna: x == null hem null hem undefined'ı yakalar.",
    code: `"5" == 5     // true  — sinsi dönüşüm
"5" === 5    // false — doğru davranış
null == undefined   // true (bilinçli istisna)` },
  { id: "js-localstorage", cat: "JavaScript", weight: 1.0,
    q: "localstorage sessionstorage tarayıcı depolama kalıcı veri",
    title: "localStorage",
    a: "localStorage, alan adına özel ~5MB kalıcı anahtar-değer deposudur; sekme kapansa da durur (sessionStorage sekmeyle silinir). Yalnız string tutar — nesneler JSON ile çevrilir. Senkron çalışır, hassas veri (token) için XSS riski nedeniyle dikkatli olun. Vega'nın hafızası da burada durur.",
    code: `localStorage.setItem("ayar", JSON.stringify({ tema: "koyu" }));
const ayar = JSON.parse(localStorage.getItem("ayar") ?? "{}");
localStorage.removeItem("ayar");` },
  { id: "js-fetch-error", cat: "JavaScript", weight: 1.0,
    q: "fetch hata yönetimi response ok 404 yakalama",
    title: "fetch'te Hata Yönetimi Tuzağı",
    a: "fetch, 404/500 gibi HTTP hatalarında REJECT ETMEZ — yalnızca ağ hatasında reddeder. response.ok (200-299) elle kontrol edilmelidir; bu, en yaygın fetch hatasıdır.",
    code: `const y = await fetch(url);
if (!y.ok) {                       // 404 de buraya düşer!
  throw new Error("HTTP " + y.status);
}
const veri = await y.json();` },

  // ---------- MAKİNE ÖĞRENMESİ ----------
  { id: "ml-supervised", cat: "Yapay Zeka", weight: 1.0,
    q: "supervised unsupervised denetimli denetimsiz öğrenme etiket",
    title: "Denetimli vs Denetimsiz Öğrenme",
    a: "Denetimli öğrenmede model etiketli örneklerden (girdi → doğru çıktı) öğrenir: sınıflandırma (spam mı?) ve regresyon (fiyat tahmini). Denetimsizde etiket yoktur; model yapıyı kendisi bulur: kümeleme (müşteri segmentleri), boyut indirgeme. Üçüncü tür pekiştirmeli öğrenme: deneme-yanılma + ödül (oyun, robotik).",
    code: `Denetimli:   (e-posta, "spam") çiftleri → spam filtresi
Denetimsiz:  yalnız e-postalar → benzer gruplar kendiliğinden
Pekiştirmeli: hamle → ödül/ceza → strateji (AlphaGo)` },
  { id: "ml-gradient", cat: "Yapay Zeka", weight: 1.0,
    q: "gradient descent gradyan inişi öğrenme oranı loss kayıp minimizasyon",
    title: "Gradyan İnişi",
    a: "Gradyan inişi, kayıp fonksiyonunu minimize etmek için parametreleri hatanın en dik azaldığı yönde küçük adımlarla günceller: w = w − lr·∇L. Öğrenme oranı kritiktir: büyükse ıraksar, küçükse sürünür. Pratikte mini-batch + Adam optimizer standarttır; tüm derin öğrenme eğitimi bu döngüdür.",
    code: `# Tek parametreli gradyan inişi
w, lr = 0.0, 0.1
for _ in range(100):
    grad = 2 * (w - 3)      # L = (w-3)² kaybının türevi
    w -= lr * grad          # w → 3'e yakınsar` },
  { id: "ml-train-test", cat: "Yapay Zeka", weight: 1.0,
    q: "train test split veri ayırma doğrulama seti leakage sızıntı",
    title: "Eğitim/Test Ayrımı ve Veri Sızıntısı",
    a: "Veri; eğitim (öğren), doğrulama (ayar seç), test (SON değerlendirme — tek kez) olarak ayrılır, tipik 70/15/15. Veri sızıntısı, test bilgisinin eğitime karışmasıdır (ölçekleyiciyi tüm veride fit etmek, zaman serisinde rastgele bölmek) — skorları sahte şişirir, üretimde çöker.",
    code: `from sklearn.model_selection import train_test_split
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42)
scaler.fit(X_tr)              # SADECE eğitim verisinde fit
X_te = scaler.transform(X_te) # test yalnız transform` },
  { id: "ml-rag", cat: "Yapay Zeka", weight: 1.0,
    q: "rag retrieval augmented generation bilgi getirme llm halüsinasyon",
    title: "RAG (Retrieval-Augmented Generation)",
    a: "RAG, dil modelinin cevabını harici bilgiyle güçlendirir: soru embedding'e çevrilir, vektör veritabanından ilgili belgeler getirilir ve modele bağlam olarak verilir. Halüsinasyonu azaltır, güncel/özel veriyle çalışmayı sağlar ve yeniden eğitim gerektirmez. Vega'nın 'ara-sonra-cevapla' akışı da aynı ailedendir.",
    code: `Soru → embedding → vektör DB araması (top-k belge)
     → "Şu belgelere dayanarak cevapla: [...]" → LLM → yanıt` },
  { id: "ml-finetune", cat: "Yapay Zeka", weight: 1.0,
    q: "fine-tuning ince ayar prompt engineering hangisi ne zaman lora",
    title: "Fine-tuning vs Prompt Engineering",
    a: "Sıralama maliyete göre: önce iyi prompt (talimat + örnekler), sonra RAG (bilgi sorunuysa), en son fine-tuning (üslup/format tutarlılığı ve dar görev uzmanlığı için). Fine-tuning modele yeni GERÇEK bilgi eklemenin güvenilir yolu değildir — bilgi için RAG doğru araçtır. LoRA, tam eğitim yerine küçük ek matrisler eğiterek maliyeti düşürür.",
    code: `Sorun: model formatı tutturamıyor → few-shot örnekli prompt
Sorun: şirket verisini bilmiyor   → RAG
Sorun: dar görevde üslup/tutarlılık → fine-tuning (LoRA)` },
  { id: "ml-metrics", cat: "Yapay Zeka", weight: 1.0,
    q: "precision recall accuracy f1 kesinlik duyarlılık metrik dengesiz",
    title: "Precision, Recall, F1",
    a: "Accuracy dengesiz veride yanıltır: %99'u sağlıklı olan veride 'hep sağlıklı' diyen model %99 doğrudur ama işe yaramaz. Precision: pozitif dediklerinin ne kadarı gerçekten pozitif (yanlış alarm maliyeti). Recall: gerçek pozitiflerin ne kadarını yakaladın (kaçırma maliyeti). F1 ikisinin harmonik ortalamasıdır; seçim iş maliyetine göre yapılır.",
    code: `Spam filtresi: precision öncelikli (gerçek e-posta çöpe gitmesin)
Kanser taraması: recall öncelikli (vaka kaçmasın)
F1 = 2·P·R / (P + R)` },

  // ---------- GÜVENLİK & KRİPTO ----------
  { id: "sec-hashing", cat: "Güvenlik", weight: 1.0,
    q: "hash parola saklama bcrypt salt tek yönlü şifreleme farkı",
    title: "Parola Hash'leme",
    a: "Parolalar asla düz veya geri çözülebilir şifreyle saklanmaz; tek yönlü hash'lenir. SHA-256 tek başına YETMEZ — çok hızlıdır, kaba kuvvete açıktır. bcrypt/argon2 kasıtlı yavaştır ve salt (kayıt başına rastgele ek) gökkuşağı tablolarını kırar. Giriş kontrolü hash karşılaştırmasıyla yapılır.",
    code: `import bcrypt
hash_ = bcrypt.hashpw(parola.encode(), bcrypt.gensalt())
# doğrulama:
bcrypt.checkpw(girilen.encode(), hash_)   # True/False` },
  { id: "sec-symmetric", cat: "Güvenlik", weight: 1.0,
    q: "simetrik asimetrik şifreleme public key açık anahtar aes rsa",
    title: "Simetrik vs Asimetrik Şifreleme",
    a: "Simetrik (AES): aynı anahtar hem şifreler hem çözer — hızlıdır ama anahtarı güvenle paylaşma sorunu vardır. Asimetrik (RSA, eliptik eğri): açık anahtar şifreler, yalnız gizli anahtar çözer — anahtar paylaşımını çözer ama yavaştır. Pratikte TLS ikisini birleştirir: asimetrikle oturum anahtarı anlaşılır, veri simetrikle akar.",
    code: `Simetrik:  AES-256 → toplu veri şifreleme
Asimetrik: açık anahtarla şifrele → gizli anahtarla çöz
İmza: gizli anahtarla imzala → açıkla doğrula (ters yön)` },
  { id: "sec-2fa", cat: "Güvenlik", weight: 1.0,
    q: "2fa iki faktörlü doğrulama totp mfa hesap güvenliği",
    title: "İki Faktörlü Doğrulama (2FA)",
    a: "2FA, 'bildiğin şey' (parola) üstüne 'sahip olduğun şey' (telefon, donanım anahtarı) ekler; parola çalınsa bile hesabı korur. TOTP (kimlik doğrulama uygulamaları) paylaşılan gizden 30 saniyelik kodlar üretir. SMS en zayıf yöntemdir (SIM klonlama); donanım anahtarları (FIDO2/passkey) oltalamaya karşı en güçlüsüdür.",
    code: `TOTP = HMAC(gizli_anahtar, floor(unix_zaman / 30))
# sunucu ve uygulama aynı hesabı yapar, kod eşleşirse giriş` },
  { id: "sec-rate-limit", cat: "Güvenlik", weight: 1.0,
    q: "rate limiting hız sınırı brute force api koruma 429",
    title: "Rate Limiting",
    a: "Rate limiting, istemci başına istek hızını sınırlar: kaba kuvvet parola denemelerini, API kötüye kullanımını ve kaza kaynaklı aşırı yükü engeller. Aşımda 429 döner ve Retry-After başlığı eklenir. Yaygın algoritmalar: token bucket (patlamaya izinli) ve sliding window. Giriş uçlarında IP + hesap bazlı çift sınır kurun.",
    code: `# kavramsal token bucket
kova[ip] = min(KAPASITE, kova[ip] + gecen_sure * DOLUM_HIZI)
if kova[ip] < 1: return 429
kova[ip] -= 1  # isteği işle` },

  // ---------- SQL & VERİ (EK) ----------
  { id: "db-transaction", cat: "Veritabanı", weight: 1.0,
    q: "transaction acid işlem atomik commit rollback tutarlılık",
    title: "Transaction ve ACID",
    a: "Transaction, ya hep ya hiç çalışması gereken işlem grubudur: para transferinde çekme ve yatırma ikisi birden olur ya da hiçbiri. ACID: Atomicity (bölünmez), Consistency (kurallar korunur), Isolation (eşzamanlı işlemler karışmaz), Durability (commit kalıcıdır). Hata durumunda ROLLBACK her şeyi geri alır.",
    code: `BEGIN;
UPDATE hesap SET bakiye = bakiye - 100 WHERE id = 1;
UPDATE hesap SET bakiye = bakiye + 100 WHERE id = 2;
COMMIT;   -- hata olsaydı: ROLLBACK;` },
  { id: "db-nplus1", cat: "Veritabanı", weight: 1.0,
    q: "n+1 sorgu problemi orm eager loading performans yavaş",
    title: "N+1 Sorgu Problemi",
    a: "N+1, listeyi 1 sorguyla çekip her öğenin ilişkisini ayrı sorguyla getirmektir: 100 yazar için 101 sorgu. ORM'lerin en klasik performans tuzağıdır. Çözüm: JOIN veya eager loading ile tek/iki sorguya indirmek. Belirtisi: sayfa yavaş ve log'da aynı kalıpta yüzlerce sorgu.",
    code: `# HATALI: 1 + N sorgu
yazarlar = Yazar.objects.all()
for y in yazarlar: print(y.kitaplar.count())

# DOĞRU: tek seferde yükle
yazarlar = Yazar.objects.prefetch_related("kitaplar")` },
  { id: "db-nosql", cat: "Veritabanı", weight: 1.0,
    q: "nosql mongodb sql ne zaman belge document ilişkisel seçim",
    title: "SQL vs NoSQL",
    a: "İlişkisel (PostgreSQL, MySQL): şema, JOIN, güçlü transaction — ilişkili ve tutarlılık isteyen veri için varsayılan seçim. Belge tabanlı (MongoDB): esnek şema, iç içe JSON — hızlı evrilen ve belge bütün olarak okunan veri. Anahtar-değer (Redis): önbellek ve oturum. Kural: emin değilsen PostgreSQL ile başla; JSONB ile belge esnekliğini de verir.",
    code: `PostgreSQL JSONB — iki dünyanın ortası:
CREATE TABLE olaylar (id serial, veri jsonb);
SELECT * FROM olaylar WHERE veri->>'tip' = 'satis';` },

  // ---------- ÇALIŞMA & KARİYER ----------
  { id: "dev-code-review", cat: "Araçlar", weight: 1.0,
    q: "code review kod inceleme pull request geri bildirim nasıl",
    title: "İyi Kod İncelemesi",
    a: "İnceleme kişiyi değil kodu hedefler: 'şurası yanlış' yerine 'bu girdi null gelirse ne olur?'. Küçük PR'lar (≤400 satır) daha kaliteli incelenir. Otomatikleşebilen şeyi (format, lint) insana bırakmayın. Nit (küçük tercih) ile blocker'ı (gerçek hata) etiketle ayırın; iyi çözümleri de takdir edin.",
    code: `PR kontrol listesi:
□ Kenar durumlar (boş, null, çok büyük)?
□ Test eklendi mi / mevcutlar geçiyor mu?
□ İsimler niyeti anlatıyor mu?
□ Güvenlik: girdi doğrulama, yetki kontrolü?` },
  { id: "dev-debugging", cat: "Araçlar", weight: 1.0,
    q: "debugging hata ayıklama yöntem sistematik bug bulma",
    title: "Sistematik Hata Ayıklama",
    a: "1) Hatayı GÜVENİLİR şekilde yeniden üret — üretemediğin hatayı düzeltemezsin. 2) Alanı ikiye böl (binary search): hangi katman, hangi commit (git bisect)? 3) Varsayım kur, TEK değişiklikle test et. 4) Hata mesajını gerçekten OKU — cevap çoğunlukla içindedir. 5) Düzeltince neden olduğunu anla; anlamadan geçen düzeltme geri döner.",
    code: `git bisect start
git bisect bad            # şimdi bozuk
git bisect good v1.4      # burada sağlamdı
# git ortadaki commit'lere götürür → hatalı commit bulunur` },
  { id: "dev-ci-cd", cat: "DevOps", weight: 1.0,
    q: "ci cd sürekli entegrasyon dağıtım pipeline otomasyon github actions",
    title: "CI/CD",
    a: "CI (sürekli entegrasyon): her push'ta otomatik derleme + test — bozulma dakikalar içinde yakalanır. CD (sürekli dağıtım): testleri geçen kod otomatik/tek tuşla üretime çıkar. Küçük ve sık dağıtımlar, büyük ve nadir olanlardan daha az risklidir; sorun çıkarsa geri almak kolaydır.",
    code: `# .github/workflows/ci.yml
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm test` },
  { id: "dev-agile", cat: "Araçlar", weight: 1.0,
    q: "agile scrum sprint çevik metodoloji kanban standup",
    title: "Agile ve Scrum",
    a: "Agile'ın özü kısa döngülerle çalışan yazılım teslim edip geri bildirimle rota düzeltmektir. Scrum bunu sprint (1-4 hafta), günlük standup, sprint planlama ve retrospektifle yapılandırır. Kanban ise sürekli akış + devam eden iş limitiyle (WIP) çalışır. Töreni amaç sanmayın: toplantılar çıktıya hizmet etmiyorsa süreç bozulmuştur.",
    code: `Sprint döngüsü:
Planlama → günlük standup'lar → geliştirme
→ sprint review (demo) → retrospektif (süreci iyileştir) → tekrar` },
  { id: "dev-estimate", cat: "Araçlar", weight: 1.0,
    q: "tahmin estimation süre planlama neden gecikir yazılım",
    title: "Yazılımda Süre Tahmini",
    a: "Tahminler sistematik iyimserdir: mutlu yol düşünülür, entegrasyon/test/gözden geçirme unutulur (Hofstadter Yasası: her şey beklediğinden uzun sürer, bunu hesaba katsan bile). İşe yarayanlar: işi küçük parçalara böl, aralık ver (2-4 gün, '3 gün' değil), geçmiş gerçek verilere bak, belirsizliği yüksek işe önce keşif (spike) ayır.",
    code: `Kaba düzeltme: tahmin × 2 (entegrasyon, test, beklenmedikler)
Daha iyisi: parçala → her parça ≤ 1-2 gün → belirsizler için spike` },

  // ---------- KAVRAMLAR ----------
  { id: "cs-float", cat: "Kavramlar", weight: 1.0,
    q: "floating point ondalık 0.1 0.2 neden 0.3 değil kayan nokta",
    title: "0.1 + 0.2 ≠ 0.3 — Kayan Nokta",
    a: "IEEE 754 kayan nokta, sayıları ikilik kesirlerle saklar; 0.1 ikilikte sonsuz tekrarlıdır ve yuvarlanır — bu yüzden 0.1+0.2 = 0.30000000000000004. Para hesabında float KULLANMAYIN: kuruş cinsinden tamsayı veya decimal tipi kullanın. Karşılaştırmada eşitlik yerine tolerans (epsilon) uygulanır.",
    code: `0.1 + 0.2 === 0.3          // false!
Math.abs(a - b) < 1e-9      // doğru karşılaştırma
// Para: 1099 (kuruş) olarak tut, gösterirken böl` },
  { id: "cs-unicode", cat: "Kavramlar", weight: 1.0,
    q: "unicode utf-8 karakter kodlama encoding türkçe bozuk",
    title: "Unicode ve UTF-8",
    a: "Unicode her karaktere sayı (code point) atar; UTF-8 bunu 1-4 baytla kodlar ve ASCII ile geriye uyumludur — web'in %98'i UTF-8'dir. 'Ã¼' gibi bozuk Türkçe, UTF-8 verinin Latin-1 diye okunmasıdır. Kural: her katmanda (dosya, DB bağlantısı, HTTP başlığı) açıkça UTF-8 bildirin.",
    code: `<meta charset="UTF-8">
# Python: open("f.txt", encoding="utf-8")
# MySQL: utf8mb4 kullanın (utf8 değil — o 3 baytla kısıtlı, emoji bozar)` },
  { id: "cs-stack-heap", cat: "Kavramlar", weight: 1.0,
    q: "stack heap bellek yönetimi yığın öbek değişken nerede",
    title: "Stack vs Heap Bellek",
    a: "Stack: fonksiyon çağrı çerçeveleri ve yerel değerler; otomatik, çok hızlı, sınırlı boyut (taşarsa stack overflow). Heap: dinamik ömürlü nesneler; esnek ama yönetim ister — C'de elle free, Java/JS/Python'da çöp toplayıcı (GC) erişilmez nesneleri temizler. 'Bellek sızıntısı', artık gereksiz nesneye referans tutup GC'yi engellemektir.",
    code: `function f() {
  const n = 42;            // stack (çerçeveyle yaşar)
  const nesne = { a: 1 };  // heap'te; referansı stack'te
}  // çerçeve düşer; nesneye referans kalmadıysa GC toplar` },
  { id: "cs-compiler", cat: "Kavramlar", weight: 1.0,
    q: "compiler interpreter derleyici yorumlayıcı jit fark",
    title: "Derleyici vs Yorumlayıcı",
    a: "Derleyici kaynağı önceden makine koduna çevirir (C, Rust, Go) — hızlı çalışır, hatalar derlemede yakalanır. Yorumlayıcı satır satır çalıştırır (klasik Python) — esnek, taşınabilir, daha yavaş. Modern gerçek melezdir: JavaScript'in V8'i ve Java JVM'i JIT kullanır — sık çalışan 'sıcak' kod çalışma anında makine koduna derlenir.",
    code: `C/Rust:   kaynak → [derleme] → ikili → çalıştır
Python:   kaynak → bytecode → yorumlayıcı
JS (V8):  kaynak → yorumla → sıcak kod → JIT makine kodu` },
  { id: "cs-idempotent", cat: "Kavramlar", weight: 1.0,
    q: "idempotent tekrar güvenli işlem retry aynı sonuç",
    title: "İdempotentlik",
    a: "İdempotent işlem, bir veya bin kez çalıştığında aynı sonucu bırakır: x=5 idempotenttir, x+=1 değildir. Dağıtık sistemlerde kritiktir — ağ zaman aşımında istemci tekrar dener; ödeme ucu idempotent değilse çifte çekim olur. Çözüm: istemcinin ürettiği idempotency-key ile tekrarları tanıyıp tek işlem yapmak.",
    code: `POST /odeme
Idempotency-Key: 7f3a-...
# sunucu: bu anahtarı gördüyse önceki sonucu döner,
# yeni çekim YAPMAZ — güvenli retry` },
  { id: "cs-base64", cat: "Kavramlar", weight: 1.0,
    q: "base64 kodlama encoding şifreleme mi ikili veri metin",
    title: "Base64 Şifreleme DEĞİLDİR",
    a: "Base64, ikili veriyi 64 güvenli karakterle metne çevirir — amaç taşımadır (JSON içinde resim, data: URI), gizlilik değil: herkes anında geri çözer. Boyutu ~%33 artırır. Parola/token'ı base64'leyip 'şifreledim' sanmak yaygın ve tehlikeli bir yanılgıdır; gizlilik için gerçek şifreleme (AES) gerekir.",
    code: `btoa("gizli")        // "Z2l6bGk=" — herkes çözebilir!
atob("Z2l6bGk=")     // "gizli"
// data URI: <img src="data:image/png;base64,iVBOR...">` },
  { id: "cs-api-versioning", cat: "Web", weight: 1.0,
    q: "api versiyonlama breaking change geriye uyumluluk sürüm",
    title: "API Sürümleme ve Kırıcı Değişiklik",
    a: "Kırıcı değişiklik: alan silme/yeniden adlandırma, tip değiştirme, zorunlu parametre ekleme — mevcut istemcileri bozar. İsteğe bağlı YENİ alan eklemek kırıcı değildir. Strateji: URL sürümü (/v1/) en yaygın ve nettir; eski sürümü kullanımdan kaldırırken tarih duyurun ve geçiş süresi tanıyın.",
    code: `Kırıcı DEĞİL: yanıta "avatar_url" alanı eklemek
KIRICI: "name" → "fullName" yeniden adlandırma
Çözüm: /v2/ aç, /v1'i tarih vererek emekliye ayır` },
  { id: "cs-logging", cat: "Araçlar", weight: 1.0,
    q: "logging log seviyesi structured yapılandırılmış izleme",
    title: "İyi Loglama",
    a: "Seviyeler: DEBUG (geliştirme detayı), INFO (normal olaylar), WARN (tuhaf ama çalışıyor), ERROR (işlem başarısız). Yapılandırılmış (JSON) log arama ve alarm kurmayı mümkün kılar. Her kayda korelasyon/istek kimliği ekleyin — dağıtık sistemde isteğin izini sürmenin tek yolu budur. Parola ve kişisel veriyi ASLA loglamayın.",
    code: `logger.info({ olay: "siparis_olusturuldu",
              siparisId: s.id, istekId: req.id, sureMs: 42 });
// düz metin "sipariş oluştu" yerine sorgulanabilir alanlar` },
  { id: "cs-oauth", cat: "Güvenlik", weight: 1.0,
    q: "oauth google ile giriş yetkilendirme access token akış",
    title: "OAuth 2.0 — 'Google ile Giriş'",
    a: "OAuth, parolanızı vermeden bir uygulamaya hesabınıza SINIRLI erişim yetkisi verir. Authorization code akışı: uygulama sizi sağlayıcıya yönlendirir → siz orada girip izin verirsiniz → uygulamaya kod döner → kod arka planda access token'a çevrilir. Uygulama parolanızı hiç görmez; token kapsamı (scope) ve süresi sınırlıdır.",
    code: `1) app → google: "kullanıcı e-postasını okumak istiyorum"
2) kullanıcı Google'da girer, izni ONAYLAR
3) google → app: geçici kod
4) app (sunucu) kod + gizli anahtar → access token
5) app token'la SADECE izinli veriye erişir` },
  { id: "cs-mobile-first", cat: "CSS", weight: 1.0,
    q: "responsive duyarlı tasarım media query mobile first viewport",
    title: "Duyarlı (Responsive) Tasarım",
    a: "Mobile-first: temel stili küçük ekrana yaz, min-width medya sorgularıyla büyüğe genişlet — tersi (desktop-first) çok daha fazla geçersiz kılma üretir. Viewport meta etiketi zorunludur. Modern araçlar sorgu ihtiyacını azaltır: clamp() akışkan yazı boyutu, grid auto-fill akışkan sütunlar.",
    code: `<meta name="viewport" content="width=device-width, initial-scale=1">
.baslik { font-size: clamp(1.2rem, 4vw, 2.5rem); }
@media (min-width: 768px) { .menu { display: flex; } }` }
];

/* ---------- Ek kod derlemi: n-gram modeli için +40 satır ---------- */
const VEGA_CODE_CORPUS_EXT = [
  "const [durum, setDurum] = useState(false);",
  "useEffect(() => { getir(); }, [id]);",
  "export const yardimci = (girdi) => girdi.trim().toLowerCase();",
  "interface Kullanici { ad: string; yas: number; }",
  "type Sonuc<T> = { veri: T; hata: string | null };",
  "const yanit = await axios.get('/api/veri', { params: { sayfa } });",
  "router.post('/giris', dogrula, async (req, res) => { });",
  "const eleman = document.getElementById('liste');",
  "dizi.forEach((oge, indeks) => console.log(indeks, oge));",
  "const filtrelenmis = urunler.filter(u => u.fiyat < 100);",
  "localStorage.setItem('tema', JSON.stringify(ayar));",
  "if (!yanit.ok) throw new Error('HTTP ' + yanit.status);",
  "const toplam = sepet.reduce((acc, u) => acc + u.fiyat, 0);",
  "async function main() { const veri = await oku(); yaz(veri); }",
  "class Servis { constructor(db) { this.db = db; } }",
  "def ortalama(sayilar): return sum(sayilar) / len(sayilar)",
  "sonuclar = {k: v for k, v in veriler.items() if v > 0}",
  "async def getir(url): return await oturum.get(url)",
  "class Kullanici: def __init__(self, ad): self.ad = ad",
  "try: sonuc = isle(veri) except ValueError as e: logla(e)",
  "from dataclasses import dataclass",
  "df = pd.read_csv('veri.csv'); ozet = df.groupby('tip').sum()",
  "@app.route('/api/saglik') def saglik(): return {'durum': 'ok'}",
  "SELECT k.ad, COUNT(*) FROM siparisler s JOIN kullanicilar k ON k.id = s.kid GROUP BY k.ad;",
  "UPDATE urunler SET stok = stok - 1 WHERE id = ? AND stok > 0;",
  "CREATE INDEX idx_siparis_tarih ON siparisler(tarih);",
  "git checkout -b ozellik/yeni-ekran && git push -u origin HEAD",
  "git rebase -i HEAD~3",
  "docker compose up -d --build",
  "kubectl get pods -n production",
  "curl -X POST -H 'Content-Type: application/json' -d '{\"ad\":\"test\"}' http://localhost:3000/api",
  "npm run lint && npm run test -- --coverage",
  "const sunucu = express(); sunucu.use(express.json());",
  "process.env.NODE_ENV === 'production' ? uretim() : gelistirme();",
  "const kanal = new WebSocket('wss://sunucu/canli');",
  "return res.status(201).json({ id: yeni.id });",
  "const onbellek = new Map(); if (onbellek.has(k)) return onbellek.get(k);",
  "for satir in acik_dosya: parcala(satir.strip())",
  "with ThreadPoolExecutor(max_workers=4) as havuz: havuz.map(isle, isler)",
  "const gozlemci = new IntersectionObserver(girisler => yukle(girisler));"
];

/* ---------- Eşanlamlı / TR-EN köprü sözlüğü: sorgu genişletme ---------- */
const VEGA_SYNONYMS = {
  "fonksiyon": ["function"], "function": ["fonksiyon"],
  "dizi": ["array", "liste"], "array": ["dizi"],
  "nesne": ["object"], "object": ["nesne"],
  "hata": ["error", "bug", "exception"], "error": ["hata"], "bug": ["hata"],
  "döngü": ["loop", "for", "while"], "loop": ["döngü"],
  "değişken": ["variable"], "variable": ["değişken"],
  "sınıf": ["class"], "class": ["sınıf"],
  "sıralama": ["sort", "sorting"], "sort": ["sıralama"],
  "arama": ["search", "bul"], "search": ["arama"],
  "önbellek": ["cache"], "cache": ["önbellek"],
  "kuyruk": ["queue"], "queue": ["kuyruk"],
  "yığın": ["stack"], "stack": ["yığın"],
  "şifreleme": ["encryption", "kripto"], "encryption": ["şifreleme"],
  "parola": ["şifre", "password"], "şifre": ["parola", "password"], "password": ["parola"],
  "güvenlik": ["security"], "security": ["güvenlik"],
  "veritabanı": ["database", "db"], "database": ["veritabanı"], "db": ["veritabanı"],
  "sorgu": ["query"], "query": ["sorgu"],
  "sunucu": ["server", "backend"], "server": ["sunucu"],
  "istemci": ["client", "frontend"], "client": ["istemci"],
  "bellek": ["memory", "ram"], "memory": ["bellek"],
  "ağ": ["network"], "network": ["ağ"],
  "test": ["sınama"], "kapanış": ["closure"], "closure": ["kapanış"],
  "asenkron": ["async", "await"], "async": ["asenkron"],
  "eğitim": ["train", "training"], "öğrenme": ["learning", "eğitim"],
  "yapay": ["ai", "zeka"], "ai": ["yapay", "zeka"],
  "model": ["llm"], "llm": ["model"],
  "anahtar": ["key"], "key": ["anahtar"],
  "tablo": ["table"], "table": ["tablo"],
  "dal": ["branch"], "branch": ["dal"],
  "birleştirme": ["merge"], "merge": ["birleştirme"],
  "izin": ["permission", "yetki"], "yetki": ["izin", "authorization"],
  "kimlik": ["auth", "authentication"], "auth": ["kimlik"],
  "tip": ["type"], "type": ["tip"],
  "arayüz": ["interface"], "interface": ["arayüz"],
  "bileşen": ["component"], "component": ["bileşen"],
  "durum": ["state"], "state": ["durum"],
  "istek": ["request"], "request": ["istek"],
  "yanıt": ["response"], "response": ["yanıt"],
  "kod": ["code"], "code": ["kod"],
  "hız": ["performans", "performance"], "performans": ["performance", "hız"]
};
