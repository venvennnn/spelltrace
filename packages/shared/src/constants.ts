export const ALGORITHM_VERSION = "pose-0.1";
export const FEATURE_VERSION = "pose-features-0.1";
export const KEYPOINT_SCHEMA = "mediapipe-pose-landmarker-33-v0.1";
export const PROMPT_VERSION = "gemini-athlete-narration-0.2";
export const MODEL_VERSION = "gemini-2.5-flash";

export const BASELINE_MIN_SESSIONS = 3;
export const BASELINE_MIN_DELIVERIES = 30;
export const MAX_FINDINGS = 3;
export const DEFAULT_BACKFILL_DAYS = 90;

export const VIDEO_MAX_BYTES = 500 * 1024 * 1024;
export const VIDEO_MAX_DURATION_MS = 10 * 60 * 1000;
export const VIDEO_MIME = ["video/mp4", "video/quicktime"] as const;

export const ALLOWED_DAILY_METRICS = [
  "sleep_duration_min",
  "resting_hr_bpm",
  "hrv_rmssd_ms",
  "steps",
  "active_minutes",
  "workout_duration_min",
  "workout_hr_avg_bpm",
] as const;

export const MOTION_MIN_HZ = 25;

export const CONNECTION_STATES = [
  "not_connected",
  "authorizing",
  "backfilling",
  "connected",
  "partial",
  "permission_denied",
  "expired",
  "provider_unavailable",
  "coming_soon",
] as const;

export const JOB_STATES = ["queued", "processing", "complete", "failed", "quality_rejected"] as const;

export const PROVIDERS = [
  "apple_health",
  "health_connect",
  "garmin",
  "google_health",
  "csv",
] as const;

export const LIVE_PROVIDERS: Record<(typeof PROVIDERS)[number], "ios" | "android" | "all" | "none"> = {
  apple_health: "ios",
  health_connect: "android",
  garmin: "none",
  google_health: "none",
  csv: "all",
};

export const NATIVE_SCOPES = ["sleep", "heart_rate", "hrv", "steps", "workouts"] as const;
