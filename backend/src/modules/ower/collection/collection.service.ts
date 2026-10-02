import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { ResponseHelper } from '../../../common/helpers/response.helper';
import {
  ConflictException,
  NotFoundException,
} from '../../../common/exceptions/business.exception';
import { CollectionType } from '../../../../prisma/generated/client';

@Injectable()
export class CollectionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper to generate a URL-friendly slug from string
   */
  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  /**
   * Create a new collection
   */
  async create(dto: CreateCollectionDto, tenantId?: string) {
    const targetTenantId = dto.tenantId || tenantId;

    if (!targetTenantId) {
      throw new ConflictException('Tenant ID is required to create a collection.');
    }

    // Verify tenant exists
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: targetTenantId },
    });
    if (!tenant) {
      throw new NotFoundException('Tenant');
    }

    // Generate or format slug
    const slug = dto.slug
      ? this.generateSlug(dto.slug)
      : this.generateSlug(dto.name);

    // Check if collection with this slug already exists for the tenant
    const existingCollection = await this.prisma.collection.findUnique({
      where: {
        tenantId_slug: {
          tenantId: targetTenantId,
          slug,
        },
      },
    });

    if (existingCollection) {
      throw new ConflictException(
        `Collection with slug '${slug}' already exists in this store.`,
      );
    }

    // Create the collection in the database
    const collection = await this.prisma.collection.create({
      data: {
        tenantId: targetTenantId,
        name: dto.name,
        slug,
        description: dto.description,
        image: dto.image,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        type: dto.type ?? CollectionType.MANUAL,
        rule: dto.rule ?? undefined,
        isActive: dto.isActive ?? true,
        isFeatured: dto.isFeatured ?? false,
        order: dto.order ?? 0,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
      },
    });

    return ResponseHelper.created(collection, 'Collection created successfully');
  }
}
