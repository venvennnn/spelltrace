export const product = {
  name: "Spelltrace",
  tagline: "Spot a change in your bowling, understand why, decide what to share",
  coreQuestion:
    "What changed for me today, compared with my own usual bowling under similar conditions?",
  audience: "Adult women pace bowlers — club, university, pathway, or national.",
} as const;

export const limits = {
  noDiagnosis:
    "Spelltrace detects deviations from your own earlier bowling. It does not diagnose injury, assign a medical risk percentage, infer cycle phase, or prescribe a spell cap.",
  noMaleNorms:
    "Your baseline is built only from your own comparable sessions. We never use male-derived “normal” ranges.",
  noWatchMotionFromDaily:
    "Daily heart rate, sleep, and steps are not bowling-motion data. Delivery-level watch movement needs a compatible recording app or an explicit motion file.",
  noBallClaims:
    "This version does not claim ball speed, landing accuracy, or true 3D spinal loading from a phone camera.",
  adultOnly: "Pilot access is adult-only.",
  demoBanner:
    "Demonstration data — synthetic sessions and rights-cleared placeholders. Not athlete validation.",
  geminiRole:
    "AI explanation is language only. Numbers come from measured features. If narration fails checks, you still see the measurements.",
  shareRevoke:
    "Revoking a link blocks later visits. It cannot retract a clip someone already downloaded.",
  videoDeleted: "Original video deleted. Skeletal replay uses stored landmarks only — pixels cannot be reconstructed.",
  movementUnavailable:
    "Movement-only retention is unavailable because analysis did not finish. Footage was not deleted automatically.",
} as const;

export const nav = {
  today: "Today",
  sessions: "Sessions",
  add: "Add",
  review: "Review",
  profile: "Profile",
} as const;

export const watchLabels = {
  notRecorded: "No delivery-level watch recording",
  dailyContext: "Daily watch context",
  pose: "Pose",
  watchMotion: "Watch motion",
  daily: "Daily context",
} as const;

export const providerCopy = {
  apple_health: {
    title: "Apple Watch / Apple Health",
    experience: "On iOS, tap Connect Apple Health and approve read access for sleep, heart rate, compatible HRV, steps, and workouts.",
    status: "native_ios",
    liveOn: "ios",
  },
  health_connect: {
    title: "Health Connect / Wear OS",
    experience: "On Android, tap Connect Health Connect and approve the same narrow reads. Google Fit may share records there when you configure it — that is not a Google-account login.",
    status: "native_android",
    liveOn: "android",
  },
  garmin: {
    title: "Garmin Connect",
    experience: "Coming soon. Garmin Health and Activity APIs need developer approval. Import a CSV meanwhile.",
    status: "coming_soon",
    liveOn: "none",
  },
  google_health: {
    title: "Google Health",
    experience: "Coming soon. Google’s Health API is not onboarding new projects, and the Fitbit Web API ends 30 October 2026. Import a CSV meanwhile.",
    status: "coming_soon",
    liveOn: "none",
  },
  csv: {
    title: "Import an export",
    experience: "Always available. Preview field mapping before you commit. We never claim a vendor export works until it has been tested.",
    status: "available",
    liveOn: "all",
  },
} as const;

export const phases = ["run_up", "back_foot_contact", "front_foot_contact", "release"] as const;

export const featureCopy: Record<
  string,
  { label: string; unit: string; how: string; joints: string[] }
> = {
  trunk_lateral_angle_at_foot_contact_deg: {
    label: "Trunk lean at front-foot contact",
    unit: "°",
    how: "2D angle between the mid-hip to mid-shoulder line and vertical, at the marked front-foot-contact frame. Side-on view only. Camera angle affects the estimate.",
    joints: ["left_shoulder", "right_shoulder", "left_hip", "right_hip"],
  },
  front_knee_flexion_at_ffc_deg: {
    label: "Front-knee flexion at contact",
    unit: "°",
    how: "2D angle at the front knee (hip–knee–ankle) on the marked contact frame. Requires a side-on view with a visible front leg.",
    joints: ["left_hip", "left_knee", "left_ankle", "right_hip", "right_knee", "right_ankle"],
  },
  stride_time_ms: {
    label: "Stride time",
    unit: "ms",
    how: "Time between back-foot contact and front-foot contact when both events are marked.",
    joints: ["left_ankle", "right_ankle"],
  },
  shoulder_hip_alignment_deg: {
    label: "Shoulder–hip alignment",
    unit: "°",
    how: "2D difference between shoulder-line and hip-line orientation at front-foot contact.",
    joints: ["left_shoulder", "right_shoulder", "left_hip", "right_hip"],
  },
  runup_cadence_spm: {
    label: "Run-up cadence",
    unit: "spm",
    how: "Estimated steps per minute during the run-up window from ankle landmark oscillations. Coarse when the camera is front-on.",
    joints: ["left_ankle", "right_ankle"],
  },
};

export const emptyStates = {
  noSessions: "No sessions yet. Film a spell from a stable side-on or front-on view to begin.",
  baselineBuilding:
    "Baseline building. A confident change label needs at least 3 earlier matched sessions and 30 quality-passed deliveries. You can still compare clips.",
  missingWatch: "No watch file for this day. Pose comparison still works.",
  cannotCompare: "This clip cannot be compared — quality or framing was not adequate.",
  noFindings: "Nothing stood out against your usual matched bowling. Measurements are still available.",
} as const;
