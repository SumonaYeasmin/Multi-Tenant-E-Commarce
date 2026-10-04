'use client';

import React from 'react';
import { useStore } from '@/contexts/StoreContext';
import {
  HeroBanner,
  CategorySection,
  Bestsellers,
  SummerLinenSpotlight,
  NewArrivals,
  TrustPoints,
  Testimonials,
  Recommended,
} from '@/components/store/home';

export default function HomePage() {
  const { products, recentlyViewed } = useStore();

  return (
    <div className="pb-16">
      {/* 1. Hero Collection Banner */}
      <HeroBanner />

      {/* 2. Shop by Category (Live Database Categories) */}
      <CategorySection />

      {/* 3. Bestsellers Products */}
      <Bestsellers products={products} />

      {/* 4. Summer Linen Spotlight */}
      <SummerLinenSpotlight />

      {/* 5. New Arrivals */}
      <NewArrivals products={products} />

      {/* 6. Why Tanti Trust Points */}
      <TrustPoints />

      {/* 7. Customer Testimonials */}
      <Testimonials />

      {/* 8. Picked For You (Browsing History Based) */}
      <Recommended products={products} recentlyViewed={recentlyViewed} />
    </div>
  );
}
