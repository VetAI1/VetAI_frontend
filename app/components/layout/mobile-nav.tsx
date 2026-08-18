'use client';

import { LogOut, Moon, MoreHorizontal, Sun, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

import { MOBILE_ESSENTIALS, NAV_ITEMS } from './navigation';

import { useTheme } from '@/contexts/theme-context';
import { useAuth } from '@/infra/auth-context';
import { cn } from '@/infra/utils';

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { logout, can } = useAuth();

  async function handleLogout() {
    setSheetOpen(false);
    await logout();
    router.push('/login');
  }

  const essentials = MOBILE_ESSENTIALS.filter(
    (item) => !item.permission || can(item.permission),
  );

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
      >
        {essentials.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex min-w-0 flex-1 flex-col items-center gap-1 px-2 py-2.5 text-[11px] font-medium transition-colors',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <span
                className={cn(
                  'grid h-8 w-14 place-items-center rounded-full transition-colors',
                  active && 'bg-primary/10',
                )}
              >
                <Icon size={20} />
              </span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setSheetOpen(true)}
          className="flex min-w-0 flex-1 flex-col items-center gap-1 px-2 py-2.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <span className="grid h-8 w-14 place-items-center rounded-full">
            <MoreHorizontal size={20} />
          </span>
          <span>Mais</span>
        </button>
      </nav>

      {sheetOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setSheetOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Todas as páginas"
            className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-card pb-[env(safe-area-inset-bottom)] shadow-[var(--shadow-card)] animate-in slide-in-from-bottom-6 duration-300"
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card/95 px-4 py-3 backdrop-blur-xl">
              <span className="text-sm font-bold text-foreground">
                Navegação
              </span>
              <button
                onClick={() => setSheetOpen(false)}
                aria-label="Fechar"
                className="grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-1 p-3">
              {NAV_ITEMS.filter(
                (item) => !item.permission || can(item.permission),
              ).map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSheetOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                      active
                        ? 'bg-sidebar-accent font-semibold text-sidebar-accent-foreground'
                        : 'text-foreground/80 hover:bg-muted',
                    )}
                  >
                    <Icon
                      size={18}
                      className={cn(active && 'text-primary')}
                    />
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="space-y-1 border-t border-border p-3">
              <button
                onClick={toggleTheme}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
              </button>
              <button
                onClick={() => {
                  void handleLogout();
                }}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                <LogOut size={18} /> Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
