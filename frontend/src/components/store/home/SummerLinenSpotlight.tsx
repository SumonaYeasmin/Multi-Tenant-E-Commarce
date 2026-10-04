'use client';

import React from 'react';
import Link from 'next/link';
import { collections } from '@/data/products';
import { images } from '@/data/images';
import { Button } from '@/components/ui/button';

export function SummerLinenSpotlight() {
  const otherCollections = collections
    .filter((c) => c.slug !== 'summer-linen')
    .slice(0, 3);

  return (
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
            {otherCollections.map((c) => (
              <Link
                key={c.slug}
                href={`/collections/${c.slug}`}
                className="group block"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.image}
                  alt={c.name}
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
  );
}
