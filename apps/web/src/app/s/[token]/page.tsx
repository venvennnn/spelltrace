import { limits } from "@spelltrace/shared";
import { getStore } from "@/lib/store";
import { DemoBanner } from "@/components/DemoBanner";

export default async function PublicShare({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = getStore().publicShare(token);
  if (result && typeof result === "object" && "code" in result) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <h1 className="font-display text-3xl">Link unavailable</h1>
        <p className="mt-2 text-muted">{String((result as { message?: string }).message ?? "This link is not available.")}</p>
      </div>
    );
  }
  const data = result as {
    title: string;
    expiresAt: string;
    items: Array<{
      deliveryId?: string;
      movementOnly?: boolean;
      metrics?: Record<string, number>;
      notes?: string;
      sensitive?: unknown;
      dailyHealth?: unknown;
      label?: string;
    }>;
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <DemoBanner />
      <h1 className="mt-4 font-display text-4xl">{data.title}</h1>
      <p className="text-sm text-muted">Expires {new Date(data.expiresAt).toLocaleString()}</p>
      <p className="mt-2 text-sm text-muted">{limits.shareRevoke}</p>
      <ul className="mt-6 space-y-3">
        {data.items.map((item, i) => (
          <li key={i} className="rounded-2xl border border-line bg-paper p-4">
            <p className="font-semibold">{item.deliveryId ?? "clip"}</p>
            {item.movementOnly && <p className="text-sm text-clay">Movement-only · original video not included</p>}
            {item.metrics && (
              <p className="mt-1 text-sm">
                Trunk {item.metrics.trunk_lateral_angle_at_foot_contact_deg}° · source demonstration
              </p>
            )}
            {item.notes && <p className="text-sm">Note: {item.notes}</p>}
            {item.sensitive ? <p className="text-sm">Sensitive fields were included by the athlete.</p> : null}
            {!item.dailyHealth && <p className="text-xs text-faint">Daily health metrics not shared.</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
