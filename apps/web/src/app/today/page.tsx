import Link from "next/link";
import {
  DEMO_CHANGED_SESSION_ID,
  contextPatterns,
  heroDelta,
  metricStrip,
  reviewForSession,
  sleepLeanScatter,
  todayDrivers,
} from "@spelltrace/shared";
import { AppShell } from "@/components/AppShell";
import { Drivers, Eyebrow, MetricStrip, PatternList, Rule, SleepScatter } from "@/components/Sensei";
import { getStore } from "@/lib/store";

export default function TodayPage() {
  const store = getStore();
  const sessions = store.listSessions();
  const session = store.getSession(DEMO_CHANGED_SESSION_ID);
  const review = reviewForSession(DEMO_CHANGED_SESSION_ID, sessions);
  if (!session) return null;
  const href = `/sessions/${DEMO_CHANGED_SESSION_ID}/review`;
  const hero = heroDelta(review.findings);

  return (
    <AppShell>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[12px] uppercase tracking-[0.08em] text-muted">Fri 2 Oct · side-on nets</p>
          <h1 className="font-display text-[34px] font-semibold leading-none">Today</h1>
        </div>
        <div className="text-right">
          <p className="font-display text-[26px] font-semibold leading-none text-brick">{review.findings.length}</p>
          <p className="text-[12px] text-muted">changes vs usual</p>
        </div>
      </div>

      <div className="mt-4">
        <Rule />
      </div>

      <section className="mt-5">
        <Eyebrow>What changed</Eyebrow>
        <div className="mt-1 flex items-center gap-4">
          <p className="font-display text-[60px] font-semibold leading-none text-brick">{hero.value}</p>
          <p className="text-[15px] leading-snug">{hero.label} vs your usual {review.baseline.match}.</p>
        </div>
      </section>

      <section className="mt-5 border-t border-line pt-3.5">
        <Eyebrow>Session</Eyebrow>
        <p className="mt-1 font-display text-[22px] font-semibold leading-tight">Side-on nets · high</p>
        <p className="text-[14px] text-[#4A4A4A]">{session.deliveries.length} marked balls · no watch-motion file</p>
        <Link href={href} className="mt-3 inline-flex min-h-tap items-center font-medium text-brick">
          Compare usual vs today →
        </Link>
      </section>

      <div className="mt-5 border-t border-line pt-3.5">
        <Drivers items={todayDrivers(session, sessions, review.findings, href)} />
      </div>

      <div className="mt-2">
        <MetricStrip cells={metricStrip(session, sessions)} />
      </div>

      <div className="mt-6">
        <PatternList rows={contextPatterns(session, sessions)} />
      </div>
      <div className="mt-6">
        <SleepScatter points={sleepLeanScatter(session, sessions)} />
      </div>
    </AppShell>
  );
}
