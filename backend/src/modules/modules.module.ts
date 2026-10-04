import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './owner/category/category.module';
import { BrandModule } from './owner/brand/brand.module';
import { CollectionModule } from './owner/collection/collection.module';
import { ProductModule } from './owner/product/product.module';
import { InventoryModule } from './owner/inventory/inventory.module';
import { CartModule } from './customer/cart/cart.module';

@Module({
  imports: [
    AuthModule,
    CategoryModule,
    BrandModule,
    CollectionModule,
    ProductModule,
    InventoryModule,
    CartModule,
  ],
})
export class ModulesModule { }

