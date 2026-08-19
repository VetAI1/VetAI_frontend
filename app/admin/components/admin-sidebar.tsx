'use client';

import { CreditCard, LayoutDashboard, Menu, Settings, ShieldCheck, Users, X } from 'lucide-react';
import { useState } from 'react';

import type { NavItem } from '@/app/components/layout/navigation';
import { Sidebar } from '@/app/components/layout/sidebar';

const items: NavItem[] = [
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

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-50 rounded-lg border border-border bg-card p-2 shadow-lg print:hidden md:hidden"
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
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
        />
      )}

      <Sidebar
        variant="admin"
        items={items}
        homeHref="/admin/dashboard"
        onNavigate={() => setIsOpen(false)}
        className={`fixed z-40 flex transition-transform duration-300 md:relative ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      />
    </>
  );
}
