import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { getStore } from "@/lib/store";
import { SessionActions } from "./SessionActions";

export default async function SessionDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = getStore().getSession(id);
  if (!session) notFound();

  return (
    <AppShell>
      <h1 className="font-display text-3xl capitalize">
        {session.view} {session.drill}
      </h1>
      <p className="text-sm text-muted">
        {new Date(session.startedAtUtc).toLocaleDateString("en-AU")} · {session.deliveries.length} balls
        {session.video?.deleted ? " · video deleted" : ""}
      </p>
      <Link href={`/sessions/${id}/review`} className="mt-5 inline-flex min-h-tap items-center rounded-full bg-teal px-4 font-semibold text-white">
        Review
      </Link>
      <SessionActions sessionId={id} videoId={session.video?.id} videoDeleted={Boolean(session.video?.deleted)} />
    </AppShell>
  );
}
