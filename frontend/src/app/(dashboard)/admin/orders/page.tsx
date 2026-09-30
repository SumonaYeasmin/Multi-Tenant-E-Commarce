'use client';

import React, { useMemo, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Download, Plus, Search, ShoppingCart } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { useAdmin } from '@/contexts/AdminContext';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { DataTable, type Column } from '@/components/dashboard/shared/DataTable';
import { BulkBar } from '@/components/dashboard/shared/BulkBar';
import { GuardedButton } from '@/components/dashboard/shared/GuardedButton';
import { Tabs } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { PaymentMark } from '@/components/ui/PaymentMark';
import { EmptyState } from '@/components/ui/EmptyState';
import { fulfillmentMeta, orderStatusMeta, paymentStatusMeta } from '@/utils/status';
import { formatBDT, formatDateTime } from '@/utils/format';
import type { Order, OrderStatus, PaymentMethod } from '@/types/commerce';

type Tab = 'all' | 'unfulfilled' | 'unpaid' | 'packed' | 'shipped' | 'returns' | 'closed';

const tabFilter: Record<Tab, (o: Order) => boolean> = {
  all: () => true,
  unfulfilled: (o) => ['confirmed', 'processing'].includes(o.status),
  unpaid: (o) => o.status === 'pending_payment' || o.paymentStatus === 'failed' || o.paymentStatus === 'partially_paid',
  packed: (o) => o.status === 'packed',
  shipped: (o) => ['shipped', 'out_for_delivery'].includes(o.status),
  returns: (o) => ['return_requested', 'returned', 'refunded', 'partially_refunded'].includes(o.status),
  closed: (o) => ['delivered', 'cancelled', 'failed'].includes(o.status),
};

function OrdersContent() {
  const { orders, setOrderStatus } = useStore();
  const { actor } = useAdmin();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = (searchParams.get('tab') as Tab) ?? 'all';
  const [q, setQ] = useState('');
  const [method, setMethod] = useState<'all' | PaymentMethod>('all');
  const [channel, setChannel] = useState<'all' | 'online' | 'manual'>('all');
  const [selected, setSelected] = useState<string[]>([]);

  const rows = useMemo(
    () =>
      orders.filter(
        (o) =>
          (tabFilter[tab] ?? tabFilter.all)(o) &&
          (method === 'all' || o.paymentMethod === method) &&
          (channel === 'all' || o.channel === channel) &&
          (!q || `${o.number} ${o.customerName} ${o.phone} ${o.email}`.toLowerCase().includes(q.toLowerCase()))
      ),
    [orders, tab, method, channel, q]
  );

  const bulkStatus = (status: OrderStatus, label: string) => {
    selected.forEach((id) => setOrderStatus(id, status, { label, by: actor }));
    toast.success(`${selected.length} orders marked as ${orderStatusMeta[status].label.toLowerCase()}`);
    setSelected([]);
  };

  const columns: Column<Order>[] = [
    { key: 'num', header: 'Order', render: (o) => <span className="font-medium text-ink">{o.number}</span> },
    {
      key: 'date',
      header: 'Date',
      render: (o) => <span className="text-ink-muted">{formatDateTime(o.createdAt)}</span>,
      hideOnMobile: true,
    },
    {
      key: 'cust',
      header: 'Customer',
      render: (o) => (
        <div>
          <p className="text-ink font-medium">{o.customerName}</p>
          <p className="text-xs text-ink-muted">{o.shippingAddress?.district}</p>
        </div>
      ),
    },
    {
      key: 'channel',
      header: 'Channel',
      render: (o) => <span className="text-ink-muted">{o.channel === 'manual' ? 'Admin' : 'Online store'}</span>,
      hideOnMobile: true,
    },
    {
      key: 'total',
      header: 'Total',
      align: 'right',
      render: (o) => <span className="tabular-nums font-medium text-ink">{formatBDT(o.total)}</span>,
    },
    {
      key: 'pay',
      header: 'Payment',
      render: (o) => (
        <span className="flex items-center gap-2">
          <PaymentMark method={o.paymentMethod} />
          <Badge tone={paymentStatusMeta[o.paymentStatus].tone}>{paymentStatusMeta[o.paymentStatus].label}</Badge>
        </span>
      ),
    },
    {
      key: 'ful',
      header: 'Fulfillment',
      render: (o) => (
        <Badge tone={fulfillmentMeta[o.fulfillmentStatus].tone} dot>
          {fulfillmentMeta[o.fulfillmentStatus].label}
        </Badge>
      ),
      hideOnMobile: true,
    },
    {
      key: 'status',
      header: 'Status',
      render: (o) => <Badge tone={orderStatusMeta[o.status].tone}>{orderStatusMeta[o.status].label}</Badge>,
    },
  ];

  const count = (t: Tab) => orders.filter(tabFilter[t]).length;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Orders"
        description={`${orders.length} orders · ${count('unfulfilled')} awaiting fulfillment`}
        actions={
          <>
            <GuardedButton
              module="orders"
              action="export"
              variant="secondary"
              size="sm"
              onClick={() => toast.success(`Exported ${rows.length} orders to orders.csv`)}
            >
              <Download className="h-4 w-4" aria-hidden /> Export
            </GuardedButton>
            <GuardedButton module="orders" action="create" size="sm" to="/admin/orders/drafts">
              <Plus className="h-4 w-4" aria-hidden /> Create order
            </GuardedButton>
          </>
        }
      />

      <div className="rounded-lg border border-line bg-surface overflow-hidden">
        <div className="px-4 pt-2">
          <Tabs
            value={tab}
            onChange={(t) => {
              const url = t === 'all' ? '/admin/orders' : `/admin/orders?tab=${t}`;
              router.push(url);
              setSelected([]);
            }}
            tabs={[
              { value: 'all', label: 'All' },
              { value: 'unfulfilled', label: 'Unfulfilled', count: count('unfulfilled') },
              { value: 'unpaid', label: 'Unpaid', count: count('unpaid') },
              { value: 'packed', label: 'Ready to ship', count: count('packed') },
              { value: 'shipped', label: 'In transit' },
              { value: 'returns', label: 'Returns' },
              { value: 'closed', label: 'Closed' },
            ]}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by order #, customer, phone or email…"
              aria-label="Search orders"
              className="h-9 w-full rounded-md border border-line bg-canvas pl-8 pr-3 text-[13px] text-ink placeholder:text-ink-muted focus:border-clay focus:outline-none"
            />
          </div>
          <select
            aria-label="Payment method filter"
            value={method}
            onChange={(e) => setMethod(e.target.value as typeof method)}
            className="h-9 rounded-md border border-line bg-surface px-2.5 text-[13px] text-ink focus:outline-none"
          >
            <option value="all">All payment methods</option>
            <option value="bkash">bKash</option>
            <option value="nagad">Nagad</option>
            <option value="sslcommerz">SSLCommerz</option>
            <option value="stripe">Stripe</option>
            <option value="cod">Cash on delivery</option>
          </select>
          <select
            aria-label="Channel filter"
            value={channel}
            onChange={(e) => setChannel(e.target.value as typeof channel)}
            className="h-9 rounded-md border border-line bg-surface px-2.5 text-[13px] text-ink focus:outline-none"
          >
            <option value="all">All channels</option>
            <option value="online">Online store</option>
            <option value="manual">Admin / Draft</option>
          </select>
        </div>

        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(o) => o.id}
          onRowClick={(o) => router.push(`/admin/orders/${o.id}`)}
          selectable
          selected={selected}
          onSelectedChange={setSelected}
          empty={
            <EmptyState
              icon={ShoppingCart}
              title="No orders found"
              description="Try adjusting your filters or search term."
            />
          }
          mobileCard={(o) => (
            <div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-ink">{o.number}</span>
                <span className="tabular-nums font-semibold text-ink">{formatBDT(o.total)}</span>
              </div>
              <p className="mt-0.5 text-xs text-ink-muted">
                {o.customerName} · {o.shippingAddress?.district}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Badge tone={orderStatusMeta[o.status].tone}>{orderStatusMeta[o.status].label}</Badge>
                <Badge tone={paymentStatusMeta[o.paymentStatus].tone}>{paymentStatusMeta[o.paymentStatus].label}</Badge>
              </div>
            </div>
          )}
        />
      </div>

      <BulkBar count={selected.length} onClear={() => setSelected([])}>
        <button onClick={() => bulkStatus('processing', 'Bulk processing')}>Mark as processing</button>
        <button onClick={() => bulkStatus('packed', 'Bulk packed')}>Mark as packed</button>
        <button onClick={() => bulkStatus('shipped', 'Bulk shipped')}>Mark as shipped</button>
      </BulkBar>
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-ink-muted">Loading orders...</div>}>
      <OrdersContent />
    </Suspense>
  );
}
