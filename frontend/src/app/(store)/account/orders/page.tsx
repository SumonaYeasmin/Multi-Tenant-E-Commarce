'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { PackageIcon } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { AccountHeader } from '@/components/account/AccountHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/Tabs';
import { EmptyState } from '@/components/ui/EmptyState';
import { orderStatusMeta } from '@/utils/status';
import { formatBDT, formatDate } from '@/utils/format';

type Filter = 'all' | 'active' | 'delivered' | 'returns' | 'cancelled';

export default function AccountOrdersPage() {
  const { user, orders, addToCart, setMiniCartOpen } = useStore();
  const [filter, setFilter] = useState<Filter>('all');
  const mine = orders.filter((o) => o.customerId === user?.id);

  const groups: Record<Filter, (s: string) => boolean> = {
    all: () => true,
    active: (s) =>
      [
        'pending_payment',
        'confirmed',
        'processing',
        'packed',
        'shipped',
        'out_for_delivery',
      ].includes(s),
    delivered: (s) => s === 'delivered',
    returns: (s) =>
      ['return_requested', 'returned', 'refunded', 'partially_refunded'].includes(s),
    cancelled: (s) => ['cancelled', 'failed'].includes(s),
  };

  const list = mine.filter((o) => groups[filter](o.status));

  const reorder = (id: string) => {
    const o = mine.find((x) => x.id === id)!;
    o.items.forEach((i) => addToCart(i.productId, i.variantId, i.qty));
    toast.success('Items added to your bag');
    setMiniCartOpen(true);
  };

  return (
    <div>
      <AccountHeader title="Orders" description={`${mine.length} orders placed`} />
      <Tabs
        value={filter}
        onChange={(v) => setFilter(v as Filter)}
        tabs={[
          { value: 'all', label: 'All', count: mine.length },
          {
            value: 'active',
            label: 'In progress',
            count: mine.filter((o) => groups.active(o.status)).length,
          },
          { value: 'delivered', label: 'Delivered' },
          { value: 'returns', label: 'Returns & refunds' },
          { value: 'cancelled', label: 'Cancelled' },
        ]}
      />
      {list.length === 0 ? (
        <EmptyState
          icon={PackageIcon}
          title="No orders here"
          description="Orders in this category will show up here."
          action={<Button href="/shop">Shop now</Button>}
        />
      ) : (
        <ul className="mt-6 space-y-4">
          {list.map((o) => (
            <li key={o.id} className="rounded-lg border border-line bg-surface">
              <div className="flex flex-wrap items-center gap-x-8 gap-y-2 border-b border-line px-5 py-3 text-sm">
                <div>
                  <p className="text-xs text-ink-muted">Order</p>
                  <p className="font-medium">{o.number}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-muted">Placed</p>
                  <p>{formatDate(o.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-muted">Total</p>
                  <p className="tabular-nums">{formatBDT(o.total)}</p>
                </div>
                <div className="ml-auto">
                  <Badge tone={orderStatusMeta[o.status].tone} dot>
                    {orderStatusMeta[o.status].label}
                  </Badge>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 px-5 py-4">
                <div className="flex gap-2">
                  {o.items.map((i) => (
                    <img
                      key={i.variantId}
                      src={i.image}
                      alt={i.title}
                      className="h-20 rounded object-cover"
                      style={{ width: 60 }}
                    />
                  ))}
                </div>
                <p className="min-w-0 flex-1 text-sm text-ink-soft">
                  {o.items.map((i) => i.title).join(', ')}
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => reorder(o.id)}>
                    Buy again
                  </Button>
                  <Button size="sm" href={`/account/orders/${o.number}`}>
                    View details
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
