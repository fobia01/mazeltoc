import { useState } from "react";
import {
  confirmResponse,
  revealShared,
  award,
  lockBets,
  type State,
} from "../engine";
export function SharedControls({
  state,
  remaining,
  change,
  next,
  round,
  finish,
}: {
  state: State;
  remaining: number;
  change: (fn: (s: State) => State, effect?: string) => void;
  next: () => void;
  round: (n: number) => void;
  finish: () => void;
}) {
  const [choice, setChoice] = useState("");
  const q = state.question;
  const team = state.teams.find((t) => t.id === state.selected)!;
  const confirmed = state.responses?.[team.id];
  const evaluated = state.round === 6 ? state.settled : state.awarded;
  const required =
    state.round === 6
      ? state.teams.map((t) => t.id)
      : state.tiebreak.length
        ? state.tiebreak
        : [state.selected];
  const ready = !!q && required.every((id) => state.responses?.[id]);
  function result(correct: boolean) {
    change(
      (s) => ({
        ...award(s, team.id, correct),
        notice: correct
          ? `¡Bien, ${team.name}! Respuesta correcta.`
          : `Esta vez no salió, ${team.name}. ¡Seguimos jugando!`,
      }),
      correct ? "correct" : "wrong",
    );
  }
  return (
    <section
      className="shared-controls"
      aria-label="Controles de juego compartido"
    >
      <div className="shared-control-row">
        <label>
          Ronda
          <select
            aria-label="Ronda"
            value={state.round}
            onChange={(e) => {
              setChoice("");
              round(+e.target.value);
            }}
          >
            {state.roundNames.map((name, i) => (
              <option key={i} value={i + 1}>
                {i + 1}. {name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Equipo que responde
          <select
            aria-label="Equipo que responde"
            value={state.selected}
            onChange={(e) => {
              setChoice("");
              change((s) => ({ ...s, selected: e.target.value }));
            }}
          >
            {state.teams
              .filter(
                (t) => !state.tiebreak.length || state.tiebreak.includes(t.id),
              )
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
          </select>
        </label>
        <button
          className="primary"
          disabled={state.round === 6 && !!q}
          onClick={() => {
            setChoice("");
            if (state.phase === "welcome")
              change((s) => ({ ...s, phase: "playing" }), "start");
            else next();
          }}
        >
          {state.phase === "welcome"
            ? "Iniciar el programa"
            : "Mostrar siguiente pregunta"}
        </button>
      </div>
      {state.round === 6 && !q && (
        <div className="shared-bets">
          <h2>Apuestas antes de ver la pregunta</h2>
          <div className="team-grid">
            {state.teams.map((t) => (
              <label key={t.id}>
                {t.name} · saldo {t.score}
                <input
                  type="number"
                  min={0}
                  max={t.score}
                  disabled={state.locked}
                  value={state.bets[t.id] ?? 0}
                  onChange={(e) =>
                    change((s) => ({
                      ...s,
                      bets: { ...s.bets, [t.id]: +e.target.value },
                    }))
                  }
                />
              </label>
            ))}
          </div>
          <button
            disabled={state.locked}
            onClick={() =>
              change((s) =>
                lockBets({
                  ...s,
                  bets: Object.fromEntries(
                    s.teams.map((t) => [t.id, s.bets[t.id] ?? 0]),
                  ),
                }),
              )
            }
          >
            {state.locked ? "Apuestas bloqueadas" : "Bloquear apuestas"}
          </button>
        </div>
      )}
      {q && (
        <>
          {state.round === 6 && !state.revealed && (
            <p>
              Todos los equipos escriben su respuesta en papel al mismo tiempo.
              Recogé las respuestas antes de registrarlas aquí.
            </p>
          )}
          <div className="shared-answer-row">
            {q.options.length > 0 ? (
              <label>
                Respuesta del equipo
                <select
                  key={q.id + team.id}
                  aria-label="Respuesta del equipo"
                  disabled={!!confirmed || state.revealed}
                  value={confirmed || choice}
                  onChange={(e) => setChoice(e.target.value)}
                >
                  <option value="">Elegí A, B o C</option>
                  {q.options.map((o, i) => (
                    <option key={o} value={o}>
                      {"ABC"[i]}. {o}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <p>
                {state.round === 5
                  ? "Entregá la tarjeta de mímica indicada al participante. El equipo responde en voz alta."
                  : "El equipo responde en voz alta."}
              </p>
            )}
            <button
              disabled={
                !!confirmed ||
                state.revealed ||
                (q.options.length > 0 && !q.options.includes(choice))
              }
              onClick={() =>
                change((s) =>
                  confirmResponse(
                    s,
                    team.id,
                    q.options.length ? choice : "Respuesta oral confirmada",
                  ),
                )
              }
            >
              {confirmed ? "✓ Respuesta confirmada" : "Confirmar respuesta"}
            </button>
            <button
              className="reveal-button"
              disabled={!ready || state.revealed}
              onClick={() => change(revealShared)}
            >
              {state.revealed ? "Solución revelada" : "Revelar respuesta"}
            </button>
          </div>
          <div className="confirmed-teams" aria-live="polite">
            {state.teams
              .filter((t) => state.responses?.[t.id])
              .map((t) => (
                <span key={t.id}>
                  ✓ {t.name}: {state.responses[t.id]}
                </span>
              ))}
          </div>
          {state.revealed && (
            <div className="shared-control-row">
              {q.options.length > 0 ? (
                <button
                  disabled={!confirmed || evaluated.includes(team.id)}
                  className="success"
                  onClick={() => result(confirmed === q.answer)}
                >
                  {evaluated.includes(team.id)
                    ? "Puntaje registrado"
                    : "Registrar resultado del equipo"}
                </button>
              ) : (
                <>
                  <button
                    disabled={!confirmed || evaluated.includes(team.id)}
                    className="success"
                    onClick={() => result(true)}
                  >
                    Acierto
                  </button>
                  <button
                    disabled={!confirmed || evaluated.includes(team.id)}
                    className="wrong-button"
                    onClick={() => result(false)}
                  >
                    Error
                  </button>
                </>
              )}
              {state.round === 6 && (
                <button
                  disabled={state.settled.length !== state.teams.length}
                  onClick={() =>
                    change((s) => ({
                      ...s,
                      question: null,
                      responses: {},
                      revealed: false,
                      locked: false,
                      bets: {},
                      settled: [],
                    }))
                  }
                >
                  Preparar otra pregunta final
                </button>
              )}
            </div>
          )}
        </>
      )}
      <div className="shared-control-row">
        <button
          onClick={() =>
            change((s) => ({
              ...s,
              timer: s.timer.end
                ? { remaining, end: null }
                : { remaining, end: Date.now() + remaining * 1000 },
            }))
          }
        >
          {state.timer.end ? "Pausar reloj" : "Iniciar reloj"}
        </button>
        <button
          onClick={() =>
            change((s) => ({
              ...s,
              timer: { remaining: s.duration, end: null },
            }))
          }
        >
          Reiniciar reloj
        </button>
        <label>
          Tiempo
          <select
            value={state.duration}
            onChange={(e) =>
              change((s) => ({
                ...s,
                duration: +e.target.value,
                timer: { remaining: +e.target.value, end: null },
              }))
            }
          >
            {[30, 45, 60, 90, 120].map((n) => (
              <option key={n} value={n}>
                {n} segundos
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={() =>
            change((s) => ({
              ...s,
              phase: s.phase === "paused" ? "playing" : "paused",
              timer: { remaining, end: null },
            }))
          }
        >
          {state.phase === "paused" ? "Continuar partida" : "Pausar programa"}
        </button>
        <button onClick={finish}>Finalizar y ver resultados</button>
        <button
          className="cheer-button"
          onClick={() => change((s) => s, "applause")}
        >
          👏 ¡Ovación!
        </button>
        <button className="boo-button" onClick={() => change((s) => s, "boo")}>
          📣 ¡Buuu!
        </button>
      </div>
    </section>
  );
}
