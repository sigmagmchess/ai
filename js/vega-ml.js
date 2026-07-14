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

    function forward(X, B, cache) {
      const z1 = zeros(B * HID);
      matmul(X, W1, B, IN, HID, z1);
      for (let b = 0; b < B; b++)
        for (let h = 0; h < HID; h++) z1[b * HID + h] += b1[h];
      const a1 = zeros(B * HID);
      for (let i = 0; i < z1.length; i++) a1[i] = z1[i] > 0 ? z1[i] : 0;
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
    function trainStep(X, y, B, lr) {
      const cache = {};
      const P = forward(X, B, cache);
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
      for (let i = 0; i < da1.length; i++) dz1[i] = cache.z1[i] > 0 ? da1[i] : 0;
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
  const WCTX = 6, WEMB = 24, WHID = 64, WVOCAB = 800;
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

  async function trainWordNet(texts, opts = {}) {
    const { steps = 550, batch = 32, lr = 0.006, onProgress } = opts;
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
    let bestVal = Infinity, bestSnapshot = null;
    for (let s = 1; s <= steps; s++) {
      const { X, y, idxs } = makeBatch(trainData, batch, rand);
      const { loss, dz1 } = net.trainStep(X, y, batch, lr);

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
      const X = zeros(WCTX * WEMB);
      for (let c = 0; c < WCTX; c++)
        X.set(emb.subarray(ctx[c] * WEMB, ctx[c] * WEMB + WEMB), c * WEMB);
      const P = net.forward(X, 1, null);
      const logits = new Float64Array(V);
      let sum = 0;
      for (let v = 1; v < V; v++) {   // 0 (UNK) asla örneklenmez
        let l = Math.pow(Math.max(1e-9, P[v]), 1 / temperature);
        if (recent.includes(v)) l *= 0.12;   // tekrar cezası: "vs vs" önlenir
        logits[v] = l;
        sum += l;
      }
      let r = rand() * sum, pick = 1;
      for (let v = 1; v < V; v++) { r -= logits[v]; if (r <= 0) { pick = v; break; } }
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
           trainWordNet, generateWords, saveWordNet, loadWordNet, clearWordNet,
           saveCodeNet, loadCodeNet, clearCodeNet, info,
           _mlp: createMLP };   // testler için
})();
