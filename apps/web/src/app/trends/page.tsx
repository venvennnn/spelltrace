import { AppShell } from "@/components/AppShell";
import { EditorialChart } from "@/components/EditorialChart";
import { getStore } from "@/lib/store";

export default function TrendsPage() {
  const store = getStore();
  const balls = store.trends("ball") as Array<{
    deliveryId: string;
    sessionId: string;
    at: string;
    values: Record<string, number>;
    replay: string;
    videoDeleted: boolean;
    label?: string;
  }>;
  const days = store.trends("day") as Array<{ key: string; n: number; medianTrunk: number | null; sessions: number }>;
  const months = store.trends("month") as Array<{ key: string; n: number; medianTrunk: number | null; sessions: number }>;

  return (
    <AppShell>
      <h1 className="font-display text-4xl">History</h1>
      <p className="mt-2 text-sm text-muted">
        Dates use the athlete timezone. Month aggregates exclude missing or incompatible measures and disclose n. Filter by
        view, drill, effort, and algorithm version.
      </p>

      <EditorialChart
        title="Day medians — trunk lean"
        unit="°"
        points={days.map((d) => ({ x: d.key.slice(5), y: d.medianTrunk }))}
        caption="Matched subset only. Demonstration data."
      />

      <section className="mt-8">
        <h2 className="font-display text-2xl">Month</h2>
        <ul className="mt-3 grid gap-2 md:grid-cols-2">
          {months.map((m) => (
            <li key={m.key} className="rounded-2xl border border-line bg-paper p-4">
              <p className="font-semibold">{m.key}</p>
              <p className="text-sm text-muted">
                n={m.n} deliveries · {m.sessions} sessions · median {m.medianTrunk ?? "unavailable"}°
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-2xl">Ball by ball</h2>
        <ul className="mt-3 space-y-2">
          {balls.map((b) => (
            <li key={b.deliveryId} className="rounded-2xl border border-line bg-paper px-4 py-3">
              <p className="text-sm font-semibold">
                {b.deliveryId} · trunk {b.values.trunk_lateral_angle_at_foot_contact_deg}°
              </p>
              <p className="text-xs text-muted">
                {new Date(b.at).toLocaleString("en-AU")} · replay {b.replay}
                {b.videoDeleted ? " · source footage deleted" : ""}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}
