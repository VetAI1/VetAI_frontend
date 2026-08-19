import { AuthGuard } from '@/app/components/layout/auth-guard';
import { MobileNav } from '@/app/components/layout/mobile-nav';
import { Sidebar } from '@/app/components/layout/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <TooltipProvider>
        <div className="flex h-screen overflow-hidden bg-[oklch(0.985_0.01_95)] dark:bg-stone-950">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-[oklch(0.985_0.01_95)] dark:bg-stone-950 pb-24 md:pb-0">
            {children}
          </main>
        </div>
        <MobileNav />
      </TooltipProvider>
    </AuthGuard>
  );
}
