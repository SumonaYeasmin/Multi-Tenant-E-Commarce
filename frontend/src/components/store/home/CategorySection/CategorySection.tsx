'use client';

import React, { useState, useEffect } from 'react';
import { SectionHeading } from '@/components/store/shared/SectionHeading';
import { useStore } from '@/contexts/StoreContext';
import { categoryService, type CategoryResponseData } from '@/services';
import { CategoryGrid } from './CategoryGrid';
import { CategorySkeleton } from './CategorySkeleton';
import { CategoryCardProps } from './CategoryCard';

export interface CategorySectionProps {
  title?: string;
  className?: string;
}

export function CategorySection({
  title = 'Shop by category',
  className = 'mx-auto mt-20 max-w-7xl px-4 sm:px-6 lg:px-8',
}: CategorySectionProps) {
  const { categories: fallbackCategories } = useStore();
  const [categories, setCategories] = useState<CategoryCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      try {
        setIsLoading(true);
        const res = await categoryService.getCategories();
        if (!isMounted) return;

        if (res?.data && res.data.length > 0) {
          // Filter top-level active categories
          const activeParents = res.data.filter(
            (c: CategoryResponseData) => !c.parentId && c.isActive !== false
          );
          const targetList = activeParents.length > 0 ? activeParents : res.data;

          const mapped: CategoryCardProps[] = targetList.map((c) => ({
            id: c.id,
            slug: c.slug || c.id,
            name: c.name,
            image: c.image || undefined,
            blurb: c.description || `${c.name} collection`,
          }));

          setCategories(mapped);
        } else {
          // Fallback to static mock categories if database empty
          setCategories(
            fallbackCategories.map((c) => ({
              slug: c.key,
              name: c.name,
              image: c.image,
              blurb: c.blurb,
            }))
          );
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
        if (isMounted) {
          setCategories(
            fallbackCategories.map((c) => ({
              slug: c.key,
              name: c.name,
              image: c.image,
              blurb: c.blurb,
            }))
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, [fallbackCategories]);

  return (
    <section className={className} aria-labelledby="cat-h">
      <SectionHeading id="cat-h" title={title} />
      {isLoading ? (
        <CategorySkeleton count={5} />
      ) : (
        <CategoryGrid categories={categories} />
      )}
    </section>
  );
}
