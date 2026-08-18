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
        <div className="flex h-screen overflow-hidden bg-background">
          <AdminSidebar />
          <main className="flex-1 overflow-y-auto bg-background p-6">
            {children}
          </main>
        </div>
      </TooltipProvider>
    </AuthGuard>
  );
}
