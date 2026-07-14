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
});

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

  // Hero kartları: örnek istekleri başlatır
  win.addEventListener("click", e => {
    const card = e.target.closest(".hero-card");
    if (!card) return;
    addUserMsg(card.dataset.q);
    respond(card.dataset.q);
  });

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
        meta = `<div class="meta-row">
          <span class="confidence">📁 ${escapeHtml(res.category)} · güven %${pct}</span>
          <button class="fb-btn" data-doc="${res.docId}" data-fb="1" title="İyi cevap — ağırlığı artır">👍</button>
          <button class="fb-btn" data-doc="${res.docId}" data-fb="0" title="Kötü cevap — ağırlığı azalt">👎</button>
        </div>`;
        if (res.related && res.related.length) {
          meta += `<div class="meta-row"><span class="confidence">İlgili: ${res.related.map(escapeHtml).join(" · ")}</span></div>`;
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
