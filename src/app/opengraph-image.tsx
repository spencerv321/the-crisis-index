import { ImageResponse } from "next/og";
import { LENSES, getRegime } from "@/data/lenses";

export const runtime = "edge";
export const alt = "The Crisis Index — Six structural forces. One composite score.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const totalWeight = LENSES.reduce((s, l) => s + l.weight, 0);
  const score = Math.round(
    LENSES.reduce((s, l) => s + l.score * (l.weight / totalWeight), 0)
  );
  const regime = getRegime(score);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0f1a",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 64,
            fontWeight: 800,
            color: "#e8e0d4",
            marginBottom: 16,
            letterSpacing: "-0.02em",
          }}
        >
          The Crisis Index
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 16,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 96,
              fontWeight: 700,
              color: regime.color,
              lineHeight: 1,
            }}
          >
            {score}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              color: regime.color,
              fontWeight: 600,
              opacity: 0.8,
            }}
          >
            {regime.label}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 22,
            color: "rgba(232,224,212,0.4)",
            fontStyle: "italic",
          }}
        >
          Six structural forces. One composite score.
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 40,
            fontSize: 16,
            color: "rgba(201,127,74,0.3)",
            letterSpacing: "0.1em",
          }}
        >
          thecrisisindex.com
        </div>
      </div>
    ),
    { ...size }
  );
}
