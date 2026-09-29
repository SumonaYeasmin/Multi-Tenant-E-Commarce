import type { Product, Variant } from '@/types/product';

export function variantPrice(v: Variant) {
  return v.salePrice ?? v.price;
}

export function productPrice(p: Product) {
  return p.salePrice ?? p.price;
}

export function available(v: Variant) {
  return Math.max(0, v.stock - v.reserved);
}

export function productStock(p: Product) {
  return p.variants.filter((v) => v.enabled).reduce((s, v) => s + available(v), 0);
}

export const LOW_STOCK_THRESHOLD = 5;
