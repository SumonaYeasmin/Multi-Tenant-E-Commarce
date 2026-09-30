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
