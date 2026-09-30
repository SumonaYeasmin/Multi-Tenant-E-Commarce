'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Globe, Lock, Plus } from 'lucide-react';
import { domains as seed } from '@/data/admin';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { Panel } from '@/components/dashboard/shared/Panel';
import { GuardedButton } from '@/components/dashboard/shared/GuardedButton';
import { ModuleGate } from '@/components/dashboard/shared/ModuleGate';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/utils/format';

interface DomainRow {
  id: string;
  host: string;
  primary: boolean;
  status: string;
  ssl: string;
  sslExpires: string;
  redirectsTo?: string;
}

export default function AdminDomainsPage() {
  const [list, setList] = useState<DomainRow[]>(seed as DomainRow[]);
  const [open, setOpen] = useState(false);
  const [host, setHost] = useState('');
  const [verifying, setVerifying] = useState<string | null>(null);

  const verify = async (id: string) => {
    setVerifying(id);
    await new Promise((r) => setTimeout(r, 1100));
    setVerifying(null);
    setList((l) =>
      l.map((d) =>
        d.id === id
          ? {
              ...d,
              status: 'connected',
              ssl: 'active',
              sslExpires: '2026-12-25',
            }
          : d
      )
    );
    toast.success('DNS verified — SSL certificate issued');
  };

  return (
    <ModuleGate module="domains">
      <div className="w-full space-y-6">
        <PageHeader
          title="Domains"
          description="Connect your own domain. SSL certificates are issued and renewed automatically."
          actions={
            <GuardedButton
              module="domains"
              action="create"
              size="sm"
              onClick={() => setOpen(true)}
            >
              <Plus className="h-4 w-4" aria-hidden /> Connect domain
            </GuardedButton>
          }
        />
        <Panel flush>
          <ul className="divide-y divide-line">
            {list.map((d) => (
              <li
                key={d.id}
                className="flex flex-wrap items-center gap-4 px-5 py-4 hover:bg-subtle/30"
              >
                <Globe className="h-5 w-5 text-ink-muted" aria-hidden />
                <div className="min-w-[200px] flex-1">
                  <p className="flex items-center gap-2 text-sm font-medium text-ink">
                    {d.host}
                    {d.primary && <Badge tone="clay">Primary</Badge>}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-ink-muted">
                    {d.redirectsTo ? (
                      `Redirects to ${d.redirectsTo}`
                    ) : d.ssl === 'active' ? (
                      <>
                        <Lock className="h-3 w-3" aria-hidden /> SSL active · renews{' '}
                        {formatDate(d.sslExpires)}
                      </>
                    ) : (
                      'Waiting for DNS records'
                    )}
                  </p>
                </div>
                <Badge
                  tone={d.status === 'connected' ? 'success' : 'warning'}
                  dot
                >
                  {d.status === 'connected' ? 'Connected' : 'Pending DNS'}
                </Badge>
                {d.status === 'pending' && (
                  <GuardedButton
                    module="domains"
                    action="update"
                    size="sm"
                    variant="secondary"
                    loading={verifying === d.id}
                    onClick={() => verify(d.id)}
                  >
                    Verify
                  </GuardedButton>
                )}
                {d.status === 'connected' && !d.primary && !d.redirectsTo && (
                  <GuardedButton
                    module="domains"
                    action="update"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setList((l) =>
                        l.map((x) => ({ ...x, primary: x.id === d.id }))
                      );
                      toast.success(`${d.host} is now primary`);
                    }}
                  >
                    Make primary
                  </GuardedButton>
                )}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel className="mt-6" title="DNS records for pending domains">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-ink-muted">
                <th className="py-1.5 font-medium">Type</th>
                <th className="py-1.5 font-medium">Name</th>
                <th className="py-1.5 font-medium">Value</th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs">
              <tr className="border-t border-line">
                <td className="py-1.5 text-ink">A</td>
                <td className="py-1.5 text-ink">@</td>
                <td className="py-1.5 text-ink-muted">76.223.105.230</td>
              </tr>
              <tr className="border-t border-line">
                <td className="py-1.5 text-ink">CNAME</td>
                <td className="py-1.5 text-ink">shop</td>
                <td className="py-1.5 text-ink-muted">stores.myshopcloud.app</td>
              </tr>
              <tr className="border-t border-line">
                <td className="py-1.5 text-ink">TXT</td>
                <td className="py-1.5 text-ink">_verify</td>
                <td className="py-1.5 text-ink-muted">msc-verify=8f2a91bc</td>
              </tr>
            </tbody>
          </table>
        </Panel>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Connect a domain"
          footer={
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                disabled={!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(host)}
                onClick={() => {
                  setList([
                    ...list,
                    {
                      id: `dm${Date.now()}`,
                      host,
                      primary: false,
                      status: 'pending',
                      ssl: 'pending',
                      sslExpires: '',
                    },
                  ]);
                  setOpen(false);
                  setHost('');
                  toast.success('Domain added — add the DNS records, then verify');
                }}
              >
                Add domain
              </Button>
            </>
          }
        >
          <Input
            label="Domain"
            value={host}
            onChange={(e) => setHost(e.target.value.toLowerCase().trim())}
            placeholder="shop.yourbrand.com"
            hint="You’ll need access to your domain registrar’s DNS settings"
          />
        </Modal>
      </div>
    </ModuleGate>
  );
}
