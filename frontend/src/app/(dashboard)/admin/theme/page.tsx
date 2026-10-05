'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Layers, Palette, History } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { GuardedButton } from '@/components/dashboard/shared/GuardedButton';
import { ModuleGate } from '@/components/dashboard/shared/ModuleGate';
import { Badge } from '@/components/ui/Badge';
import { Drawer } from '@/components/ui/Drawer';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { themeService } from '@/services/theme-service';
import {
  ThemeSectionsManager,
  BrandCustomizer,
  ThemeVersionHistory,
  ThemePreviewCanvas,
} from '@/components/dashboard/theme';
import { cn } from '@/utils/cn';
import type { TenantTheme, ThemeSection, ThemeVersion } from '@/types/theme';

// Standard Default Fallback in case of network latency
const FALLBACK_SECTIONS: ThemeSection[] = [
  { id: 'sec-hero', sectionType: 'HERO_BANNER', label: 'Hero banner', orderIndex: 0, isVisible: true },
  { id: 'sec-categories', sectionType: 'CATEGORY_GRID', label: 'Shop by category', orderIndex: 1, isVisible: true },
  { id: 'sec-bestsellers', sectionType: 'BESTSELLERS', label: 'Best sellers', orderIndex: 2, isVisible: true },
  { id: 'sec-spotlight', sectionType: 'SUMMER_SPOTLIGHT', label: 'Spotlight banner', orderIndex: 3, isVisible: true },
  { id: 'sec-new-arrivals', sectionType: 'NEW_ARRIVALS', label: 'New arrivals', orderIndex: 4, isVisible: true },
  { id: 'sec-trust-points', sectionType: 'TRUST_POINTS', label: 'Brand trust points', orderIndex: 5, isVisible: true },
  { id: 'sec-testimonials', sectionType: 'TESTIMONIALS', label: 'Customer reviews', orderIndex: 6, isVisible: true },
  { id: 'sec-recommended', sectionType: 'RECOMMENDED', label: 'Recommended products', orderIndex: 7, isVisible: true },
];

const FALLBACK_THEME: TenantTheme = {
  id: 'theme-live-default',
  tenantId: 'tanti-demo',
  name: 'Store Theme',
  status: 'PUBLISHED',
  isLive: true,
  primaryColor: '#B5562F',
  secondaryColor: '#2E3A67',
  accentColor: '#5C6B4E',
  canvasColor: '#F7F4EF',
  surfaceColor: '#FFFFFF',
  inkColor: '#1C1A17',
  fontHeading: 'Fraunces',
  fontBody: 'Inter',
  borderRadius: '0.5rem',
  cardStyle: 'portrait-hover',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  sections: FALLBACK_SECTIONS,
  versions: [],
};

export default function AdminThemePage() {
  const [theme, setTheme] = useState<TenantTheme>(FALLBACK_THEME);
  const [activeTab, setActiveTab] = useState<'sections' | 'styling'>('sections');
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [dirty, setDirty] = useState<boolean>(false);

  // 1. Fetch live and draft theme data from backend
  const loadThemeData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await themeService.getThemeData();
      if (res.success && res.data) {
        const activeTheme = res.data.liveTheme || (res.data.themes && res.data.themes[0]);
        if (activeTheme) {
          setTheme(activeTheme);
        }
      }
    } catch {
      // Fallback is already initialized in state
    } finally {
      setIsLoading(false);
      setDirty(false);
    }
  }, []);

  useEffect(() => {
    loadThemeData();
  }, [loadThemeData]);

  // Update theme tokens locally and flag dirty
  const handleThemeChange = (fields: Partial<TenantTheme>) => {
    setTheme((prev) => ({ ...prev, ...fields }));
    setDirty(true);
  };

  // Reorder sections & sync with backend
  const handleReorderSections = async (newSections: ThemeSection[]) => {
    const updated = newSections.map((s, idx) => ({ ...s, orderIndex: idx }));
    setTheme((prev) => ({ ...prev, sections: updated }));
    setDirty(true);

    try {
      await themeService.reorderSections(theme.id, {
        sections: updated.map((s) => ({
          id: s.id,
          orderIndex: s.orderIndex,
          isVisible: s.isVisible,
        })),
      });
    } catch {
      // Revert or keep local state
    }
  };

  // Toggle section visibility & sync with backend
  const handleToggleVisibility = async (secId: string) => {
    const updated = theme.sections.map((s) =>
      s.id === secId ? { ...s, isVisible: !s.isVisible } : s
    );
    setTheme((prev) => ({ ...prev, sections: updated }));
    setDirty(true);

    try {
      await themeService.reorderSections(theme.id, {
        sections: updated.map((s) => ({
          id: s.id,
          orderIndex: s.orderIndex,
          isVisible: s.isVisible,
        })),
      });
    } catch {
      // Silent error handling for smooth UX
    }
  };

  // Save Draft (PATCH /owner/theme/:id)
  const handleSaveDraft = async () => {
    try {
      setIsSaving(true);
      const res = await themeService.updateTheme(theme.id, {
        name: theme.name,
        primaryColor: theme.primaryColor,
        secondaryColor: theme.secondaryColor,
        accentColor: theme.accentColor,
        canvasColor: theme.canvasColor,
        surfaceColor: theme.surfaceColor,
        inkColor: theme.inkColor,
        fontHeading: theme.fontHeading,
        fontBody: theme.fontBody,
        borderRadius: theme.borderRadius,
        cardStyle: theme.cardStyle,
        customCss: theme.customCss,
      });

      if (res.success && res.data) {
        setTheme(res.data);
      }
      setDirty(false);
      toast.success('Draft saved successfully');
    } catch {
      toast.error('Failed to save draft. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Publish Live (POST /owner/theme/:id/publish)
  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      const res = await themeService.publishTheme(theme.id);
      if (res.success && res.data) {
        setTheme(res.data);
      }
      setDirty(false);
      toast.success('Theme published live to storefront!');
    } catch {
      toast.error('Failed to publish theme. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  // Restore snapshot version (POST /owner/theme/:id/restore/:versionId)
  const handleRestore = async (ver: ThemeVersion) => {
    try {
      setIsSaving(true);
      const res = await themeService.restoreVersion(theme.id, ver.id);
      if (res.success && res.data) {
        setTheme(res.data);
      }
      setDirty(false);
      setHistoryOpen(false);
      toast.success(`Rolled back to ${ver.version}`);
    } catch {
      toast.error('Failed to restore version snapshot.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <ModuleGate module="theme">
        <div className="flex min-h-[60vh] w-full flex-col items-center justify-center">
          <LoadingSpinner size="lg" label="Loading theme settings..." />
        </div>
      </ModuleGate>
    );
  }

  return (
    <ModuleGate module="theme">
      <div className="w-full space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Theme"
          description="Manage landing page section priority, visibility, and brand styling. Changes are saved as draft until published."
          meta={
            <div className="flex items-center gap-2">
              <Badge tone={dirty ? 'warning' : 'success'} dot>
                {dirty ? 'Unpublished changes' : 'Live'}
              </Badge>
            </div>
          }
          actions={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setHistoryOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:bg-subtle transition-colors cursor-pointer"
                title="View version history and rollbacks"
              >
                <History className="h-3.5 w-3.5 text-ink-muted" />
                <span>History</span>
              </button>

              <GuardedButton
                module="theme"
                action="update"
                variant="secondary"
                size="sm"
                disabled={!dirty || isSaving}
                onClick={handleSaveDraft}
              >
                {isSaving ? 'Saving...' : 'Save draft'}
              </GuardedButton>

              <GuardedButton
                module="theme"
                action="publish"
                size="sm"
                disabled={isPublishing}
                onClick={handlePublish}
              >
                {isPublishing ? 'Publishing...' : 'Publish'}
              </GuardedButton>
            </div>
          }
        />

        {/* 2-Column Responsive Layout */}
        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          {/* Left Column: Tabbed Clean Controls */}
          <div className="space-y-4">
            {/* Primary Segmented Tabs: Sections vs Brand Styling */}
            <div className="flex rounded-lg border border-line bg-surface p-1 shadow-xs">
              <button
                type="button"
                onClick={() => setActiveTab('sections')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 rounded-md py-2 text-xs font-semibold transition-all cursor-pointer',
                  activeTab === 'sections'
                    ? 'bg-subtle text-ink shadow-xs border border-line font-bold'
                    : 'text-ink-muted hover:text-ink'
                )}
              >
                <Layers className="h-4 w-4" />
                <span>Sections</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('styling')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 rounded-md py-2 text-xs font-semibold transition-all cursor-pointer',
                  activeTab === 'styling'
                    ? 'bg-subtle text-ink shadow-xs border border-line font-bold'
                    : 'text-ink-muted hover:text-ink'
                )}
              >
                <Palette className="h-4 w-4" />
                <span>Brand Styling</span>
              </button>
            </div>

            {/* TAB 1: Landing Page Sections */}
            {activeTab === 'sections' && (
              <ThemeSectionsManager
                sections={theme.sections}
                onReorder={handleReorderSections}
                onToggleVisibility={handleToggleVisibility}
              />
            )}

            {/* TAB 2: Brand Colors & Typography */}
            {activeTab === 'styling' && (
              <BrandCustomizer
                theme={theme}
                onChange={handleThemeChange}
              />
            )}
          </div>

          {/* Right Column: Live Storefront Preview */}
          <ThemePreviewCanvas theme={theme} />
        </div>

        {/* Version History Side Drawer */}
        <Drawer
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
          title="Version History"
          subtitle="Past release snapshots with 1-click restore"
          width="max-w-md"
        >
          <div className="p-4">
            <ThemeVersionHistory
              versions={theme.versions || []}
              isLive={theme.isLive}
              onRestore={handleRestore}
              disabled={isSaving || isPublishing}
            />
          </div>
        </Drawer>
      </div>
    </ModuleGate>
  );
}
