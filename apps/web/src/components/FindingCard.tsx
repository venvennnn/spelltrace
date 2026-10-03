import { featureCopy, watchLabels } from "@spelltrace/shared";
import type { ReviewFinding } from "@spelltrace/shared";
import Link from "next/link";

const chip: Record<string, string> = {
  pose: watchLabels.pose,
  watch_motion: watchLabels.watchMotion,
  daily_context: watchLabels.daily,
};

export function FindingCard({
  finding,
  href,
}: {
  finding: ReviewFinding;
  href: string;
}) {
  const meta = featureCopy[finding.feature];
  return (
    <article className="rounded-2xl border border-line bg-paper p-4">
      <div className="mb-2 flex flex-wrap gap-2">
        <span className="rounded-full bg-teal-soft px-2 py-0.5 text-xs font-semibold text-teal">
          {chip[finding.modality]}
        </span>
        <span className="rounded-full bg-demo-soft px-2 py-0.5 text-xs text-demo">{finding.source}</span>
        <span className="rounded-full bg-line px-2 py-0.5 text-xs text-muted">n={finding.sampleCount}</span>
      </div>
      <h3 className="font-display text-xl text-ink">{meta?.label ?? finding.feature}</h3>
      <p className="mt-1 text-sm text-muted">{finding.text}</p>
      <p className="mt-2 text-sm text-ink">
        Today {finding.current}
        {meta?.unit} · your median {finding.personalMedian}
        {meta?.unit} · interval {finding.personalInterval[0]}–{finding.personalInterval[1]}
      </p>
      <Link href={href} className="mt-3 inline-flex min-h-tap items-center text-sm font-semibold text-teal">
        Open comparison
      </Link>
    </article>
  );
}
