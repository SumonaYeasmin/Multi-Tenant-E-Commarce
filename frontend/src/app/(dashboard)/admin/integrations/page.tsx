'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Key, Plus, Webhook } from 'lucide-react';
import {
  integrations,
  apiKeys,
  webhooks,
  webhookLogs,
} from '@/data/admin';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { Panel } from '@/components/dashboard/shared/Panel';
import { GuardedButton } from '@/components/dashboard/shared/GuardedButton';
import { ModuleGate } from '@/components/dashboard/shared/ModuleGate';
import { Tabs } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { formatDate, formatDateTime, timeAgo } from '@/utils/format';

type Tab = 'apps' | 'api' | 'webhooks';

export default function AdminIntegrationsPage() {
  const [tab, setTab] = useState<Tab>('apps');
  const groups = Array.from(new Set(integrations.map((i) => i.category)));

  return (
    <ModuleGate module="integrations">
      <div className="w-full space-y-6">
        <PageHeader
          title="Integrations"
          description="Payment gateways, couriers, messaging and analytics — plus API keys and webhooks for your own systems."
        />
        <div className="mb-6">
          <Tabs
            value={tab}
            onChange={(val) => setTab(val as Tab)}
            tabs={[
              { value: 'apps', label: 'Connected services' },
              { value: 'api', label: 'API keys' },
              { value: 'webhooks', label: 'Webhooks' },
            ]}
          />
        </div>

        {tab === 'apps' && (
          <div className="space-y-6">
            {groups.map((g) => (
              <section key={g}>
                <h2 className="mb-2 text-sm font-semibold text-ink">{g}</h2>
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {integrations
                    .filter((i) => i.category === g)
                    .map((i) => (
                      <li
                        key={i.id}
                        className="flex items-center gap-3 rounded-lg border border-line bg-surface p-4 hover:border-line-strong transition-colors"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-subtle text-sm font-semibold text-ink">
                          {i.name[0]}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-ink">
                            {i.name}
                          </p>
                          <p className="truncate text-xs text-ink-muted">
                            {i.detail || 'Not connected'}
                          </p>
                        </div>
                        {i.status === 'connected' ? (
                          <Badge tone="success" dot>
                            On
                          </Badge>
                        ) : (
                          <GuardedButton
                            module="integrations"
                            action="settings"
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              toast.success(`${i.name} connected`)
                            }
                          >
                            Connect
                          </GuardedButton>
                        )}
                      </li>
                    ))}
                </ul>
              </section>
            ))}
          </div>
        )}

        {tab === 'api' && (
          <Panel
            title="API keys"
            description="Keys are shown once on creation. Scope each key to what it needs."
            actions={
              <GuardedButton
                module="integrations"
                action="create"
                size="sm"
                onClick={() =>
                  toast.success('New key created: tk_live_… (copied once)')
                }
              >
                <Plus className="h-4 w-4" aria-hidden /> Create key
              </GuardedButton>
            }
            flush
          >
            <ul className="divide-y divide-line">
              {apiKeys.map((k) => (
                <li
                  key={k.id}
                  className="flex flex-wrap items-center gap-4 px-5 py-3.5 text-sm hover:bg-subtle/30"
                >
                  <Key className="h-4 w-4 text-ink-muted" aria-hidden />
                  <div className="min-w-[200px] flex-1">
                    <p className="font-medium text-ink">
                      {k.name}{' '}
                      <span className="font-mono text-xs text-ink-muted">
                        {k.prefix}••••
                      </span>
                    </p>
                    <p className="text-xs text-ink-muted">
                      Created {formatDate(k.created)} · last used{' '}
                      {timeAgo(k.lastUsed)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {k.scopes.map((s) => (
                      <Badge key={s}>{s}</Badge>
                    ))}
                  </div>
                  <GuardedButton
                    module="integrations"
                    action="delete"
                    size="sm"
                    variant="ghost"
                    onClick={() => toast.success(`${k.name} key revoked`)}
                  >
                    Revoke
                  </GuardedButton>
                </li>
              ))}
            </ul>
          </Panel>
        )}

        {tab === 'webhooks' && (
          <div className="space-y-6">
            <Panel
              title="Endpoints"
              description="Payloads are signed with HMAC-SHA256. Failed deliveries retry 5 times with backoff."
              actions={
                <GuardedButton
                  module="integrations"
                  action="create"
                  size="sm"
                  onClick={() => toast.success('Endpoint added')}
                >
                  <Plus className="h-4 w-4" aria-hidden /> Add endpoint
                </GuardedButton>
              }
              flush
            >
              <ul className="divide-y divide-line">
                {webhooks.map((w) => (
                  <li
                    key={w.id}
                    className="flex flex-wrap items-center gap-4 px-5 py-3.5 text-sm hover:bg-subtle/30"
                  >
                    <Webhook className="h-4 w-4 text-ink-muted" aria-hidden />
                    <div className="min-w-[200px] flex-1">
                      <p className="break-all font-mono text-xs text-ink">
                        {w.url}
                      </p>
                      <p className="text-xs text-ink-muted">
                        {w.events.join(', ')} · {w.successRate}% success
                      </p>
                    </div>
                    <Badge
                      tone={w.status === 'healthy' ? 'success' : 'danger'}
                      dot
                    >
                      {w.status === 'healthy' ? 'Healthy' : 'Failing'}
                    </Badge>
                  </li>
                ))}
              </ul>
            </Panel>
            <Panel title="Recent deliveries" flush>
              <ul className="divide-y divide-line">
                {webhookLogs.map((l) => (
                  <li
                    key={l.id}
                    className="flex flex-wrap items-center gap-4 px-5 py-2.5 text-sm hover:bg-subtle/30"
                  >
                    <span className="w-32 text-xs text-ink-muted">
                      {formatDateTime(l.at)}
                    </span>
                    <span className="flex-1 font-mono text-xs text-ink">
                      {l.event}
                    </span>
                    <Badge tone={l.code === 200 ? 'success' : 'danger'}>
                      HTTP {l.code}
                    </Badge>
                    <span className="w-28 text-xs text-ink-muted">
                      Attempt {l.attempt}
                      {l.nextRetry && ` · ${l.nextRetry}`}
                    </span>
                    {l.code !== 200 && (
                      <GuardedButton
                        module="integrations"
                        action="update"
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          toast.success('Redelivered — HTTP 200')
                        }
                      >
                        Retry
                      </GuardedButton>
                    )}
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        )}
      </div>
    </ModuleGate>
  );
}
