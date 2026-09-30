import React from 'react';
import { images } from '@/data/images';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Our Story | Tanti',
  description: 'Clothing that carries the hands that made it. Fair rates and craft empowerment across Bangladesh.',
};

const milestones = [
  {
    year: '2019',
    text: 'Started with 40 block-printed kurtas made with three families in Tangail.',
  },
  {
    year: '2021',
    text: 'Opened our flagship on Road 27, Dhanmondi, and launched Tanti Loom with Rupganj jamdani weavers.',
  },
  {
    year: '2023',
    text: 'Welcomed Pora — handmade leather from Bhairab — into the Tanti family.',
  },
  {
    year: '2026',
    text: '1,200+ artisans, delivery to all 64 districts and a new warehouse in Chattogram.',
  },
];

export default function AboutPage() {
  return (
    <div>
      <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        <p className="text-sm text-ink-muted">Our story</p>
        <h1 className="mt-2 max-w-3xl font-display text-5xl leading-[1.05] sm:text-6xl">
          Clothing that carries the hands that made it
        </h1>
      </section>
      <div className="mt-12 overflow-hidden">
        <img
          src={images.hero}
          alt="Two people in Tanti festive wear in a courtyard"
          className="h-[420px] w-full object-cover"
        />
      </div>
      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="space-y-5 text-lg leading-relaxed text-ink-soft">
          <p>
            <span className="font-display text-2xl text-ink">Tanti</span> means weaver. We
            started because the most beautiful textiles in the world were being made a few hours
            from Dhaka — and too few people could buy them without a middleman taking most of the
            value.
          </p>
          <p>
            Today we work directly with weavers, block-printers, cobblers and silversmiths across
            Bangladesh, paying fair, transparent rates and investing in the next generation of
            makers.
          </p>
        </div>
        <ol className="space-y-8 border-l border-line pl-8">
          {milestones.map((m) => (
            <li key={m.year} className="relative">
              <span
                className="absolute -left-[37px] top-1.5 h-2 w-2 rounded-full bg-clay"
                aria-hidden
              />
              <p className="font-display text-2xl">{m.year}</p>
              <p className="mt-1 text-sm text-ink-soft">{m.text}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 rounded-lg bg-surface p-8 sm:grid-cols-3 sm:p-12 border border-line">
          {[
            ['1,200+', 'artisans we work with directly'],
            ['64', 'districts we deliver to'],
            ['38%', 'of every sale goes to makers'],
          ].map(([n, l]) => (
            <div key={l}>
              <p className="font-display text-5xl">{n}</p>
              <p className="mt-2 text-sm text-ink-muted">{l}</p>
            </div>
          ))}
        </div>
        <div className="mt-16 pb-16 text-center">
          <Button size="lg" href="/journal">
            Read stories from our makers
          </Button>
        </div>
      </section>
    </div>
  );
}
