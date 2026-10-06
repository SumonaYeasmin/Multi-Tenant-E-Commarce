import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CustomerSegment } from '../../../../../prisma/generated/client';

export class QueryCustomerDto {
  @ApiPropertyOptional({ description: 'Search by name, email, phone, or tags' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: CustomerSegment, description: 'Filter by customer segment' })
  @IsOptional()
  @IsEnum(CustomerSegment)
  segment?: CustomerSegment;

  @ApiPropertyOptional({ description: 'Filter by district' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 50;

  @ApiPropertyOptional({ description: 'Field to sort by', default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], description: 'Sort direction', default: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
