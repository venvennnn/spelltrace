import { providerCopy } from "@spelltrace/shared";
import { AppShell } from "@/components/AppShell";
import { getStore } from "@/lib/store";
import { WatchActions } from "./WatchActions";

export default function WatchPage() {
  const connections = getStore().connections();
  return (
    <AppShell>
      <h1 className="font-display text-4xl">Connect your watch</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Signing into Spelltrace with Google alone does not grant health data access. Daily sleep and heart records are not
        bowling-motion data. Garmin and Google Health stay gated until credentials exist.
      </p>
      <ul className="mt-6 space-y-3">
        {connections.map((c) => {
          const copy = providerCopy[c.provider];
          return (
            <li key={c.id} className="rounded-2xl border border-line bg-paper p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="font-display text-2xl">{copy.title}</h2>
                <span className="rounded-full bg-teal-soft px-2 py-0.5 text-xs font-semibold text-teal">
                  {c.live ? c.status : c.status === "coming_soon" ? "Coming soon" : "Native build required"}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted">{copy.experience}</p>
              <p className="mt-2 text-xs text-faint">
                First sync {c.firstSyncedAt ?? "—"} · last sync {c.lastSyncedAt ?? "—"}
                {c.availableMetrics.length ? ` · available ${c.availableMetrics.join(", ")}` : ""}
                {c.errorCode ? ` · ${c.errorCode}` : ""}
              </p>
              <WatchActions connection={c} />
            </li>
          );
        })}
      </ul>
    </AppShell>
  );
}
