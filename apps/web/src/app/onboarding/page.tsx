import Link from "next/link";
import { Rule } from "@/components/Sensei";

export default function OnboardingPage() {
  return (
    <div className="mx-auto min-h-dvh max-w-phone bg-paper px-6 py-10">
      <p className="text-[12px] uppercase tracking-[0.08em] text-muted">Before you film</p>
      <h1 className="font-display text-[34px] font-semibold leading-none">Film a spell</h1>
      <div className="mt-3">
        <Rule />
      </div>
      <ol className="mt-5 space-y-3 text-[14px] leading-snug">
        <li className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[1.5px] border-brick text-xs font-semibold text-brick">1</span>
          Side-on or front-on. Camera still. Full body in frame.
        </li>
        <li className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[1.5px] border-brick text-xs font-semibold text-brick">2</span>
          Mark 2–5 balls. Watch file optional.
        </li>
        <li className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[1.5px] border-brick text-xs font-semibold text-brick">3</span>
          Cycle notes stay private. Not a diagnosis.
        </li>
      </ol>
      <Link href="/today" className="mt-8 inline-flex min-h-12 w-full items-center justify-center bg-ink text-[15px] font-semibold text-white">
        Open demo
      </Link>
    </div>
  );
}
