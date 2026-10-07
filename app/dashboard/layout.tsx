'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { MobileNav } from '@/components/dashboard/MobileNav';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Topbar } from '@/components/dashboard/Topbar';
import { titleForPath } from '@/components/dashboard/navigation';
import { DEMO_USER, getSession } from '@/lib/auth';
import { StoreProvider, useStore } from '@/lib/store';

/**
 * Restores the session on mount.
 *
 * The demo is explorable without signing in: if no session exists we fall back
 * to the demo user rather than bouncing to /login, so the "WATCH DEMO" path
 * from the landing page leads straight into a working dashboard.
 */
function SessionGate({ children }: { children: React.ReactNode }) {
  const { session, setSession } = useStore();
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const existing = getSession();
    setSession(existing ?? DEMO_USER);
    setReady(true);
  }, [setSession, router]);

  if (!ready || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F2F1F0]">
        <div className="flex flex-col items-center gap-4">
          <span className="flex gap-1.5" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="dt-dot-pulse h-1.5 w-1.5 bg-[#15BCDF]"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </span>
          <span className="dt-label">LOADING CLINIC</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#F2F1F0]">
      <a href="#dashboard-main" className="dt-skip-link">
        Skip to content
      </a>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="min-[900px]:ml-[248px]">
        <Topbar
          title={titleForPath(pathname)}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <main
          id="dashboard-main"
          className="px-4 pb-[86px] pt-5 sm:px-6 sm:pb-8 min-[900px]:pb-10"
        >
          {children}
        </main>
      </div>

      <MobileNav onOpenMore={() => setSidebarOpen(true)} />
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StoreProvider>
      <SessionGate>
        <DashboardShell>{children}</DashboardShell>
      </SessionGate>
    </StoreProvider>
  );
}
