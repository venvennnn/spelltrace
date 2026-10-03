"use client";

import { useEffect, useRef } from "react";
import {
  SKELETON,
  interpolateFrame,
  mapLandmarkToPlayer,
  type LandmarkName,
  type PoseFrame,
  type VideoLayout,
} from "@spelltrace/shared";

export type OverlayMode = "off" | "skeleton" | "finding";

type Props = {
  frames: PoseFrame[];
  timeMs: number;
  layout: VideoLayout;
  mode: OverlayMode;
  opacity: number;
  highlight: LandmarkName[];
  angleLabel?: { text: string; at: LandmarkName };
  uncertain?: boolean;
};

export function PoseOverlay({ frames, timeMs, layout, mode, opacity, highlight, angleLabel, uncertain }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    canvas.width = layout.displayWidth * window.devicePixelRatio;
    canvas.height = layout.displayHeight * window.devicePixelRatio;
    canvas.style.width = `${layout.displayWidth}px`;
    canvas.style.height = `${layout.displayHeight}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    ctx.clearRect(0, 0, layout.displayWidth, layout.displayHeight);
    if (mode === "off") return;
    const frame = interpolateFrame(frames, timeMs);
    if (!frame) return;
    ctx.globalAlpha = opacity;
    const mapped = Object.fromEntries(
      Object.entries(frame.points).map(([k, v]) => [k, mapLandmarkToPlayer(v, layout)]),
    ) as Record<LandmarkName, { x: number; y: number; visible: boolean }>;

    const drawBone = (a: LandmarkName, b: LandmarkName, finding: boolean) => {
      const pa = mapped[a];
      const pb = mapped[b];
      if (!pa?.visible || !pb?.visible) return;
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.lineWidth = finding ? 4 : 2.5;
      ctx.strokeStyle = finding ? "#C46A3A" : "#1F6B66";
      ctx.stroke();
    };

    if (mode === "skeleton") {
      for (const [a, b] of SKELETON) drawBone(a, b, false);
      for (const [name, p] of Object.entries(mapped)) {
        if (!p.visible) continue;
        ctx.beginPath();
        ctx.arc(p.x, p.y, highlight.includes(name as LandmarkName) ? 5 : 3, 0, Math.PI * 2);
        ctx.fillStyle = highlight.includes(name as LandmarkName) ? "#C46A3A" : "#F4F7F2";
        ctx.fill();
        ctx.strokeStyle = "#1A1714";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    } else {
      const pairs = SKELETON.filter(([a, b]) => highlight.includes(a) || highlight.includes(b));
      for (const [a, b] of pairs) drawBone(a, b, true);
      for (const name of highlight) {
        const p = mapped[name];
        if (!p?.visible) continue;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = "#C46A3A";
        ctx.fill();
      }
    }

    if (angleLabel) {
      const p = mapped[angleLabel.at];
      if (p?.visible) {
        ctx.globalAlpha = 1;
        ctx.font = "600 13px IBM Plex Sans, system-ui, sans-serif";
        ctx.fillStyle = "#1A1714";
        ctx.fillText(angleLabel.text, p.x + 8, p.y - 8);
      }
    }
  }, [frames, timeMs, layout, mode, opacity, highlight, angleLabel]);

  if (uncertain) {
    return (
      <>
        <canvas ref={ref} className="pointer-events-none absolute inset-0" aria-hidden />
        <p className="absolute left-2 top-2 rounded bg-paper/90 px-2 py-1 text-xs text-muted">Tracking uncertain</p>
      </>
    );
  }

  return <canvas ref={ref} className="pointer-events-none absolute inset-0" aria-hidden />;
}
