'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Check, Info, X } from 'lucide-react';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import type { Toast, ToastVariant } from '@/types';

interface ToastContextValue {
  toast: (input: {
    title: string;
    description?: string;
    variant?: ToastVariant;
  }) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICON: Record<ToastVariant, typeof Check> = {
  success: Check,
  error: AlertTriangle,
  info: Info,
};

const ACCENT: Record<ToastVariant, string> = {
  success: 'bg-[#15BCDF]',
  error: 'bg-[#B03A34]',
  info: 'bg-[#6B6F72]',
};

const DURATION = 4200;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback<ToastContextValue['toast']>(
    ({ title, description, variant = 'success' }) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      setToasts((current) => [...current.slice(-3), { id, title, description, variant }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), DURATION),
      );
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Announcements are polite so they never interrupt a screen reader. */}
      <div
        className="dt-no-print pointer-events-none fixed bottom-4 right-4 z-[200] flex w-[calc(100vw-32px)] max-w-[360px] flex-col gap-2 sm:bottom-6 sm:right-6"
        role="status"
        aria-live="polite"
      >
        <AnimatePresence initial={false}>
          {toasts.map((item) => {
            const Icon = ICON[item.variant];
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: 24, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 24, scale: 0.98 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="dt-chamfer-xs pointer-events-auto relative flex items-start gap-3 border border-[rgba(43,48,51,0.14)] bg-white py-3 pl-4 pr-3 shadow-[0_12px_28px_-18px_rgba(26,28,30,0.5)]"
              >
                <span
                  className={cn('absolute left-0 top-0 h-full w-[3px]', ACCENT[item.variant])}
                  aria-hidden="true"
                />
                <Icon
                  size={15}
                  strokeWidth={1.8}
                  className={cn(
                    'mt-[1px] shrink-0',
                    item.variant === 'success' && 'text-[#0FA3C2]',
                    item.variant === 'error' && 'text-[#B03A34]',
                    item.variant === 'info' && 'text-[#6B6F72]',
                  )}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#2B3033]">
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="mt-1 text-[12px] leading-[1.5] text-[#6B6F72]">
                      {item.description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(item.id)}
                  aria-label="Dismiss notification"
                  className="shrink-0 p-1 text-[#6B6F72] transition-colors hover:text-[#1A1C1E]"
                >
                  <X size={13} strokeWidth={1.8} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider.');
  }
  return context;
}
