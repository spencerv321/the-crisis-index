"use client";

import { useState, useMemo } from "react";
import { LENSES as STATIC_LENSES, SHOCK_EVENTS as STATIC_EVENTS, getRegime } from "@/data/lenses";
import type { Lens, ShockEvent } from "@/data/lenses";
import ScoreRing from "./ScoreRing";
import LensToggle from "./LensToggle";
import ConvergenceMeter from "./ConvergenceMeter";
import DimensionPanel from "./DimensionPanel";
import ShockEvents from "./ShockEvents";
import HistoricalTable from "./HistoricalTable";
import Perspectives from "./Perspectives";
import EmailCapture from "./EmailCapture";

interface Props {
  lenses?: Lens[];
  shockEvents?: ShockEvent[];
  lastRefresh?: string | null;
}

export default function CrisisIndex({ lenses, shockEvents, lastRefresh }: Props) {
  const LENSES = lenses || STATIC_LENSES;
  const events = shockEvents || STATIC_EVENTS;

  const [activeIds, setActiveIds] = useState<Set<string>>(
    new Set(LENSES.map((l) => l.id))
  );

  const toggle = (id: string) => {
    setActiveIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const active = LENSES.filter((l) => activeIds.has(l.id));

  const score = useMemo(() => {
    if (!active.length) return 0;
    const totalWeight = active.reduce((s, l) => s + l.weight, 0);
    return Math.round(
      active.reduce((s, l) => s + l.score * (l.weight / totalWeight), 0)
    );
  }, [active]);

  const regime = getRegime(score);
  const glow = (active.length / LENSES.length) * 0.07;

  const divider = (
    <div
      className="my-6"
      style={{
        height: 1,
        background:
          "linear-gradient(to right, transparent, rgba(201,127,74,0.12), transparent)",
      }}
    />
  );

  return (
    <div style={{ background: "#0a0f1a", minHeight: "100vh", color: "#e8e0d4", overflowX: "hidden" }}>
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
            background: `radial-gradient(ellipse, rgba(201,127,74,${glow}), transparent 70%)`,
            transition: "background 1s",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-10%",
            left: "-10%",
            width: "50%",
            height: "50%",
            background: `radial-gradient(ellipse, rgba(74,124,158,${glow * 0.6}), transparent 70%)`,
            transition: "background 1s",
          }}
        />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <header className="pt-12 sm:pt-16 pb-2 text-center">
          <div
            className="font-data"
            style={{
              fontSize: "0.6rem",
              letterSpacing: "0.2em",
              color: "rgba(201,127,74,0.35)",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            Updated March 2026
          </div>
          <h1
            className="font-display"
            style={{
              fontSize: "clamp(2.2rem, 6vw, 3.5rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: 10,
              background:
                "linear-gradient(135deg, #e8e0d4 30%, #c97f4a 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            The Crisis Index
          </h1>
          <p
            className="font-editorial"
            style={{
              fontSize: "0.95rem",
              color: "rgba(232,224,212,0.4)",
              maxWidth: 440,
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            Six structural forces. One composite score.
            <br />A framework for why everything feels like it&apos;s
            shifting.
          </p>
        </header>

        {/* Score */}
        <section className="py-8 flex flex-col items-center text-center">
          <ScoreRing score={score} size={190} />
          <div className="mt-4">
            <div
              className="font-data"
              style={{
                fontSize: "0.65rem",
                color: "rgba(232,224,212,0.3)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              Composite · {active.length}/{LENSES.length} lenses
            </div>
            <div
              className="font-display"
              style={{
                fontSize: "1.4rem",
                color: regime.color,
                fontWeight: 600,
                transition: "color 0.5s",
              }}
            >
              {active.length ? regime.label : "—"}
            </div>
            {!active.length && (
              <p
                className="font-editorial"
                style={{
                  fontSize: "0.8rem",
                  color: "rgba(232,224,212,0.3)",
                  marginTop: 6,
                  fontStyle: "italic",
                }}
              >
                Toggle lenses below to build your view.
              </p>
            )}
            {lastRefresh && (
              <div
                className="font-data"
                style={{
                  fontSize: "0.65rem",
                  color: "rgba(232,224,212,0.25)",
                  marginTop: 8,
                  letterSpacing: "0.04em",
                }}
              >
                Data as of{" "}
                {new Date(lastRefresh).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            )}
          </div>
        </section>

        {divider}

        {/* Toggles */}
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
            Choose Your Lenses
          </h2>
          <p
            className="font-editorial"
            style={{
              fontSize: "0.75rem",
              color: "rgba(232,224,212,0.3)",
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            Each lens is a distinct framework. Toggle to see how they
            compound.
          </p>
          <div className="mb-3">
            <div
              className="font-data"
              style={{
                fontSize: "0.55rem",
                color: "rgba(201,127,74,0.4)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Tier 1 — Structural Forces
            </div>
            <div className="flex flex-col gap-1.5">
              {LENSES.filter((l) => l.tier === 1).map((l) => (
                <LensToggle
                  key={l.id}
                  lens={l}
                  active={activeIds.has(l.id)}
                  onToggle={() => toggle(l.id)}
                />
              ))}
            </div>
          </div>
          <div className="mb-4">
            <div
              className="font-data"
              style={{
                fontSize: "0.55rem",
                color: "rgba(74,124,158,0.4)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Tier 2 — Lived Dimensions
            </div>
            <div className="flex flex-col gap-1.5">
              {LENSES.filter((l) => l.tier === 2).map((l) => (
                <LensToggle
                  key={l.id}
                  lens={l}
                  active={activeIds.has(l.id)}
                  onToggle={() => toggle(l.id)}
                />
              ))}
            </div>
          </div>
          <ConvergenceMeter n={active.length} total={LENSES.length} />
        </section>

        {divider}

        {/* Dimension panels */}
        {active.length > 0 && (
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
              Active Lenses
            </h2>
            <p
              className="font-editorial"
              style={{
                fontSize: "0.75rem",
                color: "rgba(232,224,212,0.3)",
                textAlign: "center",
                marginBottom: 16,
              }}
            >
              Real data. Real sources. Tap any panel for analysis.
            </p>
            <div className="flex flex-col gap-4">
              {LENSES.map((l) => (
                <DimensionPanel
                  key={l.id}
                  lens={l}
                  active={activeIds.has(l.id)}
                />
              ))}
            </div>
          </section>
        )}

        {divider}

        <ShockEvents events={events} lenses={LENSES} />

        {divider}

        <HistoricalTable activeLenses={active} />

        {divider}

        <Perspectives />

        {divider}

        <EmailCapture />

        {divider}

        {/* Methodology */}
        <section className="py-4 text-center">
          <h2
            className="font-display"
            style={{
              fontSize: "1.1rem",
              color: "#e8e0d4",
              marginBottom: 10,
            }}
          >
            Methodology
          </h2>
          <p
            className="font-editorial"
            style={{
              fontSize: "0.75rem",
              color: "rgba(232,224,212,0.3)",
              maxWidth: 500,
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            The Crisis Index is a weighted composite of six dimensions
            scored 0–100 from public data: FRED, Gallup, Pew, BLS,
            World Gold Council, SIPRI, IMF, and CDC. Framework draws on
            Strauss-Howe, Dalio, Napier, Gromen, Hunt, Williams, and
            Kofinas. Not prophecy. Not financial advice. A compass, not
            a crystal ball.
          </p>
        </section>

        {/* Footer */}
        <footer
          className="py-8 text-center"
          style={{
            borderTop: "1px solid rgba(201,127,74,0.04)",
          }}
        >
          <div
            className="font-data"
            style={{
              fontSize: "0.6rem",
              color: "rgba(232,224,212,0.18)",
              lineHeight: 2,
            }}
          >
            <div>
              Built by{" "}
              <span style={{ color: "rgba(201,127,74,0.4)" }}>
                @spencervail
              </span>
            </div>
            <div>
              <span style={{ color: "rgba(201,127,74,0.3)" }}>
                amicooked.io
              </span>{" "}
              ·{" "}
              <span style={{ color: "rgba(201,127,74,0.3)" }}>
                killedbyclaude.ai
              </span>
            </div>
            <div
              className="mt-2 font-editorial"
              style={{
                fontStyle: "italic",
                color: "rgba(232,224,212,0.12)",
                fontSize: "0.7rem",
              }}
            >
              Confusion → Recognition → Clarity → Agency
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
