import { ALGORITHM_VERSION } from "../constants.js";
import type { ReviewContract } from "../schemas/index.js";
import { comparatorKey, scoreFindings, type FeatureVector } from "../analysis/baseline.js";
import { DEMO_PHASES, synthDeliveryFrames } from "./poseSynth.js";

export const DEMO_ATHLETE_ID = "demo-athlete-asha";
export const DEMO_CHANGED_SESSION_ID = "sess-changed-2026-10-02";
export const DEMO_MOVEMENT_ONLY_SESSION_ID = "sess-2026-09-12";
export const DEMO_SHARE_TOKEN = "demo-share-preview";

const TZ = "Australia/Melbourne";

export type DemoDelivery = {
  id: string;
  sessionId: string;
  videoId: string | null;
  startMs: number;
  endMs: number;
  frontFootContactMs: number;
  backFootContactMs: number;
  releaseMs: number;
  quality: "adequate" | "low" | "inadequate";
  excluded: boolean;
  values: Record<string, number>;
  trace: ReturnType<typeof synthDeliveryFrames>;
};

export type DemoSession = {
  id: string;
  athleteId: string;
  startedAtUtc: string;
  timezone: string;
  view: "side" | "front";
  drill: "nets" | "match" | "controlled";
  effort: "easy" | "normal" | "high";
  bowlingArm: "right" | "left";
  status: "complete" | "draft" | "processing";
  environment: {
    perceivedHeat: "cool" | "mild" | "hot";
    surface: "turf" | "concrete" | "indoor_mat" | "grass" | "unknown";
    indoorOutdoor: "indoor" | "outdoor";
  };
  video: {
    id: string;
    durationMs: number;
    width: number;
    height: number;
    deleted: boolean;
    placeholder: true;
    label: string;
  } | null;
  checkIn: {
    sleepFeeling: "rested" | "ok" | "poor";
    fatigue: number;
    soreness: number;
    rpe: number;
    notes?: string;
    sensitive?: { menstrualNotes?: string };
  };
  deliveries: DemoDelivery[];
  motionStatus: "not_recorded" | "imported";
  watchDay: Record<string, number | null>;
  provenance: "synthetic-demo";
};

export type DemoAthlete = {
  id: string;
  displayName: string;
  bowlingArm: "right";
  timezone: string;
  demo: true;
  createdAt: string;
};

function jitter(base: number, amount: number, i: number): number {
  return Math.round((base + Math.sin(i * 1.7) * amount + Math.cos(i * 0.6) * amount * 0.4) * 10) / 10;
}

function makeDeliveries(
  sessionId: string,
  videoId: string | null,
  startedAtUtc: string,
  count: number,
  lean: number,
  deleted: boolean,
): DemoDelivery[] {
  return Array.from({ length: count }, (_, i) => {
    const trunk = jitter(lean, 1.1, i + sessionId.length);
    const knee = jitter(42, 2.2, i + 3);
    const stride = jitter(240, 12, i + 5);
    const align = jitter(8.5, 1.4, i + 7);
    const cadence = jitter(168, 4, i + 9);
    return {
      id: `${sessionId}-d${i + 1}`,
      sessionId,
      videoId: deleted ? null : videoId,
      startMs: 4000 + i * 2800,
      endMs: 4000 + i * 2800 + 1800,
      frontFootContactMs: DEMO_PHASES.front_foot_contact,
      backFootContactMs: DEMO_PHASES.back_foot_contact,
      releaseMs: DEMO_PHASES.release,
      quality: "adequate" as const,
      excluded: false,
      values: {
        trunk_lateral_angle_at_foot_contact_deg: trunk,
        front_knee_flexion_at_ffc_deg: knee,
        stride_time_ms: stride,
        shoulder_hip_alignment_deg: align,
        runup_cadence_spm: cadence,
      },
      trace: synthDeliveryFrames({ durationMs: 1800, leanBoost: (trunk - 10) / 80, seed: i + sessionId.length }),
    };
  });
}

function session(partial: {
  id: string;
  startedAtUtc: string;
  count: number;
  lean: number;
  deleted?: boolean;
  view?: "side" | "front";
  drill?: "nets" | "match" | "controlled";
  effort?: "easy" | "normal" | "high";
  checkIn: DemoSession["checkIn"];
  watchDay: Record<string, number | null>;
  heat?: "cool" | "mild" | "hot";
}): DemoSession {
  const videoId = `vid-${partial.id}`;
  const deleted = Boolean(partial.deleted);
  return {
    id: partial.id,
    athleteId: DEMO_ATHLETE_ID,
    startedAtUtc: partial.startedAtUtc,
    timezone: TZ,
    view: partial.view ?? "side",
    drill: partial.drill ?? "nets",
    effort: partial.effort ?? "normal",
    bowlingArm: "right",
    status: "complete",
    environment: {
      perceivedHeat: partial.heat ?? "mild",
      surface: "turf",
      indoorOutdoor: "outdoor",
    },
    video: {
      id: videoId,
      durationMs: 22000,
      width: 1280,
      height: 720,
      deleted,
      placeholder: true,
      label: deleted ? "original video deleted" : "synthetic placeholder clip",
    },
    checkIn: partial.checkIn,
    deliveries: makeDeliveries(partial.id, videoId, partial.startedAtUtc, partial.count, partial.lean, deleted),
    motionStatus: "not_recorded",
    watchDay: partial.watchDay,
    provenance: "synthetic-demo",
  };
}

export const demoAthlete: DemoAthlete = {
  id: DEMO_ATHLETE_ID,
  displayName: "Asha (demonstration)",
  bowlingArm: "right",
  timezone: TZ,
  demo: true,
  createdAt: "2026-08-01T00:00:00.000Z",
};

export const demoSessions: DemoSession[] = [
  session({
    id: "sess-2026-08-22",
    startedAtUtc: "2026-08-22T07:10:00.000Z",
    count: 8,
    lean: 10.1,
    checkIn: { sleepFeeling: "rested", fatigue: 3, soreness: 1, rpe: 5, notes: "Easy rhythm." },
    watchDay: { sleep_duration_min: 458, resting_hr_bpm: 54, steps: 8200, active_minutes: 46, hrv_rmssd_ms: 48 },
  }),
  session({
    id: "sess-2026-08-29",
    startedAtUtc: "2026-08-29T07:05:00.000Z",
    count: 8,
    lean: 10.6,
    checkIn: { sleepFeeling: "ok", fatigue: 4, soreness: 2, rpe: 6 },
    watchDay: { sleep_duration_min: 440, resting_hr_bpm: 55, steps: 9100, active_minutes: 52, hrv_rmssd_ms: 44 },
  }),
  session({
    id: "sess-2026-09-05",
    startedAtUtc: "2026-09-05T06:50:00.000Z",
    count: 9,
    lean: 9.8,
    checkIn: { sleepFeeling: "rested", fatigue: 3, soreness: 1, rpe: 5 },
    watchDay: { sleep_duration_min: 470, resting_hr_bpm: 53, steps: 7600, active_minutes: 40, hrv_rmssd_ms: 51 },
  }),
  session({
    id: DEMO_MOVEMENT_ONLY_SESSION_ID,
    startedAtUtc: "2026-09-12T07:00:00.000Z",
    count: 8,
    lean: 10.8,
    deleted: true,
    checkIn: { sleepFeeling: "ok", fatigue: 4, soreness: 2, rpe: 6, notes: "Kept movement only." },
    watchDay: { sleep_duration_min: 430, resting_hr_bpm: 56, steps: 8800, active_minutes: 49, hrv_rmssd_ms: null },
  }),
  session({
    id: "sess-2026-09-20",
    startedAtUtc: "2026-09-20T07:15:00.000Z",
    count: 9,
    lean: 10.3,
    checkIn: { sleepFeeling: "rested", fatigue: 3, soreness: 1, rpe: 5 },
    watchDay: { sleep_duration_min: 452, resting_hr_bpm: 54, steps: 10200, active_minutes: 61, hrv_rmssd_ms: 47 },
  }),
  session({
    id: "sess-2026-09-26",
    startedAtUtc: "2026-09-26T02:30:00.000Z",
    count: 6,
    lean: 11.2,
    view: "front",
    drill: "controlled",
    effort: "easy",
    checkIn: { sleepFeeling: "ok", fatigue: 2, soreness: 1, rpe: 3, notes: "Front-on drill — not in the side-on nets baseline." },
    watchDay: { sleep_duration_min: 400, resting_hr_bpm: 55, steps: 5400, active_minutes: 30, hrv_rmssd_ms: 42 },
    heat: "cool",
  }),
  session({
    id: DEMO_CHANGED_SESSION_ID,
    startedAtUtc: "2026-10-02T07:20:00.000Z",
    count: 7,
    lean: 17.8,
    checkIn: {
      sleepFeeling: "poor",
      fatigue: 7,
      soreness: 4,
      rpe: 8,
      notes: "Felt upright and late through the crease.",
      sensitive: { menstrualNotes: "private demo note — must stay unselected on shares" },
    },
    watchDay: { sleep_duration_min: 390, resting_hr_bpm: 59, steps: 6400, active_minutes: 28, hrv_rmssd_ms: 36 },
    heat: "hot",
  }),
];

export function allFeatureVectors(sessions: DemoSession[] = demoSessions): FeatureVector[] {
  return allFeatureVectorsFrom(sessions);
}

function allFeatureVectorsFrom(sessions: DemoSession[]): FeatureVector[] {
  return sessions.flatMap((s) =>
    s.deliveries.map((d) => ({
      deliveryId: d.id,
      sessionId: s.id,
      startedAtUtc: s.startedAtUtc,
      view: s.view,
      drill: s.drill,
      effort: s.effort,
      bowlingArm: s.bowlingArm,
      quality: d.quality,
      excluded: d.excluded,
      videoDeleted: Boolean(s.video?.deleted),
      values: d.values,
      reliability: {
        trunk_lateral_angle_at_foot_contact_deg: s.view === "side",
        front_knee_flexion_at_ffc_deg: s.view === "side",
        stride_time_ms: true,
        shoulder_hip_alignment_deg: true,
        runup_cadence_spm: s.view === "side",
      },
    })),
  );
}

export function reviewForSession(sessionId: string, sessions: DemoSession[] = demoSessions): ReviewContract {
  const session = sessions.find((s) => s.id === sessionId);
  if (!session) throw new Error("unknown session");
  const vectors = allFeatureVectorsFrom(sessions);
  const currentDeliveries = vectors.filter((v) => v.sessionId === sessionId && v.quality === "adequate");
  const first = currentDeliveries[0];
  if (!first) {
    return emptyReview(sessionId, session);
  }
  const priors = vectors.filter((v) => {
    if (v.sessionId === sessionId) return false;
    if (v.excluded || v.quality !== "adequate") return false;
    if (v.bowlingArm !== session.bowlingArm || v.view !== session.view || v.drill !== session.drill) return false;
    if (v.effort !== session.effort) return false;
    return Date.parse(v.startedAtUtc) < Date.parse(session.startedAtUtc);
  });
  const priorSessionIds = new Set(priors.map((p) => p.sessionId));
  const status =
    priorSessionIds.size >= 3 && priors.length >= 30 ? ("ready" as const) : ("building" as const);

  const findings =
    status === "ready"
      ? currentDeliveries.flatMap((d) => {
          const priorFor = vectors.filter((v) => {
            if (v.sessionId === sessionId) return false;
            if (Date.parse(v.startedAtUtc) >= Date.parse(session.startedAtUtc)) return false;
            if (v.excluded || v.quality !== "adequate") return false;
            return (
              v.bowlingArm === d.bowlingArm &&
              v.view === d.view &&
              v.drill === d.drill &&
              v.effort === d.effort
            );
          });
          return scoreFindings(d, priorFor, chooseMedoid(priorFor), "synthetic-demo");
        })
      : [];

  const unique = dedupeFindings(findings).slice(0, 3);
  const recentSleep = sessions
    .filter((s) => s.id !== sessionId && Date.parse(s.startedAtUtc) < Date.parse(session.startedAtUtc))
    .map((s) => s.watchDay.sleep_duration_min)
    .filter((v): v is number => typeof v === "number");

  const watchContext = [
    {
      metric: "sleep_duration_min",
      today: session.watchDay.sleep_duration_min ?? null,
      personalMedian: median(recentSleep),
      source: "imported-watch",
      quality: session.watchDay.sleep_duration_min == null ? ("missing" as const) : ("available" as const),
      note: "Daily context only — not bowling-motion data.",
    },
    {
      metric: "resting_hr_bpm",
      today: session.watchDay.resting_hr_bpm ?? null,
      personalMedian: median(
        sessions
          .filter((s) => s.id !== sessionId)
          .map((s) => s.watchDay.resting_hr_bpm)
          .filter((v): v is number => typeof v === "number"),
      ),
      source: "imported-watch",
      quality: session.watchDay.resting_hr_bpm == null ? ("missing" as const) : ("available" as const),
    },
    {
      metric: "hrv_rmssd_ms",
      today: session.watchDay.hrv_rmssd_ms ?? null,
      personalMedian: median(
        sessions
          .filter((s) => s.id !== sessionId)
          .map((s) => s.watchDay.hrv_rmssd_ms)
          .filter((v): v is number => typeof v === "number"),
      ),
      source: "imported-watch",
      quality: session.watchDay.hrv_rmssd_ms == null ? ("missing" as const) : ("available" as const),
      note: session.watchDay.hrv_rmssd_ms == null ? "Missing — not shown as zero." : undefined,
    },
  ];

  return {
    sessionId,
    baseline: {
      status,
      priorSessions: priorSessionIds.size,
      priorDeliveries: priors.length,
      match: comparatorKey({
        bowlingArm: session.bowlingArm,
        view: session.view,
        drill: session.drill,
      }),
      algorithmVersion: ALGORITHM_VERSION,
    },
    findings: unique,
    watchContext,
    motionStatus: "not_recorded",
    limitations: [
      "Camera angle affects 2D angle estimates.",
      "Demonstration numbers are synthetic fixture values, not empirical cricket results.",
      "No delivery-level watch recording for this session.",
    ],
    demo: true,
    videoRetention: session.video?.deleted ? "movement_only" : "video_and_movement",
  };
}

function emptyReview(sessionId: string, session: DemoSession): ReviewContract {
  return {
    sessionId,
    baseline: {
      status: "building",
      priorSessions: 0,
      priorDeliveries: 0,
      match: comparatorKey({ bowlingArm: session.bowlingArm, view: session.view, drill: session.drill }),
      algorithmVersion: ALGORITHM_VERSION,
    },
    findings: [],
    watchContext: [],
    motionStatus: "not_recorded",
    limitations: ["No comparable deliveries."],
    demo: true,
    videoRetention: session.video?.deleted ? "movement_only" : "video_and_movement",
  };
}

function chooseMedoid(priors: FeatureVector[]): FeatureVector | null {
  if (!priors.length) return null;
  const features = Object.keys(priors[0]!.values);
  const medians: Record<string, number> = {};
  for (const f of features) {
    medians[f] = median(priors.map((p) => p.values[f]!)) ?? 0;
  }
  return priors.reduce((best, p) => {
    const d = features.reduce((s, f) => s + Math.abs((p.values[f] ?? 0) - medians[f]!), 0);
    const bd = features.reduce((s, f) => s + Math.abs((best.values[f] ?? 0) - medians[f]!), 0);
    return d < bd ? p : best;
  });
}

function dedupeFindings<T extends { feature: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((i) => {
    if (seen.has(i.feature)) return false;
    seen.add(i.feature);
    return true;
  });
}

function median(values: number[]): number | null {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2;
}

export const demoTimeline = {
  date: "2026-10-02",
  timezone: TZ,
  blocks: [
    {
      id: "sleep",
      label: "Sleep",
      time: "22:10–04:40",
      value: "6 h 30 m",
      source: "imported-watch",
      missing: false,
    },
    {
      id: "checkin",
      label: "Morning check-in",
      time: "06:40",
      value: "Sleep felt poor · fatigue 7 · soreness 4",
      source: "athlete",
      missing: false,
    },
    {
      id: "activity",
      label: "Activity",
      time: "day",
      value: "6,400 steps · 28 active min",
      source: "imported-watch",
      missing: false,
    },
    {
      id: "session",
      label: "Bowling session",
      time: "17:20",
      value: "Side-on nets, high effort, 7 marked deliveries",
      source: "athlete",
      missing: false,
    },
    {
      id: "workout_hrv",
      label: "HRV (RMSSD)",
      time: "morning",
      value: "36 ms",
      source: "imported-watch",
      missing: false,
    },
    {
      id: "post",
      label: "Post-session note",
      time: "18:05",
      value: "Felt upright and late through the crease.",
      source: "athlete",
      missing: false,
    },
  ],
};

export const demoWatchConnections = [
  {
    id: "conn-csv",
    provider: "csv" as const,
    status: "connected" as const,
    scopes: ["sleep", "heart_rate", "hrv", "steps", "workouts"],
    lastSyncedAt: "2026-10-02T08:01:00.000Z",
    firstSyncedAt: "2026-08-20T09:00:00.000Z",
    availableMetrics: ["sleep_duration_min", "resting_hr_bpm", "hrv_rmssd_ms", "steps", "active_minutes"],
    missingMetrics: ["workout_duration_min"],
    errorCode: null,
    live: true,
    comingSoonReason: null,
  },
  {
    id: "conn-apple",
    provider: "apple_health" as const,
    status: "not_connected" as const,
    scopes: ["sleep", "heart_rate", "hrv", "steps", "workouts"],
    lastSyncedAt: null,
    firstSyncedAt: null,
    availableMetrics: [],
    missingMetrics: ["sleep", "heart_rate", "hrv", "steps", "workouts"],
    errorCode: null,
    live: false,
    comingSoonReason: "Requires an iOS development build with HealthKit entitlements — not Expo Go.",
  },
  {
    id: "conn-hc",
    provider: "health_connect" as const,
    status: "not_connected" as const,
    scopes: ["sleep", "heart_rate", "hrv", "steps", "workouts"],
    lastSyncedAt: null,
    firstSyncedAt: null,
    availableMetrics: [],
    missingMetrics: ["sleep", "heart_rate", "hrv", "steps", "workouts"],
    errorCode: null,
    live: false,
    comingSoonReason: "Requires an Android development build with Health Connect — not Expo Go.",
  },
  {
    id: "conn-garmin",
    provider: "garmin" as const,
    status: "coming_soon" as const,
    scopes: [],
    lastSyncedAt: null,
    firstSyncedAt: null,
    availableMetrics: [],
    missingMetrics: [],
    errorCode: "provider_unapproved",
    live: false,
    comingSoonReason: "Garmin Health and Activity APIs need developer approval. Use CSV import.",
  },
  {
    id: "conn-ghealth",
    provider: "google_health" as const,
    status: "coming_soon" as const,
    scopes: [],
    lastSyncedAt: null,
    firstSyncedAt: null,
    availableMetrics: [],
    missingMetrics: [],
    errorCode: "provider_unapproved",
    live: false,
    comingSoonReason:
      "Google Health API is not onboarding new projects; Fitbit Web API ends 30 October 2026. Use CSV import.",
  },
];
