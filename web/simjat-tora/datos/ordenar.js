/* =====================================================================
   BANCO DE LISTAS — ORDENÁ LA TORÁ
   - titulo:   lo que aparece arriba.
   - consigna: cómo hay que ordenar.
   - items:    en el ORDEN CORRECTO (el juego los desordena solo).
   - explicacion: (opcional) se muestra al final.
   ===================================================================== */

const DATOS_ORDENAR = [
  { titulo: 'Los 5 libros de la Torá', consigna: 'Del primero al último.',
    items: ['Bereshit', 'Shemot', 'Vaikrá', 'Bamidbar', 'Devarim'] },
  { titulo: 'Los libros de la Torá en castellano', consigna: 'Del primero al último.',
    items: ['Génesis', 'Éxodo', 'Levítico', 'Números', 'Deuteronomio'] },
  { titulo: 'Los días de la Creación', consigna: 'Del primer día al séptimo.',
    items: ['La luz', 'El firmamento (el cielo)', 'La tierra seca y las plantas', 'El sol, la luna y las estrellas', 'Los peces y las aves', 'Los animales y el ser humano', 'El descanso del Shabat'] },
  { titulo: 'Abuelo, hijo, nieto y bisnieto', consigna: 'De la generación más vieja a la más joven.',
    items: ['Abraham', 'Itzjak', 'Iaakov', 'Iosef'] },
  { titulo: 'Las fiestas de Tishrei', consigna: 'En el orden en que llegan en el calendario.',
    items: ['Rosh Hashaná', 'Iom Kipur', 'Sucot', 'Hoshaná Rabá', 'Shminí Atzéret'] },
  { titulo: 'La vida de Moshé', consigna: 'Del principio al final.',
    items: ['Lo ponen en una canasta en el río', 'Ve la zarza ardiente', 'Las diez plagas', 'El cruce del Mar Rojo', 'Recibe la Torá en el Sinaí', 'Mira la Tierra desde el monte Nevó'] },
  { titulo: 'La historia de Noaj', consigna: 'Del principio al final.',
    items: ['Dios le pide construir un arca', 'Entran los animales de a dos', 'Llueve 40 días y 40 noches', 'Manda al cuervo y a la paloma', 'Sale del arca', 'Aparece el arcoíris'] },
  { titulo: 'Las primeras parashiot de la Torá', consigna: 'En el orden en que se leen.',
    items: ['Bereshit', 'Noaj', 'Lej Lejá', 'Vaierá', 'Jaiéi Sará', 'Toldot'] },
  { titulo: 'La mañana de Simjat Torá', consigna: 'En el orden más común de la lectura.', revisar: true,
    items: ['Aliot para todos en Vezot Haberajá', 'Kol Hanearim', 'Jatán Torá', 'Jatán Bereshit', 'Maftir', 'Haftará de Iehoshúa'],
    explicacion: 'Es el orden más difundido; puede variar según la comunidad.' },
  { titulo: 'Personajes de la Torá', consigna: 'En el orden en que aparecen.',
    items: ['Adam', 'Noaj', 'Abraham', 'Iaakov', 'Iosef', 'Moshé'] },
  { titulo: 'Las primeras cinco plagas', consigna: 'En el orden de la Torá.',
    items: ['Sangre', 'Ranas', 'Piojos', 'Fieras', 'Peste del ganado'] },
  { titulo: 'Las últimas cinco plagas', consigna: 'En el orden de la Torá.',
    items: ['Úlceras', 'Granizo', 'Langostas', 'Oscuridad', 'Muerte de los primogénitos'] },
  { titulo: 'Los primeros hijos de Iaakov y Leá', consigna: 'Del mayor al menor.',
    items: ['Reuvén', 'Shimón', 'Leví', 'Iehudá'] },
  { titulo: 'Después de salir de Egipto', consigna: 'En el orden en que pasaron.',
    items: ['Cruzan el Mar Rojo', 'Cae el maná', 'Reciben la Torá en el Sinaí', 'El becerro de oro', 'Moshé manda a los doce espías'] }
];
