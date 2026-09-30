'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Plus, ArrowRight } from 'lucide-react';
import { cmsPages, menus, redirects } from '@/data/admin';
import { blogPosts, faqs, announcement } from '@/data/content';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { Panel } from '@/components/dashboard/shared/Panel';
import { GuardedButton } from '@/components/dashboard/shared/GuardedButton';
import { ModuleGate } from '@/components/dashboard/shared/ModuleGate';
import { Tabs } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { Drawer } from '@/components/ui/Drawer';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/button';
import { formatDate, formatDateTime } from '@/utils/format';

type Tab = 'pages' | 'blog' | 'navigation' | 'faq' | 'redirects';
const tone = {
  published: 'success',
  draft: 'neutral',
  scheduled: 'info',
} as const;

export default function AdminContentPage() {
  const [tab, setTab] = useState<Tab>('pages');
  const [editing, setEditing] = useState<string | null>(null);
  const [bar, setBar] = useState(true);
  const [publishMode, setPublishMode] = useState('Publish now');
  const page = cmsPages.find((p) => p.id === editing);

  return (
    <ModuleGate module="content">
      <div className="w-full space-y-6">
        <PageHeader
          title="Content"
          description="Pages, journal, navigation, FAQs and URL redirects."
          actions={
            <GuardedButton
              module="content"
              action="create"
              size="sm"
              onClick={() => setEditing('new')}
            >
              <Plus className="h-4 w-4" aria-hidden /> New page
            </GuardedButton>
          }
        />
        <Panel className="mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="min-w-[240px] flex-1">
              <p className="text-sm font-medium text-ink">Announcement bar</p>
              <p className="text-sm text-ink-muted">{announcement}</p>
            </div>
            <Switch
              checked={bar}
              onChange={(v) => {
                setBar(v);
                toast.success(
                  v ? 'Announcement bar shown' : 'Announcement bar hidden'
                );
              }}
              label="Show announcement bar"
              hideLabel
            />
          </div>
        </Panel>
        <div className="mb-6">
          <Tabs
            value={tab}
            onChange={(val) => setTab(val as Tab)}
            tabs={[
              { value: 'pages', label: 'Pages' },
              { value: 'blog', label: 'Journal' },
              { value: 'navigation', label: 'Navigation' },
              { value: 'faq', label: 'FAQ' },
              { value: 'redirects', label: 'Redirects' },
            ]}
          />
        </div>

        {tab === 'pages' && (
          <Panel flush>
            <ul className="divide-y divide-line">
              {cmsPages.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => setEditing(p.id)}
                    className="flex w-full flex-wrap items-center gap-3 px-5 py-3 text-left text-sm hover:bg-canvas transition-colors cursor-pointer"
                  >
                    <span className="min-w-[160px] flex-1">
                      <span className="block font-medium text-ink">{p.title}</span>
                      <span className="text-xs text-ink-muted">{p.slug}</span>
                    </span>
                    <span className="text-xs text-ink-muted">
                      Updated {formatDate(p.updated)} · {p.author}
                    </span>
                    <Badge tone={tone[p.status as keyof typeof tone]}>
                      {p.status === 'scheduled' && 'publishAt' in p
                        ? `Scheduled ${formatDateTime(p.publishAt as string)}`
                        : p.status}
                    </Badge>
                  </button>
                </li>
              ))}
            </ul>
          </Panel>
        )}

        {tab === 'blog' && (
          <Panel
            flush
            actions={
              <GuardedButton
                module="content"
                action="create"
                size="sm"
                variant="secondary"
                onClick={() => setEditing('new')}
              >
                New post
              </GuardedButton>
            }
            title="Journal posts"
          >
            <ul className="divide-y divide-line">
              {blogPosts.map((b) => (
                <li
                  key={b.slug}
                  className="flex items-center gap-4 px-5 py-3 text-sm hover:bg-subtle/30"
                >
                  <img
                    src={b.image}
                    alt=""
                    className="h-12 w-16 rounded object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-ink">{b.title}</p>
                    <p className="text-xs text-ink-muted">
                      {b.category} · {b.author} · {formatDate(b.date)}
                    </p>
                  </div>
                  <Badge tone="success">Published</Badge>
                </li>
              ))}
            </ul>
          </Panel>
        )}

        {tab === 'navigation' && (
          <div className="grid gap-5 md:grid-cols-3">
            {menus.map((m) => (
              <Panel key={m.id} title={m.name} description={m.location}>
                <ol className="space-y-1.5 text-sm">
                  {m.items.map((i) => (
                    <li
                      key={i}
                      className="rounded border border-line bg-surface px-3 py-1.5 text-ink"
                    >
                      {i}
                    </li>
                  ))}
                </ol>
                <GuardedButton
                  module="content"
                  action="update"
                  size="sm"
                  variant="ghost"
                  className="mt-3"
                  onClick={() => toast('Menu editor opened')}
                >
                  Edit menu
                </GuardedButton>
              </Panel>
            ))}
          </div>
        )}

        {tab === 'faq' && (
          <Panel flush>
            <ul className="divide-y divide-line">
              {faqs.map((f) => (
                <li key={f.q} className="px-5 py-3 text-sm hover:bg-subtle/30">
                  <p className="font-medium text-ink">
                    {f.q}{' '}
                    <span className="ml-2 text-xs font-normal text-ink-muted">
                      {f.category}
                    </span>
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-ink-muted">{f.a}</p>
                </li>
              ))}
            </ul>
          </Panel>
        )}

        {tab === 'redirects' && (
          <Panel
            flush
            title="URL redirects"
            description="Keep old links and search rankings working."
            actions={
              <GuardedButton
                module="content"
                action="create"
                size="sm"
                variant="secondary"
                onClick={() => toast.success('Redirect added')}
              >
                Add redirect
              </GuardedButton>
            }
          >
            <ul className="divide-y divide-line">
              {redirects.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-wrap items-center gap-3 px-5 py-3 font-mono text-xs hover:bg-subtle/30"
                >
                  <span className="text-ink">{r.from}</span>
                  <ArrowRight
                    className="h-3.5 w-3.5 text-ink-muted"
                    aria-hidden
                  />
                  <span className="flex-1 text-ink">{r.to}</span>
                  <Badge>{r.type}</Badge>
                  <span className="font-sans text-ink-muted">{r.hits} hits</span>
                </li>
              ))}
            </ul>
          </Panel>
        )}

        <Drawer
          open={!!editing}
          onClose={() => setEditing(null)}
          width="max-w-2xl"
          title={page ? `Edit “${page.title}”` : 'New page'}
          footer={
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setEditing(null);
                  toast.success('Preview link copied');
                }}
              >
                Preview
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setEditing(null);
                  toast.success('Draft saved');
                }}
              >
                Save draft
              </Button>
              <GuardedButton
                module="content"
                action="publish"
                onClick={() => {
                  setEditing(null);
                  toast.success(
                    publishMode === 'Publish now'
                      ? 'Page published'
                      : 'Page scheduled'
                  );
                }}
              >
                {publishMode === 'Publish now' ? 'Publish' : 'Schedule'}
              </GuardedButton>
            </div>
          }
        >
          <div className="space-y-4 px-5 py-5">
            <Input
              label="Title"
              defaultValue={page?.title}
              key={`t${editing}`}
            />
            <Textarea
              label="Content"
              rows={10}
              defaultValue={
                page
                  ? `${page.title} — write your content here. Use reusable blocks for banners, FAQs and product grids.`
                  : ''
              }
              key={`c${editing}`}
            />
            <Input
              label="URL"
              defaultValue={page?.slug ?? '/pages/'}
              key={`u${editing}`}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Visibility"
                value={publishMode}
                onChange={(e) => setPublishMode(e.target.value)}
                options={['Publish now', 'Schedule']}
              />
              {publishMode === 'Schedule' && (
                <Input
                  label="Publish at"
                  type="datetime-local"
                  defaultValue="2026-10-01T09:00"
                />
              )}
            </div>
            <Input
              label="SEO title"
              defaultValue={page ? `${page.title} | Tanti` : ''}
              key={`s${editing}`}
            />
          </div>
        </Drawer>
      </div>
    </ModuleGate>
  );
}
