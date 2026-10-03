import { describe, expect, it } from "vitest";
import {
  DEMO_CHANGED_SESSION_ID,
  cycleDelta,
  demoSessions,
  environmentDeltas,
  movementDeltas,
  recoveryDeltas,
  reviewForSession,
} from "../src/index";

describe("visible deltas", () => {
  const session = demoSessions.find((s) => s.id === DEMO_CHANGED_SESSION_ID)!;
  const review = reviewForSession(DEMO_CHANGED_SESSION_ID);

  it("shows movement change vs usual", () => {
    const rows = movementDeltas(review.findings);
    const trunk = rows.find((r) => /trunk/i.test(r.label));
    expect(trunk).toBeTruthy();
    expect(trunk!.delta.startsWith("+")).toBe(true);
    expect(parseFloat(trunk!.today)).toBeGreaterThan(parseFloat(trunk!.usual));
  });

  it("shows sleep shorter than usual and never infers cycle phase", () => {
    const rec = recoveryDeltas(session, demoSessions);
    const sleep = rec.find((r) => r.id === "sleep")!;
    expect(sleep.today).toContain("h");
    expect(sleep.delta).toMatch(/-/);
    const cycle = cycleDelta(session, demoSessions);
    expect(cycle.today).toBe("Logged");
    expect(cycle.delta).toBe("Private");
    expect(cycle.tone).toBe("note");
  });

  it("shows heat changed vs usual mild days", () => {
    const env = environmentDeltas(session, demoSessions);
    const heat = env.find((r) => r.id === "heat")!;
    expect(heat.today).toBe("hot");
    expect(heat.delta).toBe("Changed");
  });
});
