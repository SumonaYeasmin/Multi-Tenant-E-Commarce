import type { PaymentMethod } from '../types/commerce';

export const districts = [
  'Dhaka', 'Gazipur', 'Narayanganj', 'Chattogram', "Cox's Bazar", 'Cumilla', 'Sylhet', 'Moulvibazar',
  'Rajshahi', 'Bogura', 'Khulna', 'Jashore', 'Barishal', 'Rangpur', 'Dinajpur', 'Mymensingh', 'Tangail', 'Faridpur'
];

export const areasByDistrict: Record<string, string[]> = {
  Dhaka: ['Dhanmondi', 'Gulshan', 'Banani', 'Mirpur', 'Uttara', 'Mohammadpur', 'Bashundhara', 'Motijheel', 'Old Dhaka'],
  Chattogram: ['Agrabad', 'Nasirabad', 'Khulshi', 'Panchlaish', 'Halishahar'],
  Sylhet: ['Zindabazar', 'Ambarkhana', 'Shahjalal Upashahar'],
  Gazipur: ['Tongi', 'Joydebpur', 'Kaliakair'],
  Narayanganj: ['Fatullah', 'Siddhirganj', 'Rupganj']
};

export function areasFor(district: string) {
  return areasByDistrict[district] ?? ['Sadar', 'Municipality', 'Other'];
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  eta: string;
  price: (district: string, subtotal: number) => number;
  available: (district: string) => boolean;
}

export const FREE_SHIPPING_THRESHOLD = 2500;

export const shippingMethods: ShippingMethod[] = [
  {
    id: 'standard',
    name: 'Standard delivery',
    description: 'Via Pathao / Steadfast',
    eta: '',
    price: (d, sub) => (d === 'Dhaka' ? (sub >= FREE_SHIPPING_THRESHOLD ? 0 : 70) : 130),
    available: () => true
  },
  {
    id: 'express',
    name: 'Express (same / next day)',
    description: 'Inside Dhaka city only',
    eta: '',
    price: () => 150,
    available: (d) => d === 'Dhaka'
  },
  {
    id: 'pickup',
    name: 'Store pickup — Dhanmondi 27',
    description: 'Ready in 2 hours',
    eta: '',
    price: () => 0,
    available: () => true
  }
];

export function deliveryEstimate(district: string, method = 'standard') {
  if (method === 'pickup') return 'Ready today';
  if (method === 'express') return 'Today or tomorrow';
  return district === 'Dhaka' ? '1–2 days' : '3–5 days';
}

export const paymentMethods: { id: PaymentMethod; name: string; description: string; color: string; short: string }[] = [
  { id: 'bkash', name: 'bKash', description: 'Pay with your bKash account', color: '#E2136E', short: 'bK' },
  { id: 'nagad', name: 'Nagad', description: 'Pay with your Nagad account', color: '#EC1C24', short: 'Ng' },
  { id: 'sslcommerz', name: 'Card, Mobile & Net banking', description: 'Secured by SSLCommerz — Visa, Mastercard, Amex, Rocket, Upay', color: '#1E4E9E', short: 'SSL' },
  { id: 'stripe', name: 'International card', description: 'Secured by Stripe — for cards issued outside Bangladesh', color: '#635BFF', short: 'St' },
  { id: 'cod', name: 'Cash on delivery', description: 'Pay when your order arrives (৳20 COD fee)', color: '#1C1A17', short: '৳' }
];

export const COD_FEE = 20;

export interface Coupon {
  code: string;
  label: string;
  type: 'percent' | 'fixed' | 'free_shipping';
  value: number;
  minSubtotal?: number;
}

export const coupons: Coupon[] = [
  { code: 'TANTI10', label: '10% off your order', type: 'percent', value: 10 },
  { code: 'EID500', label: '৳500 off orders over ৳3,000', type: 'fixed', value: 500, minSubtotal: 3000 },
  { code: 'FREESHIP', label: 'Free delivery', type: 'free_shipping', value: 0 }
];

export const shippingZones = [
  { id: 'z1', name: 'Inside Dhaka', districts: ['Dhaka'], rates: [{ name: 'Standard', rule: 'Flat ৳70 · Free over ৳2,500', price: 70 }, { name: 'Express', rule: 'Flat', price: 150 }] },
  { id: 'z2', name: 'Dhaka suburbs', districts: ['Gazipur', 'Narayanganj'], rates: [{ name: 'Standard', rule: 'Flat', price: 100 }] },
  { id: 'z3', name: 'Outside Dhaka', districts: ['All other districts (61)'], rates: [{ name: 'Standard', rule: 'Up to 1 kg ৳130 · +৳20 per extra kg', price: 130 }] },
  { id: 'z4', name: 'Store pickup', districts: ['Dhanmondi 27 flagship'], rates: [{ name: 'Pickup', rule: 'Free', price: 0 }] }
];

export const couriers = [
  { id: 'pathao', name: 'Pathao Courier', status: 'connected', coverage: '64 districts', avgDays: 2.1, successRate: 96.2 },
  { id: 'steadfast', name: 'Steadfast', status: 'connected', coverage: '64 districts', avgDays: 2.8, successRate: 94.5 },
  { id: 'redx', name: 'RedX', status: 'available', coverage: '64 districts', avgDays: 2.6, successRate: 93.8 }
];
