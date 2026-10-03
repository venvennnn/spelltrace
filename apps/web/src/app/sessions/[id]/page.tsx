import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Rule } from "@/components/Sensei";
import { getStore } from "@/lib/store";
import { SessionActions } from "./SessionActions";

export default async function SessionDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = getStore().getSession(id);
  if (!session) notFound();

  return (
    <AppShell>
      <p className="text-[12px] uppercase tracking-[0.08em] text-muted">
        {new Date(session.startedAtUtc).toLocaleDateString("en-AU")} · {session.effort}
      </p>
      <h1 className="font-display text-[34px] font-semibold capitalize leading-none">
        {session.view} {session.drill}
      </h1>
      <div className="mt-3">
        <Rule />
      </div>
      <p className="mt-4 text-[14px] text-muted">
        {session.deliveries.length} balls
        {session.video?.deleted ? " · video deleted · skeletal only" : ""}
      </p>
      <Link href={`/sessions/${id}/review`} className="mt-4 inline-flex min-h-tap items-center font-medium text-brick">
        Review clips →
      </Link>
      <SessionActions sessionId={id} videoId={session.video?.id} videoDeleted={Boolean(session.video?.deleted)} />
    </AppShell>
  );
}
