"use client";

import { useEffect, useState } from "react";
import { limits } from "@spelltrace/shared";
import { api } from "@/lib/api";

type Narration = {
  source: string;
  status: string;
  reason?: string;
  narration: { sentences: { text: string; evidenceIds: string[] }[]; questions: string[] };
};

export function ExplainPanel({ sessionId }: { sessionId: string }) {
  const [data, setData] = useState<Narration | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api<Narration>(`/api/sessions/${sessionId}/explain`, { method: "POST", body: "{}" })
      .then(setData)
      .catch((e) => setErr(e.message));
  }, [sessionId]);

  return (
    <section className="mt-8 rounded-2xl border border-line bg-paper p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-2xl">AI explanation</h2>
        <span className="text-xs text-muted">{limits.geminiRole}</span>
      </div>
      {err && <p className="mt-2 text-sm text-muted">Gemini unavailable. Showing measurements only. {err}</p>}
      {!data && !err && <p className="mt-2 text-sm text-muted">Loading explanation…</p>}
      {data && (
        <div className="mt-3 space-y-2">
          <p className="text-xs uppercase tracking-wide text-faint">
            {data.source === "gemini" ? "AI explanation" : "Show measurements"} · {data.status}
            {data.reason ? ` · rejected (${data.reason})` : ""}
          </p>
          {data.narration.sentences.map((s) => (
            <p key={s.text} className="text-sm text-ink">
              {s.text}{" "}
              <span className="text-xs text-faint">[{s.evidenceIds.join(", ")}]</span>
            </p>
          ))}
          <ul className="mt-2 list-disc pl-5 text-sm text-muted">
            {data.narration.questions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
