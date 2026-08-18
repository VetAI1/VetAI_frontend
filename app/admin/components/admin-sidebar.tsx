'use client';

import {
  ArrowLeft,
  CreditCard,
  LayoutDashboard,
  Menu,
  Moon,
  Settings,
  ShieldCheck,
  Sun,
  Users,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { useTheme } from '@/contexts/theme-context';
import { useAuth } from '@/infra/auth-context';
import type { Permission } from '@/types/permissions';

const items: Array<{
  href: string;
  icon: typeof LayoutDashboard;
  label: string;
  permission?: Permission;
}> = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  {
    href: '/admin/subscription',
    icon: CreditCard,
    label: 'Plano & Assinatura',
    permission: 'billing:view',
  },
  {
    href: '/admin/collaborators',
    icon: Users,
    label: 'Colaboradores',
    permission: 'collaborators:view',
  },
  {
    href: '/admin/roles',
    icon: ShieldCheck,
    label: 'Papel administrativo',
    permission: 'roles:view',
  },
  {
    href: '/admin/settings',
    icon: Settings,
    label: 'Configurações da clínica',
    permission: 'settings:view',
  },
];

const footerItemClassName =
  'flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md w-full text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground';

export function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { can } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden print:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-card border border-border shadow-lg"
      >
        {isOpen ? (
          <X size={24} className="text-foreground" />
        ) : (
          <Menu size={24} className="text-foreground" />
        )}
      </button>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-black/50 z-40"
        />
      )}

      <aside
        className={`fixed md:relative print:hidden z-40 flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-sidebar-border">
          <div className="flex items-center">
            <ShieldCheck className="text-primary mr-2" />
            <span className="font-bold text-lg tracking-tight text-sidebar-foreground">VetAI</span>
          </div>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
            ADMIN
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const isDisabled = item.permission ? !can(item.permission) : false;

            const className = `w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
              isDisabled
                ? 'text-muted-foreground/40 cursor-not-allowed opacity-60'
                : isActive
                  ? 'bg-sidebar-accent font-semibold text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
            }`;

            const content = (
              <>
                <Icon size={20} className={isActive ? 'text-primary' : ''} /> {item.label}
              </>
            );

            if (isDisabled) {
              return (
                <span
                  key={item.href}
                  className={className}
                  aria-disabled="true"
                >
                  {content}
                </span>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={className}
              >
                {content}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-2">
          <button onClick={toggleTheme} className={footerItemClassName}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          </button>
          <Link
            href="/analytics/dashboard"
            onClick={() => setIsOpen(false)}
            className={footerItemClassName}
          >
            <ArrowLeft size={18} /> Voltar para o sistema
          </Link>
        </div>
      </aside>
    </>
  );
}
