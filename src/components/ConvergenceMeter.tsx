"use client";

export default function ConvergenceMeter({
  n,
  total,
}: {
  n: number;
  total: number;
}) {
  const labels = ["", "", "Low", "Moderate", "High", "Very High", "Full"];
  const colors = [
    "#555",
    "#555",
    "#6a8a72",
    "#c9a84a",
    "#c97f4a",
    "#c97f4a",
    "#c44a2e",
  ];

  return (
    <div
      className="rounded-lg p-3"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(201,127,74,0.06)",
      }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span
          className="font-data"
          style={{
            fontSize: "0.6rem",
            color: "rgba(232,224,212,0.35)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Lens Convergence
        </span>
        <span
          className="font-data"
          style={{
            fontSize: "0.7rem",
            color: colors[n],
            fontWeight: 700,
          }}
        >
          {labels[n] || ""} · {n}/{total}
        </span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-all duration-500"
            style={{
              background:
                i < n ? colors[n] : "rgba(255,255,255,0.04)",
            }}
          />
        ))}
      </div>
      {n >= 3 && (
        <p
          className="font-editorial"
          style={{
            fontSize: "0.7rem",
            color: "rgba(232,224,212,0.3)",
            fontStyle: "italic",
            marginTop: 6,
          }}
        >
          {n >= 5
            ? "Multiple independent systems pointing the same direction. Structural change becomes highly likely."
            : "Independent frameworks reinforcing each other. These aren't separate problems."}
        </p>
      )}
    </div>
  );
}
