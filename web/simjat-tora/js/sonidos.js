/* =====================================================================
   SONIDOS
   Mezcla los audios grabados (carpeta audio/) con efectos sintetizados
   en el momento (fanfarria, redoble, whoosh...). Todo pasa por un
   compresor para que suene fuerte y parejo en un parlante.
   ===================================================================== */

const Sonido = (() => {
  const CLAVE_MUTE = 'mazeltoc_st_mute';
  let muteado = false;
  try { muteado = localStorage.getItem(CLAVE_MUTE) === '1'; } catch (e) {}

  let ctx = null, salida = null;
  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14; comp.knee.value = 8; comp.ratio.value = 5;
      comp.attack.value = 0.003; comp.release.value = 0.2;
      salida = ctx.createGain();
      salida.gain.value = 1.0;
      salida.connect(comp); comp.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /* ---------- bloques básicos ---------- */

  function tono(freq, t0, dur, o = {}) {
    const c = ac(); if (!c) return;
    const { tipo = 'sine', vol = 0.3, ataque = 0.01, hasta = null, filtro = null } = o;
    const osc = c.createOscillator(), g = c.createGain();
    osc.type = tipo;
    osc.frequency.setValueAtTime(freq, t0);
    if (hasta) osc.frequency.exponentialRampToValueAtTime(hasta, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + ataque);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    let nodo = osc;
    if (filtro) {
      const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = filtro;
      osc.connect(f); nodo = f;
    }
    nodo.connect(g); g.connect(salida);
    osc.start(t0); osc.stop(t0 + dur + 0.05);
  }

  let bufferRuido = null;
  function ruido(t0, dur, o = {}) {
    const c = ac(); if (!c) return;
    const { vol = 0.3, tipo = 'highpass', freq = 1000, hasta = null, q = 0.8 } = o;
    if (!bufferRuido) {
      bufferRuido = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
      const d = bufferRuido.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const src = c.createBufferSource(); src.buffer = bufferRuido;
    const f = c.createBiquadFilter(); f.type = tipo; f.Q.value = q;
    f.frequency.setValueAtTime(freq, t0);
    if (hasta) f.frequency.exponentialRampToValueAtTime(hasta, t0 + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(salida);
    src.start(t0, Math.random()); src.stop(t0 + dur + 0.05);
  }

  function bombo(t0, vol = 0.9) {
    tono(160, t0, 0.35, { vol, hasta: 38, ataque: 0.002 });
    ruido(t0, 0.03, { vol: vol * 0.4, tipo: 'lowpass', freq: 1500 });
  }
  function platillo(t0, dur = 1.2, vol = 0.25) { ruido(t0, dur, { vol, tipo: 'highpass', freq: 6000 }); }
  function redoblante(t0, vol = 0.35) {
    ruido(t0, 0.12, { vol, tipo: 'bandpass', freq: 1800, q: 0.6 });
    tono(220, t0, 0.08, { vol: vol * 0.6, tipo: 'triangle' });
  }
  // "trompeta": dos serruchos apenas desafinados, filtrados
  function trompeta(freq, t0, dur, vol = 0.18) {
    tono(freq, t0, dur, { tipo: 'sawtooth', vol, ataque: 0.03, filtro: 2600 });
    tono(freq * 1.004, t0, dur, { tipo: 'sawtooth', vol: vol * 0.8, ataque: 0.03, filtro: 2200 });
    tono(freq / 2, t0, dur, { tipo: 'square', vol: vol * 0.35, ataque: 0.03, filtro: 900 });
  }

  /* ---------- audios grabados ---------- */

  function mp3(id, vol = 1) {
    if (muteado) return;
    const el = document.getElementById(id);
    if (!el) return;
    try {
      el.pause(); el.currentTime = 0; el.volume = vol;
      const p = el.play(); if (p && p.catch) p.catch(() => {});
    } catch (e) {}
  }
  function pararMp3(id) {
    const el = document.getElementById(id);
    if (el) { try { el.pause(); el.currentTime = 0; } catch (e) {} }
  }

  function t() { const c = ac(); return c ? c.currentTime + 0.02 : 0; }
  const si = (fn) => (...args) => { if (muteado) return; try { fn(...args); } catch (e) {} };

  /* ---------- efectos públicos ---------- */

  const api = {
    clic: si(() => { tono(900, t(), 0.06, { tipo: 'triangle', vol: 0.15 }); }),

    whoosh: si(() => { ruido(t(), 0.45, { vol: 0.35, tipo: 'bandpass', freq: 400, hasta: 5000, q: 1.2 }); }),

    inicio: si(() => {
      const s = t();
      bombo(s); tono(440, s, 0.25, { tipo: 'square', vol: 0.12, filtro: 3000 });
      tono(880, s + 0.12, 0.35, { tipo: 'square', vol: 0.14, filtro: 3000 });
    }),

    punto: si(() => {
      const s = t();
      tono(988, s, 0.09, { tipo: 'square', vol: 0.12, filtro: 5000 });
      tono(1319, s + 0.08, 0.35, { tipo: 'square', vol: 0.12, filtro: 5000 });
    }),

    acierto: si(() => {
      const s = t();
      bombo(s, 0.8);
      [523, 659, 784, 1047].forEach((f, i) => {
        tono(f, s + i * 0.07, 0.35, { tipo: 'square', vol: 0.11, filtro: 4000 });
        tono(f * 2, s + i * 0.07, 0.25, { tipo: 'sine', vol: 0.08 });
      });
      platillo(s + 0.28, 0.9, 0.18);
      mp3('audio-aplauso', 0.9);
    }),

    error: si(() => {
      const s = t();
      tono(311, s, 0.28, { tipo: 'sawtooth', vol: 0.2, filtro: 1200 });
      tono(233, s + 0.28, 0.55, { tipo: 'sawtooth', vol: 0.22, filtro: 1000, hasta: 180 });
      mp3('audio-abucheo', 0.8);
    }),

    // error corto, sin abucheo (para juegos rápidos como Contrarreloj)
    fallito: si(() => { tono(260, t(), 0.25, { tipo: 'sawtooth', vol: 0.18, filtro: 1200, hasta: 160 }); }),

    chicharra: si(() => { mp3('audio-chicharra', 1); }),

    bip: si((urgente) => {
      tono(urgente ? 1320 : 880, t(), 0.12, { tipo: 'square', vol: 0.14, filtro: 4000 });
    }),

    robo: si(() => {
      const s = t();
      for (let i = 0; i < 3; i++) {
        tono(700, s + i * 0.24, 0.12, { tipo: 'square', vol: 0.12, filtro: 3000 });
        tono(1050, s + i * 0.24 + 0.12, 0.12, { tipo: 'square', vol: 0.12, filtro: 3000 });
      }
    }),

    eliminado: si(() => {
      const s = t();
      tono(600, s, 0.9, { tipo: 'sawtooth', vol: 0.18, hasta: 90, filtro: 1500 });
      bombo(s + 0.85, 0.7);
      mp3('audio-abucheo', 0.7);
    }),

    redoble: si((dur = 1.4) => {
      const s = t();
      let x = 0, paso = 0.09;
      while (x < dur) { redoblante(s + x, 0.18 + 0.2 * (x / dur)); x += paso; paso = Math.max(0.035, paso * 0.93); }
      bombo(s + dur, 1); platillo(s + dur, 1.4, 0.3);
    }),

    fanfarria: si(() => {
      const s = t();
      // ta-ta-ta-TAAA  ta-TAAAA
      const notas = [[392, 0, 0.14], [392, 0.15, 0.14], [392, 0.3, 0.14], [523, 0.45, 0.5],
                     [466, 1.0, 0.18], [523, 1.2, 0.18], [659, 1.4, 0.18], [784, 1.6, 1.1]];
      notas.forEach(([f, d, du]) => { trompeta(f, s + d, du); trompeta(f * 1.26, s + d, du, 0.1); });
      [0, 0.45, 1.0, 1.4, 1.6].forEach(d => bombo(s + d, 0.9));
      platillo(s + 0.45, 1.0, 0.25); platillo(s + 1.6, 1.8, 0.35);
      mp3('audio-hinchada', 1);
    }),

    hinchada: si(() => { mp3('audio-hinchada', 1); }),
    abucheoGrande: si(() => { mp3('audio-abucheo-grande', 1); }),

    // tic-tac de fondo mientras corre el reloj
    ticTac(on, rapido) {
      const el = document.getElementById('audio-tictac');
      if (!el) return;
      if (!on || muteado) { try { el.pause(); } catch (e) {} return; }
      try {
        el.loop = true; el.volume = 0.7; el.playbackRate = rapido ? 1.5 : 1;
        if (el.paused) { const p = el.play(); if (p && p.catch) p.catch(() => {}); }
      } catch (e) {}
    },

    pararTodo() {
      ['audio-tictac', 'audio-aplauso', 'audio-abucheo', 'audio-hinchada', 'audio-abucheo-grande'].forEach(pararMp3);
    },

    get muteado() { return muteado; },
    alternar() {
      muteado = !muteado;
      try { localStorage.setItem(CLAVE_MUTE, muteado ? '1' : '0'); } catch (e) {}
      if (muteado) api.pararTodo();
      document.querySelectorAll('.btn-sonido').forEach(b => b.textContent = muteado ? '🔇' : '🔊');
      return muteado;
    },
    // los navegadores exigen un toque del usuario antes de sonar
    desbloquear() { ac(); }
  };
  return api;
})();
