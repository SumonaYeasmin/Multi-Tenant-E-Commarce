import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BrandService } from './brand.service';

@ApiTags('(Owner) Brands')
@Controller('brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}
}
