import {
  PrismaClient,
  UserRole,
  UserStatus,
  CustomerSegment,
  OrderStatus,
  FulfillmentStatus,
  PaymentStatus,
  PaymentMethod,
  OrderChannel,
  ReviewStatus,
} from '../generated/client';
import * as bcrypt from 'bcrypt';

export async function seedCustomers(prisma: PrismaClient) {
  const customerEmail = process.env.CUSTOMER_EMAIL || 'customer@gmail.com';
  const customerPassword = process.env.CUSTOMER_PASSWORD || '123456';
  const customerName = process.env.CUSTOMER_NAME || 'Demo Customer';
  const customerPhone = process.env.CUSTOMER_PHONE || '01711000000';

  const hashedPassword = await bcrypt.hash(customerPassword, 10);

  const tenant = await prisma.tenant.findUnique({
    where: { slug: 'tanti' },
  });

  if (!tenant) {
    console.log('Tenant "tanti" not found, skipping customer seed.');
    return;
  }

  // 1. Upsert Customer User
  const user = await prisma.user.upsert({
    where: { email: customerEmail },
    update: {
      name: customerName,
      phone: customerPhone,
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
    },
    create: {
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      password: hashedPassword,
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
    },
  });

  // Clean up any other test users if needed
  await prisma.user.deleteMany({
    where: {
      email: 'tanvir@gmail.com',
      role: UserRole.CUSTOMER,
    },
  }).catch(() => { });

  // 2. Upsert Customer Profile with VIP segment and store credit
  const profile = await prisma.customerProfile.upsert({
    where: {
      tenantId_email: {
        tenantId: tenant.id,
        email: customerEmail,
      },
    },
    update: {
      userId: user.id,
      name: customerName,
      phone: customerPhone,
      district: 'Dhaka',
      segment: CustomerSegment.VIP,
      ordersCount: 3,
      totalSpent: 21500,
      storeCredit: 500,
      tags: ['VIP', 'Repeat Buyer', 'Festive Collection'],
      marketingConsent: true,
      isActive: true,
    },
    create: {
      tenantId: tenant.id,
      userId: user.id,
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      district: 'Dhaka',
      segment: CustomerSegment.VIP,
      ordersCount: 3,
      totalSpent: 21500,
      storeCredit: 500,
      tags: ['VIP', 'Repeat Buyer', 'Festive Collection'],
      marketingConsent: true,
      isActive: true,
    },
  });

  // 3. Addresses: Home (default) and Office
  await prisma.customerAddress.deleteMany({
    where: { customerProfileId: profile.id },
  });

  await prisma.customerAddress.createMany({
    data: [
      {
        customerProfileId: profile.id,
        label: 'Home',
        name: customerName,
        phone: customerPhone,
        line1: 'House 42, Road 9/A, Dhanmondi',
        area: 'Dhanmondi',
        district: 'Dhaka',
        isDefaultShipping: true,
        isDefaultBilling: true,
      },
      {
        customerProfileId: profile.id,
        label: 'Office',
        name: customerName,
        phone: customerPhone,
        line1: 'Level 7, Concord Tower, 12 Kemal Ataturk Avenue',
        area: 'Banani',
        district: 'Dhaka',
        isDefaultShipping: false,
        isDefaultBilling: false,
      },
    ],
  });

  // 4. Fetch sample products from tenant for realistic relations
  const sampleProducts = await prisma.product.findMany({
    where: { tenantId: tenant.id },
    include: { variants: true, images: true },
    take: 4,
  });

  if (sampleProducts.length >= 2) {
    const p1 = sampleProducts[0];
    const p2 = sampleProducts[1];
    const p3 = sampleProducts[2] || sampleProducts[0];

    // 5. Wishlist Items
    await prisma.wishlistItem.deleteMany({
      where: { customerId: profile.id },
    });

    await prisma.wishlistItem.createMany({
      data: [
        {
          tenantId: tenant.id,
          customerId: profile.id,
          productId: p1.id,
        },
        {
          tenantId: tenant.id,
          customerId: profile.id,
          productId: p2.id,
        },
      ],
      skipDuplicates: true,
    });

    // 6. Active Shopping Cart
    await prisma.cart.deleteMany({
      where: { customerId: profile.id },
    });

    const cart = await prisma.cart.create({
      data: {
        tenantId: tenant.id,
        customerId: profile.id,
      },
    });

    if (p1.variants?.[0]) {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: p1.id,
          variantId: p1.variants[0].id,
          qty: 1,
        },
      });
    }

    // 7. Verified Product Reviews
    await prisma.review.deleteMany({
      where: { customerId: profile.id },
    });

    await prisma.review.create({
      data: {
        tenantId: tenant.id,
        productId: p1.id,
        customerId: profile.id,
        author: customerName,
        rating: 5,
        title: 'Outstanding fabric quality and fitting!',
        body: 'The traditional handloom weaving texture is genuinely premium. Delivered right on time. Highly recommended!',
        verified: true,
        status: ReviewStatus.PUBLISHED,
        helpful: 12,
      },
    });

    // 8. Realistic Orders for this Customer
    const ordersData = [
      {
        number: 'ORD-2026-9001',
        total: 8500,
        subtotal: 8400,
        shipping: 100,
        status: OrderStatus.DELIVERED,
        fulfillmentStatus: FulfillmentStatus.FULFILLED,
        paymentStatus: PaymentStatus.PAID,
        paymentMethod: PaymentMethod.BKASH,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        product: p1,
      },
      {
        number: 'ORD-2026-9002',
        total: 7800,
        subtotal: 7700,
        shipping: 100,
        status: OrderStatus.SHIPPED,
        fulfillmentStatus: FulfillmentStatus.FULFILLED,
        paymentStatus: PaymentStatus.PAID,
        paymentMethod: PaymentMethod.SSLCOMMERZ,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        product: p2,
      },
      {
        number: 'ORD-2026-9003',
        total: 5200,
        subtotal: 5100,
        shipping: 100,
        status: OrderStatus.PROCESSING,
        fulfillmentStatus: FulfillmentStatus.UNFULFILLED,
        paymentStatus: PaymentStatus.PENDING,
        paymentMethod: PaymentMethod.COD,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        product: p3,
      },
    ];

    for (const ord of ordersData) {
      const existing = await prisma.order.findUnique({
        where: {
          tenantId_number: {
            tenantId: tenant.id,
            number: ord.number,
          },
        },
      });

      if (existing) {
        await prisma.order.delete({ where: { id: existing.id } });
      }

      await prisma.order.create({
        data: {
          tenantId: tenant.id,
          number: ord.number,
          customerId: profile.id,
          customerName: customerName,
          phone: customerPhone,
          email: customerEmail,
          subtotal: ord.subtotal,
          total: ord.total,
          shipping: ord.shipping,
          discount: 0,
          tax: 0,
          refunded: 0,
          status: ord.status,
          fulfillmentStatus: ord.fulfillmentStatus,
          paymentStatus: ord.paymentStatus,
          paymentMethod: ord.paymentMethod,
          channel: OrderChannel.ONLINE,
          shippingMethod: 'Express Home Delivery',
          createdAt: ord.createdAt,
          updatedAt: ord.createdAt,
          shippingAddress: {
            create: {
              name: customerName,
              phone: customerPhone,
              line1: 'House 42, Road 9/A',
              area: 'Dhanmondi',
              district: 'Dhaka',
            },
          },
          items: {
            create: [
              {
                productId: ord.product.id,
                variantId: ord.product.variants?.[0]?.id ?? null,
                title: ord.product.title,
                sku: ord.product.variants?.[0]?.sku || `SKU-${ord.product.id.slice(0, 6)}`,
                price: ord.product.variants?.[0]?.price || 3500,
                qty: 2,
                image: ord.product.images?.[0]?.url ?? null,
              },
            ],
          },
        },
      });
    }
  }

  // 9. In-App Notifications for this customer
  await prisma.notification.deleteMany({
    where: { userId: user.id },
  });

  await prisma.notification.createMany({
    data: [
      {
        tenantId: tenant.id,
        userId: user.id,
        title: 'Welcome to Tanti Fashion!',
        message: 'Your VIP account is active. Enjoy ৳500 store credit on your next order.',
        type: 'SYSTEM',
        link: '/account/profile',
        isRead: false,
      },
      {
        tenantId: tenant.id,
        userId: user.id,
        title: 'Order Delivered: #ORD-2026-9001',
        message: 'Your package has been successfully delivered by RedX Courier.',
        type: 'ORDER',
        link: '/account/orders',
        isRead: true,
      },
    ],
  });

  // 10. Sample Support Ticket
  await prisma.supportTicket.deleteMany({
    where: { customerId: profile.id },
  });

  const ticket = await prisma.supportTicket.create({
    data: {
      tenantId: tenant.id,
      customerId: profile.id,
      orderNumber: 'ORD-2026-9002',
      subject: 'Inquiry about estimated delivery date',
      status: 'resolved',
      messages: {
        create: [
          {
            from: 'customer',
            name: customerName,
            text: 'Hello, could you please let me know when my order #ORD-2026-9002 will arrive?',
          },
          {
            from: 'agent',
            name: 'Tanti Support Team',
            text: 'Hello Tanvir, your parcel has already been dispatched via Pathao Express and should arrive by tomorrow afternoon.',
          },
        ],
      },
    },
  });

  console.log(`✅ Seeded rich demo customer data for: ${customerEmail} (Password: 123456)`);
}
