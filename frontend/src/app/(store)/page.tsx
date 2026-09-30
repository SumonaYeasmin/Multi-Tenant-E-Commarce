'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { collections } from '@/data/products';
import { images } from '@/data/images';
import { testimonials, trustPoints } from '@/data/content';
import { ProductCard } from '@/components/store/ProductCard';
import { SectionHeading } from '@/components/store/SectionHeading';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const { products, recentlyViewed, categories } = useStore();
  const live = products.filter((p) => p.status === 'published');
  const bestsellers = [...live].sort((a, b) => b.sold - a.sold).slice(0, 4);
  const newArrivals = [...live].filter((p) => p.isNew).slice(0, 4);
  const recommended = recentlyViewed.length
    ? live
        .filter(
          (p) =>
            !recentlyViewed.includes(p.id) &&
            recentlyViewed.some(
              (id) => live.find((x) => x.id === id)?.category === p.category
            )
        )
        .slice(0, 4)
    : [];

  return (
    <div className="pb-16">
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="relative overflow-hidden rounded-lg lg:col-span-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images.hero}
              alt="Eid 2026 Collection"
              className="h-[440px] w-full object-cover sm:h-[560px]"
            />
            <div className="absolute inset-0 bg-ink/25" aria-hidden />
            <div className="absolute inset-x-0 bottom-0 p-6 text-canvas sm:p-10">
              <p className="text-sm font-medium text-canvas/85">
                Eid Collection 2026
              </p>
              <h1 className="mt-2 max-w-lg font-display text-4xl leading-[1.05] sm:text-6xl text-canvas">
                Made for long days with family
              </h1>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="bg-canvas text-ink hover:bg-canvas/90 cursor-pointer"
                  href="/collections/eid-2026"
                >
                  Shop the collection
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  className="text-canvas hover:bg-canvas/15 hover:text-canvas cursor-pointer"
                  href="/journal/eid-styling-guide"
                >
                  Read the styling guide
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <Link
              href="/collections/heritage-weaves"
              className="group relative overflow-hidden rounded-lg block"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images.saree}
                alt=""
                className="h-64 w-full object-cover object-top transition-transform duration-300 ease-out group-hover:scale-[1.03] lg:h-[272px]"
              />
              <div className="absolute inset-0 bg-ink/20" aria-hidden />
              <div className="absolute bottom-0 p-5 text-canvas">
                <p className="font-display text-2xl font-medium">Heritage Weaves</p>
                <p className="mt-1 text-sm text-canvas/85">Jamdani & Rajshahi silk</p>
              </div>
            </Link>

            <Link
              href="/shop?sale=1"
              className="group flex flex-col justify-between rounded-lg bg-clay p-6 text-white lg:h-[272px] transition-transform duration-150 hover:bg-clay-dark"
            >
              <p className="text-sm text-white/80">Pre-Eid offer · ends 5 Oct</p>
              <div>
                <p className="font-display text-4xl leading-tight">৳500 off</p>
                <p className="mt-1 text-sm text-white/85">
                  orders over ৳3,000 with code{' '}
                  <span className="rounded bg-white/15 px-1.5 py-0.5 font-semibold">
                    EID500
                  </span>
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium">
                  Shop sale{' '}
                  <ArrowRightIcon className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section
        className="mx-auto mt-20 max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-labelledby="cat-h"
      >
        <SectionHeading id="cat-h" title="Shop by category" />
        <div className="scrollbar-none -mx-4 mt-6 flex snap-x gap-4 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-5 sm:px-0">
          {categories.map((c) => (
            <Link
              key={c.key}
              href={`/category/${c.key}`}
              className="group w-40 shrink-0 snap-start sm:w-auto block"
            >
              <div className="overflow-hidden rounded-md bg-subtle border border-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.image}
                  alt={c.name}
                  className="aspect-[4/5] w-full object-cover object-top transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                />
              </div>
              <p className="mt-3 text-sm font-medium text-ink group-hover:text-clay transition-colors">
                {c.name}
              </p>
              <p className="text-xs text-ink-muted line-clamp-1">{c.blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Bestsellers */}
      <section
        className="mx-auto mt-20 max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-labelledby="best-h"
      >
        <SectionHeading
          id="best-h"
          title="Bestsellers"
          link={{ to: '/shop?sort=popular', label: 'View all' }}
        />
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
          {bestsellers.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Summer Linen Spotlight */}
      <section
        className="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-labelledby="col-h"
      >
        <div className="grid items-center gap-10 lg:grid-cols-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images.coord}
            alt="Summer Linen collection"
            className="aspect-[4/5] w-full rounded-lg object-cover border border-line"
          />
          <div className="lg:pl-8">
            <p className="text-sm text-ink-muted">Collection</p>
            <h2
              id="col-h"
              className="mt-2 font-display text-4xl leading-tight sm:text-5xl text-ink"
            >
              Summer Linen
            </h2>
            <p className="mt-4 max-w-md text-ink-soft">
              Pre-washed linen and cotton voile, cut loose for the monsoon heat.
              Pieces that breathe, crease beautifully and only get softer.
            </p>
            <Button
              className="mt-8 cursor-pointer"
              size="lg"
              href="/collections/summer-linen"
            >
              Explore Summer Linen
            </Button>
            <div className="mt-12 grid grid-cols-3 gap-3">
              {collections
                .filter((c) => c.slug !== 'summer-linen')
                .slice(0, 3)
                .map((c) => (
                  <Link
                    key={c.slug}
                    href={`/collections/${c.slug}`}
                    className="group block"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.image}
                      alt=""
                      className="aspect-square w-full rounded object-cover object-top border border-line"
                    />
                    <p className="mt-2 text-sm font-medium text-ink group-hover:underline">
                      {c.name}
                    </p>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section
        className="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-labelledby="new-h"
      >
        <SectionHeading
          id="new-h"
          title="New arrivals"
          link={{ to: '/shop?sort=newest', label: 'Shop new' }}
        />
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
          {newArrivals.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Trust Points */}
      <section
        className="mt-24 border-y border-line bg-surface"
        aria-label="Why Tanti"
      >
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {trustPoints.map((t) => (
            <div key={t.title}>
              <p className="font-display text-lg text-ink font-medium">{t.title}</p>
              <p className="mt-1.5 text-sm text-ink-muted">{t.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Customer Testimonials */}
      <section
        className="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-labelledby="t-h"
      >
        <h2 id="t-h" className="sr-only">
          What customers say
        </h2>
        <div className="grid gap-12 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="border-l-2 border-clay pl-5">
              <blockquote className="font-display text-xl leading-snug text-ink">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-4 text-sm">
                <span className="font-medium text-ink">{t.name}</span>{' '}
                <span className="text-ink-muted">· {t.location}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Recommended For You */}
      {recommended.length > 0 && (
        <section
          className="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8"
          aria-labelledby="rec-h"
        >
          <SectionHeading
            id="rec-h"
            title="Picked for you"
            subtitle="Based on what you’ve been browsing"
          />
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
            {recommended.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
