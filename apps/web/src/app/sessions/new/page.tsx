"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { api } from "@/lib/api";

export default function NewSessionPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      const session = await api<{ id: string }>("/api/sessions", {
        method: "POST",
        body: JSON.stringify({
          startedAtLocal: fd.get("startedAtLocal"),
          timezone: fd.get("timezone"),
          bowlingArm: fd.get("bowlingArm"),
          view: fd.get("view"),
          drill: fd.get("drill"),
          effort: fd.get("effort"),
          approximateDeliveries: Number(fd.get("approximateDeliveries")),
          environment: {
            perceivedHeat: fd.get("heat"),
            surface: fd.get("surface"),
            indoorOutdoor: fd.get("indoorOutdoor"),
          },
          checkIn: {
            sleepFeeling: fd.get("sleepFeeling"),
            fatigue: Number(fd.get("fatigue")),
            soreness: Number(fd.get("soreness")),
            rpe: Number(fd.get("rpe")),
            notes: fd.get("notes") || undefined,
          },
          saveDraft: fd.get("draft") === "on",
        }),
      });
      router.push(`/sessions/${session.id}/processing`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <h1 className="font-display text-3xl">New session</h1>
      <form onSubmit={onSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="text-sm">
          Date and time
          <input required name="startedAtLocal" type="datetime-local" className="mt-1 min-h-tap w-full rounded-xl border border-line bg-paper px-3" />
        </label>
        <label className="text-sm">
          Timezone
          <input required name="timezone" defaultValue="Australia/Melbourne" className="mt-1 min-h-tap w-full rounded-xl border border-line bg-paper px-3" />
        </label>
        <Field name="bowlingArm" label="Bowling arm" options={["right", "left"]} />
        <Field name="view" label="Camera view" options={["side", "front"]} />
        <Field name="drill" label="Drill" options={["nets", "match", "controlled"]} />
        <Field name="effort" label="Effort" options={["easy", "normal", "high"]} />
        <label className="text-sm">
          Approximate deliveries
          <input name="approximateDeliveries" type="number" min={1} max={80} defaultValue={6} className="mt-1 min-h-tap w-full rounded-xl border border-line bg-paper px-3" />
        </label>
        <Field name="heat" label="Perceived heat" options={["cool", "mild", "hot"]} />
        <Field name="surface" label="Surface" options={["turf", "concrete", "indoor_mat", "grass", "unknown"]} />
        <Field name="indoorOutdoor" label="Setting" options={["outdoor", "indoor"]} />
        <Field name="sleepFeeling" label="Sleep feeling" options={["rested", "ok", "poor"]} />
        <Num name="fatigue" label="Fatigue (1–10)" />
        <Num name="soreness" label="Soreness (0–10)" />
        <Num name="rpe" label="RPE (1–10)" />
        <label className="text-sm md:col-span-2">
          Notes (optional; private by default)
          <textarea name="notes" className="mt-1 w-full rounded-xl border border-line bg-paper p-3" rows={3} />
        </label>
        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input type="checkbox" name="draft" /> Save draft
        </label>
        <div className="md:col-span-2">
          <label className="block text-sm">
            Video (MP4/MOV, prototype cap 500 MB / 10 min)
            <input type="file" accept="video/mp4,video/quicktime,video/*;capture=camera" className="mt-2 block w-full" />
          </label>
          <p className="mt-2 text-xs text-muted">Camera framing: full body, stable side-on or front-on. Watch CSV is optional on the next screen.</p>
        </div>
        {error && <p className="text-sm text-red-800 md:col-span-2">{error}</p>}
        <button disabled={busy} className="min-h-tap rounded-full bg-teal font-semibold text-white md:col-span-2" type="submit">
          {busy ? "Saving…" : "Create session"}
        </button>
      </form>
    </AppShell>
  );
}

function Field({ name, label, options }: { name: string; label: string; options: string[] }) {
  return (
    <label className="text-sm">
      {label}
      <select name={name} className="mt-1 min-h-tap w-full rounded-xl border border-line bg-paper px-3">
        {options.map((o) => (
          <option key={o} value={o}>
            {o.replace("_", " ")}
          </option>
        ))}
      </select>
    </label>
  );
}

function Num({ name, label }: { name: string; label: string }) {
  return (
    <label className="text-sm">
      {label}
      <input name={name} type="number" min={0} max={10} defaultValue={4} className="mt-1 min-h-tap w-full rounded-xl border border-line bg-paper px-3" />
    </label>
  );
}
