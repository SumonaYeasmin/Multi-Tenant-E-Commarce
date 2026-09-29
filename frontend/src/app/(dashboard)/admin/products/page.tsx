'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ProductPageHeader,
  ProductTabs,
  ProductFilters,
  ProductTable,
  ProductBulkBar,
  type ProductTab,
  type StockFilter,
} from '@/components/dashboard/admin/products';
import { products as initialProducts } from '@/data/products';
import { productStock, LOW_STOCK_THRESHOLD } from '@/utils/pricing';
import type { Product, ProductStatus } from '@/types/product';

export default function AdminProductsPage() {
  const router = useRouter();
  const [productList, setProductList] = useState<Product[]>(initialProducts);
  const [tab, setTab] = useState<ProductTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStock, setSelectedStock] = useState<StockFilter>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filter products by tab, category, stock level, and search query
  const filteredProducts = useMemo(() => {
    return productList.filter((p) => {
      const s = productStock(p);
      const matchesTab = tab === 'all' || p.status === tab;
      const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesStock =
        selectedStock === 'all' ||
        (selectedStock === 'out'
          ? s === 0 && !p.preorder
          : s > 0 && s <= LOW_STOCK_THRESHOLD * 2);
      const matchesSearch =
        !searchQuery ||
        `${p.title} ${p.variants.map((v) => v.sku).join(' ')} ${p.brand}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      return matchesTab && matchesCat && matchesStock && matchesSearch;
    });
  }, [productList, tab, selectedCategory, selectedStock, searchQuery]);

  // Bulk status update
  const handleBulkStatus = (status: ProductStatus) => {
    setProductList((prev) =>
      prev.map((p) => (selectedIds.includes(p.id) ? { ...p, status } : p))
    );
    toast.success(`${selectedIds.length} products set to ${status}`);
    setSelectedIds([]);
  };

  // Bulk price adjustment demo
  const handleAdjustPrices = () => {
    toast.success('Price update applied: −10% to selected');
    setSelectedIds([]);
  };

  const totalVariants = productList.reduce((sum, p) => sum + p.variants.length, 0);

  return (
    <div className="mx-auto max-w-7xl">
      {/* Page Header with title and Add Product action (import/export excluded) */}
      <ProductPageHeader
        title="Products"
        totalProducts={productList.length}
        totalVariants={totalVariants}
      />

      {/* Main Table Card Container */}
      <div className="rounded-lg border border-line bg-surface shadow-xs overflow-hidden">
        {/* Status Tabs */}
        <ProductTabs
          currentTab={tab}
          onTabChange={(newTab) => {
            setTab(newTab);
            setSelectedIds([]);
          }}
          products={productList}
        />

        {/* Search & Select Filters */}
        <ProductFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedStock={selectedStock}
          onStockChange={setSelectedStock}
        />

        {/* Product Table with Checkboxes & Responsive Mobile Cards */}
        <ProductTable
          products={filteredProducts}
          selectedIds={selectedIds}
          onSelectedChange={setSelectedIds}
          onRowClick={(p) => router.push(`/admin/products/${p.id}`)}
        />
      </div>

      {/* Floating Bulk Actions Toolbar */}
      <ProductBulkBar
        selectedCount={selectedIds.length}
        onClear={() => setSelectedIds([])}
        onBulkStatusChange={handleBulkStatus}
        onAdjustPrices={handleAdjustPrices}
      />
    </div>
  );
}
