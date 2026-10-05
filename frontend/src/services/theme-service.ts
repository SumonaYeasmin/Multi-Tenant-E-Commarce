import { apiClient } from './api-client';
import type { ApiResponse } from '@/types';
import type { TenantTheme, ThemePreset, ThemeSection } from '@/types/theme';

export interface ThemeCollectionResponse {
  themes?: TenantTheme[];
  liveTheme: TenantTheme;
}

export interface ReorderSectionsPayload {
  sections: Array<{
    id: string;
    orderIndex: number;
    isVisible?: boolean;
  }>;
}

export interface UpdateThemePayload {
  name?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  canvasColor?: string;
  surfaceColor?: string;
  inkColor?: string;
  fontHeading?: string;
  fontBody?: string;
  borderRadius?: string;
  cardStyle?: string;
  customCss?: string;
}

export interface PublishThemePayload {
  label?: string;
}

export const themeService = {
  // Get all theme collection (active theme, drafts, presets)
  async getThemeData(): Promise<ApiResponse<ThemeCollectionResponse>> {
    return await apiClient.get<ApiResponse<ThemeCollectionResponse>>('/owner/theme');
  },

  // Get active live theme for storefront or preview
  async getLiveTheme(): Promise<ApiResponse<TenantTheme>> {
    return await apiClient.get<ApiResponse<TenantTheme>>('/owner/theme/live');
  },

  // Get single theme
  async getThemeById(id: string): Promise<ApiResponse<TenantTheme>> {
    return await apiClient.get<ApiResponse<TenantTheme>>(`/owner/theme/${id}`);
  },

  // Update theme tokens & settings (Save Draft)
  async updateTheme(
    id: string,
    payload: UpdateThemePayload
  ): Promise<ApiResponse<TenantTheme>> {
    return await apiClient.patch<ApiResponse<TenantTheme>>(
      `/owner/theme/${id}`,
      payload
    );
  },

  // Publish theme live to storefront
  async publishTheme(
    id: string,
    payload?: PublishThemePayload
  ): Promise<ApiResponse<TenantTheme>> {
    return await apiClient.post<ApiResponse<TenantTheme>>(
      `/owner/theme/${id}/publish`,
      payload || {}
    );
  },

  // Batch reorder sections
  async reorderSections(
    themeId: string,
    payload: ReorderSectionsPayload
  ): Promise<ApiResponse<ThemeSection[]>> {
    return await apiClient.put<ApiResponse<ThemeSection[]>>(
      `/owner/theme/${themeId}/sections/reorder`,
      payload
    );
  },

  // Restore past version snapshot
  async restoreVersion(
    themeId: string,
    versionId: string
  ): Promise<ApiResponse<TenantTheme>> {
    return await apiClient.post<ApiResponse<TenantTheme>>(
      `/owner/theme/${themeId}/restore/${versionId}`,
      {}
    );
  },
};
