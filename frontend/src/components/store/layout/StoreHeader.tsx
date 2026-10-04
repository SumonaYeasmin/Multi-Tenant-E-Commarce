'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  HeartIcon,
  MenuIcon,
  SearchIcon,
  ShoppingBagIcon,
  UserIcon,
  ChevronRightIcon,
} from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { useTenant } from '@/contexts/TenantContext';
import { announcement } from '@/data/content';
import { collections } from '@/data/products';
import { Drawer } from '@/components/ui/Drawer';
import { cn } from '@/utils/cn';

export function StoreHeader() {
  const pathname = usePathname();
  const { tenant } = useTenant();
  const { cart, wishlist, user, setMiniCartOpen, setSearchOpen, categories } =
    useStore();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const count = cart
    .filter((i) => !i.savedForLater)
    .reduce((s, i) => s + i.qty, 0);

  return (
    <header className="sticky top-0 z-30 bg-canvas/95 backdrop-blur-md border-b border-line">
      {/* Announcement Bar */}
      <div className="bg-ink text-canvas text-xs py-1.5 px-4 text-center font-medium tracking-wide">
        {announcement}
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 text-ink hover:text-clay cursor-pointer"
            aria-label="Open navigation"
          >
            <MenuIcon className="h-6 w-6" />
          </button>

          {/* Store Logo */}
          <Link href="/" className="font-display text-2xl font-bold tracking-tight text-ink">
            {tenant.name}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link
              href="/shop"
              className={cn(
                'text-sm font-medium transition-colors hover:text-clay',
                pathname === '/shop' ? 'text-clay' : 'text-ink'
              )}
            >
              All Products
            </Link>
            {categories.slice(0, 5).map((cat) => (
              <div
                key={cat.key}
                className="relative"
                onMouseEnter={() => setOpenMenu(cat.key)}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <Link
                  href={`/category/${cat.key}`}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-clay py-2 inline-block',
                    pathname.startsWith(`/category/${cat.key}`)
                      ? 'text-clay'
                      : 'text-ink'
                  )}
                >
                  {cat.name}
                </Link>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {openMenu === cat.key && cat.subcategories.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-full w-48 rounded-md border border-line bg-surface p-2 shadow-pop"
                    >
                      {cat.subcategories.map((sub) => (
                        <Link
                          key={sub}
                          href={`/category/${cat.key}?sub=${encodeURIComponent(
                            sub
                          )}`}
                          className="block rounded px-3 py-2 text-xs font-medium text-ink-soft hover:bg-subtle hover:text-ink transition-colors"
                        >
                          {sub}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>

          {/* Actions: Search, Wishlist, Account, Cart */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="p-2 text-ink hover:text-clay cursor-pointer transition-colors"
              aria-label="Search"
            >
              <SearchIcon className="h-5 w-5" />
            </button>

            <Link
              href="/account/wishlist"
              className="relative p-2 text-ink hover:text-clay cursor-pointer transition-colors"
              aria-label={`Wishlist (${wishlist.length} items)`}
            >
              <HeartIcon className="h-5 w-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-clay text-[10px] font-bold text-white">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link
              href={user ? '/account' : '/login'}
              className="p-2 text-ink hover:text-clay cursor-pointer transition-colors"
              aria-label="Account"
            >
              <UserIcon className="h-5 w-5" />
            </Link>

            <button
              type="button"
              onClick={() => setMiniCartOpen(true)}
              className="relative p-2 text-ink hover:text-clay cursor-pointer transition-colors"
              aria-label={`Bag (${count} items)`}
            >
              <ShoppingBagIcon className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-canvas">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        title="Menu"
      >
        <div className="space-y-4 py-4">
          <Link
            href="/shop"
            onClick={() => setMobileOpen(false)}
            className="block text-base font-medium text-ink hover:text-clay"
          >
            All Products
          </Link>
          <div className="border-t border-line pt-4 space-y-3">
            <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
              Categories
            </p>
            {categories.map((cat) => (
              <div key={cat.key} className="space-y-1">
                <Link
                  href={`/category/${cat.key}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between text-sm font-medium text-ink hover:text-clay py-1"
                >
                  <span>{cat.name}</span>
                  <ChevronRightIcon className="h-4 w-4 text-ink-muted" />
                </Link>
              </div>
            ))}
          </div>

          <div className="border-t border-line pt-4 space-y-2">
            <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
              Collections
            </p>
            {collections.slice(0, 4).map((col) => (
              <Link
                key={col.slug}
                href={`/collections/${col.slug}`}
                onClick={() => setMobileOpen(false)}
                className="block text-sm text-ink-soft hover:text-ink py-1"
              >
                {col.name}
              </Link>
            ))}
          </div>
        </div>
      </Drawer>
    </header>
  );
}
