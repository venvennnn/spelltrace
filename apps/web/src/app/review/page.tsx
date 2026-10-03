import Link from "next/link";
import { DEMO_CHANGED_SESSION_ID } from "@spelltrace/shared";
import { AppShell } from "@/components/AppShell";
import { FindingCard } from "@/components/FindingCard";
import { getStore } from "@/lib/store";

export default function ReviewHub() {
  const review = getStore().review(DEMO_CHANGED_SESSION_ID);
  return (
    <AppShell>
      <h1 className="font-display text-4xl">Review</h1>
      <p className="mt-2 text-muted">Latest demonstration session compared with your own usual side-on nets bowling.</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {review.findings.map((f) => (
          <FindingCard key={f.evidenceId} finding={f} href={`/sessions/${DEMO_CHANGED_SESSION_ID}/review?feature=${f.feature}`} />
        ))}
      </div>
      <Link href="/trends" className="mt-6 inline-flex min-h-tap text-teal underline">
        Ball / day / month trends
      </Link>
    </AppShell>
  );
}
