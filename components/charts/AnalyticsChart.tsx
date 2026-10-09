'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TooltipProps } from 'recharts';

import { cn } from '@/lib/utils';

/**
 * Chart primitives for DENTRA.
 *
 * One cyan series against neutral grey, flat marks, hairline gridlines only on
 * the value axis. Deliberately restrained so charts read as instrumentation
 * rather than decoration.
 */

export const CHART_CYAN = '#15BCDF';
export const CHART_INK = '#2B3033';
export const CHART_GREY = 'rgba(43,48,51,0.22)';

const AXIS_STYLE = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.08em',
  fill: '#6B6F72',
} as const;

export interface ChartDatum {
  label: string;
  value: number;
  /** Optional comparison series. */
  compare?: number;
}

interface TooltipContentProps extends TooltipProps<number, string> {
  formatter?: (value: number) => string;
  seriesLabel?: string;
  compareLabel?: string;
}

function ChartTooltip({
  active,
  payload,
  label,
  formatter,
  seriesLabel = 'VALUE',
  compareLabel = 'PREVIOUS',
}: TooltipContentProps) {
  if (!active || !payload?.length) return null;

  const format = formatter ?? ((value: number) => value.toLocaleString('en-US'));

  return (
    <div className="dt-chamfer-xs border border-[rgba(43,48,51,0.16)] bg-white px-3 py-2.5 shadow-[0_12px_28px_-20px_rgba(26,28,30,0.5)]">
      <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#6B6F72]">
        {label}
      </div>
      {payload.map((entry, i) => (
        <div key={i} className="mt-1.5 flex items-center gap-2">
          <span
            className="h-[6px] w-[6px] shrink-0"
            style={{ background: entry.color }}
            aria-hidden="true"
          />
          <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#6B6F72]">
            {entry.dataKey === 'compare' ? compareLabel : seriesLabel}
          </span>
          <span className="dt-mono ml-auto text-[12px] font-bold text-[#1A1C1E]">
            {format(Number(entry.value ?? 0))}
          </span>
        </div>
      ))}
    </div>
  );
}

interface AnalyticsChartProps {
  data: ChartDatum[];
  type?: 'line' | 'bar' | 'area';
  height?: number;
  formatter?: (value: number) => string;
  seriesLabel?: string;
  compareLabel?: string;
  /** Highlights the final bar — useful for "current period" emphasis. */
  highlightLast?: boolean;
  className?: string;
  showCompare?: boolean;
  /** Renders every Nth tick to avoid a crowded axis. */
  tickInterval?: number;
}

export function AnalyticsChart({
  data,
  type = 'line',
  height = 260,
  formatter,
  seriesLabel,
  compareLabel,
  highlightLast = false,
  className,
  showCompare = false,
  tickInterval,
}: AnalyticsChartProps) {
  const interval =
    tickInterval ?? Math.max(0, Math.floor(data.length / 8) - 1);

  const axisProps = {
    tick: AXIS_STYLE,
    tickLine: false,
    axisLine: { stroke: 'rgba(43,48,51,0.14)' },
  } as const;

  const grid = (
    <CartesianGrid
      stroke="rgba(43,48,51,0.08)"
      strokeDasharray="0"
      vertical={false}
    />
  );

  const tooltip = (
    <Tooltip
      cursor={{ fill: 'rgba(21,188,223,0.07)', stroke: 'transparent' }}
      content={
        <ChartTooltip
          formatter={formatter}
          seriesLabel={seriesLabel}
          compareLabel={compareLabel}
        />
      }
    />
  );

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {type === 'bar' ? (
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            {grid}
            <XAxis dataKey="label" interval={interval} {...axisProps} />
            <YAxis
              {...axisProps}
              width={54}
              tickFormatter={(value) =>
                formatter ? formatter(Number(value)) : String(value)
              }
            />
            {tooltip}
            <Bar dataKey="value" radius={0} maxBarSize={38}>
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={
                    highlightLast && i === data.length - 1 ? CHART_CYAN : CHART_GREY
                  }
                />
              ))}
            </Bar>
          </BarChart>
        ) : type === 'area' ? (
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="dt-area-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_CYAN} stopOpacity={0.28} />
                <stop offset="100%" stopColor={CHART_CYAN} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            {grid}
            <XAxis dataKey="label" interval={interval} {...axisProps} />
            <YAxis
              {...axisProps}
              width={54}
              tickFormatter={(value) =>
                formatter ? formatter(Number(value)) : String(value)
              }
            />
            {tooltip}
            <Area
              type="monotone"
              dataKey="value"
              stroke={CHART_CYAN}
              strokeWidth={2}
              fill="url(#dt-area-fill)"
              dot={false}
              activeDot={{ r: 4, fill: CHART_CYAN, stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        ) : (
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            {grid}
            <XAxis dataKey="label" interval={interval} {...axisProps} />
            <YAxis
              {...axisProps}
              width={54}
              tickFormatter={(value) =>
                formatter ? formatter(Number(value)) : String(value)
              }
            />
            {tooltip}
            {showCompare && (
              <Line
                type="monotone"
                dataKey="compare"
                stroke={CHART_GREY}
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
              />
            )}
            <Line
              type="monotone"
              dataKey="value"
              stroke={CHART_CYAN}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: CHART_CYAN, stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

/* ============================================================
   SPARKLINE
   ============================================================ */

interface SparklineProps {
  data: number[];
  height?: number;
  className?: string;
}

/** Inline trend mark for metric tiles — no axes, no interaction. */
export function Sparkline({ data, height = 34, className }: SparklineProps) {
  const points = data.map((value, i) => ({ label: String(i), value }));

  return (
    <div className={cn('w-full', className)} style={{ height }} aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="dt-spark-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_CYAN} stopOpacity={0.3} />
              <stop offset="100%" stopColor={CHART_CYAN} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={CHART_CYAN}
            strokeWidth={1.5}
            fill="url(#dt-spark-fill)"
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
