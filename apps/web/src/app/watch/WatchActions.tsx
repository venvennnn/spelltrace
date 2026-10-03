"use client";

import { useState } from "react";
import type { WatchConnection } from "@spelltrace/shared";
import { api } from "@/lib/api";

export function WatchActions({ connection }: { connection: WatchConnection }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  if (!connection.live) {
    return (
      <p className="mt-2 text-xs text-muted">{connection.status === "coming_soon" ? "Coming soon · use CSV" : "Needs a native build"}</p>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="min-h-tap rounded-full bg-teal px-4 text-sm text-white"
          onClick={async () => {
            const res = await api<{ status?: string; message?: string }>(`/api/watch/${connection.provider}/authorize`, {
              method: "POST",
            });
            setMsg(res.message ?? `Status: ${res.status ?? "updated"}`);
          }}
        >
          {connection.provider === "csv" ? "Mark CSV connected" : "Connect"}
        </button>
        <button
          type="button"
          className="min-h-tap rounded-full border px-4 text-sm"
          onClick={async () => {
            await api(`/api/watch/connection/${connection.id}`, { method: "DELETE", body: JSON.stringify({ eraseImported: false }) });
            setMsg("Disconnected. Imported records kept.");
          }}
        >
          Disconnect
        </button>
      </div>
      {connection.provider === "csv" && (
        <label className="block text-sm">
          Import daily_watch.csv
          <input
            type="file"
            accept=".csv,text/csv"
            className="mt-1 block"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const text = await file.text();
              const res = await api<{ preview: { accepted: number; rejected: { reason: string }[] } }>(
                "/api/sessions/sess-changed-2026-10-02/imports",
                { method: "POST", body: JSON.stringify({ kind: "daily_watch", text }) },
              );
              setPreview(`${res.preview.accepted} accepted, ${res.preview.rejected.length} rejected`);
            }}
          />
        </label>
      )}
      {msg && <p className="text-sm text-teal">{msg}</p>}
      {preview && <p className="text-sm text-muted">{preview}</p>}
      <p className="text-xs text-muted">
        <a className="underline" href="/templates/daily_watch.csv">
          daily_watch.csv template
        </a>{" "}
        ·{" "}
        <a className="underline" href="/templates/motion_samples.csv">
          motion_samples.csv template
        </a>
      </p>
    </div>
  );
}
