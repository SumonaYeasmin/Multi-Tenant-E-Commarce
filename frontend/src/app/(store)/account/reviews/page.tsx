'use client';

import React from 'react';
import Link from 'next/link';
import { StarIcon } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { AccountHeader } from '@/components/account/AccountHeader';
import { Rating } from '@/components/ui/Rating';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/utils/format';

export default function AccountReviewsPage() {
  const { reviews, orders, products, user } = useStore();
  const mine = reviews.filter((r) =>
    r.author.startsWith(user?.name.split(' ')[0] ?? '---')
  );
  const reviewedIds = mine.map((r) => r.productId);
  const toReview = Array.from(
    new Set(
      orders
        .filter((o) => o.customerId === user?.id && o.status === 'delivered')
        .flatMap((o) => o.items.map((i) => i.productId))
    )
  )
    .filter((id) => !reviewedIds.includes(id))
    .map((id) => products.find((p) => p.id === id)!)
    .filter(Boolean);

  return (
    <div>
      <AccountHeader
        title="My reviews"
        description="Share your thoughts to help other shoppers."
      />
      {toReview.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-semibold">Waiting for your review</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {toReview.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-4 rounded-lg border border-line bg-surface p-3"
              >
                <img
                  src={p.images[0]}
                  alt=""
                  className="h-16 w-12 rounded object-cover"
                />
                <p className="flex-1 text-sm font-medium">{p.title}</p>
                <Button size="sm" variant="secondary" href={`/products/${p.slug}#reviews`}>
                  Review
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}
      <h2 className="text-sm font-semibold">Published & pending</h2>
      {mine.length === 0 ? (
        <EmptyState icon={StarIcon} title="No reviews yet" />
      ) : (
        <ul className="mt-3 space-y-4">
          {mine.map((r) => (
            <li key={r.id} className="rounded-lg border border-line bg-surface p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link
                  href={`/products/${
                    products.find((p) => p.id === r.productId)?.slug
                  }`}
                  className="text-sm font-medium hover:underline"
                >
                  {r.productTitle}
                </Link>
                <Badge
                  tone={
                    r.status === 'published'
                      ? 'success'
                      : r.status === 'pending'
                      ? 'warning'
                      : 'neutral'
                  }
                >
                  {r.status === 'pending' ? 'Awaiting moderation' : r.status}
                </Badge>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Rating value={r.rating} />{' '}
                <span className="text-sm font-medium">{r.title}</span>
              </div>
              <p className="mt-2 text-sm text-ink-soft">{r.body}</p>
              <p className="mt-2 text-xs text-ink-muted">
                {formatDate(r.date)} · {r.helpful} found this helpful
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
