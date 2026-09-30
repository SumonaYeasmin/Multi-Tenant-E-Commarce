'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { RotateCcw, Image as ImageIcon } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { useAdmin } from '@/contexts/AdminContext';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { DataTable, type Column } from '@/components/dashboard/shared/DataTable';
import { GuardedButton } from '@/components/dashboard/shared/GuardedButton';
import { Tabs } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { Drawer } from '@/components/ui/Drawer';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { returnStatusMeta } from '@/utils/status';
import { formatBDT, formatDate, formatDateTime } from '@/utils/format';
import type { ReturnRequest } from '@/types/commerce';

type Tab = 'open' | 'requested' | 'in_progress' | 'closed';

export default function ReturnsPage() {
  const { returns, updateReturn } = useStore();
  const { actor } = useAdmin();
  const [tab, setTab] = useState<Tab>('open');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [deductShipping, setDeductShipping] = useState(false);
  const [restock, setRestock] = useState(true);
  const active = returns.find((r) => r.id === activeId);

  const filters: Record<Tab, (r: ReturnRequest) => boolean> = {
    open: (r) => !['refunded', 'exchanged', 'rejected'].includes(r.status),
    requested: (r) => r.status === 'requested',
    in_progress: (r) => ['approved', 'in_transit', 'received'].includes(r.status),
    closed: (r) => ['refunded', 'exchanged', 'rejected'].includes(r.status)
  };
  const rows = returns.filter(filters[tab]);

  const columns: Column<ReturnRequest>[] = [
    { key: 'id', header: 'Return', render: (r) => <span className="font-medium text-ink">{r.id}</span> },
    { key: 'order', header: 'Order', render: (r) => <span className="text-ink">{r.orderNumber}</span> },
    { key: 'cust', header: 'Customer', render: (r) => <span className="text-ink">{r.customerName}</span> },
    {
      key: 'item',
      header: 'Items',
      render: (r) => (
        <span className="flex items-center gap-2">
          <img src={r.items[0]?.image} alt="" className="h-9 w-7 rounded object-cover" />
          <span className="text-ink font-medium">{r.items[0]?.title}</span>
          {r.items.length > 1 && <span className="text-xs text-ink-muted">+{r.items.length - 1}</span>}
        </span>
      ),
      hideOnMobile: true
    },
    { key: 'reason', header: 'Reason', render: (r) => <span className="text-ink-muted">{r.reason}</span>, hideOnMobile: true },
    { key: 'res', header: 'Resolution', render: (r) => <span className="capitalize text-ink">{r.resolution.replace('_', ' ')}</span> },
    { key: 'amt', header: 'Value', align: 'right', render: (r) => <span className="tabular-nums font-medium text-ink">{formatBDT(r.amount)}</span> },
    { key: 'status', header: 'Status', render: (r) => <Badge tone={returnStatusMeta[r.status].tone} dot>{returnStatusMeta[r.status].label}</Badge> }
  ];

  const refundAmount = active ? active.amount - (deductShipping ? 70 : 0) : 0;
  const act = (status: ReturnRequest['status'], msg: string, withNote?: boolean) => {
    if (!active) return;
    updateReturn(active.id, status, actor, withNote ? note || undefined : undefined);
    setNote('');
    toast.success(msg);
  };

  const stats: [string, string | number][] = [
    ['Awaiting review', returns.filter((r) => r.status === 'requested').length],
    ['In transit / inspect', returns.filter((r) => ['approved', 'in_transit', 'received'].includes(r.status)).length],
    ['Return rate · 30d', '3.8%'],
    ['Refunded · 30d', formatBDT(86400)]
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Returns & refunds" description="Review requests, schedule pickups, inspect items and issue refunds or exchanges." />
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        {stats.map(([l, v]) => (
          <div key={l} className="rounded-lg border border-line bg-surface px-4 py-3">
            <p className="text-xs text-ink-muted">{l}</p>
            <p className="mt-1 text-lg font-semibold text-ink tabular-nums">{v}</p>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-line bg-surface overflow-hidden">
        <div className="px-4 pt-2">
          <Tabs
            value={tab}
            onChange={(t) => setTab(t as Tab)}
            tabs={[
              { value: 'open', label: 'Open', count: returns.filter(filters.open).length },
              { value: 'requested', label: 'Awaiting review', count: returns.filter(filters.requested).length },
              { value: 'in_progress', label: 'In progress', count: returns.filter(filters.in_progress).length },
              { value: 'closed', label: 'Closed' }
            ]}
          />
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          onRowClick={(r) => setActiveId(r.id)}
          empty={<EmptyState icon={RotateCcw} title="No returns in this view" description="New customer return requests will show here." />}
        />
      </div>

      <Drawer
        open={!!active}
        onClose={() => setActiveId(null)}
        width="max-w-lg"
        title={active ? `${active.id} · ${active.orderNumber}` : ''}
        subtitle={active && `Requested by ${active.customerName} on ${formatDate(active.createdAt)}`}
      >
        {active && (
          <div className="space-y-5 p-5 text-[13px]">
            <div>
              <p className="text-xs font-medium text-ink-muted">Requested resolution</p>
              <p className="mt-1 text-base font-semibold capitalize text-ink">
                {active.resolution.replace('_', ' ')} · {formatBDT(active.amount)}
              </p>
              <p className="mt-1 text-ink-muted">Reason: <b className="text-ink">{active.reason}</b></p>
              {active.details && <p className="mt-1 italic text-ink-soft">“{active.details}”</p>}
            </div>

            <div className="border-t border-line pt-4">
              <p className="mb-2 text-xs font-medium text-ink-muted">Items ({active.items.length})</p>
              <div className="space-y-2">
                {active.items.map((i, idx) => (
                  <div key={idx} className="flex items-center gap-3 rounded-md border border-line p-2.5">
                    <img src={i.image} alt="" className="h-12 w-9 rounded object-cover" />
                    <div className="flex-1">
                      <p className="font-medium text-ink">{i.title}</p>
                      <p className="text-xs text-ink-muted">
                        {i.color} / {i.size} · Qty {i.qty}
                      </p>
                    </div>
                    <span className="tabular-nums font-medium text-ink">{formatBDT(i.price)}</span>
                  </div>
                ))}
              </div>
            </div>

            {active.photos > 0 && (
              <div className="border-t border-line pt-4">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-ink-muted">
                  <ImageIcon className="h-4 w-4" /> Customer photos ({active.photos})
                </p>
                <div className="flex gap-2">
                  {Array.from({ length: active.photos }).map((_, i) => (
                    <div key={i} className="flex h-16 w-16 items-center justify-center rounded-md border border-line bg-canvas text-xs text-ink-muted">
                      Photo {i + 1}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-line pt-4">
              <p className="mb-2 text-xs font-medium text-ink-muted">Action</p>
              {active.status === 'requested' && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <GuardedButton
                      module="returns"
                      action="update"
                      fullWidth
                      onClick={() => act('approved', 'Return approved — pickup booked with Pathao')}
                    >
                      Approve & schedule pickup
                    </GuardedButton>
                    <GuardedButton
                      module="returns"
                      action="update"
                      fullWidth
                      variant="danger"
                      onClick={() => act('rejected', 'Return request rejected')}
                    >
                      Reject
                    </GuardedButton>
                  </div>
                </div>
              )}

              {active.status === 'in_transit' && (
                <GuardedButton
                  module="returns"
                  action="update"
                  fullWidth
                  onClick={() => act('received', 'Marked as received — ready for inspection')}
                >
                  Mark as received at warehouse
                </GuardedButton>
              )}

              {active.status === 'received' && (
                <div className="space-y-3">
                  <Textarea
                    label="Inspection notes"
                    rows={2}
                    placeholder="Condition, tag intact, fabric checks…"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  <Checkbox checked={restock} onChange={setRestock} label="Restock returned items to available inventory" />
                  <Checkbox checked={deductShipping} onChange={setDeductShipping} label="Deduct return pickup fee (৳70) from refund" />
                  <div className="flex gap-2 pt-2">
                    <GuardedButton
                      module="returns"
                      action="refund"
                      fullWidth
                      onClick={() =>
                        act(
                          'refunded',
                          `Refund of ${formatBDT(refundAmount)} issued (${active.resolution.replace('_', ' ')})`,
                          true
                        )
                      }
                    >
                      Issue {active.resolution === 'store_credit' ? 'store credit' : 'refund'} · {formatBDT(refundAmount)}
                    </GuardedButton>
                    <Button variant="danger" onClick={() => act('rejected', 'Item failed inspection — return rejected', true)}>
                      Fail inspection
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-line pt-4">
              <p className="mb-2 text-xs font-medium text-ink-muted">Timeline</p>
              <ol className="relative border-l border-line pl-4 space-y-3 text-xs">
                {active.timeline.map((e, idx) => (
                  <li key={idx} className="relative">
                    <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-surface bg-ink" />
                    <p className="font-medium text-ink">{e.label}</p>
                    <p className="text-[11px] text-ink-muted">
                      {formatDateTime(e.at)} {e.by && `· ${e.by}`}
                    </p>
                    {e.note && <p className="mt-0.5 text-ink-soft italic">“{e.note}”</p>}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
