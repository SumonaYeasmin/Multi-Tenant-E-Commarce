'use client';

import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Download, Search, ClipboardCheck } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { useAdmin } from '@/contexts/AdminContext';
import { stockMovements, type StockMovementItem } from '@/data/admin';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { GuardedButton } from '@/components/dashboard/shared/GuardedButton';
import { ModuleGate } from '@/components/dashboard/shared/ModuleGate';
import { Tabs } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/button';
import { available, LOW_STOCK_THRESHOLD } from '@/utils/pricing';
import { formatBDT, formatDateTime } from '@/utils/format';
import { cn } from '@/utils/cn';

type Tab = 'stock' | 'ledger';
const reasons = [
  'Received',
  'Correction',
  'Damaged',
  'Lost / stolen',
  'Physical count',
  'Returned to stock',
];

export default function AdminInventoryPage() {
  const { products, adjustStock } = useStore();
  const { actor } = useAdmin();
  const [tab, setTab] = useState<Tab>('stock');
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [adjust, setAdjust] = useState<{
    pid: string;
    vid: string;
    label: string;
    current: number;
  } | null>(null);
  const [delta, setDelta] = useState('');
  const [reason, setReason] = useState(reasons[0]);
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [ledger, setLedger] = useState<StockMovementItem[]>(stockMovements);

  const rows = useMemo(
    () =>
      products
        .flatMap((p) => p.variants.map((v) => ({ p, v })))
        .filter(({ p, v }) => {
          const a = available(v);
          return (
            (filter === 'all' ||
              (filter === 'out' ? a === 0 : a > 0 && a <= LOW_STOCK_THRESHOLD)) &&
            (!q || `${p.title} ${v.sku}`.toLowerCase().includes(q.toLowerCase()))
          );
        }),
    [products, filter, q]
  );

  const stockValue = products.reduce(
    (s, p) => s + p.variants.reduce((x, v) => x + v.stock * p.cost, 0),
    0
  );
  const lowCount = products
    .flatMap((p) => p.variants)
    .filter((v) => available(v) > 0 && available(v) <= LOW_STOCK_THRESHOLD).length;
  const outCount = products
    .flatMap((p) => p.variants)
    .filter((v) => available(v) === 0).length;

  const saveAdjust = () => {
    if (!adjust) return;
    const n = Number(delta);
    if (!n) return toast.error('Enter a quantity, e.g. 10 or -2');
    if (adjust.current + n < 0) return toast.error('Stock can’t go below zero');
    adjustStock(adjust.pid, adjust.vid, n);
    const p = products.find((x) => x.id === adjust.pid);
    const v = p?.variants.find((x) => x.id === adjust.vid);
    if (p && v) {
      setLedger((l) => [
        {
          id: `sm${Date.now()}`,
          at: new Date().toISOString(),
          sku: v.sku,
          product: p.title,
          change: n,
          stockAfter: adjust.current + n,
          reason,
          by: actor || 'Admin',
          ref: reference.trim(),
          note: note.trim() || undefined,
        },
        ...l,
      ]);
    }
    toast.success(`Stock ${n > 0 ? '+' : ''}${n} · ${reason}`);
    setAdjust(null);
    setDelta('');
    setReference('');
    setNote('');
  };

  const stats: [string, string, string][] = [
    ['Stock value (at cost)', formatBDT(stockValue), ''],
    ['Low stock variants', String(lowCount), 'text-amber-600 dark:text-amber-400'],
    ['Out of stock', String(outCount), 'text-red-600 dark:text-red-400'],
    ['Total variants', String(products.flatMap((p) => p.variants).length), ''],
  ];

  return (
    <ModuleGate module="inventory">
      <div className="w-full space-y-6">
        <PageHeader
          title="Inventory"
          description="Available = on hand − reserved in unpaid/unfulfilled orders. Overselling is blocked at checkout."
          actions={
            <>
              <GuardedButton
                module="inventory"
                action="update"
                variant="secondary"
                size="sm"
                onClick={() =>
                  toast.success('Physical count started')
                }
              >
                <ClipboardCheck className="h-4 w-4" aria-hidden /> Start count
              </GuardedButton>
              <GuardedButton
                module="inventory"
                action="export"
                variant="secondary"
                size="sm"
                onClick={() => toast.success('Inventory exported')}
              >
                <Download className="h-4 w-4" aria-hidden /> Export
              </GuardedButton>
            </>
          }
        />
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map(([l, v, c]) => (
            <div
              key={l}
              className="rounded-lg border border-line bg-surface px-4 py-3"
            >
              <p className="text-xs text-ink-muted">{l}</p>
              <p className={cn('mt-1 text-lg font-semibold tabular-nums', c)}>{v}</p>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-line bg-surface">
          <div className="flex flex-wrap items-end justify-between gap-3 px-4 pt-2">
            <Tabs
              value={tab}
              onChange={(val) => setTab(val as Tab)}
              tabs={[
                { value: 'stock', label: 'Stock levels' },
                { value: 'ledger', label: 'Movement ledger' },
              ]}
            />
          </div>

          {tab === 'stock' && (
            <>
              <div className="flex flex-wrap items-center gap-2 border-y border-line px-4 py-3">
                <div className="relative min-w-[200px] flex-1">
                  <Search
                    className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
                    aria-hidden
                  />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search product or SKU…"
                    aria-label="Search inventory"
                    className="h-9 w-full rounded-md border border-line-strong bg-surface pl-8 pr-3 text-sm text-ink focus:border-clay focus:outline-none"
                  />
                </div>
                <div
                  className="flex rounded-md border border-line p-0.5 text-xs"
                  role="group"
                  aria-label="Stock filter"
                >
                  {(['all', 'low', 'out'] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFilter(f)}
                      aria-pressed={filter === f}
                      className={cn(
                        'rounded px-2.5 py-1 cursor-pointer transition-colors',
                        filter === f
                          ? 'bg-ink text-canvas font-medium'
                          : 'text-ink-muted hover:text-ink'
                      )}
                    >
                      {f === 'all' ? 'All' : f === 'low' ? 'Low' : 'Out'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-sm">
                  <thead>
                    <tr className="border-b border-line text-left text-xs text-ink-muted">
                      <th className="px-4 py-2.5 font-medium">Variant</th>
                      <th className="px-3 py-2.5 font-medium">SKU</th>
                      <th className="px-3 py-2.5 text-right font-medium">On hand</th>
                      <th className="px-3 py-2.5 text-right font-medium">Reserved</th>
                      <th className="px-3 py-2.5 text-right font-medium">Available</th>
                      <th className="px-4 py-2.5">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {rows.slice(0, 40).map(({ p, v }) => {
                      const a = available(v);
                      return (
                        <tr key={v.id} className="hover:bg-subtle/40">
                          <td className="px-4 py-2.5">
                            <span className="flex items-center gap-3">
                              <img
                                src={p.images[0]}
                                alt=""
                                className="h-9 w-7 rounded object-cover"
                              />
                              <span>
                                <span className="block font-medium text-ink">
                                  {p.title}
                                </span>
                                <span className="text-xs text-ink-muted">
                                  {v.color} / {v.size}
                                </span>
                              </span>
                            </span>
                          </td>
                          <td className="px-3 py-2.5 font-mono text-xs text-ink">
                            {v.sku}
                          </td>
                          <td className="px-3 py-2.5 text-right tabular-nums text-ink">
                            {v.stock}
                          </td>
                          <td className="px-3 py-2.5 text-right tabular-nums text-ink-muted">
                            {v.reserved}
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            {p.preorder && a === 0 ? (
                              <Badge tone="info">Pre-order</Badge>
                            ) : (
                              <span
                                className={cn(
                                  'font-semibold tabular-nums',
                                  a === 0
                                    ? 'text-red-600 dark:text-red-400'
                                    : a <= LOW_STOCK_THRESHOLD
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-ink'
                                )}
                              >
                                {a}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <GuardedButton
                              module="inventory"
                              action="update"
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                setAdjust({
                                  pid: p.id,
                                  vid: v.id,
                                  label: `${p.title} · ${v.color} / ${v.size}`,
                                  current: v.stock,
                                })
                              }
                            >
                              Adjust
                            </GuardedButton>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="border-t border-line px-4 py-3 text-xs text-ink-muted">
                Showing {Math.min(40, rows.length)} of {rows.length} variants
              </p>
            </>
          )}

          {tab === 'ledger' && (
            <div className="overflow-x-auto border-t border-line">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs text-ink-muted">
                    <th className="px-4 py-2.5 font-medium">Time</th>
                    <th className="px-3 py-2.5 font-medium">Product / SKU</th>
                    <th className="px-3 py-2.5 text-right font-medium">Change</th>
                    <th className="px-3 py-2.5 text-right font-medium">New on hand</th>
                    <th className="px-3 py-2.5 font-medium">Reason & Details</th>
                    <th className="px-4 py-2.5 font-medium">By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {ledger.map((m) => (
                    <tr key={m.id} className="hover:bg-subtle/40">
                      <td className="px-4 py-2.5 text-ink-muted">
                        {formatDateTime(m.at)}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="font-medium text-ink">{m.product}</span>
                        <span className="block font-mono text-xs text-ink-muted">
                          {m.sku}
                        </span>
                      </td>
                      <td
                        className={cn(
                          'px-3 py-2.5 text-right font-semibold tabular-nums',
                          m.change > 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400'
                        )}
                      >
                        {m.change > 0 ? `+${m.change}` : m.change}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-ink font-medium">
                        {m.stockAfter !== undefined ? m.stockAfter : '—'}
                      </td>
                      <td className="px-3 py-2.5 text-ink">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-medium">{m.reason}</span>
                          {m.ref && (
                            <span className="rounded bg-subtle px-1.5 py-0.5 font-mono text-[11px] text-ink-muted">
                              {m.ref}
                            </span>
                          )}
                        </div>
                        {m.note && (
                          <p className="mt-0.5 text-xs text-ink-muted line-clamp-1">
                            {m.note}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-ink-muted">{m.by}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Modal
          open={!!adjust}
          onClose={() => setAdjust(null)}
          title="Adjust stock"
          description={adjust?.label}
          footer={
            <>
              <Button variant="ghost" onClick={() => setAdjust(null)}>
                Cancel
              </Button>
              <Button onClick={saveAdjust}>Save adjustment</Button>
            </>
          }
        >
          {adjust && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Adjust by"
                  inputMode="numeric"
                  value={delta}
                  onChange={(e) =>
                    setDelta(e.target.value.replace(/[^\d-]/g, ''))
                  }
                  placeholder="+10 or -2"
                  autoFocus
                />
                <div>
                  <p className="mb-1.5 text-sm font-medium text-ink">New on hand</p>
                  <p className="flex h-10 items-center text-sm tabular-nums text-ink">
                    {adjust.current} →{' '}
                    <b className="ml-1 text-ink">
                      {adjust.current + (Number(delta) || 0)}
                    </b>
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  options={reasons}
                />
                <Input
                  label="Reference (PO / Order #)"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. PO-0412"
                />
              </div>
              <Input
                label="Note / Remarks (Optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Packaging damage, audit count mismatch..."
              />
              <p className="text-xs text-ink-muted">
                Every adjustment is recorded to the movement ledger with full timestamp and user audit trail.
              </p>
            </div>
          )}
        </Modal>
      </div>
    </ModuleGate>
  );
}
