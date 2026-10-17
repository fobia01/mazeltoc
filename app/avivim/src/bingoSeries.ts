// Bingo de series y películas: los nombres salen de los archivos de video o
// audio que el conductor elige en su computadora. Los archivos nunca se copian
// ni se suben; solo se guardan sus nombres para rearmar y verificar cartones.
import type { Bingo } from "./bingo";
export type BingoSeries = Bingo & { reveal: boolean; names: string[] };
// Misma forma de cartón que el bingo musical.
export const CARD_SIZE = 9;
export const ROW = 3;
export function newBingo(cards = 30): BingoSeries {
  return {
    seed: 1 + Math.floor(Math.random() * 99999),
    cards,
    played: [],
    check: null,
    reveal: false,
    names: [],
  };
}
// «Super Agente 86.mp4» → «Super Agente 86».
export function nameOf(fileName: string) {
  return fileName
    .replace(/\.[a-z0-9]{1,5}$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}
export const keyOf = (name: string) => name.toLocaleLowerCase("es");
// Sin repetidos y en orden alfabético: así los cartones salen iguales aunque
// los archivos se elijan en otro orden.
export function namesFrom(fileNames: string[]) {
  const seen = new Map<string, string>();
  for (const f of fileNames) {
    const n = nameOf(f);
    if (n && !seen.has(keyOf(n))) seen.set(keyOf(n), n);
  }
  return [...seen.values()].sort((a, b) =>
    a.localeCompare(b, "es", { sensitivity: "base" }),
  );
}
export const sameNames = (a: string[], b: string[]) =>
  a.length === b.length && a.every((n, i) => keyOf(n) === keyOf(b[i]));
export const enough = (names: string[]) => names.length >= CARD_SIZE;
function random(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function card(seed: number, number: number, names: string[]) {
  if (!enough(names))
    throw Error(
      `Hacen falta al menos ${CARD_SIZE} fragmentos para armar un cartón.`,
    );
  const r = random(seed * 1000 + number);
  const pool = [...names];
  for (let i = 0; i < CARD_SIZE; i++) {
    const j = i + Math.floor(r() * (pool.length - i));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, CARD_SIZE);
}
export function verdict(
  seed: number,
  number: number,
  played: string[],
  names: string[],
) {
  const c = card(seed, number, names);
  const done = new Set(played.map(keyOf));
  const hit = c.map((n) => done.has(keyOf(n)));
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
// Elige al azar uno que todavía no sonó y cuyo archivo esté cargado.
export function pick(
  names: string[],
  played: string[],
  loaded: (name: string) => boolean,
  r = Math.random,
) {
  const done = new Set(played.map(keyOf));
  const left = names.filter((n) => !done.has(keyOf(n)) && loaded(n));
  return left.length ? left[Math.floor(r() * left.length)] : null;
}
