import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type {
  Appointment,
  AppointmentStatus,
  InventoryItem,
  InventoryStatus,
  InvoiceStatus,
  ISODate,
  PatientStatus,
  PermissionKey,
  StaffRole,
  ToothCondition,
  TreatmentStatus,
} from '@/types';

/* ============================================================
   CLASS NAMES
   ============================================================ */

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/* ============================================================
   DATES
   ============================================================ */

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const DAYS_SHORT = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const DAYS_LONG = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/**
 * Parses `YYYY-MM-DD` into a local-midnight Date.
 *
 * `new Date('2026-09-21')` parses as UTC midnight, which shifts a day
 * backwards for anyone west of Greenwich. Every date in DENTRA is a calendar
 * date, so we always build it in local time.
 */
export function parseDate(value: ISODate): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** Formats a Date back to `YYYY-MM-DD` in local time. */
export function toISODate(date: Date): ISODate {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** `12 Sep 2026` */
export function formatDate(value: ISODate | null): string {
  if (!value) return '—';
  const d = parseDate(value);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

/** `12 SEP` */
export function formatDateShort(value: ISODate | null): string {
  if (!value) return '—';
  const d = parseDate(value);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()].toUpperCase()}`;
}

/** `Monday, 21 September 2026` */
export function formatDateLong(value: ISODate): string {
  const d = parseDate(value);
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return `${DAYS_LONG[d.getDay()]}, ${d.getDate()} ${
    months[d.getMonth()]
  } ${d.getFullYear()}`;
}

export function dayLabel(value: ISODate): string {
  return DAYS_SHORT[parseDate(value).getDay()];
}

export function addDays(value: ISODate, days: number): ISODate {
  const d = parseDate(value);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function addMonths(value: ISODate, months: number): ISODate {
  const d = parseDate(value);
  d.setMonth(d.getMonth() + months);
  return toISODate(d);
}

/** Whole days between two calendar dates (b − a). */
export function daysBetween(a: ISODate, b: ISODate): number {
  const ms = parseDate(b).getTime() - parseDate(a).getTime();
  return Math.round(ms / 86_400_000);
}

/** Monday-first start of the ISO week containing `value`. */
export function startOfWeek(value: ISODate): ISODate {
  const d = parseDate(value);
  const offset = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - offset);
  return toISODate(d);
}

export function startOfMonth(value: ISODate): ISODate {
  const d = parseDate(value);
  return toISODate(new Date(d.getFullYear(), d.getMonth(), 1));
}

export function monthLabel(value: ISODate): string {
  const d = parseDate(value);
  const months = [
    'JANUARY',
    'FEBRUARY',
    'MARCH',
    'APRIL',
    'MAY',
    'JUNE',
    'JULY',
    'AUGUST',
    'SEPTEMBER',
    'OCTOBER',
    'NOVEMBER',
    'DECEMBER',
  ];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

/** Builds the 42-cell (6×7) grid used by the month calendar. */
export function monthGrid(value: ISODate): ISODate[] {
  const first = parseDate(startOfMonth(value));
  const gridStart = parseDate(startOfWeek(toISODate(first)));
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(d.getDate() + i);
    return toISODate(d);
  });
}

export function isSameMonth(a: ISODate, b: ISODate): boolean {
  const da = parseDate(a);
  const db = parseDate(b);
  return da.getMonth() === db.getMonth() && da.getFullYear() === db.getFullYear();
}

/** `2h ago`, `3d ago`, `just now`. */
export function relativeTime(value: string, now: Date = new Date()): string {
  const diff = now.getTime() - new Date(value).getTime();
  const mins = Math.round(diff / 60_000);
  if (mins < 1) return 'JUST NOW';
  if (mins < 60) return `${mins}M AGO`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}H AGO`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}D AGO`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return `${weeks}W AGO`;
  return `${Math.round(days / 30)}MO AGO`;
}

/** Minutes since midnight — used to position calendar blocks. */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function greetingForHour(hour: number): string {
  if (hour < 12) return 'GOOD MORNING';
  if (hour < 18) return 'GOOD AFTERNOON';
  return 'GOOD EVENING';
}

/* ============================================================
   NUMBERS & CURRENCY
   ============================================================ */

export function formatCurrency(value: number, currency = 'EUR'): string {
  const symbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : '';
  const rounded = Math.round(value);
  return `${symbol}${rounded.toLocaleString('en-US')}`;
}

export function formatCurrencyPrecise(value: number, currency = 'EUR'): string {
  const symbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : '';
  return `${symbol}${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

export function formatDelta(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function sum(values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0);
}

export function percentChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
}

/* ============================================================
   TEXT
   ============================================================ */

export function initials(fullName: string): string {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function titleCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/(^|\s|-)\S/g, (char) => char.toUpperCase());
}

export function truncate(value: string, max: number): string {
  return value.length <= max ? value : `${value.slice(0, max - 1)}…`;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/* ============================================================
   STATUS → VISUAL LANGUAGE
   ============================================================ */

export interface StatusTone {
  /** Tailwind classes for the pill. */
  className: string;
  /** Dot colour, so status never depends on colour alone. */
  dot: string;
}

const NEUTRAL: StatusTone = {
  className: 'text-[#6B6F72] border-[rgba(43,48,51,0.18)] bg-[rgba(43,48,51,0.04)]',
  dot: 'bg-[#6B6F72]',
};

const CYAN: StatusTone = {
  className: 'text-[#0FA3C2] border-[rgba(21,188,223,0.45)] bg-[rgba(21,188,223,0.10)]',
  dot: 'bg-[#15BCDF]',
};

const DARK: StatusTone = {
  className: 'text-[#1A1C1E] border-[rgba(43,48,51,0.28)] bg-[rgba(43,48,51,0.07)]',
  dot: 'bg-[#1A1C1E]',
};

const WARN: StatusTone = {
  className: 'text-[#9A6410] border-[rgba(196,132,26,0.4)] bg-[rgba(214,158,46,0.12)]',
  dot: 'bg-[#C4841A]',
};

const DANGER: StatusTone = {
  className: 'text-[#A33A35] border-[rgba(176,58,52,0.38)] bg-[rgba(176,58,52,0.09)]',
  dot: 'bg-[#B03A34]',
};

const SUCCESS: StatusTone = {
  className: 'text-[#2E6B54] border-[rgba(46,107,84,0.34)] bg-[rgba(46,107,84,0.09)]',
  dot: 'bg-[#2E6B54]',
};

export function appointmentTone(status: AppointmentStatus): StatusTone {
  switch (status) {
    case 'CONFIRMED':
      return CYAN;
    case 'SCHEDULED':
      return DARK;
    case 'COMPLETED':
      return SUCCESS;
    case 'CANCELLED':
      return NEUTRAL;
    case 'NO-SHOW':
      return DANGER;
    default:
      return NEUTRAL;
  }
}

export function patientTone(status: PatientStatus): StatusTone {
  switch (status) {
    case 'IN TREATMENT':
      return CYAN;
    case 'ACTIVE':
      return SUCCESS;
    case 'NEW':
      return DARK;
    case 'FOLLOW-UP':
      return WARN;
    case 'INACTIVE':
      return NEUTRAL;
    default:
      return NEUTRAL;
  }
}

export function treatmentTone(status: TreatmentStatus): StatusTone {
  switch (status) {
    case 'IN PROGRESS':
      return CYAN;
    case 'COMPLETED':
      return SUCCESS;
    case 'ACCEPTED':
      return DARK;
    case 'PROPOSED':
      return WARN;
    case 'CANCELLED':
      return NEUTRAL;
    default:
      return NEUTRAL;
  }
}

export function inventoryTone(status: InventoryStatus): StatusTone {
  switch (status) {
    case 'IN STOCK':
      return SUCCESS;
    case 'LOW STOCK':
      return WARN;
    case 'OUT OF STOCK':
      return DANGER;
    case 'EXPIRING':
      return WARN;
    case 'EXPIRED':
      return DANGER;
    default:
      return NEUTRAL;
  }
}

export function invoiceTone(status: InvoiceStatus): StatusTone {
  switch (status) {
    case 'PAID':
      return SUCCESS;
    case 'PENDING':
      return CYAN;
    case 'OVERDUE':
      return DANGER;
    default:
      return NEUTRAL;
  }
}

/** Odontogram fill colours. Kept deliberately muted and clinical. */
export const TOOTH_CONDITION_STYLE: Record<
  ToothCondition,
  { fill: string; stroke: string; label: string; hatch: boolean }
> = {
  HEALTHY: { fill: '#FFFFFF', stroke: 'rgba(43,48,51,0.28)', label: 'HEALTHY', hatch: false },
  CARIES: { fill: '#E8D6B8', stroke: '#B08A4A', label: 'CARIES', hatch: false },
  FILLED: { fill: '#C9CED1', stroke: '#7E868B', label: 'FILLED', hatch: false },
  CROWN: { fill: '#15BCDF', stroke: '#0FA3C2', label: 'CROWN', hatch: false },
  IMPLANT: { fill: '#1A1C1E', stroke: '#1A1C1E', label: 'IMPLANT', hatch: false },
  'ROOT CANAL': { fill: '#A8DCE8', stroke: '#0FA3C2', label: 'ROOT CANAL', hatch: true },
  MISSING: { fill: 'transparent', stroke: 'rgba(43,48,51,0.22)', label: 'MISSING', hatch: false },
  EXTRACTION: { fill: '#F0DCDA', stroke: '#B03A34', label: 'EXTRACTION', hatch: false },
  FRACTURE: { fill: '#F5E3E1', stroke: '#B03A34', label: 'FRACTURE', hatch: true },
};

/* ============================================================
   DERIVED STATUS
   ============================================================ */

/**
 * Inventory status is derived rather than stored, so quantity edits and the
 * passage of time can never leave a stale badge behind.
 */
export function inventoryStatus(
  item: InventoryItem,
  today: ISODate,
): InventoryStatus {
  if (item.expirationDate) {
    const days = daysBetween(today, item.expirationDate);
    if (days < 0) return 'EXPIRED';
    if (days <= 30) return 'EXPIRING';
  }
  if (item.quantity <= 0) return 'OUT OF STOCK';
  if (item.quantity <= item.minimumQuantity) return 'LOW STOCK';
  return 'IN STOCK';
}

/** Days until an item crosses its minimum threshold, given current usage. */
export function daysUntilMinimum(item: InventoryItem): number | null {
  if (item.dailyUsage <= 0) return null;
  const headroom = item.quantity - item.minimumQuantity;
  if (headroom <= 0) return 0;
  return Math.floor(headroom / item.dailyUsage);
}

export function inventoryValue(item: InventoryItem): number {
  return item.quantity * item.unitPrice;
}

export function isPastAppointment(
  appointment: Appointment,
  today: ISODate,
): boolean {
  return daysBetween(today, appointment.date) < 0;
}

/* ============================================================
   ROLE PERMISSIONS
   ============================================================ */

const ALL_PERMISSIONS: PermissionKey[] = [
  'overview',
  'patients',
  'appointments',
  'treatments',
  'dental-chart',
  'inventory',
  'billing',
  'analytics',
  'ai',
  'staff',
  'settings',
];

export const ROLE_PERMISSIONS: Record<StaffRole, PermissionKey[]> = {
  OWNER: ALL_PERMISSIONS,
  DENTIST: [
    'overview',
    'patients',
    'dental-chart',
    'treatments',
    'appointments',
    'ai',
  ],
  ASSISTANT: ['overview', 'patients', 'appointments', 'inventory'],
  RECEPTIONIST: ['overview', 'patients', 'appointments', 'billing'],
  MANAGER: ['overview', 'analytics', 'inventory', 'staff', 'billing', 'ai'],
};

export function can(role: StaffRole, permission: PermissionKey): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export const ROLE_DESCRIPTION: Record<StaffRole, string> = {
  OWNER: 'Full access to every module, billing and clinic configuration.',
  DENTIST: 'Clinical access: patients, dental charts, treatments and schedule.',
  ASSISTANT: 'Supports chairside work, patient prep and inventory handling.',
  RECEPTIONIST: 'Front desk: patient records, scheduling and invoicing.',
  MANAGER: 'Business oversight: analytics, inventory, staff and billing.',
};

/* ============================================================
   COLLECTIONS
   ============================================================ */

export function sortBy<T>(
  items: T[],
  key: (item: T) => string | number | null,
  direction: 'asc' | 'desc' = 'asc',
): T[] {
  const factor = direction === 'asc' ? 1 : -1;
  return [...items].sort((a, b) => {
    const av = key(a);
    const bv = key(b);
    if (av === null && bv === null) return 0;
    if (av === null) return 1;
    if (bv === null) return -1;
    if (typeof av === 'number' && typeof bv === 'number') {
      return (av - bv) * factor;
    }
    return String(av).localeCompare(String(bv)) * factor;
  });
}

export function groupBy<T, K extends string>(
  items: T[],
  key: (item: T) => K,
): Record<K, T[]> {
  return items.reduce((acc, item) => {
    const k = key(item);
    (acc[k] ||= []).push(item);
    return acc;
  }, {} as Record<K, T[]>);
}

export function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

export function paginate<T>(items: T[], page: number, perPage: number): T[] {
  const start = (page - 1) * perPage;
  return items.slice(start, start + perPage);
}

export function pageCount(total: number, perPage: number): number {
  return Math.max(1, Math.ceil(total / perPage));
}

/* ============================================================
   MISC
   ============================================================ */

export function createId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

/** Deterministic pseudo-random generator — keeps mock data stable per build. */
export function seededRandom(seed: number): () => number {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
