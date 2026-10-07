import { Module } from '@nestjs/common';
import { CategoryModule } from './category/category.module';
import { BrandModule } from './brand/brand.module';
import { CollectionModule } from './collection/collection.module';
import { ProductModule } from './product/product.module';
import { InventoryModule } from './inventory/inventory.module';
import { ThemeModule } from './theme/theme.module';
import { DiscountModule } from './discount/discount.module';
import { OrderModule } from './order/order.module';
import { CustomerModule } from './customer/customer.module';
import { ReturnModule } from './return/return.module';
import { ReviewModule } from './review/review.module';

@Module({
  imports: [
    CategoryModule,
    BrandModule,
    CollectionModule,
    ProductModule,
    InventoryModule,
    ThemeModule,
    DiscountModule,
    OrderModule,
    CustomerModule,
    ReturnModule,
    ReviewModule,
  ],
  exports: [
    CategoryModule,
    BrandModule,
    CollectionModule,
    ProductModule,
    InventoryModule,
    ThemeModule,
    DiscountModule,
    OrderModule,
    CustomerModule,
    ReturnModule,
    ReviewModule,
  ],
})
export class OwnerModule {}


