'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { LogOut, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { MAIN_NAV, SECONDARY_NAV } from './navigation';
import type { NavItem } from './navigation';
import { LogoMark } from '@/components/ui/Logo';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';
import { signOut } from '@/lib/auth';
import { useStore } from '@/lib/store';
import { can, cn } from '@/lib/utils';

interface SidebarProps {
  /** Mobile drawer state. Ignored on desktop, where the rail is always shown. */
  open: boolean;
  onClose: () => void;
}

function isActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') return pathname === '/dashboard';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavList({
  items,
  pathname,
  onNavigate,
}: {
  items: NavItem[];
  pathname: string;
  onNavigate: () => void;
}) {
  return (
    <ul className="flex flex-col gap-0.5">
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActive(pathname, item.href);

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex h-[42px] items-center gap-3 px-3.5 text-[11px] font-bold uppercase tracking-[0.1em] transition-colors duration-200',
                active
                  ? 'dt-chamfer-xs bg-[#15BCDF] text-[#1A1C1E]'
                  : 'text-white/50 hover:bg-white/5 hover:text-white/85',
              )}
            >
              <Icon size={15} strokeWidth={1.5} aria-hidden="true" />
              <span className="truncate">{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function SidebarBody({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, clinic } = useStore();

  const role = session?.role ?? 'OWNER';
  const mainItems = MAIN_NAV.filter((item) => can(role, item.permission));
  const secondaryItems = SECONDARY_NAV.filter((item) => can(role, item.permission));

  const onSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="flex h-full flex-col bg-[#1A1C1E]">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 pb-6 pt-6">
        <LogoMark size={30} tone="light" />
        <span
          className="font-normal leading-none tracking-[-0.5px] text-white"
          style={{ fontSize: 22 }}
        >
          DENTRA
        </span>
      </div>

      {/* Clinic context */}
      <div className="mx-3.5 mb-5 border border-white/8 bg-white/[0.03] px-3.5 py-3">
        <div className="truncate text-[10px] font-bold uppercase tracking-[0.12em] text-white/75">
          {clinic.name}
        </div>
        <div className="mt-1.5">
          <TechnicalLabel label="CLINIC" value="ONLINE" tone="dark" dot />
        </div>
      </div>

      {/* Primary navigation */}
      <nav
        aria-label="Dashboard"
        className="dt-scroll dt-scroll-dark flex-1 overflow-y-auto px-2.5 pb-4"
      >
        <NavList items={mainItems} pathname={pathname} onNavigate={onNavigate} />

        <div className="my-4 h-px bg-white/8" />

        <NavList items={secondaryItems} pathname={pathname} onNavigate={onNavigate} />
      </nav>

      {/* Profile */}
      <div className="border-t border-white/8 p-3.5">
        <div className="flex items-center gap-3">
          <span className="dt-chamfer-xs flex h-9 w-9 shrink-0 items-center justify-center bg-[#15BCDF] text-[11px] font-bold text-[#1A1C1E]">
            {session?.avatarInitials ?? 'AB'}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[11px] font-bold text-white">
              {session?.fullName ?? 'Dr. Amel Bensaïd'}
            </div>
            <div className="truncate text-[9px] font-bold uppercase tracking-[0.14em] text-white/40">
              {role}
            </div>
          </div>
          <button
            type="button"
            onClick={onSignOut}
            aria-label="Sign out"
            className="shrink-0 p-1.5 text-white/40 transition-colors hover:text-white"
          >
            <LogOut size={15} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ open, onClose }: SidebarProps) {
  // Close the drawer on Escape.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <>
      {/* Desktop rail — fixed, 248px */}
      <aside
        className="dt-no-print fixed inset-y-0 left-0 z-40 hidden w-[248px] min-[900px]:block"
        aria-label="Sidebar"
      >
        <SidebarBody onNavigate={() => {}} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="fixed inset-0 z-[70] bg-[#1A1C1E]/50 min-[900px]:hidden"
              aria-hidden="true"
            />

            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-[80] w-[264px] min-[900px]:hidden"
              aria-label="Sidebar"
            >
              <button
                type="button"
                onClick={onClose}
                aria-label="Close navigation"
                className="absolute right-3 top-6 z-10 p-2 text-white/55 transition-colors hover:text-white"
              >
                <X size={17} strokeWidth={1.5} />
              </button>

              <SidebarBody onNavigate={onClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
