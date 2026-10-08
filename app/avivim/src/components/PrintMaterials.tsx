import { useState } from "react";
import { Printer, Star } from "lucide-react";
import type { State } from "../engine";
export function PrintMaterials({ state }: { state: State }) {
  const [kind, setKind] = useState("Tarjetas A, B y C");
  const kinds = [
    "Tarjetas A, B y C",
    "Carteles de equipos",
    "Tarjetas de mímica",
    "Tarjetas de desafíos",
    "Planilla de puntajes",
    "Guion del conductor",
    "Diplomas de participación",
    "Diploma del ganador",
  ];
  return (
    <>
      <div className="toolbar">
        <select
          aria-label="Material a imprimir"
          value={kind}
          onChange={(e) => setKind(e.target.value)}
        >
          {kinds.map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>
        <button onClick={() => window.print()}>
          <Printer size={18} /> Imprimir A4
        </button>
      </div>
      <div className="print-area">
        <h1>MAZAL TOC AVIVIM</h1>
        <p>¡El pasado vuelve a jugar! · Bet Am del Oeste</p>
        <h2>{kind}</h2>
        {kind === "Tarjetas A, B y C" ? (
          <div className="print-grid">
            {["A", "B", "C"].map((c) => (
              <div className="print-card letter" key={c}>
                {c}
              </div>
            ))}
          </div>
        ) : kind === "Carteles de equipos" ? (
          state.teams.map((t) => (
            <div className="print-card" key={t.id}>
              <h1>{t.name}</h1>
            </div>
          ))
        ) : kind === "Tarjetas de mímica" || kind === "Tarjetas de desafíos" ? (
          state.bank
            .filter((q) =>
              kind === "Tarjetas de mímica" ? q.round === 5 : q.round === 6,
            )
            .map((q) => (
              <div className="print-card" key={q.id}>
                {q.round === 5 && (
                  <p>
                    <b>Tarjeta de mímica M{q.id.replace(/[^0-9]/g, "")}</b>
                  </p>
                )}
                <h2>{q.text}</h2>
                <p>
                  {q.duration} segundos · {q.points} puntos · Se puede
                  participar sentado.
                </p>
              </div>
            ))
        ) : kind === "Planilla de puntajes" ? (
          <table>
            <thead>
              <tr>
                <th>Equipo</th>
                {state.roundNames.map((_, i) => (
                  <th key={i}>R{i + 1}</th>
                ))}
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {state.teams.map((t) => (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  {state.roundNames.map((_, i) => (
                    <td key={i}>_____</td>
                  ))}
                  <td>{t.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : kind === "Guion del conductor" ? (
          <>
            <p>
              Bienvenidos a MAZAL TOC AVIVIM. Hoy jugamos para recordar y
              compartir. No hace falta apurarse; todos pueden participar.
            </p>
            {state.roundNames.map((n, i) => (
              <div key={n}>
                <h2>
                  {i + 1}. {n}
                </h2>
                <p>
                  Presentá la ronda. Elegí el equipo. Mostrá la pregunta, iniciá
                  el tiempo y escuchá la respuesta. Confirmá la elección antes
                  de revelar la solución y registrar el resultado. En mímica,
                  entregá la tarjeta impresa cuyo código aparece en pantalla;
                  nadie necesita ponerse de pie. En la final, bloqueá todas las
                  apuestas antes de mostrar la pregunta. Todos escriben su
                  respuesta al mismo tiempo: recogé los papeles, registrá cada
                  respuesta y recién después revelá la solución.
                </p>
              </div>
            ))}
            <p>
              Ante un empate, usá el botón de desempate del panel. Permití una
              respuesta a cada equipo empatado y finalizá nuevamente. Cerrá con
              un aplauso para todos.
            </p>
          </>
        ) : (
          <div className="print-card diploma">
            <Star size={55} />
            <p>BET AM DEL OESTE · COMUNIDAD AVIVIM</p>
            <h1>
              Diploma{" "}
              {kind === "Diploma del ganador"
                ? "del equipo ganador"
                : "de participación"}
            </h1>
            <h2>
              {kind === "Diploma del ganador"
                ? [...state.teams]
                    .sort((a, b) => b.score - a.score)
                    .filter(
                      (t) =>
                        t.score ===
                        Math.max(...state.teams.map((x) => x.score)),
                    )
                    .map((t) => t.name)
                    .join(" · ")
                : "Nombre: ________________________"}
            </h2>
            <p>
              Por compartir sus recuerdos, su alegría y su espíritu de equipo.
            </p>
            <p>Fecha: __________________ · Firma: __________________</p>
          </div>
        )}
      </div>
    </>
  );
}
