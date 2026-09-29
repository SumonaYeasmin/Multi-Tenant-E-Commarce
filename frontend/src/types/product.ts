export type CategoryKey = 'women' | 'men' | 'kids' | 'accessories' | 'footwear';

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
