import list from "./actores6070.json";
import type { Bingo } from "./bingo";
export type Actor = {
  id: string;
  nombre: string;
  pista: string;
  grupo: string;
};
export type Bingo6070 = Bingo & { reveal: boolean };
export const actors: Actor[] = list;
export const groups = [...new Set(actors.map((a) => a.grupo))];
// Misma forma de generar y comprobar cartones que el bingo musical.
export const CARD_SIZE = 9;
export const ROW = 3;
export function newBingo(cards = 30): Bingo6070 {
  return {
    seed: 1 + Math.floor(Math.random() * 99999),
    cards,
    played: [],
    check: null,
    reveal: false,
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
export function card(seed: number, number: number): Actor[] {
  const r = random(seed * 1000 + number);
  const pool = [...actors];
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
export const actorById = (id: string) => actors.find((s) => s.id === id);
