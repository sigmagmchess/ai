/* Vega'yı tek HTML dosyasına paketler: css ve tüm js dosyaları
   index.html'in içine gömülür. Çıktı: vega.html — çift tıkla çalışır,
   klasör yapısı gerektirmez. Kullanım: node scripts/build-single.mjs */
import { readFileSync, writeFileSync, statSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let html = readFileSync(path.join(ROOT, 'index.html'), 'utf8');

// CSS'i göm
html = html.replace(/<link rel="stylesheet" href="([^"]+)">/g, (m, href) => {
  const css = readFileSync(path.join(ROOT, href), 'utf8');
  return `<style>\n${css}\n</style>`;
});

// JS dosyalarını sırayla göm. HTML ayrıştırıcısını bozan dizileri kaçışla:
// - "</..." (script kapanışı sanılır)  → "<\/..."
// - "<!--"  (script-escaped durumunu açar) → "<\!--"
// Bu diziler dosyalarımızda yalnız dize sabitlerinde geçer; JS'te "\/" ve
// "\!" aynı karaktere çözüldüğü için davranış birebir korunur.
html = html.replace(/<script src="([^"]+)"><\/script>/g, (m, src) => {
  const js = readFileSync(path.join(ROOT, src), 'utf8')
    .replace(/<\//g, '<\\/')
    .replace(/<!--/g, '<\\!--');
  return `<script>\n/* ==== ${src} ==== */\n${js}\n</script>`;
});

const out = path.join(ROOT, 'vega.html');
writeFileSync(out, html);
console.log('vega.html üretildi:',
  (statSync(out).size / 1e6).toFixed(1), 'MB — tek dosya, çift tıkla çalışır');
