'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Truck } from 'lucide-react';
import { shippingZones, couriers, FREE_SHIPPING_THRESHOLD } from '@/data/shipping';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { Panel } from '@/components/dashboard/shared/Panel';
import { GuardedButton } from '@/components/dashboard/shared/GuardedButton';
import { ModuleGate } from '@/components/dashboard/shared/ModuleGate';
import { Badge } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/Switch';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/button';
import { formatBDT } from '@/utils/format';

export default function AdminShippingPage() {
  const [rateOpen, setRateOpen] = useState(false);
  const [pickup, setPickup] = useState(true);
  const [rto, setRto] = useState(true);
  const [rule, setRule] = useState('Flat rate');

  return (
    <ModuleGate module="shipping">
      <div className="w-full space-y-6">
        <PageHeader
          title="Shipping & delivery"
          description="Zones, rates and couriers. Customers see the right options for their district at checkout."
          actions={
            <GuardedButton
              module="shipping"
              action="update"
              size="sm"
              onClick={() => setRateOpen(true)}
            >
              <Plus className="h-4 w-4" aria-hidden /> Add rate
            </GuardedButton>
          }
        />
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <Panel
              title="Shipping zones"
              description="Districts are grouped into zones; each zone has its own rates."
              flush
            >
              <ul className="divide-y divide-line">
                {shippingZones.map((z) => (
                  <li key={z.id} className="px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-ink">{z.name}</p>
                        <p className="text-xs text-ink-muted">
                          {z.districts.join(', ')}
                        </p>
                      </div>
                      <GuardedButton
                        module="shipping"
                        action="update"
                        size="sm"
                        variant="ghost"
                        onClick={() => setRateOpen(true)}
                      >
                        Edit
                      </GuardedButton>
                    </div>
                    <table className="mt-3 w-full text-sm">
                      <tbody className="divide-y divide-line">
                        {z.rates.map((r) => (
                          <tr key={r.name}>
                            <td className="py-2 font-medium text-ink">{r.name}</td>
                            <td className="py-2 text-ink-muted">{r.rule}</td>
                            <td className="py-2 text-right tabular-nums text-ink font-medium">
                              {r.price ? formatBDT(r.price) : 'Free'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel
              title="Couriers"
              description="Parcels are created automatically when an order is packed."
              flush
            >
              <ul className="divide-y divide-line">
                {couriers.map((c) => (
                  <li
                    key={c.id}
                    className="flex flex-wrap items-center gap-4 px-5 py-3.5 hover:bg-subtle/30"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-subtle text-ink-soft">
                      <Truck className="h-4 w-4" aria-hidden />
                    </span>
                    <div className="min-w-[160px] flex-1">
                      <p className="text-sm font-medium text-ink">{c.name}</p>
                      <p className="text-xs text-ink-muted">
                        {c.coverage} · avg {c.avgDays} days · {c.successRate}% delivered
                      </p>
                    </div>
                    {c.status === 'connected' ? (
                      <Badge tone="success" dot>
                        Connected
                      </Badge>
                    ) : (
                      <GuardedButton
                        module="shipping"
                        action="update"
                        size="sm"
                        variant="secondary"
                        onClick={() => toast.success(`${c.name} connected`)}
                      >
                        Connect
                      </GuardedButton>
                    )}
                  </li>
                ))}
              </ul>
            </Panel>
          </div>

          <div className="space-y-6">
            <Panel title="Free delivery">
              <p className="text-sm text-ink-soft">
                Inside Dhaka on orders over{' '}
                <b className="text-ink">{formatBDT(FREE_SHIPPING_THRESHOLD)}</b>. Shown
                as a progress bar in the cart.
              </p>
            </Panel>
            <Panel title="Delivery options">
              <div className="space-y-4">
                <Switch
                  checked={pickup}
                  onChange={setPickup}
                  label="Store pickup (Dhanmondi 27)"
                />
                <Switch
                  checked={rto}
                  onChange={setRto}
                  label="Auto-restock on return-to-origin"
                />
              </div>
            </Panel>
            <Panel title="Delivery performance · 30d">
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-ink-muted">Delivered</dt>
                  <dd className="font-semibold text-ink">95.4%</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-muted">Failed attempts</dt>
                  <dd className="font-semibold text-ink">3.1%</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-muted">Return to origin</dt>
                  <dd className="font-semibold text-ink">1.5%</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-muted">Avg. time to ship</dt>
                  <dd className="font-semibold text-ink">14 h</dd>
                </div>
              </dl>
            </Panel>
          </div>
        </div>

        <Modal
          open={rateOpen}
          onClose={() => setRateOpen(false)}
          title="Shipping rate"
          footer={
            <>
              <Button variant="ghost" onClick={() => setRateOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setRateOpen(false);
                  toast.success('Rate saved');
                }}
              >
                Save rate
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Select label="Zone" options={shippingZones.map((z) => z.name)} />
            <Input
              label="Rate name"
              defaultValue="Standard"
              hint="Shown to customers at checkout"
            />
            <Select
              label="Condition"
              value={rule}
              onChange={(e) => setRule(e.target.value)}
              options={[
                'Flat rate',
                'Based on order weight',
                'Based on order price',
                'Based on item quantity',
              ]}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Price" prefix="৳" defaultValue="130" />
              {rule !== 'Flat rate' && (
                <Input
                  label={rule.includes('weight') ? 'Per extra kg' : 'Minimum'}
                  prefix={rule.includes('weight') ? '৳' : undefined}
                  defaultValue={rule.includes('weight') ? '20' : '0'}
                />
              )}
            </div>
          </div>
        </Modal>
      </div>
    </ModuleGate>
  );
}
