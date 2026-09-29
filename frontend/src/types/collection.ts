export type CollectionType = 'manual' | 'rule';

export interface CollectionItem {
  slug: string;
  name: string;
  description: string;
  image: string;
  type: CollectionType;
  rule?: string;
}
