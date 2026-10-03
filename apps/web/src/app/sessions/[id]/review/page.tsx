import { notFound } from "next/navigation";
import {
  cycleDelta,
  environmentDeltas,
  featureCopy,
  movementDeltas,
  recoveryDeltas,
} from "@spelltrace/shared";
import { AppShell } from "@/components/AppShell";
import { ComparisonPlayer } from "@/components/ComparisonPlayer";
import { DeltaList } from "@/components/DeltaList";
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
  const sessions = store.listSessions();
  const session = store.getSession(id);
  if (!session) notFound();
  const review = store.review(id);
  const finding = review.findings.find((f) => f.feature === feature) ?? review.findings[0];
  const usualId = finding?.usualDeliveryId;
  const usualSession = sessions.find((s) => s.deliveries.some((d) => d.id === usualId));
  const usualDelivery = usualSession?.deliveries.find((d) => d.id === usualId) ?? usualSession?.deliveries[0];
  const changed = session.deliveries[0];

  return (
    <AppShell>
      <h1 className="font-display text-3xl">Review</h1>
      <p className="text-sm text-muted">
        {review.baseline.status === "ready" ? `${review.findings.length} changes` : "Baseline building"} · {review.baseline.match}
      </p>

      {changed && usualDelivery && usualSession && (
        <div className="mt-4">
          <ComparisonPlayer
            usual={{
              id: usualDelivery.id,
              title: "Usual",
              date: new Date(usualSession.startedAtUtc).toLocaleDateString("en-AU"),
              match: `${usualSession.view} / ${usualSession.drill}`,
              videoDeleted: Boolean(usualSession.video?.deleted),
              frames: usualDelivery.trace,
              durationMs: 1800,
              phases: [],
              width: 720,
              height: 960,
            }}
            changed={{
              id: changed.id,
              title: session.video?.deleted ? "Today · video deleted" : "Today",
              date: new Date(session.startedAtUtc).toLocaleDateString("en-AU"),
              match: `${session.view} / ${session.drill}`,
              videoDeleted: Boolean(session.video?.deleted),
              frames: changed.trace,
              durationMs: 1800,
              phases: [],
              width: 720,
              height: 960,
            }}
            feature={finding?.feature}
            currentValue={finding?.current}
          />
        </div>
      )}

      <div className="mt-5 space-y-3">
        <DeltaList title="Movement" rows={movementDeltas(review.findings)} />
        <DeltaList title="Sleep & recovery" rows={recoveryDeltas(session, sessions)} hint="Context, not a cause" />
        <DeltaList title="Cycle" rows={[cycleDelta(session, sessions)]} hint="Private · phase not inferred" />
        <DeltaList title="Environment" rows={environmentDeltas(session, sessions)} />
      </div>

      <ExplainPanel sessionId={id} />

      {finding && (
        <details className="mt-4 text-sm">
          <summary className="min-h-tap cursor-pointer text-teal">How measured</summary>
          <p className="mt-2 text-muted">{featureCopy[finding.feature]?.how}</p>
        </details>
      )}
    </AppShell>
  );
}
