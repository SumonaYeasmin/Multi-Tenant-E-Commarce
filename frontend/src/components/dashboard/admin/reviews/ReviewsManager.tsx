'use client';

import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Star } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { Tabs } from '@/components/ui/Tabs';
import { EmptyState } from '@/components/ui/EmptyState';
import { ReviewItem } from './ReviewItem';
import type { Review, ReviewStatus } from '@/types/review';

type ReviewTab = 'pending' | 'published' | 'reported' | 'hidden';

interface ReviewsManagerProps {
  initialReviews: Review[];
}

export function ReviewsManager({ initialReviews }: ReviewsManagerProps) {
  const [reviewsList, setReviewsList] = useState<Review[]>(initialReviews);
  const [tab, setTab] = useState<ReviewTab>('pending');

  const publishedReviews = useMemo(
    () => reviewsList.filter((r) => r.status === 'published'),
    [reviewsList]
  );

  const avgRating = useMemo(() => {
    if (!publishedReviews.length) return 0;
    const sum = publishedReviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / publishedReviews.length;
  }, [publishedReviews]);

  const filteredRows = useMemo(() => {
    return reviewsList.filter((r) => {
      if (tab === 'reported') return r.reported;
      if (tab === 'hidden') return r.status === 'hidden' || r.status === 'rejected';
      return r.status === tab;
    });
  }, [reviewsList, tab]);

  const handleUpdateStatus = (id: string, status: ReviewStatus, msg: string) => {
    setReviewsList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status, reported: false } : r))
    );
    toast.success(msg);
  };

  const handlePostReply = (id: string, reply: string) => {
    setReviewsList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, reply } : r))
    );
    toast.success('Reply posted successfully');
  };

  const tabsConfig = [
    {
      value: 'pending' as const,
      label: 'Awaiting moderation',
      count: reviewsList.filter((r) => r.status === 'pending').length,
    },
    {
      value: 'published' as const,
      label: 'Published',
    },
    {
      value: 'reported' as const,
      label: 'Reported',
      count: reviewsList.filter((r) => r.reported).length,
    },
    {
      value: 'hidden' as const,
      label: 'Hidden & rejected',
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Reviews"
        description={`Average ${avgRating.toFixed(1)} ★ across published reviews. New reviews are held for moderation; spam is filtered automatically.`}
      />

      <div className="rounded-lg border border-line bg-surface overflow-hidden shadow-xs">
        <div className="px-4 pt-2">
          <Tabs value={tab} onChange={setTab} tabs={tabsConfig} />
        </div>

        {filteredRows.length === 0 ? (
          <EmptyState
            icon={Star}
            title="Nothing to review"
            description="You’re all caught up."
          />
        ) : (
          <ul className="divide-y divide-line">
            {filteredRows.map((review) => (
              <ReviewItem
                key={review.id}
                review={review}
                onUpdateStatus={handleUpdateStatus}
                onPostReply={handlePostReply}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
