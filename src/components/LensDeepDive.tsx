"use client";

import { useState } from "react";
import Link from "next/link";
import type { Lens } from "@/data/lenses";
import type { DeepDive } from "@/data/deep-dives";
import ScoreRing from "./ScoreRing";
import SpectrumBar from "./SpectrumBar";
import Sparkline from "./Sparkline";
import { getRegime } from "@/data/lenses";

export default function LensDeepDive({
  lens,
  deepDive,
}: {
  lens: Lens;
  deepDive: DeepDive;
}) {
  const [expandedIndicator, setExpandedIndicator] = useState<number | null>(
    null
  );

  const accent = lens.tier === 1 ? "#c97f4a" : "#4a7c9e";
  const accentBg =
    lens.tier === 1 ? "rgba(201,127,74," : "rgba(74,124,158,";
  const regime = getRegime(lens.score);

  const divider = (
    <div
      className="my-8"
      style={{
        height: 1,
        background:
          "linear-gradient(to right, transparent, " + accentBg + "0.15), transparent)",
      }}
    />
  );

  return (
    <div
      style={{
        background: "#0a0f1a",
        minHeight: "100vh",
        color: "#e8e0d4",
        overflowX: "hidden",
      }}
    >
      {/* Atmosphere */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-20%",
            right: "-10%",
            width: "60%",
            height: "60%",
            background: `radial-gradient(ellipse, ${accentBg}0.06), transparent 70%)`,
          }}
        />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6">
        {/* Back nav */}
        <nav className="pt-6 pb-2">
          <Link
            href="/"
            className="font-data inline-flex items-center gap-1.5 transition-colors duration-300"
            style={{
              fontSize: "0.65rem",
              color: accentBg + "0.4)",
              letterSpacing: "0.08em",
              textDecoration: "none",
            }}
          >
            <span style={{ fontSize: "0.8rem" }}>&larr;</span> BACK TO INDEX
          </Link>
        </nav>

        {/* Header */}
        <header className="pt-4 pb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span
                  className="font-data"
                  style={{ fontSize: "1.2rem", color: accent }}
                >
                  {lens.icon}
                </span>
                <h1
                  className="font-display"
                  style={{
                    fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
                    fontWeight: 700,
                    color: "#e8e0d4",
                    lineHeight: 1.2,
                  }}
                >
                  {lens.name}
                </h1>
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
                  fontSize: "0.85rem",
                  color: "rgba(232,224,212,0.45)",
                  fontStyle: "italic",
                  lineHeight: 1.6,
                  maxWidth: 480,
                }}
              >
                {lens.tagline}
              </p>
              <div
                className="font-data mt-2"
                style={{
                  fontSize: "0.55rem",
                  color: "rgba(232,224,212,0.3)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Framework: {lens.framework} &middot; Weight:{" "}
                {Math.round(lens.weight * 100)}%
              </div>
            </div>
            <div className="flex flex-col items-center shrink-0">
              <ScoreRing score={lens.score} size={90} />
              <div
                className="font-data mt-1"
                style={{
                  fontSize: "0.55rem",
                  color: regime.color,
                  letterSpacing: "0.04em",
                }}
              >
                {regime.label}
              </div>
            </div>
          </div>
        </header>

        {/* Current Metrics Summary */}
        <section
          className="border rounded-xl p-5 mb-2"
          style={{
            borderColor: accentBg + "0.1)",
            background:
              "linear-gradient(135deg, rgba(17,24,39,0.85), rgba(10,15,26,0.95))",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2
              className="font-data"
              style={{
                fontSize: "0.6rem",
                color: accentBg + "0.4)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Current Readings
            </h2>
            {lens.metrics.some((m) => m.feedId) && (
              <span
                className="font-data flex items-center gap-1"
                style={{
                  fontSize: "0.5rem",
                  color: "rgba(74,222,128,0.5)",
                  letterSpacing: "0.04em",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: "#4ade80",
                    opacity: 0.7,
                  }}
                />
                LIVE VIA FRED
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3">
            {lens.metrics.map((m, i) => (
              <div
                key={i}
                className={m.big ? "sm:col-span-2 p-3 rounded-lg mb-1" : ""}
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
                  className="font-data flex items-center gap-1.5"
                  style={{
                    fontSize: "0.55rem",
                    color: "rgba(232,224,212,0.3)",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  {m.label}
                  {m.feedId && (
                    <span
                      title="Live data · FRED"
                      style={{
                        display: "inline-block",
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: "#4ade80",
                        animation: "liveDotPulse 3s ease-in-out infinite",
                        flexShrink: 0,
                      }}
                    />
                  )}
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
          <Sparkline
            data={lens.sparkData}
            label={lens.sparkLabel}
            color={accent}
          />
        </section>

        {divider}

        {/* Why This Matters */}
        <section className="py-4">
          <h2
            className="font-display"
            style={{
              fontSize: "1.3rem",
              color: "#e8e0d4",
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            Why This Matters
          </h2>
          <div className="flex flex-col gap-4">
            {deepDive.whyThisMatters.map((p, i) => (
              <p
                key={i}
                className="font-editorial"
                style={{
                  fontSize: "0.9rem",
                  lineHeight: 1.8,
                  color: "rgba(232,224,212,0.65)",
                }}
              >
                {p}
              </p>
            ))}
          </div>
        </section>

        {divider}

        {/* Key Indicators Explained */}
        <section className="py-4">
          <h2
            className="font-display"
            style={{
              fontSize: "1.3rem",
              color: "#e8e0d4",
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            Key Indicators Explained
          </h2>
          <p
            className="font-editorial"
            style={{
              fontSize: "0.75rem",
              color: "rgba(232,224,212,0.3)",
              marginBottom: 16,
              fontStyle: "italic",
            }}
          >
            What each metric measures, why it matters, and what the current
            reading tells us.
          </p>
          <div className="flex flex-col gap-2">
            {deepDive.indicators.map((ind, i) => (
              <div
                key={i}
                className="border rounded-lg overflow-hidden transition-all duration-300"
                style={{
                  borderColor: accentBg + "0.08)",
                  background: "rgba(17,24,39,0.4)",
                }}
              >
                <button
                  onClick={() =>
                    setExpandedIndicator(expandedIndicator === i ? null : i)
                  }
                  className="w-full text-left p-4 flex items-center justify-between gap-3 cursor-pointer"
                >
                  <h3
                    className="font-display"
                    style={{
                      fontSize: "0.95rem",
                      color: "#e8e0d4",
                      fontWeight: 600,
                    }}
                  >
                    {ind.title}
                  </h3>
                  <span
                    className="font-data shrink-0"
                    style={{
                      fontSize: "0.6rem",
                      color: accentBg + "0.3)",
                    }}
                  >
                    {expandedIndicator === i ? "▲" : "▼"}
                  </span>
                </button>
                <div
                  className="overflow-hidden transition-all duration-500"
                  style={{
                    maxHeight: expandedIndicator === i ? 500 : 0,
                    opacity: expandedIndicator === i ? 1 : 0,
                  }}
                >
                  <div
                    className="px-4 pb-4"
                    style={{
                      borderTop: `1px solid ${accentBg}0.06)`,
                      paddingTop: 12,
                    }}
                  >
                    <p
                      className="font-editorial"
                      style={{
                        fontSize: "0.85rem",
                        lineHeight: 1.75,
                        color: "rgba(232,224,212,0.55)",
                      }}
                    >
                      {ind.body}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {divider}

        {/* Historical Context */}
        <section className="py-4">
          <h2
            className="font-display"
            style={{
              fontSize: "1.3rem",
              color: "#e8e0d4",
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            Historical Context
          </h2>
          <p
            className="font-editorial"
            style={{
              fontSize: "0.75rem",
              color: "rgba(232,224,212,0.3)",
              marginBottom: 16,
              fontStyle: "italic",
            }}
          >
            How this dimension looked during previous crisis periods.
          </p>
          <div className="flex flex-col gap-4">
            {deepDive.historicalContext.map((hc, i) => (
              <div
                key={i}
                className="border-l-2 pl-4"
                style={{ borderColor: accentBg + "0.2)" }}
              >
                <h3
                  className="font-display"
                  style={{
                    fontSize: "0.95rem",
                    color: accent,
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  {hc.era}
                </h3>
                <p
                  className="font-editorial"
                  style={{
                    fontSize: "0.85rem",
                    lineHeight: 1.75,
                    color: "rgba(232,224,212,0.55)",
                  }}
                >
                  {hc.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {divider}

        {/* What the Experts Say */}
        <section className="py-4">
          <h2
            className="font-display"
            style={{
              fontSize: "1.3rem",
              color: "#e8e0d4",
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            What the Experts Say
          </h2>
          <p
            className="font-editorial"
            style={{
              fontSize: "0.75rem",
              color: "rgba(232,224,212,0.3)",
              marginBottom: 16,
              fontStyle: "italic",
            }}
          >
            Perspectives from the major cycle and macro thinkers.
          </p>
          <div className="flex flex-col gap-3">
            {deepDive.experts.map((exp, i) => (
              <div
                key={i}
                className="border rounded-lg p-4"
                style={{
                  borderColor: accentBg + "0.08)",
                  background: "rgba(17,24,39,0.4)",
                }}
              >
                <div className="flex items-baseline gap-2 mb-2 flex-wrap">
                  <h4
                    className="font-display"
                    style={{
                      fontSize: "0.95rem",
                      color: "#e8e0d4",
                      fontWeight: 600,
                    }}
                  >
                    {exp.name}
                  </h4>
                  <span
                    className="font-data"
                    style={{
                      fontSize: "0.55rem",
                      color: accentBg + "0.35)",
                    }}
                  >
                    {exp.framework}
                  </span>
                </div>
                <p
                  className="font-editorial"
                  style={{
                    fontSize: "0.85rem",
                    lineHeight: 1.75,
                    color: "rgba(232,224,212,0.55)",
                  }}
                >
                  {exp.view}
                </p>
              </div>
            ))}
          </div>
        </section>

        {divider}

        {/* What to Watch */}
        <section className="py-4">
          <h2
            className="font-display"
            style={{
              fontSize: "1.3rem",
              color: "#e8e0d4",
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            What to Watch
          </h2>
          <p
            className="font-editorial"
            style={{
              fontSize: "0.75rem",
              color: "rgba(232,224,212,0.3)",
              marginBottom: 16,
              fontStyle: "italic",
            }}
          >
            Leading indicators that could shift this score.
          </p>
          <div className="flex flex-col gap-3">
            {deepDive.whatToWatch.map((w, i) => (
              <div
                key={i}
                className="flex gap-3 items-start"
              >
                <div
                  className="shrink-0 mt-1.5"
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: accent,
                    opacity: 0.6,
                  }}
                />
                <div>
                  <h4
                    className="font-display"
                    style={{
                      fontSize: "0.9rem",
                      color: "#e8e0d4",
                      fontWeight: 600,
                      marginBottom: 4,
                    }}
                  >
                    {w.title}
                  </h4>
                  <p
                    className="font-editorial"
                    style={{
                      fontSize: "0.85rem",
                      lineHeight: 1.75,
                      color: "rgba(232,224,212,0.55)",
                    }}
                  >
                    {w.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {divider}

        {/* Back to Index */}
        <footer className="py-8 text-center">
          <Link
            href="/"
            className="font-data inline-flex items-center gap-1.5 transition-colors duration-300"
            style={{
              fontSize: "0.7rem",
              color: accent,
              letterSpacing: "0.08em",
              textDecoration: "none",
              opacity: 0.6,
            }}
          >
            <span style={{ fontSize: "0.9rem" }}>&larr;</span> BACK TO THE
            CRISIS INDEX
          </Link>
          <div
            className="mt-4 font-data"
            style={{
              fontSize: "0.55rem",
              color: "rgba(232,224,212,0.15)",
            }}
          >
            thecrisisindex.com
          </div>
        </footer>
      </div>
    </div>
  );
}
