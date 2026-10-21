import { describe, expect, it } from "vitest";
import {
  card,
  clipsFor,
  newBingo,
  pick,
  series,
  verdict,
  youtube,
} from "./bingoAntiguas";
import { initial, validateQuestions, validateState } from "./engine";
import bank from "./questions.json";

describe("Bingo de series de antes", () => {
  it("tiene una lista sin repetidos y con videos de YouTube válidos", () => {
    expect(series.length).toBeGreaterThanOrEqual(40);
    expect(new Set(series.map((s) => s.id)).size).toBe(series.length);
    expect(new Set(series.map((s) => s.nombre)).size).toBe(series.length);
    for (const s of series) {
      expect(s.cortina || s.escena, s.nombre).toBeTruthy();
      for (const link of [s.cortina, s.escena])
        if (link) expect(youtube(link), `${s.nombre}: ${link}`).not.toBeNull();
    }
  });
  it("entiende los enlaces que da YouTube", () => {
    expect(youtube("https://www.youtube.com/watch?v=_crj6n1ZDcU")).toEqual({
      id: "_crj6n1ZDcU",
      start: 0,
    });
    expect(youtube("https://youtu.be/cfE--nELmOE?t=90")).toEqual({
      id: "cfE--nELmOE",
      start: 90,
    });
    expect(
      youtube("https://m.youtube.com/watch?v=cfE--nELmOE&t=1m30s")?.start,
    ).toBe(90);
    expect(youtube("https://www.youtube.com/shorts/cfE--nELmOE")?.id).toBe(
      "cfE--nELmOE",
    );
    expect(youtube("https://vimeo.com/12345")).toBeNull();
    expect(youtube("Super Agente 86")).toBeNull();
  });
  it("arma siempre el mismo cartón y cuenta líneas horizontales", () => {
    expect(card(7, 2)).toEqual(card(7, 2));
    const c = card(55, 3).map((s) => s.id);
    expect(new Set(c).size).toBe(9);
    expect(verdict(55, 3, c.slice(0, 3))).toMatchObject({
      lines: 1,
      bingo: false,
      missing: 6,
    });
    expect(verdict(55, 3, [c[0], c[3], c[6]]).lines).toBe(0);
    expect(verdict(55, 3, c).bingo).toBe(true);
  });
  it("los enlaces pegados en el juego reemplazan a los de la lista", () => {
    const b = newBingo();
    const s = series[0];
    expect(clipsFor(b, s)).toEqual(["cortina", "escena"]);
    b.links[s.id] = { cortina: "" };
    expect(clipsFor(b, s)).toEqual(["escena"]);
  });
  it("saca series al azar sin repetir", () => {
    const played: string[] = [];
    for (let i = 0; i < series.length; i++) played.push(pick(played)!.id);
    expect(new Set(played).size).toBe(series.length);
    expect(pick(played)).toBeNull();
  });
  it("abre partidas anteriores y no toca los otros bingos", () => {
    const state = initial(validateQuestions(bank));
    const { bingoAntiguas: unused, ...old } = state;
    const loaded = validateState(old);
    expect(loaded.bingoSeries).toEqual(state.bingoSeries);
    expect(loaded.bingoAntiguas.played).toEqual([]);
    loaded.bingoAntiguas.played = [series[0].id];
    loaded.bingoAntiguas.links = { [series[0].id]: { escena: "" } };
    expect(validateState(loaded).bingoAntiguas).toEqual(loaded.bingoAntiguas);
    expect(() =>
      validateState({
        ...loaded,
        bingoAntiguas: { ...loaded.bingoAntiguas, clip: "otro" },
      }),
    ).toThrow();
  });
});
