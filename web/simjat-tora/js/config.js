/* =====================================================================
   CONFIGURACIÓN — MAZELTOC EDICIÓN SIMJAT TORÁ

   Este es el ÚNICO lugar donde se cambian los tiempos y los puntajes.
   Para cambiar un valor: editá el número, guardá el archivo y recargá
   la página.
   ===================================================================== */

const CONFIG = {

  /* ---------- TIEMPOS (en segundos) ---------- */

  // Tiempo que tiene un equipo para responder una pregunta o hacer su jugada.
  // Es el valor que viene elegido de entrada; en la pantalla de equipos se
  // puede cambiar por cualquiera de OPCIONES_DE_TIEMPO.
  TIEMPO_POR_PREGUNTA: 15,

  // Opciones que aparecen en la pantalla de equipos para elegir el tiempo.
  OPCIONES_DE_TIEMPO: [15, 20, 30],

  // Turnos largos: Contrarreloj, Palabra Prohibida y Dígalo con Mímica.
  TIEMPO_TURNO_LARGO: 60,

  // En "Ordená la Torá" hay que acomodar varias cosas, así que el tiempo
  // por pregunta se multiplica por este número (15 x 3 = 45 segundos).
  MULTIPLICADOR_ORDENAR: 3,

  // Cuando faltan estos segundos, el reloj se pone rojo y hace "bip".
  AVISO_ULTIMOS_SEGUNDOS: 5,


  /* ---------- PUNTAJES ---------- */

  // Trivia y Duelo con Robo: los puntos dependen del nivel de la pregunta.
  PUNTOS_POR_NIVEL: { 'fácil': 1, 'medio': 2, 'difícil': 3 },

  // Guerra de Canciones: puntos extra para el último equipo que queda en pie.
  BONUS_GANADOR_CANCIONES: 3,

  // Ordená la Torá: todo bien = PERFECTO; al menos la mitad bien = CASI.
  PUNTOS_ORDENAR_PERFECTO: 3,
  PUNTOS_ORDENAR_CASI: 1,

  // Ahorcado: puntos por adivinar la palabra entera arriesgando,
  // y por completar la última letra.
  PUNTOS_AHORCADO_ARRIESGAR: 5,
  PUNTOS_AHORCADO_ULTIMA_LETRA: 3,
  VIDAS_AHORCADO: 6,

  // Dígalo con Mímica: sin pista / con pista.
  PUNTOS_MIMICA_SIN_PISTA: 2,
  PUNTOS_MIMICA_CON_PISTA: 1,


  /* ---------- EQUIPOS ---------- */

  MIN_EQUIPOS: 2,
  MAX_EQUIPOS: 6,

  // Colores disponibles para los equipos (nombre que se muestra + color).
  COLORES_EQUIPOS: [
    { nombre: 'Azul',     color: '#2F5BC9' },
    { nombre: 'Dorado',   color: '#E0A106' },
    { nombre: 'Rojo',     color: '#D93B48' },
    { nombre: 'Verde',    color: '#2E9E5B' },
    { nombre: 'Violeta',  color: '#8A4FD1' },
    { nombre: 'Naranja',  color: '#F07A1A' },
    { nombre: 'Turquesa', color: '#12A3B4' },
    { nombre: 'Rosa',     color: '#E0508F' }
  ]
};
