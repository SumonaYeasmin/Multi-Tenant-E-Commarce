'use client';

import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Panel } from '@/components/dashboard/shared/Panel';

export interface CategoryItemData {
  key: string;
  name: string;
  image: string;
  blurb: string;
  subcategories: string[];
}

interface CategoryTreeProps {
  categories: CategoryItemData[];
  activeKey: string;
  onSelectCategory: (key: string) => void;
  openKeys: string[];
  onToggleKey: (key: string) => void;
  getProductCount: (categoryKey: string, subcategory?: string) => number;
  className?: string;
}

export function CategoryTree({
  categories,
  activeKey,
  onSelectCategory,
  openKeys,
  onToggleKey,
  getProductCount,
  className,
}: CategoryTreeProps) {
  return (
    <Panel
      title="Category tree"
      description="Manage hierarchy and view counts"
      flush
      className={cn('h-full min-h-[480px] flex flex-col', className)}
      bodyClassName="flex-1"
    >
      <ul className="py-2" role="tree">
        {categories.map((c) => {
          const expanded = openKeys.includes(c.key);
          const isSelected = activeKey === c.key;

          return (
            <li key={c.key} role="treeitem" aria-expanded={expanded}>
              <div
                className={cn(
                  'flex items-center gap-2 px-3.5 py-2.5 text-[13px] transition-colors rounded-sm mx-1.5',
                  isSelected ? 'bg-canvas font-medium text-ink' : 'hover:bg-subtle/70 text-ink'
                )}
              >
                <button
                  type="button"
                  onClick={() => onToggleKey(c.key)}
                  aria-label={expanded ? `Collapse ${c.name}` : `Expand ${c.name}`}
                  className="rounded p-0.5 text-ink-muted hover:bg-subtle hover:text-ink transition-colors cursor-pointer shrink-0"
                >
                  {expanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onSelectCategory(c.key)}
                  className="flex-1 text-left font-medium cursor-pointer truncate"
                >
                  {c.name}
                </button>

                <span className="text-xs text-ink-muted tabular-nums shrink-0 font-medium">
                  {getProductCount(c.key)}
                </span>
              </div>

              {expanded && c.subcategories.length > 0 && (
                <ul role="group" className="space-y-0.5 my-0.5">
                  {c.subcategories.map((sub) => (
                    <li
                      key={sub}
                      role="treeitem"
                      className="flex items-center gap-2 py-1.5 pl-9 pr-4 text-[13px] text-ink-soft hover:text-ink hover:bg-subtle/40 rounded-sm mx-1.5 transition-colors"
                    >
                      <span className="flex-1 truncate">{sub}</span>
                      <span className="text-xs text-ink-muted tabular-nums shrink-0">
                        {getProductCount(c.key, sub)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
