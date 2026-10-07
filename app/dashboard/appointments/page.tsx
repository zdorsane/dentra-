'use client';

import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

import {
  AppointmentCalendar,
  AppointmentDetail,
} from '@/components/appointments/AppointmentCalendar';
import type { CalendarView } from '@/components/appointments/AppointmentCalendar';
import { AppointmentFormModal } from '@/components/appointments/AppointmentFormModal';
import { ChamferButton } from '@/components/ui/ChamferButton';
import { Modal } from '@/components/ui/Modal';
import { SelectInput } from '@/components/ui/Form';
import { ErrorState, LoadingSkeleton } from '@/components/ui/States';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';
import { useToast } from '@/components/ui/Toast';
import { useStore } from '@/lib/store';
import {
  addDays,
  addMonths,
  cn,
  formatDateLong,
  monthLabel,
  startOfWeek,
} from '@/lib/utils';
import type { Appointment } from '@/types';

const VIEWS: CalendarView[] = ['DAY', 'WEEK', 'MONTH'];

export default function AppointmentsPage() {
  const {
    appointments,
    staff,
    today,
    loading,
    error,
    reload,
    updateAppointment,
  } = useStore();
  const { toast } = useToast();

  const [view, setView] = useState<CalendarView>('DAY');
  const [date, setDate] = useState(today);
  const [dentistFilter, setDentistFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [createOpen, setCreateOpen] = useState(false);
  const [createDate, setCreateDate] = useState(today);
  const [selected, setSelected] = useState<Appointment | null>(null);

  const dentists = staff.filter((s) => s.role === 'DENTIST' || s.role === 'OWNER');

  const filtered = useMemo(
    () =>
      appointments.filter((a) => {
        if (dentistFilter !== 'ALL' && a.dentistId !== dentistFilter) return false;
        if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
        return true;
      }),
    [appointments, dentistFilter, statusFilter],
  );

  /** Counts shown in the header strip, scoped to the visible range. */
  const rangeStats = useMemo(() => {
    let inRange: Appointment[];

    if (view === 'DAY') {
      inRange = filtered.filter((a) => a.date === date);
    } else if (view === 'WEEK') {
      const start = startOfWeek(date);
      const end = addDays(start, 6);
      inRange = filtered.filter((a) => a.date >= start && a.date <= end);
    } else {
      const month = date.slice(0, 7);
      inRange = filtered.filter((a) => a.date.slice(0, 7) === month);
    }

    return {
      total: inRange.filter((a) => a.status !== 'CANCELLED').length,
      confirmed: inRange.filter((a) => a.status === 'CONFIRMED').length,
      completed: inRange.filter((a) => a.status === 'COMPLETED').length,
      noShow: inRange.filter((a) => a.status === 'NO-SHOW').length,
    };
  }, [filtered, view, date]);

  const step = (direction: 1 | -1) => {
    if (view === 'DAY') setDate(addDays(date, direction));
    else if (view === 'WEEK') setDate(addDays(date, direction * 7));
    else setDate(addMonths(date, direction));
  };

  const rangeLabel =
    view === 'DAY'
      ? formatDateLong(date)
      : view === 'WEEK'
        ? `WEEK OF ${formatDateLong(startOfWeek(date)).toUpperCase()}`
        : monthLabel(date);

  const onStatusChange = (status: Appointment['status']) => {
    if (!selected) return;
    const updated = { ...selected, status };
    updateAppointment(updated);
    setSelected(updated);
    toast({
      title: 'APPOINTMENT UPDATED',
      description: `${selected.patientName} marked as ${status.toLowerCase()}.`,
    });
  };

  if (error) return <ErrorState detail={error} onRetry={reload} />;
  if (loading) return <LoadingSkeleton variant="cards" rows={6} label="Loading schedule" />;

  return (
    <div className="space-y-4">
      {/* ---------------- header ---------------- */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2
            className="dt-stair text-[#2B3033]"
            style={{ fontSize: 'clamp(22px, 3vw, 32px)' }}
          >
            SCHEDULE
          </h2>
          <p className="mt-2 text-[13px] text-[#6B6F72]">{rangeLabel}</p>
        </div>

        <ChamferButton
          size="sm"
          onClick={() => {
            setCreateDate(date);
            setCreateOpen(true);
          }}
        >
          <Plus size={14} strokeWidth={2} aria-hidden="true" />
          NEW APPOINTMENT
        </ChamferButton>
      </div>

      {/* ---------------- stats ---------------- */}
      <div className="grid grid-cols-2 gap-px border border-[rgba(43,48,51,0.12)] bg-[rgba(43,48,51,0.1)] sm:grid-cols-4">
        {[
          { label: 'SCHEDULED', value: rangeStats.total },
          { label: 'CONFIRMED', value: rangeStats.confirmed },
          { label: 'COMPLETED', value: rangeStats.completed },
          { label: 'NO-SHOWS', value: rangeStats.noShow },
        ].map((stat) => (
          <div key={stat.label} className="bg-white px-4 py-3.5">
            <div className="dt-label text-[8.5px]">{stat.label}</div>
            <div className="dt-mono mt-1.5 text-[20px] font-bold leading-none text-[#1A1C1E]">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* ---------------- toolbar ---------------- */}
      <div className="flex flex-wrap items-center gap-3 border border-[rgba(43,48,51,0.12)] bg-white p-3.5">
        {/* View switch */}
        <div
          className="flex border border-[rgba(43,48,51,0.14)]"
          role="group"
          aria-label="Calendar view"
        >
          {VIEWS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setView(option)}
              aria-pressed={view === option}
              className={cn(
                'px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.12em] transition-colors',
                view === option
                  ? 'bg-[#15BCDF] text-[#1A1C1E]'
                  : 'bg-white text-[#6B6F72] hover:text-[#2B3033]',
              )}
            >
              {option}
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous period"
            className="flex h-8 w-8 items-center justify-center border border-[rgba(43,48,51,0.14)] bg-white text-[#2B3033] transition-colors hover:border-[#15BCDF]"
          >
            <ChevronLeft size={14} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => setDate(today)}
            className="h-8 border border-[rgba(43,48,51,0.14)] bg-white px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#2B3033] transition-colors hover:border-[#15BCDF]"
          >
            TODAY
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next period"
            className="flex h-8 w-8 items-center justify-center border border-[rgba(43,48,51,0.14)] bg-white text-[#2B3033] transition-colors hover:border-[#15BCDF]"
          >
            <ChevronRight size={14} strokeWidth={2} />
          </button>
        </div>

        <SelectInput
          label=""
          value={dentistFilter}
          onChange={(event) => setDentistFilter(event.target.value)}
          options={[
            { value: 'ALL', label: 'ALL DENTISTS' },
            ...dentists.map((d) => ({ value: d.id, label: d.fullName })),
          ]}
          className="w-auto min-w-[150px] text-[11px] font-bold uppercase tracking-[0.08em]"
        />

        <SelectInput
          label=""
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          options={[
            'ALL',
            'SCHEDULED',
            'CONFIRMED',
            'COMPLETED',
            'CANCELLED',
            'NO-SHOW',
          ].map((s) => ({ value: s, label: s === 'ALL' ? 'ALL STATUSES' : s }))}
          className="w-auto min-w-[140px] text-[11px] font-bold uppercase tracking-[0.08em]"
        />

        <TechnicalLabel
          label="VIEW"
          value={view}
          dot
          className="ml-auto hidden sm:inline-flex"
        />
      </div>

      {/* ---------------- calendar ---------------- */}
      <div className="border border-[rgba(43,48,51,0.12)] bg-white">
        <AppointmentCalendar
          view={view}
          date={date}
          today={today}
          appointments={filtered}
          onSelectDate={(next) => {
            setDate(next);
            if (view === 'MONTH' || view === 'WEEK') setView('DAY');
          }}
          onSelectAppointment={setSelected}
          onCreate={(next) => {
            setCreateDate(next);
            setCreateOpen(true);
          }}
        />
      </div>

      {/* ---------------- modals ---------------- */}
      <AppointmentFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        defaultDate={createDate}
        onCreated={(appointment) =>
          toast({
            title: 'APPOINTMENT CREATED',
            description: `${appointment.patientName} · ${appointment.date} at ${appointment.startTime}.`,
          })
        }
      />

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.patientName ?? ''}
        eyebrow="APPOINTMENT"
        size="sm"
      >
        {selected && (
          <AppointmentDetail
            appointment={selected}
            onStatusChange={onStatusChange}
          />
        )}
      </Modal>
    </div>
  );
}
