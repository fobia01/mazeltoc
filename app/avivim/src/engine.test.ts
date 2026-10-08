import { describe, it, expect } from "vitest";
import {
  initial,
  points,
  next,
  award,
  lockBets,
  validateQuestions,
  validateState,
  confirmResponse,
  revealShared,
} from "./engine";
import bank from "./questions.json";
describe("Motor de juego", () => {
  it("tiene 60 preguntas válidas, 48 argentinas y 12 judías", () => {
    const q = validateQuestions(bank);
    expect(q).toHaveLength(60);
    expect(q.filter((x) => x.category === "Cultura judía")).toHaveLength(12);
  });
  it("no repite preguntas", () => {
    let s = initial(validateQuestions(bank));
    s = next(s);
    const id = s.question!.id;
    s = next(s);
    expect(s.question!.id).not.toBe(id);
  });
  it("no permite puntajes negativos ni doble evaluación", () => {
    let s = next(initial(validateQuestions(bank)));
    s = award(s, s.selected, true);
    expect(s.teams[0].score).toBe(10);
    expect(() => award(s, s.selected, true)).toThrow();
    expect(points(s, s.selected, -100, "ajuste").teams[0].score).toBe(0);
  });
  it("bloquea apuestas antes de mostrar y liquida una sola vez", () => {
    let s = points(initial(validateQuestions(bank)), "equipo-0", 30, "inicio");
    s = {
      ...s,
      round: 6,
      bets: Object.fromEntries(
        s.teams.map((t) => [t.id, t.id === "equipo-0" ? 20 : 0]),
      ),
    };
    expect(() => next(s)).toThrow();
    s = next(lockBets(s));
    expect(() => award(s, "equipo-0", true)).toThrow();
    s = { ...s, revealed: true };
    s = award(s, "equipo-0", true);
    expect(s.teams[0].score).toBe(100);
    expect(() => award(s, "equipo-0", true)).toThrow();
  });
  it("rechaza apuestas fuera del saldo y resta apuestas perdidas", () => {
    let s = points(initial(validateQuestions(bank)), "equipo-0", 30, "inicio");
    s = {
      ...s,
      round: 6,
      bets: Object.fromEntries(
        s.teams.map((t) => [t.id, t.id === "equipo-0" ? 40 : 0]),
      ),
    };
    expect(() => lockBets(s)).toThrow();
    s.bets["equipo-0"] = 20;
    s = next(lockBets(s));
    s = award({ ...s, revealed: true }, "equipo-0", false);
    expect(s.teams[0].score).toBe(10);
  });
  it("valida duplicados y respuestas fuera de opciones", () => {
    expect(() => validateQuestions([bank[0], bank[0]])).toThrow();
    expect(() => validateQuestions([{ ...bank[0], answer: "otro" }])).toThrow();
  });
  it("consume el doble puntaje en una sola pregunta", () => {
    let s = next(initial(validateQuestions(bank)));
    s.teams[0].double = true;
    s = award(s, s.selected, true);
    expect(s.teams[0].score).toBe(20);
    expect(s.teams[0].double).toBe(false);
  });
});

it("recupera partidas válidas y rechaza archivos corruptos", () => {
  const s = initial(validateQuestions(bank));
  expect(validateState(JSON.parse(JSON.stringify(s))).teams).toHaveLength(4);
  expect(() => validateState({ ...s, timer: null })).toThrow();
});
it("el desempate permite puntuar solo a los empatados", () => {
  let s = next(initial(validateQuestions(bank)));
  s.tiebreak = ["equipo-0", "equipo-1"];
  expect(() => award(s, "equipo-2", true)).toThrow();
  expect(award(s, "equipo-0", true).teams[0].score).toBe(10);
});

it("en pantalla compartida se confirma antes de revelar y la respuesta queda bloqueada", () => {
  let s = next(initial(validateQuestions(bank)));
  expect(() => revealShared(s)).toThrow();
  s = confirmResponse(s, s.selected, s.question!.options[0]);
  expect(() =>
    confirmResponse(s, s.selected, s.question!.options[1]),
  ).toThrow();
  s = revealShared(s);
  expect(s.revealed).toBe(true);
  expect(() =>
    confirmResponse(s, s.selected, s.question!.options[1]),
  ).toThrow();
  expect(next(s).responses).toEqual({});
});
it("la final compartida exige respuestas de todos los equipos", () => {
  let s = initial(validateQuestions(bank));
  s = {
    ...s,
    round: 6,
    bets: Object.fromEntries(s.teams.map((t) => [t.id, 0])),
  };
  s = next(lockBets(s));
  s = confirmResponse(s, s.selected, s.question!.answer);
  expect(() => revealShared(s)).toThrow();
  for (const t of s.teams.slice(1))
    s = confirmResponse(s, t.id, s.question!.answer);
  expect(revealShared(s).revealed).toBe(true);
});
