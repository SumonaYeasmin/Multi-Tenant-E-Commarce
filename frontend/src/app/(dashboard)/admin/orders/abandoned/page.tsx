'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Mail, MessageSquare } from 'lucide-react';
import { abandonedCheckouts } from '@/data/admin';
import { kpis } from '@/data/analytics';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { Panel } from '@/components/dashboard/shared/Panel';
import { DataTable, type Column } from '@/components/dashboard/shared/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { formatBDT, timeAgo } from '@/utils/format';

type Row = (typeof abandonedCheckouts)[number];

export default function AbandonedCheckoutsPage() {
  const [rows, setRows] = useState(abandonedCheckouts);

  const send = (id: string, channel: 'Email' | 'SMS') => {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, recovery: `${channel} sent` } : x)));
    toast.success(`Recovery ${channel.toLowerCase()} sent with a link back to their checkout`);
  };

  const columns: Column<Row>[] = [
    {
      key: 'cust',
      header: 'Customer',
      render: (r) => (
        <div>
          <p className="font-medium text-ink">{r.customer}</p>
          <p className="text-xs text-ink-muted">{r.contact}</p>
        </div>
      ),
    },
    {
      key: 'at',
      header: 'Abandoned',
      render: (r) => <span className="text-ink-muted">{timeAgo(r.at)}</span>,
    },
    {
      key: 'stage',
      header: 'Left at',
      render: (r) => <span className="text-ink">{r.stage}</span>,
      hideOnMobile: true,
    },
    {
      key: 'val',
      header: 'Cart value',
      align: 'right',
      render: (r) => <span className="tabular-nums font-medium text-ink">{formatBDT(r.value)}</span>,
    },
    {
      key: 'rec',
      header: 'Recovery',
      render: (r) => (
        <Badge
          tone={
            r.recovery === 'Recovered'
              ? 'success'
              : r.recovery.includes('sent') || r.recovery.includes('scheduled')
              ? 'info'
              : 'neutral'
          }
        >
          {r.recovery}
        </Badge>
      ),
    },
    {
      key: 'act',
      header: '',
      align: 'right',
      render: (r) =>
        r.recovery !== 'Recovered' && r.recovery !== 'Not contactable' ? (
          <div className="flex justify-end gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => send(r.id, r.contact.includes('@') ? 'Email' : 'SMS')}
              className="cursor-pointer"
            >
              {r.contact.includes('@') ? <Mail className="h-4 w-4" aria-hidden /> : <MessageSquare className="h-4 w-4" aria-hidden />} Send reminder
            </Button>
          </div>
        ) : null,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        back={{ href: '/admin/orders', label: 'Orders' }}
        title="Abandoned checkouts"
        description="Shoppers who reached checkout but didn’t complete payment. Automated recovery runs from Marketing → Automations."
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-line bg-surface px-4 py-3">
          <p className="text-xs text-ink-muted">Checkout abandonment</p>
          <p className="mt-1 text-lg font-semibold text-ink">{kpis.checkoutAbandonment}%</p>
        </div>
        <div className="rounded-lg border border-line bg-surface px-4 py-3">
          <p className="text-xs text-ink-muted">Recovered this month</p>
          <p className="mt-1 text-lg font-semibold text-ink">184 · {formatBDT(498000)}</p>
        </div>
        <div className="rounded-lg border border-line bg-surface px-4 py-3">
          <p className="text-xs text-ink-muted">Most common drop-off</p>
          <p className="mt-1 text-lg font-semibold text-ink">Payment step</p>
        </div>
      </div>
      <Panel flush>
        <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} />
      </Panel>
    </div>
  );
}
