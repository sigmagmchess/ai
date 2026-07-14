/* =========================================================
   VEGA Genişletme Paketi 2 — çok-ajanlı üretim + adversarial doğrulama
   113 küratörlü kayıt: Go, Rust, Java, İşletim Sistemi,
   Sistem Tasarımı, Test, Ağ (derin), Matematik
   Her paket bağımsız bir hakem ajan tarafından olgusal denetimden geçti.
   ========================================================= */
const VEGA_KNOWLEDGE_EXT2 = [
 {
  "id": "go-goroutine-channel",
  "cat": "Go",
  "q": "goroutine channel kanal eşzamanlılık concurrency go func chan buffered unbuffered iletişim paralel",
  "title": "Goroutine ve Channel",
  "a": "Goroutine, Go çalışma zamanı tarafından yönetilen hafif bir iş parçacığıdır; 'go' anahtar kelimesiyle başlatılır ve binlercesi düşük maliyetle çalışabilir. Channel'lar goroutine'ler arasında güvenli veri iletişimi sağlar: buffer'sız channel'da gönderme ve alma karşılıklı bekler (senkron), buffer'lı channel dolana kadar bloklamaz. Yaygın tuzak: main fonksiyonu goroutine'leri beklemeden biterse goroutine'ler yarıda kesilir; senkronizasyon için channel veya sync.WaitGroup kullanın.",
  "code": "func main() {\n    ch := make(chan string) // buffer'sız channel\n    go func() {\n        ch <- \"merhaba\" // alıcı hazır olana kadar bekler\n    }()\n    msg := <-ch // goroutine'den değeri al\n    fmt.Println(msg)\n}",
  "weight": 1
 },
 {
  "id": "go-defer-panic-recover",
  "cat": "Go",
  "q": "defer panic recover erteleme hata kurtarma cleanup kaynak kapatma exception yakalama stack",
  "title": "defer, panic ve recover",
  "a": "defer, bir fonksiyon çağrısını çevreleyen fonksiyon dönerken (LIFO sırasıyla) çalıştırır; dosya kapatma gibi temizlik işleri için idealdir. panic programı durdurur ve stack'i geriye sarar; recover yalnızca bir defer içinde çağrılırsa panic'i yakalayıp akışı normale döndürür. Yaygın tuzak: defer'e verilen argümanlar defer satırında hemen değerlendirilir, fonksiyon dönerken değil.",
  "code": "func guvenli() (err error) {\n    defer func() {\n        if r := recover(); r != nil {\n            err = fmt.Errorf(\"panic yakalandı: %v\", r)\n        }\n    }()\n    panic(\"beklenmeyen durum\") // recover ile yakalanır\n}",
  "weight": 1
 },
 {
  "id": "go-interface-duck-typing",
  "cat": "Go",
  "q": "interface arayüz duck typing implicit örtük implementasyon method set polymorphism çok biçimlilik soyutlama",
  "title": "Interface ve Duck Typing",
  "a": "Go'da interface'ler örtük (implicit) olarak uygulanır: bir tip, interface'in tüm metotlarına sahipse 'implements' gibi bir bildirim olmadan o interface'i sağlar. Bu yapısal tipleme (duck typing benzeri) sayesinde paketler birbirine bağımlı olmadan soyutlama kurulabilir. Yaygın tuzak: nil somut değer taşıyan bir interface değişkeni nil ile karşılaştırıldığında false döner, çünkü interface tip bilgisi taşımaya devam eder.",
  "code": "type Yazici interface {\n    Yaz(s string)\n}\n\ntype Konsol struct{}\n\n// Konsol, bildirim olmadan Yazici interface'ini sağlar\nfunc (k Konsol) Yaz(s string) {\n    fmt.Println(s)\n}",
  "weight": 1
 },
 {
  "id": "go-slice-vs-array",
  "cat": "Go",
  "q": "slice array dizi dilim iç yapı internal len cap append underlying array kapasite header",
  "title": "Slice ve Array İç Yapısı",
  "a": "Array sabit uzunlukludur ve değer tipidir (kopyalanır); slice ise bir array'e işaret eden pointer, uzunluk (len) ve kapasite (cap) alanlarından oluşan hafif bir header'dır. append, kapasite yetersizse yeni ve daha büyük bir array ayırıp elemanları kopyalar; bu yüzden append sonucu her zaman değişkene geri atanmalıdır. Yaygın tuzak: aynı array'i paylaşan iki slice'tan birinde eleman değiştirmek diğerini de etkiler.",
  "code": "arr := [3]int{1, 2, 3}     // sabit boyutlu array\ns := arr[:2]               // slice: len=2, cap=3\ns = append(s, 99)          // kapasite yeter, arr[2] artık 99\nfmt.Println(arr)           // [1 2 99] — aynı bellek paylaşılıyor\ns = append(s, 5)           // kapasite doldu, yeni array ayrılır\nfmt.Println(len(s), cap(s))",
  "weight": 1
 },
 {
  "id": "go-map-kullanimi",
  "cat": "Go",
  "q": "map harita hash sözlük key value anahtar değer comma ok delete make lookup",
  "title": "Map Kullanımı",
  "a": "Map, anahtar-değer çiftleri tutan hash tabanlı bir yapıdır ve make ile veya literal olarak oluşturulmalıdır. Olmayan bir anahtarı okumak değer tipinin sıfır değerini döndürür; anahtarın gerçekten var olup olmadığını 'comma ok' deyimiyle (v, ok := m[k]) ayırt edersiniz. Map üzerinde iterasyon sırası tanımsızdır ve map'ler eşzamanlı yazmaya karşı güvenli değildir; goroutine'ler arası paylaşımda Mutex gerekir.",
  "code": "puan := map[string]int{\"ali\": 90}\npuan[\"ayse\"] = 85          // ekleme/güncelleme\nv, ok := puan[\"veli\"]      // comma ok deyimi\nif !ok {\n    fmt.Println(\"kayıt yok, sıfır değer:\", v)\n}\ndelete(puan, \"ali\")        // anahtarı sil",
  "weight": 1
 },
 {
  "id": "go-hata-yonetimi-errors",
  "cat": "Go",
  "q": "error hata yönetimi errors.Is errors.As wrap sarma fmt.Errorf %w sentinel custom error",
  "title": "Hata Yönetimi: error, errors.Is/As",
  "a": "Go'da hatalar exception değil, fonksiyonlardan dönen sıradan error değerleridir ve genellikle 'if err != nil' ile kontrol edilir. fmt.Errorf içinde %w fiili hatayı sarar (wrap); errors.Is sarılmış zincirde belirli bir sentinel hatayı arar, errors.As ise zincirdeki hatayı belirli bir somut tipe çıkarmaya çalışır. Yaygın tuzak: sarılmış hataları == ile karşılaştırmak başarısız olur; her zaman errors.Is kullanın.",
  "code": "var ErrBulunamadi = errors.New(\"kayıt bulunamadı\")\n\nfunc bul(id int) error {\n    return fmt.Errorf(\"bul(%d): %w\", id, ErrBulunamadi) // hatayı sar\n}\n\nfunc main() {\n    err := bul(7)\n    if errors.Is(err, ErrBulunamadi) { // zinciri kontrol eder\n        fmt.Println(\"özel durum:\", err)\n    }\n}",
  "weight": 1
 },
 {
  "id": "go-struct-method-receiver",
  "cat": "Go",
  "q": "struct method receiver alıcı pointer değer value mutasyon kopyalama yapı metod",
  "title": "Struct ve Method Receiver: Değer vs Pointer",
  "a": "Değer receiver (func (t T) M()) struct'ın bir kopyası üzerinde çalışır; içinde yapılan alan değişiklikleri çağırana yansımaz. Pointer receiver (func (t *T) M()) asıl değeri değiştirebilir ve büyük struct'larda kopyalamayı önler. Kural: metotlardan biri pointer receiver gerektiriyorsa tutarlılık için o tipin tüm metotlarında pointer receiver kullanın; ayrıca yalnızca *T'nin method set'i pointer receiver metotlarını içerir, bu interface sağlamayı etkiler.",
  "code": "type Sayac struct{ n int }\n\nfunc (s Sayac) ArtirKopya()   { s.n++ } // kopyayı değiştirir\nfunc (s *Sayac) Artir()       { s.n++ } // asıl değeri değiştirir\n\nfunc main() {\n    c := Sayac{}\n    c.ArtirKopya()\n    c.Artir()\n    fmt.Println(c.n) // 1\n}",
  "weight": 1
 },
 {
  "id": "go-mod-bagimlilik",
  "cat": "Go",
  "q": "go mod module bağımlılık dependency go.mod go.sum tidy semantic versioning vendor require",
  "title": "go mod ile Bağımlılık Yönetimi",
  "a": "Go modülleri, go.mod dosyasında modül adını, Go sürümünü ve require edilen bağımlılıkları semantik sürümleriyle tanımlar; go.sum indirilen modüllerin doğrulama hash'lerini tutar. 'go mod init' yeni modül başlatır, 'go get' bağımlılık ekler veya günceller, 'go mod tidy' kullanılmayanları temizleyip eksikleri ekler. Yaygın tuzak: v2 ve üzeri major sürümlerde import yolunun sonuna /v2 gibi bir ek gerekir.",
  "code": "# Yeni modül başlat\ngo mod init github.com/kullanici/proje\n\n# Bağımlılık ekle (belirli sürümle)\ngo get github.com/gorilla/mux@v1.8.1\n\n# Kullanılmayanları temizle, eksikleri ekle\ngo mod tidy",
  "weight": 1
 },
 {
  "id": "go-select-ifadesi",
  "cat": "Go",
  "q": "select channel çoklu kanal bekleme timeout default non-blocking case time.After multiplexing",
  "title": "select İfadesi",
  "a": "select, birden fazla channel işlemini aynı anda bekler ve hazır olan case'i çalıştırır; birden fazlası hazırsa rastgele biri seçilir. default dalı eklendiğinde select bloklamaz, hiçbir channel hazır değilse hemen default çalışır. time.After ile birlikte kullanılarak timeout deseni kurulabilir; yaygın tuzak: hiç case'i hazır olmayan ve default'u bulunmayan select sonsuza dek bloklar.",
  "code": "select {\ncase msg := <-ch1:\n    fmt.Println(\"ch1'den geldi:\", msg)\ncase msg := <-ch2:\n    fmt.Println(\"ch2'den geldi:\", msg)\ncase <-time.After(2 * time.Second):\n    fmt.Println(\"zaman aşımı\") // 2 saniyede veri gelmezse\n}",
  "weight": 1
 },
 {
  "id": "go-sync-waitgroup-mutex",
  "cat": "Go",
  "q": "sync WaitGroup Mutex kilit lock unlock Add Done Wait race condition yarış senkronizasyon RWMutex",
  "title": "sync Paketi: WaitGroup ve Mutex",
  "a": "sync.WaitGroup, bir grup goroutine'in bitmesini beklemek için kullanılır: Add ile sayaç artırılır, her goroutine Done çağırır, Wait sayaç sıfırlanana kadar bloklar. sync.Mutex, paylaşılan veriye aynı anda tek goroutine'in erişmesini sağlar; Lock/Unlock çiftini genellikle defer ile kullanmak güvenlidir. Yaygın tuzak: Add'i goroutine'in içinde çağırmak yarış koşulu yaratır; goroutine'i başlatmadan önce çağırın ve WaitGroup'u fonksiyonlara pointer olarak geçirin.",
  "code": "var wg sync.WaitGroup\nvar mu sync.Mutex\ntoplam := 0\nfor i := 1; i <= 5; i++ {\n    wg.Add(1) // goroutine başlamadan ÖNCE\n    go func(n int) {\n        defer wg.Done()\n        mu.Lock()\n        toplam += n // kritik bölge\n        mu.Unlock()\n    }(i)\n}\nwg.Wait()",
  "weight": 1
 },
 {
  "id": "go-context-paketi",
  "cat": "Go",
  "q": "context iptal cancel timeout deadline WithCancel WithTimeout Done ctx bağlam istek iptali",
  "title": "context Paketi",
  "a": "context paketi, istek kapsamındaki iptal sinyali, zaman aşımı ve değerleri goroutine'ler arasında taşır. context.WithCancel manuel iptal, WithTimeout/WithDeadline süre bazlı iptal sağlar; iptal olduğunda ctx.Done() channel'ı kapanır ve ctx.Err() nedenini döndürür. Kural olarak ctx, fonksiyonun ilk parametresi olmalıdır ve dönen cancel fonksiyonu kaynak sızıntısını önlemek için (genellikle defer ile) mutlaka çağrılmalıdır.",
  "code": "ctx, cancel := context.WithTimeout(context.Background(), 100*time.Millisecond)\ndefer cancel() // kaynakları serbest bırak\n\nselect {\ncase <-time.After(1 * time.Second):\n    fmt.Println(\"iş tamamlandı\")\ncase <-ctx.Done():\n    fmt.Println(\"iptal:\", ctx.Err()) // context deadline exceeded\n}",
  "weight": 1
 },
 {
  "id": "go-oop-kompozisyon",
  "cat": "Go",
  "q": "OOP kompozisyon composition embedding gömme inheritance kalıtım yok struct embed nesne yönelimli",
  "title": "Go'da OOP: Kalıtım Yerine Kompozisyon",
  "a": "Go'da sınıf ve kalıtım yoktur; kod paylaşımı struct gömme (embedding) ile, soyutlama ise interface'lerle sağlanır. Bir struct'a isimsiz olarak gömülen tipin alan ve metotları dış struct üzerinden doğrudan çağrılabilir (promotion). Bu kalıtım değildir: gömülen tipin metodu çağrıldığında receiver hâlâ gömülen tiptir, dolayısıyla polimorfik override davranışı yoktur; çok biçimlilik interface'lerle kurulur.",
  "code": "type Motor struct{ Guc int }\n\nfunc (m Motor) Calistir() { fmt.Println(\"motor çalıştı\") }\n\ntype Araba struct {\n    Motor  // gömme (embedding): kalıtım değil, kompozisyon\n    Marka string\n}\n\n// araba.Calistir() ve araba.Guc doğrudan erişilebilir",
  "weight": 1
 },
 {
  "id": "go-testing-paketi",
  "cat": "Go",
  "q": "testing test go test table driven t.Run Errorf benchmark _test.go birim test unit",
  "title": "testing Paketi",
  "a": "Testler _test.go ile biten dosyalarda, TestXxx(t *testing.T) imzalı fonksiyonlar olarak yazılır ve 'go test' komutuyla çalıştırılır. t.Errorf testi başarısız işaretleyip devam eder, t.Fatalf ise testi hemen durdurur. Go'da yaygın desen, birden çok girdiyi tek testte döngüyle deneyen ve isteğe bağlı olarak her durumu t.Run ile alt test olarak çalıştıran tablo güdümlü (table-driven) testlerdir.",
  "code": "func TestTopla(t *testing.T) {\n    durumlar := []struct {\n        a, b, bekle int\n    }{{1, 2, 3}, {-1, 1, 0}}\n    for _, d := range durumlar {\n        if got := Topla(d.a, d.b); got != d.bekle {\n            t.Errorf(\"Topla(%d,%d)=%d, beklenen %d\", d.a, d.b, got, d.bekle)\n        }\n    }\n}",
  "weight": 1
 },
 {
  "id": "go-yaygin-tuzaklar",
  "cat": "Go",
  "q": "tuzak pitfall nil map panic loop variable capture döngü değişkeni goroutine closure yaygın hata",
  "title": "Yaygın Tuzaklar: nil Map ve Döngü Değişkeni",
  "a": "nil map'ten okumak güvenlidir (sıfır değer döner) ama nil map'e yazmak panic üretir; yazmadan önce make ile başlatmak gerekir. İkinci klasik tuzak döngü değişkeni yakalamadır: Go 1.21 ve öncesinde for döngüsündeki değişken tüm iterasyonlarda paylaşıldığından, onu yakalayan goroutine'ler genellikle son değeri görürdü; çözüm değişkeni goroutine'e parametre olarak geçirmek veya gölgelemekti. Go 1.22'den itibaren döngü değişkeni her iterasyonda yeniden oluşturulur ve bu tuzak ortadan kalkmıştır.",
  "code": "var m map[string]int\n// m[\"a\"] = 1        // PANIC: nil map'e yazma\nm = make(map[string]int)\nm[\"a\"] = 1           // doğru: önce make ile başlat\n\nfor i := 0; i < 3; i++ {\n    go func(n int) {  // Go <=1.21 için: değeri parametre olarak geçir\n        fmt.Println(n)\n    }(i)\n}",
  "weight": 1
 },
 {
  "id": "rust-ownership-move",
  "cat": "Rust",
  "q": "rust ownership sahiplik move taşıma semantiği value moved semantics drop copy değer taşındı",
  "title": "Ownership ve move semantiği",
  "a": "Rust'ta her değerin tek bir sahibi (owner) vardır; sahip scope dışına çıkınca değer otomatik olarak drop edilir. String ve Vec gibi heap kullanan türlerde atama veya fonksiyona geçirme değeri kopyalamaz, taşır (move); eski değişken artık kullanılamaz. i32 gibi Copy trait'ini uygulayan türlerde ise değer kopyalanır. Yaygın başlangıç hatası 'value borrowed here after move' (E0382), değeri taşıdıktan sonra tekrar kullanmaya çalışmaktan kaynaklanır.",
  "code": "fn main() {\n    let s1 = String::from(\"merhaba\");\n    let s2 = s1; // s1 taşındı (move), artık geçersiz\n    // println!(\"{}\", s1); // derleme hatası: value borrowed after move\n    println!(\"{}\", s2);\n\n    let x = 5;\n    let y = x; // i32 Copy olduğundan kopyalanır\n    println!(\"{} {}\", x, y); // ikisi de geçerli\n}",
  "weight": 1
 },
 {
  "id": "rust-borrow-checker-referanslar",
  "cat": "Rust",
  "q": "rust borrow checker referans reference ödünç alma &mut mutable immutable aliasing kural borrowing",
  "title": "Borrow checker ve referanslar (&, &mut)",
  "a": "Referanslar sahipliği almadan bir değere erişmeyi sağlar: & değiştirilemez (immutable), &mut değiştirilebilir (mutable) ödünç almadır. Borrow checker'ın temel kuralı: aynı anda ya istediğiniz kadar & referans ya da yalnızca tek bir &mut referans olabilir; ikisi karışamaz. Bu kural veri yarışlarını (data race) ve geçersiz belleğe erişimi derleme zamanında engeller. Referanslar her zaman geçerli bir değere işaret etmek zorundadır; safe kodda dangling referans derlenmez.",
  "code": "fn uzunluk(s: &String) -> usize {\n    s.len() // sahiplik alınmaz, sadece ödünç alınır\n}\n\nfn main() {\n    let mut s = String::from(\"selam\");\n    let l = uzunluk(&s); // immutable ödünç\n    println!(\"uzunluk: {}\", l);\n    let r = &mut s; // mutable ödünç (tek olmalı)\n    r.push_str(\" dünya\");\n    println!(\"{}\", s);\n}",
  "weight": 1
 },
 {
  "id": "rust-lifetimes-temel",
  "cat": "Rust",
  "q": "rust lifetime yaşam süresi 'a annotation referans geçerlilik elision dangling ömür açıklaması",
  "title": "Lifetime temelleri",
  "a": "Lifetime, bir referansın ne kadar süre geçerli olduğunu ifade eder; derleyici her referansın işaret ettiği değerden daha uzun yaşamadığını kanıtlar. Çoğu durumda lifetime'lar elision kurallarıyla otomatik çıkarılır; ancak bir fonksiyon birden fazla referans alıp referans döndürüyorsa 'a gibi açık anotasyon gerekir. Anotasyonlar değerin ömrünü uzatmaz; yalnızca referanslar arasındaki ilişkiyi derleyiciye tarif eder. Bu, yeni başlayanların en sık karıştırdığı noktadır.",
  "code": "// Dönen referans, iki girdiden kısa ömürlü olanı kadar yaşar\nfn uzun_olan<'a>(x: &'a str, y: &'a str) -> &'a str {\n    if x.len() > y.len() { x } else { y }\n}\n\nfn main() {\n    let a = String::from(\"uzun metin\");\n    let b = String::from(\"kısa\");\n    println!(\"{}\", uzun_olan(&a, &b));\n}",
  "weight": 1
 },
 {
  "id": "rust-option-result-soru-operatoru",
  "cat": "Rust",
  "q": "rust option result hata yönetimi error handling ? operatörü unwrap expect none some ok err",
  "title": "Option, Result ve ? operatörü",
  "a": "Rust'ta null yoktur; değerin yokluğu Option<T> (Some/None), başarısız olabilen işlemler Result<T, E> (Ok/Err) ile ifade edilir. ? operatörü, Err veya None durumunda fonksiyondan erken döner, başarı durumunda içteki değeri açar; bu sayede hata zincirleme kod kısa kalır. ? yalnızca dönüş türü uyumlu fonksiyonlarda kullanılabilir: tipik olarak Result veya Option (daha genel olarak Try trait'ini uygulayan bir tür) döndüren fonksiyonlar. unwrap() hata durumunda panic'e yol açtığından üretim kodunda dikkatli kullanılmalıdır.",
  "code": "use std::fs;\nuse std::num::ParseIntError;\n\nfn oku_ve_topla(s: &str) -> Result<i32, ParseIntError> {\n    let n: i32 = s.trim().parse()?; // hata varsa erken döner\n    Ok(n + 10)\n}\n\nfn main() {\n    match oku_ve_topla(\"32\") {\n        Ok(v) => println!(\"sonuç: {}\", v),\n        Err(e) => eprintln!(\"hata: {}\", e),\n    }\n    let _ = fs::metadata(\"yok.txt\").is_ok(); // Result örneği\n}",
  "weight": 1
 },
 {
  "id": "rust-pattern-matching-match",
  "cat": "Rust",
  "q": "rust match pattern matching desen eşleme exhaustive if let guard enum kol arm eşleştirme",
  "title": "Pattern matching (match)",
  "a": "match ifadesi bir değeri desenlerle karşılaştırır ve tüm olasılıkların kapsanmasını (exhaustiveness) derleme zamanında zorunlu kılar; unutulan bir enum varyantı derleme hatası verir. Desenler değer bağlama, aralıklar ve guard koşulları (if) destekler; _ deseni kalan her şeyi yakalar. Tek bir durumla ilgileniyorsanız if let daha kısa bir alternatiftir. match bir ifadedir, yani doğrudan değer döndürebilir.",
  "code": "enum Sekil {\n    Daire(f64),\n    Dikdortgen(f64, f64),\n}\n\nfn alan(s: &Sekil) -> f64 {\n    match s {\n        Sekil::Daire(r) => std::f64::consts::PI * r * r,\n        Sekil::Dikdortgen(w, h) => w * h,\n    } // tüm varyantlar kapsanmak zorunda\n}\n\nfn main() {\n    println!(\"{:.2}\", alan(&Sekil::Daire(2.0)));\n}",
  "weight": 1
 },
 {
  "id": "rust-trait-generics",
  "cat": "Rust",
  "q": "rust trait generics jenerik tür parametresi bound impl dyn polymorphism arayüz interface monomorphization",
  "title": "Trait ve generics",
  "a": "Trait'ler paylaşılan davranışı tanımlar (diğer dillerdeki interface'e benzer), generics ise tür parametreleriyle kod tekrarını önler; trait bound (T: Display gibi) generic türün hangi yetenekleri taşıması gerektiğini belirtir. Generic kod monomorphization ile derleme zamanında her somut tür için ayrı üretilir, yani çalışma zamanı maliyeti yoktur. Çalışma zamanı polimorfizmi gerekiyorsa dyn Trait ile trait object kullanılır; bu vtable üzerinden dinamik çağrı yapar.",
  "code": "use std::fmt::Display;\n\ntrait Sesli {\n    fn ses(&self) -> String;\n}\n\nstruct Kedi;\nimpl Sesli for Kedi {\n    fn ses(&self) -> String { String::from(\"miyav\") }\n}\n\n// Trait bound: T, Sesli trait'ini uygulamak zorunda\nfn dinle<T: Sesli>(hayvan: &T) {\n    println!(\"{}\", hayvan.ses());\n}\n\nfn yaz<T: Display>(x: T) { println!(\"{}\", x); }\n\nfn main() { dinle(&Kedi); yaz(42); }",
  "weight": 1
 },
 {
  "id": "rust-string-vs-str",
  "cat": "Rust",
  "q": "rust string str &str fark string slice metin utf-8 to_string owned borrowed dilim",
  "title": "String ve &str farkı",
  "a": "String, heap'te sahip olunan, büyüyebilen bir UTF-8 metin türüdür; &str ise bir metin verisine ödünç alınmış bir dilimdir (slice) ve sahiplik taşımaz. String literalleri (\"merhaba\") &'static str türündedir. Fonksiyon parametrelerinde genellikle &str tercih edilir, çünkü &String otomatik olarak &str'ye dönüşür (deref coercion) ve fonksiyon daha esnek olur. Rust string'leri UTF-8 olduğundan bayt indeksiyle tek karaktere erişilemez; chars() kullanılır.",
  "code": "fn selamla(isim: &str) -> String {\n    format!(\"Merhaba, {}!\", isim)\n}\n\nfn main() {\n    let sahipli: String = String::from(\"Ayşe\");\n    let dilim: &str = \"Mehmet\"; // string literal: &'static str\n    println!(\"{}\", selamla(&sahipli)); // &String -> &str dönüşür\n    println!(\"{}\", selamla(dilim));\n    // UTF-8: karakterlere chars() ile erişilir\n    println!(\"{}\", sahipli.chars().count());\n}",
  "weight": 1
 },
 {
  "id": "rust-vec-iterator-zincirleri",
  "cat": "Rust",
  "q": "rust vec vector iterator iter map filter collect zincir lazy tembel sum fold dizi liste",
  "title": "Vec ve iterator zincirleri",
  "a": "Vec<T>, heap üzerinde büyüyebilen dinamik bir dizidir; iter() ile referans, into_iter() ile sahiplik, iter_mut() ile değiştirilebilir referans üzerinden dolaşılır. map, filter gibi adaptörler tembeldir (lazy): collect, sum veya for gibi bir tüketici çağrılana kadar hiçbir şey hesaplanmaz. Iterator zincirleri derleyici tarafından genellikle elle yazılmış döngü kadar hızlı koda optimize edilir (zero-cost abstraction); bu yüzden performans kaygısıyla döngüye dönmek çoğu zaman gerekmez.",
  "code": "fn main() {\n    let sayilar = vec![1, 2, 3, 4, 5, 6];\n    // Çift sayıların karelerini topla\n    let toplam: i32 = sayilar\n        .iter()\n        .filter(|&&x| x % 2 == 0)\n        .map(|&x| x * x)\n        .sum();\n    println!(\"{}\", toplam); // 56\n    let kareler: Vec<i32> = sayilar.iter().map(|x| x * x).collect();\n    println!(\"{:?}\", kareler);\n}",
  "weight": 1
 },
 {
  "id": "rust-cargo-crate-ekosistem",
  "cat": "Rust",
  "q": "rust cargo crate crates.io paket yönetimi dependency bağımlılık build cargo.toml new run test",
  "title": "Cargo ve crate ekosistemi",
  "a": "Cargo, Rust'ın resmi derleme aracı ve paket yöneticisidir: cargo new proje oluşturur, cargo build derler, cargo run çalıştırır, cargo test testleri koşar. Bağımlılıklar Cargo.toml dosyasına yazılır ve crates.io'dan indirilir; Cargo.lock dosyası tam sürümleri sabitleyerek tekrarlanabilir derlemeler sağlar. Kütüphane veya çalıştırılabilir her paket bir crate'tir. cargo add serde gibi komutlarla bağımlılık eklemek elle Cargo.toml düzenlemekten pratiktir.",
  "code": "# Yeni proje oluştur ve çalıştır\n# cargo new merhaba && cd merhaba && cargo run\n\n# Cargo.toml — bağımlılık örneği\n[package]\nname = \"merhaba\"\nversion = \"0.1.0\"\nedition = \"2021\"\n\n[dependencies]\nserde = { version = \"1\", features = [\"derive\"] }",
  "weight": 1
 },
 {
  "id": "rust-unsafe-ne-zaman",
  "cat": "Rust",
  "q": "rust unsafe güvensiz raw pointer ffi ne zaman kullanılır blok invariant undefined behavior",
  "title": "unsafe ne zaman kullanılır",
  "a": "unsafe bloğu, derleyicinin doğrulayamadığı beş işleme izin verir: raw pointer dereference, unsafe fonksiyon/FFI çağrısı, mutable static erişimi, unsafe trait implementasyonu ve union alanı okuma. unsafe borrow checker'ı kapatmaz; yalnızca bu ek yetkileri açar ve bellek güvenliğini kanıtlama sorumluluğunu programcıya devreder. Tipik meşru kullanımlar C kütüphaneleriyle FFI ve düşük seviyeli veri yapılarıdır; uygulama kodunda nadiren gerekir. En iyi pratik, unsafe'i küçük tutup güvenli bir API arkasına sarmaktır.",
  "code": "fn main() {\n    let x: i32 = 42;\n    let p = &x as *const i32; // raw pointer oluşturmak güvenlidir\n    // Dereference etmek ise unsafe gerektirir:\n    unsafe {\n        println!(\"değer: {}\", *p);\n    }\n    // Sorumluluk: p'nin geçerli olduğunu BİZ garanti ediyoruz\n}",
  "weight": 1
 },
 {
  "id": "rust-box-rc-refcell",
  "cat": "Rust",
  "q": "rust box rc refcell akıllı işaretçi smart pointer heap paylaşım reference counting interior mutability borrow_mut",
  "title": "Box, Rc ve RefCell akıllı işaretçileri",
  "a": "Box<T> bir değeri heap'e taşır ve tek sahipli kalır; recursive türler ve büyük veriler için kullanılır. Rc<T> referans sayarak aynı verinin birden çok sahibi olmasını sağlar, ancak yalnızca tek iş parçacıklıdır (çoklu thread için Arc). RefCell<T> ödünç alma kurallarını derleme yerine çalışma zamanında denetler (interior mutability); kural ihlali panic üretir. Rc<RefCell<T>> kombinasyonu paylaşılan değiştirilebilir veri için yaygın bir kalıptır, fakat döngüsel referanslar bellek sızıntısına yol açabilir (çözüm: Weak).",
  "code": "use std::cell::RefCell;\nuse std::rc::Rc;\n\nfn main() {\n    let kutu = Box::new(5); // heap'te tek sahipli değer\n    println!(\"{}\", *kutu);\n\n    let paylasilan = Rc::new(RefCell::new(vec![1, 2]));\n    let kopya = Rc::clone(&paylasilan); // sayaç artar, veri kopyalanmaz\n    kopya.borrow_mut().push(3); // çalışma zamanı ödünç denetimi\n    println!(\"{:?}, sahip sayısı: {}\", paylasilan.borrow(), Rc::strong_count(&paylasilan));\n}",
  "weight": 1
 },
 {
  "id": "rust-bellek-guvenligi-gc-yok",
  "cat": "Rust",
  "q": "rust bellek güvenliği memory safety garbage collector gc yok neden raii drop use after free data race",
  "title": "GC olmadan bellek güvenliği",
  "a": "Rust, çöp toplayıcı (GC) kullanmadan bellek güvenliğini ownership, borrow checker ve lifetime kurallarını derleme zamanında zorlayarak sağlar; bellek, sahibi scope'tan çıktığında deterministik olarak serbest bırakılır (RAII/Drop). Bu model use-after-free, double free, null dereference ve safe kodda data race hatalarını derlenmeden yakalar. GC duraklamaları olmadığından çalışma zamanı performansı öngörülebilirdir. Güvenlik garantileri unsafe bloklar dışında geçerlidir; mantık hataları ve deadlock ise yine mümkündür.",
  "code": null,
  "weight": 1
 },
 {
  "id": "rust-derleyici-hatalari",
  "cat": "Rust",
  "q": "rust derleyici hata compiler error mesaj okuma rustc explain E0382 clippy cargo check öneri",
  "title": "Derleyici hatalarıyla çalışma",
  "a": "Rust derleyicisinin hata mesajları öğretici olacak şekilde tasarlanmıştır: hatanın yerini, nedenini ve çoğu zaman somut bir düzeltme önerisini (help satırı) gösterir. E0382 gibi hata kodlarının ayrıntılı açıklaması rustc --explain E0382 ile okunabilir. Hızlı geri bildirim için cargo check derlemeden yalnızca doğrulama yapar; cargo clippy ise yaygın hataları ve stil sorunlarını yakalayan ek lint'ler sunar. Derleyiciyle savaşmak yerine önerilerini okumak, Rust öğrenmenin en hızlı yoludur.",
  "code": "# Hızlı doğrulama (binary üretmez)\ncargo check\n\n# Hata kodunun ayrıntılı açıklaması\nrustc --explain E0382\n\n# Ek lint'ler ve öneriler\ncargo clippy\n\n# Derleyicinin önerdiği bazı düzeltmeleri otomatik uygula\ncargo fix",
  "weight": 1
 },
 {
  "id": "rust-baslangic-zorluklari",
  "cat": "Rust",
  "q": "rust öğrenme zorluk başlangıç beginner yaygın hata fighting borrow checker clone tuzak öğrenme eğrisi",
  "title": "Yaygın başlangıç zorlukları",
  "a": "Yeni başlayanların en sık takıldığı noktalar: move sonrası değeri kullanmaya çalışmak, aynı anda hem & hem &mut ödünç almak, String ile &str'yi karıştırmak ve lifetime hatalarını anotasyonla 'susturmaya' çalışmak. Her hatada .clone() eklemek derlemeyi geçirir ama gereksiz kopyalar üretir; önce referansla çözülüp çözülemeyeceğine bakılmalıdır. Diğer dillerdeki alışkanlıkları birebir taşımak yerine ownership modeliyle düşünmeyi öğrenmek zamanla derleyici hatalarını büyük ölçüde azaltır.",
  "code": "fn main() {\n    let mut v = vec![1, 2, 3];\n    // TUZAK: dolaşırken aynı Vec'i değiştirmek derlenmez\n    // for x in &v { v.push(*x); } // hata: hem & hem &mut\n\n    // ÇÖZÜM: önce oku, sonra değiştir\n    let eklenecek: Vec<i32> = v.iter().map(|x| x * 10).collect();\n    v.extend(eklenecek);\n    println!(\"{:?}\", v);\n}",
  "weight": 1
 },
 {
  "id": "java-jvm-jre-jdk",
  "cat": "Java",
  "q": "jvm jre jdk fark nedir java virtual machine runtime development kit derleyici javac kurulum",
  "title": "JVM, JRE ve JDK Farkı",
  "a": "JVM (Java Virtual Machine), bytecode'u çalıştıran sanal makinedir; bytecode'un taşınabilirliği sayesinde platform bağımsızlığı sağlanır (JVM'in kendisi platforma özeldir). JRE (Java Runtime Environment), JVM'i ve standart kütüphaneleri içerir; yalnızca Java programı çalıştırmak için yeterlidir. JDK (Java Development Kit) ise JRE'ye ek olarak javac derleyicisi, javadoc ve jdb gibi geliştirme araçlarını içerir. Yaygın yanılgı: JDK 11'den itibaren Oracle ayrı bir JRE dağıtımı sunmaz; JDK tek paket olarak gelir (istenirse jlink ile özel çalışma zamanı imajı oluşturulabilir).",
  "code": "// Kavramsal şema:\n// JDK ⊃ JRE ⊃ JVM\n//\n// JDK  = JRE + geliştirme araçları (javac, javadoc, jdb)\n// JRE  = JVM + standart kütüphaneler (java.lang, java.util ...)\n// JVM  = bytecode'u yorumlayan/derleyen sanal makine\n//\n// Derleme akışı:\n// Merhaba.java --(javac)--> Merhaba.class --(JVM)--> makine kodu",
  "weight": 1
 },
 {
  "id": "java-bytecode-jit",
  "cat": "Java",
  "q": "bytecode jit derleme just in time compiler hotspot yorumlayıcı interpreter class dosyası performans",
  "title": "Bytecode ve JIT Derleme",
  "a": "javac, kaynak kodu makine koduna değil, platformdan bağımsız bytecode'a (.class dosyaları) derler. JVM bu bytecode'u önce yorumlayarak çalıştırır; HotSpot JVM'de sık çalışan (\"hot\") metotlar JIT (Just-In-Time) derleyici tarafından çalışma zamanında yerel makine koduna çevrilir ve optimize edilir. Bu yüzden Java programları ısınma (warm-up) süresinden sonra çok daha hızlı çalışır. Yaygın yanılgı: Java tamamen yorumlanan bir dil değildir; modern JVM'ler C1/C2 katmanlı (tiered) JIT derleme kullanır.",
  "code": "// Derleme ve çalıştırma zinciri:\n// Merhaba.java\n//   |  javac (derleme zamanı)\n//   v\n// Merhaba.class (bytecode)\n//   |  JVM yükler\n//   v\n// Yorumlayıcı --> sık çağrılan metotlar --> JIT (C1/C2)\n//                                        --> yerel makine kodu",
  "weight": 1
 },
 {
  "id": "java-gc-nesilleri",
  "cat": "Java",
  "q": "garbage collection gc nesil young old generation eden survivor çöp toplayıcı heap bellek yönetimi minor major",
  "title": "Garbage Collection Nesilleri",
  "a": "JVM heap'i nesillere ayırır: yeni nesneler Young Generation'ın Eden bölgesinde oluşturulur, minor GC'lerden sağ çıkanlar Survivor alanları üzerinden Old Generation'a terfi eder. Bu tasarım, \"nesnelerin çoğu genç ölür\" (weak generational hypothesis) gözlemine dayanır; minor GC'ler bu sayede hızlı ve sık, major/full GC'ler ise nadir olur. Java 9'dan itibaren varsayılan toplayıcı G1'dir; heap'i eşit boyutlu bölgelere (region) bölerek çalışır. Yaygın yanılgı: System.gc() çağrısı GC'yi garanti etmez, yalnızca bir öneridir.",
  "code": "// Heap düzeni (nesilsel GC):\n//\n// Young Generation            Old Generation\n// +-------+------+------+     +------------------+\n// | Eden  | S0   | S1   | --> | uzun ömürlü      |\n// +-------+------+------+     | nesneler         |\n//   yeni    survivor          +------------------+\n//   nesneler alanları\n//\n// Minor GC: Young'ı temizler (hızlı, sık)\n// Major/Full GC: Old dahil temizler (yavaş, nadir)",
  "weight": 1
 },
 {
  "id": "java-interface-vs-abstract-class",
  "cat": "Java",
  "q": "interface abstract class fark arayüz soyut sınıf default method çoklu kalıtım implements extends",
  "title": "Interface vs Abstract Class",
  "a": "Bir sınıf birden fazla interface'i implement edebilir ama yalnızca tek bir abstract class'tan kalıtım alabilir. Abstract class durum (instance alanları) ve constructor barındırabilir; interface ise yalnızca sabitler (örtük public static final) ile soyut metotlar, Java 8'den itibaren default/static metot gövdeleri ve Java 9'dan itibaren private metotlar içerebilir. Kural olarak interface \"ne yapabilir\" sözleşmesini, abstract class ise ortak durum ve kısmi implementasyonu paylaşmak için kullanılır. Yaygın yanılgı: default metotlar interface'e durum eklemez; interface'te instance alanı tanımlanamaz.",
  "code": "interface Ucabilen {\n    void uc(); // soyut metot\n    default String durum() { return \"havada\"; } // Java 8+ gövdeli metot\n}\n\nabstract class Hayvan {\n    protected String ad;              // durum tutabilir\n    Hayvan(String ad) { this.ad = ad; } // constructor olabilir\n    abstract void sesCikar();\n}\n\nclass Kus extends Hayvan implements Ucabilen {\n    Kus(String ad) { super(ad); }\n    public void uc() { System.out.println(ad + \" uçuyor\"); }\n    void sesCikar() { System.out.println(\"cik cik\"); }\n}",
  "weight": 1
 },
 {
  "id": "java-equals-hashcode-sozlesmesi",
  "cat": "Java",
  "q": "equals hashcode sözleşme contract override hashmap hashset karşılaştırma eşitlik nesne kural",
  "title": "equals ve hashCode Sözleşmesi",
  "a": "Sözleşme: iki nesne equals ile eşitse hashCode değerleri de aynı olmak zorundadır; tersi zorunlu değildir (farklı nesneler aynı hash'e sahip olabilir, buna collision denir). equals'ı override edip hashCode'u etmezseniz nesneleriniz HashMap ve HashSet içinde kaybolur, çünkü bu yapılar önce hash kovasını bulur, sonra equals ile karşılaştırır. equals ayrıca refleksif, simetrik, geçişli ve tutarlı olmalı, null için false döndürmelidir.",
  "code": "import java.util.Objects;\n\nclass Nokta {\n    private final int x, y;\n    Nokta(int x, int y) { this.x = x; this.y = y; }\n\n    @Override public boolean equals(Object o) {\n        if (this == o) return true;              // aynı referans\n        if (!(o instanceof Nokta)) return false; // tip kontrolü\n        Nokta n = (Nokta) o;\n        return x == n.x && y == n.y;\n    }\n    @Override public int hashCode() {\n        return Objects.hash(x, y); // equals ile tutarlı olmalı\n    }\n}",
  "weight": 1
 },
 {
  "id": "java-string-immutability-stringbuilder",
  "cat": "Java",
  "q": "string immutable değişmez stringbuilder stringbuffer birleştirme concat performans string pool döngü",
  "title": "String Immutability ve StringBuilder",
  "a": "String nesneleri değişmezdir (immutable): concat veya replace gibi metotlar mevcut nesneyi değiştirmez, yeni bir String döndürür. Bu sayede String'ler thread-safe olur ve string pool'da güvenle paylaşılabilir. Döngü içinde += ile birleştirme her adımda yeni nesne yarattığı için toplamda O(n²) maliyete yol açar; bunun yerine StringBuilder kullanılmalıdır. StringBuffer aynı işi senkronize (thread-safe) yapar ama tek thread'li kodda gereksiz yavaştır.",
  "code": "// YANLIŞ: her adımda yeni String nesnesi oluşur (O(n^2))\nString s = \"\";\nfor (int i = 0; i < 1000; i++) {\n    s += i;\n}\n\n// DOĞRU: tek bir değiştirilebilir tampon kullanılır (O(n))\nStringBuilder sb = new StringBuilder();\nfor (int i = 0; i < 1000; i++) {\n    sb.append(i);\n}\nString sonuc = sb.toString();",
  "weight": 1
 },
 {
  "id": "java-checked-vs-unchecked-exception",
  "cat": "Java",
  "q": "checked unchecked exception fark istisna hata throws try catch runtimeexception ioexception denetimli",
  "title": "Checked vs Unchecked Exception",
  "a": "Checked exception'lar (Exception'ın RuntimeException dışındaki alt sınıfları, örn. IOException) derleme zamanında ya try-catch ile yakalanmak ya da throws ile bildirilmek zorundadır. Unchecked exception'lar (RuntimeException ve alt sınıfları, örn. NullPointerException, IllegalArgumentException) böyle bir zorunluluk taşımaz ve genellikle programlama hatalarını temsil eder. Error sınıfı (örn. OutOfMemoryError) da unchecked'tir ve yakalanması önerilmez. Yaygın yanılgı: unchecked exception'lar da istenirse yakalanabilir; fark yakalanabilirlik değil, derleyici zorlamasıdır.",
  "code": "import java.io.IOException;\nimport java.nio.file.Files;\nimport java.nio.file.Path;\n\nclass Ornek {\n    // Checked: throws ile bildirmek ZORUNLU\n    static String oku(String yol) throws IOException {\n        return Files.readString(Path.of(yol));\n    }\n\n    static void bol(int a, int b) {\n        // Unchecked: bildirim gerekmez, çalışma zamanında fırlar\n        int sonuc = a / b; // b == 0 ise ArithmeticException\n    }\n}",
  "weight": 1
 },
 {
  "id": "java-generics-type-erasure",
  "cat": "Java",
  "q": "generics type erasure jenerik tip silme parametreli tip list wildcard bounded derleme zamanı",
  "title": "Generics ve Type Erasure",
  "a": "Generics, tip güvenliğini derleme zamanında sağlar: List<String> içine yanlışlıkla Integer eklenmesi derleyici tarafından engellenir. Ancak type erasure nedeniyle tip parametreleri derleme sonrası silinir; çalışma zamanında List<String> ve List<Integer> aynı List sınıfıdır. Bu yüzden new T(), new T[] veya obj instanceof List<String> gibi ifadeler yazılamaz. Yaygın yanılgı: generics çalışma zamanında tip kontrolü yapmaz; kontrol tamamen derleme zamanındadır.",
  "code": "import java.util.ArrayList;\nimport java.util.List;\n\nclass Kutu<T> {\n    private T icerik;\n    void koy(T deger) { this.icerik = deger; }\n    T al() { return icerik; }\n}\n\nclass Test {\n    public static void main(String[] args) {\n        List<String> a = new ArrayList<>();\n        List<Integer> b = new ArrayList<>();\n        // Erasure: çalışma zamanında ikisi de aynı sınıf\n        System.out.println(a.getClass() == b.getClass()); // true\n    }\n}",
  "weight": 1
 },
 {
  "id": "java-stream-api",
  "cat": "Java",
  "q": "stream api filter map collect lambda fonksiyonel akış toplama reduce lazy tembel java 8",
  "title": "Stream API",
  "a": "Java 8 ile gelen Stream API, koleksiyonlar üzerinde filter, map, reduce gibi fonksiyonel işlemleri zincirleme yazmayı sağlar. Ara işlemler (filter, map) tembeldir (lazy); yalnızca collect veya forEach gibi bir terminal işlem çağrıldığında çalışır. Bir stream yalnızca bir kez tüketilebilir; aynı stream üzerinde ikinci kez terminal işlem çağırmak IllegalStateException fırlatır. Yaygın yanılgı: stream işlemleri kaynak koleksiyonu değiştirmez, yeni bir sonuç üretir.",
  "code": "import java.util.List;\nimport java.util.Locale;\nimport java.util.stream.Collectors;\n\nclass StreamOrnek {\n    public static void main(String[] args) {\n        List<String> isimler = List.of(\"Ali\", \"Ayşe\", \"Mehmet\", \"Aylin\");\n        // A ile başlayanları büyük harfe çevirip listele\n        List<String> sonuc = isimler.stream()\n                .filter(ad -> ad.startsWith(\"A\"))              // ara işlem (lazy)\n                .map(ad -> ad.toUpperCase(Locale.ROOT))        // ara işlem\n                .collect(Collectors.toList());                 // terminal işlem\n        System.out.println(sonuc); // [ALI, AYŞE, AYLIN]\n    }\n}",
  "weight": 1
 },
 {
  "id": "java-optional",
  "cat": "Java",
  "q": "optional null nullpointerexception npe boş değer ofnullable orelse map ispresent güvenli",
  "title": "Optional ile Null Yönetimi",
  "a": "Optional<T>, bir değerin bulunabileceğini veya bulunmayabileceğini tip düzeyinde ifade eden bir sarmalayıcıdır; özellikle metot dönüş tipi olarak NullPointerException riskini görünür kılar. Değere ulaşmak için orElse, orElseGet, map ve ifPresent gibi metotlar tercih edilmelidir; boş bir Optional üzerinde doğrudan get() çağırmak NoSuchElementException fırlatır. Yaygın yanılgı: Optional alan (field) veya metot parametresi olarak önerilmez; asıl kullanım amacı dönüş tipidir.",
  "code": "import java.util.Optional;\n\nclass OptionalOrnek {\n    static Optional<String> kullaniciBul(int id) {\n        return id == 1 ? Optional.of(\"Ali\") : Optional.empty();\n    }\n    public static void main(String[] args) {\n        // Değer yoksa varsayılan kullan\n        String ad = kullaniciBul(2).orElse(\"misafir\");\n        // Değer varsa dönüştür\n        int uzunluk = kullaniciBul(1).map(String::length).orElse(0);\n        System.out.println(ad + \" \" + uzunluk); // misafir 3\n    }\n}",
  "weight": 1
 },
 {
  "id": "java-arraylist-linkedlist-hashmap",
  "cat": "Java",
  "q": "arraylist linkedlist hashmap fark koleksiyon collection karmaşıklık complexity liste dizi hash performans seçim",
  "title": "ArrayList vs LinkedList vs HashMap",
  "a": "ArrayList dinamik bir dizidir: indeksle erişim O(1), ortadan ekleme/silme O(n)'dir ve çoğu senaryoda varsayılan tercih olmalıdır. LinkedList çift yönlü bağlı listedir: uçlardan ekleme/silme O(1) olsa da indeksle erişim O(n)'dir ve düğüm başına bellek ek yükü nedeniyle pratikte ArrayList'ten genellikle yavaştır. HashMap ise liste değil anahtar-değer eşlemesidir; ortalama O(1) get/put sunar ama sıralama garantisi vermez. Yaygın yanılgı: \"çok ekleme yapılacaksa LinkedList kullan\" tavsiyesi çoğu zaman yanlıştır; sona ekleme ArrayList'te de amortize O(1)'dir.",
  "code": "import java.util.*;\n\nclass KoleksiyonOrnek {\n    public static void main(String[] args) {\n        List<String> liste = new ArrayList<>(); // indeksli erişim O(1)\n        liste.add(\"elma\");\n        System.out.println(liste.get(0));\n\n        Deque<String> kuyruk = new ArrayDeque<>(); // uç işlemler için\n        kuyruk.addFirst(\"ilk\");\n\n        Map<String, Integer> stok = new HashMap<>(); // anahtar-değer, ort. O(1)\n        stok.put(\"elma\", 10);\n        System.out.println(stok.get(\"elma\")); // 10\n    }\n}",
  "weight": 1
 },
 {
  "id": "java-final-static",
  "cat": "Java",
  "q": "final static anahtar kelime keyword sabit constant sınıf değişkeni metot override kalıtım değişmez",
  "title": "final ve static Anahtar Kelimeleri",
  "a": "final; bir değişkende yeniden atamayı, bir metotta override edilmeyi, bir sınıfta kalıtım alınmayı engeller. static ise bir üyenin nesneye değil sınıfa ait olduğunu belirtir: static alan tüm nesnelerce paylaşılır, static metot nesne oluşturmadan çağrılır ve this'e erişemez. static final bir primitif ya da String, sabit ifadeyle ilklendirilirse derleme zamanı sabiti oluşturur (örn. Math.PI). Yaygın yanılgı: final bir referans değişkeni, işaret ettiği nesnenin içeriğini değişmez yapmaz; yalnızca referansın kendisi yeniden atanamaz.",
  "code": "class Sayac {\n    static int toplam = 0;              // tüm nesnelerce paylaşılır\n    static final double VERGI = 0.20;   // sabit\n    final int id;                        // nesne başına bir kez atanır\n\n    Sayac(int id) {\n        this.id = id;\n        toplam++; // sınıf düzeyinde sayaç\n    }\n\n    static int kacTane() { return toplam; } // nesnesiz çağrılır\n}",
  "weight": 1
 },
 {
  "id": "java-records",
  "cat": "Java",
  "q": "record records java 16 immutable veri sınıfı dto kayıt compact constructor equals otomatik",
  "title": "Records (Java 16+)",
  "a": "Record'lar, Java 16 ile kalıcı hale gelen değişmez veri taşıyıcı sınıflardır: bileşenlerden constructor, erişim metotları, equals, hashCode ve toString otomatik üretilir. Alanlar örtük olarak final'dır; record başka bir sınıftan kalıtım alamaz (örtük olarak java.lang.Record'u genişletir) ama interface implement edebilir. Doğrulama için compact constructor kullanılabilir. Yaygın yanılgı: erişim metotları getX() değil, bileşen adıyla aynıdır (örn. x()).",
  "code": "record Nokta(int x, int y) {\n    // Compact constructor: doğrulama için\n    Nokta {\n        if (x < 0 || y < 0)\n            throw new IllegalArgumentException(\"negatif olamaz\");\n    }\n}\n\nclass RecordOrnek {\n    public static void main(String[] args) {\n        Nokta n = new Nokta(3, 4);\n        System.out.println(n.x());        // 3 (getX() değil!)\n        System.out.println(n);            // Nokta[x=3, y=4]\n        System.out.println(n.equals(new Nokta(3, 4))); // true\n    }\n}",
  "weight": 1
 },
 {
  "id": "java-maven-gradle",
  "cat": "Java",
  "q": "maven gradle build araç bağımlılık dependency pom xml derleme paket yönetimi proje yapılandırma",
  "title": "Maven ve Gradle Build Araçları",
  "a": "Maven ve Gradle, Java projelerinde bağımlılık yönetimi, derleme, test ve paketlemeyi otomatikleştiren build araçlarıdır. Maven, XML tabanlı pom.xml ile bildirimsel ve katı bir yaşam döngüsü (compile, test, package, install) sunar; Gradle ise Groovy veya Kotlin DSL ile daha esnektir ve artımlı derleme ile build cache sayesinde büyük projelerde genellikle daha hızlıdır. İkisi de bağımlılıkları Maven Central gibi merkezi depolardan indirir. Yaygın yanılgı: Gradle, Maven depolarını kullanabilir; depo formatı ile build aracı ayrı kavramlardır.",
  "code": "<!-- Maven: pom.xml içinde bağımlılık -->\n<dependency>\n    <groupId>com.fasterxml.jackson.core</groupId>\n    <artifactId>jackson-databind</artifactId>\n    <version>2.17.1</version>\n</dependency>\n\n// Gradle: build.gradle.kts içinde aynı bağımlılık\ndependencies {\n    implementation(\"com.fasterxml.jackson.core:jackson-databind:2.17.1\")\n}",
  "weight": 1
 },
 {
  "id": "os-process-vs-thread",
  "cat": "İşletim Sistemi",
  "q": "process thread süreç iş parçacığı fark process vs thread bellek paylaşım stack heap multithreading",
  "title": "Process ile Thread Farkı",
  "a": "Process, kendi sanal adres alanına, dosya tanımlayıcılarına ve kaynaklarına sahip çalışan bir programdır; thread ise aynı process içinde çalışan, adres alanını ve açık dosyaları paylaşan hafif bir yürütme birimidir. Her thread'in kendi stack'i ve register seti vardır, ama heap ve global veriler ortaktır. Yaygın yanılgı: thread'ler paylaşılan bellek sayesinde iletişimde hızlıdır ama bu, veri yarışı (data race) riskini getirir; process'ler ise izolasyon sağlar fakat IPC gerektirir.",
  "code": "#include <pthread.h>\n#include <stdio.h>\n\nint sayac = 0; // tüm thread'ler bu global (data segment) veriyi paylaşır\n\nvoid *isle(void *arg) {\n    sayac++; // paylaşılan veri: mutex olmadan yarış koşulu!\n    return NULL;\n}\n\nint main(void) {\n    pthread_t t;\n    pthread_create(&t, NULL, isle, NULL); // aynı adres alanında yeni thread\n    pthread_join(t, NULL);\n    printf(\"%d\\n\", sayac);\n}",
  "weight": 1
 },
 {
  "id": "os-context-switch",
  "cat": "İşletim Sistemi",
  "q": "context switch bağlam değiştirme maliyet cost scheduler register TLB cache flush performans overhead",
  "title": "Context Switch Maliyeti",
  "a": "Context switch, CPU'nun bir thread/process'ten diğerine geçerken register'ları, program sayacını ve bellek eşlemesi bağlamını kaydedip yüklemesidir. Doğrudan maliyet (register kaydetme, kernel'e geçiş) mikrosaniyeler düzeyindedir; asıl maliyet dolaylıdır: CPU cache ve TLB'nin soğuması sonraki binlerce bellek erişimini yavaşlatır. Process'ler arası geçiş, adres alanı değiştiği için thread'ler arası geçişten daha pahalıdır; bu yüzden aşırı thread sayısı performansı artırmak yerine düşürebilir.",
  "code": null,
  "weight": 1
 },
 {
  "id": "os-deadlock",
  "cat": "İşletim Sistemi",
  "q": "deadlock kilitlenme ölümcül kilit coffman koşulları mutual exclusion hold and wait circular wait önleme prevention mutex",
  "title": "Deadlock Koşulları ve Önleme",
  "a": "Deadlock, iki veya daha fazla process/thread'in birbirinin tuttuğu kaynağı sonsuza dek beklemesidir. Dört Coffman koşulunun aynı anda sağlanması gerekir: karşılıklı dışlama (mutual exclusion), tut-ve-bekle (hold and wait), kaynağın zorla geri alınamaması (no preemption) ve döngüsel bekleme (circular wait). En pratik önleme yöntemi döngüsel beklemeyi kırmaktır: tüm kilitleri her yerde aynı sabit sırayla almak. Alternatifler arasında timeout'lu kilit deneme (trylock) ve tüm kaynakları tek seferde talep etme vardır.",
  "code": "// Deadlock senaryosu ve çözümü (kavramsal)\n// Thread A: lock(m1); lock(m2);\n// Thread B: lock(m2); lock(m1);  <-- döngüsel bekleme riski!\n\n// Çözüm: kilitleri HER YERDE aynı sırayla al\nvoid guvenli(void) {\n    pthread_mutex_lock(&m1); // önce her zaman m1\n    pthread_mutex_lock(&m2); // sonra m2\n    // ... kritik bölge ...\n    pthread_mutex_unlock(&m2);\n    pthread_mutex_unlock(&m1);\n}",
  "weight": 1
 },
 {
  "id": "os-sanal-bellek-sayfalama",
  "cat": "İşletim Sistemi",
  "q": "sanal bellek virtual memory paging sayfalama page table sayfa tablosu MMU adres çevirisi 4KB",
  "title": "Sanal Bellek ve Sayfalama",
  "a": "Sanal bellek, her process'e kendi izole ve sürekli görünen adres alanını sunar; fiziksel RAM'e eşleme, MMU donanımı ve sayfa tabloları (page table) üzerinden yapılır. Bellek, tipik olarak 4 KB'lık sayfalara bölünür ve sayfalar fiziksel çerçevelere (frame) bağımsız yerleştirilebilir. Bu sayede process'ler birbirinin belleğine erişemez, RAM'den büyük programlar çalışabilir ve az kullanılan sayfalar diske (swap) taşınabilir. Yaygın yanılgı: bir process'in gördüğü adresler fiziksel adres değildir; aynı sanal adres iki process'te farklı fiziksel belleğe karşılık gelir.",
  "code": null,
  "weight": 1
 },
 {
  "id": "os-page-fault",
  "cat": "İşletim Sistemi",
  "q": "page fault sayfa hatası minor major fault swap demand paging lazy allocation segfault bellek",
  "title": "Page Fault Nedir",
  "a": "Page fault, process'in eriştiği sanal sayfanın o an fiziksel bellekte eşlenmemiş olması durumunda MMU'nun ürettiği ve kernel'in yakaladığı bir istisnadır; her zaman hata anlamına gelmez. Minor fault'ta sayfa zaten bellektedir (örn. tembel ayırma veya paylaşılan kütüphane) ve sadece eşleme yapılır; major fault'ta sayfa diskten okunmalıdır ve bu binlerce kat yavaştır. Erişim tamamen geçersizse kernel process'e SIGSEGV gönderir (segmentation fault). Demand paging bu mekanizma üzerine kuruludur: malloc ile alınan bellek genelde ilk erişimde (özellikle ilk yazmada) gerçekten ayrılır.",
  "code": null,
  "weight": 1
 },
 {
  "id": "os-syscall",
  "cat": "İşletim Sistemi",
  "q": "syscall sistem çağrısı system call kernel geçiş write read open trap mekanizma strace libc wrapper",
  "title": "Syscall (Sistem Çağrısı) Mekanizması",
  "a": "Syscall, user space'teki bir programın kernel'den hizmet (dosya okuma, bellek ayırma, process oluşturma) istemesinin tek meşru yoludur. Program özel bir CPU komutu (x86-64'te syscall) çalıştırır; CPU kernel moduna geçer, kernel numarasına göre ilgili işlevi çalıştırıp sonucu döndürür. printf veya fopen gibi kütüphane fonksiyonları syscall değildir; bunlar altta write, open gibi gerçek syscall'ları saran libc wrapper'larıdır. Bir programın yaptığı syscall'ları strace aracıyla izleyebilirsiniz.",
  "code": "#include <unistd.h>\n#include <string.h>\n\nint main(void) {\n    const char *msg = \"merhaba\\n\";\n    // write(2) gerçek bir syscall wrapper'ıdır:\n    // fd=1 (stdout), tampon, uzunluk\n    write(1, msg, strlen(msg));\n    return 0;\n}\n// İzlemek için: strace ./program",
  "weight": 1
 },
 {
  "id": "os-kernel-vs-user-space",
  "cat": "İşletim Sistemi",
  "q": "kernel user space çekirdek kullanıcı alanı ring 0 ring 3 privilege ayrıcalık mod koruma izolasyon",
  "title": "Kernel Space ile User Space",
  "a": "CPU'lar en az iki ayrıcalık seviyesiyle çalışır: kernel modu (x86'da ring 0) donanıma ve tüm belleğe sınırsız erişebilir; user modu (ring 3) kısıtlıdır. İşletim sistemi çekirdeği ve sürücüleri kernel space'te, uygulamalar user space'te çalışır; geçiş yalnızca syscall, kesme (interrupt) veya istisna ile olur. Bu ayrım sayesinde çöken bir uygulama sistemi düşürmez, ama kernel'deki bir hata tüm sistemi çökertebilir (kernel panic). Yaygın yanılgı: root olarak çalışmak kernel modunda çalışmak değildir; root process'ler de user space'tedir.",
  "code": null,
  "weight": 1
 },
 {
  "id": "os-file-descriptor",
  "cat": "İşletim Sistemi",
  "q": "file descriptor dosya tanımlayıcı fd stdin stdout stderr 0 1 2 open close dup2 yönlendirme",
  "title": "Dosya Tanımlayıcıları (File Descriptor)",
  "a": "File descriptor (fd), kernel'in process başına tuttuğu açık dosya tablosuna işaret eden küçük bir tamsayıdır; sadece dosyaları değil socket, pipe ve terminal gibi her G/Ç kaynağını temsil eder. Her process 0 (stdin), 1 (stdout), 2 (stderr) ile başlar; open yeni bir fd döndürür, close serbest bırakır. Shell'deki 2>&1 gibi yönlendirmeler dup2 ile fd kopyalamaya dayanır. Kapatılmayan fd'ler sızıntıya yol açar ve process başına fd limiti (ulimit -n) aşılabilir.",
  "code": "#include <fcntl.h>\n#include <unistd.h>\n\nint main(void) {\n    // open en küçük boş fd numarasını döndürür (genelde 3)\n    int fd = open(\"log.txt\", O_WRONLY | O_CREAT | O_TRUNC, 0644);\n    if (fd < 0) return 1;\n    write(fd, \"kayit\\n\", 6);\n    close(fd); // sızıntıyı önlemek için mutlaka kapat\n    return 0;\n}",
  "weight": 1
 },
 {
  "id": "os-sigkill-vs-sigterm",
  "cat": "İşletim Sistemi",
  "q": "signal sinyal SIGKILL SIGTERM SIGINT kill -9 process sonlandırma graceful shutdown handler yakalama",
  "title": "Sinyaller: SIGKILL ile SIGTERM Farkı",
  "a": "SIGTERM (kill komutunun varsayılanı, sinyal 15) process'e nazikçe sonlanma isteği gönderir; process bunu yakalayıp kaynakları temizleyebilir, dosyaları kapatıp düzgün kapanabilir. SIGKILL (kill -9, sinyal 9) ise yakalanamaz ve engellenemez; kernel process'i anında sonlandırır, temizlik kodu çalışmaz. Bu yüzden doğru pratik önce SIGTERM göndermek, yanıt yoksa SIGKILL'e başvurmaktır. Not: SIGKILL bile kesilemeyen G/Ç'de bekleyen (D durumundaki) process'i hemen öldüremeyebilir.",
  "code": "#include <signal.h>\n#include <unistd.h>\n\nvoid temizle(int sig) {\n    // Handler içinde yalnızca async-signal-safe fonksiyonlar kullan:\n    // write ve _exit güvenlidir, printf/exit değildir.\n    write(1, \"SIGTERM alindi, temiz kapaniyorum\\n\", 34);\n    _exit(0);\n}\n\nint main(void) {\n    signal(SIGTERM, temizle); // SIGTERM yakalanabilir\n    // signal(SIGKILL, ...) ise ISE YARAMAZ: yakalanamaz\n    for (;;) pause();\n}",
  "weight": 1
 },
 {
  "id": "os-zombie-orphan",
  "cat": "İşletim Sistemi",
  "q": "zombie orphan process yetim süreç defunct wait waitpid reap init systemd PID 1 fork",
  "title": "Zombie ve Orphan Process",
  "a": "Zombie process, sonlanmış ama çıkış durumu ebeveyni tarafından henüz wait/waitpid ile okunmamış process'tir; kernel sadece PID ve çıkış kodunu tutar, bellek/CPU harcamaz ama process tablosunda yer kaplar. Orphan (yetim) process ise ebeveyni kendisinden önce ölen process'tir; init (PID 1, çoğu sistemde systemd) tarafından evlat edinilir ve o sonlandığında düzgünce toplanır. Yaygın yanılgı: zombie'ler kill ile öldürülemez, zaten ölüdürler; çözüm ebeveynin wait çağırması veya ebeveynin sonlanmasıdır.",
  "code": "#include <sys/wait.h>\n#include <unistd.h>\n\nint main(void) {\n    pid_t pid = fork();\n    if (pid == 0) {\n        _exit(0); // çocuk hemen sonlanır\n    }\n    // wait çağrılmazsa çocuk zombie olarak kalır\n    waitpid(pid, NULL, 0); // çıkış durumunu topla (reap)\n    return 0;\n}",
  "weight": 1
 },
 {
  "id": "os-cpu-zamanlama",
  "cat": "İşletim Sistemi",
  "q": "CPU scheduling zamanlama scheduler round robin preemptive öncelik priority CFS nice time slice quantum",
  "title": "CPU Zamanlama (Scheduling)",
  "a": "Zamanlayıcı (scheduler), çalışmaya hazır process/thread'ler arasında CPU'yu paylaştırır. Klasik algoritmalar: FIFO (FCFS), en kısa iş önce (SJF), zaman dilimli round-robin ve öncelik tabanlı zamanlama. Modern sistemler preemptive'dir: zaman dilimi (time slice) dolan veya daha yüksek öncelikli iş gelen thread kesilir. Linux'ta genel amaçlı görevler uzun yıllar CFS ile zamanlandı (6.6'dan itibaren yerini EEVDF aldı); nice değeri (-20 ile 19) process'in CPU payını etkiler, düşük nice daha çok pay demektir.",
  "code": null,
  "weight": 1
 },
 {
  "id": "os-mmap",
  "cat": "İşletim Sistemi",
  "q": "mmap memory mapping bellek haritalama dosya eşleme shared anonymous MAP_SHARED munmap sayfa",
  "title": "Bellek Haritalama (mmap)",
  "a": "mmap, bir dosyayı veya anonim belleği process'in sanal adres alanına sayfa sayfa eşler; dosya içeriğine read/write yerine doğrudan pointer ile erişilir. Sayfalar tembel yüklenir: ilk erişimde page fault ile diskten getirilir, bu sayede dev dosyalar RAM'e komple kopyalanmadan işlenebilir. MAP_SHARED ile yapılan değişiklikler dosyaya yansır ve process'ler arası paylaşılan bellek sağlar; glibc malloc da büyük ayırmalarda altta anonim mmap kullanır.",
  "code": "#include <sys/mman.h>\n#include <fcntl.h>\n#include <sys/stat.h>\n#include <stdio.h>\n#include <unistd.h>\n\nint main(void) {\n    int fd = open(\"veri.txt\", O_RDONLY);\n    struct stat st;\n    if (fd < 0 || fstat(fd, &st) < 0) return 1;\n    // Dosyayı adres alanına eşle: kopyasız erişim\n    char *p = mmap(NULL, st.st_size, PROT_READ, MAP_PRIVATE, fd, 0);\n    if (p != MAP_FAILED) { fwrite(p, 1, st.st_size, stdout); munmap(p, st.st_size); }\n    close(fd);\n}",
  "weight": 1
 },
 {
  "id": "os-buffer-vs-cache",
  "cat": "İşletim Sistemi",
  "q": "buffer cache fark page cache buff/cache free komutu disk önbellek tampon bellek RAM kullanımı",
  "title": "Buffer ile Cache Farkı",
  "a": "Linux'ta cache (page cache), dosya içeriklerinin RAM'de tutulan kopyasıdır; tekrar okumalar diske gitmeden bellekten karşılanır. Buffer ise blok aygıtlarının ham blok verisi ve dosya sistemi metadata'sı (örn. inode blokları) için kullanılan tampondur; modern kernel'lerde ikisi büyük ölçüde birleşiktir ve free komutunda buff/cache olarak birlikte görünür. Yaygın yanılgı: buff/cache dolu diye 'RAM bitti' sanılır; bu bellek geri kazanılabilirdir ve uygulamalar ihtiyaç duyduğunda kernel tarafından boşaltılır, asıl bakılması gereken 'available' sütunudur.",
  "code": null,
  "weight": 1
 },
 {
  "id": "os-inode",
  "cat": "İşletim Sistemi",
  "q": "inode nedir dosya sistemi filesystem metadata hard link stat df -i dosya adı dizin numarası",
  "title": "Inode Nedir",
  "a": "Inode, Unix dosya sistemlerinde bir dosyanın tüm metadata'sını tutan yapıdır: boyut, sahip, izinler, zaman damgaları ve veri bloklarının yerleri. Dosya adı inode'da DEĞİL dizin girdilerinde durur; dizin, isim ile inode numarasını eşleyen bir tablodur. Bu yüzden hard link mümkündür: birden çok isim aynı inode'u gösterebilir ve dosya, link sayısı sıfırlanıp son fd kapanana dek silinmez. Disk boş görünse de inode'lar tükenebilir (çok sayıda küçük dosya); df -i ile kontrol edilir.",
  "code": "# Bir dosyanın inode numarasını ve metadata'sını gör\nstat dosya.txt\n\n# Hard link: aynı inode'a ikinci isim\nln dosya.txt kopya_degil.txt\nls -li dosya.txt kopya_degil.txt  # inode numaraları aynı\n\n# Inode kullanımını kontrol et\ndf -i",
  "weight": 1
 },
 {
  "id": "sd-yatay-dikey-olcekleme",
  "cat": "Sistem Tasarımı",
  "q": "yatay dikey ölçekleme horizontal vertical scaling scale out up sunucu kapasite büyüme performans",
  "title": "Yatay vs Dikey Ölçekleme",
  "a": "Dikey ölçekleme (scale up) tek bir sunucuya daha fazla CPU, RAM veya disk eklemektir; uygulaması kolaydır ama donanım limitine takılır ve tek hata noktası oluşturur. Yatay ölçekleme (scale out) yükü birden fazla makineye dağıtmaktır; teorik olarak sınırsız büyür ama uygulamanın stateless olmasını ve load balancer, dağıtık veri gibi ek karmaşıklıkları gerektirir. Yaygın yanılgı: yatay ölçeklemenin her zaman daha iyi olduğu — küçük ve orta yüklerde dikey ölçekleme çoğu zaman daha basit ve ucuzdur.",
  "code": "Dikey (scale up):          Yatay (scale out):\n\n  [ 4 CPU / 8 GB ]            [ LB ]\n        |                    /   |   \\\n        v                [S1]  [S2]  [S3]\n  [ 16 CPU / 64 GB ]      (aynı boyutta N sunucu)\n\n  Limit: en büyük makine   Limit: koordinasyon maliyeti",
  "weight": 1
 },
 {
  "id": "sd-load-balancer-l4-l7",
  "cat": "Sistem Tasarımı",
  "q": "load balancer yük dengeleyici L4 L7 layer katman nginx haproxy TCP HTTP routing dağıtım",
  "title": "Load Balancer: L4 vs L7",
  "a": "L4 (transport katmanı) load balancer, IP ve TCP/UDP port bilgisine bakarak paketleri yönlendirir; içeriği görmediği için çok hızlıdır ve düşük gecikme sağlar. L7 (application katmanı) load balancer HTTP isteğini okur; URL yoluna, header'lara veya cookie'ye göre yönlendirme, TLS sonlandırma ve içerik bazlı kurallar uygulayabilir, ancak her isteği parse ettiği için daha maliyetlidir. Pratikte ikisi birlikte kullanılabilir: dışta L4, arkada L7.",
  "code": "# nginx L7 örneği: path'e göre farklı backend\nupstream api  { server 10.0.0.1:8080; server 10.0.0.2:8080; }\nupstream statik { server 10.0.1.1:80; }\n\nserver {\n    listen 80;\n    location /api/    { proxy_pass http://api; }    # dinamik istekler\n    location /assets/ { proxy_pass http://statik; } # statik içerik\n}",
  "weight": 1
 },
 {
  "id": "sd-cap-teoremi",
  "cat": "Sistem Tasarımı",
  "q": "CAP teoremi consistency availability partition tolerance tutarlılık erişilebilirlik bölünme dağıtık sistem tradeoff",
  "title": "CAP Teoremi",
  "a": "CAP teoremi, dağıtık bir sistemde ağ bölünmesi (partition) yaşandığında tutarlılık (consistency) ile erişilebilirlik (availability) arasında seçim yapmak zorunda olduğunuzu söyler; üçü aynı anda garanti edilemez. Yaygın yanılgı: 'CP veya AP sistemi seçilir' ifadesi — partition olmadığı normal zamanlarda sistem hem tutarlı hem erişilebilir olabilir; seçim yalnızca bölünme anında devreye girer. Ayrıca buradaki C, ACID'deki C değil, lineer tutarlılık (linearizability) anlamındadır.",
  "code": "Ağ bölünmesi anında:\n\n  [Node A] --X-- [Node B]   (bağlantı koptu)\n\n  CP: yazmayı reddet -> tutarlı kal, erişilebilirlikten ödün ver\n      (örn. etcd, ZooKeeper)\n  AP: yazmayı kabul et -> erişilebilir kal, tutarsızlık riski\n      (örn. Cassandra, DynamoDB varsayılan modu)",
  "weight": 1
 },
 {
  "id": "sd-veritabani-replikasyonu",
  "cat": "Sistem Tasarımı",
  "q": "replikasyon replication master replica primary secondary veritabanı kopyalama okuma ölçekleme lag failover",
  "title": "Veritabanı Replikasyonu (Master-Replica)",
  "a": "Master-replica replikasyonunda yazmalar tek bir master (primary) düğüme gider, değişiklikler replica'lara kopyalanır; okumalar replica'lara dağıtılarak okuma kapasitesi artırılır ve master çökerse bir replica terfi ettirilebilir. Asenkron replikasyonda replication lag oluşur: yazdıktan hemen sonra replica'dan okursanız eski veri görebilirsiniz (read-your-writes sorunu). Kritik okumaları master'dan yapmak veya senkron replikasyon kullanmak bu sorunu çözer ama gecikmeyi artırır.",
  "code": "            yazma\nUygulama ---------> [Master]\n    |                  |  değişiklik akışı (WAL/binlog)\n    |            +-----+-----+\n    | okuma      v           v\n    +------> [Replica1]  [Replica2]\n\nDikkat: asenkron modda Replica'lar master'ın\nbirkaç ms/sn gerisinde olabilir (replication lag).",
  "weight": 1
 },
 {
  "id": "sd-sharding-stratejileri",
  "cat": "Sistem Tasarımı",
  "q": "sharding parçalama partition shard key hash range veritabanı yatay bölme hot spot resharding",
  "title": "Sharding Stratejileri",
  "a": "Sharding, veriyi bir shard key'e göre birden fazla veritabanı düğümüne yatay bölmektir. Range-based sharding aralıklara göre böler ve aralık sorgularını kolaylaştırır ama sıcak nokta (hot spot) riski taşır; hash-based sharding veriyi eşit dağıtır ama aralık sorgularını zorlaştırır. Tutarlı hashing (consistent hashing), düğüm eklendiğinde taşınacak veri miktarını azaltır. Yaygın hata: shard key'i sonradan değiştirmenin çok maliyetli olduğunu hesaba katmamak — key seçimi en kritik karardır. Ayrıca hash fonksiyonu deterministik olmalıdır: örneğin Python'un yerleşik hash() fonksiyonu string'ler için süreç bazında rastgeleleştirildiğinden shard seçiminde kullanılamaz.",
  "code": "# Hash tabanlı shard seçimi (kavramsal, Python)\nimport hashlib\n\nNUM_SHARDS = 4\n\ndef shard_icin(user_id: int) -> int:\n    # Deterministik hash: her süreçte/sunucuda aynı sonucu verir.\n    # (Yerleşik hash() string'lerde rastgeleleştirilmiştir, kullanmayın!)\n    h = hashlib.md5(str(user_id).encode()).hexdigest()\n    return int(h, 16) % NUM_SHARDS\n\n# Dikkat: NUM_SHARDS değişirse neredeyse tüm kayıtlar\n# yer değiştirir; bunun için consistent hashing kullanılır.",
  "weight": 1
 },
 {
  "id": "sd-cdn-nasil-calisir",
  "cat": "Sistem Tasarımı",
  "q": "CDN content delivery network edge cache önbellek statik içerik latency gecikme origin TTL",
  "title": "CDN Nasıl Çalışır",
  "a": "CDN (Content Delivery Network), içeriği kullanıcıya coğrafi olarak yakın edge sunucularda önbelleğe alarak gecikmeyi düşürür ve origin sunucunun yükünü azaltır. Kullanıcı isteği DNS veya anycast ile en yakın edge'e yönlendirilir; içerik orada yoksa (cache miss) origin'den çekilir, TTL süresince saklanır ve sonraki istekler doğrudan edge'den karşılanır. Yaygın yanılgı: CDN'in sadece statik dosyalar için olduğu — modern CDN'ler dinamik içerik hızlandırma, TLS sonlandırma ve DDoS koruması da sağlar.",
  "code": "Kullanıcı (İstanbul)\n     |  1. istek en yakın edge'e gider\n     v\n[Edge - Frankfurt]  -- cache HIT --> yanıt (hızlı)\n     |  cache MISS\n     v\n[Origin - us-east]  -> içerik edge'e kopyalanır,\n                       TTL boyunca önbellekte kalır\n\nHTTP: Cache-Control: max-age=86400 (edge'de 1 gün)",
  "weight": 1
 },
 {
  "id": "sd-tutarlilik-modelleri",
  "cat": "Sistem Tasarımı",
  "q": "tutarlılık consistency strong eventual güçlü nihai model dağıtık okuma yazma stale linearizability",
  "title": "Tutarlılık Modelleri: Strong vs Eventual",
  "a": "Strong consistency'de her okuma, en son tamamlanmış yazmayı görür; sistem tek bir kopya gibi davranır ama bu, düğümler arası koordinasyon gerektirdiği için gecikmeyi ve erişilemezlik riskini artırır. Eventual consistency'de yazma hemen tüm kopyalara yayılmaz; yeterli süre geçince tüm replikalar aynı değere yakınsar, bu arada eski (stale) veri okunabilir. Aradaki modeller de vardır: read-your-writes, monotonic reads, causal consistency. Kritik olan, hangi verinin ne kadar bayatlığa tolerans gösterdiğini iş kuralına göre belirlemektir.",
  "code": "t=0  Yazma: x=5 (Node A'ya ulaştı, B'ye henüz değil)\n\nStrong:   B'den okuma ya 5 döner ya da yayılım\n          bitene kadar bekler/koordine olur.\nEventual: B'den okuma eski değeri (x=3) dönebilir;\n          bir süre sonra tüm okumalar 5 döner.\n\nÖrnek: banka bakiyesi -> strong,\n       beğeni sayacı  -> eventual yeterli.",
  "weight": 1
 },
 {
  "id": "sd-message-broker-secimi",
  "cat": "Sistem Tasarımı",
  "q": "message broker kuyruk queue kafka rabbitmq mesaj asenkron pub sub event stream seçim",
  "title": "Message Broker Seçimi",
  "a": "Broker seçimi kullanım desenine bağlıdır: RabbitMQ gibi klasik kuyruklar iş dağıtımı (task queue), karmaşık yönlendirme ve mesaj başına acknowledgment için uygundur; mesaj tüketilip ack'lenince kuyruktan silinir. Kafka gibi log tabanlı sistemler yüksek hacimli event streaming, mesajların yeniden okunması (replay) ve birden çok bağımsız tüketici grubu için tasarlanmıştır; mesajlar retention süresi boyunca saklanır. Yaygın hata: 'Kafka her zaman daha iyidir' varsayımı — düşük hacimli iş kuyruğu için Kafka operasyonel açıdan gereksiz yüktür.",
  "code": "İş kuyruğu (RabbitMQ tarzı):\n  Producer -> [queue] -> Worker (mesaj ack sonrası silinir)\n  Uygun: e-posta gönderimi, görüntü işleme görevleri\n\nEvent log (Kafka tarzı):\n  Producer -> [partition'lı log, offset'li]\n              <- ConsumerGroup A (offset 120)\n              <- ConsumerGroup B (offset 87, bağımsız)\n  Uygun: clickstream, event sourcing, replay ihtiyacı",
  "weight": 1
 },
 {
  "id": "sd-idempotency-dagitik",
  "cat": "Sistem Tasarımı",
  "q": "idempotency idempotent tekrar retry duplicate mükerrer istek idempotency key ödeme at-least-once dağıtık",
  "title": "Dağıtık Sistemlerde Idempotency",
  "a": "Idempotent bir işlem, bir veya birden çok kez çalıştırıldığında aynı sonucu üretir. Dağıtık sistemlerde ağ hataları ve retry mekanizmaları nedeniyle aynı istek birden fazla ulaşabilir (at-least-once teslimat); idempotency olmadan bu, çift ödeme gibi hatalara yol açar. Çözüm genellikle istemcinin ürettiği bir idempotency key'in sunucuda saklanması ve tekrar eden isteklerde kayıtlı sonucun döndürülmesidir. Yaygın yanılgı: HTTP PUT/DELETE'in otomatik idempotent olduğu — protokol semantiği bunu vaat eder ama uygulama kodu bunu gerçekten sağlamalıdır.",
  "code": "-- Idempotency key ile ödeme (kavramsal, PostgreSQL)\n-- Aynı key ikinci kez gelirse insert sessizce atlanır\n-- (yeni kayıt oluşmaz); uygulama kayıtlı sonucu\n-- okuyup istemciye döndürür.\nCREATE TABLE odemeler (\n  idempotency_key TEXT PRIMARY KEY,\n  tutar NUMERIC NOT NULL,\n  durum TEXT NOT NULL\n);\n\nINSERT INTO odemeler (idempotency_key, tutar, durum)\nVALUES ('req-7f3a', 150.00, 'tamamlandi')\nON CONFLICT (idempotency_key) DO NOTHING;",
  "weight": 1
 },
 {
  "id": "sd-circuit-breaker",
  "cat": "Sistem Tasarımı",
  "q": "circuit breaker devre kesici pattern desen hata failure cascading timeout resilience half-open",
  "title": "Circuit Breaker Deseni",
  "a": "Circuit breaker, sürekli hata veren bir bağımlılığa istek göndermeyi geçici olarak keserek zincirleme çökmeleri (cascading failure) ve thread/bağlantı tükenmesini önler. Üç durumu vardır: closed (istekler normal akar, hatalar sayılır), open (eşik aşıldı, istekler beklemeden hızlıca reddedilir), half-open (belirli süre sonra sınırlı deneme isteği gönderilir; başarılıysa closed'a döner). Yaygın hata: circuit breaker'ı timeout yerine kullanmak — ikisi tamamlayıcıdır, breaker timeout'ların birikmesini engeller.",
  "code": "         hata oranı eşiği aşıldı\n[CLOSED] ---------------------------> [OPEN]\n   ^                                    |\n   | deneme başarılı        bekleme süresi doldu\n   |                                    v\n   +--------- [HALF-OPEN] <-------------+\n                  |\n                  +-- deneme başarısız --> tekrar OPEN",
  "weight": 1
 },
 {
  "id": "sd-health-check-failover",
  "cat": "Sistem Tasarımı",
  "q": "health check sağlık kontrolü failover yük devretme liveness readiness probe monitoring kubernetes yüksek erişilebilirlik",
  "title": "Health Check ve Failover",
  "a": "Health check, bir servisin trafiği karşılayıp karşılayamayacağını periyodik olarak sınar; load balancer veya orkestratör başarısız düğümü havuzdan çıkarır ve trafiği sağlıklı kopyalara devreder (failover). Liveness (süreç canlı mı, değilse restart) ile readiness (trafik almaya hazır mı, değilse havuzdan çıkar) ayrımı önemlidir. Yaygın hata: liveness check içinde veritabanı gibi bağımlılıkları sorgulamak — bağımlılık çökünce tüm instance'lar 'unhealthy' görünür ve gereksiz toplu restart tetiklenir.",
  "code": "# Kubernetes probe örneği\nlivenessProbe:\n  httpGet: { path: /healthz, port: 8080 }\n  periodSeconds: 10     # 10 sn'de bir kontrol\n  failureThreshold: 3   # 3 hata -> container restart\nreadinessProbe:\n  httpGet: { path: /ready, port: 8080 }\n  periodSeconds: 5      # hazır değilse trafik kesilir",
  "weight": 1
 },
 {
  "id": "sd-cqrs",
  "cat": "Sistem Tasarımı",
  "q": "CQRS command query responsibility segregation okuma yazma ayrımı model read write event sourcing",
  "title": "CQRS (Command Query Responsibility Segregation)",
  "a": "CQRS, yazma (command) ve okuma (query) yollarını ayrı modellere ayırır: yazma tarafı iş kurallarını doğrular, okuma tarafı sorgular için optimize edilmiş (örn. denormalize) görünümler sunar; iki taraf ayrı veritabanları bile kullanabilir. Okuma modeli genellikle event'lerle asenkron güncellendiği için eventual consistency ortaya çıkar. Yaygın hatalar: CQRS'i her projede uygulamak (basit CRUD için gereksiz karmaşıklıktır) ve CQRS ile event sourcing'i eş anlamlı sanmak — birlikte kullanılabilirler ama bağımsız desenlerdir.",
  "code": "Command:  UI -> [Yazma modeli] -> yazma DB\n                     |\n                     | event: SiparisOlusturuldu\n                     v\nQuery:    UI <- [Okuma modeli] <- projeksiyon (denormalize okuma DB)\n\nNot: okuma tarafı asenkron güncellenir ->\nkısa süreli eski veri (eventual consistency).",
  "weight": 1
 },
 {
  "id": "sd-saga-deseni",
  "cat": "Sistem Tasarımı",
  "q": "saga pattern desen dağıtık transaction işlem compensating telafi choreography orchestration mikroservis",
  "title": "Saga Deseni",
  "a": "Saga, birden çok servise yayılan bir iş akışını, her biri kendi servisinde commit edilen yerel transaction'lar dizisi olarak yürütür; dağıtık ACID transaction (2PC) yerine kullanılır. Bir adım başarısız olursa, önceki adımlar telafi işlemleriyle (compensating transaction) geri alınır — örn. 'ödemeyi iade et'. İki uygulama biçimi vardır: choreography (servisler event'lerle birbirini tetikler) ve orchestration (merkezi bir koordinatör adımları yönetir). Dikkat: telafi geri alma değildir; ara durumlar dışarıdan gözlemlenebilir, yani izolasyon garantisi yoktur.",
  "code": "Sipariş sagası (orchestration):\n 1. SiparisOlustur      (Order servisi)\n 2. OdemeAl             (Payment servisi)\n 3. StokAyir            (Inventory servisi)  <- HATA!\n\nTelafi zinciri (ters sırayla):\n 2'. OdemeyiIadeEt\n 1'. SiparisiIptalEt\n\nHer adım kendi lokal transaction'ında commit edilir.",
  "weight": 1
 },
 {
  "id": "sd-kapasite-hesabi",
  "cat": "Sistem Tasarımı",
  "q": "kapasite hesabı capacity estimation planning QPS RPS throughput depolama bandwidth back of envelope tahmin",
  "title": "Kapasite Hesabı (Back-of-the-Envelope)",
  "a": "Kapasite hesabı, tasarımdan önce QPS, depolama ve bant genişliği gibi büyüklükleri kabaca tahmin etmektir; amaç kesin sayı değil, doğru mertebeyi (order of magnitude) bulmaktır. Temel yaklaşım: günlük aktif kullanıcı x kullanıcı başına işlem / 86.400 saniye = ortalama QPS; tepe (peak) yük için genellikle 2-5 kat çarpan eklenir. Yaygın hata: ortalamaya göre boyutlandırmak — sistem tepe yüke göre tasarlanmalıdır; ayrıca depolamada replikasyon çarpanı unutulmamalıdır.",
  "code": "Örnek: 10M günlük aktif kullanıcı, kişi başı 10 istek/gün\n\nOrt. QPS  = 10M * 10 / 86.400  ≈ 1.160 QPS\nTepe QPS  ≈ 1.160 * 3          ≈ 3.500 QPS\n\nDepolama: istek başına 1 KB yazma, %10'u kalıcı\n  = 100M * 1 KB * 0.10 ≈ 10 GB/gün\n  x 3 (replikasyon) x 365 ≈ ~11 TB/yıl",
  "weight": 1
 },
 {
  "id": "sd-tek-hata-noktasi-spof",
  "cat": "Sistem Tasarımı",
  "q": "SPOF single point of failure tek hata noktası redundancy yedeklilik yüksek erişilebilirlik high availability",
  "title": "Tek Hata Noktası (SPOF)",
  "a": "SPOF (single point of failure), çöktüğünde tüm sistemi devre dışı bırakan tek bileşendir: tek veritabanı, tek load balancer, tek veri merkezi veya tek DNS sağlayıcı olabilir. Çözüm redundancy'dir: her kritik bileşenden en az iki kopya, otomatik failover ve mümkünse farklı availability zone'lara dağıtım. Yaygın yanılgı: load balancer eklemenin sorunu çözdüğü — LB'nin kendisi tek ise yeni SPOF odur; ayrıca yedek bileşen düzenli test edilmiyorsa (failover tatbikatı) gerçekte çalışmayabilir.",
  "code": "SPOF'lu:                 Yedekli (redundant):\n\n  [LB]  <-- tek LB!        [LB1]--[LB2] (VIP/DNS failover)\n    |                        |      |\n [App]x3                   [App]x3 (2+ zone'a dağıtık)\n    |                        |\n  [DB]  <-- tek DB!        [Primary]->[Replica] (oto failover)",
  "weight": 1
 },
 {
  "id": "test-piramidi",
  "cat": "Test",
  "q": "test piramidi test pyramid unit integration e2e oran strateji katman hız maliyet birim testi",
  "title": "Test piramidi: unit/integration/e2e dengesi",
  "a": "Test piramidi, test sayısının katmanlara göre dağılımını önerir: en altta çok sayıda hızlı unit test, ortada daha az integration test, en üstte az sayıda yavaş ve pahalı e2e test. Mantık basittir: aşağı indikçe testler hızlanır, ucuzlar ve hata konumunu daha keskin gösterir. Yaygın anti-pattern 'ice cream cone'dur: manuel ve e2e test ağırlıklı, unit test azınlıkta olan yapı; bu, geri bildirim döngüsünü yavaşlatır ve bakım maliyetini artırır. Oranlar dogma değildir; integration katmanına daha fazla ağırlık veren 'testing trophy' (Kent C. Dodds) gibi varyantlar da savunulur; mikroservis dünyasında ise benzer amaçla 'testing honeycomb' önerilmiştir.",
  "code": "        /\\\n       /e2e\\      <- az sayıda, yavaş, kırılgan (tam kullanıcı akışı)\n      /------\\\n     /integr. \\   <- orta sayıda (DB, API, servisler arası)\n    /----------\\\n   /   unit     \\ <- çok sayıda, milisaniyeler, izole\n  /--------------\\\n  Aşağı indikçe: daha hızlı, daha ucuz, hata konumu daha net",
  "weight": 1
 },
 {
  "id": "test-mock-stub-fake-spy",
  "cat": "Test",
  "q": "mock stub fake spy test double taklit nesne fark mocking sahte nesne doğrulama davranış",
  "title": "Mock vs stub vs fake vs spy farkı",
  "a": "Hepsi 'test double' (taklit nesne) çeşitleridir ama amaçları farklıdır. Stub, çağrıldığında önceden belirlenmiş yanıt döner; sadece testin girdisini sağlar. Mock, kendisiyle nasıl etkileşildiğini (hangi metot, hangi argümanlarla, kaç kez) doğrulamak için kullanılır; test mock üzerindeki beklentiyle geçer/kalır. Spy, gerçek nesneyi sararak çağrıları kaydeder; fake ise çalışan ama basitleştirilmiş bir gerçek implementasyondur (örn. in-memory veritabanı). Yaygın hata her şeye 'mock' demek ve davranış doğrulaması gerekmeyen yerde mock kullanıp testleri implementasyona sıkı sıkıya bağlamaktır.",
  "code": "// Jest örneği\ntest('siparişte e-posta gönderilir', () => {\n  // stub: sabit yanıt döner\n  const fiyatServisi = { getir: jest.fn().mockReturnValue(100) };\n  // mock/spy: çağrıyı kaydeder, sonra doğrulanır\n  const epostaServisi = { gonder: jest.fn() };\n\n  siparisOlustur(fiyatServisi, epostaServisi, 'a@b.com');\n\n  expect(epostaServisi.gonder).toHaveBeenCalledWith('a@b.com'); // davranış doğrulama\n});",
  "weight": 1
 },
 {
  "id": "test-coverage-yorumlama",
  "cat": "Test",
  "q": "test coverage kapsam yüzde tuzağı line branch statement kod kapsamı yorumlama metrik yüzde 100",
  "title": "Test coverage yorumlama ve yüzde tuzağı",
  "a": "Coverage, testler çalışırken hangi kod satırlarının/dallarının çalıştırıldığını ölçer; kodun doğru test edildiğini DEĞİL, sadece çalıştırıldığını gösterir. Assertion içermeyen bir test bile %100 coverage üretebilir; bu yüzden 'yüzde X hedefi' tek başına kalite garantisi değildir. Line coverage yanıltıcı olabilir; branch coverage (her if'in hem true hem false dalı) daha anlamlıdır ama o da yeterli değildir. Coverage'ı hedef değil teşhis aracı olarak kullanın: düşük coverage sorunu işaret eder, yüksek coverage güvence vermez (Goodhart yasası: metrik hedefe dönüşünce anlamını yitirir).",
  "code": "def indirim(fiyat, uye):\n    if uye:\n        return fiyat * 0.9\n    return fiyat\n\n# Bu test %100 line coverage verir ama hicbir sey dogrulamaz:\ndef test_kotu():\n    indirim(100, True)   # assert yok!\n    indirim(100, False)  # coverage %100, guvence sifir",
  "weight": 1
 },
 {
  "id": "test-flaky-sebep-cozum",
  "cat": "Test",
  "q": "flaky test kararsız test rastgele başarısız sebep çözüm race condition timeout sıra bağımlılığı retry",
  "title": "Flaky test sebepleri ve çözümleri",
  "a": "Flaky test, kod değişmediği halde bazen geçen bazen kalan testtir. Başlıca sebepler: async işlemlerde sabit sleep ile bekleme (race condition), testler arası paylaşılan durum (sıra bağımlılığı), gerçek saat/tarih kullanımı, rastgele veri, ağ/harici servis bağımlılığı ve kaynak yarışı (port, dosya). Çözümler: sleep yerine koşul bazlı bekleme (polling/waitFor), her testin kendi verisini kurup temizlemesi, saatin ve rastgeleliğin sabitlenmesi (fake clock, seed), harici servislerin taklit edilmesi. Otomatik retry semptomu gizler, sebebi çözmez; flaky testi karantinaya alıp kök nedeni bulmak gerekir.",
  "code": "// KOTU: sabit bekleme -> yavas makinede patlar\nawait new Promise(r => setTimeout(r, 2000));\nexpect(liste.length).toBe(3);\n\n// IYI: kosul saglanana kadar bekle (Testing Library)\nawait waitFor(() => expect(liste.length).toBe(3));\n\n// IYI: saati sabitle (Jest 27+)\njest.useFakeTimers().setSystemTime(new Date('2026-01-01'));",
  "weight": 1
 },
 {
  "id": "test-property-based",
  "cat": "Test",
  "q": "property based testing özellik tabanlı test hypothesis fast-check quickcheck rastgele girdi shrinking invariant",
  "title": "Property-based testing",
  "a": "Property-based testing, tek tek örnek girdi-çıktı çiftleri yerine, tüm geçerli girdiler için doğru kalması gereken özellikleri (invariant) tanımlar; framework yüzlerce rastgele girdi üretip özelliği sınar. Hata bulunduğunda 'shrinking' ile girdi, hatayı üreten en küçük örneğe indirgenir. Tipik özellikler: tersinirlik (encode/decode), idempotentlik (iki kez sıralamak sonucu değiştirmez), referans implementasyonla eşitlik. Örnek tabanlı testlerin yerini almaz; akla gelmeyen uç durumları (boş girdi, unicode, sınır değerler) yakalamada onları tamamlar. Bilinen araçlar: Haskell QuickCheck, Python hypothesis, JS fast-check.",
  "code": "from hypothesis import given, strategies as st\n\n@given(st.lists(st.integers()))\ndef test_sirala_ozellikleri(xs):\n    sonuc = sorted(xs)\n    # ozellik 1: uzunluk korunur\n    assert len(sonuc) == len(xs)\n    # ozellik 2: sirali olmali\n    assert all(a <= b for a, b in zip(sonuc, sonuc[1:]))\n    # ozellik 3: idempotent\n    assert sorted(sonuc) == sonuc",
  "weight": 1
 },
 {
  "id": "test-snapshot-testing",
  "cat": "Test",
  "q": "snapshot testing anlık görüntü test jest toMatchSnapshot UI regresyon güncelleme tuzak serialize",
  "title": "Snapshot testing: kullanımı ve tuzakları",
  "a": "Snapshot testing, bir çıktının (render edilmiş bileşen, serileştirilmiş nesne, API yanıtı) referans kopyasını dosyaya kaydeder; sonraki çalıştırmalarda çıktı bu kopyayla karşılaştırılır ve fark varsa test kalır. İstenmeyen regresyonları ucuza yakalar ama davranışı değil çıktının aynılığını doğrular. Büyük tuzak: geliştiriciler farkları incelemeden `--updateSnapshot` (jest -u) ile refleks halinde güncellerse test hiçbir şey korumaz olur. Snapshot'ları küçük ve odaklı tutun; dinamik değerleri (tarih, id) property matcher ile sabitleyin ve snapshot dosyalarını code review'da gerçekten okuyun.",
  "code": "// Jest snapshot\ntest('kart bileseni', () => {\n  const html = render(<Kart baslik=\"Merhaba\" />);\n  expect(html).toMatchSnapshot(); // ilk calismada kaydeder\n});\n\n// dinamik alanlari sabitle\nexpect(kullanici).toMatchSnapshot({\n  id: expect.any(String),\n  olusturma: expect.any(Date),\n});",
  "weight": 1
 },
 {
  "id": "test-tdd-dongusu",
  "cat": "Test",
  "q": "TDD test driven development red green refactor döngü önce test yazma kırmızı yeşil refaktör",
  "title": "TDD döngüsü: red-green-refactor",
  "a": "TDD (Test-Driven Development) üç adımlı kısa bir döngüdür: Red — henüz olmayan davranış için başarısız bir test yaz ve gerçekten kaldığını gör; Green — testi geçirecek en basit kodu yaz (mükemmellik değil, geçmesi hedef); Refactor — testler yeşilken kodu ve testi temizle, tekrarı gider. Testin önce kalması kritiktir: hiç kalmayan bir test yanlış şeyi test ediyor olabilir. TDD bir test tekniği olduğu kadar tasarım tekniğidir; kodu kullanıcı gözüyle önce arayüzünden düşündürtür. Tuzak: refactor adımını atlayıp 'test-first ama düzensiz' kod biriktirmek.",
  "code": "# 1. RED: once basarisiz test\ndef test_kdv_ekle():\n    assert kdv_ekle(100) == 120  # NameError: kdv_ekle yok\n\n# 2. GREEN: gecirecek en basit kod\ndef kdv_ekle(tutar):\n    return tutar * 1.20\n\n# 3. REFACTOR: testler yesilken iyilestir\nKDV_ORANI = 0.20\ndef kdv_ekle(tutar):\n    return tutar * (1 + KDV_ORANI)",
  "weight": 1
 },
 {
  "id": "test-fixture-factory",
  "cat": "Test",
  "q": "test fixture factory kurulum setup teardown pytest factory_boy test verisi hazırlama builder",
  "title": "Test fixture ve factory kalıpları",
  "a": "Fixture, testin ihtiyaç duyduğu ortamı/veriyi kuran ve test sonrası temizleyen yapıdır (pytest fixture, JUnit @BeforeEach). Factory ise test nesnelerini mantıklı varsayılanlarla üretip sadece teste özgü alanların override edilmesine izin veren kalıptır (factory_boy, FactoryBot); testin gövdesinde yalnızca konuyla ilgili veri görünür, gürültü azalır. Tuzak: tüm testlerin paylaştığı dev, 'her şeyi bilen' fixture'lar — bir alan değişince onlarca alakasız test kırılır ve testin neye bağlı olduğu okunamaz. Her test kendi minimal verisini kurmalı.",
  "code": "import pytest\n\n@pytest.fixture\ndef db():\n    baglanti = baglanti_ac()   # kurulum\n    yield baglanti\n    baglanti.kapat()           # temizlik (test bitince)\n\n# factory: varsayilanlar + noktasal override\ndef kullanici_yap(**kwargs):\n    varsayilan = {\"ad\": \"Ali\", \"yas\": 30, \"aktif\": True}\n    return Kullanici(**{**varsayilan, **kwargs})\n\ndef test_pasif_kullanici(db):\n    k = kullanici_yap(aktif=False)  # sadece ilgili alan gorunur",
  "weight": 1
 },
 {
  "id": "test-contract-testing",
  "cat": "Test",
  "q": "contract testing sözleşme testi pact consumer driven mikroservis API uyumluluk provider tüketici",
  "title": "Contract testing (sözleşme testleri)",
  "a": "Contract testing, servisler arası API uyumluluğunu, iki servisi birlikte ayağa kaldırmadan doğrular. Consumer-driven yaklaşımda (örn. Pact) tüketici, sağlayıcıdan beklediği istek/yanıt biçimini bir sözleşme dosyası olarak üretir; sağlayıcı kendi CI'ında bu sözleşmeyi gerçek implementasyonuna karşı doğrular. Böylece sağlayıcı bir alanı kaldırırsa, tüketicinin e2e ortamı beklemeden sağlayıcının testi kırılır. E2e integration testlerinden çok daha hızlı ve kararlıdır ama yalnızca yapısal uyumu doğrular; iş mantığını test etmez.",
  "code": "Tuketici (frontend)                Saglayici (users-api)\n      |                                   |\n 1. Beklentiyi tanimla:                   |\n    GET /users/1 ->                       |\n    { \"id\": 1, \"ad\": string }             |\n      |                                   |\n 2. pact.json uret ---> broker ---> 3. Sozlesmeyi gercek\n                                       API'ye karsi dogrula\n 4. Uyumsuzluk varsa saglayicinin CI'i kirilir",
  "weight": 1
 },
 {
  "id": "test-smoke-vs-regression",
  "cat": "Test",
  "q": "smoke test regression test duman testi regresyon farkı sanity deploy sonrası kritik akış",
  "title": "Smoke test vs regression test",
  "a": "Smoke test, sistemin en kritik akışlarının kabaca çalıştığını hızlıca doğrulayan küçük bir test kümesidir ('uygulama açılıyor mu, login oluyor mu?'); genelde deploy sonrası dakikalar içinde koşar ve kalırsa daha derin test yapmak anlamsızdır. Regression testi ise daha önce çalışan davranışların yeni değişikliklerle bozulmadığını doğrulayan geniş kapsamlı süittir; birikmiş tüm testleri içerir ve çok daha uzun sürer. İkisi rakip değil tamamlayıcıdır: smoke hızlı 'hayatta mı?' sinyali, regression kapsamlı 'hiçbir şey bozulmadı mı?' güvencesi verir. Bir bug düzeltildiğinde onu yakalayan test regression süitine eklenmelidir.",
  "code": null,
  "weight": 1
 },
 {
  "id": "test-e2e-araclari",
  "cat": "Test",
  "q": "e2e test araçları playwright cypress selenium uçtan uca browser otomasyon karşılaştırma yaklaşım",
  "title": "E2e test araçları ve yaklaşımı",
  "a": "E2e testler, uygulamayı gerçek bir tarayıcıda kullanıcı gibi sürer. Selenium, WebDriver protokolüyle çalışan en eski ve en geniş dil desteğine sahip araçtır. Cypress, testi tarayıcının içinde çalıştırır; iyi geliştirici deneyimi sunar ama çoklu sekme ve bazı senaryolarda kısıtlıdır. Playwright (Microsoft), Chromium/Firefox/WebKit'i tek API ile sürer; otomatik bekleme (auto-wait) ve paralel çalıştırma ile flakiness'i azaltır. Hangi araç olursa olsun ilkeler aynıdır: CSS class gibi kırılgan seçiciler yerine role/test-id bazlı seçiciler, sabit sleep yerine otomatik bekleme ve e2e sayısını az tutup kritik akışlara odaklanmak.",
  "code": "// Playwright ornegi\nimport { test, expect } from '@playwright/test';\n\ntest('kullanici giris yapabilir', async ({ page }) => {\n  await page.goto('https://ornek.dev/login');\n  // role/label bazli secici: kirilgan CSS class yerine\n  await page.getByLabel('E-posta').fill('a@b.com');\n  await page.getByLabel('Parola').fill('gizli123');\n  await page.getByRole('button', { name: 'Giris' }).click();\n  await expect(page.getByText('Hos geldin')).toBeVisible(); // auto-wait\n});",
  "weight": 1
 },
 {
  "id": "test-isolation",
  "cat": "Test",
  "q": "test isolation izolasyon bağımsız test paylaşılan durum sıra bağımlılığı temizlik transaction rollback",
  "title": "Test isolation: bağımsız testler",
  "a": "Test isolation, her testin diğerlerinden bağımsız çalışması, herhangi bir sırada ve tek başına koşulduğunda aynı sonucu vermesi demektir. İzolasyon bozulunca sıra bağımlılığı doğar: testler tam süitte geçer ama tek başına kalır (ya da tersi), paralelleştirme imkansızlaşır. Başlıca ihlal kaynakları: paylaşılan veritabanı kayıtları, global/static değişkenler, ortam değişkenleri, temizlenmeyen mock'lar ve dosya sistemi kalıntıları. Çözümler: her testin kendi verisini kurması, DB testlerinde transaction açıp sonda rollback yapmak, global durumu setup/teardown'da sıfırlamak. Testleri rastgele sırada koşturmak (pytest-randomly, Jest --randomize) izolasyon ihlallerini erken yakalar.",
  "code": "# DB izolasyonu: her test kendi transaction'inda, sonda rollback\n@pytest.fixture\ndef session(engine):\n    baglanti = engine.connect()\n    tx = baglanti.begin()\n    oturum = Session(bind=baglanti)\n    yield oturum\n    oturum.close()\n    tx.rollback()   # test ne yazarsa yazsin geri alinir\n    baglanti.close()",
  "weight": 1
 },
 {
  "id": "test-ci-paralel",
  "cat": "Test",
  "q": "CI test paralelleştirme parallel sharding shard split worker süre kısaltma pipeline dağıtma",
  "title": "CI'da test paralelleştirme",
  "a": "Test süitini hızlandırmanın iki düzeyi vardır: aynı makinede süreç bazlı paralellik (pytest-xdist, Jest worker'ları) ve CI'da sharding — süiti birden çok makineye bölmek (Playwright --shard, GitHub Actions matrix). Shard'lara dosya sayısına göre değil geçmiş çalıştırma sürelerine göre bölmek (timing-based splitting) önemlidir; yoksa en yavaş shard toplam süreyi belirler. Ön koşul test izolasyonudur: paylaşılan DB'ye yazan testler paralelde birbirini bozar, bu yüzden worker başına ayrı şema/veritabanı kullanılır. Paralellik flaky testleri de ortaya çıkarır — bu bir hata değil, gizli bağımlılıkların erken teşhisidir.",
  "code": "# GitHub Actions: suiti 4 makineye bol\njobs:\n  test:\n    strategy:\n      matrix:\n        shard: [1, 2, 3, 4]\n    steps:\n      - run: npx playwright test --shard=${{ matrix.shard }}/4\n\n# ayni makinede paralel: pytest -n auto  (pytest-xdist)",
  "weight": 1
 },
 {
  "id": "test-mutation-testing",
  "cat": "Test",
  "q": "mutation testing mutasyon testi mutant kill stryker mutmut pitest test kalitesi coverage ötesi",
  "title": "Mutation testing: testlerin testi",
  "a": "Mutation testing, kaynak koda küçük kasıtlı hatalar (mutant) enjekte eder — örn. `>` yerine `>=`, `+` yerine `-` — ve test süitini çalıştırır. Testlerden en az biri mutantı yakalayıp kalırsa mutant 'öldürülmüş' sayılır; hepsi geçerse mutant 'hayatta kalır' ve o kod yolunun aslında doğrulanmadığı ortaya çıkar. Coverage'ın cevaplayamadığı soruyu cevaplar: kod sadece çalıştırılıyor mu, yoksa gerçekten assert ediliyor mu? Dezavantajı maliyettir — her mutant için süit (ya da ilgili testler) yeniden koşar; bu yüzden genelde sadece değişen dosyalarda veya kritik modüllerde çalıştırılır. Araçlar: Stryker (JS/C#/Scala), mutmut (Python), PIT/pitest (Java).",
  "code": "# Orijinal kod\ndef ergin_mi(yas):\n    return yas >= 18\n\n# Mutant: >= yerine >  (mutmut/Stryker uretir)\ndef ergin_mi(yas):\n    return yas > 18\n\n# test_ergin(20) ve test_cocuk(10) bu mutanti YAKALAYAMAZ.\n# Sinir degeri testi gerekir: assert ergin_mi(18) == True  -> mutant olur (yakalanir)",
  "weight": 1
 },
 {
  "id": "net2-ip-adresleme-cidr",
  "cat": "Ağ",
  "q": "ip adresleme subnet alt ağ CIDR maske netmask prefix subnetting network broadcast adres hesaplama",
  "title": "IP adresleme ve CIDR ile subnet",
  "a": "Bir IPv4 adresi 32 bittir ve CIDR gösterimi (örn. 192.168.1.0/24) adresin kaç bitinin ağ kısmı olduğunu belirtir; kalan bitler host kısmıdır. /24 bir ağda 256 adres bulunur ama ilk adres (network) ve son adres (broadcast) hostlara atanamaz, yani 254 kullanılabilir host kalır. Yaygın tuzak: /31 ve /32 istisnadır; /31 nokta-nokta linklerde 2 host için kullanılabilir (RFC 3021), /32 tek bir hostu ifade eder.",
  "code": "# 10.0.5.130/26 için hesap:\n# /26 -> maske 255.255.255.192, blok boyutu 64\n# 10.0.5.128 network, 10.0.5.191 broadcast\n# kullanılabilir hostlar: 10.0.5.129 - 10.0.5.190\n\n# Linux'ta ipcalc ile doğrulama:\n$ ipcalc 10.0.5.130/26\nNetwork:   10.0.5.128/26\nBroadcast: 10.0.5.191\nHosts/Net: 62",
  "weight": 1
 },
 {
  "id": "net2-nat-nasil-calisir",
  "cat": "Ağ",
  "q": "nat network address translation port pat masquerade özel adres private ip çeviri router adres dönüşümü",
  "title": "NAT nasıl çalışır",
  "a": "NAT (Network Address Translation), özel (private) IP adreslerini tek bir genel (public) IP arkasında paylaştırır: router giden paketin kaynak IP ve portunu kendi public IP'si ve yeni bir portla değiştirir, bu eşlemeyi bir çeviri tablosunda tutar ve dönen paketleri tabloya bakarak doğru iç hosta yönlendirir. Ev ağlarında kullanılan bu tür aslında PAT/NAPT'tir (port bazlı çoklama). Yaygın tuzak: NAT bir güvenlik mekanizması değildir; dışarıdan bağlantıyı 'engellemesi' yan etkidir ve P2P/VoIP gibi protokoller için NAT traversal (STUN, hole punching) gerekir.",
  "code": "İç host                NAT router              İnternet\n10.0.0.5:43210  --->  203.0.113.7:50001  --->  93.184.216.34:443\n\nNAT çeviri tablosu:\n  iç: 10.0.0.5:43210  <->  dış: 203.0.113.7:50001\n\nDönen paket 203.0.113.7:50001'e gelir,\ntablodan bakılıp 10.0.0.5:43210'a iletilir.",
  "weight": 1
 },
 {
  "id": "net2-http1-http2-http3-farklari",
  "cat": "Ağ",
  "q": "http/1.1 http/2 http/3 quic multiplexing head of line blocking farklar protokol karşılaştırma sürüm",
  "title": "HTTP/1.1 vs HTTP/2 vs HTTP/3",
  "a": "HTTP/1.1 metin tabanlıdır ve bir TCP bağlantısında aynı anda tek istek işler; tarayıcılar bunu aşmak için host başına birden çok bağlantı açar. HTTP/2 ikili (binary) framing ve multiplexing getirir: tek TCP bağlantısında çok sayıda eşzamanlı stream taşır ve başlıkları HPACK ile sıkıştırır; ancak TCP seviyesinde head-of-line blocking sürer, tek bir kayıp paket tüm stream'leri bekletir. HTTP/3 taşıma katmanını TCP'den UDP üzerinde çalışan QUIC'e taşır: stream'ler bağımsız olduğu için paket kaybı yalnızca ilgili stream'i etkiler, TLS 1.3 protokole gömülüdür ve el sıkışma turları azalır (0-RTT mümkündür).",
  "code": "HTTP/1.1: bağlantı başına sıralı istek (pipelining pratikte kullanılmaz)\nHTTP/2:   tek TCP + multiplexed stream'ler + HPACK\nHTTP/3:   UDP üzerinde QUIC + bağımsız stream'ler + TLS 1.3 gömülü\n\n# Sunucunun HTTP/2 ve HTTP/3 desteğini test etme:\n$ curl --http2 -sI https://example.com | head -1\n$ curl --http3 -sI https://example.com | head -1",
  "weight": 1
 },
 {
  "id": "net2-grpc-protobuf",
  "cat": "Ağ",
  "q": "grpc protobuf protocol buffers rpc streaming http/2 serialization idl servis tanımı mikroservis",
  "title": "gRPC ve Protocol Buffers",
  "a": "gRPC, HTTP/2 üzerinde çalışan bir RPC framework'üdür; servisler ve mesajlar Protocol Buffers (protobuf) IDL dosyalarında tanımlanır ve protoc derleyicisi ile hedef dilde client/server kodu üretilir. Protobuf, JSON'a göre çok daha kompakt bir ikili serileştirme sağlar ve alan numaraları sayesinde geriye dönük uyumluluk kolaydır. gRPC tekli çağrının yanında server-streaming, client-streaming ve çift yönlü streaming destekler; yaygın tuzak, tarayıcıların gRPC'yi doğrudan konuşamamasıdır — bunun için gRPC-Web veya bir proxy gerekir.",
  "code": "syntax = \"proto3\";\n\n// Kullanıcı servisi tanımı\nservice UserService {\n  rpc GetUser (GetUserRequest) returns (User);\n  rpc WatchUsers (WatchRequest) returns (stream User); // server streaming\n}\n\nmessage GetUserRequest { int64 id = 1; }\nmessage User { int64 id = 1; string name = 2; string email = 3; }",
  "weight": 1
 },
 {
  "id": "net2-l4-vs-l7-proxy",
  "cat": "Ağ",
  "q": "l4 l7 proxy layer 4 layer 7 load balancer tcp http yük dengeleme katman fark osi",
  "title": "L4 vs L7 proxy",
  "a": "L4 (taşıma katmanı) proxy, trafiği IP ve port bilgisine bakarak yönlendirir; TCP/UDP baytlarını içeriğini anlamadan iletir, bu yüzden çok hızlıdır ve her protokolle çalışır. L7 (uygulama katmanı) proxy ise protokolü (örn. HTTP) çözümler: URL path'e göre yönlendirme, header manipülasyonu, cookie tabanlı sticky session, rate limiting ve TLS termination yapabilir. Yaygın tuzak: L7 proxy istemci bağlantısını sonlandırıp backend'e yeni bağlantı açtığı için kaynak IP kaybolur; bunu backend'e iletmek için X-Forwarded-For header'ı veya PROXY protocol kullanılır.",
  "code": "L4: istemci --TCP--> [proxy: IP:port'a bak, baytları ilet] --TCP--> backend\nL7: istemci --HTTP--> [proxy: isteği çözümle] --yeni HTTP isteği--> backend\n\n# HAProxy L7 örneği: path'e göre yönlendirme\nfrontend web\n  bind *:80\n  use_backend api if { path_beg /api }\n  default_backend static",
  "weight": 1
 },
 {
  "id": "net2-reverse-vs-forward-proxy",
  "cat": "Ağ",
  "q": "reverse proxy forward proxy ters vekil sunucu nginx fark istemci sunucu taraf gizleme cache",
  "title": "Reverse proxy vs forward proxy",
  "a": "Forward proxy istemcilerin tarafında durur: istemciler internete onun üzerinden çıkar, sunucular gerçek istemciyi değil proxy'yi görür (kurumsal filtreleme, anonimlik, cache). Reverse proxy ise sunucuların tarafında durur: istemciler proxy'ye bağlanır, proxy isteği arkadaki backend'lere dağıtır; yük dengeleme, TLS termination, caching ve backend'leri gizleme sağlar. Ezber kolaylığı: forward proxy 'istemci kimliğini' sunucudan, reverse proxy 'sunucu topolojisini' istemciden gizler.",
  "code": "Forward:  istemci -> [forward proxy] -> internet -> sunucu\n          (sunucu, proxy'nin IP'sini görür)\n\nReverse:  istemci -> internet -> [reverse proxy] -> backend1/backend2\n          (istemci, backend'lerin varlığından habersizdir)\n\n# Nginx reverse proxy:\nlocation / {\n  proxy_pass http://backend_pool;\n  proxy_set_header X-Forwarded-For $remote_addr;\n}",
  "weight": 1
 },
 {
  "id": "net2-tls-termination",
  "cat": "Ağ",
  "q": "tls termination ssl sonlandırma offloading sertifika load balancer https passthrough end-to-end şifreleme",
  "title": "TLS termination",
  "a": "TLS termination, şifreli bağlantının bir load balancer veya reverse proxy'de sonlandırılmasıdır: sertifika ve özel anahtar proxy'de durur, proxy trafiği çözer ve backend'e genellikle düz HTTP olarak iletir. Bu, sertifika yönetimini merkezileştirir ve backend'leri kripto yükünden kurtarır; ayrıca proxy'nin L7 özelliklerini (routing, WAF) kullanabilmesi için trafiği görmesi gerekir. Yaygın tuzak: proxy-backend arası düz trafik iç ağda dinlenebilir; sıfır güven (zero trust) ortamlarda bu bacak yeniden şifrelenir (re-encryption) veya TLS passthrough ile uçtan uca şifreleme korunur — ama passthrough'da proxy L7 işlem yapamaz.",
  "code": "TLS termination:\n  istemci ==TLS==> [proxy: çöz] --HTTP--> backend\n\nRe-encryption:\n  istemci ==TLS==> [proxy: çöz+incele] ==TLS==> backend\n\nPassthrough:\n  istemci ==TLS===================> backend (proxy sadece L4 iletir)",
  "weight": 1
 },
 {
  "id": "net2-keepalive-connection-pooling",
  "cat": "Ağ",
  "q": "keep-alive connection pooling bağlantı havuzu tcp reuse persistent connection handshake maliyeti http performans",
  "title": "Keep-alive ve connection pooling",
  "a": "Her yeni TCP bağlantısı 3 yollu el sıkışma, HTTPS'te ek olarak TLS el sıkışması gerektirir; keep-alive aynı bağlantıyı birden çok istek için açık tutarak bu maliyeti amorti eder (HTTP/1.1'de varsayılandır). Connection pooling ise istemci tarafında açık bağlantıları bir havuzda tutup yeniden kullanma desenidir; HTTP client'larında ve veritabanı sürücülerinde standarttır. Yaygın tuzak: her istekte yeni client/bağlantı nesnesi oluşturmak havuzu boşa çıkarır ve TIME_WAIT ile port tükenmesine yol açabilir — client nesnesini paylaşıp yeniden kullanın.",
  "code": "import requests\n\n# YANLIŞ: her istekte yeni bağlantı (handshake maliyeti tekrarlanır)\n# for url in urls: requests.get(url)\n\n# DOĞRU: Session bağlantı havuzu tutar, keep-alive kullanır\nsession = requests.Session()\nfor url in urls:\n    r = session.get(url)  # aynı hosta giden istekler bağlantıyı paylaşır",
  "weight": 1
 },
 {
  "id": "net2-mtu-fragmentasyon",
  "cat": "Ağ",
  "q": "mtu maximum transmission unit fragmentation parçalanma 1500 jumbo frame path mtu discovery df bit paket boyutu",
  "title": "MTU ve fragmentasyon",
  "a": "MTU (Maximum Transmission Unit), bir link üzerinden tek seferde taşınabilecek en büyük IP paketi boyutudur; Ethernet için tipik değer 1500 bayttır. Paket, yoldaki bir linkin MTU'sundan büyükse IPv4'te router'lar paketi parçalayabilir (fragmentation); ancak DF (Don't Fragment) biti set ise paket düşürülür ve ICMP 'Fragmentation Needed' mesajı döner — Path MTU Discovery buna dayanır. Yaygın tuzak: güvenlik duvarlarının ICMP'yi tümden engellemesi PMTUD'yi bozar ve 'küçük paketler geçiyor, büyükler takılıyor' şeklinde sinsi hatalara (PMTUD black hole) yol açar; IPv6'da router'lar hiç fragmentasyon yapmaz, bu iş tamamen kaynağa aittir.",
  "code": "# Path MTU'yu elle test etme (Linux):\n# -M do: DF bitini set et, -s: payload boyutu\n$ ping -M do -s 1472 example.com   # 1472+28 başlık = 1500, geçer\n$ ping -M do -s 1600 example.com   # MTU 1500 ise:\nping: local error: message too long, mtu=1500",
  "weight": 1
 },
 {
  "id": "net2-traceroute-nasil-calisir",
  "cat": "Ağ",
  "q": "traceroute tracert ttl hop icmp time exceeded yol izleme rota network debug mtr",
  "title": "Traceroute nasıl çalışır",
  "a": "Traceroute, IP başlığındaki TTL (Time To Live) alanını akıllıca kullanır: TTL=1 ile paket gönderir, ilk router TTL'i sıfıra düşürüp paketi atar ve ICMP 'Time Exceeded' mesajı döner — böylece ilk hop'un adresi öğrenilir. TTL 2, 3, ... şeklinde artırılarak yoldaki her router tek tek ortaya çıkarılır; hedefe ulaşınca farklı bir yanıt (Linux'ta ICMP Port Unreachable, çünkü UDP kullanır; Windows tracert ICMP Echo kullanır) alınır ve iz tamamlanır. Yaygın tuzak: '* * *' satırları hattın koptuğu anlamına gelmez; o router ICMP yanıtı üretmiyor veya hız sınırlıyor olabilir.",
  "code": "TTL=1 -> [R1] TTL biter, R1 ICMP Time Exceeded döner -> R1 bulundu\nTTL=2 -> R1 geçer -> [R2] TTL biter -> R2 bulundu\nTTL=3 -> ... hedefe ulaşınca Port Unreachable -> bitti\n\n$ traceroute example.com\n 1  192.168.1.1   1.2 ms\n 2  10.20.0.1     8.5 ms\n 3  * * *          (yanıt yok; illa arıza değil)",
  "weight": 1
 },
 {
  "id": "net2-arp",
  "cat": "Ağ",
  "q": "arp address resolution protocol mac adres ip eşleme yerel ağ broadcast arp cache spoofing neighbor discovery",
  "title": "ARP: IP'den MAC adresine çözümleme",
  "a": "Aynı yerel ağdaki iki cihaz IP ile haberleşirken Ethernet çerçevesi hedefin MAC adresini gerektirir; ARP bu eşlemeyi yapar. Host, 'Bu IP kimde?' sorusunu broadcast olarak yayınlar, ilgili cihaz kendi MAC'i ile unicast yanıt verir ve sonuç ARP cache'inde tutulur. Yaygın tuzak: ARP'nin kimlik doğrulaması yoktur; sahte yanıtlarla cache zehirlenebilir (ARP spoofing) ve trafik araya alınabilir. IPv6'da ARP yerine ICMPv6 tabanlı Neighbor Discovery (NDP) kullanılır.",
  "code": "Host A (10.0.0.5): \"Who has 10.0.0.1? Tell 10.0.0.5\"  (broadcast)\nRouter (10.0.0.1): \"10.0.0.1 is at aa:bb:cc:dd:ee:ff\"  (unicast)\n\n# ARP cache'ini görüntüleme (Linux):\n$ ip neigh show\n10.0.0.1 dev eth0 lladdr aa:bb:cc:dd:ee:ff REACHABLE",
  "weight": 1
 },
 {
  "id": "net2-dhcp",
  "cat": "Ağ",
  "q": "dhcp dynamic host configuration protocol ip atama otomatik lease dora discover offer request ack kiralama",
  "title": "DHCP ile otomatik IP yapılandırması",
  "a": "DHCP, ağa katılan bir cihaza IP adresi, subnet maskesi, varsayılan ağ geçidi ve DNS sunucularını otomatik atar. Süreç DORA olarak bilinen dört adımdan oluşur: istemci Discover (broadcast) gönderir, sunucu Offer ile adres önerir, istemci Request ile kabul eder, sunucu ACK ile onaylar. Adres kalıcı değil kiralıktır (lease); süre yarılanınca istemci yenileme ister. Yaygın tuzak: DHCP UDP 67 (sunucu) ve 68 (istemci) portlarını kullanır ve broadcast'e dayandığı için farklı subnet'lerdeki istemciler için router'da DHCP relay gerekir.",
  "code": "İstemci                       DHCP Sunucusu\n  | -- DISCOVER (broadcast) -->  |  \"IP arıyorum\"\n  | <-- OFFER ------------------ |  \"10.0.0.42'yi öneririm\"\n  | -- REQUEST ----------------> |  \"10.0.0.42'yi istiyorum\"\n  | <-- ACK -------------------- |  \"Senindir, lease: 24 saat\"\n\n# Linux'ta lease yenileme: $ dhclient -v eth0",
  "weight": 1
 },
 {
  "id": "net2-ipv4-tukenmesi-ipv6",
  "cat": "Ağ",
  "q": "ipv4 tükenmesi exhaustion ipv6 128 bit adres geçiş dual stack cgnat slaac adres alanı",
  "title": "IPv4 tükenmesi ve IPv6",
  "a": "IPv4'ün 32 bitlik alanı yaklaşık 4,3 milyar adres sunar ve merkezi havuzlar tükenmiştir (IANA 2011'de son bloklarını dağıttı); bugün internet NAT ve operatör tarafı CGNAT ile idare edilmektedir. IPv6 128 bitlik adres kullanır (örn. 2001:db8::1), pratik olarak sınırsız alan sağlar, NAT ihtiyacını ortadan kaldırır ve SLAAC ile cihazların kendi adreslerini üretmesine izin verir. Yaygın tuzak: IPv6 'daha güvenli' değildir — IPsec desteği zorunlu değil önerilendir; ve iki protokol birlikte konuşamaz, geçiş dual stack (aynı anda ikisi) veya çeviri mekanizmaları (NAT64/DNS64) ile yapılır.",
  "code": "IPv4: 32 bit  -> 192.0.2.1            (~4,3 milyar adres)\nIPv6: 128 bit -> 2001:db8:0:0:0:0:0:1 (~3,4 x 10^38 adres)\n\n# IPv6 kısaltma kuralları:\n2001:0db8:0000:0000:0000:0000:0000:0001\n= 2001:db8::1   (baştaki sıfırlar atılır, tek bir '::' sıfır bloklarını kısaltır)\n\n$ ping -6 ipv6.google.com   # IPv6 bağlantısını test et",
  "weight": 1
 },
 {
  "id": "net2-port-well-known-portlar",
  "cat": "Ağ",
  "q": "port numarası well-known ports 80 443 22 tcp udp socket ephemeral registered iana servis",
  "title": "Port kavramı ve well-known portlar",
  "a": "Port, bir hosttaki hangi uygulamanın/servisin trafiği alacağını belirleyen 16 bitlik numaradır (0-65535); bağlantı, kaynak IP:port ve hedef IP:port dörtlüsüyle tanımlanır. IANA sınıflandırması: 0-1023 well-known (HTTP 80, HTTPS 443, SSH 22, DNS 53), 1024-49151 registered, 49152-65535 dinamik/ephemeral — istemciler giden bağlantılarda genellikle bu aralıktan rastgele port kullanır. Yaygın tuzak: TCP ve UDP port uzayları ayrıdır (TCP 53 ile UDP 53 farklı soketlerdir) ve Unix'te 1024 altındaki portları dinlemek root yetkisi veya CAP_NET_BIND_SERVICE ister.",
  "code": "Sık kullanılan well-known portlar:\n  22  SSH        53  DNS (TCP+UDP)   80  HTTP\n 443  HTTPS     587  SMTP submission\n5432  PostgreSQL (registered)  6379 Redis  3306 MySQL\n\n# Hangi süreç hangi portu dinliyor? (Linux)\n$ ss -tlnp | grep :443",
  "weight": 1
 },
 {
  "id": "math-ikilik-sistem-donusum",
  "cat": "Matematik",
  "q": "ikilik binary taban sayı sistemi dönüşüm base 2 bit çevirme conversion decimal onluk",
  "title": "İkilik (binary) sistem ve onluk dönüşüm",
  "a": "Bilgisayarlar veriyi 2 tabanında saklar: her basamak (bit) 2'nin bir kuvvetini temsil eder, örneğin 1011₂ = 8+0+2+1 = 11. Onluktan ikiliğe çevirmenin klasik yolu sayıyı sürekli 2'ye bölüp kalanları tersten okumaktır. n bitle 0'dan 2ⁿ−1'e kadar işaretsiz sayı gösterilebilir; yaygın tuzak, 8 bitin en büyük değerinin 256 değil 255 olduğunu unutmaktır.",
  "code": "# Python'da taban dönüşümleri\nn = 11\nprint(bin(n))        # '0b1011'\nprint(int('1011', 2))  # 11\n\n# Elle dönüşüm: 2'ye böl, kalanları tersten oku\nbits = []\nwhile n > 0:\n    bits.append(str(n % 2))\n    n //= 2\nprint(''.join(reversed(bits)))  # '1011'",
  "weight": 1
 },
 {
  "id": "math-onaltilik-sistem",
  "cat": "Matematik",
  "q": "onaltılık hexadecimal hex taban 16 renk kodu bellek adresi byte nibble dönüşüm 0x",
  "title": "Onaltılık (hexadecimal) sistem: byte'ların kısayolu",
  "a": "Onaltılık sistem 0-9 ve A-F rakamlarını kullanır; tek bir hex basamağı tam olarak 4 bite (nibble) karşılık geldiği için bir byte her zaman 2 hex basamağıyla yazılır (örn. 0xFF = 255 = 11111111₂). Bu yüzden bellek adresleri, renk kodları (#FF5733) ve hash çıktıları hex ile gösterilir. Hex-binary dönüşümü basamak basamak yapılabilir; onluk üzerinden geçmeye gerek yoktur.",
  "code": "# Hex, binary ve decimal arasında geçiş\nx = 0xFF\nprint(x)          # 255\nprint(hex(255))   # '0xff'\nprint(bin(0xA5))  # '0b10100101' (A=1010, 5=0101)\n\n# Renk kodunu bileşenlerine ayırma\nrenk = 0xFF5733\nr = (renk >> 16) & 0xFF  # 255\ng = (renk >> 8) & 0xFF   # 87\nb = renk & 0xFF          # 51",
  "weight": 1
 },
 {
  "id": "math-bit-maskeleme-and-or-xor",
  "cat": "Matematik",
  "q": "bit işlemleri bitwise AND OR XOR maske mask flag bayrak set clear toggle kontrol",
  "title": "Bit maskeleme: AND, OR, XOR pratikte",
  "a": "AND (&) bit temizlemek ve okumak, OR (|) bit set etmek, XOR (^) bit tersine çevirmek (toggle) için kullanılır. Bu sayede tek bir tamsayıda birden çok boolean bayrak (flag) saklanabilir; dosya izinleri ve API opsiyon parametreleri bu desenle çalışır. XOR'un iki faydalı özelliği vardır: x ^ x = 0 ve x ^ 0 = x; bu, basit checksum ve 'tek olan sayıyı bul' türü problemlerde işe yarar.",
  "code": "OKUMA, YAZMA, CALISTIRMA = 1, 2, 4  # 001, 010, 100\n\nizin = 0\nizin |= OKUMA | YAZMA      # bit set etme -> 011\nizin &= ~YAZMA             # bit temizleme -> 001\nizin ^= CALISTIRMA         # bit toggle -> 101\n\n# Bit kontrolü: sonuç 0 değilse bayrak açık\nif izin & OKUMA:\n    print('okuma izni var')",
  "weight": 1
 },
 {
  "id": "math-bit-shift-islemleri",
  "cat": "Matematik",
  "q": "bit kaydırma shift left right << >> ikiyle çarpma bölme power of two arithmetic logical",
  "title": "Bit kaydırma (shift): 2'nin kuvvetleriyle çarpma ve bölme",
  "a": "Sola kaydırma (x << n) sayıyı 2ⁿ ile çarpar, sağa kaydırma (x >> n) 2ⁿ'e böler (tamsayı bölmesi). C benzeri dillerde işaretli sayılarda sağa kaydırma genelde aritmetik shift'tir (işaret biti korunur), işaretsizlerde ise mantıksal shift'tir; negatif sayıları sola kaydırmak C'de tanımsız davranış olabilir. Yaygın hile: x & (x-1) == 0 ifadesi (x > 0 iken) x'in 2'nin kuvveti olup olmadığını test eder.",
  "code": "x = 5\nprint(x << 3)   # 40 (5 * 8)\nprint(40 >> 2)  # 10 (40 // 4)\n\n# 2'nin kuvveti testi: 2^k'nin tek bir biti 1'dir\ndef ikinin_kuvveti_mi(x):\n    return x > 0 and (x & (x - 1)) == 0\n\nprint(ikinin_kuvveti_mi(64))  # True\nprint(ikinin_kuvveti_mi(96))  # False",
  "weight": 1
 },
 {
  "id": "math-moduler-aritmetik-hash",
  "cat": "Matematik",
  "q": "modüler aritmetik mod modulo hash tablosu bucket indeks kalan remainder negatif ring",
  "title": "Modüler aritmetik: hash tablosunun kalbi",
  "a": "Hash tablosu, anahtarın hash değerini bucket sayısına göre mod alarak (index = hash(key) % n) diziye dağıtır; mod işlemi herhangi bir sayıyı [0, n-1] aralığına sıkıştırır. Bucket sayısı 2'nin kuvvetiyse mod yerine daha hızlı olan hash & (n-1) maskesi kullanılabilir. Dikkat: C, Java ve JavaScript'te % operatörü negatif sayılar için negatif sonuç verebilir (-7 % 3 == -1), Python'da ise sonuç her zaman bölenin işaretindedir (-7 % 3 == 2); dizin hesaplarken bu fark hataya yol açar.",
  "code": "def bucket_index(key, n):\n    # Python'da % her zaman [0, n-1] döner\n    return hash(key) % n\n\nn = 8  # 2'nin kuvveti: maske ile aynı sonuç\nh = hash('kullanici:42')\nassert h % n == h & (n - 1)\n\n# Java/C tarzı negatif mod düzeltmesi:\n# index = ((h % n) + n) % n",
  "weight": 1
 },
 {
  "id": "math-dogum-gunu-paradoksu",
  "cat": "Matematik",
  "q": "doğum günü paradoksu birthday paradox hash çakışma collision olasılık probability uuid sqrt",
  "title": "Doğum günü paradoksu ve hash çakışmaları",
  "a": "23 kişilik bir grupta iki kişinin aynı gün doğmuş olma olasılığı %50'yi aşar, çünkü önemli olan kişi sayısı değil ikili karşılaştırma sayısıdır (23 kişi = 253 çift). Genel kural: N olası değer varsa, yaklaşık √N örnek sonrasında çakışma olasılığı %50 civarına ulaşır. Bu yüzden 64 bitlik bir hash 'çok büyük' görünse de ~2³² (yaklaşık 4 milyar) kayıtta çakışma beklenir; ID üretirken alan boyutunu buna göre seçmek gerekir (128 bit UUID'nin güvenli sayılmasının nedeni budur).",
  "code": "import math\n\n# En az bir çakışma olasılığı (üstel yaklaşım)\ndef cakisma_olasiligi(n, k):\n    p_yok = math.exp(-k * (k - 1) / (2 * n))  # yaklaşık\n    return 1 - p_yok\n\nprint(round(cakisma_olasiligi(365, 23), 2))    # ~0.5\nprint(round(cakisma_olasiligi(2**64, 2**32), 2))  # ~0.39",
  "weight": 1
 },
 {
  "id": "math-logaritma-log2",
  "cat": "Matematik",
  "q": "logaritma log2 binary search ikili arama karmaşıklık complexity O(log n) bit sayısı ağaç derinlik",
  "title": "Logaritma neden her yerde: log₂ sezgisi",
  "a": "log₂(n), 'n'i kaç kez ikiye bölersem 1'e inerim' sorusunun cevabıdır; ikili arama, dengeli ağaç derinliği ve bir sayıyı yazmak için gereken bit sayısı (⌊log₂ n⌋ + 1) hep bu yüzden logaritmiktir. Pratik referans: log₂(1000) ≈ 10, log₂(1 milyon) ≈ 20, log₂(1 milyar) ≈ 30 — yani 1 milyar elemanlı sıralı dizide ikili arama en fazla ~30 karşılaştırma yapar. Big-O analizinde logaritmanın tabanı önemsizdir çünkü tabanlar arası fark sabit bir çarpandır.",
  "code": "import math\n\nprint(math.log2(1_000_000_000))  # ~29.9\n# 1 milyar elemanda ikili arama <= 30 adım\n\n# Bir sayıyı yazmak için gereken bit sayısı\nn = 1000\nprint(n.bit_length())            # 10\nprint(math.floor(math.log2(n)) + 1)  # 10",
  "weight": 1
 },
 {
  "id": "math-ustel-buyume-sezgisi",
  "cat": "Matematik",
  "q": "üstel büyüme exponential growth 2^n katlanma doubling brute force karmaşıklık kombinasyon patlama",
  "title": "Üstel büyüme sezgisi: 2ⁿ ne kadar hızlı?",
  "a": "Üstel büyümede her adım toplamı katlar: 2¹⁰ ≈ bin, 2²⁰ ≈ milyon, 2³⁰ ≈ milyar. Bu, O(2ⁿ) algoritmaların (tüm alt kümeleri deneme gibi) neden n ≈ 30-40 civarında pratikte imkansızlaştığını açıklar; girdiye 1 eleman eklemek çalışma süresini ikiye katlar. Yaygın yanılgı üsteli polinomla karıştırmaktır: n² 'hızlı büyür' ama 2ⁿ bambaşka bir ligdedir — n=100 için n² = 10.000 iken 2¹⁰⁰ ≈ 1,3×10³⁰'dur; bu, evrenin yaşının nanosaniye cinsinden değerini (~4×10²⁶) bile aşar.",
  "code": "# Alt küme sayısı 2^n: her eleman ya var ya yok\nfor n in (10, 20, 30, 40, 60):\n    print(n, 2**n)\n# 10 -> 1024\n# 20 -> 1_048_576\n# 30 -> 1_073_741_824  (~1 milyar)\n# 40 -> ~1.1 trilyon\n# 60 -> ~1.15e18 (saniyede 1 milyar işlemle ~36 yıl)",
  "weight": 1
 },
 {
  "id": "math-kombinatorik-temelleri",
  "cat": "Matematik",
  "q": "kombinatorik permütasyon kombinasyon faktöriyel combination permutation n choose k sayma çarpım kuralı",
  "title": "Kombinatorik temelleri: permütasyon ve kombinasyon",
  "a": "Çarpım kuralı sayma problemlerinin temelidir: bağımsız k seçim varsa olasılıklar çarpılır (örn. 8 karakterlik küçük harf parola = 26⁸). Sıra önemliyse permütasyon P(n,k) = n!/(n-k)!, sıra önemsizse kombinasyon C(n,k) = n!/(k!(n-k)!) kullanılır. Yaygın tuzak: C(n,k) hesaplarken faktöriyelleri ayrı ayrı hesaplamak, sabit genişlikli tamsayı kullanan dillerde taşmaya, Python'da ise gereksiz maliyete yol açar; kütüphane fonksiyonu (math.comb) veya çarpımsal formül tercih edilmelidir.",
  "code": "import math\n\n# 5 sunucudan sıralı 3'lü dizilim (sıra önemli)\nprint(math.perm(5, 3))   # 60\n\n# 5 sunucudan 3'lü replika kümesi (sıra önemsiz)\nprint(math.comb(5, 3))   # 10\n\n# Çarpım kuralı: 26 harf, 8 karakter\nprint(26**8)             # 208_827_064_576",
  "weight": 1
 },
 {
  "id": "math-prng-vs-kriptografik-rastgelelik",
  "cat": "Matematik",
  "q": "rastgele sayı random PRNG seed CSPRNG kriptografik secrets token güvenlik Mersenne Twister deterministic",
  "title": "PRNG vs kriptografik rastgelelik",
  "a": "PRNG'ler (Python'da random modülü, Mersenne Twister) deterministiktir: aynı seed aynı diziyi üretir; bu, simülasyon ve testlerde tekrarlanabilirlik için idealdir ama çıktısı tahmin edilebilir. Token, parola, session ID gibi güvenlik amaçlı değerlerde mutlaka işletim sisteminin entropi kaynağını kullanan CSPRNG (Python'da secrets, JS'te crypto.getRandomValues) kullanılmalıdır. Klasik hata: random modülüyle veya Math.random() ile güvenlik token'ı üretmek — yeterli çıktı gözlemleyen saldırgan iç durumu geri kazanıp sonraki değerleri tahmin edebilir.",
  "code": "import random, secrets\n\n# PRNG: seed verilince tekrarlanabilir (simülasyon/test)\nrandom.seed(42)\nprint(random.randint(1, 100))  # her çalıştırmada aynı\n\n# Güvenlik için: secrets (CSPRNG)\ntoken = secrets.token_urlsafe(32)  # session token\nkod = secrets.randbelow(1_000_000)  # OTP için 0-999999\nprint(token, f'{kod:06d}')",
  "weight": 1
 },
 {
  "id": "math-integer-overflow",
  "cat": "Matematik",
  "q": "integer overflow taşma tamsayı wraparound int32 int64 signed unsigned undefined behavior binary search bug",
  "title": "Integer overflow: sessizce sarılan sayılar",
  "a": "Sabit genişlikli tamsayılar sınırlıdır: işaretli 32 bit int en fazla 2³¹−1 = 2.147.483.647 tutar; bunun üstüne çıkıldığında değer ya sarar (Java'da negatife döner) ya da tanımsız davranıştır (C/C++'ta işaretli taşma UB). Ünlü örnek: (low + high) / 2 ile orta nokta hesaplamak büyük dizilerde taşar; doğrusu low + (high - low) / 2 yazmaktır. Python tamsayıları keyfi boyutlu olduğundan taşmaz, ancak numpy dizileri ve başka dillerle veri alışverişinde sabit genişlik kuralları yine geçerlidir.",
  "code": "// Java: sessiz wraparound\nint max = Integer.MAX_VALUE;      // 2_147_483_647\nSystem.out.println(max + 1);      // -2147483648\n\n// Klasik binary search hatası:\nint low = 2_000_000_000, high = 2_100_000_000;\n// int mid = (low + high) / 2;    // TAŞAR! negatif çıkar\nint mid = low + (high - low) / 2; // doğru yöntem\nSystem.out.println(mid);          // 2050000000",
  "weight": 1
 },
 {
  "id": "math-ieee754-ozel-degerler",
  "cat": "Matematik",
  "q": "IEEE 754 float NaN Infinity sonsuz -0 negatif sıfır floating point isnan karşılaştırma özel değerler",
  "title": "IEEE 754 özel değerleri: NaN, Infinity, -0",
  "a": "IEEE 754 standardı üç özel değer tanımlar: Infinity (taşma veya 1.0/0.0 sonucu), NaN (tanımsız işlemler: 0/0, sqrt(-1)) ve negatif sıfır (-0.0). En kritik kural: NaN hiçbir şeye eşit değildir, kendisine bile (NaN == NaN sonucu false); bu yüzden NaN testi mutlaka isnan() ile yapılır. -0.0 == 0.0 true döner ama 1/-0.0 = -Infinity olduğundan işaretleri ayırt edilebilir; NaN içeren dizilerde sıralama ve eşitlik kontrolleri de sürprizli davranabilir.",
  "code": "import math\n\ninf = float('inf')\nnan = float('nan')\n\nprint(nan == nan)          # False! NaN kendine eşit değil\nprint(math.isnan(nan))     # True — doğru test yöntemi\nprint(inf > 1e308)         # True\nprint(-0.0 == 0.0)         # True, ama...\nprint(math.copysign(1, -0.0))  # -1.0 (işaret ayırt edilir)",
  "weight": 1
 },
 {
  "id": "math-ortalama-vs-medyan-p99",
  "cat": "Matematik",
  "q": "ortalama medyan mean median percentile yüzdelik p50 p99 latency gecikme metrik outlier aykırı",
  "title": "Ortalama vs medyan: p99 neden önemli?",
  "a": "Ortalama, aykırı değerlere karşı çok hassastır: 99 istek 10 ms, 1 istek 10 saniye sürerse ortalama ~110 ms çıkar ve tabloyu çarpıtır; medyan (p50) ise 'tipik' isteği gösterir. Gecikme (latency) izlemede yüzdelikler kullanılır: p99, isteklerin %99'unun bu değerin altında kaldığı anlamına gelir ve en kötü kullanıcı deneyimini yakalar. Yaygın tuzak: farklı sunucuların p99'larının ortalamasını almak matematiksel olarak anlamsızdır — yüzdelikler toplanamaz, ham verilerden ya da histogram birleştirmeden hesaplanmalıdır.",
  "code": "import statistics\n\n# 99 hızlı istek + 1 çok yavaş istek (ms)\nsureler = [10] * 99 + [10_000]\n\nprint(statistics.mean(sureler))    # 109.9 — yanıltıcı\nprint(statistics.median(sureler))  # 10 — tipik deneyim\n\n# p99: sıralı listede %99'luk konum\np99 = sorted(sureler)[int(len(sureler) * 0.99) - 1]\nprint(p99)  # 10 (yavaş istek p99'un üstünde, max'te görünür)",
  "weight": 1
 },
 {
  "id": "math-zipf-dagilimi",
  "cat": "Matematik",
  "q": "Zipf dağılımı power law güç yasası long tail uzun kuyruk cache önbellek kelime frekans popülerlik 80/20",
  "title": "Zipf dağılımı: popülerliğin güç yasası",
  "a": "Zipf yasasına göre sıralanmış frekanslarda k'ıncı öğenin sıklığı yaklaşık 1/k ile orantılıdır: en popüler kelime/ürün/sayfa, ikincinin ~2 katı, üçüncünün ~3 katı kullanılır. Bu dağılım doğal dil, web trafiği ve API isteklerinde yaygındır ve önemli bir mühendislik sonucu doğurur: küçük bir cache bile isabet oranının büyük kısmını yakalar, çünkü trafiğin çoğu az sayıda 'sıcak' anahtara gider. Öte yandan uzun kuyruk (long tail) ihmal edilemez: nadir öğelerin toplamı da hatırı sayılır trafik oluşturur, bu yüzden cache miss yolu da hızlı olmalıdır.",
  "code": "# Zipf: frekans(k) ~ C / k\nN = 1000  # farklı anahtar sayısı\nharmonik = sum(1 / k for k in range(1, N + 1))\n\n# İlk 100 anahtar (nüfusun %10'u) trafiğin yüzde kaçı?\npay = sum(1 / k for k in range(1, 101)) / harmonik\nprint(f'{pay:.0%}')  # ~%69 — küçük cache, büyük isabet",
  "weight": 1
 }
];
