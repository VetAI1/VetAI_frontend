'use client';

import { LogOut, Moon, MoreHorizontal, Sun, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

import {
  ADMIN_MOBILE_ESSENTIALS,
  ADMIN_NAV_ITEMS,
  MOBILE_ESSENTIALS,
  NAV_SECTIONS,
  type NavItem,
} from './navigation';

import { useTheme } from '@/contexts/theme-context';
import { useAuth } from '@/infra/auth-context';
import { cn } from '@/infra/utils';

interface MobileNavProps {
  essentials?: NavItem[];
  items?: NavItem[];
  variant?: 'default' | 'admin';
}

export function MobileNav({
  essentials,
  items,
  variant = 'default',
}: MobileNavProps = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { logout, can } = useAuth();

  // Mesmas divisões da sidebar. Uma lista plana recebida por prop (ou a
  // navegação administrativa) vira um único grupo sem título.
  const currentGroups: { title?: string; items: NavItem[] }[] = items
    ? [{ items }]
    : variant === 'admin'
      ? [{ items: ADMIN_NAV_ITEMS }]
      : NAV_SECTIONS;
  const currentEssentials =
    essentials ??
    (variant === 'admin' ? ADMIN_MOBILE_ESSENTIALS : MOBILE_ESSENTIALS);

  async function handleLogout() {
    setSheetOpen(false);
    await logout();
    router.push('/login');
  }

  const activeEssentials = currentEssentials.filter(
    (item) => !item.permission || can(item.permission),
  );

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
      >
        {activeEssentials.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 py-2 text-[10px] sm:text-[11px] font-medium transition-colors',
                active
                  ? 'text-teal-800 dark:text-teal-500'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100',
              )}
            >
              <span
                className={cn(
                  'grid h-8 w-12 sm:w-14 place-items-center rounded-full transition-colors',
                  active && 'bg-teal-800/10 dark:bg-teal-500/10',
                )}
              >
                <Icon size={20} />
              </span>
              <span className="w-full truncate px-0.5 text-center text-[10px] sm:text-[11px] leading-tight">
                {item.shortLabel ?? item.label}
              </span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 py-2 text-[10px] sm:text-[11px] font-medium text-stone-500 dark:text-stone-400 transition-colors hover:text-stone-900 dark:hover:text-stone-100"
        >
          <span className="grid h-8 w-12 sm:w-14 place-items-center rounded-full">
            <MoreHorizontal size={20} />
          </span>
          <span className="w-full truncate px-0.5 text-center text-[10px] sm:text-[11px] leading-tight">
            Mais
          </span>
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
            className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white dark:bg-stone-900 pb-[env(safe-area-inset-bottom)] shadow-[var(--shadow-card)] animate-in slide-in-from-bottom-6 duration-300"
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 px-4 py-3 backdrop-blur-xl">
              <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
                {variant === 'admin' ? 'Administração' : 'Navegação'}
              </span>
              <button
                onClick={() => setSheetOpen(false)}
                aria-label="Fechar"
                className="grid size-8 place-items-center rounded-md text-stone-500 dark:text-stone-400 transition-colors hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 p-3">
              {currentGroups.map((group, groupIndex) => {
                const visibleItems = group.items.filter(
                  (item) => !item.permission || can(item.permission),
                );
                if (visibleItems.length === 0) return null;

                return (
                  <div
                    key={group.title ?? groupIndex}
                    className="space-y-1"
                  >
                    {group.title && (
                      <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-stone-500/70 dark:text-stone-400/70">
                        {group.title}
                      </p>
                    )}
                    {visibleItems.map((item) => {
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
                              ? 'bg-teal-50 dark:bg-teal-900 font-semibold text-teal-800 dark:text-teal-300'
                              : 'text-stone-900/80 dark:text-stone-100/80 hover:bg-stone-100 dark:hover:bg-stone-800',
                          )}
                        >
                          <Icon
                            size={18}
                            className={cn(active && 'text-teal-800 dark:text-teal-500')}
                          />
                          <span className="truncate">{item.label}</span>
                          {item.badge && (
                            <span className="ml-auto rounded-full bg-teal-800/10 dark:bg-teal-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-500">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            <div className="space-y-1 border-t border-stone-200 dark:border-stone-800 p-3">
              <button
                onClick={toggleTheme}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-stone-900/80 dark:text-stone-100/80 transition-colors hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
              </button>
              {variant === 'admin' ? (
                <Link
                  href="/analytics/dashboard"
                  onClick={() => setSheetOpen(false)}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-stone-900/80 dark:text-stone-100/80 transition-colors hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  <LogOut size={18} /> Sair
                </Link>
              ) : (
                <button
                  onClick={() => {
                    void handleLogout();
                  }}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-500 transition-colors hover:bg-red-600/10 dark:hover:bg-red-500/10"
                >
                  <LogOut size={18} /> Sair
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
