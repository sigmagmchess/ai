/* =========================================================
   VEGA-ML — Gerçek Makine Öğrenmesi Çekirdeği
   Saf JavaScript: ileri geçiş, geri yayılım (backpropagation),
   Adam optimizer, mini-batch eğitim, eğitim/doğrulama ayrımı.
   Kütüphane yok, WebGL yok — her gradyan burada elle hesaplanır.

   İki model:
   1) IntentNet  — soru niyeti sınıflandırıcısı (bag-of-words MLP)
   2) CodeNet    — karakter düzeyi nöral dil modeli (embedding + MLP)
   ========================================================= */

const VegaML = (() => {

  /* ---------- Tohumlu RNG (tekrarlanabilir eğitim) ---------- */
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  /* ---------- Matris yardımcıları (Float32, satır-majör) ---------- */
  function zeros(n) { return new Float32Array(n); }

  function randInit(n, scale, rand) {
    const a = new Float32Array(n);
    for (let i = 0; i < n; i++) a[i] = (rand() * 2 - 1) * scale;
    return a;
  }

  // C[B×N] = A[B×M] · W[M×N]
  function matmul(A, W, B, M, N, out) {
    out.fill(0);
    for (let b = 0; b < B; b++) {
      const ao = b * M, co = b * N;
      for (let m = 0; m < M; m++) {
        const av = A[ao + m];
        if (av === 0) continue;
        const wo = m * N;
        for (let n = 0; n < N; n++) out[co + n] += av * W[wo + n];
      }
    }
  }

  // dW[M×N] += Aᵀ[M×B] · dC[B×N] ;  dA[B×M] += dC[B×N] · Wᵀ[N×M]
  function matmulBack(A, W, dC, B, M, N, dW, dA) {
    for (let b = 0; b < B; b++) {
      const ao = b * M, co = b * N;
      for (let m = 0; m < M; m++) {
        const av = A[ao + m];
        const wo = m * N;
        let acc = 0;
        for (let n = 0; n < N; n++) {
          const g = dC[co + n];
          dW[wo + n] += av * g;
          acc += g * W[wo + n];
        }
        if (dA) dA[ao + m] += acc;
      }
    }
  }

  /* ---------- Adam optimizer ---------- */
  function adam(params) {
    const m = zeros(params.length), v = zeros(params.length);
    let t = 0;
    return function step(grads, lr = 0.01, b1 = 0.9, b2 = 0.999, eps = 1e-8) {
      t++;
      const c1 = 1 - Math.pow(b1, t), c2 = 1 - Math.pow(b2, t);
      for (let i = 0; i < params.length; i++) {
        const g = grads[i];
        m[i] = b1 * m[i] + (1 - b1) * g;
        v[i] = b2 * v[i] + (1 - b2) * g * g;
        params[i] -= lr * (m[i] / c1) / (Math.sqrt(v[i] / c2) + eps);
      }
    };
  }

  /* ---------- 2 katmanlı MLP: girdi → ReLU gizli → softmax ----------
     Gerçek geri yayılım: dz2 = p - y ; dW2 = a1ᵀdz2 ; dz1 = dz2·W2ᵀ ⊙ relu'
  */
  function createMLP(IN, HID, OUT, seed = 7) {
    const rand = rng(seed);
    const W1 = randInit(IN * HID, Math.sqrt(2 / IN), rand);
    const b1 = zeros(HID);
    const W2 = randInit(HID * OUT, Math.sqrt(2 / HID), rand);
    const b2 = zeros(OUT);
    const opts = [adam(W1), adam(b1), adam(W2), adam(b2)];

    function forward(X, B, cache, dropMask) {
      const z1 = zeros(B * HID);
      matmul(X, W1, B, IN, HID, z1);
      for (let b = 0; b < B; b++)
        for (let h = 0; h < HID; h++) z1[b * HID + h] += b1[h];
      const a1 = zeros(B * HID);
      for (let i = 0; i < z1.length; i++) a1[i] = z1[i] > 0 ? z1[i] : 0;
      // Dropout (yalnız eğitimde): rastgele nöronlar susturulur — ağ tek
      // tek nöronlara (ezber yollarına) bel bağlayamaz, genellemek zorunda kalır
      if (dropMask) for (let i = 0; i < a1.length; i++) a1[i] *= dropMask[i];
      const z2 = zeros(B * OUT);
      matmul(a1, W2, B, HID, OUT, z2);
      for (let b = 0; b < B; b++)
        for (let o = 0; o < OUT; o++) z2[b * OUT + o] += b2[o];
      // satır bazında softmax (sayısal kararlı)
      const P = zeros(B * OUT);
      for (let b = 0; b < B; b++) {
        const off = b * OUT;
        let mx = -Infinity;
        for (let o = 0; o < OUT; o++) mx = Math.max(mx, z2[off + o]);
        let sum = 0;
        for (let o = 0; o < OUT; o++) { P[off + o] = Math.exp(z2[off + o] - mx); sum += P[off + o]; }
        for (let o = 0; o < OUT; o++) P[off + o] /= sum;
      }
      if (cache) { cache.z1 = z1; cache.a1 = a1; cache.P = P; }
      return P;
    }

    // X[B×IN], y: hedef sınıf dizini[B] → ortalama çapraz entropi kaybı
    function trainStep(X, y, B, lr, dropout = 0) {
      const cache = {};
      let dropMask = null;
      if (dropout > 0) {
        dropMask = new Float32Array(B * HID);
        const scale = 1 / (1 - dropout);   // inverted dropout
        for (let i = 0; i < dropMask.length; i++)
          dropMask[i] = Math.random() < dropout ? 0 : scale;
      }
      const P = forward(X, B, cache, dropMask);
      let loss = 0;
      const dz2 = zeros(B * OUT);
      for (let b = 0; b < B; b++) {
        loss += -Math.log(Math.max(1e-9, P[b * OUT + y[b]]));
        for (let o = 0; o < OUT; o++)
          dz2[b * OUT + o] = (P[b * OUT + o] - (o === y[b] ? 1 : 0)) / B;
      }
      const dW2 = zeros(W2.length), db2 = zeros(OUT);
      const da1 = zeros(B * HID);
      matmulBack(cache.a1, W2, dz2, B, HID, OUT, dW2, da1);
      for (let b = 0; b < B; b++)
        for (let o = 0; o < OUT; o++) db2[o] += dz2[b * OUT + o];
      const dz1 = zeros(B * HID);
      for (let i = 0; i < da1.length; i++) {
        dz1[i] = cache.z1[i] > 0 ? da1[i] : 0;
        if (dropMask) dz1[i] *= dropMask[i];   // susturulan nörona gradyan akmaz
      }
      const dW1 = zeros(W1.length), db1 = zeros(HID);
      const dX = null; // girdi gradyanı (embedding modelinde ayrıca ele alınır)
      matmulBack(X, W1, dz1, B, IN, HID, dW1, dX);
      for (let b = 0; b < B; b++)
        for (let h = 0; h < HID; h++) db1[h] += dz1[b * HID + h];

      opts[0](dW1, lr); opts[1](db1, lr); opts[2](dW2, lr); opts[3](db2, lr);
      return { loss: loss / B, dz1, cache };
    }

    return {
      forward, trainStep, W1, b1, W2, b2,
      IN, HID, OUT,
      paramCount: W1.length + b1.length + W2.length + b2.length,
      export: () => ({ W1: [...W1], b1: [...b1], W2: [...W2], b2: [...b2] }),
      import: d => { W1.set(d.W1); b1.set(d.b1); W2.set(d.W2); b2.set(d.b2); }
    };
  }

  /* ============================================================
     1) IntentNet — soru niyeti sınıflandırıcısı
     Girdi: bag-of-words (en sık kökler), Çıktı: kategori ailesi
     Eğitim verisi: bilgi tabanındaki (anahtar kelimeler → kategori)
     ============================================================ */
  const intent = {
    ready: false, vocab: null, labels: null, net: null,
    valAcc: null, trainSize: 0, history: []
  };

  function tokenizeTr(text) {
    return (text || "").toLocaleLowerCase("tr")
      .replace(/[^a-zçğıöşü0-9\s]/gi, " ")
      .split(/\s+/)
      .filter(t => t.length > 1)
      .map(t => t.length > 6 ? t.slice(0, 6) : t);
  }

  function familyOfCat(cat) {
    for (const [name, cats] of VEGA_FAMILIES) {
      if (cats.includes(cat)) return name;
    }
    return null;
  }

  function featurize(text, vocab) {
    const x = zeros(vocab.size);
    tokenizeTr(text).forEach(t => {
      const i = vocab.get(t);
      if (i != null) x[i] = 1;
    });
    return x;
  }

  async function trainIntent(docs, onProgress) {
    // Yalnız küratörlü kayıtlar (referans değil) — dengeli, temiz etiketler
    const samples = [];
    docs.forEach(d => {
      if (d.id.startsWith("ref-")) return;
      const fam = familyOfCat(d.cat);
      if (!fam) return;
      samples.push({ text: d.q + " " + d.title, label: fam });
      // veri artırma: başlık ve anahtar kelimeler ayrı örnekler olarak
      samples.push({ text: d.title, label: fam });
      samples.push({ text: d.q, label: fam });
    });

    // Sözlük: en sık geçen kökler
    const freq = new Map();
    samples.forEach(s => new Set(tokenizeTr(s.text)).forEach(t =>
      freq.set(t, (freq.get(t) || 0) + 1)));
    const vocabList = [...freq.entries()].sort((a, b) => b[1] - a[1])
      .slice(0, 900).map(e => e[0]);
    const vocab = new Map(vocabList.map((t, i) => [t, i]));

    const labels = [...new Set(samples.map(s => s.label))].sort();
    const labelIdx = new Map(labels.map((l, i) => [l, i]));

    // Karıştır, %85/15 eğitim/doğrulama ayrımı
    const rand = rng(1234);
    const shuffled = [...samples].sort(() => rand() - 0.5);
    const cut = Math.floor(shuffled.length * 0.85);
    const train = shuffled.slice(0, cut), val = shuffled.slice(cut);

    const net = createMLP(vocab.size, 48, labels.length, 42);
    const X = (arr) => {
      const B = arr.length;
      const x = zeros(B * vocab.size);
      arr.forEach((s, b) => x.set(featurize(s.text, vocab), b * vocab.size));
      return x;
    };
    const Y = (arr) => arr.map(s => labelIdx.get(s.label));

    function valAccuracy() {
      const P = net.forward(X(val), val.length, null);
      let ok = 0;
      val.forEach((s, b) => {
        let best = 0, bi = 0;
        for (let o = 0; o < labels.length; o++) {
          if (P[b * labels.length + o] > best) { best = P[b * labels.length + o]; bi = o; }
        }
        if (bi === labelIdx.get(s.label)) ok++;
      });
      return ok / Math.max(1, val.length);
    }

    intent.history = [];
    const EPOCHS = 14, BATCH = 32;
    for (let e = 1; e <= EPOCHS; e++) {
      const order = [...train].sort(() => rand() - 0.5);
      let epochLoss = 0, steps = 0;
      for (let i = 0; i < order.length; i += BATCH) {
        const batch = order.slice(i, i + BATCH);
        const { loss } = net.trainStep(X(batch), Y(batch), batch.length, 0.02);
        epochLoss += loss; steps++;
      }
      const acc = valAccuracy();
      intent.history.push({ epoch: e, loss: epochLoss / steps, acc });
      if (onProgress) onProgress(e, EPOCHS, epochLoss / steps, acc);
      await new Promise(r => setTimeout(r, 0));   // UI donmasın
    }

    intent.vocab = vocab;
    intent.labels = labels;
    intent.net = net;
    intent.valAcc = intent.history.at(-1).acc;
    intent.trainSize = train.length;
    intent.ready = true;
    return intent.valAcc;
  }

  function predictIntent(text) {
    if (!intent.ready) return null;
    const P = intent.net.forward(featurize(text, intent.vocab), 1, null);
    let bi = 0;
    for (let o = 1; o < intent.labels.length; o++) if (P[o] > P[bi]) bi = o;
    return {
      label: intent.labels[bi],
      conf: P[bi],
      probs: intent.labels.map((l, i) => ({ label: l, p: P[i] }))
        .sort((a, b) => b.p - a.p)
    };
  }

  /* ============================================================
     2) CodeNet — karakter düzeyi nöral dil modeli
     Bağlam penceresi C karakter → embedding'ler birleştirilir →
     ReLU gizli katman → softmax sonraki karakter. Embedding
     gradyanları da gerçek geri yayılımla güncellenir.
     ============================================================ */
  const CTX = 14, EMB = 20, HID = 96;
  const codenet = {
    ready: false, chars: null, charIdx: null,
    emb: null, net: null, history: [], trainedChars: 0
  };

  function buildCharVocab(text) {
    const freq = new Map();
    for (const ch of text) freq.set(ch, (freq.get(ch) || 0) + 1);
    const chars = [...freq.entries()].sort((a, b) => b[1] - a[1])
      .slice(0, 95).map(e => e[0]);
    chars.unshift(" ");   // 0 = bilinmeyen/dolgu
    return chars;
  }

  function encode(text, charIdx) {
    const out = new Int32Array(text.length);
    for (let i = 0; i < text.length; i++) out[i] = charIdx.get(text[i]) ?? 0;
    return out;
  }

  async function trainCodeNet(corpusLines, opts = {}) {
    const { steps = 700, batch = 48, lr = 0.008, onProgress } = opts;
    const text = corpusLines.join("\n");
    const chars = buildCharVocab(text);
    const charIdx = new Map(chars.map((c, i) => [c, i]));
    const V = chars.length;
    const data = encode(text, charIdx);

    // %95/5 eğitim/doğrulama ayrımı (bitişik bloklar)
    const cut = Math.floor(data.length * 0.95);
    const trainData = data.subarray(0, cut);
    const valData = data.subarray(cut);

    const rand = rng(99);
    const emb = randInit(V * EMB, 0.08, rand);
    const embOpt = adam(emb);
    const net = createMLP(CTX * EMB, HID, V, 7);

    function makeBatch(src, B, r) {
      const X = zeros(B * CTX * EMB);
      const idxs = new Int32Array(B * CTX);       // embedding geri yayılımı için
      const y = new Int32Array(B);
      for (let b = 0; b < B; b++) {
        const pos = CTX + Math.floor(r() * (src.length - CTX - 1));
        for (let c = 0; c < CTX; c++) {
          const ci = src[pos - CTX + c];
          idxs[b * CTX + c] = ci;
          X.set(emb.subarray(ci * EMB, ci * EMB + EMB), (b * CTX + c) * EMB);
        }
        y[b] = src[pos];
      }
      return { X, y, idxs };
    }

    function valLoss() {
      const r = rng(5);
      const { X, y } = makeBatch(valData, 96, r);
      const P = net.forward(X, 96, null);
      let L = 0;
      for (let b = 0; b < 96; b++) L += -Math.log(Math.max(1e-9, P[b * V + y[b]]));
      return L / 96;
    }

    codenet.history = [];
    for (let s = 1; s <= steps; s++) {
      const { X, y, idxs } = makeBatch(trainData, batch, rand);
      const { loss, dz1 } = net.trainStep(X, y, batch, lr);

      // Embedding gradyanı: dX = dz1 · W1ᵀ, ilgili karakter satırlarına dağıt
      const dEmb = zeros(emb.length);
      for (let b = 0; b < batch; b++) {
        for (let c = 0; c < CTX; c++) {
          const ci = idxs[b * CTX + c];
          const xo = (c) * EMB;                    // girdi içindeki ofset
          for (let e2 = 0; e2 < EMB; e2++) {
            let acc = 0;
            const inPos = (b * CTX + c) * EMB + e2 - b * CTX * EMB; // = xo + e2
            const col = xo + e2;                   // W1 satırı
            for (let h = 0; h < HID; h++)
              acc += dz1[b * HID + h] * net.W1[col * HID + h];
            dEmb[ci * EMB + e2] += acc;
          }
        }
      }
      embOpt(dEmb, lr);

      if (s % 25 === 0 || s === steps) {
        const vl = valLoss();
        codenet.history.push({ step: s, loss, val: vl });
        if (onProgress) onProgress(s, steps, loss, vl);
        await new Promise(r => setTimeout(r, 0));
      }
    }

    codenet.chars = chars;
    codenet.charIdx = charIdx;
    codenet.emb = emb;
    codenet.net = net;
    codenet.trainedChars = trainData.length;
    codenet.ready = true;
    return codenet.history.at(-1);
  }

  function generate(prefix, maxLen = 120, temperature = 0.8, seed = 1) {
    if (!codenet.ready) return null;
    const { chars, charIdx, emb, net } = codenet;
    const V = chars.length;
    const rand = rng(seed >>> 0 || 1);
    let ctx = encode(prefix.slice(-CTX).padStart(CTX, "\n"), charIdx);
    let out = prefix;

    for (let i = 0; i < maxLen; i++) {
      const X = zeros(CTX * EMB);
      for (let c = 0; c < CTX; c++)
        X.set(emb.subarray(ctx[c] * EMB, ctx[c] * EMB + EMB), c * EMB);
      const P = net.forward(X, 1, null);
      // sıcaklık örneklemesi
      const logits = new Float64Array(V);
      let sum = 0;
      for (let v = 0; v < V; v++) {
        logits[v] = Math.pow(Math.max(1e-9, P[v]), 1 / temperature);
        sum += logits[v];
      }
      let r = rand() * sum, pick = 0;
      for (let v = 0; v < V; v++) { r -= logits[v]; if (r <= 0) { pick = v; break; } }
      const ch = chars[pick];
      if (pick === 0) break;
      out += ch;
      ctx = new Int32Array([...ctx.subarray(1), pick]);
      if (out.length - prefix.length > 4 && ch === "\n" && out.endsWith("\n\n")) break;
    }
    return out;
  }

  /* ============================================================
     3) WordNet — kelime düzeyi nöral dil modeli
     Bilgi tabanının Türkçe metinleri üzerinde eğitilir. Sözlük
     gerçek kelimelerden oluşur: üretilen her token gerçek bir
     kelimedir, dizilimini (hangi kelimeden sonra ne gelir) ağ
     kendisi öğrenir. Mimari CodeNet ile aynı: embedding + MLP.
     ============================================================ */
  const WCTX = 6, WEMB = 24, WHID = 72, WVOCAB = 1000;
  const wordnet = {
    ready: false, words: null, wordIdx: null,
    emb: null, net: null, history: [], trainedWords: 0
  };

  function wordTokens(text) {
    return (text || "").toLocaleLowerCase("tr")
      .replace(/[^a-zçğıöşü0-9.\s]/gi, " ")
      .replace(/\./g, " . ")
      .split(/\s+/).filter(Boolean);
  }

  // Kelime istatistikleri: trigram/bigram sayımları. Üretimde nöral
  // dağılımla HARMANLANIR — istatistik yerel akıcılığı, ağ genellemeyi
  // sağlar (Bengio 2003 nöral dil modelinin klasik reçetesi).
  const wordstats = { tri: new Map(), bi: new Map(), ready: false };

  function buildWordStats(texts) {
    wordstats.tri = new Map();
    wordstats.bi = new Map();
    const stream = [];
    texts.forEach(t => { stream.push(...wordTokens(t), "."); });
    for (let i = 2; i < stream.length; i++) {
      const w1 = stream[i - 2], w2 = stream[i - 1], w3 = stream[i];
      const tk = w1 + " " + w2;
      let tm = wordstats.tri.get(tk);
      if (!tm) { tm = { total: 0, m: new Map() }; wordstats.tri.set(tk, tm); }
      tm.m.set(w3, (tm.m.get(w3) || 0) + 1); tm.total++;
      let bm = wordstats.bi.get(w2);
      if (!bm) { bm = { total: 0, m: new Map() }; wordstats.bi.set(w2, bm); }
      bm.m.set(w3, (bm.m.get(w3) || 0) + 1); bm.total++;
    }
    wordstats.ready = true;
    return stream.length;
  }

  async function trainWordNet(texts, opts = {}) {
    const { steps = 700, batch = 32, lr = 0.006, onProgress } = opts;
    buildWordStats(texts);   // üretimde harmanlanacak istatistikler
    const stream = [];
    texts.forEach(t => { stream.push(...wordTokens(t), "."); });

    // Sözlük: en sık WVOCAB-1 kelime; 0 = bilinmeyen (UNK)
    const freq = new Map();
    stream.forEach(w => freq.set(w, (freq.get(w) || 0) + 1));
    const words = ["<?>", ...[...freq.entries()]
      .sort((a, b) => b[1] - a[1]).slice(0, WVOCAB - 1).map(e => e[0])];
    const wordIdx = new Map(words.map((w, i) => [w, i]));
    const V = words.length;
    const data = new Int32Array(stream.length);
    for (let i = 0; i < stream.length; i++) data[i] = wordIdx.get(stream[i]) ?? 0;

    const cut = Math.floor(data.length * 0.93);
    const trainData = data.subarray(0, cut);
    const valData = data.subarray(cut);

    const rand = rng(2024);
    const emb = randInit(V * WEMB, 0.08, rand);
    const embOpt = adam(emb);
    const net = createMLP(WCTX * WEMB, WHID, V, 11);

    function makeBatch(src, B, r) {
      const X = zeros(B * WCTX * WEMB);
      const idxs = new Int32Array(B * WCTX);
      const y = new Int32Array(B);
      for (let b = 0; b < B; b++) {
        // hedefi UNK olmayan bir pencere bul (en fazla 8 deneme)
        let pos = 0;
        for (let tries = 0; tries < 8; tries++) {
          pos = WCTX + Math.floor(r() * (src.length - WCTX - 1));
          if (src[pos] !== 0) break;
        }
        for (let c = 0; c < WCTX; c++) {
          const wi = src[pos - WCTX + c];
          idxs[b * WCTX + c] = wi;
          X.set(emb.subarray(wi * WEMB, wi * WEMB + WEMB), (b * WCTX + c) * WEMB);
        }
        y[b] = src[pos];
      }
      return { X, y, idxs };
    }

    function valLoss() {
      // Deterministik doğrulama seti: her ölçümde AYNI 128 pencere —
      // metrik gürültüsü olmadan gerçek genelleme takibi
      const r = rng(3);
      const B = 128;
      const { X, y } = makeBatch(valData, B, r);
      const P = net.forward(X, B, null);
      let L = 0;
      for (let b = 0; b < B; b++) L += -Math.log(Math.max(1e-9, P[b * V + y[b]]));
      return L / B;
    }

    wordnet.history = [];
    const DROPOUT = 0.15;   // ezber karşıtı düzenlileştirme
    let bestVal = Infinity, bestSnapshot = null;
    for (let s = 1; s <= steps; s++) {
      const { X, y, idxs } = makeBatch(trainData, batch, rand);
      const { loss, dz1 } = net.trainStep(X, y, batch, lr, DROPOUT);

      // embedding geri yayılımı (CodeNet ile aynı desen)
      const dEmb = zeros(emb.length);
      for (let b = 0; b < batch; b++) {
        for (let c = 0; c < WCTX; c++) {
          const wi = idxs[b * WCTX + c];
          const xo = c * WEMB;
          for (let e2 = 0; e2 < WEMB; e2++) {
            let acc = 0;
            const col = xo + e2;
            for (let h = 0; h < WHID; h++)
              acc += dz1[b * WHID + h] * net.W1[col * WHID + h];
            dEmb[wi * WEMB + e2] += acc;
          }
        }
      }
      embOpt(dEmb, lr);

      if (s % 20 === 0 || s === steps) {
        const vl = valLoss();
        wordnet.history.push({ step: s, loss, val: vl });
        // en iyi doğrulama anının ağırlıklarını sakla (erken durdurma ruhu)
        if (vl < bestVal) {
          bestVal = vl;
          bestSnapshot = {
            emb: Float32Array.from(emb),
            W1: Float32Array.from(net.W1), b1: Float32Array.from(net.b1),
            W2: Float32Array.from(net.W2), b2: Float32Array.from(net.b2)
          };
        }
        if (onProgress) onProgress(s, steps, loss, vl);
        await new Promise(r => setTimeout(r, 0));
      }
    }

    // Aşırı öğrenmeye karşı: doğrulaması en iyi ağırlıklara geri dön
    if (bestSnapshot) {
      emb.set(bestSnapshot.emb);
      net.W1.set(bestSnapshot.W1); net.b1.set(bestSnapshot.b1);
      net.W2.set(bestSnapshot.W2); net.b2.set(bestSnapshot.b2);
    }

    wordnet.words = words;
    wordnet.wordIdx = wordIdx;
    wordnet.emb = emb;
    wordnet.net = net;
    wordnet.trainedWords = trainData.length;
    wordnet.ready = true;
    return wordnet.history.at(-1);
  }

  function generateWords(prefix, maxWords = 40, temperature = 0.85, seed = 1) {
    if (!wordnet.ready) return null;
    const { words, wordIdx, emb, net } = wordnet;
    const V = words.length;
    const rand = rng(seed >>> 0 || 1);

    const pre = wordTokens(prefix);
    let ctx = new Int32Array(WCTX);
    for (let c = 0; c < WCTX; c++) {
      const w = pre[pre.length - WCTX + c];
      ctx[c] = (w != null ? wordIdx.get(w) : null) ?? wordIdx.get(".") ?? 0;
    }

    const out = [...pre];
    const recent = [];             // tekrar cezası penceresi
    let sentences = 0;
    for (let i = 0; i < maxWords; i++) {
      // 1) Nöral dağılım
      const X = zeros(WCTX * WEMB);
      for (let c = 0; c < WCTX; c++)
        X.set(emb.subarray(ctx[c] * WEMB, ctx[c] * WEMB + WEMB), c * WEMB);
      const P = net.forward(X, 1, null);

      // 2) İstatistiksel dağılım: trigram varsa güçlü, yoksa bigram
      const l1 = out[out.length - 2] || ".", l2 = out[out.length - 1] || ".";
      const tri = wordstats.ready ? wordstats.tri.get(l1 + " " + l2) : null;
      const bi = wordstats.ready ? wordstats.bi.get(l2) : null;
      const stat = tri || bi;
      const lambda = tri ? 0.5 : (bi ? 0.35 : 0);   // harman ağırlığı

      // 3) Harmanla + sıcaklık + tekrar cezası
      const mixed = new Float64Array(V);
      for (let v = 1; v < V; v++) {   // 0 (UNK) asla örneklenmez
        let p = (1 - lambda) * P[v];
        if (stat) p += lambda * ((stat.m.get(words[v]) || 0) / stat.total);
        let l = Math.pow(Math.max(1e-9, p), 1 / temperature);
        if (recent.includes(v)) l *= 0.12;
        mixed[v] = l;
      }

      // 4) Nucleus (top-p) örnekleme: kümülatif %92'lik çekirdekten seç —
      //    dağılımın saçma uzun kuyruğu kesilir
      const order = [];
      for (let v = 1; v < V; v++) if (mixed[v] > 0) order.push(v);
      order.sort((a, b) => mixed[b] - mixed[a]);
      let total = 0;
      for (const v of order) total += mixed[v];
      const nucleus = [];
      let cum = 0;
      for (const v of order) {
        nucleus.push(v);
        cum += mixed[v];
        if (cum / total >= 0.92) break;
      }
      let r = rand() * cum, pick = nucleus[0];
      for (const v of nucleus) { r -= mixed[v]; if (r <= 0) { pick = v; break; } }

      const w = words[pick];
      out.push(w);
      recent.push(pick);
      if (recent.length > 4) recent.shift();
      ctx = new Int32Array([...ctx.subarray(1), pick]);
      if (w === ".") { sentences++; if (sentences >= 2 && i > 12) break; }
    }
    // noktalama düzelt: " ." → ".", ard arda noktaları tekle, cümle başları büyük
    return out.join(" ").replace(/\s+\./g, ".").replace(/\.{2,}/g, ".")
      .replace(/(^|\. )([a-zçğıöşü])/g, (m, p, ch) => p + ch.toLocaleUpperCase("tr"));
  }

  const NNW_KEY = "vega_nn_w1";

  function saveWordNet() {
    if (!wordnet.ready) return false;
    try {
      localStorage.setItem(NNW_KEY, JSON.stringify({
        v: 1, words: wordnet.words, ctx: WCTX, embDim: WEMB, hid: WHID,
        emb: f32ToB64(wordnet.emb),
        W1: f32ToB64(wordnet.net.W1), b1: f32ToB64(wordnet.net.b1),
        W2: f32ToB64(wordnet.net.W2), b2: f32ToB64(wordnet.net.b2),
        history: wordnet.history, trainedWords: wordnet.trainedWords
      }));
      return true;
    } catch (e) { return false; }
  }

  function loadWordNet() {
    try {
      const raw = localStorage.getItem(NNW_KEY);
      if (!raw) return false;
      const d = JSON.parse(raw);
      if (d.v !== 1 || d.ctx !== WCTX || d.embDim !== WEMB || d.hid !== WHID) return false;
      const V = d.words.length;
      wordnet.words = d.words;
      wordnet.wordIdx = new Map(d.words.map((w, i) => [w, i]));
      wordnet.emb = b64ToF32(d.emb);
      wordnet.net = createMLP(WCTX * WEMB, WHID, V, 11);
      wordnet.net.W1.set(b64ToF32(d.W1)); wordnet.net.b1.set(b64ToF32(d.b1));
      wordnet.net.W2.set(b64ToF32(d.W2)); wordnet.net.b2.set(b64ToF32(d.b2));
      wordnet.history = d.history || [];
      wordnet.trainedWords = d.trainedWords || 0;
      wordnet.ready = true;
      return true;
    } catch (e) { return false; }
  }

  function clearWordNet() {
    localStorage.removeItem(NNW_KEY);
    wordnet.ready = false;
    wordnet.history = [];
  }

  /* ============================================================
     3.5) EmbedNet — word2vec (skip-gram + negative sampling)
     Kelimelerin ANLAM vektörlerini bilgi tabanından öğrenir:
     birlikte geçen kelimeler vektör uzayında yakınlaşır. Öğrenilen
     vektörler aramanın anlamsal yeniden sıralamasında kullanılır —
     elle yazılmış eşanlamlı listesinin nöral karşılığı.
     ============================================================ */
  const EMB_DIM = 64, EMB_VOCAB = 6000, EMB_WINDOW = 3, EMB_NEG = 5;
  const embed = {
    ready: false, vocab: null, words: null,
    Win: null, Wout: null, mean: null, trainedPairs: 0, lossHistory: []
  };

  // "All-but-the-top" düzeltmesi: tüm vektörlerin ortak sürüklenme yönü
  // (ortalama) çıkarılır — kosinüs benzerliği ancak o zaman ayrım yapar
  function computeEmbedMean() {
    const V = embed.words.length;
    const m = new Float32Array(EMB_DIM);
    for (let i = 0; i < V; i++) {
      const off = i * EMB_DIM;
      for (let d = 0; d < EMB_DIM; d++) m[d] += embed.Win[off + d];
    }
    for (let d = 0; d < EMB_DIM; d++) m[d] /= V;
    embed.mean = m;
  }

  function centeredVec(i) {
    const off = i * EMB_DIM;
    const v = new Float32Array(EMB_DIM);
    for (let d = 0; d < EMB_DIM; d++) v[d] = embed.Win[off + d] - embed.mean[d];
    return v;
  }

  function sigmoid(x) { return 1 / (1 + Math.exp(-x)); }

  async function trainEmbed(texts, opts = {}) {
    const { pairs = 900000, lr0 = 0.04, onProgress } = opts;
    // Kök akışı: durak kelimeler ve saf sayılar atılır (sürüm numaraları
    // her bağlamda geçtiği için anlam uzayını kirletir)
    const stream = [];
    texts.forEach(t => stream.push(...tokenizeTr(t).filter(w => !/^\d+$/.test(w))));

    const freq = new Map();
    stream.forEach(w => freq.set(w, (freq.get(w) || 0) + 1));
    const words = [...freq.entries()].filter(e => e[1] >= 2)
      .sort((a, b) => b[1] - a[1]).slice(0, EMB_VOCAB).map(e => e[0]);
    const vocab = new Map(words.map((w, i) => [w, i]));
    const V = words.length;

    // SIK KELİME ALT-ÖRNEKLEME (word2vec'in t parametresi): "destek",
    // "chrome" gibi her yerde geçen şablon kelimeleri seyreltilir —
    // yoksa tüm vektörler aynı yöne çöker
    const subRand = rng(555);
    const total = stream.length;
    const T = 1e-3;
    const data = [];
    stream.forEach(w => {
      const i = vocab.get(w);
      if (i == null) return;
      const f = freq.get(w) / total;
      const keep = Math.min(1, Math.sqrt(T / f) + T / f);
      if (subRand() < keep) data.push(i);
    });

    // Negatif örnekleme tablosu (frekans^0.75 dağılımı — word2vec standardı)
    const negTable = new Int32Array(100000);
    {
      let total = 0;
      const pw = words.map(w => Math.pow(freq.get(w), 0.75));
      pw.forEach(p => total += p);
      let idx = 0, acc = 0;
      for (let i = 0; i < V; i++) {
        acc += pw[i] / total;
        while (idx < negTable.length && idx / negTable.length < acc) negTable[idx++] = i;
      }
      while (idx < negTable.length) negTable[idx++] = V - 1;
    }

    const rand = rng(31337);
    const Win = randInit(V * EMB_DIM, 0.5 / EMB_DIM, rand);
    const Wout = zeros(V * EMB_DIM);

    embed.lossHistory = [];
    let lossAcc = 0, lossN = 0;
    const CHUNK = 8000;

    for (let p = 0; p < pairs; p++) {
      const lr = lr0 * (1 - p / pairs) + 0.002;
      // rastgele merkez + pencere içi bağlam
      const c = 1 + Math.floor(rand() * (data.length - 2));
      const off = 1 + Math.floor(rand() * EMB_WINDOW);
      const t = rand() < 0.5 ? c - off : c + off;
      if (t < 0 || t >= data.length) continue;
      const center = data[c], target = data[t];
      const ci = center * EMB_DIM;

      const gradIn = new Float32Array(EMB_DIM);
      // 1 pozitif + EMB_NEG negatif örnek
      for (let s = 0; s < EMB_NEG + 1; s++) {
        const label = s === 0 ? 1 : 0;
        const out = s === 0 ? target
          : negTable[Math.floor(rand() * negTable.length)];
        if (label === 0 && out === target) continue;
        const oi = out * EMB_DIM;
        let dot = 0;
        for (let d = 0; d < EMB_DIM; d++) dot += Win[ci + d] * Wout[oi + d];
        const pred = sigmoid(dot);
        const g = (pred - label) * lr;         // gerçek gradyan (lojistik)
        lossAcc += label === 1 ? -Math.log(Math.max(1e-9, pred))
                               : -Math.log(Math.max(1e-9, 1 - pred));
        lossN++;
        for (let d = 0; d < EMB_DIM; d++) {
          gradIn[d] += g * Wout[oi + d];
          Wout[oi + d] -= g * Win[ci + d];
        }
      }
      for (let d = 0; d < EMB_DIM; d++) Win[ci + d] -= gradIn[d];

      if (p % CHUNK === 0 && p > 0) {
        const L = lossAcc / Math.max(1, lossN);
        embed.lossHistory.push({ step: p, loss: L });
        lossAcc = 0; lossN = 0;
        if (onProgress) onProgress(p, pairs, L);
        await new Promise(r => setTimeout(r, 0));   // UI donmasın
      }
    }

    embed.vocab = vocab;
    embed.words = words;
    embed.Win = Win;
    embed.Wout = Wout;
    embed.trainedPairs = pairs;
    computeEmbedMean();
    embed.ready = true;
    return embed.lossHistory.at(-1);
  }

  // Metni öğrenilmiş vektörlerin ortalamasına göm (birim normlu)
  function textVec(text) {
    if (!embed.ready) return null;
    const v = new Float32Array(EMB_DIM);
    let n = 0;
    tokenizeTr(text).forEach(w => {
      const i = embed.vocab.get(w);
      if (i == null) return;
      const cv = centeredVec(i);
      for (let d = 0; d < EMB_DIM; d++) v[d] += cv[d];
      n++;
    });
    if (n === 0) return null;
    let norm = 0;
    for (let d = 0; d < EMB_DIM; d++) norm += v[d] * v[d];
    norm = Math.sqrt(norm) || 1;
    for (let d = 0; d < EMB_DIM; d++) v[d] /= norm;
    return v;
  }

  function vecCos(a, b) {
    let s = 0;
    for (let d = 0; d < EMB_DIM; d++) s += a[d] * b[d];
    return s;
  }

  // Bir kelimenin öğrenilmiş en yakın komşuları — modelin ne öğrendiğinin
  // doğrudan kanıtı ("dizi" → array, eleman... gibi)
  function nearestWords(word, k = 6) {
    if (!embed.ready) return [];
    const i = embed.vocab.get(tokenizeTr(word)[0] || "");
    if (i == null) return [];
    const q = centeredVec(i);
    const qn = Math.sqrt(q.reduce((s, x) => s + x * x, 0)) || 1;
    const out = [];
    for (let j = 0; j < embed.words.length; j++) {
      if (j === i) continue;
      const w = centeredVec(j);
      let dot = 0, wn = 0;
      for (let d = 0; d < EMB_DIM; d++) { dot += q[d] * w[d]; wn += w[d] * w[d]; }
      out.push([embed.words[j], dot / (qn * Math.sqrt(wn) || 1)]);
    }
    return out.sort((a, b) => b[1] - a[1]).slice(0, k)
      .map(([w, s]) => ({ word: w, sim: Math.round(s * 100) / 100 }));
  }

  const EMBED_KEY = "vega_embed_v1";
  function saveEmbed() {
    if (!embed.ready) return false;
    try {
      localStorage.setItem(EMBED_KEY, JSON.stringify({
        v: 1, dim: EMB_DIM, words: embed.words,
        Win: f32ToB64(embed.Win),
        trainedPairs: embed.trainedPairs, lossHistory: embed.lossHistory
      }));
      return true;
    } catch (e) { return false; }
  }
  function loadEmbed() {
    try {
      const raw = localStorage.getItem(EMBED_KEY);
      if (!raw) return false;
      const d = JSON.parse(raw);
      if (d.v !== 1 || d.dim !== EMB_DIM) return false;
      embed.words = d.words;
      embed.vocab = new Map(d.words.map((w, i) => [w, i]));
      embed.Win = b64ToF32(d.Win);
      embed.Wout = null;   // yalnız giriş vektörleri gerekir
      embed.trainedPairs = d.trainedPairs || 0;
      embed.lossHistory = d.lossHistory || [];
      computeEmbedMean();
      embed.ready = true;
      return true;
    } catch (e) { return false; }
  }
  function clearEmbed() { localStorage.removeItem(EMBED_KEY); embed.ready = false; }
  function embedInfo() {
    return {
      ready: embed.ready,
      vocab: embed.words ? embed.words.length : 0,
      dim: EMB_DIM,
      params: embed.words ? embed.words.length * EMB_DIM * (embed.Wout ? 2 : 1) : 0,
      trainedPairs: embed.trainedPairs,
      lossHistory: embed.lossHistory
    };
  }

  /* ============================================================
     4) LYRA KİŞİLİKLERİ — uzmanlaşmış kelime dil modelleri
     Her Lyra bağımsız bir sinir ağıdır; kendi veri karışımı, kendi
     sözlüğü, kendi ağırlıkları vardır.
     - META-ÖĞRENME: Lyra nasıl öğreneceğini kendisi seçer — birden
       çok hiperparametre adayını (öğrenme hızı × ağ genişliği) kısa
       denemelerle eğitir, doğrulama kaybıyla ölçer, kazananla tam
       eğitim yapar. Seçim koda gömülü değildir, ölçümden çıkar.
     - EZBER KARŞITI: dropout + erken durdurma + ÖZGÜNLÜK metriği
       (üretilen 3-kelime gruplarının eğitim verisinde birebir
       GEÇMEME oranı — ezber/üretim ayrımının dürüst ölçüsü).
     ============================================================ */
  function createWordLM(name, cfgIn = {}) {
    const S = {
      name, ready: false, words: null, wordIdx: null,
      emb: null, net: null, history: [], trainedWords: 0,
      cfg: null, trials: [],            // meta-öğrenme kayıtları
      tri: new Map(), bi: new Map(),    // harman + özgünlük istatistikleri
      ctx: cfgIn.ctx ?? 6, embDim: cfgIn.embDim ?? 24,
      batch: cfgIn.batch ?? 32,
      fullSteps: cfgIn.steps ?? 650,
      metaSteps: cfgIn.metaSteps ?? 130,
      candOverride: cfgIn.candidates ?? null
    };

    function buildStats(stream) {
      S.tri = new Map(); S.bi = new Map();
      for (let i = 2; i < stream.length; i++) {
        const w1 = stream[i - 2], w2 = stream[i - 1], w3 = stream[i];
        const tk = w1 + " " + w2;
        let tm = S.tri.get(tk);
        if (!tm) { tm = { total: 0, m: new Map() }; S.tri.set(tk, tm); }
        tm.m.set(w3, (tm.m.get(w3) || 0) + 1); tm.total++;
        let bm = S.bi.get(w2);
        if (!bm) { bm = { total: 0, m: new Map() }; S.bi.set(w2, bm); }
        bm.m.set(w3, (bm.m.get(w3) || 0) + 1); bm.total++;
      }
    }

    function toStream(texts) {
      const stream = [];
      texts.forEach(t => { stream.push(...wordTokens(t), "."); });
      return stream;
    }

    // Tek deneme eğitimi: verilen hiperparametrelerle steps adım
    async function trainWith(stream, hp, steps, dropout, onStep) {
      const freq = new Map();
      stream.forEach(w => freq.set(w, (freq.get(w) || 0) + 1));
      const words = ["<?>", ...[...freq.entries()]
        .sort((a, b) => b[1] - a[1]).slice(0, hp.vocab - 1).map(e => e[0])];
      const wordIdx = new Map(words.map((w, i) => [w, i]));
      const V = words.length;
      const data = new Int32Array(stream.length);
      for (let i = 0; i < stream.length; i++) data[i] = wordIdx.get(stream[i]) ?? 0;
      const cut = Math.floor(data.length * 0.93);
      const trainData = data.subarray(0, cut), valData = data.subarray(cut);

      const rand = rng(777);
      const emb = randInit(V * S.embDim, 0.08, rand);
      const embOpt = adam(emb);
      const net = createMLP(S.ctx * S.embDim, hp.hid, V, 13);

      function makeBatch(src, B, r) {
        const X = zeros(B * S.ctx * S.embDim);
        const idxs = new Int32Array(B * S.ctx);
        const y = new Int32Array(B);
        for (let b = 0; b < B; b++) {
          let pos = 0;
          for (let t = 0; t < 8; t++) {
            pos = S.ctx + Math.floor(r() * (src.length - S.ctx - 1));
            if (src[pos] !== 0) break;
          }
          for (let c = 0; c < S.ctx; c++) {
            const wi = src[pos - S.ctx + c];
            idxs[b * S.ctx + c] = wi;
            X.set(emb.subarray(wi * S.embDim, wi * S.embDim + S.embDim),
                  (b * S.ctx + c) * S.embDim);
          }
          y[b] = src[pos];
        }
        return { X, y, idxs };
      }
      function valLoss() {
        const r = rng(3), B = 128;
        const { X, y } = makeBatch(valData, B, r);
        const P = net.forward(X, B, null);
        let L = 0;
        for (let b = 0; b < B; b++) L += -Math.log(Math.max(1e-9, P[b * V + y[b]]));
        return L / B;
      }

      const history = [];
      const B = S.batch;
      let bestVal = Infinity, snap = null;
      for (let s = 1; s <= steps; s++) {
        const { X, y, idxs } = makeBatch(trainData, B, rand);
        const { loss, dz1 } = net.trainStep(X, y, B, hp.lr, dropout);
        // embedding geri yayılımı
        const dEmb = zeros(emb.length);
        for (let b = 0; b < B; b++) {
          for (let c = 0; c < S.ctx; c++) {
            const wi = idxs[b * S.ctx + c];
            for (let e2 = 0; e2 < S.embDim; e2++) {
              let acc = 0;
              const col = c * S.embDim + e2;
              for (let h = 0; h < hp.hid; h++)
                acc += dz1[b * hp.hid + h] * net.W1[col * hp.hid + h];
              dEmb[wi * S.embDim + e2] += acc;
            }
          }
        }
        embOpt(dEmb, hp.lr);

        if (s % 25 === 0 || s === steps) {
          const vl = valLoss();
          history.push({ step: s, loss, val: vl });
          if (vl < bestVal) {
            bestVal = vl;
            snap = { emb: Float32Array.from(emb),
                     W1: Float32Array.from(net.W1), b1: Float32Array.from(net.b1),
                     W2: Float32Array.from(net.W2), b2: Float32Array.from(net.b2) };
          }
          if (onStep) onStep(s, steps, loss, vl);
          await new Promise(r => setTimeout(r, 0));
        }
      }
      if (snap) {
        emb.set(snap.emb);
        net.W1.set(snap.W1); net.b1.set(snap.b1);
        net.W2.set(snap.W2); net.b2.set(snap.b2);
      }
      return { words, wordIdx, emb, net, history, bestVal,
               trainedWords: trainData.length };
    }

    // META-ÖĞRENME: adayları dene → ölç → kazananla tam eğitim
    async function metaTrain(texts, opts = {}) {
      const { onProgress } = opts;
      const stream = toStream(texts);
      buildStats(stream);

      const candidates = S.candOverride || [
        { lr: 0.006, hid: 72, vocab: 1000 },
        { lr: 0.012, hid: 72, vocab: 1000 },
        { lr: 0.006, hid: 96, vocab: 1000 },
        { lr: 0.003, hid: 56, vocab: 1000 }
      ];
      S.trials = [];
      for (let i = 0; i < candidates.length; i++) {
        const hp = candidates[i];
        if (onProgress) onProgress("meta", i + 1, candidates.length,
          `deneme ${i + 1}/${candidates.length}: lr=${hp.lr} gizli=${hp.hid}`);
        const r = await trainWith(stream, hp, S.metaSteps, 0.15, null);
        S.trials.push({ ...hp, val: Math.round(r.bestVal * 1000) / 1000 });
      }
      S.trials.sort((a, b) => a.val - b.val);
      const winner = S.trials[0];
      if (onProgress) onProgress("meta-secim", 4, 4,
        `kazanan: lr=${winner.lr} gizli=${winner.hid} (val ${winner.val})`);

      const full = await trainWith(stream, winner, S.fullSteps, 0.15,
        (s, total, loss, vl) => {
          if (onProgress) onProgress("egitim", s, total,
            `tam eğitim ${s}/${total} · kayıp ${loss.toFixed(3)} · doğrulama ${vl.toFixed(3)}`);
        });

      Object.assign(S, {
        words: full.words, wordIdx: full.wordIdx, emb: full.emb, net: full.net,
        history: full.history, trainedWords: full.trainedWords,
        cfg: winner, ready: true
      });
      return { winner, bestVal: full.bestVal, trials: S.trials };
    }

    function generateFrom(prefix, maxWords = 40, temperature = 0.8, seed = 1) {
      if (!S.ready) return null;
      const { words, wordIdx, emb, net } = S;
      const V = words.length;
      const rand = rng(seed >>> 0 || 1);
      const pre = wordTokens(prefix);
      let ctx = new Int32Array(S.ctx);
      for (let c = 0; c < S.ctx; c++) {
        const w = pre[pre.length - S.ctx + c];
        ctx[c] = (w != null ? wordIdx.get(w) : null) ?? wordIdx.get(".") ?? 0;
      }
      const out = [...pre];
      const recent = [];
      let sentences = 0;
      for (let i = 0; i < maxWords; i++) {
        const X = zeros(S.ctx * S.embDim);
        for (let c = 0; c < S.ctx; c++)
          X.set(emb.subarray(ctx[c] * S.embDim, ctx[c] * S.embDim + S.embDim),
                c * S.embDim);
        const P = net.forward(X, 1, null);
        const l1 = out[out.length - 2] || ".", l2 = out[out.length - 1] || ".";
        const tri = S.tri.get(l1 + " " + l2), bi = S.bi.get(l2);
        const stat = tri || bi;
        const lambda = tri ? 0.5 : (bi ? 0.35 : 0);
        const mixed = new Float64Array(V);
        for (let v = 1; v < V; v++) {
          let p = (1 - lambda) * P[v];
          if (stat) p += lambda * ((stat.m.get(words[v]) || 0) / stat.total);
          let l = Math.pow(Math.max(1e-9, p), 1 / temperature);
          if (recent.includes(v)) l *= 0.12;
          mixed[v] = l;
        }
        const order = [];
        for (let v = 1; v < V; v++) if (mixed[v] > 0) order.push(v);
        order.sort((a, b) => mixed[b] - mixed[a]);
        let total = 0;
        for (const v of order) total += mixed[v];
        const nucleus = [];
        let cum = 0;
        for (const v of order) {
          nucleus.push(v); cum += mixed[v];
          if (cum / total >= 0.92) break;
        }
        let r = rand() * cum, pick = nucleus[0];
        for (const v of nucleus) { r -= mixed[v]; if (r <= 0) { pick = v; break; } }
        const w = words[pick];
        out.push(w);
        recent.push(pick);
        if (recent.length > 4) recent.shift();
        ctx = new Int32Array([...ctx.subarray(1), pick]);
        if (w === ".") { sentences++; if (sentences >= 2 && i > 12) break; }
      }
      const text = out.join(" ").replace(/\s+\./g, ".").replace(/\.{2,}/g, ".")
        .replace(/(^|\. )([a-zçğıöşü])/g, (m, p, ch) => p + ch.toLocaleUpperCase("tr"));
      return { text, novelty: noveltyOf(out) };
    }

    // ÖZGÜNLÜK: üretilen 3-kelime dizilerinin eğitim verisinde birebir
    // GEÇMEYENLERİNİN oranı. %0 = tam ezber, %100 = tamamen yeni dizilim.
    function noveltyOf(tokens) {
      let total = 0, novel = 0;
      for (let i = 2; i < tokens.length; i++) {
        const tm = S.tri.get(tokens[i - 2] + " " + tokens[i - 1]);
        total++;
        if (!tm || !tm.m.has(tokens[i])) novel++;
      }
      return total ? novel / total : 0;
    }

    function save(key) {
      if (!S.ready) return false;
      try {
        localStorage.setItem(key, JSON.stringify({
          v: 2, name: S.name, words: S.words, ctx: S.ctx, embDim: S.embDim,
          hid: S.cfg.hid, cfg: S.cfg, trials: S.trials,
          emb: f32ToB64(S.emb),
          W1: f32ToB64(S.net.W1), b1: f32ToB64(S.net.b1),
          W2: f32ToB64(S.net.W2), b2: f32ToB64(S.net.b2),
          history: S.history, trainedWords: S.trainedWords
        }));
        return true;
      } catch (e) { return false; }
    }

    function load(key, texts) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return false;
        const d = JSON.parse(raw);
        if (d.v !== 2 || d.ctx !== S.ctx || d.embDim !== S.embDim) return false;
        const V = d.words.length;
        S.words = d.words;
        S.wordIdx = new Map(d.words.map((w, i) => [w, i]));
        S.emb = b64ToF32(d.emb);
        S.net = createMLP(S.ctx * S.embDim, d.hid, V, 13);
        S.net.W1.set(b64ToF32(d.W1)); S.net.b1.set(b64ToF32(d.b1));
        S.net.W2.set(b64ToF32(d.W2)); S.net.b2.set(b64ToF32(d.b2));
        S.history = d.history || [];
        S.trainedWords = d.trainedWords || 0;
        S.cfg = d.cfg; S.trials = d.trials || [];
        if (texts) buildStats(toStream(texts));   // harman + özgünlük için
        S.ready = true;
        return true;
      } catch (e) { return false; }
    }

    // Büyük modeller için IndexedDB kalıcılığı — localStorage'ın ~5 MB
    // kotasına sığmayan ağırlıklar (typed array olarak, base64'süz) saklanır
    async function saveBig(key) {
      if (!S.ready) return false;
      try {
        await idbSet(key, {
          v: 3, name: S.name, ctx: S.ctx, embDim: S.embDim,
          hid: S.cfg.hid, cfgSel: S.cfg, trials: S.trials,
          words: S.words, emb: S.emb,
          W1: S.net.W1, b1: S.net.b1, W2: S.net.W2, b2: S.net.b2,
          history: S.history, trainedWords: S.trainedWords
        });
        return true;
      } catch (e) { return false; }
    }

    async function loadBig(key, texts) {
      try {
        const d = await idbGet(key);
        if (!d || d.v !== 3 || d.ctx !== S.ctx || d.embDim !== S.embDim) return false;
        const V = d.words.length;
        S.words = d.words;
        S.wordIdx = new Map(d.words.map((w, i) => [w, i]));
        S.emb = d.emb;
        S.net = createMLP(S.ctx * S.embDim, d.hid, V, 13);
        S.net.W1.set(d.W1); S.net.b1.set(d.b1);
        S.net.W2.set(d.W2); S.net.b2.set(d.b2);
        S.history = d.history || [];
        S.trainedWords = d.trainedWords || 0;
        S.cfg = d.cfgSel; S.trials = d.trials || [];
        if (texts) buildStats(toStream(texts));
        S.ready = true;
        return true;
      } catch (e) { return false; }
    }

    function infoShort() {
      return {
        ready: S.ready,
        params: S.net ? S.net.paramCount + (S.emb ? S.emb.length : 0) : 0,
        vocab: S.words ? S.words.length : 0,
        trainedWords: S.trainedWords,
        history: S.history,
        cfg: S.cfg, trials: S.trials,
        bestVal: S.history.length ? Math.min(...S.history.map(h => h.val)) : null
      };
    }

    return { metaTrain, generate: generateFrom, save, load, saveBig, loadBig,
             buildStats: texts => buildStats(toStream(texts)), info: infoShort };
  }

  /* ---------- IndexedDB yardımcıları ---------- */
  function idbOpen() {
    return new Promise((res, rej) => {
      const r = indexedDB.open("vega-models", 1);
      r.onupgradeneeded = () => r.result.createObjectStore("m");
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
  }
  async function idbSet(k, v) {
    const db = await idbOpen();
    return new Promise((res, rej) => {
      const tx = db.transaction("m", "readwrite");
      tx.objectStore("m").put(v, k);
      tx.oncomplete = () => { db.close(); res(true); };
      tx.onerror = () => { db.close(); rej(tx.error); };
    });
  }
  async function idbGet(k) {
    const db = await idbOpen();
    return new Promise((res, rej) => {
      const tx = db.transaction("m", "readonly");
      const rq = tx.objectStore("m").get(k);
      rq.onsuccess = () => { db.close(); res(rq.result); };
      rq.onerror = () => { db.close(); rej(rq.error); };
    });
  }

  // Kişilik kayıtları — XL: en büyük model (~0.9M parametre), tüm çok
  // dilli derlemle eğitilir, IndexedDB'de saklanır
  const lyra = {
    "1":   { lm: createWordLM("Lyra-1 · Kod & Matematik"), key: "vega_lyra_1" },
    "1.5": { lm: createWordLM("Lyra-1.5 · Sözcük & Kavram"), key: "vega_lyra_15" },
    "xl":  { lm: createWordLM("Vega-XL · Büyük Model", {
               ctx: 8, embDim: 40, batch: 24, steps: 420, metaSteps: 70,
               candidates: [
                 { lr: 0.006, hid: 192, vocab: 3500 },
                 { lr: 0.012, hid: 192, vocab: 3500 }
               ]
             }), key: "vega_xl_v1", big: true }
  };

  async function trainLyra(ver, texts, opts) {
    const L = lyra[ver];
    if (!L) throw new Error("Bilinmeyen Lyra sürümü: " + ver);
    const res = await L.lm.metaTrain(texts, opts);
    if (L.big) await L.lm.saveBig(L.key);
    else L.lm.save(L.key);
    return res;
  }
  async function loadXL(texts) {
    return lyra.xl.lm.loadBig(lyra.xl.key, texts);
  }
  function generateLyra(ver, prefix, maxWords, temp, seed) {
    const L = lyra[ver];
    return L && L.lm.info().ready
      ? L.lm.generate(prefix, maxWords, temp, seed) : null;
  }
  function loadLyra(ver, texts) {
    const L = lyra[ver];
    return L ? L.lm.load(L.key, texts) : false;
  }
  function clearLyra() {
    Object.values(lyra).forEach(L => {
      if (L.big) { idbSet(L.key, null).catch(() => {}); }
      else localStorage.removeItem(L.key);
    });
  }
  function lyraInfo() {
    const out = {};
    for (const [ver, L] of Object.entries(lyra)) out[ver] = L.lm.info();
    return out;
  }

  /* ---------- Kalıcılık (base64 Float32) ---------- */
  function f32ToB64(f) {
    const u8 = new Uint8Array(f.buffer, f.byteOffset, f.byteLength);
    let s = "";
    for (let i = 0; i < u8.length; i += 8192)
      s += String.fromCharCode(...u8.subarray(i, i + 8192));
    return btoa(s);
  }
  function b64ToF32(b) {
    const s = atob(b);
    const u8 = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) u8[i] = s.charCodeAt(i);
    return new Float32Array(u8.buffer);
  }

  const NN_KEY = "vega_nn_v1";

  function saveCodeNet() {
    if (!codenet.ready) return false;
    try {
      localStorage.setItem(NN_KEY, JSON.stringify({
        v: 1, chars: codenet.chars, ctx: CTX, embDim: EMB, hid: HID,
        emb: f32ToB64(codenet.emb),
        W1: f32ToB64(codenet.net.W1), b1: f32ToB64(codenet.net.b1),
        W2: f32ToB64(codenet.net.W2), b2: f32ToB64(codenet.net.b2),
        history: codenet.history, trainedChars: codenet.trainedChars
      }));
      return true;
    } catch (e) { return false; }
  }

  function loadCodeNet() {
    try {
      const raw = localStorage.getItem(NN_KEY);
      if (!raw) return false;
      const d = JSON.parse(raw);
      if (d.v !== 1 || d.ctx !== CTX || d.embDim !== EMB || d.hid !== HID) return false;
      const V = d.chars.length;
      codenet.chars = d.chars;
      codenet.charIdx = new Map(d.chars.map((c, i) => [c, i]));
      codenet.emb = b64ToF32(d.emb);
      codenet.net = createMLP(CTX * EMB, HID, V, 7);
      codenet.net.W1.set(b64ToF32(d.W1)); codenet.net.b1.set(b64ToF32(d.b1));
      codenet.net.W2.set(b64ToF32(d.W2)); codenet.net.b2.set(b64ToF32(d.b2));
      codenet.history = d.history || [];
      codenet.trainedChars = d.trainedChars || 0;
      codenet.ready = true;
      return true;
    } catch (e) { return false; }
  }

  function clearCodeNet() {
    localStorage.removeItem(NN_KEY);
    codenet.ready = false;
    codenet.history = [];
  }

  function info() {
    return {
      intentReady: intent.ready,
      intentAcc: intent.valAcc,
      intentParams: intent.net ? intent.net.paramCount : 0,
      intentLabels: intent.labels || [],
      intentTrainSize: intent.trainSize,
      codeReady: codenet.ready,
      codeParams: codenet.net
        ? codenet.net.paramCount + (codenet.emb ? codenet.emb.length : 0) : 0,
      codeHistory: codenet.history,
      codeVocab: codenet.chars ? codenet.chars.length : 0,
      codeTrainedChars: codenet.trainedChars,
      wordReady: wordnet.ready,
      wordParams: wordnet.net
        ? wordnet.net.paramCount + (wordnet.emb ? wordnet.emb.length : 0) : 0,
      wordHistory: wordnet.history,
      wordVocab: wordnet.words ? wordnet.words.length : 0,
      wordTrainedWords: wordnet.trainedWords,
      ctx: CTX, emb: EMB, hid: HID
    };
  }

  return { trainIntent, predictIntent, trainCodeNet, generate,
           trainWordNet, generateWords, buildWordStats,
           saveWordNet, loadWordNet, clearWordNet,
           saveCodeNet, loadCodeNet, clearCodeNet, info,
           trainLyra, generateLyra, loadLyra, clearLyra, lyraInfo, loadXL,
           trainEmbed, textVec, vecCos, nearestWords,
           saveEmbed, loadEmbed, clearEmbed, embedInfo,
           _mlp: createMLP };   // testler için
})();
