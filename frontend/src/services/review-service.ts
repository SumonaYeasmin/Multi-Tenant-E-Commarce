import { apiClient } from './api-client';
import { reviews as seedReviews } from '@/data/reviews';
import type { Review, ReviewStatus } from '@/types/commerce';

export const reviewService = {
  async getReviews(): Promise<Review[]> {
    try {
      return await apiClient.get<Review[]>('/reviews');
    } catch {
      return seedReviews;
    }
  },

  async updateReviewStatus(id: string, status: ReviewStatus): Promise<boolean> {
    try {
      await apiClient.patch(`/reviews/${id}/status`, { status });
      return true;
    } catch {
      return true;
    }
  },

  async replyToReview(id: string, reply: string): Promise<boolean> {
    try {
      await apiClient.post(`/reviews/${id}/reply`, { reply });
      return true;
    } catch {
      return true;
    }
  },
};
