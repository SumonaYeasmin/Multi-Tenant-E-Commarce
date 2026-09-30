'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { CheckCircle2, AlertCircle, Download, RefreshCw } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { Panel } from '@/components/dashboard/shared/Panel';
import { DataTable, type Column } from '@/components/dashboard/shared/DataTable';
import { GuardedButton } from '@/components/dashboard/shared/GuardedButton';
import { Badge } from '@/components/ui/Badge';
import { PaymentMark } from '@/components/ui/PaymentMark';
import { paymentMethodLabel, paymentStatusMeta } from '@/utils/status';
import { formatBDT, formatDateTime } from '@/utils/format';
import type { PaymentMethod, PaymentStatus } from '@/types/commerce';

interface Txn {
  id: string;
  orderId: string;
  orderNumber: string;
  customer: string;
  method: PaymentMethod;
  ref: string;
  amount: number;
  status: PaymentStatus;
  at: string;
  reconciled: boolean;
}

export default function PaymentsPage() {
  const { orders } = useStore();
  const [method, setMethod] = useState<'all' | PaymentMethod>('all');
  const [syncing, setSyncing] = useState(false);

  const txns = useMemo<Txn[]>(() => {
    const list: Txn[] = [];
    orders.forEach((o) => {
      o.attempts.forEach((a, i) =>
        list.push({
          id: a.id,
          orderId: o.id,
          orderNumber: o.number,
          customer: o.customerName,
          method: a.method,
          ref: a.ref,
          amount: a.amount,
          status: a.status,
          at: a.at,
          reconciled: a.status !== 'paid' || i % 5 !== 3
        })
      );
      if (o.paymentMethod === 'cod' && o.codCollected)
        list.push({
          id: `cod-${o.id}`,
          orderId: o.id,
          orderNumber: o.number,
          customer: o.customerName,
          method: 'cod',
          ref: `${o.courier ?? 'Courier'} remittance`,
          amount: o.total,
          status: 'paid',
          at: o.timeline[0]?.at || o.createdAt,
          reconciled: o.number !== 'TN-10491'
        });
      if (o.refunded > 0)
        list.push({
          id: `rf-${o.id}`,
          orderId: o.id,
          orderNumber: o.number,
          customer: o.customerName,
          method: o.paymentMethod,
          ref: `RFND-${o.number.slice(3)}`,
          amount: -o.refunded,
          status: 'refunded',
          at: o.timeline[0]?.at || o.createdAt,
          reconciled: true
        });
    });
    return list.sort((a, b) => b.at.localeCompare(a.at));
  }, [orders]);

  const rows = txns.filter((t) => method === 'all' || t.method === method);
  const gateways: PaymentMethod[] = ['bkash', 'nagad', 'sslcommerz', 'stripe', 'cod'];
  const summary = gateways.map((g) => {
    const t = txns.filter((x) => x.method === g);
    const paid = t.filter((x) => x.status === 'paid');
    const failed = t.filter((x) => x.status === 'failed').length;
    return {
      g,
      volume: paid.reduce((s, x) => s + x.amount, 0),
      count: paid.length,
      successRate: t.length ? Math.round((paid.length / Math.max(1, paid.length + failed)) * 100) : 100,
      pending:
        g === 'cod'
          ? orders
              .filter((o) => o.paymentMethod === 'cod' && !o.codCollected && !['cancelled', 'failed'].includes(o.status))
              .reduce((s, o) => s + o.total, 0)
          : 0
    };
  });
  const unreconciled = txns.filter((t) => !t.reconciled).length;

  const columns: Column<Txn>[] = [
    { key: 'at', header: 'Date', render: (t) => <span className="text-ink-muted">{formatDateTime(t.at)}</span> },
    {
      key: 'order',
      header: 'Order',
      render: (t) => (
        <Link href={`/admin/orders/${t.orderId}`} className="font-medium text-ink hover:underline">
          {t.orderNumber}
        </Link>
      )
    },
    { key: 'cust', header: 'Customer', render: (t) => <span className="text-ink">{t.customer}</span>, hideOnMobile: true },
    {
      key: 'gw',
      header: 'Gateway',
      render: (t) => (
        <span className="flex items-center gap-2">
          <PaymentMark method={t.method} />
          <span className="text-ink">{paymentMethodLabel[t.method]}</span>
        </span>
      )
    },
    {
      key: 'ref',
      header: 'Transaction ID',
      render: (t) => <span className="font-mono text-xs text-ink-muted">{t.ref}</span>,
      hideOnMobile: true
    },
    {
      key: 'amt',
      header: 'Amount',
      align: 'right',
      render: (t) => (
        <span className={t.amount < 0 ? 'text-danger font-medium tabular-nums' : 'font-medium text-ink tabular-nums'}>
          {formatBDT(t.amount)}
        </span>
      )
    },
    { key: 'status', header: 'Status', render: (t) => <Badge tone={paymentStatusMeta[t.status].tone}>{t.status}</Badge> },
    {
      key: 'rec',
      header: 'Settlement',
      render: (t) =>
        t.reconciled ? (
          <span className="flex items-center gap-1 text-xs text-success">
            <CheckCircle2 className="h-3.5 w-3.5" /> Reconciled
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-warning">
            <AlertCircle className="h-3.5 w-3.5" /> Pending bank credit
          </span>
        )
    }
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Payments & payouts"
        description="Transactions across all connected gateways. Automatic daily settlement via BEFTN / RTGS."
        actions={
          <>
            <GuardedButton
              module="payments"
              action="export"
              variant="secondary"
              size="sm"
              onClick={() => toast.success('Payment reconciliation report downloaded')}
            >
              <Download className="h-4 w-4" aria-hidden /> Export
            </GuardedButton>
            <GuardedButton
              module="payments"
              action="update"
              size="sm"
              onClick={async () => {
                setSyncing(true);
                await new Promise((r) => setTimeout(r, 900));
                setSyncing(false);
                toast.success('All gateway webhooks synced: 0 missing events');
              }}
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} aria-hidden /> Sync gateways
            </GuardedButton>
          </>
        }
      />

      {unreconciled > 0 && (
        <div className="mb-6 flex items-center justify-between rounded-lg border border-warning/40 bg-warning-soft px-4 py-3 text-xs text-warning">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>
              <b>{unreconciled} transactions</b> awaiting bank credit settlement. Expected in account by tomorrow 4 PM.
            </span>
          </span>
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-5">
        {summary.map((s) => (
          <div key={s.g} className="rounded-lg border border-line bg-surface p-3.5">
            <div className="flex items-center justify-between">
              <PaymentMark method={s.g} />
              <span className="text-[11px] text-ink-muted">{s.count} txn</span>
            </div>
            <p className="mt-2 text-base font-semibold text-ink tabular-nums">{formatBDT(s.volume)}</p>
            <p className="text-[11px] text-ink-muted">
              {s.g === 'cod' ? `৳${(s.pending / 1000).toFixed(0)}k in courier hands` : `${s.successRate}% success rate`}
            </p>
          </div>
        ))}
      </div>

      <Panel flush>
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <div className="flex flex-wrap gap-1">
            {(['all', ...gateways] as (PaymentMethod | 'all')[]).map((g) => (
              <button
                key={g}
                onClick={() => setMethod(g)}
                className={`rounded-md px-2.5 py-1 text-xs cursor-pointer capitalize transition-colors ${
                  method === g ? 'bg-ink text-canvas font-medium' : 'text-ink-soft hover:bg-subtle'
                }`}
              >
                {g === 'all' ? 'All gateways' : paymentMethodLabel[g]}
              </button>
            ))}
          </div>
          <span className="text-xs text-ink-muted tabular-nums">{rows.length} records</span>
        </div>
        <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} />
      </Panel>
    </div>
  );
}
