'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { AccountHeader } from '@/components/account/AccountHeader';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/button';

const events = [
  {
    key: 'order',
    label: 'Order updates',
    description: 'Confirmation, shipping and delivery',
    locked: true,
  },
  {
    key: 'payment',
    label: 'Payment & refunds',
    description: 'Receipts, failed payments and refunds',
    locked: true,
  },
  {
    key: 'returns',
    label: 'Returns',
    description: 'Approval, pickup and inspection updates',
    locked: false,
  },
  {
    key: 'stock',
    label: 'Back in stock & price drops',
    description: 'For items on your wishlist',
    locked: false,
  },
  {
    key: 'marketing',
    label: 'New collections & offers',
    description: 'At most twice a week',
    locked: false,
  },
];

const channels = ['email', 'sms', 'push'] as const;

export default function AccountNotificationsPage() {
  const [prefs, setPrefs] = useState<Record<string, Record<string, boolean>>>({
    order: { email: true, sms: true, push: true },
    payment: { email: true, sms: true, push: false },
    returns: { email: true, sms: true, push: false },
    stock: { email: true, sms: false, push: true },
    marketing: { email: true, sms: false, push: false },
  });

  return (
    <div className="max-w-3xl">
      <AccountHeader
        title="Notifications"
        description="Choose how Tanti keeps in touch. Transactional messages about your orders can’t be fully turned off."
      />
      <div className="overflow-x-auto rounded-lg border border-line bg-surface">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="px-5 py-3 font-medium">Event</th>
              {channels.map((c) => (
                <th
                  key={c}
                  className="w-20 px-3 py-3 text-center font-medium capitalize"
                >
                  {c === 'sms' ? 'SMS' : c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.key} className="border-b border-line last:border-0">
                <td className="px-5 py-4">
                  <p className="font-medium">{e.label}</p>
                  <p className="text-xs text-ink-muted">{e.description}</p>
                </td>
                {channels.map((c) => (
                  <td key={c} className="px-3 py-4">
                    <div className="flex justify-center">
                      <Checkbox
                        checked={prefs[e.key][c]}
                        disabled={e.locked && c === 'email'}
                        onChange={(v) =>
                          setPrefs({
                            ...prefs,
                            [e.key]: { ...prefs[e.key], [c]: v },
                          })
                        }
                        ariaLabel={`${e.label} via ${c}`}
                      />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6 flex justify-end">
        <Button onClick={() => toast.success('Preferences saved')}>Save preferences</Button>
      </div>
    </div>
  );
}
