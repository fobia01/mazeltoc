import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { State } from "../engine";
import {
  CARD_SIZE,
  ROW,
  card,
  enough,
  keyOf,
  namesFrom,
  nameOf,
  pick,
  sameNames,
  verdict,
} from "../bingoSeries";
import { Confetti } from "./Festive";

// Archivos elegidos en esta ventana. Viven solo en memoria: no se copian al
// proyecto, no se guardan en el navegador y no se suben a ningún lado. Al
// recargar hay que volver a elegirlos; la lista de nombres sí queda guardada.
const files = new Map<string, File>();
const listeners = new Set<() => void>();
let version = 0;
function setFiles(list: File[]) {
  files.clear();
  for (const f of list) {
    const k = keyOf(nameOf(f.name));
    if (k && !files.has(k)) files.set(k, f);
  }
  version++;
  listeners.forEach((l) => l());
}
function useFiles() {
  useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => version,
  );
  return files;
}
const isMedia = (f: File) =>
  /^(video|audio)\//.test(f.type) ||
  /\.(mp4|m4v|mov|webm|mkv|avi|mp3|m4a|wav|ogg|oga|aac|flac)$/i.test(f.name);

function Fragment({ file, state }: { file: File; state: State }) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const media = useRef<HTMLVideoElement & HTMLAudioElement>(null);
  useEffect(() => {
    const u = URL.createObjectURL(file);
    setUrl(u);
    setFailed(false);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  useEffect(() => {
    if (media.current) {
      media.current.volume = state.volume;
      media.current.muted = state.muted;
    }
  }, [state.volume, state.muted, url]);
  useEffect(() => {
    if (url) void media.current?.play().catch(() => {});
  }, [url]);
  if (failed)
    return (
      <p className="media-missing" role="status">
        Este archivo no se puede reproducir en el navegador. Probá convertirlo a
        MP4 (video) o MP3 (audio).
      </p>
    );
  if (!url) return null;
  return file.type.startsWith("audio/") ? (
    <div className="series-audio">
      <span aria-hidden="true">🎧</span>
      <audio ref={media} src={url} controls onError={() => setFailed(true)} />
    </div>
  ) : (
    <video
      ref={media}
      className="series-video"
      src={url}
      controls
      playsInline
      onError={() => setFailed(true)}
    />
  );
}

// Lo que ve todo el salón: el fragmento, la respuesta y la verificación.
export function BingoSeriesStage({ state }: { state: State }) {
  const loaded = useFiles();
  const { played, check, seed, names, reveal } = state.bingoSeries;
  const result =
    check && enough(names) ? verdict(seed, check, played, names) : null;
  if (result)
    return (
      <div className="bingo-stage bingo-series-stage">
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
          {result.card.map((n, i) => (
            <div key={n} className={result.hit[i] ? "hit" : ""}>
              <b>{n}</b>
              {result.hit[i] && <i aria-label="Ya salió">✓</i>}
            </div>
          ))}
        </div>
        {result.bingo && state.motion && <Confetti />}
      </div>
    );
  const last = played.length ? played[played.length - 1] : null;
  const file = last ? loaded.get(keyOf(last)) : undefined;
  return (
    <div className="bingo-stage bingo-series-stage">
      <p className="eyebrow">
        BINGO DE SERIES Y PELÍCULAS · {played.length} de {names.length}{" "}
        fragmentos
      </p>
      {last ? (
        <div className="bingo-now">
          <small>Fragmento {played.length}</small>
          {file ? (
            <Fragment key={played.length} file={file} state={state} />
          ) : (
            <h2>🎬 ¿Qué serie o película es?</h2>
          )}
          {reveal && <p className="series-answer">{last}</p>}
        </div>
      ) : (
        <div className="bingo-now">
          <h2>¡Atentos a la pantalla!</h2>
          <p>
            {enough(names)
              ? "Miren el fragmento y marquen la serie o película en su cartón."
              : "Estamos preparando los fragmentos."}
          </p>
        </div>
      )}
      {played.length > 1 && (
        <div className="bingo-history">
          <span>Ya salieron:</span>
          {played
            .slice(0, -1)
            .reverse()
            .slice(0, 12)
            .map((n) => (
              <em key={n}>{n}</em>
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
export function BingoSeriesControls({
  state,
  change,
  menu,
}: {
  state: State;
  change: (fn: (s: State) => State, effect?: string) => void;
  menu: () => void;
}) {
  const loaded = useFiles();
  const input = useRef<HTMLInputElement>(null);
  const [number, setNumber] = useState("");
  const [info, setInfo] = useState("");
  const { played, cards, check, names, reveal } = state.bingoSeries;
  const set = (bingo: Partial<State["bingoSeries"]>, effect?: string) =>
    change(
      (s) => ({ ...s, bingoSeries: { ...s.bingoSeries, ...bingo } }),
      effect,
    );
  const ready = enough(names);
  const missingFiles = names.filter((n) => !loaded.has(keyOf(n))).length;
  const left = names.length - played.length;
  const warning = !names.length
    ? "Todavía no cargaste fragmentos. Tocá «Cargar fragmentos» y elegí los videos o audios de tu computadora (podés elegir varios a la vez). El nombre de cada archivo es la respuesta."
    : !ready
      ? `Cargaste ${names.length} ${names.length === 1 ? "fragmento" : "fragmentos"}. Para armar los cartones hacen falta al menos ${CARD_SIZE} con nombres distintos: agregá ${CARD_SIZE - names.length} más.`
      : missingFiles
        ? `La lista tiene ${names.length} fragmentos, pero el navegador no recuerda los archivos al recargar. Tocá «Cargar fragmentos» y volvé a elegir los mismos archivos para seguir.`
        : !left
          ? "Ya salieron todos los fragmentos."
          : "";
  function load(list: File[]) {
    const media = list.filter(isMedia);
    const skipped = list.length - media.length;
    const next = namesFrom(media.map((f) => f.name));
    const repeated = media.length - next.length;
    if (!next.length) {
      setInfo("Ninguno de los archivos elegidos es un video o un audio.");
      return;
    }
    const changed = !sameNames(next, names);
    if (
      changed &&
      names.length &&
      !confirm(
        "Elegiste una lista de fragmentos distinta a la anterior. El bingo empieza de nuevo y, si ya imprimiste cartones, hay que volver a imprimirlos. ¿Seguir?",
      )
    )
      return;
    setFiles(media);
    if (changed) set({ names: next, played: [], check: null, reveal: false });
    setInfo(
      [
        `✓ ${next.length} fragmentos listos.`,
        skipped > 0 &&
          `Se ignoraron ${skipped} archivos que no son video ni audio.`,
        repeated > 0 &&
          `Había ${repeated} nombres repetidos: se usa uno solo de cada uno.`,
        enough(next) &&
          next.length < 20 &&
          "Con pocos fragmentos los cartones se parecen mucho: conviene cargar 20 o más.",
      ]
        .filter(Boolean)
        .join(" "),
    );
  }
  function play() {
    const name = pick(names, played, (n) => loaded.has(keyOf(n)));
    if (!name) return;
    set({ played: [...played, name], check: null, reveal: false });
  }
  function verify() {
    const n = +number;
    if (!Number.isInteger(n) || n < 1 || n > cards)
      throw Error(`El cartón tiene que ser un número del 1 al ${cards}.`);
    const r = verdict(state.bingoSeries.seed, n, played, names);
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
      aria-label="Bingo de series y películas"
    >
      {warning && (
        <p className="series-warning" role="status">
          ⚠️ {warning}
        </p>
      )}
      {info && (
        <p className="series-info" role="status">
          {info}
        </p>
      )}
      <div className="shared-control-row">
        <button onClick={menu}>🏠 Menú de juegos</button>
        <button className="primary" onClick={() => input.current?.click()}>
          📂 Cargar fragmentos
        </button>
        <input
          ref={input}
          type="file"
          multiple
          accept="video/*,audio/*"
          hidden
          aria-label="Elegir fragmentos de video o audio"
          onChange={(e) => {
            load([...(e.target.files || [])]);
            e.target.value = "";
          }}
        />
        <button
          className="primary"
          disabled={!ready || !!missingFiles || !left}
          onClick={play}
        >
          ▶ Reproducir fragmento
        </button>
        <button
          disabled={!played.length || !!check}
          onClick={() => set({ reveal: !reveal })}
        >
          {reveal ? "Ocultar respuesta" : "Mostrar respuesta"}
        </button>
      </div>
      <div className="shared-control-row">
        <button
          disabled={!played.length}
          onClick={() =>
            set({ played: played.slice(0, -1), check: null, reveal: false })
          }
        >
          ↩ Deshacer el último
        </button>
        <button
          disabled={!ready}
          onClick={() =>
            window.open(`./?cartones=series`, "mazal-cartones-series")
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
                "¿Empezar un bingo nuevo? Se borran los fragmentos que ya salieron (los cartones impresos sirven igual).",
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
            disabled={!ready}
            onChange={(e) => setNumber(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && tryVerify()}
          />
        </label>
        <button
          className="primary"
          disabled={!number || !ready}
          onClick={tryVerify}
        >
          Verificar cartón
        </button>
        {check && (
          <button onClick={() => set({ check: null, reveal: false })}>
            Seguir jugando
          </button>
        )}
      </div>
    </section>
  );
}

// Cartones para imprimir: dos por hoja A4.
export function BingoSeriesCards({ state }: { state: State }) {
  const { seed, cards, names } = state.bingoSeries;
  if (!enough(names))
    return (
      <main className="bingo-print bingo-series-print">
        <div className="bingo-print-toolbar">
          <p role="status">
            Todavía no se pueden imprimir cartones: hacen falta al menos{" "}
            {CARD_SIZE} fragmentos cargados y hay {names.length}. Volvé al
            juego, tocá «Cargar fragmentos» y elegí más archivos.
          </p>
        </div>
      </main>
    );
  return (
    <main className="bingo-print bingo-series-print">
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
            <span>BINGO DE SERIES Y PELÍCULAS</span>
            <strong>Cartón N° {i + 1}</strong>
          </div>
          <div
            className="bingo-sheet-grid"
            style={{ gridTemplateColumns: `repeat(${ROW}, 1fr)` }}
          >
            {card(seed, i + 1, names).map((n) => (
              <div key={n}>
                <b>{n}</b>
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
