'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface TabItem<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface TabsProps<T extends string> {
  tabs: TabItem<T>[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  className,
}: TabsProps<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        'scrollbar-none flex gap-5 overflow-x-auto border-b border-line',
        className
      )}
    >
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.value)}
            className={cn(
              '-mb-px inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 pb-2.5 pt-1 text-sm font-medium transition-colors duration-150 cursor-pointer',
              active
                ? 'border-ink text-ink'
                : 'border-transparent text-ink-muted hover:text-ink'
            )}
          >
            <span>{t.label}</span>
            {t.count !== undefined && (
              <span
                className={cn(
                  'rounded-full px-1.5 text-xs tabular-nums',
                  active ? 'bg-ink text-canvas' : 'bg-subtle text-ink-muted'
                )}
              >
                {t.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
