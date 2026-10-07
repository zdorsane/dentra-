import {
  Activity,
  BrainCircuit,
  CalendarDays,
  ChartNoAxesCombined,
  CircleHelp,
  FileText,
  Package,
  Receipt,
  Settings,
  UserRound,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { ToothIcon } from '@/components/ui/ToothIcon';
import type { PermissionKey } from '@/types';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon | typeof ToothIcon;
  /** Role gate — items the current role cannot access are hidden. */
  permission: PermissionKey;
  /** Shown in the mobile bottom bar. */
  primary?: boolean;
}

export const MAIN_NAV: NavItem[] = [
  { label: 'OVERVIEW', href: '/dashboard', icon: Activity, permission: 'overview', primary: true },
  { label: 'PATIENTS', href: '/dashboard/patients', icon: Users, permission: 'patients', primary: true },
  {
    label: 'APPOINTMENTS',
    href: '/dashboard/appointments',
    icon: CalendarDays,
    permission: 'appointments',
    primary: true,
  },
  { label: 'TREATMENTS', href: '/dashboard/treatments', icon: FileText, permission: 'treatments' },
  {
    label: 'DENTAL CHART',
    href: '/dashboard/dental-chart',
    icon: ToothIcon,
    permission: 'dental-chart',
  },
  { label: 'INVENTORY', href: '/dashboard/inventory', icon: Package, permission: 'inventory' },
  { label: 'BILLING', href: '/dashboard/billing', icon: Receipt, permission: 'billing' },
  {
    label: 'ANALYTICS',
    href: '/dashboard/analytics',
    icon: ChartNoAxesCombined,
    permission: 'analytics',
  },
  { label: 'AI COPILOT', href: '/dashboard/ai', icon: BrainCircuit, permission: 'ai', primary: true },
];

export const SECONDARY_NAV: NavItem[] = [
  { label: 'STAFF', href: '/dashboard/staff', icon: UserRound, permission: 'staff' },
  { label: 'SETTINGS', href: '/dashboard/settings', icon: Settings, permission: 'settings' },
  { label: 'HELP', href: '/dashboard/help', icon: CircleHelp, permission: 'overview' },
];

/** Maps a pathname to its page title for the top bar. */
export function titleForPath(pathname: string): string {
  const all = [...MAIN_NAV, ...SECONDARY_NAV];

  // Longest matching prefix wins, so nested routes resolve correctly.
  const match = all
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];

  if (match) {
    // A patient profile is a child of PATIENTS but deserves its own title.
    if (pathname.startsWith('/dashboard/patients/')) return 'PATIENT PROFILE';
    return match.label;
  }

  return 'DASHBOARD';
}
