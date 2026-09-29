export function formatBDT(amount: number) {
  const rounded = Math.round(amount);
  const sign = rounded < 0 ? '−' : '';
  return `${sign}৳${Math.abs(rounded).toLocaleString('en-IN')}`;
}

export function formatCompactBDT(amount: number) {
  if (amount >= 10000000) return `৳${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `৳${(amount / 100000).toFixed(1)} L`;
  if (amount >= 1000) return `৳${(amount / 1000).toFixed(1)}k`;
  return formatBDT(amount);
}

export function formatNumber(n: number) {
  return n.toLocaleString('en-IN');
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
