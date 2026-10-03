/** MediaPipe 33-landmark names, versioned with KEYPOINT_SCHEMA. */
export const POSE_LANDMARKS = [
  "nose",
  "left_eye_inner",
  "left_eye",
  "left_eye_outer",
  "right_eye_inner",
  "right_eye",
  "right_eye_outer",
  "left_ear",
  "right_ear",
  "mouth_left",
  "mouth_right",
  "left_shoulder",
  "right_shoulder",
  "left_elbow",
  "right_elbow",
  "left_wrist",
  "right_wrist",
  "left_pinky",
  "right_pinky",
  "left_index",
  "right_index",
  "left_thumb",
  "right_thumb",
  "left_hip",
  "right_hip",
  "left_knee",
  "right_knee",
  "left_ankle",
  "right_ankle",
  "left_heel",
  "right_heel",
  "left_foot_index",
  "right_foot_index",
] as const;

export type LandmarkName = (typeof POSE_LANDMARKS)[number];

export type Landmark = { x: number; y: number; visibility: number };
export type PoseFrame = { tMs: number; points: Record<LandmarkName, Landmark> };

export const SKELETON: [LandmarkName, LandmarkName][] = [
  ["left_shoulder", "right_shoulder"],
  ["left_hip", "right_hip"],
  ["left_shoulder", "left_hip"],
  ["right_shoulder", "right_hip"],
  ["left_shoulder", "left_elbow"],
  ["left_elbow", "left_wrist"],
  ["right_shoulder", "right_elbow"],
  ["right_elbow", "right_wrist"],
  ["left_hip", "left_knee"],
  ["left_knee", "left_ankle"],
  ["right_hip", "right_knee"],
  ["right_knee", "right_ankle"],
  ["left_ankle", "left_foot_index"],
  ["right_ankle", "right_foot_index"],
];

export function mid(a: Landmark, b: Landmark): Landmark {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, visibility: Math.min(a.visibility, b.visibility) };
}

export function angleDeg(a: Landmark, b: Landmark, c: Landmark): number {
  const v1 = { x: a.x - b.x, y: a.y - b.y };
  const v2 = { x: c.x - b.x, y: c.y - b.y };
  const d = Math.atan2(v2.y, v2.x) - Math.atan2(v1.y, v1.x);
  let deg = (d * 180) / Math.PI;
  if (deg < 0) deg += 360;
  if (deg > 180) deg = 360 - deg;
  return deg;
}

export function trunkLateralDeg(frame: PoseFrame): number | null {
  const ls = frame.points.left_shoulder;
  const rs = frame.points.right_shoulder;
  const lh = frame.points.left_hip;
  const rh = frame.points.right_hip;
  if (Math.min(ls.visibility, rs.visibility, lh.visibility, rh.visibility) < 0.45) return null;
  const sh = mid(ls, rs);
  const hp = mid(lh, rh);
  const dx = sh.x - hp.x;
  const dy = sh.y - hp.y;
  const fromVertical = (Math.atan2(dx, -dy) * 180) / Math.PI;
  return Math.abs(fromVertical);
}

export function kneeFlexion(frame: PoseFrame, side: "left" | "right"): number | null {
  const hip = frame.points[`${side}_hip`];
  const knee = frame.points[`${side}_knee`];
  const ankle = frame.points[`${side}_ankle`];
  if (Math.min(hip.visibility, knee.visibility, ankle.visibility) < 0.45) return null;
  return 180 - angleDeg(hip, knee, ankle);
}

export function shoulderHipAlignment(frame: PoseFrame): number | null {
  const ls = frame.points.left_shoulder;
  const rs = frame.points.right_shoulder;
  const lh = frame.points.left_hip;
  const rh = frame.points.right_hip;
  if (Math.min(ls.visibility, rs.visibility, lh.visibility, rh.visibility) < 0.45) return null;
  const s = (Math.atan2(rs.y - ls.y, rs.x - ls.x) * 180) / Math.PI;
  const h = (Math.atan2(rh.y - lh.y, rh.x - lh.x) * 180) / Math.PI;
  return Math.abs(s - h);
}

export type VideoLayout = {
  videoWidth: number;
  videoHeight: number;
  rotation: 0 | 90 | 180 | 270;
  displayWidth: number;
  displayHeight: number;
  objectFit: "contain" | "cover";
};

/** Map normalized model coords through rotation, letterbox, and player size. */
export function mapLandmarkToPlayer(
  lm: Landmark,
  layout: VideoLayout,
): { x: number; y: number; visible: boolean } {
  let x = lm.x;
  let y = lm.y;
  switch (layout.rotation) {
    case 90:
      [x, y] = [1 - y, x];
      break;
    case 180:
      [x, y] = [1 - x, 1 - y];
      break;
    case 270:
      [x, y] = [y, 1 - x];
      break;
    default:
      break;
  }

  const srcW = layout.rotation === 90 || layout.rotation === 270 ? layout.videoHeight : layout.videoWidth;
  const srcH = layout.rotation === 90 || layout.rotation === 270 ? layout.videoWidth : layout.videoHeight;
  const srcAspect = srcW / srcH;
  const destAspect = layout.displayWidth / layout.displayHeight;

  let drawW = layout.displayWidth;
  let drawH = layout.displayHeight;
  let offX = 0;
  let offY = 0;

  if (layout.objectFit === "contain") {
    if (srcAspect > destAspect) {
      drawH = layout.displayWidth / srcAspect;
      offY = (layout.displayHeight - drawH) / 2;
    } else {
      drawW = layout.displayHeight * srcAspect;
      offX = (layout.displayWidth - drawW) / 2;
    }
  } else {
    if (srcAspect > destAspect) {
      drawW = layout.displayHeight * srcAspect;
      offX = (layout.displayWidth - drawW) / 2;
    } else {
      drawH = layout.displayWidth / srcAspect;
      offY = (layout.displayHeight - drawH) / 2;
    }
  }

  return {
    x: offX + x * drawW,
    y: offY + y * drawH,
    visible: lm.visibility >= 0.35,
  };
}

export function interpolateFrame(frames: PoseFrame[], tMs: number): PoseFrame | null {
  if (!frames.length) return null;
  if (tMs <= frames[0]!.tMs) return frames[0]!;
  if (tMs >= frames[frames.length - 1]!.tMs) return frames[frames.length - 1]!;
  let lo = 0;
  let hi = frames.length - 1;
  while (hi - lo > 1) {
    const midIdx = Math.floor((lo + hi) / 2);
    if (frames[midIdx]!.tMs <= tMs) lo = midIdx;
    else hi = midIdx;
  }
  const a = frames[lo]!;
  const b = frames[hi]!;
  const u = (tMs - a.tMs) / (b.tMs - a.tMs);
  const points = {} as PoseFrame["points"];
  for (const name of POSE_LANDMARKS) {
    const pa = a.points[name];
    const pb = b.points[name];
    points[name] = {
      x: pa.x + (pb.x - pa.x) * u,
      y: pa.y + (pb.y - pa.y) * u,
      visibility: Math.min(pa.visibility, pb.visibility),
    };
  }
  return { tMs, points };
}

export function frameQuality(frames: PoseFrame[]): { score: number; reason?: string } {
  if (frames.length < 8) return { score: 0.1, reason: "too_few_frames" };
  const vis = frames.map((f) => {
    const keys: LandmarkName[] = [
      "left_shoulder",
      "right_shoulder",
      "left_hip",
      "right_hip",
      "left_ankle",
      "right_ankle",
    ];
    return keys.reduce((s, k) => s + f.points[k].visibility, 0) / keys.length;
  });
  const mean = vis.reduce((a, b) => a + b, 0) / vis.length;
  if (mean < 0.4) return { score: mean, reason: "low_visibility" };
  return { score: mean };
}
