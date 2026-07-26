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
        <div className="flex h-screen overflow-hidden">
          <AdminSidebar />
          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-teal-50 p-6 dark:from-slate-950 dark:via-slate-950 dark:to-teal-950/20">
            {children}
          </main>
        </div>
      </TooltipProvider>
    </AuthGuard>
  );
}
