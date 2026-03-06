"use client";

import { LENSES, HISTORICAL_ERAS, getRegime } from "@/data/lenses";
import type { Lens } from "@/data/lenses";

export default function HistoricalTable({
  activeLenses,
}: {
  activeLenses: Lens[];
}) {
  const ids = new Set(activeLenses.map((l) => l.id));

  return (
    <section className="py-4">
      <h2
        className="font-display"
        style={{
          fontSize: "1.2rem",
          color: "#e8e0d4",
          textAlign: "center",
          marginBottom: 3,
        }}
      >
        Historical Context
      </h2>
      <p
        className="font-editorial"
        style={{
          fontSize: "0.75rem",
          color: "rgba(232,224,212,0.3)",
          textAlign: "center",
          marginBottom: 12,
        }}
      >
        How does today compare to previous crisis eras?
      </p>
      <div
        className="rounded-xl p-3"
        style={{
          background: "rgba(17,24,39,0.5)",
          border: "1px solid rgba(201,127,74,0.06)",
        }}
      >
        <div className="overflow-x-auto">
          <table
            className="w-full"
            style={{ borderCollapse: "separate", borderSpacing: 0 }}
          >
            <thead>
              <tr>
                <th
                  className="font-data"
                  style={{
                    fontSize: "0.55rem",
                    color: "rgba(232,224,212,0.25)",
                    textAlign: "left",
                    padding: "6px 10px",
                    letterSpacing: "0.08em",
                  }}
                >
                  ERA
                </th>
                {LENSES.map((l) => (
                  <th
                    key={l.id}
                    className="font-data"
                    style={{
                      fontSize: "0.5rem",
                      color: ids.has(l.id)
                        ? l.tier === 1
                          ? "#c97f4a"
                          : "#4a7c9e"
                        : "rgba(232,224,212,0.1)",
                      textAlign: "center",
                      padding: "6px 4px",
                      transition: "color 0.3s",
                    }}
                  >
                    {l.shortName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HISTORICAL_ERAS.map((era) => {
                const today = era.year === "2026";
                return (
                  <tr
                    key={era.year}
                    style={{
                      background: today
                        ? "rgba(201,127,74,0.05)"
                        : "transparent",
                    }}
                  >
                    <td
                      className="font-data"
                      style={{
                        fontSize: "0.65rem",
                        color: today
                          ? "#c97f4a"
                          : "rgba(232,224,212,0.4)",
                        padding: "6px 10px",
                        fontWeight: today ? 700 : 400,
                        borderBottom:
                          "1px solid rgba(255,255,255,0.025)",
                      }}
                    >
                      {era.year}{" "}
                      <span
                        style={{
                          fontSize: "0.55rem",
                          color: "rgba(232,224,212,0.2)",
                        }}
                      >
                        {era.label}
                      </span>
                    </td>
                    {LENSES.map((l) => {
                      const v = today
                        ? l.score
                        : l.historicalScores[parseInt(era.year)] || 0;
                      const isActive = ids.has(l.id);
                      return (
                        <td
                          key={l.id}
                          className="font-data"
                          style={{
                            textAlign: "center",
                            padding: "6px 4px",
                            fontSize: "0.7rem",
                            color: isActive
                              ? getRegime(v).color
                              : "rgba(232,224,212,0.08)",
                            fontWeight: today ? 700 : 400,
                            borderBottom:
                              "1px solid rgba(255,255,255,0.025)",
                            transition: "color 0.3s",
                          }}
                        >
                          {v}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p
            className="font-editorial"
            style={{
              fontSize: "0.7rem",
              color: "rgba(232,224,212,0.25)",
              fontStyle: "italic",
              textAlign: "center",
              marginTop: 10,
            }}
          >
            2026 is the first moment where all six dimensions are
            elevated simultaneously.
          </p>
        </div>
      </div>
    </section>
  );
}
