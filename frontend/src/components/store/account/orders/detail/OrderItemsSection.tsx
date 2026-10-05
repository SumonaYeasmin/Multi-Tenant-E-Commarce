'use client';

import React from 'react';
import Link from 'next/link';
import { formatBDT } from '@/utils/format';
import type { OrderItem } from '@/types/commerce';

interface OrderItemsSectionProps {
  items: OrderItem[];
  orderStatus: string;
}

export function OrderItemsSection({ items, orderStatus }: OrderItemsSectionProps) {
  return (
    <div>
      <h2 className="border-b border-line px-6 py-4 text-sm font-semibold text-ink">Items</h2>
      <ul className="divide-y divide-line px-6">
        {items.map((item) => (
          <li key={item.variantId || item.productId} className="flex items-center gap-4 py-4">
            <img
              src={item.image || '/placeholder.png'}
              alt={item.title}
              className="h-20 w-[60px] rounded border border-line object-cover"
            />
            <div className="flex-1 text-sm">
              <p className="font-medium text-ink">{item.title}</p>
              <p className="text-xs text-ink-muted">
                {item.color} · {item.size} · Qty {item.qty}
              </p>
              {orderStatus === 'delivered' && (
                <Link
                  href={`/products/${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}#reviews`}
                  className="mt-1 inline-block text-xs text-ink-soft underline hover:text-ink"
                >
                  Write a review
                </Link>
              )}
            </div>
            <span className="text-sm tabular-nums text-ink">{formatBDT(item.price * item.qty)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
