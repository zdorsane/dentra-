'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';

import * as mock from './mock-data';
import { createId, daysBetween } from './utils';

import type {
  Appointment,
  ClockTime,
  InventoryItem,
  Invoice,
  Notification,
  Patient,
  Payment,
  SessionUser,
  StaffMember,
  Tooth,
  Treatment,
} from '@/types';

/**
 * DENTRA client data store.
 *
 * In demo mode the whole clinic lives in React state seeded from
 * `lib/mock-data`. Mutations are local and last for the session, which is
 * enough to make every form, modal and table genuinely functional without a
 * backend. When Supabase is configured these same methods become the place
 * where queries and mutations are issued.
 */

interface ClinicData {
  patients: Patient[];
  appointments: Appointment[];
  treatments: Treatment[];
  teeth: Tooth[];
  inventory: InventoryItem[];
  invoices: Invoice[];
  payments: Payment[];
  notifications: Notification[];
  staff: StaffMember[];
}

interface StoreValue extends ClinicData {
  /** The demo clinic's fixed "today". */
  today: string;
  clinic: typeof mock.clinic;
  clinicStats: typeof mock.clinicStats;
  session: SessionUser | null;
  setSession: (user: SessionUser | null) => void;

  /** True until the initial (simulated) load resolves. */
  loading: boolean;
  error: string | null;
  reload: () => void;

  // Patients
  addPatient: (patient: Patient) => void;
  updatePatient: (patient: Patient) => void;
  deletePatient: (id: string) => void;

  // Teeth
  updateTooth: (tooth: Tooth) => void;

  // Appointments
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (appointment: Appointment) => void;
  deleteAppointment: (id: string) => void;

  // Treatments
  addTreatment: (treatment: Treatment) => void;
  updateTreatment: (treatment: Treatment) => void;

  // Inventory
  addInventoryItem: (item: InventoryItem) => void;
  updateInventoryItem: (item: InventoryItem) => void;
  deleteInventoryItem: (id: string) => void;

  // Billing
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (invoice: Invoice) => void;
  markInvoicePaid: (id: string, method: Invoice['paymentMethod']) => void;

  // Staff
  addStaffMember: (member: StaffMember) => void;
  updateStaffMember: (member: StaffMember) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  unreadCount: number;
}

const StoreContext = createContext<StoreValue | null>(null);

function seed(): ClinicData {
  return {
    patients: [...mock.patients],
    appointments: [...mock.appointments],
    treatments: [...mock.treatments],
    teeth: [...mock.teeth],
    inventory: [...mock.inventory],
    invoices: [...mock.invoices],
    payments: [...mock.payments],
    notifications: [...mock.notifications],
    staff: [...mock.staff],
  };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ClinicData>(seed);
  const [session, setSessionState] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate the initial fetch so skeleton states are exercised on every load.
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 420);
    return () => clearTimeout(timer);
  }, []);

  const reload = useCallback(() => {
    setError(null);
    setLoading(true);
    setData(seed());
    setTimeout(() => setLoading(false), 420);
  }, []);

  /* ---------------- patients ---------------- */

  const addPatient = useCallback((patient: Patient) => {
    setData((current) => ({
      ...current,
      patients: [patient, ...current.patients],
      // A new patient starts with a complete, healthy chart.
      teeth: [
        ...current.teeth,
        ...mock.ALL_TEETH.map((number) => ({
          id: `tooth_${patient.id}_${number}`,
          clinicId: patient.clinicId,
          patientId: patient.id,
          number,
          quadrant: mock.toothQuadrant(number),
          arch: mock.toothArch(number),
          name: mock.toothName(number),
          condition: 'HEALTHY' as const,
          status: 'STABLE' as const,
          treatment: '',
          notes: '',
          lastUpdated: mock.DEMO_TODAY,
        })),
      ],
    }));
  }, []);

  const updatePatient = useCallback((patient: Patient) => {
    setData((current) => ({
      ...current,
      patients: current.patients.map((p) => (p.id === patient.id ? patient : p)),
    }));
  }, []);

  const deletePatient = useCallback((id: string) => {
    setData((current) => ({
      ...current,
      patients: current.patients.filter((p) => p.id !== id),
      teeth: current.teeth.filter((t) => t.patientId !== id),
      appointments: current.appointments.filter((a) => a.patientId !== id),
    }));
  }, []);

  /* ---------------- teeth ---------------- */

  const updateTooth = useCallback((tooth: Tooth) => {
    setData((current) => ({
      ...current,
      teeth: current.teeth.map((t) =>
        t.id === tooth.id ? { ...tooth, lastUpdated: mock.DEMO_TODAY } : t,
      ),
    }));
  }, []);

  /* ---------------- appointments ---------------- */

  const addAppointment = useCallback((appointment: Appointment) => {
    setData((current) => ({
      ...current,
      appointments: [...current.appointments, appointment].sort((a, b) =>
        a.date === b.date
          ? a.startTime.localeCompare(b.startTime)
          : a.date.localeCompare(b.date),
      ),
    }));
  }, []);

  const updateAppointment = useCallback((appointment: Appointment) => {
    setData((current) => ({
      ...current,
      appointments: current.appointments.map((a) =>
        a.id === appointment.id ? appointment : a,
      ),
    }));
  }, []);

  const deleteAppointment = useCallback((id: string) => {
    setData((current) => ({
      ...current,
      appointments: current.appointments.filter((a) => a.id !== id),
    }));
  }, []);

  /* ---------------- treatments ---------------- */

  const addTreatment = useCallback((treatment: Treatment) => {
    setData((current) => ({
      ...current,
      treatments: [treatment, ...current.treatments],
    }));
  }, []);

  const updateTreatment = useCallback((treatment: Treatment) => {
    setData((current) => ({
      ...current,
      treatments: current.treatments.map((t) =>
        t.id === treatment.id ? treatment : t,
      ),
    }));
  }, []);

  /* ---------------- inventory ---------------- */

  const addInventoryItem = useCallback((item: InventoryItem) => {
    setData((current) => ({ ...current, inventory: [item, ...current.inventory] }));
  }, []);

  const updateInventoryItem = useCallback((item: InventoryItem) => {
    setData((current) => ({
      ...current,
      inventory: current.inventory.map((i) => (i.id === item.id ? item : i)),
    }));
  }, []);

  const deleteInventoryItem = useCallback((id: string) => {
    setData((current) => ({
      ...current,
      inventory: current.inventory.filter((i) => i.id !== id),
    }));
  }, []);

  /* ---------------- billing ---------------- */

  const addInvoice = useCallback((invoice: Invoice) => {
    setData((current) => ({ ...current, invoices: [invoice, ...current.invoices] }));
  }, []);

  const updateInvoice = useCallback((invoice: Invoice) => {
    setData((current) => ({
      ...current,
      invoices: current.invoices.map((i) => (i.id === invoice.id ? invoice : i)),
    }));
  }, []);

  const markInvoicePaid = useCallback(
    (id: string, method: Invoice['paymentMethod']) => {
      setData((current) => {
        const invoice = current.invoices.find((i) => i.id === id);
        if (!invoice) return current;

        return {
          ...current,
          invoices: current.invoices.map((i) =>
            i.id === id ? { ...i, status: 'PAID' as const, paymentMethod: method } : i,
          ),
          payments: [
            {
              id: createId('pay'),
              clinicId: invoice.clinicId,
              invoiceId: invoice.id,
              patientId: invoice.patientId,
              patientName: invoice.patientName,
              amount: invoice.amount,
              method,
              date: mock.DEMO_TODAY,
              reference: `PAY-2026-${Math.floor(4200 + Math.random() * 500)}`,
            },
            ...current.payments,
          ],
        };
      });
    },
    [],
  );

  /* ---------------- staff ---------------- */

  const addStaffMember = useCallback((member: StaffMember) => {
    setData((current) => ({ ...current, staff: [...current.staff, member] }));
  }, []);

  const updateStaffMember = useCallback((member: StaffMember) => {
    setData((current) => ({
      ...current,
      staff: current.staff.map((s) => (s.id === member.id ? member : s)),
    }));
  }, []);

  /* ---------------- notifications ---------------- */

  const markNotificationRead = useCallback((id: string) => {
    setData((current) => ({
      ...current,
      notifications: current.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      ),
    }));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setData((current) => ({
      ...current,
      notifications: current.notifications.map((n) => ({ ...n, read: true })),
    }));
  }, []);

  const unreadCount = useMemo(
    () => data.notifications.filter((n) => !n.read).length,
    [data.notifications],
  );

  const setSession = useCallback((user: SessionUser | null) => {
    setSessionState(user);
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      ...data,
      today: mock.DEMO_TODAY,
      clinic: mock.clinic,
      clinicStats: mock.clinicStats,
      session,
      setSession,
      loading,
      error,
      reload,
      addPatient,
      updatePatient,
      deletePatient,
      updateTooth,
      addAppointment,
      updateAppointment,
      deleteAppointment,
      addTreatment,
      updateTreatment,
      addInventoryItem,
      updateInventoryItem,
      deleteInventoryItem,
      addInvoice,
      updateInvoice,
      markInvoicePaid,
      addStaffMember,
      updateStaffMember,
      markNotificationRead,
      markAllNotificationsRead,
      unreadCount,
    }),
    [
      data,
      session,
      setSession,
      loading,
      error,
      reload,
      addPatient,
      updatePatient,
      deletePatient,
      updateTooth,
      addAppointment,
      updateAppointment,
      deleteAppointment,
      addTreatment,
      updateTreatment,
      addInventoryItem,
      updateInventoryItem,
      deleteInventoryItem,
      addInvoice,
      updateInvoice,
      markInvoicePaid,
      addStaffMember,
      updateStaffMember,
      markNotificationRead,
      markAllNotificationsRead,
      unreadCount,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider.');
  }
  return context;
}

/* ============================================================
   DERIVED SELECTORS
   ============================================================ */

export function usePatient(id: string): Patient | undefined {
  const { patients } = useStore();
  return useMemo(() => patients.find((p) => p.id === id), [patients, id]);
}

export function useTeethFor(patientId: string): Tooth[] {
  const { teeth } = useStore();
  return useMemo(
    () => teeth.filter((t) => t.patientId === patientId),
    [teeth, patientId],
  );
}

export function useAppointmentsOn(date: string): Appointment[] {
  const { appointments } = useStore();
  return useMemo(
    () =>
      appointments
        .filter((a) => a.date === date)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [appointments, date],
  );
}

/** Patients with no upcoming visit who last attended over six months ago. */
export function useRecallList(): Patient[] {
  const { patients, today } = useStore();
  return useMemo(
    () =>
      patients.filter((patient) => {
        if (!patient.lastVisit || patient.nextAppointment) return false;
        return daysBetween(patient.lastVisit, today) >= 180;
      }),
    [patients, today],
  );
}

/* ============================================================
   HELPERS
   ============================================================ */

/** Adds minutes to an `HH:MM` clock time. */
export function addMinutes(time: ClockTime, minutes: number): ClockTime {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(
    total % 60,
  ).padStart(2, '0')}`;
}
