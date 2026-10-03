import Link from "next/link";
import { product } from "@spelltrace/shared";

export default function LandingPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-page flex-col justify-center px-4 py-12">
      <p className="text-sm font-semibold text-teal">Spelltrace</p>
      <h1 className="mt-2 font-display text-4xl leading-tight md:text-6xl">{product.tagline}</h1>
      <p className="mt-3 text-muted">{product.coreQuestion}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/today" className="inline-flex min-h-tap items-center justify-center rounded-full bg-teal px-6 font-semibold text-white">
          Open demo
        </Link>
        <Link href="/onboarding" className="inline-flex min-h-tap items-center justify-center rounded-full border border-line px-6">
          Film guide
        </Link>
      </div>
    </div>
  );
}
