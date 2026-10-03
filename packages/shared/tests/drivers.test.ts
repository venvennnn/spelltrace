import { describe, expect, it } from "vitest";
import {
  DEMO_CHANGED_SESSION_ID,
  contextPatterns,
  demoSessions,
  heroDelta,
  metricStrip,
  reviewForSession,
  sleepLeanScatter,
  todayDrivers,
} from "../src/index";

describe("athlete drivers", () => {
  const session = demoSessions.find((s) => s.id === DEMO_CHANGED_SESSION_ID)!;
  const review = reviewForSession(DEMO_CHANGED_SESSION_ID);

  it("heroes the trunk lean change", () => {
    const hero = heroDelta(review.findings);
    expect(hero.value.startsWith("+")).toBe(true);
    expect(hero.label).toMatch(/trunk/i);
  });

  it("ranks movement, sleep, heat, and a private cycle note", () => {
    const items = todayDrivers(session, demoSessions, review.findings, "/review");
    expect(items.some((d) => /trunk/i.test(d.title))).toBe(true);
    expect(items.some((d) => /sleep/i.test(d.title))).toBe(true);
    expect(items.some((d) => /heat/i.test(d.title))).toBe(true);
    expect(items.some((d) => /cycle/i.test(d.title) && /private/i.test(d.body))).toBe(true);
  });

  it("marks sleep and heat on the strip and keeps cycle off the verdict list", () => {
    const strip = metricStrip(session, demoSessions);
    expect(strip.find((c) => c.label === "Sleep")?.alert).toBe(true);
    expect(strip.find((c) => c.label === "Heat")?.note).toBe("changed");
    const patterns = contextPatterns(session, demoSessions);
    const cycle = patterns.find((p) => p.id === "cycle")!;
    expect(cycle.tag).toBe("NO CLEAR EFFECT");
    expect(cycle.note).toMatch(/private/i);
    expect(patterns.some((p) => p.id === "sleep")).toBe(true);
  });

  it("plots today as the changed sleep/lean point", () => {
    const pts = sleepLeanScatter(session, demoSessions);
    expect(pts.some((p) => p.changed && p.id === DEMO_CHANGED_SESSION_ID)).toBe(true);
    expect(pts.filter((p) => !p.changed).length).toBeGreaterThan(2);
  });
});
