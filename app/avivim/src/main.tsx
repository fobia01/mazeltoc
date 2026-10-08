import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Tv,
  Play,
  Pause,
  RotateCcw,
  Trophy,
  Settings,
  BookOpen,
  Printer,
  Volume2,
  VolumeX,
  ArrowRight,
  Monitor,
  Check,
  X,
  Save,
  Download,
  Upload,
  Users,
  Disc3,
  Star,
} from "lucide-react";
import {
  initial,
  next,
  points,
  award,
  lockBets,
  validateQuestions,
  validateState,
  type State,
  type Question,
} from "./engine";
import { KEY, read, save, download, putMedia } from "./storage";
import { Media } from "./components/Media";
import { SharedControls } from "./components/SharedControls";
import { PrintMaterials } from "./components/PrintMaterials";
import { sound, activateSound, soundSettings } from "./audio";
import { Bunting, Confetti } from "./components/Festive";
import raw from "./questions.json";
import { photoFor, photos } from "./photos";
import "./style.css";
const sharedMode =
  !new URLSearchParams(location.search).has("conductor") &&
  !new URLSearchParams(location.search).has("public");
const publicMode = new URLSearchParams(location.search).has("public");
const choices = [
  "Ganás 10 puntos",
  "Pregunta sorpresa",
  "Doble puntaje",
  "Robale una pregunta",
  "Todos cantan",
  "Contá una anécdota",
  "Elegí otro equipo",
  "Comodín de pista",
];
const channel =
  typeof BroadcastChannel !== "undefined"
    ? new BroadcastChannel("mazal-avivim")
    : null;
function App() {
  const [state, setState] = useState<State>(
    () => read() || initial(validateQuestions(raw)),
  );
  const current = useRef(state);
  const soundEvents = useRef(new Set<string>());
  current.current = state;
  const [tab, setTab] = useState("show");
  const [soundReady, setSoundReady] = useState(false);
  const [textScale, setTextScale] = useState(
    () => localStorage.getItem("mazal-text-size") || "large",
  );
  useEffect(() => {
    document.documentElement.dataset.textSize = textScale;
    localStorage.setItem("mazal-text-size", textScale);
  }, [textScale]);
  useEffect(
    () => soundSettings(state.volume, state.muted),
    [state.volume, state.muted],
  );
  const [error, setError] = useState(() =>
    localStorage.getItem(KEY) && !read()
      ? "El guardado local no es válido. Recuperá una copia de la partida desde Configuración."
      : "",
  );
  const [tick, setTick] = useState(Date.now());
  const [edit, setEdit] = useState<Question | null>(null);
  const [filter, setFilter] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [wheelOptions, setWheelOptions] = useState<string[]>(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("mazal-wheel") || "null") || choices
      );
    } catch {
      return choices;
    }
  });
  const [install, setInstall] = useState<any>(null);
  const [offline, setOffline] = useState(false);
  const [importKind, setImportKind] = useState<"bank" | "game">("bank");
  const fileInput = useRef<HTMLInputElement>(null);
  const remaining = state.timer.end
    ? Math.max(0, Math.ceil((state.timer.end - tick) / 1000))
    : state.timer.remaining;
  function change(fn: (s: State) => State, effect?: string) {
    try {
      const s = fn(current.current);
      save(s);
      current.current = s;
      setState(s);
      const eventId = effect ? crypto.randomUUID() : undefined;
      channel?.postMessage({ state: s, effect, eventId });
      if (effect) {
        try {
          localStorage.setItem(
            KEY + "-sound",
            JSON.stringify({
              effect,
              eventId,
              volume: s.volume,
              muted: s.muted,
            }),
          );
        } catch {
          /* El efecto es opcional; la partida ya está guardada. */
        }
      }
      if (effect) sound(effect, s.volume, s.muted);
      setError("");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No se pudo guardar. Revisá el espacio disponible.",
      );
    }
  }
  useEffect(() => {
    const id = setInterval(() => setTick(Date.now()), 250);
    function receive(s: State) {
      if (s?.version === 1) {
        setState(s);
      }
    }
    function receiveSound(
      kind: string,
      eventId: string,
      volume: number,
      muted: boolean,
    ) {
      if (!publicMode || soundEvents.current.has(eventId)) return;
      soundEvents.current.add(eventId);
      if (soundEvents.current.size > 100)
        soundEvents.current.delete(soundEvents.current.values().next().value!);
      sound(kind, volume, muted);
    }
    const listener = (e: MessageEvent) => {
      const s = e.data.state || e.data;
      receive(s);
      if (e.data.effect)
        receiveSound(e.data.effect, e.data.eventId, s.volume, s.muted);
    };
    channel?.addEventListener("message", listener);
    const storage = (e: StorageEvent) => {
      if (e.key === KEY + "-sound" && e.newValue) {
        try {
          const event = JSON.parse(e.newValue);
          receiveSound(event.effect, event.eventId, event.volume, event.muted);
        } catch {}
      }
      if (e.key === "mazal-text-size" && e.newValue) setTextScale(e.newValue);
      if (e.key === KEY && e.newValue) {
        try {
          receive(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener("storage", storage);
    const handler = (e: Event) => {
      e.preventDefault();
      setInstall(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    if ("serviceWorker" in navigator && import.meta.env.PROD)
      navigator.serviceWorker
        .register("./sw.js")
        .then(() => navigator.serviceWorker.ready)
        .then(() => setOffline(!!navigator.serviceWorker.controller));
    return () => {
      clearInterval(id);
      channel?.removeEventListener("message", listener);
      window.removeEventListener("storage", storage);
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);
  useEffect(() => {
    if (!publicMode && state.timer.end && remaining === 0)
      change((s) => ({ ...s, timer: { remaining: 0, end: null } }), "timer");
  }, [remaining, state.timer.end]);
  const team =
    state.teams.find((t) => t.id === state.selected) || state.teams[0];
  const leaders = [...state.teams].sort((a, b) => b.score - a.score);
  const tied = leaders.filter((t) => t.score === leaders[0].score);
  function newQuestion() {
    change((s) => next(s), "round");
  }
  function chooseRound(round: number) {
    change(
      (s) => ({
        ...s,
        round,
        responses: {},
        tiebreak: [],
        question: null,
        revealed: false,
        hint: false,
        locked: false,
        bets: {},
        settled: [],
        timer: { remaining: s.duration, end: null },
        phase: "playing",
      }),
      "round",
    );
  }
  function spin() {
    if (spinning || !wheelOptions.length || wheelOptions.some((o) => !o.trim()))
      return;
    setSpinning(true);
    const index =
      crypto.getRandomValues(new Uint32Array(1))[0] % wheelOptions.length;
    const result = wheelOptions[index];
    change(
      (s) => ({
        ...s,
        wheel: "",
        wheelAngle:
          s.wheelAngle + 1440 + 360 - (index * 360) / wheelOptions.length,
      }),
      "wheel",
    );
    setTimeout(
      () => {
        change((s) => {
          let n = {
            ...s,
            wheel: result,
            wheelHistory: [
              ...(s.wheelHistory || []),
              { team: team.name, result, at: new Date().toISOString() },
            ],
            notice: `${team.name}: ${result}`,
          };
          if (result === "Ganás 10 puntos")
            n = points(n, team.id, 10, "Ruleta");
          if (result === "Doble puntaje")
            n = {
              ...n,
              teams: n.teams.map((t) =>
                t.id === team.id ? { ...t, double: true } : t,
              ),
            };
          if (result === "Comodín de pista")
            n = {
              ...n,
              teams: n.teams.map((t) =>
                t.id === team.id ? { ...t, hints: t.hints + 1 } : t,
              ),
            };
          return n;
        }, "correct");
        setSpinning(false);
      },
      state.motion ? 2600 : 100,
    );
  }
  function finish() {
    if (
      state.round === 6 &&
      state.question &&
      state.settled.length < state.teams.length
    ) {
      setError("Resolvé primero las apuestas de todos los equipos.");
      return;
    }
    change(
      (s) => ({
        ...s,
        phase: "results",
        mediaPlaying: false,
        timer: { remaining: remaining, end: null },
      }),
      "winner",
    );
  }
  function stage() {
    return (
      <section
        className={"stage " + (publicMode || sharedMode ? "public-stage" : "")}
        aria-label="Pantalla del público"
      >
        <Bunting />
        <div className="stage-top">
          <span className="live">
            <i />{" "}
            {state.phase === "playing"
              ? "MAZAL TOC AVIVIM · EN JUEGO"
              : "AVIVIM · BET AM DEL OESTE"}
          </span>
          <span>
            RONDA {String(state.round).padStart(2, "0")} /{" "}
            {state.roundNames.length}
          </span>
        </div>
        {state.phase === "welcome" ? (
          <div className="welcome">
            <div className="star-mark" aria-hidden="true">
              🎉
            </div>
            <p className="eyebrow">UN ENCUENTRO PARA RECORDAR</p>
            <h1>
              MAZAL TOC
              <br />
              <em>AVIVIM</em>
            </h1>
            <p className="tagline">¡El pasado vuelve a jugar!</p>
            <div className="welcome-rule" />
            <p>
              {state.teams.length} equipos. Mil recuerdos.
              <br />
              Una tarde para compartir.
            </p>
          </div>
        ) : state.phase === "paused" ? (
          <div className="welcome">
            <Pause size={60} />
            <h1>
              Una pausa
              <br />
              <em>para disfrutar</em>
            </h1>
            <p>Ya volvemos a jugar.</p>
          </div>
        ) : state.phase === "results" ? (
          <div className="welcome results">
            <Trophy size={64} />
            <p className="eyebrow">
              {tied.length > 1 ? "¡HAY EMPATE!" : "EL GRAN APLAUSO ES PARA"}
            </p>
            <h1>{tied.map((t) => t.name).join(" · ")}</h1>
            <p className="tagline">{leaders[0].score} puntos</p>
            <p>
              {tied.length > 1
                ? "El conductor preparará una pregunta de desempate."
                : "¡Gracias por compartir esta tarde de recuerdos!"}
            </p>
            {state.motion && tied.length === 1 && <Confetti />}
          </div>
        ) : (
          <div
            className={
              "question-stage " +
              (state.question?.round === 3 ? "object-game" : "")
            }
          >
            <p className="eyebrow">{state.roundNames[state.round - 1]}</p>
            {state.question ? (
              <>
                <h2>
                  {state.round === 5 && !state.revealed
                    ? "¡Dígalo con mímica! Adivinen la consigna."
                    : state.round === 3 && photoFor(state.question)
                      ? "Mirá la foto: ¿para qué se usaba?"
                      : state.question.text}
                </h2>
                {state.round === 5 && !state.revealed && (
                  <p className="mime-card-code">
                    Tarjeta de mímica M
                    {state.question.id.replace(/[^0-9]/g, "")} · Entregala en
                    papel, sin mostrar la consigna.
                  </p>
                )}
                <div className="question-body">
                  {state.round !== 5 && (
                    <div className="options">
                      {state.question.options.map((o, i) => (
                        <div
                          key={o}
                          className={
                            state.revealed && o === state.question?.answer
                              ? "correct-option"
                              : ""
                          }
                        >
                          <b>{"ABC"[i] || i + 1}</b>
                          <span>{o}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {(state.round !== 5 || state.revealed) && (
                    <Media
                      q={state.question}
                      volume={state.volume}
                      muted={state.muted}
                      playing={state.mediaPlaying}
                    />
                  )}
                </div>
                {state.hint && !state.revealed && (
                  <p className="hint">
                    Pista: {state.question.category} · empieza con «
                    {state.question.answer.charAt(0)}»
                  </p>
                )}
                {state.revealed && (
                  <div className="reveal">
                    <Check /> {state.question.answer}
                    <p>{state.question.explanation}</p>
                  </div>
                )}
                <div className={"timer " + (remaining <= 10 ? "low" : "")}>
                  <span>{remaining}</span>
                  <small>segundos</small>
                  <progress max={state.duration} value={remaining} />
                </div>
              </>
            ) : (
              <div className="ready">
                <Star size={48} />
                <h2>
                  {state.round === 6
                    ? "Las apuestas se preparan en el panel del conductor."
                    : "¡Preparen los recuerdos!"}
                </h2>
                <p>Enseguida llega el próximo desafío.</p>
              </div>
            )}
          </div>
        )}
        {state.notice && state.notice !== `${team.name}: ${state.wheel}` && (
          <div
            className={
              "feedback " +
              (state.notice.startsWith("¡Bien") ? "is-correct" : "is-wrong")
            }
            role="status"
          >
            {state.notice}
          </div>
        )}
        {state.wheel && (
          <div className="wheel-banner">✦ RULETA MAZAL TOC · {state.wheel}</div>
        )}
        <div className="scoreboard">
          {state.teams.map((t) => (
            <div
              key={t.id}
              className={
                state.selected === t.id && state.phase === "playing"
                  ? "active-team"
                  : ""
              }
              style={{ "--team": t.color } as React.CSSProperties}
            >
              <span className="team-dot" />
              <span>{t.name}</span>
              <strong>{t.score}</strong>
              <div
                className="score-bar"
                style={{
                  width: `${Math.max(5, (t.score / Math.max(1, ...state.teams.map((x) => x.score))) * 100)}%`,
                }}
              />
            </div>
          ))}
        </div>
      </section>
    );
  }
  async function importFile(file: File) {
    try {
      const v = JSON.parse(await file.text());
      if (importKind === "bank") {
        const bank = validateQuestions(v);
        change((s) => ({ ...s, bank }));
      } else {
        const restored = validateState(v);
        change(() => restored);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Archivo inválido");
    }
  }
  if (sharedMode)
    return (
      <main className={"shared-game " + (!state.motion ? "no-motion" : "")}>
        <header>
          <span className="brand">🎉 MAZAL TOC AVIVIM</span>
          <span className="shared-safe">
            Pantalla compartida · soluciones ocultas hasta revelar
          </span>
          <button
            onClick={() => {
              if (
                confirm(
                  "La preparación contiene soluciones y tarjetas privadas. Dejá de proyectar antes de abrirla. ¿Continuar?",
                )
              )
                location.href = "./?conductor=1";
            }}
          >
            Preparar equipos y materiales
          </button>
        </header>
        {error && (
          <div role="alert" className="error">
            {error}
            <button onClick={() => setError("")}>Cerrar</button>
          </div>
        )}
        {stage()}
        <SharedControls
          state={state}
          remaining={remaining}
          change={change}
          next={newQuestion}
          round={chooseRound}
          finish={finish}
        />
        {state.phase === "results" && tied.length > 1 && (
          <button
            onClick={() =>
              change((s) => {
                const q = s.bank.find(
                  (q) => q.round < 5 && !s.used.includes(q.id),
                );
                if (!q) throw Error("Agregá una pregunta de desempate.");
                return next({
                  ...s,
                  round: q.round,
                  question: null,
                  locked: false,
                  tiebreak: tied.map((t) => t.id),
                  selected: tied[0].id,
                });
              })
            }
          >
            Mostrar pregunta de desempate
          </button>
        )}
      </main>
    );
  if (publicMode)
    return (
      <main className={"projection " + (!state.motion ? "no-motion" : "")}>
        <button
          className="enable-sound"
          onClick={async () => {
            await activateSound(state.volume, state.muted);
            setSoundReady(true);
            sound("start", state.volume, state.muted);
          }}
        >
          {soundReady ? "✓ Sonido activado" : "🔊 Activar sonido del público"}
        </button>
        {stage()}
      </main>
    );
  return (
    <div className={!state.motion ? "no-motion" : ""}>
      <header>
        <a className="brand" href="./?conductor=1">
          <span className="brand-icon">
            <img src="./images/logo-bet-am.jpg" alt="Bet Am del Oeste" />
          </span>
          <span>
            MAZAL TOC <b>AVIVIM</b>
            <small>¡El pasado vuelve a jugar!</small>
          </span>
        </a>
        <div className="header-actions">
          <span className="local-badge">● Panel privado · no proyectar</span>
          <button onClick={() => (location.href = "./")}>
            Proyectar juego compartido
          </button>
          <button
            onClick={() =>
              window.open(
                "./?public=1",
                "mazal-public",
                "width=1280,height=720",
              )
            }
          >
            <Monitor size={18} /> Abrir pantalla pública
          </button>
          <button
            aria-label={state.muted ? "Activar sonido" : "Silenciar"}
            onClick={() => change((s) => ({ ...s, muted: !s.muted }))}
          >
            {state.muted ? <VolumeX /> : <Volume2 />}
          </button>
        </div>
      </header>
      <div className="layout">
        <aside>
          <p className="eyebrow">DETRÁS DE ESCENA</p>
          {[
            ["show", "El programa", Tv],
            ["teams", "Los equipos", Users],
            ["bank", "Banco de preguntas", BookOpen],
            ["wheel", "Ruleta Mazal Toc", Disc3],
            ["print", "Para imprimir", Printer],
            ["settings", "Configuración", Settings],
          ].map(([id, label, Icon]) => (
            <button
              className={tab === id ? "nav active" : "nav"}
              key={id as string}
              onClick={() => setTab(id as string)}
            >
              {React.createElement(Icon as typeof Tv, { size: 20 })}
              {label as string}
              {tab === id && <span>›</span>}
            </button>
          ))}
          <div className="aside-note">
            <Star size={25} />
            <b>El encuentro es el premio.</b>
            <p>Jugamos para compartir, recordar y pasarla bien.</p>
          </div>
          <div className="aside-bottom">
            BET AM DEL OESTE
            <br />
            <b>COMUNIDAD AVIVIM</b>
          </div>
        </aside>
        <main className="workspace">
          {error && (
            <div role="alert" className="error">
              {error}
              <button onClick={() => setError("")}>Cerrar</button>
            </div>
          )}
          <input
            type="file"
            accept="application/json,.json"
            hidden
            ref={fileInput}
            onChange={(e) => {
              if (e.target.files?.[0]) void importFile(e.target.files[0]);
              e.target.value = "";
            }}
          />
          {tab === "show" ? (
            <>
              <div className="page-heading">
                <div>
                  <p className="eyebrow">TODO LISTO PARA UNA GRAN TARDE</p>
                  <h1>Que empiece el programa.</h1>
                  <p>Vos conducís. Los recuerdos hacen el resto.</p>
                </div>
                <span className="session">
                  <span /> PARTIDA{" "}
                  {state.phase === "welcome"
                    ? "PREPARADA"
                    : state.phase === "paused"
                      ? "EN PAUSA"
                      : "EN CURSO"}
                </span>
              </div>
              <div className="show-grid">
                <div>
                  <div className="preview-label">
                    <span>
                      <Monitor size={16} /> VISTA DEL PÚBLICO
                    </span>
                    <span>16:9 · SIN RESPUESTAS OCULTAS A LA VISTA</span>
                  </div>
                  {stage()}
                  <div className="round-strip">
                    {state.roundNames.map((n, i) => (
                      <button
                        key={i}
                        title={n}
                        className={state.round === i + 1 ? "selected" : ""}
                        onClick={() => chooseRound(i + 1)}
                      >
                        <span>{String(i + 1).padStart(2, "0")}</span>
                        {[
                          "Recuerdos",
                          "Música",
                          "Objetos",
                          "Verdad o cuento",
                          "Mímica",
                          "Gran final",
                        ][i] || n}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="control-card">
                  <div className="card-heading">
                    <span className="eyebrow">TU PANEL DE CONTROL</span>
                    <Settings size={18} />
                  </div>
                  <h2>
                    {state.phase === "welcome"
                      ? "¿Estamos todos?"
                      : "Al mando del juego"}
                  </h2>
                  <p className="muted">
                    Elegí el equipo y acompañá cada desafío.
                  </p>
                  <label>
                    Equipo que responde
                    <select
                      value={state.selected}
                      onChange={(e) =>
                        change((s) => ({ ...s, selected: e.target.value }))
                      }
                    >
                      {state.teams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    className="primary"
                    onClick={() => {
                      if (state.phase === "welcome")
                        change((s) => ({ ...s, phase: "playing" }), "start");
                      else newQuestion();
                    }}
                  >
                    <Play size={19} />
                    {state.phase === "welcome"
                      ? "Iniciar el programa"
                      : "Mostrar siguiente pregunta"}
                    <ArrowRight size={18} />
                  </button>
                  {state.question && (
                    <>
                      {state.question.mediaType === "audio" && (
                        <button
                          className="full"
                          onClick={() =>
                            change((s) => ({
                              ...s,
                              mediaPlaying: !s.mediaPlaying,
                            }))
                          }
                        >
                          {state.mediaPlaying ? (
                            <Pause size={17} />
                          ) : (
                            <Play size={17} />
                          )}{" "}
                          {state.mediaPlaying
                            ? "Pausar audio"
                            : "Reproducir audio local"}
                        </button>
                      )}
                      <div className="private-answer">
                        <small>SOLO PARA EL CONDUCTOR</small>
                        <b>
                          {state.round === 5
                            ? state.question.text
                            : state.question.answer}
                        </b>
                        <p>{state.question.explanation}</p>
                      </div>
                      <button
                        className="full"
                        onClick={() =>
                          change((s) => ({
                            ...s,
                            revealed: true,
                            timer: { remaining, end: null },
                          }))
                        }
                      >
                        Revelar respuesta
                      </button>
                      <div className="two">
                        <button
                          onClick={() =>
                            change((s) => {
                              if (team.hints < 1)
                                throw Error("Sin comodines de pista");
                              if (s.hint)
                                throw Error("La pista ya está visible");
                              return {
                                ...s,
                                hint: true,
                                teams: s.teams.map((t) =>
                                  t.id === team.id
                                    ? { ...t, hints: t.hints - 1 }
                                    : t,
                                ),
                              };
                            })
                          }
                        >
                          Pista ({team.hints})
                        </button>
                        <button
                          onClick={() =>
                            change((s) => ({
                              ...s,
                              revealed: false,
                              hint: false,
                              timer: { remaining: s.duration, end: null },
                            }))
                          }
                        >
                          Repetir
                        </button>
                      </div>
                      <div className="two">
                        <button
                          className="success"
                          onClick={() =>
                            change(
                              (s) => ({
                                ...award(s, team.id, true),
                                notice: `¡Bien, ${team.name}! Respuesta correcta.`,
                              }),
                              "correct",
                            )
                          }
                        >
                          <Check size={17} /> Acierto
                        </button>
                        <button
                          className="wrong-button"
                          onClick={() =>
                            change(
                              (s) => ({
                                ...award(s, team.id, false),
                                notice: `Esta vez no salió, ${team.name}. ¡Seguimos jugando!`,
                              }),
                              "wrong",
                            )
                          }
                        >
                          <X size={17} /> Error
                        </button>
                      </div>
                    </>
                  )}
                  <div className="sound-deck">
                    <p>¡Que se escuche la hinchada!</p>
                    <div className="two">
                      <button
                        className="cheer-button"
                        onClick={() => change((s) => s, "applause")}
                      >
                        👏 ¡Ovación!
                      </button>
                      <button
                        className="boo-button"
                        onClick={() => change((s) => s, "boo")}
                      >
                        📣 ¡Buuu!
                      </button>
                    </div>
                  </div>
                  <div className="timer-controls">
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
                    <div className="two">
                      <button
                        onClick={() =>
                          change((s) => ({
                            ...s,
                            timer: s.timer.end
                              ? { remaining, end: null }
                              : {
                                  remaining,
                                  end: Date.now() + remaining * 1000,
                                },
                          }))
                        }
                      >
                        {state.timer.end ? (
                          <Pause size={17} />
                        ) : (
                          <Play size={17} />
                        )}{" "}
                        {state.timer.end ? "Pausar reloj" : "Iniciar reloj"}
                      </button>
                      <button
                        aria-label="Reiniciar reloj"
                        onClick={() =>
                          change((s) => ({
                            ...s,
                            timer: { remaining: s.duration, end: null },
                          }))
                        }
                      >
                        <RotateCcw size={17} />
                      </button>
                    </div>
                  </div>
                  <button
                    className="full"
                    onClick={() =>
                      change((s) => ({
                        ...s,
                        phase: s.phase === "paused" ? "playing" : "paused",
                        timer: { remaining, end: null },
                      }))
                    }
                  >
                    <Pause size={17} />{" "}
                    {state.phase === "paused"
                      ? "Continuar partida"
                      : "Pausar programa"}
                  </button>
                  <button className="text-button" onClick={finish}>
                    <Trophy size={17} /> Finalizar y ver resultados
                  </button>
                </div>
              </div>
              {state.round === 6 && (
                <section className="card">
                  <h2>Apuestas de la gran final</h2>
                  <p>
                    Un acierto suma la apuesta y los puntos de la pregunta. Un
                    error resta la apuesta.
                  </p>
                  <div className="team-grid">
                    {state.teams.map((t) => (
                      <label key={t.id}>
                        {t.name} · saldo {t.score}
                        <input
                          type="number"
                          min="0"
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
                        <span>
                          {state.settled.includes(t.id)
                            ? "Resultado registrado"
                            : "Pendiente"}
                        </span>
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
                    Bloquear apuestas
                  </button>
                  <button
                    disabled={
                      state.settled.length !== state.teams.length ||
                      !state.question
                    }
                    onClick={() =>
                      change((s) => ({
                        ...s,
                        locked: false,
                        bets: {},
                        question: null,
                        revealed: false,
                        settled: [],
                      }))
                    }
                  >
                    Preparar otra pregunta final
                  </button>
                </section>
              )}
              {state.phase === "results" && tied.length > 1 && (
                <section className="card">
                  <h2>Desempate</h2>
                  <p>
                    Responden únicamente los equipos empatados. Cada acierto
                    suma el valor de la pregunta.
                  </p>
                  <button
                    onClick={() =>
                      change((s) => {
                        const q = s.bank.find(
                          (q) => q.round < 5 && !s.used.includes(q.id),
                        );
                        if (!q)
                          throw Error(
                            "Agregá una pregunta nueva de desempate al banco.",
                          );
                        return next({
                          ...s,
                          round: q.round,
                          tiebreak: tied.map((t) => t.id),
                          selected: tied[0].id,
                          question: null,
                          locked: false,
                        });
                      })
                    }
                  >
                    Mostrar pregunta de desempate
                  </button>
                </section>
              )}
              <div className="footer-tip">
                <span>✦</span>
                <p>
                  <b>Una buena tarde empieza sin apuro.</b> Probá la pantalla
                  pública y el sonido antes de recibir a los equipos.
                </p>
              </div>
            </>
          ) : tab === "teams" ? (
            <>
              <Title
                eyebrow="LOS PROTAGONISTAS"
                title="Cada equipo, una historia."
              />
              <div className="team-grid">
                {state.teams.map((t) => (
                  <section
                    className="card"
                    key={t.id}
                    style={{ borderTop: `4px solid ${t.color}` }}
                  >
                    <label>
                      Nombre
                      <input
                        value={t.name}
                        onChange={(e) =>
                          change((s) => ({
                            ...s,
                            teams: s.teams.map((x) =>
                              x.id === t.id
                                ? { ...x, name: e.target.value }
                                : x,
                            ),
                          }))
                        }
                      />
                    </label>
                    <div className="two">
                      <label>
                        Color
                        <input
                          type="color"
                          value={t.color}
                          onChange={(e) =>
                            change((s) => ({
                              ...s,
                              teams: s.teams.map((x) =>
                                x.id === t.id
                                  ? { ...x, color: e.target.value }
                                  : x,
                              ),
                            }))
                          }
                        />
                      </label>
                      <label>
                        Integrantes
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={t.members}
                          onChange={(e) =>
                            change((s) => ({
                              ...s,
                              teams: s.teams.map((x) =>
                                x.id === t.id
                                  ? {
                                      ...x,
                                      members: Math.max(1, +e.target.value),
                                    }
                                  : x,
                              ),
                            }))
                          }
                        />
                      </label>
                    </div>
                    <label>
                      Puntaje
                      <input
                        type="number"
                        min="0"
                        value={t.score}
                        onChange={(e) =>
                          change((s) =>
                            points(
                              s,
                              t.id,
                              +e.target.value - t.score,
                              "Ajuste manual",
                            ),
                          )
                        }
                      />
                    </label>
                    <div className="two">
                      <button
                        onClick={() =>
                          change((s) => points(s, t.id, -10, "Ajuste manual"))
                        }
                      >
                        −10 puntos
                      </button>
                      <button
                        onClick={() =>
                          change((s) => points(s, t.id, 10, "Ajuste manual"))
                        }
                      >
                        +10 puntos
                      </button>
                    </div>
                    <p>
                      {t.hints} comodines{" "}
                      {t.double ? "· Doble puntaje activo" : ""}
                    </p>
                    <details>
                      <summary>Historial de puntos</summary>
                      {t.history.map((h, i) => (
                        <p key={i}>
                          {h.points > 0 ? "+" : ""}
                          {h.points} · {h.reason}
                        </p>
                      ))}
                    </details>
                    <button
                      disabled={state.teams.length <= 2 || state.locked}
                      onClick={() =>
                        change((s) => ({
                          ...s,
                          teams: s.teams.filter((x) => x.id !== t.id),
                          selected:
                            s.selected === t.id
                              ? s.teams.find((x) => x.id !== t.id)!.id
                              : s.selected,
                        }))
                      }
                    >
                      Quitar equipo
                    </button>
                  </section>
                ))}
              </div>
              <button
                disabled={state.locked || state.teams.length >= 8}
                onClick={() =>
                  change((s) => ({
                    ...s,
                    teams: [
                      ...s.teams,
                      {
                        id: crypto.randomUUID(),
                        name: `Equipo ${s.teams.length + 1}`,
                        color: "#6bc9bb",
                        members: 5,
                        score: 0,
                        hints: 1,
                        double: false,
                        history: [],
                      },
                    ],
                  }))
                }
              >
                Agregar equipo
              </button>
              <p>
                {state.teams.reduce((n, t) => n + t.members, 0)} participantes ·{" "}
                {state.teams.length} equipos
              </p>
            </>
          ) : tab === "bank" ? (
            <>
              <Title
                eyebrow="LOS RECUERDOS SE COMPARTEN"
                title="Banco de preguntas."
              />
              <div className="toolbar">
                <input
                  placeholder="Buscar pregunta o categoría"
                  aria-label="Buscar pregunta"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
                <button
                  onClick={() =>
                    setEdit({
                      id: crypto.randomUUID(),
                      round: state.round,
                      category: "Recuerdos",
                      difficulty: "fácil",
                      text: "",
                      options: [],
                      answer: "",
                      explanation: "",
                      points: 10,
                      duration: 45,
                      source: "",
                    })
                  }
                >
                  Nueva pregunta
                </button>
                <button
                  onClick={() => download("preguntas-avivim.json", state.bank)}
                >
                  <Download size={17} /> Exportar
                </button>
                <button
                  onClick={() => {
                    setImportKind("bank");
                    fileInput.current?.click();
                  }}
                >
                  <Upload size={17} /> Importar JSON
                </button>
              </div>
              {edit && (
                <section className="card editor">
                  <h2>Editor de pregunta</h2>
                  <label>
                    Enunciado
                    <textarea
                      value={edit.text}
                      onChange={(e) =>
                        setEdit({ ...edit, text: e.target.value })
                      }
                    />
                  </label>
                  <div className="two">
                    <label>
                      Ronda
                      <select
                        value={edit.round}
                        onChange={(e) =>
                          setEdit({ ...edit, round: +e.target.value })
                        }
                      >
                        {state.roundNames.map((n, i) => (
                          <option value={i + 1} key={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Categoría
                      <input
                        value={edit.category}
                        onChange={(e) =>
                          setEdit({ ...edit, category: e.target.value })
                        }
                      />
                    </label>
                  </div>
                  <label>
                    Opciones (una por línea; vacío para respuesta abierta)
                    <textarea
                      value={edit.options.join("\n")}
                      onChange={(e) =>
                        setEdit({
                          ...edit,
                          options: e.target.value.split("\n"),
                        })
                      }
                    />
                  </label>
                  <label>
                    Respuesta correcta
                    <input
                      value={edit.answer}
                      onChange={(e) =>
                        setEdit({ ...edit, answer: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Explicación
                    <textarea
                      value={edit.explanation}
                      onChange={(e) =>
                        setEdit({ ...edit, explanation: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Fuente o referencia
                    <input
                      value={edit.source}
                      onChange={(e) =>
                        setEdit({ ...edit, source: e.target.value })
                      }
                    />
                  </label>
                  <div className="two">
                    <label>
                      Puntos
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={edit.points}
                        onChange={(e) =>
                          setEdit({ ...edit, points: +e.target.value })
                        }
                      />
                    </label>
                    <label>
                      Duración sugerida
                      <input
                        type="number"
                        min="10"
                        max="300"
                        value={edit.duration}
                        onChange={(e) =>
                          setEdit({ ...edit, duration: +e.target.value })
                        }
                      />
                    </label>
                    <label>
                      Dificultad
                      <select
                        value={edit.difficulty}
                        onChange={(e) =>
                          setEdit({
                            ...edit,
                            difficulty: e.target
                              .value as Question["difficulty"],
                          })
                        }
                      >
                        <option>fácil</option>
                        <option>media</option>
                      </select>
                    </label>
                  </div>
                  <label>
                    Imagen o audio local autorizado
                    <input
                      type="file"
                      accept="image/*,audio/*"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (f)
                          try {
                            const id = await putMedia(f);
                            setEdit({
                              ...edit,
                              media: id,
                              mediaType: f.type.startsWith("audio/")
                                ? "audio"
                                : "image",
                            });
                          } catch {
                            setError(
                              "No se pudo guardar el archivo multimedia.",
                            );
                          }
                      }}
                    />
                  </label>
                  {edit.media && (
                    <p>
                      Recurso guardado en este navegador.{" "}
                      <button
                        onClick={() =>
                          setEdit({
                            ...edit,
                            media: undefined,
                            mediaType: undefined,
                          })
                        }
                      >
                        Quitar recurso
                      </button>
                    </p>
                  )}
                  <button
                    className="primary"
                    onClick={() => {
                      try {
                        const q = {
                          ...edit,
                          options: edit.options.filter((o) => o.trim()),
                        };
                        const bank = validateQuestions(
                          state.bank.some((x) => x.id === q.id)
                            ? state.bank.map((x) => (x.id === q.id ? q : x))
                            : [...state.bank, q],
                        );
                        change((s) => ({ ...s, bank }));
                        setEdit(null);
                      } catch (e) {
                        setError((e as Error).message);
                      }
                    }}
                  >
                    Guardar pregunta
                  </button>
                  <button onClick={() => setEdit(null)}>Cancelar</button>
                </section>
              )}
              <p>
                {state.bank.length} preguntas · {state.used.length} utilizadas
                en esta partida
              </p>
              <details className="photo-library">
                <summary>
                  📷 Fotografías incluidas para jugar ({photos.length})
                </summary>
                <div className="photo-gallery">
                  {photos.map((p) => (
                    <figure key={p.id}>
                      <img
                        src={p.src}
                        alt="Fotografía del banco de objetos"
                        loading="lazy"
                      />
                      <figcaption>
                        {state.bank.find((q) => q.id === p.id)?.text}
                        <small>
                          {p.author} ·{" "}
                          <a href={p.source} target="_blank" rel="noreferrer">
                            {p.license}
                          </a>
                        </small>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </details>
              <div className="question-list">
                {state.bank
                  .filter((q) =>
                    (q.text + " " + q.category)
                      .toLowerCase()
                      .includes(filter.toLowerCase()),
                  )
                  .map((q) => (
                    <article className="card" key={q.id}>
                      <span className="eyebrow">
                        RONDA {q.round} · {q.category} · {q.points} PUNTOS
                      </span>
                      <h3>{q.text}</h3>
                      <p>{q.answer}</p>
                      <details>
                        <summary>Explicación y referencia</summary>
                        <p>{q.explanation}</p>
                        <p>{q.source}</p>
                      </details>
                      <button onClick={() => setEdit(q)}>Editar</button>
                      <button
                        onClick={() => {
                          if (confirm("¿Eliminar esta pregunta del banco?"))
                            change((s) => ({
                              ...s,
                              bank: s.bank.filter((x) => x.id !== q.id),
                            }));
                        }}
                      >
                        Eliminar
                      </button>
                    </article>
                  ))}
              </div>
            </>
          ) : tab === "wheel" ? (
            <>
              <Title
                eyebrow="UN GIRO, UNA SORPRESA"
                title="Ruleta Mazal Toc."
              />
              <div className="wheel-layout">
                <div>
                  <div className="wheel-pointer">▼</div>
                  <div
                    className="wheel"
                    style={{
                      transform: `rotate(${state.wheelAngle}deg)`,
                      background: `conic-gradient(${wheelOptions.map((_, i) => `${["#ffca43", "#27b8a1", "#f47583", "#a885e8"][i % 4]} ${(i * 100) / wheelOptions.length}% ${((i + 1) * 100) / wheelOptions.length}%`).join(",")})`,
                    }}
                  >
                    <span>
                      ✦<br />
                      MAZAL TOC
                    </span>
                  </div>
                </div>
                <section className="card">
                  <h2>Un poco de suerte.</h2>
                  <label>
                    Equipo
                    <select
                      value={state.selected}
                      onChange={(e) =>
                        change((s) => ({ ...s, selected: e.target.value }))
                      }
                    >
                      {state.teams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    className="primary"
                    disabled={spinning}
                    onClick={spin}
                  >
                    <Disc3 /> {spinning ? "Girando…" : "Girar la ruleta"}
                  </button>
                  <h3 role="status">
                    {state.wheel || "¡Que la suerte los acompañe!"}
                  </h3>
                  <p>
                    Los puntos y comodines se aplican automáticamente. Las
                    consignas sociales las coordina el conductor.
                  </p>
                  {state.wheel === "Robale una pregunta" && (
                    <p>
                      El equipo seleccionado responde la pregunta actual de otro
                      equipo usando los controles del programa.
                    </p>
                  )}
                  {state.wheel === "Pregunta sorpresa" && (
                    <button
                      onClick={() => {
                        newQuestion();
                        setTab("show");
                      }}
                    >
                      Mostrar pregunta de la ronda
                    </button>
                  )}
                  {state.wheel === "Elegí otro equipo" && (
                    <p>
                      Elegí al nuevo equipo en el selector y volvé al programa.
                    </p>
                  )}
                  <label>
                    Opciones de la ruleta (una por línea)
                    <textarea
                      value={wheelOptions.join("\n")}
                      onChange={(e) => {
                        const v = e.target.value.split("\n");
                        setWheelOptions(v);
                        localStorage.setItem("mazal-wheel", JSON.stringify(v));
                      }}
                    />
                  </label>
                  <details>
                    <summary>Historial de giros</summary>
                    {(state.wheelHistory || []).map((h, i) => (
                      <p key={i}>
                        {h.team}: {h.result}
                      </p>
                    ))}
                  </details>
                  <ol>
                    {wheelOptions.map((o, i) => (
                      <li key={i}>
                        {i + 1}. {o}
                      </li>
                    ))}
                  </ol>
                </section>
              </div>
            </>
          ) : tab === "print" ? (
            <>
              <Title
                eyebrow="LA MESA TAMBIÉN JUEGA"
                title="Materiales para compartir."
              />
              <p>Seleccioná el material y usá el diálogo de impresión en A4.</p>
              <PrintMaterials state={state} />
            </>
          ) : (
            <>
              <Title eyebrow="A TU MANERA" title="Prepará el encuentro." />
              <div className="team-grid">
                <section className="card">
                  <h2>Letras, sonido y movimiento</h2>
                  <label>
                    Tamaño de las letras
                    <select
                      value={textScale}
                      onChange={(e) => setTextScale(e.target.value)}
                    >
                      <option value="large">Grandes</option>
                      <option value="extra">Extra grandes</option>
                    </select>
                  </label>
                  <label>
                    Volumen general
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step=".05"
                      value={state.volume}
                      onChange={(e) =>
                        change((s) => ({ ...s, volume: +e.target.value }))
                      }
                    />
                  </label>
                  <button
                    onClick={() => change((s) => ({ ...s, muted: !s.muted }))}
                  >
                    {state.muted ? "Activar sonido" : "Silenciar"}
                  </button>
                  <button
                    onClick={() => sound("winner", state.volume, state.muted)}
                  >
                    Probar fanfarria
                  </button>
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={state.motion}
                      onChange={(e) =>
                        change((s) => ({ ...s, motion: e.target.checked }))
                      }
                    />{" "}
                    Animaciones suaves
                  </label>
                  <label>
                    Efecto de sonido
                    <select
                      defaultValue=""
                      onChange={(e) => {
                        sound(e.target.value, state.volume, state.muted);
                        e.target.value = "";
                      }}
                    >
                      <option value="" disabled>
                        Elegí un efecto
                      </option>
                      {[
                        ["start", "Inicio del programa"],
                        ["correct", "Acierto"],
                        ["wrong", "Error"],
                        ["timer", "Fin del tiempo"],
                        ["wheel", "Ruleta"],
                        ["round", "Cambio de ronda"],
                        ["winner", "Ganador"],
                        ["applause", "Ovación de la hinchada"],
                        ["boo", "¡Buuu! de la hinchada"],
                      ].map(([v, n]) => (
                        <option key={v} value={v}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </label>
                  <p>
                    Ovaciones y abucheos grabados de la edición Simjat Torá,
                    guardados en la aplicación. El volumen controla todos los
                    efectos.
                  </p>
                </section>
                <section className="card">
                  <h2>Guardado y recuperación</h2>
                  <p>
                    La partida se guarda después de cada acción en este
                    navegador.
                  </p>
                  <button
                    onClick={() => download("partida-avivim.json", state)}
                  >
                    <Save size={17} /> Exportar partida
                  </button>
                  <button
                    onClick={() => {
                      setImportKind("game");
                      fileInput.current?.click();
                    }}
                  >
                    Recuperar archivo
                  </button>
                  <p>
                    El JSON conserva los datos. Los archivos multimedia quedan
                    en IndexedDB y no viajan en el JSON.
                  </p>
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          "¿Reiniciar el torneo y todos sus puntajes? Se conserva el banco y los equipos.",
                        )
                      )
                        change((s) => ({
                          ...initial(s.bank),
                          teams: s.teams.map((t) => ({
                            ...t,
                            score: 0,
                            hints: 1,
                            double: false,
                            history: [],
                          })),
                          roundNames: s.roundNames,
                          selected: s.teams[0].id,
                        }));
                    }}
                  >
                    Reiniciar torneo
                  </button>
                </section>
                <section className="card">
                  <h2>Rondas</h2>
                  {state.roundNames.map((n, i) => (
                    <label key={i}>
                      Ronda {i + 1}
                      <input
                        value={n}
                        onChange={(e) =>
                          change((s) => ({
                            ...s,
                            roundNames: s.roundNames.map((x, j) =>
                              j === i ? e.target.value : x,
                            ),
                          }))
                        }
                      />
                    </label>
                  ))}
                  <button
                    onClick={() =>
                      change((s) => ({
                        ...s,
                        roundNames: [
                          ...s.roundNames,
                          `Ronda ${s.roundNames.length + 1}`,
                        ],
                      }))
                    }
                  >
                    Agregar ronda
                  </button>
                  <p>
                    Creá sus preguntas desde el editor. Las rondas nuevas usan
                    el sistema de puntajes normal.
                  </p>
                </section>
                <section className="card">
                  <h2>Lista para el proyector</h2>
                  <p>
                    1. Abrí la pantalla pública.
                    <br />
                    2. Arrastrá esa ventana al televisor.
                    <br />
                    3. Activá pantalla completa con F11 o el menú del navegador.
                    <br />
                    4. Mantené este panel en la notebook.
                  </p>
                  <p>
                    {offline
                      ? "Aplicación controlada por el caché offline."
                      : "Para el modo offline, usá la versión compilada, recargá una vez y comprobá sin conexión."}
                  </p>
                  {install && (
                    <button onClick={() => install.prompt()}>
                      Instalar aplicación
                    </button>
                  )}
                  <button
                    onClick={() =>
                      navigator.storage
                        ?.persist()
                        .then((ok) =>
                          setError(
                            ok
                              ? "Almacenamiento persistente habilitado."
                              : "El navegador administra el almacenamiento; conservá una copia de la partida.",
                          ),
                        )
                    }
                  >
                    Solicitar almacenamiento persistente
                  </button>
                </section>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
function Title({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
      </div>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
