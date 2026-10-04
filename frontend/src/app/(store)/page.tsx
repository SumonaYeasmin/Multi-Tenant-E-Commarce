'use client';

import React from 'react';
import { useStore } from '@/contexts/StoreContext';
import { CategorySection } from '@/components/store/categories';
import {
  HeroBanner,
  BestsellersSection,
  SummerLinenSpotlight,
  NewArrivalsSection,
  TrustPointsSection,
  TestimonialsSection,
  RecommendedSection,
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
      <BestsellersSection products={products} />

      {/* 4. Summer Linen Spotlight */}
      <SummerLinenSpotlight />

      {/* 5. New Arrivals */}
      <NewArrivalsSection products={products} />

      {/* 6. Why Tanti Trust Points */}
      <TrustPointsSection />

      {/* 7. Customer Testimonials */}
      <TestimonialsSection />

      {/* 8. Picked For You (Browsing History Based) */}
      <RecommendedSection products={products} recentlyViewed={recentlyViewed} />
    </div>
  );
}
