"use client";

export default function Sparkline({
  data,
  label,
  color,
  height = 48,
}: {
  data: number[];
  label: string;
  color: string;
  height?: number;
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 240;
  const h = height;
  const pad = 2;

  const points = data
    .map((v, i) => {
      const x = pad + (i / (data.length - 1)) * (w - pad * 2);
      const y = h - pad - ((v - min) / range) * (h - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = points + ` ${w - pad},${h} ${pad},${h}`;
  const lastPoint = points.split(" ").pop()!.split(",");
  const gradId = `sg-${label.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12)}`;

  return (
    <div className="mt-3">
      <div
        className="font-data"
        style={{
          fontSize: "0.55rem",
          color: "rgba(232,224,212,0.3)",
          marginBottom: 4,
          letterSpacing: "0.03em",
        }}
      >
        {label}
      </div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full"
        style={{ maxWidth: 280, height }}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill={`url(#${gradId})`} />
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx={parseFloat(lastPoint[0])}
          cy={parseFloat(lastPoint[1])}
          r="3"
          fill={color}
        />
      </svg>
      <div className="flex justify-between" style={{ maxWidth: 280 }}>
        <span
          className="font-data"
          style={{ fontSize: "0.5rem", color: "rgba(232,224,212,0.2)" }}
        >
          {data[0]}
        </span>
        <span
          className="font-data"
          style={{ fontSize: "0.55rem", color, fontWeight: 700 }}
        >
          {data[data.length - 1]}
        </span>
      </div>
    </div>
  );
}
