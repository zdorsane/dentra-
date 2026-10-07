'use client';

import { useState } from 'react';

import { ChamferButton } from '@/components/ui/ChamferButton';
import { Modal } from '@/components/ui/Modal';
import { SelectInput, TextInput } from '@/components/ui/Form';
import { DEMO_TODAY, clinic } from '@/lib/mock-data';
import { useStore } from '@/lib/store';
import { createId, initials } from '@/lib/utils';
import type { Gender, Patient, PatientStatus } from '@/types';

interface PatientFormModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (patient: Patient) => void;
}

interface FormState {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  phone: string;
  email: string;
  addressLine: string;
  city: string;
  insuranceProvider: string;
  assignedDentistId: string;
  primaryTreatment: string;
  status: PatientStatus;
}

const EMPTY: FormState = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: 'FEMALE',
  phone: '',
  email: '',
  addressLine: '',
  city: clinic.city,
  insuranceProvider: 'Self-pay',
  assignedDentistId: '',
  primaryTreatment: 'Initial consultation',
  status: 'NEW',
};

/** Whole years between a date of birth and the clinic's "today". */
function ageFrom(dateOfBirth: string): number {
  if (!dateOfBirth) return 0;
  const birth = new Date(dateOfBirth);
  const today = new Date(DEMO_TODAY);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDelta = today.getMonth() - birth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return Math.max(age, 0);
}

export function PatientFormModal({
  open,
  onClose,
  onCreated,
}: PatientFormModalProps) {
  const { staff, patients, addPatient } = useStore();
  const dentists = staff.filter((s) => s.role === 'DENTIST' || s.role === 'OWNER');

  const [form, setForm] = useState<FormState>({
    ...EMPTY,
    assignedDentistId: dentists[0]?.id ?? '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};

    if (!form.firstName.trim()) next.firstName = 'Required';
    if (!form.lastName.trim()) next.lastName = 'Required';
    if (!form.phone.trim()) next.phone = 'Required';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = 'Invalid email address';
    }
    if (!form.dateOfBirth) {
      next.dateOfBirth = 'Required';
    } else if (form.dateOfBirth > DEMO_TODAY) {
      next.dateOfBirth = 'Date must be in the past';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`;
    const id = createId('pat');

    const patient: Patient = {
      id,
      clinicId: clinic.id,
      fileNumber: `AUR-${2400 + patients.length + 1}`,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      fullName,
      age: ageFrom(form.dateOfBirth),
      dateOfBirth: form.dateOfBirth,
      gender: form.gender,
      phone: form.phone.trim(),
      email: form.email.trim(),
      addressLine: form.addressLine.trim(),
      city: form.city.trim(),
      country: clinic.country,
      insuranceProvider: form.insuranceProvider,
      insuranceNumber: form.insuranceProvider === 'Self-pay' ? '—' : 'PENDING',
      status: form.status,
      lastVisit: null,
      nextAppointment: null,
      primaryTreatment: form.primaryTreatment,
      assignedDentistId: form.assignedDentistId,
      balance: 0,
      medicalAlerts: [],
      medicalHistory: [],
      documents: [],
      notes: [],
      avatarInitials: initials(fullName),
      createdAt: new Date().toISOString(),
    };

    addPatient(patient);
    onCreated(patient);
    setForm({ ...EMPTY, assignedDentistId: dentists[0]?.id ?? '' });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="ADD PATIENT"
      eyebrow="PATIENT REGISTRY"
      size="lg"
      footer={
        <>
          <ChamferButton variant="secondary" size="sm" onClick={onClose}>
            CANCEL
          </ChamferButton>
          <ChamferButton size="sm" type="submit" form="patient-form">
            CREATE PATIENT
          </ChamferButton>
        </>
      }
    >
      <form id="patient-form" onSubmit={onSubmit} noValidate className="space-y-5">
        <fieldset className="space-y-4">
          <legend className="dt-label mb-3 text-[9px]">IDENTITY</legend>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              label="FIRST NAME"
              required
              value={form.firstName}
              error={errors.firstName}
              onChange={(event) => set('firstName', event.target.value)}
            />
            <TextInput
              label="LAST NAME"
              required
              value={form.lastName}
              error={errors.lastName}
              onChange={(event) => set('lastName', event.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              label="DATE OF BIRTH"
              type="date"
              required
              max={DEMO_TODAY}
              value={form.dateOfBirth}
              error={errors.dateOfBirth}
              hint={form.dateOfBirth ? `${ageFrom(form.dateOfBirth)} years old` : undefined}
              onChange={(event) => set('dateOfBirth', event.target.value)}
            />
            <SelectInput
              label="GENDER"
              value={form.gender}
              onChange={(event) => set('gender', event.target.value as Gender)}
              options={[
                { value: 'FEMALE', label: 'FEMALE' },
                { value: 'MALE', label: 'MALE' },
                { value: 'OTHER', label: 'OTHER' },
              ]}
            />
          </div>
        </fieldset>

        <fieldset className="space-y-4 border-t border-[rgba(43,48,51,0.1)] pt-5">
          <legend className="dt-label mb-3 text-[9px]">CONTACT</legend>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              label="PHONE"
              type="tel"
              required
              placeholder="+33 6 00 00 00 00"
              value={form.phone}
              error={errors.phone}
              onChange={(event) => set('phone', event.target.value)}
            />
            <TextInput
              label="EMAIL"
              type="email"
              placeholder="name@example.com"
              value={form.email}
              error={errors.email}
              onChange={(event) => set('email', event.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              label="ADDRESS"
              value={form.addressLine}
              onChange={(event) => set('addressLine', event.target.value)}
            />
            <TextInput
              label="CITY"
              value={form.city}
              onChange={(event) => set('city', event.target.value)}
            />
          </div>
        </fieldset>

        <fieldset className="space-y-4 border-t border-[rgba(43,48,51,0.1)] pt-5">
          <legend className="dt-label mb-3 text-[9px]">CLINICAL</legend>

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectInput
              label="ASSIGNED DENTIST"
              value={form.assignedDentistId}
              onChange={(event) => set('assignedDentistId', event.target.value)}
              options={dentists.map((d) => ({ value: d.id, label: d.fullName }))}
            />
            <SelectInput
              label="STATUS"
              value={form.status}
              onChange={(event) => set('status', event.target.value as PatientStatus)}
              options={[
                { value: 'NEW', label: 'NEW' },
                { value: 'ACTIVE', label: 'ACTIVE' },
                { value: 'IN TREATMENT', label: 'IN TREATMENT' },
                { value: 'FOLLOW-UP', label: 'FOLLOW-UP' },
              ]}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              label="PRIMARY TREATMENT"
              value={form.primaryTreatment}
              onChange={(event) => set('primaryTreatment', event.target.value)}
            />
            <SelectInput
              label="INSURANCE"
              value={form.insuranceProvider}
              onChange={(event) => set('insuranceProvider', event.target.value)}
              options={[
                'Self-pay',
                'Harmonie Mutuelle',
                'MGEN',
                'AXA Santé',
                'Malakoff Humanis',
                'Alan',
              ].map((provider) => ({ value: provider, label: provider }))}
            />
          </div>
        </fieldset>

        <p className="border-t border-[rgba(43,48,51,0.1)] pt-4 text-[11px] leading-[1.6] text-[#6B6F72]">
          A full odontogram is created automatically for every new patient, with
          all 32 teeth recorded as healthy until charted.
        </p>
      </form>
    </Modal>
  );
}
