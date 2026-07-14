/* MDN CC0 verisinden Vega referans paketi + MIT kaynaklardan kod derlemi üretir */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import path from 'path';

const DL = '/tmp/claude-0/-home-user-ai/863f620e-290f-5ee3-92cb-5b31caac130e/scratchpad/dl';
const OUT = '/home/user/ai/js';

/* ==================== 1) REFERANS PAKETİ ==================== */
const bcd = JSON.parse(readFileSync(`${DL}/mdn-browser-compat-data-5.6.28/data.json`, 'utf8'));
const cssData = JSON.parse(readFileSync(`${DL}/mdn-data-2.9.0/css/properties.json`, 'utf8'));

const entries = [];

function ver(s) {
  if (!s) return null;
  const sup = Array.isArray(s) ? s[0] : s;
  const v = sup.version_added;
  if (v === true) return 'evet';
  if (typeof v === 'string') return v.replace('≤', '');
  return null;
}

function supportLine(support, extra = []) {
  if (!support) return '';
  const rows = [['Chrome', 'chrome'], ['Firefox', 'firefox'], ['Safari', 'safari'], ['Edge', 'edge'], ...extra];
  const parts = [];
  for (const [label, key] of rows) {
    const v = ver(support[key]);
    if (v) parts.push(v === 'evet' ? label : `${label} ${v}+`);
  }
  return parts.length ? `Tarayıcı desteği: ${parts.join(', ')}.` : '';
}

function statusLine(st) {
  if (!st) return 'Durum: standart.';
  if (st.deprecated) return '⚠️ Durum: KULLANIMDAN KALDIRILDI — yeni projelerde kullanmayın.';
  if (st.experimental) return '🧪 Durum: deneysel — tarayıcı desteğini kontrol edin.';
  return st.standard_track ? 'Durum: standart.' : 'Durum: standart dışı.';
}

function mdnLine(c) {
  return c && c.mdn_url ? `Dokümantasyon: ${c.mdn_url}` : '';
}

function camelWords(s) {
  return s.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_.-]/g, ' ').toLowerCase();
}

function push(e) {
  const a = e.a.filter(Boolean).join('\n');
  entries.push({ id: e.id, cat: e.cat, q: e.q, title: e.title, a, code: e.code || null, weight: e.w ?? 0.85 });
}

/* --- CSS özellikleri (mdn-data + BCD) --- */
const INHERIT_TR = { true: 'evet', false: 'hayır' };
for (const [name, p] of Object.entries(cssData)) {
  if (name.startsWith('--')) continue;
  const c = bcd.css.properties[name]?.__compat;
  push({
    id: `ref-css-${name}`,
    cat: 'Referans/CSS',
    q: `css ${name} ${name.split('-').join(' ')} özellik stil property`,
    title: `CSS: ${name}`,
    a: [
      `CSS özelliği. Söz dizimi: ${p.syntax || '—'}`,
      `Başlangıç değeri: ${typeof p.initial === 'string' ? p.initial : '—'} · Kalıtım: ${INHERIT_TR[p.inherited] ?? '—'}`,
      statusLine(c?.status), supportLine(c?.support), mdnLine(c)
    ],
    code: `.eleman {\n  ${name}: ${typeof p.initial === 'string' && p.initial.length < 30 ? p.initial : 'değer'};\n}`
  });
}

/* --- JavaScript yerleşikleri (BCD, alt özelliklerle) --- */
for (const [obj, tree] of Object.entries(bcd.javascript.builtins)) {
  for (const [sub, node] of Object.entries(tree)) {
    const isRoot = sub === '__compat';
    const c = isRoot ? node : node.__compat;
    if (!c) continue;
    const feat = isRoot ? obj : `${obj}.${sub}`;
    const label = isRoot ? obj : `${obj}.${sub}()`;
    push({
      id: `ref-js-${feat}`,
      cat: 'Referans/JavaScript',
      q: `javascript js ${camelWords(obj)} ${isRoot ? '' : camelWords(sub)} yerleşik builtin metot`,
      title: `JavaScript: ${label}`,
      a: [
        `Yerleşik JavaScript ${isRoot ? 'nesnesi' : 'özelliği/metodu'}.`,
        statusLine(c.status),
        supportLine(c.support, [['Node.js', 'nodejs'], ['Deno', 'deno']]),
        mdnLine(c)
      ]
    });
  }
}

/* --- Web API arayüzleri + üyeleri (BCD) --- */
for (const [name, tree] of Object.entries(bcd.api)) {
  const c = tree.__compat;
  if (c) {
    push({
      id: `ref-api-${name}`,
      cat: 'Referans/WebAPI',
      q: `web api ${camelWords(name)} tarayıcı arayüz interface`,
      title: `Web API: ${name}`,
      a: [`Tarayıcı Web API arayüzü.`, statusLine(c.status), supportLine(c.support), mdnLine(c)]
    });
  }
  for (const [member, node] of Object.entries(tree)) {
    if (member === '__compat' || !node.__compat) continue;
    const mc = node.__compat;
    const isEvent = member.endsWith('_event');
    const label = isEvent ? `${name}: ${member.replace(/_event$/, '')} olayı`
                          : `${name}.${member}`;
    push({
      id: `ref-api-${name}-${member}`,
      w: 0.75,
      cat: 'Referans/WebAPI',
      q: `web api ${camelWords(name)} ${camelWords(member.replace(/_event$/, ''))} ${isEvent ? 'olay event' : 'metot özellik'}`,
      title: `Web API: ${label}`,
      a: [
        isEvent ? `${name} arayüzünün olayı.` : `${name} arayüzünün üyesi.`,
        statusLine(mc.status), supportLine(mc.support), mdnLine(mc)
      ]
    });
  }
}

/* --- CSS seçicileri ve at-kuralları (BCD) --- */
for (const [group, catName, qWord] of [
  ['selectors', 'Referans/CSS', 'seçici selector'],
  ['at-rules', 'Referans/CSS', 'at kural rule']
]) {
  for (const [name, tree] of Object.entries(bcd.css[group] || {})) {
    const c = tree.__compat;
    if (!c) continue;
    push({
      id: `ref-css-${group}-${name}`,
      cat: catName,
      q: `css ${qWord} ${camelWords(name)}`,
      title: `CSS ${group === 'selectors' ? 'Seçici' : 'Kural'}: ${group === 'at-rules' ? '@' : ''}${name}`,
      a: [
        group === 'selectors' ? 'CSS seçicisi.' : 'CSS at-kuralı.',
        statusLine(c.status), supportLine(c.support), mdnLine(c)
      ]
    });
  }
}

/* --- SVG elemanları --- */
for (const [name, tree] of Object.entries(bcd.svg.elements || {})) {
  const c = tree.__compat;
  if (!c) continue;
  push({
    id: `ref-svg-${name}`,
    cat: 'Referans/SVG',
    q: `svg ${camelWords(name)} eleman element grafik`,
    title: `SVG: <${name}>`,
    a: [`SVG elemanı.`, statusLine(c.status), supportLine(c.support), mdnLine(c)],
    code: `<svg><${name}>…</${name}></svg>`
  });
}

/* --- JavaScript operatör, deyim ve sınıf özellikleri --- */
for (const [group, label] of [
  ['operators', 'Operatör'], ['statements', 'Deyim'],
  ['classes', 'Sınıf özelliği'], ['functions', 'Fonksiyon özelliği']
]) {
  for (const [name, tree] of Object.entries(bcd.javascript[group] || {})) {
    const c = tree.__compat;
    if (!c) continue;
    push({
      id: `ref-js-${group}-${name}`,
      cat: 'Referans/JavaScript',
      q: `javascript js ${camelWords(name)} ${label.toLowerCase()} sözdizimi syntax`,
      title: `JavaScript ${label}: ${camelWords(name)}`,
      a: [`JavaScript dil özelliği (${label.toLowerCase()}).`,
          statusLine(c.status),
          supportLine(c.support, [['Node.js', 'nodejs'], ['Deno', 'deno']]),
          mdnLine(c)]
    });
  }
}

/* --- HTML elemanları --- */
for (const [name, tree] of Object.entries(bcd.html.elements)) {
  const c = tree.__compat;
  if (!c) continue;
  const attrs = Object.keys(tree).filter(k => k !== '__compat').slice(0, 12);
  push({
    id: `ref-html-${name}`,
    cat: 'Referans/HTML',
    q: `html ${name} eleman etiket element tag`,
    title: `HTML: <${name}>`,
    a: [
      `HTML elemanı.`,
      attrs.length ? `Belgelenmiş öznitelikler: ${attrs.join(', ')}.` : '',
      statusLine(c.status), supportLine(c.support), mdnLine(c)
    ],
    code: `<${name}>…</${name}>`
  });
}

/* --- HTTP başlıkları (yönergeleriyle) ve metodları --- */
for (const [name, tree] of Object.entries(bcd.http.headers)) {
  const c = tree.__compat;
  if (c) {
    push({
      id: `ref-http-${name}`,
      cat: 'Referans/HTTP',
      q: `http başlık header ${camelWords(name)}`,
      title: `HTTP Başlığı: ${name}`,
      a: [`HTTP başlığı.`, statusLine(c.status), supportLine(c.support), mdnLine(c)],
      code: `${name}: <değer>`
    });
  }
  for (const [dir, node] of Object.entries(tree)) {
    if (dir === '__compat' || !node.__compat) continue;
    const dc = node.__compat;
    push({
      id: `ref-http-${name}-${dir}`,
      w: 0.75,
      cat: 'Referans/HTTP',
      q: `http başlık header ${camelWords(name)} ${camelWords(dir)} yönerge directive`,
      title: `HTTP: ${name} → ${dir}`,
      a: [`${name} başlığının yönergesi/değeri.`, statusLine(dc.status),
          supportLine(dc.support), mdnLine(dc)]
    });
  }
}
for (const [name, tree] of Object.entries(bcd.http.methods || {})) {
  const c = tree.__compat;
  if (!c) continue;
  push({
    id: `ref-http-method-${name}`,
    cat: 'Referans/HTTP',
    q: `http metod method istek request ${camelWords(name)}`,
    title: `HTTP Metodu: ${name}`,
    a: [`HTTP istek metodu.`, statusLine(c.status), supportLine(c.support), mdnLine(c)],
    code: `${name} /kaynak HTTP/1.1`
  });
}

/* --- HTML element öznitelikleri + global öznitelikler --- */
for (const [elem, tree] of Object.entries(bcd.html.elements)) {
  for (const [attr, node] of Object.entries(tree)) {
    if (attr === '__compat' || !node.__compat) continue;
    const c = node.__compat;
    push({
      id: `ref-html-${elem}-${attr}`,
      w: 0.75,
      cat: 'Referans/HTML',
      q: `html ${elem} ${camelWords(attr)} öznitelik attribute`,
      title: `HTML: <${elem}> özniteliği: ${attr}`,
      a: [`<${elem}> elemanının özniteliği.`, statusLine(c.status),
          supportLine(c.support), mdnLine(c)],
      code: `<${elem} ${attr}="…">`
    });
  }
}
for (const [attr, tree] of Object.entries(bcd.html.global_attributes || {})) {
  const c = tree.__compat;
  if (!c) continue;
  push({
    id: `ref-html-global-${attr}`,
    cat: 'Referans/HTML',
    q: `html global öznitelik attribute ${camelWords(attr)}`,
    title: `HTML Global Öznitelik: ${attr}`,
    a: [`Tüm HTML elemanlarında kullanılabilen global öznitelik.`,
        statusLine(c.status), supportLine(c.support), mdnLine(c)],
    code: `<div ${attr}="…">`
  });
}

/* --- CSS özellik değerleri (alt özellikler) ve veri türleri --- */
for (const [prop, tree] of Object.entries(bcd.css.properties)) {
  for (const [val, node] of Object.entries(tree)) {
    if (val === '__compat' || !node.__compat) continue;
    const c = node.__compat;
    push({
      id: `ref-cssv-${prop}-${val}`,
      w: 0.75,
      cat: 'Referans/CSS',
      q: `css ${prop.split('-').join(' ')} ${camelWords(val)} değer value`,
      title: `CSS: ${prop} değeri: ${val}`,
      a: [`${prop} özelliğinin değeri/alt özelliği.`, statusLine(c.status),
          supportLine(c.support), mdnLine(c)]
    });
  }
}
for (const [name, tree] of Object.entries(bcd.css.types || {})) {
  const c = tree.__compat;
  if (!c) continue;
  push({
    id: `ref-csst-${name}`,
    cat: 'Referans/CSS',
    q: `css veri türü tip type fonksiyon ${camelWords(name)}`,
    title: `CSS Veri Türü: <${name}>`,
    a: [`CSS veri türü / fonksiyonel gösterim.`, statusLine(c.status),
        supportLine(c.support), mdnLine(c)]
  });
}

/* --- SVG eleman öznitelikleri, MathML, JS derinlik-3, at-kural yönergeleri --- */
for (const [elem, tree] of Object.entries(bcd.svg.elements || {})) {
  for (const [attr, node] of Object.entries(tree)) {
    if (attr === '__compat' || !node.__compat) continue;
    const c = node.__compat;
    push({
      id: `ref-svg-${elem}-${attr}`,
      w: 0.75,
      cat: 'Referans/SVG',
      q: `svg ${elem} ${camelWords(attr)} öznitelik attribute`,
      title: `SVG: <${elem}> özniteliği: ${attr}`,
      a: [`<${elem}> SVG elemanının özniteliği.`, statusLine(c.status),
          supportLine(c.support), mdnLine(c)]
    });
  }
}
for (const [name, tree] of Object.entries(bcd.mathml?.elements || {})) {
  const c = tree.__compat;
  if (!c) continue;
  push({
    id: `ref-mathml-${name}`,
    cat: 'Referans/MathML',
    q: `mathml matematik ${camelWords(name)} eleman element`,
    title: `MathML: <${name}>`,
    a: [`MathML (matematiksel işaretleme) elemanı.`, statusLine(c.status),
        supportLine(c.support), mdnLine(c)],
    code: `<math><${name}>…</${name}></math>`
  });
}
for (const [obj, tree] of Object.entries(bcd.javascript.builtins)) {
  for (const [sub, node] of Object.entries(tree)) {
    if (sub === '__compat') continue;
    for (const [leaf, leafNode] of Object.entries(node)) {
      if (leaf === '__compat' || !leafNode.__compat) continue;
      const c = leafNode.__compat;
      push({
        id: `ref-js-${obj}-${sub}-${leaf}`,
      w: 0.75,
        cat: 'Referans/JavaScript',
        q: `javascript js ${camelWords(obj)} ${camelWords(sub)} ${camelWords(leaf)} parametre seçenek`,
        title: `JavaScript: ${obj}.${sub} → ${camelWords(leaf)}`,
        a: [`${obj}.${sub} özelliğinin alt özelliği/parametresi.`,
            statusLine(c.status),
            supportLine(c.support, [['Node.js', 'nodejs'], ['Deno', 'deno']]),
            mdnLine(c)]
      });
    }
  }
}
for (const [rule, tree] of Object.entries(bcd.css['at-rules'] || {})) {
  for (const [desc, node] of Object.entries(tree)) {
    if (desc === '__compat' || !node.__compat) continue;
    const c = node.__compat;
    push({
      id: `ref-cssat-${rule}-${desc}`,
      w: 0.75,
      cat: 'Referans/CSS',
      q: `css at kural rule @${rule} ${camelWords(desc)} yönerge descriptor`,
      title: `CSS: @${rule} → ${desc}`,
      a: [`@${rule} kuralının yönergesi/özelliği.`, statusLine(c.status),
          supportLine(c.support), mdnLine(c)]
    });
  }
}

/* --- SVG öznitelikleri + WebAssembly API --- */
for (const [attr, tree] of Object.entries(bcd.svg.global_attributes || {})) {
  const c = tree.__compat;
  if (!c) continue;
  push({
    id: `ref-svga-${attr}`,
    cat: 'Referans/SVG',
    q: `svg öznitelik attribute ${camelWords(attr)}`,
    title: `SVG Özniteliği: ${attr}`,
    a: [`SVG global özniteliği.`, statusLine(c.status), supportLine(c.support), mdnLine(c)]
  });
}
for (const [name, tree] of Object.entries(bcd.webassembly?.api || {})) {
  const c = tree.__compat;
  if (!c) continue;
  push({
    id: `ref-wasm-${name}`,
    cat: 'Referans/WebAssembly',
    q: `webassembly wasm ${camelWords(name)} api`,
    title: `WebAssembly: ${name}`,
    a: [`WebAssembly API özelliği.`, statusLine(c.status), supportLine(c.support), mdnLine(c)]
  });
}

/* --- Web API derinlik-3 (üye alt özellikleri/seçenekleri) --- */
for (const [name, tree] of Object.entries(bcd.api)) {
  for (const [member, node] of Object.entries(tree)) {
    if (member === '__compat') continue;
    for (const [leaf, leafNode] of Object.entries(node)) {
      if (leaf === '__compat' || !leafNode.__compat) continue;
      const c = leafNode.__compat;
      push({
        id: `ref-api-${name}-${member}-${leaf}`,
      w: 0.75,
        cat: 'Referans/WebAPI',
        q: `web api ${camelWords(name)} ${camelWords(member)} ${camelWords(leaf.replace(/_event$/, ''))} seçenek parametre`,
        title: `Web API: ${name}.${member} → ${camelWords(leaf)}`,
        a: [`${name}.${member} üyesinin alt özelliği/seçeneği.`,
            statusLine(c.status), supportLine(c.support), mdnLine(c)]
      });
    }
  }
}

/* --- Tarayıcı sürüm tarihçesi (BCD browsers) --- */
const BROWSER_TR = {
  chrome: 'Chrome', chrome_android: 'Chrome (Android)', edge: 'Edge',
  firefox: 'Firefox', firefox_android: 'Firefox (Android)', safari: 'Safari',
  safari_ios: 'Safari (iOS)', opera: 'Opera', ie: 'Internet Explorer',
  nodejs: 'Node.js', deno: 'Deno', samsunginternet_android: 'Samsung Internet'
};
for (const [bk, br] of Object.entries(bcd.browsers)) {
  const label = BROWSER_TR[bk];
  if (!label) continue;
  for (const [ver, rel] of Object.entries(br.releases || {})) {
    if (!rel.release_date) continue;
    push({
      id: `ref-rel-${bk}-${ver.replace(/[^\w.]/g, '_')}`,
      cat: 'Referans/Sürümler',
      q: `${camelWords(bk)} ${ver} sürüm version ne zaman çıktı tarih release`,
      title: `${label} ${ver}`,
      a: [
        `${label} sürüm ${ver} — yayın tarihi: ${rel.release_date}.` +
        (rel.status ? ` Durum: ${rel.status}.` : '') +
        (rel.engine ? ` Motor: ${rel.engine}${rel.engine_version ? ' ' + rel.engine_version : ''}.` : '')
      ]
    });
  }
}

/* --- Olgu paketi: HTTP durum kodları (RFC 9110) --- */
const HTTP_STATUS = [
  [100,'Continue','İstemci isteğin gövdesini göndermeye devam edebilir.'],
  [101,'Switching Protocols','Sunucu protokol değişimini (ör. WebSocket upgrade) kabul etti.'],
  [200,'OK','İstek başarılı; yanıt gövdesi sonucu içerir.'],
  [201,'Created','Yeni kaynak oluşturuldu; Location başlığı adresini verir.'],
  [202,'Accepted','İstek kabul edildi ama işlem henüz tamamlanmadı (asenkron işleme).'],
  [204,'No Content','Başarılı; dönecek gövde yok (ör. DELETE sonrası).'],
  [206,'Partial Content','Range isteğine kısmi içerik döndü (video akışı, kaldığı yerden indirme).'],
  [301,'Moved Permanently','Kaynak kalıcı olarak taşındı; tarayıcı ve arama motorları yeni adresi önbellekler.'],
  [302,'Found','Geçici yönlendirme; özgün adres kullanılmaya devam etmeli.'],
  [304,'Not Modified','İçerik değişmedi; istemci önbelleğindeki kopyayı kullanır (ETag/If-None-Match).'],
  [307,'Temporary Redirect','Geçici yönlendirme; metod ve gövde korunur (302 bazen GET\'e çevirir).'],
  [308,'Permanent Redirect','Kalıcı yönlendirme; metod ve gövde korunur.'],
  [400,'Bad Request','İstek bozuk: geçersiz sözdizimi, eksik/yanlış parametre.'],
  [401,'Unauthorized','Kimlik doğrulaması gerekli veya geçersiz (adı yanıltıcıdır: authentication).'],
  [403,'Forbidden','Kimlik doğrulandı ama bu kaynağa yetki yok (authorization).'],
  [404,'Not Found','Kaynak bulunamadı.'],
  [405,'Method Not Allowed','Bu kaynak bu HTTP metodunu desteklemiyor; Allow başlığı geçerli metodları listeler.'],
  [406,'Not Acceptable','Accept başlığındaki içerik türü üretilemiyor.'],
  [408,'Request Timeout','Sunucu isteği beklerken zaman aşımına uğradı.'],
  [409,'Conflict','İstek mevcut durumla çakışıyor (ör. sürüm çatışması, tekrar kayıt).'],
  [410,'Gone','Kaynak kalıcı olarak kaldırıldı (404\'ten farkı: bilinçli ve kalıcı).'],
  [411,'Length Required','Content-Length başlığı zorunlu.'],
  [412,'Precondition Failed','If-Match gibi koşul başarısız (iyimser kilitleme).'],
  [413,'Content Too Large','İstek gövdesi sunucu limitinden büyük.'],
  [415,'Unsupported Media Type','İstek gövdesinin içerik türü desteklenmiyor.'],
  [418,'I\'m a teapot','Şaka kodu (RFC 2324, 1 Nisan). Bazı API\'ler bot engellemede kullanır.'],
  [422,'Unprocessable Content','Sözdizimi doğru ama anlamsal doğrulama başarısız (form hataları için yaygın).'],
  [425,'Too Early','Sunucu yeniden oynatma (replay) riskli erken isteği işlemek istemiyor.'],
  [426,'Upgrade Required','İstemci başka protokole (ör. TLS) yükseltme yapmalı.'],
  [428,'Precondition Required','Sunucu koşullu istek (If-Match) zorunlu kılıyor — kayıp güncelleme koruması.'],
  [429,'Too Many Requests','Hız sınırı aşıldı; Retry-After başlığı bekleme süresini verir.'],
  [431,'Request Header Fields Too Large','Başlıklar çok büyük (genelde şişmiş çerezler).'],
  [451,'Unavailable For Legal Reasons','Yasal gerekçeyle erişilemiyor (sansür/telif).'],
  [500,'Internal Server Error','Sunucuda beklenmeyen hata — genel sunucu arızası kodu.'],
  [501,'Not Implemented','Sunucu bu metodu/özelliği hiç desteklemiyor.'],
  [502,'Bad Gateway','Ara sunucu (proxy/load balancer) arkadaki sunucudan geçersiz yanıt aldı.'],
  [503,'Service Unavailable','Sunucu geçici olarak hizmet veremiyor (bakım/aşırı yük); Retry-After verilebilir.'],
  [504,'Gateway Timeout','Ara sunucu, arkadaki sunucudan zamanında yanıt alamadı.'],
  [505,'HTTP Version Not Supported','İstenen HTTP sürümü desteklenmiyor.'],
  [507,'Insufficient Storage','Sunucuda yer yok (WebDAV).'],
  [511,'Network Authentication Required','Ağ erişimi için kimlik doğrulama gerekli (otel/kafe portalları).']
];
for (const [code, name, desc] of HTTP_STATUS) {
  push({
    id: `ref-status-${code}`,
    cat: 'Referans/HTTP',
    q: `http ${code} durum kodu status code ${camelWords(name)} hata anlamı nedir`,
    title: `HTTP ${code} ${name}`,
    a: [`HTTP durum kodu ${code} (${name}): ${desc}`,
        `Sınıf: ${code < 200 ? '1xx bilgi' : code < 300 ? '2xx başarı' : code < 400 ? '3xx yönlendirme' : code < 500 ? '4xx istemci hatası' : '5xx sunucu hatası'}.`]
  });
}

/* --- Olgu paketi: bilinen portlar (IANA) --- */
const PORTS = [
  [20,'FTP (veri)'],[21,'FTP (kontrol)'],[22,'SSH — güvenli kabuk, SFTP ve git ssh bunun üstünde çalışır'],
  [23,'Telnet (şifresiz — kullanmayın)'],[25,'SMTP — sunucular arası e-posta iletimi'],
  [53,'DNS — alan adı çözümleme (UDP ağırlıklı, büyük yanıtlar TCP)'],
  [67,'DHCP (sunucu)'],[68,'DHCP (istemci)'],[80,'HTTP — şifresiz web trafiği'],
  [110,'POP3 — e-posta indirme (eski)'],[123,'NTP — ağ saat eşitleme'],
  [143,'IMAP — e-posta erişimi'],[161,'SNMP — ağ cihazı izleme'],
  [443,'HTTPS — TLS üzerinden web; HTTP/3 (QUIC) aynı portu UDP ile kullanır'],
  [465,'SMTPS — TLS ile e-posta gönderimi'],[587,'SMTP (submission) — istemcinin e-posta göndermesi için standart'],
  [993,'IMAPS — TLS ile IMAP'],[995,'POP3S — TLS ile POP3'],
  [1433,'Microsoft SQL Server'],[1521,'Oracle veritabanı'],
  [3000,'Geliştirme sunucuları (Node/React vb. varsayılanı)'],
  [3306,'MySQL / MariaDB'],[3389,'RDP — Windows uzak masaüstü'],
  [5173,'Vite geliştirme sunucusu varsayılanı'],[5432,'PostgreSQL'],
  [5672,'AMQP (RabbitMQ)'],[6379,'Redis'],[8000,'Yaygın geliştirme portu (Django varsayılanı)'],
  [8080,'Alternatif HTTP / proxy — geliştirmede yaygın'],[8443,'Alternatif HTTPS'],
  [9092,'Apache Kafka'],[9200,'Elasticsearch'],[27017,'MongoDB']
];
for (const [port, desc] of PORTS) {
  push({
    id: `ref-port-${port}`,
    cat: 'Referans/Ağ',
    q: `port ${port} hangi servis bilinen port numarası well known ağ`,
    title: `Port ${port}`,
    a: [`${port} numaralı port: ${desc}.`,
        `${port < 1024 ? 'Bilinen (well-known) port aralığında — açmak çoğu sistemde yönetici yetkisi ister.' : 'Kayıtlı/dinamik aralıkta.'}`]
  });
}

const header = `/* =========================================================
   VEGA Referans Paketi — MDN verisinden otomatik üretildi
   Kaynaklar (CC0 1.0 / Public Domain):
   - mdn-data 2.9.0        https://github.com/mdn/data
   - @mdn/browser-compat-data 5.6.28  https://github.com/mdn/browser-compat-data
   Üretim: scripts/build-data.mjs · ${entries.length} kayıt
   ========================================================= */
`;
writeFileSync(`${OUT}/vega-data-ref.js`,
  header + 'const VEGA_KNOWLEDGE_REF = ' + JSON.stringify(entries, null, 0) + ';\n');
console.log('REF entries:', entries.length,
  'size:', (statSync(`${OUT}/vega-data-ref.js`).size / 1e6).toFixed(2), 'MB');

/* ==================== 2) BÜYÜK KOD DERLEMİ ==================== */
const sources = [
  ['lodash 4.17.21 (MIT)', `${DL}/lodash-4.17.21/lodash.js`],
  ['vue 3.4.38 (MIT)', `${DL}/vue-3.4.38/dist/vue.global.js`],
  ['d3 7.9.0 (ISC)', `${DL}/d3-7.9.0/dist/d3.js`],
  ['axios 1.7.7 (MIT)', `${DL}/axios-1.7.7/dist/axios.js`],
  ['three.js 0.160.1 (MIT)', `${DL}/three-0.160.1/build/three.module.js`],
  ['react-dom 18.3.1 (MIT)', `${DL}/react-dom-18.3.1/cjs/react-dom.development.js`],
  ['moment 2.30.1 (MIT)', `${DL}/moment-2.30.1/moment.js`],
  ['jquery 3.7.1 (MIT)', `${DL}/jquery-3.7.1/dist/jquery.js`],
  ['rxjs 7.8.1 (Apache-2.0)', `${DL}/rxjs-7.8.1/dist/bundles/rxjs.umd.js`],
  ['handlebars 4.7.8 (MIT)', `${DL}/handlebars-4.7.8/dist/handlebars.js`],
  ['luxon 3.5.0 (MIT)', `${DL}/luxon-3.5.0/build/global/luxon.js`],
  ['underscore 1.13.7 (MIT)', `${DL}/underscore-1.13.7/underscore.js`],
  ['backbone 1.6.0 (MIT)', `${DL}/backbone-1.6.0/backbone.js`],
];

// Gerçek Python kaynak kodu (PyPI wheel'lerinden) — derlem çok dilli olsun
function walkPy(dir) {
  return readdirSync(dir).flatMap(f => {
    const p = path.join(dir, f);
    return statSync(p).isDirectory() ? walkPy(p) : (f.endsWith('.py') ? [p] : []);
  });
}
[['django 5.1.1 (BSD-3)', `${DL}/py-Django/django`],
 ['flask 3.0.3 (BSD-3)', `${DL}/py-flask/flask`],
 ['requests 2.32.3 (Apache-2.0)', `${DL}/py-requests/requests`],
 ['sqlalchemy 2.0.35 (MIT)', `${DL}/py-SQLAlchemy/sqlalchemy`]
].forEach(([label, dir]) => {
  try { walkPy(dir).forEach(p => sources.push([label, p])); } catch (e) {}
});

// Gerçek Go kaynak kodu (proxy.golang.org modül zip'lerinden)
function walkExt(dir, ext) {
  return readdirSync(dir).flatMap(f => {
    const p = path.join(dir, f);
    return statSync(p).isDirectory() ? walkExt(p, ext)
      : (f.endsWith(ext) && !f.endsWith('_test' + ext) ? [p] : []);
  });
}
[['gin 1.10.0 (MIT)', `${DL}/go-gin`],
 ['cobra 1.8.1 (Apache-2.0)', `${DL}/go-cobra`],
 ['gorm 1.25.12 (MIT)', `${DL}/go-gorm`]
].forEach(([label, dir]) => {
  try { walkExt(dir, '.go').forEach(p => sources.push([label, p])); } catch (e) {}
});
// pandas (.py — derlenmiş .so hariç)
try {
  walkExt(`${DL}/py-pandas/pandas`, '.py').forEach(p =>
    sources.push(['pandas 2.2.3 (BSD-3)', p]));
} catch (e) {}

// Büyük tekil kaynaklar en sona: kalan bütçeyi doldururlar
sources.push(['typescript 5.5.4 (Apache-2.0)', `${DL}/typescript-5.5.4/lib/typescript.js`]);
sources.push(['@babel/standalone 7.25.6 (MIT)', `${DL}/babel-standalone-7.25.6/babel.js`]);
walk(`${DL}/webpack-5.94.0/lib`).forEach(p => sources.push(['webpack 5.94.0 (MIT)', p]));
// express: lib altındaki tüm .js dosyaları
function walk(dir) {
  return readdirSync(dir).flatMap(f => {
    const p = path.join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : (f.endsWith('.js') ? [p] : []);
  });
}
walk(`${DL}/express-4.21.2/lib`).forEach(p => sources.push(['express 4.21.2 (MIT)', p]));

const seen = new Set();
const lines = [];
let budget = 14.5e6; // ~14 MB hedef (JS + TS + Python + Go karışık)
const perSource = {};

for (const [label, file] of sources) {
  const raw = readFileSync(file, 'utf8');
  let inBlock = false;
  for (let line of raw.split('\n')) {
    line = line.trim();
    if (inBlock) { if (line.includes('*/')) inBlock = false; continue; }
    if (line.startsWith('/*')) { if (!line.includes('*/')) inBlock = true; continue; }
    if (!line || line.startsWith('//') || line.startsWith('*') ||
        line.startsWith('#') || line.startsWith('"""') || line.startsWith("'''")) continue;
    if (line.length < 10 || line.length > 140) continue;
    if (!/[a-zA-Z]{3}/.test(line)) continue;
    if (seen.has(line)) continue;
    seen.add(line);
    const cost = line.length + 3;
    if (budget - cost < 0) break;
    budget -= cost;
    lines.push(line);
    perSource[label] = (perSource[label] || 0) + 1;
  }
  if (budget <= 0) break;
}

const corpusHeader = `/* =========================================================
   VEGA Büyük Kod Derlemi — n-gram dil modelinin eğitim verisi
   Gerçek açık kaynak projelerin kaynak kodundan üretilmiştir:
${sources.map(s => s[0]).filter((v, i, a) => a.indexOf(v) === i).map(s => '   - ' + s).join('\n')}
   Lisanslar: MIT / ISC — telif bildirimleri orijinal projelerdedir.
   ${lines.length} benzersiz satır · Üretim: scripts/build-data.mjs
   ========================================================= */
`;
writeFileSync(`${OUT}/vega-corpus-big.js`,
  corpusHeader + 'const VEGA_BIG_CORPUS = ' + JSON.stringify(lines, null, 0) + ';\n');
console.log('CORPUS lines:', lines.length,
  'size:', (statSync(`${OUT}/vega-corpus-big.js`).size / 1e6).toFixed(2), 'MB');
console.log(perSource);
