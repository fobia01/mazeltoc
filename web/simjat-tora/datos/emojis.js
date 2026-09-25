/* =====================================================================
   BANCO DE EMOJIS — ¿QUÉ REPRESENTA?
   - emojis:     separados por un espacio.
   - respuesta:  lo que hay que adivinar.
   - explicacion: (opcional) se muestra al final.
   ===================================================================== */

const DATOS_EMOJIS = [
  { emojis: '🌊 🚶 🌊', respuesta: 'El cruce del Mar Rojo', explicacion: 'El agua se abrió y el pueblo cruzó caminando.' },
  { emojis: '🚢 🦒 🦓 🌧️', respuesta: 'El arca de Noaj', explicacion: 'Los animales entraron de a dos.' },
  { emojis: '🌈 🕊️ 🌿', respuesta: 'El final del diluvio', explicacion: 'La paloma trajo una hoja de olivo y apareció el arcoíris.' },
  { emojis: '🍎 🐍 🌳', respuesta: 'Adam y Javá en el Gan Edén', explicacion: 'La Torá no dice que fuera una manzana: solo "el fruto del árbol".' },
  { emojis: '🔥 🌳 👟', respuesta: 'La zarza ardiente', explicacion: 'Dios le pidió a Moshé que se sacara los zapatos.' },
  { emojis: '😴 🪜 👼', respuesta: 'El sueño de Iaakov', explicacion: 'Ángeles subían y bajaban por una escalera.' },
  { emojis: '🧥 🌈 👦', respuesta: 'La túnica de Iosef', explicacion: 'Su papá le regaló una túnica especial, y sus hermanos se pusieron celosos.' },
  { emojis: '🐸 🩸 🦗', respuesta: 'Las plagas de Egipto', explicacion: 'Ranas, sangre, langostas… diez en total.' },
  { emojis: '🏗️ 🧱 🗣️ ❓', respuesta: 'La torre de Babel', explicacion: 'Quisieron llegar al cielo y terminaron sin entenderse.' },
  { emojis: '📜 💃 🚩', respuesta: 'Simjat Torá', explicacion: '¡Lo que estamos festejando!' },
  { emojis: '🍋 🌿 ⛺', respuesta: 'Sucot', explicacion: 'El etrog, el lulav y la sucá.' },
  { emojis: '🍞 ☁️ 🏜️', respuesta: 'El maná', explicacion: 'El "pan del cielo" que comían en el desierto.' },
  { emojis: '⛰️ 🪨 🔟', respuesta: 'Los Diez Mandamientos en el Sinaí', explicacion: 'Dos tablas de piedra.' },
  { emojis: '🫏 🗣️', respuesta: 'La burra de Bilaam', explicacion: 'La única burra que habla en la Torá.' },
  { emojis: '👶 🧺 🌊', respuesta: 'Moshé bebé en el río', explicacion: 'Lo encontró la hija del Faraón.' },
  { emojis: '☀️ 🌙 ⭐ 4️⃣', respuesta: 'El cuarto día de la Creación', explicacion: 'El sol, la luna y las estrellas.' },
  { emojis: '7️⃣ 🔄 📜', respuesta: 'Las siete hakafot', explicacion: 'Siete vueltas bailando con la Torá.' },
  { emojis: '🍬 👧 👦 🕍', respuesta: 'Los caramelos de Simjat Torá', explicacion: 'Para que la Torá tenga gusto dulce.' },
  { emojis: '🌧️ 🙏', respuesta: 'La Tefilat Guéshem (el pedido de lluvia)', explicacion: 'Se dice en Shminí Atzéret.' },
  { emojis: '🔚 🔁 📖', respuesta: 'Terminar la Torá y volver a empezar', explicacion: 'De Devarim a Bereshit sin pausa.' },
  { emojis: '⭐ ⭐ ⭐ 🏖️ 👴', respuesta: 'La promesa a Abraham', explicacion: 'Descendientes como las estrellas del cielo y la arena del mar.' },
  { emojis: '🧂 👩 ↩️', respuesta: 'La mujer de Lot', explicacion: 'Miró para atrás y se convirtió en estatua de sal.' },
  { emojis: '🪄 🐍 👑', respuesta: 'La vara que se convierte en serpiente frente al Faraón', explicacion: 'Shemot 7: la vara de Aharón.' },
  { emojis: '🪨 💧 🪄', respuesta: 'Moshé golpea la roca', explicacion: 'Y salió agua para todo el pueblo.' },
  { emojis: '🐄 ✨ 💃', respuesta: 'El becerro de oro', explicacion: 'Mientras Moshé estaba en el monte Sinaí.' },
  { emojis: '👑 📜', respuesta: 'El Kéter Torá (la corona de la Torá)', explicacion: 'El adorno que se pone sobre el Sefer Torá.' },
  { emojis: '🤵 📜 🥂', respuesta: 'El Jatán Torá', explicacion: 'El "novio de la Torá", que recibe la última aliá.' }
];
