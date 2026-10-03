import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Rule } from "@/components/Sensei";
import { getStore } from "@/lib/store";

export default function SessionsPage() {
  const sessions = getStore().listSessions();
  return (
    <AppShell>
      <div className="flex items-end justify-between">
        <h1 className="font-display text-[34px] font-semibold leading-none">Sessions</h1>
        <Link href="/sessions/new" className="min-h-tap text-[14px] font-medium text-brick">
          Log
        </Link>
      </div>
      <div className="mt-3">
        <Rule />
      </div>
      <ul className="mt-2">
        {sessions.map((s) => (
          <li key={s.id} className="border-t border-line">
            <Link href={`/sessions/${s.id}`} className="flex min-h-tap items-baseline justify-between gap-3 py-3">
              <span>
                <span className="block text-[15px] font-medium capitalize">
                  {s.view} {s.drill}
                </span>
                <span className="text-[13px] text-muted">
                  {new Date(s.startedAtUtc).toLocaleDateString("en-AU")} · {s.deliveries.length} balls
                  {s.video?.deleted ? " · video deleted" : ""}
                </span>
              </span>
              <span className="font-display text-[18px] font-semibold">{s.effort === "high" ? "High" : s.effort}</span>
            </Link>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
