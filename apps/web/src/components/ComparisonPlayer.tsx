"use client";

import { useEffect, useRef, useState } from "react";
import { featureCopy, limits, type PoseFrame } from "@spelltrace/shared";
import { PoseOverlay, type OverlayMode } from "./PoseOverlay";

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
  const [phase, setPhase] = useState(0.7);
  const [mode, setMode] = useState<OverlayMode>("skeleton");
  const [opacity, setOpacity] = useState(0.9);
  const [dual, setDual] = useState(false);

  useEffect(() => {
    const apply = () => setDual(window.innerWidth >= 1024);
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  const highlight = (featureCopy[feature ?? ""]?.joints ?? []) as Parameters<typeof PoseOverlay>[0]["highlight"];
  const active = which === "usual" ? usual : changed;

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-full bg-teal-soft p-1" role="tablist" aria-label="Usual or changed">
          {(["changed", "usual"] as const).map((k) => (
            <button
              key={k}
              type="button"
              className={`min-h-tap min-w-[44px] rounded-full px-3 text-sm ${which === k ? "bg-teal text-white" : "text-teal"}`}
              onClick={() => setWhich(k)}
              aria-selected={which === k}
            >
              {k === "changed" ? "Changed" : "Usual"}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-muted">
          Overlay
          <select
            className="min-h-tap rounded-lg border border-line bg-paper px-2"
            value={mode}
            onChange={(e) => setMode(e.target.value as OverlayMode)}
          >
            <option value="off">Off</option>
            <option value="skeleton">Skeleton</option>
            <option value="finding">Finding only</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-muted">
          Opacity
          <input
            type="range"
            min={0.2}
            max={1}
            step={0.05}
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            aria-label="Overlay opacity"
          />
        </label>
        <button
          type="button"
          className="min-h-tap rounded-lg border border-line px-3 text-sm"
          onClick={() => setPhase((p) => Math.min(1, Math.round((p + 1 / 45) * 1000) / 1000))}
        >
          Frame step
        </button>
        {onHowMeasured && (
          <button type="button" className="min-h-tap text-sm text-teal underline" onClick={onHowMeasured}>
            How measured
          </button>
        )}
      </div>

      {dual ? (
        <div className="grid grid-cols-2 gap-4">
          <ClipPlayer clip={usual} phase={phase} mode={mode} opacity={opacity} highlight={highlight} feature={feature} currentValue={currentValue} />
          <ClipPlayer clip={changed} phase={phase} mode={mode} opacity={opacity} highlight={highlight} feature={feature} currentValue={currentValue} />
        </div>
      ) : (
        <ClipPlayer clip={active} phase={phase} mode={mode} opacity={opacity} highlight={highlight} feature={feature} currentValue={currentValue} />
      )}

      <label className="block">
        <span className="text-sm text-muted">Phase scrubber (aligned to front-foot contact)</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.002}
          value={phase}
          onChange={(e) => setPhase(Number(e.target.value))}
          className="mt-1 w-full"
          aria-label="Shared phase"
        />
        <div className="mt-1 flex justify-between text-[11px] text-faint">
          <span>Run-up</span>
          <span>Back-foot</span>
          <span>Front-foot</span>
          <span>Release</span>
        </div>
      </label>
      <p className="text-xs text-muted">{active.match}. Overlay is drawn from stored landmarks, not burned into footage.</p>
    </section>
  );
}

function ClipPlayer({
  clip,
  phase,
  mode,
  opacity,
  highlight,
  feature,
  currentValue,
}: {
  clip: Clip;
  phase: number;
  mode: OverlayMode;
  opacity: number;
  highlight: Parameters<typeof PoseOverlay>[0]["highlight"];
  feature?: string;
  currentValue?: number;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 320, h: 180 });

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setSize({ w: Math.max(1, Math.round(r.width)), h: Math.max(1, Math.round(r.height)) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-ink">
      <div ref={box} className="relative aspect-video w-full bg-[#111]">
        {clip.videoDeleted ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1c1916] text-center text-sm text-[#E4DCD0]">
            <p>
              Source footage deleted
              <br />
              <span className="text-xs text-[#8A8378]">{limits.videoDeleted}</span>
            </p>
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-[#2a2420] to-[#111]" aria-hidden />
        )}
        <PoseOverlay
          frames={clip.frames}
          timeMs={phase * clip.durationMs}
          layout={{
            videoWidth: clip.width,
            videoHeight: clip.height,
            rotation: 0,
            displayWidth: size.w,
            displayHeight: size.h,
            objectFit: "contain",
          }}
          mode={mode}
          opacity={opacity}
          highlight={highlight}
          angleLabel={
            feature && currentValue != null
              ? {
                  text: `${featureCopy[feature]?.label ?? feature} ${currentValue}${featureCopy[feature]?.unit ?? ""}`,
                  at: "left_shoulder",
                }
              : undefined
          }
        />
      </div>
      <div className="flex items-center justify-between bg-paper px-3 py-2 text-xs text-muted">
        <span className="font-semibold text-ink">{clip.title}</span>
        <span>{clip.date}</span>
      </div>
    </div>
  );
}
