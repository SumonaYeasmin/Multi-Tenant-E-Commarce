import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { QueryCartDto } from './dto/query-cart.dto';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { ResponseHelper } from '../../../common/helpers/response.helper';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * ধাপ ১.১: কার্ট তৈরি করা অথবা বিদ্যমান কার্ট খুঁজে নেওয়া (Get or Create Cart)
   */
  async getOrCreateCart(
    tenantId: string,
    customerId?: string,
    sessionToken?: string,
  ) {
    let cart = null;

    // ১. লগইন করা কাস্টমারের কার্ট খোঁজা
    if (customerId) {
      cart = await this.prisma.cart.findFirst({
        where: {
          tenantId,
          customerId,
        },
      });
    }

    // ২. গেস্ট ইউজারের সেশন টোকেন দিয়ে কার্ট খোঁজা
    if (!cart && sessionToken) {
      cart = await this.prisma.cart.findFirst({
        where: {
          tenantId,
          sessionToken,
        },
      });
    }

    // ৩. কার্ট না থাকলে ডাটাবেজে নতুন কার্ট তৈরি করা
    if (!cart) {
      const activeSessionToken =
        sessionToken ||
        `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      cart = await this.prisma.cart.create({
        data: {
          tenantId,
          customerId: customerId || null,
          sessionToken: customerId ? null : activeSessionToken,
        },
      });
    }

    return cart;
  }

  /**
   * ধাপ ১.২: কার্টের সম্পূর্ণ ডাটা ও আইটেম ফেচ করা (Fetch / Get Cart)
   */
  async getCart(
    query?: QueryCartDto,
    customerId?: string,
    sessionTokenHeader?: string,
  ) {
    const targetTenantId =
      query?.tenantId || 'e0f8bdb1-da0a-4907-9d82-08ef1be77ac2';
    const activeSessionToken = query?.sessionToken || sessionTokenHeader;

    // কার্ট নিশ্চিত করা (না থাকলে তৈরি হবে)
    const activeCart = await this.getOrCreateCart(
      targetTenantId,
      customerId,
      activeSessionToken,
    );

    // কার্ট এবং সংশ্লিষ্ট আইটেম, প্রোডাক্ট ও ভ্যারিয়েন্ট ডাটাবেজ থেকে ফেচ করা
    const cart = await this.prisma.cart.findUnique({
      where: { id: activeCart.id },
      include: {
        items: {
          orderBy: { createdAt: 'desc' },
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
                price: true,
                salePrice: true,
                preorder: true,
                images: {
                  where: { isCover: true },
                  take: 1,
                  select: { url: true, alt: true },
                },
              },
            },
            variant: {
              select: {
                id: true,
                sku: true,
                color: true,
                colorHex: true,
                size: true,
                price: true,
                salePrice: true,
                stock: true,
                reserved: true,
                enabled: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return ResponseHelper.success(null, 'Cart not found');
    }

    // সাবটোটাল ও আইটেম সংখ্যা হিসাব
    let subtotal = 0;
    let totalItemsCount = 0;

    const formattedItems = cart.items.map((item) => {
      const unitPrice = Number(
        item.variant?.salePrice ??
          item.variant?.price ??
          item.product?.salePrice ??
          item.product?.price ??
          0,
      );
      const lineTotal = unitPrice * item.qty;
      const availableStock = Math.max(
        0,
        (item.variant?.stock ?? 0) - (item.variant?.reserved ?? 0),
      );

      if (!item.savedForLater) {
        subtotal += lineTotal;
        totalItemsCount += item.qty;
      }

      return {
        ...item,
        unitPrice,
        lineTotal,
        availableStock,
        isOutOfStock: !item.product.preorder && availableStock === 0,
        isLimitedStock:
          !item.product.preorder &&
          availableStock > 0 &&
          item.qty > availableStock,
      };
    });

    const result = {
      id: cart.id,
      tenantId: cart.tenantId,
      customerId: cart.customerId,
      sessionToken: cart.sessionToken,
      subtotal,
      totalItemsCount,
      items: formattedItems,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };

    return ResponseHelper.success(
      result,
      'Cart retrieved successfully',
    );
  }

  /**
   * ধাপ ১.৩: কার্টে প্রোডাক্ট/ভ্যারিয়েন্ট যোগ করা (Add to Cart)
   */
  async addToCart(
    dto: AddToCartDto,
    customerId?: string,
    sessionTokenHeader?: string,
  ) {
    let targetTenantId = dto.tenantId;
    if (!targetTenantId) {
      const activeTenant = await this.prisma.tenant.findFirst({
        where: { deletedAt: null },
        orderBy: { createdAt: 'asc' },
      });
      targetTenantId = activeTenant?.id || 'e0f8bdb1-da0a-4907-9d82-08ef1be77ac2';
    }

    const activeSessionToken = dto.sessionToken || sessionTokenHeader;

    // ১. কার্ট নিশ্চিত করা
    const cart = await this.getOrCreateCart(
      targetTenantId,
      customerId,
      activeSessionToken,
    );

    // ২. বিদ্যমান আইটেম খোঁজা
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: dto.productId,
        variantId: dto.variantId,
        savedForLater: false,
      },
    });

    const addQty = Math.max(1, dto.qty || 1);

    if (existingItem) {
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          qty: existingItem.qty + addQty,
        },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: dto.productId,
          variantId: dto.variantId,
          qty: addQty,
        },
      });
    }

    // আপডেটেড কার্ট ডাটা রিটার্ন
    return this.getCart(
      { tenantId: targetTenantId, sessionToken: cart.sessionToken || undefined },
      customerId,
      activeSessionToken,
    );
  }
}
