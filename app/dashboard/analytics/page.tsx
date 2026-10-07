'use client';

import { useMemo, useState } from 'react';

import { AnalyticsChart } from '@/components/charts/AnalyticsChart';
import { DataCard } from '@/components/ui/DataCard';
import { StatCard } from '@/components/ui/StatCard';
import { ErrorState, LoadingSkeleton } from '@/components/ui/States';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';
import { dailySeries } from '@/lib/mock-data';
import { useStore } from '@/lib/store';
import {
  cn,
  formatCurrency,
  formatDateShort,
  formatNumber,
  formatPercent,
  monthLabel,
  percentChange,
  sum,
} from '@/lib/utils';
import type { AnalyticsRange, TimeSeriesPoint } from '@/types';

const RANGES: { id: AnalyticsRange; label: string; days: number }[] = [
  { id: '7D', label: '7 DAYS', days: 7 },
  { id: '30D', label: '30 DAYS', days: 30 },
  { id: '3M', label: '3 MONTHS', days: 91 },
  { id: '12M', label: '12 MONTHS', days: 365 },
];

/** Buckets daily points into weeks or months for the longer ranges. */
function bucket(points: TimeSeriesPoint[], range: AnalyticsRange) {
  if (range === '7D' || range === '30D') {
    return points.map((point) => ({ ...point, bucketLabel: formatDateShort(point.label) }));
  }

  const groups = new Map<string, TimeSeriesPoint & { bucketLabel: string }>();

  points.forEach((point) => {
    // 3M groups by ISO week, 12M by calendar month.
    const key =
      range === '3M'
        ? (() => {
            const d = new Date(point.label);
            const offset = (d.getDay() + 6) % 7;
            d.setDate(d.getDate() - offset);
            return d.toISOString().slice(0, 10);
          })()
        : point.label.slice(0, 7);

    const existing = groups.get(key);
    if (existing) {
      existing.revenue += point.revenue;
      existing.appointments += point.appointments;
      existing.newPatients += point.newPatients;
      existing.returningPatients += point.returningPatients;
      existing.noShows += point.noShows;
      existing.inventoryCost += point.inventoryCost;
    } else {
      groups.set(key, {
        ...point,
        label: key,
        bucketLabel:
          range === '3M'
            ? formatDateShort(key)
            : monthLabel(`${key}-01`).slice(0, 3),
      });
    }
  });

  return Array.from(groups.values());
}

export default function AnalyticsPage() {
  const { loading, error, reload, patients, treatments, inventory } = useStore();
  const [range, setRange] = useState<AnalyticsRange>('30D');

  const days = RANGES.find((r) => r.id === range)?.days ?? 30;

  /* ---------------- windows ---------------- */

  const current = useMemo(() => dailySeries.slice(-days), [days]);
  const previous = useMemo(
    () => dailySeries.slice(-days * 2, -days),
    [days],
  );

  const buckets = useMemo(() => bucket(current, range), [current, range]);

  /* ---------------- metrics ---------------- */

  const metrics = useMemo(() => {
    const revenue = sum(current.map((p) => p.revenue));
    const prevRevenue = sum(previous.map((p) => p.revenue));

    const appointments = sum(current.map((p) => p.appointments));
    const prevAppointments = sum(previous.map((p) => p.appointments));

    const newPatients = sum(current.map((p) => p.newPatients));
    const prevNewPatients = sum(previous.map((p) => p.newPatients));

    const returning = sum(current.map((p) => p.returningPatients));
    const prevReturning = sum(previous.map((p) => p.returningPatients));

    const noShows = sum(current.map((p) => p.noShows));
    const noShowRate = appointments > 0 ? (noShows / appointments) * 100 : 0;
    const prevNoShowRate =
      prevAppointments > 0
        ? (sum(previous.map((p) => p.noShows)) / prevAppointments) * 100
        : 0;

    const inventoryCost = sum(current.map((p) => p.inventoryCost));
    const prevInventoryCost = sum(previous.map((p) => p.inventoryCost));

    const completed = treatments.filter((t) => t.status === 'COMPLETED').length;
    const closed = treatments.filter(
      (t) => t.status === 'COMPLETED' || t.status === 'CANCELLED',
    ).length;
    const completionRate = closed > 0 ? (completed / closed) * 100 : 0;

    return {
      revenue,
      revenueDelta: percentChange(revenue, prevRevenue),
      appointments,
      appointmentsDelta: percentChange(appointments, prevAppointments),
      newPatients,
      newPatientsDelta: percentChange(newPatients, prevNewPatients),
      returning,
      returningDelta: percentChange(returning, prevReturning),
      completionRate,
      noShowRate,
      noShowDelta: noShowRate - prevNoShowRate,
      inventoryCost,
      inventoryCostDelta: percentChange(inventoryCost, prevInventoryCost),
    };
  }, [current, previous, treatments]);

  /* ---------------- chart series ---------------- */

  const revenueData = useMemo(
    () => buckets.map((b) => ({ label: b.bucketLabel, value: b.revenue })),
    [buckets],
  );

  const appointmentData = useMemo(
    () => buckets.map((b) => ({ label: b.bucketLabel, value: b.appointments })),
    [buckets],
  );

  const patientMixData = useMemo(
    () =>
      buckets.map((b) => ({
        label: b.bucketLabel,
        value: b.newPatients,
        compare: b.returningPatients,
      })),
    [buckets],
  );

  const inventoryCostData = useMemo(
    () => buckets.map((b) => ({ label: b.bucketLabel, value: b.inventoryCost })),
    [buckets],
  );

  /* ---------------- category breakdown ---------------- */

  const treatmentMix = useMemo(() => {
    const totals = new Map<string, number>();
    treatments.forEach((t) => {
      if (t.status === 'CANCELLED') return;
      totals.set(t.category, (totals.get(t.category) ?? 0) + t.price);
    });
    return Array.from(totals.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [treatments]);

  const maxMix = Math.max(...treatmentMix.map((t) => t.value), 1);

  if (error) return <ErrorState detail={error} onRetry={reload} />;
  if (loading) return <LoadingSkeleton variant="chart" label="Loading analytics" />;

  return (
    <div className="space-y-4">
      {/* ---------------- header ---------------- */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2
            className="dt-stair text-[#2B3033]"
            style={{ fontSize: 'clamp(22px, 3vw, 32px)' }}
          >
            ANALYTICS
          </h2>
          <p className="mt-2 text-[13px] text-[#6B6F72]">
            Clinic performance over the last {RANGES.find((r) => r.id === range)?.label.toLowerCase()}
          </p>
        </div>

        {/* Range switch */}
        <div
          className="flex border border-[rgba(43,48,51,0.14)]"
          role="group"
          aria-label="Date range"
        >
          {RANGES.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setRange(option.id)}
              aria-pressed={range === option.id}
              className={cn(
                'px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.1em] transition-colors',
                range === option.id
                  ? 'bg-[#15BCDF] text-[#1A1C1E]'
                  : 'bg-white text-[#6B6F72] hover:text-[#2B3033]',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* ---------------- metrics ---------------- */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="REVENUE"
          value={formatCurrency(metrics.revenue)}
          delta={metrics.revenueDelta}
          caption="vs previous period"
          highlight
          index={0}
        />
        <StatCard
          label="APPOINTMENTS"
          value={formatNumber(metrics.appointments)}
          delta={metrics.appointmentsDelta}
          index={1}
        />
        <StatCard
          label="NEW PATIENTS"
          value={formatNumber(metrics.newPatients)}
          delta={metrics.newPatientsDelta}
          index={2}
        />
        <StatCard
          label="RETURNING PATIENTS"
          value={formatNumber(metrics.returning)}
          delta={metrics.returningDelta}
          index={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard
          label="TREATMENT COMPLETION"
          value={formatPercent(metrics.completionRate, 0)}
          caption="of closed plans"
          index={0}
        />
        <StatCard
          label="NO-SHOW RATE"
          value={formatPercent(metrics.noShowRate)}
          delta={metrics.noShowDelta}
          positiveIsUp={false}
          caption="of all appointments"
          index={1}
        />
        <StatCard
          label="INVENTORY COST"
          value={formatCurrency(metrics.inventoryCost)}
          delta={metrics.inventoryCostDelta}
          positiveIsUp={false}
          caption={`${inventory.length} products`}
          index={2}
        />
      </div>

      {/* ---------------- charts ---------------- */}
      <DataCard
        title="REVENUE"
        eyebrow={`${range} · LINE`}
        action={
          <TechnicalLabel label="TOTAL" value={formatCurrency(metrics.revenue)} />
        }
      >
        <AnalyticsChart
          data={revenueData}
          type="line"
          height={280}
          seriesLabel="REVENUE"
          formatter={(value) => formatCurrency(value)}
        />
      </DataCard>

      <div className="grid gap-3 lg:grid-cols-2">
        <DataCard
          title="APPOINTMENTS"
          eyebrow={`${range} · BAR`}
          action={
            <TechnicalLabel label="TOTAL" value={formatNumber(metrics.appointments)} />
          }
        >
          <AnalyticsChart
            data={appointmentData}
            type="bar"
            height={250}
            seriesLabel="APPOINTMENTS"
            highlightLast
          />
        </DataCard>

        <DataCard
          title="PATIENT MIX"
          eyebrow={`${range} · NEW VS RETURNING`}
          action={<TechnicalLabel label="NEW" value={formatNumber(metrics.newPatients)} />}
        >
          <AnalyticsChart
            data={patientMixData}
            type="line"
            height={250}
            showCompare
            seriesLabel="NEW"
            compareLabel="RETURNING"
          />
        </DataCard>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
        <DataCard
          title="INVENTORY COST"
          eyebrow={`${range} · AREA`}
          action={
            <TechnicalLabel
              label="TOTAL"
              value={formatCurrency(metrics.inventoryCost)}
            />
          }
        >
          <AnalyticsChart
            data={inventoryCostData}
            type="area"
            height={250}
            seriesLabel="COST"
            formatter={(value) => formatCurrency(value)}
          />
        </DataCard>

        <DataCard
          title="TREATMENT MIX"
          eyebrow="BY CATEGORY VALUE"
          action={<TechnicalLabel label="PLANS" value={String(treatments.length)} />}
        >
          <ul className="space-y-3.5">
            {treatmentMix.map((entry) => (
              <li key={entry.label}>
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate text-[11px] font-bold uppercase tracking-[0.06em] text-[#2B3033]">
                    {entry.label}
                  </span>
                  <span className="dt-mono shrink-0 text-[11px] font-bold text-[#6B6F72]">
                    {formatCurrency(entry.value)}
                  </span>
                </div>
                <div
                  className="mt-1.5 h-[4px] w-full bg-[rgba(43,48,51,0.08)]"
                  aria-hidden="true"
                >
                  <span
                    className="block h-full bg-[#15BCDF]"
                    style={{ width: `${(entry.value / maxMix) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </DataCard>
      </div>

      {/* ---------------- footer strip ---------------- */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border border-[rgba(43,48,51,0.12)] bg-white px-5 py-4">
        <TechnicalLabel label="PATIENTS LOADED" value={String(patients.length)} />
        <TechnicalLabel label="DATA" value="SYNCHRONIZED" dot />
        <TechnicalLabel label="RANGE" value={range} />
        <TechnicalLabel label="VERSION" value="1.0.0" />
      </div>
    </div>
  );
}
