"use client";

import type { SpectrumDef } from "@/data/lenses";

export default function SpectrumBar({
  spec,
  invert,
  accentColor,
}: {
  spec: SpectrumDef;
  invert?: boolean;
  accentColor: string;
}) {
  const range = spec.max - spec.min;
  const pct = Math.max(
    0,
    Math.min(100, ((spec.val - spec.min) / range) * 100)
  );

  return (
    <div className="mt-1.5">
      <div className="flex justify-between mb-0.5">
        <span
          className="font-data"
          style={{ fontSize: "0.5rem", color: "rgba(232,224,212,0.38)" }}
        >
          {spec.leftLabel}
        </span>
        <span
          className="font-data"
          style={{ fontSize: "0.5rem", color: "rgba(232,224,212,0.38)" }}
        >
          {spec.rightLabel}
        </span>
      </div>
      <div
        className="relative h-1.5 rounded-full"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <div
          className="absolute top-1/2 h-3.5 w-3.5 rounded-full border-2 transition-all duration-700"
          style={{
            left: `calc(${pct}% - 7px)`,
            transform: "translateY(-50%)",
            background: "#0a0f1a",
            borderColor: accentColor,
            boxShadow: `0 0 8px ${accentColor}44`,
          }}
        />
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(to right, ${accentColor}33, ${accentColor}88)`,
          }}
        />
      </div>
    </div>
  );
}
