import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
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

  // 2. Update an existing discount
  async update(id: string, dto: UpdateDiscountDto, tenantId?: string) {
    if (!tenantId) {
      throw new ConflictException('Tenant could not be resolved from authenticated user token.');
    }

    const discount = await this.prisma.discount.findFirst({
      where: {
        id,
        tenantId,
        deletedAt: null,
      },
    });

    if (!discount) {
      throw new NotFoundException('Discount');
    }

    // Check code uniqueness if code is changed
    let updatedCode = discount.code;
    if (dto.code && dto.code.trim().toUpperCase() !== discount.code) {
      updatedCode = dto.code.trim().toUpperCase();
      const duplicate = await this.prisma.discount.findFirst({
        where: {
          tenantId,
          code: updatedCode,
          id: { not: discount.id },
          deletedAt: null,
        },
      });

      if (duplicate) {
        throw new ConflictException(`Discount code '${updatedCode}' is already in use.`);
      }
    }

    const startsAt = dto.startsAt ? new Date(dto.startsAt) : discount.startsAt;
    const endsAt = dto.endsAt !== undefined ? (dto.endsAt ? new Date(dto.endsAt) : null) : discount.endsAt;

    if (endsAt && endsAt <= startsAt) {
      throw new BadRequestException('End date must be after start date.');
    }

    const updated = await this.prisma.discount.update({
      where: { id: discount.id },
      data: {
        code: updatedCode,
        title: dto.title !== undefined ? dto.title.trim() : undefined,
        type: dto.type !== undefined ? dto.type : undefined,
        method: dto.method !== undefined ? dto.method : undefined,
        status: dto.status !== undefined ? dto.status : undefined,
        value: dto.value !== undefined ? dto.value : undefined,
        minSubtotal: dto.minSubtotal !== undefined ? dto.minSubtotal : undefined,
        maxDiscountAmount: dto.maxDiscountAmount !== undefined ? dto.maxDiscountAmount : undefined,
        usageLimit: dto.usageLimit !== undefined ? dto.usageLimit : undefined,
        usageLimitPerUser: dto.usageLimitPerUser !== undefined ? dto.usageLimitPerUser : undefined,
        startsAt,
        endsAt,
      },
    });

    return ResponseHelper.success(updated, 'Discount updated successfully');
  }

  // 3. Delete discount (Soft delete)
  async remove(id: string, tenantId?: string) {
    if (!tenantId) {
      throw new ConflictException('Tenant could not be resolved from authenticated user token.');
    }

    const discount = await this.prisma.discount.findFirst({
      where: {
        id,
        tenantId,
        deletedAt: null,
      },
    });

    if (!discount) {
      throw new NotFoundException('Discount');
    }

    await this.prisma.discount.update({
      where: { id: discount.id },
      data: { deletedAt: new Date() },
    });

    return ResponseHelper.success(null, 'Discount deleted successfully');
  }
}
