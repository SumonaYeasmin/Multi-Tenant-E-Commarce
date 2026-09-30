import { useMemo } from 'react';
import { useStore } from '../contexts/StoreContext';
import { available, variantPrice } from '../utils/pricing';
import type { CartItem, Product, Variant } from '../types/commerce';

export interface CartLine {
  item: CartItem;
  product: Product;
  variant: Variant;
  unitPrice: number;
  lineTotal: number;
  maxQty: number;
  issue?: 'out_of_stock' | 'limited';
}

export function useCartLines() {
  const { cart, products } = useStore();
  return useMemo(() => {
    const lines: CartLine[] = [];
    cart.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      const variant = product?.variants.find((v) => v.id === item.variantId);
      if (!product || !variant) return;
      const maxQty = product.preorder ? 10 : available(variant);
      const unitPrice = variantPrice(variant);
      lines.push({
        item,
        product,
        variant,
        unitPrice,
        lineTotal: unitPrice * item.qty,
        maxQty,
        issue:
          !product.preorder && maxQty === 0
            ? 'out_of_stock'
            : !product.preorder && item.qty > maxQty
            ? 'limited'
            : undefined,
      });
    });
    const active = lines.filter((l) => !l.item.savedForLater);
    const saved = lines.filter((l) => l.item.savedForLater);
    const subtotal = active
      .filter((l) => l.issue !== 'out_of_stock')
      .reduce((s, l) => s + l.lineTotal, 0);
    const count = active.reduce((s, l) => s + l.item.qty, 0);
    const hasIssues = active.some((l) => l.issue);
    return { active, saved, subtotal, count, hasIssues };
  }, [cart, products]);
}
