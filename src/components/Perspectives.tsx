"use client";

import { PERSPECTIVES } from "@/data/lenses";

export default function Perspectives() {
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
        Perspectives
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
        Where the major cycle thinkers stand.
      </p>
      <div className="flex flex-col gap-2.5">
        {PERSPECTIVES.map((p, i) => (
          <div
            key={i}
            className="border rounded-lg p-4 overflow-hidden"
            style={{
              borderColor: "rgba(201,127,74,0.06)",
              background: "rgba(17,24,39,0.4)",
            }}
          >
            <div className="flex items-baseline gap-2 mb-1 flex-wrap">
              <h4
                className="font-display"
                style={{
                  fontSize: "0.95rem",
                  color: "#e8e0d4",
                  fontWeight: 600,
                }}
              >
                {p.name}
              </h4>
              <span
                className="font-data"
                style={{
                  fontSize: "0.55rem",
                  color: "rgba(201,127,74,0.35)",
                }}
              >
                {p.role}
              </span>
            </div>
            <p
              className="font-editorial break-words"
              style={{
                fontSize: "0.8rem",
                color: "rgba(232,224,212,0.5)",
                lineHeight: 1.6,
              }}
            >
              {p.view}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
