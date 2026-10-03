import { limits } from "@spelltrace/shared";

export function DemoBanner({ compact = false }: { compact?: boolean }) {
  return (
    <p
      role="status"
      className="rounded-full bg-demo-soft px-3 py-1.5 text-center text-[13px] font-semibold text-demo"
    >
      {compact ? "Demonstration data" : limits.demoBanner}
    </p>
  );
}
