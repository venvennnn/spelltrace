"use client";

import { useState } from "react";
import Link from "next/link";
import type { Driver, PatternRow, ScatterPoint, StripCell } from "@spelltrace/shared";

export function Rule() {
  return (
    <div className="flex items-center gap-2" aria-hidden>
      <i className="block h-[3px] w-[60px] bg-brick" />
      <b className="h-px flex-1 bg-line" />
    </div>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-brick">{children}</p>;
}

export function Drivers({ items }: { items: Driver[] }) {
  return (
    <section>
      <Eyebrow>What’s driving today</Eyebrow>
      <ol className="mt-1">
        {items.map((d) => (
          <li key={d.n} className="flex gap-3 border-t border-line py-3 first:border-t-0">
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[1.5px] text-xs font-semibold ${
                d.strong ? "border-brick text-brick" : "border-ink text-ink"
              }`}
            >
              {d.n}
            </span>
            <div className="text-[14px] leading-snug">
              {d.href ? (
                <Link href={d.href} className="font-semibold text-ink">
                  {d.title}
                </Link>
              ) : (
                <p className="font-semibold">{d.title}</p>
              )}
              <p className="mt-0.5 text-[13px] text-muted">{d.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function MetricStrip({ cells }: { cells: StripCell[] }) {
  return (
    <div className="grid grid-cols-4 border-y border-ink">
      {cells.map((c, i) => (
        <div key={c.label} className={`py-2.5 ${i ? "border-l border-line pl-2.5" : ""}`}>
          <p className="text-[11px] text-muted">{c.label}</p>
          <p className="text-[14px] font-medium">{c.value}</p>
          <p className={`text-[11px] ${c.alert ? "text-brick" : "text-muted"}`}>{c.note}</p>
        </div>
      ))}
    </div>
  );
}

function pct(v: number) {
  return `${Math.min(100, Math.max(0, ((v + 8) / 20) * 100))}%`;
}

export function PatternList({ rows }: { rows: PatternRow[] }) {
  const [sel, setSel] = useState(0);
  const active = rows[sel];
  return (
    <section>
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,38%)] gap-2 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-brick">
        <div>Context vs lean</div>
        <div className="flex justify-between font-medium normal-case tracking-normal text-muted">
          <span>lower</span>
          <span>lean</span>
          <span>higher</span>
        </div>
      </div>
      {rows.map((r, i) => (
        <button
          key={r.id}
          type="button"
          aria-pressed={sel === i}
          onClick={() => setSel(i)}
          className={`grid min-h-[46px] w-full grid-cols-[minmax(0,1fr)_minmax(0,38%)] items-center gap-2 border-t border-line py-1.5 text-left ${
            sel === i ? "bg-[#F4F1EC]" : "bg-transparent"
          }`}
        >
          <span className="min-w-0">
            <span className="block text-[13px] font-medium leading-snug">{r.name}</span>
            <span className="text-[11px] font-semibold tracking-[0.06em]" style={{ color: r.tagColor }}>
              {r.tag}
            </span>
          </span>
          <span className="relative block h-5 min-w-0 overflow-hidden">
            <span className="absolute left-1/2 top-0 h-5 w-px -translate-x-px bg-[#B9B6AD]" />
            <span
              className="absolute top-[9px] h-0.5"
              style={{ left: pct(r.lo), width: `max(2px, calc(${pct(r.hi)} - ${pct(r.lo)}))`, background: r.tagColor }}
            />
            <span
              className="absolute top-1 h-3 w-3 -translate-x-1/2 rounded-full border-[1.5px] box-border"
              style={{
                left: pct(r.est),
                background: r.tag === "FORMING" || r.tag === "NO CLEAR EFFECT" ? "#fff" : r.tagColor,
                borderColor: r.tagColor,
              }}
            />
          </span>
        </button>
      ))}
      <p className="border-t border-line pt-1.5 text-[11px] leading-snug text-muted">
        Dot = lean gap when this was true · line = range · grey = no effect. Association, not cause.
      </p>
      {active && (
        <div className="mt-3 border-t-2 border-brick pt-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-brick">{active.tag}</p>
          <p className="font-display text-[18px] font-semibold leading-snug">
            {active.name}: {active.est > 0 ? "+" : ""}
            {active.est}°
          </p>
          <p className="mt-1 text-[13px] leading-snug text-[#4A4A4A]">{active.note}</p>
        </div>
      )}
    </section>
  );
}

export function SleepScatter({ points }: { points: ScatterPoint[] }) {
  const w = 342;
  const h = 168;
  const x = (hours: number) => 30 + ((hours - 6) / 2.5) * 304;
  const ys = points.map((p) => p.y);
  const minY = Math.min(...ys, 8);
  const maxY = Math.max(...ys, 20);
  const y = (lean: number) => 140 - ((lean - minY) / Math.max(1, maxY - minY)) * 128;
  const zoneX = x(7);
  return (
    <section>
      <Eyebrow>Sleep vs trunk lean</Eyebrow>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Sleep hours versus trunk lean">
        <rect x={zoneX} y={8} width={x(8.5) - zoneX} height={132} fill="#F4EFEA" />
        <line x1={zoneX} y1={8} x2={zoneX} y2={140} stroke="#A63A2E" strokeWidth={1} strokeDasharray="3 3" />
        <line x1={30} y1={140} x2={334} y2={140} stroke="#D9D6CC" strokeWidth={1} />
        {points
          .filter((p) => !p.changed)
          .map((p) => (
            <circle key={p.id} cx={x(p.x)} cy={y(p.y)} r={3.5} fill="#fff" stroke="#9A978E" strokeWidth={1.2} />
          ))}
        {points
          .filter((p) => p.changed)
          .map((p) => (
            <circle key={p.id} cx={x(p.x)} cy={y(p.y)} r={4.5} fill="#A63A2E" />
          ))}
        <text x={zoneX + 4} y={134} fontSize={10} fill="#A63A2E">
          7 h+
        </text>
        <text x={30} y={156} fontSize={10} fill="#66665F">
          6 h
        </text>
        <text x={182} y={156} fontSize={10} fill="#66665F" textAnchor="middle">
          7 h 15 m
        </text>
        <text x={334} y={156} fontSize={10} fill="#66665F" textAnchor="end">
          8 h 30 m
        </text>
      </svg>
      <div className="flex gap-4 text-[12px] text-muted">
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-2.5 w-2.5 rounded-full bg-brick" /> Today
        </span>
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-2 w-2 rounded-full border border-[#9A978E] bg-white" /> Usual days
        </span>
      </div>
    </section>
  );
}
