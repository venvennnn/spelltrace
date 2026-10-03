"use client";

type Point = { x: string; y: number | null; label?: string };

export function EditorialChart({
  title,
  points,
  unit,
  caption,
}: {
  title: string;
  points: Point[];
  unit: string;
  caption?: string;
}) {
  const nums = points.map((p) => p.y).filter((v): v is number => v != null);
  const max = Math.max(...nums, 1);
  const min = Math.min(...nums, 0);
  const w = 640;
  const h = 220;
  const pad = { l: 36, r: 16, t: 16, b: 36 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const scaleY = (v: number) => pad.t + ((max - v) / (max - min || 1)) * innerH;

  return (
    <figure className="overflow-x-hidden rounded-2xl border border-line bg-white p-3">
      <figcaption className="mb-2 font-display text-lg text-ink">{title}</figcaption>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-[220px] w-full" role="img" aria-label={title}>
        {points.map((p, i) => {
          if (p.y == null) return null;
          const x = pad.l + (i / Math.max(points.length - 1, 1)) * innerW;
          const y = scaleY(p.y);
          const next = points.slice(i + 1).find((n) => n.y != null);
          const nextIdx = next ? points.indexOf(next) : -1;
          return (
            <g key={p.x}>
              {next && next.y != null && (
                <line
                  x1={x}
                  y1={y}
                  x2={pad.l + (nextIdx / Math.max(points.length - 1, 1)) * innerW}
                  y2={scaleY(next.y)}
                  stroke="#1F6B66"
                  strokeWidth={2}
                />
              )}
              <circle cx={x} cy={y} r={4} fill="#1F6B66" />
              <text x={x} y={y - 10} textAnchor="middle" className="chart-label">
                {p.y}
                {unit}
              </text>
              <text x={x} y={h - 10} textAnchor="middle" className="chart-label" fill="#5C564E">
                {p.x}
              </text>
            </g>
          );
        })}
      </svg>
      {caption && <p className="mt-1 text-xs text-muted">{caption}</p>}
    </figure>
  );
}
