import type { FulfillmentStatus, OrderStatus, PaymentMethod, PaymentStatus, ReturnStatus } from '../types/commerce';

export type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'clay';

export const orderStatusMeta: Record<OrderStatus, { label: string; tone: Tone }> = {
  pending_payment: { label: 'Pending payment', tone: 'warning' },
  confirmed: { label: 'Confirmed', tone: 'info' },
  processing: { label: 'Processing', tone: 'info' },
  packed: { label: 'Packed', tone: 'clay' },
  shipped: { label: 'Shipped', tone: 'clay' },
  out_for_delivery: { label: 'Out for delivery', tone: 'clay' },
  delivered: { label: 'Delivered', tone: 'success' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
  return_requested: { label: 'Return requested', tone: 'warning' },
  returned: { label: 'Returned', tone: 'neutral' },
  refunded: { label: 'Refunded', tone: 'neutral' },
  partially_refunded: { label: 'Partially refunded', tone: 'warning' },
  failed: { label: 'Failed', tone: 'danger' }
};

export const paymentStatusMeta: Record<PaymentStatus, { label: string; tone: Tone }> = {
  pending: { label: 'Payment pending', tone: 'warning' },
  processing: { label: 'Processing', tone: 'info' },
  paid: { label: 'Paid', tone: 'success' },
  failed: { label: 'Failed', tone: 'danger' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
  partially_paid: { label: 'Partially paid', tone: 'warning' },
  refunded: { label: 'Refunded', tone: 'neutral' },
  partially_refunded: { label: 'Partially refunded', tone: 'warning' }
};

export const fulfillmentMeta: Record<FulfillmentStatus, { label: string; tone: Tone }> = {
  unfulfilled: { label: 'Unfulfilled', tone: 'warning' },
  partial: { label: 'Partially fulfilled', tone: 'info' },
  fulfilled: { label: 'Fulfilled', tone: 'success' }
};

export const returnStatusMeta: Record<ReturnStatus, { label: string; tone: Tone }> = {
  requested: { label: 'Requested', tone: 'warning' },
  approved: { label: 'Approved', tone: 'info' },
  rejected: { label: 'Rejected', tone: 'danger' },
  in_transit: { label: 'In transit', tone: 'clay' },
  received: { label: 'Received · inspect', tone: 'clay' },
  refunded: { label: 'Refunded', tone: 'success' },
  exchanged: { label: 'Exchanged', tone: 'success' }
};

export const paymentMethodLabel: Record<PaymentMethod, string> = {
  bkash: 'bKash',
  nagad: 'Nagad',
  sslcommerz: 'SSLCommerz',
  stripe: 'Stripe',
  cod: 'Cash on delivery'
};

export const fulfillmentSteps: { status: OrderStatus; label: string }[] = [
  { status: 'confirmed', label: 'Confirmed' },
  { status: 'processing', label: 'Processing' },
  { status: 'packed', label: 'Packed' },
  { status: 'shipped', label: 'Shipped' },
  { status: 'out_for_delivery', label: 'Out for delivery' },
  { status: 'delivered', label: 'Delivered' }
];

export function nextFulfillmentStatus(status: OrderStatus): OrderStatus | null {
  const idx = fulfillmentSteps.findIndex((s) => s.status === status);
  if (idx === -1 || idx === fulfillmentSteps.length - 1) return null;
  return fulfillmentSteps[idx + 1].status;
}

export function stepIndex(status: OrderStatus) {
  if (['return_requested', 'returned', 'refunded', 'partially_refunded'].includes(status)) return fulfillmentSteps.length - 1;
  return fulfillmentSteps.findIndex((s) => s.status === status);
}
