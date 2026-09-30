'use client';

import React, { useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { Download, Search, Users, Mail, Phone } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { useAdmin } from '@/contexts/AdminContext';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { DataTable, type Column } from '@/components/dashboard/shared/DataTable';
import { GuardedButton } from '@/components/dashboard/shared/GuardedButton';
import { ModuleGate } from '@/components/dashboard/shared/ModuleGate';
import { Badge } from '@/components/ui/Badge';
import { Drawer } from '@/components/ui/Drawer';
import { Textarea } from '@/components/ui/Textarea';
import { EmptyState } from '@/components/ui/EmptyState';
import { orderStatusMeta } from '@/utils/status';
import { formatBDT, formatDate } from '@/utils/format';
import { cn } from '@/utils/cn';
import type { Customer } from '@/types/commerce';

const segments = ['All', 'VIP', 'Loyal', 'New', 'At risk', 'Wholesale'] as const;
const segTone = {
  VIP: 'clay',
  Loyal: 'success',
  New: 'info',
  'At risk': 'warning',
  Wholesale: 'neutral',
} as const;

function CustomersContent() {
  const { customers, orders, toggleCustomerStatus } = useStore();
  const { can } = useAdmin();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState('');
  const [seg, setSeg] = useState<(typeof segments)[number]>('All');

  const activeId = searchParams.get('c');
  const active = customers.find((c) => c.id === activeId);

  const setCustomerParam = (id?: string) => {
    const p = new URLSearchParams(searchParams.toString());
    if (id) {
      p.set('c', id);
    } else {
      p.delete('c');
    }
    router.push(`${pathname}?${p.toString()}`);
  };

  const rows = useMemo(
    () =>
      customers.filter(
        (c) =>
          (seg === 'All' || c.segment === seg) &&
          (!q ||
            `${c.name} ${c.email} ${c.phone}`
              .toLowerCase()
              .includes(q.toLowerCase()))
      ),
    [customers, seg, q]
  );
  const custOrders = active ? orders.filter((o) => o.customerId === active.id) : [];

  const columns: Column<Customer>[] = [
    {
      key: 'n',
      header: 'Customer',
      render: (c) => (
        <span className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-subtle text-xs font-semibold text-ink">
            {c.name
              .split(' ')
              .map((x) => x[0])
              .slice(0, 2)
              .join('')}
          </span>
          <span>
            <span className="block font-medium text-ink">{c.name}</span>
            <span className="text-xs text-ink-muted">{c.email}</span>
          </span>
        </span>
      ),
    },
    {
      key: 'seg',
      header: 'Segment',
      render: (c) => (
        <Badge tone={segTone[c.segment as keyof typeof segTone] || 'neutral'}>
          {c.segment}
        </Badge>
      ),
    },
    {
      key: 'd',
      header: 'Location',
      render: (c) => <span className="text-ink-muted">{c.district}</span>,
      hideOnMobile: true,
    },
    {
      key: 'o',
      header: 'Orders',
      align: 'right',
      render: (c) => <span className="tabular-nums text-ink">{c.orders}</span>,
    },
    {
      key: 's',
      header: 'Spent',
      align: 'right',
      render: (c) => (
        <span className="tabular-nums font-medium text-ink">
          {formatBDT(c.spent)}
        </span>
      ),
    },
    {
      key: 'st',
      header: 'Status',
      render: (c) => (
        <Badge tone={c.status === 'active' ? 'success' : 'neutral'} dot>
          {c.status === 'active' ? 'Active' : 'Inactive'}
        </Badge>
      ),
      hideOnMobile: true,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Customers"
        description={`${customers.length} customers · ${
          customers.filter((c) => c.marketingConsent).length
        } subscribed to marketing`}
        actions={
          <GuardedButton
            module="customers"
            action="export"
            variant="secondary"
            size="sm"
            onClick={() => toast.success(`Exported ${rows.length} customers`)}
          >
            <Download className="h-4 w-4" aria-hidden /> Export
          </GuardedButton>
        }
      />
      <div className="rounded-lg border border-line bg-surface">
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
          <div className="relative min-w-[200px] flex-1">
            <Search
              className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
              aria-hidden
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, email or phone…"
              aria-label="Search customers"
              className="h-9 w-full rounded-md border border-line-strong bg-surface pl-8 pr-3 text-[13px] text-ink focus:border-clay focus:outline-none"
            />
          </div>
          <div
            className="flex flex-wrap gap-1"
            role="group"
            aria-label="Segment"
          >
            {segments.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSeg(s)}
                aria-pressed={seg === s}
                className={cn(
                  'rounded-full px-3 py-1 text-xs transition-colors cursor-pointer',
                  seg === s
                    ? 'bg-ink text-canvas font-medium'
                    : 'bg-subtle text-ink-soft hover:text-ink'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(c) => c.id}
          onRowClick={(c) => setCustomerParam(c.id)}
          empty={
            <EmptyState
              icon={Users}
              title="No customers match"
              description="Try another segment or search."
            />
          }
        />
      </div>

      <Drawer
        open={!!active}
        onClose={() => setCustomerParam(undefined)}
        width="max-w-lg"
        title={active?.name ?? ''}
        subtitle={
          active && (
            <span className="flex items-center gap-2">
              <Badge
                tone={segTone[active.segment as keyof typeof segTone] || 'neutral'}
              >
                {active.segment}
              </Badge>{' '}
              Customer since {formatDate(active.joined)}
            </span>
          )
        }
        footer={
          active && (
            <div className="flex justify-end gap-2">
              <GuardedButton
                module="customers"
                action="update"
                variant="secondary"
                onClick={() => {
                  toggleCustomerStatus(active.id);
                  toast.success(
                    active.status === 'active'
                      ? 'Account deactivated'
                      : 'Account reactivated'
                  );
                }}
              >
                {active.status === 'active'
                  ? 'Deactivate account'
                  : 'Reactivate account'}
              </GuardedButton>
            </div>
          )
        }
      >
        {active && (
          <div className="space-y-6 px-5 py-5 text-[13px]">
            <dl className="grid grid-cols-3 gap-3 rounded-md bg-canvas p-4 border border-line">
              <div>
                <dt className="text-xs text-ink-muted">Lifetime value</dt>
                <dd className="text-base font-semibold text-ink">
                  {formatBDT(active.spent)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted">Orders</dt>
                <dd className="text-base font-semibold text-ink">
                  {active.orders}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted">AOV</dt>
                <dd className="text-base font-semibold text-ink">
                  {formatBDT(Math.round(active.spent / Math.max(1, active.orders)))}
                </dd>
              </div>
            </dl>
            <div className="space-y-1.5">
              <p className="flex items-center gap-2 text-ink">
                <Mail className="h-3.5 w-3.5 text-ink-muted" aria-hidden />
                {active.email}
              </p>
              <p className="flex items-center gap-2 text-ink">
                <Phone className="h-3.5 w-3.5 text-ink-muted" aria-hidden />
                {active.phone} · {active.district}
              </p>
              <p className="text-ink-muted">
                Marketing:{' '}
                {active.marketingConsent
                  ? 'Subscribed (email + SMS)'
                  : 'Not subscribed'}{' '}
                · Store credit {formatBDT(active.storeCredit)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-ink-muted">Tags</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {active.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-subtle px-2 py-0.5 text-xs text-ink-soft"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-ink-muted">Recent orders</p>
              {custOrders.length === 0 ? (
                <p className="mt-2 text-ink-muted">No orders in this demo dataset.</p>
              ) : (
                <ul className="mt-2 divide-y divide-line rounded-md border border-line">
                  {custOrders.slice(0, 5).map((o) => (
                    <li key={o.id}>
                      {can('orders') ? (
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="flex items-center justify-between px-3 py-2 hover:bg-canvas transition-colors"
                        >
                          <span className="font-medium text-ink">
                            {o.number} · {formatDate(o.createdAt)}
                          </span>
                          <span className="flex items-center gap-2">
                            <Badge tone={orderStatusMeta[o.status].tone}>
                              {orderStatusMeta[o.status].label}
                            </Badge>
                            <span className="font-semibold text-ink">
                              {formatBDT(o.total)}
                            </span>
                          </span>
                        </Link>
                      ) : (
                        <span className="block px-3 py-2 text-ink">{o.number}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Textarea
              label="Internal note"
              rows={2}
              placeholder="Only visible to staff"
            />
          </div>
        )}
      </Drawer>
    </div>
  );
}

export default function AdminCustomersPage() {
  return (
    <ModuleGate module="customers">
      <Suspense fallback={<div className="p-8 text-sm text-ink-muted">Loading customers...</div>}>
        <CustomersContent />
      </Suspense>
    </ModuleGate>
  );
}
