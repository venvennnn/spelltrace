import Link from "next/link";
import { notFound } from "next/navigation";
import { watchLabels } from "@spelltrace/shared";
import { AppShell } from "@/components/AppShell";
import { getStore } from "@/lib/store";
import { SessionActions } from "./SessionActions";

export default async function SessionDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = getStore().getSession(id);
  if (!session) notFound();

  return (
    <AppShell>
      <p className="text-xs text-demo">synthetic-demo</p>
      <h1 className="font-display text-4xl capitalize">
        {session.view}-on {session.drill}
      </h1>
      <p className="text-muted">
        {new Date(session.startedAtUtc).toLocaleString("en-AU", { timeZone: session.timezone })} · {session.timezone} ·{" "}
        {session.effort} effort
      </p>
      <p className="mt-2 text-sm">
        Watch motion: <strong>{session.motionStatus === "not_recorded" ? watchLabels.notRecorded : session.motionStatus}</strong>
      </p>
      {session.video?.deleted && <p className="mt-2 rounded-xl bg-clay-soft px-3 py-2 text-sm">Original video deleted — skeletal replay only.</p>}

      <ul className="mt-6 space-y-2">
        {session.deliveries.map((d, i) => (
          <li key={d.id} className="rounded-2xl border border-line bg-paper px-4 py-3">
            <p className="font-semibold">Delivery {i + 1}</p>
            <p className="text-sm text-muted">
              {d.startMs}–{d.endMs} ms · FFC {d.frontFootContactMs} ms · quality {d.quality}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={`/sessions/${id}/review`} className="inline-flex min-h-tap items-center rounded-full bg-teal px-4 font-semibold text-white">
          Review
        </Link>
        <Link href={`/compare?usual=sess-2026-09-20-d1&changed=${id}-d1`} className="inline-flex min-h-tap items-center rounded-full border border-ink px-4 font-semibold">
          Compare clips
        </Link>
        <Link href={`/shares/new?session=${id}`} className="inline-flex min-h-tap items-center text-teal underline">
          Share selected
        </Link>
      </div>
      <SessionActions sessionId={id} videoId={session.video?.id} videoDeleted={Boolean(session.video?.deleted)} />
    </AppShell>
  );
}
