'use client';

import { ADMIN_NAV_ITEMS } from '@/app/components/layout/navigation';
import { Sidebar } from '@/app/components/layout/sidebar';

export function AdminSidebar() {
  return (
    <Sidebar
      variant="admin"
      items={ADMIN_NAV_ITEMS}
      homeHref="/admin/dashboard"
    />
  );
}
