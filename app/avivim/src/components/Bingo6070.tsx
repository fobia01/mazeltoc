import { useState } from "react";
import type { State } from "../engine";
import { card, groups, actorById, actors, verdict, ROW } from "../bingo6070";
import { Confetti } from "./Festive";

// Lo que ve todo el salón: la pista actual, el historial y la verificación.
export function Bingo6070Stage({ state }: { state: State }) {
  const { played, check, seed } = state.bingo6070;
  const last = played.length ? actorById(played[played.length - 1]) : null;
  const result = check ? verdict(seed, check, played) : null;
  if (result)
    return (
      <div className="bingo-stage bingo6070-stage">
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

              {result.hit[i] && <i aria-label="Cantado">✓</i>}
            </div>
          ))}
        </div>
        {result.bingo && state.motion && <Confetti />}
      </div>
    );
  return (
    <div className="bingo-stage bingo6070-stage">
      <p className="eyebrow">
        BINGO DE LOS 60 Y 70 · {played.length} de {actors.length} pistas
      </p>
      {last ? (
        <div className="bingo-now">
          <small>Pista {played.length}</small>
          <h2>{last.pista}</h2>
          {state.bingo6070.reveal && <p>{last.nombre}</p>}
        </div>
      ) : (
        <div className="bingo-now">
          <h2>¡Escuchen con atención!</h2>
          <p>Escuchen la pista y marquen el nombre del actor o la actriz.</p>
        </div>
      )}
      {played.length > 1 && (
        <div className="bingo-history">
          <span>Pistas anteriores:</span>
          {played
            .slice(0, -1)
            .reverse()
            .slice(0, 12)
            .map((id) => (
              <em key={id}>{actorById(id)?.nombre}</em>
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
export function Bingo6070Controls({
  state,
  change,
  menu,
}: {
  state: State;
  change: (fn: (s: State) => State, effect?: string) => void;
  menu: () => void;
}) {
  const [number, setNumber] = useState("");
  const [search, setSearch] = useState("");
  const { played, cards, check } = state.bingo6070;
  const set = (bingo: Partial<State["bingo6070"]>, effect?: string) =>
    change((s) => ({ ...s, bingo6070: { ...s.bingo6070, ...bingo } }), effect);
  const term = search.trim().toLowerCase();
  function verify() {
    const n = +number;
    if (!Number.isInteger(n) || n < 1 || n > cards)
      throw Error(`El cartón tiene que ser un número del 1 al ${cards}.`);
    const r = verdict(state.bingo6070.seed, n, played);
    set({ check: n }, r.bingo ? "winner" : r.lines ? "applause" : "boo");
  }
  return (
    <section
      className="shared-controls bingo-controls"
      aria-label="Bingo de los 60 y 70"
    >
      <div className="shared-control-row">
        <button onClick={menu}>🏠 Menú de juegos</button>
        <button
          disabled={!played.length}
          onClick={() =>
            set({ played: played.slice(0, -1), check: null, reveal: false })
          }
        >
          ↩ Deshacer la última
        </button>
        <button
          onClick={() => window.open(`./?cartones=6070`, "mazal-cartones6070")}
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
                "¿Empezar un bingo nuevo? Se borran las pistas que ya sonaron (los cartones impresos sirven igual).",
              )
            )
              set({ played: [], check: null, reveal: false }, "start");
          }}
        >
          Empezar de nuevo
        </button>
      </div>
      {played.length > 0 && !check && (
        <button onClick={() => set({ reveal: !state.bingo6070.reveal })}>
          {state.bingo6070.reveal ? "Ocultar respuesta" : "Mostrar respuesta"}
        </button>
      )}
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
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                try {
                  verify();
                } catch (err) {
                  alert((err as Error).message);
                }
              }
            }}
          />
        </label>
        <button
          className="primary"
          disabled={!number}
          onClick={() => {
            try {
              verify();
            } catch (err) {
              alert((err as Error).message);
            }
          }}
        >
          Verificar cartón
        </button>
        {check && (
          <button onClick={() => set({ check: null, reveal: false })}>
            Seguir jugando
          </button>
        )}
      </div>
      <label className="bingo-search">
        Tocá la pista que vas a cantar
        <input
          type="search"
          placeholder="Buscar por nombre o pista"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>
      {groups.map((g) => {
        const items = actors.filter(
          (s) =>
            s.grupo === g &&
            (!term ||
              s.nombre.toLowerCase().includes(term) ||
              s.pista.toLowerCase().includes(term)),
        );
        if (!items.length) return null;
        return (
          <div key={g} className="bingo-group">
            <h3>{g}</h3>
            <div className="bingo-songs">
              {items.map((s) => {
                const done = played.includes(s.id);
                return (
                  <button
                    key={s.id}
                    className={done ? "played" : ""}
                    disabled={done}
                    onClick={() => {
                      setSearch("");
                      set({
                        played: [...played, s.id],
                        check: null,
                        reveal: false,
                      });
                    }}
                  >
                    <b>{s.pista}</b>
                    <small>
                      {done ? `✓ ${s.nombre}` : "Cantar esta pista"}
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
export function Bingo6070Cards({ state }: { state: State }) {
  const { seed, cards } = state.bingo6070;
  return (
    <main className="bingo-print bingo6070-print">
      <div className="bingo-print-toolbar">
        <p>
          {cards} cartones listos. Cada cartón tiene un número: cuando alguien
          cante, escribí ese número en el juego para verificarlo.
        </p>
        <button className="primary" onClick={() => window.print()}>
          🖨️ Imprimir
        </button>
      </div>
      {Array.from({ length: cards }, (_, i) => {
        const actorsOnCard = card(seed, i + 1);
        return (
          <section className="bingo-sheet" key={i}>
            <div className="bingo-sheet-head">
              <span>BINGO DE LOS 60 Y 70</span>
              <strong>Cartón N° {i + 1}</strong>
            </div>
            <div
              className="bingo-sheet-grid"
              style={{ gridTemplateColumns: `repeat(${ROW}, 1fr)` }}
            >
              {actorsOnCard.map((s) => (
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
        );
      })}
    </main>
  );
}
