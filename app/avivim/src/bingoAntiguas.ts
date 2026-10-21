// Bingo de series de antes: lista fija como el bingo musical, así los cartones
// se imprimen sin necesitar los videos. Cada serie puede tener una cortina
// (la música de presentación) y una escena, las dos como enlaces de YouTube.
import list from "./seriesAntiguas.json";
import type { Bingo } from "./bingo";
export type Clip = "cortina" | "escena";
export type Serie = {
  id: string;
  nombre: string;
  grupo: string;
  cortina: string;
  escena: string;
};
export type BingoAntiguas = Bingo & {
  reveal: boolean;
  clip: Clip;
  // Sube cada vez que se pide repetir: obliga a reiniciar el video.
  take: number;
  // Enlaces pegados en el juego para reemplazar los de la lista.
  links: Record<string, Partial<Record<Clip, string>>>;
};
export const series: Serie[] = list;
export const groups = [...new Set(series.map((s) => s.grupo))];
export const CARD_SIZE = 9;
export const ROW = 3;
export function newBingo(cards = 30): BingoAntiguas {
  return {
    seed: 1 + Math.floor(Math.random() * 99999),
    cards,
    played: [],
    check: null,
    reveal: false,
    clip: "cortina",
    take: 0,
    links: {},
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
export function card(seed: number, number: number): Serie[] {
  const r = random(seed * 1000 + number);
  const pool = [...series];
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
export const serieById = (id: string) => series.find((s) => s.id === id);
// Acepta los enlaces que da YouTube al copiar o compartir (watch, youtu.be,
// shorts, embed) y el minuto de inicio («t=90», «t=1m30s» o «start=90»).
export function youtube(link: string) {
  let url: URL;
  try {
    url = new URL(link.trim());
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^(www|m|music)\./, "");
  const id =
    host === "youtu.be"
      ? url.pathname.slice(1)
      : host === "youtube.com" || host === "youtube-nocookie.com"
        ? url.searchParams.get("v") ||
          url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1]
        : null;
  if (!id || !/^[\w-]{11}$/.test(id)) return null;
  const t = url.searchParams.get("t") || url.searchParams.get("start") || "";
  const m = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/);
  const start = m ? +(m[1] || 0) * 3600 + +(m[2] || 0) * 60 + +(m[3] || 0) : 0;
  return { id, start };
}
// El enlace pegado en el juego tiene prioridad sobre el de la lista.
export function linkFor(b: BingoAntiguas, s: Serie, clip: Clip) {
  return b.links[s.id]?.[clip] ?? s[clip];
}
export function clipsFor(b: BingoAntiguas, s: Serie) {
  return (["cortina", "escena"] as const).filter((c) =>
    youtube(linkFor(b, s, c)),
  );
}
// Elige al azar una serie que todavía no salió.
export function pick(played: string[], r = Math.random) {
  const left = series.filter((s) => !played.includes(s.id));
  return left.length ? left[Math.floor(r() * left.length)] : null;
}
