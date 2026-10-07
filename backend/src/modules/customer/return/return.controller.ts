import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ReturnService } from './return.service';
import { CreateReturnDto } from './dto';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../../../common/guards/optional-jwt-auth.guard';

@ApiTags('(Customer) Returns')
@ApiBearerAuth()
@Controller('customer/returns')
export class ReturnController {
  constructor(private readonly returnService: ReturnService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Submit a new return/refund request for an order' })
  @ApiResponse({ status: 201, description: 'Return request submitted successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed or invalid items' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async createReturn(
    @Body() dto: CreateReturnDto,
    @CurrentUser() user?: any,
    @Headers('x-tenant-id') tenantHeader?: string,
  ) {
    const tenantId = tenantHeader || user?.tenantId;
    const userId = user?.id || user?.sub;
    return this.returnService.createReturn(tenantId, userId, dto);
  }
}
