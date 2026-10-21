import { useEffect, useRef, useState } from "react";
import type { State } from "../engine";
import {
  card,
  clipsFor,
  groups,
  linkFor,
  pick,
  serieById,
  series,
  verdict,
  youtube,
  ROW,
  type Clip,
} from "../bingoAntiguas";
import { Confetti } from "./Festive";

const clipLabel: Record<Clip, string> = {
  cortina: "🎵 Cortina",
  escena: "🎬 Escena",
};

function useOnline() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    addEventListener("online", update);
    addEventListener("offline", update);
    return () => {
      removeEventListener("online", update);
      removeEventListener("offline", update);
    };
  }, []);
  return online;
}

// Video de YouTube insertado. Mientras no se revela, la cortina queda tapada
// (solo se escucha) y en la escena se tapa la franja de arriba, donde YouTube
// muestra el título del video.
function YouTube({
  link,
  take,
  clip,
  reveal,
  state,
}: {
  link: string;
  take: number;
  clip: Clip;
  reveal: boolean;
  state: State;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const video = youtube(link);
  function sync() {
    const send = (func: string, args: unknown[] = []) =>
      frame.current?.contentWindow?.postMessage(
        JSON.stringify({ event: "command", func, args }),
        "*",
      );
    send("setVolume", [Math.round(state.volume * 100)]);
    send(state.muted ? "mute" : "unMute");
  }
  useEffect(sync, [state.volume, state.muted]);
  if (!video)
    return (
      <p className="media-missing" role="status">
        El enlace de este video no es de YouTube o está mal copiado.
      </p>
    );
  const src =
    `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0` +
    `&playsinline=1&iv_load_policy=3&enablejsapi=1&start=${video.start}` +
    `&origin=${encodeURIComponent(location.origin)}`;
  return (
    <div className="yt-frame">
      <iframe
        key={take}
        ref={frame}
        src={src}
        title="Fragmento de la serie"
        allow="autoplay; encrypted-media; fullscreen"
        onLoad={() => {
          sync();
          setTimeout(sync, 1500);
        }}
      />
      {!reveal &&
        (clip === "cortina" ? (
          <div className="yt-cover">
            <span aria-hidden="true">🎵</span>
            ¿De qué serie es esta música?
          </div>
        ) : (
          <div className="yt-band" />
        ))}
    </div>
  );
}

// Lo que ve todo el salón. Solo reproduce en las ventanas que se proyectan
// (`play`); el panel privado muestra un aviso en lugar del video.
export function BingoAntiguasStage({
  state,
  play,
}: {
  state: State;
  play: boolean;
}) {
  const b = state.bingoAntiguas;
  const { played, check, seed, reveal, clip, take } = b;
  const result = check ? verdict(seed, check, played) : null;
  if (result)
    return (
      <div className="bingo-stage bingo-antiguas-stage">
        <p className="eyebrow">VERIFICAMOS EL CARTÓN N° {check}</p>
        <h2
          className={
            "bingo-verdict " +
            (result.bingo ? "is-bingo" : result.lines ? "is-line" : "")
          }
        >
          {result.bingo
            ? "¡BINGO! 🎉"
            : result.lines
              ? "¡LÍNEA! 👏"
              : `Todavía no: faltan ${result.missing}`}
        </h2>
        <div className="bingo-card-grid">
          {result.card.map((s, i) => (
            <div key={s.id} className={result.hit[i] ? "hit" : ""}>
              <b>{s.nombre}</b>
              {result.hit[i] && <i aria-label="Ya salió">✓</i>}
            </div>
          ))}
        </div>
        {result.bingo && state.motion && <Confetti />}
      </div>
    );
  const last = played.length ? serieById(played[played.length - 1]) : null;
  const link = last ? linkFor(b, last, clip) : "";
  return (
    <div className="bingo-stage bingo-antiguas-stage">
      <p className="eyebrow">
        📺 BINGO DE SERIES DE ANTES · {played.length} de {series.length} series
      </p>
      {last ? (
        <div className="bingo-now">
          <small>
            Serie {played.length} · {clip === "cortina" ? "Cortina" : "Escena"}
          </small>
          {link && play ? (
            <YouTube
              link={link}
              take={take}
              clip={clip}
              reveal={reveal}
              state={state}
            />
          ) : (
            <h2>
              {clip === "cortina"
                ? "🎵 ¿De qué serie es esta música?"
                : "🎬 ¿Qué serie es?"}
            </h2>
          )}
          {reveal && <p className="series-answer">{last.nombre}</p>}
        </div>
      ) : (
        <div className="bingo-now">
          <h2>¡Atentos a la pantalla!</h2>
          <p>Escuchen la música o miren la escena y marquen la serie.</p>
        </div>
      )}
      {played.length > 1 && (
        <div className="bingo-history">
          <span>Ya salieron:</span>
          {played
            .slice(0, -1)
            .reverse()
            .slice(0, 12)
            .map((id) => (
              <em key={id}>{serieById(id)?.nombre}</em>
            ))}
          {played.length > 13 && <em>y {played.length - 13} más</em>}
        </div>
      )}
      <p className="bingo-rules">
        LÍNEA: una fila completa · BINGO: todo el cartón
      </p>
    </div>
  );
}

// Controles del conductor en la pantalla compartida.
export function BingoAntiguasControls({
  state,
  change,
  menu,
}: {
  state: State;
  change: (fn: (s: State) => State, effect?: string) => void;
  menu: () => void;
}) {
  const online = useOnline();
  const [number, setNumber] = useState("");
  const [search, setSearch] = useState("");
  const b = state.bingoAntiguas;
  const { played, cards, check, reveal, clip, take, links } = b;
  const set = (bingo: Partial<State["bingoAntiguas"]>, effect?: string) =>
    change(
      (s) => ({ ...s, bingoAntiguas: { ...s.bingoAntiguas, ...bingo } }),
      effect,
    );
  const last = played.length ? serieById(played[played.length - 1]) : null;
  const available = last ? clipsFor(b, last) : [];
  const [draft, setDraft] = useState<Record<Clip, string>>({
    cortina: "",
    escena: "",
  });
  useEffect(() => {
    if (last)
      setDraft({
        cortina: linkFor(b, last, "cortina"),
        escena: linkFor(b, last, "escena"),
      });
  }, [last?.id]);
  const term = search.trim().toLowerCase();
  function choose(id: string) {
    const s = serieById(id)!;
    setSearch("");
    set({
      played: [...played, id],
      check: null,
      reveal: false,
      clip: clipsFor(b, s)[0] || "cortina",
      take: take + 1,
    });
  }
  function saveLinks() {
    if (!last) return;
    for (const c of ["cortina", "escena"] as const)
      if (draft[c].trim() && !youtube(draft[c])) {
        alert(
          `El enlace de la ${c} no es un video de YouTube. Copiá la dirección desde «Compartir» en YouTube.`,
        );
        return;
      }
    set({
      links: {
        ...links,
        [last.id]: {
          cortina: draft.cortina.trim(),
          escena: draft.escena.trim(),
        },
      },
      take: take + 1,
    });
  }
  function verify() {
    const n = +number;
    if (!Number.isInteger(n) || n < 1 || n > cards)
      throw Error(`El cartón tiene que ser un número del 1 al ${cards}.`);
    const r = verdict(b.seed, n, played);
    set({ check: n }, r.bingo ? "winner" : r.lines ? "applause" : "boo");
  }
  function tryVerify() {
    try {
      verify();
    } catch (err) {
      alert((err as Error).message);
    }
  }
  return (
    <section
      className="shared-controls bingo-controls"
      aria-label="Bingo de series de antes"
    >
      {!online && (
        <p className="series-warning" role="status">
          ⚠️ No hay conexión a internet: los videos de YouTube no se pueden
          reproducir. El bingo y la verificación de cartones funcionan igual.
        </p>
      )}
      <div className="shared-control-row">
        <button onClick={menu}>🏠 Menú de juegos</button>
        <button
          className="primary"
          disabled={played.length === series.length}
          onClick={() => {
            const s = pick(played);
            if (s) choose(s.id);
          }}
        >
          🎲 Sacar una serie al azar
        </button>
        {(["cortina", "escena"] as const).map((c) => (
          <button
            key={c}
            className={last && clip === c ? "selected" : ""}
            aria-pressed={!!last && clip === c}
            disabled={!last || !!check || !available.includes(c)}
            onClick={() => set({ clip: c, take: take + 1 })}
          >
            {clipLabel[c]}
          </button>
        ))}
        <button
          disabled={!last || !!check || !available.includes(clip)}
          onClick={() => set({ take: take + 1 })}
        >
          ↻ Repetir
        </button>
        <button
          disabled={!last || !!check}
          onClick={() => set({ reveal: !reveal })}
        >
          {reveal ? "Ocultar respuesta" : "Mostrar respuesta"}
        </button>
      </div>
      {last && (
        <p className="series-info" role="status">
          Está saliendo: <b>{last.nombre}</b>
          {!available.length &&
            " · No tiene videos: podés describirla en voz alta o pegar un enlace abajo."}
        </p>
      )}
      <div className="shared-control-row">
        <button
          disabled={!played.length}
          onClick={() =>
            set({ played: played.slice(0, -1), check: null, reveal: false })
          }
        >
          ↩ Deshacer la última
        </button>
        <button
          onClick={() =>
            window.open(`./?cartones=antiguas`, "mazal-cartones-antiguas")
          }
        >
          🖨️ Imprimir {cards} cartones
        </button>
        <label>
          Cantidad de cartones
          <select
            value={cards}
            onChange={(e) => set({ cards: +e.target.value })}
          >
            {[10, 20, 30, 40, 50, 60, 80, 100].map((n) => (
              <option key={n} value={n}>
                {n} cartones
              </option>
            ))}
          </select>
        </label>
        <button
          disabled={!played.length}
          onClick={() => {
            if (
              confirm(
                "¿Empezar un bingo nuevo? Se borran las series que ya salieron (los cartones impresos sirven igual).",
              )
            )
              set({ played: [], check: null, reveal: false }, "start");
          }}
        >
          Empezar de nuevo
        </button>
      </div>
      <div className="shared-control-row bingo-check">
        <label>
          ¿Alguien cantó? Número de cartón
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={cards}
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && tryVerify()}
          />
        </label>
        <button className="primary" disabled={!number} onClick={tryVerify}>
          Verificar cartón
        </button>
        {check && (
          <button onClick={() => set({ check: null, reveal: false })}>
            Seguir jugando
          </button>
        )}
      </div>
      {last && (
        <details className="antiguas-links">
          <summary>🔗 Cambiar los videos de «{last.nombre}»</summary>
          <p>
            Si un video no anda, buscá otro en YouTube, tocá «Compartir», copiá
            el enlace y pegalo acá. Para que empiece más adelante, agregá
            «&t=90» (segundos) al final. Dejalo vacío si no hay video.
          </p>
          {(["cortina", "escena"] as const).map((c) => (
            <label key={c}>
              {clipLabel[c]}
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=…"
                value={draft[c]}
                onChange={(e) => setDraft({ ...draft, [c]: e.target.value })}
              />
            </label>
          ))}
          <button className="primary" onClick={saveLinks}>
            Guardar enlaces
          </button>
        </details>
      )}
      <label className="bingo-search">
        O tocá la serie que querés que salga
        <input
          type="search"
          placeholder="Buscar serie"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>
      {groups.map((g) => {
        const items = series.filter(
          (s) =>
            s.grupo === g && (!term || s.nombre.toLowerCase().includes(term)),
        );
        if (!items.length) return null;
        return (
          <div key={g} className="bingo-group">
            <h3>{g}</h3>
            <div className="bingo-songs">
              {items.map((s) => {
                const done = played.includes(s.id);
                const has = clipsFor(b, s);
                return (
                  <button
                    key={s.id}
                    className={done ? "played" : ""}
                    disabled={done}
                    onClick={() => choose(s.id)}
                  >
                    <b>{s.nombre}</b>
                    <small>
                      {done
                        ? "✓ Ya salió"
                        : has.length
                          ? has.map((c) => clipLabel[c]).join(" · ")
                          : "Sin videos"}
                    </small>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </section>
  );
}

// Cartones para imprimir: dos por hoja A4.
export function BingoAntiguasCards({ state }: { state: State }) {
  const { seed, cards } = state.bingoAntiguas;
  return (
    <main className="bingo-print bingo-antiguas-print">
      <div className="bingo-print-toolbar">
        <p>
          {cards} cartones listos. Cada cartón tiene un número: cuando alguien
          cante, escribí ese número en el juego para verificarlo.
        </p>
        <button className="primary" onClick={() => window.print()}>
          🖨️ Imprimir
        </button>
      </div>
      {Array.from({ length: cards }, (_, i) => (
        <section className="bingo-sheet" key={i}>
          <div className="bingo-sheet-head">
            <span>📺 BINGO DE SERIES DE ANTES</span>
            <strong>Cartón N° {i + 1}</strong>
          </div>
          <div
            className="bingo-sheet-grid"
            style={{ gridTemplateColumns: `repeat(${ROW}, 1fr)` }}
          >
            {card(seed, i + 1).map((s) => (
              <div key={s.id}>
                <b>{s.nombre}</b>
              </div>
            ))}
          </div>
          <div className="bingo-sheet-foot">
            Mazal Toc Avivim · Bet Am del Oeste · LÍNEA: una fila completa ·
            BINGO: todo el cartón
          </div>
        </section>
      ))}
    </main>
  );
}
