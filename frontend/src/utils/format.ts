import { format, formatDistanceToNow } from 'date-fns';

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

export function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return format(d, 'd MMM yyyy');
  } catch {
    return iso;
  }
}

export function formatDateTime(iso: string) {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return format(d, 'd MMM yyyy, h:mm a');
  } catch {
    return iso;
  }
}

export function timeAgo(iso: string) {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return iso;
  }
}

export function formatNumber(n: number) {
  return n.toLocaleString('en-IN');
}

export function percent(value: number, digits = 1) {
  return `${value.toFixed(digits)}%`;
}
