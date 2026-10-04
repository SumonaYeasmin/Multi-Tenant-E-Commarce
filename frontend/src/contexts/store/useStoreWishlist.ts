'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { wishlistService } from '@/services';
import { loadWishlist } from './utils';
import type { User } from './types';

export function useStoreWishlist(user: User | null) {
  const [wishlist, setWishlist] = useState<string[]>(() => loadWishlist());

  // Sync wishlist to local storage
  useEffect(() => {
    try {
      localStorage.setItem('tanti.wishlist', JSON.stringify(wishlist));
    } catch {}
  }, [wishlist]);

  // Fetch real wishlist from server if user is logged in
  useEffect(() => {
    let isMounted = true;
    if (user?.id) {
      wishlistService
        .getWishlist()
        .then((res) => {
          if (!isMounted) return;
          if (res?.data && Array.isArray(res.data)) {
            const dbWishlistIds = res.data
              .map((item) => item.product?.id)
              .filter(Boolean) as string[];
            if (dbWishlistIds.length > 0) {
              setWishlist(dbWishlistIds);
            }
          }
        })
        .catch((err) => {
          console.error('Failed to load wishlist from backend:', err);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const toggleWishlist = useCallback(
    (productId: string) => {
      // 1. Optimistic UI update
      setWishlist((prev) =>
        prev.includes(productId)
          ? prev.filter((x) => x !== productId)
          : [...prev, productId]
      );

      // 2. If authenticated, persist to backend database
      if (user?.id) {
        wishlistService.toggleWishlist(productId).catch((err) => {
          console.error('Failed to sync wishlist with server:', err);
          toast.error('Failed to update wishlist');
          // Rollback on failure
          setWishlist((prev) =>
            prev.includes(productId)
              ? prev.filter((x) => x !== productId)
              : [...prev, productId]
          );
        });
      }
    },
    [user?.id]
  );

  return {
    wishlist,
    setWishlist,
    toggleWishlist,
  };
}
