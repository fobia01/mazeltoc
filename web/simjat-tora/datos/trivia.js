/* =====================================================================
   BANCO DE TRIVIA — SIMJAT TORÁ (100 preguntas)

   CÓMO EDITAR:
   - Cada pregunta va entre llaves { ... } y termina con una coma.
   - En "opciones", la RESPUESTA CORRECTA VA SIEMPRE PRIMERA.
     El juego mezcla las opciones al mostrarlas.
   - "nivel" puede ser: 'fácil', 'medio' o 'difícil' (con tilde).
     Fácil vale 1 punto, medio 2 y difícil 3.
   - "revisar: true" = dato que conviene chequear o que cambia según la
     costumbre (ashkenazí/sefaradí, Israel/diáspora). Cuando lo revises,
     cambialo a false o borralo.
   - Ojo con las comillas: si el texto tiene un apóstrofo ('), escribilo
     como \' o usá comillas dobles para ese texto.
   ===================================================================== */

const DATOS_TRIVIA = [

  /* ---------- LA FESTIVIDAD Y SHMINÍ ATZÉRET ---------- */

  { id: 1, nivel: 'fácil', tema: 'festividad',
    pregunta: '¿Qué significa "Simjat Torá"?',
    opciones: ['Alegría de la Torá', 'Fiesta de las cabañas', 'Día del perdón', 'Cabeza del año'],
    explicacion: '"Simjá" quiere decir alegría: festejamos que terminamos de leer la Torá y la volvemos a empezar.' },

  { id: 2, nivel: 'fácil', tema: 'festividad',
    pregunta: '¿Qué se festeja en Simjat Torá?',
    opciones: ['Que se termina la lectura anual de la Torá y se vuelve a empezar', 'La salida de Egipto', 'La entrega de los Diez Mandamientos', 'El triunfo de los Macabeos'],
    explicacion: 'Ese día se lee el final de Devarim y enseguida el comienzo de Bereshit.' },

  { id: 3, nivel: 'fácil', tema: 'festividad',
    pregunta: '¿En qué mes del calendario hebreo cae Simjat Torá?',
    opciones: ['Tishrei', 'Nisán', 'Kislev', 'Adar'],
    explicacion: 'Tishrei es el mes de las fiestas de otoño (en Israel): Rosh Hashaná, Iom Kipur, Sucot, Shminí Atzéret y Simjat Torá.' },

  { id: 4, nivel: 'fácil', tema: 'sucot',
    pregunta: '¿Qué festividad termina justo antes de Shminí Atzéret y Simjat Torá?',
    opciones: ['Sucot', 'Pésaj', 'Janucá', 'Shavuot'],
    explicacion: 'Shminí Atzéret llega inmediatamente después de los siete días de Sucot.' },

  { id: 5, nivel: 'medio', tema: 'shmini atzeret',
    pregunta: '¿Qué significa "Shminí Atzéret"?',
    opciones: ['Octavo día de asamblea', 'Séptimo día de alegría', 'Fiesta de la cosecha', 'Día de las banderas'],
    explicacion: '"Shminí" es octavo y "atzéret" es reunión o detenerse: es el día que sigue a los 7 días de Sucot (Vaikrá 23:36).' },

  { id: 6, nivel: 'medio', tema: 'festividad', revisar: true,
    pregunta: 'En Israel, ¿qué día se festeja Simjat Torá?',
    opciones: ['El 22 de Tishrei, el mismo día que Shminí Atzéret', 'El 23 de Tishrei', 'El 15 de Tishrei', 'El 10 de Tishrei'],
    explicacion: 'En Israel Shminí Atzéret y Simjat Torá son un solo día de fiesta.' },

  { id: 7, nivel: 'medio', tema: 'festividad', revisar: true,
    pregunta: 'Fuera de Israel (en la diáspora), ¿qué día se festeja Simjat Torá?',
    opciones: ['El 23 de Tishrei, el día después de Shminí Atzéret', 'El 22 de Tishrei', 'El 21 de Tishrei', 'El 1 de Tishrei'],
    explicacion: 'En la diáspora las fiestas tienen un día más: el 22 es Shminí Atzéret y el 23, Simjat Torá.' },

  { id: 8, nivel: 'difícil', tema: 'shmini atzeret',
    pregunta: 'Según un midrash que cita Rashi, ¿por qué hay un día más de fiesta después de Sucot?',
    opciones: ['Como un rey que les pide a sus hijos que se queden un día más con él', 'Para compensar un día de lluvia', 'Para terminar de comer lo que sobró', 'Para recordar la salida de Egipto'],
    explicacion: 'Rashi (Vaikrá 23:36): "Me cuesta despedirme de ustedes, quédense un día más".' },

  { id: 9, nivel: 'medio', tema: 'shmini atzeret',
    pregunta: '¿Qué rezo especial se agrega en Shminí Atzéret?',
    opciones: ['Tefilat Guéshem, el pedido de lluvia', 'Kol Nidré', 'Tashlij', 'Selijot'],
    explicacion: 'En Musaf se pide por la lluvia: en Israel empieza la temporada de lluvias.' },

  { id: 10, nivel: 'medio', tema: 'shmini atzeret',
    pregunta: 'Desde Shminí Atzéret, ¿qué frase se empieza a decir en la Amidá?',
    opciones: ['Mashiv harúaj umorid haguéshem', 'Zojrenu lejaím', 'Al hanisim', 'Hamélej hakadosh'],
    explicacion: '"Que hace soplar el viento y caer la lluvia": se dice hasta Pésaj.' },

  { id: 11, nivel: 'difícil', tema: 'shmini atzeret', revisar: true,
    pregunta: 'En Shminí Atzéret muchas comunidades recuerdan a sus seres queridos fallecidos. ¿Cómo se llama ese rezo?',
    opciones: ['Izkor', 'Havdalá', 'Kidush', 'Halel'],
    explicacion: 'Izkor se dice en Iom Kipur, Shminí Atzéret, el último día de Pésaj y Shavuot (costumbre ashkenazí; otras comunidades tienen otras costumbres).' },

  { id: 12, nivel: 'medio', tema: 'sucot',
    pregunta: '¿Se sacude el lulav en Shminí Atzéret?',
    opciones: ['No: las cuatro especies se usan solo durante Sucot', 'Sí, todo el día', 'Sí, pero solo en las hakafot', 'Solo los chicos'],
    explicacion: 'Shminí Atzéret es una fiesta aparte: ya no se toman las cuatro especies.' },

  { id: 13, nivel: 'difícil', tema: 'sucot',
    pregunta: 'En el Templo, ¿cuántos toros se ofrecían en total durante los 7 días de Sucot?',
    opciones: ['70', '7', '13', '49'],
    explicacion: '13 el primer día, 12 el segundo… hasta 7 = 70. La tradición los relaciona con las 70 naciones del mundo. En Shminí Atzéret, en cambio, se ofrecía uno solo.' },

  { id: 14, nivel: 'medio', tema: 'sucot',
    pregunta: '¿Cómo se llama el séptimo día de Sucot, el anterior a Shminí Atzéret?',
    opciones: ['Hoshaná Rabá', 'Isrú Jag', 'Jol Hamoed', 'Erev Sucot'],
    explicacion: 'Hoshaná Rabá significa "la gran salvación": se dicen muchas hoshanot.' },

  { id: 15, nivel: 'medio', tema: 'sucot',
    pregunta: 'En Hoshaná Rabá se dan 7 vueltas en la sinagoga, parecido a las hakafot. ¿Con qué en la mano?',
    opciones: ['Con las cuatro especies (lulav y etrog)', 'Con el shofar', 'Con velas', 'Con banderitas'],
    explicacion: 'Durante Sucot se da una vuelta por día con las cuatro especies, y en Hoshaná Rabá siete.' },

  { id: 16, nivel: 'difícil', tema: 'sucot',
    pregunta: '¿Qué se golpea contra el piso en Hoshaná Rabá?',
    opciones: ['Un manojo de ramas de aravá (sauce)', 'El lulav', 'El etrog', 'Hojas de palmera'],
    explicacion: 'Es una costumbre muy antigua, de la época de los profetas, relacionada con el pedido de lluvia.' },

  /* ---------- HAKAFOT Y COSTUMBRES ---------- */

  { id: 17, nivel: 'fácil', tema: 'hakafot',
    pregunta: '¿Cómo se llaman las vueltas que se dan bailando con los Sifrei Torá?',
    opciones: ['Hakafot', 'Aliot', 'Brajot', 'Parashiot'],
    explicacion: '"Hakafá" quiere decir vuelta o rodeo.' },

  { id: 18, nivel: 'fácil', tema: 'hakafot',
    pregunta: '¿Cuántas hakafot se hacen tradicionalmente?',
    opciones: ['7', '3', '10', '12'],
    explicacion: 'Se dan siete vueltas, cantando y bailando con la Torá.' },

  { id: 19, nivel: 'fácil', tema: 'hakafot',
    pregunta: '¿Alrededor de qué se dan las hakafot en la sinagoga?',
    opciones: ['La bimá, la mesa donde se lee la Torá', 'El Arón Hakódesh', 'La puerta de entrada', 'La sucá'],
    explicacion: 'Se rodea la bimá, el lugar desde donde se lee la Torá.' },

  { id: 20, nivel: 'difícil', tema: 'hakafot',
    pregunta: '¿Cómo empiezan los versículos que se recitan antes de sacar los Sifrei Torá para las hakafot?',
    opciones: ['Atá hareíta', 'Shemá Israel', 'Adón olam', 'Lejá dodí'],
    explicacion: '"Atá hareíta ladáat…" ("A ti se te mostró para que sepas…", Devarim 4:35).' },

  { id: 21, nivel: 'difícil', tema: 'hakafot', revisar: true,
    pregunta: '¿Qué son las "hakafot shniot"?',
    opciones: ['Hakafot que se hacen en Israel a la salida de la fiesta, muchas veces con música', 'Las hakafot de los chicos', 'Las vueltas de Hoshaná Rabá', 'La segunda vuelta de cada hakafá'],
    explicacion: 'Como en Israel la fiesta dura un solo día, al terminar se hacen "segundas hakafot", a menudo en la calle y con orquesta.' },

  { id: 22, nivel: 'medio', tema: 'hakafot',
    pregunta: 'Completá la canción típica de las hakafot: "Sisu vesimjú be…"',
    opciones: ['…Simjat Torá', '…Sucot', '…Shabat', '…Ierushalaim'],
    explicacion: '"Alégrense y festejen en Simjat Torá".' },

  { id: 23, nivel: 'fácil', tema: 'costumbres',
    pregunta: '¿Qué llevan tradicionalmente los chicos en las hakafot?',
    opciones: ['Banderitas', 'Máscaras', 'Matzot', 'Janukiot'],
    explicacion: 'Las banderitas de Simjat Torá son una costumbre de hace varios siglos.' },

  { id: 24, nivel: 'medio', tema: 'costumbres', revisar: true,
    pregunta: 'En muchas comunidades de Europa del Este, ¿qué se ponía en la punta de las banderitas?',
    opciones: ['Una manzana, a veces con una vela', 'Una estrella de papel', 'Un caramelo', 'Una kipá'],
    explicacion: 'Era una costumbre ashkenazí, sobre todo en Europa del Este.' },

  { id: 25, nivel: 'fácil', tema: 'costumbres',
    pregunta: '¿Qué reciben muchas veces los chicos en Simjat Torá?',
    opciones: ['Caramelos y golosinas', 'Mishlóaj manot', 'Sevivonim', 'Hojas de lulav'],
    explicacion: 'Para que la Torá quede asociada con algo dulce.' },

  { id: 26, nivel: 'difícil', tema: 'historia',
    pregunta: 'En los años 60 a 80, miles de judíos se juntaban a bailar en Simjat Torá frente a la gran sinagoga de una ciudad donde se perseguía la religión. ¿Cuál?',
    opciones: ['Moscú', 'Madrid', 'El Cairo', 'Varsovia'],
    explicacion: 'Frente a la Sinagoga Coral de Moscú, en la Unión Soviética: bailar era un acto de identidad y valentía.' },

  { id: 27, nivel: 'difícil', tema: 'historia',
    pregunta: '¿Qué escritor contó esos festejos de Moscú en su libro "Los judíos del silencio"?',
    opciones: ['Elie Wiesel', 'Primo Levi', 'Isaac Bashevis Singer', 'Amos Oz'],
    explicacion: 'Elie Wiesel viajó a la URSS en 1965 y quedó impactado por la multitud que bailaba.' },

  /* ---------- LA LECTURA: VEZOT HABERAJÁ Y BERESHIT ---------- */

  { id: 28, nivel: 'medio', tema: 'lectura',
    pregunta: '¿Cómo se llama la última parashá de la Torá?',
    opciones: ['Vezot Haberajá', 'Bereshit', 'Haazinu', 'Vaiélej'],
    explicacion: '"Y esta es la bendición": Devarim capítulos 33 y 34. Es la única parashá que casi nunca se lee en Shabat.' },

  { id: 29, nivel: 'medio', tema: 'lectura',
    pregunta: '¿Qué hace Moshé en Vezot Haberajá?',
    opciones: ['Bendice a las tribus de Israel antes de morir', 'Recibe las Tablas', 'Cruza el Mar Rojo', 'Construye el Mishkán'],
    explicacion: 'Moshé se despide del pueblo con una bendición para cada tribu.' },

  { id: 30, nivel: 'fácil', tema: 'lectura',
    pregunta: '¿Con qué libro se vuelve a empezar la lectura en Simjat Torá?',
    opciones: ['Bereshit', 'Shemot', 'Devarim', 'Vaikrá'],
    explicacion: 'Bereshit (Génesis) es el primer libro de la Torá.' },

  { id: 31, nivel: 'fácil', tema: 'lectura',
    pregunta: '¿Cuál es la primera palabra de la Torá?',
    opciones: ['Bereshit', 'Shemá', 'Vaiedaber', 'Elé'],
    explicacion: '"Bereshit bará Elohim…": "Al principio creó Dios…".' },

  { id: 32, nivel: 'medio', tema: 'lectura',
    pregunta: '¿Cuáles son las últimas palabras de la Torá?',
    opciones: ['Leeiné kol Israel ("ante los ojos de todo Israel")', 'Shemá Israel', 'Bereshit bará', 'Iehí or'],
    explicacion: 'Devarim 34:12, el último versículo.' },

  { id: 33, nivel: 'difícil', tema: 'lectura',
    pregunta: 'La última letra de la Torá es lámed (ל) y la primera es bet (ב). Juntas forman una palabra, ¿cuál?',
    opciones: ['Lev: corazón', 'Bal: nada', 'Lo: no', 'El: Dios'],
    explicacion: 'Lámed + bet = לב (lev). Un lindo midrash: la Torá entera está "envuelta" en un corazón.' },

  { id: 34, nivel: 'medio', tema: 'lectura',
    pregunta: '¿Por qué se vuelve a empezar Bereshit enseguida después de terminar Devarim?',
    opciones: ['Para mostrar que el estudio de la Torá nunca termina', 'Porque sobra tiempo', 'Para ahorrar pergamino', 'Porque lo pide el calendario solar'],
    explicacion: 'Apenas terminamos, empezamos de nuevo: la Torá es un círculo sin fin.' },

  { id: 35, nivel: 'medio', tema: 'lectura', revisar: true,
    pregunta: '¿Cuántos Sifrei Torá se sacan habitualmente para la lectura de la mañana de Simjat Torá?',
    opciones: ['3', '1', '2', '5'],
    explicacion: 'Uno para Vezot Haberajá, otro para Bereshit y un tercero para el maftir. (Depende de cuántos rollos tenga la comunidad.)' },

  { id: 36, nivel: 'difícil', tema: 'lectura', revisar: true,
    pregunta: '¿Qué se lee como maftir en la mañana de Simjat Torá?',
    opciones: ['Las ofrendas de Shminí Atzéret, del libro Bamidbar', 'Los Diez Mandamientos', 'El Cántico del Mar', 'La bendición sacerdotal'],
    explicacion: 'Bamidbar 29:35 y siguientes: los sacrificios del octavo día.' },

  { id: 37, nivel: 'medio', tema: 'lectura',
    pregunta: '¿De qué libro es la haftará de Simjat Torá?',
    opciones: ['Iehoshúa', 'Ioná', 'Isaías', 'Rut'],
    explicacion: 'Se lee el primer capítulo de Iehoshúa: termina Moshé y empieza su sucesor. La historia continúa.' },

  { id: 38, nivel: 'medio', tema: 'lectura',
    pregunta: 'En esa haftará Dios le dice a Iehoshúa dos palabras famosas. ¿Cuáles?',
    opciones: ['Jazak veematz: "sé fuerte y valiente"', 'Lej lejá: "andate"', 'Shemá Israel: "escuchá, Israel"', 'Naasé venishmá: "haremos y escucharemos"'],
    explicacion: 'Iehoshúa 1:6, 7 y 9.' },

  { id: 39, nivel: 'fácil', tema: 'lectura',
    pregunta: '¿Qué dice la comunidad al terminar la lectura de cada libro de la Torá?',
    opciones: ['Jazak, jazak venitjazek', 'Mazal tov', 'Shaná tová', 'Shabat shalom'],
    explicacion: '"¡Fuerza, fuerza, y nos fortaleceremos!"' },

  { id: 40, nivel: 'medio', tema: 'lectura',
    pregunta: 'En la mañana de Simjat Torá, ¿quiénes reciben una aliá?',
    opciones: ['Todos los presentes, en muchas comunidades', 'Solo el rabino', 'Solo los Kohanim', 'Solo los chicos'],
    explicacion: 'Para que todos puedan subir, Vezot Haberajá se lee varias veces.' },

  { id: 41, nivel: 'medio', tema: 'lectura',
    pregunta: '¿Cómo se llama la aliá especial en la que todos los chicos suben juntos a la Torá?',
    opciones: ['Kol Hanearim', 'Jatán Torá', 'Maftir', 'Hagbahá'],
    explicacion: '"Kol hanearim" significa "todos los chicos".' },

  { id: 42, nivel: 'difícil', tema: 'lectura',
    pregunta: 'En Kol Hanearim, ¿qué se extiende sobre los chicos?',
    opciones: ['Un talit grande', 'Una sucá', 'Un Sefer Torá abierto', 'Una bandera'],
    explicacion: 'Los chicos quedan bajo el talit, como bajo una jupá.' },

  { id: 43, nivel: 'difícil', tema: 'lectura',
    pregunta: '¿Qué bendición se dice sobre los chicos en Kol Hanearim?',
    opciones: ['Hamalaj hagoel, la bendición de Iaakov a sus nietos', 'Shehejeianu', 'Birkat hamazón', 'Havdalá'],
    explicacion: 'Bereshit 48:16: "El ángel que me redimió de todo mal bendiga a los jóvenes…".' },

  /* ---------- JATÁN TORÁ Y JATÁN BERESHIT ---------- */

  { id: 44, nivel: 'medio', tema: 'jatanim',
    pregunta: '¿Cómo se llama a quien recibe el honor de la última aliá de la Torá?',
    opciones: ['Jatán Torá', 'Jatán Bereshit', 'Baal kore', 'Gabai'],
    explicacion: 'Es uno de los mayores honores del año: cerrar la lectura de la Torá.' },

  { id: 45, nivel: 'medio', tema: 'jatanim',
    pregunta: '¿Y a quien recibe la primera aliá de Bereshit?',
    opciones: ['Jatán Bereshit', 'Jatán Torá', 'Jatán Sucot', 'Rosh hakahal'],
    explicacion: 'Lee el relato de la Creación y "abre" el nuevo ciclo.' },

  { id: 46, nivel: 'difícil', tema: 'jatanim',
    pregunta: '"Jatán" en hebreo significa…',
    opciones: ['Novio', 'Rey', 'Maestro', 'Lector'],
    explicacion: 'Simjat Torá se vive como un casamiento entre el pueblo y la Torá.' },

  { id: 47, nivel: 'medio', tema: 'jatanim', revisar: true,
    pregunta: 'Según una costumbre muy difundida, ¿qué suelen ofrecer el Jatán Torá y el Jatán Bereshit?',
    opciones: ['Un kidush o festejo para la comunidad', 'Un Sefer Torá nuevo', 'Banderitas para todos', 'Un viaje a Israel'],
    explicacion: 'Agradecen el honor invitando a todos a festejar.' },

  /* ---------- LA TORÁ Y SU CICLO DE LECTURA ---------- */

  { id: 48, nivel: 'fácil', tema: 'tora',
    pregunta: '¿Cuántos libros tiene la Torá?',
    opciones: ['5', '7', '10', '24'],
    explicacion: 'Bereshit, Shemot, Vaikrá, Bamidbar y Devarim. (24 son los libros de todo el Tanaj.)' },

  { id: 49, nivel: 'fácil', tema: 'tora',
    pregunta: '¿Cuál es el último libro de la Torá?',
    opciones: ['Devarim', 'Bamidbar', 'Bereshit', 'Iehoshúa'],
    explicacion: 'Devarim (Deuteronomio) termina con la muerte de Moshé.' },

  { id: 50, nivel: 'fácil', tema: 'tora',
    pregunta: '¿Cómo se llama Shemot en castellano?',
    opciones: ['Éxodo', 'Génesis', 'Levítico', 'Números'],
    explicacion: 'Cuenta la salida de Egipto y la entrega de la Torá.' },

  { id: 51, nivel: 'medio', tema: 'tora',
    pregunta: '¿Cuántas parashiot (porciones semanales) tiene la Torá?',
    opciones: ['54', '50', '52', '613'],
    explicacion: 'Como algunos años tienen menos Shabatot, a veces se leen dos parashiot juntas.' },

  { id: 52, nivel: 'difícil', tema: 'tora',
    pregunta: '¿Qué libro de la Torá tiene más parashiot?',
    opciones: ['Bereshit', 'Shemot', 'Bamidbar', 'Devarim'],
    explicacion: 'Bereshit tiene 12; Shemot y Devarim, 11; Vaikrá y Bamidbar, 10.' },

  { id: 53, nivel: 'difícil', tema: 'tora',
    pregunta: '¿Cuál es la parashá más larga de la Torá?',
    opciones: ['Nasó', 'Bereshit', 'Vaiejí', 'Vezot Haberajá'],
    explicacion: 'Nasó (en Bamidbar) tiene 176 versículos.' },

  { id: 54, nivel: 'difícil', tema: 'ciclo',
    pregunta: 'En la antigua Tierra de Israel existió otra costumbre de lectura. ¿Cuál?',
    opciones: ['Terminar la Torá en un ciclo de unos tres años', 'Leerla entera en un mes', 'Leer solo Devarim', 'Leerla solo en Shabat a la noche'],
    explicacion: 'Era el "ciclo trienal". Con el tiempo se impuso el ciclo anual de Babilonia, que es el que se festeja en Simjat Torá.' },

  { id: 55, nivel: 'medio', tema: 'ciclo',
    pregunta: '¿Cuántas personas hacen falta como mínimo para leer la Torá en público?',
    opciones: ['10 (un minián)', '3', '7', '40'],
    explicacion: 'La lectura pública de la Torá necesita minián.' },

  { id: 56, nivel: 'medio', tema: 'tora',
    pregunta: '¿Cuántas mitzvot tiene la Torá según la tradición?',
    opciones: ['613', '10', '248', '365'],
    explicacion: '248 mandatos positivos ("hacé") + 365 negativos ("no hagas") = 613.' },

  { id: 57, nivel: 'difícil', tema: 'sefer tora',
    pregunta: '¿Cuántas letras tiene aproximadamente un Sefer Torá?',
    opciones: ['Unas 304.805', '613', 'Unas 5.845', 'Un millón'],
    explicacion: 'Es la cifra tradicional. 5.845 es el número aproximado de versículos.' },

  { id: 58, nivel: 'difícil', tema: 'sefer tora',
    pregunta: 'Según muchos sabios, ¿cuál es la última de las 613 mitzvot de la Torá?',
    opciones: ['Escribir un Sefer Torá', 'Hacer una sucá', 'Encender velas', 'Tocar el shofar'],
    explicacion: 'Se aprende de Devarim 31:19: "Escriban para ustedes este canto".' },

  { id: 59, nivel: 'difícil', tema: 'lectura',
    pregunta: '¿Cómo se llaman los signos que indican la melodía de la lectura de la Torá?',
    opciones: ['Teamim', 'Nekudot', 'Taguín', 'Otiot'],
    explicacion: 'En el rollo no están escritos: quien lee los aprende de memoria. (Los taguín son las "coronitas" de algunas letras.)' },

  { id: 60, nivel: 'medio', tema: 'lectura',
    pregunta: '¿Qué es la "hagbahá"?',
    opciones: ['Levantar el Sefer Torá abierto para que todos lo vean', 'Enrollar el Sefer Torá', 'Leer el último versículo', 'Llevar la Torá por la sinagoga'],
    explicacion: 'Mientras se levanta, la comunidad dice "Vezot hatorá…".' },

  { id: 61, nivel: 'difícil', tema: 'lectura', revisar: true,
    pregunta: 'En las comunidades sefaradíes, ¿cuándo se hace la hagbahá?',
    opciones: ['Antes de la lectura', 'Después de la lectura', 'Solo en Simjat Torá', 'Nunca'],
    explicacion: 'Los sefaradíes levantan la Torá antes de leer; los ashkenazíes, después.' },

  /* ---------- EL SEFER TORÁ Y LA SINAGOGA ---------- */

  { id: 62, nivel: 'fácil', tema: 'sefer tora',
    pregunta: '¿Sobre qué se escribe un Sefer Torá?',
    opciones: ['Pergamino (klaf)', 'Papel', 'Tela', 'Piedra'],
    explicacion: 'Se escribe a mano, con tinta especial, sobre pergamino de cuero.' },

  { id: 63, nivel: 'fácil', tema: 'sefer tora',
    pregunta: '¿Cómo se llama quien escribe a mano un Sefer Torá?',
    opciones: ['Sofer', 'Jazán', 'Shamash', 'Mohel'],
    explicacion: 'El sofer (escriba) puede tardar un año o más en terminar un rollo.' },

  { id: 64, nivel: 'fácil', tema: 'sinagoga',
    pregunta: '¿Dónde se guardan los Sifrei Torá en la sinagoga?',
    opciones: ['En el Arón Hakódesh', 'En la bimá', 'En la sucá', 'En la mezuzá'],
    explicacion: 'Arón Hakódesh significa "arca sagrada".' },

  { id: 65, nivel: 'fácil', tema: 'sefer tora',
    pregunta: '¿Cómo se llama el puntero con forma de manito para seguir la lectura?',
    opciones: ['Iad', 'Kéter', 'Rimón', 'Lulav'],
    explicacion: '"Iad" significa mano. Se usa para no tocar el pergamino con los dedos.' },

  { id: 66, nivel: 'medio', tema: 'sefer tora',
    pregunta: '¿Qué es el "Kéter Torá"?',
    opciones: ['La corona que adorna el Sefer Torá', 'El primer libro de la Torá', 'El atril de la bimá', 'La cinta que ata el rollo'],
    explicacion: 'Kéter es corona: la Torá se viste como una reina.' },

  { id: 67, nivel: 'medio', tema: 'sefer tora',
    pregunta: '¿Qué son los "rimonim"?',
    opciones: ['Adornos, muchas veces con campanitas, que se ponen en los rodillos del Sefer Torá', 'Granadas para Rosh Hashaná', 'Las letras de la Torá', 'Los versículos de cada parashá'],
    explicacion: 'Se llaman así porque muchos tienen forma de granada (rimón).' },

  { id: 68, nivel: 'medio', tema: 'sefer tora',
    pregunta: '¿Cómo se llaman los rodillos de madera del Sefer Torá?',
    opciones: ['Atzéi jaím ("árboles de vida")', 'Rimonim', 'Iadaim', 'Tefilín'],
    explicacion: 'Porque la Torá es "árbol de vida para quienes se aferran a ella" (Mishlé 3:18).' },

  { id: 69, nivel: 'medio', tema: 'sefer tora',
    pregunta: 'En muchas comunidades sefaradíes y orientales, ¿dónde se guarda el Sefer Torá?',
    opciones: ['En un estuche rígido llamado tik', 'En una bolsa de tela', 'En una caja de cartón', 'Envuelto en un talit'],
    explicacion: 'El tik suele ser de madera o metal, y la Torá se lee parada dentro de él.' },

  { id: 70, nivel: 'medio', tema: 'sinagoga',
    pregunta: '¿Cómo se llama la cortina que cubre el Arón Hakódesh?',
    opciones: ['Parójet', 'Meíl', 'Jupá', 'Kitel'],
    explicacion: 'Recuerda la cortina del Mishkán. El meíl, en cambio, es el manto que viste al Sefer Torá.' },

  { id: 71, nivel: 'difícil', tema: 'sefer tora',
    pregunta: '¿Qué pasa con un Sefer Torá al que le falta una sola letra?',
    opciones: ['No se puede usar para la lectura hasta que se corrige', 'Se sigue usando igual', 'Hay que enterrarlo enseguida', 'Solo sirve para Simjat Torá'],
    explicacion: 'Tiene que estar completo y perfecto: el sofer lo revisa y lo corrige.' },

  /* ---------- BERESHIT: LA CREACIÓN Y NOAJ ---------- */

  { id: 72, nivel: 'fácil', tema: 'bereshit',
    pregunta: '¿Qué se creó el primer día?',
    opciones: ['La luz', 'Los animales', 'El ser humano', 'Las estrellas'],
    explicacion: '"Iehí or": "Que haya luz".' },

  { id: 73, nivel: 'fácil', tema: 'bereshit',
    pregunta: '¿Qué día de la Creación descansó Dios?',
    opciones: ['El séptimo', 'El sexto', 'El primero', 'El octavo'],
    explicacion: 'Por eso el Shabat es el séptimo día.' },

  { id: 74, nivel: 'medio', tema: 'bereshit',
    pregunta: '¿Qué se creó el cuarto día?',
    opciones: ['El sol, la luna y las estrellas', 'Las plantas', 'Los peces', 'La luz'],
    explicacion: 'La luz fue el primer día; los astros, el cuarto.' },

  { id: 75, nivel: 'medio', tema: 'bereshit',
    pregunta: '¿Qué día se crearon los peces y las aves?',
    opciones: ['El quinto', 'El tercero', 'El sexto', 'El segundo'],
    explicacion: 'Quinto día: los seres del agua y del aire.' },

  { id: 76, nivel: 'medio', tema: 'bereshit',
    pregunta: '¿Qué se creó el sexto día?',
    opciones: ['Los animales de la tierra y el ser humano', 'Las plantas', 'Los mares', 'El sol'],
    explicacion: 'El ser humano es lo último que se crea antes del Shabat.' },

  { id: 77, nivel: 'medio', tema: 'bereshit',
    pregunta: '¿Cuáles son las primeras palabras que dice Dios en la Torá?',
    opciones: ['Iehí or: "Que haya luz"', 'Shemá Israel', 'Lej lejá', 'Anojí Hashem'],
    explicacion: 'Bereshit 1:3.' },

  { id: 78, nivel: 'fácil', tema: 'bereshit',
    pregunta: '¿Cómo se llaman los primeros seres humanos?',
    opciones: ['Adam y Javá', 'Abraham y Sará', 'Iaakov y Rajel', 'Moshé y Tzipora'],
    explicacion: 'Vivían en el Gan Edén.' },

  { id: 79, nivel: 'fácil', tema: 'bereshit',
    pregunta: '¿Qué animal convenció a Javá de comer del árbol prohibido?',
    opciones: ['La serpiente', 'El león', 'El cuervo', 'El mono'],
    explicacion: 'La serpiente era "la más astuta" de los animales.' },

  { id: 80, nivel: 'fácil', tema: 'bereshit',
    pregunta: '¿Qué construyó Noaj para salvarse del diluvio?',
    opciones: ['Un arca', 'Una torre', 'Una sucá', 'Un puente'],
    explicacion: 'Metió en el arca a su familia y a los animales.' },

  { id: 81, nivel: 'fácil', tema: 'bereshit',
    pregunta: '¿Qué señal puso Dios en el cielo después del diluvio?',
    opciones: ['El arcoíris', 'Una estrella fugaz', 'La luna llena', 'Un relámpago'],
    explicacion: 'Es la señal de la promesa de no volver a destruir el mundo con un diluvio.' },

  { id: 82, nivel: 'medio', tema: 'bereshit',
    pregunta: '¿Qué ave volvió al arca con una hoja de olivo?',
    opciones: ['La paloma', 'El cuervo', 'El águila', 'La gallina'],
    explicacion: 'Así Noaj supo que el agua estaba bajando (Bereshit 8:11).' },

  /* ---------- PERSONAJES DE LA TORÁ ---------- */

  { id: 83, nivel: 'fácil', tema: 'personajes',
    pregunta: '¿Quién soñó con una escalera por la que subían y bajaban ángeles?',
    opciones: ['Iaakov', 'Iosef', 'Abraham', 'Moshé'],
    explicacion: 'Fue cuando escapaba de su hermano Esav (Bereshit 28).' },

  { id: 84, nivel: 'fácil', tema: 'personajes',
    pregunta: '¿Quién fue vendido por sus hermanos y llegó a ser virrey de Egipto?',
    opciones: ['Iosef', 'Biniamín', 'Iehudá', 'Moshé'],
    explicacion: 'Interpretó los sueños del Faraón y salvó a Egipto del hambre.' },

  { id: 85, nivel: 'fácil', tema: 'personajes',
    pregunta: '¿Quién fue el hermano de Moshé y el primer Kohen Gadol?',
    opciones: ['Aharón', 'Iehoshúa', 'Kalev', 'Itró'],
    explicacion: 'Aharón y sus hijos fueron los primeros kohanim.' },

  { id: 86, nivel: 'medio', tema: 'personajes',
    pregunta: '¿Quién tomó un pandero y cantó con las mujeres después de cruzar el mar?',
    opciones: ['Miriam', 'Sará', 'Tzipora', 'Débora'],
    explicacion: 'Miriam, la hermana de Moshé y Aharón (Shemot 15:20).' },

  { id: 87, nivel: 'medio', tema: 'personajes',
    pregunta: '¿A quién le habló su burra según la Torá?',
    opciones: ['A Bilaam', 'A Balak', 'A Moshé', 'A Kóraj'],
    explicacion: 'Bilaam iba a maldecir a Israel y terminó bendiciéndolo (Bamidbar 22).' },

  { id: 88, nivel: 'medio', tema: 'personajes',
    pregunta: '¿Quién sucedió a Moshé como líder del pueblo?',
    opciones: ['Iehoshúa', 'Aharón', 'Kalev', 'Pinjás'],
    explicacion: 'Iehoshúa bin Nun hizo entrar al pueblo a la Tierra de Israel.' },

  { id: 89, nivel: 'medio', tema: 'personajes',
    pregunta: '¿Cuántos años tenía Moshé cuando murió?',
    opciones: ['120', '100', '80', '40'],
    explicacion: 'Por eso se desea "hasta 120" (Devarim 34:7).' },

  { id: 90, nivel: 'medio', tema: 'personajes',
    pregunta: '¿Desde qué monte vio Moshé la Tierra de Israel antes de morir?',
    opciones: ['El monte Nevó', 'El monte Sinaí', 'El monte Moriá', 'El monte Ararat'],
    explicacion: 'Se lee en Vezot Haberajá, justo en Simjat Torá (Devarim 34:1).' },

  { id: 91, nivel: 'difícil', tema: 'personajes',
    pregunta: 'Según la Torá, ¿qué se sabe del lugar donde está enterrado Moshé?',
    opciones: ['Nadie conoce su tumba', 'Está en Hebrón con los patriarcas', 'Está en Jerusalem', 'Está en Egipto'],
    explicacion: '"Nadie conoce su sepultura hasta el día de hoy" (Devarim 34:6).' },

  { id: 92, nivel: 'difícil', tema: 'lectura',
    pregunta: '¿Qué tribu NO aparece nombrada en las bendiciones de Moshé en Vezot Haberajá?',
    opciones: ['Shimón', 'Iehudá', 'Leví', 'Biniamín'],
    explicacion: 'Shimón no recibe una bendición propia en Devarim 33.' },

  { id: 93, nivel: 'difícil', tema: 'personajes',
    pregunta: '¿Quién fue el gran artesano que dirigió la construcción del Mishkán?',
    opciones: ['Betzalel', 'Aharón', 'Iehoshúa', 'Itró'],
    explicacion: 'Betzalel, de la tribu de Iehudá (Shemot 31).' },

  { id: 94, nivel: 'fácil', tema: 'personajes',
    pregunta: '¿En qué monte recibió Moshé la Torá?',
    opciones: ['Sinaí', 'Nevó', 'Moriá', 'Carmel'],
    explicacion: 'Siete semanas después de salir de Egipto: por eso se festeja Shavuot.' },

  { id: 95, nivel: 'fácil', tema: 'personajes',
    pregunta: '¿Qué comía el pueblo de Israel en el desierto, que caía del cielo?',
    opciones: ['El maná', 'Pan de miel', 'Dátiles', 'Arroz'],
    explicacion: 'Caía cada mañana, y los viernes caía doble porción para el Shabat.' },

  /* ---------- CONEXIÓN CON SUCOT ---------- */

  { id: 96, nivel: 'fácil', tema: 'sucot',
    pregunta: '¿Qué construyen las familias para Sucot?',
    opciones: ['Una sucá (cabaña)', 'Una janukiá', 'Un arca', 'Una torre'],
    explicacion: 'Recuerda las cabañas en las que vivió el pueblo en el desierto.' },

  { id: 97, nivel: 'medio', tema: 'sucot',
    pregunta: '¿Cuáles son las cuatro especies de Sucot?',
    opciones: ['Etrog, lulav, hadas y aravá', 'Manzana, miel, granada y dátil', 'Trigo, cebada, uva e higo', 'Olivo, palmera, cedro y roble'],
    explicacion: 'Cidra, rama de palmera, mirto y sauce.' },

  { id: 98, nivel: 'medio', tema: 'sucot',
    pregunta: '¿Qué son los "ushpizin"?',
    opciones: ['Siete invitados ilustres (Abraham, Itzjak, Iaakov…) que se reciben simbólicamente en la sucá', 'Los postres típicos de Sucot', 'Las ramas del techo de la sucá', 'Las velas de la fiesta'],
    explicacion: 'Cada noche se "invita" a uno: Abraham, Itzjak, Iaakov, Moshé, Aharón, Iosef y David (el orden varía según la costumbre).' },

  { id: 99, nivel: 'medio', tema: 'sucot',
    pregunta: '¿Cuántos días dura Sucot según la Torá, sin contar Shminí Atzéret?',
    opciones: ['7', '8', '9', '10'],
    explicacion: 'Siete días de Sucot, y el octavo es Shminí Atzéret.' },

  { id: 100, nivel: 'medio', tema: 'sucot', revisar: true,
    pregunta: '¿Qué libro del Tanaj se lee en muchas comunidades durante Sucot?',
    opciones: ['Kohélet (Eclesiastés)', 'Ester', 'Rut', 'Eijá'],
    explicacion: 'Costumbre ashkenazí: se lee en el Shabat de Sucot. Ester es de Purim, Rut de Shavuot y Eijá de Tishá Beav.' }

];
