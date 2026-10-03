import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Eyebrow, Rule } from "@/components/Sensei";

export default async function ProcessingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppShell>
      <Eyebrow>Demo · already complete</Eyebrow>
      <h1 className="font-display text-[34px] font-semibold leading-none">Saved</h1>
      <div className="mt-3">
        <Rule />
      </div>
      <ol className="mt-5 text-[14px]">
        <li className="border-t border-line py-2.5">Timestamps and view checked</li>
        <li className="border-t border-line py-2.5">Pose kept</li>
        <li className="border-t border-line py-2.5">Compared with earlier matched sessions only</li>
      </ol>
      <Link href={`/sessions/${id}`} className="mt-6 inline-flex min-h-12 w-full items-center justify-center bg-ink text-[15px] font-semibold text-white">
        Open session
      </Link>
    </AppShell>
  );
}
