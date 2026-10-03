import { notFound } from "next/navigation";
import { emptyStates, featureCopy, limits, watchLabels } from "@spelltrace/shared";
import { AppShell } from "@/components/AppShell";
import { ComparisonPlayer } from "@/components/ComparisonPlayer";
import { FindingCard } from "@/components/FindingCard";
import { EditorialChart } from "@/components/EditorialChart";
import { getStore } from "@/lib/store";
import { ExplainPanel } from "./ExplainPanel";

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ feature?: string }>;
}) {
  const { id } = await params;
  const { feature } = await searchParams;
  const store = getStore();
  const session = store.getSession(id);
  if (!session) notFound();
  const review = store.review(id);
  const finding = review.findings.find((f) => f.feature === feature) ?? review.findings[0];
  const usualId = finding?.usualDeliveryId;
  const usualSession = store.listSessions().find((s) => s.deliveries.some((d) => d.id === usualId));
  const usualDelivery = usualSession?.deliveries.find((d) => d.id === usualId) ?? usualSession?.deliveries[0];
  const changed = session.deliveries[0];

  return (
    <AppShell>
      <p className="text-xs text-demo">Demonstration data — not athlete validation</p>
      <h1 className="font-display text-4xl">Review</h1>
      <p className="mt-2 text-muted">
        {review.baseline.status === "ready"
          ? `${review.findings.length} deliveries changed relative to your usual ${review.baseline.match}.`
          : emptyStates.baselineBuilding}
      </p>
      <p className="mt-1 text-sm text-muted">
        Algorithm {review.baseline.algorithmVersion} · prior sessions {review.baseline.priorSessions} · deliveries{" "}
        {review.baseline.priorDeliveries}
      </p>
      <p className="mt-2 text-sm">
        {watchLabels.notRecorded}. Daily watch context is labelled separately.
      </p>

      {changed && usualDelivery && usualSession && (
        <div className="mt-6">
          <ComparisonPlayer
            usual={{
              id: usualDelivery.id,
              title: "Usual (medoid of your matched set)",
              date: new Date(usualSession.startedAtUtc).toLocaleDateString("en-AU"),
              match: `${usualSession.view} / ${usualSession.drill} / ${usualSession.effort}`,
              videoDeleted: Boolean(usualSession.video?.deleted),
              frames: usualDelivery.trace,
              durationMs: 1800,
              phases: [],
              width: 1280,
              height: 720,
            }}
            changed={{
              id: changed.id,
              title: session.video?.deleted ? "Changed · source footage deleted" : "Changed",
              date: new Date(session.startedAtUtc).toLocaleDateString("en-AU"),
              match: `${session.view} / ${session.drill} / ${session.effort}`,
              videoDeleted: Boolean(session.video?.deleted),
              frames: changed.trace,
              durationMs: 1800,
              phases: [],
              width: 1280,
              height: 720,
            }}
            feature={finding?.feature}
            currentValue={finding?.current}
          />
        </div>
      )}

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {review.findings.map((f) => (
          <FindingCard key={f.evidenceId} finding={f} href={`/sessions/${id}/review?feature=${f.feature}`} />
        ))}
      </div>

      <section className="mt-8">
        <h2 className="font-display text-2xl">Daily context</h2>
        <ul className="mt-3 grid gap-2 md:grid-cols-3">
          {review.watchContext.map((w) => (
            <li key={w.metric} className="rounded-2xl border border-line bg-paper p-3">
              <p className="text-xs uppercase text-faint">{w.metric.replaceAll("_", " ")}</p>
              <p className="text-lg">
                {w.today == null ? "Missing" : w.today}
                {w.today != null && w.personalMedian != null ? ` · usual ${w.personalMedian}` : ""}
              </p>
              <p className="text-xs text-muted">
                {w.source} · {w.quality}
                {w.note ? ` · ${w.note}` : ""}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <ExplainPanel sessionId={id} />

      {finding && (
        <details className="mt-6 rounded-2xl border border-line bg-paper p-4">
          <summary className="min-h-tap cursor-pointer font-semibold">How measured</summary>
          <p className="mt-2 text-sm text-muted">{featureCopy[finding.feature]?.how}</p>
          <p className="mt-2 text-sm">
            View {session.view} · units {featureCopy[finding.feature]?.unit} · today {finding.current} · median{" "}
            {finding.personalMedian} · quality {finding.quality} · source {finding.source}
          </p>
          <p className="mt-2 text-xs text-muted">{limits.noBallClaims}</p>
        </details>
      )}

      <EditorialChart
        title="Trunk lean across this spell (demo)"
        unit="°"
        points={session.deliveries.map((d, i) => ({
          x: `B${i + 1}`,
          y: d.values.trunk_lateral_angle_at_foot_contact_deg,
        }))}
        caption="White chart, no grid. Synthetic values."
      />

      <form className="mt-6 rounded-2xl border border-line bg-paper p-4">
        <label className="text-sm">
          Does this match how it felt?
          <textarea className="mt-2 w-full rounded-xl border border-line p-3" name="felt" rows={3} />
        </label>
        <div className="mt-3 flex gap-2">
          <button type="button" className="min-h-tap rounded-full bg-teal px-4 text-sm text-white">
            Matches how it felt
          </button>
          <button type="button" className="min-h-tap rounded-full border px-4 text-sm">
            Doesn’t match
          </button>
        </div>
      </form>
    </AppShell>
  );
}
