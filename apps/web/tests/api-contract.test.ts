import { describe, expect, it } from "vitest";
import { createStore } from "../../packages/shared/src/store.ts";
import { reviewContractSchema, sessionCreateSchema } from "../../packages/shared/src/schemas/index.ts";

describe("API contracts", () => {
  it("review payload matches the published contract", () => {
    const store = createStore("demo");
    const review = store.review("sess-changed-2026-10-02");
    expect(reviewContractSchema.parse(review).findings.length).toBeGreaterThan(0);
    expect(review.motionStatus).toBe("not_recorded");
  });

  it("session create requires timezone and check-in", () => {
    const parsed = sessionCreateSchema.safeParse({
      startedAtLocal: "2026-10-03T17:00",
      timezone: "Australia/Melbourne",
      bowlingArm: "right",
      view: "side",
      drill: "nets",
      effort: "normal",
      approximateDeliveries: 4,
      checkIn: { sleepFeeling: "ok", fatigue: 4, soreness: 2, rpe: 5 },
    });
    expect(parsed.success).toBe(true);
  });
});
