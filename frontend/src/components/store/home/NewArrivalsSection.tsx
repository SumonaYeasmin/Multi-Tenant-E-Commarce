'use client';

import React from 'react';
import { SectionHeading } from '@/components/store/SectionHeading';
import { ProductCard } from '@/components/store/ProductCard';
import { Product } from '@/types';

export interface NewArrivalsSectionProps {
  products: Product[];
  limit?: number;
}

export function NewArrivalsSection({
  products,
  limit = 4,
}: NewArrivalsSectionProps) {
  const live = products.filter((p) => p.status === 'published');
  const newArrivals = [...live].filter((p) => p.isNew).slice(0, limit);

  if (newArrivals.length === 0) return null;

  return (
    <section
      className="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8"
      aria-labelledby="new-h"
    >
      <SectionHeading
        id="new-h"
        title="New arrivals"
        link={{ to: '/shop?sort=newest', label: 'Shop new' }}
      />
      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
        {newArrivals.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
