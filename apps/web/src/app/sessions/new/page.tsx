"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Eyebrow, Rule } from "@/components/Sensei";
import { api } from "@/lib/api";

const CHIPS = ["Heavy legs", "Soreness", "Poor sleep", "Hot", "On my period"] as const;

export default function NewSessionPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [rpe, setRpe] = useState(8);
  const [chips, setChips] = useState<Record<string, boolean>>({ "Poor sleep": true, Hot: true });
  const [saved, setSaved] = useState(false);
  const now = useMemo(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  }, []);

  const rpeNote =
    rpe <= 6 ? "Easier than planned." : rpe <= 8 ? "About as hard as a high-effort nets day." : "Harder than usual. Log it — don’t treat it as a diagnosis.";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const extra = Object.keys(chips)
      .filter((k) => chips[k])
      .join(", ");
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
            perceivedHeat: chips.Hot ? "hot" : fd.get("heat"),
            surface: fd.get("surface"),
            indoorOutdoor: fd.get("indoorOutdoor"),
          },
          checkIn: {
            sleepFeeling: chips["Poor sleep"] ? "poor" : fd.get("sleepFeeling"),
            fatigue: Number(fd.get("fatigue")),
            soreness: chips.Soreness ? 6 : Number(fd.get("soreness")),
            rpe,
            notes: [fd.get("notes"), extra].filter(Boolean).join(" · ") || undefined,
            sensitive: chips["On my period"] ? { menstrualNotes: "logged" } : undefined,
          },
          saveDraft: false,
        }),
      });
      setSaved(true);
      router.push(`/sessions/${session.id}/processing`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <p className="text-[12px] uppercase tracking-[0.08em] text-muted">Side-on nets · after the spell</p>
      <h1 className="font-display text-[34px] font-semibold leading-none">Session log</h1>
      <div className="mt-3">
        <Rule />
      </div>

      <form onSubmit={onSubmit} className="mt-5 space-y-5">
        <section>
          <Eyebrow>Already in</Eyebrow>
          <div className="mt-2 grid grid-cols-3 border-y border-line">
            <label className="py-2.5 text-[12px] text-muted">
              View
              <select name="view" defaultValue="side" className="mt-0.5 block w-full bg-transparent text-[15px] font-medium text-ink">
                <option value="side">side</option>
                <option value="front">front</option>
              </select>
            </label>
            <label className="border-l border-line py-2.5 pl-2.5 text-[12px] text-muted">
              Drill
              <select name="drill" defaultValue="nets" className="mt-0.5 block w-full bg-transparent text-[15px] font-medium text-ink">
                <option value="nets">nets</option>
                <option value="match">match</option>
                <option value="controlled">controlled</option>
              </select>
            </label>
            <label className="border-l border-line py-2.5 pl-2.5 text-[12px] text-muted">
              Effort
              <select name="effort" defaultValue="high" className="mt-0.5 block w-full bg-transparent text-[15px] font-medium text-ink">
                <option value="easy">easy</option>
                <option value="normal">normal</option>
                <option value="high">high</option>
              </select>
            </label>
          </div>
        </section>

        <section>
          <div className="flex items-baseline justify-between">
            <Eyebrow>How hard did it feel?</Eyebrow>
            <span className="text-[12px] text-muted">RPE 1–10</span>
          </div>
          <div className="mt-2 grid grid-cols-5 gap-1.5">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={rpe === n}
                aria-label={`RPE ${n}`}
                onClick={() => setRpe(n)}
                className={`h-11 text-[15px] ${rpe === n ? "border border-brick bg-brick font-semibold text-white" : "border border-line bg-white text-ink"}`}
              >
                {n}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[13px] leading-snug text-[#4A4A4A]">{rpeNote}</p>
        </section>

        <section>
          <Eyebrow>Anything else?</Eyebrow>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {CHIPS.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={!!chips[c]}
                onClick={() => setChips((prev) => ({ ...prev, [c]: !prev[c] }))}
                className={`min-h-tap px-3.5 text-[14px] ${chips[c] ? "border border-ink bg-ink text-white" : "border border-line bg-white"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </section>

        <details>
          <summary className="min-h-tap cursor-pointer text-[14px] font-medium text-brick">Session details</summary>
          <div className="mt-3 grid gap-3">
            <label className="text-[13px]">
              Date and time
              <input required name="startedAtLocal" type="datetime-local" defaultValue={now} className="mt-1 min-h-tap w-full border border-line px-3" />
            </label>
            <input type="hidden" name="timezone" value="Australia/Melbourne" />
            <input type="hidden" name="bowlingArm" value="right" />
            <input type="hidden" name="heat" value="mild" />
            <input type="hidden" name="surface" value="turf" />
            <input type="hidden" name="indoorOutdoor" value="outdoor" />
            <input type="hidden" name="sleepFeeling" value="ok" />
            <input type="hidden" name="fatigue" value="4" />
            <input type="hidden" name="soreness" value="2" />
            <label className="text-[13px]">
              Approximate deliveries
              <input name="approximateDeliveries" type="number" min={1} max={80} defaultValue={6} className="mt-1 min-h-tap w-full border border-line px-3" />
            </label>
            <label className="text-[13px]">
              Notes
              <textarea name="notes" className="mt-1 w-full border border-line p-3" rows={2} />
            </label>
            <label className="text-[13px]">
              Video
              <input type="file" accept="video/mp4,video/quicktime,video/*;capture=camera" className="mt-2 block w-full" />
            </label>
          </div>
        </details>

        {error && <p className="text-sm text-red-800">{error}</p>}
        <button disabled={busy} className="sticky bottom-20 z-20 min-h-12 w-full bg-ink text-[15px] font-semibold text-white md:static md:bottom-auto" type="submit">
          {busy ? "Saving…" : saved ? "Saved" : "Create session"}
        </button>
      </form>
    </AppShell>
  );
}
