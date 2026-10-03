import { z } from "zod";
import {
  ALLOWED_DAILY_METRICS,
  ALGORITHM_VERSION,
  CONNECTION_STATES,
  JOB_STATES,
  PROVIDERS,
} from "../constants.js";

export const bowlingArmSchema = z.enum(["right", "left"]);
export const cameraViewSchema = z.enum(["side", "front"]);
export const drillSchema = z.enum(["nets", "match", "controlled"]);
export const effortSchema = z.enum(["easy", "normal", "high"]);
export const modalitySchema = z.enum(["pose", "watch_motion", "daily_context"]);
export const qualitySchema = z.enum(["adequate", "low", "inadequate", "available", "missing"]);
export const baselineStatusSchema = z.enum(["building", "ready", "preliminary"]);
export const motionStatusSchema = z.enum(["not_recorded", "imported", "rejected", "aligned"]);
export const overlayModeSchema = z.enum(["off", "skeleton", "finding"]);
export const retentionStateSchema = z.enum(["video_and_movement", "movement_only", "deleted"]);
export const sleepFeelingSchema = z.enum(["rested", "ok", "poor"]);
export const jobStateSchema = z.enum(JOB_STATES);
export const providerSchema = z.enum(PROVIDERS);
export const connectionStatusSchema = z.enum(CONNECTION_STATES);
export const dailyMetricSchema = z.enum(ALLOWED_DAILY_METRICS);

export const environmentSchema = z.object({
  perceivedHeat: z.enum(["cool", "mild", "hot"]).optional(),
  temperatureC: z.number().min(-10).max(55).optional(),
  humidityPct: z.number().min(0).max(100).optional(),
  surface: z.enum(["turf", "concrete", "indoor_mat", "grass", "unknown"]).optional(),
  indoorOutdoor: z.enum(["indoor", "outdoor"]).optional(),
  notes: z.string().max(400).optional(),
});

export const checkInSchema = z.object({
  sleepFeeling: sleepFeelingSchema,
  fatigue: z.number().int().min(1).max(10),
  soreness: z.number().int().min(0).max(10),
  rpe: z.number().int().min(1).max(10),
  notes: z.string().max(800).optional(),
  symptoms: z.string().max(400).optional(),
  sensitive: z
    .object({
      menstrualNotes: z.string().max(400).optional(),
    })
    .optional(),
});

export const sessionCreateSchema = z.object({
  startedAtLocal: z.string().min(1),
  timezone: z.string().min(1),
  bowlingArm: bowlingArmSchema,
  view: cameraViewSchema,
  drill: drillSchema,
  effort: effortSchema,
  approximateDeliveries: z.number().int().min(1).max(80),
  environment: environmentSchema.optional(),
  checkIn: checkInSchema,
  saveDraft: z.boolean().optional(),
});

export const deliveryBookmarkSchema = z.object({
  startMs: z.number().int().min(0),
  endMs: z.number().int().min(1),
  frontFootContactMs: z.number().int().min(0).optional(),
  backFootContactMs: z.number().int().min(0).optional(),
  releaseMs: z.number().int().min(0).optional(),
});

export const uploadIntentSchema = z.object({
  sessionId: z.string().min(1),
  filename: z.string().min(1),
  mime: z.string(),
  sizeBytes: z.number().int().positive(),
  durationMs: z.number().int().positive().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  capturedAtUtc: z.string().optional(),
});

export const importKindSchema = z.enum(["daily_watch", "motion_samples"]);

export const dailyWatchRowSchema = z.object({
  start_time_iso: z.string(),
  end_time_iso: z.string().optional(),
  timezone: z.string(),
  metric: dailyMetricSchema,
  value: z.number(),
  unit: z.string(),
  device: z.string().optional(),
  source: z.string().optional(),
});

export const motionSampleRowSchema = z.object({
  timestamp_iso: z.string(),
  timezone: z.string(),
  ax_m_s2: z.number(),
  ay_m_s2: z.number(),
  az_m_s2: z.number(),
  gx_rad_s: z.number().optional(),
  gy_rad_s: z.number().optional(),
  gz_rad_s: z.number().optional(),
  device: z.string().optional(),
  sampling_hz: z.number().positive(),
});

export const watchConnectionSchema = z.object({
  id: z.string(),
  provider: providerSchema,
  status: connectionStatusSchema,
  scopes: z.array(z.string()),
  lastSyncedAt: z.string().nullable(),
  firstSyncedAt: z.string().nullable(),
  availableMetrics: z.array(z.string()),
  missingMetrics: z.array(z.string()),
  errorCode: z.string().nullable(),
  preferred: z.boolean().optional(),
  live: z.boolean(),
  comingSoonReason: z.string().nullable(),
});

export const nativeIngestSchema = z.object({
  provider: z.enum(["apple_health", "health_connect"]),
  records: z.array(
    z.object({
      externalRecordId: z.string(),
      metric: dailyMetricSchema,
      value: z.number(),
      unit: z.string(),
      startUtc: z.string(),
      endUtc: z.string().optional(),
      device: z.string().optional(),
      hrvMethod: z.string().optional(),
    }),
  ),
});

export const reviewFindingSchema = z.object({
  deliveryId: z.string(),
  modality: modalitySchema,
  feature: z.string(),
  current: z.number(),
  personalMedian: z.number(),
  personalInterval: z.tuple([z.number(), z.number()]),
  scorePercentile: z.number().min(0).max(1),
  quality: qualitySchema,
  usualDeliveryId: z.string(),
  text: z.string(),
  evidenceId: z.string(),
  sampleCount: z.number().int(),
  source: z.enum(["synthetic-demo", "athlete"]),
});

export const watchContextSchema = z.object({
  metric: z.string(),
  today: z.number().nullable(),
  personalMedian: z.number().nullable(),
  source: z.string(),
  quality: qualitySchema,
  device: z.string().optional(),
  note: z.string().optional(),
});

export const reviewContractSchema = z.object({
  sessionId: z.string(),
  baseline: z.object({
    status: baselineStatusSchema,
    priorSessions: z.number().int(),
    priorDeliveries: z.number().int(),
    match: z.string(),
    algorithmVersion: z.string().default(ALGORITHM_VERSION),
  }),
  findings: z.array(reviewFindingSchema),
  watchContext: z.array(watchContextSchema),
  motionStatus: motionStatusSchema,
  limitations: z.array(z.string()),
  demo: z.boolean(),
  videoRetention: retentionStateSchema,
});

export const evidenceBundleSchema = z.object({
  sessionId: z.string(),
  evidence: z.array(
    z.object({
      id: z.string(),
      modality: modalitySchema,
      feature: z.string().optional(),
      metric: z.string().optional(),
      current: z.number().nullable().optional(),
      personalMedian: z.number().nullable().optional(),
      sampleCount: z.number().int().optional(),
      quality: z.string(),
      text: z.string(),
    }),
  ),
  missing: z.array(z.string()),
  consentScope: z.enum(["metrics_only", "metrics_and_stills"]),
});

export const geminiOutputSchema = z.object({
  sentences: z.array(
    z.object({
      text: z.string(),
      evidenceIds: z.array(z.string()).min(1),
    }),
  ),
  questions: z.array(z.string()).max(3),
});

export const shareCreateSchema = z.object({
  title: z.string().min(1).max(80),
  expiresInHours: z.number().int().min(1).max(24 * 30),
  items: z
    .array(
      z.object({
        videoId: z.string().optional(),
        deliveryId: z.string().optional(),
        movementTraceId: z.string().optional(),
        allowedFields: z.array(z.string()),
      }),
    )
    .min(1)
    .max(40),
});

export const shareDefaultsUnselected = [
  "check_in_details",
  "cycle_symptom_notes",
  "daily_health_metrics",
  "full_raw_video",
] as const;

export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.unknown().optional(),
});

export type SessionCreate = z.infer<typeof sessionCreateSchema>;
export type CheckIn = z.infer<typeof checkInSchema>;
export type ReviewContract = z.infer<typeof reviewContractSchema>;
export type ReviewFinding = z.infer<typeof reviewFindingSchema>;
export type WatchConnection = z.infer<typeof watchConnectionSchema>;
export type EvidenceBundle = z.infer<typeof evidenceBundleSchema>;
export type GeminiOutput = z.infer<typeof geminiOutputSchema>;
export type ShareCreate = z.infer<typeof shareCreateSchema>;
export type DailyWatchRow = z.infer<typeof dailyWatchRowSchema>;
export type MotionSampleRow = z.infer<typeof motionSampleRowSchema>;
export type DeliveryBookmark = z.infer<typeof deliveryBookmarkSchema>;
export type Environment = z.infer<typeof environmentSchema>;
export type UploadIntent = z.infer<typeof uploadIntentSchema>;
export type NativeIngest = z.infer<typeof nativeIngestSchema>;
