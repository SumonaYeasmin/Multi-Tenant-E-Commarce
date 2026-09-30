'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { CategoryTree } from './CategoryTree';
import { CategoryDetailPanel } from './CategoryDetailPanel';
import type { CategoryItemData } from '@/types/commerce';
import type { Product } from '@/types/product';

interface CategoryManagerProps {
  initialCategories: CategoryItemData[];
  products: Product[];
}

export function CategoryManager({ initialCategories, products }: CategoryManagerProps) {
  const store = useStore();
  const categoriesList =
    store?.categories && store.categories.length > 0
      ? store.categories
      : initialCategories;
  const productsList =
    store?.products && store.products.length > 0 ? store.products : products;

  const [openKeys, setOpenKeys] = useState<string[]>(['women', 'men']);
  const [activeKey, setActiveKey] = useState<string>(
    categoriesList[0]?.key || 'women'
  );
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);

  // If the active category gets deleted or is invalid, select the first available
  useEffect(() => {
    if (
      categoriesList.length > 0 &&
      !categoriesList.some((c) => c.key === activeKey)
    ) {
      setActiveKey(categoriesList[0].key);
      setActiveSubcategory(null);
    }
  }, [categoriesList, activeKey]);

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

  // If active subcategory is deleted or no longer belongs to active category
  useEffect(() => {
    if (
      activeSubcategory &&
      activeCategory &&
      !activeCategory.subcategories.includes(activeSubcategory)
    ) {
      setActiveSubcategory(null);
    }
  }, [activeCategory, activeSubcategory]);

  const getProductCount = (categoryKey: string, subcategory?: string) => {
    return productsList.filter(
      (p) =>
        p.category === categoryKey && (!subcategory || p.subcategory === subcategory)
    ).length;
  };

  const handleToggleKey = (key: string) => {
    setOpenKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSelectCategory = (key: string) => {
    setActiveKey(key);
    setActiveSubcategory(null);
    if (!openKeys.includes(key)) {
      setOpenKeys((prev) => [...prev, key]);
    }
  };

  const handleSelectSubcategory = (categoryKey: string, subcategory: string | null) => {
    setActiveKey(categoryKey);
    setActiveSubcategory(subcategory);
    if (!openKeys.includes(categoryKey)) {
      setOpenKeys((prev) => [...prev, categoryKey]);
    }
  };

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title="Categories"
        description="Hierarchical categories power navigation, filters, product tagging and breadcrumbs."
        actions={
          <Button
            variant="primary"
            size="sm"
            href="/admin/categories/new"
            className="cursor-pointer"
          >
            <Plus className="h-4 w-4" aria-hidden />
            <span>Add category</span>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr] items-start">
        {/* Left column: Tree navigation */}
        <div className="sticky top-6">
          <CategoryTree
            categories={categoriesList}
            activeKey={activeKey}
            onSelectCategory={handleSelectCategory}
            activeSubcategory={activeSubcategory}
            onSelectSubcategory={handleSelectSubcategory}
            openKeys={openKeys}
            onToggleKey={handleToggleKey}
            getProductCount={getProductCount}
            className="h-full min-h-[520px]"
          />
        </div>

        {/* Right column: Category / Subcategory Detail Panel */}
        <div className="w-full space-y-6">
          <CategoryDetailPanel
            key={`${activeCategory.key}-${activeSubcategory || 'main'}`}
            category={activeCategory}
            activeSubcategory={activeSubcategory}
            onSelectSubcategory={setActiveSubcategory}
            onSelectCategory={handleSelectCategory}
            allCategories={categoriesList}
            products={productsList}
            productCount={getProductCount(
              activeCategory.key,
              activeSubcategory || undefined
            )}
            getProductCount={getProductCount}
          />
        </div>
      </div>
    </div>
  );
}
