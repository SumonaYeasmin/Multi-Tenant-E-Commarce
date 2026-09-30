'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { FileBarChart, Search, SearchX } from 'lucide-react';
import { reportCatalog } from '@/data/admin';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { GuardedButton } from '@/components/dashboard/shared/GuardedButton';
import { ModuleGate } from '@/components/dashboard/shared/ModuleGate';
import { EmptyState } from '@/components/ui/EmptyState';

export default function AdminReportsPage() {
  const [q, setQ] = useState('');
  const groups = reportCatalog
    .map((g) => ({
      ...g,
      items: g.items.filter((i) =>
        `${i.name} ${i.description}`.toLowerCase().includes(q.toLowerCase())
      ),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <ModuleGate module="reports">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader
          title="Reports"
          description="Detailed reports for every part of the business. Export any report as CSV or XLSX."
        />
        <div className="relative mb-6 max-w-sm">
          <Search
            className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
            aria-hidden
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Find a report…"
            aria-label="Find a report"
            className="h-9 w-full rounded-md border border-line-strong bg-surface pl-8 pr-3 text-[13px] text-ink focus:border-clay focus:outline-none"
          />
        </div>
        {groups.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No reports match"
            description="Try a different search term."
          />
        ) : (
          <div className="space-y-8">
            {groups.map((g) => (
              <section key={g.group}>
                <h2 className="mb-2 text-sm font-semibold text-ink">{g.group}</h2>
                <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
                  {g.items.map((i) => (
                    <li
                      key={i.name}
                      className="flex flex-wrap items-center gap-3 px-5 py-3 hover:bg-subtle/30"
                    >
                      <FileBarChart
                        className="h-4 w-4 text-ink-muted"
                        aria-hidden
                      />
                      <div className="min-w-[200px] flex-1">
                        <p className="text-[13px] font-medium text-ink">{i.name}</p>
                        <p className="text-xs text-ink-muted">{i.description}</p>
                      </div>
                      <GuardedButton
                        module="reports"
                        action="export"
                        size="sm"
                        variant="ghost"
                        onClick={() => toast.success(`${i.name} · CSV exported`)}
                      >
                        CSV
                      </GuardedButton>
                      <GuardedButton
                        module="reports"
                        action="export"
                        size="sm"
                        variant="ghost"
                        onClick={() => toast.success(`${i.name} · XLSX exported`)}
                      >
                        XLSX
                      </GuardedButton>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </ModuleGate>
  );
}
