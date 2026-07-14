/* =========================================================
   VEGA Genişletme Paketi 3 — paralel ajan üretimi (öz-denetimli)
   Konteyner & Bulut, C/C++, İleri SQL, Erişilebilirlik & Performans
   ========================================================= */
const VEGA_KNOWLEDGE_EXT3 = [
 {
  "id": "cloud-docker-image-katmanlari",
  "cat": "Konteyner & Bulut",
  "q": "docker image katman layer cache build önbellek COPY RUN sıralama docker build layer caching invalidation",
  "title": "Docker İmaj Katmanları ve Build Cache",
  "a": "Dockerfile'daki her komut (RUN, COPY vb.) salt okunur bir katman oluşturur ve Docker bu katmanları önbelleğe alır; bir katman değişirse ondan sonraki TÜM katmanların cache'i geçersiz olur. Bu yüzden az değişen adımları (bağımlılık kurulumu) üste, sık değişenleri (kaynak kodu kopyalama) alta koyun. Yaygın tuzak: 'COPY . .' komutunu bağımlılık kurulumundan önce yazmak — her kod değişikliğinde bağımlılıklar baştan iner.",
  "code": "# Kötü: her kod değişikliğinde npm install tekrar çalışır\n# COPY . .\n# RUN npm install\n\n# İyi: önce sadece bağımlılık dosyalarını kopyala\nFROM node:20-alpine\nWORKDIR /app\nCOPY package.json package-lock.json ./\nRUN npm ci          # kod değişse bile bu katman cache'ten gelir\nCOPY . .            # sık değişen kod en sonda\nCMD [\"node\", \"server.js\"]",
  "weight": 1.0
 },
 {
  "id": "cloud-docker-compose-coklu-servis",
  "cat": "Konteyner & Bulut",
  "q": "docker compose çoklu servis multi service depends_on network veritabanı yaml up down compose.yaml orchestration yerel geliştirme",
  "title": "Docker Compose ile Çoklu Servis",
  "a": "Docker Compose, birden fazla konteyneri tek bir YAML dosyasıyla tanımlayıp 'docker compose up' ile birlikte ayağa kaldırır; servisler aynı ağda olduğundan birbirlerine servis adıyla (ör. 'db') erişir. Yaygın tuzak: depends_on varsayılan olarak sadece konteynerin BAŞLAMASINI bekler, servisin hazır olmasını değil — bunun için 'condition: service_healthy' ile healthcheck kullanın.",
  "code": "# compose.yaml\nservices:\n  web:\n    build: .\n    ports:\n      - \"8080:3000\"\n    depends_on:\n      db:\n        condition: service_healthy   # db hazır olana kadar bekle\n  db:\n    image: postgres:16\n    environment:\n      POSTGRES_PASSWORD: gizli\n    healthcheck:\n      test: [\"CMD-SHELL\", \"pg_isready -U postgres\"]\n      interval: 5s",
  "weight": 1.0
 },
 {
  "id": "cloud-dockerfile-multi-stage",
  "cat": "Konteyner & Bulut",
  "q": "dockerfile multi-stage build en iyi pratik best practice küçük imaj alpine COPY --from builder aşamalı derleme image size",
  "title": "Multi-Stage Build ile Küçük İmajlar",
  "a": "Multi-stage build'de derleme araçlarını içeren bir 'builder' aşamasında uygulamayı derler, sonra sadece çalıştırma için gerekenleri küçük bir imaja kopyalarsınız; böylece derleyici, kaynak kod ve build bağımlılıkları son imaja girmez. Bu hem imaj boyutunu hem saldırı yüzeyini ciddi ölçüde küçültür. Ek pratikler: sabit imaj etiketi kullanın ('latest' değil) ve root olmayan kullanıcıyla çalıştırın.",
  "code": "# Aşama 1: derleme (Go örneği)\nFROM golang:1.22 AS builder\nWORKDIR /src\nCOPY . .\nRUN CGO_ENABLED=0 go build -o /app ./cmd/server\n\n# Aşama 2: sadece binary'yi taşı\nFROM alpine:3.20\nRUN adduser -D appuser\nUSER appuser                      # root olarak çalıştırma\nCOPY --from=builder /app /app\nENTRYPOINT [\"/app\"]",
  "weight": 1.0
 },
 {
  "id": "cloud-konteyner-vs-vm",
  "cat": "Konteyner & Bulut",
  "q": "konteyner container vs vm sanal makine virtual machine hypervisor kernel namespace cgroup izolasyon fark karşılaştırma",
  "title": "Konteyner ile Sanal Makine Farkı",
  "a": "Sanal makine, hypervisor üzerinde kendi çekirdeği (kernel) ve işletim sistemiyle çalışan tam bir makinedir; konteyner ise host'un çekirdeğini paylaşır ve izolasyonu Linux namespace ile cgroup mekanizmalarıyla sağlar. Bu yüzden konteynerler saniyeler içinde açılır ve çok daha az kaynak tüketir, ancak izolasyonları VM'den zayıftır — çekirdek açığı tüm konteynerleri etkileyebilir. Yaygın yanılgı: konteyner 'hafif VM' değildir; ayrı bir işletim sistemi çalıştırmaz, izole edilmiş bir süreç grubudur.",
  "code": "# Konteynerin aslında host'ta bir süreç olduğunu görün:\ndocker run -d --name deneme nginx:1.27\n\n# Host tarafında nginx süreci doğrudan görünür\nps aux | grep nginx\n\n# Konteyner host ile AYNI çekirdeği kullanır\ndocker exec deneme uname -r   # host'un kernel sürümünü basar\nuname -r                      # aynı çıktı",
  "weight": 1.0
 },
 {
  "id": "cloud-kubernetes-temel-kavramlar",
  "cat": "Konteyner & Bulut",
  "q": "kubernetes k8s pod deployment service temel kavramlar replica kubectl orchestration container orkestrasyon selector label",
  "title": "Kubernetes Temelleri: Pod, Deployment, Service",
  "a": "Pod, Kubernetes'in en küçük dağıtım birimidir ve bir veya birden fazla konteyner içerir; Deployment, istenen sayıda Pod kopyasını (replica) çalışır tutar ve güncellemeleri kademeli yapar; Service ise sürekli değişen Pod IP'lerinin önünde sabit bir isim ve sanal IP sağlar. Yaygın tuzak: Pod'ları elle oluşturmak — Pod ölünce kimse yeniden başlatmaz, her zaman Deployment kullanın.",
  "code": "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: web\nspec:\n  replicas: 3\n  selector:\n    matchLabels: { app: web }\n  template:\n    metadata:\n      labels: { app: web }\n    spec:\n      containers:\n        - name: web\n          image: nginx:1.27\n          ports: [{ containerPort: 80 }]",
  "weight": 1.0
 },
 {
  "id": "cloud-k8s-ne-zaman-gerekmez",
  "cat": "Konteyner & Bulut",
  "q": "kubernetes ne zaman gerekmez gereksiz overkill alternatif docker compose paas basitlik karmaşıklık maliyet küçük ekip",
  "title": "Kubernetes Ne Zaman GEREKMEZ?",
  "a": "Tek sunucuda çalışan, trafiği öngörülebilir, birkaç servisten oluşan uygulamalar için Kubernetes çoğunlukla gereksiz karmaşıklıktır: cluster yönetimi, YAML yükü ve operasyon bilgisi ister, küçük ekiplerin hızını düşürür. Docker Compose + tek VM, ya da yönetilen PaaS/container servisleri (Cloud Run, App Runner, Fly.io gibi) çoğu senaryoyu karşılar. K8s; onlarca servis, otomatik ölçekleme ihtiyacı ve çoklu makine orkestrasyonu gerçekten varsa anlamlıdır — 'ileride lazım olur' diye erken benimsemek yaygın bir tuzaktır.",
  "code": null,
  "weight": 1.0
 },
 {
  "id": "cloud-container-registry",
  "cat": "Konteyner & Bulut",
  "q": "container registry docker hub ghcr ecr imaj deposu push pull tag login private registry image repository etiket",
  "title": "Container Registry: İmaj Depoları",
  "a": "Registry, imajların sürümlenmiş şekilde saklandığı ve dağıtıldığı depodur; Docker Hub, GitHub Container Registry (ghcr.io) ve AWS ECR yaygın örneklerdir. İmajın gideceği registry, imaj adının ön ekiyle belirlenir (ör. ghcr.io/kullanici/uygulama). Yaygın tuzak: üretimde 'latest' etiketi kullanmak — hangi sürümün çalıştığı belirsizleşir ve geri dönüş zorlaşır; sabit sürüm veya digest kullanın.",
  "code": "# Registry'ye giriş yap (GitHub Container Registry örneği)\necho $GH_TOKEN | docker login ghcr.io -u KULLANICI --password-stdin\n\n# İmajı registry adresiyle etiketle\ndocker build -t ghcr.io/kullanici/uygulama:1.4.2 .\n\n# Gönder ve başka makinede çek\ndocker push ghcr.io/kullanici/uygulama:1.4.2\ndocker pull ghcr.io/kullanici/uygulama:1.4.2",
  "weight": 1.0
 },
 {
  "id": "cloud-volume-kalici-veri",
  "cat": "Konteyner & Bulut",
  "q": "docker volume kalıcı veri persistent data bind mount named volume veritabanı silinme -v mount saklama storage",
  "title": "Volume ile Kalıcı Veri",
  "a": "Konteynerin yazılabilir katmanı geçicidir: konteyner silinince içindeki veri de gider. Kalıcı veri için named volume (Docker'ın yönettiği alan) veya bind mount (host'taki bir klasör) kullanılır; veritabanları için named volume önerilir. Yaygın tuzak: 'docker compose down -v' komutundaki -v bayrağı volume'ları da SİLER — üretim verisinde dikkatli olun.",
  "code": "# Named volume oluştur ve PostgreSQL verisini kalıcılaştır\ndocker volume create pgdata\n\ndocker run -d --name db \\\n  -e POSTGRES_PASSWORD=gizli \\\n  -v pgdata:/var/lib/postgresql/data \\\n  postgres:16\n\n# Konteyner silinse bile veri volume'da durur\ndocker rm -f db\ndocker volume ls   # pgdata hala listede",
  "weight": 1.0
 },
 {
  "id": "cloud-konteyner-ag-port-mapping",
  "cat": "Konteyner & Bulut",
  "q": "docker network port mapping yayınlama publish -p bridge ağ konteyner iletişim localhost expose host port forwarding",
  "title": "Konteyner Ağları ve Port Mapping",
  "a": "Konteynerler varsayılan bridge ağında kendi IP'leriyle çalışır ve portları dışarıya kapalıdır; '-p HOST:KONTEYNER' ile host portu konteyner portuna yönlendirilir. Aynı kullanıcı tanımlı ağdaki konteynerler birbirine konteyner adıyla DNS üzerinden erişir. Yaygın tuzak: bir konteynerden diğerine 'localhost' ile bağlanmaya çalışmak — localhost konteynerin kendisidir, hedef konteynerin adını kullanın.",
  "code": "# Kullanıcı tanımlı ağ oluştur (ad ile DNS çözümü sağlar)\ndocker network create uygulama-agi\n\ndocker run -d --name api --network uygulama-agi my-api\ndocker run -d --name web --network uygulama-agi \\\n  -p 8080:80 nginx:1.27   # host:8080 -> konteyner:80\n\n# web konteyneri api'ye adıyla erişir (localhost DEĞİL)\ndocker exec web curl http://api:3000/health",
  "weight": 1.0
 },
 {
  "id": "cloud-healthcheck-restart-politikalari",
  "cat": "Konteyner & Bulut",
  "q": "healthcheck restart policy sağlık kontrolü yeniden başlatma unless-stopped always on-failure liveness docker durum unhealthy",
  "title": "Health Check ve Restart Politikaları",
  "a": "HEALTHCHECK, konteynerin içinde periyodik bir komut çalıştırarak servisin gerçekten yanıt verdiğini doğrular; başarısız olursa durum 'unhealthy' olur. Restart politikaları (no, on-failure, always, unless-stopped) konteyner çöktüğünde Docker'ın davranışını belirler; sunucularda genellikle 'unless-stopped' tercih edilir. Yaygın tuzak: tek başına Docker'da unhealthy durum konteyneri OTOMATİK yeniden başlatmaz — restart politikası yalnızca süreç çıkışında devreye girer.",
  "code": "FROM nginx:1.27\n# Her 30 sn'de kontrol et, 3 sn'de yanıt gelmezse başarısız say\nHEALTHCHECK --interval=30s --timeout=3s --retries=3 \\\n  CMD curl -f http://localhost/ || exit 1\n\n# Çalıştırırken restart politikası ver:\n# docker run -d --restart unless-stopped my-nginx\n#\n# Durumu izle:\n# docker ps --format '{{.Names}} {{.Status}}'",
  "weight": 1.0
 },
 {
  "id": "cloud-iac-terraform",
  "cat": "Konteyner & Bulut",
  "q": "infrastructure as code iac terraform hcl plan apply state altyapı kod deklaratif provizyon provider tfstate",
  "title": "IaC ve Terraform Kavramları",
  "a": "Infrastructure as Code, altyapıyı (sunucu, ağ, veritabanı) elle tıklayarak değil, sürüm kontrolündeki kod dosyalarıyla tanımlamaktır; Terraform bunu deklaratif HCL diliyle yapar. 'terraform plan' mevcut durum ile istenen durumu karşılaştırıp değişiklikleri gösterir, 'apply' uygular; mevcut durum state dosyasında tutulur. Yaygın tuzak: state dosyasını yerel tutmak — ekipte çakışmaya yol açar, uzak backend (ör. S3) ve kilitleme kullanın.",
  "code": "# main.tf — AWS'de basit bir S3 bucket tanımı\nterraform {\n  required_providers {\n    aws = { source = \"hashicorp/aws\", version = \"~> 5.0\" }\n  }\n}\n\nprovider \"aws\" { region = \"eu-central-1\" }\n\nresource \"aws_s3_bucket\" \"loglar\" {\n  bucket = \"sirket-uygulama-loglari\"\n}\n# Kullanım: terraform init && terraform plan && terraform apply",
  "weight": 1.0
 },
 {
  "id": "cloud-serverless-ne-zaman",
  "cat": "Konteyner & Bulut",
  "q": "serverless sunucusuz lambda function faas ne zaman cold start ölçekleme event driven aws cloud functions kullanım senaryosu",
  "title": "Serverless (Lambda) Ne Zaman Mantıklı?",
  "a": "Serverless'ta kodunuz olay tetiklendiğinde çalışır, kullanılmadığında ücret ödemezsiniz ve ölçekleme otomatiktir; düzensiz/seyrek trafik, olay tabanlı işler (dosya yükleme sonrası işleme, zamanlanmış görevler, webhook) için idealdir. Buna karşılık sürekli yüksek trafikte konteyner/VM'den pahalı çıkabilir; cold start gecikmesi ve çalışma süresi limitleri (ör. AWS Lambda'da en fazla 15 dakika) vardır. Yaygın tuzak: uzun süren veya kalıcı bağlantı (WebSocket benzeri) isteyen işleri klasik Lambda'ya taşımak.",
  "code": "# AWS Lambda handler (Python) — S3'e yüklenen dosyayı işler\nimport json\n\ndef handler(event, context):\n    # S3 olayından bucket ve dosya adını al\n    kayit = event[\"Records\"][0][\"s3\"]\n    bucket = kayit[\"bucket\"][\"name\"]\n    anahtar = kayit[\"object\"][\"key\"]\n    print(f\"Yeni dosya: {bucket}/{anahtar}\")\n    return {\"statusCode\": 200, \"body\": json.dumps(\"tamam\")}",
  "weight": 1.0
 },
 {
  "id": "cloud-bulut-maliyet-tuzaklari",
  "cat": "Konteyner & Bulut",
  "q": "bulut maliyet tuzak cloud cost egress veri çıkışı unutulan kaynak nat gateway bütçe alarm billing fatura sürpriz optimizasyon",
  "title": "Bulut Maliyet Tuzakları",
  "a": "En yaygın sürpriz kalemler: veri ÇIKIŞ (egress) ücretleri — veri girişi genelde ücretsizken bölgeler arası ve internete çıkan trafik ücretlidir; unutulan kaynaklar (bağlantısı kopmuş diskler, boşta duran VM'ler, eski snapshot'lar); ve NAT Gateway gibi saatlik + trafik bazlı çift ücretli servisler. Kaynakları gereğinden büyük seçmek (overprovisioning) da sessizce para yakar. Mutlaka bütçe alarmı kurun ve kaynakları etiketleyip düzenli maliyet raporu inceleyin.",
  "code": "# AWS CLI ile aylık bütçe alarmı oluşturma örneği\naws budgets create-budget \\\n  --account-id 123456789012 \\\n  --budget '{\n    \"BudgetName\": \"aylik-limit\",\n    \"BudgetLimit\": {\"Amount\": \"100\", \"Unit\": \"USD\"},\n    \"TimeUnit\": \"MONTHLY\",\n    \"BudgetType\": \"COST\"\n  }'\n# Ek olarak: kullanılmayan diskleri bulun\n# aws ec2 describe-volumes --filters Name=status,Values=available",
  "weight": 1.0
 },
 {
  "id": "cloud-12-factor-app",
  "cat": "Konteyner & Bulut",
  "q": "12 factor twelve-factor app on iki faktör config environment stateless log port binding bağımlılık modern uygulama tasarım ilkeleri",
  "title": "12-Factor App İlkeleri",
  "a": "12-Factor, buluta uygun uygulamalar için tasarım ilkeleridir; en kritikleri: yapılandırmayı ortam değişkenlerinde tut (kodda/dosyada sabitleme), uygulamayı stateless çalıştır (oturum verisini Redis gibi dış servise koy), logları dosyaya değil stdout'a yaz (toplamayı platform yapsın) ve bağımlılıkları açıkça bildir. Bu ilkeler uygulamanın yatay ölçeklenmesini ve konteyner ortamlarında sorunsuz çalışmasını sağlar. Yaygın tuzak: sırları (parola, API key) koda veya imaja gömmek — ortamdan enjekte edin.",
  "code": "# İlke: config ortamdan gelir, kodda sabit değer yok\nimport os\n\nDATABASE_URL = os.environ[\"DATABASE_URL\"]   # ortamdan oku\nPORT = int(os.environ.get(\"PORT\", \"8000\"))  # port binding\n\n# İlke: log dosyaya değil stdout'a\nimport logging, sys\nlogging.basicConfig(stream=sys.stdout, level=logging.INFO)\nlogging.info(\"uygulama %s portunda basliyor\", PORT)",
  "weight": 1.0
 },
 {
  "id": "cpp-pointer-temelleri",
  "cat": "C/C++",
  "q": "pointer isaretci temelleri adres dereference pointer arithmetic aritmetik bellek adresi C gosterge * & increment",
  "title": "Pointer temelleri ve pointer aritmetiği",
  "a": "Pointer (işaretçi), başka bir değişkenin bellek adresini tutan değişkendir; & operatörü adres alır, * operatörü adresteki değere erişir (dereference). Pointer aritmetiğinde p++ ifadesi adresi 1 bayt değil, işaret edilen tipin boyutu kadar (örn. int için genelde 4 bayt) ilerletir. Yaygın tuzak: geçerli bir nesneye veya dizinin bir fazlasına (one-past-the-end) işaret etmeyen adreslerle aritmetik yapmak tanımsız davranıştır.",
  "code": "#include <stdio.h>\nint main(void) {\n    int dizi[3] = {10, 20, 30};\n    int *p = dizi;            // ilk elemani gosterir\n    printf(\"%d\\n\", *p);       // 10\n    p++;                      // 1 bayt degil, 1 eleman (sizeof(int)) ilerler\n    printf(\"%d\\n\", *p);       // 20\n    printf(\"%d\\n\", *(p + 1)); // 30\n    return 0;\n}",
  "weight": 1.0
 },
 {
  "id": "cpp-malloc-free",
  "cat": "C/C++",
  "q": "malloc free calloc realloc bellek sizintisi memory leak dinamik bellek heap tahsis dangling pointer serbest birakma C",
  "title": "malloc/free ve bellek sızıntısı",
  "a": "malloc heap'ten istenen boyutta bellek ayırır ve başarısız olursa NULL döndürür; bu yüzden dönüş değeri kontrol edilmelidir. Ayrılan her blok işi bitince free ile serbest bırakılmalıdır, yoksa bellek sızıntısı (memory leak) oluşur. Yaygın tuzaklar: aynı bloğu iki kez free etmek (double free) ve free sonrası pointer'ı kullanmak (use-after-free) tanımsız davranıştır; free sonrası pointer'ı NULL yapmak bu hataları yakalamayı kolaylaştırır.",
  "code": "#include <stdio.h>\n#include <stdlib.h>\nint main(void) {\n    int *v = malloc(5 * sizeof *v);   // heap'ten 5 int'lik yer\n    if (v == NULL) return 1;          // malloc basarisiz olabilir\n    for (int i = 0; i < 5; i++) v[i] = i * i;\n    printf(\"%d\\n\", v[4]);\n    free(v);                          // birakilmazsa bellek sizintisi\n    v = NULL;                         // sarkan (dangling) pointer'i onle\n    return 0;\n}",
  "weight": 1.0
 },
 {
  "id": "cpp-stack-vs-heap",
  "cat": "C/C++",
  "q": "stack heap yigin bellek bolgesi otomatik degisken malloc omur lifetime scope stack overflow dinamik tahsis C",
  "title": "Stack ve heap farkı (C perspektifi)",
  "a": "Stack'teki yerel değişkenler otomatik ömürlüdür: tanımlandıkları blok bitince kendiliğinden yok olur ve tahsisleri çok hızlıdır, ancak stack boyutu sınırlıdır. Heap'ten malloc ile alınan bellek ise free çağrılana kadar yaşar ve boyutu çalışma zamanında belirlenebilir. Yaygın tuzak: yerel (stack) bir değişkenin adresini fonksiyondan döndürmek sarkan pointer üretir; fonksiyon dönüşünde o bellek geçersizleşir.",
  "code": "#include <stdio.h>\n#include <stdlib.h>\nint main(void) {\n    int s = 5;                    // stack: otomatik omur, blokla biter\n    int *h = malloc(sizeof *h);   // heap: free cagrilana kadar yasar\n    if (h == NULL) return 1;\n    *h = 7;\n    printf(\"%d %d\\n\", s, *h);\n    free(h);                      // heap'i elle serbest birakmak zorundasin\n    return 0;                     // s burada kendiliginden yok olur\n}",
  "weight": 1.0
 },
 {
  "id": "cpp-dizi-pointer",
  "cat": "C/C++",
  "q": "dizi array pointer decay donusum sizeof eleman sayisi fonksiyon parametresi indeks C array to pointer",
  "title": "Diziler ve pointer ilişkisi (decay)",
  "a": "Dizi adı çoğu ifadede ilk elemanının adresine dönüşür (array-to-pointer decay); bu yüzden fonksiyona dizi geçirmek aslında pointer geçirmektir ve eleman sayısı ayrıca iletilmelidir. sizeof ve & operatörleri istisnadır: dizinin tanımlı olduğu kapsamda sizeof dizi tüm dizinin bayt boyutunu verir. Yaygın tuzak: pointer parametre üzerinde sizeof kullanmak dizi boyutunu değil pointer boyutunu (örn. 8 bayt) verir.",
  "code": "#include <stdio.h>\nvoid yazdir(int *p, size_t n) {   // dizi parametresi pointer'a donusur\n    for (size_t i = 0; i < n; i++) printf(\"%d \", p[i]);\n    printf(\"\\n\");\n}\nint main(void) {\n    int d[4] = {1, 2, 3, 4};\n    printf(\"%zu\\n\", sizeof d / sizeof d[0]); // 4: burada d gercek dizi\n    yazdir(d, 4);                 // d ifadede &d[0]'a donusur (decay)\n    return 0;\n}",
  "weight": 1.0
 },
 {
  "id": "cpp-string-null-terminator",
  "cat": "C/C++",
  "q": "string char pointer null terminator sonlandirici strlen strcpy karakter dizisi string literal sabit C metin",
  "title": "C string'leri: char* ve null terminator",
  "a": "C'de string, sonunda '\\0' (null terminator) bulunan bir char dizisidir; strlen gibi fonksiyonlar bu sonlandırıcıya kadar sayar ve onu uzunluğa dahil etmez. Bu yüzden n karakterlik bir metin için en az n+1 baytlık yer ayrılmalıdır. Yaygın tuzaklar: string sabitleri (literal) salt okunur olabilir, bunları değiştirmek tanımsız davranıştır; strcpy hedef tamponun boyutunu kontrol etmez, taşma riskine karşı boyut sınırlı alternatifler (örn. snprintf) tercih edilmelidir.",
  "code": "#include <stdio.h>\n#include <string.h>\nint main(void) {\n    char s[6] = \"merha\";        // 5 harf + '\\0' = 6 bayt gerekir\n    const char *p = \"sabit\";    // string sabitini degistirmek UB'dir\n    printf(\"%zu\\n\", strlen(s)); // 5: sonlandirici sayilmaz\n    printf(\"%zu\\n\", sizeof s);  // 6: '\\0' dahil\n    printf(\"%s\\n\", p);\n    return 0;\n}",
  "weight": 1.0
 },
 {
  "id": "cpp-struct-typedef",
  "cat": "C/C++",
  "q": "struct typedef yapi veri tipi alan member ok operatoru arrow nokta erisim C kayit tanimlama",
  "title": "struct ve typedef kullanımı",
  "a": "struct, farklı tipteki alanları tek bir bileşik tipte toplar; typedef ile takma ad verilirse her kullanımda 'struct' anahtar kelimesini yazmak gerekmez. Alanlara doğrudan nesne üzerinden nokta (.) ile, pointer üzerinden ok (->) ile erişilir. Yaygın tuzak: derleyici hizalama (padding) ekleyebileceği için struct'ın boyutu alanların boyutları toplamından büyük olabilir; boyuta güvenmek yerine sizeof kullanın.",
  "code": "#include <stdio.h>\ntypedef struct {\n    char ad[20];\n    int yas;\n} Kisi;                         // typedef: 'struct' yazmadan kullanim\nint main(void) {\n    Kisi k = { \"Ayse\", 30 };\n    Kisi *p = &k;\n    printf(\"%s %d\\n\", p->ad, p->yas); // pointer uzerinden -> ile erisim\n    return 0;\n}",
  "weight": 1.0
 },
 {
  "id": "cpp-header-derleme-birimi",
  "cat": "C/C++",
  "q": "header baslik dosyasi include guard derleme birimi translation unit prototip bildirim tanim declaration definition ifndef pragma once",
  "title": "Header dosyaları ve derleme birimleri",
  "a": "Her .c dosyası, include edilen header'larla birlikte ayrı bir derleme birimi (translation unit) olarak derlenir; header'lar bildirimleri (prototip, tip tanımı) paylaşır, fonksiyonların gövdesi ise tek bir .c dosyasında tanımlanır. Include guard (#ifndef/#define/#endif) aynı header'ın bir birimde iki kez işlenmesini engeller. Yaygın tuzak: fonksiyon gövdesini header'a koymak, header birden çok .c dosyasından include edilince linker'da çoklu tanım hatasına yol açar (static veya inline değilse).",
  "code": "/* matematik.h — bildirim burada */\n#ifndef MATEMATIK_H\n#define MATEMATIK_H\nint topla(int a, int b);        // prototip: her birimde gorunur\n#endif\n\n/* matematik.c — tanim tek derleme biriminde */\n#include \"matematik.h\"\nint topla(int a, int b) { return a + b; }",
  "weight": 1.0
 },
 {
  "id": "cpp-derleme-sureci",
  "cat": "C/C++",
  "q": "derleme compile preprocess onislemci linker baglayici assembly nesne dosyasi object file gcc asamalar build sureci",
  "title": "Derleme süreci: önişlem, derleme, bağlama",
  "a": "C derlemesi dört aşamadan geçer: önişlemci #include ve #define gibi yönergeleri metinsel olarak açar, derleyici kodu assembly'ye çevirir, çevirici (assembler) nesne dosyası (.o) üretir, bağlayıcı (linker) nesne dosyalarını ve kütüphaneleri birleştirip çalıştırılabilir dosya oluşturur. Yaygın tuzak: 'undefined reference' hatası derleme değil bağlama hatasıdır; genellikle bir fonksiyonun tanımını içeren .o dosyası veya kütüphane linker komutuna eklenmemiştir.",
  "code": "/* gcc asamalari tek tek:\n   gcc -E main.c -o main.i   -> onislemci: #include/#define acilir\n   gcc -S main.i -o main.s   -> derleyici: assembly uretir\n   gcc -c main.s -o main.o   -> nesne dosyasi (makine kodu)\n   gcc main.o -o program     -> baglayici (linker) calistirilabilir yapar */\n#include <stdio.h>\nint main(void) {\n    printf(\"merhaba derleme\\n\");\n    return 0;\n}",
  "weight": 1.0
 },
 {
  "id": "cpp-undefined-behavior",
  "cat": "C/C++",
  "q": "undefined behavior tanimsiz davranis UB signed overflow tasma dizi sinir disi out of bounds uninitialized baslatilmamis degisken C standart",
  "title": "Undefined behavior (tanımsız davranış)",
  "a": "Tanımsız davranış (UB), C standardının hiçbir sonuç garantisi vermediği durumlardır: dizi sınırı dışına erişim, işaretli tamsayı taşması, başlatılmamış değişken okuma, NULL dereference gibi. UB'li program çökebilir, yanlış sonuç verebilir ya da tesadüfen 'doğru' çalışıyor gibi görünebilir; derleyici optimizasyonları davranışı sürümden sürüme değiştirebilir. Yaygın tuzak: 'test ettim, çalışıyor' UB'nin yokluğunu kanıtlamaz; -fsanitize=undefined ve -fsanitize=address gibi araçlarla denetleyin.",
  "code": "#include <stdio.h>\n#include <limits.h>\nint main(void) {\n    int d[3] = {1, 2, 3};\n    // d[3] okumak UB olurdu: sinir disi erisim\n    // INT_MAX + 1 hesaplamak da UB (isaretli tasma)\n    long long guvenli = (long long)INT_MAX + 1; // genis tipte guvenli\n    printf(\"%lld\\n\", guvenli);\n    printf(\"%d\\n\", d[2]);       // son gecerli indeks: 2\n    return 0;\n}",
  "weight": 1.0
 },
 {
  "id": "cpp-segfault-sebepleri",
  "cat": "C/C++",
  "q": "segfault segmentation fault cokme null pointer dereference use after free stack overflow gecersiz bellek erisim hata ayiklama gdb valgrind",
  "title": "Segfault sebepleri",
  "a": "Segmentation fault, programın erişim hakkı olmayan bir bellek adresine dokunmasıyla işletim sisteminin süreci sonlandırmasıdır. En sık sebepler: NULL veya başlatılmamış pointer'ı dereference etmek, free edilmiş belleği kullanmak, dizi sınırlarını büyük ölçüde aşmak ve sonsuz özyinelemeyle stack taşması. Yaygın tuzak: segfault her hatalı erişimde garanti değildir; küçük sınır aşımları sessizce veri bozabilir, bu yüzden Valgrind veya AddressSanitizer ile test etmek gerekir.",
  "code": "#include <stdio.h>\n#include <stdlib.h>\nint main(void) {\n    int *p = NULL;\n    // *p = 5;               // SEGFAULT: NULL gostergeye yazma\n    p = malloc(sizeof *p);\n    if (p == NULL) return 1; // kontrol olasi cokmeyi onler\n    *p = 5;                  // artik gecerli bellek\n    printf(\"%d\\n\", *p);\n    free(p);\n    // *p = 6;               // use-after-free: cokme ya da sessiz bozulma\n    return 0;\n}",
  "weight": 1.0
 },
 {
  "id": "cpp-raii-akilli-isaretciler",
  "cat": "C/C++",
  "q": "RAII smart pointer akilli isaretci unique_ptr shared_ptr make_unique make_shared sahiplik ownership destructor kaynak yonetimi C++ memory",
  "title": "C++ RAII ve akıllı işaretçiler",
  "a": "RAII, kaynağın bir nesnenin ömrüne bağlanmasıdır: kaynak yapıcıda edinilir, kapsam bitince yıkıcıda otomatik serbest bırakılır; böylece exception durumunda bile sızıntı olmaz. unique_ptr tek sahiplik sunar ve kopyalanamaz (yalnızca move edilir); shared_ptr referans sayacı tutar ve son sahip yok olunca belleği siler. Yaygın tuzak: shared_ptr'lerin birbirini döngüsel referansla tutması sayacın sıfırlanmasını engeller; döngüyü kırmak için weak_ptr kullanılır.",
  "code": "#include <iostream>\n#include <memory>\nint main() {\n    auto tekil = std::make_unique<int>(42); // tek sahip, kopyalanamaz\n    std::cout << *tekil << \"\\n\";\n    auto ortak = std::make_shared<int>(7);  // referans sayacli\n    auto kopya = ortak;                     // sayac 2'ye cikar\n    std::cout << ortak.use_count() << \"\\n\"; // 2\n    return 0;  // kapsam bitince delete otomatik cagrilir (RAII)\n}",
  "weight": 1.0
 },
 {
  "id": "cpp-referans-vs-pointer",
  "cat": "C/C++",
  "q": "referans reference pointer isaretci fark C++ null rebind yeniden baglama fonksiyon parametresi alias takma ad",
  "title": "C++: referans ve pointer farkı",
  "a": "Referans bir nesneye takma addır: tanımda bir nesneye bağlanmak zorundadır, geçerli kodda 'null referans' oluşturulamaz ve sonradan başka nesneye yeniden bağlanamaz. Pointer ise null olabilir, yeniden atanabilir ve aritmetiğe girer; bu yüzden kullanmadan önce null kontrolü gerekir. Yaygın kural: 'değer yok' durumu anlamlıysa pointer (veya std::optional), her zaman geçerli bir nesne bekleniyorsa referans tercih edilir.",
  "code": "#include <iostream>\nvoid artirRef(int &r) { ++r; }            // referans: null olamaz\nvoid artirPtr(int *p) { if (p) ++*p; }    // pointer: null kontrolu gerekir\nint main() {\n    int x = 10;\n    artirRef(x);       // adres operatoru gerekmez\n    artirPtr(&x);      // adres acikca gecirilir\n    std::cout << x << \"\\n\"; // 12\n    return 0;\n}",
  "weight": 1.0
 },
 {
  "id": "cpp-const-dogrulugu",
  "cat": "C/C++",
  "q": "const correctness dogruluk sabit const pointer referans salt okunur read only C++ const member function parametre",
  "title": "const doğruluğu (const correctness)",
  "a": "const, bir değerin o isim üzerinden değiştirilmeyeceğini derleyiciye bildirir; ihlaller çalışma zamanında değil derleme zamanında yakalanır. Pointer'larda konum önemlidir: 'const int *p' işaret edilen değeri korur, 'int *const p' pointer'ın kendisini sabitler; ikisi birlikte de kullanılabilir. Yaygın pratik: fonksiyonlara büyük nesneleri kopyalamadan salt okunur geçirmek için const referans (const T&) kullanılır; C++'ta nesne durumunu değiştirmeyen üye fonksiyonlar da const işaretlenmelidir.",
  "code": "#include <iostream>\nvoid yazdir(const int &v) { std::cout << v << \"\\n\"; } // salt okunur erisim\nint main() {\n    int deger = 3;\n    const int *p = °er;  // isaret edilen deger degistirilemez\n    // *p = 4;              // derleme hatasi olurdu\n    int *const q = °er;  // pointer'in kendisi sabit\n    *q = 4;                 // icerige yazmak serbest\n    yazdir(*p);             // 4\n    return 0;\n}",
  "weight": 1.0
 },
 {
  "id": "cpp-stl-vector-map",
  "cat": "C/C++",
  "q": "STL vector map kapsayici container push_back sirali anahtar deger key value iterator C++ standart kutuphane dinamik dizi",
  "title": "STL temel kapsayıcılar: vector ve map",
  "a": "std::vector dinamik boyutlu, bitişik bellekte tutulan bir dizidir; push_back ile sona ekleme amorti O(1)'dir ve indeksle erişim O(1)'dir. std::map anahtar-değer çiftlerini anahtara göre sıralı tutar (tipik gerçekleştirim dengeli ağaç); arama, ekleme ve silme O(log n)'dir. Yaygın tuzaklar: vector'e eleman eklemek kapasite büyümesiyle mevcut iterator ve referansları geçersiz kılabilir; map'te operator[] anahtar yoksa varsayılan değerli yeni eleman oluşturur, salt sorgu için find veya count kullanın.",
  "code": "#include <iostream>\n#include <map>\n#include <string>\n#include <vector>\nint main() {\n    std::vector<int> v = {3, 1, 4};\n    v.push_back(1);                  // sona ekleme: amorti O(1)\n    std::map<std::string, int> yas;  // anahtara gore sirali tutar\n    yas[\"ali\"] = 30;                 // [] eleman yoksa olusturur\n    for (const auto &[ad, y] : yas) std::cout << ad << \" \" << y << \"\\n\";\n    std::cout << v.size() << \"\\n\";   // 4\n    return 0;\n}",
  "weight": 1.0
 },
 {
  "id": "sql2-window-fonksiyonlari",
  "cat": "İleri SQL",
  "q": "window function pencere fonksiyonu ROW_NUMBER RANK DENSE_RANK LAG LEAD OVER PARTITION BY sıralama analitik sql",
  "title": "Window fonksiyonları: ROW_NUMBER, RANK, LAG",
  "a": "Window (pencere) fonksiyonları, satırları gruplara indirgemeden her satır için bir pencere üzerinde hesap yapar; pencere OVER (PARTITION BY ... ORDER BY ...) ile tanımlanır. ROW_NUMBER her satıra benzersiz sıra verir; RANK eşit değerlere aynı sırayı verip sonraki sırada boşluk bırakır (1,1,3), DENSE_RANK boşluk bırakmaz (1,1,2). LAG/LEAD önceki/sonraki satırın değerini getirir. Tuzak: window fonksiyonları WHERE içinde kullanılamaz; filtrelemek için alt sorgu veya CTE gerekir.",
  "code": "-- Her departmanda maaşa göre sıralama ve bir önceki maaşla fark\nSELECT ad, departman, maas,\n       ROW_NUMBER() OVER (PARTITION BY departman ORDER BY maas DESC) AS sira,\n       RANK()       OVER (PARTITION BY departman ORDER BY maas DESC) AS rutbe,\n       maas - LAG(maas) OVER (PARTITION BY departman ORDER BY maas DESC) AS fark\nFROM calisanlar;",
  "weight": 1.0
 },
 {
  "id": "sql2-cte-with",
  "cat": "İleri SQL",
  "q": "CTE WITH common table expression ortak tablo ifadesi okunabilirlik alt sorgu materialized sql sorgu düzenleme",
  "title": "CTE ve WITH ifadesi",
  "a": "CTE (Common Table Expression), WITH ile tanımlanan ve sorgunun geri kalanında tablo gibi kullanılan adlandırılmış bir alt sorgudur; iç içe alt sorguları düzleştirerek okunabilirliği artırır ve aynı ara sonucu birden çok kez kullanmayı sağlar. PostgreSQL 12 öncesinde CTE'ler her zaman ayrıca hesaplanırdı (optimizasyon bariyeri); 12 ve sonrasında planlayıcı uygun olduğunda CTE'yi ana sorguya gömer. Eski davranışı zorlamak için WITH ... AS MATERIALIZED yazılabilir.",
  "code": "WITH aktif_musteriler AS (\n    -- Ara sonucu adlandırıyoruz\n    SELECT id, sehir FROM musteriler WHERE durum = 'aktif'\n)\nSELECT sehir, COUNT(*) AS adet\nFROM aktif_musteriler\nGROUP BY sehir\nORDER BY adet DESC;",
  "weight": 1.0
 },
 {
  "id": "sql2-ozyinelemeli-cte",
  "cat": "İleri SQL",
  "q": "recursive CTE özyinelemeli WITH RECURSIVE hiyerarşi ağaç tree traversal parent child yönetici organizasyon sql",
  "title": "Özyinelemeli CTE (WITH RECURSIVE)",
  "a": "WITH RECURSIVE, hiyerarşik verilerde (organizasyon şeması, kategori ağacı) gezinmek için kullanılır: bir başlangıç (anchor) sorgusu ile kendine referans veren özyineleme adımı UNION ALL ile birleştirilir. Motor, özyineleme adımı yeni satır üretmeyi bırakana kadar tekrar eder. Tuzak: verideki döngüler sonsuz döngüye yol açar; seviye sınırı koymak veya PostgreSQL 14+ ile CYCLE yan tümcesini kullanmak güvenlidir.",
  "code": "WITH RECURSIVE hiyerarsi AS (\n    -- Başlangıç: en tepedeki yöneticiler\n    SELECT id, ad, yonetici_id, 1 AS seviye\n    FROM calisanlar WHERE yonetici_id IS NULL\n    UNION ALL\n    -- Özyineleme: bir alt seviyedeki çalışanlar\n    SELECT c.id, c.ad, c.yonetici_id, h.seviye + 1\n    FROM calisanlar c\n    JOIN hiyerarsi h ON c.yonetici_id = h.id\n)\nSELECT * FROM hiyerarsi ORDER BY seviye, ad;",
  "weight": 1.0
 },
 {
  "id": "sql2-groupby-having",
  "cat": "İleri SQL",
  "q": "GROUP BY HAVING WHERE fark aggregate toplama gruplama filtre COUNT SUM incelik sql sıralama",
  "title": "GROUP BY ve HAVING incelikleri",
  "a": "WHERE gruplama öncesi satırları, HAVING gruplama sonrası grupları filtreler; toplama fonksiyonu içeren koşullar sadece HAVING'de yazılabilir. Standart SQL'de SELECT listesindeki her toplanmamış sütun GROUP BY'da yer almalıdır; PostgreSQL, birincil anahtarla gruplandığında aynı tablonun diğer sütunlarına izin verirken MySQL varsayılan ayarlarla daha gevşek davranabilir. Performans için grup koşulu yerine mümkünse satır koşulu (WHERE) tercih edin, çünkü daha erken uygulanır.",
  "code": "SELECT musteri_id, SUM(tutar) AS toplam\nFROM siparisler\nWHERE tarih >= DATE '2026-01-01'   -- satır bazlı, gruplamadan ÖNCE\nGROUP BY musteri_id\nHAVING SUM(tutar) > 1000           -- grup bazlı, gruplamadan SONRA\nORDER BY toplam DESC;",
  "weight": 1.0
 },
 {
  "id": "sql2-altsorgu-vs-join",
  "cat": "İleri SQL",
  "q": "subquery join performans alt sorgu IN EXISTS NOT IN NULL tuzak correlated ilişkili sorgu optimizasyon",
  "title": "Alt sorgu vs JOIN performansı",
  "a": "Modern planlayıcılar IN/EXISTS alt sorgularını çoğu zaman JOIN'e (semi-join) dönüştürür, bu yüzden anlamsal olarak eşdeğer yazımlar benzer performans verir; ilişkili (correlated) alt sorgular ise satır başına tekrar çalışabilir ve yavaşlayabilir. Kritik tuzak: NOT IN, alt sorgu sonucunda tek bir NULL bile varsa üçlü mantık nedeniyle hiç satır döndürmez; bunun yerine NOT EXISTS kullanın. Şüphede kaldığınızda EXPLAIN ile gerçek planı karşılaştırın.",
  "code": "-- Hiç siparişi olmayan müşteriler: NOT EXISTS NULL'a karşı güvenlidir\nSELECT m.id, m.ad\nFROM musteriler m\nWHERE NOT EXISTS (\n    SELECT 1 FROM siparisler s\n    WHERE s.musteri_id = m.id\n);\n-- NOT IN (SELECT musteri_id ...) kullanılsaydı ve sütunda NULL olsaydı\n-- sonuç boş dönerdi!",
  "weight": 1.0
 },
 {
  "id": "sql2-explain-sorgu-plani",
  "cat": "İleri SQL",
  "q": "EXPLAIN ANALYZE sorgu planı query plan okuma seq scan index scan cost buffers performans analiz postgresql",
  "title": "EXPLAIN ile sorgu planı okuma",
  "a": "EXPLAIN planlayıcının tahmini planını, EXPLAIN ANALYZE ise sorguyu gerçekten çalıştırıp ölçülen süre ve satır sayılarını gösterir; tahmini satır sayısı (rows) ile gerçek satır sayısı arasındaki büyük fark, istatistiklerin bayat olduğuna işaret eder (ANALYZE tablo_adi ile güncellenir). Plan içten dışa okunur: en içteki düğümler önce çalışır. Tuzak: EXPLAIN ANALYZE, INSERT/UPDATE/DELETE'i de gerçekten çalıştırır; yan etkiyi önlemek için BEGIN ... ROLLBACK içinde deneyin.",
  "code": "-- Gerçek çalıştırma süresi ve tampon (buffer) kullanımıyla plan\nEXPLAIN (ANALYZE, BUFFERS)\nSELECT m.ad, SUM(s.tutar)\nFROM siparisler s\nJOIN musteriler m ON m.id = s.musteri_id\nWHERE s.tarih >= DATE '2026-01-01'\nGROUP BY m.ad;\n-- Çıktıda 'Seq Scan' büyük tabloda görülüyorsa indeks eksik olabilir",
  "weight": 1.0
 },
 {
  "id": "sql2-composite-index-siralama",
  "cat": "İleri SQL",
  "q": "composite index bileşik indeks çok sütunlu sıralama column order leftmost prefix en soldaki sütun performans btree",
  "title": "Composite index ve sütun sırasının önemi",
  "a": "Çok sütunlu (composite) B-tree indekste sütun sırası belirleyicidir: indeks, en soldaki sütun(lar) koşulda eşitlikle yer aldığında en verimli çalışır. (a, b) indeksi 'WHERE a = ?' ve 'WHERE a = ? AND b = ?' sorgularını hızlandırır ama yalnızca 'WHERE b = ?' için verimli kullanılamaz. Genel kural: eşitlik koşulundaki sütunları öne, aralık (range) koşulundakini sona koyun.",
  "code": "-- musteri_id eşitlik, tarih aralık: bu sıra doğrudur\nCREATE INDEX idx_sip_musteri_tarih\n    ON siparisler (musteri_id, tarih);\n\n-- Bu sorgu indeksi tam verimle kullanır:\nSELECT * FROM siparisler\nWHERE musteri_id = 42 AND tarih >= DATE '2026-01-01';\n\n-- Sadece 'WHERE tarih >= ...' bu indeksten verimli yararlanamaz;\n-- gerekirse (tarih) için ayrı indeks açın",
  "weight": 1.0
 },
 {
  "id": "sql2-covering-index",
  "cat": "İleri SQL",
  "q": "covering index kapsayan indeks INCLUDE index only scan heap erişim performans postgresql sorgu hızlandırma",
  "title": "Covering (kapsayan) index",
  "a": "Covering index, sorgunun ihtiyaç duyduğu tüm sütunları içerdiği için tabloya (heap'e) hiç gitmeden 'Index Only Scan' ile yanıt verilmesini sağlar. PostgreSQL 11+ ile INCLUDE yan tümcesi, sütunları indeksin arama anahtarına katmadan yaprak seviyesine ekler; böylece indeks daha küçük kalır ve unique kısıtı bozulmaz. Tuzak: Index Only Scan'in gerçekten heap'e gitmemesi visibility map'in güncel olmasına bağlıdır; yoğun güncellenen tablolarda VACUUM önemlidir.",
  "code": "-- Arama anahtarı musteri_id; tutar ve tarih sadece 'yük' olarak eklenir\nCREATE INDEX idx_sip_kapsayan\n    ON siparisler (musteri_id) INCLUDE (tutar, tarih);\n\n-- Tüm sütunlar indekste: Index Only Scan mümkün\nSELECT tutar, tarih\nFROM siparisler\nWHERE musteri_id = 42;",
  "weight": 1.0
 },
 {
  "id": "sql2-izolasyon-seviyeleri",
  "cat": "İleri SQL",
  "q": "isolation level izolasyon seviyesi read committed repeatable read serializable transaction anomali dirty read phantom mvcc",
  "title": "İzolasyon seviyeleri: Read Committed vs Serializable",
  "a": "Read Committed'da (PostgreSQL varsayılanı) her ifade, başladığı anda commit edilmiş en güncel veriyi görür; aynı işlem içinde iki okuma farklı sonuç verebilir (non-repeatable read). Repeatable Read tüm işlem boyunca tek bir anlık görüntü kullanır; Serializable ek olarak işlemlerin sıralı çalışmış gibi davranmasını garanti eder. Tuzak: Serializable (ve Repeatable Read) altında işlem 40001 serileştirme hatasıyla iptal edilebilir; uygulama bu hatada işlemi yeniden denemelidir. MySQL/InnoDB'nin varsayılanı ise Repeatable Read'dir.",
  "code": "-- Sıkı tutarlılık gereken para transferi\nBEGIN ISOLATION LEVEL SERIALIZABLE;\nUPDATE hesaplar SET bakiye = bakiye - 100 WHERE id = 1;\nUPDATE hesaplar SET bakiye = bakiye + 100 WHERE id = 2;\nCOMMIT;\n-- COMMIT '40001 serialization_failure' verirse\n-- uygulama işlemi baştan tekrar denemelidir",
  "weight": 1.0
 },
 {
  "id": "sql2-kilitler-deadlock",
  "cat": "İleri SQL",
  "q": "lock kilit deadlock kilitlenme FOR UPDATE row lock satır kilidi lock ordering sıralama transaction blokaj sql",
  "title": "Kilitler ve deadlock",
  "a": "Deadlock, iki işlemin birbirinin tuttuğu kilidi beklemesiyle oluşur; PostgreSQL bunu algılayıp işlemlerden birini hatayla iptal eder. En etkili önlem, tüm işlemlerin kaynakları her zaman aynı sırayla (örneğin artan id) kilitlemesidir. SELECT ... FOR UPDATE satırları önceden kilitler; NOWAIT beklemeden hata verir, SKIP LOCKED kilitli satırları atlar (iş kuyruğu deseni için idealdir).",
  "code": "-- Deadlock önleme: kilitleri her zaman aynı sırayla (id artan) al\nBEGIN;\nSELECT id FROM hesaplar\nWHERE id IN (1, 2)\nORDER BY id\nFOR UPDATE;   -- iki satır da tek seferde, sabit sırayla kilitlenir\n\nUPDATE hesaplar SET bakiye = bakiye - 100 WHERE id = 1;\nUPDATE hesaplar SET bakiye = bakiye + 100 WHERE id = 2;\nCOMMIT;",
  "weight": 1.0
 },
 {
  "id": "sql2-upsert-on-conflict",
  "cat": "İleri SQL",
  "q": "upsert ON CONFLICT DO UPDATE DO NOTHING EXCLUDED insert or update ekle güncelle merge duplicate key postgresql",
  "title": "UPSERT: INSERT ... ON CONFLICT",
  "a": "UPSERT, kayıt yoksa ekleme varsa güncelleme işlemini tek atomik ifadede yapar; PostgreSQL'de INSERT ... ON CONFLICT ile yazılır ve çakışma hedefi olarak unique kısıtı olan sütun(lar) verilir. Eklenmek istenen değerlere DO UPDATE içinde EXCLUDED takma adıyla erişilir. Farklılık: MySQL'de karşılığı ON DUPLICATE KEY UPDATE, SQL standardında ise MERGE'dür (PostgreSQL 15+ MERGE'ü de destekler).",
  "code": "-- 'anahtar' sütununda UNIQUE kısıt olmalı\nINSERT INTO ayarlar (anahtar, deger, guncelleme)\nVALUES ('tema', 'koyu', now())\nON CONFLICT (anahtar)\nDO UPDATE SET\n    deger      = EXCLUDED.deger,   -- eklenmek istenen yeni değer\n    guncelleme = now();",
  "weight": 1.0
 },
 {
  "id": "sql2-null-uclu-mantik",
  "cat": "İleri SQL",
  "q": "NULL üçlü mantık three valued logic IS NULL COALESCE NULLIF IS DISTINCT FROM karşılaştırma unknown tuzak sql",
  "title": "NULL'un tuzakları: üçlü mantık",
  "a": "SQL'de karşılaştırmalar TRUE/FALSE/UNKNOWN üçlü mantığıyla çalışır: NULL ile yapılan her karşılaştırma (NULL = NULL dahil) UNKNOWN döner ve WHERE bu satırları eler. Bu yüzden NULL kontrolü IS NULL / IS NOT NULL ile yapılır; NULL'a duyarlı eşitlik için IS [NOT] DISTINCT FROM kullanılır. Ek tuzaklar: COUNT(sutun) NULL'ları saymaz (COUNT(*) sayar), toplama fonksiyonları NULL'ları atlar, NOT IN listesindeki NULL tüm sonucu boşaltabilir.",
  "code": "-- YANLIŞ: telefon = NULL hiçbir satır döndürmez (sonuç UNKNOWN)\n-- DOĞRU:\nSELECT * FROM musteriler WHERE telefon IS NULL;\n\n-- NULL'ları varsayılanla değiştir\nSELECT ad, COALESCE(telefon, 'kayitli degil') AS tel FROM musteriler;\n\n-- NULL'a duyarlı eşitlik: iki taraf da NULL ise TRUE döner\nSELECT * FROM a JOIN b ON a.kod IS NOT DISTINCT FROM b.kod;",
  "weight": 1.0
 },
 {
  "id": "sql2-tarih-saat-timezone",
  "cat": "İleri SQL",
  "q": "timestamp timestamptz timezone saat dilimi tarih date_trunc AT TIME ZONE interval now UTC dönüşüm postgresql",
  "title": "Tarih/saat işlemleri ve timezone",
  "a": "PostgreSQL'de timestamptz değeri UTC olarak saklar ve okurken oturumun saat dilimine çevirir; timestamp (without time zone) ise dilim bilgisi taşımaz. Genel kural: an (instant) bilgisini timestamptz'de tutun, yerel saate AT TIME ZONE ile çevirin. Tuzak: AT TIME ZONE, timestamptz'e uygulanınca dilim bilgisiz yerel zamana, timestamp'a uygulanınca timestamptz'e dönüştürür; ayrıca 'İstanbul günü' gibi hesaplar için date_trunc'ı yerel zamana çevirdikten sonra uygulayın.",
  "code": "CREATE TABLE olaylar (\n    id     bigserial PRIMARY KEY,\n    zaman  timestamptz NOT NULL DEFAULT now()  -- UTC olarak saklanır\n);\n\n-- İstanbul yerel saatine çevir ve güne yuvarla\nSELECT date_trunc('day', zaman AT TIME ZONE 'Europe/Istanbul') AS gun,\n       COUNT(*) AS adet\nFROM olaylar\nGROUP BY gun\nORDER BY gun;",
  "weight": 1.0
 },
 {
  "id": "sql2-view-vs-materialized-view",
  "cat": "İleri SQL",
  "q": "view materialized view görünüm maddi görünüm REFRESH CONCURRENTLY önbellek rapor performans bayat veri postgresql",
  "title": "View vs Materialized View",
  "a": "Normal view saklanmış bir sorgudur: her erişimde yeniden çalışır ve daima güncel veri gösterir. Materialized view ise sonucu fiziksel olarak diske yazar; pahalı rapor sorgularını hızlandırır ama veri REFRESH edilene kadar bayattır. Tuzak: REFRESH MATERIALIZED VIEW okumaları kilitler; kilitsiz yenileme için CONCURRENTLY kullanın, bu da görünüm üzerinde bir UNIQUE indeks gerektirir. MySQL materialized view'i yerleşik olarak desteklemez.",
  "code": "CREATE MATERIALIZED VIEW aylik_ozet AS\nSELECT date_trunc('month', tarih) AS ay,\n       SUM(tutar) AS toplam\nFROM siparisler\nGROUP BY 1;\n\n-- CONCURRENTLY için zorunlu olan unique indeks\nCREATE UNIQUE INDEX idx_aylik_ozet_ay ON aylik_ozet (ay);\n\n-- Okumaları engellemeden yenile\nREFRESH MATERIALIZED VIEW CONCURRENTLY aylik_ozet;",
  "weight": 1.0
 },
 {
  "id": "webperf-a11y-neden-wcag",
  "cat": "Erişilebilirlik & Performans",
  "q": "erişilebilirlik accessibility a11y nedir neden WCAG standart POUR ilkeler engelli kullanıcı web kapsayıcılık uyumluluk",
  "title": "Web erişilebilirliği neden önemli ve WCAG nedir?",
  "a": "Erişilebilirlik (a11y), engelli kullanıcılar dahil herkesin web içeriğini algılayıp kullanabilmesini sağlar; ayrıca SEO'ya ve genel kullanılabilirliğe de katkı sunar. WCAG (Web Content Accessibility Guidelines), W3C'nin yayınladığı uluslararası standarttır ve dört ilkeye dayanır: Algılanabilir, Çalıştırılabilir, Anlaşılabilir, Sağlam (POUR). Uyum seviyeleri A, AA ve AAA'dır; çoğu yasal düzenleme AA seviyesini hedefler. Yaygın tuzak: erişilebilirliği projenin sonunda 'eklenecek özellik' sanmaktır; en baştan semantik HTML ile tasarlamak çok daha ucuzdur.",
  "code": "<!-- Semantik HTML, erişilebilirliğin temelidir -->\n<header>\n  <nav aria-label=\"Ana menü\">\n    <ul>\n      <li><a href=\"/\">Anasayfa</a></li>\n    </ul>\n  </nav>\n</header>\n<main>\n  <h1>Sayfanın tek ve açıklayıcı başlığı</h1>\n</main>",
  "weight": 1.0
 },
 {
  "id": "webperf-alt-metin",
  "cat": "Erişilebilirlik & Performans",
  "q": "alt metin alt text görsel resim image açıklama ekran okuyucu dekoratif alt attribute yazma kuralları",
  "title": "Alt metinlerini doğru yazma",
  "a": "Alt metni, görselin bağlam içindeki işlevini ve anlamını kısaca aktarmalıdır; 'resim' veya 'fotoğraf' gibi kelimelerle başlamak gereksizdir çünkü ekran okuyucu zaten görsel olduğunu söyler. Tamamen dekoratif görsellere boş alt (alt=\"\") verilir; böylece ekran okuyucu onları atlar. Yaygın tuzak: alt özniteliğini tamamen kaldırmaktır; bu durumda bazı ekran okuyucular dosya adını okur. Bağlantı içindeki görselin alt metni, bağlantının hedefini anlatmalıdır.",
  "code": "<!-- Bilgi taşıyan görsel: işlevi anlatan alt metin -->\n<img src=\"grafik.png\" alt=\"2025 satışları %40 arttı: çubuk grafik\">\n\n<!-- Dekoratif görsel: boş alt ile ekran okuyucudan gizlenir -->\n<img src=\"sus-cizgisi.svg\" alt=\"\">\n\n<!-- Bağlantı içindeki görsel: hedefi anlatır -->\n<a href=\"/anasayfa\">\n  <img src=\"logo.svg\" alt=\"Anasayfaya git\">\n</a>",
  "weight": 1.0
 },
 {
  "id": "webperf-klavye-focus",
  "cat": "Erişilebilirlik & Performans",
  "q": "klavye navigasyon keyboard navigation focus odak yönetimi tabindex focus-visible skip link modal tab tuşu",
  "title": "Klavye navigasyonu ve focus yönetimi",
  "a": "Tüm etkileşimli öğeler yalnızca klavyeyle (Tab, Enter, Space, ok tuşları) kullanılabilir olmalıdır; button ve a gibi doğal öğeler bunu ücretsiz sağlar. Odak göstergesini asla tamamen kaldırmayın (outline: none tuzağı); bunun yerine :focus-visible ile özelleştirin. Modal açıldığında odak modala taşınmalı, kapanınca tetikleyen öğeye geri dönmelidir. tabindex=\"0\" öğeyi doğal sıraya ekler, pozitif tabindex değerlerinden kaçının çünkü sıralamayı bozar.",
  "code": "/* Odak halkasını kaldırma, özelleştir */\nbutton:focus-visible {\n  outline: 3px solid #1a73e8;\n  outline-offset: 2px;\n}\n\n// Modal kapanınca odağı tetikleyiciye geri ver\nconst acButonu = document.querySelector('#ac');\nfunction modalKapat(modal) {\n  modal.close();\n  acButonu.focus(); // odak kaybolmasın\n}",
  "weight": 1.0
 },
 {
  "id": "webperf-aria-ne-zaman",
  "cat": "Erişilebilirlik & Performans",
  "q": "ARIA nedir ne zaman role aria-label aria-hidden ilk kural semantik HTML native element live region",
  "title": "ARIA ne zaman kullanılır? İlk kural: kullanma",
  "a": "ARIA'nın ilk kuralı şudur: eşdeğer semantik bir HTML öğesi varsa ARIA yerine onu kullanın; <div role=\"button\"> yerine <button> hem odaklanmayı hem klavye desteğini otomatik sağlar. ARIA yalnızca görünürlük ve isim gibi bilgileri ekler; davranış (klavye, odak) eklemez, bunları kendiniz yazmanız gerekir. Kötü ARIA, hiç ARIA olmamasından daha zararlıdır. Meşru kullanım alanları: dinamik bildirimler için aria-live, özel bileşenlerde durum (aria-expanded) ve görünmez etiketler (aria-label).",
  "code": "<!-- YANLIŞ: davranışı elle eklemek gerekir -->\n<div role=\"button\" tabindex=\"0\">Kaydet</div>\n\n<!-- DOĞRU: native öğe her şeyi sağlar -->\n<button>Kaydet</button>\n\n<!-- Meşru ARIA: dinamik durum bildirimi -->\n<button aria-expanded=\"false\" aria-controls=\"menu\">Menü</button>\n<div id=\"durum\" aria-live=\"polite\"></div>",
  "weight": 1.0
 },
 {
  "id": "webperf-renk-kontrasti",
  "cat": "Erişilebilirlik & Performans",
  "q": "renk kontrastı color contrast ratio WCAG AA AAA 4.5:1 oran metin arka plan okunabilirlik renk körlüğü",
  "title": "Renk kontrastı ve WCAG oranları",
  "a": "WCAG AA seviyesi, normal boyutlu metin için en az 4.5:1, büyük metin (18pt ya da 14pt kalın ve üzeri) için 3:1 kontrast oranı ister; AAA seviyesinde bu oranlar 7:1 ve 4.5:1'e çıkar. Simge ve form kenarlığı gibi grafik öğeler için de 3:1 gerekir. Yaygın tuzak: bilgiyi yalnızca renkle iletmektir (ör. hatayı sadece kırmızıyla göstermek); renk körü kullanıcılar için metin veya simge de ekleyin. Kontrastı DevTools veya çevrimiçi kontrast hesaplayıcılarla ölçebilirsiniz.",
  "code": "/* Yetersiz: açık gri metin beyaz zeminde ~2.8:1 */\n.kotu { color: #999999; background: #ffffff; }\n\n/* AA uyumlu: #595959 beyaz zeminde ~7:1 */\n.iyi { color: #595959; background: #ffffff; }\n\n/* Hata sadece renkle değil, metinle de iletilir */\n.hata::before { content: \"Hata: \"; font-weight: bold; }",
  "weight": 1.0
 },
 {
  "id": "webperf-ekran-okuyucu",
  "cat": "Erişilebilirlik & Performans",
  "q": "ekran okuyucu screen reader NVDA VoiceOver JAWS TalkBack landmark başlık heading navigasyon accessibility tree",
  "title": "Ekran okuyucu temelleri",
  "a": "Ekran okuyucular (NVDA, JAWS, VoiceOver, TalkBack) sayfayı görsel düzenden değil, tarayıcının oluşturduğu erişilebilirlik ağacından okur; bu yüzden semantik HTML kritiktir. Kullanıcılar sayfada çoğunlukla başlıklar (h1-h6) ve landmark bölgeleri (main, nav, header) arasında atlayarak gezinir; bu nedenle başlık hiyerarşisini atlamadan kurun. display:none ve visibility:hidden içeriği ekran okuyucudan da gizler; yalnızca görsel olarak gizlemek için 'visually-hidden' (sr-only) tekniği kullanılır.",
  "code": "/* Görsel olarak gizli ama ekran okuyucuya açık */\n.sr-only {\n  position: absolute;\n  width: 1px; height: 1px;\n  padding: 0; margin: -1px;\n  overflow: hidden;\n  clip-path: inset(50%);\n  white-space: nowrap;\n}\n/* Kullanım: <span class=\"sr-only\">Sepet: 3 ürün</span> */",
  "weight": 1.0
 },
 {
  "id": "webperf-core-web-vitals",
  "cat": "Erişilebilirlik & Performans",
  "q": "Core Web Vitals LCP CLS INP nedir metrik performans ölçüm Google FID largest contentful paint layout shift",
  "title": "Core Web Vitals: LCP, CLS, INP",
  "a": "Core Web Vitals, Google'ın kullanıcı deneyimini ölçen üç ana metriğidir: LCP (en büyük içerik boyaması, yükleme hızı, iyi eşik ≤2.5 sn), CLS (kümülatif düzen kayması, görsel kararlılık, iyi eşik ≤0.1) ve INP (etkileşimden sonraki boyama, tepkisellik, iyi eşik ≤200 ms). INP, Mart 2024'te FID'in yerini almıştır. Eşikler, gerçek kullanıcı verilerinin 75. yüzdelik dilimine göre değerlendirilir. Yaygın tuzak: yalnızca laboratuvar (Lighthouse) verisine bakmaktır; alan verisi (CrUX, web-vitals kütüphanesi) gerçek deneyimi yansıtır.",
  "code": "// npm install web-vitals — gerçek kullanıcı ölçümü (RUM)\nimport { onLCP, onCLS, onINP } from 'web-vitals';\n\nfunction raporla(metrik) {\n  // Metrik değerini analitik servisine gönder\n  navigator.sendBeacon('/analitik', JSON.stringify({\n    ad: metrik.name, deger: metrik.value,\n  }));\n}\nonLCP(raporla);\nonCLS(raporla);\nonINP(raporla);",
  "weight": 1.0
 },
 {
  "id": "webperf-gorsel-optimizasyon",
  "cat": "Erişilebilirlik & Performans",
  "q": "görsel optimizasyon image lazy loading srcset sizes WebP AVIF responsive resim boyut format picture",
  "title": "Görsel optimizasyonu: lazy loading, srcset, modern formatlar",
  "a": "Görseller çoğu sayfanın en ağır kaynağıdır. loading=\"lazy\" ile ekran dışı görselleri geç yükleyin; ancak LCP görseline lazy uygulamak yaygın bir tuzaktır ve yüklemeyi geciktirir, ona fetchpriority=\"high\" verin. srcset ve sizes ile tarayıcının ekrana uygun boyutu seçmesini sağlayın. AVIF ve WebP, JPEG'e göre belirgin biçimde küçüktür; picture öğesiyle eski tarayıcılara geriye dönük uyumluluk sunulur. width ve height belirtmek CLS'yi önler.",
  "code": "<picture>\n  <source type=\"image/avif\" srcset=\"foto.avif\">\n  <source type=\"image/webp\" srcset=\"foto.webp\">\n  <img src=\"foto.jpg\"\n       srcset=\"foto-480.jpg 480w, foto-1024.jpg 1024w\"\n       sizes=\"(max-width: 600px) 480px, 1024px\"\n       width=\"1024\" height=\"683\"\n       loading=\"lazy\"\n       alt=\"Boğaz manzarası\">\n</picture>",
  "weight": 1.0
 },
 {
  "id": "webperf-js-bundle",
  "cat": "Erişilebilirlik & Performans",
  "q": "JavaScript bundle küçültme code splitting tree shaking dynamic import minify boyut webpack vite optimizasyon",
  "title": "JS bundle küçültme: code splitting ve tree shaking",
  "a": "Büyük JavaScript paketleri hem indirmeyi hem de ayrıştırma/çalıştırma süresini uzatarak INP'yi kötüleştirir. Code splitting, dinamik import() ile kodu rota veya etkileşim bazında parçalara ayırır; kullanıcı yalnızca gereken kısmı indirir. Tree shaking, ES modül sözdizimi (import/export) sayesinde kullanılmayan kodu paketten atar; bu yüzden 'import * as' yerine adlandırılmış import tercih edin. Yaygın tuzak: tüm kütüphaneyi tek fonksiyon için içe aktarmaktır (ör. lodash'in tamamı).",
  "code": "// Tree shaking dostu: yalnızca gerekeni al\nimport { debounce } from 'lodash-es'; // tamamı değil\n\n// Code splitting: ağır modülü ihtiyaç anında yükle\nconst buton = document.querySelector('#grafik-ac');\nbuton.addEventListener('click', async () => {\n  const { grafikCiz } = await import('./grafik.js');\n  grafikCiz(); // ayrı chunk olarak indirildi\n});",
  "weight": 1.0
 },
 {
  "id": "webperf-kritik-render-yolu",
  "cat": "Erişilebilirlik & Performans",
  "q": "kritik render yolu critical rendering path CSS render blocking defer async preload ilk boyama FCP",
  "title": "Kritik render yolu",
  "a": "Tarayıcı, sayfayı çizmeden önce HTML'i ayrıştırıp DOM'u, CSS'i ayrıştırıp CSSOM'u kurar; head içindeki CSS render'ı, sıradan script'ler ise ayrıştırmayı engeller. İlk boyamayı hızlandırmak için ekran üstü (above-the-fold) kritik CSS'i inline verin, kalanını sonradan yükleyin. Script'lerde defer, HTML ayrıştırmasını engellemez ve sırayı korur; async ise indikten hemen sonra çalışır ve sıra garantisi vermez. Kritik kaynakları link rel=\"preload\" ile öne çekebilirsiniz.",
  "code": "<head>\n  <!-- Kritik CSS inline: render'ı bloklamaz -->\n  <style>body{margin:0;font-family:sans-serif}</style>\n\n  <!-- Kritik kaynağı öne çek -->\n  <link rel=\"preload\" href=\"kahraman.avif\" as=\"image\">\n\n  <!-- defer: ayrıştırmayı engellemez, DOM hazırken sırayla çalışır -->\n  <script src=\"uygulama.js\" defer></script>\n</head>",
  "weight": 1.0
 },
 {
  "id": "webperf-font-yukleme",
  "cat": "Erişilebilirlik & Performans",
  "q": "font yükleme web font FOUT FOIT font-display swap preload woff2 yazı tipi strateji görünmez metin",
  "title": "Font yükleme stratejileri: FOUT ve FOIT",
  "a": "FOIT (görünmez metin parlaması), tarayıcının web fontu inene kadar metni hiç göstermemesidir; FOUT (stilsiz metin parlaması) ise önce sistem fontuyla gösterip sonra değiştirmesidir. font-display: swap FOUT davranışı sağlar ve metnin hep okunabilir kalmasını garantiler; genellikle önerilen budur. Kritik fontu preload ile erken indirerek değişim anını kısaltabilirsiniz. Yaygın tuzak: font değişince satır kaymaları (CLS); size-adjust veya benzer metrikli yedek font ile azaltılır. Modern tarayıcılarda yalnızca woff2 sunmak yeterlidir.",
  "code": "<link rel=\"preload\" href=\"/font/inter.woff2\"\n      as=\"font\" type=\"font/woff2\" crossorigin>\n<style>\n@font-face {\n  font-family: 'Inter';\n  src: url('/font/inter.woff2') format('woff2');\n  /* swap: font inene kadar sistem fontu görünür (FOUT) */\n  font-display: swap;\n}\nbody { font-family: 'Inter', system-ui, sans-serif; }\n</style>",
  "weight": 1.0
 },
 {
  "id": "webperf-cache-basliklari",
  "cat": "Erişilebilirlik & Performans",
  "q": "cache önbellek Cache-Control ETag max-age immutable no-cache no-store HTTP başlık header 304 doğrulama",
  "title": "Önbellek başlıkları: Cache-Control ve ETag",
  "a": "Cache-Control, kaynağın ne kadar süre önbellekte tutulacağını belirler: max-age saniye cinsinden süre verir, immutable içeriğin hiç değişmeyeceğini bildirir ve dosya adında hash olan varlıklar için idealdir. no-cache 'önbelleğe alma' demek değildir; her kullanımda sunucuyla doğrulama zorunluluğu getirir, hiç saklamamak için no-store gerekir (yaygın tuzak). ETag, içeriğin parmak izidir; tarayıcı If-None-Match ile sorar, içerik değişmemişse sunucu gövdesiz 304 döner ve bant genişliği kazanılır.",
  "code": "# Hash'li statik varlıklar: 1 yıl, değişmez\nCache-Control: public, max-age=31536000, immutable\n\n# HTML: her seferinde sunucuyla doğrula\nCache-Control: no-cache\nETag: \"a1b2c3\"\n\n# İstemci tekrar sorar, değişmediyse 304 döner\nIf-None-Match: \"a1b2c3\"\n# → HTTP/1.1 304 Not Modified (gövde yok)",
  "weight": 1.0
 },
 {
  "id": "webperf-lighthouse",
  "cat": "Erişilebilirlik & Performans",
  "q": "Lighthouse ölçüm audit performans skor CLI DevTools lab data denetim rapor accessibility SEO",
  "title": "Lighthouse ile performans ve erişilebilirlik ölçümü",
  "a": "Lighthouse, Chrome DevTools'ta ve komut satırında çalışan bir denetim aracıdır; performans, erişilebilirlik, en iyi uygulamalar ve SEO kategorilerinde 0-100 arası puan üretir. Laboratuvar (lab) verisi ürettiği için sonuçlar donanıma ve ağa göre değişir; birkaç kez çalıştırıp medyanı almak sağlıklıdır. Yaygın tuzak: erişilebilirlik puanı 100 olsa bile sitenin tamamen erişilebilir olduğunu sanmak; otomatik testler sorunların ancak bir kısmını yakalar, elle klavye ve ekran okuyucu testi şarttır.",
  "code": "# Kurulum ve mobil emülasyonla denetim\nnpm install -g lighthouse\nlighthouse https://ornek.dev \\\n  --output=html --output-path=./rapor.html\n\n# Sadece performans kategorisi, masaüstü profili\nlighthouse https://ornek.dev \\\n  --only-categories=performance --preset=desktop\n\n# CI için: npm install -g @lhci/cli && lhci autorun",
  "weight": 1.0
 },
 {
  "id": "webperf-raf-jank",
  "cat": "Erişilebilirlik & Performans",
  "q": "requestAnimationFrame jank animasyon 60fps akıcılık main thread frame kare düşmesi setInterval scroll performans",
  "title": "requestAnimationFrame ve jank",
  "a": "Jank, ana iş parçacığındaki uzun görevler yüzünden tarayıcının 60 fps için gereken ~16.7 ms'lik kare bütçesini aşması ve animasyonun takılmasıdır. requestAnimationFrame, kodunuzu tarayıcının bir sonraki boyamasından hemen önce, ekranın yenileme hızıyla eşitlenmiş şekilde çalıştırır; animasyon için setInterval/setTimeout yerine daima bunu kullanın. Yaygın tuzak: her karede layout okuma ve yazma işlemlerini karıştırıp zorunlu senkron layout (layout thrashing) tetiklemektir. Mümkünse yalnızca transform ve opacity anime edin; bunlar layout tetiklemez.",
  "code": "// Akıcı animasyon: rAF + transform (layout tetiklemez)\nconst kutu = document.querySelector('.kutu');\nlet baslangic = null;\n\nfunction adim(zaman) {\n  if (baslangic === null) baslangic = zaman;\n  const gecen = zaman - baslangic;\n  const x = Math.min(gecen / 10, 300); // 3 sn'de 300px\n  kutu.style.transform = `translateX(${x}px)`;\n  if (x < 300) requestAnimationFrame(adim);\n}\nrequestAnimationFrame(adim);",
  "weight": 1.0
 }
];
