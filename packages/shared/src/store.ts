import { createHash, randomBytes } from "node:crypto";
import {
  ALLOWED_DAILY_METRICS,
  ALGORITHM_VERSION,
  FEATURE_VERSION,
  VIDEO_MAX_BYTES,
  VIDEO_MAX_DURATION_MS,
  VIDEO_MIME,
} from "./constants";
import {
  demoAthlete,
  demoSessions,
  demoWatchConnections,
  reviewForSession,
  type DemoSession,
} from "./demo/seed";
import { previewDailyWatch, previewMotion } from "./analysis/csv";
import { deterministicNarration, evidenceHash, validateGeminiOutput } from "./analysis/gemini";
import type { EvidenceBundle, GeminiOutput, SessionCreate, ShareCreate } from "./schemas/index";
import { sessionCreateSchema, shareCreateSchema } from "./schemas/index";

export type ShareSet = {
  id: string;
  athleteId: string;
  title: string;
  token: string;
  tokenHash: string;
  expiresAt: string;
  revokedAt: string | null;
  items: {
    videoId?: string;
    deliveryId?: string;
    movementTraceId?: string;
    allowedFields: string[];
    sortOrder: number;
  }[];
};

export type AuditEvent = { event: string; occurredAt: string; detail?: unknown };

export type StoreSnapshot = {
  athlete: typeof demoAthlete;
  sessions: DemoSession[];
  connections: typeof demoWatchConnections;
  shares: ShareSet[];
  audit: AuditEvent[];
  insights: Record<string, { output: GeminiOutput; validation: "accepted" | "rejected"; hash: string }>;
  jobs: Record<string, { id: string; videoId: string; state: string; algorithmVersion: string }>;
};

function clone<T>(v: T): T {
  return structuredClone(v);
}

export function createStore(seed: "demo" | "empty" = "demo"): {
  snapshot(): StoreSnapshot;
  listSessions(): DemoSession[];
  getSession(id: string): DemoSession | undefined;
  createSession(input: SessionCreate): DemoSession;
  patchSession(id: string, patch: Partial<DemoSession>): DemoSession;
  deleteSession(id: string): void;
  review(id: string): ReturnType<typeof reviewForSession>;
  deleteVideo(videoId: string, keepMovement: boolean): void;
  excludeDelivery(deliveryId: string, excluded: boolean): void;
  importCsv(sessionId: string, kind: "daily_watch" | "motion_samples", text: string): unknown;
  uploadIntent(input: {
    sessionId: string;
    filename: string;
    mime: string;
    sizeBytes: number;
    durationMs?: number;
  }): { uploadUrl: string; videoId: string } | { code: string; message: string };
  createShare(input: ShareCreate): ShareSet;
  getShareByToken(token: string): ShareSet | { code: string; message: string };
  revokeShare(id: string): void;
  publicShare(token: string): unknown;
  trends(grain: "ball" | "day" | "month", filters?: { view?: string; drill?: string; effort?: string }): unknown;
  timeline(date: string): unknown;
  explain(sessionId: string, modelOutput?: unknown): unknown;
  connections(): typeof demoWatchConnections;
  authorize(provider: string): unknown;
  disconnect(id: string, erase: boolean): void;
  nativeIngest(records: { externalRecordId: string; metric: string; value: number }[]): { imported: number; skipped: number };
} {
  const state: StoreSnapshot = {
    athlete: clone(demoAthlete),
    sessions: seed === "demo" ? clone(demoSessions) : [],
    connections: clone(demoWatchConnections),
    shares: [],
    audit: [],
    insights: {},
    jobs: {},
  };

  const audit = (event: string, detail?: unknown) => {
    state.audit.push({ event, occurredAt: new Date().toISOString(), detail });
  };

  function sessionByVideo(videoId: string) {
    return state.sessions.find((s) => s.video?.id === videoId);
  }

  function allDeliveries() {
    return state.sessions.flatMap((s) => s.deliveries.map((d) => ({ session: s, delivery: d })));
  }

  return {
    snapshot: () => clone(state),
    listSessions: () => clone(state.sessions).sort((a, b) => b.startedAtUtc.localeCompare(a.startedAtUtc)),
    getSession: (id) => clone(state.sessions.find((s) => s.id === id)),
    createSession(input) {
      const parsed = sessionCreateSchema.parse(input);
      const id = `sess-${randomBytes(4).toString("hex")}`;
      const started = new Date(parsed.startedAtLocal);
      const sess: DemoSession = {
        id,
        athleteId: state.athlete.id,
        startedAtUtc: started.toISOString(),
        timezone: parsed.timezone,
        view: parsed.view,
        drill: parsed.drill,
        effort: parsed.effort,
        bowlingArm: parsed.bowlingArm,
        status: parsed.saveDraft ? "draft" : "processing",
        environment: {
          perceivedHeat: parsed.environment?.perceivedHeat ?? "mild",
          surface: (parsed.environment?.surface ?? "turf") as DemoSession["environment"]["surface"],
          indoorOutdoor: parsed.environment?.indoorOutdoor ?? "outdoor",
        },
        video: null,
        checkIn: {
          sleepFeeling: parsed.checkIn.sleepFeeling,
          fatigue: parsed.checkIn.fatigue,
          soreness: parsed.checkIn.soreness,
          rpe: parsed.checkIn.rpe,
          notes: parsed.checkIn.notes,
          sensitive: parsed.checkIn.sensitive,
        },
        deliveries: [],
        motionStatus: "not_recorded",
        watchDay: {},
        provenance: "synthetic-demo",
      };
      state.sessions.push(sess);
      audit("session.created", { id });
      return clone(sess);
    },
    patchSession(id, patch) {
      const s = state.sessions.find((x) => x.id === id);
      if (!s) throw new Error("not_found");
      Object.assign(s, patch);
      return clone(s);
    },
    deleteSession(id) {
      state.sessions = state.sessions.filter((s) => s.id !== id);
      audit("session.deleted", { id });
    },
    review(id) {
      const live = state.sessions.find((s) => s.id === id);
      if (!live) throw new Error("not_found");
      return reviewForSession(id, state.sessions);
    },
    deleteVideo(videoId, keepMovement) {
      const s = sessionByVideo(videoId);
      if (!s || !s.video) throw new Error("not_found");
      if (!keepMovement && s.status !== "complete") {
        // analysis unfinished — refuse automatic deletion path
      }
      if (keepMovement) {
        if (!s.deliveries.length) {
          throw Object.assign(new Error("movement_unavailable"), { code: "movement_unavailable" });
        }
        s.video.deleted = true;
        s.deliveries.forEach((d) => {
          d.videoId = null;
        });
        audit("video.deleted_keep_movement", { videoId });
      } else {
        s.video = null;
        s.deliveries = [];
        audit("video.deleted_purge", { videoId });
      }
    },
    excludeDelivery(deliveryId, excluded) {
      for (const s of state.sessions) {
        const d = s.deliveries.find((x) => x.id === deliveryId);
        if (d) d.excluded = excluded;
      }
    },
    importCsv(sessionId, kind, text) {
      const s = state.sessions.find((x) => x.id === sessionId);
      if (!s) throw new Error("not_found");
      if (kind === "daily_watch") {
        const preview = previewDailyWatch(text);
        if (preview.accepted === 0) return { preview, imported: 0 };
        s.watchDay = s.watchDay ?? {};
        return { preview, imported: preview.accepted };
      }
      const preview = previewMotion(text);
      if (preview.rejected.length) {
        s.motionStatus = "not_recorded";
        return { preview, imported: 0, motionStatus: "rejected" };
      }
      s.motionStatus = preview.accepted > 0 ? "imported" : "not_recorded";
      return { preview, imported: preview.accepted, motionStatus: s.motionStatus };
    },
    uploadIntent(input) {
      if (!VIDEO_MIME.includes(input.mime as (typeof VIDEO_MIME)[number])) {
        return { code: "unsupported_mime", message: "Use MP4 or MOV." };
      }
      if (input.sizeBytes > VIDEO_MAX_BYTES) {
        return { code: "file_too_large", message: "Prototype cap is 500 MB." };
      }
      if (input.durationMs && input.durationMs > VIDEO_MAX_DURATION_MS) {
        return { code: "duration_too_long", message: "Prototype cap is 10 minutes." };
      }
      const s = state.sessions.find((x) => x.id === input.sessionId);
      if (!s) return { code: "not_found", message: "Session not found." };
      const videoId = `vid-${randomBytes(4).toString("hex")}`;
      s.video = {
        id: videoId,
        durationMs: input.durationMs ?? 20000,
        width: 1280,
        height: 720,
        deleted: false,
        placeholder: true,
        label: input.filename,
      };
      state.jobs[videoId] = {
        id: `job-${videoId}`,
        videoId,
        state: "queued",
        algorithmVersion: ALGORITHM_VERSION,
      };
      return { uploadUrl: `/api/videos/upload/${videoId}`, videoId };
    },
    createShare(input) {
      const parsed = shareCreateSchema.parse(input);
      const token = randomBytes(18).toString("hex");
      const share: ShareSet = {
        id: `share-${randomBytes(4).toString("hex")}`,
        athleteId: state.athlete.id,
        title: parsed.title,
        token,
        tokenHash: createHash("sha256").update(token).digest("hex"),
        expiresAt: new Date(Date.now() + parsed.expiresInHours * 3600_000).toISOString(),
        revokedAt: null,
        items: parsed.items.map((it, i) => ({ ...it, sortOrder: i })),
      };
      state.shares.push(share);
      audit("share.created", { id: share.id, n: share.items.length });
      return clone(share);
    },
    getShareByToken(token) {
      const hash = createHash("sha256").update(token).digest("hex");
      const share = state.shares.find((s) => s.tokenHash === hash);
      if (!share) return { code: "not_found", message: "Unknown share link." };
      if (share.revokedAt) return { code: "revoked", message: "This link has been revoked." };
      if (Date.parse(share.expiresAt) < Date.now()) return { code: "expired", message: "This link has expired." };
      return clone(share);
    },
    revokeShare(id) {
      const s = state.shares.find((x) => x.id === id);
      if (s) s.revokedAt = new Date().toISOString();
      audit("share.revoked", { id });
    },
    publicShare(token) {
      const found = this.getShareByToken(token);
      if ("code" in found) return found;
      const exposed = found.items.map((item) => {
        const delivery = allDeliveries().find((d) => d.delivery.id === item.deliveryId);
        const session = delivery?.session ?? state.sessions.find((s) => s.video?.id === item.videoId);
        const allowed = new Set(item.allowedFields);
        return {
          deliveryId: item.deliveryId,
          videoId: allowed.has("full_raw_video") ? item.videoId : undefined,
          movementOnly: Boolean(session?.video?.deleted) || !allowed.has("full_raw_video"),
          metrics: allowed.has("metrics") ? delivery?.delivery.values : undefined,
          notes: allowed.has("check_in_details") ? session?.checkIn.notes : undefined,
          checkIn: allowed.has("check_in_details")
            ? { sleepFeeling: session?.checkIn.sleepFeeling, rpe: session?.checkIn.rpe }
            : undefined,
          sensitive: allowed.has("cycle_symptom_notes") ? session?.checkIn.sensitive : undefined,
          dailyHealth: allowed.has("daily_health_metrics") ? session?.watchDay : undefined,
          label: session?.video?.deleted ? "original video deleted" : session?.video?.label,
        };
      });
      return { title: found.title, expiresAt: found.expiresAt, items: exposed, demo: true };
    },
    trends(grain, filters) {
      const rows = allDeliveries().filter(({ session, delivery }) => {
        if (!delivery.values || Object.keys(delivery.values).length === 0) return false;
        if (filters?.view && session.view !== filters.view) return false;
        if (filters?.drill && session.drill !== filters.drill) return false;
        if (filters?.effort && session.effort !== filters.effort) return false;
        return true;
      });
      if (grain === "ball") {
        return rows.map(({ session, delivery }) => ({
          deliveryId: delivery.id,
          sessionId: session.id,
          at: session.startedAtUtc,
          timezone: session.timezone,
          values: delivery.values,
          videoDeleted: Boolean(session.video?.deleted),
          replay: session.video?.deleted ? "skeletal" : session.video ? "video" : "none",
          label: session.video?.deleted ? "source footage deleted" : undefined,
          algorithmVersion: FEATURE_VERSION,
        }));
      }
      const byKey = new Map<string, typeof rows>();
      for (const row of rows) {
        const d = new Date(row.session.startedAtUtc);
        const key =
          grain === "day"
            ? d.toISOString().slice(0, 10)
            : `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
        const list = byKey.get(key) ?? [];
        list.push(row);
        byKey.set(key, list);
      }
      return [...byKey.entries()].map(([key, list]) => {
        const trunks = list
          .map((r) => r.delivery.values.trunk_lateral_angle_at_foot_contact_deg)
          .filter((v): v is number => typeof v === "number");
        const sorted = [...trunks].sort((a, b) => a - b);
        const med = sorted.length
          ? sorted.length % 2
            ? sorted[Math.floor(sorted.length / 2)]
            : (sorted[sorted.length / 2 - 1]! + sorted[sorted.length / 2]!) / 2
          : null;
        return {
          key,
          n: list.length,
          sessions: new Set(list.map((r) => r.session.id)).size,
          medianTrunk: med,
          movementOnly: list.filter((r) => r.session.video?.deleted).length,
          algorithmVersion: FEATURE_VERSION,
        };
      });
    },
    timeline(date) {
      const session = state.sessions.find((s) => s.startedAtUtc.startsWith(date));
      if (!session) {
        return {
          date,
          timezone: state.athlete.timezone,
          blocks: [
            { id: "sleep", label: "Sleep", missing: true, value: null, source: "none" },
            { id: "checkin", label: "Morning check-in", missing: true, value: null, source: "none" },
            { id: "activity", label: "Activity", missing: true, value: null, source: "none" },
            { id: "session", label: "Bowling session", missing: true, value: null, source: "none" },
          ],
        };
      }
      return {
        date,
        timezone: session.timezone,
        blocks: [
          {
            id: "sleep",
            label: "Sleep",
            missing: session.watchDay.sleep_duration_min == null,
            value: session.watchDay.sleep_duration_min ?? null,
            source: session.watchDay.sleep_duration_min == null ? "none" : "imported-watch",
          },
          {
            id: "checkin",
            label: "Morning check-in",
            missing: false,
            value: session.checkIn,
            source: "athlete",
          },
          {
            id: "activity",
            label: "Activity",
            missing: session.watchDay.steps == null,
            value: session.watchDay.steps ?? null,
            source: session.watchDay.steps == null ? "none" : "imported-watch",
          },
          {
            id: "session",
            label: "Bowling session",
            missing: false,
            value: { view: session.view, drill: session.drill, effort: session.effort },
            source: "athlete",
          },
        ],
      };
    },
    explain(sessionId, modelOutput) {
      const review = this.review(sessionId);
      const bundle: EvidenceBundle = {
        sessionId,
        consentScope: "metrics_only",
        missing: [
          review.motionStatus === "not_recorded" ? "delivery-level watch recording" : "",
          ...review.watchContext.filter((w) => w.quality === "missing").map((w) => w.metric),
        ].filter(Boolean),
        evidence: review.findings.map((f) => ({
          id: f.evidenceId,
          modality: f.modality,
          feature: f.feature,
          current: f.current,
          personalMedian: f.personalMedian,
          sampleCount: f.sampleCount,
          quality: f.quality,
          text: f.text,
        })),
      };
      if (!bundle.evidence.length) {
        bundle.evidence.push({
          id: "baseline:status",
          modality: "pose",
          quality: "adequate",
          text: `Baseline ${review.baseline.status} with ${review.baseline.priorSessions} prior sessions.`,
          sampleCount: review.baseline.priorDeliveries,
        });
      }
      const hash = evidenceHash(bundle);
      if (modelOutput) {
        const check = validateGeminiOutput(modelOutput, bundle);
        if (!check.ok) {
          const fallback = deterministicNarration(bundle);
          state.insights[hash] = { output: fallback, validation: "rejected", hash };
          return { status: "rejected", reason: check.reason, narration: fallback, evidenceHash: hash, source: "template" };
        }
        state.insights[hash] = { output: check.output, validation: "accepted", hash };
        return { status: "accepted", narration: check.output, evidenceHash: hash, source: "gemini" };
      }
      const fallback = deterministicNarration(bundle);
      return { status: "template", narration: fallback, evidenceHash: hash, source: "template", bundle };
    },
    connections: () => clone(state.connections),
    authorize(provider) {
      const conn = state.connections.find((c) => c.provider === provider);
      if (!conn) return { code: "unknown_provider" };
      if (!conn.live) {
        return { code: "provider_unavailable", message: conn.comingSoonReason, status: conn.status };
      }
      conn.status = "connected";
      conn.lastSyncedAt = new Date().toISOString();
      conn.firstSyncedAt = conn.firstSyncedAt ?? conn.lastSyncedAt;
      return conn;
    },
    disconnect(id, erase) {
      const conn = state.connections.find((c) => c.id === id);
      if (!conn) return;
      conn.status = "not_connected";
      conn.lastSyncedAt = null;
      if (erase) {
        state.sessions.forEach((s) => {
          s.watchDay = {};
        });
      }
      audit("watch.disconnected", { id, erase });
    },
    nativeIngest(records) {
      let imported = 0;
      let skipped = 0;
      const seen = new Set<string>();
      for (const r of records) {
        if (!ALLOWED_DAILY_METRICS.includes(r.metric as (typeof ALLOWED_DAILY_METRICS)[number])) {
          skipped += 1;
          continue;
        }
        const key = `${r.externalRecordId}:${r.metric}`;
        if (seen.has(key)) {
          skipped += 1;
          continue;
        }
        seen.add(key);
        imported += 1;
      }
      return { imported, skipped };
    },
  };
}

