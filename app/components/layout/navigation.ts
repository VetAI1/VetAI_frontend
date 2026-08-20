import {
  BookOpen,
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  MessageCircleQuestionMark,
  Microscope,
  PawPrint,
  Pill,
  Settings,
  ShieldCheck,
  SquareActivity,
  Syringe,
  Users,
} from 'lucide-react';

import type { Permission } from '@/types/permissions';

export interface NavItem {
  href: string;
  icon: typeof LayoutDashboard;
  label: string;
  shortLabel?: string;
  permission?: Permission;
  badge?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/analytics/dashboard', icon: LayoutDashboard, label: 'Dashboard', shortLabel: 'Dashboard' },
  { href: '/exams', icon: Microscope, label: 'Exames', shortLabel: 'Exames', permission: 'exams:view' },
  {
    href: '/patients',
    icon: PawPrint,
    label: 'Pacientes',
    shortLabel: 'Pacientes',
    permission: 'patients:view',
  },
  {
    href: '/tutors',
    icon: Users,
    label: 'Tutores',
    shortLabel: 'Tutores',
    permission: 'tutors:view',
  },
  {
    href: '/vaccines',
    icon: Syringe,
    label: 'Vacinas',
    shortLabel: 'Vacinas',
    permission: 'vaccines:view',
  },
  { href: '/medicines', icon: Pill, label: 'Medicações', shortLabel: 'Medicações' },
  {
    href: '/schedule',
    icon: CalendarDays,
    label: 'Agendamentos',
    shortLabel: 'Agenda',
    permission: 'schedule:view',
  },
  { href: '/payments', icon: CreditCard, label: 'Pagamentos', shortLabel: 'Pagamentos' },
  { href: '/catalog', icon: BookOpen, label: 'Catálogo', shortLabel: 'Catálogo' },
  {
    href: '/monitoring',
    icon: SquareActivity,
    label: 'Internação',
    shortLabel: 'Internação',
    permission: 'monitoring:view',
  },
  {
    href: '/consultation',
    icon: MessageCircleQuestionMark,
    label: 'Consulta',
    shortLabel: 'Consulta',
    permission: 'consultation:view',
    badge: 'BETA',
  },
  {
    href: '/settings',
    icon: Settings,
    label: 'Configurações',
    shortLabel: 'Config.',
    permission: 'settings:view',
  },
  { href: '/admin/dashboard', icon: ShieldCheck, label: 'Administrativo', shortLabel: 'Admin' },
];

export const MOBILE_ESSENTIALS: NavItem[] = [
  NAV_ITEMS[0]!,
  NAV_ITEMS[1]!,
  NAV_ITEMS[2]!,
  NAV_ITEMS[6]!,
];

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard', shortLabel: 'Dashboard' },
  {
    href: '/admin/subscription',
    icon: CreditCard,
    label: 'Plano & Assinatura',
    shortLabel: 'Plano',
    permission: 'billing:view',
  },
  {
    href: '/admin/collaborators',
    icon: Users,
    label: 'Colaboradores',
    shortLabel: 'Equipe',
    permission: 'collaborators:view',
  },
  {
    href: '/admin/roles',
    icon: ShieldCheck,
    label: 'Papel administrativo',
    shortLabel: 'Cargos',
    permission: 'roles:view',
  },
  {
    href: '/admin/settings',
    icon: Settings,
    label: 'Configurações da clínica',
    shortLabel: 'Config.',
    permission: 'settings:view',
  },
];

export const ADMIN_MOBILE_ESSENTIALS: NavItem[] = [
  ADMIN_NAV_ITEMS[0]!,
  ADMIN_NAV_ITEMS[1]!,
  ADMIN_NAV_ITEMS[2]!,
  ADMIN_NAV_ITEMS[4]!,
];
