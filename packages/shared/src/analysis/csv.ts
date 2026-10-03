import { ALLOWED_DAILY_METRICS, MOTION_MIN_HZ } from "../constants";
import { dailyWatchRowSchema, motionSampleRowSchema } from "../schemas/index";

const ALLOWED_UNITS: Record<string, string[]> = {
  sleep_duration_min: ["min", "minutes"],
  resting_hr_bpm: ["bpm"],
  hrv_rmssd_ms: ["ms"],
  steps: ["count", "steps"],
  active_minutes: ["min", "minutes"],
  workout_duration_min: ["min", "minutes"],
  workout_hr_avg_bpm: ["bpm"],
};

export type MappingPreview = {
  kind: "daily_watch" | "motion_samples";
  headers: string[];
  rows: number;
  accepted: number;
  rejected: { row: number; reason: string }[];
  duplicates: number;
  timezoneNotes: string[];
  fields: { original: string; normalized: string; unit?: string }[];
};

export function parseCsv(text: string): string[][] {
  return text
    .trim()
    .split(/\r?\n/)
    .filter((line) => line.trim().length)
    .map((line) => splitCsvLine(line));
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      q = !q;
    } else if (c === "," && !q) {
      out.push(cur.trim());
      cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur.trim());
  return out;
}

export function previewDailyWatch(text: string): MappingPreview {
  const rows = parseCsv(text);
  const headers = rows[0] ?? [];
  const expected = [
    "start_time_iso",
    "end_time_iso",
    "timezone",
    "metric",
    "value",
    "unit",
    "device",
    "source",
  ];
  const rejected: MappingPreview["rejected"] = [];
  const seen = new Set<string>();
  let accepted = 0;
  let duplicates = 0;
  const timezoneNotes: string[] = [];

  rows.slice(1).forEach((cols, i) => {
    const rec: Record<string, string> = {};
    expected.forEach((h, idx) => {
      rec[h] = cols[idx] ?? "";
    });
    const parsed = dailyWatchRowSchema.safeParse({
      ...rec,
      value: rec.value === "" ? NaN : Number(rec.value),
    });
    if (!parsed.success) {
      rejected.push({ row: i + 2, reason: parsed.error.issues[0]?.message ?? "invalid row" });
      return;
    }
    if (!ALLOWED_DAILY_METRICS.includes(parsed.data.metric)) {
      rejected.push({ row: i + 2, reason: `Unknown metric ${parsed.data.metric}` });
      return;
    }
    const units = ALLOWED_UNITS[parsed.data.metric] ?? [];
    if (!units.includes(parsed.data.unit)) {
      rejected.push({
        row: i + 2,
        reason: `Unknown unit "${parsed.data.unit}" for ${parsed.data.metric}. Expected ${units.join(" or ")}.`,
      });
      return;
    }
    if (Number.isNaN(Date.parse(parsed.data.start_time_iso))) {
      rejected.push({ row: i + 2, reason: "Malformed timestamp. Use ISO-8601, e.g. 2026-09-28T22:10:00." });
      return;
    }
    const key = `${parsed.data.metric}|${parsed.data.start_time_iso}|${parsed.data.source ?? ""}`;
    if (seen.has(key)) {
      duplicates += 1;
      rejected.push({ row: i + 2, reason: "Duplicate record for the same metric and start time." });
      return;
    }
    seen.add(key);
    if (parsed.data.timezone && !parsed.data.start_time_iso.includes("+") && !parsed.data.start_time_iso.endsWith("Z")) {
      timezoneNotes.push(`Row ${i + 2}: naive timestamp interpreted in ${parsed.data.timezone}.`);
    }
    accepted += 1;
  });

  return {
    kind: "daily_watch",
    headers,
    rows: Math.max(0, rows.length - 1),
    accepted,
    rejected,
    duplicates,
    timezoneNotes,
    fields: expected.map((h) => ({ original: h, normalized: h })),
  };
}

export function previewMotion(text: string): MappingPreview {
  const rows = parseCsv(text);
  const headers = rows[0] ?? [];
  const rejected: MappingPreview["rejected"] = [];
  let accepted = 0;
  const times: number[] = [];
  let hz: number | null = null;

  rows.slice(1).forEach((cols, i) => {
    const rec = {
      timestamp_iso: cols[0],
      timezone: cols[1],
      ax_m_s2: Number(cols[2]),
      ay_m_s2: Number(cols[3]),
      az_m_s2: Number(cols[4]),
      gx_rad_s: cols[5] === "" || cols[5] === undefined ? undefined : Number(cols[5]),
      gy_rad_s: cols[6] === "" || cols[6] === undefined ? undefined : Number(cols[6]),
      gz_rad_s: cols[7] === "" || cols[7] === undefined ? undefined : Number(cols[7]),
      device: cols[8],
      sampling_hz: Number(cols[9]),
    };
    const parsed = motionSampleRowSchema.safeParse(rec);
    if (!parsed.success) {
      rejected.push({ row: i + 2, reason: parsed.error.issues[0]?.message ?? "invalid motion row" });
      return;
    }
    const t = Date.parse(parsed.data.timestamp_iso);
    if (Number.isNaN(t)) {
      rejected.push({ row: i + 2, reason: "Malformed timestamp." });
      return;
    }
    if (times.length && t <= times[times.length - 1]!) {
      rejected.push({ row: i + 2, reason: "Timestamps must be strictly increasing." });
      return;
    }
    times.push(t);
    hz = parsed.data.sampling_hz;
    accepted += 1;
  });

  if (hz !== null && hz < MOTION_MIN_HZ) {
    rejected.push({
      row: 0,
      reason: `Sampling ${hz} Hz is below the ${MOTION_MIN_HZ} Hz minimum for delivery alignment.`,
    });
  }

  return {
    kind: "motion_samples",
    headers,
    rows: Math.max(0, rows.length - 1),
    accepted: rejected.some((r) => r.row === 0) ? 0 : accepted,
    rejected,
    duplicates: 0,
    timezoneNotes: [],
    fields: [
      { original: "timestamp_iso", normalized: "timestamp_iso" },
      { original: "ax/ay/az_m_s2", normalized: "accel_m_s2", unit: "m/s²" },
      { original: "gx/gy/gz_rad_s", normalized: "gyro_rad_s", unit: "rad/s" },
    ],
  };
}
