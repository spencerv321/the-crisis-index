"use client";

import { SHOCK_EVENTS as STATIC_EVENTS, LENSES as STATIC_LENSES } from "@/data/lenses";
import type { ShockEvent as ShockEventType, Lens } from "@/data/lenses";

function ShockEventItem({
  event,
  lenses,
}: {
  event: ShockEventType;
  lenses: Lens[];
}) {
  const lens = lenses.find((l) => l.id === event.lens);
  const accent = lens?.tier === 1 ? "#c97f4a" : "#4a7c9e";
  const deltaNum = Math.abs(parseInt(event.delta) || 0);
  const isLarge = deltaNum >= 5;

  return (
    <div
      className="flex gap-3 py-3"
      style={{
        borderBottom: "1px solid rgba(255,255,255,0.025)",
        ...(isLarge
          ? {
              background: `linear-gradient(90deg, ${accent}08, transparent)`,
              borderLeft: `2px solid ${accent}`,
              paddingLeft: 10,
              marginLeft: -3,
              borderRadius: 4,
            }
          : {}),
      }}
    >
      <div className="flex-shrink-0 text-center" style={{ width: 46 }}>
        <div
          className="font-data"
          style={{
            fontSize: "0.6rem",
            color: "rgba(232,224,212,0.3)",
          }}
        >
          {event.date}
        </div>
        <div
          className="font-data"
          style={{
            fontSize: isLarge ? "1rem" : "0.8rem",
            color: accent,
            fontWeight: 700,
          }}
        >
          {event.delta}
        </div>
      </div>
      <div className="flex-1">
        <span
          className="inline-block px-1.5 py-0.5 rounded mb-0.5 font-data"
          style={{
            fontSize: "0.5rem",
            background: `${accent}15`,
            color: accent,
          }}
        >
          {event.lensName}
        </span>
        <div
          className="font-editorial"
          style={{
            fontSize: isLarge ? "0.85rem" : "0.8rem",
            color: isLarge ? "rgba(232,224,212,0.8)" : "rgba(232,224,212,0.65)",
            lineHeight: 1.4,
            fontWeight: isLarge ? 500 : 400,
          }}
        >
          {event.event}
        </div>
        <div
          className="font-data"
          style={{
            fontSize: "0.6rem",
            color: "rgba(232,224,212,0.3)",
            marginTop: 2,
          }}
        >
          {event.detail}
        </div>
      </div>
    </div>
  );
}

interface Props {
  events?: ShockEventType[];
  lenses?: Lens[];
}

export default function ShockEvents({ events, lenses }: Props) {
  const shockEvents = events || STATIC_EVENTS;
  const allLenses = lenses || STATIC_LENSES;

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
        What Moved the Index
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
        Recent events and their structural impact.
      </p>
      <div
        className="rounded-xl p-3"
        style={{
          background: "rgba(17,24,39,0.5)",
          border: "1px solid rgba(201,127,74,0.06)",
        }}
      >
        {shockEvents.map((e, i) => (
          <ShockEventItem key={i} event={e} lenses={allLenses} />
        ))}
      </div>
    </section>
  );
}
