'use client';

import React from 'react';
import { Tabs, type TabItem } from '@/components/ui/Tabs';
import type { Product, ProductStatus } from '@/types/product';

export type ProductTab = 'all' | ProductStatus;

interface ProductTabsProps {
  currentTab: ProductTab;
  onTabChange: (tab: ProductTab) => void;
  products: Product[];
}

export function ProductTabs({
  currentTab,
  onTabChange,
  products,
}: ProductTabsProps) {
  const tabs: TabItem<ProductTab>[] = [
    { value: 'all', label: 'All', count: products.length },
    { value: 'published', label: 'Published' },
    {
      value: 'draft',
      label: 'Draft',
      count: products.filter((p) => p.status === 'draft').length,
    },
    { value: 'archived', label: 'Archived' },
  ];

  return (
    <div className="px-4 pt-2">
      <Tabs value={currentTab} onChange={onTabChange} tabs={tabs} />
    </div>
  );
}
