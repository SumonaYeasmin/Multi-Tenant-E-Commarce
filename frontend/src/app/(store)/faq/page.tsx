'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronDownIcon, SearchIcon } from 'lucide-react';
import { faqs } from '@/data/content';
import { cn } from '@/utils/cn';

export default function FaqPage() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<string | null>(faqs[0]?.q ?? null);
  const cats = Array.from(new Set(faqs.map((f) => f.category)));
  const [cat, setCat] = useState<string | null>(null);

  const list = useMemo(
    () =>
      faqs.filter(
        (f) =>
          (!cat || f.category === cat) &&
          (!q || `${f.q} ${f.a}`.toLowerCase().includes(q.toLowerCase()))
      ),
    [q, cat]
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-5xl">Help & FAQ</h1>
      <div className="relative mt-8">
        <SearchIcon
          className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
          aria-hidden
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search questions…"
          aria-label="Search FAQ"
          className="h-12 w-full rounded-md border border-line-strong bg-surface pl-10 pr-3 text-sm focus:border-clay focus:outline-none"
        />
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {[null, ...cats].map((c) => (
          <button
            key={c ?? 'all'}
            onClick={() => setCat(c)}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-sm cursor-pointer transition-colors',
              cat === c
                ? 'border-ink bg-ink text-canvas'
                : 'border-line-strong hover:border-ink'
            )}
          >
            {c ?? 'All'}
          </button>
        ))}
      </div>
      <div className="mt-8 divide-y divide-line border-y border-line">
        {list.length === 0 && (
          <p className="py-10 text-center text-sm text-ink-muted">
            No answers match “{q}”.{' '}
            <Link href="/contact" className="underline">
              Ask us directly
            </Link>
            .
          </p>
        )}
        {list.map((f) => (
          <div key={f.q}>
            <button
              onClick={() => setOpen(open === f.q ? null : f.q)}
              aria-expanded={open === f.q}
              className="flex w-full items-center justify-between gap-4 py-5 text-left cursor-pointer"
            >
              <span className="font-medium text-ink">{f.q}</span>
              <ChevronDownIcon
                className={cn(
                  'h-4 w-4 shrink-0 transition-transform duration-200 text-ink-muted',
                  open === f.q && 'rotate-180 text-ink'
                )}
                aria-hidden
              />
            </button>
            {open === f.q && (
              <p className="pb-5 text-sm leading-relaxed text-ink-soft">{f.a}</p>
            )}
          </div>
        ))}
      </div>
      <p className="mt-10 text-sm text-ink-muted">
        Still stuck?{' '}
        <Link href="/contact" className="font-medium text-ink underline">
          Contact Tanti Care
        </Link>
      </p>
    </div>
  );
}
