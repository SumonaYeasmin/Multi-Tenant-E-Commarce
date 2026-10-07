import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { LogSearchDto } from './dto/log-search.dto';

@ApiTags('(Customer) Search')
@Controller('customer/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post('log')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Log customer search query for analytics and inventory demand detection',
  })
  @ApiResponse({ status: 200, description: 'Search logged successfully' })
  async logSearch(
    @Body() dto: LogSearchDto,
    @Headers('x-tenant-id') tenantHeader?: string,
  ) {
    return this.searchService.logSearch(dto, tenantHeader);
  }
}
