'use client';

import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  Package,
  Receipt,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

import { AIInsightPanel } from '@/components/ai/AIInsightPanel';
import { AppointmentCard } from '@/components/appointments/AppointmentCard';
import { AnalyticsChart } from '@/components/charts/AnalyticsChart';
import { DataCard } from '@/components/ui/DataCard';
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/States';
import { StatCard } from '@/components/ui/StatCard';
import { StatusPill } from '@/components/ui/StatusPill';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';
import { inventoryInsights } from '@/lib/ai';
import { dailySeries } from '@/lib/mock-data';
import { useStore } from '@/lib/store';
import {
  daysBetween,
  formatCurrency,
  formatDateShort,
  formatNumber,
  greetingForHour,
  inventoryStatus,
  inventoryTone,
  patientTone,
  percentChange,
  sum,
} from '@/lib/utils';

const EASE = [0.22, 1, 0.36, 1] as const;

export default function OverviewPage() {
  const {
    today,
    session,
    appointments,
    patients,
    inventory,
    invoices,
    clinicStats,
    loading,
    error,
    reload,
  } = useStore();

  /* ---------------- derived metrics ---------------- */

  const todayAppointments = useMemo(
    () =>
      appointments
        .filter((a) => a.date === today && a.status !== 'CANCELLED')
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [appointments, today],
  );

  const monthRevenue = useMemo(() => {
    const month = today.slice(0, 7);
    return sum(
      dailySeries.filter((p) => p.label.slice(0, 7) === month).map((p) => p.revenue),
    );
  }, [today]);

  const previousMonthRevenue = useMemo(() => {
    const prev = new Date(today);
    prev.setMonth(prev.getMonth() - 1);
    const key = prev.toISOString().slice(0, 7);
    const day = today.slice(8);
    return sum(
      dailySeries
        .filter((p) => p.label.slice(0, 7) === key && p.label.slice(8) <= day)
        .map((p) => p.revenue),
    );
  }, [today]);

  const lowStock = useMemo(
    () => inventory.filter((item) => item.quantity <= item.minimumQuantity),
    [inventory],
  );

  const insights = useMemo(
    () => inventoryInsights(inventory, today).slice(0, 4),
    [inventory, today],
  );

  const revenueSeries = useMemo(
    () =>
      dailySeries.slice(-30).map((point) => ({
        label: formatDateShort(point.label),
        value: point.revenue,
      })),
    [],
  );

  const appointmentSeries = useMemo(
    () =>
      dailySeries.slice(-14).map((point) => ({
        label: formatDateShort(point.label),
        value: point.appointments,
      })),
    [],
  );

  const recentPatients = useMemo(
    () =>
      [...patients]
        .filter((p) => p.lastVisit)
        .sort((a, b) => (b.lastVisit ?? '').localeCompare(a.lastVisit ?? ''))
        .slice(0, 6),
    [patients],
  );

  const overdueInvoices = useMemo(
    () => invoices.filter((i) => i.status === 'OVERDUE'),
    [invoices],
  );

  /* ---------------- states ---------------- */

  if (error) {
    return <ErrorState detail={error} onRetry={reload} />;
  }

  if (loading) {
    return <LoadingSkeleton variant="dashboard" label="Loading clinic overview" />;
  }

  const firstName = (session?.fullName ?? 'Dr. Amel Bensaïd')
    .replace('Dr. ', '')
    .split(' ')[0];

  return (
    <div className="space-y-3">
      {/* ---------------- greeting ---------------- */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="mb-6 flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <h2
            className="dt-stair text-[#2B3033]"
            style={{ fontSize: 'clamp(26px, 4vw, 42px)' }}
          >
            <span className="block">{greetingForHour(9)},</span>
            <span className="block">DR. {firstName.toUpperCase()}</span>
          </h2>
          <p className="mt-3 text-[13px] leading-[1.6] text-[#6B6F72]">
            Here&rsquo;s what&rsquo;s happening in your clinic today.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <TechnicalLabel label="DATA" value="SYNCHRONIZED" dot />
          <TechnicalLabel label="PATIENTS" value={formatNumber(clinicStats.activePatients)} />
        </div>
      </motion.div>

      {/* ---------------- metrics ---------------- */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="TODAY'S APPOINTMENTS"
          value={String(todayAppointments.length)}
          icon={CalendarDays}
          caption={`${todayAppointments.filter((a) => a.status === 'CONFIRMED').length} confirmed`}
          href="/dashboard/appointments"
          highlight
          index={0}
        />
        <StatCard
          label="ACTIVE PATIENTS"
          value={formatNumber(clinicStats.activePatients)}
          icon={Users}
          delta={3.2}
          caption="vs last month"
          href="/dashboard/patients"
          index={1}
        />
        <StatCard
          label="MONTHLY REVENUE"
          value={formatCurrency(monthRevenue)}
          icon={Receipt}
          delta={percentChange(monthRevenue, previousMonthRevenue)}
          caption="month to date"
          href="/dashboard/analytics"
          index={2}
        />
        <StatCard
          label="LOW STOCK ITEMS"
          value={String(lowStock.length)}
          icon={Package}
          delta={lowStock.length > 5 ? 16.7 : -8.3}
          positiveIsUp={false}
          caption="below minimum"
          href="/dashboard/inventory"
          index={3}
        />
      </div>

      {/* ---------------- schedule + AI ---------------- */}
      <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr]">
        <DataCard
          title="TODAY'S APPOINTMENTS"
          eyebrow={`SCHEDULE / ${todayAppointments.length}`}
          padded={false}
          action={
            <Link
              href="/dashboard/appointments"
              className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#0FA3C2] hover:text-[#15BCDF]"
            >
              VIEW ALL
              <ArrowRight size={11} strokeWidth={2} aria-hidden="true" />
            </Link>
          }
        >
          {todayAppointments.length === 0 ? (
            <EmptyState
              title="NO APPOINTMENTS"
              description="Your schedule is clear."
              icon={CalendarDays}
              actionLabel="CREATE APPOINTMENT"
              actionHref="/dashboard/appointments"
              compact
            />
          ) : (
            <ul className="divide-y divide-[rgba(43,48,51,0.07)]">
              {todayAppointments.slice(0, 8).map((appointment) => (
                <li key={appointment.id}>
                  <AppointmentCard appointment={appointment} compact />
                </li>
              ))}
            </ul>
          )}
        </DataCard>

        <AIInsightPanel insights={insights} />
      </div>

      {/* ---------------- charts ---------------- */}
      <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr]">
        <DataCard
          title="REVENUE"
          eyebrow="LAST 30 DAYS"
          action={
            <TechnicalLabel
              label="TOTAL"
              value={formatCurrency(sum(revenueSeries.map((p) => p.value)))}
            />
          }
        >
          <AnalyticsChart
            data={revenueSeries}
            type="area"
            height={240}
            seriesLabel="REVENUE"
            formatter={(value) => formatCurrency(value)}
          />
        </DataCard>

        <DataCard
          title="APPOINTMENTS"
          eyebrow="LAST 14 DAYS"
          action={<TechnicalLabel label="AVG" value={String(
            Math.round(
              sum(appointmentSeries.map((p) => p.value)) /
                Math.max(appointmentSeries.length, 1),
            ),
          )} />}
        >
          <AnalyticsChart
            data={appointmentSeries}
            type="bar"
            height={240}
            seriesLabel="APPOINTMENTS"
            highlightLast
          />
        </DataCard>
      </div>

      {/* ---------------- alerts + recent patients ---------------- */}
      <div className="grid gap-3 lg:grid-cols-2">
        <DataCard
          title="INVENTORY ALERTS"
          eyebrow={`${lowStock.length} REQUIRE ATTENTION`}
          padded={false}
          action={
            <Link
              href="/dashboard/inventory"
              className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#0FA3C2] hover:text-[#15BCDF]"
            >
              MANAGE
              <ArrowRight size={11} strokeWidth={2} aria-hidden="true" />
            </Link>
          }
        >
          {lowStock.length === 0 ? (
            <EmptyState
              title="STOCK IS HEALTHY"
              description="Every tracked product is above its minimum level."
              icon={Package}
              compact
            />
          ) : (
            <ul className="divide-y divide-[rgba(43,48,51,0.07)]">
              {lowStock.slice(0, 6).map((item) => {
                const status = inventoryStatus(item, today);
                return (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 px-5 py-3.5"
                  >
                    <AlertTriangle
                      size={14}
                      strokeWidth={1.6}
                      className={
                        item.quantity === 0 ? 'text-[#B03A34]' : 'text-[#C4841A]'
                      }
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-bold text-[#2B3033]">
                        {item.name}
                      </span>
                      <span className="dt-mono mt-0.5 block text-[11px] text-[#6B6F72]">
                        {item.quantity} / {item.minimumQuantity} {item.unit}
                      </span>
                    </span>
                    <StatusPill
                      label={status}
                      tone={inventoryTone(status)}
                      size="xs"
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </DataCard>

        <DataCard
          title="RECENT PATIENTS"
          eyebrow="LAST SEEN"
          padded={false}
          action={
            <Link
              href="/dashboard/patients"
              className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#0FA3C2] hover:text-[#15BCDF]"
            >
              VIEW ALL
              <ArrowRight size={11} strokeWidth={2} aria-hidden="true" />
            </Link>
          }
        >
          <ul className="divide-y divide-[rgba(43,48,51,0.07)]">
            {recentPatients.map((patient) => (
              <li key={patient.id}>
                <Link
                  href={`/dashboard/patients/${patient.id}`}
                  className="flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-[rgba(21,188,223,0.04)]"
                >
                  <span className="dt-chamfer-xs flex h-8 w-8 shrink-0 items-center justify-center bg-[#1A1C1E] text-[10px] font-bold text-white">
                    {patient.avatarInitials}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-bold text-[#2B3033]">
                      {patient.fullName}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-[#6B6F72]">
                      {patient.primaryTreatment}
                    </span>
                  </span>
                  <span className="dt-mono hidden shrink-0 text-[10px] font-bold tracking-[0.08em] text-[#6B6F72] sm:block">
                    {daysBetween(patient.lastVisit as string, today)}D AGO
                  </span>
                  <StatusPill
                    label={patient.status}
                    tone={patientTone(patient.status)}
                    size="xs"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </DataCard>
      </div>

      {/* ---------------- overdue strip ---------------- */}
      {overdueInvoices.length > 0 && (
        <Link
          href="/dashboard/billing"
          className="dt-chamfer-xs flex flex-wrap items-center gap-x-5 gap-y-2 border border-[rgba(176,58,52,0.3)] bg-[rgba(176,58,52,0.05)] px-5 py-4 transition-colors hover:border-[#B03A34]"
        >
          <AlertTriangle
            size={15}
            strokeWidth={1.7}
            className="shrink-0 text-[#B03A34]"
            aria-hidden="true"
          />
          <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#A33A35]">
            {overdueInvoices.length} OVERDUE INVOICES
          </span>
          <span className="text-[12px] text-[#6B6F72]">
            {formatCurrency(sum(overdueInvoices.map((i) => i.amount)))} outstanding
            across {overdueInvoices.length} patients.
          </span>
          <ArrowRight
            size={13}
            strokeWidth={2}
            className="ml-auto shrink-0 text-[#A33A35]"
            aria-hidden="true"
          />
        </Link>
      )}
    </div>
  );
}
