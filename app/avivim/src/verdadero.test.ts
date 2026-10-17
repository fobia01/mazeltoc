import { describe, expect, it } from "vitest";
import { validateQuestions } from "./engine";
import bank from "./questions.json";
import original from "./respaldos/verdadero-o-puro-cuento-original.json";

const round = validateQuestions(bank).filter((q) => q.round === 4);

describe("Verdadero o puro cuento", () => {
  it("tiene 12 preguntas: mitad verdaderas y mitad falsas", () => {
    expect(round).toHaveLength(12);
    expect(round.filter((q) => q.answer === "Verdadero")).toHaveLength(6);
    expect(round.filter((q) => q.answer === "Puro cuento")).toHaveLength(6);
  });
  it("cada pregunta tiene explicación, fuente y las dos opciones", () => {
    for (const q of round) {
      expect(q.options).toEqual(["Verdadero", "Puro cuento"]);
      expect(q.explanation.length).toBeGreaterThan(30);
      expect(q.source.trim()).not.toBe("");
    }
  });
  it("la copia de seguridad guarda las 12 originales con los mismos lugares", () => {
    expect(original).toHaveLength(12);
    expect(original.map((q) => q.id)).toEqual(round.map((q) => q.id));
    expect(original.every((o, i) => o.text !== round[i].text)).toBe(true);
  });
});
