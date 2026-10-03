import Link from "next/link";
import { AppShell } from "@/components/AppShell";

export default async function ProcessingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppShell>
      <h1 className="font-display text-4xl">Processing</h1>
      <p className="mt-2 text-muted">Jobs run asynchronously: queued → processing → complete or quality_rejected. This demonstration session is already complete.</p>
      <ol className="mt-6 space-y-2 text-sm">
        <li className="rounded-xl bg-paper px-3 py-2">Validate timestamps, view, and playable video</li>
        <li className="rounded-xl bg-paper px-3 py-2">Extract pose landmarks (algorithm pose-0.1)</li>
        <li className="rounded-xl bg-paper px-3 py-2">Compare with earlier matched sessions only</li>
      </ol>
      <Link href={`/sessions/${id}`} className="mt-6 inline-flex min-h-tap items-center rounded-full bg-teal px-4 font-semibold text-white">
        Open session
      </Link>
    </AppShell>
  );
}
