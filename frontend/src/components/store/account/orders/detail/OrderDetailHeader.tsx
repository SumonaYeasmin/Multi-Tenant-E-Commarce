'use client';

import React from 'react';
import Link from 'next/link';
import {
  ChevronLeftIcon,
  DownloadIcon,
  RotateCcwIcon,
  XCircleIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/utils/format';
import type { Order } from '@/types/commerce';

interface OrderDetailHeaderProps {
  order: Order;
  canReturn: boolean;
  canCancel: boolean;
  hasExistingReturn: boolean;
  onDownloadInvoice: () => void;
  onRequestCancel: () => void;
}

export function OrderDetailHeader({
  order,
  canReturn,
  canCancel,
  hasExistingReturn,
  onDownloadInvoice,
  onRequestCancel,
}: OrderDetailHeaderProps) {
  return (
    <div>
      {/* Back to all orders link */}
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
      >
        <ChevronLeftIcon className="h-4 w-4" aria-hidden /> All orders
      </Link>

      {/* Header title and action buttons */}
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Order {order.number}</h1>
          <p className="mt-1 text-sm text-ink-muted">Placed {formatDateTime(order.createdAt)}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onDownloadInvoice}
          >
            <DownloadIcon className="h-4 w-4" aria-hidden /> Invoice
          </Button>

          {canReturn && !hasExistingReturn && (
            <Button size="sm" href={`/account/orders/${order.number}/return`}>
              <RotateCcwIcon className="h-4 w-4" aria-hidden /> Return or exchange
            </Button>
          )}

          {canCancel && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onRequestCancel}
            >
              <XCircleIcon className="h-4 w-4" aria-hidden /> Cancel order
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
