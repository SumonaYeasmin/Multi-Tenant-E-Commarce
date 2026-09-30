'use client';

import React from 'react';
import { RotateCcwIcon } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { AccountHeader } from '@/components/account/AccountHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/EmptyState';
import { returnStatusMeta } from '@/utils/status';
import { formatBDT, formatDate } from '@/utils/format';
import { cn } from '@/utils/cn';
import type { ReturnStatus } from '@/types/commerce';

const flow: ReturnStatus[] = ['requested', 'approved', 'in_transit', 'received', 'refunded'];

export default function AccountReturnsPage() {
  const { returns, user } = useStore();
  const mine = returns.filter((r) => r.customerName === user?.name);

  return (
    <div>
      <AccountHeader
        title="Returns & exchanges"
        description="Track the status of your return requests."
        action={
          <Button variant="secondary" size="sm" href="/account/orders">
            Start a return
          </Button>
        }
      />
      {mine.length === 0 ? (
        <EmptyState
          icon={RotateCcwIcon}
          title="No returns yet"
          description="You can start a return from any delivered order within 7 days."
        />
      ) : (
        <ul className="space-y-4">
          {mine.map((r) => {
            const idx = r.status === 'exchanged' ? 4 : flow.indexOf(r.status);
            return (
              <li key={r.id} className="rounded-lg border border-line bg-surface p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {r.id}{' '}
                      <span className="font-normal text-ink-muted">
                        · Order {r.orderNumber}
                      </span>
                    </p>
                    <p className="text-xs text-ink-muted">
                      Requested {formatDate(r.createdAt)} · {r.reason}
                    </p>
                  </div>
                  <Badge tone={returnStatusMeta[r.status].tone} dot>
                    {returnStatusMeta[r.status].label}
                  </Badge>
                </div>
                <div className="mt-4 flex items-center gap-4">
                  {r.items.map((i) => (
                    <img
                      key={i.title}
                      src={i.image}
                      alt=""
                      className="h-16 w-12 rounded object-cover"
                    />
                  ))}
                  <div className="text-sm">
                    <p>{r.items.map((i) => i.title).join(', ')}</p>
                    <p className="text-xs text-ink-muted">
                      {r.resolution === 'exchange'
                        ? 'Exchange'
                        : r.resolution === 'store_credit'
                        ? 'Store credit'
                        : 'Refund'}{' '}
                      · {formatBDT(r.amount)}
                    </p>
                  </div>
                </div>
                {r.status !== 'rejected' && (
                  <ol
                    className="mt-5 grid grid-cols-5 gap-1 text-[11px] sm:text-xs"
                    aria-label="Return progress"
                  >
                    {[
                      'Requested',
                      'Approved',
                      'Picked up',
                      'Inspected',
                      r.resolution === 'exchange' ? 'Exchanged' : 'Refunded',
                    ].map((s, i) => (
                      <li key={s} className="flex flex-col gap-1.5">
                        <span
                          className={cn(
                            'h-1 rounded-full',
                            i <= idx ? 'bg-ink' : 'bg-line'
                          )}
                        />
                        <span className={i <= idx ? 'font-medium' : 'text-ink-muted'}>
                          {s}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
                <p className="mt-4 text-xs text-ink-muted">
                  Latest: {r.timeline[0]?.label ?? 'Processing request'}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
