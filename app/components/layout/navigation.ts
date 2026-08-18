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
  permission?: Permission;
  badge?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/analytics/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/exams', icon: Microscope, label: 'Exames', permission: 'exams:view' },
  {
    href: '/patients',
    icon: PawPrint,
    label: 'Pacientes',
    permission: 'patients:view',
  },
  {
    href: '/tutors',
    icon: Users,
    label: 'Tutores',
    permission: 'tutors:view',
  },
  {
    href: '/vaccines',
    icon: Syringe,
    label: 'Vacinas',
    permission: 'vaccines:view',
  },
  { href: '/medicines', icon: Pill, label: 'Medicações' },
  {
    href: '/schedule',
    icon: CalendarDays,
    label: 'Agendamentos',
    permission: 'schedule:view',
  },
  { href: '/payments', icon: CreditCard, label: 'Pagamentos' },
  { href: '/catalog', icon: BookOpen, label: 'Catálogo' },
  {
    href: '/monitoring',
    icon: SquareActivity,
    label: 'Internação',
    permission: 'monitoring:view',
  },
  {
    href: '/consultation',
    icon: MessageCircleQuestionMark,
    label: 'Consulta',
    permission: 'consultation:view',
    badge: 'BETA',
  },
  {
    href: '/settings',
    icon: Settings,
    label: 'Configurações',
    permission: 'settings:view',
  },
  { href: '/admin/dashboard', icon: ShieldCheck, label: 'Administrativo' },
];

export const MOBILE_ESSENTIALS: NavItem[] = [
  NAV_ITEMS[0]!,
  NAV_ITEMS[1]!,
  NAV_ITEMS[2]!,
  NAV_ITEMS[6]!,
];
