// Bingo musical: los cartones se generan siempre igual a partir de una semilla,
// así el juego puede verificar un cartón impreso solo con su número.
export type Song = { id: string; title: string; artist: string; group: string };
export type Bingo = {
  seed: number;
  cards: number;
  played: string[];
  check: number | null;
};
const list: [string, [string, string][]][] = [
  [
    "Argentina melódica y folclore",
    [
      ["Rosa, Rosa", "Sandro"],
      ["Penumbras", "Sandro"],
      ["La felicidad", "Palito Ortega"],
      ["Despeinada", "Palito Ortega"],
      ["Ella ya me olvidó", "Leonardo Favio"],
      ["Fuiste mía un verano", "Leonardo Favio"],
      ["Te he prometido", "Leo Dan"],
      ["¡Qué suerte!", "Violeta Rivas"],
      ["Pity Pity", "Billy Cafaro"],
      ["Mi viejo", "Piero"],
      ["Las palmeras", "Alberto Cortez"],
      ["En un rincón del alma", "Alberto Cortez"],
      ["Café La Humedad", "Cacho Castaña"],
      ["Alfonsina y el mar", "Mercedes Sosa"],
    ],
  ],
  [
    "Tango",
    [
      ["Cambalache", "Julio Sosa"],
      ["Sur", "Edmundo Rivero"],
      ["Naranjo en flor", "Roberto Goyeneche"],
      ["Se dice de mí", "Tita Merello"],
      ["Así se baila el tango", "Alberto Castillo"],
      ["La cumparsita", "Juan D'Arienzo"],
      ["Malena", "Hugo del Carril"],
      ["Balada para un loco", "Amelita Baltar"],
      ["Adiós Nonino", "Astor Piazzolla"],
      ["Libertango", "Astor Piazzolla"],
      ["Volver", "Carlos Gardel"],
      ["Por una cabeza", "Carlos Gardel"],
    ],
  ],
  [
    "España",
    [
      ["Yo soy aquel", "Raphael"],
      ["Mi gran noche", "Raphael"],
      ["La vida sigue igual", "Julio Iglesias"],
      ["Gwendolyne", "Julio Iglesias"],
      ["Mediterráneo", "Joan Manuel Serrat"],
      ["Penélope", "Joan Manuel Serrat"],
      ["Algo de mí", "Camilo Sesto"],
      ["Libre", "Nino Bravo"],
      ["Un beso y una flor", "Nino Bravo"],
      ["Eres tú", "Mocedades"],
      ["Black Is Black", "Los Bravos"],
      ["La, la, la", "Massiel"],
      ["Y viva España", "Manolo Escobar"],
      ["Fumando espero", "Sara Montiel"],
    ],
  ],
  [
    "Italia",
    [
      ["Volare", "Domenico Modugno"],
      ["Ciao ciao bambina", "Domenico Modugno"],
      ["Il ballo del mattone", "Rita Pavone"],
      ["In ginocchio da te", "Gianni Morandi"],
      ["Azzurro", "Adriano Celentano"],
      ["Parole parole", "Mina"],
      ["Il cuore è uno zingaro", "Nicola Di Bari"],
      ["Una lacrima sul viso", "Bobby Solo"],
      ["Non ho l'età", "Gigliola Cinquetti"],
      ["Il mondo", "Jimmy Fontana"],
      ["Rose rosse", "Massimo Ranieri"],
      ["Roberta", "Peppino di Capri"],
    ],
  ],
  [
    "Boleros",
    [
      ["Sin ti", "Trío Los Panchos"],
      ["Rayito de luna", "Trío Los Panchos"],
      ["Bésame mucho", "Lucho Gatica"],
      ["El reloj", "Lucho Gatica"],
      ["Somos novios", "Armando Manzanero"],
      ["Sombras", "Javier Solís"],
      ["Solamente una vez", "Pedro Vargas"],
      ["Angelitos negros", "Antonio Machín"],
      ["Dos gardenias", "Antonio Machín"],
      ["Quizás, quizás, quizás", "Nat King Cole"],
      ["Miénteme", "Olga Guillot"],
      ["Dos almas", "Leo Marini"],
    ],
  ],
];
let n = 0;
export const songs: Song[] = list.flatMap(([group, items]) =>
  items.map(([title, artist]) => ({
    id: `c${String(++n).padStart(2, "0")}`,
    title,
    artist,
    group,
  })),
);
export const groups = list.map(([g]) => g);
export const CARD_SIZE = 9;
export const ROW = 3;
export function newBingo(cards = 30): Bingo {
  return {
    seed: 1 + Math.floor(Math.random() * 99999),
    cards,
    played: [],
    check: null,
  };
}
function random(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function card(seed: number, number: number): Song[] {
  const r = random(seed * 1000 + number);
  const pool = [...songs];
  for (let i = 0; i < CARD_SIZE; i++) {
    const j = i + Math.floor(r() * (pool.length - i));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, CARD_SIZE);
}
export function verdict(seed: number, number: number, played: string[]) {
  const c = card(seed, number);
  const hit = c.map((s) => played.includes(s.id));
  const lines = [0, 1, 2].filter((row) =>
    hit.slice(row * ROW, row * ROW + ROW).every(Boolean),
  ).length;
  return {
    card: c,
    hit,
    lines,
    bingo: hit.every(Boolean),
    missing: hit.filter((h) => !h).length,
  };
}
export const songById = (id: string) => songs.find((s) => s.id === id);
