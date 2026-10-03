import { describe, expect, it } from "vitest";
import {
  BASELINE_MIN_DELIVERIES,
  BASELINE_MIN_SESSIONS,
  DEMO_CHANGED_SESSION_ID,
  DEMO_MOVEMENT_ONLY_SESSION_ID,
  allFeatureVectors,
  baselineStatus,
  comparatorKey,
  demoSessions,
  demoWatchConnections,
  deterministicNarration,
  evidenceBundleSchema,
  mapLandmarkToPlayer,
  matchPrior,
  previewDailyWatch,
  previewMotion,
  reviewForSession,
  validateGeminiOutput,
} from "../src/index.js";
import { createStore as makeStore } from "../src/store.js";

describe("acceptance (b) pose findings without fabricating watch motion", () => {
  it("returns pose findings and marks watch motion absent", () => {
    const review = reviewForSession(DEMO_CHANGED_SESSION_ID);
    expect(review.demo).toBe(true);
    expect(review.findings.length).toBeGreaterThan(0);
    expect(review.findings.every((f) => f.modality === "pose")).toBe(true);
    expect(review.findings.every((f) => f.source === "synthetic-demo")).toBe(true);
    expect(review.motionStatus).toBe("not_recorded");
    expect(review.limitations.some((l) => /watch recording/i.test(l))).toBe(true);
    expect(review.findings.some((f) => f.modality === "watch_motion")).toBe(false);
  });
});

describe("acceptance (c) no IMU means no watch-motion anomaly", () => {
  it("never invents watch-motion findings from daily HR/sleep/steps", () => {
    const review = reviewForSession(DEMO_CHANGED_SESSION_ID);
    expect(review.watchContext.every((w) => w.metric !== "wrist_accel")).toBe(true);
    expect(review.motionStatus).toBe("not_recorded");
    for (const s of demoSessions) {
      expect(s.motionStatus).toBe("not_recorded");
    }
  });
});

describe("acceptance (d)(e) baseline gates and comparator", () => {
  it("withholds confident labels before 3 sessions / 30 deliveries", () => {
    const first = demoSessions[0]!;
    const review = reviewForSession(first.id);
    expect(review.baseline.status).toBe("building");
    expect(review.findings).toEqual([]);
    expect(review.baseline.priorSessions).toBeLessThan(BASELINE_MIN_SESSIONS);
  });

  it("only matches earlier same-arm/view/drill/effort sessions", () => {
    const vectors = allFeatureVectors();
    const current = vectors.find((v) => v.sessionId === DEMO_CHANGED_SESSION_ID)!;
    const priors = matchPrior(current, vectors);
    expect(priors.every((p) => Date.parse(p.startedAtUtc) < Date.parse(current.startedAtUtc))).toBe(true);
    expect(priors.every((p) => p.view === "side" && p.drill === "nets" && p.effort === "normal")).toBe(true);
    expect(priors.some((p) => p.sessionId === "sess-2026-09-26")).toBe(false);
    const status = baselineStatus(priors);
    expect(status.priorSessions).toBeGreaterThanOrEqual(BASELINE_MIN_SESSIONS);
    expect(status.priorDeliveries).toBeGreaterThanOrEqual(BASELINE_MIN_DELIVERIES);
    expect(status.status).toBe("ready");
    expect(
      comparatorKey({ bowlingArm: current.bowlingArm, view: current.view, drill: current.drill }),
    ).toBe("right-arm / side view / nets");
  });
});

describe("acceptance (f) phase alignment", () => {
  it("stores matching phase markers on usual and changed deliveries", () => {
    const changed = demoSessions.find((s) => s.id === DEMO_CHANGED_SESSION_ID)!;
    const usual = demoSessions.find((s) => s.id === "sess-2026-09-20")!;
    expect(changed.deliveries[0]!.frontFootContactMs).toBe(usual.deliveries[0]!.frontFootContactMs);
    expect(changed.deliveries[0]!.backFootContactMs).toBe(usual.deliveries[0]!.backFootContactMs);
  });
});

describe("acceptance (g)(h)(l) shares", () => {
  it("keeps private notes out unless selected, and revoke blocks later reads", () => {
    const store = makeStore("demo");
    const one = store.createShare({
      title: "One clip",
      expiresInHours: 24,
      items: [
        {
          deliveryId: `${DEMO_CHANGED_SESSION_ID}-d1`,
          videoId: `vid-${DEMO_CHANGED_SESSION_ID}`,
          allowedFields: ["metrics"],
        },
      ],
    });
    const pub = store.publicShare(one.token) as { items: Array<{ sensitive?: unknown; notes?: unknown }> };
    expect(pub.items[0]!.sensitive).toBeUndefined();
    expect(pub.items[0]!.notes).toBeUndefined();

    const three = store.createShare({
      title: "Three",
      expiresInHours: 12,
      items: demoSessions.slice(0, 3).map((s) => ({
        videoId: s.video?.id,
        deliveryId: s.deliveries[0]?.id,
        allowedFields: ["metrics"],
      })),
    });
    expect(three.items).toHaveLength(3);

    const twentyItems = Array.from({ length: 20 }, (_, i) => ({
      deliveryId: demoSessions[0]!.deliveries[0]!.id,
      allowedFields: ["metrics"],
      videoId: `v-${i}`,
    }));
    const twenty = store.createShare({ title: "Twenty", expiresInHours: 2, items: twentyItems });
    expect(twenty.items).toHaveLength(20);

    store.revokeShare(one.id);
    const blocked = store.publicShare(one.token) as { code: string };
    expect(blocked.code).toBe("revoked");
  });
});

describe("acceptance (i) csv validation", () => {
  it("rejects unknown units and malformed timestamps", () => {
    const daily = previewDailyWatch(
      "start_time_iso,end_time_iso,timezone,metric,value,unit,device,source\n" +
        "not-a-date,,Australia/Melbourne,sleep_duration_min,400,min,Watch,demo\n" +
        "2026-09-01T22:00:00,2026-09-02T06:00:00,Australia/Melbourne,sleep_duration_min,400,hours,Watch,demo\n",
    );
    expect(daily.accepted).toBe(0);
    expect(daily.rejected.some((r) => /timestamp/i.test(r.reason))).toBe(true);
    expect(daily.rejected.some((r) => /unit/i.test(r.reason))).toBe(true);

    const motion = previewMotion(
      "timestamp_iso,timezone,ax_m_s2,ay_m_s2,az_m_s2,gx_rad_s,gy_rad_s,gz_rad_s,device,sampling_hz\n" +
        "2026-10-02T07:20:01,Australia/Melbourne,0,0,9.8,0,0,0,Watch,50\n" +
        "2026-10-02T07:20:00,Australia/Melbourne,0,0,9.8,0,0,0,Watch,50\n",
    );
    expect(motion.rejected.some((r) => /increasing/i.test(r.reason))).toBe(true);
  });
});

describe("acceptance (j) demo provenance", () => {
  it("labels every demo number as synthetic", () => {
    const review = reviewForSession(DEMO_CHANGED_SESSION_ID);
    expect(review.demo).toBe(true);
    expect(review.limitations.some((l) => /synthetic|demonstration/i.test(l))).toBe(true);
    expect(review.findings.every((f) => f.source === "synthetic-demo")).toBe(true);
  });
});

describe("acceptance (k)(m) movement-only vs purge", () => {
  it("keeps deleted-video sessions in trends as skeletal replay", () => {
    const store = makeStore("demo");
    const balls = store.trends("ball") as Array<{ sessionId: string; replay: string; videoDeleted: boolean }>;
    const kept = balls.filter((b) => b.sessionId === DEMO_MOVEMENT_ONLY_SESSION_ID);
    expect(kept.length).toBeGreaterThan(0);
    expect(kept.every((b) => b.replay === "skeletal" && b.videoDeleted)).toBe(true);

    const victim = store.getSession("sess-2026-08-22")!;
    store.deleteVideo(victim.video!.id, false);
    const after = store.trends("ball") as Array<{ sessionId: string }>;
    expect(after.some((b) => b.sessionId === "sess-2026-08-22")).toBe(false);
  });
});

describe("acceptance (o)(p) watch connections", () => {
  it("shows live vs coming-soon providers without fake buttons as live", () => {
    expect(demoWatchConnections.find((c) => c.provider === "garmin")?.status).toBe("coming_soon");
    expect(demoWatchConnections.find((c) => c.provider === "google_health")?.status).toBe("coming_soon");
    expect(demoWatchConnections.find((c) => c.provider === "garmin")?.live).toBe(false);
    const store = makeStore("demo");
    const garmin = store.authorize("garmin") as { code: string };
    expect(garmin.code).toBe("provider_unavailable");
    const dup = store.nativeIngest([
      { externalRecordId: "r1", metric: "steps", value: 100 },
      { externalRecordId: "r1", metric: "steps", value: 100 },
    ]);
    expect(dup.imported).toBe(1);
    expect(dup.skipped).toBe(1);
  });
});

describe("acceptance (q) overlay mapping", () => {
  it("letterboxes normalized landmarks into the player without assuming stretch", () => {
    const layout = {
      videoWidth: 1280,
      videoHeight: 720,
      rotation: 0 as const,
      displayWidth: 400,
      displayHeight: 400,
      objectFit: "contain" as const,
    };
    const mid = mapLandmarkToPlayer({ x: 0.5, y: 0.5, visibility: 0.9 }, layout);
    expect(mid.x).toBeCloseTo(200, 0);
    expect(mid.y).toBeCloseTo(200, 0);
    const left = mapLandmarkToPlayer({ x: 0, y: 0, visibility: 0.9 }, layout);
    expect(left.y).toBeGreaterThan(80);
    const rotated = mapLandmarkToPlayer(
      { x: 0, y: 0, visibility: 0.9 },
      { ...layout, rotation: 180, displayWidth: 1280, displayHeight: 720 },
    );
    expect(rotated.x).toBeCloseTo(1280, 0);
    expect(rotated.y).toBeCloseTo(720, 0);
  });
});

describe("acceptance (s) Gemini validation", () => {
  it("rejects altered figures, missing IDs, and medical claims; review still works", () => {
    const review = reviewForSession(DEMO_CHANGED_SESSION_ID);
    const bundle = evidenceBundleSchema.parse({
      sessionId: review.sessionId,
      consentScope: "metrics_only",
      missing: ["delivery-level watch recording"],
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
    });
    const okId = bundle.evidence[0]!.id;
    expect(
      validateGeminiOutput(
        { sentences: [{ text: "You have a 40% injury risk.", evidenceIds: [okId] }], questions: [] },
        bundle,
      ).ok,
    ).toBe(false);
    expect(
      validateGeminiOutput(
        { sentences: [{ text: "Trunk lean was 99 degrees.", evidenceIds: [okId] }], questions: [] },
        bundle,
      ).ok,
    ).toBe(false);
    expect(
      validateGeminiOutput(
        { sentences: [{ text: "Something changed.", evidenceIds: ["nope"] }], questions: [] },
        bundle,
      ).ok,
    ).toBe(false);
    const store = makeStore("demo");
    const explained = store.explain(DEMO_CHANGED_SESSION_ID) as { source: string };
    expect(explained.source).toBe("template");
    const fallback = deterministicNarration(bundle);
    expect(fallback.sentences.length).toBeGreaterThan(0);
  });
});

describe("missing data is not zero", () => {
  it("renders null HRV on the movement-only day", () => {
    const sess = demoSessions.find((s) => s.id === DEMO_MOVEMENT_ONLY_SESSION_ID)!;
    expect(sess.watchDay.hrv_rmssd_ms).toBeNull();
    const store = makeStore("demo");
    const tl = store.timeline("2026-09-12") as { blocks: Array<{ id: string; missing: boolean; value: unknown }> };
    const sleep = tl.blocks.find((b) => b.id === "sleep")!;
    expect(sleep.missing).toBe(false);
    expect(sleep.value).not.toBe(0);
  });
});
