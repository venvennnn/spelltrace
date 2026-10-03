import Link from "next/link";
import { emptyStates, limits, watchLabels } from "@spelltrace/shared";
import { DEMO_CHANGED_SESSION_ID, demoTimeline, reviewForSession } from "@spelltrace/shared";
import { AppShell } from "@/components/AppShell";
import { FindingCard } from "@/components/FindingCard";
import { getStore } from "@/lib/store";

export default function TodayPage() {
  const store = getStore();
  const review = reviewForSession(DEMO_CHANGED_SESSION_ID, store.listSessions());
  const session = store.getSession(DEMO_CHANGED_SESSION_ID);

  return (
    <AppShell>
      <p className="text-sm text-muted">Friday 2 October 2026 · Melbourne</p>
      <h1 className="mt-1 font-display text-4xl">Today</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">{limits.noDiagnosis}</p>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="space-y-3">
          <h2 className="font-display text-2xl">My day</h2>
          <ol className="space-y-2">
            {demoTimeline.blocks.map((b) => (
              <li key={b.id} className="rounded-2xl border border-line bg-paper px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-faint">
                  {b.label} · {b.time} · {b.source}
                </p>
                <p className="text-ink">{b.missing ? "Missing — not shown as zero" : b.value}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl">My bowling</h2>
          <div className="rounded-2xl border border-line bg-paper p-4">
            <p className="text-sm text-muted">
              {session?.view} · {session?.drill} · {session?.effort} · {session?.deliveries.length} marked deliveries
            </p>
            <p className="mt-2 text-sm">
              Motion: <strong>{watchLabels.notRecorded}</strong>
            </p>
            <Link href={`/sessions/${DEMO_CHANGED_SESSION_ID}`} className="mt-3 inline-flex min-h-tap text-sm font-semibold text-teal">
              Open session
            </Link>
          </div>
        </section>
      </div>

      <section className="mt-8 space-y-3">
        <h2 className="font-display text-2xl">What changed</h2>
        {review.baseline.status === "building" ? (
          <p className="rounded-2xl bg-clay-soft p-4 text-sm">{emptyStates.baselineBuilding}</p>
        ) : (
          <p className="text-muted">
            {review.findings.length} deliveries changed relative to your usual {review.baseline.match}. Prior sessions:{" "}
            {review.baseline.priorSessions} · deliveries: {review.baseline.priorDeliveries}. Source: demonstration data.
          </p>
        )}
        <div className="grid gap-3 md:grid-cols-2">
          {review.findings.map((f) => (
            <FindingCard key={f.evidenceId} finding={f} href={`/sessions/${DEMO_CHANGED_SESSION_ID}/review?feature=${f.feature}`} />
          ))}
        </div>
      </section>
    </AppShell>
  );
}
