/* =====================================================================
   JUEGOS POR EQUIPOS
   Cada juego se registra con registrarJuego({...}).
   Las preguntas y palabras NO están acá: están en la carpeta datos/.
   ===================================================================== */

/* ---------- ayudantes comunes ---------- */

// Hace jugar a cada equipo "porEquipo" veces, en orden, y al final termina.
async function porTurnos(ctx, porEquipo, fnTurno, { etiqueta = 'Turno', anunciarCada = true } = {}) {
  const p = ctx.partida;
  const total = p.n * porEquipo;
  const inicio = p.turno;
  for (let k = 0; k < total; k++) {
    if (!ctx.vivo()) return;
    const t = (inicio + k) % p.n;
    p.ponerTurno(t);
    ponerProgreso(`${etiqueta} <b>${k + 1}</b> de <b>${total}</b>`);
    if (anunciarCada) await anunciarTurno(t);
    if (!ctx.vivo()) return;
    await fnTurno(t, k, total);
  }
  if (!ctx.vivo()) return;
  p.ponerTurno(p.siguiente(p.turno));
  ctx.terminar();
}

function etiquetaEquipo(i) {
  const e = Estado.equipos[i];
  return `<span class="chip-equipo" style="--c:${e.color}">${esc(e.nombre)}</span>`;
}

function claseNivel(nivel) { return normalizar(nivel).toLowerCase(); }

// Deja un botón "Siguiente" y espera a que el conductor lo toque.
function esperarSiguiente(ctx, texto) {
  return new Promise(resolver => {
    const z = $('#zona .zona-contenido');
    if (!z) return;
    botonSiguiente(z, texto || 'Siguiente ➜', resolver);
  });
}

/* =====================================================================
   PREGUNTA DE OPCIÓN MÚLTIPLE (Trivia y Duelo con Robo)
   ===================================================================== */

function jugarPreguntaMC(ctx, item, { robo = false } = {}) {
  return new Promise(resolver => {
    const p = ctx.partida;
    const t = p.turno;
    const pts = CONFIG.PUNTOS_POR_NIVEL[item.nivel] || 1;
    const opciones = mezclar(item.opciones.map((texto, i) => ({ texto, ok: i === (item.correcta ?? 0) })));

    dibujarZona(`
      <div class="etiquetas">
        <span class="nivel nivel-${claseNivel(item.nivel)}">${esc(item.nivel)}</span>
        <span class="vale">Vale ${pts} punto${pts > 1 ? 's' : ''}</span>
      </div>
      <div class="pregunta">${esc(item.pregunta)}</div>
      <div class="opciones">
        ${opciones.map((o, k) => `
          <button class="opcion" data-k="${k}" style="--d:${k * 0.07}s">
            <span class="letra">${'ABCD'[k]}</span><span class="texto">${esc(o.texto)}</span>
          </button>`).join('')}
      </div>
      <div id="relojBox"></div>
      <div id="resultado"></div>`);

    let responde = t, fase = 'normal', cerrado = false;
    let reloj = new Reloj($('#relojBox'), Estado.tiempo, { alTerminar: () => fallo(true) });

    $$('.opcion').forEach(b => b.addEventListener('click', () => {
      if (cerrado || b.disabled) return;
      reloj.detener();
      const o = opciones[Number(b.dataset.k)];
      if (o.ok) {
        b.classList.add('correcta');
        cerrado = true;
        p.sumar(responde, pts);
        Sonido.acierto();
        confeti('chico', [Estado.equipos[responde].color, '#E8B22E', '#fff']);
        cerrar(`✅ ¡Correcto${fase === 'robo' ? ', robo exitoso' : ''}! ${etiquetaEquipo(responde)} suma ${pts}.`, 'bien');
      } else {
        b.classList.add('incorrecta');
        b.disabled = true;
        sacudir(b);
        fallo(false);
      }
    }));

    async function fallo(porTiempo) {
      if (cerrado) return;
      if (robo && fase === 'normal' && p.n > 1) {
        fase = 'robo';
        Sonido.error();
        responde = p.siguiente(t);
        const eq = Estado.equipos[responde];
        await anunciar({
          arriba: porTiempo ? '⏰ ¡Se acabó el tiempo!' : '❌ ¡Incorrecto!',
          titulo: '¡Roba ' + esc(eq.nombre) + '!', color: eq.color, emoji: '🥷', sonido: 'robo', dur: 1900
        });
        if (!ctx.vivo()) return;
        p.ponerTurno(responde);
        $('#resultado').innerHTML = `<div class="aviso robo">🥷 Robo: ${etiquetaEquipo(responde)} elige entre las opciones que quedan.</div>`;
        reloj = new Reloj($('#relojBox'), Estado.tiempo, { alTerminar: () => fallo(true), texto: '▶ Arrancar reloj del robo' });
        return;
      }
      cerrado = true;
      Sonido.error();
      cerrar(porTiempo ? '⏰ ¡Se acabó el tiempo! Nadie suma.' : '❌ Incorrecto. Nadie suma.', 'mal');
    }

    function cerrar(msg, tipo) {
      reloj.detener();
      $$('.opcion').forEach((b, k) => {
        b.disabled = true;
        if (opciones[k].ok) b.classList.add('correcta');
      });
      $('#resultado').innerHTML = `
        <div class="aviso ${tipo}">${msg}</div>
        ${item.explicacion ? `<div class="explicacion">💡 ${esc(item.explicacion)}</div>` : ''}`;
      botonSiguiente($('#zona .zona-contenido'), 'Siguiente ➜', resolver);
    }
  });
}

function sacarTrivia(nivel) {
  const filtro = (!nivel || nivel === 'Mezcla') ? null : (q => normalizar(q.nivel) === normalizar(nivel));
  return sacarDe('trivia', DATOS_TRIVIA, filtro);
}

/* =====================================================================
   1. TRIVIA EN EQUIPOS
   ===================================================================== */

registrarJuego({
  id: 'trivia', icono: '🏆', titulo: 'Trivia en Equipos',
  desc: 'Preguntas de Simjat Torá por turnos. Las difíciles valen más.',
  reglas: [
    'Cada equipo, en su turno, responde una pregunta con 4 opciones.',
    'Quien conduce lee la pregunta en voz alta y <b>arranca el reloj</b>.',
    'Fácil = 1 punto · Medio = 2 · Difícil = 3.',
    'Si se equivocan o se acaba el tiempo, no suman.'
  ],
  opciones: [
    { clave: 'porEquipo', etiqueta: 'Preguntas por equipo', valores: [3, 5, 8], def: 5 },
    { clave: 'nivel', etiqueta: 'Dificultad', valores: ['Mezcla', 'Fácil', 'Medio', 'Difícil'], def: 'Mezcla' }
  ],
  jugar(ctx) {
    porTurnos(ctx, ctx.op.porEquipo, () => jugarPreguntaMC(ctx, sacarTrivia(ctx.op.nivel)), { etiqueta: 'Pregunta' });
  }
});

/* =====================================================================
   2. DUELO CON ROBO
   ===================================================================== */

registrarJuego({
  id: 'duelo', icono: '🥊', titulo: 'Duelo con Robo',
  desc: 'Trivia con picante: si un equipo falla, el siguiente le roba la pregunta.',
  reglas: [
    'Cada equipo responde una pregunta en su turno.',
    'Si falla o se le acaba el tiempo, <b>el equipo siguiente puede robar</b> eligiendo entre las opciones que quedan.',
    'El robo vale lo mismo que la pregunta (1, 2 o 3 puntos según el nivel).'
  ],
  opciones: [{ clave: 'porEquipo', etiqueta: 'Preguntas por equipo', valores: [3, 5, 8], def: 5 }],
  jugar(ctx) {
    porTurnos(ctx, ctx.op.porEquipo, () => jugarPreguntaMC(ctx, sacarTrivia(), { robo: true }), { etiqueta: 'Pregunta' });
  }
});

/* =====================================================================
   3. VERDADERO O FALSO EN EQUIPOS
   ===================================================================== */

function jugarVF(ctx) {
  return new Promise(resolver => {
    const p = ctx.partida, t = p.turno;
    const item = sacarDe('vf', DATOS_VERDADERO_FALSO);
    dibujarZona(`
      <div class="etiquetas"><span class="vale">Vale 1 punto</span></div>
      <div class="pregunta">${esc(item.afirmacion)}</div>
      <div class="vf-botones">
        <button class="vf-btn vf-si" data-v="1">✅ VERDADERO</button>
        <button class="vf-btn vf-no" data-v="0">❌ FALSO</button>
      </div>
      <div id="relojBox"></div>
      <div id="resultado"></div>`);
    let cerrado = false;
    const reloj = new Reloj($('#relojBox'), Estado.tiempo, { alTerminar: () => fin(null) });
    $$('.vf-btn').forEach(b => b.addEventListener('click', () => fin(b.dataset.v === '1', b)));

    function fin(eleccion, btn) {
      if (cerrado) return;
      cerrado = true;
      reloj.detener();
      const ok = eleccion === item.verdadero;
      $$('.vf-btn').forEach(b => {
        b.disabled = true;
        if ((b.dataset.v === '1') === item.verdadero) b.classList.add('correcta');
      });
      if (btn && !ok) { btn.classList.add('incorrecta'); sacudir(btn); }
      if (ok) { p.sumar(t, 1); Sonido.acierto(); confeti('chico', [Estado.equipos[t].color, '#fff']); }
      else Sonido.error();
      const msg = eleccion === null ? '⏰ ¡Se acabó el tiempo!' : ok ? '✅ ¡Correcto!' : '❌ ¡No!';
      $('#resultado').innerHTML = `
        <div class="aviso ${ok ? 'bien' : 'mal'}">${msg} Es <b>${item.verdadero ? 'VERDADERO' : 'FALSO'}</b>.</div>
        <div class="explicacion">💡 ${esc(item.explicacion)}</div>`;
      botonSiguiente($('#zona .zona-contenido'), 'Siguiente ➜', resolver);
    }
  });
}

registrarJuego({
  id: 'vf', icono: '🤝', titulo: 'Verdadero o Falso',
  desc: 'Afirmaciones sobre la Torá y la fiesta: ¿verdad o mentira?',
  reglas: [
    'Cada equipo, en su turno, escucha una afirmación.',
    'Deciden entre todos: ¿verdadero o falso?',
    'Acierto = 1 punto.'
  ],
  opciones: [{ clave: 'porEquipo', etiqueta: 'Afirmaciones por equipo', valores: [3, 5, 8], def: 5 }],
  jugar(ctx) { porTurnos(ctx, ctx.op.porEquipo, () => jugarVF(ctx), { etiqueta: 'Afirmación' }); }
});

/* =====================================================================
   4. CONTRARRELOJ
   ===================================================================== */

function jugarContrarreloj(ctx) {
  return new Promise(resolver => {
    const p = ctx.partida, t = p.turno;
    let aciertos = 0, activo = false, item = null, opciones = [];
    dibujarZona(`
      <p class="instruccion">⚡ ${CONFIG.TIEMPO_TURNO_LARGO} segundos para responder <b>todas las que puedan</b>. Cada acierto suma 1.</p>
      <div id="relojBox"></div>
      <div class="contador-aciertos">Aciertos: <b id="crCuenta">0</b></div>
      <div id="crPregunta"></div>
      <div id="resultado"></div>`);
    new Reloj($('#relojBox'), CONFIG.TIEMPO_TURNO_LARGO, {
      alArrancar: () => { activo = true; nueva(); },
      alTerminar: () => {
        activo = false;
        $$('#crPregunta .opcion').forEach(b => b.disabled = true);
        if (aciertos > 0) { Sonido.hinchada(); confeti('chico', [Estado.equipos[t].color]); } else Sonido.abucheoGrande();
        $('#resultado').innerHTML = `<div class="aviso ${aciertos ? 'bien' : 'mal'}">⏰ ¡Tiempo! ${etiquetaEquipo(t)} hizo <b>${aciertos}</b> acierto${aciertos === 1 ? '' : 's'}.</div>`;
        botonSiguiente($('#zona .zona-contenido'), 'Siguiente ➜', resolver);
      }
    });

    function nueva() {
      item = sacarDe('trivia', DATOS_TRIVIA, q => q.nivel !== 'difícil');
      opciones = mezclar(item.opciones.map((texto, i) => ({ texto, ok: i === (item.correcta ?? 0) })));
      $('#crPregunta').innerHTML = `
        <div class="pregunta chica">${esc(item.pregunta)}</div>
        <div class="opciones">${opciones.map((o, k) => `
          <button class="opcion" data-k="${k}" style="--d:${k * 0.04}s"><span class="letra">${'ABCD'[k]}</span><span class="texto">${esc(o.texto)}</span></button>`).join('')}
        </div>`;
      $$('#crPregunta .opcion').forEach(b => b.addEventListener('click', () => responder(b)));
    }

    function responder(b) {
      if (!activo) return;
      activo = false;
      const o = opciones[Number(b.dataset.k)];
      $$('#crPregunta .opcion').forEach((x, k) => { x.disabled = true; if (opciones[k].ok) x.classList.add('correcta'); });
      if (o.ok) { aciertos++; p.sumar(t, 1); $('#crCuenta').textContent = aciertos; }
      else { b.classList.add('incorrecta'); Sonido.fallito(); }
      setTimeout(() => {
        if (!ctx.vivo() || !Reloj.actual || !Reloj.actual.corriendo && Reloj.actual.estado !== 'pausado') return;
        activo = true; nueva();
      }, o.ok ? 550 : 1100);
    }
  });
}

registrarJuego({
  id: 'contrarreloj', icono: '⏱️', titulo: 'Contrarreloj',
  desc: `${CONFIG.TIEMPO_TURNO_LARGO} segundos por equipo para contestar todas las que puedan.`,
  reglas: [
    `Cada equipo tiene <b>${CONFIG.TIEMPO_TURNO_LARGO} segundos</b> seguidos.`,
    'Apenas se arranca el reloj aparecen preguntas una atrás de otra.',
    'Cada acierto suma 1 punto. Los errores no restan, pero hacen perder tiempo.',
    'Se puede pausar el reloj si hace falta.'
  ],
  opciones: [{ clave: 'porEquipo', etiqueta: 'Rondas por equipo', valores: [1, 2], def: 1 }],
  jugar(ctx) { porTurnos(ctx, ctx.op.porEquipo, () => jugarContrarreloj(ctx), { etiqueta: 'Ronda' }); }
});

/* =====================================================================
   5. ORDENÁ LA TORÁ
   ===================================================================== */

function jugarOrdenar(ctx) {
  return new Promise(resolver => {
    const p = ctx.partida, t = p.turno;
    const item = sacarDe('ordenar', DATOS_ORDENAR);
    let desorden;
    do { desorden = mezclar(item.items.map((texto, i) => ({ texto, i }))); }
    while (desorden.every((x, k) => x.i === k));
    const elegidos = [];
    let cerrado = false;

    dibujarZona(`
      <div class="pregunta chica">${esc(item.titulo)}</div>
      <p class="instruccion">${esc(item.consigna)} Tocá en el orden que dice el equipo. Para corregir, tocá uno ya puesto.</p>
      <ol class="orden-puestos" id="puestos"></ol>
      <div class="orden-sueltos" id="sueltos"></div>
      <div id="relojBox"></div>
      <button class="btn btn-grande" id="btnComprobar" disabled>✔ Comprobar orden</button>
      <div id="resultado"></div>`);

    const reloj = new Reloj($('#relojBox'), Estado.tiempo * CONFIG.MULTIPLICADOR_ORDENAR, { alTerminar: () => comprobar(true) });
    dibujar();

    function dibujar() {
      $('#puestos').innerHTML = item.items.map((_, k) => {
        const x = elegidos[k];
        return `<li class="${x ? 'lleno' : 'vacio'}" data-k="${k}"><span class="n">${k + 1}</span>${x ? esc(x.texto) : '…'}</li>`;
      }).join('');
      $('#sueltos').innerHTML = desorden.filter(x => !elegidos.includes(x))
        .map(x => `<button class="ficha" data-i="${x.i}">${esc(x.texto)}</button>`).join('');
      $$('#sueltos .ficha').forEach(b => b.addEventListener('click', () => {
        if (cerrado) return;
        elegidos.push(desorden.find(x => x.i === Number(b.dataset.i)));
        Sonido.clic(); dibujar();
      }));
      $$('#puestos li.lleno').forEach(li => li.addEventListener('click', () => {
        if (cerrado) return;
        elegidos.splice(Number(li.dataset.k), 1); dibujar();
      }));
      $('#btnComprobar').disabled = elegidos.length !== item.items.length || cerrado;
    }

    $('#btnComprobar').addEventListener('click', () => comprobar(false));

    function comprobar(porTiempo) {
      if (cerrado) return;
      cerrado = true;
      reloj.detener();
      const n = item.items.length;
      const bien = item.items.filter((_, k) => elegidos[k] && elegidos[k].i === k).length;
      let pts = 0;
      if (bien === n) pts = CONFIG.PUNTOS_ORDENAR_PERFECTO;
      else if (bien >= Math.ceil(n / 2)) pts = CONFIG.PUNTOS_ORDENAR_CASI;
      $$('#puestos li').forEach((li, k) => li.classList.add(elegidos[k] && elegidos[k].i === k ? 'ok' : 'mal'));
      $('#btnComprobar').remove();
      $('#sueltos').innerHTML = '';
      if (pts) { p.sumar(t, pts); Sonido.acierto(); confeti(bien === n ? 'grande' : 'chico', [Estado.equipos[t].color, '#E8B22E']); }
      else Sonido.error();
      $('#resultado').innerHTML = `
        <div class="aviso ${pts ? 'bien' : 'mal'}">${porTiempo ? '⏰ ¡Tiempo! ' : ''}${bien === n ? '🌟 ¡Perfecto!' : `${bien} de ${n} en su lugar.`} ${pts ? `Suman ${pts}.` : 'No suman.'}</div>
        ${bien === n ? '' : `<div class="explicacion"><b>Orden correcto:</b><ol class="orden-correcto">${item.items.map(x => `<li>${esc(x)}</li>`).join('')}</ol></div>`}
        ${item.explicacion ? `<div class="explicacion">💡 ${esc(item.explicacion)}</div>` : ''}`;
      botonSiguiente($('#zona .zona-contenido'), 'Siguiente ➜', resolver);
    }
  });
}

registrarJuego({
  id: 'ordenar', icono: '📜', titulo: 'Ordená la Torá',
  desc: 'Los 5 libros, los días de la Creación, la historia de Moshé… ¡en orden!',
  reglas: [
    'Cada equipo recibe una lista desordenada y tiene que ponerla en orden.',
    'El equipo dicta y quien conduce va tocando las fichas.',
    `Todo bien = ${CONFIG.PUNTOS_ORDENAR_PERFECTO} puntos · Al menos la mitad bien = ${CONFIG.PUNTOS_ORDENAR_CASI}.`,
    `Tienen ${CONFIG.MULTIPLICADOR_ORDENAR} veces el tiempo normal.`
  ],
  opciones: [{ clave: 'porEquipo', etiqueta: 'Listas por equipo', valores: [1, 2, 3], def: 2 }],
  jugar(ctx) { porTurnos(ctx, ctx.op.porEquipo, () => jugarOrdenar(ctx), { etiqueta: 'Lista' }); }
});

/* =====================================================================
   6. ¿QUIÉN SOY?
   ===================================================================== */

function jugarQuienSoy(ctx) {
  return new Promise(resolver => {
    const p = ctx.partida, t = p.turno;
    const item = sacarDe('quien', DATOS_QUIEN_SOY);
    const maxPistas = item.pistas.length;
    let reveladas = 1, cerrado = false, reloj;

    dibujarZona(`
      <div class="pregunta chica">${item.tipo === 'personaje' ? '🕵️ ¿Quién soy?' : '🔮 ¿Qué soy?'}</div>
      <ol class="pistas" id="pistas"></ol>
      <div class="vale" id="valor"></div>
      <div id="relojBox"></div>
      <div class="botones-juez" id="juez">
        <button class="btn btn-si" id="btnSi">✅ ¡Adivinaron!</button>
        <button class="btn btn-no" id="btnNo">❌ No / Otra pista</button>
      </div>
      ${botonEspiar(esc(item.respuesta))}
      <div id="resultado"></div>`);

    function dibujar() {
      $('#pistas').innerHTML = item.pistas.slice(0, reveladas).map((x, k) =>
        `<li class="${k === reveladas - 1 ? 'nueva' : ''}"><span class="n">Pista ${k + 1}</span> ${esc(x)}</li>`).join('');
      const valor = maxPistas - reveladas + 1;
      $('#valor').textContent = `Si adivinan ahora: ${valor} punto${valor > 1 ? 's' : ''}`;
      reloj = new Reloj($('#relojBox'), Estado.tiempo, {
        alTerminar: () => { $('#resultado').innerHTML = '<div class="aviso">⏰ ¡Tiempo! ¿Llegaron a responder? Marcá ✅ o ❌.</div>'; }
      });
    }
    dibujar();

    $('#btnSi').addEventListener('click', () => {
      if (cerrado) return;
      const valor = maxPistas - reveladas + 1;
      p.sumar(t, valor);
      Sonido.acierto(); confeti('chico', [Estado.equipos[t].color]);
      fin(`✅ ¡Sí! Era <b>${esc(item.respuesta)}</b>. ${etiquetaEquipo(t)} suma ${valor}.`, 'bien');
    });
    $('#btnNo').addEventListener('click', () => {
      if (cerrado) return;
      $('#resultado').innerHTML = '';
      if (reveladas < maxPistas) {
        reveladas++; Sonido.fallito(); dibujar();
      } else {
        Sonido.error();
        fin(`❌ ¡No lo sacaron! Era <b>${esc(item.respuesta)}</b>.`, 'mal');
      }
    });

    function fin(msg, tipo) {
      cerrado = true;
      reloj.detener();
      $('#juez').remove();
      $$('.btn-espiar').forEach(b => b.remove());
      $('#pistas').innerHTML = item.pistas.map((x, k) => `<li><span class="n">Pista ${k + 1}</span> ${esc(x)}</li>`).join('');
      $('#resultado').innerHTML = `<div class="aviso ${tipo}">${msg}</div>${item.dato ? `<div class="explicacion">💡 ${esc(item.dato)}</div>` : ''}`;
      botonSiguiente($('#zona .zona-contenido'), 'Siguiente ➜', resolver);
    }
  });
}

registrarJuego({
  id: 'quien', icono: '🕵️', titulo: '¿Quién soy?',
  desc: 'Personajes y objetos de la Torá con pistas. Cuanto antes, más puntos.',
  reglas: [
    'Aparece una pista. El equipo tiene una chance de adivinar en voz alta.',
    'Si no aciertan, se muestra otra pista (y vale menos).',
    'Pista 1 = 3 puntos · Pista 2 = 2 · Pista 3 = 1.',
    'Quien conduce puede ver la respuesta <b>manteniendo apretado</b> el botón 👁.'
  ],
  opciones: [{ clave: 'porEquipo', etiqueta: 'Personajes por equipo', valores: [2, 3, 5], def: 3 }],
  jugar(ctx) { porTurnos(ctx, ctx.op.porEquipo, () => jugarQuienSoy(ctx), { etiqueta: 'Adivinanza' }); }
});

/* =====================================================================
   7. ¿QUÉ REPRESENTA? (emojis)
   ===================================================================== */

function jugarEmojis(ctx) {
  return new Promise(resolver => {
    const p = ctx.partida, t = p.turno;
    const item = sacarDe('emojis', DATOS_EMOJIS);
    let responde = t, fase = 'normal', cerrado = false, reloj;

    dibujarZona(`
      <div class="emojis-grandes">${[...item.emojis].length ? item.emojis.split(' ').map((e, k) => `<span style="--d:${k * 0.15}s">${e}</span>`).join('') : ''}</div>
      <p class="instruccion">¿Qué escena, personaje o costumbre representan estos emojis?</p>
      <div id="relojBox"></div>
      <div class="botones-juez" id="juez">
        <button class="btn btn-si" id="btnSi">✅ ¡Acertaron!</button>
        <button class="btn btn-no" id="btnNo">❌ No acertaron</button>
      </div>
      ${botonEspiar(esc(item.respuesta))}
      <div id="resultado"></div>`);

    const nuevoReloj = (texto) => { reloj = new Reloj($('#relojBox'), Estado.tiempo, { texto,
      alTerminar: () => { $('#resultado').innerHTML = '<div class="aviso">⏰ ¡Tiempo! ¿Llegaron a responder?</div>'; } }); };
    nuevoReloj();

    $('#btnSi').addEventListener('click', () => {
      if (cerrado) return;
      p.sumar(responde, 1);
      Sonido.acierto(); confeti('chico', [Estado.equipos[responde].color]);
      fin(`✅ ¡Bien! ${etiquetaEquipo(responde)} suma 1${fase === 'robo' ? ' con el robo' : ''}.`, 'bien');
    });
    $('#btnNo').addEventListener('click', async () => {
      if (cerrado) return;
      if (fase === 'normal' && p.n > 1) {
        fase = 'robo';
        Sonido.error();
        responde = p.siguiente(t);
        const eq = Estado.equipos[responde];
        await anunciar({ arriba: '❌ ¡No!', titulo: '¡Roba ' + esc(eq.nombre) + '!', color: eq.color, emoji: '🥷', sonido: 'robo', dur: 1700 });
        if (!ctx.vivo()) return;
        p.ponerTurno(responde);
        $('#resultado').innerHTML = `<div class="aviso robo">🥷 Robo: ahora responde ${etiquetaEquipo(responde)}.</div>`;
        nuevoReloj('▶ Arrancar reloj del robo');
        return;
      }
      Sonido.error();
      fin('❌ Nadie lo sacó.', 'mal');
    });

    function fin(msg, tipo) {
      cerrado = true;
      reloj.detener();
      $('#juez').remove();
      $$('.btn-espiar').forEach(b => b.remove());
      $('#resultado').innerHTML = `<div class="aviso ${tipo}">${msg}</div>
        <div class="explicacion"><b>Respuesta:</b> ${esc(item.respuesta)}${item.explicacion ? '<br>💡 ' + esc(item.explicacion) : ''}</div>`;
      botonSiguiente($('#zona .zona-contenido'), 'Siguiente ➜', resolver);
    }
  });
}

registrarJuego({
  id: 'emojis', icono: '🚩', titulo: '¿Qué representa?',
  desc: 'Emojis que esconden escenas de la Torá y costumbres de la fiesta.',
  reglas: [
    'Aparecen unos emojis. El equipo en turno dice qué representan.',
    'Acierto = 1 punto. Si fallan, <b>el siguiente equipo puede robar</b>.',
    'Quien conduce puede ver la respuesta manteniendo apretado el botón 👁.'
  ],
  opciones: [{ clave: 'porEquipo', etiqueta: 'Adivinanzas por equipo', valores: [3, 5], def: 3 }],
  jugar(ctx) { porTurnos(ctx, ctx.op.porEquipo, () => jugarEmojis(ctx), { etiqueta: 'Adivinanza' }); }
});

/* =====================================================================
   8. AHORCADO POR EQUIPOS (con banderitas como vidas)
   ===================================================================== */

registrarJuego({
  id: 'ahorcado', icono: '🎯', titulo: 'Ahorcado de la Torá',
  desc: 'Los equipos se turnan para decir letras. ¡Que no se caigan las banderitas!',
  reglas: [
    'El equipo en turno dice una letra y quien conduce la toca.',
    'Si está: +1 punto y <b>siguen jugando</b>. Si no está: se cae una banderita 🚩 y pasa el turno.',
    `Completar la palabra con la última letra: +${CONFIG.PUNTOS_AHORCADO_ULTIMA_LETRA}. Arriesgar la palabra entera y acertar: +${CONFIG.PUNTOS_AHORCADO_ARRIESGAR}.`,
    `Hay ${CONFIG.VIDAS_AHORCADO} banderitas por palabra, compartidas entre todos.`
  ],
  opciones: [{ clave: 'palabras', etiqueta: 'Cantidad de palabras', valores: [3, 5, 8], def: 5 }],
  async jugar(ctx) {
    const p = ctx.partida;
    for (let w = 0; w < ctx.op.palabras; w++) {
      if (!ctx.vivo()) return;
      ponerProgreso(`Palabra <b>${w + 1}</b> de <b>${ctx.op.palabras}</b>`);
      await jugarPalabraAhorcado(ctx);
      if (!ctx.vivo()) return;
      p.ponerTurno(p.siguiente());
    }
    ctx.terminar();
  }
});

function jugarPalabraAhorcado(ctx) {
  return new Promise(async resolver => {
    const p = ctx.partida;
    const item = sacarDe('ahorcado', DATOS_AHORCADO);
    const palabra = normalizar(item.palabra);
    const letrasPalabra = new Set([...palabra].filter(c => /[A-Z]/.test(c)));
    const usadas = new Set();
    let vidas = CONFIG.VIDAS_AHORCADO, cerrado = false, reloj;

    await anunciarTurno(p.turno, '¡Empieza…!');
    if (!ctx.vivo()) return;

    dibujarZona(`
      <div class="etiquetas"><span class="vale">${esc(item.categoria)}</span></div>
      <div class="pista-ahorcado">💡 ${esc(item.pista)}</div>
      <div class="vidas" id="vidas"></div>
      <div class="palabra-oculta" id="palabra"></div>
      <div class="turno-texto" id="turnoTexto"></div>
      <div id="relojBox"></div>
      <div class="teclado" id="teclado">
        ${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => `<button class="tecla" data-l="${l}">${l}</button>`).join('')}
      </div>
      <button class="btn secundario btn-grande" id="btnArriesgar">🎯 ¡Arriesgan la palabra!</button>
      <div id="arriesgar"></div>
      <div id="resultado"></div>`);

    function dibujarPalabra(revelarTodo) {
      $('#palabra').innerHTML = palabra.split(' ').map(pal => `<span class="pal">${[...pal].map(c => {
        const ver = revelarTodo || !/[A-Z]/.test(c) || usadas.has(c);
        return `<span class="casilla ${ver ? 'vista' : ''} ${revelarTodo && !usadas.has(c) ? 'regalada' : ''}">${ver ? c : ''}</span>`;
      }).join('')}</span>`).join('');
    }
    function dibujarVidas() {
      $('#vidas').innerHTML = Array.from({ length: CONFIG.VIDAS_AHORCADO }, (_, k) =>
        `<span class="${k < vidas ? '' : 'caida'}">🚩</span>`).join('');
    }
    function turnoNuevo() {
      $('#turnoTexto').innerHTML = `Dice una letra: ${etiquetaEquipo(p.turno)}`;
      reloj = new Reloj($('#relojBox'), Estado.tiempo, {
        alTerminar: () => { if (!cerrado) pasarTurno('⏰ ¡Tiempo!'); }
      });
    }
    async function pasarTurno(motivo) {
      p.ponerTurno(p.siguiente());
      $('#resultado').innerHTML = `<div class="aviso mal">${motivo} Pasa el turno.</div>`;
      await anunciarTurno(p.turno);
      if (!ctx.vivo() || cerrado) return;
      $('#resultado').innerHTML = '';
      turnoNuevo();
    }
    dibujarPalabra(); dibujarVidas(); turnoNuevo();

    $('#teclado').addEventListener('click', ev => {
      const b = ev.target.closest('.tecla');
      if (!b || cerrado || b.disabled) return;
      const l = b.dataset.l;
      usadas.add(l);
      b.disabled = true;
      reloj.detener();
      if (letrasPalabra.has(l)) {
        b.classList.add('bien');
        dibujarPalabra();
        $$('#palabra .casilla').forEach(c => { if (c.textContent === l) c.classList.add('giro'); });
        const completa = [...letrasPalabra].every(x => usadas.has(x));
        p.sumar(p.turno, 1);
        if (completa) {
          p.sumar(p.turno, CONFIG.PUNTOS_AHORCADO_ULTIMA_LETRA);
          Sonido.acierto(); confeti('grande', [Estado.equipos[p.turno].color, '#E8B22E']);
          fin(`🌟 ¡${etiquetaEquipo(p.turno)} completó la palabra! +${CONFIG.PUNTOS_AHORCADO_ULTIMA_LETRA} extra.`, 'bien');
        } else {
          $('#resultado').innerHTML = `<div class="aviso bien">✅ ¡Está la ${l}! Siguen jugando.</div>`;
          turnoNuevo();
        }
      } else {
        b.classList.add('mal');
        perderVida(`❌ No hay ${l}.`);
      }
    });

    function perderVida(msg) {
      vidas--;
      dibujarVidas();
      sacudir($('#vidas'));
      Sonido.error();
      if (vidas <= 0) fin('😢 ¡Se cayeron todas las banderitas! Nadie suma por completar.', 'mal');
      else pasarTurno(msg);
    }

    $('#btnArriesgar').addEventListener('click', () => {
      if (cerrado) return;
      reloj.pausar();
      $('#arriesgar').innerHTML = `
        <div class="panel-arriesgar">
          <p>${etiquetaEquipo(p.turno)} dice la palabra en voz alta. ¿Es correcta?</p>
          ${botonEspiar(esc(item.palabra))}
          <div class="botones-juez">
            <button class="btn btn-si" id="arrSi">✅ ¡Sí!</button>
            <button class="btn btn-no" id="arrNo">❌ No</button>
          </div>
        </div>`;
      $('#arrSi').addEventListener('click', () => {
        $('#arriesgar').innerHTML = '';
        p.sumar(p.turno, CONFIG.PUNTOS_AHORCADO_ARRIESGAR);
        Sonido.acierto(); confeti('grande', [Estado.equipos[p.turno].color, '#E8B22E']);
        fin(`🎯 ¡Arriesgaron y acertaron! ${etiquetaEquipo(p.turno)} suma ${CONFIG.PUNTOS_AHORCADO_ARRIESGAR}.`, 'bien');
      });
      $('#arrNo').addEventListener('click', () => {
        $('#arriesgar').innerHTML = '';
        reloj.detener();
        perderVida('❌ ¡Arriesgaron mal!');
      });
    });

    function fin(msg, tipo) {
      cerrado = true;
      if (reloj) reloj.detener();
      dibujarPalabra(true);
      $('#teclado').remove(); $('#btnArriesgar').remove(); $('#turnoTexto').remove();
      $('#arriesgar').innerHTML = '';
      $('#resultado').innerHTML = `<div class="aviso ${tipo}">${msg}</div>
        <div class="explicacion">La palabra era <b>${esc(item.palabra)}</b>.${item.explicacion ? ' ' + esc(item.explicacion) : ''}</div>`;
      botonSiguiente($('#zona .zona-contenido'), 'Siguiente ➜', resolver);
    }
  });
}

/* =====================================================================
   9. MEMORIA POR TURNOS
   ===================================================================== */

registrarJuego({
  id: 'memoria', icono: '🃏', titulo: 'Memoria por Turnos',
  desc: 'Encontrá la pareja: cada dibujo con su nombre. Pareja = punto y seguís.',
  reglas: [
    'Cada pareja es un dibujo y su nombre (📜 con "Sefer Torá").',
    'El equipo en turno elige dos cartas y quien conduce las da vuelta.',
    'Si forman pareja: +1 punto y <b>siguen jugando</b>. Si no: pasa el turno.',
    'Se termina cuando se encuentran todas las parejas.'
  ],
  opciones: [{ clave: 'pares', etiqueta: 'Cantidad de parejas', valores: [6, 8, 10], def: 8 }],
  jugar(ctx) {
    const p = ctx.partida;
    const pares = mezclar(DATOS_MEMORIA).slice(0, ctx.op.pares);
    const cartas = mezclar(pares.flatMap((x, id) => [
      { id, cara: `<span class="mem-emoji">${x.emoji}</span>` },
      { id, cara: `<span class="mem-palabra">${esc(x.nombre)}</span>` }
    ]));
    const encontradas = new Set();
    let abiertas = [], bloqueado = false, reloj;
    const columnas = ctx.op.pares === 6 ? 4 : ctx.op.pares === 8 ? 4 : 5;

    dibujarZona(`
      <div class="turno-texto" id="turnoTexto"></div>
      <div id="relojBox"></div>
      <div class="mem-grilla" style="--cols:${columnas}">
        ${cartas.map((c, k) => `
          <button class="mem-carta" data-k="${k}" style="--d:${k * 0.03}s">
            <span class="mem-dorso">📜</span><span class="mem-frente">${c.cara}</span>
          </button>`).join('')}
      </div>
      <div id="resultado"></div>`);

    function turnoNuevo() {
      ponerProgreso(`Parejas encontradas: <b>${encontradas.size}</b> de <b>${pares.length}</b>`);
      $('#turnoTexto').innerHTML = `Elige dos cartas: ${etiquetaEquipo(p.turno)}`;
      reloj = new Reloj($('#relojBox'), Estado.tiempo, { alTerminar: () => { if (!bloqueado) pasar('⏰ ¡Tiempo!'); } });
    }

    async function pasar(motivo) {
      bloqueado = true;
      if (motivo) $('#resultado').innerHTML = `<div class="aviso mal">${motivo}</div>`;
      await esperar(motivo ? 900 : 1300);
      if (!ctx.vivo()) return;
      abiertas.forEach(k => $(`.mem-carta[data-k="${k}"]`).classList.remove('abierta'));
      abiertas = [];
      p.ponerTurno(p.siguiente());
      await anunciar({ arriba: 'Turno de', titulo: esc(p.equipo().nombre), color: p.equipo().color, emoji: '🃏', dur: 900 });
      if (!ctx.vivo()) return;
      $('#resultado').innerHTML = '';
      bloqueado = false;
      turnoNuevo();
    }

    $('.mem-grilla').addEventListener('click', async ev => {
      const b = ev.target.closest('.mem-carta');
      if (!b || bloqueado) return;
      const k = Number(b.dataset.k);
      if (abiertas.includes(k) || encontradas.has(cartas[k].id)) return;
      if (!reloj.usado) reloj.arrancar();
      b.classList.add('abierta');
      Sonido.clic();
      abiertas.push(k);
      if (abiertas.length < 2) return;
      reloj.detener();
      const [a, c] = abiertas;
      if (cartas[a].id === cartas[c].id) {
        encontradas.add(cartas[a].id);
        [a, c].forEach(x => $(`.mem-carta[data-k="${x}"]`).classList.add('encontrada'));
        abiertas = [];
        p.sumar(p.turno, 1);
        Sonido.acierto();
        if (encontradas.size === pares.length) {
          ponerProgreso(`¡Todas las parejas encontradas!`);
          $('#turnoTexto').remove();
          confeti('grande');
          await esperar(1200);
          if (ctx.vivo()) ctx.terminar();
          return;
        }
        $('#resultado').innerHTML = `<div class="aviso bien">✅ ¡Pareja! ${etiquetaEquipo(p.turno)} sigue jugando.</div>`;
        turnoNuevo();
      } else {
        Sonido.fallito();
        pasar();
      }
    });

    anunciarTurno(p.turno).then(() => { if (ctx.vivo()) turnoNuevo(); });
  }
});

/* =====================================================================
   10. GUERRA DE CANCIONES
   ===================================================================== */

registrarJuego({
  id: 'canciones', icono: '🎶', titulo: 'Guerra de Canciones',
  desc: 'Aparece una palabra: canten una canción que la tenga. ¡El último en pie gana!',
  reglas: [
    'Aparece una palabra o tema. Por turnos, cada equipo canta un pedacito de una canción que la contenga.',
    '<b>No se puede repetir</b> una canción ya cantada en la ronda.',
    '✅ Válida: suma 1 punto y pasa al siguiente. ❌ No vale o se acabó el tiempo: ese equipo queda afuera de la ronda.',
    `El último equipo que queda en pie gana la ronda y suma ${CONFIG.BONUS_GANADOR_CANCIONES} puntos extra.`,
    'La app no muestra letras: ¡se canta de memoria!'
  ],
  opciones: [{ clave: 'rondas', etiqueta: 'Cantidad de palabras (rondas)', valores: [3, 5, 7], def: 5 }],
  async jugar(ctx) {
    const p = ctx.partida;
    for (let r = 0; r < ctx.op.rondas; r++) {
      if (!ctx.vivo()) return;
      ponerProgreso(`Ronda <b>${r + 1}</b> de <b>${ctx.op.rondas}</b>`);
      await rondaCanciones(ctx);
      if (!ctx.vivo()) return;
    }
    p.eliminados.clear();
    p.dibujar();
    ctx.terminar();
  }
});

function rondaCanciones(ctx) {
  return new Promise(async resolver => {
    const p = ctx.partida;
    p.eliminados.clear();
    const arranca = p.turno;
    let item = sacarDe('canciones', DATOS_CANCIONES);
    let cantadas = [], jugadas = 0, cerrado = false, reloj;

    await anunciar({ arriba: '🎤 Nueva ronda', titulo: 'Guerra de Canciones', color: '#1E3A8A', emoji: '🎶', dur: 1300, sonido: 'redoble' });
    if (!ctx.vivo()) return;
    p.ponerTurno(arranca);

    dibujarZona(`
      <div class="palabra-cancion" id="palabraCancion"></div>
      <button class="btn-chico" id="btnCambiar">🔄 Cambiar palabra</button>
      <div class="turno-texto grande" id="turnoTexto"></div>
      <div id="relojBox"></div>
      <div class="botones-juez">
        <button class="btn btn-si btn-gigante" id="btnValida">✅ Válida</button>
        <button class="btn btn-no btn-gigante" id="btnNoVale">❌ No vale / se acabó el tiempo</button>
      </div>
      <div class="anotar">
        <input type="text" id="inpCancion" maxlength="40" placeholder="Anotar la canción (opcional, para no repetir)">
      </div>
      <div class="cantadas" id="cantadas"></div>
      <div id="resultado"></div>`);

    function dibujarPalabra() {
      $('#palabraCancion').innerHTML = `
        <div class="pc-palabra">${esc(item.palabra)}</div>
        ${item.traduccion ? `<div class="pc-trad">${item.idioma === 'hebreo' ? '🇮🇱 en hebreo: ' : ''}${esc(item.traduccion)}</div>` : ''}`;
      const el = $('#palabraCancion'); el.classList.remove('entra'); void el.offsetWidth; el.classList.add('entra');
    }
    function dibujarCantadas() {
      $('#cantadas').innerHTML = cantadas.map(c => `<span class="chip-cancion" style="--c:${c.color}">🎵 ${esc(c.nombre)}</span>`).join('');
    }
    function turnoNuevo() {
      $('#turnoTexto').innerHTML = `🎤 Canta: ${etiquetaEquipo(p.turno)}`;
      const el = $('#turnoTexto'); el.classList.remove('entra'); void el.offsetWidth; el.classList.add('entra');
      reloj = new Reloj($('#relojBox'), Estado.tiempo, {
        alTerminar: () => { $('#resultado').innerHTML = '<div class="aviso mal">⏰ ¡Tiempo! Si no llegaron a cantar, tocá ❌.</div>'; }
      });
      $('#inpCancion').value = '';
    }
    function siguienteActivo() {
      let i = p.turno;
      do { i = p.siguiente(i); } while (p.eliminados.has(i));
      return i;
    }
    dibujarPalabra(); turnoNuevo();

    $('#btnCambiar').addEventListener('click', () => {
      item = sacarDe('canciones', DATOS_CANCIONES);
      Sonido.whoosh(); dibujarPalabra();
    });

    $('#btnValida').addEventListener('click', () => {
      if (cerrado) return;
      reloj.detener();
      jugadas++;
      const btnC = $('#btnCambiar'); if (btnC) btnC.remove();
      const nombre = $('#inpCancion').value.trim();
      if (nombre) { cantadas.push({ nombre, color: p.equipo().color }); dibujarCantadas(); }
      p.sumar(p.turno, 1);
      Sonido.acierto();
      $('#resultado').innerHTML = '';
      p.ponerTurno(siguienteActivo());
      turnoNuevo();
    });

    $('#btnNoVale').addEventListener('click', async () => {
      if (cerrado) return;
      reloj.detener();
      const btnC = $('#btnCambiar'); if (btnC) btnC.remove();
      const afuera = p.turno;
      p.eliminados.add(afuera);
      p.dibujar();
      Sonido.eliminado();
      const tile = $(`.marcador [data-eq="${afuera}"]`); sacudir(tile);
      const activos = Estado.equipos.map((_, i) => i).filter(i => !p.eliminados.has(i));
      if (activos.length === 1) {
        cerrado = true;
        const g = activos[0];
        p.ponerTurno(g);
        p.sumar(g, CONFIG.BONUS_GANADOR_CANCIONES);
        await esperar(700);
        Sonido.fanfarria();
        confeti('grande', [Estado.equipos[g].color, '#E8B22E', '#fff']);
        await anunciar({ arriba: '🏆 ¡Último en pie!', titulo: esc(Estado.equipos[g].nombre), abajo: `+${CONFIG.BONUS_GANADOR_CANCIONES} puntos`, color: Estado.equipos[g].color, emoji: '🎤', dur: 2600, sonido: null });
        if (!ctx.vivo()) return;
        $('.botones-juez').remove(); $('.anotar').remove(); $('#relojBox').innerHTML = '';
        $('#turnoTexto').innerHTML = `🏆 Ganó la ronda: ${etiquetaEquipo(g)}`;
        $('#resultado').innerHTML = '';
        p.eliminados.clear();
        p.ponerTurno(p.siguiente(arranca));
        botonSiguiente($('#zona .zona-contenido'), 'Siguiente ➜', resolver);
        return;
      }
      $('#resultado').innerHTML = `<div class="aviso mal">💥 ${etiquetaEquipo(afuera)} queda afuera de esta ronda.</div>`;
      p.ponerTurno(siguienteActivo());
      turnoNuevo();
    });
  });
}

/* =====================================================================
   TARJETAS CON TIEMPO LARGO (Palabra Prohibida y Dígalo con Mímica)
   ===================================================================== */

let tarjetaTapada = false;   // "modo pantalla grande": la tarjeta solo se ve apretando

function turnoTarjetas(ctx, { banco, mazo, instruccion, dibujarTarjeta, extras, botones, resumen }) {
  return new Promise(resolver => {
    const p = ctx.partida, t = p.turno;
    let item = null, activo = false;
    const log = [];

    dibujarZona(`
      <p class="instruccion">${instruccion}</p>
      <label class="interruptor"><input type="checkbox" id="chkTapar" ${tarjetaTapada ? 'checked' : ''}>
        <span>🙈 Pantalla grande: tapar la tarjeta (se ve manteniendo apretado)</span></label>
      <div id="relojBox"></div>
      <div id="tarjeta" class="tarjeta-zona"><div class="tarjeta-espera">La tarjeta aparece cuando arranca el reloj ⏱️</div></div>
      <div class="botones-juez" id="juez" style="display:none">
        ${botones.map(b => `<button class="btn ${b.clase}" data-accion="${b.id}">${b.texto}</button>`).join('')}
      </div>
      <div id="resultado"></div>`);

    $('#chkTapar').addEventListener('change', ev => { tarjetaTapada = ev.target.checked; if (item) mostrarTarjeta(); });

    new Reloj($('#relojBox'), CONFIG.TIEMPO_TURNO_LARGO, {
      alArrancar: () => { activo = true; $('#juez').style.display = ''; nueva(); },
      alTerminar: () => {
        activo = false;
        $('#juez').remove();
        const total = log.reduce((s, x) => s + x.pts, 0);
        if (total > 0) { Sonido.hinchada(); confeti('chico', [Estado.equipos[t].color]); } else Sonido.abucheoGrande();
        $('#tarjeta').innerHTML = '';
        $('#resultado').innerHTML = `
          <div class="aviso ${total > 0 ? 'bien' : 'mal'}">⏰ ¡Tiempo! ${etiquetaEquipo(t)} hizo <b>${total}</b> punto${total === 1 ? '' : 's'} en este turno.</div>
          ${log.length ? `<div class="explicacion">${resumen(log)}</div>` : ''}`;
        botonSiguiente($('#zona .zona-contenido'), 'Siguiente ➜', resolver);
      }
    });

    function nueva() {
      item = sacarDe(mazo, banco);
      item._estado = {};
      mostrarTarjeta(true);
    }
    function mostrarTarjeta(animar) {
      const html = dibujarTarjeta(item);
      $('#tarjeta').innerHTML = (tarjetaTapada
        ? `<div class="tarjeta tapada ${animar ? 'gira' : ''}">${botonEspiar(html, '🙈 Tarjeta tapada<br><small>Mantené apretado para verla</small>')}</div>`
        : `<div class="tarjeta ${animar ? 'gira' : ''}">${html}</div>`)
        + (extras ? `<div class="tarjeta-extras">${extras(item)}</div>` : '');
      $$('#tarjeta [data-extra]').forEach(b => b.addEventListener('click', ev => {
        ev.stopPropagation();
        item._estado[b.dataset.extra] = true;
        Sonido.whoosh();
        mostrarTarjeta();
      }));
    }

    $('#juez').addEventListener('click', ev => {
      const b = ev.target.closest('[data-accion]');
      if (!b || !activo) return;
      const def = botones.find(x => x.id === b.dataset.accion);
      const pts = def.puntos(item);
      if (pts) p.sumar(t, pts);
      if (def.sonido) Sonido[def.sonido]();
      log.push({ item, accion: def.id, pts });
      nueva();
    });
  });
}

/* =====================================================================
   11. PALABRA PROHIBIDA
   ===================================================================== */

registrarJuego({
  id: 'prohibida', icono: '🤐', titulo: 'Palabra Prohibida',
  desc: 'Describí la palabra sin decir las prohibidas. ¡Estilo Tabú!',
  reglas: [
    'Una persona del equipo describe la palabra de la tarjeta <b>sin decir</b> las palabras prohibidas.',
    `Su equipo tiene <b>${CONFIG.TIEMPO_TURNO_LARGO} segundos</b> para adivinar todas las que pueda.`,
    '✅ Adivinaron = +1 · 🚫 Dijo una prohibida = −1 · ⏭ Pasar = 0.',
    'Los otros equipos vigilan que no se digan las prohibidas.',
    'Si juegan con pantalla grande, activen "tapar la tarjeta" y que la mire solo quien describe.'
  ],
  opciones: [{ clave: 'porEquipo', etiqueta: 'Turnos por equipo', valores: [1, 2, 3], def: 1 }],
  jugar(ctx) {
    porTurnos(ctx, ctx.op.porEquipo, () => turnoTarjetas(ctx, {
      banco: DATOS_PALABRA_PROHIBIDA, mazo: 'prohibida',
      instruccion: '🗣️ Que pase al frente quien describe. Cuando esté listo, arrancá el reloj.',
      dibujarTarjeta: (it) => `
        <div class="tj-palabra">${esc(it.palabra)}</div>
        <div class="tj-prohibidas-titulo">🚫 No se puede decir:</div>
        <ul class="tj-prohibidas">${it.prohibidas.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`,
      botones: [
        { id: 'si', texto: '✅ ¡Adivinaron!', clase: 'btn-si', puntos: () => 1, sonido: 'acierto' },
        { id: 'prohibida', texto: '🚫 Dijo una prohibida', clase: 'btn-no', puntos: () => -1, sonido: 'error' },
        { id: 'pasar', texto: '⏭ Pasar', clase: 'secundario', puntos: () => 0, sonido: 'whoosh' }
      ],
      resumen: (log) => log.map(x => `${x.accion === 'si' ? '✅' : x.accion === 'prohibida' ? '🚫' : '⏭'} ${esc(x.item.palabra)}`).join(' · ')
    }), { etiqueta: 'Turno' });
  }
});

/* =====================================================================
   12. DÍGALO CON MÍMICA
   ===================================================================== */

const SENAS_MIMICA = `
  <details class="senas">
    <summary>📖 Señas básicas de mímica (tocá para ver)</summary>
    <ul>
      <li>☝️✌️ <b>Mostrar dedos</b> al principio = cuántas palabras tiene.</li>
      <li>🤏 Dedos en el antebrazo = en qué palabra estás actuando (1ª, 2ª…).</li>
      <li>👂 Tocarse la oreja = "suena como…".</li>
      <li>🤌 Pellizcar el aire = palabra corta (de, la, el…).</li>
      <li>👐 Separar las manos = "más largo / más grande"; juntarlas = "más corto".</li>
      <li>👉 Señalar a quien casi la adivina = "¡eso, seguí por ahí!".</li>
      <li>🙅 <b>Prohibido</b> hablar, hacer sonidos o dibujar letras en el aire.</li>
    </ul>
  </details>`;

registrarJuego({
  id: 'mimica', icono: '🎭', titulo: 'Dígalo con Mímica',
  desc: 'Actuá escenas y personajes de la Torá sin hablar. ¡Con ayudas!',
  reglas: [
    'Una persona del equipo actúa sin hablar. Su equipo adivina.',
    `Tienen <b>${CONFIG.TIEMPO_TURNO_LARGO} segundos</b> para sacar todas las que puedan.`,
    '💡 Cada tarjeta trae una <b>ayuda para quien actúa</b> (ideas de cómo representarla).',
    `🔎 Si se traban, se puede mostrar una <b>pista al equipo</b>: sin pista vale ${CONFIG.PUNTOS_MIMICA_SIN_PISTA}, con pista vale ${CONFIG.PUNTOS_MIMICA_CON_PISTA}.`,
    'Si juegan con pantalla grande, activen "tapar la tarjeta" y que la mire solo quien actúa.'
  ],
  opciones: [{ clave: 'porEquipo', etiqueta: 'Turnos por equipo', valores: [1, 2, 3], def: 1 }],
  jugar(ctx) {
    porTurnos(ctx, ctx.op.porEquipo, () => turnoTarjetas(ctx, {
      banco: DATOS_MIMICA, mazo: 'mimica',
      instruccion: `🎭 Que pase al frente quien actúa. Cuando esté listo, arrancá el reloj. ${SENAS_MIMICA}`,
      dibujarTarjeta: (it) => {
        const palabras = it.texto.trim().split(/\s+/).length;
        return `
          <div class="tj-categoria">${esc(it.categoria)} · ${palabras} palabra${palabras > 1 ? 's' : ''}</div>
          <div class="tj-palabra">${esc(it.texto)}</div>
          <div class="tj-ayuda">💡 <b>Ayuda para actuar:</b> ${esc(it.ayuda)}</div>`;
      },
      extras: (it) => it._estado.pista
        ? `<div class="tj-pista">🔎 <b>Pista para el equipo:</b> ${esc(it.pista)}</div>`
        : `<button class="btn secundario" data-extra="pista">🔎 Mostrar pista al equipo (vale ${CONFIG.PUNTOS_MIMICA_CON_PISTA})</button>`,
      botones: [
        { id: 'si', texto: '✅ ¡Adivinaron!', clase: 'btn-si', sonido: 'acierto',
          puntos: (it) => it._estado.pista ? CONFIG.PUNTOS_MIMICA_CON_PISTA : CONFIG.PUNTOS_MIMICA_SIN_PISTA },
        { id: 'pasar', texto: '⏭ Pasar', clase: 'secundario', puntos: () => 0, sonido: 'whoosh' }
      ],
      resumen: (log) => log.map(x => `${x.accion === 'si' ? '✅' : '⏭'} ${esc(x.item.texto)}`).join(' · ')
    }), { etiqueta: 'Turno' });
  }
});

/* =====================================================================
   HAKAFOT — LA GRAN FINAL (7 rondas, una por cada vuelta con la Torá)
   ===================================================================== */

const RONDAS_HAKAFOT = [
  { id: 'trivia',    nombre: 'Trivia',              op: { porEquipo: 1, nivel: 'Mezcla' } },
  { id: 'vf',        nombre: 'Verdadero o Falso',   op: { porEquipo: 1 } },
  { id: 'quien',     nombre: '¿Quién soy?',         op: { porEquipo: 1 } },
  { id: 'ordenar',   nombre: 'Ordená la Torá',      op: { porEquipo: 1 } },
  { id: 'prohibida', nombre: 'Palabra Prohibida',   op: { porEquipo: 1 } },
  { id: 'mimica',    nombre: 'Dígalo con Mímica',   op: { porEquipo: 1 } },
  { id: 'canciones', nombre: 'Guerra de Canciones', op: { rondas: 1 } }
];

registrarJuego({
  id: 'hakafot', icono: '💃', titulo: 'Hakafot: la gran final', destacado: true,
  desc: '7 vueltas, 7 desafíos distintos. Como las hakafot con el Sefer Torá.',
  reglas: [
    'Son <b>7 rondas</b>, como las 7 hakafot (vueltas) que se dan bailando con la Torá.',
    'Cada ronda es un juego distinto: Trivia, Verdadero o Falso, ¿Quién soy?, Ordená la Torá, Palabra Prohibida, Dígalo con Mímica y Guerra de Canciones.',
    'En cada ronda juega una vez cada equipo. Los puntos se acumulan.',
    'Al final de la 7ª hakafá… ¡se corona al equipo campeón!'
  ],
  async jugar(ctx) {
    for (let r = 0; r < RONDAS_HAKAFOT.length; r++) {
      if (!ctx.vivo()) return;
      const ronda = RONDAS_HAKAFOT[r];
      const juego = juegoPorId(ronda.id);
      ponerProgreso(`Hakafá <b>${r + 1}</b> de <b>7</b> · ${juego.icono} ${ronda.nombre}`);
      dibujarZona(`
        <div class="hakafa-intro">
          <div class="hakafa-ronda">
            ${RONDAS_HAKAFOT.map((x, k) => `<span class="hk-punto ${k < r ? 'hecha' : k === r ? 'actual' : ''}" style="--k:${k}">${k + 1}</span>`).join('')}
            <div class="hk-tora" style="--k:${r}">📜</div>
          </div>
          <div class="hakafa-num">Hakafá ${r + 1}</div>
          <h3 class="hakafa-juego">${juego.icono} ${ronda.nombre}</h3>
          <ul class="reglas chicas">${juego.reglas.map(x => `<li>${x}</li>`).join('')}</ul>
        </div>`);
      Sonido.redoble(1.2);
      await esperarSiguiente(ctx, `▶ Empezar la hakafá ${r + 1}`);
      if (!ctx.vivo()) return;
      await new Promise(fin => juego.jugar({ ...ctx, op: ronda.op, terminar: fin }));
      if (!ctx.vivo()) return;
      if (r < RONDAS_HAKAFOT.length - 1) {
        await anunciar({ arriba: '💃 ¡Terminó la hakafá ' + (r + 1) + '!', titulo: 'Vamos por la ' + (r + 2) + 'ª', color: '#1E3A8A', emoji: '🕺', dur: 1800, sonido: 'hinchada' });
      }
    }
    if (ctx.vivo()) ctx.terminar();
  }
});
