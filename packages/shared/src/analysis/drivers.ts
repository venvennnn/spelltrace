import type { DemoSession } from "../demo/seed";
import type { ReviewFinding } from "../schemas/index";
import { featureCopy } from "../copy";
import { cycleDelta, environmentDeltas, recoveryDeltas } from "./deltas";

const SHORT: Record<string, string> = {
  trunk_lateral_angle_at_foot_contact_deg: "Trunk lean",
  front_knee_flexion_at_ffc_deg: "Front knee",
  stride_time_ms: "Stride time",
  shoulder_hip_alignment_deg: "Shoulder–hip",
  runup_cadence_spm: "Run-up cadence",
};

export type Driver = {
  n: number;
  title: string;
  body: string;
  href?: string;
  strong: boolean;
};

export type StripCell = {
  label: string;
  value: string;
  note: string;
  alert: boolean;
};

export function heroDelta(findings: ReviewFinding[]): { value: string; label: string } {
  const first = findings[0];
  if (!first) return { value: "—", label: "No stand-out change yet" };
  const meta = featureCopy[first.feature];
  const d = first.current - first.personalMedian;
  const unit = meta?.unit ?? "";
  const signed = `${d > 0 ? "+" : ""}${Math.round(d * 10) / 10}${unit}`;
  return { value: signed, label: SHORT[first.feature] ?? meta?.label ?? first.feature };
}

export function todayDrivers(
  session: DemoSession,
  sessions: DemoSession[],
  findings: ReviewFinding[],
  reviewHref: string,
): Driver[] {
  const recovery = recoveryDeltas(session, sessions);
  const env = environmentDeltas(session, sessions);
  const cycle = cycleDelta(session, sessions);
  const sleep = recovery.find((r) => r.id === "sleep");
  const heat = env.find((r) => r.id === "heat");
  const top = findings[0];
  const meta = top ? featureCopy[top.feature] : undefined;
  const items: Driver[] = [];

  if (top && meta) {
    const d = Math.round((top.current - top.personalMedian) * 10) / 10;
    items.push({
      n: items.length + 1,
      title: `${SHORT[top.feature] ?? meta.label} ${d > 0 ? "+" : ""}${d}${meta.unit}`,
      body: `${top.current}${meta.unit} today vs ${top.personalMedian}${meta.unit} usual.`,
      href: reviewHref,
      strong: true,
    });
  }
  if (sleep && sleep.tone !== "same") {
    items.push({
      n: items.length + 1,
      title: `Sleep ${sleep.today} — the gap`,
      body: `Usual mornings were ${sleep.usual}. Context only — not a cause.`,
      strong: true,
    });
  }
  if (heat && heat.delta === "Changed") {
    items.push({
      n: items.length + 1,
      title: `Heat ${heat.today} vs ${heat.usual}`,
      body: "Same surface and setting. Heat is the environment change.",
      strong: false,
    });
  }
  items.push({
    n: items.length + 1,
    title: `Cycle note: ${cycle.today}`,
    body: "Private. Not used as a performance or injury verdict.",
    strong: false,
  });
  return items.slice(0, 4);
}

export function metricStrip(session: DemoSession, sessions: DemoSession[]): StripCell[] {
  const recovery = recoveryDeltas(session, sessions);
  const env = environmentDeltas(session, sessions);
  const sleep = recovery.find((r) => r.id === "sleep")!;
  const hrv = recovery.find((r) => r.id === "hrv")!;
  const rhr = recovery.find((r) => r.id === "rhr")!;
  const heat = env.find((r) => r.id === "heat")!;
  return [
    { label: "Sleep", value: sleep.today, note: sleep.tone === "missing" ? "missing" : sleep.tone === "down" ? "below usual" : "in range", alert: sleep.tone === "down" },
    { label: "HRV", value: hrv.today.replace(" ms", ""), note: hrv.tone === "down" ? "below usual" : "in range", alert: hrv.tone === "down" },
    { label: "RHR", value: rhr.today.replace(" bpm", ""), note: rhr.tone === "up" ? "above usual" : "in range", alert: rhr.tone === "up" },
    { label: "Heat", value: heat.today, note: heat.delta === "Changed" ? "changed" : "same", alert: heat.delta === "Changed" },
  ];
}

export type PatternTag = "CHANGED WITH" | "GAP" | "FORMING" | "NO CLEAR EFFECT";

export type PatternRow = {
  id: string;
  name: string;
  tag: PatternTag;
  tagColor: string;
  est: number;
  lo: number;
  hi: number;
  note: string;
};

export type ScatterPoint = { x: number; y: number; changed: boolean; id: string };

function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function sessionLean(s: DemoSession): number {
  const vals = s.deliveries.map((d) => d.values.trunk_lateral_angle_at_foot_contact_deg).filter((v): v is number => v != null);
  return vals.length ? mean(vals) : 0;
}

function assoc(on: number[], off: number[]): { est: number; lo: number; hi: number } {
  if (!on.length || !off.length) return { est: 0, lo: -6, hi: 6 };
  const est = Math.round((mean(on) - mean(off)) * 10) / 10;
  const pad = Math.round((6 / Math.sqrt(Math.min(on.length, off.length))) * 10) / 10 + 3;
  return { est, lo: Math.round((est - pad) * 10) / 10, hi: Math.round((est + pad) * 10) / 10 };
}

function tagFor(est: number, lo: number, hi: number, forced?: PatternTag): { tag: PatternTag; color: string } {
  if (forced) return { tag: forced, color: "#9A978E" };
  const confirmed = lo > 0 || hi < 0;
  if (confirmed) return { tag: est > 0 ? "CHANGED WITH" : "GAP", color: "#A63A2E" };
  if (Math.abs(est) >= 3) return { tag: "FORMING", color: "#1A1A1A" };
  return { tag: "NO CLEAR EFFECT", color: "#9A978E" };
}

/** Association of context flags with trunk lean — never a cause or diagnosis. */
export function contextPatterns(session: DemoSession, sessions: DemoSession[]): PatternRow[] {
  const matched = sessions.filter(
    (s) =>
      s.bowlingArm === session.bowlingArm &&
      s.view === session.view &&
      s.drill === session.drill &&
      Date.parse(s.startedAtUtc) <= Date.parse(session.startedAtUtc),
  );
  const sleepOn = matched.filter((s) => (s.watchDay.sleep_duration_min ?? 999) < 420).map(sessionLean);
  const sleepOff = matched.filter((s) => (s.watchDay.sleep_duration_min ?? 0) >= 420).map(sessionLean);
  const heatOn = matched.filter((s) => s.environment.perceivedHeat === "hot").map(sessionLean);
  const heatOff = matched.filter((s) => s.environment.perceivedHeat !== "hot").map(sessionLean);
  const hrvOn = matched.filter((s) => (s.watchDay.hrv_rmssd_ms ?? 99) < 40).map(sessionLean);
  const hrvOff = matched.filter((s) => (s.watchDay.hrv_rmssd_ms ?? 0) >= 40).map(sessionLean);
  const cycleOn = matched.filter((s) => s.checkIn.sensitive?.menstrualNotes).map(sessionLean);
  const cycleOff = matched.filter((s) => !s.checkIn.sensitive?.menstrualNotes).map(sessionLean);

  const rows: Array<{ id: string; name: string; on: number[]; off: number[]; forced?: PatternTag; noteOn: string; noteForm: string }> = [
    {
      id: "sleep",
      name: "Sleep under 7 h",
      on: sleepOn,
      off: sleepOff,
      noteOn: "Days under 7 h sat with a higher trunk lean. Association only — not a cause.",
      noteForm: "Sleep under 7 h showed a higher lean on this set, but the interval still includes no change. More days will settle it.",
    },
    {
      id: "heat",
      name: "Hot session",
      on: heatOn,
      off: heatOff,
      noteOn: "Hot days sat with a higher lean than mild ones. Same surface and setting.",
      noteForm: "Heat looks different today, but one hot day is not enough to treat it as a driver.",
    },
    {
      id: "hrv",
      name: "HRV below your usual",
      on: hrvOn,
      off: hrvOff,
      noteOn: "Lower HRV mornings sat with a higher lean. Daily watch context, not bowling motion.",
      noteForm: "HRV is below your usual this morning. Link to lean is still forming.",
    },
    {
      id: "cycle",
      name: "Cycle note logged",
      on: cycleOn,
      off: cycleOff,
      forced: "NO CLEAR EFFECT",
      noteOn: "Private. Not used as a performance or injury verdict.",
      noteForm: "Private. Not used as a performance or injury verdict.",
    },
  ];

  return rows.map((r) => {
    const { est, lo, hi } = assoc(r.on, r.off);
    const { tag, color } = tagFor(est, lo, hi, r.forced);
    const signed = `${est > 0 ? "+" : ""}${est}°`;
    const note =
      r.forced === "NO CLEAR EFFECT"
        ? r.noteForm
        : tag === "FORMING" || tag === "NO CLEAR EFFECT"
          ? r.noteForm
          : `${signed} lean when this was true (${lo > 0 ? "+" : ""}${lo}° to ${hi > 0 ? "+" : ""}${hi}°). ${r.noteOn}`;
    return { id: r.id, name: r.name, tag, tagColor: color, est, lo, hi, note };
  });
}

export function sleepLeanScatter(session: DemoSession, sessions: DemoSession[]): ScatterPoint[] {
  return sessions
    .filter(
      (s) =>
        s.bowlingArm === session.bowlingArm &&
        s.view === session.view &&
        s.drill === session.drill &&
        Date.parse(s.startedAtUtc) <= Date.parse(session.startedAtUtc) &&
        s.watchDay.sleep_duration_min != null,
    )
    .map((s) => ({
      id: s.id,
      x: (s.watchDay.sleep_duration_min as number) / 60,
      y: sessionLean(s),
      changed: s.id === session.id,
    }));
}
