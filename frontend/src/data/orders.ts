import { products } from './products';
import { customers, currentUserAddresses } from './customers';
import type { Order, OrderStatus, PaymentMethod, PaymentStatus, ReturnRequest } from '../types/commerce';

interface OrderSeed {
  n: number;
  c: string;
  date: string;
  items: [string, number, number][]; // productId, variantIndex, qty
  status: OrderStatus;
  pay: PaymentMethod;
  payStatus: PaymentStatus;
  coupon?: string;
  courier?: string;
}

const seeds: OrderSeed[] = [
  { n: 10498, c: 'c04', date: '2026-09-25T20:14:00', items: [['p04', 2, 1]], status: 'pending_payment', pay: 'bkash', payStatus: 'pending' },
  { n: 10497, c: 'c03', date: '2026-09-25T18:02:00', items: [['p02', 0, 1]], status: 'confirmed', pay: 'sslcommerz', payStatus: 'paid' },
  { n: 10496, c: 'c08', date: '2026-09-25T15:47:00', items: [['p10', 2, 1], ['p12', 0, 1]], status: 'confirmed', pay: 'cod', payStatus: 'pending' },
  { n: 10495, c: 'c11', date: '2026-09-25T12:30:00', items: [['p03', 3, 2]], status: 'processing', pay: 'nagad', payStatus: 'paid', coupon: 'TANTI10' },
  { n: 10494, c: 'c07', date: '2026-09-25T10:05:00', items: [['p06', 1, 1], ['p09', 3, 1]], status: 'packed', pay: 'cod', payStatus: 'pending', courier: 'Pathao' },
  { n: 10493, c: 'c02', date: '2026-09-24T21:22:00', items: [['p13', 2, 1]], status: 'shipped', pay: 'bkash', payStatus: 'paid', courier: 'Steadfast' },
  { n: 10492, c: 'c12', date: '2026-09-24T16:40:00', items: [['p14', 1, 1], ['p08', 0, 1]], status: 'out_for_delivery', pay: 'cod', payStatus: 'pending', courier: 'Pathao' },
  { n: 10491, c: 'c09', date: '2026-09-24T11:15:00', items: [['p03', 1, 1]], status: 'delivered', pay: 'cod', payStatus: 'paid', courier: 'Pathao' },
  { n: 10490, c: 'c05', date: '2026-09-23T19:48:00', items: [['p01', 1, 1]], status: 'failed', pay: 'nagad', payStatus: 'failed' },
  { n: 10489, c: 'c06', date: '2026-09-23T14:00:00', items: [['p03', 2, 20], ['p01', 2, 15]], status: 'processing', pay: 'sslcommerz', payStatus: 'partially_paid' },
  { n: 10488, c: 'c08', date: '2026-09-22T17:25:00', items: [['p05', 0, 1]], status: 'delivered', pay: 'stripe', payStatus: 'paid', courier: 'Steadfast' },
  { n: 10487, c: 'c01', date: '2026-09-22T13:10:00', items: [['p01', 2, 1], ['p12', 0, 1]], status: 'shipped', pay: 'bkash', payStatus: 'paid', coupon: 'EID500', courier: 'Pathao' },
  { n: 10486, c: 'c04', date: '2026-09-21T20:02:00', items: [['p09', 2, 1]], status: 'cancelled', pay: 'cod', payStatus: 'cancelled' },
  { n: 10485, c: 'c02', date: '2026-09-21T09:40:00', items: [['p11', 2, 1]], status: 'confirmed', pay: 'bkash', payStatus: 'paid' },
  { n: 10484, c: 'c11', date: '2026-09-20T18:18:00', items: [['p07', 2, 2]], status: 'delivered', pay: 'cod', payStatus: 'paid', courier: 'Steadfast' },
  { n: 10483, c: 'c07', date: '2026-09-19T12:44:00', items: [['p04', 3, 1]], status: 'return_requested', pay: 'sslcommerz', payStatus: 'paid', courier: 'Pathao' },
  { n: 10482, c: 'c01', date: '2026-09-18T15:30:00', items: [['p03', 2, 1], ['p07', 1, 1]], status: 'delivered', pay: 'cod', payStatus: 'paid', courier: 'Pathao' },
  { n: 10481, c: 'c08', date: '2026-09-17T11:05:00', items: [['p02', 0, 1]], status: 'refunded', pay: 'bkash', payStatus: 'refunded', courier: 'Steadfast' },
  { n: 10480, c: 'c12', date: '2026-09-16T19:55:00', items: [['p06', 2, 1]], status: 'partially_refunded', pay: 'nagad', payStatus: 'partially_refunded', courier: 'Pathao' },
  { n: 10479, c: 'c01', date: '2026-08-29T21:10:00', items: [['p14', 1, 1]], status: 'delivered', pay: 'bkash', payStatus: 'paid', courier: 'Pathao' },
  { n: 10478, c: 'c01', date: '2026-07-12T10:00:00', items: [['p05', 0, 1]], status: 'returned', pay: 'sslcommerz', payStatus: 'refunded', courier: 'Steadfast' }
];

const statusFlow: OrderStatus[] = ['confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered'];
const statusLabels: Record<string, string> = {
  confirmed: 'Order confirmed',
  processing: 'Picking started',
  packed: 'Packed and ready for pickup',
  shipped: 'Handed to courier',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered'
};

function addHours(iso: string, h: number) {
  const d = new Date(iso);
  d.setHours(d.getHours() + h);
  return d.toISOString();
}

function build(seed: OrderSeed): Order {
  const customer = customers.find((c) => c.id === seed.c)!;
  const items = seed.items.map(([pid, vi, qty]) => {
    const p = products.find((x) => x.id === pid)!;
    const v = p.variants[Math.min(vi, p.variants.length - 1)];
    return {
      productId: p.id,
      variantId: v.id,
      title: p.title,
      image: p.images[0],
      color: v.color,
      size: v.size,
      sku: v.sku,
      price: v.salePrice ?? v.price,
      qty
    };
  });
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = seed.coupon === 'TANTI10' ? Math.round(subtotal * 0.1) : seed.coupon === 'EID500' ? 500 : 0;
  const isDhaka = customer.district === 'Dhaka';
  const shipping = isDhaka ? (subtotal >= 2500 ? 0 : 70) : 130;
  const codFee = seed.pay === 'cod' ? 20 : 0;
  const total = subtotal - discount + shipping + codFee;
  const address =
    seed.c === 'c01'
      ? currentUserAddresses[0]
      : { id: 'x', label: 'Home', name: customer.name, phone: customer.phone, line1: 'House 12, Road 4', area: 'Sadar', district: customer.district };

  const timeline = [{ at: seed.date, label: 'Order placed', by: seed.c === 'c06' ? 'Rahim (Staff)' : 'Customer' }];
  if (seed.pay !== 'cod' && seed.payStatus !== 'pending' && seed.payStatus !== 'failed') {
    timeline.push({ at: addHours(seed.date, 0), label: `Payment of ৳${total.toLocaleString('en-IN')} received`, by: 'System' });
  }
  if (seed.status === 'failed') timeline.push({ at: addHours(seed.date, 0), label: 'Payment failed — customer notified', by: 'System' });
  if (seed.status === 'cancelled') timeline.push({ at: addHours(seed.date, 3), label: 'Order cancelled by customer', by: 'Customer' });
  const idx = statusFlow.indexOf(
    ['return_requested', 'returned', 'refunded', 'partially_refunded'].includes(seed.status) ? 'delivered' : seed.status
  );
  for (let i = 0; i <= idx; i++) {
    timeline.push({ at: addHours(seed.date, 2 + i * 14), label: statusLabels[statusFlow[i]], by: i === 0 ? 'System' : 'Rahim (Staff)' });
  }
  if (seed.status === 'return_requested') timeline.push({ at: addHours(seed.date, 110), label: 'Return requested', by: 'Customer' });
  if (seed.status === 'refunded' || seed.status === 'returned') timeline.push({ at: addHours(seed.date, 160), label: `Refund of ৳${total.toLocaleString('en-IN')} issued`, by: 'Farzana (Manager)' });
  if (seed.status === 'partially_refunded') timeline.push({ at: addHours(seed.date, 160), label: 'Partial refund of ৳600 issued', by: 'Farzana (Manager)' });

  return {
    id: `o${seed.n}`,
    number: `TN-${seed.n}`,
    customerId: seed.c,
    customerName: customer.name,
    email: customer.email,
    phone: customer.phone,
    createdAt: seed.date,
    items,
    subtotal,
    discount,
    shipping: shipping + codFee,
    tax: 0,
    total,
    refunded: seed.status === 'refunded' || seed.status === 'returned' ? total : seed.status === 'partially_refunded' ? 600 : 0,
    couponCode: seed.coupon,
    paymentMethod: seed.pay,
    paymentStatus: seed.payStatus,
    status: seed.status,
    fulfillmentStatus: idx >= 3 ? 'fulfilled' : 'unfulfilled',
    shippingAddress: address,
    shippingMethod: isDhaka ? 'Standard (Inside Dhaka)' : 'Standard (Outside Dhaka)',
    courier: seed.courier,
    tracking: seed.courier ? `${seed.courier.slice(0, 2).toUpperCase()}${seed.n}78${seed.n % 9}` : undefined,
    timeline: timeline.reverse(),
    attempts:
      seed.pay === 'cod'
        ? []
        : [
            ...(seed.status === 'failed' || seed.n === 10479
              ? [{ id: `pa${seed.n}a`, method: seed.pay, amount: total, status: 'failed' as PaymentStatus, ref: `TRX${seed.n}F1`, at: seed.date }]
              : []),
            ...(seed.status !== 'failed'
              ? [{ id: `pa${seed.n}b`, method: seed.pay, amount: seed.payStatus === 'partially_paid' ? Math.round(total / 2) : total, status: seed.payStatus, ref: `TRX${seed.n}K9${seed.n % 7}`, at: seed.date }]
              : [])
          ],
    notes: seed.n === 10489 ? [{ text: 'Wholesale order — 50% advance received, balance on delivery.', internal: true, by: 'Farzana (Manager)', at: seed.date }] : [],
    channel: seed.c === 'c06' ? 'manual' : 'online',
    codCollected: seed.pay === 'cod' && seed.payStatus === 'paid'
  };
}

export const orders: Order[] = seeds.map(build);

export const returns: ReturnRequest[] = [
  {
    id: 'R-3012',
    orderNumber: 'TN-10483',
    customerName: 'Mehedi Hasan',
    items: [{ title: 'Everyday Leather Sneakers', image: products[3].images[0], qty: 1, price: 4800, size: '42', color: 'White/Tan' }],
    reason: 'Size too small',
    details: 'Toe box feels tight, would like a full refund.',
    photos: 2,
    resolution: 'refund',
    status: 'requested',
    createdAt: '2026-09-24T10:30:00',
    amount: 4800,
    timeline: [{ at: '2026-09-24T10:30:00', label: 'Return requested', by: 'Customer' }]
  },
  {
    id: 'R-3011',
    orderNumber: 'TN-10482',
    customerName: 'Nusrat Jahan',
    items: [{ title: 'Sage Cotton Panjabi', image: products[2].images[0], qty: 1, price: 2690, size: 'M', color: 'Sage' }],
    reason: 'Wrong size',
    details: 'Need L instead of M.',
    photos: 0,
    resolution: 'exchange',
    status: 'approved',
    createdAt: '2026-09-23T18:45:00',
    amount: 2690,
    timeline: [
      { at: '2026-09-24T10:15:00', label: 'Exchange approved — pickup scheduled', by: 'Mitu (Staff)' },
      { at: '2026-09-23T18:45:00', label: 'Return requested', by: 'Customer' }
    ]
  },
  {
    id: 'R-3009',
    orderNumber: 'TN-10480',
    customerName: 'Lamia Karim',
    items: [{ title: 'Rust Linen Shirt', image: products[5].images[0], qty: 1, price: 2890, size: 'L', color: 'Sand' }],
    reason: 'Damaged / defective',
    details: 'Small tear near the pocket seam.',
    photos: 3,
    resolution: 'refund',
    status: 'received',
    createdAt: '2026-09-19T09:00:00',
    amount: 2890,
    timeline: [
      { at: '2026-09-22T15:00:00', label: 'Item received at warehouse', by: 'Rahim (Staff)' },
      { at: '2026-09-20T11:00:00', label: 'Return approved', by: 'Farzana (Manager)' },
      { at: '2026-09-19T09:00:00', label: 'Return requested', by: 'Customer' }
    ]
  },
  {
    id: 'R-3004',
    orderNumber: 'TN-10478',
    customerName: 'Nusrat Jahan',
    items: [{ title: 'Structured Leather Tote', image: products[4].images[0], qty: 1, price: 5490, size: 'One size', color: 'Tan' }],
    reason: 'Changed my mind',
    details: '',
    photos: 0,
    resolution: 'refund',
    status: 'refunded',
    createdAt: '2026-07-15T12:00:00',
    amount: 5490,
    timeline: [
      { at: '2026-07-21T12:00:00', label: 'Refund of ৳5,490 issued to card', by: 'Farzana (Manager)' },
      { at: '2026-07-15T12:00:00', label: 'Return requested', by: 'Customer' }
    ]
  }
];

export const returnReasons = [
  'Size too small',
  'Size too large',
  'Wrong size',
  'Damaged / defective',
  'Not as described',
  'Wrong item received',
  'Changed my mind'
];
