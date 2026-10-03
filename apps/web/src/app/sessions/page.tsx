import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { getStore } from "@/lib/store";

export default function SessionsPage() {
  const sessions = getStore().listSessions();
  return (
    <AppShell>
      <div className="flex items-end justify-between">
        <h1 className="font-display text-3xl">Sessions</h1>
        <Link href="/sessions/new" className="min-h-tap rounded-full bg-teal px-4 text-sm font-semibold leading-10 text-white">
          Add
        </Link>
      </div>
      <ul className="mt-4 space-y-2">
        {sessions.map((s) => (
          <li key={s.id}>
            <Link href={`/sessions/${s.id}`} className="block rounded-2xl border border-line px-4 py-3">
              <p className="font-semibold capitalize">
                {new Date(s.startedAtUtc).toLocaleDateString("en-AU")} · {s.view} {s.drill}
              </p>
              <p className="text-sm text-muted">
                {s.deliveries.length} balls{s.video?.deleted ? " · video deleted" : ""}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
