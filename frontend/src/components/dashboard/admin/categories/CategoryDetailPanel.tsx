'use client';

import React from 'react';
import { toast } from 'sonner';
import { Panel } from '@/components/dashboard/shared/Panel';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/button';
import type { CategoryItemData } from './CategoryTree';

interface CategoryDetailPanelProps {
  category: CategoryItemData;
  productCount: number;
}

export function CategoryDetailPanel({
  category,
  productCount,
}: CategoryDetailPanelProps) {
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Category "${category.name}" saved successfully`);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <Panel
        title={category.name}
        description={`/category/${category.key} · ${productCount} products`}
      >
        <div className="grid gap-5 sm:grid-cols-[160px_1fr]">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md border border-line bg-subtle">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={category.image}
              alt={category.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="space-y-4">
            <Input
              label="Name"
              defaultValue={category.name}
              key={`n-${category.key}`}
              placeholder="Category name"
              required
            />
            <Textarea
              label="Description"
              rows={3}
              defaultValue={category.blurb}
              key={`d-${category.key}`}
              placeholder="Brief description of this category"
            />
            <Input
              label="Parent"
              defaultValue="— None (top level)"
              disabled
              key={`p-${category.key}`}
              hint="Top level categories have no parent category"
            />
          </div>
        </div>
      </Panel>

      {/* Note: SEO Card is omitted as requested by the user */}

      <div className="flex justify-end">
        <Button type="submit" variant="primary" size="md">
          Save category
        </Button>
      </div>
    </form>
  );
}
