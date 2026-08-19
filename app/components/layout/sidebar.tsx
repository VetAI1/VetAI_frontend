'use client';

import { LogOut, Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

import { NAV_ITEMS, type NavItem } from './navigation';
import { NotificationBell } from './notification-bell';

import { BrandLogo } from '@/app/components/brand/brand-logo';
import { useTheme } from '@/contexts/theme-context';
import { useAuth } from '@/infra/auth-context';
import { cn } from '@/infra/utils';

type SidebarVariant = 'default' | 'admin';

interface SidebarFooterClasses {
  item: string;
  destructiveItem: string;
}

interface SidebarProps {
  className?: string;
  header?: ReactNode;
  homeHref?: string;
  items?: NavItem[];
  onNavigate?: () => void;
  renderFooter?: (classes: SidebarFooterClasses) => ReactNode;
  variant?: SidebarVariant;
}

const sidebarStyles = {
  default: {
    background: 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900',
    active:
      'bg-teal-50 dark:bg-teal-900 font-semibold text-teal-800 dark:text-teal-300',
    disabled: 'cursor-not-allowed text-stone-500/40 dark:text-stone-400/40',
    iconActive: 'text-teal-800 dark:text-teal-500',
    inactive:
      'text-stone-900/70 dark:text-stone-100/70 hover:bg-teal-50/60 dark:hover:bg-teal-900/60 hover:text-stone-900 dark:hover:text-stone-100',
    footerItem:
      'text-stone-900/70 dark:text-stone-100/70 hover:bg-teal-50/60 dark:hover:bg-teal-900/60 hover:text-stone-900 dark:hover:text-stone-100',
    footerDestructive: 'text-red-600 dark:text-red-500 hover:bg-red-600/10 dark:hover:bg-red-500/10',
    headerBorder: 'border-stone-200 dark:border-stone-800',
  },
  admin: {
    background: 'border-teal-100 dark:border-teal-900 bg-teal-50 dark:bg-teal-950',
    active:
      'bg-teal-100 dark:bg-teal-900 font-semibold text-teal-900 dark:text-teal-100',
    disabled: 'cursor-not-allowed text-stone-900/40 dark:text-stone-100/40',
    iconActive: 'text-teal-800 dark:text-teal-300',
    inactive:
      'text-stone-900/75 dark:text-stone-100/75 hover:bg-teal-100/60 dark:hover:bg-teal-900/60 hover:text-stone-900 dark:hover:text-stone-100',
    footerItem:
      'text-stone-900/75 dark:text-stone-100/75 hover:bg-teal-100/60 dark:hover:bg-teal-900/60 hover:text-stone-900 dark:hover:text-stone-100',
    footerDestructive:
      'text-stone-900/75 dark:text-stone-100/75 hover:bg-teal-100/60 dark:hover:bg-teal-900/60 hover:text-stone-900 dark:hover:text-stone-100',
    headerBorder: 'border-teal-100 dark:border-teal-900',
  },
} as const;

function NavLink({
  item,
  isActive,
  isDisabled,
  onNavigate,
  variant,
}: {
  item: NavItem;
  isActive: boolean;
  isDisabled: boolean;
  onNavigate?: () => void;
  variant: SidebarVariant;
}) {
  const Icon = item.icon;
  const styles = sidebarStyles[variant];

  const className = cn(
    'group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isDisabled
      ? styles.disabled
      : isActive
        ? styles.active
        : styles.inactive,
  );

  const content = (
    <>
      <Icon
        size={18}
        className={cn(
          'shrink-0 transition-colors',
          isActive && styles.iconActive,
        )}
      />
      <span className="truncate">{item.label}</span>
      {item.badge && (
        <span className="ml-auto rounded-full bg-teal-800/10 dark:bg-teal-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-500">
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
    <Link
      key={item.href}
      href={item.href}
      className={className}
      {...(onNavigate ? { onClick: onNavigate } : {})}
    >
      {content}
    </Link>
  );
}

export function Sidebar({
  className,
  header,
  homeHref = '/analytics/dashboard',
  items = NAV_ITEMS,
  onNavigate,
  renderFooter,
  variant = 'default',
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { logout, can } = useAuth();
  const styles = sidebarStyles[variant];

  async function handleLogout() {
    await logout();
    router.push('/login');
  }

  const footerClasses = {
    item: cn(
      'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
      styles.footerItem,
    ),
    destructiveItem: cn(
      'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
      styles.footerDestructive,
    ),
  };

  return (
    <aside
      className={cn(
        'h-full w-64 shrink-0 flex-col border-r print:hidden',
        styles.background,
        className ?? 'hidden md:flex',
      )}
    >
      <div
        className={cn(
          'flex h-16 items-center justify-between border-b px-5',
          styles.headerBorder,
        )}
      >
        {header ?? (
          <>
            <Link href={homeHref} aria-label="VetAI - início">
              <BrandLogo />
            </Link>
            <NotificationBell />
          </>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            isActive={
              pathname === item.href || pathname.startsWith(`${item.href}/`)
            }
            isDisabled={item.permission ? !can(item.permission) : false}
            variant={variant}
            {...(onNavigate ? { onNavigate } : {})}
          />
        ))}
      </nav>

      <div className={cn('space-y-1 border-t p-3', styles.headerBorder)}>
        {renderFooter ? (
          renderFooter(footerClasses)
        ) : (
          <>
            <button onClick={toggleTheme} className={footerClasses.item}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
            </button>
            <button
              onClick={handleLogout}
              className={footerClasses.destructiveItem}
            >
              <LogOut size={18} /> Sair
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
