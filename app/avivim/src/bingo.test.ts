import { describe, expect, it } from "vitest";
import { card, songs, verdict } from "./bingo";

describe("Bingo musical", () => {
  it("tiene 64 canciones sin repetir", () => {
    expect(songs).toHaveLength(64);
    expect(new Set(songs.map((s) => s.id)).size).toBe(64);
  });
  it("cada cartón sale siempre igual, con 9 canciones distintas", () => {
    const a = card(123, 7);
    expect(card(123, 7)).toEqual(a);
    expect(new Set(a.map((s) => s.id)).size).toBe(9);
    expect(card(123, 8)).not.toEqual(a);
  });
  it("verifica línea y bingo", () => {
    const c = card(55, 3).map((s) => s.id);
    expect(verdict(55, 3, []).missing).toBe(9);
    const line = verdict(55, 3, c.slice(0, 3));
    expect(line.lines).toBe(1);
    expect(line.bingo).toBe(false);
    expect(verdict(55, 3, c).bingo).toBe(true);
  });
});
