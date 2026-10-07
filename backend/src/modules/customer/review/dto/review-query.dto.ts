import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export class ReviewQueryDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    default: 1,
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of reviews per page',
    default: 20,
    example: 20,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Filter reviews by specific star rating (1 to 5)',
    example: 5,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @ApiPropertyOptional({
    description: 'Filter reviews that contain photos only',
    example: true,
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  withPhotosOnly?: boolean;

  @ApiPropertyOptional({
    description: 'Sort criteria for reviews',
    enum: ['recent', 'rating_high', 'rating_low', 'helpful'],
    default: 'recent',
    example: 'recent',
  })
  @IsIn(['recent', 'rating_high', 'rating_low', 'helpful'])
  @IsOptional()
  sortBy?: 'recent' | 'rating_high' | 'rating_low' | 'helpful' = 'recent';
}
