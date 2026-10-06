import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import {
  OrderStatus,
  FulfillmentStatus,
  PaymentStatus,
} from '../../../../../prisma/generated/client';

export class UpdateOrderStatusDto {
  @ApiProperty({
    enum: OrderStatus,
    example: OrderStatus.SHIPPED,
    description: 'New status for the order (e.g. PROCESSING, PACKED, SHIPPED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED)',
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiPropertyOptional({
    enum: FulfillmentStatus,
    example: FulfillmentStatus.FULFILLED,
    description: 'Optional fulfillment status update',
  })
  @IsEnum(FulfillmentStatus)
  @IsOptional()
  fulfillmentStatus?: FulfillmentStatus;

  @ApiPropertyOptional({
    enum: PaymentStatus,
    example: PaymentStatus.PAID,
    description: 'Optional payment status update (e.g. PAID, REFUNDED)',
  })
  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({
    example: 'Pathao Courier',
    description: 'Courier service provider name (e.g. Pathao, Steadfast, Paperfly, RedX)',
  })
  @IsString()
  @IsOptional()
  courier?: string;

  @ApiPropertyOptional({
    example: 'CID-94827103',
    description: 'Consignment tracking number from the courier service',
  })
  @IsString()
  @IsOptional()
  trackingNumber?: string;

  @ApiPropertyOptional({
    example: 'Handed over to Pathao delivery hub for final dispatch',
    description: 'Optional audit note to record in the order timeline',
  })
  @IsString()
  @IsOptional()
  note?: string;
}
