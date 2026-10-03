import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  QueryInventoryDto,
  InventoryStockFilter,
} from './dto/query-inventory.dto';
import { ResponseHelper } from '../../../common/helpers/response.helper';
import { NotFoundException } from '../../../common/exceptions/business.exception';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * ধাপ ১: ইনভেন্টরির বর্তমান স্টক তালিকা এবং ড্যাশবোর্ড মেট্রিক্স (Overview) ফেচ করা
   */
  async getOverview(query?: QueryInventoryDto, tenantId?: string) {
    const targetTenantId =
      query?.tenantId || tenantId || 'e0f8bdb1-da0a-4907-9d82-08ef1be77ac2';

    // ১. Tenant ভ্যালিডেশন
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: targetTenantId },
    });
    if (!tenant) {
      throw new NotFoundException('Tenant');
    }

    // ২. ফিল্টারিং শর্ত তৈরি
    const where: any = {
      deletedAt: null,
      product: {
        tenantId: targetTenantId,
        deletedAt: null,
      },
    };

    // ক্যাটাগরি ফিল্টার
    if (query?.category && query.category !== 'all') {
      where.product.category = {
        OR: [{ id: query.category }, { slug: query.category }],
      };
    }

    // ব্র‍্যান্ড ফিল্টার
    if (query?.brand && query.brand !== 'all') {
      where.product.brand = {
        OR: [{ id: query.brand }, { slug: query.brand }],
      };
    }

    // সার্চ ফিল্টার (প্রোডাক্ট টাইটেল, SKU, কালার বা সাইজ)
    if (query?.search && query.search.trim()) {
      const q = query.search.trim();
      where.OR = [
        { sku: { contains: q, mode: 'insensitive' } },
        { color: { contains: q, mode: 'insensitive' } },
        { size: { contains: q, mode: 'insensitive' } },
        { product: { title: { contains: q, mode: 'insensitive' } } },
      ];
    }

    // স্টক স্ট্যাটাস ফিল্টার (All, Low, Out)
    if (query?.stockStatus === InventoryStockFilter.OUT) {
      where.stock = 0;
    } else if (query?.stockStatus === InventoryStockFilter.LOW) {
      where.stock = { gt: 0, lte: 5 };
    }

    // ৩. পেজিনেশন ও সর্টিং
    const page = query?.page && query.page > 0 ? Number(query.page) : 1;
    const limit = query?.limit && query.limit > 0 ? Number(query.limit) : 50;
    const skip = (page - 1) * limit;

    // সর্টিং ডিরেকশন
    const sortOrder = query?.sortOrder === 'asc' ? 'asc' : 'desc';
    let orderBy: any = { createdAt: sortOrder };

    if (query?.sortBy === 'stock') {
      orderBy = { stock: sortOrder };
    } else if (query?.sortBy === 'sku') {
      orderBy = { sku: sortOrder };
    } else if (query?.sortBy === 'updatedAt') {
      orderBy = { updatedAt: sortOrder };
    }

    // ৪. ডাটাবেজ থেকে ভ্যারিয়েন্ট তালিকা এবং ফুল মেট্রিক্স ফেচ
    const [allTenantVariants, filteredVariants, totalFiltered] =
      await Promise.all([
        // পুরো স্টোরের সামারি মেট্রিক্স হিসাবের জন্য
        this.prisma.productVariant.findMany({
          where: {
            deletedAt: null,
            product: {
              tenantId: targetTenantId,
              deletedAt: null,
            },
          },
          select: {
            id: true,
            stock: true,
            reserved: true,
            lowStockThreshold: true,
            product: {
              select: {
                cost: true,
              },
            },
          },
        }),

        // ফিল্টার করা আইটেম তালিকা (ইনভেন্টরি টেবিলের জন্য)
        this.prisma.productVariant.findMany({
          where,
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
                price: true,
                salePrice: true,
                cost: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
                brand: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
                images: {
                  where: { isCover: true },
                  take: 1,
                  select: {
                    url: true,
                    alt: true,
                  },
                },
              },
            },
          },
          orderBy,
          skip,
          take: limit,
        }),

        // মোট ফিল্টার্ড সংখ্যা
        this.prisma.productVariant.count({ where }),
      ]);

    // ৫. ড্যাশবোর্ড কার্ডসের জন্য ৪টি রিয়েল হিসাব তৈরি
    let totalStockValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalStock = 0;

    allTenantVariants.forEach((v) => {
      const stock = v.stock ?? 0;
      const threshold = v.lowStockThreshold ?? 5;
      const cost = Number(v.product?.cost ?? 0);

      totalStock += stock;
      totalStockValue += stock * cost;

      if (stock === 0) {
        outOfStockCount++;
      } else if (stock <= threshold) {
        lowStockCount++;
      }
    });

    // ৬. রেসপন্স রিটার্ন
    return ResponseHelper.success(
      {
        stats: {
          totalVariants: allTenantVariants.length,
          totalStock,
          totalStockValue,
          lowStockCount,
          outOfStockCount,
        },
        pagination: {
          total: totalFiltered,
          page,
          limit,
          totalPages: Math.ceil(totalFiltered / limit),
        },
        items: filteredVariants,
      },
      'Inventory overview retrieved successfully',
    );
  }
}
