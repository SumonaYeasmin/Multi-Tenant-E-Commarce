'use client';

import React from 'react';
import { Check, X, AlertTriangle } from 'lucide-react';
import { entitlements, planFeatures } from '@/data/admin';
import { useAdmin } from '@/contexts/AdminContext';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { Panel } from '@/components/dashboard/shared/Panel';
import { ModuleGate } from '@/components/dashboard/shared/ModuleGate';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/utils/format';
import { cn } from '@/utils/cn';

export default function AdminBillingPage() {
  const { planState } = useAdmin();
  const stateMeta = {
    active: {
      tone: 'success' as const,
      label: 'Active',
      note: 'Renews on 12 Oct 2026 · ৳4,900/month',
    },
    grace: {
      tone: 'warning' as const,
      label: 'Payment overdue',
      note: 'Renewal failed on 20 Sep. All features stay on until the 7-day grace period ends on 27 Sep.',
    },
    suspended: {
      tone: 'danger' as const,
      label: 'Suspended',
      note: 'The store is read-only and the storefront shows a closed page. Renew to restore access.',
    },
  }[planState];

  return (
    <ModuleGate module="billing">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader
          title="Plan & billing"
          description="Your subscription is managed by the main platform; this page shows your plan’s limits and access."
        />
        {planState !== 'active' && (
          <div
            className={cn(
              'mb-6 flex items-start gap-3 rounded-lg border px-5 py-4 text-sm',
              planState === 'grace'
                ? 'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300'
                : 'border-red-500/30 bg-red-500/10 text-red-800 dark:text-red-300'
            )}
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <p className="flex-1">{stateMeta.note}</p>
            <Button size="sm">Renew now</Button>
          </div>
        )}
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <Panel title="Usage">
            <ul className="space-y-4">
              {entitlements.map((e) => {
                const pct = Math.min(100, (e.used / e.limit) * 100);
                return (
                  <li key={e.feature}>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-ink font-medium">{e.feature}</span>
                      <span className="tabular-nums text-ink-muted">
                        {formatNumber(e.used)}
                        {e.unit ? ` ${e.unit}` : ''} of {formatNumber(e.limit)}
                        {e.unit ? ` ${e.unit}` : ''}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-subtle">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          pct > 85 ? 'bg-amber-500' : 'bg-ink'
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Panel>
          <div className="space-y-6">
            <Panel>
              <p className="text-xs text-ink-muted">Current plan</p>
              <p className="mt-1 font-display text-2xl font-bold text-ink">
                Professional
              </p>
              <div className="mt-2">
                <Badge tone={stateMeta.tone} dot>
                  {stateMeta.label}
                </Badge>
              </div>
              {planState === 'active' && (
                <p className="mt-3 text-[13px] text-ink-muted">{stateMeta.note}</p>
              )}
              <Button className="mt-4" fullWidth variant="secondary">
                Change plan
              </Button>
            </Panel>
            <Panel title="Included features" flush>
              <ul className="divide-y divide-line">
                {planFeatures.map((f) => (
                  <li
                    key={f.name}
                    className="flex items-center gap-2 px-5 py-2.5 text-[13px] hover:bg-subtle/30"
                  >
                    {f.included ? (
                      <Check
                        className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
                        aria-hidden
                      />
                    ) : (
                      <X className="h-4 w-4 text-ink-muted" aria-hidden />
                    )}
                    <span
                      className={cn(
                        f.included ? 'text-ink' : 'text-ink-muted line-through'
                      )}
                    >
                      {f.name}
                    </span>
                    {!f.included && (
                      <span className="ml-auto text-xs font-semibold text-clay">
                        Growth
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </div>
      </div>
    </ModuleGate>
  );
}
