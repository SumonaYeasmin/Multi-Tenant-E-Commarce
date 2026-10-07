import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ResponseHelper } from '../../../common/helpers/response.helper';
import { CreateReturnDto } from './dto/create-return.dto';
import {
  NotFoundException,
  ConflictException,
} from '../../../common/exceptions/business.exception';
import { ReturnResolution, ReturnStatus } from '../../../../prisma/generated/client';

@Injectable()
export class ReturnService {
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

  // POST /api/v1/customer/returns - Submit a new return/refund request
  async createReturn(
    tenantId: string | undefined,
    userId: string | undefined,
    dto: CreateReturnDto,
  ) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);

    // 1. Verify the order exists under this tenant
    const order = await this.prisma.order.findFirst({
      where: {
        OR: [{ id: dto.orderId }, { number: dto.orderId }],
        tenantId: resolvedTenantId,
        deletedAt: null,
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order');
    }

    // 2. Validate items
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('At least one item must be selected for return.');
    }

    // 3. Calculate total return amount
    const totalAmount = dto.items.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.qty) || 1;
      return sum + price * qty;
    }, 0);

    const customerName =
      dto.customerName?.trim() || order.customerName || 'Customer';

    // 4. Create the ReturnRequest along with ReturnItems and initial ReturnTimeline
    const returnRequest = await this.prisma.$transaction(async (tx) => {
      const created = await tx.returnRequest.create({
        data: {
          tenantId: resolvedTenantId,
          orderId: order.id,
          customerName,
          reason: dto.reason.trim(),
          details: dto.details?.trim() || null,
          photos: dto.photos || [],
          resolution: dto.resolution || ReturnResolution.REFUND,
          status: ReturnStatus.REQUESTED,
          amount: totalAmount,
          items: {
            create: dto.items.map((item) => ({
              title: item.title,
              image: item.image || null,
              qty: Number(item.qty) || 1,
              price: Number(item.price) || 0,
              size: item.size || null,
              color: item.color || null,
            })),
          },
          timeline: {
            create: {
              label: 'Return request submitted',
              by: customerName,
              note: dto.reason.trim(),
            },
          },
        },
        include: {
          items: true,
          timeline: {
            orderBy: { createdAt: 'desc' },
          },
          order: {
            select: {
              id: true,
              number: true,
              status: true,
              total: true,
              createdAt: true,
            },
          },
        },
      });

      return created;
    });

    return ResponseHelper.created(
      returnRequest,
      'Return request submitted successfully',
    );
  }
}
