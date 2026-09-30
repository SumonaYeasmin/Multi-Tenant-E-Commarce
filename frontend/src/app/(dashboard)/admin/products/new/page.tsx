'use client';

import React from 'react';
import { ProductEditor } from '@/components/dashboard/admin/products/ProductEditor';
import { ModuleGate } from '@/components/dashboard/shared/ModuleGate';

export default function AdminNewProductPage() {
  return (
    <ModuleGate module="products" action="create">
      <React.Suspense
        fallback={
          <div className="mx-auto max-w-6xl py-12 text-center text-sm text-ink-muted">
            Loading editor...
          </div>
        }
      >
        <ProductEditor />
      </React.Suspense>
    </ModuleGate>
  );
}
