import { featureCopy } from "../copy";
import type { DemoSession } from "../demo/seed";
import type { ReviewFinding } from "../schemas/index";

export type DeltaRow = {
  id: string;
  group: "movement" | "recovery" | "cycle" | "environment";
  label: string;
  today: string;
  usual: string;
  delta: string;
  tone: "up" | "down" | "same" | "missing" | "note";
};

function fmt(n: number, digits = 1): string {
  return (Math.round(n * 10 ** digits) / 10 ** digits).toString();
}

function signed(n: number, unit: string, digits = 1): string {
  const v = Math.round(n * 10 ** digits) / 10 ** digits;
  if (v === 0) return `0${unit}`;
  return `${v > 0 ? "+" : ""}${v}${unit}`;
}

function median(values: number[]): number | null {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2;
}

export function movementDeltas(findings: ReviewFinding[]): DeltaRow[] {
  return findings.map((f) => {
    const meta = featureCopy[f.feature];
    const unit = meta?.unit ?? "";
    const d = f.current - f.personalMedian;
    return {
      id: f.evidenceId,
      group: "movement",
      label: meta?.label ?? f.feature,
      today: `${fmt(f.current)}${unit}`,
      usual: `${fmt(f.personalMedian)}${unit}`,
      delta: signed(d, unit),
      tone: d > 0 ? "up" : d < 0 ? "down" : "same",
    };
  });
}

export function recoveryDeltas(session: DemoSession, priors: DemoSession[]): DeltaRow[] {
  const priorDays = priors.filter((s) => Date.parse(s.startedAtUtc) < Date.parse(session.startedAtUtc));
  const rows: DeltaRow[] = [];

  const sleepToday = session.watchDay.sleep_duration_min;
  const sleepUsual = median(priorDays.map((s) => s.watchDay.sleep_duration_min).filter((v): v is number => v != null));
  if (sleepToday == null) {
    rows.push({
      id: "sleep",
      group: "recovery",
      label: "Sleep",
      today: "Missing",
      usual: sleepUsual == null ? "—" : `${fmt(sleepUsual / 60, 1)}h`,
      delta: "—",
      tone: "missing",
    });
  } else {
    const d = sleepUsual == null ? 0 : sleepToday - sleepUsual;
    rows.push({
      id: "sleep",
      group: "recovery",
      label: "Sleep",
      today: `${fmt(sleepToday / 60, 1)}h`,
      usual: sleepUsual == null ? "—" : `${fmt(sleepUsual / 60, 1)}h`,
      delta: sleepUsual == null ? "—" : signed(d, " min", 0),
      tone: sleepUsual == null ? "same" : d < 0 ? "down" : d > 0 ? "up" : "same",
    });
  }

  const rhrToday = session.watchDay.resting_hr_bpm;
  const rhrUsual = median(priorDays.map((s) => s.watchDay.resting_hr_bpm).filter((v): v is number => v != null));
  rows.push(metricRow("rhr", "Resting HR", rhrToday, rhrUsual, " bpm", 0));

  const hrvToday = session.watchDay.hrv_rmssd_ms;
  const hrvUsual = median(priorDays.map((s) => s.watchDay.hrv_rmssd_ms).filter((v): v is number => v != null));
  rows.push(metricRow("hrv", "HRV", hrvToday, hrvUsual, " ms", 0));

  const fatUsual = median(priorDays.map((s) => s.checkIn.fatigue));
  rows.push({
    id: "fatigue",
    group: "recovery",
    label: "Fatigue",
    today: String(session.checkIn.fatigue),
    usual: fatUsual == null ? "—" : fmt(fatUsual, 0),
    delta: fatUsual == null ? "—" : signed(session.checkIn.fatigue - fatUsual, "", 0),
    tone: fatUsual != null && session.checkIn.fatigue > fatUsual ? "up" : "same",
  });

  return rows;
}

export function cycleDelta(session: DemoSession, priors: DemoSession[]): DeltaRow {
  const todayLogged = Boolean(session.checkIn.sensitive?.menstrualNotes);
  const usualRate =
    priors.filter((s) => Date.parse(s.startedAtUtc) < Date.parse(session.startedAtUtc) && s.checkIn.sensitive?.menstrualNotes)
      .length;
  return {
    id: "cycle",
    group: "cycle",
    label: "Cycle note",
    today: todayLogged ? "Logged" : "None",
    usual: usualRate > 0 ? "Sometimes logged" : "Usually none",
    delta: todayLogged ? "Private" : "—",
    tone: "note",
  };
}

export function environmentDeltas(session: DemoSession, priors: DemoSession[]): DeltaRow[] {
  const earlier = priors.filter((s) => Date.parse(s.startedAtUtc) < Date.parse(session.startedAtUtc));
  const heatUsual = mode(earlier.map((s) => s.environment.perceivedHeat));
  const surfaceUsual = mode(earlier.map((s) => s.environment.surface));
  const settingUsual = mode(earlier.map((s) => s.environment.indoorOutdoor));
  return [
    {
      id: "heat",
      group: "environment",
      label: "Heat",
      today: session.environment.perceivedHeat,
      usual: heatUsual ?? "—",
      delta: heatUsual && heatUsual !== session.environment.perceivedHeat ? "Changed" : "Same",
      tone: heatUsual && heatUsual !== session.environment.perceivedHeat ? "up" : "same",
    },
    {
      id: "surface",
      group: "environment",
      label: "Surface",
      today: session.environment.surface.replace("_", " "),
      usual: (surfaceUsual ?? "—").replace("_", " "),
      delta: surfaceUsual && surfaceUsual !== session.environment.surface ? "Changed" : "Same",
      tone: "same",
    },
    {
      id: "setting",
      group: "environment",
      label: "Setting",
      today: session.environment.indoorOutdoor,
      usual: settingUsual ?? "—",
      delta: settingUsual && settingUsual !== session.environment.indoorOutdoor ? "Changed" : "Same",
      tone: "same",
    },
  ];
}

function metricRow(
  id: string,
  label: string,
  today: number | null | undefined,
  usual: number | null,
  unit: string,
  digits: number,
): DeltaRow {
  if (today == null) {
    return {
      id,
      group: "recovery",
      label,
      today: "Missing",
      usual: usual == null ? "—" : `${fmt(usual, digits)}${unit}`,
      delta: "—",
      tone: "missing",
    };
  }
  const d = usual == null ? 0 : today - usual;
  return {
    id,
    group: "recovery",
    label,
    today: `${fmt(today, digits)}${unit}`,
    usual: usual == null ? "—" : `${fmt(usual, digits)}${unit}`,
    delta: usual == null ? "—" : signed(d, unit, digits),
    tone: usual == null ? "same" : d > 0 ? "up" : d < 0 ? "down" : "same",
  };
}

function mode(values: string[]): string | null {
  if (!values.length) return null;
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}
