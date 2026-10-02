import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CollectionService } from './collection.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('(Owner) Collections')
@Controller('collections')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new collection' })
  @ApiResponse({ status: 201, description: 'Collection created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  @ApiResponse({ status: 409, description: 'Collection slug already exists' })
  async create(
    @Body() dto: CreateCollectionDto,
    @CurrentUser() user?: any,
  ) {
    return this.collectionService.create(dto, user?.tenantId);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an existing collection by ID or Slug' })
  @ApiResponse({ status: 200, description: 'Collection updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'Collection not found' })
  @ApiResponse({ status: 409, description: 'Collection slug already in use' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCollectionDto,
    @CurrentUser() user?: any,
  ) {
    return this.collectionService.update(id, dto, user?.tenantId);
  }
}
