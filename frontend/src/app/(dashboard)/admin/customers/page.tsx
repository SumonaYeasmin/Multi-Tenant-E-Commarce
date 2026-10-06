'use client';

import React, { useMemo, useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import {
  Download,
  Search,
  Users,
  Mail,
  Phone,
  CreditCard,
  ShoppingBag,
  Calendar,
  CheckCircle2,
  XCircle,
  Tag,
  RefreshCw,
} from 'lucide-react';
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
import { customerService } from '@/services/customer-service';
import { orderStatusMeta } from '@/utils/status';
import { formatBDT, formatDate } from '@/utils/format';
import { cn } from '@/utils/cn';
import type { Customer } from '@/types/commerce';

const statusFilters = ['All', 'Active', 'Inactive'] as const;

function CustomersContent() {
  const { customers: localCustomers, orders, toggleCustomerStatus } = useStore();
  const { can } = useAdmin();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState<(typeof statusFilters)[number]>('All');
  const [customerList, setCustomerList] = useState<Customer[]>(localCustomers);
  const [loading, setLoading] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Sync / fetch customers from backend API
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await customerService.getOwnerCustomers({ search: q });
      if (res?.data?.customers && res.data.customers.length > 0) {
        setCustomerList(res.data.customers);
      } else {
        setCustomerList(localCustomers);
      }
    } catch {
      setCustomerList(localCustomers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const activeId = searchParams.get('c');
  const active = customerList.find((c) => c.id === activeId) || localCustomers.find((c) => c.id === activeId);

  const setCustomerParam = (id?: string) => {
    const p = new URLSearchParams(searchParams.toString());
    if (id) {
      p.set('c', id);
    } else {
      p.delete('c');
    }
    router.push(`${pathname}?${p.toString()}`);
  };

  // Filter rows by search and status
  const rows = useMemo(() => {
    return customerList.filter((c) => {
      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Active' && c.status === 'active') ||
        (statusFilter === 'Inactive' && c.status === 'inactive');

      const matchesQuery =
        !q ||
        `${c.name} ${c.email} ${c.phone} ${c.tags.join(' ')}`
          .toLowerCase()
          .includes(q.toLowerCase());

      return matchesStatus && matchesQuery;
    });
  }, [customerList, statusFilter, q]);

  const custOrders = active ? orders.filter((o) => o.customerId === active.id) : [];

  const handleToggleStatus = async (customer: Customer) => {
    try {
      setIsUpdatingStatus(true);
      const nextActiveState = customer.status !== 'active';
      await customerService.updateCustomerStatus(customer.id, { isActive: nextActiveState });
      toggleCustomerStatus(customer.id);

      setCustomerList((prev) =>
        prev.map((c) =>
          c.id === customer.id
            ? { ...c, status: nextActiveState ? 'active' : 'inactive' }
            : c,
        ),
      );

      toast.success(
        nextActiveState
          ? `Customer ${customer.name} reactivated successfully`
          : `Customer ${customer.name} deactivated / banned successfully`,
      );
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update customer status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const columns: Column<Customer>[] = [
    {
      key: 'n',
      header: 'Customer',
      render: (c) => (
        <span className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-subtle text-xs font-semibold text-ink shadow-xs">
            {c.name
              .split(' ')
              .map((x) => x[0])
              .slice(0, 2)
              .join('')
              .toUpperCase()}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-medium text-ink">{c.name}</span>
            <span className="block truncate text-xs text-ink-muted">{c.email}</span>
          </span>
        </span>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (c) => (
        <span className="text-xs text-ink-muted">
          {c.phone ? (
            <span className="flex items-center gap-1 font-mono text-ink-soft">
              <Phone className="h-3 w-3 text-ink-muted" aria-hidden />
              {c.phone}
            </span>
          ) : (
            '—'
          )}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      key: 'o',
      header: 'Orders',
      align: 'right',
      render: (c) => (
        <span className="flex items-center justify-end gap-1.5 tabular-nums text-ink">
          <ShoppingBag className="h-3.5 w-3.5 text-ink-muted" aria-hidden />
          <span className="font-medium">{c.orders}</span>
        </span>
      ),
    },
    {
      key: 's',
      header: 'Total Spent',
      align: 'right',
      render: (c) => (
        <span className="tabular-nums font-semibold text-ink">
          {formatBDT(c.spent)}
        </span>
      ),
    },
    {
      key: 'credit',
      header: 'Store Credit',
      align: 'right',
      render: (c) => (
        <span className="tabular-nums text-xs font-medium text-ink-soft">
          {c.storeCredit > 0 ? (
            <span className="text-success font-semibold">{formatBDT(c.storeCredit)}</span>
          ) : (
            '৳0'
          )}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      key: 'joined',
      header: 'Joined',
      render: (c) => (
        <span className="text-xs text-ink-muted">
          {formatDate(c.joined)}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      key: 'st',
      header: 'Status',
      render: (c) => (
        <Badge tone={c.status === 'active' ? 'success' : 'neutral'} dot>
          {c.status === 'active' ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title="Customers"
        description={`${customerList.length} total customers · ${
          customerList.filter((c) => c.status === 'active').length
        } active accounts · ${
          customerList.filter((c) => c.marketingConsent).length
        } subscribed to marketing`}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchCustomers}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-muted hover:text-ink hover:bg-subtle transition-colors cursor-pointer"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} aria-hidden />
              Refresh
            </button>
            <GuardedButton
              module="customers"
              action="export"
              variant="secondary"
              size="sm"
              onClick={() => toast.success(`Exported ${rows.length} customers list`)}
            >
              <Download className="h-4 w-4" aria-hidden /> Export
            </GuardedButton>
          </div>
        }
      />

      <div className="rounded-lg border border-line bg-surface shadow-xs">
        {/* Search & Status Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
          <div className="relative min-w-[240px] flex-1">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
              aria-hidden
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, email, phone or tags…"
              aria-label="Search customers"
              className="h-9 w-full rounded-md border border-line-strong bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted focus:border-clay focus:outline-none transition-colors"
            />
          </div>

          <div
            className="flex items-center gap-1 rounded-lg bg-subtle p-1"
            role="group"
            aria-label="Filter by account status"
          >
            {statusFilters.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                aria-pressed={statusFilter === s}
                className={cn(
                  'rounded-md px-3 py-1 text-xs font-medium transition-colors cursor-pointer',
                  statusFilter === s
                    ? 'bg-surface text-ink shadow-xs'
                    : 'text-ink-muted hover:text-ink',
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Customers Data Table */}
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(c) => c.id}
          onRowClick={(c) => setCustomerParam(c.id)}
          empty={
            <EmptyState
              icon={Users}
              title="No customers match your search"
              description="Try adjusting your search query or status filter."
            />
          }
        />
      </div>

      {/* Customer Details Drawer */}
      <Drawer
        open={!!active}
        onClose={() => setCustomerParam(undefined)}
        width="max-w-lg"
        title={active?.name ?? ''}
        subtitle={
          active && (
            <span className="flex items-center gap-2">
              <Badge tone={active.status === 'active' ? 'success' : 'neutral'} dot>
                {active.status === 'active' ? 'Active' : 'Inactive'}
              </Badge>
              <span className="text-xs text-ink-muted">
                Customer since {formatDate(active.joined)}
              </span>
            </span>
          )
        }
        footer={
          active && (
            <div className="flex w-full items-center justify-between gap-3">
              <span className="text-xs text-ink-muted">
                ID: <span className="font-mono text-[11px]">{active.id.slice(0, 8)}...</span>
              </span>
              <GuardedButton
                module="customers"
                action="update"
                variant={active.status === 'active' ? 'danger' : 'secondary'}
                size="sm"
                disabled={isUpdatingStatus}
                onClick={() => handleToggleStatus(active)}
              >
                {active.status === 'active' ? (
                  <>
                    <XCircle className="h-4 w-4" aria-hidden /> Deactivate Account
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" aria-hidden /> Reactivate Account
                  </>
                )}
              </GuardedButton>
            </div>
          )
        }
      >
        {active && (
          <div className="space-y-6 px-5 py-5 text-sm">
            {/* Quick Metrics */}
            <dl className="grid grid-cols-3 gap-3 rounded-lg bg-canvas p-4 border border-line shadow-xs">
              <div>
                <dt className="text-xs text-ink-muted">Lifetime Value</dt>
                <dd className="mt-1 text-base font-bold text-ink">
                  {formatBDT(active.spent)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted">Total Orders</dt>
                <dd className="mt-1 text-base font-bold text-ink">
                  {active.orders}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted">Store Credit</dt>
                <dd className="mt-1 text-base font-bold text-success">
                  {formatBDT(active.storeCredit)}
                </dd>
              </div>
            </dl>

            {/* Contact & Profile Info */}
            <div className="rounded-lg border border-line bg-surface p-4 space-y-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Customer Information
              </h4>
              <div className="space-y-2 text-ink">
                <p className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-ink-muted shrink-0" aria-hidden />
                  <span className="font-medium text-ink">{active.email}</span>
                </p>
                {active.phone && (
                  <p className="flex items-center gap-2.5 font-mono text-xs">
                    <Phone className="h-4 w-4 text-ink-muted shrink-0" aria-hidden />
                    <span>{active.phone}</span>
                  </p>
                )}
                <p className="flex items-center gap-2.5 text-xs text-ink-muted">
                  <CreditCard className="h-4 w-4 text-ink-muted shrink-0" aria-hidden />
                  Marketing Consent:{' '}
                  <span className={cn('font-medium', active.marketingConsent ? 'text-success' : 'text-ink-muted')}>
                    {active.marketingConsent ? 'Subscribed' : 'Not subscribed'}
                  </span>
                </p>
              </div>
            </div>

            {/* Tags */}
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" aria-hidden /> Tags
                </p>
              </div>
              {active.tags.length === 0 ? (
                <p className="mt-2 text-xs text-ink-muted">No tags added yet.</p>
              ) : (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {active.tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center rounded-md bg-subtle px-2.5 py-1 text-xs font-medium text-ink-soft border border-line"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Orders */}
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                  <ShoppingBag className="h-3.5 w-3.5" aria-hidden /> Order History
                </p>
                <span className="text-xs text-ink-muted">{custOrders.length} orders</span>
              </div>

              {custOrders.length === 0 ? (
                <div className="mt-2 rounded-lg border border-dashed border-line p-4 text-center text-xs text-ink-muted">
                  No previous orders found for this customer.
                </div>
              ) : (
                <ul className="mt-2 divide-y divide-line rounded-lg border border-line overflow-hidden">
                  {custOrders.slice(0, 5).map((o) => (
                    <li key={o.id}>
                      {can('orders') ? (
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="flex items-center justify-between p-3 hover:bg-canvas transition-colors"
                        >
                          <div>
                            <span className="font-semibold text-ink block">{o.number}</span>
                            <span className="text-xs text-ink-muted flex items-center gap-1 mt-0.5">
                              <Calendar className="h-3 w-3" aria-hidden /> {formatDate(o.createdAt)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <Badge tone={orderStatusMeta[o.status].tone}>
                              {orderStatusMeta[o.status].label}
                            </Badge>
                            <span className="font-bold text-ink">
                              {formatBDT(o.total)}
                            </span>
                          </div>
                        </Link>
                      ) : (
                        <div className="p-3">
                          <span className="font-medium text-ink">{o.number}</span>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Internal Staff Notes */}
            <Textarea
              label="Staff Notes"
              rows={3}
              placeholder="Add internal notes about this customer (visible only to store admins)..."
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
