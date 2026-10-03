import Link from "next/link";
import { DEMO_CHANGED_SESSION_ID, contextPatterns, heroDelta, reviewForSession } from "@spelltrace/shared";
import { AppShell } from "@/components/AppShell";
import { PatternList, Rule } from "@/components/Sensei";
import { getStore } from "@/lib/store";

export default function ReviewHub() {
  const sessions = getStore().listSessions();
  const review = reviewForSession(DEMO_CHANGED_SESSION_ID, sessions);
  const session = sessions.find((s) => s.id === DEMO_CHANGED_SESSION_ID)!;
  const hero = heroDelta(review.findings);
  const href = `/sessions/${DEMO_CHANGED_SESSION_ID}/review`;
  return (
    <AppShell>
      <p className="text-[12px] uppercase tracking-[0.08em] text-muted">{review.baseline.match}</p>
      <h1 className="font-display text-[34px] font-semibold leading-none">Review</h1>
      <div className="mt-3">
        <Rule />
      </div>
      <div className="mt-5 flex items-center gap-4">
        <p className="font-display text-[52px] font-semibold leading-none text-brick">{hero.value}</p>
        <p className="text-[15px] leading-snug">{hero.label} vs your usual. Tap a row, then open clips.</p>
      </div>
      <Link href={href} className="mt-3 inline-flex min-h-tap items-center font-medium text-brick">
        Compare usual vs today →
      </Link>
      <div className="mt-6">
        <PatternList rows={contextPatterns(session, sessions)} />
      </div>
    </AppShell>
  );
}
