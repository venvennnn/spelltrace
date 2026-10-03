import { AppShell } from "@/components/AppShell";
import { ComparisonPlayer } from "@/components/ComparisonPlayer";
import { getStore } from "@/lib/store";

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ usual?: string; changed?: string }>;
}) {
  const q = await searchParams;
  const store = getStore();
  const sessions = store.listSessions();
  const find = (id?: string) => {
    for (const s of sessions) {
      const d = s.deliveries.find((x) => x.id === id) ?? (id && s.id === id ? s.deliveries[0] : undefined);
      if (d) return { s, d };
    }
    return { s: sessions[1], d: sessions[1]?.deliveries[0] };
  };
  const usual = find(q.usual ?? "sess-2026-09-20-d1");
  const changed = find(q.changed ?? "sess-changed-2026-10-02-d1");

  return (
    <AppShell>
      <h1 className="font-display text-3xl">Compare</h1>
      {usual.d && changed.d && usual.s && changed.s && (
        <div className="mt-5">
          <ComparisonPlayer
            usual={{
              id: usual.d.id,
              title: "Usual",
              date: new Date(usual.s.startedAtUtc).toLocaleDateString("en-AU"),
              match: `${usual.s.view} / ${usual.s.drill}`,
              videoDeleted: Boolean(usual.s.video?.deleted),
              frames: usual.d.trace,
              durationMs: 1800,
              phases: [],
              width: 1280,
              height: 720,
            }}
            changed={{
              id: changed.d.id,
              title: "Changed",
              date: new Date(changed.s.startedAtUtc).toLocaleDateString("en-AU"),
              match: `${changed.s.view} / ${changed.s.drill}`,
              videoDeleted: Boolean(changed.s.video?.deleted),
              frames: changed.d.trace,
              durationMs: 1800,
              phases: [],
              width: 1280,
              height: 720,
            }}
          />
        </div>
      )}
    </AppShell>
  );
}
