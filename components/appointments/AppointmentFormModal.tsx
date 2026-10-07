'use client';

import { useState } from 'react';

import { ChamferButton } from '@/components/ui/ChamferButton';
import { Modal } from '@/components/ui/Modal';
import { SelectInput, TextArea, TextInput } from '@/components/ui/Form';
import { clinic } from '@/lib/mock-data';
import { addMinutes, useStore } from '@/lib/store';
import { createId } from '@/lib/utils';
import type { Appointment, AppointmentStatus } from '@/types';

const TREATMENTS = [
  'Routine check-up',
  'Scaling & polishing',
  'Composite filling',
  'Root canal — session 1',
  'Root canal — session 2',
  'Crown preparation',
  'Crown fitting',
  'Implant placement',
  'Implant review',
  'Aligner review',
  'Extraction',
  'Whitening session',
  'Periodontal maintenance',
  'Emergency consultation',
  'Initial consultation',
];

const ROOMS = ['SURGERY 01', 'SURGERY 02', 'SURGERY 03', 'HYGIENE ROOM'];

const DURATIONS = [15, 30, 45, 60, 90, 120];

interface AppointmentFormModalProps {
  open: boolean;
  onClose: () => void;
  /** Pre-fills the date when opened from a calendar cell. */
  defaultDate: string;
  onCreated: (appointment: Appointment) => void;
}

export function AppointmentFormModal({
  open,
  onClose,
  defaultDate,
  onCreated,
}: AppointmentFormModalProps) {
  const { patients, staff, appointments, addAppointment } = useStore();
  const dentists = staff.filter((s) => s.role === 'DENTIST' || s.role === 'OWNER');

  const [patientId, setPatientId] = useState(patients[0]?.id ?? '');
  const [dentistId, setDentistId] = useState(dentists[0]?.id ?? '');
  const [treatment, setTreatment] = useState(TREATMENTS[0]);
  const [date, setDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState('09:00');
  const [duration, setDuration] = useState(45);
  const [room, setRoom] = useState(ROOMS[0]);
  const [status, setStatus] = useState<AppointmentStatus>('SCHEDULED');
  const [notes, setNotes] = useState('');
  const [conflict, setConflict] = useState<string | null>(null);

  // Keep the date in step with the calendar selection while closed.
  if (!open && date !== defaultDate) setDate(defaultDate);

  const endTime = addMinutes(startTime, duration);

  /** Rejects a booking that overlaps an existing one in the same room. */
  const findConflict = (): string | null => {
    const clash = appointments.find((a) => {
      if (a.date !== date || a.room !== room) return false;
      if (a.status === 'CANCELLED') return false;
      return a.startTime < endTime && startTime < a.endTime;
    });

    if (clash) {
      return `${room} is already booked ${clash.startTime}–${clash.endTime} for ${clash.patientName}.`;
    }
    return null;
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const clash = findConflict();
    if (clash) {
      setConflict(clash);
      return;
    }

    const patient = patients.find((p) => p.id === patientId);
    const dentist = staff.find((s) => s.id === dentistId);
    if (!patient || !dentist) return;

    const appointment: Appointment = {
      id: createId('apt'),
      clinicId: clinic.id,
      patientId: patient.id,
      patientName: patient.fullName,
      dentistId: dentist.id,
      dentistName: dentist.fullName,
      treatment,
      date,
      startTime,
      endTime,
      durationMinutes: duration,
      status,
      room,
      notes,
      createdAt: new Date().toISOString(),
    };

    addAppointment(appointment);
    onCreated(appointment);
    setConflict(null);
    setNotes('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="NEW APPOINTMENT"
      eyebrow="SCHEDULE"
      size="md"
      footer={
        <>
          <ChamferButton variant="secondary" size="sm" onClick={onClose}>
            CANCEL
          </ChamferButton>
          <ChamferButton size="sm" type="submit" form="appointment-form">
            CREATE APPOINTMENT
          </ChamferButton>
        </>
      }
    >
      <form id="appointment-form" onSubmit={onSubmit} className="space-y-4">
        <SelectInput
          label="PATIENT"
          value={patientId}
          onChange={(event) => setPatientId(event.target.value)}
          options={patients.map((p) => ({
            value: p.id,
            label: `${p.fullName} · ${p.fileNumber}`,
          }))}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectInput
            label="DENTIST"
            value={dentistId}
            onChange={(event) => setDentistId(event.target.value)}
            options={dentists.map((d) => ({ value: d.id, label: d.fullName }))}
          />
          <SelectInput
            label="TREATMENT"
            value={treatment}
            onChange={(event) => setTreatment(event.target.value)}
            options={TREATMENTS.map((t) => ({ value: t, label: t }))}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <TextInput
            label="DATE"
            type="date"
            required
            value={date}
            onChange={(event) => {
              setDate(event.target.value);
              setConflict(null);
            }}
          />
          <TextInput
            label="START TIME"
            type="time"
            required
            step={900}
            value={startTime}
            onChange={(event) => {
              setStartTime(event.target.value);
              setConflict(null);
            }}
          />
          <SelectInput
            label="DURATION"
            value={String(duration)}
            onChange={(event) => {
              setDuration(Number(event.target.value));
              setConflict(null);
            }}
            options={DURATIONS.map((d) => ({ value: String(d), label: `${d} MIN` }))}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectInput
            label="ROOM"
            value={room}
            onChange={(event) => {
              setRoom(event.target.value);
              setConflict(null);
            }}
            options={ROOMS.map((r) => ({ value: r, label: r }))}
          />
          <SelectInput
            label="STATUS"
            value={status}
            onChange={(event) => setStatus(event.target.value as AppointmentStatus)}
            options={['SCHEDULED', 'CONFIRMED'].map((s) => ({ value: s, label: s }))}
          />
        </div>

        <TextArea
          label="NOTES"
          rows={3}
          value={notes}
          placeholder="Anything the clinical team should know before the visit…"
          onChange={(event) => setNotes(event.target.value)}
        />

        <div className="flex items-center justify-between gap-4 border-t border-[rgba(43,48,51,0.1)] pt-4">
          <span className="dt-label text-[9px]">SLOT</span>
          <span className="dt-mono text-[13px] font-bold text-[#1A1C1E]">
            {startTime} – {endTime}
          </span>
        </div>

        {conflict && (
          <p
            role="alert"
            className="border-l-2 border-[#B03A34] bg-[rgba(176,58,52,0.06)] px-3.5 py-3 text-[12px] leading-[1.6] text-[#A33A35]"
          >
            {conflict}
          </p>
        )}
      </form>
    </Modal>
  );
}
