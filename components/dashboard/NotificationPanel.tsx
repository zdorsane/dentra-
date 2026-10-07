'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  BrainCircuit,
  CalendarDays,
  Package,
  Receipt,
  Server,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

import { useStore } from '@/lib/store';
import { cn, relativeTime } from '@/lib/utils';
import type { Notification, NotificationKind } from '@/types';

const KIND_ICON: Record<NotificationKind, typeof CalendarDays> = {
  APPOINTMENT: CalendarDays,
  INVENTORY: Package,
  PATIENT: Users,
  BILLING: Receipt,
  SYSTEM: Server,
  AI: BrainCircuit,
};

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

function NotificationRow({
  notification,
  onRead,
  onClose,
}: {
  notification: Notification;
  onRead: (id: string) => void;
  onClose: () => void;
}) {
  const Icon = KIND_ICON[notification.kind] ?? Server;
  const critical = notification.severity === 'CRITICAL';

  const body = (
    <>
      <span className="flex w-5 shrink-0 flex-col items-center gap-2 pt-0.5">
        <Icon
          size={14}
          strokeWidth={1.5}
          className={critical ? 'text-[#B03A34]' : 'text-[#6B6F72]'}
          aria-hidden="true"
        />
        {!notification.read && (
          <span className="h-[5px] w-[5px] bg-[#15BCDF]" aria-hidden="true" />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-3">
          <span
            className={cn(
              'text-[12px] font-bold leading-[1.4] tracking-[0.02em]',
              notification.read ? 'text-[#6B6F72]' : 'text-[#2B3033]',
            )}
          >
            {notification.title}
          </span>
          <span className="dt-mono shrink-0 text-[9px] font-bold tracking-[0.08em] text-[#9AA0A4]">
            {relativeTime(notification.createdAt, new Date('2026-09-15T09:40:00'))}
          </span>
        </span>

        <span className="mt-1 block text-[11px] leading-[1.55] text-[#6B6F72]">
          {notification.body}
        </span>

        {critical && (
          <span className="mt-2 inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[#A33A35]">
            <AlertTriangle size={10} strokeWidth={2} aria-hidden="true" />
            ACTION REQUIRED
          </span>
        )}
      </span>
    </>
  );

  const className = cn(
    'flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors',
    notification.read ? 'bg-white' : 'bg-[rgba(21,188,223,0.04)]',
    'hover:bg-[rgba(21,188,223,0.08)]',
  );

  if (notification.href) {
    return (
      <Link
        href={notification.href}
        className={className}
        onClick={() => {
          onRead(notification.id);
          onClose();
        }}
      >
        {body}
      </Link>
    );
  }

  return (
    <button type="button" className={className} onClick={() => onRead(notification.id)}>
      {body}
    </button>
  );
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const { notifications, markNotificationRead, markAllNotificationsRead, unreadCount } =
    useStore();
  const panelRef = useRef<HTMLDivElement>(null);

  // Dismiss on outside click or Escape.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) onClose();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    // Deferred so the opening click does not immediately close the panel.
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', onPointerDown);
    }, 0);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: -8, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.99 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 top-[calc(100%+10px)] z-[60] w-[min(384px,calc(100vw-32px))] border border-[rgba(43,48,51,0.14)] bg-white shadow-[0_24px_48px_-28px_rgba(26,28,30,0.45)]"
        >
          <header className="dt-chamfer-tr flex items-center justify-between gap-3 bg-[#1A1C1E] px-4 py-3.5">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-white">
              NOTIFICATIONS
            </h2>
            <div className="flex items-center gap-3">
              <span className="dt-mono text-[10px] font-bold text-[#15BCDF]">
                {unreadCount} NEW
              </span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllNotificationsRead}
                  className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/50 transition-colors hover:text-white"
                >
                  MARK ALL READ
                </button>
              )}
            </div>
          </header>

          <div className="dt-scroll max-h-[min(460px,60vh)] divide-y divide-[rgba(43,48,51,0.07)] overflow-y-auto">
            {notifications.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                onRead={markNotificationRead}
                onClose={onClose}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
