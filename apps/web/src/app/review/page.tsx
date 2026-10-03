import Link from "next/link";
import { DEMO_CHANGED_SESSION_ID, movementDeltas } from "@spelltrace/shared";
import { AppShell } from "@/components/AppShell";
import { DeltaList } from "@/components/DeltaList";
import { getStore } from "@/lib/store";

export default function ReviewHub() {
  const review = getStore().review(DEMO_CHANGED_SESSION_ID);
  return (
    <AppShell>
      <h1 className="font-display text-3xl">Review</h1>
      <DeltaList title="Latest changes" rows={movementDeltas(review.findings)} />
      <Link href={`/sessions/${DEMO_CHANGED_SESSION_ID}/review`} className="mt-5 inline-flex min-h-tap text-teal">
        Open clips
      </Link>
    </AppShell>
  );
}
