'use client';

import React, { useState } from 'react';
import { Reorder } from 'framer-motion';
import { toast } from 'sonner';
import {
  Monitor,
  Smartphone,
  GripVertical,
  Eye,
  EyeOff,
  RotateCcw,
} from 'lucide-react';
import { themeVersions } from '@/data/admin';
import { images } from '@/data/images';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { Panel } from '@/components/dashboard/shared/Panel';
import { GuardedButton } from '@/components/dashboard/shared/GuardedButton';
import { ModuleGate } from '@/components/dashboard/shared/ModuleGate';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { formatDateTime } from '@/utils/format';
import { cn } from '@/utils/cn';

interface Section {
  id: string;
  label: string;
  visible: boolean;
}

const initialSections: Section[] = [
  { id: 'hero', label: 'Hero banner', visible: true },
  { id: 'categories', label: 'Featured categories', visible: true },
  { id: 'new', label: 'New arrivals', visible: true },
  { id: 'collection', label: 'Featured collection', visible: true },
  { id: 'best', label: 'Best sellers', visible: true },
  { id: 'testimonials', label: 'Testimonials', visible: true },
  { id: 'journal', label: 'From the journal', visible: false },
  { id: 'newsletter', label: 'Newsletter', visible: true },
];

const accents = ['#B5562F', '#2E3A67', '#5C6B4E', '#1C1A17'];
const fonts = ['Fraunces + Inter', 'Playfair Display + Inter', 'Inter only'];
const previewImages = [images.kurta, images.panjabi, images.saree, images.coord];

export default function AdminThemePage() {
  const [sections, setSections] = useState(initialSections);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [accent, setAccent] = useState(accents[0]);
  const [font, setFont] = useState(fonts[0]);
  const [dirty, setDirty] = useState(false);
  const touch = () => setDirty(true);
  const serif = font.startsWith('Inter') ? 'font-sans' : 'font-display';

  return (
    <ModuleGate module="theme">
      <div className="w-full space-y-6">
        <PageHeader
          title="Theme"
          description="Customize your storefront. Changes are saved as a draft until you publish."
          meta={
            <Badge tone={dirty ? 'warning' : 'success'} dot>
              {dirty ? 'Unpublished changes' : 'Live'}
            </Badge>
          }
          actions={
            <>
              <GuardedButton
                module="theme"
                action="update"
                variant="secondary"
                size="sm"
                disabled={!dirty}
                onClick={() => toast.success('Draft saved')}
              >
                Save draft
              </GuardedButton>
              <GuardedButton
                module="theme"
                action="publish"
                size="sm"
                disabled={!dirty}
                onClick={() => {
                  setDirty(false);
                  toast.success('Theme published to storefront');
                }}
              >
                Publish
              </GuardedButton>
            </>
          }
        />
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <div className="space-y-6">
            <Panel title="Homepage sections" description="Drag to reorder">
              <Reorder.Group
                axis="y"
                values={sections}
                onReorder={(v) => {
                  setSections(v);
                  touch();
                }}
                className="space-y-1.5"
              >
                {sections.map((s) => (
                  <Reorder.Item
                    key={s.id}
                    value={s}
                    className="flex cursor-grab items-center gap-2 rounded-md border border-line bg-surface px-2.5 py-2 text-sm active:cursor-grabbing"
                  >
                    <GripVertical
                      className="h-4 w-4 text-ink-muted"
                      aria-hidden
                    />
                    <span
                      className={cn(
                        'flex-1 text-ink',
                        !s.visible && 'text-ink-muted line-through'
                      )}
                    >
                      {s.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSections((x) =>
                          x.map((y) =>
                            y.id === s.id ? { ...y, visible: !y.visible } : y
                          )
                        );
                        touch();
                      }}
                      aria-label={s.visible ? `Hide ${s.label}` : `Show ${s.label}`}
                      className="rounded p-1 text-ink-muted hover:bg-subtle hover:text-ink cursor-pointer"
                    >
                      {s.visible ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </Panel>
            <Panel title="Brand">
              <p className="text-sm font-medium text-ink">Accent colour</p>
              <div className="mt-2 flex gap-2">
                {accents.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setAccent(c);
                      touch();
                    }}
                    aria-label={`Accent ${c}`}
                    aria-pressed={accent === c}
                    className={cn(
                      'h-8 w-8 rounded-full border-2 cursor-pointer transition-transform hover:scale-105',
                      accent === c ? 'border-ink scale-110' : 'border-transparent'
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="mt-4 space-y-4">
                <Select
                  label="Typography"
                  value={font}
                  onChange={(e) => {
                    setFont(e.target.value);
                    touch();
                  }}
                  options={fonts}
                />
                <Select
                  label="Product card style"
                  onChange={touch}
                  options={[
                    'Portrait 3:4, hover second image',
                    'Square, minimal',
                    'Portrait with quick add',
                  ]}
                />
              </div>
            </Panel>
            <Panel title="Version history" flush>
              <ul className="divide-y divide-line">
                {themeVersions.map((v) => (
                  <li
                    key={v.id}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-ink">{v.label}</p>
                      <p className="text-xs text-ink-muted">
                        {formatDateTime(v.at)} · {v.by}
                      </p>
                    </div>
                    {v.live ? (
                      <Badge tone="success">Live</Badge>
                    ) : (
                      <GuardedButton
                        module="theme"
                        action="publish"
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          toast.success(`Rolled back to “${v.label}”`)
                        }
                      >
                        <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Restore
                      </GuardedButton>
                    )}
                  </li>
                ))}
              </ul>
            </Panel>
          </div>

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
            <div
              className={cn(
                'mx-auto overflow-hidden rounded-md bg-canvas shadow-sm transition-[max-width] duration-200 ease-out border border-line',
                device === 'mobile' ? 'max-w-[375px]' : 'max-w-full'
              )}
            >
              <div className="flex items-center justify-between border-b border-line bg-surface px-4 py-3">
                <span className={cn('text-lg font-bold text-ink', serif)}>Tanti</span>
                <span className="flex gap-3 text-xs text-ink-soft">
                  {device === 'desktop' &&
                    ['Women', 'Men', 'Kids', 'Sale'].map((x) => (
                      <span key={x}>{x}</span>
                    ))}
                </span>
              </div>
              <div className="max-h-[640px] space-y-3 overflow-y-auto p-3">
                {sections
                  .filter((s) => s.visible)
                  .map((s) => (
                    <div key={s.id}>
                      {s.id === 'hero' ? (
                        <div className="relative overflow-hidden rounded">
                          <img
                            src={images.hero}
                            alt=""
                            className="aspect-[16/7] w-full object-cover"
                          />
                          <div className="absolute inset-0 flex flex-col justify-end bg-black/40 p-4 text-white">
                            <p className={cn('text-xl font-medium', serif)}>
                              The Eid Edit 2026
                            </p>
                            <span
                              className="mt-2 w-fit rounded px-3 py-1 text-xs font-medium text-white shadow-sm"
                              style={{ backgroundColor: accent }}
                            >
                              Shop the collection
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded bg-surface p-3 border border-line">
                          <p className={cn('text-sm font-semibold text-ink', serif)}>
                            {s.label}
                          </p>
                          <div
                            className={cn(
                              'mt-2 grid gap-2',
                              device === 'mobile' ? 'grid-cols-2' : 'grid-cols-4'
                            )}
                          >
                            {previewImages
                              .slice(0, device === 'mobile' ? 2 : 4)
                              .map((src, i) => (
                                <img
                                  key={`${src}-${i}`}
                                  src={src}
                                  alt=""
                                  className="aspect-[3/4] w-full rounded-sm object-cover"
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
        </div>
      </div>
    </ModuleGate>
  );
}
