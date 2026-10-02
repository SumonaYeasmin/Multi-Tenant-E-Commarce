'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { Panel } from '@/components/dashboard/shared/Panel';
import { Button } from '@/components/ui/button';
import { BrandRow, type BrandItem } from './BrandRow';
import { CreateBrandModal } from './CreateBrandModal';
import type { Product } from '@/types/product';

interface BrandsManagerProps {
  initialBrands: BrandItem[];
  products: Product[];
}

export function BrandsManager({
  initialBrands,
  products,
}: BrandsManagerProps) {
  const [brandList, setBrandList] = useState<BrandItem[]>(initialBrands);
  const [modalOpen, setModalOpen] = useState(false);

  const handleCreateBrand = (newBrand: BrandItem) => {
    setBrandList((prev) => [newBrand, ...prev]);
  };

  return (
    <div className="w-full space-y-6">
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

      <Panel
        title="All brands"
        description="Curated labels and partners featured in your storefront catalog."
        flush
      >
        <ul className="divide-y divide-line">
          {brandList.map((brand) => (
            <BrandRow
              key={brand.slug}
              brand={brand}
              products={products}
            />
          ))}
        </ul>
      </Panel>

      <CreateBrandModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreateBrand={handleCreateBrand}
      />
    </div>
  );
}
