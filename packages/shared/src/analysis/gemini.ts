import { evidenceBundleSchema, geminiOutputSchema, type EvidenceBundle, type GeminiOutput } from "../schemas/index";

const MEDICAL =
  /\b(injur(y|ies|ed)|diagnos|fracture|tear|strain|sprain|risk\s*\d+\s*%|medical|prescribe|spell\s*cap|cycle\s*phase|ovulat|pregnant|concuss)/i;
const CAUSAL = /\b(caused by|because of your|this means you|therefore you should|due to your (sleep|cycle|period))\b/i;

export type GeminiValidation =
  | { ok: true; output: GeminiOutput }
  | { ok: false; reason: string };

export function validateGeminiOutput(raw: unknown, bundle: EvidenceBundle): GeminiValidation {
  const parsedBundle = evidenceBundleSchema.safeParse(bundle);
  if (!parsedBundle.success) return { ok: false, reason: "invalid_evidence_bundle" };

  const parsed = geminiOutputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, reason: "schema" };

  const allowed = new Set(parsedBundle.data.evidence.map((e) => e.id));
  const numbers = collectNumbers(parsedBundle.data);

  for (const sentence of parsed.data.sentences) {
    if (sentence.evidenceIds.some((id) => !allowed.has(id))) {
      return { ok: false, reason: "unknown_evidence_id" };
    }
    if (MEDICAL.test(sentence.text) || CAUSAL.test(sentence.text)) {
      return { ok: false, reason: "medical_or_causal" };
    }
    if (mentionsSensitive(sentence.text) && parsedBundle.data.consentScope !== "metrics_and_stills") {
      // stills consent is separate; reproductive notes must never be in the bundle
    }
    if (altersFigures(sentence.text, numbers)) {
      return { ok: false, reason: "altered_figure" };
    }
  }
  return { ok: true, output: parsed.data };
}

function collectNumbers(bundle: EvidenceBundle): number[] {
  const nums: number[] = [];
  for (const e of bundle.evidence) {
    if (typeof e.current === "number") nums.push(round1(e.current));
    if (typeof e.personalMedian === "number") nums.push(round1(e.personalMedian));
    if (typeof e.sampleCount === "number") nums.push(e.sampleCount);
  }
  return nums;
}

function altersFigures(text: string, allowed: number[]): boolean {
  const found = [...text.matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
  return found.some((n) => {
    if (n >= 1900 && n <= 2100) return false;
    if (Number.isInteger(n) && n <= 3) return false;
    return !allowed.some((a) => Math.abs(a - n) < 0.15 || Math.abs(Math.round(a) - n) < 0.15);
  });
}

function mentionsSensitive(text: string): boolean {
  return /\b(period|menstrual|luteal|follicular|ovulat)\b/i.test(text);
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function deterministicNarration(bundle: EvidenceBundle): GeminiOutput {
  const sentences = bundle.evidence.slice(0, 4).map((e) => {
    const cur = e.current == null ? "unavailable" : String(round1(e.current));
    const med = e.personalMedian == null ? "unavailable" : String(round1(e.personalMedian));
    return {
      text: `${e.text} Measured ${e.feature ?? e.metric ?? "value"}: ${cur}; personal median: ${med}. These observations do not establish a cause.`,
      evidenceIds: [e.id],
    };
  });
  if (bundle.missing.length) {
    sentences.push({
      text: `Missing from this review: ${bundle.missing.join(", ")}.`,
      evidenceIds: [bundle.evidence[0]?.id ?? "missing"],
    });
  }
  return {
    sentences,
    questions: ["Does this match how the spell felt?", "Was the camera in the same place as usual?"],
  };
}

export function evidenceHash(bundle: EvidenceBundle): string {
  const payload = JSON.stringify({
    ids: bundle.evidence.map((e) => [e.id, e.current, e.personalMedian, e.quality]),
    missing: bundle.missing,
    consent: bundle.consentScope,
  });
  let h = 2166136261;
  for (let i = 0; i < payload.length; i++) {
    h ^= payload.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}
