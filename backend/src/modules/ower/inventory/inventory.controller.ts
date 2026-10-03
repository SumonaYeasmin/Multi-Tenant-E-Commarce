import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { QueryInventoryDto } from './dto/query-inventory.dto';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('(Owner) Inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get inventory stock overview, metrics, and filtered variants',
  })
  @ApiResponse({
    status: 200,
    description: 'Inventory overview retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Tenant not found',
  })
  async getOverview(
    @Query() query: QueryInventoryDto,
    @CurrentUser() user?: any,
  ) {
    return this.inventoryService.getOverview(query, user?.tenantId);
  }
}
