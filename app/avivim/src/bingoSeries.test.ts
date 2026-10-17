import { describe, expect, it } from "vitest";
import {
  card,
  nameOf,
  namesFrom,
  pick,
  sameNames,
  verdict,
} from "./bingoSeries";
import { initial, validateQuestions, validateState } from "./engine";
import bank from "./questions.json";

const titles = Array.from({ length: 12 }, (_, i) => `Serie ${i + 1}`);

describe("Bingo de series y películas", () => {
  it("usa el nombre del archivo sin la extensión", () => {
    expect(nameOf("Super Agente 86.mp4")).toBe("Super Agente 86");
    expect(nameOf("  El   Zorro .MP3")).toBe("El Zorro");
    expect(nameOf("Dr. No.mkv")).toBe("Dr. No");
  });
  it("ordena y quita repetidos, sin depender del orden de los archivos", () => {
    const a = namesFrom(["Bonanza.mp4", "Batman.mp3", "bonanza.webm"]);
    expect(a).toEqual(["Batman", "Bonanza"]);
    expect(sameNames(a, namesFrom(["Batman.mov", "Bonanza.mp4"]))).toBe(true);
  });
  it("arma siempre el mismo cartón y avisa si faltan fragmentos", () => {
    expect(card(7, 2, titles)).toEqual(card(7, 2, titles));
    expect(new Set(card(7, 2, titles)).size).toBe(9);
    expect(() => card(7, 2, titles.slice(0, 8))).toThrow(/al menos 9/);
  });
  it("cuenta filas horizontales y cartón completo", () => {
    const c = card(55, 3, titles);
    expect(verdict(55, 3, c.slice(0, 3), titles)).toMatchObject({
      lines: 1,
      bingo: false,
      missing: 6,
    });
    expect(verdict(55, 3, [c[0], c[3], c[6]], titles).lines).toBe(0);
    expect(verdict(55, 3, c, titles)).toMatchObject({ bingo: true });
  });
  it("elige al azar sin repetir hasta que se acaban", () => {
    const played: string[] = [];
    for (let i = 0; i < titles.length; i++)
      played.push(pick(titles, played, () => true)!);
    expect(new Set(played).size).toBe(titles.length);
    expect(pick(titles, played, () => true)).toBeNull();
    expect(pick(titles, [], () => false)).toBeNull();
  });
  it("abre partidas anteriores y no toca los otros bingos", () => {
    const state = initial(validateQuestions(bank));
    const { bingoSeries: unused, ...old } = state;
    const loaded = validateState(old);
    expect(loaded.bingo).toEqual(state.bingo);
    expect(loaded.bingo6070).toEqual(state.bingo6070);
    expect(loaded.bingoSeries.names).toEqual([]);
    loaded.bingoSeries.names = titles;
    loaded.bingoSeries.played = [titles[0]];
    expect(validateState(loaded).bingoSeries).toEqual(loaded.bingoSeries);
    expect(() =>
      validateState({
        ...loaded,
        bingoSeries: { ...loaded.bingoSeries, names: [""] },
      }),
    ).toThrow();
  });
});
