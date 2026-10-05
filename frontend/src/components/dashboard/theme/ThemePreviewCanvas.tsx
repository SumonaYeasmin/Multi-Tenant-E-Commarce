'use client';

import React, { useState } from 'react';
import { Monitor, Smartphone } from 'lucide-react';
import { images } from '@/data/images';
import { cn } from '@/utils/cn';
import type { TenantTheme } from '@/types/theme';

interface ThemePreviewCanvasProps {
  theme: TenantTheme;
}

const previewImages = [images.kurta, images.panjabi, images.saree, images.coord];

export function ThemePreviewCanvas({ theme }: ThemePreviewCanvasProps) {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  const headingFontClass = theme.fontHeading.includes('Playfair')
    ? 'font-serif'
    : theme.fontHeading.includes('Fraunces')
    ? 'font-display'
    : 'font-sans';

  return (
    <div className="rounded-lg border border-line bg-subtle p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-ink-muted">Live Preview</p>
        <div
          className="flex rounded-md border border-line bg-surface p-0.5"
          role="group"
          aria-label="Preview device"
        >
          {(
            [
              ['desktop', Monitor],
              ['mobile', Smartphone],
            ] as const
          ).map(([d, Icon]) => (
            <button
              key={d}
              type="button"
              onClick={() => setDevice(d)}
              aria-pressed={device === d}
              aria-label={d}
              className={cn(
                'rounded px-2 py-1 cursor-pointer transition-colors',
                device === d
                  ? 'bg-ink text-canvas font-medium'
                  : 'text-ink-muted hover:text-ink'
              )}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Storefront Device Viewport */}
      <div
        className={cn(
          'mx-auto overflow-hidden rounded-md shadow-xs transition-[max-width] duration-200 ease-out border border-line',
          device === 'mobile' ? 'max-w-[375px]' : 'max-w-full'
        )}
        style={{
          backgroundColor: theme.canvasColor,
          color: theme.inkColor,
        }}
      >
        {/* Storefront Mini Header */}
        <div
          className="flex items-center justify-between border-b border-line px-4 py-3"
          style={{ backgroundColor: theme.surfaceColor }}
        >
          <span className={cn('text-lg font-bold text-ink', headingFontClass)}>
            Tanti
          </span>
          <span className="flex gap-3 text-xs text-ink-soft">
            {device === 'desktop' &&
              ['Women', 'Men', 'Kids', 'Sale'].map((x) => (
                <span key={x}>{x}</span>
              ))}
          </span>
        </div>

        {/* Dynamic Reordered & Filtered Sections */}
        <div className="max-h-[640px] space-y-3 overflow-y-auto p-3">
          {theme.sections
            .filter((s) => s.isVisible)
            .map((s) => (
              <div key={s.id}>
                {s.sectionType === 'HERO_BANNER' ? (
                  <div
                    className="relative overflow-hidden"
                    style={{ borderRadius: theme.borderRadius }}
                  >
                    <img
                      src={images.hero}
                      alt=""
                      className="aspect-[16/7] w-full object-cover"
                    />
                    <div className="absolute inset-0 flex flex-col justify-end bg-black/40 p-4 text-white">
                      <p className={cn('text-xl font-medium', headingFontClass)}>
                        The Eid Edit 2026
                      </p>
                      <span
                        className="mt-2 w-fit px-3 py-1 text-xs font-medium text-white shadow-xs"
                        style={{
                          backgroundColor: theme.primaryColor,
                          borderRadius: theme.borderRadius,
                        }}
                      >
                        Shop the collection
                      </span>
                    </div>
                  </div>
                ) : (
                  <div
                    className="p-3 border border-line"
                    style={{
                      backgroundColor: theme.surfaceColor,
                      borderRadius: theme.borderRadius,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <p className={cn('text-sm font-semibold text-ink', headingFontClass)}>
                        {s.label}
                      </p>
                      {s.sectionType === 'BESTSELLERS' && (
                        <span
                          className="px-1.5 py-0.5 text-[10px] font-bold text-white rounded"
                          style={{ backgroundColor: theme.accentColor }}
                        >
                          Popular
                        </span>
                      )}
                    </div>
                    <div
                      className={cn(
                        'mt-2 grid gap-2',
                        device === 'mobile' || theme.cardStyle?.includes('Square')
                          ? 'grid-cols-2'
                          : 'grid-cols-4'
                      )}
                    >
                      {previewImages
                        .slice(0, device === 'mobile' ? 2 : 4)
                        .map((src, i) => (
                          <img
                            key={`${src}-${i}`}
                            src={src}
                            alt=""
                            className={cn(
                              'w-full object-cover',
                              theme.cardStyle?.includes('Square')
                                ? 'aspect-square'
                                : 'aspect-[3/4]'
                            )}
                            style={{ borderRadius: theme.borderRadius }}
                          />
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
