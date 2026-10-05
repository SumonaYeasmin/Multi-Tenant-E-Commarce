import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DiscountService } from './discount.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '../../../../prisma/generated/client';

@ApiTags('(Owner) Discounts')
@Controller('owner/discounts')
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new discount or coupon' })
  @ApiResponse({ status: 201, description: 'Discount created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Owner role required' })
  @ApiResponse({ status: 409, description: 'Discount code already exists' })
  async create(
    @Body() dto: CreateDiscountDto,
    @CurrentUser() user?: any,
  ) {
    return this.discountService.create(dto, user?.tenantId);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an existing discount by ID' })
  @ApiResponse({ status: 200, description: 'Discount updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Owner role required' })
  @ApiResponse({ status: 404, description: 'Discount not found' })
  @ApiResponse({ status: 409, description: 'Discount code already in use' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDiscountDto,
    @CurrentUser() user?: any,
  ) {
    return this.discountService.update(id, dto, user?.tenantId);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a discount by ID (Soft delete)' })
  @ApiResponse({ status: 200, description: 'Discount deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Owner role required' })
  @ApiResponse({ status: 404, description: 'Discount not found' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user?: any,
  ) {
    return this.discountService.remove(id, user?.tenantId);
  }
}
