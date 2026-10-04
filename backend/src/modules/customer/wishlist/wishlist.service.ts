import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { QueryWishlistDto } from './dto/query-wishlist.dto';
import { ResponseHelper } from '../../../common/helpers/response.helper';

@Injectable()
export class WishlistService {
  private readonly logger = new Logger(WishlistService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * কাস্টমার প্রোফাইল আইডি খুঁজে বের করা (User ID অথবা Customer ID দিয়ে)
   */
  private async resolveCustomerId(
    userIdOrCustomerId: string,
    tenantId: string,
  ): Promise<string | null> {
    if (!userIdOrCustomerId) return null;

    // ১. সরাসরি CustomerProfile ID দিয়ে খোঁজা
    const profileById = await this.prisma.customerProfile.findFirst({
      where: {
        id: userIdOrCustomerId,
        tenantId,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (profileById) return profileById.id;

    // ২. Auth User ID দিয়ে CustomerProfile খোঁজা
    const profileByUserId = await this.prisma.customerProfile.findFirst({
      where: {
        userId: userIdOrCustomerId,
        tenantId,
        deletedAt: null,
      },
      select: { id: true },
    });

    return profileByUserId?.id || null;
  }

  /**
   * ইউজারের সেভ করা প্রোডাক্টগুলোর তালিকা নিয়ে আসা (Get User Wishlist Items)
   */
  async getWishlist(
    userIdOrCustomerId: string,
    query?: QueryWishlistDto,
  ) {
    const targetTenantId =
      query?.tenantId || 'e0f8bdb1-da0a-4907-9d82-08ef1be77ac2';
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 20;
    const skip = (page - 1) * limit;

    const customerId = await this.resolveCustomerId(
      userIdOrCustomerId,
      targetTenantId,
    );

    if (!customerId) {
      return ResponseHelper.paginated(
        [],
        ResponseHelper.buildPaginationMeta(0, page, limit),
        'No wishlist items found',
      );
    }

    // ১. মোট উইশলিস্ট আইটেম গণনা
    const total = await this.prisma.wishlistItem.count({
      where: {
        customerId,
        tenantId: targetTenantId,
      },
    });

    // ২. উইশলিস্ট আইটেম ও প্রোডাক্টের বিস্তারিত তথ্য ফেচ করা
    const items = await this.prisma.wishlistItem.findMany({
      where: {
        customerId,
        tenantId: targetTenantId,
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          include: {
            images: {
              orderBy: { order: 'asc' },
              select: {
                id: true,
                url: true,
                alt: true,
                isCover: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            brand: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            variants: {
              where: { enabled: true },
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
              },
            },
          },
        },
      },
    });

    // ৩. ফ্রন্টএন্ডের সুবিধার জন্য রেসপন্স ফরম্যাটিং
    const formattedData = items
      .filter((item) => item.product && !item.product.deletedAt)
      .map((item) => {
        const prod = item.product;
        const totalStock = prod.variants.reduce(
          (acc: number, v) => acc + Math.max(0, v.stock - v.reserved),
          0,
        );

        const cover =
          prod.images.find((img) => img.isCover)?.url ||
          prod.images[0]?.url ||
          null;

        return {
          wishlistItemId: item.id,
          savedAt: item.createdAt,
          product: {
            id: prod.id,
            title: prod.title,
            slug: prod.slug,
            shortDescription: prod.shortDescription,
            price: Number(prod.price),
            salePrice: prod.salePrice ? Number(prod.salePrice) : null,
            preorder: prod.preorder,
            isNew: prod.isNew,
            isBestseller: prod.isBestseller,
            rating: Number(prod.rating),
            reviewCount: prod.reviewCount,
            totalStock,
            inStock: prod.preorder || totalStock > 0,
            category: prod.category,
            brand: prod.brand,
            images: prod.images,
            coverImage: cover,
            variantsCount: prod.variants.length,
            availableSizes: Array.from(
              new Set(prod.variants.map((v) => v.size).filter(Boolean)),
            ),
            availableColors: Array.from(
              new Set(prod.variants.map((v) => v.color).filter(Boolean)),
            ),
          },
        };
      });

    const meta = ResponseHelper.buildPaginationMeta(total, page, limit);
    return ResponseHelper.paginated(
      formattedData,
      meta,
      'Wishlist items retrieved successfully',
    );
  }
}
