export type CategoryKey = 'women' | 'men' | 'kids' | 'accessories' | 'footwear' | (string & {});

export interface CategoryItemData {
  key: string;
  name: string;
  image: string;
  blurb: string;
  subcategories: string[];
  parentKey?: string;
  seoTitle?: string;
  seoDescription?: string;
  status?: 'published' | 'draft' | 'hidden';
}

export type ProductStatus = 'published' | 'draft' | 'archived';

export interface ColorOption {
  name: string;
  hex: string;
}

export interface Variant {
  id: string;
  sku: string;
  color: string;
  size: string;
  price: number;
  salePrice?: number;
  stock: number;
  reserved: number;
  enabled: boolean;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  brand: string;
  category: CategoryKey;
  subcategory: string;
  collections: string[];
  tags: string[];
  images: string[];
  price: number;
  salePrice?: number;
  cost: number;
  rating: number;
  reviewCount: number;
  sold: number;
  createdAt: string;
  status: ProductStatus;
  shortDescription: string;
  description: string;
  colors: ColorOption[];
  sizes: string[];
  variants: Variant[];
  specs: { label: string; value: string }[];
  isNew?: boolean;
  isBestseller?: boolean;
  preorder?: boolean;
  weightGrams: number;
  barcode: string;
}

export interface CartItem {
  key: string;
  productId: string;
  variantId: string;
  qty: number;
  savedForLater?: boolean;
}

export type OrderStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'return_requested'
  | 'returned'
  | 'refunded'
  | 'partially_refunded'
  | 'failed';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'cancelled'
  | 'partially_paid'
  | 'refunded'
  | 'partially_refunded';

export type PaymentMethod = 'bkash' | 'nagad' | 'sslcommerz' | 'stripe' | 'cod';

export type FulfillmentStatus = 'unfulfilled' | 'partial' | 'fulfilled';

export interface Address {
  id: string;
  label: string;
  name: string;
  phone: string;
  line1: string;
  area: string;
  district: string;
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
}

export interface OrderItem {
  productId: string;
  variantId: string;
  title: string;
  image: string;
  color: string;
  size: string;
  sku: string;
  price: number;
  qty: number;
}

export interface TimelineEvent {
  at: string;
  label: string;
  by?: string;
  note?: string;
}

export interface PaymentAttempt {
  id: string;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  ref: string;
  at: string;
}

export interface OrderNote {
  text: string;
  internal: boolean;
  by: string;
  at: string;
}

export interface Order {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  email: string;
  phone: string;
  createdAt: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  refunded: number;
  couponCode?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  fulfillmentStatus: FulfillmentStatus;
  shippingAddress: Address;
  shippingMethod: string;
  courier?: string;
  tracking?: string;
  timeline: TimelineEvent[];
  attempts: PaymentAttempt[];
  notes: OrderNote[];
  channel: 'online' | 'manual';
  codCollected?: boolean;
  customerNote?: string;
}

export type ReturnStatus =
  | 'requested'
  | 'approved'
  | 'rejected'
  | 'in_transit'
  | 'received'
  | 'refunded'
  | 'exchanged';

export type ReturnResolution = 'refund' | 'store_credit' | 'exchange';

export interface ReturnRequest {
  id: string;
  orderNumber: string;
  customerName: string;
  items: { title: string; image: string; qty: number; price: number; size: string; color: string }[];
  reason: string;
  details: string;
  photos: number;
  resolution: ReturnResolution;
  status: ReturnStatus;
  createdAt: string;
  amount: number;
  timeline: TimelineEvent[];
  inspectionNote?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  district: string;
  orders: number;
  spent: number;
  lastOrder: string;
  joined: string;
  tags: string[];
  segment: 'VIP' | 'Loyal' | 'New' | 'At risk' | 'Wholesale';
  status: 'active' | 'inactive';
  marketingConsent: boolean;
  storeCredit: number;
  avatar?: string;
}

export type ReviewStatus = 'published' | 'pending' | 'hidden' | 'rejected';

export interface Review {
  id: string;
  productId: string;
  productTitle: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
  photos: string[];
  helpful: number;
  status: ReviewStatus;
  size?: string;
  reply?: string;
  reported?: boolean;
}

export type AdminRole = 'owner' | 'manager' | 'fulfillment';
export type PlanState = 'active' | 'grace' | 'suspended';

export type AdminModule =
  | 'dashboard'
  | 'orders'
  | 'products'
  | 'inventory'
  | 'customers'
  | 'reviews'
  | 'discounts'
  | 'marketing'
  | 'shipping'
  | 'payments'
  | 'returns'
  | 'analytics'
  | 'reports'
  | 'content'
  | 'theme'
  | 'staff'
  | 'media'
  | 'notifications'
  | 'integrations'
  | 'domains'
  | 'settings'
  | 'audit'
  | 'billing';

export type PermissionAction =
  | 'view'
  | 'create'
  | 'update'
  | 'delete'
  | 'publish'
  | 'export'
  | 'refund'
  | 'settings';

export interface SupportTicket {
  id: string;
  subject: string;
  orderNumber?: string;
  status: 'open' | 'awaiting' | 'resolved';
  updatedAt: string;
  messages: { from: 'customer' | 'agent'; name: string; text: string; at: string }[];
}
