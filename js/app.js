/* =========================================================
   VEGA — Uygulama Katmanı (UI bağlantıları)
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  VegaEngine.load();

  const heroCount = document.getElementById("hero-count");
  if (heroCount) heroCount.textContent =
    VegaEngine.getStats().docCount.toLocaleString("tr-TR");

  initStars();
  initTabs();
  initChat();
  initImageStudio();
  initMusicStudio();
  initWiki();
  initAdmin();
  initNeural();
});

/* ==================== NÖRAL ÇEKİRDEK (gerçek ML) ==================== */
function initNeural() {
  // Kaydedilmiş sinir ağları varsa yükle
  const hadCode = VegaML.loadCodeNet();
  const hadWord = VegaML.loadWordNet();
  if (hadCode || hadWord) {
    $("#nn-label").textContent =
      `Kaydedilmiş ağırlıklar yüklendi (${[hadCode && "kod ağı", hadWord && "kelime ağı"]
        .filter(Boolean).join(" + ")}) — sohbette "üret:" / "kelime:" hazır.`;
    $("#nn-fill").style.width = "100%";
  }

  // Niyet sınıflandırıcısını arka planda eğit — gerçek gradyan inişi,
  // bilgi tabanındaki (anahtar kelime → kategori) çiftleri üzerinde
  $("#status-sub").textContent = "niyet ağı eğitiliyor…";
  setTimeout(async () => {
    const acc = await VegaML.trainIntent(VegaEngine.getDocs());
    $("#status-sub").textContent =
      `niyet ağı hazır · doğrulama %${Math.round(acc * 100)}`;
    renderNeuralCard();
  }, 350);

  renderNeuralCard();

  $("#nn-train-btn").addEventListener("click", async () => {
    const btn = $("#nn-train-btn");
    btn.disabled = true;
    setStatus("Sinir ağı eğitiliyor…", true);
    const corpus = [];
    // gerçek OSS derleminden örneklem — karakter modeli bununla eğitilir
    if (typeof VEGA_BIG_CORPUS !== "undefined") {
      const step = Math.max(1, Math.floor(VEGA_BIG_CORPUS.length / 2500));
      for (let i = 0; i < VEGA_BIG_CORPUS.length && corpus.length < 2500; i += step)
        corpus.push(VEGA_BIG_CORPUS[i]);
    }
    const t0 = performance.now();
    await VegaML.trainCodeNet(corpus, {
      steps: 700,
      onProgress: (s, total, loss, val) => {
        $("#nn-label").textContent =
          `Adım ${s}/${total} · eğitim kaybı ${loss.toFixed(3)} · doğrulama ${val.toFixed(3)}`;
        $("#nn-fill").style.width = Math.round(s / total * 100) + "%";
        drawNeuralChart();
      }
    });
    const sec = ((performance.now() - t0) / 1000).toFixed(1);
    const saved = VegaML.saveCodeNet();
    $("#nn-label").textContent =
      `Eğitim bitti (${sec} sn) · ${saved ? "ağırlıklar tarayıcıya kaydedildi" : "kaydetme başarısız (kota)"} · sohbette "üret: function " dene`;
    setStatus("Model hazır", false);
    btn.disabled = false;
    renderNeuralCard();
    toast("Sinir ağı eğitildi 🧬");
  });

  $("#nnw-train-btn").addEventListener("click", async () => {
    const btn = $("#nnw-train-btn");
    btn.disabled = true;
    setStatus("Kelime ağı eğitiliyor…", true);
    // Eğitim verisi: bilgi tabanının Türkçe metinleri + wiki sayfaları
    const texts = VegaEngine.getDocs()
      .filter(d => !d.id.startsWith("ref-"))
      .map(d => d.title + ". " + d.a);
    if (typeof VEGA_WIKI !== "undefined") {
      VEGA_WIKI.forEach(w => texts.push(w.body.replace(/[*`#>]/g, " ")));
    }
    const t0 = performance.now();
    await VegaML.trainWordNet(texts, {
      steps: 500,
      onProgress: (s, total, loss, val) => {
        $("#nn-label").textContent =
          `Kelime ağı — adım ${s}/${total} · eğitim kaybı ${loss.toFixed(3)} · doğrulama ${val.toFixed(3)}`;
        $("#nn-fill").style.width = Math.round(s / total * 100) + "%";
        drawNeuralChart(VegaML.info().wordHistory);
      }
    });
    const sec = ((performance.now() - t0) / 1000).toFixed(1);
    const saved = VegaML.saveWordNet();
    $("#nn-label").textContent =
      `Kelime ağı eğitildi (${sec} sn) · ${saved ? "ağırlıklar kaydedildi" : "kaydetme başarısız (kota)"} · sohbette "kelime: yapay zeka" dene`;
    setStatus("Model hazır", false);
    btn.disabled = false;
    renderNeuralCard();
    toast("Kelime ağı eğitildi 📝");
  });

  $("#nn-sample-btn").addEventListener("click", () => {
    const info = VegaML.info();
    if (!info.codeReady && !info.wordReady) { toast("Önce bir ağı eğit"); return; }
    const parts = [];
    if (info.codeReady) {
      parts.push("── kod ağı ──\n" +
        VegaML.generate("function ", 130, 0.75, Date.now() % 100000));
    }
    if (info.wordReady) {
      parts.push("── kelime ağı ──\n" +
        VegaML.generateWords("yapay zeka", 36, 0.85, Date.now() % 100000));
    }
    $("#nn-sample").textContent = parts.join("\n\n");
    $("#nn-sample").parentElement.hidden = false;
  });

  $("#nn-clear-btn").addEventListener("click", () => {
    VegaML.clearCodeNet();
    VegaML.clearWordNet();
    renderNeuralCard();
    toast("Sinir ağı ağırlıkları silindi");
  });
}

function renderNeuralCard() {
  const i = VegaML.info();
  $("#nn-stats").innerHTML = `
    <div class="stat"><div class="val">${i.intentReady ? "%" + Math.round(i.intentAcc * 100) : "—"}</div>
      <div class="lbl">Niyet ağı doğruluğu (val)</div></div>
    <div class="stat"><div class="val">${i.intentParams.toLocaleString("tr-TR")}</div>
      <div class="lbl">Niyet ağı parametresi</div></div>
    <div class="stat"><div class="val">${i.codeReady ? i.codeParams.toLocaleString("tr-TR") : "—"}</div>
      <div class="lbl">Kod ağı parametresi</div></div>
    <div class="stat"><div class="val">${i.codeReady ? (i.codeTrainedChars / 1000).toFixed(0) + "k" : "—"}</div>
      <div class="lbl">Eğitim karakteri</div></div>
    <div class="stat"><div class="val">${i.wordReady ? i.wordParams.toLocaleString("tr-TR") : "—"}</div>
      <div class="lbl">Kelime ağı parametresi</div></div>
    <div class="stat"><div class="val">${i.wordReady ? (i.wordTrainedWords / 1000).toFixed(1) + "k / " + i.wordVocab : "—"}</div>
      <div class="lbl">Eğitim kelimesi / sözlük</div></div>`;
  drawNeuralChart();
}

function drawNeuralChart(histArg) {
  const canvas = $("#nn-chart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  const info = VegaML.info();
  const hist = histArg ||
    (info.codeHistory && info.codeHistory.length >= 2 ? info.codeHistory : info.wordHistory);
  const INK_MUTED = "#8a92b2", GRID = "rgba(138,146,178,0.14)";

  if (!hist || hist.length < 2) {
    ctx.fillStyle = INK_MUTED;
    ctx.font = "12px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("Henüz nöral eğitim yok — kayıp eğrileri burada çizilir.", W / 2, H / 2);
    ctx.textAlign = "left";
    return;
  }

  const padL = 44, padR = 14, padT = 26, padB = 24;
  const all = hist.flatMap(h => [h.loss, h.val]);
  const maxV = Math.max(...all) * 1.05, minV = Math.min(...all) * 0.95;
  const x = i => padL + (W - padL - padR) * (i / (hist.length - 1));
  const y = v => H - padB - (H - padT - padB) * ((v - minV) / Math.max(1e-6, maxV - minV));

  ctx.font = "10.5px system-ui";
  for (let g = 0; g <= 3; g++) {
    const v = minV + (maxV - minV) * g / 3;
    ctx.strokeStyle = GRID;
    ctx.beginPath(); ctx.moveTo(padL, y(v)); ctx.lineTo(W - padR, y(v)); ctx.stroke();
    ctx.fillStyle = INK_MUTED;
    ctx.textAlign = "right";
    ctx.fillText(v.toFixed(2), padL - 8, y(v) + 4);
  }
  ctx.textAlign = "left";

  // iki seri: eğitim (mor) + doğrulama (camgöbeği) — lejant üstte
  const SERIES = [["loss", "#8b7cff", "eğitim"], ["val", "#22d3ee", "doğrulama"]];
  SERIES.forEach(([key, color, label], si) => {
    ctx.beginPath();
    hist.forEach((h, i) => i === 0 ? ctx.moveTo(x(i), y(h[key])) : ctx.lineTo(x(i), y(h[key])));
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
    // lejant
    ctx.fillStyle = color;
    ctx.fillRect(padL + si * 110, 8, 14, 3);
    ctx.fillStyle = INK_MUTED;
    ctx.fillText(label + " kaybı", padL + si * 110 + 20, 13);
  });
}

/* ==================== YILDIZ ARKA PLANI ==================== */
function initStars() {
  const canvas = document.getElementById("bg-stars");
  const ctx = canvas.getContext("2d");
  let stars = [];

  function resize() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    const count = Math.min(160, Math.floor(innerWidth * innerHeight / 14000));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.3 + 0.3,
      speed: Math.random() * 0.06 + 0.01,
      phase: Math.random() * Math.PI * 2
    }));
  }
  resize();
  addEventListener("resize", resize);

  let t = 0;
  (function tick() {
    t += 0.016;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const s of stars) {
      s.y -= s.speed;
      if (s.y < -2) { s.y = canvas.height + 2; s.x = Math.random() * canvas.width; }
      const a = 0.25 + 0.55 * Math.abs(Math.sin(t * 0.8 + s.phase));
      ctx.fillStyle = `rgba(196, 202, 233, ${a})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, 7);
      ctx.fill();
    }
    requestAnimationFrame(tick);
  })();
}

const $ = sel => document.querySelector(sel);

function toast(msg) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

function setStatus(text, busy) {
  $("#status-text").textContent = text;
  const dot = document.querySelector("#model-status .dot");
  dot.className = "dot " + (busy ? "busy" : "online");
}

function escapeHtml(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

// Basit markdown: **kalın**, `kod`, satır sonları — girdiler önce kaçışlanır
function md(s) {
  return escapeHtml(s)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\n/g, "<br>");
}

/* ==================== SEKMELER ==================== */
function initTabs() {
  $("#tabs").addEventListener("click", e => {
    const btn = e.target.closest(".tab");
    if (!btn) return;
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    $("#panel-" + btn.dataset.tab).classList.add("active");
    if (btn.dataset.tab === "admin") refreshAdmin();
    if (btn.dataset.tab === "graph") buildGraphView();
  });
}

/* ==================== SOHBET ==================== */
function initChat() {
  const form = $("#chat-form");
  const input = $("#chat-text");
  const win = $("#chat-window");

  form.addEventListener("submit", e => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    addUserMsg(text);
    respond(text);
  });

  $("#quick-chips").addEventListener("click", e => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    addUserMsg(chip.textContent);
    respond(chip.textContent);
  });

  // Hero kartları ve ilişki çipleri: soruyu başlatır
  win.addEventListener("click", e => {
    const trigger = e.target.closest(".hero-card, .related-chip");
    if (!trigger) return;
    addUserMsg(trigger.dataset.q);
    respond(trigger.dataset.q);
  });

  // Bilgi ağından gelen sorular için dışa açık köprü
  window.__vegaAsk = q => {
    document.querySelector('.tab[data-tab="chat"]').click();
    addUserMsg(q);
    respond(q);
  };

  function hideHero() {
    const hero = $("#chat-hero");
    if (hero) hero.remove();
  }

  function addUserMsg(text) {
    hideHero();
    win.insertAdjacentHTML("beforeend", `
      <div class="msg user">
        <div class="avatar">K</div>
        <div class="bubble">${md(text)}</div>
      </div>`);
    win.scrollTop = win.scrollHeight;
  }

  function respond(text) {
    // Yazıyor animasyonu
    const typing = document.createElement("div");
    typing.className = "msg vega";
    typing.innerHTML = `<div class="avatar">V</div>
      <div class="bubble"><div class="typing"><span></span><span></span><span></span></div></div>`;
    win.appendChild(typing);
    win.scrollTop = win.scrollHeight;
    setStatus("Düşünüyor…", true);

    setTimeout(() => {
      const res = VegaEngine.ask(text);
      typing.remove();
      setStatus("Model hazır", false);

      let inner = `<p>${md(res.text)}</p>`;
      if (res.code) {
        inner += `<div class="codebox">
          <div class="codebox-head"><span>kod</span><button class="copy-btn">Kopyala</button></div>
          <pre>${escapeHtml(res.code)}</pre>
        </div>`;
      }

      let meta = "";
      if (res.type === "answer") {
        const pct = Math.round(res.confidence * 100);
        const intentChip = res.intent
          ? `<span class="confidence">🧠 nöral niyet: ${escapeHtml(res.intent.label)} %${Math.round(res.intent.conf * 100)}</span>`
          : "";
        meta = `<div class="meta-row">
          <span class="confidence">📁 ${escapeHtml(res.category)} · güven %${pct}</span>${intentChip}
          <button class="fb-btn" data-doc="${res.docId}" data-fb="1" title="İyi cevap — ağırlığı artır">👍</button>
          <button class="fb-btn" data-doc="${res.docId}" data-fb="0" title="Kötü cevap — ağırlığı azalt">👎</button>
        </div>`;
        if (res.related && res.related.length) {
          meta += `<div class="meta-row"><span class="confidence">İlgili</span>${
            res.related.map(t =>
              `<button class="related-chip" data-q="${escapeHtml(t)}">${escapeHtml(t)}</button>`
            ).join("")}</div>`;
        }
      }

      win.insertAdjacentHTML("beforeend", `
        <div class="msg vega">
          <div class="avatar">V</div>
          <div class="bubble">${inner}${meta}</div>
        </div>`);
      win.scrollTop = win.scrollHeight;
    }, 420 + Math.random() * 500);
  }

  // Kod kopyalama
  win.addEventListener("click", async e => {
    const btn = e.target.closest(".copy-btn");
    if (!btn) return;
    const code = btn.closest(".codebox").querySelector("pre").textContent;
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = code; document.body.appendChild(ta);
      ta.select(); document.execCommand("copy"); ta.remove();
    }
    btn.textContent = "Kopyalandı ✓";
    btn.classList.add("copied");
    setTimeout(() => { btn.textContent = "Kopyala"; btn.classList.remove("copied"); }, 1800);
  });

  // Geri bildirim — gerçek çevrimiçi öğrenme
  win.addEventListener("click", e => {
    const btn = e.target.closest(".fb-btn");
    if (!btn || btn.classList.contains("done")) return;
    const positive = btn.dataset.fb === "1";
    const w = VegaEngine.feedback(btn.dataset.doc, positive);
    btn.parentElement.querySelectorAll(".fb-btn").forEach(b => b.classList.add("done"));
    if (w != null) {
      toast(positive
        ? `Teşekkürler! Bu bilginin ağırlığı ${w.toFixed(2)}'ye yükseldi. 📈`
        : `Not aldım — bu bilginin ağırlığı ${w.toFixed(2)}'ye düştü. 📉`);
    }
  });
}

/* ==================== GÖRSEL STÜDYOSU ==================== */
function initImageStudio() {
  const canvas = $("#art-canvas");
  const form = $("#image-form");
  const dlBtn = $("#image-download");
  let lastPrompt = null;

  // Açılış görseli
  VegaMedia.generateImage(canvas, "vega yıldızı karanlık uzayda mor nebula");
  $("#image-meta").textContent = "Açılış eseri: “vega yıldızı karanlık uzayda mor nebula” — kendi betimlemeni dene.";

  function generate(prompt) {
    if (!prompt) return;
    const info = VegaMedia.generateImage(canvas, prompt);
    lastPrompt = prompt;
    dlBtn.disabled = false;
    const styleNames = { nebula: "Nebula", waves: "Akışkan Dalgalar", geometric: "Geometrik Mozaik", city: "Neon Şehir", trees: "Fraktal Orman" };
    $("#image-meta").textContent =
      `Stil: ${styleNames[info.style]} · Tohum: ${info.seed} · Aynı metin daima aynı eseri üretir.`;
  }

  form.addEventListener("submit", e => {
    e.preventDefault();
    generate($("#image-prompt").value.trim());
  });

  document.querySelectorAll(".img-chip").forEach(chip =>
    chip.addEventListener("click", () => {
      $("#image-prompt").value = chip.textContent;
      generate(chip.textContent);
    }));

  dlBtn.addEventListener("click", () => {
    const a = document.createElement("a");
    a.download = "vega-art-" + VegaEngine.hashString(lastPrompt || "x") + ".png";
    a.href = canvas.toDataURL("image/png");
    a.click();
  });
}

/* ==================== MÜZİK STÜDYOSU ==================== */
function initMusicStudio() {
  const form = $("#music-form");
  const stopBtn = $("#music-stop");
  const dlBtn = $("#music-download");
  const info = $("#music-info");
  const barsEl = $("#viz-bars");
  let composition = null;
  let vizTimer = null;

  // Görselleştirici çubukları
  for (let i = 0; i < 48; i++) barsEl.appendChild(document.createElement("div"));
  const bars = [...barsEl.children];

  function startViz(duration) {
    stopViz();
    const t0 = performance.now();
    vizTimer = setInterval(() => {
      const elapsed = (performance.now() - t0) / 1000;
      if (elapsed > duration) { stopViz(); return; }
      bars.forEach((b, i) => {
        const h = 8 + Math.abs(Math.sin(elapsed * 3 + i * 0.6)) * 80 * (0.4 + Math.random() * 0.6);
        b.style.height = h + "px";
      });
    }, 110);
  }
  function stopViz() {
    if (vizTimer) clearInterval(vizTimer);
    vizTimer = null;
    bars.forEach(b => b.style.height = "4px");
  }

  function playPrompt(prompt) {
    if (!prompt) return;
    VegaMedia.stop();
    composition = VegaMedia.compose(prompt);
    const dur = VegaMedia.play(composition);
    startViz(dur);
    stopBtn.disabled = false;
    dlBtn.disabled = false;
    info.innerHTML =
      `<strong>Analiz:</strong> ${escapeHtml(composition.mood.name)} · ` +
      `<strong>Tempo:</strong> ${composition.bpm} BPM · ` +
      `<strong>Uzunluk:</strong> ${Math.round(composition.duration)} sn · ` +
      `<strong>Tohum:</strong> ${composition.seed}<br>` +
      `16 ölçü: akor yürüyüşü + bas hattı + gam-içi melodi, osilatör sentezi ve delay efektiyle çalınıyor.`;
  }

  form.addEventListener("submit", e => {
    e.preventDefault();
    playPrompt($("#music-prompt").value.trim());
  });

  document.querySelectorAll(".music-chip").forEach(chip =>
    chip.addEventListener("click", () => {
      $("#music-prompt").value = chip.textContent;
      playPrompt(chip.textContent);
    }));

  stopBtn.addEventListener("click", () => {
    VegaMedia.stop();
    stopViz();
  });

  dlBtn.addEventListener("click", async () => {
    if (!composition) return;
    dlBtn.disabled = true;
    dlBtn.textContent = "İşleniyor…";
    try {
      const blob = await VegaMedia.renderWav(composition);
      const a = document.createElement("a");
      a.download = "vega-beste-" + composition.seed + ".wav";
      a.href = URL.createObjectURL(blob);
      a.click();
      URL.revokeObjectURL(a.href);
      toast("WAV dosyası indirildi 🎵");
    } finally {
      dlBtn.disabled = false;
      dlBtn.textContent = "WAV İndir";
    }
  });
}

/* ==================== BİLGİ AĞI ==================== */
// Kategori aileleri VEGA_FAMILIES'ten gelir (vega-data.js) — nöral niyet
// sınıflandırıcısıyla aynı etiket kümesi, sabit renk sırası
function familyOf(cat) {
  for (const [name, cats, color] of VEGA_FAMILIES) {
    if (cats.includes(cat)) return { name, color };
  }
  return { name: "Diğer", color: "#8a92b2" };
}

function buildGraphView() {
  const canvas = $("#graph-canvas");
  const wrap = canvas.parentElement;
  const tip = $("#graph-tip");
  const ctx = canvas.getContext("2d");

  // Graf her açılışta motordan taze hesaplanır — öğretilenler dahil olsun
  const { nodes, edges } = VegaEngine.getGraph();
  canvas.__nodes = nodes;   // testler ve hata ayıklama için

  const W = canvas.width = wrap.clientWidth;
  const H = canvas.height = Math.max(520, wrap.clientHeight);

  // Başlangıç konumları: kategori ailesine göre kümelenmiş halka
  const famAngles = new Map();
  VEGA_FAMILIES.forEach(([name], i) =>
    famAngles.set(name, (i / VEGA_FAMILIES.length) * Math.PI * 2));
  nodes.forEach((n, i) => {
    const fam = familyOf(n.cat);
    const ang = (famAngles.get(fam.name) ?? 0) + (Math.sin(i * 7.13) * 0.55);
    const r = Math.min(W, H) * (0.22 + 0.14 * Math.abs(Math.cos(i * 3.7)));
    n.x = W / 2 + Math.cos(ang) * r;
    n.y = H / 2 + Math.sin(ang) * r;
    n.vx = 0; n.vy = 0;
    n.color = fam.color;
    n.deg = 0;
  });
  edges.forEach(e => { nodes[e.a].deg++; nodes[e.b].deg++; });

  // Kuvvet yönelimli yerleşim (önceden hesaplanır, sonra çizilir)
  for (let iter = 0; iter < 260; iter++) {
    const cool = 1 - iter / 260;
    // itme
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x, dy = nodes[j].y - nodes[i].y;
        const d2 = Math.max(60, dx * dx + dy * dy);
        const f = 2600 / d2 * cool;
        const d = Math.sqrt(d2);
        nodes[i].vx -= dx / d * f; nodes[i].vy -= dy / d * f;
        nodes[j].vx += dx / d * f; nodes[j].vy += dy / d * f;
      }
    }
    // çekme (kenar yayları — benzerlik güçlüyse yay kısalır)
    edges.forEach(e => {
      const A = nodes[e.a], B = nodes[e.b];
      const dx = B.x - A.x, dy = B.y - A.y;
      const d = Math.max(1, Math.sqrt(dx * dx + dy * dy));
      const target = 120 - e.w * 160;
      const f = (d - Math.max(46, target)) * 0.012 * cool;
      A.vx += dx / d * f * d * 0.01; A.vy += dy / d * f * d * 0.01;
      B.vx -= dx / d * f * d * 0.01; B.vy -= dy / d * f * d * 0.01;
    });
    // merkeze hafif çekim + uygula
    nodes.forEach(n => {
      n.vx += (W / 2 - n.x) * 0.002 * cool;
      n.vy += (H / 2 - n.y) * 0.002 * cool;
      n.x += Math.max(-9, Math.min(9, n.vx));
      n.y += Math.max(-9, Math.min(9, n.vy));
      n.vx *= 0.72; n.vy *= 0.72;
      n.x = Math.max(28, Math.min(W - 28, n.x));
      n.y = Math.max(28, Math.min(H - 28, n.y));
    });
  }

  let hover = null;

  function draw() {
    ctx.clearRect(0, 0, W, H);
    // kenarlar — ağırlık şeffaflığa yansır
    edges.forEach(e => {
      const A = nodes[e.a], B = nodes[e.b];
      const active = hover && (A === hover || B === hover);
      ctx.strokeStyle = active
        ? "rgba(139, 124, 255, 0.85)"
        : `rgba(138, 146, 178, ${0.10 + e.w * 0.5})`;
      ctx.lineWidth = active ? 1.6 : 1;
      ctx.beginPath();
      ctx.moveTo(A.x, A.y);
      ctx.lineTo(B.x, B.y);
      ctx.stroke();
    });
    // düğümler — derece boyuta yansır
    nodes.forEach(n => {
      const r = 4.5 + Math.min(6, n.deg * 0.9);
      ctx.beginPath();
      ctx.arc(n.x, n.y, n === hover ? r + 2.5 : r, 0, 7);
      ctx.fillStyle = n.color;
      ctx.fill();
      // 2px yüzey halkası — üst üste binen işaretler ayrışsın
      ctx.strokeStyle = "#0b0e1a";
      ctx.lineWidth = 2;
      ctx.stroke();
      if (n.custom) {            // öğretilen bilgi: kesikli hale
        ctx.beginPath();
        ctx.arc(n.x, n.y, r + 5, 0, 7);
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = n.color;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });
  }
  draw();

  function nodeAt(mx, my) {
    let best = null, bestD = 18 * 18;
    for (const n of nodes) {
      const d = (n.x - mx) ** 2 + (n.y - my) ** 2;
      if (d < bestD) { bestD = d; best = n; }
    }
    return best;
  }

  canvas.onmousemove = e => {
    const rect = canvas.getBoundingClientRect();
    const n = nodeAt(e.clientX - rect.left, e.clientY - rect.top);
    if (n !== hover) {
      hover = n;
      draw();
      if (n) {
        const rel = VegaEngine.relatedDocs(n.id, 3);
        tip.innerHTML = `<strong>${n.title}</strong><small>${n.cat}${
          n.custom ? " · senin öğrettiğin" : ""}</small>` + (rel.length
          ? `<small>En güçlü bağlar: ${rel.map(r =>
              `${r.title} (%${Math.round(r.score * 100)})`).join(" · ")}</small>` : "");
        tip.hidden = false;
        tip.style.left = Math.min(n.x + 16, W - 320) + "px";
        tip.style.top = Math.max(8, n.y - 20) + "px";
      } else {
        tip.hidden = true;
      }
    }
  };
  canvas.onmouseleave = () => { hover = null; tip.hidden = true; draw(); };
  canvas.onclick = e => {
    const rect = canvas.getBoundingClientRect();
    const n = nodeAt(e.clientX - rect.left, e.clientY - rect.top);
    if (n && window.__vegaAsk) window.__vegaAsk(n.title);
  };

  // Lejant
  $("#graph-legend").innerHTML = VEGA_FAMILIES.map(([name, , color]) =>
    `<span><i style="background:${color}"></i>${name}</span>`).join("");
}

/* ==================== WIKI ==================== */
function initWiki() {
  const nav = $("#wiki-nav");
  const body = $("#wiki-body");

  VEGA_WIKI.forEach((page, i) => {
    const btn = document.createElement("button");
    btn.textContent = page.title;
    if (i === 0) btn.classList.add("active");
    btn.addEventListener("click", () => {
      nav.querySelectorAll("button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      render(page);
    });
    nav.appendChild(btn);
  });
  render(VEGA_WIKI[0]);

  function render(page) {
    // Wiki içeriği güvenilir sabit veridir; basit markdown çevirisi
    const html = escapeHtml(page.body)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .split(/\n\n+/).map(p => `<p>${p.replace(/\n/g, "<br>")}</p>`).join("");
    body.innerHTML = `<h2>${escapeHtml(page.title)}</h2>${html}`;
  }
}

/* ==================== ADMIN ==================== */
function refreshAdmin() {
  renderStats();
  renderKbList($("#kb-search").value);
  renderMissed();
  const s = VegaEngine.getStats();
  drawLossChart(s.lossHistory);
  if (s.lastTrain && s.lossHistory.length) {
    $("#train-label").textContent =
      `Son eğitim: ${new Date(s.lastTrain).toLocaleString("tr-TR")} · perplexity ${s.lastPerplexity}`;
    $("#train-fill").style.width = "100%";
  }
}

function renderMissed() {
  const list = $("#missed-list");
  const missed = VegaEngine.getMissed();
  if (!missed.length) {
    list.innerHTML = `<p class="muted">Kuyruk boş — Vega sorulan her şeyi cevaplayabildi. 🎉</p>`;
    return;
  }
  list.innerHTML = missed.map(m => `
    <div class="kb-item">
      <span class="cat">bilinmiyor</span>
      <span class="title">${escapeHtml(m.q)}</span>
      <button class="btn missed-teach" data-q="${escapeHtml(m.q)}" style="padding:6px 14px;font-size:12px">Öğret</button>
      <button class="del missed-del" data-q="${escapeHtml(m.q)}" title="Kuyruktan çıkar">✕</button>
    </div>`).join("");
}

function renderStats() {
  const s = VegaEngine.getStats();
  const items = [
    [s.docCount.toLocaleString("tr-TR"), "Bilgi kaydı"],
    [s.corpusLines.toLocaleString("tr-TR"), "Derlem satırı (eğitimde)"],
    [s.customCount, "Öğrenilen kayıt"],
    [s.termCount.toLocaleString("tr-TR"), "İndeksli terim"],
    [s.trigramCount.toLocaleString("tr-TR"), "Trigram"],
    [s.vocabSize.toLocaleString("tr-TR"), "Kod sözlüğü"],
    [s.queries, "Toplam sorgu"],
    [s.feedbackUp + "/" + s.feedbackDown, "👍 / 👎"],
    [s.missedCount, "Öğrenme kuyruğu"],
    [s.lastPerplexity != null ? s.lastPerplexity : "—", "Son perplexity"]
  ];
  $("#stats-grid").innerHTML = items.map(([v, l]) =>
    `<div class="stat"><div class="val">${v}</div><div class="lbl">${l}</div></div>`).join("");
}

function renderKbList(filter = "") {
  const MAX_SHOW = 150;   // 10 binlerce kaydı DOM'a basma — arama ile daralt
  const list = $("#kb-list");
  const docs = VegaEngine.getDocs();
  const f = filter.toLocaleLowerCase("tr");
  const matched = docs.filter(d =>
    !f || d.title.toLocaleLowerCase("tr").includes(f) ||
    d.cat.toLocaleLowerCase("tr").includes(f));
  const shown = matched.slice(0, MAX_SHOW);

  $("#kb-count").textContent = matched.length > MAX_SHOW
    ? `${matched.length.toLocaleString("tr-TR")} eşleşme / ${docs.length.toLocaleString("tr-TR")} kayıt · ilk ${MAX_SHOW} gösteriliyor`
    : `${matched.length.toLocaleString("tr-TR")} / ${docs.length.toLocaleString("tr-TR")} kayıt`;
  list.innerHTML = shown.map(d => `
    <div class="kb-item">
      <span class="cat ${d.custom ? "custom" : ""}">${escapeHtml(d.cat)}</span>
      <span class="title">${escapeHtml(d.title)}</span>
      <span class="weight">ağırlık ${d.weight.toFixed(2)}</span>
      ${d.custom ? `<button class="del" data-id="${d.id}" title="Sil">✕</button>` : ""}
    </div>`).join("");
}

function drawLossChart(history) {
  const canvas = $("#loss-chart");
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const INK = "#eceff8", INK_MUTED = "#8a92b2", GRID = "rgba(138,146,178,0.14)";
  const LINE = "#8b7cff";

  if (!history || history.length === 0) {
    ctx.fillStyle = INK_MUTED;
    ctx.font = "13px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("Henüz eğitim çalıştırılmadı — 'Modeli Eğit' butonuna bas,", W / 2, H / 2 - 10);
    ctx.fillText("gerçek perplexity eğrisi burada çizilir.", W / 2, H / 2 + 10);
    ctx.textAlign = "left";
    return;
  }

  const padL = 56, padR = 24, padT = 34, padB = 34;
  const vals = history.map(h => h.ppl);
  const maxV = Math.max(...vals) * 1.06;
  const minV = Math.min(...vals) * 0.94;
  const x = i => padL + (W - padL - padR) * (i / Math.max(1, history.length - 1));
  const y = v => H - padB - (H - padT - padB) * ((v - minV) / Math.max(0.001, maxV - minV));

  // Başlık = tek serinin adı (ayrıca lejant gerekmez)
  ctx.fillStyle = INK_MUTED;
  ctx.font = "12px system-ui";
  ctx.fillText("Doğrulama perplexity'si — düşük = daha iyi model", padL, 18);

  // Sessiz ızgara: yalnız yatay çizgiler
  ctx.font = "10.5px system-ui";
  for (let g = 0; g <= 4; g++) {
    const v = minV + (maxV - minV) * g / 4;
    ctx.strokeStyle = GRID;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, y(v)); ctx.lineTo(W - padR, y(v));
    ctx.stroke();
    ctx.fillStyle = INK_MUTED;
    ctx.textAlign = "right";
    ctx.fillText(Math.round(v), padL - 10, y(v) + 4);
  }
  ctx.textAlign = "left";

  // Alan dolgusu (hafif)
  const grad = ctx.createLinearGradient(0, padT, 0, H - padB);
  grad.addColorStop(0, "rgba(139,124,255,0.22)");
  grad.addColorStop(1, "rgba(139,124,255,0)");
  ctx.beginPath();
  history.forEach((h, i) => i === 0 ? ctx.moveTo(x(i), y(h.ppl)) : ctx.lineTo(x(i), y(h.ppl)));
  ctx.lineTo(x(history.length - 1), H - padB);
  ctx.lineTo(x(0), H - padB);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Çizgi (2px) — tek seri
  ctx.beginPath();
  history.forEach((h, i) => i === 0 ? ctx.moveTo(x(i), y(h.ppl)) : ctx.lineTo(x(i), y(h.ppl)));
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.stroke();

  // Eksen etiketleri (epoch)
  ctx.fillStyle = INK_MUTED;
  ctx.textAlign = "center";
  history.forEach((h, i) => ctx.fillText(h.epoch, x(i), H - padB + 18));

  // Seçici doğrudan etiket: yalnız ilk ve son nokta
  [0, history.length - 1].forEach(i => {
    const h = history[i];
    ctx.beginPath();
    ctx.arc(x(i), y(h.ppl), 4, 0, 7);
    ctx.fillStyle = LINE;
    ctx.fill();
    // 2px yüzey halkası
    ctx.strokeStyle = "#0b0e1a";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = INK;
    ctx.font = "600 11.5px system-ui";
    ctx.fillText(h.ppl.toFixed(1), x(i), y(h.ppl) - 12);
    ctx.font = "10.5px system-ui";
  });
  ctx.textAlign = "left";
}

function initAdmin() {
  refreshAdmin();

  // --- Eğitim butonu ---
  $("#train-btn").addEventListener("click", async () => {
    const btn = $("#train-btn");
    btn.disabled = true;
    setStatus("Eğitiliyor…", true);
    const t0 = performance.now();

    const history = await VegaEngine.train((epoch, total, ppl, stage) => {
      const pct = Math.round(epoch / total * 100);
      $("#train-fill").style.width = pct + "%";
      $("#train-label").textContent =
        stage === "indeks"
          ? `TF-IDF indeksi yeniden kuruldu · son perplexity ${ppl.toFixed(2)}`
          : `Epoch ${epoch}/${total} · perplexity ${ppl.toFixed(2)}`;
      drawLossChart(VegaEngine.getStats().lossHistory);
    });

    const sec = ((performance.now() - t0) / 1000).toFixed(1);
    $("#train-label").textContent =
      `Eğitim tamamlandı (${sec} sn) · perplexity ${history.at(-1).ppl.toFixed(2)} · model kaydedildi`;
    setStatus("Model hazır", false);
    btn.disabled = false;
    renderStats();
    toast("Model eğitildi ve güncellendi ⚡");
  });

  // --- Dışa/içe aktarma ---
  $("#export-btn").addEventListener("click", () => {
    const blob = new Blob([VegaEngine.exportModel()], { type: "application/json" });
    const a = document.createElement("a");
    a.download = "vega-model.json";
    a.href = URL.createObjectURL(blob);
    a.click();
    URL.revokeObjectURL(a.href);
    toast("Model dışa aktarıldı 💾");
  });

  $("#import-file").addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const n = VegaEngine.importModel(reader.result);
        refreshAdmin();
        toast(`Model içe aktarıldı: ${n} öğrenilmiş kayıt yüklendi ✅`);
      } catch (err) {
        toast("Hata: " + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  });

  // --- Bilgi tabanı formu ---
  $("#kb-form").addEventListener("submit", e => {
    e.preventDefault();
    VegaEngine.addDoc({
      title: $("#kb-title").value.trim(),
      q: $("#kb-keywords").value.trim() + " " + $("#kb-title").value.trim(),
      a: $("#kb-answer").value.trim(),
      code: $("#kb-code").value.trim() || null,
      cat: "Öğretilen"
    });
    e.target.reset();
    refreshAdmin();
    toast("Kayıt eklendi ve indekslendi 📖");
  });

  $("#kb-search").addEventListener("input", e => renderKbList(e.target.value));

  $("#kb-list").addEventListener("click", e => {
    const del = e.target.closest(".del");
    if (!del) return;
    if (confirm("Bu öğrenilmiş kayıt silinsin mi?")) {
      VegaEngine.removeDoc(del.dataset.id);
      refreshAdmin();
      toast("Kayıt silindi");
    }
  });

  // --- Değerlendirme kıyaslaması ---
  $("#eval-btn").addEventListener("click", () => {
    const btn = $("#eval-btn");
    btn.disabled = true;
    btn.textContent = "Ölçülüyor…";
    setTimeout(() => {
      const r = VegaEngine.evaluate();
      const nn = VegaML.info();
      $("#eval-stats").innerHTML = `
        <div class="stat"><div class="val">%${(r.top1 * 100).toFixed(1)}</div>
          <div class="lbl">Top-1 getirme doğruluğu</div></div>
        <div class="stat"><div class="val">%${(r.top3 * 100).toFixed(1)}</div>
          <div class="lbl">Top-3 getirme doğruluğu</div></div>
        <div class="stat"><div class="val">${r.msPerQuery.toFixed(1)} ms</div>
          <div class="lbl">Sorgu başına süre (${r.queries} sorgu)</div></div>
        <div class="stat"><div class="val">${nn.intentReady ? "%" + Math.round(nn.intentAcc * 100) : "—"}</div>
          <div class="lbl">Nöral niyet doğruluğu (val)</div></div>`;
      btn.disabled = false;
      btn.textContent = "Kıyaslamayı Çalıştır";
      toast(`Kıyaslama bitti: Top-1 %${(r.top1 * 100).toFixed(1)}, Top-3 %${(r.top3 * 100).toFixed(1)} 📏`);
    }, 50);
  });

  // --- Öğrenme kuyruğu ---
  $("#missed-list").addEventListener("click", e => {
    const teach = e.target.closest(".missed-teach");
    if (teach) {
      const q = teach.dataset.q;
      const cevap = prompt(`"${q}"\n\nVega'ya bu sorunun cevabını öğret:`);
      if (cevap && cevap.trim()) {
        VegaEngine.teach(q, cevap.trim());
        VegaEngine.removeMissed(q);
        VegaEngine.persist();
        refreshAdmin();
        toast("Öğrendim! Bu soru artık cevaplanabilir ✅");
      }
      return;
    }
    const del = e.target.closest(".missed-del");
    if (del) {
      VegaEngine.removeMissed(del.dataset.q);
      refreshAdmin();
    }
  });

  // --- Fabrika sıfırlama ---
  $("#reset-btn").addEventListener("click", () => {
    if (confirm("TÜM öğrenilen bilgiler, ağırlıklar ve istatistikler silinecek. Emin misin?")) {
      VegaEngine.factoryReset();
      refreshAdmin();
      toast("Model fabrika ayarlarına döndürüldü 🔄");
    }
  });
}
