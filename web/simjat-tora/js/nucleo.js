/* =====================================================================
   NÚCLEO — lo que comparten todos los juegos:
   equipos, menú, tablero de puntaje, reloj, carteles y pantalla final.
   ===================================================================== */

/* ---------- utilidades ---------- */

const $ = (sel, raiz = document) => raiz.querySelector(sel);
const $$ = (sel, raiz = document) => [...raiz.querySelectorAll(sel)];

function mezclar(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function esc(txt) {
  return String(txt).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// saca tildes y pasa a mayúsculas (para el ahorcado)
function normalizar(txt) {
  return txt.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
}

const esperar = (ms) => new Promise(r => setTimeout(r, ms));

/* ---------- estado guardado: equipos, tiempo y puntaje de la noche ---------- */

const Estado = {
  equipos: [],
  tiempo: CONFIG.TIEMPO_POR_PREGUNTA,
  noche: [],

  cargar() {
    try {
      const e = JSON.parse(localStorage.getItem('mazeltoc_st_equipos') || 'null');
      if (Array.isArray(e) && e.length >= CONFIG.MIN_EQUIPOS) this.equipos = e;
      const t = parseInt(localStorage.getItem('mazeltoc_st_tiempo'), 10);
      if (CONFIG.OPCIONES_DE_TIEMPO.includes(t)) this.tiempo = t;
      const n = JSON.parse(localStorage.getItem('mazeltoc_st_noche') || 'null');
      if (Array.isArray(n) && n.length === this.equipos.length) this.noche = n;
    } catch (err) {}
    if (this.noche.length !== this.equipos.length) this.noche = this.equipos.map(() => 0);
  },
  guardar() {
    try {
      localStorage.setItem('mazeltoc_st_equipos', JSON.stringify(this.equipos));
      localStorage.setItem('mazeltoc_st_tiempo', String(this.tiempo));
      localStorage.setItem('mazeltoc_st_noche', JSON.stringify(this.noche));
    } catch (err) {}
  }
};

/* ---------- mazos: sacan elementos al azar sin repetir ---------- */
/* Cada banco de datos tiene su mazo. Mientras la página esté abierta,
   una pregunta no vuelve a salir hasta que se usaron todas las demás. */

const Mazos = {};
function sacarDe(nombre, banco, filtro) {
  if (!Mazos[nombre] || Mazos[nombre].length === 0) Mazos[nombre] = mezclar(banco.map((_, i) => i));
  const mazo = Mazos[nombre];
  const pos = filtro ? mazo.findIndex(i => filtro(banco[i])) : mazo.length - 1;
  if (pos === -1) { Mazos[nombre] = null; return sacarDe(nombre, banco); }
  const [i] = mazo.splice(pos, 1);
  return banco[i];
}

/* ---------- navegación ---------- */

let alSalirDelJuego = null;
let sesionJuego = null;   // cambia cada vez que empieza o se abandona un juego

function mostrar(html, clase = '') {
  sesionJuego = null;
  Reloj.detenerActual();
  Sonido.pararTodo();
  const app = $('#app');
  document.body.classList.toggle('en-juego', clase === 'juego');
  app.className = 'app entrando ' + clase;
  app.innerHTML = html;
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  void app.offsetWidth;
  app.classList.remove('entrando');
  return app;
}

function modal({ titulo, texto = '', si = 'Sí', no = 'Cancelar' }) {
  return new Promise(resolver => {
    const fondo = document.createElement('div');
    fondo.className = 'modal-fondo';
    fondo.innerHTML = `
      <div class="modal">
        <h3>${titulo}</h3>
        ${texto ? `<p>${texto}</p>` : ''}
        <div class="fila-botones">
          ${no ? `<button class="btn secundario" data-r="0">${no}</button>` : ''}
          <button class="btn" data-r="1">${si}</button>
        </div>
      </div>`;
    fondo.addEventListener('click', ev => {
      const b = ev.target.closest('[data-r]');
      if (!b) return;
      fondo.remove();
      resolver(b.dataset.r === '1');
    });
    document.body.appendChild(fondo);
  });
}

/* ---------- tamaño de letra (botón "Aa") ---------- */

const ESCALAS_LETRA = [1, 1.15, 1.3, 1.5];
function escalaLetra() {
  let v = 1;
  try { v = parseFloat(localStorage.getItem('mazeltoc_st_escala')) || 1; } catch (e) {}
  return ESCALAS_LETRA.includes(v) ? v : 1;
}
function aplicarLetra() { document.documentElement.style.setProperty('--escala', escalaLetra()); }
function cambiarLetra() {
  const i = ESCALAS_LETRA.indexOf(escalaLetra());
  const nueva = ESCALAS_LETRA[(i + 1) % ESCALAS_LETRA.length];
  try { localStorage.setItem('mazeltoc_st_escala', String(nueva)); } catch (e) {}
  aplicarLetra();
  Sonido.clic();
  $$('.btn-letra').forEach(b => { if (/%/.test(b.textContent)) b.textContent = 'Aa ' + Math.round(nueva * 100) + '%'; });
}
aplicarLetra();

/* ---------- carteles grandes (turno, robo, hakafá...) ---------- */

function anunciar({ arriba = '', titulo, abajo = '', color = '#1E3A8A', emoji = '', dur = 1500, sonido = 'whoosh' }) {
  return new Promise(resolver => {
    const ov = document.createElement('div');
    ov.className = 'cartel';
    ov.style.setProperty('--c', color);
    ov.innerHTML = `
      <div class="cartel-caja">
        ${emoji ? `<div class="cartel-emoji">${emoji}</div>` : ''}
        ${arriba ? `<div class="cartel-arriba">${arriba}</div>` : ''}
        <div class="cartel-titulo">${titulo}</div>
        ${abajo ? `<div class="cartel-abajo">${abajo}</div>` : ''}
      </div>`;
    document.body.appendChild(ov);
    if (sonido && Sonido[sonido]) Sonido[sonido]();
    let listo = false;
    const cerrar = () => {
      if (listo) return; listo = true;
      ov.classList.add('saliendo');
      setTimeout(() => { ov.remove(); resolver(); }, 280);
    };
    ov.addEventListener('click', cerrar);
    setTimeout(cerrar, dur);
  });
}

function anunciarTurno(i, arriba = '¡Le toca a…!') {
  const eq = Estado.equipos[i];
  return anunciar({ arriba, titulo: esc(eq.nombre), color: eq.color, emoji: '🎯' });
}

/* ---------- festejos ---------- */

function confeti(tipo = 'chico', colores) {
  if (typeof confetti !== 'function') return;
  const cols = colores || ['#2F5BC9', '#E8B22E', '#FFFFFF', '#1E3A8A', '#F5D36B'];
  if (tipo === 'chico') {
    confetti({ particleCount: 70, spread: 75, startVelocity: 42, origin: { y: 0.7 }, colors: cols });
  } else {
    const fin = Date.now() + 3200;
    (function cuadro() {
      confetti({ particleCount: 7, angle: 60, spread: 60, origin: { x: 0, y: 0.75 }, colors: cols });
      confetti({ particleCount: 7, angle: 120, spread: 60, origin: { x: 1, y: 0.75 }, colors: cols });
      if (Date.now() < fin) requestAnimationFrame(cuadro);
    })();
    [250, 900, 1600].forEach(ms => setTimeout(() => confetti({
      particleCount: 140, spread: 110, startVelocity: 55, scalar: 1.2,
      origin: { x: 0.2 + Math.random() * 0.6, y: 0.35 }, colors: cols
    }), ms));
  }
}

function sacudir(el) {
  if (!el) return;
  el.classList.remove('sacudir'); void el.offsetWidth; el.classList.add('sacudir');
}

/* ---------- botón para que SOLO el conductor vea la respuesta ---------- */

function botonEspiar(texto, etiqueta = '👁 Ver respuesta (mantené apretado)') {
  const id = 'espiar' + Math.random().toString(36).slice(2, 8);
  setTimeout(() => {
    const b = document.getElementById(id);
    if (!b) return;
    const mostrarR = (ev) => { ev.preventDefault(); b.classList.add('abierto'); };
    const ocultarR = () => b.classList.remove('abierto');
    b.addEventListener('pointerdown', mostrarR);
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(e => b.addEventListener(e, ocultarR));
    b.addEventListener('contextmenu', ev => ev.preventDefault());
  }, 0);
  return `<button type="button" class="btn-espiar" id="${id}">
      <span class="espiar-cerrado">${etiqueta}</span>
      <span class="espiar-abierto">${texto}</span>
    </button>`;
}

/* ---------- partida y tablero de puntaje ---------- */

class Partida {
  constructor(titulo) {
    this.titulo = titulo;
    this.puntos = Estado.equipos.map(() => 0);
    this.turno = 0;
    this.eliminados = new Set();
  }
  get n() { return Estado.equipos.length; }
  equipo(i = this.turno) { return Estado.equipos[i]; }
  siguiente(desde = this.turno) { return (desde + 1) % this.n; }

  ponerTurno(i) { this.turno = i; this.dibujar(); }

  sumar(i, n) {
    if (!n) return;
    this.puntos[i] = Math.max(0, this.puntos[i] + n);
    this.dibujar();
    const tile = document.querySelector(`.marcador [data-eq="${i}"]`);
    if (tile) {
      tile.classList.remove('salto'); void tile.offsetWidth; tile.classList.add('salto');
      const f = document.createElement('div');
      f.className = 'puntos-flotan' + (n < 0 ? ' negativo' : '');
      f.textContent = (n > 0 ? '+' : '') + n;
      tile.appendChild(f);
      setTimeout(() => f.remove(), 1300);
    }
    if (n > 0) Sonido.punto();
  }

  dibujar() {
    const el = $('#marcador');
    if (!el) return;
    el.style.setProperty('--cols', Math.min(this.n, this.n > 4 ? 3 : this.n));
    el.innerHTML = Estado.equipos.map((eq, i) => `
      <div class="equipo-tile ${i === this.turno ? 'activo' : ''} ${this.eliminados.has(i) ? 'eliminado' : ''}"
           data-eq="${i}" style="--c:${eq.color}">
        ${i === this.turno ? '<div class="juega">▶ JUEGA</div>' : ''}
        <div class="eq-nombre">${esc(eq.nombre)}</div>
        <div class="eq-puntos">${this.puntos[i]}</div>
      </div>`).join('');
  }
}

/* ---------- reloj (lo arranca el conductor) ---------- */

class Reloj {
  static actual = null;
  static detenerActual() { if (Reloj.actual) Reloj.actual.detener(); Reloj.actual = null; }

  constructor(contenedor, segundos, { alTerminar, alArrancar, texto = '▶ Arrancar reloj' } = {}) {
    Reloj.detenerActual();
    Reloj.actual = this;
    this.total = segundos;
    this.restante = segundos;
    this.estado = 'listo';
    this.alTerminar = alTerminar;
    this.alArrancar = alArrancar;
    this.textoInicio = texto;
    this.el = contenedor;
    this.el.innerHTML = `
      <div class="reloj">
        <div class="reloj-circulo">
          <svg viewBox="0 0 120 120"><circle class="reloj-fondo" cx="60" cy="60" r="52"/>
            <circle class="reloj-arco" cx="60" cy="60" r="52"/></svg>
          <div class="reloj-num">${segundos}</div>
        </div>
        <button type="button" class="btn btn-reloj">${texto}</button>
      </div>`;
    this.caja = $('.reloj', this.el);
    this.num = $('.reloj-num', this.el);
    this.arco = $('.reloj-arco', this.el);
    this.boton = $('.btn-reloj', this.el);
    this.boton.addEventListener('click', () => this.alternar());
    this.pintar();
  }

  alternar() {
    if (this.estado === 'listo' || this.estado === 'pausado') this.arrancar();
    else if (this.estado === 'corriendo') this.pausar();
  }

  arrancar() {
    if (this.estado === 'corriendo' || this.estado === 'terminado' || this.estado === 'detenido') return;
    const primeraVez = this.estado === 'listo';
    this.estado = 'corriendo';
    if (primeraVez) { Sonido.inicio(); if (this.alArrancar) this.alArrancar(); }
    this.fin = Date.now() + this.restante * 1000;
    this.ultimoEntero = Math.ceil(this.restante);
    this.intervalo = setInterval(() => this.tic(), 100);
    Sonido.ticTac(true, this.restante <= CONFIG.AVISO_ULTIMOS_SEGUNDOS);
    this.pintar();
  }

  pausar() {
    if (this.estado !== 'corriendo') return;
    clearInterval(this.intervalo);
    this.restante = Math.max(0, (this.fin - Date.now()) / 1000);
    this.estado = 'pausado';
    Sonido.ticTac(false);
    this.pintar();
  }

  detener() {
    clearInterval(this.intervalo);
    if (this.estado !== 'terminado') this.estado = 'detenido';
    Sonido.ticTac(false);
    this.pintar();
    if (Reloj.actual === this) Reloj.actual = null;
  }

  get corriendo() { return this.estado === 'corriendo'; }
  get usado() { return this.estado !== 'listo'; }

  tic() {
    this.restante = Math.max(0, (this.fin - Date.now()) / 1000);
    const entero = Math.ceil(this.restante);
    if (entero !== this.ultimoEntero) {
      this.ultimoEntero = entero;
      if (entero <= CONFIG.AVISO_ULTIMOS_SEGUNDOS && entero > 0) {
        Sonido.bip(entero <= 3);
        Sonido.ticTac(true, true);
      }
    }
    if (this.restante <= 0) {
      clearInterval(this.intervalo);
      this.estado = 'terminado';
      Sonido.ticTac(false);
      Sonido.chicharra();
      sacudir(this.caja);
      document.body.classList.add('flash-rojo');
      setTimeout(() => document.body.classList.remove('flash-rojo'), 600);
      if (Reloj.actual === this) Reloj.actual = null;
      this.pintar();
      if (this.alTerminar) this.alTerminar();
      return;
    }
    this.pintar();
  }

  pintar() {
    if (!this.num) return;
    const r = this.restante;
    this.num.textContent = Math.ceil(r);
    const frac = r / this.total;
    const largo = 2 * Math.PI * 52;
    this.arco.style.strokeDasharray = largo;
    this.arco.style.strokeDashoffset = largo * (1 - frac);
    const urgente = r <= CONFIG.AVISO_ULTIMOS_SEGUNDOS && this.estado === 'corriendo';
    this.caja.classList.toggle('urgente', urgente);
    this.caja.classList.toggle('medio', frac <= 0.5 && !urgente);
    this.caja.classList.toggle('corriendo', this.estado === 'corriendo');
    this.caja.classList.toggle('terminado', this.estado === 'terminado');
    const textos = { listo: this.textoInicio, corriendo: '⏸ Pausa', pausado: '▶ Seguir', terminado: '⏰ ¡Tiempo!', detenido: '⏹ Reloj parado' };
    this.boton.textContent = textos[this.estado];
    this.boton.disabled = this.estado === 'terminado' || this.estado === 'detenido';
    this.boton.classList.toggle('secundario', this.estado === 'corriendo');
  }
}

// barra espaciadora = arrancar / pausar el reloj (útil con compu y proyector)
document.addEventListener('keydown', ev => {
  if (ev.code !== 'Space' || /INPUT|TEXTAREA/.test(ev.target.tagName)) return;
  if (Reloj.actual) { ev.preventDefault(); Reloj.actual.alternar(); }
});

/* ---------- registro de juegos ---------- */

const JUEGOS = [];
function registrarJuego(def) { JUEGOS.push(def); }
const juegoPorId = (id) => JUEGOS.find(j => j.id === id);

/* ---------- pantalla de juego (barra + tablero + zona) ---------- */

function pantallaJuego(juego, partida) {
  mostrar(`
    <div class="pantalla-juego">
      <div class="barra-juego">
        <button class="btn-chico" id="btnSalir">✕ Salir</button>
        <h2><span class="icono-titulo">${juego.icono}</span> ${juego.titulo}</h2>
        <button class="btn-chico btn-letra" onclick="cambiarLetra()" title="Tamaño de letra">Aa</button>
        <button class="btn-chico btn-sonido" onclick="Sonido.alternar()">${Sonido.muteado ? '🔇' : '🔊'}</button>
      </div>
      <div class="marcador" id="marcador"></div>
      <div class="progreso" id="progreso"></div>
      <div class="zona" id="zona"></div>
    </div>`, 'juego');
  sesionJuego = {};
  partida.dibujar();
  $('#btnSalir').addEventListener('click', async () => {
    const ok = await modal({ titulo: '¿Salir del juego?', texto: 'Se pierde el puntaje de esta partida.', si: 'Sí, salir' });
    if (ok) { if (alSalirDelJuego) alSalirDelJuego(); alSalirDelJuego = null; pantallaMenu(); }
  });
  return $('#zona');
}

function ponerProgreso(txt) { const el = $('#progreso'); if (el) el.innerHTML = txt; }

// para que cada juego dibuje su contenido con una animación de entrada
function dibujarZona(html) {
  const z = $('#zona');
  if (!z) return null;
  z.innerHTML = `<div class="zona-contenido">${html}</div>`;
  return z;
}

/* ---------- lanzar un juego suelto ---------- */

function pantallaPrevia(id) {
  const juego = juegoPorId(id);
  const valores = {};
  (juego.opciones || []).forEach(o => valores[o.clave] = o.def);

  mostrar(`
    <div class="pantalla-previa">
      <button class="btn-chico volver" onclick="pantallaMenu()">← Juegos</button>
      <div class="previa-icono">${juego.icono}</div>
      <h2 class="previa-titulo">${juego.titulo}</h2>
      <ul class="reglas">${juego.reglas.map(r => `<li>${r}</li>`).join('')}</ul>
      ${(juego.opciones || []).map(o => `
        <div class="opcion-bloque">
          <div class="opcion-etiqueta">${o.etiqueta}</div>
          <div class="segmentado" data-clave="${o.clave}">
            ${o.valores.map(v => `<button type="button" class="${v === o.def ? 'elegido' : ''}" data-v="${v}">${v}${o.sufijo || ''}</button>`).join('')}
          </div>
        </div>`).join('')}
      <div class="equipos-mini">${Estado.equipos.map(e => `<span style="--c:${e.color}">${esc(e.nombre)}</span>`).join('')}</div>
      <button class="btn btn-gigante" id="btnJugar">▶ ¡A jugar!</button>
    </div>`);

  $$('.segmentado').forEach(seg => seg.addEventListener('click', ev => {
    const b = ev.target.closest('button'); if (!b) return;
    $$('button', seg).forEach(x => x.classList.remove('elegido'));
    b.classList.add('elegido');
    valores[seg.dataset.clave] = isNaN(b.dataset.v) ? b.dataset.v : Number(b.dataset.v);
    Sonido.clic();
  }));

  $('#btnJugar').addEventListener('click', () => {
    Sonido.desbloquear();
    jugarSuelto(juego, valores);
  });
}

function jugarSuelto(juego, valores) {
  const partida = new Partida(juego.titulo);
  pantallaJuego(juego, partida);
  alSalirDelJuego = null;
  const miSesion = sesionJuego;
  juego.jugar({
    partida,
    op: valores,
    vivo: () => sesionJuego === miSesion && !!$('#zona'),
    terminar: () => pantallaFinal(partida, { alRevancha: () => jugarSuelto(juego, valores) })
  });
}

/* ---------- botón "siguiente" estándar ---------- */

function botonSiguiente(contenedor, texto, accion) {
  const b = document.createElement('button');
  b.className = 'btn btn-grande btn-siguiente';
  b.textContent = texto;
  b.addEventListener('click', () => { Sonido.clic(); accion(); });
  contenedor.appendChild(b);
  setTimeout(() => b.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 150);
  return b;
}

/* ---------- pantalla final con podio ---------- */

async function pantallaFinal(partida, { alRevancha } = {}) {
  Reloj.detenerActual();
  const orden = Estado.equipos.map((e, i) => ({ ...e, i, pts: partida.puntos[i] }))
    .sort((a, b) => b.pts - a.pts);
  const max = orden[0].pts;
  const ganadores = orden.filter(e => e.pts === max);
  const alturaMax = Math.max(max, 1);

  // se suma al puntaje de la noche
  partida.puntos.forEach((p, i) => Estado.noche[i] = (Estado.noche[i] || 0) + p);
  Estado.guardar();

  const titulo = max === 0 ? '¡Empate en cero!'
    : ganadores.length > 1 ? '¡Empate!' : '¡Ganó ' + esc(ganadores[0].nombre) + '!';

  mostrar(`
    <div class="pantalla-final">
      <div class="final-redoble" id="finalRedoble">🥁 Y el ganador es…</div>
      <div class="final-contenido oculto" id="finalContenido">
        <div class="corona">👑</div>
        <h2 class="final-titulo">${titulo}</h2>
        ${ganadores.length > 1 && max > 0 ? `<p class="final-sub">${ganadores.map(g => esc(g.nombre)).join(' y ')} con ${max} puntos</p>` : ''}
        <div class="podio">
          ${orden.map((e, pos) => `
            <div class="podio-col ${e.pts === max && max > 0 ? 'ganador' : ''}" style="--c:${e.color};--h:${Math.max(8, (e.pts / alturaMax) * 100)}%;--d:${pos * 0.12}s">
              <div class="podio-pts">${e.pts}</div>
              <div class="podio-barra"><span>${pos === 0 || e.pts === max ? '🏆' : pos + 1 + 'º'}</span></div>
              <div class="podio-nombre">${esc(e.nombre)}</div>
            </div>`).join('')}
        </div>
        <div class="fila-botones">
          ${alRevancha ? '<button class="btn btn-grande" id="btnRevancha">🔁 Revancha</button>' : ''}
          <button class="btn btn-grande secundario" id="btnMenu">🏠 Menú de juegos</button>
        </div>
      </div>
    </div>`);

  $('#btnMenu').addEventListener('click', () => pantallaMenu());
  if (alRevancha) $('#btnRevancha').addEventListener('click', () => alRevancha());

  Sonido.redoble(1.6);
  await esperar(1700);
  const red = $('#finalRedoble'), cont = $('#finalContenido');
  if (!red || !cont) return;
  red.remove();
  cont.classList.remove('oculto');
  if (max > 0) {
    Sonido.fanfarria();
    confeti('grande', ganadores.map(g => g.color).concat(['#E8B22E', '#FFFFFF']));
  }
}

/* ---------- pantalla de equipos ---------- */

function pantallaEquipos() {
  let lista = Estado.equipos.length
    ? Estado.equipos.map(e => ({ ...e }))
    : [0, 1].map(i => ({ nombre: '', color: CONFIG.COLORES_EQUIPOS[i].color }));
  let tiempo = Estado.tiempo;

  function colorLibre() {
    const usados = lista.map(e => e.color);
    return (CONFIG.COLORES_EQUIPOS.find(c => !usados.includes(c.color)) || CONFIG.COLORES_EQUIPOS[0]).color;
  }

  function dibujar() {
    mostrar(`
      <div class="pantalla-equipos">
        <h2 class="titulo-seccion">👥 Armen los equipos</h2>
        <p class="ayuda">De ${CONFIG.MIN_EQUIPOS} a ${CONFIG.MAX_EQUIPOS} equipos. Escriban un nombre y elijan un color.</p>
        <div class="lista-equipos">
          ${lista.map((e, i) => `
            <div class="fila-equipo" style="--c:${e.color}" data-i="${i}">
              <div class="fila-top">
                <span class="num-equipo">${i + 1}</span>
                <input type="text" maxlength="18" value="${esc(e.nombre)}" placeholder="Equipo ${nombreColor(e.color)}" data-i="${i}">
                ${lista.length > CONFIG.MIN_EQUIPOS ? `<button class="btn-borrar" data-borrar="${i}" aria-label="Quitar equipo">🗑</button>` : ''}
              </div>
              <div class="colores">
                ${CONFIG.COLORES_EQUIPOS.map(c => {
                  const ocupado = lista.some((o, j) => j !== i && o.color === c.color);
                  return `<button class="muestra ${c.color === e.color ? 'elegido' : ''}" style="--m:${c.color}"
                    data-color="${c.color}" data-i="${i}" ${ocupado ? 'disabled' : ''} aria-label="${c.nombre}"></button>`;
                }).join('')}
              </div>
            </div>`).join('')}
        </div>
        ${lista.length < CONFIG.MAX_EQUIPOS ? '<button class="btn secundario btn-grande" id="btnAgregar">➕ Agregar equipo</button>' : ''}

        <h3 class="titulo-sub">⏱️ Tiempo para responder</h3>
        <div class="segmentado grande" id="segTiempo">
          ${CONFIG.OPCIONES_DE_TIEMPO.map(s => `<button type="button" class="${s === tiempo ? 'elegido' : ''}" data-s="${s}">${s} seg</button>`).join('')}
        </div>
        <p class="ayuda">El reloj lo arranca quien conduce, después de leer la pregunta en voz alta.</p>

        <button class="btn btn-gigante" id="btnGuardar">✅ Listo, elegir juego</button>
      </div>`);

    $$('.fila-equipo input').forEach(inp => inp.addEventListener('input', () => { lista[inp.dataset.i].nombre = inp.value; }));
    $$('.muestra').forEach(b => b.addEventListener('click', () => { lista[b.dataset.i].color = b.dataset.color; Sonido.clic(); dibujar(); }));
    $$('[data-borrar]').forEach(b => b.addEventListener('click', () => { lista.splice(Number(b.dataset.borrar), 1); dibujar(); }));
    const ag = $('#btnAgregar');
    if (ag) ag.addEventListener('click', () => { lista.push({ nombre: '', color: colorLibre() }); Sonido.clic(); dibujar(); });
    $('#segTiempo').addEventListener('click', ev => {
      const b = ev.target.closest('button'); if (!b) return;
      tiempo = Number(b.dataset.s); Sonido.clic(); dibujar();
    });
    $('#btnGuardar').addEventListener('click', () => {
      Sonido.desbloquear();
      const nuevos = lista.map(e => ({ color: e.color, nombre: e.nombre.trim() || 'Equipo ' + nombreColor(e.color) }));
      const cambiaron = JSON.stringify(nuevos) !== JSON.stringify(Estado.equipos);
      Estado.equipos = nuevos;
      Estado.tiempo = tiempo;
      if (cambiaron) Estado.noche = nuevos.map(() => 0);
      Estado.guardar();
      Sonido.inicio();
      pantallaMenu();
    });
  }
  dibujar();
}

function nombreColor(color) {
  const c = CONFIG.COLORES_EQUIPOS.find(x => x.color === color);
  return c ? c.nombre : '';
}

/* ---------- menú de juegos ---------- */

const FRASES_MENU = [
  'Hoy la Torá no se lee: se baila. 💃',
  'Terminamos la Torá… ¡y la empezamos de nuevo! Como el mate: siempre hay otra vuelta.',
  'Siete hakafot: ideal para quemar las calorías de Sucot.',
  'Regla de oro de Simjat Torá: el que no baila, lee el reglamento en voz alta.',
  'De la última letra a la primera: lamed + bet = lev, corazón. ❤️',
  'Banderita en mano, caramelo en el bolsillo y a dar vueltas.',
  'El Jatán Torá invita el kidush. Anotado queda. 😉'
];

function pantallaMenu() {
  alSalirDelJuego = null;
  if (!Estado.equipos.length) return pantallaEquipos();
  const hakafot = JUEGOS.find(j => j.destacado);
  const resto = JUEGOS.filter(j => !j.destacado);
  const maxNoche = Math.max(1, ...Estado.noche);
  const hayNoche = Estado.noche.some(p => p > 0);

  mostrar(`
    <div class="pantalla-menu">
      <p class="frase">${FRASES_MENU[Math.floor(Math.random() * FRASES_MENU.length)]}</p>
      <div class="equipos-mini grande">
        ${Estado.equipos.map(e => `<span style="--c:${e.color}">${esc(e.nombre)}</span>`).join('')}
        <button class="btn-chico" onclick="pantallaEquipos()">✏️ Equipos y tiempo (${Estado.tiempo}s)</button>
        <button class="btn-chico btn-letra" onclick="cambiarLetra()" title="Tamaño de letra">Aa ${Math.round(escalaLetra() * 100)}%</button>
      </div>

      ${hakafot ? `
      <button class="tarjeta-juego destacada" data-id="${hakafot.id}">
        <span class="tj-icono baila">${hakafot.icono}</span>
        <span class="tj-texto"><span class="tj-titulo">${hakafot.titulo}</span>
        <span class="tj-desc">${hakafot.desc}</span></span>
      </button>` : ''}

      <div class="grilla-juegos">
        ${resto.map((j, k) => `
          <button class="tarjeta-juego" data-id="${j.id}" style="--d:${k * 0.04}s">
            <span class="tj-icono">${j.icono}</span>
            <span class="tj-titulo">${j.titulo}</span>
            <span class="tj-desc">${j.desc}</span>
          </button>`).join('')}
      </div>

      <div class="noche">
        <h3 class="titulo-sub">🌙 Puntaje de la noche</h3>
        <p class="ayuda">Se van sumando los puntos de todos los juegos que jueguen.</p>
        ${Estado.equipos.map((e, i) => `
          <div class="noche-fila" style="--c:${e.color}">
            <span class="noche-nombre">${esc(e.nombre)}</span>
            <span class="noche-barra"><span style="width:${(Estado.noche[i] / maxNoche) * 100}%"></span></span>
            <span class="noche-pts">${Estado.noche[i]}</span>
          </div>`).join('')}
        ${hayNoche ? '<button class="btn-chico" id="btnResetNoche">🔄 Empezar la noche de cero</button>' : ''}
      </div>
    </div>`);

  $$('.tarjeta-juego').forEach(b => b.addEventListener('click', () => { Sonido.desbloquear(); Sonido.clic(); pantallaPrevia(b.dataset.id); }));
  const r = $('#btnResetNoche');
  if (r) r.addEventListener('click', async () => {
    if (await modal({ titulo: '¿Borrar el puntaje de la noche?', si: 'Sí, borrar' })) {
      Estado.noche = Estado.equipos.map(() => 0); Estado.guardar(); pantallaMenu();
    }
  });
}
