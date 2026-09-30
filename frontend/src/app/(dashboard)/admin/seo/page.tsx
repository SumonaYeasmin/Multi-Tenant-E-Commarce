'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { Panel } from '@/components/dashboard/shared/Panel';
import { GuardedButton } from '@/components/dashboard/shared/GuardedButton';
import { ModuleGate } from '@/components/dashboard/shared/ModuleGate';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';

const checks = [
  { ok: true, label: 'XML sitemap generated', detail: '164 URLs · updated 2 hours ago' },
  { ok: true, label: 'Structured data', detail: 'Product, Review, Breadcrumb and Organization schema on every page' },
  { ok: true, label: 'Canonical URLs', detail: 'All pages point to https://tanti.com.bd' },
  { ok: false, label: '3 images missing alt text', detail: 'Fix in Media library', href: '/admin/media' },
  { ok: false, label: '2 products with duplicate meta descriptions', detail: 'Sage & Rust panjabi', href: '/admin/products' },
];

export default function AdminSeoPage() {
  const [noindex, setNoindex] = useState(false);

  return (
    <ModuleGate module="content">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader
          title="SEO"
          description="Search and social defaults. Products, collections, pages and posts can override them individually."
        />
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <Panel title="Homepage listing">
              <div className="space-y-4">
                <Input
                  label="Title"
                  defaultValue="Tanti — Modern Bangladeshi fashion & handloom"
                />
                <Textarea
                  label="Meta description"
                  rows={2}
                  defaultValue="Kurtas, panjabis, jamdani sarees and leather goods, made with artisans across Bangladesh. Delivery to all 64 districts. bKash, Nagad & COD."
                />
                <Input
                  label="Social share image"
                  defaultValue="eid-hero-courtyard.jpg (1200×630)"
                />
              </div>
            </Panel>
            <Panel title="robots.txt">
              <textarea
                aria-label="robots.txt"
                rows={6}
                className="w-full rounded-md border border-line-strong bg-canvas p-3 font-mono text-xs text-ink focus:border-clay focus:outline-none"
                defaultValue={
                  'User-agent: *\nDisallow: /cart\nDisallow: /checkout\nDisallow: /account\n\nSitemap: https://tanti.com.bd/sitemap.xml'
                }
              />
              <div className="mt-3">
                <Checkbox
                  checked={noindex}
                  onChange={setNoindex}
                  label="Hide the whole store from search engines (noindex)"
                />
              </div>
            </Panel>
            <div className="flex justify-end">
              <GuardedButton
                module="content"
                action="update"
                onClick={() => toast.success('SEO settings saved')}
              >
                Save
              </GuardedButton>
            </div>
          </div>
          <Panel title="Health check" flush>
            <ul className="divide-y divide-line">
              {checks.map((c) => (
                <li key={c.label} className="flex gap-3 px-5 py-3 text-[13px]">
                  {c.ok ? (
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                      aria-hidden
                    />
                  ) : (
                    <AlertTriangle
                      className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400"
                      aria-hidden
                    />
                  )}
                  <div>
                    <p className="font-medium text-ink">{c.label}</p>
                    {c.href ? (
                      <Link
                        href={c.href}
                        className="text-xs text-ink-muted underline hover:text-clay"
                      >
                        {c.detail}
                      </Link>
                    ) : (
                      <p className="text-xs text-ink-muted">{c.detail}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </ModuleGate>
  );
}
