'use client';

import React from 'react';
import Link from 'next/link';
import { Tag } from 'lucide-react';
import { formatBDT } from '@/utils/format';
import type { Product } from '@/types/product';

export interface BrandItem {
  id?: string;
  slug: string;
  name: string;
  description?: string | null;
  logo?: string | null;
  isActive?: boolean;
}

interface BrandRowProps {
  brand: BrandItem;
  products: Product[];
}

export function BrandRow({ brand, products }: BrandRowProps) {
  const brandProducts = products.filter(
    (p) => p.brand === brand.slug || p.brand === brand.name
  );
  const revenue = brandProducts.reduce(
    (sum, p) => sum + ((p.salePrice ?? p.price) || 0) * (p.sold || 0),
    0
  );

  return (
    <li className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-subtle/50">
      <div className="flex items-center gap-3 min-w-[200px] flex-1">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-line bg-subtle font-display text-lg font-bold text-ink overflow-hidden">
          {brand.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={brand.logo}
              alt={brand.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span>{brand.name[0]?.toUpperCase() || 'B'}</span>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-ink">{brand.name}</p>
          <p className="text-xs text-ink-muted line-clamp-1">
            {brand.description || 'Curated brand on store.'}
          </p>
        </div>
      </div>
      <div className="text-right text-sm">
        <p className="tabular-nums font-medium text-ink">
          {brandProducts.length} products
        </p>
        <p className="text-xs text-ink-muted tabular-nums">
          {formatBDT(revenue)} · 30d
        </p>
      </div>
      <Link
        href={`/brands/${brand.slug}`}
        className="text-sm font-medium text-clay hover:underline shrink-0"
      >
        Brand page
      </Link>
    </li>
  );
}
