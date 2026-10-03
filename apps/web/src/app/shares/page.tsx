import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { getStore } from "@/lib/store";

export default function SharesPage() {
  const shares = getStore().snapshot().shares;
  return (
    <AppShell>
      <div className="flex items-end justify-between">
        <h1 className="font-display text-4xl">Shares</h1>
        <Link href="/shares/new" className="min-h-tap rounded-full bg-teal px-4 text-sm font-semibold leading-10 text-white">
          New share
        </Link>
      </div>
      <p className="mt-2 text-sm text-muted">
        Revoking a link blocks later visits. It cannot retract a clip someone already downloaded.
      </p>
      <ul className="mt-5 space-y-3">
        {shares.length === 0 && <li className="text-muted">No share links yet.</li>}
        {shares.map((s) => (
          <li key={s.id} className="rounded-2xl border border-line bg-paper p-4">
            <p className="font-semibold">{s.title}</p>
            <p className="text-sm text-muted">
              {s.items.length} items · expires {new Date(s.expiresAt).toLocaleString()} ·{" "}
              {s.revokedAt ? "revoked" : "active"}
            </p>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
