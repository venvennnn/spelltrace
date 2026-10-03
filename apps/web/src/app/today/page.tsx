import Link from "next/link";
import {
  DEMO_CHANGED_SESSION_ID,
  cycleDelta,
  environmentDeltas,
  movementDeltas,
  recoveryDeltas,
  reviewForSession,
} from "@spelltrace/shared";
import { AppShell } from "@/components/AppShell";
import { DeltaList } from "@/components/DeltaList";
import { getStore } from "@/lib/store";

export default function TodayPage() {
  const store = getStore();
  const sessions = store.listSessions();
  const session = store.getSession(DEMO_CHANGED_SESSION_ID);
  const review = reviewForSession(DEMO_CHANGED_SESSION_ID, sessions);
  if (!session) return null;

  return (
    <AppShell>
      <p className="text-sm text-muted">2 Oct 2026</p>
      <h1 className="font-display text-3xl">Today</h1>
      <p className="mt-1 text-sm text-muted">
        vs your usual {review.baseline.match}
        {review.baseline.status === "building" ? " · baseline still building" : ""}
      </p>

      <div className="mt-5 space-y-3">
        <DeltaList title="Movement" rows={movementDeltas(review.findings)} />
        <DeltaList title="Sleep & recovery" rows={recoveryDeltas(session, sessions)} hint="Context, not a cause" />
        <DeltaList title="Cycle" rows={[cycleDelta(session, sessions)]} hint="Private · not a verdict" />
        <DeltaList title="Environment" rows={environmentDeltas(session, sessions)} />
      </div>

      <Link
        href={`/sessions/${DEMO_CHANGED_SESSION_ID}/review`}
        className="mt-6 inline-flex min-h-tap w-full items-center justify-center rounded-full bg-teal font-semibold text-white"
      >
        Compare clips
      </Link>
    </AppShell>
  );
}
