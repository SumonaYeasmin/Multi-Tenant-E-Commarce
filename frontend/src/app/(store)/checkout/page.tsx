'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { LockIcon, ChevronLeftIcon, AlertTriangleIcon, CheckIcon } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { useCartLines } from '@/hooks/useCartLines';
import {
  areasFor,
  districts,
  paymentMethods,
  shippingMethods,
  deliveryEstimate,
} from '@/data/shipping';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/button';
import { PaymentMark } from '@/components/ui/PaymentMark';
import { findCoupon, orderTotals } from '@/utils/pricing';
import { formatBDT } from '@/utils/format';
import { cn } from '@/utils/cn';
import type { Address, PaymentMethod } from '@/types/commerce';

type Errors = Partial<Record<string, string>>;

export default function CheckoutPage() {
  const router = useRouter();
  const { user, addresses, storeCredit, placeOrder, saveAddress } = useStore();
  const { active, subtotal, hasIssues } = useCartLines();
  const defaultAddr = addresses.find((a) => a.isDefaultShipping) ?? addresses[0];

  const [contact, setContact] = useState(() => {
    let name = user?.name ?? '';
    let email = user?.email ?? '';
    let phone = user?.phone ?? '';
    if (typeof window !== 'undefined') {
      try {
        const savedContact = localStorage.getItem('tanti_last_contact');
        if (savedContact) {
          const parsed = JSON.parse(savedContact);
          if (parsed.name && !name) name = parsed.name;
          if (parsed.email && !email) email = parsed.email;
          if (parsed.phone && !phone) phone = parsed.phone;
        }
      } catch {}
    }
    return { name, email, phone };
  });

  const [addressId, setAddressId] = useState<string>(() => {
    if (defaultAddr) return defaultAddr.id;
    return 'new';
  });

  const [newAddr, setNewAddr] = useState({
    name: '',
    phone: '',
    line1: '',
    district: '',
    area: '',
    label: '',
  });
  const [shippingId, setShippingId] = useState('standard');
  const [payment, setPayment] = useState<PaymentMethod>('bkash');
  const [useCredit, setUseCredit] = useState(false);
  const [note, setNote] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('tanti.note') ?? '';
    }
    return '';
  });
  const [consent, setConsent] = useState(false);
  const [code, setCode] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('tanti.coupon') ?? '';
    }
    return '';
  });
  const [applied, setApplied] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('tanti.coupon') ?? '';
    }
    return '';
  });
  const [codeError, setCodeError] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [placing, setPlacing] = useState(false);
  const submitting = useRef(false);

  // Auto-select saved/previous address if available when addresses hydrate
  useEffect(() => {
    if (addresses.length > 0) {
      if (addressId === 'new' && !newAddr.line1) {
        const def = addresses.find((a) => a.isDefaultShipping) ?? addresses[0];
        if (def) {
          setAddressId(def.id);
        }
      }
    }
  }, [addresses]);

  // Auto-populate contact info from selected address if contact is empty
  useEffect(() => {
    const selected = addresses.find((a) => a.id === addressId);
    if (selected) {
      setContact((prev) => ({
        name: prev.name || selected.name,
        email: prev.email || (user?.email ?? ''),
        phone: prev.phone || selected.phone,
      }));
    }
  }, [addressId, addresses, user]);

  useEffect(() => {
    if (active.length === 0 && !placing) {
      router.replace('/cart');
    }
  }, [active.length, placing, router]);

  const address: Address = useMemo(() => {
    const saved = addresses.find((a) => a.id === addressId);
    return (
      saved ?? {
        id: `a${Date.now()}`,
        ...newAddr,
        label: newAddr.label || 'Home',
        district: newAddr.district || 'Dhaka',
        area: newAddr.area || 'Dhanmondi',
        name: newAddr.name || contact.name,
        phone: newAddr.phone || contact.phone,
      }
    );
  }, [addresses, addressId, newAddr, contact]);

  const methods = shippingMethods.filter((m) => m.available(address.district));
  useEffect(() => {
    if (!methods.some((m) => m.id === shippingId)) setShippingId('standard');
  }, [methods, shippingId]);

  const method = methods.find((m) => m.id === shippingId) ?? methods[0];
  const coupon = applied ? findCoupon(applied) : undefined;
  const totals = orderTotals({
    subtotal,
    coupon,
    shipping: method ? method.price(address.district, subtotal) : 0,
    cod: payment === 'cod',
    storeCredit: useCredit ? storeCredit : 0,
  });

  const validate = () => {
    const e: Errors = {};
    const contactName = contact.name.trim();
    let contactPhone = contact.phone.trim().replace(/[\s-]/g, '');
    if (contactPhone.startsWith('+88')) contactPhone = contactPhone.slice(3);
    if (contactPhone.startsWith('88') && contactPhone.length === 13) contactPhone = contactPhone.slice(2);

    if (contactName.length < 2) e.name = 'Enter your full name';
    if (!/^\S+@\S+\.\S+$/.test(contact.email))
      e.email = 'Enter a valid email so we can send your receipt';
    if (!/^01[3-9]\d{8}$/.test(contactPhone))
      e.phone = 'Enter an 11-digit Bangladeshi mobile number';

    if (addressId === 'new') {
      const recipientName = (newAddr.name || contact.name || '').trim();
      let recipientPhone = (newAddr.phone || contact.phone || '').trim().replace(/[\s-]/g, '');
      if (recipientPhone.startsWith('+88')) recipientPhone = recipientPhone.slice(3);
      if (recipientPhone.startsWith('88') && recipientPhone.length === 13) recipientPhone = recipientPhone.slice(2);

      if (!recipientName || recipientName.length < 2) e.recipientName = 'Enter recipient name';
      if (!/^01[3-9]\d{8}$/.test(recipientPhone)) e.recipientPhone = 'Enter recipient mobile number';
      if (!newAddr.line1 || newAddr.line1.trim().length < 3)
        e.line1 = 'Enter house, road and area details';
    }

    if (!consent) e.consent = 'Please accept the terms to continue';
    return e;
  };

  const applyCode = () => {
    const c = findCoupon(code);
    if (!c) return setCodeError('Invalid code');
    if (c.minSubtotal && subtotal < c.minSubtotal)
      return setCodeError(`Requires a subtotal of ${formatBDT(c.minSubtotal)}`);
    setCodeError('');
    setApplied(c.code);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('tanti.coupon', c.code);
    }
  };

  const [savingAddress, setSavingAddress] = useState(false);

  const handleSaveAddressExplicitly = async () => {
    const e: Errors = {};
    const recipientName = (newAddr.name || contact.name || '').trim();
    let recipientPhone = (newAddr.phone || contact.phone || '').trim().replace(/[\s-]/g, '');
    if (recipientPhone.startsWith('+88')) recipientPhone = recipientPhone.slice(3);
    if (recipientPhone.startsWith('88') && recipientPhone.length === 13) recipientPhone = recipientPhone.slice(2);

    if (!recipientName || recipientName.length < 2) {
      e.recipientName = 'Please enter full name (minimum 2 characters)';
    }
    if (!/^01[3-9]\d{8}$/.test(recipientPhone)) {
      e.recipientPhone = 'Please enter a valid 11-digit mobile number (e.g. 01712345678)';
    }
    if (!newAddr.line1 || newAddr.line1.trim().length < 3) {
      e.line1 = 'Please enter street / delivery address details';
    }
    if (!newAddr.district) {
      e.district = 'Please select your district';
    }
    if (!newAddr.area) {
      e.area = 'Please select your thana / area';
    }

    setErrors(e);
    if (Object.keys(e).length > 0) {
      const firstError = Object.values(e)[0];
      toast.error(firstError || 'Please fill in all required address fields');
      return;
    }

    try {
      setSavingAddress(true);
      const payload: Address = {
        id: `a${Date.now()}`,
        label: newAddr.label || 'Home',
        name: recipientName,
        phone: recipientPhone,
        line1: newAddr.line1.trim(),
        district: newAddr.district || 'Dhaka',
        area: newAddr.area || 'Dhanmondi',
        isDefaultShipping: true,
      };

      const res: any = await saveAddress(payload);
      const savedId = (res && typeof res === 'object' && res.id) ? res.id : payload.id;
      setAddressId(savedId);

      setContact((prev) => ({
        name: prev.name || recipientName,
        email: prev.email,
        phone: prev.phone || recipientPhone,
      }));

      setNewAddr({
        name: '',
        phone: '',
        line1: '',
        district: '',
        area: '',
        label: '',
      });
      setErrors({});

      toast.success('Address saved successfully!');
    } catch (err) {
      toast.error('Could not save address. Please try again.');
    } finally {
      setSavingAddress(false);
    }
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (submitting.current) return;
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      const first = document.querySelector('[aria-invalid="true"]') as HTMLElement | null;
      first?.focus();
      toast.error('Please fix the highlighted fields');
      return;
    }
    if (hasIssues) {
      toast.error(
        'Some items are no longer available in the requested quantity. Review your bag.'
      );
      router.push('/cart');
      return;
    }
    submitting.current = true;
    setPlacing(true);

    let finalAddress = address;
    if (addressId === 'new') {
      try {
        const savedResult: any = await saveAddress({
          ...address,
          label: newAddr.label || 'Home',
          isDefaultShipping: addresses.length === 0,
        });
        if (savedResult && typeof savedResult === 'object' && savedResult.id) {
          finalAddress = {
            ...address,
            id: savedResult.id,
            label: savedResult.label || newAddr.label || 'Home',
          };
        }
      } catch (err) {
        console.error('Failed to save address:', err);
      }
    } else {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('tanti_last_delivery_address', JSON.stringify(finalAddress));
        } catch {}
      }
    }

    await new Promise((r) => setTimeout(r, 600));
    const order = placeOrder({
      contact,
      address: finalAddress,
      shippingMethod: method.name,
      shippingCost: totals.shipping + totals.codFee,
      paymentMethod: payment,
      discount: totals.discount + totals.credit,
      couponCode: coupon?.code,
      customerNote: note || undefined,
      subtotal,
      total: totals.total,
    });
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('tanti.coupon');
      sessionStorage.removeItem('tanti.note');
      try {
        localStorage.setItem('tanti_last_contact', JSON.stringify(contact));
      } catch {}
    }
    router.replace(payment === 'cod' ? `/order/${order.id}` : `/pay/${order.id}`);
  };

  return (
    <div className="min-h-screen w-full bg-canvas">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="font-display text-2xl">
            Tanti
          </Link>
          <span className="flex items-center gap-1.5 text-sm text-ink-muted">
            <LockIcon className="h-3.5 w-3.5" aria-hidden /> Secure checkout
          </span>
        </div>
      </header>

      <form
        onSubmit={submit}
        noValidate
        className="mx-auto grid max-w-6xl gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_400px]"
      >
        <div className="space-y-10">
          <Link
            href="/cart"
            className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
          >
            <ChevronLeftIcon className="h-4 w-4" aria-hidden /> Back to bag
          </Link>

          <Section
            n={1}
            title="Contact"
            aside={
              !user && (
                <span className="text-sm">
                  Have an account?{' '}
                  <Link href="/login?next=/checkout" className="font-medium underline">
                    Sign in
                  </Link>
                </span>
              )
            }
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Full name"
                value={contact.name}
                onChange={(e) => setContact({ ...contact, name: e.target.value })}
                error={errors.name}
                autoComplete="name"
                className="sm:col-span-2"
              />
              <Input
                label="Email"
                type="email"
                value={contact.email}
                onChange={(e) => setContact({ ...contact, email: e.target.value })}
                error={errors.email}
                autoComplete="email"
              />
              <Input
                label="Mobile number"
                type="tel"
                value={contact.phone}
                onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                error={errors.phone}
                placeholder="01XXX-XXXXXX"
                hint="For delivery updates via SMS"
                autoComplete="tel"
              />
            </div>
          </Section>

          <Section n={2} title="Delivery address">
            {addresses.length > 0 && (
              <div
                className="grid gap-3 sm:grid-cols-2"
                role="radiogroup"
                aria-label="Delivery addresses"
              >
                {addresses.map((a) => {
                  const isSelected = addressId === a.id;
                  return (
                    <RadioCard
                      key={a.id}
                      checked={isSelected}
                      onSelect={() => setAddressId(a.id)}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-ink">{a.label || 'Saved Address'}</p>
                        {a.isDefaultShipping ? (
                          <span className="rounded bg-clay/10 px-2 py-0.5 text-xs font-medium text-clay">
                            Default
                          </span>
                        ) : (
                          <span className="rounded bg-surface-muted px-2 py-0.5 text-xs text-ink-muted">
                            Previous Address
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm font-medium text-ink">
                        {a.name} · {a.phone}
                      </p>
                      <p className="text-sm text-ink-muted">
                        {a.line1}, {a.area}, {a.district}
                      </p>
                    </RadioCard>
                  );
                })}
                <RadioCard
                  checked={addressId === 'new'}
                  onSelect={() => setAddressId('new')}
                >
                  <p className="text-sm font-medium text-brand flex items-center gap-1.5">
                    + Use a new address
                  </p>
                  <p className="text-xs text-ink-muted mt-1">
                    Enter a different recipient or delivery location
                  </p>
                </RadioCard>
              </div>
            )}
            {addressId === 'new' && (
              <div className={cn('grid gap-4 sm:grid-cols-2', addresses.length > 0 && 'mt-5 p-4 rounded-xl border border-line bg-surface/40')}>
                {addresses.length > 0 && (
                  <div className="sm:col-span-2 flex items-center justify-between border-b border-line pb-2 mb-1">
                    <p className="text-sm font-medium text-ink">Enter New Delivery Address</p>
                    <button
                      type="button"
                      onClick={() => {
                        const def = addresses.find((a) => a.isDefaultShipping) ?? addresses[0];
                        if (def) setAddressId(def.id);
                      }}
                      className="text-xs text-brand hover:underline cursor-pointer font-medium"
                    >
                      ← Back to saved address
                    </button>
                  </div>
                )}
                {user && (
                  <Select
                    label="Address type"
                    value={newAddr.label}
                    placeholder="Select address type (e.g. Home)"
                    onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                    options={['Home', 'Office', "Parents' home", 'Other']}
                    className="sm:col-span-2"
                  />
                )}
                <Input
                  label="Full name"
                  value={newAddr.name}
                  onChange={(e) => {
                    setNewAddr({ ...newAddr, name: e.target.value });
                    if (errors.recipientName) setErrors((prev) => ({ ...prev, recipientName: undefined }));
                  }}
                  error={errors.recipientName}
                  placeholder={contact.name || "Enter recipient's full name"}
                />
                <Input
                  label="Phone number"
                  type="tel"
                  value={newAddr.phone}
                  onChange={(e) => {
                    setNewAddr({ ...newAddr, phone: e.target.value });
                    if (errors.recipientPhone) setErrors((prev) => ({ ...prev, recipientPhone: undefined }));
                  }}
                  error={errors.recipientPhone}
                  placeholder="01XXXXXXXXX (e.g. 01712-345678)"
                />
                <Input
                  label="Street / delivery address"
                  value={newAddr.line1}
                  onChange={(e) => {
                    setNewAddr({ ...newAddr, line1: e.target.value });
                    if (errors.line1) setErrors((prev) => ({ ...prev, line1: undefined }));
                  }}
                  error={errors.line1}
                  placeholder="House no, road no, flat, area details..."
                  className="sm:col-span-2"
                  autoComplete="street-address"
                />
                <Select
                  label="District"
                  value={newAddr.district}
                  placeholder="Select district"
                  error={errors.district}
                  onChange={(e) => {
                    setNewAddr({
                      ...newAddr,
                      district: e.target.value,
                      area: areasFor(e.target.value)[0] || '',
                    });
                    if (errors.district) setErrors((prev) => ({ ...prev, district: undefined }));
                  }}
                  options={districts}
                />
                <Select
                  label="Thana / area"
                  value={newAddr.area}
                  placeholder="Select thana / area"
                  error={errors.area}
                  onChange={(e) => {
                    setNewAddr({ ...newAddr, area: e.target.value });
                    if (errors.area) setErrors((prev) => ({ ...prev, area: undefined }));
                  }}
                  options={newAddr.district ? areasFor(newAddr.district) : []}
                />
                <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-line/60 mt-1">
                  <Button
                    type="button"
                    size="sm"
                    loading={savingAddress}
                    onClick={handleSaveAddressExplicitly}
                    className="inline-flex items-center gap-1.5"
                  >
                    <CheckIcon className="h-4 w-4" /> Save address
                  </Button>
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const def = addresses.find((a) => a.isDefaultShipping) ?? addresses[0];
                        if (def) setAddressId(def.id);
                      }}
                      className="text-xs text-ink-muted hover:text-ink cursor-pointer font-medium"
                    >
                      Cancel & use saved address
                    </button>
                  )}
                </div>
              </div>
            )}
          </Section>

          <Section n={3} title="Delivery method">
            <div className="space-y-2" role="radiogroup" aria-label="Delivery method">
              {methods.map((m) => {
                const price =
                  coupon?.type === 'free_shipping'
                    ? 0
                    : m.price(address.district, subtotal);
                return (
                  <RadioCard
                    key={m.id}
                    checked={shippingId === m.id}
                    onSelect={() => setShippingId(m.id)}
                    row
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{m.name}</p>
                      <p className="text-sm text-ink-muted">
                        {m.description} · {deliveryEstimate(address.district, m.id)}
                      </p>
                    </div>
                    <span className="text-sm font-medium tabular-nums">
                      {price === 0 ? 'Free' : formatBDT(price)}
                    </span>
                  </RadioCard>
                );
              })}
            </div>
          </Section>

          <Section n={4} title="Payment">
            <div className="space-y-2" role="radiogroup" aria-label="Payment method">
              {paymentMethods.map((p) => (
                <RadioCard
                  key={p.id}
                  checked={payment === p.id}
                  onSelect={() => setPayment(p.id)}
                  row
                >
                  <PaymentMark method={p.id} className="h-7 min-w-[2.5rem]" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-sm text-ink-muted">{p.description}</p>
                  </div>
                </RadioCard>
              ))}
            </div>
            {payment !== 'cod' && (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-muted">
                <LockIcon className="h-3 w-3" aria-hidden /> You’ll be redirected to{' '}
                {paymentMethods.find((p) => p.id === payment)?.name} to complete payment
                securely. We never see your PIN or card number.
              </p>
            )}
          </Section>

          <div>
            <label htmlFor="order-note" className="text-sm font-medium">
              Order note <span className="font-normal text-ink-muted">(optional)</span>
            </label>
            <textarea
              id="order-note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-sm focus:border-clay focus:outline-none"
              placeholder="Gift message, landmark, preferred delivery time…"
            />
          </div>
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start" aria-label="Order summary">
          <div className="rounded-lg border border-line bg-surface p-6">
            <h2 className="text-base font-semibold">Order summary</h2>
            <ul className="mt-4 max-h-64 space-y-4 overflow-y-auto pr-1">
              {active.map(({ item, product, variant, unitPrice, issue }) => (
                <li key={item.key} className="flex gap-3">
                  <div className="relative">
                    <img
                      src={product.images[0]}
                      alt=""
                      className="h-16 w-12 rounded object-cover"
                    />
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-ink px-1 text-xs text-canvas">
                      {item.qty}
                    </span>
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-medium leading-snug">{product.title}</p>
                    <p className="text-xs text-ink-muted">
                      {variant.color} · {variant.size}
                    </p>
                    {issue && <p className="text-xs text-danger">Stock changed</p>}
                  </div>
                  <span className="text-sm tabular-nums">
                    {formatBDT(unitPrice * item.qty)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex gap-2 border-t border-line pt-5">
              <input
                aria-label="Discount code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Discount code"
                className="h-10 flex-1 rounded-md border border-line-strong px-3 text-sm uppercase focus:border-clay focus:outline-none"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={applyCode}
                disabled={!code}
              >
                Apply
              </Button>
            </div>
            {codeError && <p className="mt-1.5 text-xs text-danger">{codeError}</p>}
            {coupon && !codeError && (
              <p className="mt-1.5 text-xs text-success">{coupon.code} applied</p>
            )}
            {user && storeCredit > 0 && (
              <div className="mt-4">
                <Checkbox
                  checked={useCredit}
                  onChange={setUseCredit}
                  label={`Use store credit (${formatBDT(storeCredit)} available)`}
                />
              </div>
            )}
            <dl className="mt-5 space-y-2 border-t border-line pt-5 text-sm">
              <Row label="Subtotal" value={formatBDT(subtotal)} />
              {totals.discount > 0 && (
                <Row
                  label={`Discount (${coupon?.code})`}
                  value={`−${formatBDT(totals.discount)}`}
                  tone="success"
                />
              )}
              <Row
                label={`Delivery · ${method.name.split(' ')[0]}`}
                value={totals.shipping === 0 ? 'Free' : formatBDT(totals.shipping)}
              />
              {totals.codFee > 0 && (
                <Row label="COD fee" value={formatBDT(totals.codFee)} />
              )}
              {totals.credit > 0 && (
                <Row
                  label="Store credit"
                  value={`−${formatBDT(totals.credit)}`}
                  tone="success"
                />
              )}
              <Row label="VAT" value="Included" />
              <div className="flex justify-between border-t border-line pt-3 text-base font-semibold">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatBDT(totals.total)}</dd>
              </div>
            </dl>

            {hasIssues && (
              <p
                className="mt-4 flex gap-2 rounded-md bg-warning-soft p-3 text-xs text-warning"
                role="alert"
              >
                <AlertTriangleIcon className="h-4 w-4 shrink-0" aria-hidden /> Stock
                changed for an item in your bag. Review before paying.
              </p>
            )}

            <div className="mt-5">
              <Checkbox
                checked={consent}
                onChange={setConsent}
                label={
                  <>
                    I agree to the{' '}
                    <Link href="/policies/terms" className="underline" target="_blank">
                      Terms
                    </Link>
                    ,{' '}
                    <Link href="/policies/returns" className="underline" target="_blank">
                      Return policy
                    </Link>{' '}
                    and{' '}
                    <Link href="/policies/privacy" className="underline" target="_blank">
                      Privacy policy
                    </Link>
                  </>
                }
              />
              {errors.consent && (
                <p
                  className="mt-1 text-xs text-danger"
                  aria-invalid="true"
                  tabIndex={-1}
                >
                  {errors.consent}
                </p>
              )}
            </div>
            <Button
              type="submit"
              size="lg"
              fullWidth
              className="mt-5"
              loading={placing}
            >
              {placing
                ? 'Confirming stock & price…'
                : payment === 'cod'
                ? `Place order · ${formatBDT(totals.total)}`
                : `Pay ${formatBDT(totals.total)}`}
            </Button>
          </div>
        </aside>
      </form>
    </div>
  );
}

function Section({
  n,
  title,
  aside,
  children,
}: {
  n: number;
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={`s${n}`}>
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 id={`s${n}`} className="flex items-baseline gap-3 font-display text-xl">
          <span className="font-sans text-sm text-ink-muted">{n}</span>
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

function RadioCard({
  checked,
  onSelect,
  children,
  row,
}: {
  checked: boolean;
  onSelect: () => void;
  children: React.ReactNode;
  row?: boolean;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onSelect}
      className={cn(
        'relative w-full rounded-md border bg-surface p-4 text-left transition-colors duration-150 cursor-pointer',
        checked ? 'border-ink ring-1 ring-ink' : 'border-line-strong hover:border-ink/50',
        row && 'flex items-center gap-4'
      )}
    >
      {!row && checked && (
        <CheckIcon className="absolute right-3 top-3 h-4 w-4" aria-hidden />
      )}
      {row && (
        <span
          className={cn(
            'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
            checked ? 'border-ink' : 'border-line-strong'
          )}
        >
          {checked && <span className="h-2 w-2 rounded-full bg-ink" />}
        </span>
      )}
      {children}
    </button>
  );
}

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'success';
}) {
  return (
    <div
      className={cn('flex justify-between', tone === 'success' ? 'text-success' : '')}
    >
      <dt className={tone ? '' : 'text-ink-muted'}>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
