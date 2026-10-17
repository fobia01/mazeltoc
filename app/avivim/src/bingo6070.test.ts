import { describe, expect, it } from "vitest";
import { actors, card, verdict } from "./bingo6070";
import { initial, validateQuestions, validateState } from "./engine";
import bank from "./questions.json";

describe("Bingo de los 60 y 70", () => {
  it("tiene 40 nombres y pistas diferentes, con identificadores estables", () => {
    expect(actors).toHaveLength(40);
    for (const field of ["id", "nombre", "pista"] as const) {
      expect(new Set(actors.map((a) => a[field])).size).toBe(40);
      expect(actors.every((a) => a[field].trim().length > 0)).toBe(true);
    }
  });
  it("reconstruye el cartón impreso con 9 nombres sin repetir", () => {
    expect(card(123, 4)).toEqual(card(123, 4));
    expect(card(123, 4)).not.toEqual(card(123, 5));
    expect(new Set(card(123, 4).map((a) => a.id)).size).toBe(9);
  });
  it("comprueba filas horizontales y cartón completo, sin contar columnas o diagonales", () => {
    const ids = card(55, 3).map((a) => a.id);
    expect(verdict(55, 3, []).missing).toBe(9);
    expect(verdict(55, 3, ids.slice(0, 3))).toMatchObject({
      lines: 1,
      bingo: false,
      missing: 6,
    });
    expect(verdict(55, 3, [ids[0], ids[3], ids[6]]).lines).toBe(0);
    expect(verdict(55, 3, [ids[0], ids[4], ids[8]]).lines).toBe(0);
    expect(verdict(55, 3, ids)).toMatchObject({
      lines: 3,
      bingo: true,
      missing: 0,
    });
  });
  it("abre partidas anteriores sin cambiar el bingo musical", () => {
    const state = initial(validateQuestions(bank));
    state.bingo.played = ["c01"];
    const { bingo6070: unused, ...old } = state;
    const loaded = validateState(old);
    expect(loaded.bingo).toEqual(state.bingo);
    expect(loaded.bingo6070.played).toEqual([]);
    loaded.phase = "bingo6070";
    loaded.bingo6070.played = [actors[0].id];
    expect(validateState(loaded).bingo6070).toEqual(loaded.bingo6070);
    expect(() =>
      validateState({
        ...loaded,
        bingo6070: { ...loaded.bingo6070, cards: 0 },
      }),
    ).toThrow();
  });
});
