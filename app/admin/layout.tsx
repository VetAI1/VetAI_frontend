import type { Metadata } from 'next';

import { AdminSidebar } from './components/admin-sidebar';

import { AuthGuard } from '@/app/components/layout/auth-guard';
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
        <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-900">
          <AdminSidebar />
          <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-slate-900">
            {children}
          </main>
        </div>
      </TooltipProvider>
    </AuthGuard>
  );
}
