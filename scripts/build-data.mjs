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
  entries.push({ id: e.id, cat: e.cat, q: e.q, title: e.title, a, code: e.code || null, weight: 0.85 });
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

/* --- HTTP başlıkları --- */
for (const [name, tree] of Object.entries(bcd.http.headers)) {
  const c = tree.__compat;
  if (!c) continue;
  push({
    id: `ref-http-${name}`,
    cat: 'Referans/HTTP',
    q: `http başlık header ${camelWords(name)}`,
    title: `HTTP Başlığı: ${name}`,
    a: [`HTTP başlığı.`, statusLine(c.status), supportLine(c.support), mdnLine(c)],
    code: `${name}: <değer>`
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
  ['jquery 3.7.1 (MIT)', `${DL}/jquery-3.7.1/dist/jquery.js`]
];
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
let budget = 3.1e6; // ~3 MB hedef
const perSource = {};

for (const [label, file] of sources) {
  const raw = readFileSync(file, 'utf8');
  let inBlock = false;
  for (let line of raw.split('\n')) {
    line = line.trim();
    if (inBlock) { if (line.includes('*/')) inBlock = false; continue; }
    if (line.startsWith('/*')) { if (!line.includes('*/')) inBlock = true; continue; }
    if (!line || line.startsWith('//') || line.startsWith('*')) continue;
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
