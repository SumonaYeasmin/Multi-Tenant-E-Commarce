import { Module } from '@nestjs/common';
import { CartModule } from './cart/cart.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { AddressModule } from './address/address.module';
import { OrderModule } from './order/order.module';
import { ReturnModule } from './return/return.module';
import { ReviewModule } from './review/review.module';
import { StoreModule } from './store/store.module';
import { CustomerSupportModule } from './support/support.module';

@Module({
  imports: [
    CartModule,
    WishlistModule,
    AddressModule,
    OrderModule,
    ReturnModule,
    ReviewModule,
    StoreModule,
    CustomerSupportModule,
  ],
  exports: [
    CartModule,
    WishlistModule,
    AddressModule,
    OrderModule,
    ReturnModule,
    ReviewModule,
    StoreModule,
    CustomerSupportModule,
  ],
})
export class CustomerModule {}

