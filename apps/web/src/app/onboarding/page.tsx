import Link from "next/link";

export default function OnboardingPage() {
  return (
    <div className="mx-auto min-h-dvh max-w-lg px-4 py-10">
      <h1 className="font-display text-3xl">Film a spell</h1>
      <ul className="mt-5 space-y-2 text-sm text-muted">
        <li>Side-on or front-on, camera still, full body in frame.</li>
        <li>Mark 2–5 balls. Watch file optional.</li>
        <li>Baseline needs a few matched sessions.</li>
        <li>Cycle notes stay private. Not a diagnosis.</li>
      </ul>
      <Link href="/today" className="mt-8 inline-flex min-h-tap items-center rounded-full bg-teal px-5 font-semibold text-white">
        Open demo
      </Link>
    </div>
  );
}
