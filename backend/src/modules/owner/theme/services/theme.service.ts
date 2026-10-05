import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { ResponseHelper } from '../../../../common/helpers/response.helper';
import {
  ConflictException,
  NotFoundException,
} from '../../../../common/exceptions/business.exception';
import { CreateThemeDto } from '../dto/create-theme.dto';
import { UpdateThemeDto } from '../dto/update-theme.dto';
import { ReorderSectionsDto } from '../dto/reorder-sections.dto';
import { CreateSectionDto } from '../dto/create-section.dto';
import { UpdateSectionDto } from '../dto/update-section.dto';
import { PublishThemeDto } from '../dto/publish-theme.dto';
import { ThemeStatus } from '../../../../../prisma/generated/client';
import {
  DEFAULT_THEME_TOKENS,
  DEFAULT_LANDING_SECTIONS,
} from '../constants/theme.constants';

@Injectable()
export class ThemeService {
  private readonly logger = new Logger(ThemeService.name);

  constructor(private readonly prisma: PrismaService) {}

  // 1. Ensure tenant has an active live theme with standard landing page sections
  async ensureTenantLiveTheme(tenantId: string) {
    let liveTheme = await this.prisma.tenantTheme.findFirst({
      where: { tenantId, isLive: true },
      include: {
        sections: { orderBy: { orderIndex: 'asc' } },
        versions: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });

    if (!liveTheme) {
      liveTheme = await this.prisma.tenantTheme.create({
        data: {
          tenantId,
          name: 'Store Theme',
          status: ThemeStatus.PUBLISHED,
          isLive: true,
          primaryColor: DEFAULT_THEME_TOKENS.primaryColor,
          secondaryColor: DEFAULT_THEME_TOKENS.secondaryColor,
          accentColor: DEFAULT_THEME_TOKENS.accentColor,
          canvasColor: DEFAULT_THEME_TOKENS.canvasColor,
          surfaceColor: DEFAULT_THEME_TOKENS.surfaceColor,
          inkColor: DEFAULT_THEME_TOKENS.inkColor,
          fontHeading: DEFAULT_THEME_TOKENS.fontHeading,
          fontBody: DEFAULT_THEME_TOKENS.fontBody,
          borderRadius: DEFAULT_THEME_TOKENS.borderRadius,
          cardStyle: DEFAULT_THEME_TOKENS.cardStyle,
          publishedAt: new Date(),
          sections: {
            create: DEFAULT_LANDING_SECTIONS.map((sec, idx) => ({
              sectionType: sec.sectionType,
              label: sec.label,
              orderIndex: idx,
              isVisible: sec.isVisible !== false,
            })),
          },
        },
        include: {
          sections: { orderBy: { orderIndex: 'asc' } },
          versions: true,
        },
      });
    }

    return liveTheme;
  }

  // 2. Find all themes & current live theme for owner tenant
  async findAll(tenantId?: string) {
    if (!tenantId) {
      throw new ConflictException('Tenant could not be resolved from authenticated session.');
    }

    const liveTheme = await this.ensureTenantLiveTheme(tenantId);

    const themes = await this.prisma.tenantTheme.findMany({
      where: { tenantId },
      include: {
        _count: { select: { sections: true, versions: true } },
      },
      orderBy: [{ isLive: 'desc' }, { updatedAt: 'desc' }],
    });

    return ResponseHelper.success({
      liveTheme,
      themes,
    });
  }

  // 3. Find single theme details
  async findOne(id: string, tenantId?: string) {
    if (!tenantId) {
      throw new ConflictException('Tenant not resolved.');
    }

    const theme = await this.prisma.tenantTheme.findFirst({
      where: { id, tenantId },
      include: {
        sections: { orderBy: { orderIndex: 'asc' } },
        versions: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });

    if (!theme) {
      throw new NotFoundException('TenantTheme');
    }

    return ResponseHelper.success(theme);
  }

  // 4. Get current live theme for storefront or preview
  async getLiveTheme(tenantId?: string) {
    if (!tenantId) {
      throw new ConflictException('Tenant not resolved.');
    }

    const liveTheme = await this.ensureTenantLiveTheme(tenantId);
    return ResponseHelper.success(liveTheme);
  }

  // 5. Create / Clone Theme
  async create(dto: CreateThemeDto, tenantId?: string) {
    if (!tenantId) {
      throw new ConflictException('Tenant not resolved.');
    }

    const createdTheme = await this.prisma.tenantTheme.create({
      data: {
        tenantId,
        name: dto.name,
        status: ThemeStatus.DRAFT,
        isLive: false,
        primaryColor: dto.primaryColor || DEFAULT_THEME_TOKENS.primaryColor,
        secondaryColor: dto.secondaryColor || DEFAULT_THEME_TOKENS.secondaryColor,
        accentColor: dto.accentColor || DEFAULT_THEME_TOKENS.accentColor,
        canvasColor: dto.canvasColor || DEFAULT_THEME_TOKENS.canvasColor,
        surfaceColor: dto.surfaceColor || DEFAULT_THEME_TOKENS.surfaceColor,
        inkColor: dto.inkColor || DEFAULT_THEME_TOKENS.inkColor,
        fontHeading: dto.fontHeading || DEFAULT_THEME_TOKENS.fontHeading,
        fontBody: dto.fontBody || DEFAULT_THEME_TOKENS.fontBody,
        borderRadius: dto.borderRadius || DEFAULT_THEME_TOKENS.borderRadius,
        cardStyle: dto.cardStyle || DEFAULT_THEME_TOKENS.cardStyle,
        customCss: dto.customCss,
        sections: {
          create: DEFAULT_LANDING_SECTIONS.map((sec, idx) => ({
            sectionType: sec.sectionType,
            label: sec.label,
            orderIndex: idx,
            isVisible: sec.isVisible !== false,
          })),
        },
      },
      include: {
        sections: { orderBy: { orderIndex: 'asc' } },
      },
    });

    return ResponseHelper.created(createdTheme, 'Theme created successfully');
  }

  // 6. Update Theme Tokens & Settings (Draft Save)
  async update(id: string, dto: UpdateThemeDto, tenantId?: string) {
    if (!tenantId) {
      throw new ConflictException('Tenant not resolved.');
    }

    const theme = await this.prisma.tenantTheme.findFirst({
      where: { id, tenantId },
    });
    if (!theme) {
      throw new NotFoundException('TenantTheme');
    }

    const updated = await this.prisma.tenantTheme.update({
      where: { id },
      data: {
        ...dto,
      },
      include: {
        sections: { orderBy: { orderIndex: 'asc' } },
      },
    });

    return ResponseHelper.success(updated, 'Theme draft saved successfully');
  }

  // 7. Publish Theme
  async publish(id: string, dto: PublishThemeDto, tenantId?: string, user?: any) {
    if (!tenantId) {
      throw new ConflictException('Tenant not resolved.');
    }

    const targetTheme = await this.prisma.tenantTheme.findFirst({
      where: { id, tenantId },
      include: { sections: { orderBy: { orderIndex: 'asc' } } },
    });

    if (!targetTheme) {
      throw new NotFoundException('TenantTheme');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Demote any currently live themes for this tenant
      await tx.tenantTheme.updateMany({
        where: { tenantId, isLive: true },
        data: { isLive: false },
      });

      // 2. Mark this theme as live & published
      const published = await tx.tenantTheme.update({
        where: { id },
        data: {
          isLive: true,
          status: ThemeStatus.PUBLISHED,
          publishedAt: new Date(),
        },
        include: {
          sections: { orderBy: { orderIndex: 'asc' } },
        },
      });

      // 3. Count past versions for numbering
      const versionCount = await tx.themeVersion.count({
        where: { themeId: id },
      });

      const nextVersionTag = `v1.${versionCount + 1}`;
      const snapshotData = {
        tokens: {
          primaryColor: published.primaryColor,
          secondaryColor: published.secondaryColor,
          accentColor: published.accentColor,
          canvasColor: published.canvasColor,
          surfaceColor: published.surfaceColor,
          inkColor: published.inkColor,
          fontHeading: published.fontHeading,
          fontBody: published.fontBody,
          borderRadius: published.borderRadius,
          cardStyle: published.cardStyle,
          customCss: published.customCss,
        },
        sections: published.sections,
      };

      // 4. Create snapshot version record
      await tx.themeVersion.create({
        data: {
          themeId: id,
          version: nextVersionTag,
          label: dto?.label || `Published by ${user?.name || user?.email || 'Store Owner'}`,
          snapshot: snapshotData,
          publishedBy: user?.name || user?.email || 'Store Owner',
        },
      });

      // 5. Sync to Tenant.theme JSON column for backward compatibility
      await tx.tenant.update({
        where: { id: tenantId },
        data: {
          theme: {
            primaryColor: published.primaryColor,
            accentColor: published.accentColor,
            fontSans: published.fontBody,
            fontDisplay: published.fontHeading,
            borderRadius: published.borderRadius,
          },
        },
      });

      return ResponseHelper.success(published, 'Theme published live to storefront');
    });
  }

  // 8. Reorder Sections in Batch
  async reorderSections(themeId: string, dto: ReorderSectionsDto, tenantId?: string) {
    if (!tenantId) {
      throw new ConflictException('Tenant not resolved.');
    }

    const theme = await this.prisma.tenantTheme.findFirst({
      where: { id: themeId, tenantId },
    });
    if (!theme) {
      throw new NotFoundException('TenantTheme');
    }

    await this.prisma.$transaction(
      dto.sections.map((item) =>
        this.prisma.themeSection.updateMany({
          where: { id: item.id, themeId },
          data: {
            orderIndex: item.orderIndex,
            ...(item.isVisible !== undefined ? { isVisible: item.isVisible } : {}),
          },
        })
      )
    );

    const updatedSections = await this.prisma.themeSection.findMany({
      where: { themeId },
      orderBy: { orderIndex: 'asc' },
    });

    return ResponseHelper.success(updatedSections, 'Sections reordered successfully');
  }

  // 9. Add Section
  async addSection(themeId: string, dto: CreateSectionDto, tenantId?: string) {
    if (!tenantId) {
      throw new ConflictException('Tenant not resolved.');
    }

    const theme = await this.prisma.tenantTheme.findFirst({
      where: { id: themeId, tenantId },
    });
    if (!theme) {
      throw new NotFoundException('TenantTheme');
    }

    const count = await this.prisma.themeSection.count({ where: { themeId } });
    const section = await this.prisma.themeSection.create({
      data: {
        themeId,
        sectionType: dto.sectionType,
        label: dto.label,
        orderIndex: dto.orderIndex ?? count,
        isVisible: dto.isVisible ?? true,
        settings: dto.settings,
      },
    });

    return ResponseHelper.created(section, 'Section added to theme');
  }

  // 10. Update Section
  async updateSection(themeId: string, sectionId: string, dto: UpdateSectionDto, tenantId?: string) {
    if (!tenantId) {
      throw new ConflictException('Tenant not resolved.');
    }

    const section = await this.prisma.themeSection.findFirst({
      where: { id: sectionId, themeId, theme: { tenantId } },
    });
    if (!section) {
      throw new NotFoundException('ThemeSection');
    }

    const updated = await this.prisma.themeSection.update({
      where: { id: sectionId },
      data: dto,
    });

    return ResponseHelper.success(updated, 'Section updated successfully');
  }

  // 11. Delete Section
  async deleteSection(themeId: string, sectionId: string, tenantId?: string) {
    if (!tenantId) {
      throw new ConflictException('Tenant not resolved.');
    }

    const section = await this.prisma.themeSection.findFirst({
      where: { id: sectionId, themeId, theme: { tenantId } },
    });
    if (!section) {
      throw new NotFoundException('ThemeSection');
    }

    await this.prisma.themeSection.delete({ where: { id: sectionId } });
    return ResponseHelper.noContent('Section removed successfully');
  }

  // 12. Restore from snapshot version
  async restoreVersion(themeId: string, versionId: string, tenantId?: string) {
    if (!tenantId) {
      throw new ConflictException('Tenant not resolved.');
    }

    const version = await this.prisma.themeVersion.findFirst({
      where: { id: versionId, themeId, theme: { tenantId } },
    });
    if (!version) {
      throw new NotFoundException('ThemeVersion');
    }

    const snapshot = version.snapshot as any;
    if (!snapshot || !snapshot.tokens) {
      throw new BadRequestException('Corrupted or invalid snapshot data');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Restore tokens
      await tx.tenantTheme.update({
        where: { id: themeId },
        data: {
          primaryColor: snapshot.tokens.primaryColor,
          secondaryColor: snapshot.tokens.secondaryColor,
          accentColor: snapshot.tokens.accentColor,
          canvasColor: snapshot.tokens.canvasColor,
          surfaceColor: snapshot.tokens.surfaceColor,
          inkColor: snapshot.tokens.inkColor,
          fontHeading: snapshot.tokens.fontHeading,
          fontBody: snapshot.tokens.fontBody,
          borderRadius: snapshot.tokens.borderRadius,
          cardStyle: snapshot.tokens.cardStyle,
          customCss: snapshot.tokens.customCss,
        },
      });

      // 2. Restore sections if present in snapshot
      if (Array.isArray(snapshot.sections) && snapshot.sections.length > 0) {
        await tx.themeSection.deleteMany({ where: { themeId } });
        await tx.themeSection.createMany({
          data: snapshot.sections.map((s: any, idx: number) => ({
            themeId,
            sectionType: s.sectionType,
            label: s.label,
            orderIndex: s.orderIndex ?? idx,
            isVisible: s.isVisible !== false,
            settings: s.settings,
          })),
        });
      }

      const freshTheme = await tx.tenantTheme.findUnique({
        where: { id: themeId },
        include: {
          sections: { orderBy: { orderIndex: 'asc' } },
          versions: { orderBy: { createdAt: 'desc' } },
        },
      });

      return ResponseHelper.success(freshTheme, `Rolled back to ${version.version}`);
    });
  }
}
