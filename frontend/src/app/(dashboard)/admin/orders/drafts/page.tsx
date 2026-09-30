'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Search, Trash2, FileText } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { Panel } from '@/components/dashboard/shared/Panel';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { variantPrice, available } from '@/utils/pricing';
import { formatBDT, formatDate } from '@/utils/format';

interface Line {
  productId: string;
  variantId: string;
  qty: number;
}

const existingDrafts = [
  { id: 'D-118', customer: 'Kabir Traders Ltd.', items: 3, total: 84500, created: '2026-09-24', status: 'Invoice sent' },
  { id: 'D-117', customer: 'Ayesha Siddiqua', items: 1, total: 8500, created: '2026-09-22', status: 'Open' }
];

export default function DraftOrdersPage() {
  const { products, customers } = useStore();
  const [drafts, setDrafts] = useState(existingDrafts);
  const [customerId, setCustomerId] = useState('c06');
  const [q, setQ] = useState('');
  const [lines, setLines] = useState<Line[]>([]);
  const [discount, setDiscount] = useState('');
  const [shipping, setShipping] = useState('130');
  const [wholesale, setWholesale] = useState(true);

  const customer = customers.find((c) => c.id === customerId) ?? customers[0];
  const isB2B = customer?.segment === 'Wholesale';
  const matches = q.length > 1 ? products.filter((p) => p.title.toLowerCase().includes(q.toLowerCase())).slice(0, 5) : [];
  const detailed = lines.map((l) => {
    const p = products.find((x) => x.id === l.productId)!;
    const v = p.variants.find((x) => x.id === l.variantId)!;
    const base = variantPrice(v);
    const tier = isB2B && wholesale ? (l.qty >= 20 ? 0.7 : l.qty >= 10 ? 0.8 : 0.9) : 1;
    return { ...l, p, v, unit: Math.round(base * tier), tier };
  });
  const subtotal = detailed.reduce((s, l) => s + l.unit * l.qty, 0);
  const total = Math.max(0, subtotal - Number(discount || 0) + Number(shipping || 0));
  const moqViolations = isB2B ? detailed.filter((l) => l.qty < 5) : [];

  const addLine = (pid: string) => {
    const p = products.find((x) => x.id === pid)!;
    const v = p.variants.find((x) => available(x) > 0) ?? p.variants[0];
    setLines((ls) => [...ls, { productId: pid, variantId: v.id, qty: isB2B ? 10 : 1 }]);
    setQ('');
  };

  const finalize = (mode: 'invoice' | 'paid') => {
    if (!lines.length) return toast.error('Add at least one product');
    if (moqViolations.length) return toast.error('Wholesale orders require at least 5 units per line');
    const id = `D-${119 + drafts.length - existingDrafts.length}`;
    setDrafts([{ id, customer: customer.name, items: lines.length, total, created: '2026-09-26', status: mode === 'invoice' ? 'Invoice sent' : 'Completed' }, ...drafts]);
    setLines([]);
    toast.success(mode === 'invoice' ? `Invoice with payment link sent to ${customer.email}` : `Order created from ${id} and marked as paid`);
  };

  return (
    <div className="w-full space-y-6">
      <PageHeader
        back={{ href: '/admin/orders', label: 'Orders' }}
        title="Draft & manual orders"
        description="Create orders for phone, Facebook, showroom or wholesale customers and send them a payment link."
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Panel title="Products">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products to add…"
                aria-label="Search products"
                className="h-10 w-full rounded-md border border-line bg-canvas pl-8 pr-3 text-sm text-ink placeholder:text-ink-muted focus:border-clay focus:outline-none"
              />
              {matches.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full rounded-md border border-line bg-surface shadow-pop overflow-hidden">
                  {matches.map((p) => (
                    <li key={p.id}>
                      <button
                        onClick={() => addLine(p.id)}
                        className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-canvas cursor-pointer"
                      >
                        <img src={p.images[0]} alt="" className="h-9 w-7 rounded object-cover" />
                        <span className="flex-1 text-ink">{p.title}</span>
                        <Plus className="h-4 w-4 text-ink-muted" aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {detailed.length === 0 ? (
              <div className="py-4">
                <EmptyState icon={FileText} title="No products yet" description="Search above to add products to this order." />
              </div>
            ) : (
              <ul className="mt-4 divide-y divide-line">
                {detailed.map((l, idx) => (
                  <li key={idx} className="flex flex-wrap items-center gap-3 py-3">
                    <img src={l.p.images[0]} alt="" className="h-12 w-9 rounded object-cover" />
                    <div className="min-w-[140px] flex-1 text-sm">
                      <p className="font-medium text-ink">{l.p.title}</p>
                      <select
                        aria-label="Variant"
                        value={l.variantId}
                        onChange={(e) => setLines((ls) => ls.map((x, i) => (i === idx ? { ...x, variantId: e.target.value } : x)))}
                        className="mt-1 h-7 rounded border border-line bg-surface px-1.5 text-xs text-ink focus:outline-none"
                      >
                        {l.p.variants.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.color} / {v.size} ({available(v)} avail.)
                          </option>
                        ))}
                      </select>
                    </div>
                    <input
                      aria-label="Quantity"
                      type="number"
                      min={1}
                      value={l.qty}
                      onChange={(e) => setLines((ls) => ls.map((x, i) => (i === idx ? { ...x, qty: Math.max(1, Number(e.target.value)) } : x)))}
                      className="h-8 w-16 rounded border border-line bg-surface px-2 text-sm text-ink focus:outline-none"
                    />
                    <div className="w-28 text-right text-sm">
                      <p className="tabular-nums font-medium text-ink">{formatBDT(l.unit * l.qty)}</p>
                      {l.tier < 1 && <p className="text-xs text-success">{Math.round((1 - l.tier) * 100)}% volume price</p>}
                    </div>
                    <button
                      onClick={() => setLines((ls) => ls.filter((_, i) => i !== idx))}
                      className="rounded p-1.5 text-ink-muted hover:bg-subtle hover:text-danger cursor-pointer"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {moqViolations.length > 0 && <p className="mt-3 text-xs text-danger">Minimum order quantity for wholesale is 5 units per line.</p>}
          </Panel>

          <Panel title="Recent drafts" flush>
            <ul className="divide-y divide-line">
              {drafts.map((d) => (
                <li key={d.id} className="flex items-center gap-4 px-5 py-3 text-sm">
                  <span className="font-medium text-ink">{d.id}</span>
                  <span className="flex-1 text-ink">{d.customer} · {d.items} items</span>
                  <span className="text-ink-muted">{formatDate(d.created)}</span>
                  <span className="tabular-nums font-medium text-ink">{formatBDT(d.total)}</span>
                  <Badge tone={d.status === 'Completed' ? 'success' : d.status === 'Invoice sent' ? 'info' : 'neutral'}>{d.status}</Badge>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Customer">
            <Select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              options={customers.map((c) => ({ value: c.id, label: `${c.name} · ${c.phone}` }))}
              aria-label="Customer"
            />
            {customer && <p className="mt-2 text-xs text-ink-muted">{customer.email} · {customer.district}</p>}
            {isB2B && (
              <div className="mt-3 rounded-md bg-info-soft p-3 text-xs text-info">
                Business account · Wholesale group · Tax-exempt (BIN 004512876-0101)
                <label className="mt-2 flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={wholesale} onChange={(e) => setWholesale(e.target.checked)} />
                  Apply volume pricing (10% / 20% / 30%)
                </label>
              </div>
            )}
          </Panel>

          <Panel title="Summary">
            <div className="space-y-3">
              <Input label="Discount (৳)" inputMode="numeric" value={discount} onChange={(e) => setDiscount(e.target.value.replace(/\D/g, ''))} />
              <Input label="Shipping (৳)" inputMode="numeric" value={shipping} onChange={(e) => setShipping(e.target.value.replace(/\D/g, ''))} />
            </div>
            <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-muted">Subtotal</dt>
                <dd className="font-medium text-ink tabular-nums">{formatBDT(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-muted">Discount</dt>
                <dd className="font-medium text-ink tabular-nums">−{formatBDT(Number(discount || 0))}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-muted">Shipping</dt>
                <dd className="font-medium text-ink tabular-nums">{formatBDT(Number(shipping || 0))}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-2 text-sm font-semibold text-ink">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatBDT(total)}</dd>
              </div>
            </dl>
            <div className="mt-5 space-y-2">
              <Button fullWidth onClick={() => finalize('invoice')} className="cursor-pointer">
                Send invoice with payment link
              </Button>
              <Button fullWidth variant="secondary" onClick={() => finalize('paid')} className="cursor-pointer">
                Mark as paid & create order
              </Button>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
