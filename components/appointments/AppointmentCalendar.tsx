'use client';

import { useMemo } from 'react';

import { AppointmentCard } from './AppointmentCard';
import { EmptyState } from '@/components/ui/States';
import { StatusPill } from '@/components/ui/StatusPill';
import {
  addDays,
  appointmentTone,
  cn,
  dayLabel,
  formatDateLong,
  isSameMonth,
  monthGrid,
  parseDate,
  startOfWeek,
  timeToMinutes,
} from '@/lib/utils';
import { CalendarDays } from 'lucide-react';
import type { Appointment } from '@/types';

export type CalendarView = 'DAY' | 'WEEK' | 'MONTH';

interface CalendarProps {
  view: CalendarView;
  date: string;
  today: string;
  appointments: Appointment[];
  onSelectDate: (date: string) => void;
  onSelectAppointment: (appointment: Appointment) => void;
  onCreate: (date: string) => void;
}

const DAY_START = 8 * 60; // 08:00
const DAY_END = 19 * 60; // 19:00
const PIXELS_PER_MINUTE = 1.1;

/* ============================================================
   DAY VIEW
   ============================================================ */

function DayView({
  date,
  appointments,
  onSelectAppointment,
  onCreate,
}: Pick<CalendarProps, 'date' | 'appointments' | 'onSelectAppointment' | 'onCreate'>) {
  const dayAppointments = useMemo(
    () =>
      appointments
        .filter((a) => a.date === date)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [appointments, date],
  );

  /** Groups overlapping appointments so they can share the row width. */
  const positioned = useMemo(() => {
    const sorted = [...dayAppointments].sort(
      (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
    );

    const columns: Appointment[][] = [];
    sorted.forEach((appointment) => {
      const start = timeToMinutes(appointment.startTime);
      // Place in the first column whose last entry has already finished.
      const column = columns.find((col) => {
        const last = col[col.length - 1];
        return timeToMinutes(last.endTime) <= start;
      });
      if (column) column.push(appointment);
      else columns.push([appointment]);
    });

    return columns.map((col, index) => ({ column: col, index, total: columns.length }));
  }, [dayAppointments]);

  const hours = useMemo(() => {
    const result: number[] = [];
    for (let m = DAY_START; m <= DAY_END; m += 60) result.push(m);
    return result;
  }, []);

  if (dayAppointments.length === 0) {
    return (
      <EmptyState
        title="NO APPOINTMENTS"
        description={`Your schedule is clear on ${formatDateLong(date)}.`}
        icon={CalendarDays}
        actionLabel="CREATE APPOINTMENT"
        onAction={() => onCreate(date)}
      />
    );
  }

  const height = (DAY_END - DAY_START) * PIXELS_PER_MINUTE;

  return (
    <div className="dt-scroll overflow-x-auto">
      <div className="flex min-w-[520px] gap-3 p-4 sm:p-5">
        {/* Hour gutter */}
        <div className="w-12 shrink-0" style={{ height }}>
          {hours.map((minute) => (
            <div
              key={minute}
              className="relative"
              style={{ height: 60 * PIXELS_PER_MINUTE }}
            >
              <span className="dt-mono absolute -top-1.5 right-2 text-[10px] font-bold text-[#6B6F72]">
                {String(Math.floor(minute / 60)).padStart(2, '0')}:00
              </span>
            </div>
          ))}
        </div>

        {/* Track */}
        <div
          className="relative flex-1 border-l border-[rgba(43,48,51,0.1)]"
          style={{ height }}
        >
          {/* Hour rules */}
          {hours.map((minute) => (
            <span
              key={minute}
              className="absolute inset-x-0 h-px bg-[rgba(43,48,51,0.07)]"
              style={{ top: (minute - DAY_START) * PIXELS_PER_MINUTE }}
              aria-hidden="true"
            />
          ))}

          {positioned.map(({ column, index, total }) =>
            column.map((appointment) => {
              const start = timeToMinutes(appointment.startTime);
              const end = timeToMinutes(appointment.endTime);
              const top = (start - DAY_START) * PIXELS_PER_MINUTE;
              const blockHeight = Math.max((end - start) * PIXELS_PER_MINUTE, 28);
              const width = `calc(${100 / total}% - 4px)`;
              const left = `calc(${(index * 100) / total}% + 2px)`;
              const cancelled =
                appointment.status === 'CANCELLED' || appointment.status === 'NO-SHOW';

              return (
                <button
                  key={appointment.id}
                  type="button"
                  onClick={() => onSelectAppointment(appointment)}
                  className={cn(
                    'absolute overflow-hidden border px-2.5 py-1.5 text-left transition-colors',
                    appointment.status === 'CONFIRMED'
                      ? 'border-[rgba(21,188,223,0.5)] bg-[rgba(21,188,223,0.1)] hover:bg-[rgba(21,188,223,0.18)]'
                      : cancelled
                        ? 'border-[rgba(43,48,51,0.14)] bg-[rgba(43,48,51,0.04)]'
                        : 'border-[rgba(43,48,51,0.16)] bg-white hover:border-[#15BCDF]',
                  )}
                  style={{ top, height: blockHeight, width, left }}
                >
                  <span
                    className={cn(
                      'absolute left-0 top-0 h-full w-[2px]',
                      appointment.status === 'CONFIRMED'
                        ? 'bg-[#15BCDF]'
                        : appointment.status === 'COMPLETED'
                          ? 'bg-[#2E6B54]'
                          : 'bg-[rgba(43,48,51,0.28)]',
                    )}
                    aria-hidden="true"
                  />

                  <span className="dt-mono block text-[10px] font-bold text-[#1A1C1E]">
                    {appointment.startTime}
                  </span>
                  <span
                    className={cn(
                      'block truncate text-[11px] font-bold text-[#2B3033]',
                      cancelled && 'line-through',
                    )}
                  >
                    {appointment.patientName}
                  </span>
                  {blockHeight > 52 && (
                    <span className="block truncate text-[10px] text-[#6B6F72]">
                      {appointment.treatment} · {appointment.room}
                    </span>
                  )}
                </button>
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   WEEK VIEW
   ============================================================ */

function WeekView({
  date,
  today,
  appointments,
  onSelectDate,
  onCreate,
}: Pick<
  CalendarProps,
  'date' | 'today' | 'appointments' | 'onSelectDate' | 'onCreate'
>) {
  const days = useMemo(() => {
    const start = startOfWeek(date);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [date]);

  return (
    <div className="dt-scroll overflow-x-auto">
      <div className="grid min-w-[760px] grid-cols-7 gap-px bg-[rgba(43,48,51,0.1)]">
        {days.map((day) => {
          const dayAppointments = appointments
            .filter((a) => a.date === day && a.status !== 'CANCELLED')
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
          const isToday = day === today;

          return (
            <div key={day} className="flex min-h-[320px] flex-col bg-white">
              <button
                type="button"
                onClick={() => onSelectDate(day)}
                className={cn(
                  'flex items-center justify-between gap-2 border-b px-3 py-2.5 text-left transition-colors',
                  isToday
                    ? 'border-[#15BCDF] bg-[rgba(21,188,223,0.08)]'
                    : 'border-[rgba(43,48,51,0.1)] hover:bg-[rgba(21,188,223,0.04)]',
                )}
              >
                <span>
                  <span className="dt-label block text-[8.5px]">{dayLabel(day)}</span>
                  <span
                    className={cn(
                      'dt-mono mt-0.5 block text-[15px] font-bold leading-none',
                      isToday ? 'text-[#0FA3C2]' : 'text-[#1A1C1E]',
                    )}
                  >
                    {parseDate(day).getDate()}
                  </span>
                </span>
                <span className="dt-mono text-[10px] font-bold text-[#6B6F72]">
                  {dayAppointments.length}
                </span>
              </button>

              <div className="dt-scroll flex-1 space-y-1.5 overflow-y-auto p-2">
                {dayAppointments.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => onCreate(day)}
                    className="flex h-16 w-full items-center justify-center border border-dashed border-[rgba(43,48,51,0.16)] text-[9px] font-bold uppercase tracking-[0.12em] text-[#6B6F72] transition-colors hover:border-[#15BCDF] hover:text-[#0FA3C2]"
                  >
                    + ADD
                  </button>
                ) : (
                  dayAppointments.map((appointment) => (
                    <button
                      key={appointment.id}
                      type="button"
                      onClick={() => onSelectDate(day)}
                      className={cn(
                        'block w-full border-l-2 px-2 py-1.5 text-left transition-colors',
                        appointment.status === 'CONFIRMED'
                          ? 'border-[#15BCDF] bg-[rgba(21,188,223,0.07)]'
                          : appointment.status === 'COMPLETED'
                            ? 'border-[#2E6B54] bg-[rgba(46,107,84,0.05)]'
                            : 'border-[rgba(43,48,51,0.25)] bg-[rgba(43,48,51,0.03)]',
                        'hover:bg-[rgba(21,188,223,0.12)]',
                      )}
                    >
                      <span className="dt-mono block text-[9.5px] font-bold text-[#1A1C1E]">
                        {appointment.startTime}
                      </span>
                      <span className="block truncate text-[10px] font-bold text-[#2B3033]">
                        {appointment.patientName}
                      </span>
                      <span className="block truncate text-[9.5px] text-[#6B6F72]">
                        {appointment.treatment}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   MONTH VIEW
   ============================================================ */

function MonthView({
  date,
  today,
  appointments,
  onSelectDate,
}: Pick<CalendarProps, 'date' | 'today' | 'appointments' | 'onSelectDate'>) {
  const cells = useMemo(() => monthGrid(date), [date]);

  const countByDate = useMemo(() => {
    const map = new Map<string, number>();
    appointments.forEach((a) => {
      if (a.status === 'CANCELLED') return;
      map.set(a.date, (map.get(a.date) ?? 0) + 1);
    });
    return map;
  }, [appointments]);

  return (
    <div className="p-3 sm:p-4">
      {/* Weekday header */}
      <div className="mb-1.5 grid grid-cols-7 gap-px">
        {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => (
          <div
            key={day}
            className="py-2 text-center text-[9px] font-bold uppercase tracking-[0.14em] text-[#6B6F72]"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-[rgba(43,48,51,0.1)]">
        {cells.map((cell) => {
          const count = countByDate.get(cell) ?? 0;
          const inMonth = isSameMonth(cell, date);
          const isToday = cell === today;

          return (
            <button
              key={cell}
              type="button"
              onClick={() => onSelectDate(cell)}
              aria-label={`${formatDateLong(cell)}, ${count} appointments`}
              className={cn(
                'relative flex min-h-[74px] flex-col items-start gap-1.5 p-2 text-left transition-colors sm:min-h-[96px]',
                inMonth ? 'bg-white' : 'bg-[#F7F6F8]',
                'hover:bg-[rgba(21,188,223,0.07)]',
              )}
            >
              {isToday && (
                <span
                  className="absolute inset-x-0 top-0 h-[2px] bg-[#15BCDF]"
                  aria-hidden="true"
                />
              )}

              <span
                className={cn(
                  'dt-mono text-[12px] font-bold leading-none',
                  !inMonth
                    ? 'text-[rgba(43,48,51,0.3)]'
                    : isToday
                      ? 'text-[#0FA3C2]'
                      : 'text-[#1A1C1E]',
                )}
              >
                {parseDate(cell).getDate()}
              </span>

              {count > 0 && inMonth && (
                <>
                  <span className="dt-mono text-[9.5px] font-bold text-[#6B6F72]">
                    {count} APPT{count === 1 ? '' : 'S'}
                  </span>
                  {/* Density bars — capped at five marks. */}
                  <span className="mt-auto flex gap-[2px]" aria-hidden="true">
                    {Array.from({ length: Math.min(count, 5) }).map((_, i) => (
                      <span key={i} className="h-[3px] w-[7px] bg-[#15BCDF]" />
                    ))}
                    {count > 5 && (
                      <span className="h-[3px] w-[7px] bg-[rgba(43,48,51,0.25)]" />
                    )}
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   CALENDAR
   ============================================================ */

export function AppointmentCalendar(props: CalendarProps) {
  const { view } = props;

  if (view === 'DAY') {
    return (
      <DayView
        date={props.date}
        appointments={props.appointments}
        onSelectAppointment={props.onSelectAppointment}
        onCreate={props.onCreate}
      />
    );
  }

  if (view === 'WEEK') {
    return (
      <WeekView
        date={props.date}
        today={props.today}
        appointments={props.appointments}
        onSelectDate={props.onSelectDate}
        onCreate={props.onCreate}
      />
    );
  }

  return (
    <MonthView
      date={props.date}
      today={props.today}
      appointments={props.appointments}
      onSelectDate={props.onSelectDate}
    />
  );
}

/* ============================================================
   DETAIL
   ============================================================ */

export function AppointmentDetail({
  appointment,
  onStatusChange,
}: {
  appointment: Appointment;
  onStatusChange: (status: Appointment['status']) => void;
}) {
  const STATUSES: Appointment['status'][] = [
    'SCHEDULED',
    'CONFIRMED',
    'COMPLETED',
    'CANCELLED',
    'NO-SHOW',
  ];

  return (
    <div className="space-y-5">
      <AppointmentCard appointment={appointment} />

      <div>
        <span className="dt-field-label">UPDATE STATUS</span>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => onStatusChange(status)}
              className={cn(
                'dt-chamfer-xs border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] transition-colors',
                appointment.status === status
                  ? 'border-[#0FA3C2] bg-[#15BCDF] text-[#1A1C1E]'
                  : 'border-[rgba(43,48,51,0.16)] bg-white text-[#6B6F72] hover:border-[#15BCDF]',
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {appointment.notes && (
        <div className="border-t border-[rgba(43,48,51,0.1)] pt-4">
          <span className="dt-label text-[9px]">NOTES</span>
          <p className="mt-2 text-[12px] leading-[1.6] text-[#6B6F72]">
            {appointment.notes}
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-[rgba(43,48,51,0.1)] pt-4">
        <StatusPill
          label={appointment.status}
          tone={appointmentTone(appointment.status)}
        />
        <span className="dt-mono text-[11px] text-[#6B6F72]">
          {formatDateLong(appointment.date)}
        </span>
      </div>
    </div>
  );
}
