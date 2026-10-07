/**
 * DENTRA — Domain model
 *
 * Every entity carries `clinicId` so the same shapes map 1:1 onto the
 * multi-tenant Postgres schema described in `lib/database.ts`.
 */

/* ============================================================
   PRIMITIVES
   ============================================================ */

/** ISO-8601 date, `YYYY-MM-DD`. */
export type ISODate = string;
/** ISO-8601 timestamp. */
export type ISODateTime = string;
/** 24h clock time, `HH:MM`. */
export type ClockTime = string;

export type ID = string;

/* ============================================================
   CLINIC
   ============================================================ */

export interface WorkingHours {
  /** 0 = Sunday … 6 = Saturday */
  day: number;
  open: ClockTime;
  close: ClockTime;
  closed: boolean;
}

export interface Clinic {
  id: ID;
  name: string;
  legalName: string;
  email: string;
  phone: string;
  addressLine: string;
  city: string;
  country: string;
  postalCode: string;
  taxId: string;
  timezone: string;
  currency: string;
  workingHours: WorkingHours[];
  services: string[];
  createdAt: ISODateTime;
}

/* ============================================================
   USERS & STAFF
   ============================================================ */

export type StaffRole =
  | 'OWNER'
  | 'DENTIST'
  | 'ASSISTANT'
  | 'RECEPTIONIST'
  | 'MANAGER';

export type PermissionKey =
  | 'overview'
  | 'patients'
  | 'appointments'
  | 'treatments'
  | 'dental-chart'
  | 'inventory'
  | 'billing'
  | 'analytics'
  | 'ai'
  | 'staff'
  | 'settings';

export interface User {
  id: ID;
  clinicId: ID;
  fullName: string;
  email: string;
  phone: string;
  role: StaffRole;
  avatarInitials: string;
  createdAt: ISODateTime;
}

export type StaffStatus = 'ACTIVE' | 'ON LEAVE' | 'INACTIVE';

export interface StaffMember {
  id: ID;
  clinicId: ID;
  userId: ID;
  fullName: string;
  email: string;
  phone: string;
  role: StaffRole;
  specialty: string;
  licenseNumber: string;
  status: StaffStatus;
  joinedAt: ISODate;
  avatarInitials: string;
  /** Weekly scheduled hours. */
  weeklyHours: number;
  color: string;
}

/* ============================================================
   PATIENTS
   ============================================================ */

export type PatientStatus =
  | 'ACTIVE'
  | 'NEW'
  | 'IN TREATMENT'
  | 'FOLLOW-UP'
  | 'INACTIVE';

export type Gender = 'FEMALE' | 'MALE' | 'OTHER';

export interface MedicalAlert {
  id: ID;
  label: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  note: string;
}

export interface MedicalHistoryEntry {
  id: ID;
  date: ISODate;
  category: 'CONDITION' | 'MEDICATION' | 'ALLERGY' | 'SURGERY' | 'NOTE';
  label: string;
  detail: string;
}

export interface PatientDocument {
  id: ID;
  name: string;
  kind: 'RADIOGRAPH' | 'CONSENT' | 'REPORT' | 'SCAN' | 'INVOICE';
  date: ISODate;
  sizeKb: number;
}

export interface PatientNote {
  id: ID;
  author: string;
  date: ISODateTime;
  body: string;
}

export interface Patient {
  id: ID;
  clinicId: ID;
  fileNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  age: number;
  dateOfBirth: ISODate;
  gender: Gender;
  phone: string;
  email: string;
  addressLine: string;
  city: string;
  country: string;
  insuranceProvider: string;
  insuranceNumber: string;
  status: PatientStatus;
  lastVisit: ISODate | null;
  nextAppointment: ISODate | null;
  primaryTreatment: string;
  assignedDentistId: ID;
  balance: number;
  medicalAlerts: MedicalAlert[];
  medicalHistory: MedicalHistoryEntry[];
  documents: PatientDocument[];
  notes: PatientNote[];
  avatarInitials: string;
  createdAt: ISODateTime;
}

/* ============================================================
   ODONTOGRAM / TEETH
   ============================================================ */

export type ToothCondition =
  | 'HEALTHY'
  | 'CARIES'
  | 'FILLED'
  | 'CROWN'
  | 'IMPLANT'
  | 'ROOT CANAL'
  | 'MISSING'
  | 'EXTRACTION'
  | 'FRACTURE';

export type ToothStatus =
  | 'STABLE'
  | 'MONITOR'
  | 'TREATMENT REQUIRED'
  | 'IN TREATMENT'
  | 'TREATED';

/** Quadrants follow FDI notation. */
export type ToothQuadrant = 1 | 2 | 3 | 4;

export type ToothArch = 'UPPER' | 'LOWER';

export interface Tooth {
  id: ID;
  clinicId: ID;
  patientId: ID;
  /** FDI two-digit number, e.g. 11, 26, 37, 48. */
  number: number;
  quadrant: ToothQuadrant;
  arch: ToothArch;
  /** Anatomical name, e.g. "Central incisor". */
  name: string;
  condition: ToothCondition;
  status: ToothStatus;
  treatment: string;
  notes: string;
  lastUpdated: ISODate;
}

/* ============================================================
   APPOINTMENTS
   ============================================================ */

export type AppointmentStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO-SHOW';

export interface Appointment {
  id: ID;
  clinicId: ID;
  patientId: ID;
  patientName: string;
  dentistId: ID;
  dentistName: string;
  treatment: string;
  date: ISODate;
  startTime: ClockTime;
  endTime: ClockTime;
  durationMinutes: number;
  status: AppointmentStatus;
  room: string;
  notes: string;
  createdAt: ISODateTime;
}

/* ============================================================
   TREATMENTS
   ============================================================ */

export type TreatmentStatus =
  | 'PROPOSED'
  | 'ACCEPTED'
  | 'IN PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type TreatmentStepStatus = 'DONE' | 'ACTIVE' | 'PENDING';

export interface TreatmentStep {
  id: ID;
  label: string;
  date: ISODate | null;
  status: TreatmentStepStatus;
  note: string;
}

export interface Treatment {
  id: ID;
  clinicId: ID;
  patientId: ID;
  patientName: string;
  dentistId: ID;
  dentistName: string;
  type: string;
  category: string;
  /** FDI tooth numbers involved. */
  teeth: number[];
  startDate: ISODate;
  expectedCompletion: ISODate;
  price: number;
  status: TreatmentStatus;
  steps: TreatmentStep[];
  notes: string;
}

/* ============================================================
   INVENTORY
   ============================================================ */

export type InventoryCategory =
  | 'COMPOSITE'
  | 'ANESTHETIC'
  | 'GLOVES'
  | 'MASKS'
  | 'IMPLANTS'
  | 'INSTRUMENTS'
  | 'DISINFECTANTS'
  | 'CONSUMABLES'
  | 'OTHER';

export type InventoryStatus =
  | 'IN STOCK'
  | 'LOW STOCK'
  | 'OUT OF STOCK'
  | 'EXPIRING'
  | 'EXPIRED';

export interface Supplier {
  id: ID;
  clinicId: ID;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  country: string;
  leadTimeDays: number;
}

export interface InventoryItem {
  id: ID;
  clinicId: ID;
  name: string;
  sku: string;
  category: InventoryCategory;
  quantity: number;
  minimumQuantity: number;
  unit: string;
  unitPrice: number;
  supplierId: ID;
  supplierName: string;
  expirationDate: ISODate | null;
  batchNumber: string;
  /** Average units consumed per day — drives the AI depletion forecast. */
  dailyUsage: number;
  lastRestocked: ISODate;
  location: string;
}

/* ============================================================
   BILLING
   ============================================================ */

export type InvoiceStatus = 'PAID' | 'PENDING' | 'OVERDUE';

export type PaymentMethod =
  | 'CARD'
  | 'CASH'
  | 'TRANSFER'
  | 'INSURANCE'
  | 'UNPAID';

export interface InvoiceLine {
  id: ID;
  label: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: ID;
  clinicId: ID;
  number: string;
  patientId: ID;
  patientName: string;
  treatmentId: ID | null;
  treatment: string;
  lines: InvoiceLine[];
  amount: number;
  taxRate: number;
  issuedDate: ISODate;
  dueDate: ISODate;
  status: InvoiceStatus;
  paymentMethod: PaymentMethod;
}

export interface Payment {
  id: ID;
  clinicId: ID;
  invoiceId: ID;
  patientId: ID;
  patientName: string;
  amount: number;
  method: PaymentMethod;
  date: ISODate;
  reference: string;
}

/* ============================================================
   NOTIFICATIONS
   ============================================================ */

export type NotificationKind =
  | 'APPOINTMENT'
  | 'INVENTORY'
  | 'PATIENT'
  | 'BILLING'
  | 'SYSTEM'
  | 'AI';

export type NotificationSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface Notification {
  id: ID;
  clinicId: ID;
  kind: NotificationKind;
  severity: NotificationSeverity;
  title: string;
  body: string;
  createdAt: ISODateTime;
  read: boolean;
  href: string | null;
}

/* ============================================================
   AI
   ============================================================ */

export type AIRole = 'user' | 'assistant' | 'system';

export interface AIDataPoint {
  label: string;
  value: string;
}

export interface AIMessage {
  id: ID;
  role: AIRole;
  content: string;
  createdAt: ISODateTime;
  /** Structured facts rendered as a technical table under the answer. */
  data?: AIDataPoint[];
  /** Follow-up prompts offered to the user. */
  suggestions?: string[];
  pending?: boolean;
}

export interface AIInsight {
  id: ID;
  title: string;
  body: string;
  severity: NotificationSeverity;
  metric: string;
  href: string | null;
}

/* ============================================================
   ANALYTICS
   ============================================================ */

export type AnalyticsRange = '7D' | '30D' | '3M' | '12M';

export interface AnalyticsMetric {
  id: ID;
  key: string;
  label: string;
  value: number;
  formatted: string;
  /** Percentage change vs. the previous equivalent period. */
  delta: number;
  direction: 'up' | 'down' | 'flat';
  /** Whether an upward delta is a good outcome. */
  positiveIsUp: boolean;
  unit: string;
}

export interface TimeSeriesPoint {
  label: string;
  revenue: number;
  appointments: number;
  newPatients: number;
  returningPatients: number;
  noShows: number;
  inventoryCost: number;
}

export interface CategoryDatum {
  label: string;
  value: number;
}

/* ============================================================
   AUTH / SESSION
   ============================================================ */

export interface SessionUser {
  id: ID;
  clinicId: ID;
  clinicName: string;
  fullName: string;
  email: string;
  role: StaffRole;
  avatarInitials: string;
}

export interface AuthResult {
  ok: boolean;
  error?: string;
  user?: SessionUser;
}

/* ============================================================
   UI SUPPORT
   ============================================================ */

export type ToastVariant = 'success' | 'error' | 'info';

export interface Toast {
  id: ID;
  title: string;
  description?: string;
  variant: ToastVariant;
}

export interface OnboardingState {
  clinicName: string;
  clinicType: string;
  dentistName: string;
  licenseNumber: string;
  specialty: string;
  addressLine: string;
  city: string;
  country: string;
  workingHours: WorkingHours[];
  services: string[];
  invites: { email: string; role: StaffRole }[];
}
