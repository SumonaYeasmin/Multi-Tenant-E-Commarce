import { Metadata } from 'next';
import { collections, products } from '@/data/products';
import { CollectionsManager } from '@/components/dashboard/admin/collections';
import type { CollectionItem } from '@/types/collection';

export const metadata: Metadata = {
  title: 'Collections | Admin Dashboard',
  description:
    'Group products for campaigns and navigation — pick them by hand or let rules keep them up to date.',
};

export default function AdminCollectionsPage() {
  return (
    <div className="w-full">
      <CollectionsManager
        initialCollections={collections as CollectionItem[]}
        products={products}
      />
    </div>
  );
}
