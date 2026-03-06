"use client";

import { getRegime } from "@/data/lenses";
import AnimNum from "./AnimNum";

export default function ScoreRing({
  score,
  size = 200,
}: {
  score: number;
  size?: number;
}) {
  const regime = getRegime(score);
  const r = (size - 14) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="absolute"
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="5"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={regime.color}
          strokeWidth="5"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition:
              "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1), stroke 0.5s",
          }}
        />
      </svg>
      <div className="flex flex-col items-center z-10">
        <span
          className="font-data"
          style={{
            fontSize: size > 150 ? "3.2rem" : "1.2rem",
            fontWeight: 700,
            color: regime.color,
            transition: "color 0.5s",
          }}
        >
          <AnimNum target={score} />
        </span>
      </div>
    </div>
  );
}
