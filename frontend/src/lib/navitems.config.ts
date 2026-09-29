export interface NavChildItem {
  title: string;
  href: string;
  badge?: number | string;
}

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  category?: string;
  badge?: number | string;
  end?: boolean;
  children?: NavChildItem[];
}

export const adminNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: 'LayoutDashboard',
    category: '',
    end: true,
  },
  // Sales
  {
    title: 'Orders',
    href: '/admin/orders',
    icon: 'ShoppingCart',
    category: 'Sales',
    badge: 5,
    children: [
      { title: 'Draft orders', href: '/admin/orders/drafts' },
      { title: 'Abandoned checkouts', href: '/admin/orders/abandoned' },
    ],
  },
  {
    title: 'Returns & refunds',
    href: '/admin/returns',
    icon: 'RotateCcw',
    category: 'Sales',
    badge: 2,
  },
  {
    title: 'Payments',
    href: '/admin/payments',
    icon: 'CreditCard',
    category: 'Sales',
  },
  // Catalog
  {
    title: 'Products',
    href: '/admin/products',
    icon: 'Tag',
    category: 'Catalog',
    children: [
      { title: 'Import / export', href: '/admin/products/import' },
    ],
  },
  {
    title: 'Categories',
    href: '/admin/categories',
    icon: 'FolderTree',
    category: 'Catalog',
  },
  {
    title: 'Collections',
    href: '/admin/collections',
    icon: 'Layers',
    category: 'Catalog',
  },
  {
    title: 'Brands',
    href: '/admin/brands',
    icon: 'Award',
    category: 'Catalog',
  },
  {
    title: 'Inventory',
    href: '/admin/inventory',
    icon: 'Warehouse',
    category: 'Catalog',
  },
  // Customers
  {
    title: 'Customers',
    href: '/admin/customers',
    icon: 'Users',
    category: 'Customers',
  },
  {
    title: 'Reviews',
    href: '/admin/reviews',
    icon: 'Star',
    category: 'Customers',
    badge: 3,
  },
  // Growth
  {
    title: 'Discounts',
    href: '/admin/discounts',
    icon: 'Percent',
    category: 'Growth',
  },
  {
    title: 'Marketing',
    href: '/admin/marketing',
    icon: 'Megaphone',
    category: 'Growth',
  },
  {
    title: 'Shipping',
    href: '/admin/shipping',
    icon: 'Truck',
    category: 'Growth',
  },
  // Online store
  {
    title: 'Theme',
    href: '/admin/theme',
    icon: 'Palette',
    category: 'Online store',
  },
  {
    title: 'Pages, blog & menus',
    href: '/admin/content',
    icon: 'FileText',
    category: 'Online store',
  },
  {
    title: 'Media',
    href: '/admin/media',
    icon: 'Image',
    category: 'Online store',
  },
  {
    title: 'SEO & redirects',
    href: '/admin/seo',
    icon: 'Search',
    category: 'Online store',
  },
  {
    title: 'Domains',
    href: '/admin/domains',
    icon: 'Globe',
    category: 'Online store',
  },
  // Insights
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: 'BarChart3',
    category: 'Insights',
  },
  {
    title: 'Reports',
    href: '/admin/reports',
    icon: 'FileSpreadsheet',
    category: 'Insights',
  },
  // Administration
  {
    title: 'Staff & roles',
    href: '/admin/staff',
    icon: 'Shield',
    category: 'Administration',
  },
  {
    title: 'Notifications',
    href: '/admin/notifications',
    icon: 'Bell',
    category: 'Administration',
  },
  {
    title: 'Integrations & API',
    href: '/admin/integrations',
    icon: 'Plug',
    category: 'Administration',
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: 'Settings',
    category: 'Administration',
  },
  {
    title: 'Audit logs',
    href: '/admin/audit',
    icon: 'ScrollText',
    category: 'Administration',
  },
  {
    title: 'Plan & billing',
    href: '/admin/billing',
    icon: 'Gem',
    category: 'Administration',
  },
];

export function getNavItemsByRole(): NavItem[] {
  return adminNavItems;
}
