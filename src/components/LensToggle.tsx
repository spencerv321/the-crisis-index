"use client";

import type { Lens } from "@/data/lenses";

export default function LensToggle({
  lens,
  active,
  onToggle,
}: {
  lens: Lens;
  active: boolean;
  onToggle: () => void;
}) {
  const c =
    lens.tier === 1
      ? { on: "rgba(201,127,74,", accent: "#c97f4a" }
      : { on: "rgba(74,124,158,", accent: "#4a7c9e" };

  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 text-left w-full cursor-pointer"
      style={{
        background: active ? c.on + "0.08)" : "rgba(255,255,255,0.015)",
        border: `1px solid ${active ? c.on + "0.3)" : c.on + "0.06)"}`,
        opacity: active ? 1 : 0.45,
      }}
    >
      <div
        className="relative flex-shrink-0 w-10 h-5 rounded-full transition-all duration-300"
        style={{
          background: active ? c.accent : "rgba(255,255,255,0.08)",
        }}
      >
        <div
          className="absolute top-0.5 rounded-full w-4 h-4 transition-all duration-300"
          style={{
            left: active ? 20 : 2,
            background: active ? "#e8e0d4" : "rgba(255,255,255,0.2)",
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="font-display"
            style={{
              fontSize: "0.85rem",
              color: active ? "#e8e0d4" : "rgba(232,224,212,0.35)",
            }}
          >
            {lens.name}
          </span>
          {active && (
            <span
              className="font-data"
              style={{
                fontSize: "0.7rem",
                color: c.accent,
                fontWeight: 700,
              }}
            >
              {lens.score}
            </span>
          )}
        </div>
        <span
          className="font-data"
          style={{
            fontSize: "0.55rem",
            color: "rgba(232,224,212,0.25)",
            letterSpacing: "0.04em",
          }}
        >
          {lens.framework}
        </span>
      </div>
    </button>
  );
}
