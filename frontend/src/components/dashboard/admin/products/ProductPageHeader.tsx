'use client';

import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';

interface ProductPageHeaderProps {
  title?: string;
  totalProducts: number;
  totalVariants: number;
}

export function ProductPageHeader({
  title = 'Products',
  totalProducts,
  totalVariants,
}: ProductPageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-ink">{title}</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {totalProducts} products · {totalVariants} variants
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-xs font-medium text-canvas hover:bg-ink/90 transition-colors shadow-xs"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Add product</span>
        </Link>
      </div>
    </div>
  );
}
