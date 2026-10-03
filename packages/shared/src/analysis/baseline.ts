import { BASELINE_MIN_DELIVERIES, BASELINE_MIN_SESSIONS, MAX_FINDINGS } from "../constants.js";
import type { ReviewFinding } from "../schemas/index.js";
import { featureCopy } from "../copy.js";
import { empiricalInterval, median, percentileRank } from "./stats.js";

export type FeatureVector = {
  deliveryId: string;
  sessionId: string;
  startedAtUtc: string;
  view: "side" | "front";
  drill: "nets" | "match" | "controlled";
  effort: "easy" | "normal" | "high";
  bowlingArm: "left" | "right";
  quality: "adequate" | "low" | "inadequate";
  excluded: boolean;
  videoDeleted: boolean;
  values: Record<string, number>;
  reliability: Record<string, boolean>;
};

export type ComparatorKey = {
  bowlingArm: "left" | "right";
  view: "side" | "front";
  drill: "nets" | "match" | "controlled";
};

export function comparatorKey(k: ComparatorKey): string {
  return `${k.bowlingArm}-arm / ${k.view} view / ${k.drill}`;
}

export function matchPrior(current: FeatureVector, all: FeatureVector[]): FeatureVector[] {
  const t = Date.parse(current.startedAtUtc);
  return all.filter((d) => {
    if (d.deliveryId === current.deliveryId) return false;
    if (d.sessionId === current.sessionId) return false;
    if (d.excluded || d.quality !== "adequate") return false;
    if (d.bowlingArm !== current.bowlingArm) return false;
    if (d.view !== current.view) return false;
    if (d.drill !== current.drill) return false;
    if (d.effort !== current.effort) return false;
    return Date.parse(d.startedAtUtc) < t;
  });
}

export function baselineStatus(priors: FeatureVector[]): {
  status: "building" | "ready" | "preliminary";
  priorSessions: number;
  priorDeliveries: number;
} {
  const sessions = new Set(priors.map((p) => p.sessionId));
  const priorSessions = sessions.size;
  const priorDeliveries = priors.length;
  if (priorSessions < BASELINE_MIN_SESSIONS || priorDeliveries < BASELINE_MIN_DELIVERIES) {
    return { status: "building", priorSessions, priorDeliveries };
  }
  return { status: "ready", priorSessions, priorDeliveries };
}

export function chooseUsual(priors: FeatureVector[], features: string[]): FeatureVector | null {
  if (!priors.length) return null;
  const medians: Record<string, number> = {};
  for (const f of features) {
    const m = median(priors.map((p) => p.values[f]).filter((v): v is number => typeof v === "number"));
    if (m !== null) medians[f] = m;
  }
  let best = priors[0]!;
  let bestDist = Infinity;
  for (const p of priors) {
    let d = 0;
    let n = 0;
    for (const f of features) {
      if (medians[f] === undefined || p.values[f] === undefined) continue;
      const scale = Math.abs(medians[f]) || 1;
      d += Math.abs(p.values[f]! - medians[f]!) / scale;
      n += 1;
    }
    const dist = n ? d / n : Infinity;
    if (dist < bestDist) {
      best = p;
      bestDist = dist;
    }
  }
  return best;
}

export function scoreFindings(
  current: FeatureVector,
  priors: FeatureVector[],
  usual: FeatureVector | null,
  source: "synthetic-demo" | "athlete",
): ReviewFinding[] {
  const status = baselineStatus(priors);
  if (status.status === "building" || !usual) return [];

  const features = Object.keys(current.values).filter((f) => current.reliability[f] !== false);
  const scored: ReviewFinding[] = [];

  for (const feature of features) {
    const series = priors
      .filter((p) => p.reliability[feature] !== false)
      .map((p) => p.values[feature])
      .filter((v): v is number => typeof v === "number");
    const cur = current.values[feature];
    if (cur === undefined || series.length < 8) continue;
    const med = median(series);
    const interval = empiricalInterval(series);
    const pct = percentileRank(series, cur);
    if (med === null || interval === null || pct === null) continue;
    const extreme = pct >= 0.9 || pct <= 0.1;
    if (!extreme) continue;

    const meta = featureCopy[feature];
    const direction = cur > med ? "higher" : "lower";
    const pctShown = Math.round((cur > med ? pct : 1 - pct) * 100);
    scored.push({
      deliveryId: current.deliveryId,
      modality: "pose",
      feature,
      current: round1(cur),
      personalMedian: round1(med),
      personalInterval: [round1(interval[0]), round1(interval[1])],
      scorePercentile: round3(pct),
      quality: current.quality,
      usualDeliveryId: usual.deliveryId,
      text: `${meta?.label ?? feature} was ${direction} than on ${pctShown}% of your comparable past deliveries.`,
      evidenceId: `pose:${feature}:${current.deliveryId}`,
      sampleCount: series.length,
      source,
    });
  }

  return scored
    .sort((a, b) => Math.abs(b.scorePercentile - 0.5) - Math.abs(a.scorePercentile - 0.5))
    .slice(0, MAX_FINDINGS);
}

export function watchContextDeltas(
  today: Record<string, number | null>,
  recent: Record<string, number[]>,
  source: string,
): {
  metric: string;
  today: number | null;
  personalMedian: number | null;
  source: string;
  quality: "available" | "missing";
  note?: string;
}[] {
  return Object.keys({ ...today, ...recent }).map((metric) => {
    const value = today[metric] ?? null;
    const series = recent[metric] ?? [];
    if (value === null) {
      return {
        metric,
        today: null,
        personalMedian: median(series),
        source,
        quality: "missing" as const,
        note: "Missing — not shown as zero.",
      };
    }
    return {
      metric,
      today: value,
      personalMedian: median(series),
      source,
      quality: "available" as const,
    };
  });
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}
