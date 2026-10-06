import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import { QueryCustomerDto } from './dto';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('(Owner) Customers')
@Controller('owner/customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all customers for owner store with search, filters, and pagination' })
  @ApiResponse({ status: 200, description: 'Customers retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query() query: QueryCustomerDto,
    @CurrentUser() user?: any,
  ) {
    return this.customerService.findAll(query, user?.tenantId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get single customer details by ID with order history and addresses' })
  @ApiResponse({ status: 200, description: 'Customer details retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user?: any,
  ) {
    return this.customerService.findOne(id, user?.tenantId);
  }
}
