import Link from "next/link";
import { limits, product } from "@spelltrace/shared";
import { DemoBanner } from "@/components/DemoBanner";

export default function LandingPage() {
  return (
    <div className="mx-auto min-h-dvh max-w-page px-4 py-10">
      <p className="text-sm font-semibold tracking-wide text-teal">Spelltrace</p>
      <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight text-ink md:text-6xl">
        {product.tagline}
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">{product.coreQuestion}</p>
      <p className="mt-3 max-w-2xl text-sm text-muted">{limits.noDiagnosis}</p>
      <div className="mt-6">
        <DemoBanner />
      </div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/today"
          className="inline-flex min-h-tap items-center justify-center rounded-full bg-teal px-6 text-base font-semibold text-white"
        >
          Try the demonstration
        </Link>
        <Link
          href="/onboarding"
          className="inline-flex min-h-tap items-center justify-center rounded-full border border-ink px-6 text-base font-semibold"
        >
          How filming and privacy work
        </Link>
        <Link
          href="/signup"
          className="inline-flex min-h-tap items-center justify-center rounded-full px-6 text-base text-muted underline"
        >
          Sign up (adults)
        </Link>
      </div>
      <ul className="mt-12 grid gap-4 md:grid-cols-3">
        {[
          ["Your own usual", "Baseline is built only from your earlier comparable sessions — never male-derived ranges."],
          ["Two kinds of watch data", "Daily sleep and heart measures stay labelled as context. Delivery-level motion needs a real recording."],
          ["You decide what leaves", "Share a selected review through an expiring link. Private notes stay off unless you tick them."],
        ].map(([t, d]) => (
          <li key={t} className="rounded-2xl border border-line bg-paper p-5">
            <h2 className="font-display text-2xl">{t}</h2>
            <p className="mt-2 text-sm text-muted">{d}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
