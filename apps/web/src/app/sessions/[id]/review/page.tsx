import { notFound } from "next/navigation";
import { contextPatterns, featureCopy, heroDelta, metricStrip, sleepLeanScatter, todayDrivers } from "@spelltrace/shared";
import { AppShell } from "@/components/AppShell";
import { ComparisonPlayer } from "@/components/ComparisonPlayer";
import { Drivers, Eyebrow, MetricStrip, PatternList, Rule, SleepScatter } from "@/components/Sensei";
import { getStore } from "@/lib/store";

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
  const hero = heroDelta(review.findings);

  return (
    <AppShell wide>
      <p className="text-[12px] uppercase tracking-[0.08em] text-muted">{review.baseline.match}</p>
      <h1 className="font-display text-[34px] font-semibold leading-none">Review</h1>
      <div className="mt-3">
        <Rule />
      </div>

      <div className="mt-4 flex items-center gap-4">
        <p className="font-display text-[52px] font-semibold leading-none text-brick">{hero.value}</p>
        <p className="text-[15px] leading-snug">{hero.label} vs your usual.</p>
      </div>

      {changed && usualDelivery && usualSession && (
        <div className="mt-4">
          <Eyebrow>Usual vs today</Eyebrow>
          <div className="mt-2">
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
        </div>
      )}

      <div className="mt-6">
        <Drivers items={todayDrivers(session, sessions, review.findings, `/sessions/${id}/review`)} />
      </div>
      <MetricStrip cells={metricStrip(session, sessions)} />
      <div className="mt-6">
        <PatternList rows={contextPatterns(session, sessions)} />
      </div>
      <div className="mt-6">
        <SleepScatter points={sleepLeanScatter(session, sessions)} />
      </div>

      {finding && (
        <details className="mt-4">
          <summary className="min-h-tap cursor-pointer text-[14px] font-medium text-brick">How this was measured</summary>
          <p className="mt-2 text-[13px] text-muted">{featureCopy[finding.feature]?.how}</p>
        </details>
      )}
    </AppShell>
  );
}
