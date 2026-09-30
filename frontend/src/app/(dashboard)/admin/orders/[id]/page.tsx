'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Printer,
  Copy,
  Truck,
  Banknote,
  RotateCcw,
  XCircle,
  Mail,
  Phone,
  Lock,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { useAdmin } from '@/contexts/AdminContext';
import { couriers } from '@/data/shipping';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { Panel } from '@/components/dashboard/shared/Panel';
import { GuardedButton } from '@/components/dashboard/shared/GuardedButton';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { PaymentMark } from '@/components/ui/PaymentMark';
import { OrderProgress } from '@/components/dashboard/shared/OrderProgress';
import {
  fulfillmentMeta,
  nextFulfillmentStatus,
  orderStatusMeta,
  paymentMethodLabel,
  paymentStatusMeta
} from '@/utils/status';
import { formatBDT, formatDateTime } from '@/utils/format';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/types/commerce';

const actionLabel: Partial<Record<OrderStatus, string>> = {
  processing: 'Start processing',
  packed: 'Mark as packed',
  shipped: 'Create shipment',
  out_for_delivery: 'Mark out for delivery',
  delivered: 'Mark as delivered'
};

const eventLabel: Partial<Record<OrderStatus, string>> = {
  confirmed: 'Order confirmed',
  processing: 'Picking started',
  packed: 'Packed and ready for pickup',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered'
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { orders, customers, setOrderStatus, addOrderNote, refundOrder, markCodCollected, cancelOrder, returns } = useStore();
  const { actor, can } = useAdmin();

  const order = orders.find((o) => o.id === id);

  const [note, setNote] = useState('');
  const [internal, setInternal] = useState(true);
  const [shipOpen, setShipOpen] = useState(false);
  const [ship, setShip] = useState({ courier: 'Pathao', tracking: '', notify: true });
  const [refundOpen, setRefundOpen] = useState(false);
  const [refund, setRefund] = useState({ amount: '', reason: 'Customer request', restock: true });
  const [refundError, setRefundError] = useState('');
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reauth, setReauth] = useState('');

  if (!order) {
    return (
      <div className="mx-auto max-w-4xl p-8 text-center">
        <p className="text-sm text-ink-muted">Order not found.</p>
        <Link href="/admin/orders" className="mt-2 inline-block text-sm font-medium text-clay hover:underline">
          Back to orders
        </Link>
      </div>
    );
  }

  const customer = customers.find((c) => c.id === order.customerId);
  const next = order.status === 'pending_payment' ? null : nextFulfillmentStatus(order.status);
  const canUpdate = can('orders', 'update');
  const refundable = order.total - order.refunded;
  const isPaid = ['paid', 'partially_refunded', 'partially_paid'].includes(order.paymentStatus);
  const relatedReturn = returns.find((r) => r.orderNumber === order.number);
  const codPending = order.paymentMethod === 'cod' && !order.codCollected && ['out_for_delivery', 'delivered'].includes(order.status);

  const advance = () => {
    if (!next) return;
    if (next === 'shipped') {
      setShip({
        ...ship,
        tracking: `${ship.courier.slice(0, 2).toUpperCase()}${order.number.slice(3)}${Math.floor(Math.random() * 900 + 100)}`
      });
      setShipOpen(true);
      return;
    }
    setOrderStatus(order.id, next, { label: eventLabel[next] ?? next, by: actor });
    toast.success(`${order.number}: ${orderStatusMeta[next].label}`);
  };

  const doRefund = () => {
    const amt = Number(refund.amount);
    if (!amt || amt <= 0) return setRefundError('Enter an amount');
    if (amt > refundable) return setRefundError(`Maximum refundable is ${formatBDT(refundable)}`);
    if (reauth.length < 4) return setRefundError('Confirm your password to issue a refund');
    refundOrder(order.id, amt, actor, refund.reason);
    setRefundOpen(false);
    setReauth('');
    toast.success(`Refund of ${formatBDT(amt)} sent to ${paymentMethodLabel[order.paymentMethod]}`);
  };

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        back={{ href: '/admin/orders', label: 'Orders' }}
        title={order.number}
        meta={
          <>
            <Badge tone={orderStatusMeta[order.status].tone} dot>{orderStatusMeta[order.status].label}</Badge>
            <Badge tone={paymentStatusMeta[order.paymentStatus].tone}>{paymentStatusMeta[order.paymentStatus].label}</Badge>
            <Badge tone={fulfillmentMeta[order.fulfillmentStatus].tone}>{fulfillmentMeta[order.fulfillmentStatus].label}</Badge>
          </>
        }
        description={`${formatDateTime(order.createdAt)} · ${order.channel === 'manual' ? 'Created by staff' : 'Online store'}`}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => window.print()} className="cursor-pointer">
              <Printer className="h-4 w-4" aria-hidden /> Print packing slip
            </Button>
            {isPaid && can('payments', 'refund') && refundable > 0 && (
              <GuardedButton
                module="payments"
                action="refund"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setRefund({ amount: String(refundable), reason: 'Customer request', restock: true });
                  setRefundOpen(true);
                }}
              >
                Refund
              </GuardedButton>
            )}
            {codPending && canUpdate && (
              <Button size="sm" onClick={() => markCodCollected(order.id, actor)} className="cursor-pointer">
                <Banknote className="h-4 w-4" aria-hidden /> Mark COD collected
              </Button>
            )}
            {next && canUpdate && (
              <Button size="sm" onClick={advance} className="cursor-pointer">
                {actionLabel[next]}
              </Button>
            )}
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Order Progress Steps */}
          <Panel title="Order progress">
            <OrderProgress order={order} />
          </Panel>

          {/* Items Table */}
          <Panel title={`Items (${order.items.reduce((s, i) => s + i.qty, 0)})`}>
            <div className="divide-y divide-line">
              {order.items.map((i) => (
                <div key={i.variantId} className="flex items-center gap-4 py-3">
                  <img src={i.image} alt="" className="h-14 w-11 rounded object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">{i.title}</p>
                    <p className="text-xs text-ink-muted">
                      {i.color} / {i.size} · SKU: {i.sku}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-ink tabular-nums">{formatBDT(i.price * i.qty)}</p>
                    <p className="text-xs text-ink-muted tabular-nums">
                      {i.qty} × {formatBDT(i.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial summary */}
            <div className="mt-4 border-t border-line pt-4 text-[13px] space-y-1.5">
              <div className="flex justify-between text-ink-soft">
                <span>Subtotal</span>
                <span className="tabular-nums font-medium text-ink">{formatBDT(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                  <span className="tabular-nums">−{formatBDT(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-ink-soft">
                <span>Shipping ({order.shippingMethod})</span>
                <span className="tabular-nums font-medium text-ink">{formatBDT(order.shipping)}</span>
              </div>
              <div className="flex justify-between border-t border-line pt-2 text-sm font-semibold text-ink">
                <span>Total</span>
                <span className="tabular-nums">{formatBDT(order.total)}</span>
              </div>
              {order.refunded > 0 && (
                <div className="flex justify-between text-xs text-danger pt-1">
                  <span>Refunded</span>
                  <span className="tabular-nums">−{formatBDT(order.refunded)}</span>
                </div>
              )}
            </div>
          </Panel>

          {/* Payment & Attempts */}
          <Panel title="Payment" description={`${paymentMethodLabel[order.paymentMethod]} · ${paymentStatusMeta[order.paymentStatus].label}`}>
            {order.attempts.length > 0 && (
              <ul className="divide-y divide-line text-xs">
                {order.attempts.map((a) => (
                  <li key={a.id} className="flex items-center justify-between py-2">
                    <span className="font-mono text-ink-muted">{a.ref}</span>
                    <Badge tone={paymentStatusMeta[a.status].tone}>{a.status}</Badge>
                    <span className="font-medium text-ink tabular-nums">{formatBDT(a.amount)}</span>
                    <span className="text-ink-muted">{formatDateTime(a.at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {/* Timeline & Notes */}
          <Panel title="Timeline & notes">
            <div className="mb-4 flex gap-2">
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a staff note…"
                className="h-9 flex-1 rounded-md border border-line bg-canvas px-3 text-[13px] text-ink placeholder:text-ink-muted focus:border-clay focus:outline-none"
              />
              <Button
                size="sm"
                onClick={() => {
                  if (!note.trim()) return;
                  addOrderNote(order.id, note, internal, actor);
                  setNote('');
                  toast.success('Note added');
                }}
                className="cursor-pointer"
              >
                Add note
              </Button>
            </div>

            <ol className="relative border-l border-line pl-4 space-y-4 text-xs">
              {order.timeline.map((e, idx) => (
                <li key={idx} className="relative">
                  <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-surface bg-ink" />
                  <p className="font-medium text-ink">{e.label}</p>
                  <p className="text-[11px] text-ink-muted">
                    {formatDateTime(e.at)} {e.by && `· by ${e.by}`}
                  </p>
                  {e.note && <p className="mt-1 rounded bg-canvas p-2 text-ink-soft italic">“{e.note}”</p>}
                </li>
              ))}
            </ol>
          </Panel>
        </div>

        {/* Right Sidebar: Customer & Shipping Details */}
        <div className="space-y-6">
          <Panel title="Customer">
            <div className="space-y-3 text-[13px]">
              <div>
                <p className="font-semibold text-ink">{order.customerName}</p>
                <p className="text-xs text-ink-muted">{order.email}</p>
                <p className="text-xs text-ink-muted">{order.phone}</p>
              </div>

              <div className="border-t border-line pt-3">
                <p className="text-xs font-medium text-ink-muted mb-1">Shipping address</p>
                <p className="text-ink">{order.shippingAddress?.name}</p>
                <p className="text-ink-muted">{order.shippingAddress?.line1}</p>
                <p className="text-ink-muted">
                  {order.shippingAddress?.area}, {order.shippingAddress?.district}
                </p>
                <p className="text-xs text-ink-muted mt-1">{order.shippingAddress?.phone}</p>
              </div>

              {order.courier && (
                <div className="border-t border-line pt-3">
                  <p className="text-xs font-medium text-ink-muted mb-1">Courier & Tracking</p>
                  <p className="font-medium text-ink">{order.courier}</p>
                  {order.tracking && <p className="font-mono text-xs text-ink-muted">{order.tracking}</p>}
                </div>
              )}
            </div>
          </Panel>
        </div>
      </div>

      {/* Shipment Modal */}
      <Modal open={shipOpen} onClose={() => setShipOpen(false)} title="Create courier shipment">
        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs font-medium text-ink">Courier</label>
            <select
              value={ship.courier}
              onChange={(e) => setShip({ ...ship, courier: e.target.value })}
              className="mt-1 h-9 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink focus:outline-none"
            >
              {couriers.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-ink">Tracking Number</label>
            <input
              value={ship.tracking}
              onChange={(e) => setShip({ ...ship, tracking: e.target.value })}
              className="mt-1 h-9 w-full rounded-md border border-line bg-surface px-3 text-sm font-mono text-ink focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShipOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setOrderStatus(order.id, 'shipped', {
                  label: `Shipped via ${ship.courier} (${ship.tracking})`,
                  by: actor,
                  courier: ship.courier,
                  tracking: ship.tracking
                });
                setShipOpen(false);
                toast.success('Shipment created and customer notified');
              }}
            >
              Confirm shipment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Refund Modal */}
      <Modal open={refundOpen} onClose={() => setRefundOpen(false)} title="Issue refund">
        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs font-medium text-ink">Refund Amount (max: {formatBDT(refundable)})</label>
            <input
              type="number"
              value={refund.amount}
              onChange={(e) => setRefund({ ...refund, amount: e.target.value })}
              className="mt-1 h-9 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-ink">Reason</label>
            <input
              value={refund.reason}
              onChange={(e) => setRefund({ ...refund, reason: e.target.value })}
              className="mt-1 h-9 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-ink">Re-enter staff password to authorize</label>
            <input
              type="password"
              placeholder="••••••••"
              value={reauth}
              onChange={(e) => setReauth(e.target.value)}
              className="mt-1 h-9 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink focus:outline-none"
            />
          </div>
          {refundError && <p className="text-xs text-danger">{refundError}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setRefundOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={doRefund}>
              Confirm refund
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
