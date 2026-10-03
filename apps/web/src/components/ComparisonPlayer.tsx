"use client";

import { useEffect, useRef, useState } from "react";
import { featureCopy, type PoseFrame } from "@spelltrace/shared";
import { BowlingClip } from "./BowlingClip";
import type { OverlayMode } from "./PoseOverlay";

export type Clip = {
  id: string;
  title: string;
  date: string;
  match: string;
  videoDeleted: boolean;
  frames: PoseFrame[];
  durationMs: number;
  phases: { id: string; label: string; ms: number }[];
  width: number;
  height: number;
};

type Props = {
  usual: Clip;
  changed: Clip;
  feature?: string;
  currentValue?: number;
  onHowMeasured?: () => void;
};

export function ComparisonPlayer({ usual, changed, feature, currentValue, onHowMeasured }: Props) {
  const [which, setWhich] = useState<"usual" | "changed">("changed");
  const [timeMs, setTimeMs] = useState(usual.durationMs * 0.7);
  const [playing, setPlaying] = useState(true);
  const [mode, setMode] = useState<OverlayMode>("skeleton");
  const [dual, setDual] = useState(false);
  const timeRef = useRef(timeMs);
  timeRef.current = timeMs;

  useEffect(() => {
    const apply = () => setDual(window.innerWidth >= 1024);
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const next = (timeRef.current + (now - last)) % usual.durationMs;
      last = now;
      timeRef.current = next;
      setTimeMs(next);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, usual.durationMs]);

  const highlight = (featureCopy[feature ?? ""]?.joints ?? []) as Parameters<typeof BowlingClip>[0]["highlight"];
  const active = which === "usual" ? usual : changed;
  const label =
    feature && currentValue != null
      ? `${featureCopy[feature]?.label ?? feature} ${currentValue}${featureCopy[feature]?.unit ?? ""}`
      : undefined;

  const clipProps = (clip: Clip) => ({
    frames: clip.frames,
    timeMs,
    mode,
    opacity: 0.95,
    highlight,
    angleLabel: label,
    deleted: clip.videoDeleted,
  });

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-full bg-teal-soft p-1" role="tablist">
          {(["changed", "usual"] as const).map((k) => (
            <button
              key={k}
              type="button"
              className={`min-h-tap rounded-full px-3 text-sm ${which === k ? "bg-teal text-white" : "text-teal"}`}
              onClick={() => setWhich(k)}
            >
              {k === "changed" ? "Today" : "Usual"}
            </button>
          ))}
        </div>
        <select
          className="min-h-tap rounded-lg border border-line bg-white px-2 text-sm"
          value={mode}
          onChange={(e) => setMode(e.target.value as OverlayMode)}
          aria-label="Overlay"
        >
          <option value="off">Overlay off</option>
          <option value="skeleton">Skeleton</option>
          <option value="finding">Finding</option>
        </select>
        <button type="button" className="min-h-tap rounded-lg border border-line px-3 text-sm" onClick={() => setPlaying((p) => !p)}>
          {playing ? "Pause" : "Play"}
        </button>
        {onHowMeasured && (
          <button type="button" className="min-h-tap text-sm text-teal underline" onClick={onHowMeasured}>
            How measured
          </button>
        )}
      </div>

      {dual ? (
        <div className="grid grid-cols-2 gap-3">
          <PlayerFrame clip={usual} {...clipProps(usual)} />
          <PlayerFrame clip={changed} {...clipProps(changed)} />
        </div>
      ) : (
        <PlayerFrame clip={active} {...clipProps(active)} />
      )}

      <input
        type="range"
        min={0}
        max={active.durationMs}
        step={20}
        value={timeMs}
        onChange={(e) => {
          setPlaying(false);
          setTimeMs(Number(e.target.value));
        }}
        className="w-full"
        aria-label="Phase"
      />
      <div className="flex justify-between text-[11px] text-faint">
        <span>Run-up</span>
        <span>Contact</span>
        <span>Release</span>
      </div>
    </section>
  );
}

function PlayerFrame({
  clip,
  ...rest
}: {
  clip: Clip;
} & Parameters<typeof BowlingClip>[0]) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <BowlingClip {...rest} />
      <div className="flex items-center justify-between px-3 py-2 text-xs text-muted">
        <span className="font-semibold text-ink">{clip.title}</span>
        <span>{clip.date}</span>
      </div>
    </div>
  );
}
