import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../../prisma/prisma.service';
import { ResponseHelper } from '../../../common/helpers/response.helper';
import { UserRole, UserStatus } from '../../../../prisma/generated/client';
import { QueryStaffDto, InviteStaffDto } from './dto';

@Injectable()
export class StaffService {
  constructor(private readonly prisma: PrismaService) {}

  // Helper to resolve tenant context safely
  private async resolveTenantId(tenantId?: string): Promise<string> {
    if (tenantId) return tenantId;
    const defaultTenant = await this.prisma.tenant.findFirst({
      where: { deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });
    if (!defaultTenant) {
      throw new NotFoundException('Store tenant context not found');
    }
    return defaultTenant.id;
  }

  // Auto-seed default standard roles for a tenant if none exist
  private async ensureDefaultRoles(tenantId: string) {
    const existingRolesCount = await this.prisma.tenantRole.count({
      where: { tenantId },
    });

    if (existingRolesCount > 0) return;

    const defaultRoles = [
      {
        name: 'Store Manager',
        description: 'Runs daily operations incl. orders, catalog, customers, and discounts.',
        isSystem: true,
        permissions: {
          dashboard: ['view'],
          orders: ['view', 'create', 'update', 'delete'],
          returns: ['view', 'create', 'update'],
          payments: ['view'],
          products: ['view', 'create', 'update', 'delete'],
          categories: ['view', 'create', 'update', 'delete'],
          collections: ['view', 'create', 'update', 'delete'],
          brands: ['view', 'create', 'update', 'delete'],
          inventory: ['view', 'create', 'update'],
          customers: ['view', 'create', 'update'],
          reviews: ['view', 'update', 'delete'],
          discounts: ['view', 'create', 'update', 'delete'],
          marketing: ['view', 'create', 'update'],
          shipping: ['view', 'update'],
          theme: ['view', 'update'],
          content: ['view', 'create', 'update', 'delete'],
          media: ['view', 'create', 'update', 'delete'],
          analytics: ['view'],
          reports: ['view'],
          notifications: ['view'],
          audit: ['view'],
        },
      },
      {
        name: 'Fulfillment Staff',
        description: 'Processes, packs, and ships orders; manages inventory stock.',
        isSystem: true,
        permissions: {
          dashboard: ['view'],
          orders: ['view', 'update'],
          returns: ['view', 'update'],
          inventory: ['view', 'update'],
          shipping: ['view', 'update'],
          customers: ['view'],
        },
      },
      {
        name: 'Customer Care',
        description: 'Views orders and customers, handles returns, inquiries, and reviews.',
        isSystem: true,
        permissions: {
          dashboard: ['view'],
          orders: ['view', 'update'],
          returns: ['view', 'update'],
          customers: ['view', 'update'],
          reviews: ['view', 'update', 'delete'],
        },
      },
      {
        name: 'Content Editor',
        description: 'Manages catalog items, pages, blogs, and media assets.',
        isSystem: true,
        permissions: {
          dashboard: ['view'],
          products: ['view', 'create', 'update'],
          categories: ['view', 'create', 'update'],
          collections: ['view', 'create', 'update'],
          brands: ['view', 'create', 'update'],
          theme: ['view', 'update'],
          content: ['view', 'create', 'update', 'delete'],
          media: ['view', 'create', 'update', 'delete'],
        },
      },
    ];

    for (const r of defaultRoles) {
      await this.prisma.tenantRole.upsert({
        where: {
          tenantId_name: {
            tenantId,
            name: r.name,
          },
        },
        update: {},
        create: {
          tenantId,
          name: r.name,
          description: r.description,
          isSystem: r.isSystem,
          permissions: r.permissions,
        },
      });
    }
  }

  // Fetch all staff members for the tenant with search, filtering, and role metadata
  async getStaffMembers(query: QueryStaffDto, tenantId?: string) {
    const targetTenantId = await this.resolveTenantId(tenantId);

    // Make sure standard roles exist for tenant
    await this.ensureDefaultRoles(targetTenantId);

    const where: any = {
      tenantId: targetTenantId,
      deletedAt: null,
    };

    if (query.roleId) {
      where.roleId = query.roleId;
    }

    if (query.status) {
      where.status = query.status.toLowerCase();
    }

    if (query.search?.trim()) {
      const s = query.search.trim();
      where.user = {
        OR: [
          { name: { contains: s, mode: 'insensitive' } },
          { email: { contains: s, mode: 'insensitive' } },
          { phone: { contains: s, mode: 'insensitive' } },
        ],
      };
    }

    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 50;
    const skip = (page - 1) * limit;

    const [members, total, activeCount, invitedCount, deactivatedCount, rolesCount] =
      await Promise.all([
        this.prisma.tenantMember.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                status: true,
                lastLoginAt: true,
                createdAt: true,
              },
            },
            role: {
              select: {
                id: true,
                name: true,
                description: true,
                isSystem: true,
                permissions: true,
              },
            },
          },
          orderBy: [
            { isOwner: 'desc' },
            { createdAt: 'asc' },
          ],
          skip,
          take: limit,
        }),
        this.prisma.tenantMember.count({ where }),
        this.prisma.tenantMember.count({
          where: { tenantId: targetTenantId, status: 'active', deletedAt: null },
        }),
        this.prisma.tenantMember.count({
          where: { tenantId: targetTenantId, status: 'invited', deletedAt: null },
        }),
        this.prisma.tenantMember.count({
          where: { tenantId: targetTenantId, status: 'deactivated', deletedAt: null },
        }),
        this.prisma.tenantRole.count({
          where: { tenantId: targetTenantId },
        }),
      ]);

    const formattedMembers = members.map((m) => {
      const roleName = m.isOwner ? 'Owner' : m.role?.name || 'Staff';
      return {
        id: m.id,
        userId: m.userId,
        name: m.user?.name || m.user?.email?.split('@')[0] || 'Staff Member',
        email: m.user?.email || '',
        phone: m.user?.phone || '',
        role: roleName,
        roleId: m.roleId,
        roleDetails: m.role || null,
        isOwner: m.isOwner,
        status: m.status,
        twoFactor: m.twoFactor,
        lastActiveAt: m.lastActiveAt || m.user?.lastLoginAt || null,
        invitedAt: m.inviteExpiresAt ? m.createdAt : null,
        createdAt: m.createdAt,
      };
    });

    return ResponseHelper.success(
      {
        members: formattedMembers,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        counts: {
          total,
          active: activeCount,
          invited: invitedCount,
          deactivated: deactivatedCount,
          rolesCount,
        },
      },
      'Staff members retrieved successfully',
    );
  }

  // 2. Invite or directly add a new staff member to the tenant with an assigned role
  async inviteStaff(dto: InviteStaffDto, tenantId?: string, adminUser?: any) {
    const targetTenantId = await this.resolveTenantId(tenantId);
    await this.ensureDefaultRoles(targetTenantId);

    const email = dto.email.trim().toLowerCase();
    if (!email) {
      throw new BadRequestException('Email address is required');
    }

    // Resolve assigned TenantRole
    let targetRole: any = null;
    if (dto.roleId) {
      targetRole = await this.prisma.tenantRole.findFirst({
        where: { id: dto.roleId, tenantId: targetTenantId },
      });
    } else if (dto.roleName) {
      targetRole = await this.prisma.tenantRole.findFirst({
        where: {
          tenantId: targetTenantId,
          name: { equals: dto.roleName.trim(), mode: 'insensitive' },
        },
      });
    }

    if (!targetRole) {
      targetRole = await this.prisma.tenantRole.findFirst({
        where: { tenantId: targetTenantId, name: 'Store Manager' },
      });
    }

    if (!targetRole) {
      throw new NotFoundException('Selected role not found in this store');
    }

    // Check if user already exists in users table
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // Check if already an active member of this tenant
      const existingMember = await this.prisma.tenantMember.findFirst({
        where: {
          tenantId: targetTenantId,
          userId: user.id,
          deletedAt: null,
        },
      });

      if (existingMember) {
        throw new BadRequestException(
          `User with email "${email}" is already a staff member in this store`,
        );
      }
    } else {
      // Create user account for staff member
      const rawPassword =
        dto.password?.trim() ||
        `Staff@${Math.floor(100000 + Math.random() * 900000)}`;
      const hashedPassword = await bcrypt.hash(rawPassword, 10);

      user = await this.prisma.user.create({
        data: {
          email,
          name: dto.name?.trim() || email.split('@')[0],
          phone: dto.phone?.trim() || null,
          password: hashedPassword,
          role: UserRole.CUSTOMER,
          status: UserStatus.ACTIVE,
        },
      });
    }

    // Create TenantMember record
    const inviteToken = crypto.randomBytes(24).toString('hex');
    const inviteExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const member = await this.prisma.tenantMember.create({
      data: {
        tenantId: targetTenantId,
        userId: user.id,
        roleId: targetRole.id,
        isOwner: false,
        status: 'active',
        inviteToken,
        inviteExpiresAt,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            status: true,
            createdAt: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
            description: true,
            isSystem: true,
            permissions: true,
          },
        },
      },
    });

    const formatted = {
      id: member.id,
      userId: member.userId,
      name: member.user?.name || email.split('@')[0],
      email: member.user?.email || email,
      phone: member.user?.phone || '',
      role: member.role?.name || 'Staff',
      roleId: member.roleId,
      roleDetails: member.role || null,
      isOwner: member.isOwner,
      status: member.status,
      twoFactor: member.twoFactor,
      lastActiveAt: member.lastActiveAt,
      invitedAt: member.createdAt,
      createdAt: member.createdAt,
    };

    return ResponseHelper.created(
      formatted,
      `Staff member "${formatted.name}" added successfully as "${formatted.role}"`,
    );
  }
}
