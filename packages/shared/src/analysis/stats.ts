export function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

export function mad(values: number[], med = median(values)): number | null {
  if (med === null || !values.length) return null;
  return median(values.map((v) => Math.abs(v - med)));
}

export function percentileRank(values: number[], current: number): number | null {
  if (!values.length) return null;
  const below = values.filter((v) => v < current).length;
  const equal = values.filter((v) => v === current).length;
  return (below + 0.5 * equal) / values.length;
}

export function empiricalInterval(values: number[], lo = 0.1, hi = 0.9): [number, number] | null {
  if (values.length < 3) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const at = (p: number) => {
    const i = (sorted.length - 1) * p;
    const loIdx = Math.floor(i);
    const hiIdx = Math.ceil(i);
    if (loIdx === hiIdx) return sorted[loIdx]!;
    return sorted[loIdx]! + (sorted[hiIdx]! - sorted[loIdx]!) * (i - loIdx);
  };
  return [at(lo), at(hi)];
}

export function robustZ(current: number, values: number[]): number | null {
  const med = median(values);
  const m = mad(values, med);
  if (med === null || m === null || m === 0) return null;
  return (0.6745 * (current - med)) / m;
}
