"use client";

import { useState } from "react";
import Link from "next/link";
import type { Lens } from "@/data/lenses";
import ScoreRing from "./ScoreRing";
import SpectrumBar from "./SpectrumBar";
import Sparkline from "./Sparkline";

export default function DimensionPanel({
  lens,
  active,
}: {
  lens: Lens;
  active: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  if (!active) return null;

  const accent = lens.tier === 1 ? "#c97f4a" : "#4a7c9e";
  const accentBg =
    lens.tier === 1 ? "rgba(201,127,74," : "rgba(74,124,158,";

  return (
    <div
      className="border rounded-xl transition-all duration-500"
      style={{
        borderColor: accentBg + "0.12)",
        background:
          "linear-gradient(135deg, rgba(17,24,39,0.85), rgba(10,15,26,0.95))",
      }}
    >
      {/* Header */}
      <div
        className="p-5 pb-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span
                className="font-data"
                style={{ fontSize: "0.9rem", color: accent }}
              >
                {lens.icon}
              </span>
              <h3
                className="font-display"
                style={{
                  fontSize: "1.1rem",
                  color: "#e8e0d4",
                  fontWeight: 600,
                }}
              >
                {lens.name}
              </h3>
              <span
                className="px-1.5 py-0.5 rounded font-data"
                style={{
                  fontSize: "0.5rem",
                  color: accent,
                  background: accentBg + "0.08)",
                  letterSpacing: "0.04em",
                }}
              >
                {lens.tier === 1 ? "STRUCTURAL" : "LIVED"}
              </span>
            </div>
            <p
              className="font-editorial"
              style={{
                fontSize: "0.75rem",
                color: "rgba(232,224,212,0.4)",
                fontStyle: "italic",
              }}
            >
              {lens.tagline}
            </p>
          </div>
          <ScoreRing score={lens.score} size={64} />
        </div>
      </div>

      {/* Metrics grid */}
      <div className="px-5 pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3">
          {lens.metrics.map((m, i) => (
            <div
              key={i}
              className={
                m.big ? "sm:col-span-2 p-3 rounded-lg mb-1" : ""
              }
              style={
                m.big
                  ? {
                      background: accentBg + "0.05)",
                      border: `1px solid ${accentBg}0.1)`,
                    }
                  : {}
              }
            >
              <div
                className="font-data"
                style={{
                  fontSize: "0.55rem",
                  color: "rgba(232,224,212,0.3)",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                {m.label}
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span
                  className="font-data"
                  style={{
                    fontSize: m.big ? "1.6rem" : "1.05rem",
                    color: m.big ? accent : "#e8e0d4",
                    fontWeight: 700,
                  }}
                >
                  {m.value}
                </span>
                <span
                  className="font-data"
                  style={{
                    fontSize: "0.55rem",
                    color: "rgba(232,224,212,0.25)",
                  }}
                >
                  {m.context}
                </span>
              </div>
              {m.spectrum && (
                <SpectrumBar
                  spec={m.spectrum}
                  invert={m.invert}
                  accentColor={accent}
                />
              )}
            </div>
          ))}
        </div>

        {/* Sparkline */}
        <Sparkline
          data={lens.sparkData}
          label={lens.sparkLabel}
          color={accent}
        />
      </div>

      {/* Expandable editorial */}
      <div
        className="overflow-hidden transition-all duration-500"
        style={{
          maxHeight: expanded ? 400 : 0,
          opacity: expanded ? 1 : 0,
        }}
      >
        <div
          className="px-5 pb-4 pt-3"
          style={{ borderTop: `1px solid ${accentBg}0.08)` }}
        >
          <p
            className="font-editorial"
            style={{
              fontSize: "0.85rem",
              lineHeight: 1.75,
              color: "rgba(232,224,212,0.65)",
              fontStyle: "italic",
            }}
          >
            {lens.editorial}
          </p>
          <Link
            href={`/lens/${lens.id}`}
            className="font-data inline-block mt-3 transition-opacity duration-300 hover:opacity-80"
            style={{
              fontSize: "0.6rem",
              color: accent,
              letterSpacing: "0.06em",
              textDecoration: "none",
            }}
          >
            READ THE FULL DEEP DIVE &rarr;
          </Link>
        </div>
      </div>
      <div
        className="pb-3 text-center cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <span
          className="font-data"
          style={{
            fontSize: "0.55rem",
            color: accentBg + "0.3)",
            letterSpacing: "0.08em",
          }}
        >
          {expanded ? "COLLAPSE ▲" : "READ ANALYSIS ▼"}
        </span>
      </div>
    </div>
  );
}
