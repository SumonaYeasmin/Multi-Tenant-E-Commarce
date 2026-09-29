'use client';

import React, { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { CategoryTree, type CategoryItemData } from './CategoryTree';
import { CategoryDetailPanel } from './CategoryDetailPanel';
import type { Product } from '@/types/product';

interface CategoryManagerProps {
  initialCategories: CategoryItemData[];
  products: Product[];
}

export function CategoryManager({ initialCategories, products }: CategoryManagerProps) {
  const [categoriesList] = useState<CategoryItemData[]>(initialCategories);
  const [openKeys, setOpenKeys] = useState<string[]>(['women', 'men']);
  const [activeKey, setActiveKey] = useState<string>(
    initialCategories[0]?.key || 'women'
  );

  const activeCategory = useMemo(() => {
    return (
      categoriesList.find((c) => c.key === activeKey) ||
      categoriesList[0] || {
        key: 'default',
        name: 'Default',
        image: '',
        blurb: '',
        subcategories: [],
      }
    );
  }, [categoriesList, activeKey]);

  const getProductCount = (categoryKey: string, subcategory?: string) => {
    return products.filter(
      (p) =>
        p.category === categoryKey && (!subcategory || p.subcategory === subcategory)
    ).length;
  };

  const handleToggleKey = (key: string) => {
    setOpenKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleAddCategory = () => {
    toast.success('New category created as draft');
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Categories"
        description="Hierarchical categories power navigation, filters and breadcrumbs."
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={handleAddCategory}
            className="cursor-pointer"
          >
            <Plus className="h-4 w-4" aria-hidden />
            <span>Add category</span>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[340px_1fr] items-stretch">
        {/* Left column: Tree navigation */}
        <CategoryTree
          categories={categoriesList}
          activeKey={activeKey}
          onSelectCategory={setActiveKey}
          openKeys={openKeys}
          onToggleKey={handleToggleKey}
          getProductCount={getProductCount}
          className="h-full min-h-[520px]"
        />

        {/* Right column: Category Editor (SEO card omitted) */}
        <div className="w-full space-y-6">
          <CategoryDetailPanel
            key={activeCategory.key}
            category={activeCategory}
            productCount={getProductCount(activeCategory.key)}
          />
        </div>
      </div>
    </div>
  );
}
