import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { LogSearchDto } from './dto/log-search.dto';
import { ResponseHelper } from '../../../common/helpers/response.helper';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(private readonly prisma: PrismaService) {}

  private async resolveTenantId(tenantId?: string): Promise<string> {
    if (tenantId && tenantId.length > 10) {
      const exists = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
      });
      if (exists) return exists.id;
    }

    const defaultTenant = await this.prisma.tenant.findFirst({
      where: { deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });

    if (!defaultTenant) {
      throw new NotFoundException('Store tenant context not found');
    }

    return defaultTenant.id;
  }

  async logSearch(dto: LogSearchDto, tenantId?: string) {
    const targetTenantId = await this.resolveTenantId(tenantId);
    const cleanTerm = dto.term.trim().toLowerCase();

    if (!cleanTerm || cleanTerm.length < 2) {
      return ResponseHelper.success(null, 'Ignored short term');
    }

    const resultsCount = typeof dto.results === 'number' ? dto.results : 0;

    const log = await this.prisma.searchQueryLog.upsert({
      where: {
        tenantId_term: {
          tenantId: targetTenantId,
          term: cleanTerm,
        },
      },
      create: {
        tenantId: targetTenantId,
        term: cleanTerm,
        count: 1,
        results: resultsCount,
        lastSearchedAt: new Date(),
      },
      update: {
        count: {
          increment: 1,
        },
        results: resultsCount,
        lastSearchedAt: new Date(),
      },
    });

    return ResponseHelper.success(log, 'Search query recorded');
  }
}
