import type { Metadata } from 'next';

import { AdminSidebar } from './components/admin-sidebar';

import { AuthGuard } from '@/app/components/layout/auth-guard';
import { MobileNav } from '@/app/components/layout/mobile-nav';
import { TooltipProvider } from '@/components/ui/tooltip';

export const metadata: Metadata = {
  title: 'VetAI Admin',
  description: 'Administração da clínica',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <TooltipProvider>
        <div className="flex h-screen overflow-hidden bg-[oklch(0.985_0.01_95)] dark:bg-stone-950">
          <AdminSidebar />
          <main className="flex-1 overflow-y-auto bg-[oklch(0.985_0.01_95)] dark:bg-stone-950 p-6 pb-24 md:pb-6">
            {children}
          </main>
        </div>
        <MobileNav variant="admin" />
      </TooltipProvider>
    </AuthGuard>
  );
}
