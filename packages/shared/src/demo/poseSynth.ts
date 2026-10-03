import { POSE_LANDMARKS, type LandmarkName, type PoseFrame } from "../analysis/pose.js";

/** Synthetic 2D bowling-like silhouette. Not a real athlete recording. */
export function synthDeliveryFrames(opts: {
  durationMs: number;
  leanBoost?: number;
  seed?: number;
}): PoseFrame[] {
  const frames: PoseFrame[] = [];
  const step = 40;
  const lean = opts.leanBoost ?? 0;
  const seed = opts.seed ?? 1;
  for (let t = 0; t <= opts.durationMs; t += step) {
    const u = t / opts.durationMs;
    const phase = bowlingPhase(u);
    frames.push({ tMs: t, points: skeletonAt(phase, lean, seed + t) });
  }
  return frames;
}

function bowlingPhase(u: number): number {
  // 0 run-up, 0.55 BFC, 0.7 FFC, 0.82 release
  return u;
}

function skeletonAt(u: number, leanBoost: number, salt: number): Record<LandmarkName, { x: number; y: number; visibility: number }> {
  const jitter = (n: number) => ((Math.sin(salt * 0.017 + n) + 1) / 2) * 0.006;
  const run = Math.min(1, u / 0.55);
  const plant = u > 0.55 ? Math.min(1, (u - 0.55) / 0.27) : 0;
  const cx = 0.42 + run * 0.22 + plant * 0.06;
  const lean = (u > 0.68 ? 0.035 + leanBoost : 0.01 + leanBoost * 0.2) + jitter(3);
  const hipY = 0.58;
  const shY = 0.34 - plant * 0.02;
  const front = 1; // right-arm pace, left leg front at FFC in side-on view

  const base: Record<string, { x: number; y: number; visibility: number }> = {};
  const put = (name: string, x: number, y: number, v = 0.92) => {
    base[name] = { x, y, visibility: v };
  };

  put("nose", cx + lean * 0.4, 0.2 + jitter(1));
  put("left_eye", cx + lean * 0.4 - 0.01, 0.185);
  put("right_eye", cx + lean * 0.4 + 0.01, 0.185);
  put("left_eye_inner", cx + lean * 0.4 - 0.006, 0.186);
  put("right_eye_inner", cx + lean * 0.4 + 0.006, 0.186);
  put("left_eye_outer", cx + lean * 0.4 - 0.014, 0.186);
  put("right_eye_outer", cx + lean * 0.4 + 0.014, 0.186);
  put("left_ear", cx + lean * 0.4 - 0.02, 0.2);
  put("right_ear", cx + lean * 0.4 + 0.02, 0.2);
  put("mouth_left", cx + lean * 0.35 - 0.01, 0.22);
  put("mouth_right", cx + lean * 0.35 + 0.01, 0.22);

  put("left_shoulder", cx - 0.06 + lean, shY);
  put("right_shoulder", cx + 0.07 + lean, shY + 0.01);
  put("left_hip", cx - 0.04, hipY);
  put("right_hip", cx + 0.04, hipY + 0.005);

  const armUp = u > 0.6 ? Math.min(1, (u - 0.6) / 0.22) : 0;
  put("right_elbow", cx + 0.12 + lean, shY - 0.04 - armUp * 0.08);
  put("right_wrist", cx + 0.16 + lean + armUp * 0.04, shY - 0.1 - armUp * 0.12);
  put("left_elbow", cx - 0.1, shY + 0.08);
  put("left_wrist", cx - 0.08, shY + 0.16);

  ["left_pinky", "left_index", "left_thumb"].forEach((n, i) =>
    put(n, cx - 0.08 + i * 0.004, shY + 0.18, 0.7),
  );
  ["right_pinky", "right_index", "right_thumb"].forEach((n, i) =>
    put(n, cx + 0.17 + lean + i * 0.003, shY - 0.12 - armUp * 0.12, 0.7),
  );

  const frontStride = 0.08 + plant * 0.1;
  const backStride = 0.06 - plant * 0.02;
  put("left_knee", cx - 0.02 + front * frontStride, 0.74);
  put("left_ankle", cx - 0.01 + front * (frontStride + 0.04), 0.9);
  put("right_knee", cx + 0.02 - backStride, 0.73);
  put("right_ankle", cx + 0.01 - backStride - 0.03, 0.88);
  put("left_heel", cx - 0.02 + front * (frontStride + 0.03), 0.92);
  put("right_heel", cx - backStride, 0.9);
  put("left_foot_index", cx + 0.03 + front * (frontStride + 0.05), 0.91);
  put("right_foot_index", cx + 0.03 - backStride, 0.89);

  const out = {} as Record<LandmarkName, { x: number; y: number; visibility: number }>;
  for (const name of POSE_LANDMARKS) {
    out[name] = base[name] ?? { x: cx, y: 0.5, visibility: 0.2 };
  }
  return out;
}

export const DEMO_PHASES = {
  run_up: 120,
  back_foot_contact: 980,
  front_foot_contact: 1240,
  release: 1460,
} as const;
