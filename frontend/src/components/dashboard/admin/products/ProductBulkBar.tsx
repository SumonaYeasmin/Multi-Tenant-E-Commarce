'use client';

import React from 'react';
import type { ProductStatus } from '@/types/product';

interface ProductBulkBarProps {
  selectedCount: number;
  onClear: () => void;
  onBulkStatusChange: (status: ProductStatus) => void;
  onAdjustPrices: () => void;
}

export function ProductBulkBar({
  selectedCount,
  onClear,
  onBulkStatusChange,
  onAdjustPrices,
}: ProductBulkBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-30 flex justify-center px-4">
      <div
        className="pointer-events-auto flex flex-wrap items-center gap-3 rounded-lg bg-ink px-4 py-2.5 text-sm text-canvas shadow-pop animate-in fade-in-0 slide-in-from-bottom-2 duration-150"
        role="toolbar"
        aria-label="Bulk actions"
      >
        <span className="tabular-nums font-medium">{selectedCount} selected</span>
        <span className="h-4 w-px bg-canvas/20" aria-hidden="true" />

        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => onBulkStatusChange('published')}
            className="rounded-md px-2.5 py-1 hover:bg-canvas/10 cursor-pointer transition-colors"
          >
            Publish
          </button>
          <button
            type="button"
            onClick={() => onBulkStatusChange('draft')}
            className="rounded-md px-2.5 py-1 hover:bg-canvas/10 cursor-pointer transition-colors"
          >
            Set as draft
          </button>
          <button
            type="button"
            onClick={() => onBulkStatusChange('archived')}
            className="rounded-md px-2.5 py-1 hover:bg-canvas/10 cursor-pointer transition-colors"
          >
            Archive
          </button>
          <button
            type="button"
            onClick={onAdjustPrices}
            className="rounded-md px-2.5 py-1 hover:bg-canvas/10 cursor-pointer transition-colors"
          >
            Adjust prices
          </button>
        </div>

        <button
          type="button"
          onClick={onClear}
          className="text-canvas/60 hover:text-canvas cursor-pointer text-xs font-medium ml-1 transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
