"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { api } from "@/lib/api";

type Session = {
  id: string;
  startedAtUtc: string;
  view: string;
  drill: string;
  video: { id: string; deleted: boolean } | null;
  deliveries: { id: string }[];
};

export default function NewSharePage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [fields, setFields] = useState<string[]>(["metrics"]);
  const [link, setLink] = useState<string | null>(null);
  const [shareId, setShareId] = useState<string | null>(null);

  useEffect(() => {
    api<{ sessions: Session[] }>("/api/sessions").then((d) => setSessions(d.sessions));
  }, []);

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const toggleField = (f: string) => setFields((s) => (s.includes(f) ? s.filter((x) => x !== f) : [...s, f]));

  return (
    <AppShell>
      <h1 className="font-display text-3xl">Share</h1>
      <ul className="mt-4 space-y-2">
        {sessions
          .filter((s) => s.deliveries.length > 0)
          .map((s) => (
          <li key={s.id}>
            <label className="flex min-h-tap items-center gap-2 rounded-xl border border-line bg-paper px-3">
              <input type="checkbox" checked={selected.includes(s.id)} onChange={() => toggle(s.id)} />
              <span>
                {new Date(s.startedAtUtc).toLocaleDateString("en-AU")} · {s.view} {s.drill}
                {s.video?.deleted ? " · movement only" : ""}
              </span>
            </label>
          </li>
        ))}
      </ul>
      <fieldset className="mt-4">
        <legend className="text-sm font-semibold">Fields to expose</legend>
        {["metrics", "check_in_details", "cycle_symptom_notes", "daily_health_metrics", "full_raw_video"].map((f) => (
          <label key={f} className="mt-1 flex min-h-tap items-center gap-2 text-sm">
            <input type="checkbox" checked={fields.includes(f)} onChange={() => toggleField(f)} />
            {f.replaceAll("_", " ")}
          </label>
        ))}
      </fieldset>
      <button
        type="button"
        className="mt-4 min-h-tap rounded-full bg-teal px-5 text-white"
        onClick={async () => {
          const items = selected.map((id) => {
            const s = sessions.find((x) => x.id === id)!;
            return { videoId: s.video?.id, deliveryId: s.deliveries[0]?.id, allowedFields: fields };
          });
          const res = await api<{ id: string; token: string }>("/api/shares", {
            method: "POST",
            body: JSON.stringify({
              title: `Share ${selected.length} ${selected.length === 1 ? "item" : "items"}`,
              expiresInHours: 48,
              items,
            }),
          });
          setShareId(res.id);
          setLink(`${window.location.origin}/s/${res.token}`);
        }}
      >
        Create expiring link
      </button>
      {link && (
        <div className="mt-4 rounded-2xl bg-teal-soft p-4 text-sm">
          <p className="break-all">{link}</p>
          <button
            type="button"
            className="mt-2 underline"
            onClick={async () => {
              if (shareId) await api(`/api/shares/${shareId}`, { method: "DELETE" });
              setLink("Revoked.");
            }}
          >
            Revoke
          </button>
        </div>
      )}
    </AppShell>
  );
}
