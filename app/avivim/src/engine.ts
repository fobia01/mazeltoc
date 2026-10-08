export type Question = {
  id: string;
  round: number;
  category: string;
  difficulty: "fácil" | "media";
  text: string;
  options: string[];
  answer: string;
  explanation: string;
  points: number;
  duration: number;
  source: string;
  media?: string;
  mediaType?: "audio" | "image";
};
export type Team = {
  id: string;
  name: string;
  color: string;
  members: number;
  score: number;
  hints: number;
  double: boolean;
  history: { points: number; reason: string; at: string }[];
};
export type State = {
  version: number;
  teams: Team[];
  round: number;
  roundNames: string[];
  question: Question | null;
  used: string[];
  revealed: boolean;
  hint: boolean;
  phase: "welcome" | "playing" | "paused" | "results";
  selected: string;
  timer: { remaining: number; end: number | null };
  bets: Record<string, number>;
  locked: boolean;
  settled: string[];
  awarded: string[];
  wheel: string;
  wheelAngle: number;
  wheelHistory: { team: string; result: string; at: string }[];
  mediaPlaying: boolean;
  tiebreak: string[];
  volume: number;
  muted: boolean;
  motion: boolean;
  duration: number;
  notice: string;
  responses: Record<string, string>;
  bank: Question[];
};
export const rounds = [
  "¿Te acordás o te lo contaron?",
  "La música de nuestra vida",
  "¿Para qué servía esto?",
  "Verdadero o puro cuento",
  "Dígalo con mímica",
  "La gran final",
];
export function initial(bank: Question[]): State {
  return {
    version: 1,
    teams: [
      "Los Inoxidables",
      "Los Rebeldes",
      "Los Sabios",
      "Los Imparables",
    ].map((name, i) => ({
      id: `equipo-${i}`,
      name,
      color: ["#ffca43", "#27b8a1", "#f47583", "#a885e8"][i],
      members: 5,
      score: 0,
      hints: 1,
      double: false,
      history: [],
    })),
    round: 1,
    roundNames: rounds,
    question: null,
    used: [],
    revealed: false,
    hint: false,
    phase: "welcome",
    selected: "equipo-0",
    timer: { remaining: 45, end: null },
    bets: {},
    locked: false,
    settled: [],
    awarded: [],
    wheel: "",
    wheelAngle: 0,
    wheelHistory: [],
    mediaPlaying: false,
    tiebreak: [],
    volume: 0.35,
    muted: false,
    motion: true,
    duration: 45,
    notice: "",
    responses: {},
    bank,
  };
}
export function points(s: State, id: string, n: number, reason: string): State {
  if (!Number.isFinite(n)) throw Error("Puntaje inválido");
  return {
    ...s,
    teams: s.teams.map((t) =>
      t.id === id
        ? {
            ...t,
            score: Math.max(0, t.score + n),
            history: [
              ...t.history,
              {
                points: Math.max(0, t.score + n) - t.score,
                reason,
                at: new Date().toISOString(),
              },
            ],
          }
        : t,
    ),
  };
}
export function next(s: State): State {
  if (s.round === 6 && s.question)
    throw Error("Terminá esta pregunta y prepará nuevas apuestas.");
  if (s.round === 6 && !s.locked)
    throw Error(
      "Registrá y bloqueá las apuestas antes de mostrar la pregunta.",
    );
  const q = s.bank.find((q) => q.round === s.round && !s.used.includes(q.id));
  if (!q)
    throw Error(
      "No quedan preguntas en esta ronda. Agregá nuevas en el banco o elegí otra ronda.",
    );
  return {
    ...s,
    question: q,
    responses: {},
    mediaPlaying: false,
    notice: "",
    used: [...s.used, q.id],
    revealed: false,
    hint: false,
    phase: "playing",
    awarded: [],
    settled: [],
    timer: { remaining: s.duration || q.duration, end: null },
  };
}
export function lockBets(s: State): State {
  if (s.locked) throw Error("Las apuestas ya están bloqueadas.");
  for (const t of s.teams) {
    const b = s.bets[t.id];
    if (!Number.isInteger(b) || b < 0 || b > t.score)
      throw Error(`Apuesta inválida para ${t.name}: entre 0 y ${t.score}.`);
  }
  return { ...s, locked: true };
}
export function award(s: State, id: string, correct: boolean): State {
  if (s.tiebreak?.length && !s.tiebreak.includes(id))
    throw Error("En el desempate solo responden los equipos empatados.");
  if (!s.question)
    throw Error("Primero mostr á una pregunta.".replace("mostr á", "mostrá"));
  if (s.round === 6) {
    if (!s.locked || !s.revealed)
      throw Error("Revelá la respuesta antes de resolver las apuestas.");
    if (s.settled.includes(id)) throw Error("Este equipo ya fue evaluado.");
    return {
      ...points(
        s,
        id,
        correct ? s.bets[id] + s.question.points : -s.bets[id],
        correct ? "Final: acierto + apuesta" : "Final: apuesta perdida",
      ),
      settled: [...s.settled, id],
    };
  }
  if (s.awarded.includes(id))
    throw Error("Este equipo ya fue evaluado en esta pregunta.");
  const team = s.teams.find((t) => t.id === id)!;
  const result = points(
    s,
    id,
    correct ? s.question.points * (team.double ? 2 : 1) : 0,
    correct ? "Respuesta correcta" : "Respuesta incorrecta",
  );
  return {
    ...result,
    awarded: [...s.awarded, id],
    teams: result.teams.map((t) => (t.id === id ? { ...t, double: false } : t)),
  };
}
export function validateQuestions(value: unknown): Question[] {
  if (!Array.isArray(value) || !value.length)
    throw Error("El JSON debe ser una lista de preguntas.");
  const ids = new Set<string>();
  return value.map((q) => {
    if (
      !q ||
      typeof q.id !== "string" ||
      !q.id.trim() ||
      ids.has(q.id) ||
      !Number.isInteger(q.round) ||
      q.round < 1 ||
      typeof q.text !== "string" ||
      !q.text.trim() ||
      typeof q.answer !== "string" ||
      !q.answer.trim() ||
      typeof q.explanation !== "string" ||
      typeof q.source !== "string" ||
      !Array.isArray(q.options) ||
      q.options.some((o: unknown) => typeof o !== "string") ||
      (q.options.length > 0 && !q.options.includes(q.answer)) ||
      !Number.isFinite(q.points) ||
      q.points < 0 ||
      q.points > 50 ||
      !Number.isFinite(q.duration) ||
      q.duration < 10 ||
      q.duration > 300 ||
      !["fácil", "media"].includes(q.difficulty) ||
      typeof q.category !== "string"
    )
      throw Error(
        "Pregunta inválida o ID duplicado. Revisá opciones, respuesta, puntos (0–50) y duración (10–300).",
      );
    ids.add(q.id);
    return q as Question;
  });
}
export function validateState(value: unknown): State {
  const s = value as State;
  if (!s || s.version !== 1) throw Error("Formato de partida inválido.");
  const bank = validateQuestions(s.bank);
  if (
    s.responses &&
    (typeof s.responses !== "object" ||
      Array.isArray(s.responses) ||
      Object.values(s.responses).some((r) => typeof r !== "string"))
  )
    throw Error("Respuestas guardadas inválidas.");
  if (
    s.tiebreak &&
    (!Array.isArray(s.tiebreak) ||
      s.tiebreak.some((x) => typeof x !== "string"))
  )
    throw Error("Desempate inválido.");
  if (
    s.wheelHistory &&
    (!Array.isArray(s.wheelHistory) ||
      s.wheelHistory.some(
        (h) =>
          !h ||
          typeof h.team !== "string" ||
          typeof h.result !== "string" ||
          typeof h.at !== "string",
      ))
  )
    throw Error("Historial de ruleta inválido.");
  if (
    !Array.isArray(s.teams) ||
    s.teams.length < 2 ||
    s.teams.length > 8 ||
    new Set(s.teams.map((t) => t.id)).size !== s.teams.length ||
    s.teams.some(
      (t) =>
        !t ||
        typeof t.id !== "string" ||
        typeof t.name !== "string" ||
        !t.name.trim() ||
        !/^#[0-9a-f]{6}$/i.test(t.color) ||
        !Number.isFinite(t.score) ||
        t.score < 0 ||
        !Number.isInteger(t.members) ||
        t.members < 1 ||
        !Number.isInteger(t.hints) ||
        t.hints < 0 ||
        !Array.isArray(t.history) ||
        t.history.some(
          (h) =>
            !Number.isFinite(h.points) ||
            typeof h.reason !== "string" ||
            typeof h.at !== "string",
        ),
    )
  )
    throw Error("Los equipos de la partida son inválidos.");
  if (
    !Array.isArray(s.roundNames) ||
    !s.roundNames.length ||
    s.roundNames.some((n) => typeof n !== "string" || !n.trim()) ||
    !Number.isInteger(s.round) ||
    s.round < 1 ||
    s.round > s.roundNames.length ||
    !["welcome", "playing", "paused", "results"].includes(s.phase) ||
    !s.teams.some((t) => t.id === s.selected)
  )
    throw Error("Ronda o estado de partida inválido.");
  for (const field of ["used", "settled", "awarded"] as const)
    if (!Array.isArray(s[field]) || s[field].some((x) => typeof x !== "string"))
      throw Error("Historial de partida inválido.");
  if (
    !s.timer ||
    !Number.isFinite(s.timer.remaining) ||
    s.timer.remaining < 0 ||
    (s.timer.end !== null && !Number.isFinite(s.timer.end)) ||
    !Number.isFinite(s.duration) ||
    s.duration < 10 ||
    s.duration > 300 ||
    !Number.isFinite(s.volume) ||
    s.volume < 0 ||
    s.volume > 1 ||
    typeof s.muted !== "boolean" ||
    typeof s.motion !== "boolean" ||
    typeof s.locked !== "boolean" ||
    typeof s.revealed !== "boolean" ||
    typeof s.hint !== "boolean" ||
    typeof s.wheel !== "string" ||
    !Number.isFinite(s.wheelAngle) ||
    !s.bets ||
    typeof s.bets !== "object" ||
    Object.values(s.bets).some((b) => !Number.isInteger(b) || b < 0)
  )
    throw Error("Controles o apuestas inválidos.");
  if (s.locked && s.teams.some((t) => !Number.isInteger(s.bets[t.id])))
    throw Error("Faltan apuestas bloqueadas.");
  if (s.question) validateQuestions([s.question]);
  return { ...initial(bank), ...s, bank, mediaPlaying: false };
}

export function confirmResponse(s: State, id: string, response: string): State {
  if (!s.question || s.revealed)
    throw Error("La respuesta debe confirmarse antes de revelar la solución.");
  if (!s.teams.some((t) => t.id === id)) throw Error("Equipo inválido.");
  if (s.tiebreak.length && !s.tiebreak.includes(id))
    throw Error("Este equipo no participa del desempate.");
  if (s.responses[id])
    throw Error("La respuesta de este equipo ya está confirmada.");
  if (s.question.options.length && !s.question.options.includes(response))
    throw Error("Elegí una de las opciones.");
  if (!response.trim()) throw Error("Primero registrá una respuesta.");
  return { ...s, responses: { ...s.responses, [id]: response.trim() } };
}
export function revealShared(s: State): State {
  if (!s.question) throw Error("Primero mostrá una pregunta.");
  const required =
    s.round === 6
      ? s.teams.map((t) => t.id)
      : s.tiebreak.length
        ? s.tiebreak
        : [s.selected];
  if (required.some((id) => !s.responses[id]))
    throw Error("Falta confirmar la respuesta de los equipos que participan.");
  return {
    ...s,
    revealed: true,
    timer: {
      remaining: s.timer.end
        ? Math.max(0, Math.ceil((s.timer.end - Date.now()) / 1000))
        : s.timer.remaining,
      end: null,
    },
  };
}
