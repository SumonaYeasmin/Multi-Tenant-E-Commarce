import { Module } from '@nestjs/common';
import { CategoryModule } from './category/category.module';
import { BrandModule } from './brand/brand.module';
import { CollectionModule } from './collection/collection.module';
import { ProductModule } from './product/product.module';
import { InventoryModule } from './inventory/inventory.module';

@Module({
  imports: [
    CategoryModule,
    BrandModule,
    CollectionModule,
    ProductModule,
    InventoryModule,
  ],
  exports: [
    CategoryModule,
    BrandModule,
    CollectionModule,
    ProductModule,
    InventoryModule,
  ],
})
export class OwnerModule {}
