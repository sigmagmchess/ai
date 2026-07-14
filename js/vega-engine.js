/* =========================================================
   VEGA-7.5B-Code — Öğrenen Motor
   TF-IDF anlamsal arama + n-gram dil modeli + çevrimiçi öğrenme
   Tamamen tarayıcıda çalışır, localStorage'da kalıcıdır.
   ========================================================= */

const VegaEngine = (() => {

  const STORE_KEY = "vega_model_v1";

  // ---------- Durum ----------
  const state = {
    docs: [],              // { id, cat, q, title, a, code, weight, custom }
    idf: {},               // terim → idf değeri
    vectors: [],           // doküman TF-IDF vektörleri (Map)
    ngrams2: new Map(),    // "a b" bigram sayımları
    ngrams3: new Map(),    // "a b c" trigram sayımları
    vocab: new Set(),
    trained: false,
    missed: [],            // cevaplanamayan sorular — öğrenme kuyruğu
    stats: {
      trainCount: 0,
      lastTrain: null,
      lastPerplexity: null,
      queries: 0,
      taught: 0,
      feedbackUp: 0,
      feedbackDown: 0,
      lossHistory: []      // son eğitimin epoch → perplexity serisi
    }
  };

  // Genişletme paketleri yüklüyse birleştir
  function baseKnowledge() {
    const ext = (typeof VEGA_KNOWLEDGE_EXT !== "undefined") ? VEGA_KNOWLEDGE_EXT : [];
    const ref = (typeof VEGA_KNOWLEDGE_REF !== "undefined") ? VEGA_KNOWLEDGE_REF : [];
    return [...VEGA_KNOWLEDGE, ...ext, ...ref];
  }
  function baseCorpus() {
    const ext = (typeof VEGA_CODE_CORPUS_EXT !== "undefined") ? VEGA_CODE_CORPUS_EXT : [];
    return [...VEGA_CODE_CORPUS, ...ext];
  }
  // Büyük derlemden eşit aralıklı örneklem — bellek/başlangıç süresi dengesi
  function bigSample(maxLines) {
    if (typeof VEGA_BIG_CORPUS === "undefined") return [];
    const step = Math.max(1, Math.floor(VEGA_BIG_CORPUS.length / maxLines));
    const out = [];
    for (let i = 0; i < VEGA_BIG_CORPUS.length && out.length < maxLines; i += step) {
      out.push(VEGA_BIG_CORPUS[i]);
    }
    return out;
  }
  const SYNONYMS = (typeof VEGA_SYNONYMS !== "undefined") ? VEGA_SYNONYMS : {};

  // ---------- Tokenizasyon ----------
  const STOPWORDS = new Set([
    "ve","veya","ile","bir","bu","şu","o","ne","nedir","nasıl","için","gibi",
    "mi","mı","mu","mü","da","de","ki","en","çok","daha","ama","the","a","an",
    "is","are","in","on","of","to","for","what","how"
  ]);

  function tokenize(text) {
    return (text || "")
      .toLocaleLowerCase("tr")
      .replace(/[^a-zçğıöşü0-9\s]/gi, " ")
      .split(/\s+/)
      .filter(t => t.length > 1 && !STOPWORDS.has(t));
  }

  // Basit Türkçe ek budama — kelimenin ilk 5-6 harfini kök kabul eder
  function stem(t) {
    return t.length > 6 ? t.slice(0, 6) : t;
  }

  // Tekil kökler + bitişik kelime çiftleri (bigram) — ifade eşleşmesini güçlendirir
  function terms(text) {
    const stems = tokenize(text).map(stem);
    const out = [...stems];
    for (let i = 0; i < stems.length - 1; i++) {
      out.push(stems[i] + "_" + stems[i + 1]);
    }
    return out;
  }

  // Levenshtein mesafesi (erken çıkışlı) — yazım hatası toleransı için
  function editDistance(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      const cur = [i];
      let rowMin = i;
      for (let j = 1; j <= b.length; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1,
                          prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        rowMin = Math.min(rowMin, cur[j]);
      }
      if (rowMin > max) return max + 1;   // bu satırda umut kalmadı
      prev = cur;
    }
    return prev[b.length];
  }

  // Bilinmeyen sorgu terimini indeksteki en yakın terime eşle (mesafe ≤ 2)
  function fuzzyMatch(term) {
    if (term.length < 4) return null;
    let best = null, bestDist = 3;
    for (const t in state.idf) {
      if (t.includes("_")) continue;               // bigramları atla
      if (t[0] !== term[0]) continue;              // hız: ilk harf eşleşsin
      const d = editDistance(term, t, 2);
      if (d < bestDist) { bestDist = d; best = t; if (d === 1) break; }
    }
    return best;
  }

  // ---------- TF-IDF ----------
  function buildIndex() {
    const N = state.docs.length;
    const df = {};
    const docTerms = state.docs.map(d => terms(d.q + " " + d.title + " " + d.a));

    docTerms.forEach(ts => {
      new Set(ts).forEach(t => { df[t] = (df[t] || 0) + 1; });
    });

    state.idf = {};
    for (const t in df) {
      state.idf[t] = Math.log((N + 1) / (df[t] + 0.5)) + 1;
    }

    state.vectors = docTerms.map(ts => {
      const tf = new Map();
      ts.forEach(t => tf.set(t, (tf.get(t) || 0) + 1));
      const vec = new Map();
      let norm = 0;
      tf.forEach((count, t) => {
        const w = (1 + Math.log(count)) * (state.idf[t] || 0);
        vec.set(t, w);
        norm += w * w;
      });
      vec._norm = Math.sqrt(norm) || 1;
      return vec;
    });
  }

  function queryVector(text) {
    const tf = new Map();
    const raw = tokenize(text);

    // 1) Ham terimler + bigramlar
    terms(text).forEach(t => tf.set(t, (tf.get(t) || 0) + 1));

    // 2) Eşanlamlı genişletme (TR-EN köprüsü) — düşük ağırlıkla ekle
    raw.forEach(tok => {
      (SYNONYMS[tok] || []).forEach(syn => {
        const s = stem(syn.toLocaleLowerCase("tr"));
        if (!tf.has(s)) tf.set(s, 0.7);
      });
    });

    // 3) Yazım hatası toleransı: indekste olmayan terimi en yakınına eşle
    raw.map(stem).forEach(t => {
      if (state.idf[t] == null) {
        const near = fuzzyMatch(t);
        if (near && !tf.has(near)) tf.set(near, 0.8);
      }
    });
    const vec = new Map();
    let norm = 0;
    tf.forEach((count, t) => {
      const w = (1 + Math.log(count)) * (state.idf[t] || 0.3); // bilinmeyen terime küçük ağırlık
      vec.set(t, w);
      norm += w * w;
    });
    vec._norm = Math.sqrt(norm) || 1;
    return vec;
  }

  function cosine(q, d) {
    let dot = 0;
    q.forEach((w, t) => {
      const dw = d.get(t);
      if (dw) dot += w * dw;
    });
    return dot / (q._norm * d._norm);
  }

  // ---------- N-gram dil modeli ----------
  function codeTokens(line) {
    return line.split(/\s+/).filter(Boolean);
  }

  // fixedVocab verilirse sözlük sabit kalır — epoch'lar arası perplexity
  // karşılaştırılabilir olur (sözlük büyümesi metriği şişirmez).
  // ngrams3 bağlam haritasıdır: "w1 w2" → Map(w3 → sayım). Bu yapı hem
  // olasılık sorgusunu hem kod tamamlama örneklemesini O(1) yapar.
  function trainNgrams(corpus, fixedVocab = null) {
    state.ngrams2 = new Map();
    state.ngrams3 = new Map();
    state.trigramTotal = 0;
    state.vocab = fixedVocab || new Set();
    corpus.forEach(line => {
      const ts = ["<s>", "<s>", ...codeTokens(line), "</s>"];
      if (!fixedVocab) ts.forEach(t => state.vocab.add(t));
      for (let i = 2; i < ts.length; i++) {
        const bi = ts[i - 1] + " " + ts[i];
        state.ngrams2.set(bi, (state.ngrams2.get(bi) || 0) + 1);
        const ctx = ts[i - 2] + " " + ts[i - 1];
        let nexts = state.ngrams3.get(ctx);
        if (!nexts) { nexts = new Map(); state.ngrams3.set(ctx, nexts); }
        if (!nexts.has(ts[i])) state.trigramTotal++;
        nexts.set(ts[i], (nexts.get(ts[i]) || 0) + 1);
      }
    });
    state.lastCorpusSize = corpus.length;
  }

  // Laplace düzeltmeli trigram olasılığı
  function triProb(w1, w2, w3) {
    const V = state.vocab.size || 1;
    const tri = state.ngrams3.get(w1 + " " + w2)?.get(w3) || 0;
    const bi = state.ngrams2.get(w1 + " " + w2) || 0;
    return (tri + 1) / (bi + V);
  }

  // Gerçek perplexity: doğrulama cümleleri üzerinde
  function perplexity(sentences) {
    let logSum = 0, count = 0;
    sentences.forEach(line => {
      const ts = ["<s>", "<s>", ...codeTokens(line), "</s>"];
      for (let i = 2; i < ts.length; i++) {
        logSum += Math.log(triProb(ts[i - 2], ts[i - 1], ts[i]));
        count++;
      }
    });
    return count ? Math.exp(-logSum / count) : Infinity;
  }

  // ---------- Eğitim (gerçek, artımlı, ilerleme raporlu) ----------
  async function train(onProgress) {
    const corpus = [
      ...baseCorpus(),
      ...state.docs.filter(d => d.code && !d.id.startsWith("ref-"))
        .map(d => d.code.replace(/\n/g, " ")),
      ...bigSample(12000)   // gerçek açık kaynak derleminden geniş örneklem
    ];

    state.stats.lossHistory = [];
    const EPOCHS = 8;

    // Sözlüğü tam derlemden bir kez kur — epoch'lar arası sabit kalsın ki
    // perplexity düşüşü gerçek öğrenmeyi yansıtsın
    const fullVocab = new Set();
    [...corpus, ...VEGA_VALIDATION].forEach(line => {
      ["<s>", "<s>", ...codeTokens(line), "</s>"].forEach(t => fullVocab.add(t));
    });

    // Her epoch derlemin büyüyen bir dilimini işler → kapsama arttıkça
    // doğrulama perplexity'si gerçekten düşer
    for (let e = 1; e <= EPOCHS; e++) {
      const slice = corpus.slice(0, Math.ceil(corpus.length * e / EPOCHS));
      trainNgrams(slice, fullVocab);
      const ppl = perplexity(VEGA_VALIDATION);
      state.stats.lossHistory.push({ epoch: e, ppl: Math.round(ppl * 100) / 100 });
      if (onProgress) onProgress(e, EPOCHS, ppl, "n-gram");
      await new Promise(r => setTimeout(r, 140)); // UI'nin ilerlemeyi göstermesi için
    }

    buildIndex();
    if (onProgress) onProgress(EPOCHS, EPOCHS, state.stats.lossHistory.at(-1).ppl, "indeks");

    state.trained = true;
    state.stats.trainCount++;
    state.stats.lastTrain = new Date().toISOString();
    state.stats.lastPerplexity = state.stats.lossHistory.at(-1).ppl;
    persist();
    return state.stats.lossHistory;
  }

  // ---------- Kod tamamlama (n-gram örnekleme) ----------
  function mulberry(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function completeCode(prefix, maxTokens = 14, seed = 42) {
    const rnd = mulberry(seed);
    let ts = codeTokens(prefix);
    if (ts.length === 0) ts = ["const"];
    const out = [...ts];
    let w1 = out.length > 1 ? out[out.length - 2] : "<s>";
    let w2 = out[out.length - 1];

    for (let i = 0; i < maxTokens; i++) {
      // Bağlam haritasından O(1) aday erişimi, sayım ağırlıklı örnekleme
      const nexts = state.ngrams3.get(w1 + " " + w2);
      if (!nexts || nexts.size === 0) break;
      const candidates = [...nexts.entries()].map(([tok, count]) => [tok, count]);
      const total = candidates.reduce((s, c) => s + c[1], 0);
      let r = rnd() * total, next = candidates[0][0];
      for (const [tok, count] of candidates) {
        r -= count;
        if (r <= 0) { next = tok; break; }
      }
      if (next === "</s>") break;
      out.push(next);
      w1 = w2; w2 = next;
    }
    return out.join(" ");
  }

  // ---------- Cevaplama ----------
  function detectSmalltalk(text) {
    const low = text.toLocaleLowerCase("tr").trim();
    for (const st of VEGA_SMALLTALK) {
      for (const trigger of st.q) {
        if (low === trigger || low.startsWith(trigger + " ") || low.startsWith(trigger + "!") ||
            (trigger.length > 5 && low.includes(trigger))) {
          return st.a[Math.floor(Math.random() * st.a.length)];
        }
      }
    }
    return null;
  }

  function ask(text) {
    state.stats.queries++;

    // Öğretme komutu
    const teachMatch = text.match(/^öğret\s*:\s*(.+?)\s*=>\s*(.+)$/is);
    if (teachMatch) {
      const doc = teach(teachMatch[1].trim(), teachMatch[2].trim());
      persist();
      return {
        type: "taught",
        text: `Öğrendim ve kalıcı hafızama işledim! ✅\n\n**Soru:** ${doc.title}\n**Cevap:** ${doc.a}\n\nBu bilgi artık aramalarda kullanılıyor. Admin panelinden "Modeli Eğit" ile tam indekslemeyi tetikleyebilirsin.`,
        docId: doc.id
      };
    }

    // Kod tamamlama komutu
    const codeMatch = text.match(/^(tamamla|kod)\s*:\s*(.+)$/is);
    if (codeMatch) {
      const seed = hashString(codeMatch[2]);
      const completion = completeCode(codeMatch[2].trim(), 16, seed);
      return {
        type: "code",
        text: "N-gram dil modelim şu devamı örnekledi (derlemden öğrenilen geçiş olasılıklarıyla):",
        code: completion,
        docId: null
      };
    }

    // Selamlama / kimlik
    const st = detectSmalltalk(text);
    if (st) return { type: "smalltalk", text: st, docId: null };

    // Anlamsal arama
    const qv = queryVector(text);
    const scored = state.docs.map((d, i) => ({
      doc: d,
      score: cosine(qv, state.vectors[i]) * d.weight
    })).sort((a, b) => b.score - a.score);

    const best = scored[0];
    const THRESHOLD = 0.11;

    if (!best || best.score < THRESHOLD) {
      logMissed(text);
      const suggestions = scored.slice(0, 3).filter(s => s.score > 0.02)
        .map(s => `• ${s.doc.title}`).join("\n");
      const base = VEGA_UNKNOWN[Math.floor(Math.random() * VEGA_UNKNOWN.length)];
      return {
        type: "unknown",
        text: base + `\n\nBu soruyu **öğrenme kuyruğuma** kaydettim (Admin > Öğrenme Kuyruğu).` + (suggestions
          ? `\n\nEn yakın bildiğim konular:\n${suggestions}\n\nBana bu konuyu \`öğret: soru => cevap\` biçiminde öğretebilirsin — bir daha unutmam.`
          : `\n\nBana \`öğret: soru => cevap\` yazarak öğretebilirsin.`),
        docId: null
      };
    }

    // İlişkiler sorguya değil, bulunan kaydın KENDİSİNE göre hesaplanır:
    // doküman vektörleri arası kosinüs — elle yazılmış bağlantı yok
    const related = relatedDocs(best.doc.id, 3).map(r => r.title);

    // Çoklu kaynak birleştirme: ikinci kayıt en iyiye çok yakınsa cevaba ekle
    const second = scored[1];
    let extra = null;
    if (second && second.score >= best.score * 0.72 && second.score > THRESHOLD &&
        second.doc.cat === best.doc.cat) {
      extra = { title: second.doc.title, a: second.doc.a };
    }

    let answerText = `**${best.doc.title}**\n\n${best.doc.a}`;
    if (extra) answerText += `\n\n➕ **İlgili: ${extra.title}**\n${extra.a}`;

    return {
      type: "answer",
      text: answerText,
      code: best.doc.code || null,
      docId: best.doc.id,
      confidence: Math.min(0.99, best.score * 2.2),
      category: best.doc.cat,
      related
    };
  }

  // ---------- Öğrenme kuyruğu: cevaplanamayan sorular ----------
  function logMissed(text) {
    const q = text.trim();
    if (q.length < 3 || state.missed.some(m => m.q === q)) return;
    state.missed.unshift({ q, t: new Date().toISOString() });
    if (state.missed.length > 50) state.missed.pop();
    persist();
  }

  function getMissed() { return state.missed; }

  // ---------- Gerçek anlamsal ilişkiler ----------
  // İki kaydın ilişkisi = TF-IDF vektörleri arasındaki kosinüs benzerliği.
  // İlişkiler veriye gömülü değildir; indeksten HESAPLANIR — yeni öğretilen
  // bilgi bile eğitimden sonra ağa kendiliğinden bağlanır.
  function relatedDocs(docId, k = 5) {
    const i = state.docs.findIndex(d => d.id === docId);
    if (i < 0) return [];
    const v = state.vectors[i];
    const scored = [];
    for (let j = 0; j < state.docs.length; j++) {
      if (j === i) continue;
      // Ağırlıkla çarpım: küratörlü (1.0) ve 👍 almış kayıtlar, referans
      // kayıtlarının (0.85) önüne geçer — sıralama yine hesaplamadır
      const s = cosine(v, state.vectors[j]) * state.docs[j].weight;
      if (s > 0.045) {
        scored.push({ id: state.docs[j].id, title: state.docs[j].title,
                      cat: state.docs[j].cat, score: s });
      }
    }
    return scored.sort((a, b) => b.score - a.score).slice(0, k);
  }

  // Kavram düzeyi bilgi grafı: küratörlü kayıtlar düğüm, benzerlik kenar.
  // Referans kayıtları (12 bin+) hariç tutulur — kavram ağı okunabilir kalsın.
  function getGraph(minSim = 0.055, maxEdgesPerNode = 3) {
    const idx = [];
    state.docs.forEach((d, i) => { if (!d.id.startsWith("ref-")) idx.push(i); });
    const nodes = idx.map(i => ({
      id: state.docs[i].id, title: state.docs[i].title,
      cat: state.docs[i].cat, custom: !!state.docs[i].custom
    }));
    // Her düğüm için en güçlü maxEdgesPerNode bağ; yönsüz tekilleştirme
    const edgeMap = new Map();
    for (let a = 0; a < idx.length; a++) {
      const cand = [];
      for (let b = 0; b < idx.length; b++) {
        if (a === b) continue;
        const s = cosine(state.vectors[idx[a]], state.vectors[idx[b]]);
        if (s >= minSim) cand.push({ b, w: s });
      }
      cand.sort((x, y) => y.w - x.w).slice(0, maxEdgesPerNode).forEach(({ b, w }) => {
        const key = Math.min(a, b) + "-" + Math.max(a, b);
        const prev = edgeMap.get(key);
        if (!prev || w > prev.w) edgeMap.set(key, { a: Math.min(a, b), b: Math.max(a, b), w });
      });
    }
    return { nodes, edges: [...edgeMap.values()] };
  }

  function removeMissed(q) {
    state.missed = state.missed.filter(m => m.q !== q);
    persist();
  }

  // ---------- Çevrimiçi öğrenme ----------
  function teach(question, answer) {
    const doc = {
      id: "user-" + Date.now().toString(36),
      cat: "Öğretilen",
      q: question,
      title: question.length > 80 ? question.slice(0, 80) + "…" : question,
      a: answer,
      code: null,
      weight: 1.1,   // öğretilen bilgi hafif öncelikli başlar
      custom: true
    };
    state.docs.push(doc);
    state.stats.taught++;
    buildIndex();   // anında kullanılabilir olsun
    // Bu soru öğrenme kuyruğundaysa kapat — döngü tamamlandı
    state.missed = state.missed.filter(m =>
      cosine(queryVector(m.q), state.vectors[state.docs.length - 1]) < 0.15);
    persist();
    return doc;
  }

  function feedback(docId, positive) {
    const doc = state.docs.find(d => d.id === docId);
    if (!doc) return null;
    doc.weight = Math.max(0.2, Math.min(3.0, doc.weight * (positive ? 1.15 : 0.85)));
    if (positive) state.stats.feedbackUp++; else state.stats.feedbackDown++;
    persist();
    return doc.weight;
  }

  function addDoc(data) {
    const doc = {
      id: "admin-" + Date.now().toString(36),
      cat: data.cat || "Öğretilen",
      q: data.q, title: data.title, a: data.a,
      code: data.code || null, weight: 1.0, custom: true
    };
    state.docs.push(doc);
    buildIndex();
    persist();
    return doc;
  }

  function removeDoc(id) {
    const i = state.docs.findIndex(d => d.id === id);
    if (i >= 0) {
      state.docs.splice(i, 1);
      buildIndex();
      persist();
      return true;
    }
    return false;
  }

  // ---------- Kalıcılık ----------
  function persist() {
    try {
      const custom = state.docs.filter(d => d.custom);
      const weights = {};
      // Yalnız fabrika değerinden sapan ağırlıklar saklanır — 10 bin
      // referans kaydının varsayılan 0.85'i localStorage'ı şişirmesin
      state.docs.forEach(d => {
        if (d.weight !== (d._bw ?? 1.0)) weights[d.id] = d.weight;
      });
      localStorage.setItem(STORE_KEY, JSON.stringify({
        custom, weights, stats: state.stats, missed: state.missed
      }));
    } catch (e) { /* depolama dolu — sessizce geç */ }
  }

  function load() {
    state.docs = baseKnowledge().map(d => ({ ...d, custom: false }));
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        (saved.custom || []).forEach(d => state.docs.push(d));
        state.docs.forEach(d => {
          if (saved.weights && saved.weights[d.id] != null) d.weight = saved.weights[d.id];
        });
        if (saved.stats) Object.assign(state.stats, saved.stats);
        if (saved.missed) state.missed = saved.missed;
      }
    } catch (e) { /* bozuk kayıt — fabrika verisiyle devam */ }
    // Fabrika ağırlıklarını hatırla — persist yalnız SAPMALARI kaydetsin
    state.docs.forEach(d => { if (d._bw == null) d._bw = d.weight; });
    buildIndex();
    trainNgrams([...baseCorpus(),
                 ...state.docs.filter(d => d.code && !d.id.startsWith("ref-"))
                   .map(d => d.code.replace(/\n/g, " ")),
                 ...bigSample(4000)]);   // başlangıçta hafif örneklem
    state.trained = true;
  }

  function factoryReset() {
    localStorage.removeItem(STORE_KEY);
    state.missed = [];
    state.stats = { trainCount: 0, lastTrain: null, lastPerplexity: null,
                    queries: 0, taught: 0, feedbackUp: 0, feedbackDown: 0, lossHistory: [] };
    load();
  }

  function exportModel() {
    return JSON.stringify({
      format: "vega-model-v1",
      exported: new Date().toISOString(),
      custom: state.docs.filter(d => d.custom),
      weights: Object.fromEntries(state.docs
        .filter(d => d.weight !== (d._bw ?? 1.0)).map(d => [d.id, d.weight])),
      stats: state.stats
    }, null, 2);
  }

  function importModel(json) {
    const data = JSON.parse(json);
    if (data.format !== "vega-model-v1") throw new Error("Geçersiz model dosyası");
    (data.custom || []).forEach(d => {
      if (!state.docs.some(x => x.id === d.id)) state.docs.push(d);
    });
    state.docs.forEach(d => {
      if (data.weights && data.weights[d.id] != null) d.weight = data.weights[d.id];
    });
    buildIndex();
    persist();
    return (data.custom || []).length;
  }

  // ---------- Yardımcı ----------
  function hashString(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function getStats() {
    return {
      ...state.stats,
      docCount: state.docs.length,
      customCount: state.docs.filter(d => d.custom).length,
      vocabSize: state.vocab.size,
      trigramCount: state.trigramTotal || 0,
      termCount: Object.keys(state.idf).length,
      corpusLines: state.lastCorpusSize || 0,
      missedCount: state.missed.length
    };
  }

  function getDocs() { return state.docs; }

  return { load, ask, train, teach, feedback, addDoc, removeDoc,
           factoryReset, exportModel, importModel, getStats, getDocs,
           getMissed, removeMissed, relatedDocs, getGraph,
           completeCode, hashString, persist };
})();
