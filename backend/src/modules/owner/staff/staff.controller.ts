import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { StaffService } from './staff.service';
import { QueryStaffDto, InviteStaffDto } from './dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '../../../../prisma/generated/client';

@ApiTags('(Owner) Staff & Roles')
@Controller('owner/staff')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  // 1. Get all store staff members with search, filters, pagination, and role metadata
  @Get('members')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List all store staff members with role permissions and status counters',
  })
  @ApiResponse({
    status: 200,
    description: 'Staff members retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Owner login token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Store owner role required',
  })
  async getStaffMembers(
    @Query() query: QueryStaffDto,
    @CurrentUser() user?: any,
    @Headers('x-tenant-id') tenantHeader?: string,
  ) {
    const tenantId = tenantHeader || user?.tenantId;
    return this.staffService.getStaffMembers(query, tenantId);
  }

  // 2. Invite or add a new staff member and assign role permissions
  @Post('invite')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Invite or add a new staff member and assign store role',
  })
  @ApiResponse({
    status: 201,
    description: 'Staff member invited/added successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed or user already member',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Owner login token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Store owner role required',
  })
  async inviteStaff(
    @Body() dto: InviteStaffDto,
    @CurrentUser() user?: any,
    @Headers('x-tenant-id') tenantHeader?: string,
  ) {
    const tenantId = tenantHeader || user?.tenantId;
    return this.staffService.inviteStaff(dto, tenantId, user);
  }
}
