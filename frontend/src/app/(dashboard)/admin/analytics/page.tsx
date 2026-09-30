'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Download } from 'lucide-react';
import {
  Area,
  ComposedChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  salesSeries,
  kpis,
  funnel,
  salesByPayment,
  salesByRegion,
  salesByChannel,
  topSearches,
} from '@/data/analytics';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { Panel } from '@/components/dashboard/shared/Panel';
import { GuardedButton } from '@/components/dashboard/shared/GuardedButton';
import { ModuleGate } from '@/components/dashboard/shared/ModuleGate';
import { formatBDT, formatCompactBDT, formatNumber } from '@/utils/format';
import { cn } from '@/utils/cn';

const ranges = ['Today', '7 days', '30 days', '90 days'] as const;
const axisTick = { fontSize: 11, fill: '#8A8378' };

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState<(typeof ranges)[number]>('30 days');
  const [compare, setCompare] = useState(true);

  const secondary = [
    ['Orders', formatNumber(kpis.orders), '+18%'],
    ['Avg. order value', formatBDT(kpis.aov), '+4%'],
    ['Conversion rate', `${kpis.conversionRate}%`, '+0.3 pt'],
    ['Returning customers', `${kpis.returningRate}%`, '+2 pt'],
    ['Refunds', formatBDT(kpis.refunds), '−6%'],
    ['Discounts', formatBDT(kpis.discounts), '+11%'],
    ['Shipping revenue', formatBDT(kpis.shippingRevenue), '+9%'],
    ['Cart abandonment', `${kpis.cartAbandonment}%`, '−1.4 pt'],
  ];

  const shares: [string, { name: string; value: number }[]][] = [
    ['Sales by payment method', salesByPayment],
    ['Traffic source', salesByChannel],
  ];

  return (
    <ModuleGate module="analytics">
      <div className="w-full space-y-6">
        <PageHeader
          title="Analytics"
          description="All figures in BDT, VAT inclusive."
          actions={
            <>
              <div
                className="flex rounded-md border border-line bg-surface p-0.5 text-xs"
                role="group"
                aria-label="Date range"
              >
                {ranges.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRange(r)}
                    aria-pressed={range === r}
                    className={cn(
                      'whitespace-nowrap rounded px-2.5 py-1 cursor-pointer transition-colors',
                      range === r
                        ? 'bg-ink text-canvas font-medium'
                        : 'text-ink-muted hover:text-ink'
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <GuardedButton
                module="analytics"
                action="export"
                variant="secondary"
                size="sm"
                onClick={() => toast.success('analytics-30d.xlsx exported')}
              >
                <Download className="h-4 w-4" aria-hidden /> Export
              </GuardedButton>
            </>
          }
        />

        <Panel className="mb-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm text-ink-muted">Net sales · {range}</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums text-ink">
                {formatBDT(kpis.netSales)}
              </p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                +22.4% vs previous period · Gross {formatBDT(kpis.grossSales)}
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
              <input
                type="checkbox"
                checked={compare}
                onChange={(e) => setCompare(e.target.checked)}
                className="rounded border-line-strong text-ink"
              />{' '}
              Compare to previous period
            </label>
          </div>
          <div className="mt-5 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={salesSeries}
                margin={{ left: 0, right: 8, top: 8 }}
              >
                <CartesianGrid stroke="#E9E4DA" vertical={false} opacity={0.5} />
                <XAxis
                  dataKey="date"
                  tick={axisTick}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v: number) => formatCompactBDT(v)}
                  tick={axisTick}
                  axisLine={false}
                  tickLine={false}
                  width={60}
                />
                <Tooltip
                  formatter={(value: any) =>
                    value ? formatBDT(Number(value)) : ''
                  }
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 6,
                    backgroundColor: 'var(--color-surface, #fff)',
                    borderColor: 'var(--color-line, #e5e5e5)',
                    color: 'var(--color-ink, #000)',
                  }}
                />
                <Area
                  dataKey="sales"
                  name="This period"
                  stroke="#1C1A17"
                  strokeWidth={2}
                  fill="#1C1A17"
                  fillOpacity={0.06}
                />
                {compare && (
                  <Line
                    dataKey="prev"
                    name="Previous"
                    stroke="#B5562F"
                    strokeDasharray="4 4"
                    dot={false}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <dl className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-4">
          {secondary.map(([l, v, d]) => (
            <div key={l} className="bg-surface px-4 py-3">
              <dt className="text-xs text-ink-muted">{l}</dt>
              <dd className="mt-1 text-base font-semibold tabular-nums text-ink">
                {v}{' '}
                <span className="text-xs font-normal text-ink-muted">{d}</span>
              </dd>
            </div>
          ))}
        </dl>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Conversion funnel">
            <ol className="space-y-3">
              {funnel.map((f, i) => {
                const pct = (f.value / funnel[0].value) * 100;
                return (
                  <li key={f.stage}>
                    <div className="flex justify-between text-sm">
                      <span className="text-ink font-medium">{f.stage}</span>
                      <span className="tabular-nums text-ink-muted">
                        {formatNumber(f.value)}
                        {i > 0 &&
                          ` · ${((f.value / funnel[i - 1].value) * 100).toFixed(0)}%`}
                      </span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-subtle">
                      <div
                        className="h-full rounded-full bg-ink"
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ol>
          </Panel>

          <Panel title="Sales by district">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={salesByRegion}
                  layout="vertical"
                  margin={{ left: 10 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#5A544B' }}
                    axisLine={false}
                    tickLine={false}
                    width={90}
                  />
                  <Tooltip
                    formatter={(value: any) =>
                      value ? formatBDT(Number(value)) : ''
                    }
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 6,
                      backgroundColor: 'var(--color-surface, #fff)',
                      borderColor: 'var(--color-line, #e5e5e5)',
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#1C1A17"
                    radius={[0, 3, 3, 0]}
                    barSize={14}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          {shares.map(([title, data]) => (
            <Panel key={title} title={title}>
              <ul className="space-y-2.5">
                {data.map((d) => (
                  <li
                    key={d.name}
                    className="grid grid-cols-[130px_1fr_40px] items-center gap-3 text-sm"
                  >
                    <span className="text-ink">{d.name}</span>
                    <div className="h-2 rounded-full bg-subtle">
                      <div
                        className="h-full rounded-full bg-clay"
                        style={{ width: `${d.value}%` }}
                      />
                    </div>
                    <span className="text-right tabular-nums text-ink-muted">
                      {d.value}%
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
          ))}

          <Panel
            title="Top searches"
            description="Zero-result searches are flagged so you can add products or synonyms"
            flush
            className="lg:col-span-2"
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-ink-muted">
                  <th className="px-5 py-2 font-medium">Term</th>
                  <th className="px-5 py-2 text-right font-medium">Searches</th>
                  <th className="px-5 py-2 text-right font-medium">Results</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {topSearches.map((s) => (
                  <tr key={s.term} className="hover:bg-subtle/30">
                    <td className="px-5 py-2 font-medium text-ink">{s.term}</td>
                    <td className="px-5 py-2 text-right tabular-nums text-ink">
                      {formatNumber(s.count)}
                    </td>
                    <td
                      className={cn(
                        'px-5 py-2 text-right tabular-nums',
                        s.results === 0
                          ? 'font-medium text-red-600 dark:text-red-400'
                          : 'text-ink'
                      )}
                    >
                      {s.results === 0 ? 'No results' : s.results}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </div>
      </div>
    </ModuleGate>
  );
}
