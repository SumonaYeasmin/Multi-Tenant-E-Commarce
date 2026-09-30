'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { policies } from '@/data/content';
import { formatDate } from '@/utils/format';
import { cn } from '@/utils/cn';

interface PolicyPageProps {
  params: Promise<{ slug: string }>;
}

export default function PolicyPage({ params }: PolicyPageProps) {
  const { slug } = use(params);
  const policy = slug ? policies[slug] : undefined;

  if (!policy) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-lg font-medium text-ink">Policy not found</p>
        <Link href="/" className="mt-4 inline-block text-sm text-clay underline">
          Return to home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[220px_1fr] lg:px-8">
      <nav aria-label="Policies" className="lg:sticky lg:top-32 lg:self-start">
        <p className="text-xs font-medium text-ink-muted">Policies</p>
        <ul className="mt-3 flex flex-wrap gap-2 lg:flex-col lg:gap-1">
          {Object.entries(policies).map(([key, p]) => {
            const isActive = slug === key;
            return (
              <li key={key}>
                <Link
                  href={`/policies/${key}`}
                  className={cn(
                    'block rounded-md px-3 py-1.5 text-sm transition-colors',
                    isActive
                      ? 'bg-subtle font-medium text-ink'
                      : 'text-ink-soft hover:text-ink'
                  )}
                >
                  {p.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <article className="max-w-2xl">
        <h1 className="font-display text-4xl">{policy.title}</h1>
        <p className="mt-2 text-sm text-ink-muted">Last updated {formatDate(policy.updated)}</p>
        <div className="mt-10 space-y-8">
          {policy.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-lg font-semibold">{s.heading}</h2>
              <p className="mt-2 leading-relaxed text-ink-soft">{s.body}</p>
            </section>
          ))}
        </div>
      </article>
    </div>
  );
}
