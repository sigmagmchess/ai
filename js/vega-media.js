/* =========================================================
   VEGA Medya Motoru — Üretken Görsel + Algoritmik Müzik
   Tamamen yerel: canvas + Web Audio API. Deterministik:
   aynı betimleme → aynı eser.
   ========================================================= */

const VegaMedia = (() => {

  // Tohumlu rastgele sayı üreteci (mulberry32)
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  /* ==================== GÖRSEL ÜRETİMİ ==================== */

  const PALETTES = {
    sicak:   ["#ff6b35", "#f7c59f", "#efefd0", "#d64550", "#ffa62b"],
    soguk:   ["#0b3954", "#087e8b", "#bfd7ea", "#5aa9e6", "#1b4965"],
    pastel:  ["#ffd6e0", "#c1fba4", "#b8e0ff", "#fff5ba", "#e7c6ff"],
    karanlik:["#10002b", "#3c096c", "#7b2cbf", "#c77dff", "#e0aaff"],
    neon:    ["#0d0221", "#ff2a6d", "#05d9e8", "#d1f7ff", "#f9f871"],
    dogal:   ["#283618", "#606c38", "#fefae0", "#dda15e", "#bc6c25"]
  };

  function pickPalette(prompt, rnd) {
    const p = prompt.toLocaleLowerCase("tr");
    if (/sıcak|ateş|güneş|kızıl|turuncu/.test(p)) return PALETTES.sicak;
    if (/soğuk|buz|kış|mavi|deniz|okyanus/.test(p)) return PALETTES.soguk;
    if (/pastel|yumuşak|tatlı/.test(p)) return PALETTES.pastel;
    if (/karanlık|gece|mor|gizem/.test(p)) return PALETTES.karanlik;
    if (/neon|siber|retro|synthwave|şehir/.test(p)) return PALETTES.neon;
    if (/orman|doğa|yeşil|bahar|ağaç/.test(p)) return PALETTES.dogal;
    const keys = Object.keys(PALETTES);
    return PALETTES[keys[Math.floor(rnd() * keys.length)]];
  }

  function pickStyle(prompt) {
    const p = prompt.toLocaleLowerCase("tr");
    if (/uzay|galaksi|yıldız|nebula|evren|gezegen/.test(p)) return "nebula";
    if (/deniz|dalga|okyanus|akış|su|rüzgar/.test(p)) return "waves";
    if (/şehir|neon|gece|bina|siber|silüet/.test(p)) return "city";
    if (/orman|ağaç|doğa|fraktal|dal/.test(p)) return "trees";
    if (/geometri|desen|mozaik|üçgen|soyut/.test(p)) return "geometric";
    return ["nebula", "waves", "geometric", "city", "trees"][
      VegaEngine.hashString(prompt) % 5];
  }

  function generateImage(canvas, prompt) {
    const seed = VegaEngine.hashString(prompt.trim().toLocaleLowerCase("tr"));
    const rnd = rng(seed);
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const palette = pickPalette(prompt, rnd);
    const style = pickStyle(prompt);

    // Zemin gradyanı
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, palette[0]);
    g.addColorStop(1, shade(palette[0], -40));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    const painters = { nebula, waves, geometric, city, trees };
    painters[style](ctx, W, H, palette, rnd);
    grain(ctx, W, H, rnd);
    return { style, palette: palette[1], seed };
  }

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.max(0, Math.min(255, (n >> 16) + amt));
    const gr = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt));
    const b = Math.max(0, Math.min(255, (n & 255) + amt));
    return `rgb(${r},${gr},${b})`;
  }

  function nebula(ctx, W, H, pal, rnd) {
    // Bulut katmanları
    for (let i = 0; i < 46; i++) {
      const x = rnd() * W, y = rnd() * H;
      const r = 40 + rnd() * 190;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      const c = pal[1 + Math.floor(rnd() * (pal.length - 1))];
      grad.addColorStop(0, c + "55");
      grad.addColorStop(1, c + "00");
      ctx.fillStyle = grad;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    // Yıldızlar
    for (let i = 0; i < 260; i++) {
      const x = rnd() * W, y = rnd() * H, s = rnd() * 1.8 + 0.3;
      ctx.fillStyle = `rgba(255,255,255,${0.35 + rnd() * 0.65})`;
      ctx.beginPath(); ctx.arc(x, y, s, 0, 7); ctx.fill();
    }
    // Parlak merkez yıldız
    const cx = W * (0.3 + rnd() * 0.4), cy = H * (0.25 + rnd() * 0.4);
    const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, 90);
    halo.addColorStop(0, "rgba(255,255,255,0.95)");
    halo.addColorStop(0.25, pal[4] + "88");
    halo.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = halo;
    ctx.fillRect(cx - 90, cy - 90, 180, 180);
  }

  function waves(ctx, W, H, pal, rnd) {
    const layers = 7 + Math.floor(rnd() * 4);
    for (let l = 0; l < layers; l++) {
      const baseY = H * (0.25 + 0.75 * l / layers);
      const amp = 18 + rnd() * 55;
      const freq = 0.004 + rnd() * 0.008;
      const phase = rnd() * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 4) {
        const y = baseY + Math.sin(x * freq + phase) * amp
                        + Math.sin(x * freq * 2.7 + phase * 2) * amp * 0.35;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fillStyle = pal[l % pal.length] + (l < 2 ? "cc" : "e6");
      ctx.fill();
    }
    // Güneş/ay
    const cx = W * (0.15 + rnd() * 0.7), cy = H * 0.2;
    ctx.fillStyle = pal[4] + "ee";
    ctx.beginPath(); ctx.arc(cx, cy, 34 + rnd() * 28, 0, 7); ctx.fill();
  }

  function geometric(ctx, W, H, pal, rnd) {
    const cell = 52 + Math.floor(rnd() * 40);
    for (let y = 0; y < H; y += cell) {
      for (let x = 0; x < W; x += cell) {
        const c = pal[Math.floor(rnd() * pal.length)];
        ctx.fillStyle = c;
        const shape = Math.floor(rnd() * 4);
        ctx.beginPath();
        if (shape === 0) {          // üçgen
          const flip = rnd() > 0.5;
          ctx.moveTo(x, flip ? y : y + cell);
          ctx.lineTo(x + cell, y);
          ctx.lineTo(x + cell, y + cell);
        } else if (shape === 1) {   // çeyrek daire
          ctx.moveTo(x, y);
          ctx.arc(x, y, cell, 0, Math.PI / 2);
        } else if (shape === 2) {   // daire
          ctx.arc(x + cell / 2, y + cell / 2, cell / 2.4, 0, 7);
        } else {                    // yarım kare
          ctx.rect(x, y, cell, cell / 2);
        }
        ctx.globalAlpha = 0.55 + rnd() * 0.45;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
  }

  function city(ctx, W, H, pal, rnd) {
    // Yıldızlı gökyüzü
    for (let i = 0; i < 120; i++) {
      ctx.fillStyle = `rgba(255,255,255,${rnd() * 0.7})`;
      ctx.fillRect(rnd() * W, rnd() * H * 0.55, 1.5, 1.5);
    }
    // Ay
    ctx.fillStyle = pal[3] + "dd";
    ctx.beginPath(); ctx.arc(W * 0.8, H * 0.18, 40, 0, 7); ctx.fill();
    // Bina silüetleri — arka ve ön katman
    [[0.45, "66"], [0.6, "ff"]].forEach(([hFac, alpha], layer) => {
      let x = 0;
      while (x < W) {
        const bw = 34 + rnd() * 70;
        const bh = H * (0.18 + rnd() * hFac);
        ctx.fillStyle = shade(pal[0], layer === 0 ? -20 : -50);
        ctx.fillRect(x, H - bh, bw, bh);
        // Neon pencereler
        if (layer === 1) {
          for (let wy = H - bh + 10; wy < H - 12; wy += 15) {
            for (let wx = x + 6; wx < x + bw - 8; wx += 13) {
              if (rnd() > 0.45) {
                ctx.fillStyle = pal[1 + Math.floor(rnd() * 3)] + "ee";
                ctx.fillRect(wx, wy, 6, 8);
              }
            }
          }
        }
        x += bw + 3;
      }
    });
    // Zemin neon çizgisi
    ctx.fillStyle = pal[2];
    ctx.fillRect(0, H - 4, W, 4);
  }

  function trees(ctx, W, H, pal, rnd) {
    function branch(x, y, len, angle, depth) {
      if (depth === 0 || len < 3) return;
      const x2 = x + Math.cos(angle) * len;
      const y2 = y + Math.sin(angle) * len;
      ctx.strokeStyle = depth > 3 ? shade(pal[0], -30) : pal[1 + (depth % 3)];
      ctx.lineWidth = depth * 0.9;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke();
      const spread = 0.35 + rnd() * 0.3;
      branch(x2, y2, len * (0.68 + rnd() * 0.14), angle - spread, depth - 1);
      branch(x2, y2, len * (0.68 + rnd() * 0.14), angle + spread, depth - 1);
      if (rnd() > 0.7) branch(x2, y2, len * 0.55, angle, depth - 1);
    }
    const treeCount = 3 + Math.floor(rnd() * 3);
    for (let t = 0; t < treeCount; t++) {
      branch(W * (0.12 + 0.76 * t / Math.max(1, treeCount - 1)) + rnd() * 40,
             H, H * (0.16 + rnd() * 0.12), -Math.PI / 2 + (rnd() - 0.5) * 0.3, 9);
    }
    // Düşen yapraklar
    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = pal[2 + Math.floor(rnd() * 3)] + "aa";
      ctx.beginPath();
      ctx.arc(rnd() * W, rnd() * H, 1.5 + rnd() * 2.5, 0, 7);
      ctx.fill();
    }
  }

  function grain(ctx, W, H, rnd) {
    ctx.globalAlpha = 0.05;
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = rnd() > 0.5 ? "#fff" : "#000";
      ctx.fillRect(rnd() * W, rnd() * H, 1, 1);
    }
    ctx.globalAlpha = 1;
  }

  /* ==================== MÜZİK ÜRETİMİ ==================== */

  const SCALES = {
    major:      [0, 2, 4, 5, 7, 9, 11],
    minor:      [0, 2, 3, 5, 7, 8, 10],
    dorian:     [0, 2, 3, 5, 7, 9, 10],
    pentatonic: [0, 2, 4, 7, 9]
  };

  // Akor yürüyüşleri (gam derecesi olarak)
  const PROGRESSIONS = [
    [0, 4, 5, 3],   // I-V-vi-IV (pop klasiği)
    [0, 5, 3, 4],   // I-vi-IV-V (50'ler)
    [5, 3, 0, 4],   // vi-IV-I-V
    [0, 3, 4, 4]    // I-IV-V-V
  ];

  function analyzeMood(prompt) {
    const p = prompt.toLocaleLowerCase("tr");
    if (/hüzün|üzgün|melankoli|yağmur|ayrılık|kayıp/.test(p))
      return { scale: "minor", bpm: 66, wave: "sine", name: "Hüzünlü (minör)" };
    if (/epik|savaş|kahraman|güçlü|dev|zafer/.test(p))
      return { scale: "dorian", bpm: 100, wave: "sawtooth", name: "Epik (dorik)" };
    if (/neşe|mutlu|dans|parti|enerji|yaz/.test(p))
      return { scale: "pentatonic", bpm: 132, wave: "square", name: "Neşeli (pentatonik)" };
    if (/sakin|huzur|uyku|meditasyon|lofi|gece/.test(p))
      return { scale: "major", bpm: 76, wave: "triangle", name: "Sakin (majör)" };
    if (/siber|retro|synth|uzay|neon/.test(p))
      return { scale: "minor", bpm: 112, wave: "sawtooth", name: "Synthwave (minör)" };
    return { scale: "major", bpm: 104, wave: "triangle", name: "Dengeli (majör)" };
  }

  function midiToFreq(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  // Besteyi nota olayları listesi olarak üret (çalma ve WAV aynı planı kullanır)
  function compose(prompt) {
    const seed = VegaEngine.hashString("muzik:" + prompt.trim().toLocaleLowerCase("tr"));
    const rnd = rng(seed);
    const mood = analyzeMood(prompt);
    const scale = SCALES[mood.scale];
    const root = 57 + Math.floor(rnd() * 8);           // A3 civarı kök
    const prog = PROGRESSIONS[Math.floor(rnd() * PROGRESSIONS.length)];
    const beat = 60 / mood.bpm;
    const BARS = 16;
    const events = [];                                  // {t, dur, freq, gain, type}

    for (let bar = 0; bar < BARS; bar++) {
      const t0 = bar * 4 * beat;
      const degree = prog[bar % prog.length];

      // Akor (pad) — kök, 3'lü, 5'li
      [0, 2, 4].forEach(off => {
        const idx = degree + off;
        const midi = root + 12 * Math.floor(idx / scale.length) + scale[idx % scale.length];
        events.push({ t: t0, dur: 4 * beat, freq: midiToFreq(midi),
                      gain: 0.055, type: "sine" });
      });

      // Bas — her vuruşta kök
      for (let b = 0; b < 4; b++) {
        if (b === 0 || rnd() > 0.4) {
          const midi = root - 12 + scale[degree % scale.length];
          events.push({ t: t0 + b * beat, dur: beat * 0.9, freq: midiToFreq(midi),
                        gain: 0.14, type: "triangle" });
        }
      }

      // Melodi — gam içinde adım ağırlıklı yürüyüş
      let mel = degree + 7;  // bir oktav üstten başla
      for (let s = 0; s < 8; s++) {
        if (rnd() > 0.28) {
          const step = [-2, -1, -1, 0, 1, 1, 2, 3][Math.floor(rnd() * 8)];
          mel = Math.max(4, Math.min(14, mel + step));
          const midi = root + 12 * Math.floor(mel / scale.length) + scale[mel % scale.length];
          const dur = (rnd() > 0.75 ? 1.0 : 0.5) * beat;
          events.push({ t: t0 + s * beat * 0.5, dur: dur * 0.92,
                        freq: midiToFreq(midi), gain: 0.11, type: mood.wave });
        }
      }
    }

    return { events, duration: BARS * 4 * beat + 1.5, mood, seed, bpm: mood.bpm };
  }

  function scheduleNote(ctx, dest, ev, startAt) {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = ev.type;
    osc.frequency.value = ev.freq;
    const t = startAt + ev.t;
    // ADSR zarfı
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(ev.gain, t + 0.02);
    env.gain.setValueAtTime(ev.gain, t + ev.dur * 0.6);
    env.gain.linearRampToValueAtTime(0.0001, t + ev.dur);
    osc.connect(env).connect(dest);
    osc.start(t);
    osc.stop(t + ev.dur + 0.05);
  }

  function buildGraph(ctx) {
    // Master + hafif delay efekti
    const master = ctx.createGain();
    master.gain.value = 0.9;
    const delay = ctx.createDelay();
    delay.delayTime.value = 0.28;
    const fb = ctx.createGain();
    fb.gain.value = 0.22;
    const wet = ctx.createGain();
    wet.gain.value = 0.18;
    master.connect(ctx.destination);
    master.connect(delay);
    delay.connect(fb).connect(delay);
    delay.connect(wet).connect(ctx.destination);
    return master;
  }

  let liveCtx = null;

  function play(composition) {
    stop();
    liveCtx = new (window.AudioContext || window.webkitAudioContext)();
    const master = buildGraph(liveCtx);
    const startAt = liveCtx.currentTime + 0.1;
    composition.events.forEach(ev => scheduleNote(liveCtx, master, ev, startAt));
    return composition.duration;
  }

  function stop() {
    if (liveCtx) { liveCtx.close(); liveCtx = null; }
  }

  // WAV dışa aktarma — OfflineAudioContext ile gerçek ses dosyası işlenir
  async function renderWav(composition) {
    const rate = 44100;
    const off = new OfflineAudioContext(2, Math.ceil(composition.duration * rate), rate);
    const master = buildGraph(off);
    composition.events.forEach(ev => scheduleNote(off, master, ev, 0.05));
    const buffer = await off.startRendering();
    return audioBufferToWav(buffer);
  }

  function audioBufferToWav(buffer) {
    const numCh = buffer.numberOfChannels;
    const len = buffer.length * numCh * 2;
    const out = new DataView(new ArrayBuffer(44 + len));
    const writeStr = (o, s) => { for (let i = 0; i < s.length; i++) out.setUint8(o + i, s.charCodeAt(i)); };

    writeStr(0, "RIFF"); out.setUint32(4, 36 + len, true); writeStr(8, "WAVE");
    writeStr(12, "fmt "); out.setUint32(16, 16, true);
    out.setUint16(20, 1, true); out.setUint16(22, numCh, true);
    out.setUint32(24, buffer.sampleRate, true);
    out.setUint32(28, buffer.sampleRate * numCh * 2, true);
    out.setUint16(32, numCh * 2, true); out.setUint16(34, 16, true);
    writeStr(36, "data"); out.setUint32(40, len, true);

    let offset = 44;
    const channels = [];
    for (let c = 0; c < numCh; c++) channels.push(buffer.getChannelData(c));
    for (let i = 0; i < buffer.length; i++) {
      for (let c = 0; c < numCh; c++) {
        const s = Math.max(-1, Math.min(1, channels[c][i]));
        out.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        offset += 2;
      }
    }
    return new Blob([out.buffer], { type: "audio/wav" });
  }

  return { generateImage, compose, play, stop, renderWav };
})();
