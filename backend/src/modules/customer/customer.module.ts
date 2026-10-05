import { Module } from '@nestjs/common';
import { CartModule } from './cart/cart.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { AddressModule } from './address/address.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    CartModule,
    WishlistModule,
    AddressModule,
    OrderModule,
  ],
  exports: [
    CartModule,
    WishlistModule,
    AddressModule,
    OrderModule,
  ],
})
export class CustomerModule {}

