'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Search, Award, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { Panel } from '@/components/dashboard/shared/Panel';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/EmptyState';
import { BrandRow, type BrandItem } from './BrandRow';
import { CreateBrandModal } from './CreateBrandModal';
import { brandService } from '@/services/brand-service';
import type { Product } from '@/types/product';
import { cn } from '@/lib/utils';

interface BrandsManagerProps {
  initialBrands: BrandItem[];
  products: Product[];
}

type FilterTab = 'all' | 'active' | 'inactive';
type SortOption = 'default' | 'name-asc' | 'products-desc';

export function BrandsManager({
  initialBrands,
  products,
}: BrandsManagerProps) {
  const [brandList, setBrandList] = useState<BrandItem[]>(initialBrands);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [sortBy, setSortBy] = useState<SortOption>('default');

  // Fetch real brands from backend database
  const fetchBrands = useCallback(async () => {
    try {
      setLoading(true);
      const res = await brandService.getBrands(
        'e0f8bdb1-da0a-4907-9d82-08ef1be77ac2'
      );
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        const backendBrands: BrandItem[] = res.data.map((b) => ({
          id: b.id,
          name: b.name,
          slug: b.slug,
          description: b.description,
          logo: b.logo,
          isActive: b.isActive,
          createdAt: b.createdAt,
          updatedAt: b.updatedAt,
          _count: b._count,
        }));
        setBrandList(backendBrands);
      }
    } catch (error) {
      console.error('Failed to fetch brands from DB:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const handleCreateBrand = (newBrand: BrandItem) => {
    setBrandList((prev) => [newBrand, ...prev.filter((b) => b.slug !== newBrand.slug)]);
    fetchBrands();
  };

  // Tab counts
  const counts = useMemo(() => {
    return {
      all: brandList.length,
      active: brandList.filter((b) => b.isActive !== false).length,
      inactive: brandList.filter((b) => b.isActive === false).length,
    };
  }, [brandList]);

  // Filtered & Sorted brands
  const filteredBrands = useMemo(() => {
    let list = [...brandList];

    // Tab filter
    if (activeTab === 'active') {
      list = list.filter((b) => b.isActive !== false);
    } else if (activeTab === 'inactive') {
      list = list.filter((b) => b.isActive === false);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.description?.toLowerCase().includes(q) ||
          b.slug.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sortBy === 'name-asc') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'products-desc') {
      list.sort((a, b) => {
        const countA =
          a._count?.products ??
          products.filter((p) => p.brand === a.slug || p.brand === a.name).length;
        const countB =
          b._count?.products ??
          products.filter((p) => p.brand === b.slug || p.brand === b.name).length;
        return countB - countA;
      });
    }

    return list;
  }, [brandList, activeTab, searchQuery, sortBy, products]);

  return (
    <div className="w-full space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Brands"
        description="Each brand gets its own storefront page, product showcase, and filter."
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setModalOpen(true)}
            className="cursor-pointer"
          >
            <Plus className="h-4 w-4" aria-hidden />
            <span>Add brand</span>
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-3.5 sm:flex-row sm:items-center sm:justify-between">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'all'}
            onClick={() => setActiveTab('all')}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer',
              activeTab === 'all'
                ? 'bg-ink text-canvas shadow-xs'
                : 'text-ink-muted hover:bg-subtle hover:text-ink'
            )}
          >
            All ({counts.all})
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'active'}
            onClick={() => setActiveTab('active')}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer',
              activeTab === 'active'
                ? 'bg-ink text-canvas shadow-xs'
                : 'text-ink-muted hover:bg-subtle hover:text-ink'
            )}
          >
            Active ({counts.active})
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'inactive'}
            onClick={() => setActiveTab('inactive')}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer',
              activeTab === 'inactive'
                ? 'bg-ink text-canvas shadow-xs'
                : 'text-ink-muted hover:bg-subtle hover:text-ink'
            )}
          >
            Inactive ({counts.inactive})
          </button>
        </div>

        {/* Search & Sort Inputs */}
        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-60">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-muted" />
            <input
              type="text"
              placeholder="Search brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8.5 w-full rounded-lg border border-line bg-canvas/60 pl-8.5 pr-3 text-xs text-ink placeholder:text-ink-muted focus:border-clay focus:outline-none focus:ring-1 focus:ring-clay/30"
            />
          </div>

          {/* Sort Dropdown */}
          <select
            aria-label="Sort brands"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="h-8.5 rounded-lg border border-line bg-canvas/60 px-2.5 text-xs text-ink focus:border-clay focus:outline-none cursor-pointer"
          >
            <option value="default">Sort: Default</option>
            <option value="name-asc">Sort: Name (A-Z)</option>
            <option value="products-desc">Sort: Most products</option>
          </select>
        </div>
      </div>

      {/* Brands Panel / List */}
      <Panel
        title="All brands"
        description="Curated labels and partners featured in your storefront catalog."
        flush
      >
        {filteredBrands.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Award}
              title={searchQuery ? 'No brands found' : 'No brands in this view'}
              description={
                searchQuery
                  ? `No brands match "${searchQuery}". Try a different search term or clear filters.`
                  : 'Create a new brand or switch tabs to view other brands.'
              }
              action={
                searchQuery ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                    className="cursor-pointer"
                  >
                    Clear search
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setModalOpen(true)}
                    className="cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add brand</span>
                  </Button>
                )
              }
            />
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {filteredBrands.map((brand) => (
              <BrandRow
                key={brand.slug}
                brand={brand}
                products={products}
              />
            ))}
          </ul>
        )}
      </Panel>

      <CreateBrandModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreateBrand={handleCreateBrand}
      />
    </div>
  );
}

