'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Percent } from 'lucide-react';
import { discounts as seed } from '@/data/admin';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { DataTable, type Column } from '@/components/dashboard/shared/DataTable';
import { GuardedButton } from '@/components/dashboard/shared/GuardedButton';
import { ModuleGate } from '@/components/dashboard/shared/ModuleGate';
import { Tabs } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { Drawer } from '@/components/ui/Drawer';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatBDT, formatDate } from '@/utils/format';
import { cn } from '@/utils/cn';

type D = (typeof seed)[number];
const types = ['Percentage', 'Fixed amount', 'Free shipping', 'Buy X get Y'] as const;

export default function AdminDiscountsPage() {
  const [list, setList] = useState<D[]>(seed);
  const [tab, setTab] = useState<'all' | 'active' | 'scheduled' | 'expired'>('all');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    method: 'code',
    code: '',
    type: 'Percentage' as (typeof types)[number],
    value: '10',
    min: '',
    limit: '',
    perCustomer: true,
    firstOrder: false,
    combine: false,
    starts: '2026-09-27',
    ends: '',
  });
  const [err, setErr] = useState('');
  const rows = list.filter((d) => tab === 'all' || d.status === tab);

  const columns: Column<D>[] = [
    {
      key: 't',
      header: 'Discount',
      render: (d) => (
        <div>
          <p className="font-medium text-ink">{d.code || d.title}</p>
          {d.code && <p className="text-xs text-ink-muted">{d.title}</p>}
        </div>
      ),
    },
    {
      key: 'm',
      header: 'Method',
      render: (d) => (
        <span className="text-ink-muted">
          {d.method === 'code' ? 'Code' : 'Automatic'} · {d.type}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      key: 'u',
      header: 'Used',
      align: 'right',
      render: (d) => (
        <span className="tabular-nums text-ink">
          {d.used}
          {d.limit ? ` / ${d.limit}` : ''}
        </span>
      ),
    },
    {
      key: 'r',
      header: 'Revenue',
      align: 'right',
      render: (d) => (
        <span className="tabular-nums font-medium text-ink">
          {formatBDT(d.revenue)}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      key: 'd',
      header: 'Active dates',
      render: (d) => (
        <span className="text-ink-muted">
          {formatDate(d.starts)} – {d.ends ? formatDate(d.ends) : 'No end'}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      key: 's',
      header: 'Status',
      render: (d) => (
        <Badge
          tone={
            d.status === 'active'
              ? 'success'
              : d.status === 'scheduled'
              ? 'info'
              : 'neutral'
          }
          dot
        >
          {d.status}
        </Badge>
      ),
    },
  ];

  const save = () => {
    if (form.method === 'code' && !/^[A-Z0-9]{4,20}$/.test(form.code)) {
      return setErr('Use 4–20 letters or numbers, e.g. PUJA15');
    }
    if (form.code && list.some((d) => d.code === form.code)) {
      return setErr('This code already exists');
    }
    const title =
      form.type === 'Percentage'
        ? `${form.value}% off${form.min ? ` orders over ৳${form.min}` : ''}`
        : form.type === 'Fixed amount'
        ? `৳${form.value} off${form.min ? ` orders over ৳${form.min}` : ''}`
        : form.type === 'Free shipping'
        ? 'Free delivery'
        : 'Buy 2 get 1 free';
    const created = {
      ...list[0],
      id: `d${Date.now()}`,
      code: form.method === 'code' ? form.code : '',
      title,
      type: form.type,
      method: form.method,
      status: form.starts > '2026-09-26' ? 'scheduled' : 'active',
      used: 0,
      limit: form.limit ? Number(form.limit) : null,
      starts: form.starts,
      ends: form.ends,
      revenue: 0,
    } as unknown as D;
    setList([created, ...list]);
    setOpen(false);
    toast.success('Discount created');
  };

  return (
    <ModuleGate module="discounts">
      <div className="w-full space-y-6">
        <PageHeader
          title="Discounts"
          description="Coupon codes and automatic promotions."
          actions={
            <>
              <GuardedButton
                module="discounts"
                action="create"
                variant="secondary"
                size="sm"
                onClick={() =>
                  toast.success(
                    '500 unique codes generated (EID-XXXX) and exported'
                  )
                }
              >
                Bulk generate codes
              </GuardedButton>
              <GuardedButton
                module="discounts"
                action="create"
                size="sm"
                onClick={() => {
                  setErr('');
                  setOpen(true);
                }}
              >
                <Plus className="h-4 w-4" aria-hidden /> Create discount
              </GuardedButton>
            </>
          }
        />
        <div className="rounded-lg border border-line bg-surface">
          <div className="px-4 pt-2">
            <Tabs
              value={tab}
              onChange={(val) => setTab(val as typeof tab)}
              tabs={[
                { value: 'all', label: 'All' },
                {
                  value: 'active',
                  label: 'Active',
                  count: list.filter((d) => d.status === 'active').length,
                },
                { value: 'scheduled', label: 'Scheduled' },
                { value: 'expired', label: 'Expired' },
              ]}
            />
          </div>
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(d) => d.id}
            empty={
              <EmptyState
                icon={Percent}
                title="No discounts"
                description="Create a code or automatic promotion."
              />
            }
          />
        </div>

        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          width="max-w-lg"
          title="Create discount"
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={save}>Create discount</Button>
            </div>
          }
        >
          <div className="space-y-5 px-5 py-5">
            <div
              className="grid grid-cols-2 gap-2"
              role="radiogroup"
              aria-label="Method"
            >
              {[
                ['code', 'Discount code'],
                ['automatic', 'Automatic'],
              ].map(([v, l]) => (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={form.method === v}
                  onClick={() => setForm({ ...form, method: v })}
                  className={cn(
                    'rounded-md border px-3 py-2.5 text-sm cursor-pointer transition-colors',
                    form.method === v
                      ? 'border-ink ring-1 ring-ink font-medium text-ink'
                      : 'border-line-strong text-ink-soft hover:text-ink'
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
            {form.method === 'code' && (
              <Input
                label="Code"
                value={form.code}
                onChange={(e) => {
                  setForm({ ...form, code: e.target.value.toUpperCase() });
                  setErr('');
                }}
                error={err}
                placeholder="PUJA15"
              />
            )}
            <Select
              label="Type"
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value as typeof form.type })
              }
              options={[...types]}
            />
            {(form.type === 'Percentage' || form.type === 'Fixed amount') && (
              <Input
                label="Value"
                prefix={form.type === 'Fixed amount' ? '৳' : undefined}
                value={form.value}
                onChange={(e) =>
                  setForm({ ...form, value: e.target.value.replace(/\D/g, '') })
                }
                hint={form.type === 'Percentage' ? 'Percent off' : undefined}
              />
            )}
            {form.type === 'Buy X get Y' && (
              <div className="grid grid-cols-2 gap-4">
                <Input label="Customer buys" defaultValue="2" />
                <Input label="Gets free / discounted" defaultValue="1" />
              </div>
            )}
            <Select
              label="Applies to"
              options={[
                'Entire order',
                'Specific collections',
                'Specific products',
                'Specific customer segment',
              ]}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Minimum order"
                prefix="৳"
                value={form.min}
                onChange={(e) =>
                  setForm({ ...form, min: e.target.value.replace(/\D/g, '') })
                }
              />
              <Input
                label="Total usage limit"
                value={form.limit}
                onChange={(e) =>
                  setForm({ ...form, limit: e.target.value.replace(/\D/g, '') })
                }
                placeholder="Unlimited"
              />
            </div>
            <div className="space-y-2">
              <Checkbox
                checked={form.perCustomer}
                onChange={(v) => setForm({ ...form, perCustomer: v })}
                label="Limit to one use per customer"
              />
              <Checkbox
                checked={form.firstOrder}
                onChange={(v) => setForm({ ...form, firstOrder: v })}
                label="First order only"
              />
              <Checkbox
                checked={form.combine}
                onChange={(v) => setForm({ ...form, combine: v })}
                label="Can combine with other discounts"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Starts"
                type="date"
                value={form.starts}
                onChange={(e) => setForm({ ...form, starts: e.target.value })}
              />
              <Input
                label="Ends"
                type="date"
                value={form.ends}
                onChange={(e) => setForm({ ...form, ends: e.target.value })}
              />
            </div>
          </div>
        </Drawer>
      </div>
    </ModuleGate>
  );
}
