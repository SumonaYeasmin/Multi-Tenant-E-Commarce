'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { CollectionCard } from './CollectionCard';
import { CreateCollectionModal } from './CreateCollectionModal';
import type { CollectionItem } from '@/types/collection';
import type { Product } from '@/types/product';

interface CollectionsManagerProps {
  initialCollections: CollectionItem[];
  products: Product[];
}

export function CollectionsManager({
  initialCollections,
  products,
}: CollectionsManagerProps) {
  const [collectionsList, setCollectionsList] =
    useState<CollectionItem[]>(initialCollections);
  const [creating, setCreating] = useState(false);

  const handleCreateCollection = (newCol: CollectionItem) => {
    setCollectionsList((prev) => [newCol, ...prev]);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Collections"
        description="Group products for campaigns and navigation — pick them by hand or let rules keep them up to date."
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setCreating(true)}
            className="cursor-pointer"
          >
            <Plus className="h-4 w-4" aria-hidden />
            <span>Create collection</span>
          </Button>
        }
      />

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {collectionsList.map((col) => {
          const productCount = products.filter((p) =>
            p.collections?.includes(col.slug)
          ).length;

          return (
            <CollectionCard
              key={col.slug}
              collection={col}
              productCount={productCount}
            />
          );
        })}
      </ul>

      <CreateCollectionModal
        open={creating}
        onClose={() => setCreating(false)}
        products={products}
        onCreateCollection={handleCreateCollection}
      />
    </div>
  );
}
