import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { getStore } from "@/lib/store";

export default function SessionsPage() {
  const sessions = getStore().listSessions();
  return (
    <AppShell>
      <div className="flex items-end justify-between gap-3">
        <h1 className="font-display text-4xl">Sessions</h1>
        <Link href="/sessions/new" className="inline-flex min-h-tap items-center rounded-full bg-teal px-4 text-sm font-semibold text-white">
          Add
        </Link>
      </div>
      <ul className="mt-5 space-y-3">
        {sessions.map((s) => (
          <li key={s.id}>
            <Link href={`/sessions/${s.id}`} className="block rounded-2xl border border-line bg-paper p-4">
              <p className="text-xs text-faint">
                {new Date(s.startedAtUtc).toLocaleString("en-AU", { timeZone: s.timezone })} · {s.timezone}
              </p>
              <p className="font-display text-2xl capitalize">
                {s.view}-on {s.drill} · {s.effort}
              </p>
              <p className="text-sm text-muted">
                {s.deliveries.length} deliveries · {s.video?.deleted ? "original video deleted" : s.video ? "video kept" : "no video"} · motion{" "}
                {s.motionStatus === "not_recorded" ? "not recorded" : s.motionStatus}
              </p>
              <p className="mt-1 text-xs text-demo">synthetic-demo</p>
            </Link>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
