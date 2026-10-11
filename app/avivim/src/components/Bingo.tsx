import { useState } from "react";
import type { State } from "../engine";
import { card, groups, songById, songs, verdict, ROW } from "../bingo";
import { Confetti } from "./Festive";

// Lo que ve todo el salón: la última canción, las anteriores y la verificación.
export function BingoStage({ state }: { state: State }) {
  const { played, check, seed } = state.bingo;
  const last = played.length ? songById(played[played.length - 1]) : null;
  const result = check ? verdict(seed, check, played) : null;
  if (result)
    return (
      <div className="bingo-stage">
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
              <b>{s.title}</b>
              <small>{s.artist}</small>
              {result.hit[i] && <i aria-label="Sonó">✓</i>}
            </div>
          ))}
        </div>
        {result.bingo && state.motion && <Confetti />}
      </div>
    );
  return (
    <div className="bingo-stage">
      <p className="eyebrow">
        🎵 BINGO MUSICAL · {played.length} de {songs.length} canciones
      </p>
      {last ? (
        <div className="bingo-now">
          <small>Canción {played.length}</small>
          <h2>{last.title}</h2>
          <p>{last.artist}</p>
        </div>
      ) : (
        <div className="bingo-now">
          <h2>¡Escuchen con atención!</h2>
          <p>Si la canción está en su cartón, márquenla.</p>
        </div>
      )}
      {played.length > 1 && (
        <div className="bingo-history">
          <span>Ya sonaron:</span>
          {played
            .slice(0, -1)
            .reverse()
            .slice(0, 12)
            .map((id) => (
              <em key={id}>{songById(id)?.title}</em>
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
export function BingoControls({
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
  const { played, cards, check } = state.bingo;
  const set = (bingo: Partial<State["bingo"]>, effect?: string) =>
    change((s) => ({ ...s, bingo: { ...s.bingo, ...bingo } }), effect);
  const term = search.trim().toLowerCase();
  function verify() {
    const n = +number;
    if (!Number.isInteger(n) || n < 1 || n > cards)
      throw Error(`El cartón tiene que ser un número del 1 al ${cards}.`);
    const r = verdict(state.bingo.seed, n, played);
    set({ check: n }, r.bingo ? "winner" : r.lines ? "applause" : "boo");
  }
  return (
    <section className="shared-controls bingo-controls" aria-label="Bingo">
      <div className="shared-control-row">
        <button onClick={menu}>🏠 Menú de juegos</button>
        <button
          disabled={!played.length}
          onClick={() => set({ played: played.slice(0, -1), check: null })}
        >
          ↩ Deshacer la última
        </button>
        <button onClick={() => window.open(`./?cartones=1`, "mazal-cartones")}>
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
                "¿Empezar un bingo nuevo? Se borran las canciones que ya sonaron (los cartones impresos sirven igual).",
              )
            )
              set({ played: [], check: null }, "start");
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
          <button onClick={() => set({ check: null })}>Seguir jugando</button>
        )}
      </div>
      <label className="bingo-search">
        Tocá la canción que está sonando
        <input
          type="search"
          placeholder="Buscar por título o cantante"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>
      {groups.map((g) => {
        const items = songs.filter(
          (s) =>
            s.group === g &&
            (!term ||
              s.title.toLowerCase().includes(term) ||
              s.artist.toLowerCase().includes(term)),
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
                      set({ played: [...played, s.id], check: null });
                    }}
                  >
                    <b>{s.title}</b>
                    <small>{done ? "✓ Ya sonó" : s.artist}</small>
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
export function BingoCards({ state }: { state: State }) {
  const { seed, cards } = state.bingo;
  return (
    <main className="bingo-print">
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
        const songsOnCard = card(seed, i + 1);
        return (
          <section className="bingo-sheet" key={i}>
            <div className="bingo-sheet-head">
              <span>🎵 BINGO MUSICAL</span>
              <strong>Cartón N° {i + 1}</strong>
            </div>
            <div
              className="bingo-sheet-grid"
              style={{ gridTemplateColumns: `repeat(${ROW}, 1fr)` }}
            >
              {songsOnCard.map((s) => (
                <div key={s.id}>
                  <b>{s.title}</b>
                  <small>{s.artist}</small>
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
