export function DemoBanner({ compact = false }: { compact?: boolean }) {
  return (
    <p role="status" className="text-xs font-semibold text-demo">
      {compact ? "Demo" : "Demo data"}
    </p>
  );
}
