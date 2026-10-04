'use client';

import React from 'react';
import { Checkbox } from '@/components/ui/Checkbox';
import { cn } from '@/utils/cn';

export interface FilterState {
  categories: string[];
  brands: string[];
  sizes: string[];
  colors: string[];
  minPrice: string;
  maxPrice: string;
  inStock: boolean;
  onSale: boolean;
  minRating: number;
}

export const emptyFilters: FilterState = {
  categories: [],
  brands: [],
  sizes: [],
  colors: [],
  minPrice: '',
  maxPrice: '',
  inStock: false,
  onSale: false,
  minRating: 0,
};

export interface ShopFiltersProps {
  value: FilterState;
  onChange: (f: FilterState) => void;
  facets: {
    categories: { key: string; label: string; count: number }[];
    brands: { key: string; count: number }[];
    sizes: string[];
    colors: { name: string; hex: string }[];
  };
  hideCategory?: boolean;
}

function toggle(list: string[], v: string) {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-b border-line py-5 first:pt-0">
      <legend className="mb-3 text-sm font-medium text-ink">{title}</legend>
      {children}
    </fieldset>
  );
}

export function ShopFilters({
  value,
  onChange,
  facets,
  hideCategory,
}: ShopFiltersProps) {
  const set = (patch: Partial<FilterState>) => onChange({ ...value, ...patch });

  return (
    <div>
      {!hideCategory && (
        <Group title="Category">
          <div className="space-y-2.5">
            {facets.categories.map((c) => (
              <Checkbox
                key={c.key}
                checked={value.categories.includes(c.key)}
                onChange={() => set({ categories: toggle(value.categories, c.key) })}
                label={
                  <span className="flex w-full justify-between gap-3 text-ink">
                    {c.label}
                    <span className="text-ink-muted tabular-nums">{c.count}</span>
                  </span>
                }
                className="w-full [&>span:last-child]:flex-1 cursor-pointer"
              />
            ))}
          </div>
        </Group>
      )}

      <Group title="Price (৳)">
        <div className="flex items-center gap-2">
          <input
            aria-label="Minimum price"
            inputMode="numeric"
            placeholder="Min"
            value={value.minPrice}
            onChange={(e) =>
              set({ minPrice: e.target.value.replace(/\D/g, '') })
            }
            className="h-9 w-full rounded-md border border-line-strong bg-surface px-2.5 text-sm text-ink focus:border-clay focus:outline-none"
          />
          <span className="text-ink-muted">–</span>
          <input
            aria-label="Maximum price"
            inputMode="numeric"
            placeholder="Max"
            value={value.maxPrice}
            onChange={(e) =>
              set({ maxPrice: e.target.value.replace(/\D/g, '') })
            }
            className="h-9 w-full rounded-md border border-line-strong bg-surface px-2.5 text-sm text-ink focus:border-clay focus:outline-none"
          />
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {[
            ['', '2000', 'Under 2k'],
            ['2000', '5000', '2k–5k'],
            ['5000', '', '5k+'],
          ].map(([min, max, label]) => (
            <button
              key={label}
              type="button"
              onClick={() => set({ minPrice: min, maxPrice: max })}
              className={cn(
                'rounded-full border px-2.5 py-1 text-xs cursor-pointer transition-colors',
                value.minPrice === min && value.maxPrice === max
                  ? 'border-ink bg-ink text-canvas font-medium'
                  : 'border-line-strong hover:border-ink text-ink'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </Group>

      <Group title="Size">
        <div className="grid grid-cols-4 gap-1.5">
          {facets.sizes.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={value.sizes.includes(s)}
              onClick={() => set({ sizes: toggle(value.sizes, s) })}
              className={cn(
                'h-8 rounded border text-xs cursor-pointer transition-colors font-medium',
                value.sizes.includes(s)
                  ? 'border-ink bg-ink text-canvas'
                  : 'border-line-strong bg-surface hover:border-ink text-ink'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </Group>

      <Group title="Colour">
        <div className="flex flex-wrap gap-2">
          {facets.colors.map((c) => (
            <button
              key={c.name}
              type="button"
              title={c.name}
              aria-label={c.name}
              aria-pressed={value.colors.includes(c.name)}
              onClick={() => set({ colors: toggle(value.colors, c.name) })}
              className={cn(
                'h-7 w-7 rounded-full border-2 p-0.5 cursor-pointer transition-colors',
                value.colors.includes(c.name)
                  ? 'border-ink'
                  : 'border-transparent hover:border-line-strong'
              )}
            >
              <span
                className="block h-full w-full rounded-full border border-ink/10"
                style={{ backgroundColor: c.hex }}
              />
            </button>
          ))}
        </div>
      </Group>

      <Group title="Brand">
        <div className="space-y-2.5">
          {facets.brands.map((b) => (
            <Checkbox
              key={b.key}
              checked={value.brands.includes(b.key)}
              onChange={() => set({ brands: toggle(value.brands, b.key) })}
              label={`${b.key} (${b.count})`}
              className="cursor-pointer text-ink"
            />
          ))}
        </div>
      </Group>

      <Group title="Rating">
        <div className="flex gap-1.5">
          {[0, 4, 4.5].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => set({ minRating: r })}
              className={cn(
                'rounded-full border px-2.5 py-1 text-xs cursor-pointer transition-colors font-medium',
                value.minRating === r
                  ? 'border-ink bg-ink text-canvas'
                  : 'border-line-strong hover:border-ink text-ink'
              )}
            >
              {r === 0 ? 'Any' : `${r}★ & up`}
            </button>
          ))}
        </div>
      </Group>

      <Group title="Availability">
        <div className="space-y-2.5">
          <Checkbox
            checked={value.inStock}
            onChange={(v) => set({ inStock: v })}
            label="In stock only"
            className="cursor-pointer text-ink"
          />
          <Checkbox
            checked={value.onSale}
            onChange={(v) => set({ onSale: v })}
            label="On sale"
            className="cursor-pointer text-ink"
          />
        </div>
      </Group>
    </div>
  );
}
