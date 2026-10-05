import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { ResponseHelper } from '../../../common/helpers/response.helper';
import {
  ConflictException,
  NotFoundException,
} from '../../../common/exceptions/business.exception';
import { DiscountMethod, DiscountStatus } from '../../../../prisma/generated/client';

@Injectable()
export class DiscountService {
  constructor(private readonly prisma: PrismaService) {}

  // Helper to resolve fallback tenant if none provided (for public storefronts or dev)
  private async resolveTenantId(tenantId?: string): Promise<string> {
    if (tenantId) return tenantId;
    const defaultTenant = await this.prisma.tenant.findFirst({
      where: { deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });
    if (!defaultTenant) {
      throw new NotFoundException('Tenant');
    }
    return defaultTenant.id;
  }

  // 1. Create a new discount / coupon
  async create(dto: CreateDiscountDto, tenantId?: string) {
    if (!tenantId) {
      throw new ConflictException('Tenant could not be resolved from authenticated user token.');
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });
    if (!tenant) {
      throw new NotFoundException('Tenant');
    }

    const cleanCode = dto.code.trim().toUpperCase();

    // Check code duplication for this store
    const existing = await this.prisma.discount.findUnique({
      where: {
        tenantId_code: {
          tenantId,
          code: cleanCode,
        },
      },
    });

    if (existing && !existing.deletedAt) {
      throw new ConflictException(`Discount code '${cleanCode}' already exists for this store.`);
    }

    // Validate start and end dates
    const startsAt = new Date(dto.startsAt);
    const endsAt = dto.endsAt ? new Date(dto.endsAt) : undefined;
    if (endsAt && endsAt <= startsAt) {
      throw new BadRequestException('End date must be after the start date.');
    }

    // Determine initial status based on start/end dates
    let initialStatus = dto.status ?? DiscountStatus.ACTIVE;
    const now = new Date();
    if (startsAt > now) {
      initialStatus = DiscountStatus.SCHEDULED;
    } else if (endsAt && endsAt < now) {
      initialStatus = DiscountStatus.EXPIRED;
    }

    const discount = await this.prisma.discount.create({
      data: {
        tenantId,
        code: cleanCode,
        title: dto.title.trim(),
        type: dto.type,
        method: dto.method ?? DiscountMethod.CODE,
        status: initialStatus,
        value: dto.value,
        minSubtotal: dto.minSubtotal !== undefined ? dto.minSubtotal : undefined,
        maxDiscountAmount: dto.maxDiscountAmount !== undefined ? dto.maxDiscountAmount : undefined,
        usageLimit: dto.usageLimit !== undefined ? dto.usageLimit : undefined,
        usageLimitPerUser: dto.usageLimitPerUser !== undefined ? dto.usageLimitPerUser : 1,
        startsAt,
        endsAt,
      },
    });

    return ResponseHelper.created(discount, 'Discount created successfully');
  }
}
