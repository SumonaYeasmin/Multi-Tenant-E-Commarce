import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import {
  OrderStatus,
  PaymentStatus,
  FulfillmentStatus,
  PaymentMethod,
  OrderChannel,
} from '../../../../../prisma/generated/client';

export class OrderQueryDto {
  @ApiPropertyOptional({
    example: 'TN-10024',
    description: 'Search string matching order number, customer name, email, or phone',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    enum: OrderStatus,
    description: 'Filter orders by order status (e.g. PENDING_PAYMENT, CONFIRMED, PROCESSING, PACKED, SHIPPED, DELIVERED, CANCELLED)',
  })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @ApiPropertyOptional({
    enum: PaymentStatus,
    description: 'Filter orders by payment status (PENDING, PAID, FAILED, REFUNDED)',
  })
  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({
    enum: FulfillmentStatus,
    description: 'Filter orders by fulfillment status (UNFULFILLED, PARTIALLY_FULFILLED, FULFILLED)',
  })
  @IsEnum(FulfillmentStatus)
  @IsOptional()
  fulfillmentStatus?: FulfillmentStatus;

  @ApiPropertyOptional({
    enum: PaymentMethod,
    description: 'Filter orders by payment method (BKASH, NAGAD, SSLCOMMERZ, STRIPE, COD)',
  })
  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({
    enum: OrderChannel,
    description: 'Filter orders by sales channel (ONLINE, MANUAL)',
  })
  @IsEnum(OrderChannel)
  @IsOptional()
  channel?: OrderChannel;

  @ApiPropertyOptional({
    example: '2026-10-01',
    description: 'Filter orders created on or after this date (YYYY-MM-DD or ISO)',
  })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-10-31',
    description: 'Filter orders created on or before this date (YYYY-MM-DD or ISO)',
  })
  @IsString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    default: 1,
    description: 'Page number for pagination',
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    default: 20,
    description: 'Number of orders per page',
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional({
    default: 'createdAt',
    enum: ['createdAt', 'total', 'number'],
    description: 'Field to sort by',
  })
  @IsString()
  @IsOptional()
  sortBy?: 'createdAt' | 'total' | 'number' = 'createdAt';

  @ApiPropertyOptional({
    default: 'desc',
    enum: ['asc', 'desc'],
    description: 'Sort direction',
  })
  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
