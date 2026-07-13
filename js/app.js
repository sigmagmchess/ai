/* =========================================================
   VEGA — Uygulama Katmanı (UI bağlantıları)
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  VegaEngine.load();

  initTabs();
  initChat();
  initImageStudio();
  initMusicStudio();
  initWiki();
  initAdmin();
});

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

  function addUserMsg(text) {
    win.insertAdjacentHTML("beforeend", `
      <div class="msg user">
        <div class="avatar">👤</div>
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
      if (res.code) inner += `<pre>${escapeHtml(res.code)}</pre>`;

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
  drawLossChart(VegaEngine.getStats().lossHistory);
}

function renderStats() {
  const s = VegaEngine.getStats();
  const items = [
    [s.docCount, "Bilgi kaydı"],
    [s.customCount, "Öğrenilen kayıt"],
    [s.termCount, "İndeksli terim"],
    [s.trigramCount, "Trigram"],
    [s.vocabSize, "Kod sözlüğü"],
    [s.queries, "Toplam sorgu"],
    [s.feedbackUp + "/" + s.feedbackDown, "👍 / 👎"],
    [s.lastPerplexity != null ? s.lastPerplexity : "—", "Son perplexity"]
  ];
  $("#stats-grid").innerHTML = items.map(([v, l]) =>
    `<div class="stat"><div class="val">${v}</div><div class="lbl">${l}</div></div>`).join("");
}

function renderKbList(filter = "") {
  const list = $("#kb-list");
  const docs = VegaEngine.getDocs();
  const f = filter.toLocaleLowerCase("tr");
  const shown = docs.filter(d =>
    !f || d.title.toLocaleLowerCase("tr").includes(f) ||
    d.cat.toLocaleLowerCase("tr").includes(f));

  $("#kb-count").textContent = `${shown.length} / ${docs.length} kayıt`;
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

  if (!history || history.length === 0) {
    ctx.fillStyle = "#8b94b3";
    ctx.font = "14px system-ui";
    ctx.fillText("Henüz eğitim çalıştırılmadı — 'Modeli Eğit' butonuna bas, gerçek perplexity eğrisi burada çizilir.", 20, H / 2);
    return;
  }

  const pad = 46;
  const vals = history.map(h => h.ppl);
  const maxV = Math.max(...vals) * 1.08;
  const minV = Math.min(...vals) * 0.92;
  const x = i => pad + (W - pad * 2) * (i / Math.max(1, history.length - 1));
  const y = v => H - pad - (H - pad * 2) * ((v - minV) / Math.max(0.001, maxV - minV));

  // Izgara
  ctx.strokeStyle = "#2a3354";
  ctx.lineWidth = 1;
  ctx.fillStyle = "#8b94b3";
  ctx.font = "11px system-ui";
  for (let g = 0; g <= 4; g++) {
    const v = minV + (maxV - minV) * g / 4;
    ctx.beginPath();
    ctx.moveTo(pad, y(v)); ctx.lineTo(W - pad, y(v));
    ctx.stroke();
    ctx.fillText(v.toFixed(1), 8, y(v) + 4);
  }

  // Alan dolgusu
  const grad = ctx.createLinearGradient(0, pad, 0, H - pad);
  grad.addColorStop(0, "rgba(124,92,255,0.35)");
  grad.addColorStop(1, "rgba(124,92,255,0)");
  ctx.beginPath();
  history.forEach((h, i) => i === 0 ? ctx.moveTo(x(i), y(h.ppl)) : ctx.lineTo(x(i), y(h.ppl)));
  ctx.lineTo(x(history.length - 1), H - pad);
  ctx.lineTo(x(0), H - pad);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Çizgi
  ctx.beginPath();
  history.forEach((h, i) => i === 0 ? ctx.moveTo(x(i), y(h.ppl)) : ctx.lineTo(x(i), y(h.ppl)));
  ctx.strokeStyle = "#7c5cff";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Noktalar + etiketler
  history.forEach((h, i) => {
    ctx.beginPath();
    ctx.arc(x(i), y(h.ppl), 4, 0, 7);
    ctx.fillStyle = "#05d9e8";
    ctx.fill();
    ctx.fillStyle = "#e6eaf5";
    ctx.fillText(h.ppl.toFixed(1), x(i) - 12, y(h.ppl) - 10);
    ctx.fillStyle = "#8b94b3";
    ctx.fillText("e" + h.epoch, x(i) - 6, H - pad + 16);
  });

  ctx.fillStyle = "#8b94b3";
  ctx.font = "12px system-ui";
  ctx.fillText("Perplexity (doğrulama seti) — düşük = iyi", pad, 20);
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

  // --- Fabrika sıfırlama ---
  $("#reset-btn").addEventListener("click", () => {
    if (confirm("TÜM öğrenilen bilgiler, ağırlıklar ve istatistikler silinecek. Emin misin?")) {
      VegaEngine.factoryReset();
      refreshAdmin();
      toast("Model fabrika ayarlarına döndürüldü 🔄");
    }
  });
}
