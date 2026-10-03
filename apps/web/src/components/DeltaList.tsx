import type { DeltaRow } from "@spelltrace/shared";

const toneClass: Record<DeltaRow["tone"], string> = {
  up: "text-clay",
  down: "text-teal",
  same: "text-muted",
  missing: "text-faint",
  note: "text-demo",
};

export function DeltaList({ title, rows, hint }: { title: string; rows: DeltaRow[]; hint?: string }) {
  if (!rows.length) return null;
  return (
    <section className="rounded-2xl border border-line bg-white p-3">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h2 className="font-display text-xl">{title}</h2>
        {hint && <p className="text-[11px] text-faint">{hint}</p>}
      </div>
      <ul className="divide-y divide-line">
        {rows.map((r) => (
          <li key={r.id} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 py-2 text-sm">
            <span className="text-ink">{r.label}</span>
            <span className="text-right tabular-nums text-ink">{r.today}</span>
            <span className="text-right text-faint">vs {r.usual}</span>
            <span className={`min-w-[4.5rem] text-right font-semibold tabular-nums ${toneClass[r.tone]}`}>{r.delta}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
