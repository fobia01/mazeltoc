/* =====================================================================
   BANCO DE PALABRAS — GUERRA DE CANCIONES

   La app NO muestra letras de canciones: solo la palabra o el tema.
   Los equipos cantan de memoria.

   - palabra:    lo que aparece en grande.
   - idioma:     'español', 'hebreo' o 'tema'.
   - traduccion: (opcional) texto chico debajo. Para las palabras en hebreo
                 es la traducción; para los temas, una aclaración.
   ===================================================================== */

const DATOS_CANCIONES = [
  // --- en español ---
  { palabra: 'Torá', idioma: 'español' },
  { palabra: 'Alegría', idioma: 'español' },
  { palabra: 'Jerusalem', idioma: 'español' },
  { palabra: 'Shabat', idioma: 'español' },
  { palabra: 'Luz', idioma: 'español' },
  { palabra: 'Paz', idioma: 'español' },
  { palabra: 'Bailar', idioma: 'español' },
  { palabra: 'Sol', idioma: 'español' },
  { palabra: 'Amor', idioma: 'español' },
  { palabra: 'Fiesta', idioma: 'español' },
  { palabra: 'Corazón', idioma: 'español' },
  { palabra: 'Noche', idioma: 'español' },
  { palabra: 'Cielo', idioma: 'español' },
  { palabra: 'Mar', idioma: 'español' },
  { palabra: 'Estrella', idioma: 'español' },
  { palabra: 'Casa', idioma: 'español' },
  { palabra: 'Mamá', idioma: 'español' },
  { palabra: 'Vida', idioma: 'español' },
  { palabra: 'Bandera', idioma: 'español' },
  { palabra: 'Canción', idioma: 'español' },
  { palabra: 'Fuego', idioma: 'español' },
  { palabra: 'Agua', idioma: 'español' },
  { palabra: 'Luna', idioma: 'español' },
  { palabra: 'Amigo', idioma: 'español' },
  { palabra: 'Sueño', idioma: 'español' },
  { palabra: 'Tierra', idioma: 'español' },
  { palabra: 'Flor', idioma: 'español' },
  { palabra: 'Rey', idioma: 'español' },
  { palabra: 'Camino', idioma: 'español' },
  { palabra: 'Libertad', idioma: 'español' },
  { palabra: 'Lluvia', idioma: 'español' },
  { palabra: 'Beso', idioma: 'español' },
  { palabra: 'Mano', idioma: 'español' },
  { palabra: 'Día', idioma: 'español' },
  { palabra: 'Niño', idioma: 'español' },
  { palabra: 'Viento', idioma: 'español' },

  // --- en hebreo (transliterado) ---
  { palabra: 'Shalom', idioma: 'hebreo', traduccion: 'paz' },
  { palabra: 'Simjá', idioma: 'hebreo', traduccion: 'alegría' },
  { palabra: 'Or', idioma: 'hebreo', traduccion: 'luz' },
  { palabra: 'Lev', idioma: 'hebreo', traduccion: 'corazón' },
  { palabra: 'Ahavá', idioma: 'hebreo', traduccion: 'amor' },
  { palabra: 'Ierushalaim', idioma: 'hebreo', traduccion: 'Jerusalem' },
  { palabra: 'Jai', idioma: 'hebreo', traduccion: 'vivo / vida' },
  { palabra: 'Mazal tov', idioma: 'hebreo', traduccion: '¡felicitaciones!' },
  { palabra: 'Shir', idioma: 'hebreo', traduccion: 'canción' },
  { palabra: 'Mélej', idioma: 'hebreo', traduccion: 'rey' },
  { palabra: 'Érets', idioma: 'hebreo', traduccion: 'tierra / país' },
  { palabra: 'Laila', idioma: 'hebreo', traduccion: 'noche' },
  { palabra: 'Tov', idioma: 'hebreo', traduccion: 'bueno' },
  { palabra: 'Am Israel', idioma: 'hebreo', traduccion: 'pueblo de Israel' },

  // --- temas (vale cualquier canción que nombre algo de ese tipo) ---
  { palabra: 'Un color', idioma: 'tema', traduccion: 'cualquier canción que nombre un color' },
  { palabra: 'Un número', idioma: 'tema', traduccion: 'cualquier canción que diga un número' },
  { palabra: 'Un animal', idioma: 'tema', traduccion: 'cualquier canción que nombre un animal' },
  { palabra: 'Un país o ciudad', idioma: 'tema', traduccion: 'cualquier canción que nombre un lugar' },
  { palabra: 'Un nombre de persona', idioma: 'tema', traduccion: 'cualquier canción que diga un nombre propio' }
];
