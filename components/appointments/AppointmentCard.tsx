'use client';

import { Clock, MapPin, User } from 'lucide-react';
import Link from 'next/link';

import { StatusPill } from '@/components/ui/StatusPill';
import { appointmentTone, cn } from '@/lib/utils';
import type { Appointment } from '@/types';

interface AppointmentCardProps {
  appointment: Appointment;
  /** Compact rows are used in the overview list. */
  compact?: boolean;
  onClick?: (appointment: Appointment) => void;
  className?: string;
}

export function AppointmentCard({
  appointment,
  compact = false,
  onClick,
  className,
}: AppointmentCardProps) {
  const tone = appointmentTone(appointment.status);
  const cancelled =
    appointment.status === 'CANCELLED' || appointment.status === 'NO-SHOW';

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-[rgba(21,188,223,0.04)] sm:gap-4',
          className,
        )}
      >
        <span
          className={cn(
            'h-8 w-[2px] shrink-0',
            appointment.status === 'CONFIRMED'
              ? 'bg-[#15BCDF]'
              : appointment.status === 'COMPLETED'
                ? 'bg-[#2E6B54]'
                : cancelled
                  ? 'bg-[rgba(43,48,51,0.18)]'
                  : 'bg-[rgba(43,48,51,0.3)]',
          )}
          aria-hidden="true"
        />

        <span className="dt-mono w-[42px] shrink-0 text-[12px] font-bold text-[#1A1C1E]">
          {appointment.startTime}
        </span>

        <span className="min-w-0 flex-1">
          <Link
            href={`/dashboard/patients/${appointment.patientId}`}
            className={cn(
              'block truncate text-[12px] font-bold tracking-[0.02em] text-[#2B3033] hover:text-[#0FA3C2]',
              cancelled && 'line-through decoration-[rgba(43,48,51,0.4)]',
            )}
          >
            {appointment.patientName}
          </Link>
          <span className="mt-0.5 block truncate text-[11px] text-[#6B6F72]">
            {appointment.treatment}
          </span>
        </span>

        <span className="hidden shrink-0 text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B6F72] lg:block">
          {appointment.dentistName.replace('Dr. ', '')}
        </span>

        <StatusPill label={appointment.status} tone={tone} size="xs" />
      </div>
    );
  }

  const Wrapper = onClick ? 'button' : 'div';

  return (
    <Wrapper
      {...(onClick
        ? { type: 'button' as const, onClick: () => onClick(appointment) }
        : {})}
      className={cn(
        'dt-chamfer-xs group relative w-full border bg-white p-4 text-left transition-colors',
        appointment.status === 'CONFIRMED'
          ? 'border-[rgba(21,188,223,0.45)]'
          : 'border-[rgba(43,48,51,0.12)]',
        onClick && 'hover:border-[#15BCDF]',
        className,
      )}
    >
      <span
        className={cn(
          'absolute left-0 top-0 h-full w-[3px]',
          appointment.status === 'CONFIRMED'
            ? 'bg-[#15BCDF]'
            : appointment.status === 'COMPLETED'
              ? 'bg-[#2E6B54]'
              : cancelled
                ? 'bg-[rgba(43,48,51,0.2)]'
                : 'bg-[rgba(43,48,51,0.32)]',
        )}
        aria-hidden="true"
      />

      <div className="flex items-start justify-between gap-3">
        <span className="dt-mono inline-flex items-center gap-1.5 text-[13px] font-bold text-[#1A1C1E]">
          <Clock size={12} strokeWidth={1.8} className="text-[#6B6F72]" aria-hidden="true" />
          {appointment.startTime}
          <span className="font-normal text-[#6B6F72]">–{appointment.endTime}</span>
        </span>

        <StatusPill label={appointment.status} tone={tone} size="xs" />
      </div>

      <h3
        className={cn(
          'mt-3 truncate text-[13px] font-bold uppercase tracking-[0.04em] text-[#2B3033]',
          cancelled && 'line-through decoration-[rgba(43,48,51,0.4)]',
        )}
      >
        {appointment.patientName}
      </h3>

      <p className="mt-1 truncate text-[12px] text-[#6B6F72]">
        {appointment.treatment}
      </p>

      <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-[rgba(43,48,51,0.08)] pt-3">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6B6F72]">
          <User size={11} strokeWidth={1.7} aria-hidden="true" />
          {appointment.dentistName.replace('Dr. ', '')}
        </span>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6B6F72]">
          <MapPin size={11} strokeWidth={1.7} aria-hidden="true" />
          {appointment.room}
        </span>
      </div>
    </Wrapper>
  );
}
