import { images } from './images';
import type { CategoryKey, ColorOption, Product, Variant } from '../types/product';

interface Seed {
  id: string;
  title: string;
  brand: string;
  category: CategoryKey;
  subcategory: string;
  collections: string[];
  tags: string[];
  image: string;
  price: number;
  salePrice?: number;
  cost: number;
  rating: number;
  reviewCount: number;
  sold: number;
  createdAt: string;
  status?: Product['status'];
  shortDescription: string;
  description: string;
  colors: ColorOption[];
  sizes: string[];
  specs: {label: string;value: string;}[];
  isNew?: boolean;
  isBestseller?: boolean;
  preorder?: boolean;
  weightGrams: number;
  stockPattern: number[];
}

const apparelSizes = ['XS', 'S', 'M', 'L', 'XL'];
const menSizes = ['S', 'M', 'L', 'XL', 'XXL'];

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function buildVariants(seed: Seed): Variant[] {
  const out: Variant[] = [];
  let i = 0;
  seed.colors.forEach((c, ci) => {
    seed.sizes.forEach((s) => {
      const stock = seed.stockPattern[i % seed.stockPattern.length];
      out.push({
        id: `${seed.id}-${ci}-${slugify(s)}`,
        sku: `TN-${seed.id.toUpperCase()}-${c.name.slice(0, 3).toUpperCase()}-${s}`,
        color: c.name,
        size: s,
        price: seed.price,
        salePrice: seed.salePrice,
        stock,
        reserved: stock > 4 ? i % 3 : 0,
        enabled: true
      });
      i++;
    });
  });
  return out;
}

const seeds: Seed[] = [
{
  id: 'p01',
  title: 'Indigo Block-Print Kurta Set',
  brand: 'Tanti Studio',
  category: 'women',
  subcategory: 'Kurtas',
  collections: ['eid-2026', 'everyday-cotton'],
  tags: ['cotton', 'block print', 'handmade'],
  image: images.kurta,
  price: 2450,
  salePrice: 1990,
  cost: 980,
  rating: 4.7,
  reviewCount: 128,
  sold: 842,
  createdAt: '2026-08-02',
  shortDescription: 'Hand block-printed cotton kurta with straight trousers, dyed in natural indigo.',
  description:
  'Printed by artisans in Tangail using hand-carved wooden blocks, this two-piece set is cut from breathable 60-count cotton. A straight silhouette, side slits and a relaxed placket make it an easy everyday piece that still feels considered.',
  colors: [
  { name: 'Indigo', hex: '#2E3A5C' },
  { name: 'Madder', hex: '#8E3B2C' }],

  sizes: apparelSizes,
  specs: [
  { label: 'Fabric', value: '100% cotton, 60 count' },
  { label: 'Fit', value: 'Straight, true to size' },
  { label: 'Care', value: 'Hand wash cold, dry in shade' },
  { label: 'Origin', value: 'Tangail, Bangladesh' }],

  isBestseller: true,
  weightGrams: 420,
  stockPattern: [12, 18, 3, 0, 7]
},
{
  id: 'p02',
  title: 'Heritage Jamdani Saree',
  brand: 'Tanti Loom',
  category: 'women',
  subcategory: 'Sarees',
  collections: ['eid-2026', 'heritage-weaves'],
  tags: ['jamdani', 'handwoven', 'festive'],
  image: images.saree,
  price: 8500,
  cost: 4200,
  rating: 4.9,
  reviewCount: 64,
  sold: 211,
  createdAt: '2026-07-18',
  shortDescription: 'Handwoven Dhakai jamdani in cream with a muted red border.',
  description:
  'Each saree takes a master weaver close to three weeks on a pit loom in Rupganj. Supplementary-weft motifs are woven directly into the fabric, never printed — a UNESCO-recognised craft worn for generations.',
  colors: [
  { name: 'Cream', hex: '#EFE6D2' },
  { name: 'Charcoal', hex: '#3A3835' }],

  sizes: ['Free size'],
  specs: [
  { label: 'Fabric', value: 'Cotton jamdani, 84 count' },
  { label: 'Length', value: '5.5 m + 0.8 m blouse piece' },
  { label: 'Care', value: 'Dry clean only' },
  { label: 'Origin', value: 'Rupganj, Narayanganj' }],

  isBestseller: true,
  weightGrams: 650,
  stockPattern: [4, 2]
},
{
  id: 'p03',
  title: 'Sage Cotton Panjabi',
  brand: 'Tanti Studio',
  category: 'men',
  subcategory: 'Panjabis',
  collections: ['eid-2026', 'everyday-cotton'],
  tags: ['cotton', 'festive'],
  image: images.panjabi,
  price: 3200,
  salePrice: 2690,
  cost: 1250,
  rating: 4.6,
  reviewCount: 97,
  sold: 634,
  createdAt: '2026-08-10',
  shortDescription: 'Soft-washed cotton panjabi with a mandarin collar and concealed placket.',
  description:
  'A clean, modern panjabi in soft-washed cotton that holds its shape through long Eid days. Finished with self-covered buttons and a subtle tonal thread detail at the collar.',
  colors: [
  { name: 'Sage', hex: '#8FA48A' },
  { name: 'Ivory', hex: '#F1ECDF' },
  { name: 'Navy', hex: '#26324A' }],

  sizes: menSizes,
  specs: [
  { label: 'Fabric', value: 'Soft-washed cotton' },
  { label: 'Fit', value: 'Regular, knee length' },
  { label: 'Care', value: 'Machine wash cold' },
  { label: 'Origin', value: 'Dhaka, Bangladesh' }],

  isNew: true,
  isBestseller: true,
  weightGrams: 380,
  stockPattern: [20, 14, 9, 5, 2, 0]
},
{
  id: 'p04',
  title: 'Everyday Leather Sneakers',
  brand: 'Pora',
  category: 'footwear',
  subcategory: 'Sneakers',
  collections: ['city-essentials'],
  tags: ['leather', 'unisex'],
  image: images.sneakers,
  price: 4800,
  cost: 2100,
  rating: 4.5,
  reviewCount: 212,
  sold: 1120,
  createdAt: '2026-06-01',
  shortDescription: 'Full-grain leather sneakers with a suede heel tab and cushioned insole.',
  description:
  'Built on a durable cupsole with a removable cushioned footbed. Full-grain upper softens with wear; tan suede heel tab adds warmth to an otherwise clean silhouette.',
  colors: [{ name: 'White/Tan', hex: '#F4F1EA' }],
  sizes: ['39', '40', '41', '42', '43', '44'],
  specs: [
  { label: 'Upper', value: 'Full-grain leather' },
  { label: 'Sole', value: 'Rubber cupsole' },
  { label: 'Fit', value: 'True to size' }],

  isBestseller: true,
  weightGrams: 900,
  stockPattern: [6, 11, 15, 8, 3, 1]
},
{
  id: 'p05',
  title: 'Structured Leather Tote',
  brand: 'Pora',
  category: 'accessories',
  subcategory: 'Bags',
  collections: ['city-essentials'],
  tags: ['leather', 'bags'],
  image: images.bag,
  price: 6200,
  salePrice: 5490,
  cost: 2600,
  rating: 4.8,
  reviewCount: 58,
  sold: 302,
  createdAt: '2026-05-21',
  shortDescription: 'Vegetable-tanned leather tote with brass hardware and a laptop sleeve.',
  description:
  'Cut from vegetable-tanned leather from Hazaribagh tanneries meeting LWG standards. Fits a 14" laptop; interior slip pocket and magnetic tab closure.',
  colors: [
  { name: 'Tan', hex: '#B07A4A' },
  { name: 'Espresso', hex: '#4A3326' }],

  sizes: ['One size'],
  specs: [
  { label: 'Material', value: 'Vegetable-tanned leather' },
  { label: 'Dimensions', value: '36 × 30 × 13 cm' },
  { label: 'Hardware', value: 'Solid brass' }],

  weightGrams: 1100,
  stockPattern: [9, 0]
},
{
  id: 'p06',
  title: 'Rust Linen Shirt',
  brand: 'Tanti Studio',
  category: 'men',
  subcategory: 'Shirts',
  collections: ['summer-linen'],
  tags: ['linen', 'casual'],
  image: images.shirt,
  price: 2890,
  cost: 1100,
  rating: 4.4,
  reviewCount: 41,
  sold: 276,
  createdAt: '2026-09-05',
  shortDescription: 'Relaxed-fit linen shirt with a camp collar and horn buttons.',
  description:
  'Pre-washed European flax linen for a lived-in handfeel from day one. Relaxed through the body with a slightly dropped shoulder.',
  colors: [
  { name: 'Rust', hex: '#A5532F' },
  { name: 'Sand', hex: '#D9C8A9' }],

  sizes: menSizes,
  specs: [
  { label: 'Fabric', value: '100% linen' },
  { label: 'Fit', value: 'Relaxed' },
  { label: 'Care', value: 'Machine wash cold, line dry' }],

  isNew: true,
  weightGrams: 300,
  stockPattern: [8, 12, 10, 4, 0]
},
{
  id: 'p07',
  title: 'Mustard Kids Panjabi Set',
  brand: 'Tanti Kids',
  category: 'kids',
  subcategory: 'Festive',
  collections: ['eid-2026'],
  tags: ['kids', 'festive', 'cotton'],
  image: images.kids,
  price: 1650,
  salePrice: 1390,
  cost: 620,
  rating: 4.8,
  reviewCount: 73,
  sold: 488,
  createdAt: '2026-08-14',
  shortDescription: 'Soft cotton panjabi and pajama set, easy on little ones all day.',
  description: 'Tagless, soft cotton with a gentle elastic waist pajama. Designed for comfort through long family visits.',
  colors: [{ name: 'Mustard', hex: '#D1A23A' }],
  sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-11Y'],
  specs: [
  { label: 'Fabric', value: '100% cotton' },
  { label: 'Care', value: 'Machine wash gentle' }],

  isNew: true,
  weightGrams: 250,
  stockPattern: [10, 7, 2, 6, 11]
},
{
  id: 'p08',
  title: 'Oxidised Silver Jhumka Set',
  brand: 'Roopa',
  category: 'accessories',
  subcategory: 'Jewellery',
  collections: ['eid-2026', 'heritage-weaves'],
  tags: ['jewellery', 'silver'],
  image: images.jewelry,
  price: 1850,
  cost: 700,
  rating: 4.6,
  reviewCount: 39,
  sold: 190,
  createdAt: '2026-07-30',
  shortDescription: 'Handcrafted oxidised silver jhumkas with a matching brass bangle.',
  description: 'Made by silversmiths in Old Dhaka. Lightweight enough for all-day wear, finished with an anti-tarnish coating.',
  colors: [{ name: 'Silver', hex: '#A7A39C' }],
  sizes: ['One size'],
  specs: [
  { label: 'Material', value: 'Oxidised 925 silver, brass' },
  { label: 'Weight', value: '18 g per pair' }],

  weightGrams: 120,
  stockPattern: [3]
},
{
  id: 'p09',
  title: 'Handmade Leather Sandals',
  brand: 'Pora',
  category: 'footwear',
  subcategory: 'Sandals',
  collections: ['summer-linen'],
  tags: ['leather', 'handmade'],
  image: images.sandals,
  price: 2200,
  salePrice: 1790,
  cost: 820,
  rating: 4.3,
  reviewCount: 88,
  sold: 540,
  createdAt: '2026-04-10',
  shortDescription: 'Hand-stitched leather sandals with a braided toe loop.',
  description: 'Hand-stitched by cobblers in Bhairab with a padded leather footbed that moulds to your foot.',
  colors: [{ name: 'Brown', hex: '#6B4226' }],
  sizes: ['38', '39', '40', '41', '42', '43'],
  specs: [
  { label: 'Upper', value: 'Leather' },
  { label: 'Sole', value: 'Leather with rubber grip' }],

  weightGrams: 600,
  stockPattern: [0, 4, 9, 12, 5, 2]
},
{
  id: 'p10',
  title: 'Olive Linen Co-ord Set',
  brand: 'Tanti Studio',
  category: 'women',
  subcategory: 'Co-ords',
  collections: ['summer-linen', 'city-essentials'],
  tags: ['linen', 'co-ord'],
  image: images.coord,
  price: 4600,
  cost: 1900,
  rating: 4.7,
  reviewCount: 52,
  sold: 318,
  createdAt: '2026-09-12',
  shortDescription: 'Boxy short-sleeve shirt and wide-leg trousers in washed linen.',
  description: 'A relaxed two-piece that works together or apart. Wide-leg trousers have an elasticated back waist and deep pockets.',
  colors: [
  { name: 'Olive', hex: '#6B6B3E' },
  { name: 'Oat', hex: '#DCCFB8' }],

  sizes: apparelSizes,
  specs: [
  { label: 'Fabric', value: '100% linen' },
  { label: 'Fit', value: 'Relaxed, wide-leg' }],

  isNew: true,
  weightGrams: 520,
  stockPattern: [5, 9, 14, 6, 2]
},
{
  id: 'p11',
  title: 'Charcoal Textured Koti',
  brand: 'Tanti Studio',
  category: 'men',
  subcategory: 'Koti',
  collections: ['eid-2026'],
  tags: ['festive', 'layering'],
  image: images.koti,
  price: 3900,
  cost: 1600,
  rating: 4.5,
  reviewCount: 27,
  sold: 144,
  createdAt: '2026-08-22',
  shortDescription: 'Nehru-collar waistcoat in a textured cotton-silk blend.',
  description: 'Layer it over a panjabi for Eid prayers or a wedding. Fully lined, with welt pockets and horn buttons.',
  colors: [{ name: 'Charcoal', hex: '#3B3B3D' }],
  sizes: menSizes,
  specs: [
  { label: 'Fabric', value: 'Cotton-silk blend' },
  { label: 'Lining', value: 'Viscose' }],

  preorder: true,
  weightGrams: 450,
  stockPattern: [0, 0, 0, 0, 0]
},
{
  id: 'p12',
  title: 'Hand-dyed Silk Dupatta',
  brand: 'Tanti Loom',
  category: 'accessories',
  subcategory: 'Dupattas',
  collections: ['heritage-weaves'],
  tags: ['silk', 'hand-dyed'],
  image: images.dupatta,
  price: 2750,
  cost: 1050,
  rating: 4.8,
  reviewCount: 33,
  sold: 160,
  createdAt: '2026-06-28',
  shortDescription: 'Rajshahi silk dupatta, hand-dyed in dusty rose with gold tassels.',
  description: 'Woven from Rajshahi mulberry silk and dyed in small batches — each piece carries slight, beautiful variation.',
  colors: [{ name: 'Dusty Rose', hex: '#C58D8A' }],
  sizes: ['One size'],
  specs: [
  { label: 'Fabric', value: 'Rajshahi silk' },
  { label: 'Dimensions', value: '2.3 m × 1 m' }],

  weightGrams: 180,
  stockPattern: [14]
},
{
  id: 'p13',
  title: 'Classic Penny Loafers',
  brand: 'Pora',
  category: 'footwear',
  subcategory: 'Loafers',
  collections: ['city-essentials'],
  tags: ['leather', 'formal'],
  image: images.loafers,
  price: 5400,
  cost: 2400,
  rating: 4.4,
  reviewCount: 46,
  sold: 205,
  createdAt: '2026-03-15',
  shortDescription: 'Burnished leather penny loafers on a stacked leather heel.',
  description: 'Blake-stitched for flexibility, with a leather-lined interior and a subtle burnished finish on the toe.',
  colors: [{ name: 'Dark Brown', hex: '#3E2A1E' }],
  sizes: ['40', '41', '42', '43', '44'],
  specs: [
  { label: 'Upper', value: 'Calf leather' },
  { label: 'Construction', value: 'Blake stitched' }],

  weightGrams: 950,
  stockPattern: [2, 5, 7, 3, 1]
},
{
  id: 'p14',
  title: 'Chikan Cotton Tunic',
  brand: 'Tanti Studio',
  category: 'women',
  subcategory: 'Tunics',
  collections: ['summer-linen', 'everyday-cotton'],
  tags: ['cotton', 'embroidered'],
  image: images.tunic,
  price: 2650,
  salePrice: 2250,
  cost: 990,
  rating: 4.6,
  reviewCount: 71,
  sold: 402,
  createdAt: '2026-07-04',
  shortDescription: 'White cotton tunic with delicate hand embroidery at the yoke.',
  description: 'Fine cotton voile with tonal hand embroidery. Pairs with the matching light-blue trousers or your favourite denim.',
  colors: [
  { name: 'White', hex: '#F7F5EF' },
  { name: 'Powder Blue', hex: '#AFC3D6' }],

  sizes: apparelSizes,
  specs: [
  { label: 'Fabric', value: 'Cotton voile' },
  { label: 'Care', value: 'Hand wash cold' }],

  weightGrams: 260,
  stockPattern: [7, 13, 11, 4, 0]
},
{
  id: 'p15',
  title: 'Madder Silk Blend Kurta',
  brand: 'Tanti Studio',
  category: 'women',
  subcategory: 'Kurtas',
  collections: ['eid-2026'],
  tags: ['festive', 'embroidered'],
  image: images.hero,
  price: 5600,
  cost: 2300,
  rating: 4.2,
  reviewCount: 12,
  sold: 38,
  createdAt: '2026-09-20',
  status: 'draft',
  shortDescription: 'Embroidered festive kurta with dupatta in a silk blend.',
  description: 'A festive three-piece with tonal zari embroidery. Launching with the Eid 2026 drop.',
  colors: [{ name: 'Terracotta', hex: '#B06A4F' }],
  sizes: apparelSizes,
  specs: [{ label: 'Fabric', value: 'Silk blend' }],
  weightGrams: 480,
  stockPattern: [10, 10, 10, 10, 10]
}];


export const products: Product[] = seeds.map((s) => ({
  id: s.id,
  slug: slugify(s.title),
  title: s.title,
  brand: s.brand,
  category: s.category,
  subcategory: s.subcategory,
  collections: s.collections,
  tags: s.tags,
  images: [s.image, s.image, s.image],
  price: s.price,
  salePrice: s.salePrice,
  cost: s.cost,
  rating: s.rating,
  reviewCount: s.reviewCount,
  sold: s.sold,
  createdAt: s.createdAt,
  status: s.status ?? 'published',
  shortDescription: s.shortDescription,
  description: s.description,
  colors: s.colors,
  sizes: s.sizes,
  variants: buildVariants(s),
  specs: s.specs,
  isNew: s.isNew,
  isBestseller: s.isBestseller,
  preorder: s.preorder,
  weightGrams: s.weightGrams,
  barcode: `8941${s.id.replace('p', '')}0072${s.price % 97}`
}));

export const categories: {key: CategoryKey;name: string;image: string;blurb: string;subcategories: string[];}[] = [
{ key: 'women', name: 'Women', image: images.kurta, blurb: 'Kurtas, sarees & co-ords', subcategories: ['Kurtas', 'Sarees', 'Co-ords', 'Tunics'] },
{ key: 'men', name: 'Men', image: images.panjabi, blurb: 'Panjabis, shirts & koti', subcategories: ['Panjabis', 'Shirts', 'Koti'] },
{ key: 'kids', name: 'Kids', image: images.kids, blurb: 'Festive & everyday', subcategories: ['Festive'] },
{ key: 'footwear', name: 'Footwear', image: images.sneakers, blurb: 'Sneakers, sandals & loafers', subcategories: ['Sneakers', 'Sandals', 'Loafers'] },
{ key: 'accessories', name: 'Accessories', image: images.bag, blurb: 'Bags, jewellery & dupattas', subcategories: ['Bags', 'Jewellery', 'Dupattas'] }];


export const collections: {slug: string;name: string;description: string;image: string;type: 'manual' | 'rule';rule?: string;}[] = [
{ slug: 'eid-2026', name: 'Eid Collection 2026', description: 'Festive pieces in clay, sage and ivory — made for long days with family.', image: images.hero, type: 'manual' },
{ slug: 'heritage-weaves', name: 'Heritage Weaves', description: 'Jamdani, Rajshahi silk and handcrafted silver from master artisans.', image: images.saree, type: 'rule', rule: 'Tag contains "handwoven" OR "silk"' },
{ slug: 'summer-linen', name: 'Summer Linen', description: 'Breathable linen and cotton voile for the monsoon heat.', image: images.coord, type: 'rule', rule: 'Tag contains "linen"' },
{ slug: 'everyday-cotton', name: 'Everyday Cotton', description: 'Soft, easy cotton pieces you will reach for every day.', image: images.tunic, type: 'manual' },
{ slug: 'city-essentials', name: 'City Essentials', description: 'Footwear and bags built for Dhaka streets.', image: images.bag, type: 'manual' }];


export const brands = [
{ slug: 'tanti-studio', name: 'Tanti Studio', description: 'Our in-house label for modern everyday Bangladeshi wear.' },
{ slug: 'tanti-loom', name: 'Tanti Loom', description: 'Handwoven textiles made with master weavers across Bangladesh.' },
{ slug: 'tanti-kids', name: 'Tanti Kids', description: 'Soft, comfortable clothing for little ones.' },
{ slug: 'pora', name: 'Pora', description: 'Leather goods and footwear, hand-finished in Bhairab.' },
{ slug: 'roopa', name: 'Roopa', description: 'Silver jewellery by Old Dhaka silversmiths.' }];


export const sizeGuide = {
  headers: ['Size', 'Chest (in)', 'Waist (in)', 'Length (in)'],
  rows: [
  ['XS', '32', '26', '40'],
  ['S', '34', '28', '41'],
  ['M', '36', '30', '42'],
  ['L', '38', '32', '43'],
  ['XL', '40', '34', '44'],
  ['XXL', '42', '36', '45']]

};