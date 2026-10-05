import { Module } from '@nestjs/common';
import { CartModule } from './cart/cart.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { AddressModule } from './address/address.module';

@Module({
  imports: [
    CartModule,
    WishlistModule,
    AddressModule,
  ],
  exports: [
    CartModule,
    WishlistModule,
    AddressModule,
  ],
})
export class CustomerModule {}
