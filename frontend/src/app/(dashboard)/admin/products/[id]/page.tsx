'use client';

import React from 'react';
import { ProductEditor } from '@/components/dashboard/admin/products/ProductEditor';
import { ModuleGate } from '@/components/dashboard/shared/ModuleGate';

export default function AdminProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);

  return (
    <ModuleGate module="products">
      <React.Suspense
        fallback={
          <div className="mx-auto max-w-6xl py-12 text-center text-sm text-ink-muted">
            Loading editor...
          </div>
        }
      >
        <ProductEditor id={id} />
      </React.Suspense>
    </ModuleGate>
  );
}
