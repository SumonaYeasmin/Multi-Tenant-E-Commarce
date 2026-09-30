'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { blogPosts } from '@/data/content';
import { formatDate } from '@/utils/format';
import { cn } from '@/utils/cn';

export default function JournalPage() {
  const cats = Array.from(new Set(blogPosts.map((p) => p.category)));
  const [cat, setCat] = useState<string | null>(null);
  const list = blogPosts.filter((p) => !cat || p.category === cat);
  const [lead, ...rest] = list;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-5xl">Journal</h1>
      <p className="mt-2 text-ink-muted">
        Stories of craft, care and style from the Tanti community.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
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
            {c ?? 'All stories'}
          </button>
        ))}
      </div>
      {lead && (
        <Link
          href={`/journal/${lead.slug}`}
          className="group mt-10 grid gap-8 lg:grid-cols-2"
        >
          <img
            src={lead.image}
            alt=""
            className="aspect-[4/3] w-full rounded-lg object-cover"
          />
          <div className="flex flex-col justify-center">
            <p className="text-sm text-clay">{lead.category}</p>
            <h2 className="mt-2 font-display text-4xl leading-tight group-hover:underline">
              {lead.title}
            </h2>
            <p className="mt-4 text-ink-soft">{lead.excerpt}</p>
            <p className="mt-6 text-xs text-ink-muted">
              {lead.author} · {formatDate(lead.date)} · {lead.readTime} read
            </p>
          </div>
        </Link>
      )}
      <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((p) => (
          <Link key={p.slug} href={`/journal/${p.slug}`} className="group">
            <img
              src={p.image}
              alt=""
              className="aspect-[4/3] w-full rounded-md object-cover"
            />
            <p className="mt-4 text-xs text-clay">{p.category}</p>
            <h3 className="mt-1 font-display text-xl leading-snug group-hover:underline">
              {p.title}
            </h3>
            <p className="mt-2 text-xs text-ink-muted">
              {formatDate(p.date)} · {p.readTime} read
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
