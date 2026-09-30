'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Download, ChevronDown } from 'lucide-react';
import { auditLogs } from '@/data/admin';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { GuardedButton } from '@/components/dashboard/shared/GuardedButton';
import { ModuleGate } from '@/components/dashboard/shared/ModuleGate';
import { Badge } from '@/components/ui/Badge';
import { formatDateTime } from '@/utils/format';
import { cn } from '@/utils/cn';

const categories = [
  'All',
  ...Array.from(new Set(auditLogs.map((l) => l.category))),
];
const actors = [
  'All',
  ...Array.from(new Set(auditLogs.map((l) => l.actor))),
];

export default function AdminAuditPage() {
  const [cat, setCat] = useState('All');
  const [actor, setActor] = useState('All');
  const [open, setOpen] = useState<string | null>(null);
  const rows = auditLogs.filter(
    (l) =>
      (cat === 'All' || l.category === cat) &&
      (actor === 'All' || l.actor === actor)
  );

  return (
    <ModuleGate module="audit">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader
          title="Audit log"
          description="Every sensitive change — who did it, when, and what changed. Retained for 12 months."
          actions={
            <GuardedButton
              module="audit"
              action="view"
              variant="secondary"
              size="sm"
              onClick={() => toast.success('Audit log exported')}
            >
              <Download className="h-4 w-4" aria-hidden /> Export
            </GuardedButton>
          }
        />
        <div className="mb-4 flex flex-wrap gap-2">
          <select
            aria-label="Category"
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="h-9 rounded-md border border-line-strong bg-surface px-2 text-[13px] text-ink"
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select
            aria-label="Actor"
            value={actor}
            onChange={(e) => setActor(e.target.value)}
            className="h-9 rounded-md border border-line-strong bg-surface px-2 text-[13px] text-ink"
          >
            {actors.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
          {rows.map((l) => {
            const hasDiff = !!(l.before || l.after);
            const expanded = open === l.id;
            return (
              <li key={l.id}>
                <button
                  type="button"
                  disabled={!hasDiff}
                  onClick={() => setOpen(expanded ? null : l.id)}
                  aria-expanded={hasDiff ? expanded : undefined}
                  className="flex w-full flex-wrap items-center gap-3 px-5 py-3 text-left text-[13px] enabled:hover:bg-canvas transition-colors disabled:cursor-default"
                >
                  <span className="w-32 text-xs text-ink-muted">
                    {formatDateTime(l.at)}
                  </span>
                  <span className="min-w-[200px] flex-1">
                    <b className="font-medium text-ink">{l.actor}</b>{' '}
                    <span className="text-ink">
                      {l.action.charAt(0).toLowerCase() + l.action.slice(1)}
                    </span>
                    <span className="block text-xs text-ink-muted">
                      {l.resource}
                    </span>
                  </span>
                  <Badge
                    tone={l.category === 'Security' ? 'warning' : 'neutral'}
                  >
                    {l.category}
                  </Badge>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 text-ink-muted transition-transform duration-150',
                      expanded && 'rotate-180',
                      !hasDiff && 'invisible'
                    )}
                    aria-hidden
                  />
                </button>
                {expanded && (
                  <div className="grid gap-3 px-5 pb-4 sm:grid-cols-2">
                    <div className="rounded-md bg-red-500/10 p-3 font-mono text-xs text-ink">
                      <p className="mb-1 font-sans text-[11px] text-ink-muted">
                        Before
                      </p>
                      {l.before || '—'}
                    </div>
                    <div className="rounded-md bg-emerald-500/10 p-3 font-mono text-xs text-ink">
                      <p className="mb-1 font-sans text-[11px] text-ink-muted">
                        After
                      </p>
                      {l.after || '—'}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </ModuleGate>
  );
}
