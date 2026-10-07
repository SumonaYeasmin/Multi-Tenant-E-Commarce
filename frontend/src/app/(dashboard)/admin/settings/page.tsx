'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { paymentMethods } from '@/data/shipping';
import { useAdmin } from '@/contexts/AdminContext';
import { useTenant } from '@/contexts/TenantContext';
import { storeService } from '@/services/store-service';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { Panel } from '@/components/dashboard/shared/Panel';
import { GuardedButton } from '@/components/dashboard/shared/GuardedButton';
import { ModuleGate } from '@/components/dashboard/shared/ModuleGate';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Checkbox } from '@/components/ui/Checkbox';
import { PaymentMark } from '@/components/ui/PaymentMark';
import { cn } from '@/utils/cn';

const sections = [
  'General',
  'Checkout',
  'Payments',
  'Taxes',
  'Returns',
  'Customer accounts',
  'Privacy',
  'Availability',
] as const;
type Section = (typeof sections)[number];

export default function AdminSettingsPage() {
  const { can } = useAdmin();
  const { refetchTenant } = useTenant();
  const [section, setSection] = useState<Section>('General');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // General Store & Contact Details Form State
  const [storeForm, setStoreForm] = useState({
    name: 'Tanti',
    tagline: 'Handloom & Contemporary Bangladeshi Fashion',
    email: 'care@tanti.com.bd',
    phone: '09612-826842',
    whatsapp: '+880 1700-000000',
    address: 'House 14, Road 27 (old), Dhanmondi, Dhaka 1209',
    workingHours: 'Sat–Thu, 10 AM – 9 PM',
    responseTime: 'Replies within 2 to 4 working hours',
    supportTeam: 'Tanti Care team',
    orderNumberFormat: 'TN-{number}',
  });

  const [pm, setPm] = useState<Record<string, boolean>>({
    bkash: true,
    nagad: true,
    sslcommerz: true,
    stripe: true,
    cod: true,
  });

  const [flags, setFlags] = useState({
    guest: true,
    phoneOtp: true,
    notes: true,
    maintenance: false,
    cookie: true,
    social: true,
    mfa: false,
    vatIncl: true,
    vatShip: false,
    photos: true,
    exchanges: true,
    finalSale: true,
  });

  const setFlag = (k: keyof typeof flags) => (v: boolean) =>
    setFlags({ ...flags, [k]: v });

  // Load existing settings on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        setIsLoading(true);
        const res = await storeService.getOwnerSettings();
        if (res && res.data) {
          const d = res.data;
          setStoreForm({
            name: d.name || 'Tanti',
            tagline: d.tagline || 'Handloom & Contemporary Bangladeshi Fashion',
            email: d.contact?.email || 'care@tanti.com.bd',
            phone: d.contact?.phone || '09612-826842',
            whatsapp: d.contact?.whatsapp || '+880 1700-000000',
            address:
              d.contact?.address ||
              'House 14, Road 27 (old), Dhanmondi, Dhaka 1209',
            workingHours: d.contact?.workingHours || 'Sat–Thu, 10 AM – 9 PM',
            responseTime:
              d.contact?.responseTime || 'Replies within 2 to 4 working hours',
            supportTeam: d.contact?.supportTeam || `${d.name || 'Tanti'} Care team`,
            orderNumberFormat: d.settings?.orderNumberFormat || 'TN-{number}',
          });
        }
      } catch (err) {
        console.error('Failed to load store settings:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      if (section === 'General') {
        await storeService.updateOwnerSettings({
          name: storeForm.name,
          tagline: storeForm.tagline,
          contact: {
            email: storeForm.email,
            phone: storeForm.phone,
            whatsapp: storeForm.whatsapp,
            address: storeForm.address,
            workingHours: storeForm.workingHours,
            responseTime: storeForm.responseTime,
            supportTeam: storeForm.supportTeam,
          },
          settings: {
            orderNumberFormat: storeForm.orderNumberFormat,
          },
        });
      } else {
        await storeService.updateOwnerSettings({
          settings: {
            flags,
            pm,
          },
        });
      }

      await refetchTenant();
      toast.success(`${section} settings saved successfully`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ModuleGate module="settings">
      <div className="w-full space-y-6">
        <PageHeader title="Settings" description="Store-wide configuration and public contact channels." />
        <div className="grid gap-6 md:grid-cols-[200px_1fr]">
          <nav
            aria-label="Settings sections"
            className="flex gap-1 overflow-x-auto md:flex-col"
          >
            {sections.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSection(s)}
                aria-current={section === s}
                className={cn(
                  'whitespace-nowrap rounded-md px-3 py-2 text-left text-sm cursor-pointer transition-colors',
                  section === s
                    ? 'bg-surface font-medium text-ink shadow-sm ring-1 ring-line'
                    : 'text-ink-soft hover:text-ink'
                )}
              >
                {s}
              </button>
            ))}
          </nav>
          <fieldset
            disabled={!can('settings', 'settings')}
            className="space-y-6"
          >
            {section === 'General' && (
              <Panel title="Store & Public Contact Details">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Store brand name"
                    value={storeForm.name}
                    onChange={(e) =>
                      setStoreForm({ ...storeForm, name: e.target.value })
                    }
                  />
                  <Input
                    label="Store tagline"
                    value={storeForm.tagline}
                    onChange={(e) =>
                      setStoreForm({ ...storeForm, tagline: e.target.value })
                    }
                  />
                  <Input
                    label="Customer support email"
                    type="email"
                    value={storeForm.email}
                    onChange={(e) =>
                      setStoreForm({ ...storeForm, email: e.target.value })
                    }
                  />
                  <Input
                    label="Hotline / Phone number"
                    value={storeForm.phone}
                    onChange={(e) =>
                      setStoreForm({ ...storeForm, phone: e.target.value })
                    }
                  />
                  <Input
                    label="WhatsApp number"
                    value={storeForm.whatsapp}
                    onChange={(e) =>
                      setStoreForm({ ...storeForm, whatsapp: e.target.value })
                    }
                    placeholder="+880 1700-000000"
                  />
                  <Input
                    label="Support team name"
                    value={storeForm.supportTeam}
                    onChange={(e) =>
                      setStoreForm({ ...storeForm, supportTeam: e.target.value })
                    }
                    placeholder="e.g. Tanti Care team"
                  />
                  <Input
                    label="Business & working hours"
                    value={storeForm.workingHours}
                    onChange={(e) =>
                      setStoreForm({ ...storeForm, workingHours: e.target.value })
                    }
                    placeholder="e.g. Sat–Thu, 10 AM – 9 PM"
                  />
                  <Input
                    label="Support response time note"
                    value={storeForm.responseTime}
                    onChange={(e) =>
                      setStoreForm({ ...storeForm, responseTime: e.target.value })
                    }
                    placeholder="e.g. Replies within 2 to 4 working hours"
                  />
                  <div className="sm:col-span-2">
                    <Input
                      label="Flagship store / Office physical address"
                      value={storeForm.address}
                      onChange={(e) =>
                        setStoreForm({ ...storeForm, address: e.target.value })
                      }
                      placeholder="Road, Area, City, Postal Code"
                    />
                  </div>
                  <Select
                    label="Currency"
                    options={['BDT — Bangladeshi Taka (৳)', 'USD — US Dollar ($)']}
                  />
                  <Select label="Timezone" options={['(GMT+06:00) Dhaka']} />
                  <Select
                    label="Language"
                    options={['English', 'বাংলা (coming soon)']}
                  />
                  <Input
                    label="Order number format"
                    value={storeForm.orderNumberFormat}
                    onChange={(e) =>
                      setStoreForm({
                        ...storeForm,
                        orderNumberFormat: e.target.value,
                      })
                    }
                    hint="Next order: TN-10498"
                  />
                </div>
              </Panel>
            )}
            {section === 'Checkout' && (
              <Panel title="Checkout">
                <div className="space-y-4">
                  <Switch
                    checked={flags.guest}
                    onChange={setFlag('guest')}
                    label="Allow guest checkout"
                  />
                  <Switch
                    checked={flags.phoneOtp}
                    onChange={setFlag('phoneOtp')}
                    label="Verify phone by OTP for cash on delivery orders"
                  />
                  <Switch
                    checked={flags.notes}
                    onChange={setFlag('notes')}
                    label="Show order notes field"
                  />
                  <Input
                    label="Unpaid order hold time (minutes)"
                    defaultValue="30"
                    hint="Reserved stock is released after this"
                  />
                </div>
              </Panel>
            )}
            {section === 'Payments' && (
              <Panel title="Payment methods" flush>
                <ul className="divide-y divide-line">
                  {paymentMethods.map((m) => (
                    <li
                      key={m.id}
                      className="flex items-center gap-3 px-5 py-3.5 hover:bg-subtle/30"
                    >
                      <PaymentMark method={m.id} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-ink">
                          {m.name}
                        </p>
                        <p className="text-xs text-ink-muted">{m.description}</p>
                      </div>
                      <Switch
                        checked={!!pm[m.id]}
                        onChange={(v) => setPm({ ...pm, [m.id]: v })}
                        label={`Enable ${m.name}`}
                        hideLabel
                      />
                    </li>
                  ))}
                </ul>
                <p className="border-t border-line px-5 py-3 text-xs text-ink-muted">
                  Gateway credentials are managed in Integrations and encrypted at
                  rest. Changing them requires re-authentication.
                </p>
              </Panel>
            )}
            {section === 'Taxes' && (
              <Panel title="VAT">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="VAT rate (%)" defaultValue="7.5" />
                  <Input label="BIN" defaultValue="004512876-0101" />
                </div>
                <div className="mt-4 space-y-2">
                  <Checkbox
                    checked={flags.vatIncl}
                    onChange={setFlag('vatIncl')}
                    label="Prices include VAT"
                  />
                  <Checkbox
                    checked={flags.vatShip}
                    onChange={setFlag('vatShip')}
                    label="Charge VAT on delivery fees"
                  />
                </div>
              </Panel>
            )}
            {section === 'Returns' && (
              <Panel title="Return policy">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Return window (days after delivery)"
                    defaultValue="7"
                  />
                  <Select
                    label="Refund methods"
                    options={[
                      'Original payment or store credit',
                      'Store credit only',
                    ]}
                  />
                </div>
                <div className="mt-4 space-y-2">
                  <Checkbox
                    checked={flags.photos}
                    onChange={setFlag('photos')}
                    label="Require photos for ‘damaged’ or ‘wrong item’ reasons"
                  />
                  <Checkbox
                    checked={flags.exchanges}
                    onChange={setFlag('exchanges')}
                    label="Allow size exchanges"
                  />
                  <Checkbox
                    checked={flags.finalSale}
                    onChange={setFlag('finalSale')}
                    label="Final sale: sarees & jewellery (damaged only)"
                  />
                </div>
              </Panel>
            )}
            {section === 'Customer accounts' && (
              <Panel title="Customer accounts">
                <div className="space-y-4">
                  <Switch
                    checked={flags.social}
                    onChange={setFlag('social')}
                    label="Sign in with Google & Facebook"
                  />
                  <Switch
                    checked={flags.mfa}
                    onChange={setFlag('mfa')}
                    label="Offer two-factor authentication to customers"
                  />
                </div>
              </Panel>
            )}
            {section === 'Privacy' && (
              <Panel title="Cookies & privacy">
                <Switch
                  checked={flags.cookie}
                  onChange={setFlag('cookie')}
                  label="Show cookie consent banner"
                />
                <p className="mt-3 text-xs text-ink-muted">
                  Analytics and marketing pixels only load after consent.
                </p>
              </Panel>
            )}
            {section === 'Availability' && (
              <Panel title="Store availability">
                <Switch
                  checked={flags.maintenance}
                  onChange={setFlag('maintenance')}
                  label="Maintenance mode — show a ‘back soon’ page to visitors"
                />
                {flags.maintenance && (
                  <p className="mt-3 rounded-md bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
                    Your storefront is hidden. Staff can still preview it while
                    signed in.
                  </p>
                )}
              </Panel>
            )}
            <div className="flex justify-end">
              <GuardedButton
                module="settings"
                action="settings"
                loading={isSaving}
                onClick={handleSave}
              >
                Save
              </GuardedButton>
            </div>
          </fieldset>
        </div>
      </div>
    </ModuleGate>
  );
}
