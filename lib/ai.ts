/**
 * DENTRA AI — administrative copilot
 *
 * The assistant answers questions about the clinic's own operational data:
 * schedule, recall lists, stock levels, revenue and treatment status.
 *
 * ARCHITECTURE
 * ------------
 * `answer()` is a pure function of (question, ClinicSnapshot) → AIAnswer. The
 * demo resolves it with a local intent matcher; swapping in a hosted model
 * means replacing `resolve()` with an API call that receives the same snapshot
 * as context and returns the same shape. Nothing in the UI changes.
 *
 * SCOPE
 * -----
 * This is an administrative tool. It reports what is recorded in the clinic's
 * data and never interprets symptoms, suggests a diagnosis, or recommends
 * clinical treatment.
 */

import {
  daysBetween,
  daysUntilMinimum,
  formatCurrency,
  formatDate,
  inventoryStatus,
} from './utils';

import type {
  AIDataPoint,
  Appointment,
  InventoryItem,
  Invoice,
  Patient,
  TimeSeriesPoint,
  Treatment,
} from '@/types';

export const AI_DISCLAIMER =
  'AI-generated insights are for administrative support and do not replace professional clinical judgment.';

export const AI_NAME = 'DENTRA AI';

/* ============================================================
   CONTEXT SNAPSHOT
   ============================================================ */

/**
 * Everything the assistant is allowed to reason about. Passing an explicit
 * snapshot (rather than importing the store) keeps the engine testable and
 * makes the eventual prompt payload obvious.
 */
export interface ClinicSnapshot {
  today: string;
  clinicName: string;
  currency: string;
  patients: Patient[];
  appointments: Appointment[];
  treatments: Treatment[];
  inventory: InventoryItem[];
  invoices: Invoice[];
  series: TimeSeriesPoint[];
  activePatientCount: number;
}

export interface AIAnswer {
  content: string;
  data?: AIDataPoint[];
  suggestions?: string[];
}

/* ============================================================
   SUGGESTED PROMPTS
   ============================================================ */

export const AI_SUGGESTED_PROMPTS = [
  "Show me today's appointments.",
  "Which patients haven't returned in 6 months?",
  'What products are running low?',
  'How much revenue did we generate this month?',
  "Show me tomorrow's schedule.",
  'Which treatments are still pending?',
];

/* ============================================================
   INTENT MATCHING
   ============================================================ */

type Intent =
  | 'today-schedule'
  | 'tomorrow-schedule'
  | 'week-schedule'
  | 'recall-patients'
  | 'low-stock'
  | 'expiring-stock'
  | 'revenue-month'
  | 'revenue-today'
  | 'pending-treatments'
  | 'overdue-invoices'
  | 'patient-count'
  | 'no-show-rate'
  | 'reorder-suggestion'
  | 'clinical-boundary'
  | 'capabilities'
  | 'greeting'
  | 'unknown';

interface IntentRule {
  intent: Intent;
  /** All terms in at least one group must be present. */
  any: string[][];
}

const RULES: IntentRule[] = [
  {
    intent: 'clinical-boundary',
    any: [
      ['diagnose'],
      ['diagnosis'],
      ['should i prescribe'],
      ['what medication'],
      ['is it cancer'],
      ['treat this patient for'],
      ['symptom'],
    ],
  },
  { intent: 'greeting', any: [['hello'], ['hi '], ['hey'], ['good morning']] },
  {
    intent: 'capabilities',
    any: [['what can you do'], ['help me'], ['what do you do'], ['capabilities']],
  },
  {
    intent: 'tomorrow-schedule',
    any: [['tomorrow']],
  },
  {
    intent: 'week-schedule',
    any: [['this week'], ['next week'], ['week schedule'], ['coming week']],
  },
  {
    intent: 'today-schedule',
    any: [
      ['today', 'appointment'],
      ['today', 'schedule'],
      ['todays appointment'],
      ["today's appointment"],
      ['schedule today'],
    ],
  },
  {
    intent: 'recall-patients',
    any: [
      ['not returned'],
      ["haven't returned"],
      ['havent returned'],
      ['follow-up', 'need'],
      ['follow up', 'need'],
      ['recall'],
      ['6 months'],
      ['six months'],
      ['inactive patient'],
    ],
  },
  {
    intent: 'reorder-suggestion',
    any: [['order'], ['reorder'], ['restock'], ['purchase']],
  },
  {
    intent: 'expiring-stock',
    any: [['expir'], ['expiry'], ['expiration']],
  },
  {
    intent: 'low-stock',
    any: [
      ['running low'],
      ['low stock'],
      ['stock level'],
      ['inventory alert'],
      ['below minimum'],
      ['out of stock'],
      ['product', 'low'],
    ],
  },
  {
    intent: 'revenue-today',
    any: [['revenue', 'today'], ['earn', 'today']],
  },
  {
    intent: 'revenue-month',
    any: [
      ['revenue'],
      ['income'],
      ['turnover'],
      ['how much', 'generate'],
      ['earnings'],
    ],
  },
  {
    intent: 'pending-treatments',
    any: [
      ['treatment', 'pending'],
      ['treatment', 'still'],
      ['pending treatment'],
      ['outstanding treatment'],
      ['treatment', 'progress'],
      ['unfinished'],
    ],
  },
  {
    intent: 'overdue-invoices',
    any: [['overdue'], ['unpaid'], ['invoice'], ['owe'], ['outstanding balance']],
  },
  {
    intent: 'no-show-rate',
    any: [['no-show'], ['no show'], ['missed appointment'], ['did not attend']],
  },
  {
    intent: 'patient-count',
    any: [
      ['how many patient'],
      ['active patient'],
      ['patient count'],
      ['total patient'],
    ],
  },
];

export function detectIntent(question: string): Intent {
  const q = ` ${question.toLowerCase().trim()} `;

  for (const rule of RULES) {
    for (const group of rule.any) {
      if (group.every((term) => q.includes(term))) {
        return rule.intent;
      }
    }
  }
  return 'unknown';
}

/* ============================================================
   RESOLVERS
   ============================================================ */

function scheduleAnswer(
  snapshot: ClinicSnapshot,
  date: string,
  dayWord: string,
): AIAnswer {
  const list = snapshot.appointments
    .filter((a) => a.date === date && a.status !== 'CANCELLED')
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  if (list.length === 0) {
    return {
      content: `There are no appointments scheduled for ${dayWord} (${formatDate(
        date,
      )}). The schedule is clear.`,
      suggestions: ['Show me this week’s schedule.', 'Which treatments are still pending?'],
    };
  }

  const confirmed = list.filter((a) => a.status === 'CONFIRMED').length;
  const first = list[0];
  const last = list[list.length - 1];

  const preview = list
    .slice(0, 6)
    .map(
      (a) =>
        `${a.startTime}  ${a.patientName} — ${a.treatment} (${a.dentistName.replace(
          'Dr. ',
          '',
        )}, ${a.room})`,
    )
    .join('\n');

  const remaining = list.length - Math.min(6, list.length);

  return {
    content: `${dayWord === 'today' ? 'Today' : 'Tomorrow'} has ${
      list.length
    } appointments between ${first.startTime} and ${last.endTime}, ${confirmed} of them confirmed.\n\n${preview}${
      remaining > 0 ? `\n\n…and ${remaining} more.` : ''
    }`,
    data: [
      { label: 'DATE', value: formatDate(date) },
      { label: 'APPOINTMENTS', value: String(list.length) },
      { label: 'CONFIRMED', value: String(confirmed) },
      {
        label: 'PRACTITIONERS',
        value: String(new Set(list.map((a) => a.dentistId)).size),
      },
      { label: 'FIRST / LAST', value: `${first.startTime} — ${last.endTime}` },
    ],
    suggestions: ['Which treatments are still pending?', 'What products are running low?'],
  };
}

function resolve(intent: Intent, snapshot: ClinicSnapshot, question: string): AIAnswer {
  const { today } = snapshot;

  switch (intent) {
    /* ---------------- schedule ---------------- */
    case 'today-schedule':
      return scheduleAnswer(snapshot, today, 'today');

    case 'tomorrow-schedule': {
      const t = new Date(today);
      t.setDate(t.getDate() + 1);
      const iso = t.toISOString().slice(0, 10);
      return scheduleAnswer(snapshot, iso, 'tomorrow');
    }

    case 'week-schedule': {
      const upcoming = snapshot.appointments.filter((a) => {
        const delta = daysBetween(today, a.date);
        return delta >= 0 && delta < 7 && a.status !== 'CANCELLED';
      });
      const byDay = new Map<string, number>();
      upcoming.forEach((a) => byDay.set(a.date, (byDay.get(a.date) ?? 0) + 1));
      const rows = Array.from(byDay.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, count]) => ({ label: formatDate(date), value: `${count} appts` }));

      return {
        content: `There are ${upcoming.length} appointments scheduled over the next seven days across ${
          new Set(upcoming.map((a) => a.dentistId)).size
        } practitioners.`,
        data: rows,
        suggestions: ["Show me tomorrow's schedule.", 'What is our no-show rate?'],
      };
    }

    /* ---------------- patients ---------------- */
    case 'recall-patients': {
      const due = snapshot.patients.filter((p) => {
        if (!p.lastVisit || p.nextAppointment) return false;
        return daysBetween(p.lastVisit, today) >= 180;
      });

      if (due.length === 0) {
        return {
          content:
            'Every patient with a recorded visit has either returned recently or has a future appointment booked. No recall list to generate.',
        };
      }

      return {
        content: `${due.length} patients have no future appointment and have not attended in over six months. Reception can work through this as a recall list.`,
        data: due.slice(0, 8).map((p) => ({
          label: p.fullName.toUpperCase(),
          value: `LAST VISIT ${formatDate(p.lastVisit)} · ${daysBetween(
            p.lastVisit as string,
            today,
          )} DAYS`,
        })),
        suggestions: ['Which treatments are still pending?', 'Show me overdue invoices.'],
      };
    }

    case 'patient-count': {
      const inTreatment = snapshot.patients.filter(
        (p) => p.status === 'IN TREATMENT',
      ).length;
      return {
        content: `${snapshot.clinicName} has ${snapshot.activePatientCount.toLocaleString(
          'en-US',
        )} patients on the active register. ${inTreatment} of the records currently loaded are mid-treatment.`,
        data: [
          {
            label: 'ACTIVE REGISTER',
            value: snapshot.activePatientCount.toLocaleString('en-US'),
          },
          { label: 'IN TREATMENT', value: String(inTreatment) },
          {
            label: 'NEW THIS MONTH',
            value: String(
              snapshot.series
                .filter((p) => p.label.slice(0, 7) === today.slice(0, 7))
                .reduce((acc, p) => acc + p.newPatients, 0),
            ),
          },
        ],
      };
    }

    /* ---------------- inventory ---------------- */
    case 'low-stock': {
      const low = snapshot.inventory.filter(
        (item) => item.quantity <= item.minimumQuantity,
      );

      if (low.length === 0) {
        return { content: 'Every tracked product is currently above its minimum stock level.' };
      }

      const out = low.filter((i) => i.quantity === 0);

      return {
        content: `${low.length} products are at or below their minimum stock level${
          out.length > 0
            ? `, and ${out.length} ${out.length === 1 ? 'is' : 'are'} completely out of stock`
            : ''
        }.`,
        data: low.map((item) => ({
          label: item.name.toUpperCase(),
          value: `${item.quantity} / ${item.minimumQuantity} ${item.unit.toUpperCase()}`,
        })),
        suggestions: ['What should I reorder?', 'Which products expire soon?'],
      };
    }

    case 'expiring-stock': {
      const expiring = snapshot.inventory.filter((item) => {
        if (!item.expirationDate) return false;
        const days = daysBetween(today, item.expirationDate);
        return days >= 0 && days <= 30;
      });
      const expired = snapshot.inventory.filter(
        (item) =>
          item.expirationDate && daysBetween(today, item.expirationDate) < 0,
      );

      if (expiring.length === 0 && expired.length === 0) {
        return { content: 'No products are expiring within the next 30 days.' };
      }

      return {
        content: `${expiring.length} products expire within 30 days${
          expired.length > 0 ? `, and ${expired.length} have already expired` : ''
        }. Prioritise these for dispensing or arrange a supplier return.`,
        data: [...expiring, ...expired].map((item) => ({
          label: item.name.toUpperCase(),
          value: `${formatDate(item.expirationDate)} · ${daysBetween(
            today,
            item.expirationDate as string,
          )} DAYS`,
        })),
      };
    }

    case 'reorder-suggestion': {
      const candidates = snapshot.inventory
        .map((item) => ({ item, days: daysUntilMinimum(item) }))
        .filter((entry) => entry.days !== null && entry.days <= 21)
        .sort((a, b) => (a.days ?? 0) - (b.days ?? 0));

      if (candidates.length === 0) {
        return {
          content:
            'Nothing needs ordering in the next three weeks based on current consumption rates.',
        };
      }

      return {
        content: `${candidates.length} products are forecast to hit their minimum within three weeks. Suggested order quantities cover roughly six weeks of consumption.`,
        data: candidates.map(({ item, days }) => {
          const sixWeeks = Math.ceil(item.dailyUsage * 42);
          const suggested = Math.max(
            item.minimumQuantity - item.quantity + sixWeeks,
            1,
          );
          return {
            label: item.name.toUpperCase(),
            value: `ORDER ${suggested} ${item.unit.toUpperCase()} · ${days} DAYS LEFT`,
          };
        }),
        suggestions: ['What products are running low?'],
      };
    }

    /* ---------------- money ---------------- */
    case 'revenue-month': {
      const month = today.slice(0, 7);
      const points = snapshot.series.filter((p) => p.label.slice(0, 7) === month);
      const total = points.reduce((acc, p) => acc + p.revenue, 0);

      const prevDate = new Date(today);
      prevDate.setMonth(prevDate.getMonth() - 1);
      const prevMonth = prevDate.toISOString().slice(0, 7);
      const prevPoints = snapshot.series.filter(
        (p) => p.label.slice(0, 7) === prevMonth && p.label.slice(8) <= today.slice(8),
      );
      const prevTotal = prevPoints.reduce((acc, p) => acc + p.revenue, 0);
      const delta = prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : 0;

      const treatmentsCount = points.reduce((acc, p) => acc + p.appointments, 0);

      return {
        content: `Month-to-date revenue is ${formatCurrency(
          total,
          snapshot.currency,
        )} across ${treatmentsCount} completed appointments — ${
          delta >= 0 ? 'up' : 'down'
        } ${Math.abs(delta).toFixed(1)}% against the same period last month.`,
        data: [
          { label: 'MONTH TO DATE', value: formatCurrency(total, snapshot.currency) },
          {
            label: 'SAME PERIOD LAST MONTH',
            value: formatCurrency(prevTotal, snapshot.currency),
          },
          { label: 'CHANGE', value: `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%` },
          {
            label: 'AVG PER APPOINTMENT',
            value: formatCurrency(
              treatmentsCount > 0 ? total / treatmentsCount : 0,
              snapshot.currency,
            ),
          },
        ],
        suggestions: ['Show me overdue invoices.', 'Which treatments are still pending?'],
      };
    }

    case 'revenue-today': {
      const point = snapshot.series.find((p) => p.label === today);
      return {
        content: `Revenue recorded for today is ${formatCurrency(
          point?.revenue ?? 0,
          snapshot.currency,
        )} across ${point?.appointments ?? 0} appointments.`,
        data: [
          { label: 'TODAY', value: formatCurrency(point?.revenue ?? 0, snapshot.currency) },
          { label: 'APPOINTMENTS', value: String(point?.appointments ?? 0) },
        ],
      };
    }

    case 'overdue-invoices': {
      const overdue = snapshot.invoices.filter((i) => i.status === 'OVERDUE');
      const pending = snapshot.invoices.filter((i) => i.status === 'PENDING');
      const overdueTotal = overdue.reduce((acc, i) => acc + i.amount, 0);
      const pendingTotal = pending.reduce((acc, i) => acc + i.amount, 0);

      if (overdue.length === 0 && pending.length === 0) {
        return { content: 'Every issued invoice has been settled. Nothing outstanding.' };
      }

      return {
        content: `${overdue.length} invoices are overdue, totalling ${formatCurrency(
          overdueTotal,
          snapshot.currency,
        )}. A further ${pending.length} are pending, worth ${formatCurrency(
          pendingTotal,
          snapshot.currency,
        )}.`,
        data: overdue.map((invoice) => ({
          label: `INVOICE #${invoice.number} · ${invoice.patientName.toUpperCase()}`,
          value: `${formatCurrency(invoice.amount, snapshot.currency)} · ${daysBetween(
            invoice.dueDate,
            today,
          )} DAYS LATE`,
        })),
        suggestions: ['How much revenue did we generate this month?'],
      };
    }

    /* ---------------- treatments ---------------- */
    case 'pending-treatments': {
      const open = snapshot.treatments.filter(
        (t) =>
          t.status === 'IN PROGRESS' ||
          t.status === 'PROPOSED' ||
          t.status === 'ACCEPTED',
      );

      if (open.length === 0) {
        return { content: 'There are no open treatment plans. Everything recorded is complete.' };
      }

      const proposed = open.filter((t) => t.status === 'PROPOSED');
      const value = open.reduce((acc, t) => acc + t.price, 0);

      return {
        content: `${open.length} treatment plans are still open, representing ${formatCurrency(
          value,
          snapshot.currency,
        )} of planned work. ${proposed.length} ${
          proposed.length === 1 ? 'is' : 'are'
        } awaiting patient acceptance.`,
        data: open.map((t) => ({
          label: `${t.patientName.toUpperCase()} · ${t.type}`,
          value: `${t.status} · DUE ${formatDate(t.expectedCompletion)}`,
        })),
        suggestions: ["Show me today's appointments.", 'Show me overdue invoices.'],
      };
    }

    case 'no-show-rate': {
      const window = snapshot.appointments.filter((a) => {
        const delta = daysBetween(a.date, today);
        return delta >= 0 && delta <= 30;
      });
      const noShows = window.filter((a) => a.status === 'NO-SHOW').length;
      const rate = window.length > 0 ? (noShows / window.length) * 100 : 0;

      return {
        content: `Over the last 30 days, ${noShows} of ${window.length} appointments were recorded as no-shows — a rate of ${rate.toFixed(
          1,
        )}%.`,
        data: [
          { label: 'NO-SHOWS', value: String(noShows) },
          { label: 'TOTAL APPOINTMENTS', value: String(window.length) },
          { label: 'RATE', value: `${rate.toFixed(1)}%` },
        ],
      };
    }

    /* ---------------- boundaries & fallbacks ---------------- */
    case 'clinical-boundary':
      return {
        content:
          'I am an administrative assistant, so I cannot offer a diagnosis, interpret symptoms, or recommend clinical treatment — those are decisions for the treating practitioner.\n\nWhat I can do is pull up the record: the patient’s treatment history, dental chart, medical alerts and appointment timeline are all available to me.',
        suggestions: [
          "Show me today's appointments.",
          'Which treatments are still pending?',
        ],
      };

    case 'greeting':
      return {
        content: `Good to see you. I have ${snapshot.clinicName}’s schedule, patient register, inventory and billing loaded. What would you like to look at?`,
        suggestions: AI_SUGGESTED_PROMPTS.slice(0, 3),
      };

    case 'capabilities':
      return {
        content:
          'I work across the clinic’s administrative data. I can summarise the schedule, build recall lists from visit history, report stock levels and expiry windows, forecast when a product will run out, total revenue over any period, and list open treatment plans or unpaid invoices.\n\nI do not make clinical judgments.',
        data: [
          { label: 'SCHEDULE', value: 'DAY / WEEK / MONTH' },
          { label: 'PATIENTS', value: 'RECALLS · HISTORY · STATUS' },
          { label: 'INVENTORY', value: 'STOCK · EXPIRY · FORECAST' },
          { label: 'FINANCE', value: 'REVENUE · INVOICES' },
        ],
        suggestions: AI_SUGGESTED_PROMPTS.slice(0, 4),
      };

    default: {
      const lowCount = snapshot.inventory.filter(
        (i) => i.quantity <= i.minimumQuantity,
      ).length;
      const todayCount = snapshot.appointments.filter(
        (a) => a.date === today && a.status !== 'CANCELLED',
      ).length;

      return {
        content: `I could not map "${question.trim()}" to anything in the clinic’s data. Here is where things stand right now — try one of the prompts below for more detail.`,
        data: [
          { label: 'APPOINTMENTS TODAY', value: String(todayCount) },
          { label: 'PRODUCTS BELOW MINIMUM', value: String(lowCount) },
          {
            label: 'OPEN TREATMENTS',
            value: String(
              snapshot.treatments.filter((t) => t.status === 'IN PROGRESS').length,
            ),
          },
          {
            label: 'OVERDUE INVOICES',
            value: String(snapshot.invoices.filter((i) => i.status === 'OVERDUE').length),
          },
        ],
        suggestions: AI_SUGGESTED_PROMPTS.slice(0, 4),
      };
    }
  }
}

/* ============================================================
   PUBLIC API
   ============================================================ */

/**
 * Resolves a question against the clinic snapshot.
 *
 * Replace the body with a call to a hosted model to go live — the snapshot is
 * the context payload and `AIAnswer` is the expected response contract.
 */
export async function answer(
  question: string,
  snapshot: ClinicSnapshot,
): Promise<AIAnswer> {
  const intent = detectIntent(question);
  return resolve(intent, snapshot, question);
}

/** Synchronous variant, used for server-rendered insight panels. */
export function answerSync(question: string, snapshot: ClinicSnapshot): AIAnswer {
  return resolve(detectIntent(question), snapshot, question);
}

/* ============================================================
   INVENTORY INSIGHTS
   ============================================================ */

export interface InventoryInsight {
  id: string;
  body: string;
  metric: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

/**
 * Derives the inventory panel's insights from live stock figures rather than
 * fixed copy, so the narrative always matches the table beneath it.
 */
export function inventoryInsights(
  items: InventoryItem[],
  today: string,
): InventoryInsight[] {
  const insights: InventoryInsight[] = [];

  // 1 — Nearest depletion forecast.
  const forecast = items
    .map((item) => ({ item, days: daysUntilMinimum(item) }))
    .filter((entry) => entry.days !== null && entry.days > 0)
    .sort((a, b) => (a.days ?? 0) - (b.days ?? 0))[0];

  if (forecast) {
    insights.push({
      id: 'ins-forecast',
      body: `${forecast.item.name} is expected to reach minimum stock in approximately ${forecast.days} days based on recent usage.`,
      metric: `${forecast.days} DAYS`,
      severity: (forecast.days ?? 0) <= 10 ? 'WARNING' : 'INFO',
    });
  }

  // 2 — Expiry window.
  const expiring = items.filter((item) => {
    if (!item.expirationDate) return false;
    const days = daysBetween(today, item.expirationDate);
    return days >= 0 && days <= 30;
  });

  if (expiring.length > 0) {
    insights.push({
      id: 'ins-expiry',
      body: `${expiring.length} ${
        expiring.length === 1 ? 'product expires' : 'products expire'
      } within 30 days. Prioritise them for dispensing before they are written off.`,
      metric: `${expiring.length} ${expiring.length === 1 ? 'PRODUCT' : 'PRODUCTS'}`,
      severity: 'WARNING',
    });
  }

  // 3 — Reorder suggestion for the most depleted consumable.
  const reorder = items
    .filter((item) => item.quantity <= item.minimumQuantity && item.dailyUsage > 0)
    .sort(
      (a, b) =>
        a.quantity / Math.max(a.minimumQuantity, 1) -
        b.quantity / Math.max(b.minimumQuantity, 1),
    )[0];

  if (reorder) {
    const sixWeeks = Math.ceil(reorder.dailyUsage * 42);
    const suggested = Math.max(
      reorder.minimumQuantity - reorder.quantity + sixWeeks,
      1,
    );
    insights.push({
      id: 'ins-reorder',
      body: `Consider ordering ${suggested} ${reorder.unit}${
        suggested === 1 ? '' : 's'
      } of ${reorder.name.toLowerCase()} to cover the next six weeks.`,
      metric: `${suggested} UNITS`,
      severity: reorder.quantity === 0 ? 'CRITICAL' : 'WARNING',
    });
  }

  // 4 — Out of stock.
  const out = items.filter((item) => inventoryStatus(item, today) === 'OUT OF STOCK');
  if (out.length > 0) {
    insights.push({
      id: 'ins-out',
      body: `${out.length} ${
        out.length === 1 ? 'product is' : 'products are'
      } out of stock: ${out.map((i) => i.name).join(', ')}.`,
      metric: 'OUT OF STOCK',
      severity: 'CRITICAL',
    });
  }

  return insights;
}
