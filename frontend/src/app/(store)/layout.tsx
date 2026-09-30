import React from 'react';
import { StoreProvider } from '@/contexts/StoreContext';
import { StoreHeader } from '@/components/store/StoreHeader';
import { StoreFooter } from '@/components/store/StoreFooter';
import { MiniCart } from '@/components/store/MiniCart';
import { SearchOverlay } from '@/components/store/SearchOverlay';
import { QuickView } from '@/components/store/QuickView';
import { CompareDrawer } from '@/components/store/CompareDrawer';
import { CookieBanner } from '@/components/store/CookieBanner';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StoreProvider>
      <div className="flex min-h-screen w-full flex-col bg-canvas text-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-ink focus:px-3 focus:py-2 focus:text-canvas"
        >
          Skip to content
        </a>
        <StoreHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <StoreFooter />
        <MiniCart />
        <SearchOverlay />
        <QuickView />
        <CompareDrawer />
        <CookieBanner />
      </div>
    </StoreProvider>
  );
}
