import Link from "next/link";
import { product } from "@spelltrace/shared";
import { Rule } from "@/components/Sensei";

export default function LandingPage() {
  return (
    <div className="mx-auto min-h-dvh max-w-[820px] px-6 py-12">
      <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-brick">Spelltrace</p>
      <h1 className="mt-2 font-display text-[34px] font-semibold leading-tight md:text-[44px]">{product.tagline}</h1>
      <p className="mt-3 max-w-[520px] text-[15px] leading-snug text-muted">{product.coreQuestion}</p>
      <div className="mt-5">
        <Rule />
      </div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/today" className="inline-flex min-h-tap items-center justify-center bg-ink px-6 text-[15px] font-semibold text-white">
          Open demo
        </Link>
        <Link href="/onboarding" className="inline-flex min-h-tap items-center justify-center border border-ink px-6 text-[15px]">
          Film guide
        </Link>
      </div>
    </div>
  );
}
