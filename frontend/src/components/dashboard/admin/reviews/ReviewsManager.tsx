'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import {
  BadgeCheck,
  Camera,
  CheckCircle2,
  Filter,
  MessageSquare,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  ThumbsUp,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Rating } from '@/components/ui/Rating';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/utils/format';
import { reviewService } from '@/services/review-service';
import { ReviewDetailDrawer } from './ReviewDetailDrawer';
import type { Review, ReviewStats, OwnerReviewsQuery } from '@/types/review';
import { cn } from '@/utils/cn';

interface ReviewsManagerProps {
  initialReviews?: Review[];
}

export function ReviewsManager({ initialReviews = [] }: ReviewsManagerProps) {
  // State for reviews and aggregate store stats
  const [reviewsList, setReviewsList] = useState<Review[]>(initialReviews);
  const [stats, setStats] = useState<ReviewStats>({
    totalReviews: initialReviews.length,
    averageRating: 4.9,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    withPhotosCount: 0,
    repliedCount: 0,
    pendingReplyCount: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filter and search controls
  const [searchQuery, setSearchQuery] = useState('');
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [replyTab, setReplyTab] = useState<'all' | 'pending' | 'replied'>('all');
  const [withPhotosOnly, setWithPhotosOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Selected review for drawer
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Load reviews from live backend API
  const fetchOwnerReviews = useCallback(async () => {
    setLoading(true);
    try {
      const query: OwnerReviewsQuery = {
        page,
        limit: 20,
        rating: starFilter || undefined,
        withPhotosOnly: withPhotosOnly || undefined,
        search: searchQuery.trim() || undefined,
        hasReply:
          replyTab === 'replied' ? true : replyTab === 'pending' ? false : undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };

      const res = await reviewService.getOwnerReviews(query);
      if (res?.data) {
        setReviewsList(res.data.reviews || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
        if (res.data.pagination) {
          setTotalPages(res.data.pagination.totalPages || 1);
        }
      }
    } catch (err) {
      console.error('Failed to load owner reviews:', err);
      toast.error('Failed to load reviews from server');
    } finally {
      setLoading(false);
    }
  }, [page, starFilter, withPhotosOnly, searchQuery, replyTab]);

  useEffect(() => {
    fetchOwnerReviews();
  }, [fetchOwnerReviews]);

  // Handle live update from drawer reply submission
  const handleReviewUpdated = (updated: Review) => {
    setReviewsList((prev) =>
      prev.map((r) => (r.id === updated.id ? updated : r))
    );
    setSelectedReview(updated);
    // Refresh stats
    fetchOwnerReviews();
  };

  const handleOpenDrawer = (review: Review) => {
    setSelectedReview(review);
    setIsDrawerOpen(true);
  };

  const totalCount = stats.totalReviews || reviewsList.length;
  const avgRating = stats.averageRating || 5.0;
  const repliedCount = stats.repliedCount || 0;
  const pendingCount = stats.pendingReplyCount ?? Math.max(0, totalCount - repliedCount);

  return (
    <div className="w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <PageHeader
            title="Customer Reviews"
            description="View real customer feedback, star ratings, and engage by posting public store replies."
          />
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => fetchOwnerReviews()}
          disabled={loading}
          className="cursor-pointer gap-2 self-start sm:self-auto shrink-0"
        >
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Total Reviews */}
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span className="font-medium">Total Reviews</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <MessageSquare className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-ink">{totalCount}</span>
            <span className="text-xs text-emerald-600 font-medium">100% Live</span>
          </div>
          <p className="mt-1 text-[11px] text-ink-muted">Published directly to storefront</p>
        </div>

        {/* Metric 2: Average Rating */}
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span className="font-medium">Store Average</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-500">
              <Star className="h-4 w-4 fill-amber-500" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-ink">{avgRating.toFixed(1)}</span>
            <span className="text-xs text-ink-muted font-medium">/ 5.0 ★</span>
          </div>
          <div className="mt-1">
            <Rating value={avgRating} size="sm" />
          </div>
        </div>

        {/* Metric 3: Replied Reviews */}
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span className="font-medium">Replied Reviews</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-ink">{repliedCount}</span>
            <span className="text-xs text-emerald-600 font-medium">
              {totalCount > 0 ? Math.round((repliedCount / totalCount) * 100) : 0}% response
            </span>
          </div>
          <p className="mt-1 text-[11px] text-ink-muted">Public responses active</p>
        </div>

        {/* Metric 4: Pending Replies */}
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span className="font-medium">Needs Reply</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-ink">{pendingCount}</span>
            {pendingCount > 0 ? (
              <span className="text-xs text-rose-600 font-semibold bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded">
                Action needed
              </span>
            ) : (
              <span className="text-xs text-emerald-600 font-semibold">All caught up</span>
            )}
          </div>
          <p className="mt-1 text-[11px] text-ink-muted">Customer reviews waiting for reply</p>
        </div>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="rounded-2xl border border-line bg-surface p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Reply Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-subtle/80 border border-line/60 overflow-x-auto">
            <button
              type="button"
              onClick={() => {
                setReplyTab('all');
                setPage(1);
              }}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap',
                replyTab === 'all'
                  ? 'bg-surface text-ink shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              )}
            >
              All Reviews ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => {
                setReplyTab('pending');
                setPage(1);
              }}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap',
                replyTab === 'pending'
                  ? 'bg-surface text-rose-600 shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              )}
            >
              <span>Needs Reply</span>
              {pendingCount > 0 && (
                <span className="rounded-full bg-rose-100 dark:bg-rose-950/80 px-1.5 py-0.2 text-[10px] text-rose-700 dark:text-rose-300 font-bold">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setReplyTab('replied');
                setPage(1);
              }}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap',
                replyTab === 'replied'
                  ? 'bg-surface text-emerald-600 shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              )}
            >
              Replied ({repliedCount})
            </button>
          </div>

          {/* Search and Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative min-w-[220px] flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search reviews, customer, product…"
                className="w-full h-8.5 rounded-xl border border-line bg-canvas pl-9 pr-3 text-xs text-ink placeholder:text-ink-muted focus:border-ink focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Rating Filter Dropdown */}
            <select
              value={starFilter || ''}
              onChange={(e) => {
                setStarFilter(e.target.value ? Number(e.target.value) : null);
                setPage(1);
              }}
              className="h-8.5 rounded-xl border border-line bg-canvas px-3 text-xs font-medium text-ink focus:border-ink focus:outline-none cursor-pointer"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars ★★★★★</option>
              <option value="4">4 Stars ★★★★</option>
              <option value="3">3 Stars ★★★</option>
              <option value="2">2 Stars ★★</option>
              <option value="1">1 Star ★</option>
            </select>

            {/* Photos Filter Toggle */}
            <button
              type="button"
              onClick={() => {
                setWithPhotosOnly((prev) => !prev);
                setPage(1);
              }}
              className={cn(
                'inline-flex items-center gap-1.5 h-8.5 rounded-xl border px-3 text-xs font-medium cursor-pointer transition-all',
                withPhotosOnly
                  ? 'border-ink bg-ink text-canvas shadow-xs'
                  : 'border-line bg-canvas text-ink-soft hover:border-ink hover:text-ink'
              )}
            >
              <Camera className="h-3.5 w-3.5" />
              <span>With Photos</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Table / Card List */}
      <div className="rounded-2xl border border-line bg-surface overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="h-12 w-12 rounded-lg bg-subtle shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-48 rounded bg-subtle" />
                  <div className="h-3 w-96 rounded bg-subtle" />
                </div>
                <div className="h-8 w-20 rounded bg-subtle" />
              </div>
            ))}
          </div>
        ) : reviewsList.length === 0 ? (
          <div className="py-16">
            <EmptyState
              icon={Star}
              title="No customer reviews found"
              description={
                searchQuery || starFilter || withPhotosOnly || replyTab !== 'all'
                  ? 'No reviews match your current filters. Try resetting the search or filter options.'
                  : 'Your customer reviews will appear here once submitted on your storefront.'
              }
            />
          </div>
        ) : (
          <div className="divide-y divide-line">
            {reviewsList.map((review) => {
              const productTitle = review.product?.title || review.productTitle || 'Product';
              const productImg =
                review.product?.images?.[0] ||
                'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200';
              const hasReply = !!review.reply;

              return (
                <div
                  key={review.id}
                  className="p-5 transition-colors hover:bg-subtle/30 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left Block: Product Thumbnail & Customer Info */}
                  <div className="flex items-start gap-4 min-w-0 md:max-w-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={productImg}
                      alt={productTitle}
                      className="h-14 w-12 rounded-lg object-cover border border-line shrink-0"
                    />
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <Rating value={review.rating} size="sm" />
                        <span className="text-xs font-semibold text-ink">
                          {review.rating}.0
                        </span>
                        {review.verified && (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                            <BadgeCheck className="h-3 w-3" /> Verified
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-semibold text-ink truncate">
                        {review.title || 'Customer Review'}
                      </h4>

                      <p className="text-xs text-ink-muted truncate">
                        by <strong className="text-ink-soft">{review.author}</strong> on{' '}
                        <span className="text-ink">{productTitle}</span>
                        {review.size && <span> · {review.size}</span>}
                      </p>
                    </div>
                  </div>

                  {/* Middle Block: Review Body preview & Photos */}
                  <div className="flex-1 min-w-0 space-y-2 md:px-4">
                    <p className="text-xs sm:text-sm text-ink-soft line-clamp-2 leading-relaxed">
                      {review.body}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-ink-muted">
                      <span>{formatDate(review.date || review.createdAt || new Date().toISOString())}</span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3 text-emerald-600" /> {review.helpful} Helpful
                      </span>

                      {review.photos && review.photos.length > 0 && (
                        <>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1 text-ink font-medium">
                            <Camera className="h-3 w-3" /> {review.photos.length} Photo{review.photos.length > 1 ? 's' : ''}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Existing reply snippet */}
                    {hasReply && (
                      <div className="inline-flex items-center gap-1.5 rounded-lg bg-subtle px-2.5 py-1 text-xs text-ink">
                        <MessageSquare className="h-3 w-3 text-ink-muted" />
                        <span className="font-semibold text-ink">Store Reply:</span>
                        <span className="truncate max-w-xs text-ink-soft">{review.reply}</span>
                      </div>
                    )}
                  </div>

                  {/* Right Block: Status Badge & Action Button */}
                  <div className="flex items-center justify-between md:flex-col md:items-end gap-2 shrink-0">
                    <div>
                      {hasReply ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Replied
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:text-rose-400">
                          <Clock className="h-3.5 w-3.5" /> Needs Reply
                        </span>
                      )}
                    </div>

                    <Button
                      size="sm"
                      variant={hasReply ? 'secondary' : 'primary'}
                      onClick={() => handleOpenDrawer(review)}
                      className="cursor-pointer gap-1.5"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>{hasReply ? 'Edit Reply' : 'Reply & Inspect'}</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-line px-5 py-3.5 bg-canvas/40">
            <span className="text-xs text-ink-muted">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="cursor-pointer gap-1"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="cursor-pointer gap-1"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Review Detail & Public Reply Drawer */}
      <ReviewDetailDrawer
        open={isDrawerOpen}
        review={selectedReview}
        onClose={() => setIsDrawerOpen(false)}
        onReviewUpdated={handleReviewUpdated}
      />
    </div>
  );
}
