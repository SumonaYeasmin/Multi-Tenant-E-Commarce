import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ResponseHelper } from '../../../common/helpers/response.helper';
import { QueryCustomerDto } from './dto';
import {
  NotFoundException,
  ConflictException,
} from '../../../common/exceptions/business.exception';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  // Helper to resolve tenant ID from token or fallback to active tenant
  private async resolveTenantId(tenantId?: string): Promise<string> {
    if (tenantId) return tenantId;

    const activeTenant = await this.prisma.tenant.findFirst({
      where: { deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });

    if (!activeTenant) {
      throw new ConflictException('Tenant could not be resolved.');
    }

    return activeTenant.id;
  }

  // Get all customers with search, segment filter, sorting, and pagination
  async findAll(query?: QueryCustomerDto, tenantId?: string) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);

    const where: any = {
      tenantId: resolvedTenantId,
      deletedAt: null,
    };

    // Filter by Segment
    if (query?.segment) {
      where.segment = query.segment;
    }

    // Filter by District
    if (query?.district && query.district !== 'all') {
      where.district = { equals: query.district, mode: 'insensitive' };
    }

    // Search query across name, email, phone, tags, district
    if (query?.search && query.search.trim()) {
      const q = query.search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { district: { contains: q, mode: 'insensitive' } },
        { tags: { has: q } },
      ];
    }

    const page = query?.page && query.page > 0 ? Number(query.page) : 1;
    const limit = query?.limit && query.limit > 0 ? Number(query.limit) : 50;
    const skip = (page - 1) * limit;

    const allowedSortFields = ['createdAt', 'totalSpent', 'ordersCount', 'name', 'lastLoginAt'];
    const sortBy = allowedSortFields.includes(query?.sortBy || '')
      ? query!.sortBy!
      : 'createdAt';
    const sortOrder = query?.sortOrder === 'asc' ? 'asc' : 'desc';

    const [customers, total] = await Promise.all([
      this.prisma.customerProfile.findMany({
        where,
        include: {
          addresses: {
            orderBy: { isDefaultShipping: 'desc' },
          },
          orders: {
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              number: true,
              status: true,
              paymentStatus: true,
              fulfillmentStatus: true,
              total: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              orders: true,
              reviews: true,
              wishlist: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.customerProfile.count({ where }),
    ]);

    const meta = ResponseHelper.buildPaginationMeta(total, page, limit);
    return ResponseHelper.paginated(customers, meta, 'Customers retrieved successfully');
  }

  // Get single customer details by ID or Email with full order history & addresses
  async findOne(id: string, tenantId?: string) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);

    const customer = await this.prisma.customerProfile.findFirst({
      where: {
        OR: [{ id }, { email: id }],
        tenantId: resolvedTenantId,
        deletedAt: null,
      },
      include: {
        addresses: {
          orderBy: { isDefaultShipping: 'desc' },
        },
        orders: {
          orderBy: { createdAt: 'desc' },
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                    images: { take: 1 },
                  },
                },
              },
            },
            shippingAddress: true,
          },
        },
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        },
        wishlist: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
                price: true,
                salePrice: true,
                images: { take: 1 },
              },
            },
          },
        },
        _count: {
          select: {
            orders: true,
            reviews: true,
            wishlist: true,
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer');
    }

    return ResponseHelper.success(customer, 'Customer details retrieved successfully');
  }
}
