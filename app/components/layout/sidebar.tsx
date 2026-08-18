'use client';

import { LogOut, Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { NAV_ITEMS, type NavItem } from './navigation';
import { NotificationBell } from './notification-bell';

import { BrandLogo } from '@/app/components/brand/brand-logo';
import { useTheme } from '@/contexts/theme-context';
import { useAuth } from '@/infra/auth-context';
import { cn } from '@/infra/utils';

function NavLink({
  item,
  isActive,
  isDisabled,
}: {
  item: NavItem;
  isActive: boolean;
  isDisabled: boolean;
}) {
  const Icon = item.icon;

  const className = cn(
    'group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isDisabled
      ? 'cursor-not-allowed text-muted-foreground/40'
      : isActive
        ? 'bg-sidebar-accent font-semibold text-sidebar-accent-foreground'
        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
  );

  const content = (
    <>
      <Icon
        size={18}
        className={cn(
          'shrink-0 transition-colors',
          isActive && 'text-primary',
        )}
      />
      <span className="truncate">{item.label}</span>
      {item.badge && (
        <span className="ml-auto rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
          {item.badge}
        </span>
      )}
    </>
  );

  if (isDisabled) {
    return (
      <span key={item.href} className={className} aria-disabled="true">
        {content}
      </span>
    );
  }

  return (
    <Link key={item.href} href={item.href} className={className}>
      {content}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { logout, can } = useAuth();

  async function handleLogout() {
    await logout();
    router.push('/login');
  }

  return (
    <aside className="hidden md:flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar print:hidden">
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
        <Link href="/analytics/dashboard" aria-label="VetAI - início">
          <BrandLogo />
        </Link>
        <NotificationBell />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            isActive={
              pathname === item.href || pathname.startsWith(`${item.href}/`)
            }
            isDisabled={item.permission ? !can(item.permission) : false}
          />
        ))}
      </nav>

      <div className="space-y-1 border-t border-sidebar-border p-3">
        <button
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
        </button>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut size={18} /> Sair
        </button>
      </div>
    </aside>
  );
}
