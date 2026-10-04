import {
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { QueryCartDto } from './dto/query-cart.dto';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('(Customer) Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get or initialize shopping cart for customer or guest visitor',
  })
  @ApiResponse({
    status: 200,
    description: 'Cart retrieved successfully',
  })
  async getCart(
    @Query() query: QueryCartDto,
    @Headers('x-session-token') sessionHeader?: string,
    @CurrentUser() user?: any,
  ) {
    return this.cartService.getCart(
      query,
      user?.id || user?.sub,
      sessionHeader,
    );
  }
}
