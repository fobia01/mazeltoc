/* =====================================================================
   BANCO DE PALABRAS — AHORCADO DE LA TORÁ
   - palabra:   la palabra o frase a adivinar (puede tener tildes y
                espacios; NO usar la letra Ñ).
   - categoria: se muestra arriba.
   - pista:     ayuda que se muestra durante el juego.
   ===================================================================== */

const DATOS_AHORCADO = [
  { palabra: 'Hakafot', categoria: 'Simjat Torá', pista: 'Las vueltas bailando con la Torá.' },
  { palabra: 'Bereshit', categoria: 'Libros', pista: 'El primer libro de la Torá.' },
  { palabra: 'Devarim', categoria: 'Libros', pista: 'El último libro de la Torá.' },
  { palabra: 'Banderita', categoria: 'Simjat Torá', pista: 'La llevan los chicos en las hakafot.' },
  { palabra: 'Alegría', categoria: 'Simjat Torá', pista: 'Lo que significa "simjá".' },
  { palabra: 'Sefer Torá', categoria: 'Objetos', pista: 'El rollo escrito a mano.' },
  { palabra: 'Jatán Torá', categoria: 'Simjat Torá', pista: 'Recibe la última aliá.' },
  { palabra: 'Jatán Bereshit', categoria: 'Simjat Torá', pista: 'Recibe la primera aliá del nuevo ciclo.' },
  { palabra: 'Shminí Atzéret', categoria: 'Fiestas', pista: 'El octavo día, después de Sucot.' },
  { palabra: 'Vezot Haberajá', categoria: 'Parashiot', pista: 'La última parashá.' },
  { palabra: 'Sucá', categoria: 'Sucot', pista: 'La cabaña de la fiesta.' },
  { palabra: 'Lulav', categoria: 'Sucot', pista: 'Rama de palmera de las cuatro especies.' },
  { palabra: 'Etrog', categoria: 'Sucot', pista: 'La fruta amarilla de Sucot.' },
  { palabra: 'Pergamino', categoria: 'Objetos', pista: 'Sobre esto se escribe la Torá.' },
  { palabra: 'Sofer', categoria: 'Personas', pista: 'Quien escribe la Torá a mano.' },
  { palabra: 'Bimá', categoria: 'Sinagoga', pista: 'Alrededor de ella se dan las hakafot.' },
  { palabra: 'Arón Hakódesh', categoria: 'Sinagoga', pista: 'Donde se guardan los Sifrei Torá.' },
  { palabra: 'Kéter Torá', categoria: 'Objetos', pista: 'La corona del Sefer Torá.' },
  { palabra: 'Rimonim', categoria: 'Objetos', pista: 'Adornos con forma de granada.' },
  { palabra: 'Noaj', categoria: 'Personajes', pista: 'Construyó un arca.' },
  { palabra: 'Arcoíris', categoria: 'Bereshit', pista: 'La señal después del diluvio.' },
  { palabra: 'Creación', categoria: 'Bereshit', pista: 'Se cuenta en el primer capítulo de la Torá.' },
  { palabra: 'Moshé', categoria: 'Personajes', pista: 'Su muerte se lee en Simjat Torá.' },
  { palabra: 'Iehoshúa', categoria: 'Personajes', pista: 'El sucesor de Moshé.' },
  { palabra: 'Monte Nevó', categoria: 'Lugares', pista: 'Desde ahí Moshé vio la Tierra de Israel.' },
  { palabra: 'Tishrei', categoria: 'Calendario', pista: 'El mes de Simjat Torá.' },
  { palabra: 'Parashá', categoria: 'Lectura', pista: 'La porción semanal de la Torá.' },
  { palabra: 'Caramelos', categoria: 'Simjat Torá', pista: 'Lo que reciben los chicos.' },
  { palabra: 'Kol Hanearim', categoria: 'Simjat Torá', pista: 'La aliá de todos los chicos.' },
  { palabra: 'Hoshaná Rabá', categoria: 'Fiestas', pista: 'El séptimo día de Sucot.' },
  { palabra: 'Maná', categoria: 'Desierto', pista: 'Caía del cielo.' },
  { palabra: 'Talit', categoria: 'Objetos', pista: 'Manto de oración con flecos.' },
  { palabra: 'Minián', categoria: 'Sinagoga', pista: 'Diez personas para rezar.' },
  { palabra: 'Haftará', categoria: 'Lectura', pista: 'Lo que se lee de los profetas después de la Torá.' },
  { palabra: 'Shabat', categoria: 'Fiestas', pista: 'El día de descanso.' },
  { palabra: 'Jazak venitjazek', categoria: 'Lectura', pista: 'Se dice al terminar cada libro.' }
];
