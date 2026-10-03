"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Narration = {
  source: string;
  narration: { sentences: { text: string }[]; questions: string[] };
};

export function ExplainPanel({ sessionId }: { sessionId: string }) {
  const [data, setData] = useState<Narration | null>(null);

  useEffect(() => {
    api<Narration>(`/api/sessions/${sessionId}/explain`, { method: "POST", body: "{}" })
      .then(setData)
      .catch(() => setData(null));
  }, [sessionId]);

  const line = data?.narration.sentences[0]?.text;
  if (!line) return null;

  return (
    <section className="mt-5 rounded-2xl border border-line p-3">
      <h2 className="text-sm font-semibold">Note</h2>
      <p className="mt-1 text-sm text-ink">{line}</p>
    </section>
  );
}
