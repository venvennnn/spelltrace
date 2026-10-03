import { providerCopy } from "@spelltrace/shared";
import { AppShell } from "@/components/AppShell";
import { Rule } from "@/components/Sensei";
import { getStore } from "@/lib/store";
import { WatchActions } from "./WatchActions";

export default function WatchPage() {
  const connections = getStore().connections();
  return (
    <AppShell>
      <h1 className="font-display text-[34px] font-semibold leading-none">Watch</h1>
      <div className="mt-3">
        <Rule />
      </div>
      <ul className="mt-2">
        {connections.map((c) => {
          const copy = providerCopy[c.provider];
          return (
            <li key={c.id} className="border-t border-line py-3">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-[15px] font-medium">{copy.title}</h2>
                <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-brick">
                  {c.live ? c.status : c.status === "coming_soon" ? "Coming soon" : "Native build"}
                </span>
              </div>
              <p className="mt-1 text-[12px] text-muted">Last sync {c.lastSyncedAt ? new Date(c.lastSyncedAt).toLocaleDateString() : "—"}</p>
              <WatchActions connection={c} />
            </li>
          );
        })}
      </ul>
    </AppShell>
  );
}
