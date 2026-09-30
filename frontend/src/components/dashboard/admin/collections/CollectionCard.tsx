'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Hand } from 'lucide-react';
import type { CollectionItem } from '@/types/collection';

interface CollectionCardProps {
  collection: CollectionItem;
  productCount: number;
}

export function CollectionCard({ collection, productCount }: CollectionCardProps) {
  return (
    <li className="flex flex-col overflow-hidden rounded-lg border border-line bg-surface transition-shadow hover:shadow-sm">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-subtle">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={collection.image}
          alt={collection.name}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-ink">{collection.name}</h2>
          <span className="inline-flex items-center gap-1 text-xs text-ink-muted">
            {collection.type === 'rule' ? (
              <Sparkles className="h-3.5 w-3.5 text-clay" aria-hidden />
            ) : (
              <Hand className="h-3.5 w-3.5 text-ink-muted" aria-hidden />
            )}
            <span>{collection.type === 'rule' ? 'Automated' : 'Manual'}</span>
          </span>
        </div>

        <p className="mt-1 line-clamp-2 text-sm text-ink-muted">
          {collection.description}
        </p>

        {collection.rule && (
          <p className="mt-2 rounded bg-canvas px-2 py-1 font-mono text-xs text-ink-soft">
            {collection.rule}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-4 text-sm">
          <span className="text-ink-muted">{productCount} products</span>
          <Link
            href={`/collections/${collection.slug}`}
            className="font-medium text-ink hover:text-clay transition-colors"
          >
            View on store
          </Link>
        </div>
      </div>
    </li>
  );
}
