import { providerCopy } from "@spelltrace/shared";
import { AppShell } from "@/components/AppShell";
import { getStore } from "@/lib/store";
import { WatchActions } from "./WatchActions";

export default function WatchPage() {
  const connections = getStore().connections();
  return (
    <AppShell>
      <h1 className="font-display text-3xl">Watch</h1>
      <ul className="mt-4 space-y-3">
        {connections.map((c) => {
          const copy = providerCopy[c.provider];
          return (
            <li key={c.id} className="rounded-2xl border border-line p-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-semibold">{copy.title}</h2>
                <span className="rounded-full bg-teal-soft px-2 py-0.5 text-xs text-teal">
                  {c.live ? c.status : c.status === "coming_soon" ? "Coming soon" : "Native build"}
                </span>
              </div>
              <p className="mt-1 text-xs text-faint">Last sync {c.lastSyncedAt ? new Date(c.lastSyncedAt).toLocaleDateString() : "—"}</p>
              <WatchActions connection={c} />
            </li>
          );
        })}
      </ul>
    </AppShell>
  );
}
