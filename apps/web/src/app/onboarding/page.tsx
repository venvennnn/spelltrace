import Link from "next/link";
import { limits } from "@spelltrace/shared";
import { DemoBanner } from "@/components/DemoBanner";

export default function OnboardingPage() {
  return (
    <div className="mx-auto min-h-dvh max-w-2xl px-4 py-10">
      <DemoBanner />
      <h1 className="mt-6 font-display text-4xl">Before you film</h1>
      <ol className="mt-6 space-y-5 text-muted">
        <li>
          <strong className="text-ink">Adults only for this pilot.</strong> {limits.adultOnly}
        </li>
        <li>
          <strong className="text-ink">Stable camera.</strong> Side-on or front-on, tripod-like, full body in frame. Mark 2–5 deliveries. Front-foot contact can be tapped later.
        </li>
        <li>
          <strong className="text-ink">A useful baseline takes repeats.</strong> Confident change labels need at least three earlier matched sessions and 30 quality-passed deliveries.
        </li>
        <li>
          <strong className="text-ink">Watch files are optional.</strong> {limits.noWatchMotionFromDaily}
        </li>
        <li>
          <strong className="text-ink">You own the footage.</strong> Keep video, keep movement only, or delete both. {limits.noDiagnosis}
        </li>
        <li>
          <strong className="text-ink">Optional cycle notes stay private</strong> by default and never trigger a performance or injury verdict.
        </li>
      </ol>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/today" className="inline-flex min-h-tap items-center justify-center rounded-full bg-teal px-5 font-semibold text-white">
          Enter demonstration
        </Link>
        <Link href="/sessions/new" className="inline-flex min-h-tap items-center justify-center rounded-full border border-ink px-5 font-semibold">
          Create a session
        </Link>
      </div>
    </div>
  );
}
