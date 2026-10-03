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
import type { OverlayMode } from "./PoseOverlay";

type Props = {
  frames: PoseFrame[];
  timeMs: number;
  mode: OverlayMode;
  opacity: number;
  highlight: LandmarkName[];
  angleLabel?: string;
  deleted?: boolean;
  leanExtra?: number;
};

/** Phone-style bowling clip: pitch footage with skeleton drawn on the athlete. */
export function BowlingClip({
  frames,
  timeMs,
  mode,
  opacity,
  highlight,
  angleLabel,
  deleted,
}: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLCanvasElement>(null);
  const overlay = useRef<HTMLCanvasElement>(null);
  const size = useRef({ w: 360, h: 480 });

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      size.current = { w: Math.max(1, Math.round(r.width)), h: Math.max(1, Math.round(r.height)) };
      paint();
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  });

  useEffect(() => {
    paint();
  });

  function paint() {
    const { w, h } = size.current;
    const v = video.current;
    const o = overlay.current;
    if (!v || !o) return;
    const dpr = window.devicePixelRatio || 1;
    for (const c of [v, o]) {
      c.width = w * dpr;
      c.height = h * dpr;
      c.style.width = `${w}px`;
      c.style.height = `${h}px`;
    }
    const vx = v.getContext("2d");
    const ox = o.getContext("2d");
    if (!vx || !ox) return;
    vx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ox.setTransform(dpr, 0, 0, dpr, 0, 0);
    const frame = interpolateFrame(frames, timeMs);
    drawFootage(vx, w, h, frame, Boolean(deleted));
    ox.clearRect(0, 0, w, h);
    if (!frame || mode === "off" || deleted) return;
    ox.globalAlpha = opacity;
    const layout: VideoLayout = {
      videoWidth: 720,
      videoHeight: 960,
      rotation: 0,
      displayWidth: w,
      displayHeight: h,
      objectFit: "contain",
    };
    const mapped = Object.fromEntries(
      Object.entries(frame.points).map(([k, p]) => [k, mapLandmarkToPlayer(p, layout)]),
    ) as Record<LandmarkName, { x: number; y: number; visible: boolean }>;

    const bones = mode === "finding" ? SKELETON.filter(([a, b]) => highlight.includes(a) || highlight.includes(b)) : SKELETON;
    for (const [a, b] of bones) {
      const pa = mapped[a];
      const pb = mapped[b];
      if (!pa?.visible || !pb?.visible) continue;
      ox.beginPath();
      ox.moveTo(pa.x, pa.y);
      ox.lineTo(pb.x, pb.y);
      ox.lineWidth = mode === "finding" ? 4 : 3;
      ox.strokeStyle = mode === "finding" || highlight.includes(a) ? "#C46A3A" : "#7CFFCE";
      ox.stroke();
    }
    for (const [name, p] of Object.entries(mapped)) {
      if (!p.visible || (mode === "finding" && !highlight.includes(name as LandmarkName))) continue;
      ox.beginPath();
      ox.arc(p.x, p.y, highlight.includes(name as LandmarkName) ? 5.5 : 3.2, 0, Math.PI * 2);
      ox.fillStyle = highlight.includes(name as LandmarkName) ? "#C46A3A" : "#F4FFF8";
      ox.fill();
    }
    if (angleLabel) {
      ox.globalAlpha = 1;
      ox.font = "700 13px Source Sans 3, sans-serif";
      ox.fillStyle = "#fff";
      ox.strokeStyle = "#1A1714";
      ox.lineWidth = 3;
      const sh = mapped.left_shoulder;
      if (sh) {
        ox.strokeText(angleLabel, sh.x + 10, sh.y - 10);
        ox.fillText(angleLabel, sh.x + 10, sh.y - 10);
      }
    }
  }

  return (
    <div ref={wrap} className="relative aspect-[3/4] w-full overflow-hidden bg-[#2a4a28]">
      <canvas ref={video} className="absolute inset-0" aria-hidden />
      <canvas ref={overlay} className="pointer-events-none absolute inset-0" aria-hidden />
      {deleted && (
        <p className="absolute inset-x-3 bottom-3 rounded-lg bg-black/60 px-2 py-1 text-center text-xs text-white">
          Video deleted · skeleton only
        </p>
      )}
    </div>
  );
}

function drawFootage(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  frame: PoseFrame | null,
  deleted: boolean,
) {
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.42);
  sky.addColorStop(0, "#8ec6e8");
  sky.addColorStop(1, "#cfe7b8");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#5a9a3a";
  ctx.fillRect(0, h * 0.38, w, h * 0.62);
  ctx.fillStyle = "#6aad44";
  for (let y = h * 0.4; y < h; y += 18) {
    ctx.globalAlpha = 0.15;
    ctx.fillRect(0, y, w, 8);
  }
  ctx.globalAlpha = 1;

  // nets / fence
  ctx.strokeStyle = "#d9d9d9";
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 14) {
    ctx.beginPath();
    ctx.moveTo(x, h * 0.28);
    ctx.lineTo(x, h * 0.42);
    ctx.stroke();
  }
  ctx.fillStyle = "#3d6b28";
  ctx.fillRect(0, h * 0.4, w, 10);

  // pitch
  const pitchW = w * 0.28;
  const pitchX = w * 0.36;
  ctx.fillStyle = "#c4a46a";
  ctx.fillRect(pitchX, h * 0.42, pitchW, h * 0.58);
  ctx.fillStyle = "#d4b57a";
  ctx.fillRect(pitchX + 6, h * 0.42, pitchW - 12, h * 0.58);

  ctx.strokeStyle = "#f3efe4";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pitchX, h * 0.78);
  ctx.lineTo(pitchX + pitchW, h * 0.78);
  ctx.moveTo(pitchX + 10, h * 0.82);
  ctx.lineTo(pitchX + pitchW - 10, h * 0.82);
  ctx.stroke();

  // crease stumps suggestion
  ctx.fillStyle = "#e8e0c8";
  const stumpX = pitchX + pitchW * 0.55;
  for (const dx of [-8, 0, 8]) {
    ctx.fillRect(stumpX + dx, h * 0.84, 3, 28);
  }

  if (deleted || !frame) {
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(0, 0, w, h);
    return;
  }

  const layout: VideoLayout = {
    videoWidth: 720,
    videoHeight: 960,
    rotation: 0,
    displayWidth: w,
    displayHeight: h,
    objectFit: "contain",
  };
  const p = (name: LandmarkName) => mapLandmarkToPlayer(frame.points[name], layout);

  // filmed athlete fill — the “video” body the skeleton sits on
  const ls = p("left_shoulder");
  const rs = p("right_shoulder");
  const lh = p("left_hip");
  const rh = p("right_hip");
  const nose = p("nose");
  ctx.fillStyle = "#1f3d6e";
  ctx.beginPath();
  ctx.moveTo(ls.x, ls.y);
  ctx.lineTo(rs.x, rs.y);
  ctx.lineTo(rh.x, rh.y);
  ctx.lineTo(lh.x, lh.y);
  ctx.closePath();
  ctx.fill();

  drawLimb(ctx, p("left_shoulder"), p("left_elbow"), p("left_wrist"), "#2a4f86", 10);
  drawLimb(ctx, p("right_shoulder"), p("right_elbow"), p("right_wrist"), "#2a4f86", 10);
  drawLimb(ctx, p("left_hip"), p("left_knee"), p("left_ankle"), "#163058", 11);
  drawLimb(ctx, p("right_hip"), p("right_knee"), p("right_ankle"), "#163058", 11);

  ctx.fillStyle = "#e8c4a0";
  ctx.beginPath();
  ctx.arc(nose.x, nose.y, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.ellipse(nose.x, nose.y - 10, 12, 6, 0, Math.PI, 0, true);
  ctx.fill();
}

function drawLimb(
  ctx: CanvasRenderingContext2D,
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number },
  color: string,
  width: number,
) {
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.lineTo(c.x, c.y);
  ctx.stroke();
}
