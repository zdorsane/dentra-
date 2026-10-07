/**
 * DENTRA — Demo dataset
 *
 * A single, internally consistent clinic. Patients, appointments, treatments,
 * invoices, payments and inventory all reference each other by id, so any
 * screen can be reached from any other without dead ends.
 *
 * Everything is anchored to `DEMO_TODAY` rather than `new Date()` so the demo
 * renders identically on the server and the client (no hydration drift) and
 * stays reproducible.
 */

import {
  addDays,
  createId,
  daysBetween,
  initials,
  seededRandom,
  toISODate,
} from './utils';

import type {
  AIInsight,
  Appointment,
  AppointmentStatus,
  Clinic,
  InventoryItem,
  Invoice,
  Notification,
  Patient,
  Payment,
  StaffMember,
  Supplier,
  TimeSeriesPoint,
  Tooth,
  ToothCondition,
  ToothStatus,
  Treatment,
  User,
} from '@/types';

/* ============================================================
   TIME ANCHOR
   ============================================================ */

export const DEMO_TODAY = '2026-09-15';
export const CLINIC_ID = 'clinic_aurora';

const d = (offset: number) => addDays(DEMO_TODAY, offset);

/** Timestamp N hours before the demo "now" (09:40 on DEMO_TODAY). */
function hoursAgo(hours: number): string {
  const base = new Date(`${DEMO_TODAY}T09:40:00`);
  base.setHours(base.getHours() - hours);
  return base.toISOString();
}

/* ============================================================
   CLINIC
   ============================================================ */

export const clinic: Clinic = {
  id: CLINIC_ID,
  name: 'Centre Dentaire Aurora',
  legalName: 'Aurora Dental Care SAS',
  email: 'contact@aurora-dental.fr',
  phone: '+33 4 72 18 44 10',
  addressLine: '14 Rue de la Répúblique',
  city: 'Lyon',
  country: 'France',
  postalCode: '69002',
  taxId: 'FR 84 512 447 901',
  timezone: 'Europe/Paris',
  currency: 'EUR',
  workingHours: [
    { day: 1, open: '08:30', close: '19:00', closed: false },
    { day: 2, open: '08:30', close: '19:00', closed: false },
    { day: 3, open: '08:30', close: '19:00', closed: false },
    { day: 4, open: '08:30', close: '19:00', closed: false },
    { day: 5, open: '08:30', close: '17:30', closed: false },
    { day: 6, open: '09:00', close: '13:00', closed: false },
    { day: 0, open: '09:00', close: '13:00', closed: true },
  ],
  services: [
    'General dentistry',
    'Endodontics',
    'Implantology',
    'Orthodontics',
    'Periodontics',
    'Prosthodontics',
    'Pediatric dentistry',
    'Teeth whitening',
    'Oral surgery',
  ],
  createdAt: '2019-04-02T09:00:00.000Z',
};

/**
 * Registry-level figures. The demo loads a representative sample of records
 * rather than the clinic's full history, so headline counts live here.
 */
export const clinicStats = {
  activePatients: 1284,
  uptime: '99.9%',
  version: '1.0.0',
  monthlyRevenue: 18420,
};

/* ============================================================
   STAFF & USERS
   ============================================================ */

export const staff: StaffMember[] = [
  {
    id: 'staff_amel',
    clinicId: CLINIC_ID,
    userId: 'user_amel',
    fullName: 'Dr. Amel Bensaïd',
    email: 'amel.bensaid@aurora-dental.fr',
    phone: '+33 6 12 45 78 03',
    role: 'OWNER',
    specialty: 'Implantology & Oral Surgery',
    licenseNumber: 'FR-DEN-118402',
    status: 'ACTIVE',
    joinedAt: '2019-04-02',
    avatarInitials: 'AB',
    weeklyHours: 38,
    color: '#15BCDF',
  },
  {
    id: 'staff_karim',
    clinicId: CLINIC_ID,
    userId: 'user_karim',
    fullName: 'Dr. Karim Haddad',
    email: 'karim.haddad@aurora-dental.fr',
    phone: '+33 6 22 91 40 55',
    role: 'DENTIST',
    specialty: 'Endodontics',
    licenseNumber: 'FR-DEN-203915',
    status: 'ACTIVE',
    joinedAt: '2020-09-14',
    avatarInitials: 'KH',
    weeklyHours: 35,
    color: '#0FA3C2',
  },
  {
    id: 'staff_lea',
    clinicId: CLINIC_ID,
    userId: 'user_lea',
    fullName: 'Dr. Léa Moreau',
    email: 'lea.moreau@aurora-dental.fr',
    phone: '+33 6 78 34 12 90',
    role: 'DENTIST',
    specialty: 'Orthodontics',
    licenseNumber: 'FR-DEN-277104',
    status: 'ACTIVE',
    joinedAt: '2021-06-01',
    avatarInitials: 'LM',
    weeklyHours: 30,
    color: '#2B3033',
  },
  {
    id: 'staff_ines',
    clinicId: CLINIC_ID,
    userId: 'user_ines',
    fullName: 'Inès Fournier',
    email: 'ines.fournier@aurora-dental.fr',
    phone: '+33 6 55 20 87 31',
    role: 'ASSISTANT',
    specialty: 'Chairside assistance & sterilisation',
    licenseNumber: 'FR-ASS-441028',
    status: 'ACTIVE',
    joinedAt: '2022-02-21',
    avatarInitials: 'IF',
    weeklyHours: 35,
    color: '#6B6F72',
  },
  {
    id: 'staff_nadia',
    clinicId: CLINIC_ID,
    userId: 'user_nadia',
    fullName: 'Nadia Cherif',
    email: 'nadia.cherif@aurora-dental.fr',
    phone: '+33 6 41 77 05 26',
    role: 'RECEPTIONIST',
    specialty: 'Front desk & patient coordination',
    licenseNumber: '—',
    status: 'ACTIVE',
    joinedAt: '2022-11-07',
    avatarInitials: 'NC',
    weeklyHours: 35,
    color: '#9AA0A4',
  },
  {
    id: 'staff_thomas',
    clinicId: CLINIC_ID,
    userId: 'user_thomas',
    fullName: 'Thomas Rey',
    email: 'thomas.rey@aurora-dental.fr',
    phone: '+33 6 09 63 18 74',
    role: 'MANAGER',
    specialty: 'Operations & procurement',
    licenseNumber: '—',
    status: 'ON LEAVE',
    joinedAt: '2023-03-13',
    avatarInitials: 'TR',
    weeklyHours: 28,
    color: '#7E868B',
  },
];

export const users: User[] = staff.map((member) => ({
  id: member.userId,
  clinicId: CLINIC_ID,
  fullName: member.fullName,
  email: member.email,
  phone: member.phone,
  role: member.role,
  avatarInitials: member.avatarInitials,
  createdAt: `${member.joinedAt}T09:00:00.000Z`,
}));

export const dentists = staff.filter(
  (member) => member.role === 'DENTIST' || member.role === 'OWNER',
);

/* ============================================================
   SUPPLIERS
   ============================================================ */

export const suppliers: Supplier[] = [
  {
    id: 'sup_dentalys',
    clinicId: CLINIC_ID,
    name: 'Dentalys Europe',
    contactName: 'Marc Vidal',
    email: 'orders@dentalys.eu',
    phone: '+33 1 44 28 90 10',
    country: 'France',
    leadTimeDays: 4,
  },
  {
    id: 'sup_medix',
    clinicId: CLINIC_ID,
    name: 'Medix Supply',
    contactName: 'Julia Hoffmann',
    email: 'service@medix-supply.de',
    phone: '+49 30 2201 4488',
    country: 'Germany',
    leadTimeDays: 6,
  },
  {
    id: 'sup_orapro',
    clinicId: CLINIC_ID,
    name: 'OraPro Distribution',
    contactName: 'Paolo Ricci',
    email: 'commerciale@orapro.it',
    phone: '+39 02 7788 1120',
    country: 'Italy',
    leadTimeDays: 8,
  },
  {
    id: 'sup_nordent',
    clinicId: CLINIC_ID,
    name: 'NorDent Implants',
    contactName: 'Anna Lindqvist',
    email: 'sales@nordent.se',
    phone: '+46 8 551 220 90',
    country: 'Sweden',
    leadTimeDays: 12,
  },
];

const supplierName = (id: string) =>
  suppliers.find((s) => s.id === id)?.name ?? 'Unknown supplier';

/* ============================================================
   PATIENTS
   ============================================================ */

interface PatientSeed {
  id: string;
  first: string;
  last: string;
  age: number;
  gender: Patient['gender'];
  phone: string;
  city: string;
  status: Patient['status'];
  lastVisit: number | null;
  nextAppointment: number | null;
  treatment: string;
  dentistId: string;
  balance: number;
  insurance: string;
  alerts: { label: string; severity: 'HIGH' | 'MEDIUM' | 'LOW'; note: string }[];
}

const patientSeeds: PatientSeed[] = [
  {
    id: 'pat_001',
    first: 'Sarah',
    last: 'Benali',
    age: 32,
    gender: 'FEMALE',
    phone: '+33 6 14 92 06 71',
    city: 'Lyon',
    status: 'IN TREATMENT',
    lastVisit: -3,
    nextAppointment: 6,
    treatment: 'Crown',
    dentistId: 'staff_amel',
    balance: 420,
    insurance: 'Harmonie Mutuelle',
    alerts: [
      {
        label: 'Penicillin allergy',
        severity: 'HIGH',
        note: 'Use clindamycin for antibiotic prophylaxis.',
      },
    ],
  },
  {
    id: 'pat_002',
    first: 'Youssef',
    last: 'Amrani',
    age: 45,
    gender: 'MALE',
    phone: '+33 6 78 31 20 45',
    city: 'Villeurbanne',
    status: 'IN TREATMENT',
    lastVisit: -8,
    nextAppointment: 2,
    treatment: 'Implant — 36',
    dentistId: 'staff_amel',
    balance: 1180,
    insurance: 'MGEN',
    alerts: [
      {
        label: 'Type 2 diabetes',
        severity: 'MEDIUM',
        note: 'Monitor healing; confirm glycaemia before surgery.',
      },
    ],
  },
  {
    id: 'pat_003',
    first: 'Camille',
    last: 'Dubois',
    age: 28,
    gender: 'FEMALE',
    phone: '+33 6 21 55 88 03',
    city: 'Lyon',
    status: 'ACTIVE',
    lastVisit: -21,
    nextAppointment: 14,
    treatment: 'Scaling & polishing',
    dentistId: 'staff_lea',
    balance: 0,
    insurance: 'Alan',
    alerts: [],
  },
  {
    id: 'pat_004',
    first: 'Mehdi',
    last: 'Tazi',
    age: 51,
    gender: 'MALE',
    phone: '+33 6 44 17 62 39',
    city: 'Bron',
    status: 'IN TREATMENT',
    lastVisit: -1,
    nextAppointment: 13,
    treatment: 'Root canal — 26',
    dentistId: 'staff_karim',
    balance: 640,
    insurance: 'AXA Santé',
    alerts: [
      {
        label: 'Anticoagulant therapy',
        severity: 'HIGH',
        note: 'On apixaban. Coordinate with cardiologist before extraction.',
      },
      {
        label: 'Hypertension',
        severity: 'MEDIUM',
        note: 'Avoid adrenaline-heavy anaesthetics.',
      },
    ],
  },
  {
    id: 'pat_005',
    first: 'Inès',
    last: 'Lefèvre',
    age: 37,
    gender: 'FEMALE',
    phone: '+33 6 90 03 74 18',
    city: 'Lyon',
    status: 'FOLLOW-UP',
    lastVisit: -244,
    nextAppointment: null,
    treatment: 'Composite filling — 14',
    dentistId: 'staff_karim',
    balance: 0,
    insurance: 'Harmonie Mutuelle',
    alerts: [],
  },
  {
    id: 'pat_006',
    first: 'Rachid',
    last: 'Bouzid',
    age: 63,
    gender: 'MALE',
    phone: '+33 6 33 81 29 57',
    city: 'Caluire-et-Cuire',
    status: 'IN TREATMENT',
    lastVisit: -5,
    nextAppointment: 9,
    treatment: 'Full upper denture',
    dentistId: 'staff_amel',
    balance: 2100,
    insurance: 'Malakoff Humanis',
    alerts: [
      {
        label: 'Bisphosphonate history',
        severity: 'HIGH',
        note: 'Osteonecrosis risk. Avoid elective bone surgery.',
      },
    ],
  },
  {
    id: 'pat_007',
    first: 'Clara',
    last: 'Nguyen',
    age: 24,
    gender: 'FEMALE',
    phone: '+33 6 07 46 93 82',
    city: 'Lyon',
    status: 'NEW',
    lastVisit: null,
    nextAppointment: 1,
    treatment: 'Initial consultation',
    dentistId: 'staff_lea',
    balance: 0,
    insurance: 'Self-pay',
    alerts: [],
  },
  {
    id: 'pat_008',
    first: 'Hugo',
    last: 'Martin',
    age: 41,
    gender: 'MALE',
    phone: '+33 6 52 70 14 66',
    city: 'Villeurbanne',
    status: 'ACTIVE',
    lastVisit: -34,
    nextAppointment: 21,
    treatment: 'Night guard',
    dentistId: 'staff_karim',
    balance: 180,
    insurance: 'Alan',
    alerts: [
      {
        label: 'Bruxism',
        severity: 'LOW',
        note: 'Marked occlusal wear on posterior teeth.',
      },
    ],
  },
  {
    id: 'pat_009',
    first: 'Leila',
    last: 'Saadi',
    age: 29,
    gender: 'FEMALE',
    phone: '+33 6 88 25 40 11',
    city: 'Lyon',
    status: 'IN TREATMENT',
    lastVisit: -2,
    nextAppointment: 5,
    treatment: 'Orthodontic aligners',
    dentistId: 'staff_lea',
    balance: 1450,
    insurance: 'MGEN',
    alerts: [],
  },
  {
    id: 'pat_010',
    first: 'Antoine',
    last: 'Girard',
    age: 56,
    gender: 'MALE',
    phone: '+33 6 19 62 37 04',
    city: 'Écully',
    status: 'ACTIVE',
    lastVisit: -12,
    nextAppointment: 28,
    treatment: 'Periodontal maintenance',
    dentistId: 'staff_amel',
    balance: 0,
    insurance: 'AXA Santé',
    alerts: [
      {
        label: 'Chronic periodontitis',
        severity: 'MEDIUM',
        note: 'Three-month recall interval.',
      },
    ],
  },
  {
    id: 'pat_011',
    first: 'Nour',
    last: 'El Fassi',
    age: 34,
    gender: 'FEMALE',
    phone: '+33 6 71 09 58 23',
    city: 'Lyon',
    status: 'ACTIVE',
    lastVisit: -16,
    nextAppointment: 7,
    treatment: 'Teeth whitening',
    dentistId: 'staff_lea',
    balance: 290,
    insurance: 'Self-pay',
    alerts: [],
  },
  {
    id: 'pat_012',
    first: 'Julien',
    last: 'Perrin',
    age: 48,
    gender: 'MALE',
    phone: '+33 6 30 84 17 92',
    city: 'Bron',
    status: 'FOLLOW-UP',
    lastVisit: -198,
    nextAppointment: null,
    treatment: 'Crown — 46',
    dentistId: 'staff_karim',
    balance: 0,
    insurance: 'Malakoff Humanis',
    alerts: [],
  },
  {
    id: 'pat_013',
    first: 'Amina',
    last: 'Kettani',
    age: 26,
    gender: 'FEMALE',
    phone: '+33 6 65 39 72 08',
    city: 'Lyon',
    status: 'NEW',
    lastVisit: null,
    nextAppointment: 3,
    treatment: 'Initial consultation',
    dentistId: 'staff_amel',
    balance: 0,
    insurance: 'Harmonie Mutuelle',
    alerts: [],
  },
  {
    id: 'pat_014',
    first: 'Marc',
    last: 'Lambert',
    age: 67,
    gender: 'MALE',
    phone: '+33 6 02 91 46 35',
    city: 'Lyon',
    status: 'IN TREATMENT',
    lastVisit: -6,
    nextAppointment: 4,
    treatment: 'Bridge — 34 to 36',
    dentistId: 'staff_amel',
    balance: 1680,
    insurance: 'Malakoff Humanis',
    alerts: [
      {
        label: 'Pacemaker',
        severity: 'HIGH',
        note: 'Avoid electrosurgery and ultrasonic scalers.',
      },
    ],
  },
  {
    id: 'pat_015',
    first: 'Sofia',
    last: 'Rizzo',
    age: 39,
    gender: 'FEMALE',
    phone: '+33 6 47 18 60 29',
    city: 'Villeurbanne',
    status: 'ACTIVE',
    lastVisit: -27,
    nextAppointment: 17,
    treatment: 'Composite filling — 25',
    dentistId: 'staff_karim',
    balance: 0,
    insurance: 'Alan',
    alerts: [
      {
        label: 'Latex sensitivity',
        severity: 'MEDIUM',
        note: 'Use nitrile gloves and latex-free dam.',
      },
    ],
  },
  {
    id: 'pat_016',
    first: 'Karim',
    last: 'Belhadj',
    age: 22,
    gender: 'MALE',
    phone: '+33 6 93 27 05 61',
    city: 'Lyon',
    status: 'ACTIVE',
    lastVisit: -9,
    nextAppointment: 11,
    treatment: 'Wisdom tooth extraction — 48',
    dentistId: 'staff_amel',
    balance: 340,
    insurance: 'Self-pay',
    alerts: [],
  },
  {
    id: 'pat_017',
    first: 'Élodie',
    last: 'Chevalier',
    age: 44,
    gender: 'FEMALE',
    phone: '+33 6 56 43 90 17',
    city: 'Écully',
    status: 'FOLLOW-UP',
    lastVisit: -221,
    nextAppointment: null,
    treatment: 'Scaling & polishing',
    dentistId: 'staff_lea',
    balance: 0,
    insurance: 'MGEN',
    alerts: [],
  },
  {
    id: 'pat_018',
    first: 'Omar',
    last: 'Ziani',
    age: 58,
    gender: 'MALE',
    phone: '+33 6 12 68 35 94',
    city: 'Caluire-et-Cuire',
    status: 'IN TREATMENT',
    lastVisit: -4,
    nextAppointment: 8,
    treatment: 'Implant — 46',
    dentistId: 'staff_amel',
    balance: 1920,
    insurance: 'AXA Santé',
    alerts: [
      {
        label: 'Smoker — 20/day',
        severity: 'MEDIUM',
        note: 'Elevated implant failure risk. Cessation advised.',
      },
    ],
  },
  {
    id: 'pat_019',
    first: 'Manon',
    last: 'Faure',
    age: 31,
    gender: 'FEMALE',
    phone: '+33 6 84 51 27 46',
    city: 'Lyon',
    status: 'ACTIVE',
    lastVisit: -18,
    nextAppointment: 24,
    treatment: 'Routine check-up',
    dentistId: 'staff_lea',
    balance: 0,
    insurance: 'Harmonie Mutuelle',
    alerts: [
      {
        label: 'Pregnant — 2nd trimester',
        severity: 'HIGH',
        note: 'Defer radiographs; limit elective procedures.',
      },
    ],
  },
  {
    id: 'pat_020',
    first: 'Idriss',
    last: 'Ouali',
    age: 36,
    gender: 'MALE',
    phone: '+33 6 37 74 12 58',
    city: 'Lyon',
    status: 'INACTIVE',
    lastVisit: -412,
    nextAppointment: null,
    treatment: 'Composite filling — 37',
    dentistId: 'staff_karim',
    balance: 0,
    insurance: 'Self-pay',
    alerts: [],
  },
];

const MEDICAL_HISTORY_POOL: {
  category: 'CONDITION' | 'MEDICATION' | 'ALLERGY' | 'SURGERY' | 'NOTE';
  label: string;
  detail: string;
}[] = [
  {
    category: 'CONDITION',
    label: 'Seasonal rhinitis',
    detail: 'Mild, managed with antihistamines in spring.',
  },
  {
    category: 'MEDICATION',
    label: 'Levothyroxine 50µg',
    detail: 'Daily, for hypothyroidism. Stable for four years.',
  },
  {
    category: 'SURGERY',
    label: 'Wisdom teeth removal',
    detail: 'Lower third molars extracted under local anaesthesia.',
  },
  {
    category: 'NOTE',
    label: 'Dental anxiety',
    detail: 'Prefers morning appointments and step-by-step explanation.',
  },
  {
    category: 'ALLERGY',
    label: 'Ibuprofen intolerance',
    detail: 'Gastric discomfort. Paracetamol preferred for analgesia.',
  },
  {
    category: 'CONDITION',
    label: 'Gingival recession',
    detail: 'Localised to lower incisors. Monitored at each recall.',
  },
  {
    category: 'NOTE',
    label: 'Orthodontic history',
    detail: 'Fixed appliance therapy completed in adolescence.',
  },
];

const DOCUMENT_POOL: {
  name: string;
  kind: 'RADIOGRAPH' | 'CONSENT' | 'REPORT' | 'SCAN' | 'INVOICE';
  sizeKb: number;
}[] = [
  { name: 'Panoramic radiograph', kind: 'RADIOGRAPH', sizeKb: 2480 },
  { name: 'Periapical — quadrant 2', kind: 'RADIOGRAPH', sizeKb: 640 },
  { name: 'Treatment consent form', kind: 'CONSENT', sizeKb: 128 },
  { name: 'Intraoral scan (STL)', kind: 'SCAN', sizeKb: 8820 },
  { name: 'Periodontal chart report', kind: 'REPORT', sizeKb: 210 },
];

function buildPatient(seed: PatientSeed, index: number): Patient {
  const rand = seededRandom(index * 977 + 13);
  const fullName = `${seed.first} ${seed.last}`;
  const birthYear = 2026 - seed.age;
  const birthMonth = 1 + Math.floor(rand() * 12);
  const birthDay = 1 + Math.floor(rand() * 27);

  const historyCount = 1 + Math.floor(rand() * 3);
  const medicalHistory = Array.from({ length: historyCount }, (_, i) => {
    const entry = MEDICAL_HISTORY_POOL[(index * 3 + i) % MEDICAL_HISTORY_POOL.length];
    return {
      id: `mh_${seed.id}_${i}`,
      date: d(-(120 + Math.floor(rand() * 900))),
      category: entry.category,
      label: entry.label,
      detail: entry.detail,
    };
  });

  const docCount = seed.lastVisit === null ? 1 : 2 + Math.floor(rand() * 2);
  const documents = Array.from({ length: docCount }, (_, i) => {
    const doc = DOCUMENT_POOL[(index * 2 + i) % DOCUMENT_POOL.length];
    return {
      id: `doc_${seed.id}_${i}`,
      name: doc.name,
      kind: doc.kind,
      date: d(-(10 + Math.floor(rand() * 260))),
      sizeKb: doc.sizeKb,
    };
  });

  const notes =
    seed.lastVisit === null
      ? []
      : [
          {
            id: `note_${seed.id}_1`,
            author: staff.find((s) => s.id === seed.dentistId)?.fullName ?? 'Clinical team',
            date: `${d(seed.lastVisit)}T11:20:00.000Z`,
            body: `Reviewed ${seed.treatment.toLowerCase()}. Patient reports no discomfort since the previous session. Oral hygiene satisfactory; reinforced interdental cleaning.`,
          },
        ];

  return {
    id: seed.id,
    clinicId: CLINIC_ID,
    fileNumber: `AUR-${String(2400 + index + 1)}`,
    firstName: seed.first,
    lastName: seed.last,
    fullName,
    age: seed.age,
    dateOfBirth: `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(
      birthDay,
    ).padStart(2, '0')}`,
    gender: seed.gender,
    phone: seed.phone,
    email: `${seed.first.toLowerCase().replace(/[^a-z]/g, '')}.${seed.last
      .toLowerCase()
      .replace(/[^a-z]/g, '')}@example.com`,
    addressLine: `${4 + index * 3} Rue ${
      ['Victor Hugo', 'Garibaldi', 'des Remparts', 'Sainte-Hélène', 'du Plat'][index % 5]
    }`,
    city: seed.city,
    country: 'France',
    insuranceProvider: seed.insurance,
    insuranceNumber:
      seed.insurance === 'Self-pay'
        ? '—'
        : `${1 + (index % 2)} ${String(60 + index).padStart(2, '0')} ${String(
            1 + (index % 12),
          ).padStart(2, '0')} 69 ${String(100 + index * 7).slice(0, 3)} ${String(
            20 + index,
          )}`,
    status: seed.status,
    lastVisit: seed.lastVisit === null ? null : d(seed.lastVisit),
    nextAppointment: seed.nextAppointment === null ? null : d(seed.nextAppointment),
    primaryTreatment: seed.treatment,
    assignedDentistId: seed.dentistId,
    balance: seed.balance,
    medicalAlerts: seed.alerts.map((alert, i) => ({
      id: `alert_${seed.id}_${i}`,
      label: alert.label,
      severity: alert.severity,
      note: alert.note,
    })),
    medicalHistory,
    documents,
    notes,
    avatarInitials: initials(fullName),
    createdAt: `${d(-(200 + index * 37))}T09:00:00.000Z`,
  };
}

export const patients: Patient[] = patientSeeds.map(buildPatient);

/* ============================================================
   ODONTOGRAM
   ============================================================ */

const TOOTH_NAMES = [
  'Central incisor',
  'Lateral incisor',
  'Canine',
  'First premolar',
  'Second premolar',
  'First molar',
  'Second molar',
  'Third molar',
];

/** FDI numbers in anatomical left-to-right display order. */
export const UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
export const UPPER_LEFT = [21, 22, 23, 24, 25, 26, 27, 28];
export const LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];
export const LOWER_LEFT = [31, 32, 33, 34, 35, 36, 37, 38];

export const UPPER_ARCH = [...UPPER_RIGHT, ...UPPER_LEFT];
export const LOWER_ARCH = [...LOWER_RIGHT, ...LOWER_LEFT];
export const ALL_TEETH = [...UPPER_ARCH, ...LOWER_ARCH];

export function toothName(number: number): string {
  const position = number % 10;
  return TOOTH_NAMES[position - 1] ?? 'Tooth';
}

export function toothQuadrant(number: number): 1 | 2 | 3 | 4 {
  return Math.floor(number / 10) as 1 | 2 | 3 | 4;
}

export function toothArch(number: number): 'UPPER' | 'LOWER' {
  const q = toothQuadrant(number);
  return q === 1 || q === 2 ? 'UPPER' : 'LOWER';
}

/** Per-patient clinical findings. Anything not listed here is healthy. */
const TOOTH_FINDINGS: Record<
  string,
  { number: number; condition: ToothCondition; status: ToothStatus; treatment: string; notes: string }[]
> = {
  pat_001: [
    {
      number: 16,
      condition: 'CROWN',
      status: 'IN TREATMENT',
      treatment: 'Zirconia crown',
      notes: 'Provisional crown fitted. Definitive crown seated at next visit.',
    },
    {
      number: 26,
      condition: 'FILLED',
      status: 'STABLE',
      treatment: 'Composite restoration (MO)',
      notes: 'Placed 2024. Margins intact.',
    },
    {
      number: 36,
      condition: 'ROOT CANAL',
      status: 'TREATED',
      treatment: 'Endodontic therapy',
      notes: 'Obturation complete, apical healing confirmed radiographically.',
    },
    {
      number: 47,
      condition: 'CARIES',
      status: 'TREATMENT REQUIRED',
      treatment: 'Composite restoration planned',
      notes: 'Occlusal lesion extending into dentine.',
    },
    {
      number: 38,
      condition: 'MISSING',
      status: 'STABLE',
      treatment: '—',
      notes: 'Extracted 2021, no replacement indicated.',
    },
  ],
  pat_002: [
    {
      number: 36,
      condition: 'IMPLANT',
      status: 'IN TREATMENT',
      treatment: 'Titanium implant + healing abutment',
      notes: 'Osseointegration in progress. Loading planned in 8 weeks.',
    },
    {
      number: 37,
      condition: 'FILLED',
      status: 'STABLE',
      treatment: 'Amalgam replacement',
      notes: 'Replaced with composite in 2023.',
    },
    {
      number: 24,
      condition: 'CARIES',
      status: 'TREATMENT REQUIRED',
      treatment: 'Restoration planned',
      notes: 'Interproximal lesion, distal surface.',
    },
    {
      number: 18,
      condition: 'MISSING',
      status: 'STABLE',
      treatment: '—',
      notes: 'Congenitally absent.',
    },
  ],
  pat_004: [
    {
      number: 26,
      condition: 'ROOT CANAL',
      status: 'IN TREATMENT',
      treatment: 'Endodontic retreatment',
      notes: 'Second canal located. Interim dressing placed.',
    },
    {
      number: 27,
      condition: 'CROWN',
      status: 'STABLE',
      treatment: 'PFM crown',
      notes: 'Placed 2019, functioning well.',
    },
    {
      number: 46,
      condition: 'FRACTURE',
      status: 'TREATMENT REQUIRED',
      treatment: 'Cuspal coverage required',
      notes: 'Mesiobuccal cusp fracture, no pulpal exposure.',
    },
  ],
  pat_006: [
    { number: 11, condition: 'MISSING', status: 'STABLE', treatment: 'Denture', notes: '' },
    { number: 12, condition: 'MISSING', status: 'STABLE', treatment: 'Denture', notes: '' },
    { number: 13, condition: 'MISSING', status: 'STABLE', treatment: 'Denture', notes: '' },
    { number: 21, condition: 'MISSING', status: 'STABLE', treatment: 'Denture', notes: '' },
    { number: 22, condition: 'MISSING', status: 'STABLE', treatment: 'Denture', notes: '' },
    { number: 23, condition: 'MISSING', status: 'STABLE', treatment: 'Denture', notes: '' },
    {
      number: 16,
      condition: 'EXTRACTION',
      status: 'TREATMENT REQUIRED',
      treatment: 'Extraction scheduled',
      notes: 'Unrestorable. Clearance ahead of full upper denture.',
    },
  ],
  pat_014: [
    {
      number: 35,
      condition: 'MISSING',
      status: 'IN TREATMENT',
      treatment: 'Bridge pontic',
      notes: 'Pontic site for 34–36 bridge.',
    },
    {
      number: 34,
      condition: 'CROWN',
      status: 'IN TREATMENT',
      treatment: 'Bridge abutment',
      notes: 'Prepared, provisional in place.',
    },
    {
      number: 36,
      condition: 'CROWN',
      status: 'IN TREATMENT',
      treatment: 'Bridge abutment',
      notes: 'Prepared, provisional in place.',
    },
    {
      number: 17,
      condition: 'FILLED',
      status: 'STABLE',
      treatment: 'Composite restoration',
      notes: '',
    },
  ],
  pat_018: [
    {
      number: 46,
      condition: 'IMPLANT',
      status: 'IN TREATMENT',
      treatment: 'Implant placement',
      notes: 'Placed 4 days ago. Review sutures at next visit.',
    },
    {
      number: 16,
      condition: 'CROWN',
      status: 'STABLE',
      treatment: 'Ceramic crown',
      notes: '',
    },
    {
      number: 25,
      condition: 'CARIES',
      status: 'MONITOR',
      treatment: 'Preventive — fluoride varnish',
      notes: 'Early enamel lesion. Remineralisation attempted.',
    },
  ],
  pat_016: [
    {
      number: 48,
      condition: 'EXTRACTION',
      status: 'TREATMENT REQUIRED',
      treatment: 'Surgical extraction',
      notes: 'Partially erupted, recurrent pericoronitis.',
    },
    {
      number: 38,
      condition: 'MONITOR' as never,
      status: 'MONITOR',
      treatment: 'Observation',
      notes: '',
    },
  ],
};

/** Deterministic background findings so every chart looks clinically plausible. */
function generateTeethForPatient(patient: Patient, index: number): Tooth[] {
  const explicit = TOOTH_FINDINGS[patient.id] ?? [];
  const explicitMap = new Map(explicit.map((f) => [f.number, f]));
  const rand = seededRandom(index * 6151 + 29);

  return ALL_TEETH.map((number) => {
    const found = explicitMap.get(number);
    let condition: ToothCondition = 'HEALTHY';
    let status: ToothStatus = 'STABLE';
    let treatment = '';
    let notes = '';

    if (found && found.condition !== ('MONITOR' as never)) {
      condition = found.condition;
      status = found.status;
      treatment = found.treatment;
      notes = found.notes;
    } else if (!found) {
      const roll = rand();
      // Molars and premolars carry most restorative history.
      const position = number % 10;
      const restorativeBias = position >= 4 ? 0.22 : 0.06;
      if (roll < restorativeBias * 0.55) {
        condition = 'FILLED';
        status = 'STABLE';
        treatment = 'Composite restoration';
        notes = 'Existing restoration, margins sound.';
      } else if (roll < restorativeBias * 0.72) {
        condition = 'CARIES';
        status = 'TREATMENT REQUIRED';
        treatment = 'Restoration planned';
        notes = 'Active lesion identified at examination.';
      }
      if (position === 8 && rand() < 0.35) {
        condition = 'MISSING';
        status = 'STABLE';
        treatment = '—';
        notes = 'Third molar previously extracted.';
      }
    }

    return {
      id: `tooth_${patient.id}_${number}`,
      clinicId: CLINIC_ID,
      patientId: patient.id,
      number,
      quadrant: toothQuadrant(number),
      arch: toothArch(number),
      name: toothName(number),
      condition,
      status,
      treatment,
      notes,
      lastUpdated: patient.lastVisit ?? patient.createdAt.slice(0, 10),
    };
  });
}

export const teeth: Tooth[] = patients.flatMap((patient, index) =>
  generateTeethForPatient(patient, index),
);

export function teethForPatient(patientId: string): Tooth[] {
  return teeth.filter((tooth) => tooth.patientId === patientId);
}

/* ============================================================
   APPOINTMENTS
   ============================================================ */

const TREATMENT_TYPES = [
  { label: 'Routine check-up', minutes: 30 },
  { label: 'Scaling & polishing', minutes: 45 },
  { label: 'Composite filling', minutes: 45 },
  { label: 'Root canal — session 1', minutes: 90 },
  { label: 'Root canal — session 2', minutes: 60 },
  { label: 'Crown preparation', minutes: 60 },
  { label: 'Crown fitting', minutes: 45 },
  { label: 'Implant placement', minutes: 120 },
  { label: 'Implant review', minutes: 30 },
  { label: 'Aligner review', minutes: 30 },
  { label: 'Extraction', minutes: 45 },
  { label: 'Whitening session', minutes: 60 },
  { label: 'Periodontal maintenance', minutes: 45 },
  { label: 'Emergency consultation', minutes: 30 },
  { label: 'Initial consultation', minutes: 45 },
];

const ROOMS = ['SURGERY 01', 'SURGERY 02', 'SURGERY 03', 'HYGIENE ROOM'];

/** Slot ladder used to pack a clinic day without overlaps per room. */
const DAY_SLOTS = [
  '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30',
];

function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(
    total % 60,
  ).padStart(2, '0')}`;
}

function buildAppointments(): Appointment[] {
  const result: Appointment[] = [];
  const rand = seededRandom(90210);
  let counter = 0;

  /** Builds one clinic day. `count` appointments spread across rooms. */
  const buildDay = (dayOffset: number, count: number) => {
    const date = d(dayOffset);
    const weekday = new Date(date).getDay();
    if (weekday === 0) return; // clinic closed Sunday

    for (let i = 0; i < count; i += 1) {
      counter += 1;
      const slot = DAY_SLOTS[i % DAY_SLOTS.length];
      const room = ROOMS[i % ROOMS.length];
      const type = TREATMENT_TYPES[Math.floor(rand() * TREATMENT_TYPES.length)];
      const patient = patients[Math.floor(rand() * patients.length)];
      const dentist =
        staff.find((s) => s.id === patient.assignedDentistId) ?? dentists[0];

      let status: AppointmentStatus;
      if (dayOffset < 0) {
        const roll = rand();
        status = roll < 0.82 ? 'COMPLETED' : roll < 0.92 ? 'CANCELLED' : 'NO-SHOW';
      } else if (dayOffset === 0) {
        const roll = rand();
        status = roll < 0.55 ? 'CONFIRMED' : roll < 0.9 ? 'SCHEDULED' : 'COMPLETED';
      } else {
        status = rand() < 0.5 ? 'CONFIRMED' : 'SCHEDULED';
      }

      result.push({
        id: `apt_${String(counter).padStart(3, '0')}`,
        clinicId: CLINIC_ID,
        patientId: patient.id,
        patientName: patient.fullName,
        dentistId: dentist.id,
        dentistName: dentist.fullName,
        treatment: type.label,
        date,
        startTime: slot,
        endTime: addMinutesToTime(slot, type.minutes),
        durationMinutes: type.minutes,
        status,
        room,
        notes:
          status === 'NO-SHOW'
            ? 'Patient did not attend. Reception to follow up by phone.'
            : '',
        createdAt: `${d(dayOffset - 14)}T10:00:00.000Z`,
      });
    }
  };

  // Past two weeks — history for analytics and patient records.
  for (let offset = -14; offset < 0; offset += 1) {
    buildDay(offset, 8 + Math.floor(rand() * 6));
  }

  // Today — the clinic's headline figure.
  buildDay(0, 24);

  // Next four weeks — forward schedule.
  for (let offset = 1; offset <= 28; offset += 1) {
    buildDay(offset, 4 + Math.floor(rand() * 8));
  }

  return result;
}

const generatedAppointments = buildAppointments();

/**
 * Pinned appointments guarantee that the records highlighted across the
 * product (Sarah Benali's crown fitting, for example) always exist.
 */
const pinnedAppointments: Appointment[] = patients
  .filter((p) => p.nextAppointment !== null)
  .map((patient, i) => {
    const dentist =
      staff.find((s) => s.id === patient.assignedDentistId) ?? dentists[0];
    const slot = DAY_SLOTS[(i * 3) % DAY_SLOTS.length];
    return {
      id: `apt_pin_${patient.id}`,
      clinicId: CLINIC_ID,
      patientId: patient.id,
      patientName: patient.fullName,
      dentistId: dentist.id,
      dentistName: dentist.fullName,
      treatment: patient.primaryTreatment,
      date: patient.nextAppointment as string,
      startTime: slot,
      endTime: addMinutesToTime(slot, 45),
      durationMinutes: 45,
      status: i % 3 === 0 ? 'SCHEDULED' : 'CONFIRMED',
      room: ROOMS[i % ROOMS.length],
      notes: '',
      createdAt: `${d(-10)}T10:00:00.000Z`,
    };
  });

export const appointments: Appointment[] = [
  ...generatedAppointments,
  ...pinnedAppointments,
].sort((a, b) =>
  a.date === b.date
    ? a.startTime.localeCompare(b.startTime)
    : a.date.localeCompare(b.date),
);

export function appointmentsOn(date: string): Appointment[] {
  return appointments.filter((a) => a.date === date);
}

export function appointmentsForPatient(patientId: string): Appointment[] {
  return appointments.filter((a) => a.patientId === patientId);
}

/* ============================================================
   TREATMENTS
   ============================================================ */

function steps(
  labels: string[],
  activeIndex: number,
  startOffset: number,
): Treatment['steps'] {
  return labels.map((label, i) => ({
    id: createId('step'),
    label,
    date: i <= activeIndex ? d(startOffset + i * 12) : null,
    status: i < activeIndex ? 'DONE' : i === activeIndex ? 'ACTIVE' : 'PENDING',
    note: '',
  }));
}

export const treatments: Treatment[] = [
  {
    id: 'trt_001',
    clinicId: CLINIC_ID,
    patientId: 'pat_001',
    patientName: 'Sarah Benali',
    dentistId: 'staff_amel',
    dentistName: 'Dr. Amel Bensaïd',
    type: 'Zirconia crown — 16',
    category: 'Prosthodontics',
    teeth: [16],
    startDate: d(-38),
    expectedCompletion: d(6),
    price: 780,
    status: 'IN PROGRESS',
    steps: steps(
      ['Consultation', 'Diagnosis', 'Root canal', 'Crown', 'Follow-up'],
      3,
      -38,
    ),
    notes: 'Shade A2 selected. Definitive crown returned from laboratory.',
  },
  {
    id: 'trt_002',
    clinicId: CLINIC_ID,
    patientId: 'pat_002',
    patientName: 'Youssef Amrani',
    dentistId: 'staff_amel',
    dentistName: 'Dr. Amel Bensaïd',
    type: 'Implant — 36',
    category: 'Implantology',
    teeth: [36],
    startDate: d(-52),
    expectedCompletion: d(46),
    price: 1890,
    status: 'IN PROGRESS',
    steps: steps(
      ['Consultation', 'CBCT planning', 'Implant placement', 'Healing review', 'Final crown'],
      3,
      -52,
    ),
    notes: 'Bone density adequate. Glycaemic control confirmed pre-operatively.',
  },
  {
    id: 'trt_003',
    clinicId: CLINIC_ID,
    patientId: 'pat_004',
    patientName: 'Mehdi Tazi',
    dentistId: 'staff_karim',
    dentistName: 'Dr. Karim Haddad',
    type: 'Endodontic retreatment — 26',
    category: 'Endodontics',
    teeth: [26],
    startDate: d(-16),
    expectedCompletion: d(13),
    price: 640,
    status: 'IN PROGRESS',
    steps: steps(
      ['Consultation', 'Diagnosis', 'Canal preparation', 'Obturation', 'Coronal restoration'],
      2,
      -16,
    ),
    notes: 'Anticoagulant therapy — no surgical component planned.',
  },
  {
    id: 'trt_004',
    clinicId: CLINIC_ID,
    patientId: 'pat_006',
    patientName: 'Rachid Bouzid',
    dentistId: 'staff_amel',
    dentistName: 'Dr. Amel Bensaïd',
    type: 'Full upper denture',
    category: 'Prosthodontics',
    teeth: [11, 12, 13, 21, 22, 23, 16],
    startDate: d(-30),
    expectedCompletion: d(38),
    price: 2100,
    status: 'IN PROGRESS',
    steps: steps(
      ['Consultation', 'Extractions', 'Primary impressions', 'Try-in', 'Delivery'],
      1,
      -30,
    ),
    notes: 'Bisphosphonate history — atraumatic technique, staged extractions.',
  },
  {
    id: 'trt_005',
    clinicId: CLINIC_ID,
    patientId: 'pat_009',
    patientName: 'Leila Saadi',
    dentistId: 'staff_lea',
    dentistName: 'Dr. Léa Moreau',
    type: 'Clear aligner therapy',
    category: 'Orthodontics',
    teeth: [],
    startDate: d(-96),
    expectedCompletion: d(268),
    price: 3400,
    status: 'IN PROGRESS',
    steps: steps(
      ['Consultation', 'Digital scan', 'Aligner set 1–6', 'Aligner set 7–14', 'Retention'],
      2,
      -96,
    ),
    notes: 'Progressing on schedule. Attachments intact at last review.',
  },
  {
    id: 'trt_006',
    clinicId: CLINIC_ID,
    patientId: 'pat_014',
    patientName: 'Marc Lambert',
    dentistId: 'staff_amel',
    dentistName: 'Dr. Amel Bensaïd',
    type: 'Three-unit bridge — 34 to 36',
    category: 'Prosthodontics',
    teeth: [34, 35, 36],
    startDate: d(-24),
    expectedCompletion: d(4),
    price: 1680,
    status: 'IN PROGRESS',
    steps: steps(
      ['Consultation', 'Abutment preparation', 'Impression', 'Bridge fitting', 'Follow-up'],
      3,
      -24,
    ),
    notes: 'Pacemaker — piezo and electrosurgery avoided.',
  },
  {
    id: 'trt_007',
    clinicId: CLINIC_ID,
    patientId: 'pat_018',
    patientName: 'Omar Ziani',
    dentistId: 'staff_amel',
    dentistName: 'Dr. Amel Bensaïd',
    type: 'Implant — 46',
    category: 'Implantology',
    teeth: [46],
    startDate: d(-14),
    expectedCompletion: d(104),
    price: 1920,
    status: 'IN PROGRESS',
    steps: steps(
      ['Consultation', 'CBCT planning', 'Implant placement', 'Healing review', 'Final crown'],
      2,
      -14,
    ),
    notes: 'Smoking cessation advice documented and reinforced.',
  },
  {
    id: 'trt_008',
    clinicId: CLINIC_ID,
    patientId: 'pat_016',
    patientName: 'Karim Belhadj',
    dentistId: 'staff_amel',
    dentistName: 'Dr. Amel Bensaïd',
    type: 'Surgical extraction — 48',
    category: 'Oral surgery',
    teeth: [48],
    startDate: d(-9),
    expectedCompletion: d(11),
    price: 340,
    status: 'ACCEPTED',
    steps: steps(['Consultation', 'Radiographic assessment', 'Extraction', 'Review'], 1, -9),
    notes: 'Recurrent pericoronitis. Distal angulation, moderate difficulty.',
  },
  {
    id: 'trt_009',
    clinicId: CLINIC_ID,
    patientId: 'pat_011',
    patientName: 'Nour El Fassi',
    dentistId: 'staff_lea',
    dentistName: 'Dr. Léa Moreau',
    type: 'In-office whitening',
    category: 'Cosmetic',
    teeth: [],
    startDate: d(-16),
    expectedCompletion: d(7),
    price: 390,
    status: 'ACCEPTED',
    steps: steps(['Consultation', 'Pre-treatment scaling', 'Whitening session', 'Review'], 1, -16),
    notes: 'Baseline shade A3.5. Target B1.',
  },
  {
    id: 'trt_010',
    clinicId: CLINIC_ID,
    patientId: 'pat_008',
    patientName: 'Hugo Martin',
    dentistId: 'staff_karim',
    dentistName: 'Dr. Karim Haddad',
    type: 'Occlusal splint',
    category: 'General dentistry',
    teeth: [],
    startDate: d(-34),
    expectedCompletion: d(21),
    price: 380,
    status: 'PROPOSED',
    steps: steps(['Consultation', 'Impressions', 'Splint delivery', 'Adjustment'], 0, -34),
    notes: 'Awaiting patient decision on hard vs. soft appliance.',
  },
  {
    id: 'trt_011',
    clinicId: CLINIC_ID,
    patientId: 'pat_015',
    patientName: 'Sofia Rizzo',
    dentistId: 'staff_karim',
    dentistName: 'Dr. Karim Haddad',
    type: 'Composite restoration — 25',
    category: 'General dentistry',
    teeth: [25],
    startDate: d(-27),
    expectedCompletion: d(-27),
    price: 160,
    status: 'COMPLETED',
    steps: steps(['Consultation', 'Restoration', 'Polish & review'], 2, -27),
    notes: 'Latex-free protocol used throughout.',
  },
  {
    id: 'trt_012',
    clinicId: CLINIC_ID,
    patientId: 'pat_010',
    patientName: 'Antoine Girard',
    dentistId: 'staff_amel',
    dentistName: 'Dr. Amel Bensaïd',
    type: 'Periodontal maintenance programme',
    category: 'Periodontics',
    teeth: [],
    startDate: d(-104),
    expectedCompletion: d(28),
    price: 540,
    status: 'IN PROGRESS',
    steps: steps(
      ['Consultation', 'Full-mouth debridement', 'Quadrant therapy', 'Three-month recall'],
      2,
      -104,
    ),
    notes: 'Pocket depths reduced by 1–2 mm since baseline.',
  },
  {
    id: 'trt_013',
    clinicId: CLINIC_ID,
    patientId: 'pat_020',
    patientName: 'Idriss Ouali',
    dentistId: 'staff_karim',
    dentistName: 'Dr. Karim Haddad',
    type: 'Composite restoration — 37',
    category: 'General dentistry',
    teeth: [37],
    startDate: d(-412),
    expectedCompletion: d(-412),
    price: 150,
    status: 'CANCELLED',
    steps: steps(['Consultation', 'Restoration'], 0, -412),
    notes: 'Patient did not return after consultation.',
  },
];

export function treatmentsForPatient(patientId: string): Treatment[] {
  return treatments.filter((t) => t.patientId === patientId);
}

/* ============================================================
   INVENTORY
   ============================================================ */

export const inventory: InventoryItem[] = [
  {
    id: 'inv_001',
    clinicId: CLINIC_ID,
    name: 'Composite resin A2 — universal',
    sku: 'CMP-A2-004',
    category: 'COMPOSITE',
    quantity: 14,
    minimumQuantity: 12,
    unit: 'syringe',
    unitPrice: 28.5,
    supplierId: 'sup_dentalys',
    supplierName: supplierName('sup_dentalys'),
    expirationDate: d(214),
    batchNumber: 'B-24-4471',
    dailyUsage: 0.25,
    lastRestocked: d(-42),
    location: 'Cabinet A — shelf 2',
  },
  {
    id: 'inv_002',
    clinicId: CLINIC_ID,
    name: 'Composite resin A3 — universal',
    sku: 'CMP-A3-004',
    category: 'COMPOSITE',
    quantity: 9,
    minimumQuantity: 12,
    unit: 'syringe',
    unitPrice: 28.5,
    supplierId: 'sup_dentalys',
    supplierName: supplierName('sup_dentalys'),
    expirationDate: d(188),
    batchNumber: 'B-24-4472',
    dailyUsage: 0.3,
    lastRestocked: d(-48),
    location: 'Cabinet A — shelf 2',
  },
  {
    id: 'inv_003',
    clinicId: CLINIC_ID,
    name: 'Articaine 4% with epinephrine 1:100,000',
    sku: 'ANS-ART-050',
    category: 'ANESTHETIC',
    quantity: 62,
    minimumQuantity: 40,
    unit: 'cartridge',
    unitPrice: 1.15,
    supplierId: 'sup_medix',
    supplierName: supplierName('sup_medix'),
    expirationDate: d(24),
    batchNumber: 'AN-25-0913',
    dailyUsage: 2.4,
    lastRestocked: d(-21),
    location: 'Pharmacy cabinet — locked',
  },
  {
    id: 'inv_004',
    clinicId: CLINIC_ID,
    name: 'Lidocaine 2% with epinephrine',
    sku: 'ANS-LID-050',
    category: 'ANESTHETIC',
    quantity: 38,
    minimumQuantity: 40,
    unit: 'cartridge',
    unitPrice: 0.92,
    supplierId: 'sup_medix',
    supplierName: supplierName('sup_medix'),
    expirationDate: d(312),
    batchNumber: 'AN-25-1120',
    dailyUsage: 1.1,
    lastRestocked: d(-30),
    location: 'Pharmacy cabinet — locked',
  },
  {
    id: 'inv_005',
    clinicId: CLINIC_ID,
    name: 'Nitrile examination gloves — size M',
    sku: 'GLV-NIT-M-100',
    category: 'GLOVES',
    quantity: 6,
    minimumQuantity: 15,
    unit: 'box of 100',
    unitPrice: 9.4,
    supplierId: 'sup_orapro',
    supplierName: supplierName('sup_orapro'),
    expirationDate: d(520),
    batchNumber: 'GL-26-0088',
    dailyUsage: 0.9,
    lastRestocked: d(-26),
    location: 'Storeroom — bay 1',
  },
  {
    id: 'inv_006',
    clinicId: CLINIC_ID,
    name: 'Nitrile examination gloves — size L',
    sku: 'GLV-NIT-L-100',
    category: 'GLOVES',
    quantity: 11,
    minimumQuantity: 10,
    unit: 'box of 100',
    unitPrice: 9.4,
    supplierId: 'sup_orapro',
    supplierName: supplierName('sup_orapro'),
    expirationDate: d(520),
    batchNumber: 'GL-26-0089',
    dailyUsage: 0.4,
    lastRestocked: d(-26),
    location: 'Storeroom — bay 1',
  },
  {
    id: 'inv_007',
    clinicId: CLINIC_ID,
    name: 'Type IIR surgical masks',
    sku: 'MSK-IIR-050',
    category: 'MASKS',
    quantity: 4,
    minimumQuantity: 12,
    unit: 'box of 50',
    unitPrice: 6.8,
    supplierId: 'sup_orapro',
    supplierName: supplierName('sup_orapro'),
    expirationDate: d(430),
    batchNumber: 'MK-25-7712',
    dailyUsage: 0.6,
    lastRestocked: d(-33),
    location: 'Storeroom — bay 1',
  },
  {
    id: 'inv_008',
    clinicId: CLINIC_ID,
    name: 'FFP2 respirators',
    sku: 'MSK-FFP2-020',
    category: 'MASKS',
    quantity: 18,
    minimumQuantity: 8,
    unit: 'box of 20',
    unitPrice: 14.2,
    supplierId: 'sup_orapro',
    supplierName: supplierName('sup_orapro'),
    expirationDate: d(690),
    batchNumber: 'MK-25-7810',
    dailyUsage: 0.15,
    lastRestocked: d(-58),
    location: 'Storeroom — bay 2',
  },
  {
    id: 'inv_009',
    clinicId: CLINIC_ID,
    name: 'Titanium implant 4.1 × 10 mm',
    sku: 'IMP-TI-4110',
    category: 'IMPLANTS',
    quantity: 7,
    minimumQuantity: 4,
    unit: 'unit',
    unitPrice: 184,
    supplierId: 'sup_nordent',
    supplierName: supplierName('sup_nordent'),
    expirationDate: d(880),
    batchNumber: 'IM-26-2204',
    dailyUsage: 0.08,
    lastRestocked: d(-75),
    location: 'Surgery store — sterile',
  },
  {
    id: 'inv_010',
    clinicId: CLINIC_ID,
    name: 'Healing abutment 4.5 mm',
    sku: 'IMP-HA-450',
    category: 'IMPLANTS',
    quantity: 3,
    minimumQuantity: 5,
    unit: 'unit',
    unitPrice: 46,
    supplierId: 'sup_nordent',
    supplierName: supplierName('sup_nordent'),
    expirationDate: d(910),
    batchNumber: 'IM-26-2211',
    dailyUsage: 0.07,
    lastRestocked: d(-75),
    location: 'Surgery store — sterile',
  },
  {
    id: 'inv_011',
    clinicId: CLINIC_ID,
    name: 'Endodontic rotary file set — 25 mm',
    sku: 'INS-ENDO-25',
    category: 'INSTRUMENTS',
    quantity: 5,
    minimumQuantity: 6,
    unit: 'set',
    unitPrice: 72,
    supplierId: 'sup_dentalys',
    supplierName: supplierName('sup_dentalys'),
    expirationDate: null,
    batchNumber: 'EN-26-3391',
    dailyUsage: 0.12,
    lastRestocked: d(-61),
    location: 'Sterilisation room',
  },
  {
    id: 'inv_012',
    clinicId: CLINIC_ID,
    name: 'Diamond bur assortment',
    sku: 'INS-BUR-ASS',
    category: 'INSTRUMENTS',
    quantity: 24,
    minimumQuantity: 10,
    unit: 'pack of 10',
    unitPrice: 18.6,
    supplierId: 'sup_dentalys',
    supplierName: supplierName('sup_dentalys'),
    expirationDate: null,
    batchNumber: 'BR-26-1145',
    dailyUsage: 0.3,
    lastRestocked: d(-19),
    location: 'Cabinet B — drawer 1',
  },
  {
    id: 'inv_013',
    clinicId: CLINIC_ID,
    name: 'Surface disinfectant — 1 L',
    sku: 'DIS-SUR-1000',
    category: 'DISINFECTANTS',
    quantity: 0,
    minimumQuantity: 6,
    unit: 'bottle',
    unitPrice: 11.9,
    supplierId: 'sup_medix',
    supplierName: supplierName('sup_medix'),
    expirationDate: d(150),
    batchNumber: 'DS-26-0455',
    dailyUsage: 0.35,
    lastRestocked: d(-40),
    location: 'Storeroom — bay 3',
  },
  {
    id: 'inv_014',
    clinicId: CLINIC_ID,
    name: 'Chlorhexidine 0.2% mouthrinse — 300 ml',
    sku: 'DIS-CHX-300',
    category: 'DISINFECTANTS',
    quantity: 22,
    minimumQuantity: 10,
    unit: 'bottle',
    unitPrice: 4.3,
    supplierId: 'sup_medix',
    supplierName: supplierName('sup_medix'),
    expirationDate: d(19),
    batchNumber: 'CX-25-8802',
    dailyUsage: 0.2,
    lastRestocked: d(-90),
    location: 'Cabinet C — shelf 1',
  },
  {
    id: 'inv_015',
    clinicId: CLINIC_ID,
    name: 'Disposable saliva ejectors',
    sku: 'CNS-SAL-100',
    category: 'CONSUMABLES',
    quantity: 9,
    minimumQuantity: 14,
    unit: 'bag of 100',
    unitPrice: 3.2,
    supplierId: 'sup_orapro',
    supplierName: supplierName('sup_orapro'),
    expirationDate: d(640),
    batchNumber: 'SE-26-0312',
    dailyUsage: 0.5,
    lastRestocked: d(-23),
    location: 'Storeroom — bay 2',
  },
  {
    id: 'inv_016',
    clinicId: CLINIC_ID,
    name: 'Impression material — polyvinyl siloxane',
    sku: 'CNS-PVS-050',
    category: 'CONSUMABLES',
    quantity: 16,
    minimumQuantity: 8,
    unit: 'cartridge',
    unitPrice: 21.4,
    supplierId: 'sup_dentalys',
    supplierName: supplierName('sup_dentalys'),
    expirationDate: d(28),
    batchNumber: 'PV-25-6621',
    dailyUsage: 0.22,
    lastRestocked: d(-52),
    location: 'Cabinet B — drawer 3',
  },
  {
    id: 'inv_017',
    clinicId: CLINIC_ID,
    name: 'Sterilisation pouches 90 × 230 mm',
    sku: 'CNS-STP-200',
    category: 'CONSUMABLES',
    quantity: 31,
    minimumQuantity: 12,
    unit: 'box of 200',
    unitPrice: 8.9,
    supplierId: 'sup_orapro',
    supplierName: supplierName('sup_orapro'),
    expirationDate: d(760),
    batchNumber: 'SP-26-0071',
    dailyUsage: 0.4,
    lastRestocked: d(-15),
    location: 'Sterilisation room',
  },
];

export function inventoryItem(id: string): InventoryItem | undefined {
  return inventory.find((item) => item.id === id);
}

/* ============================================================
   BILLING
   ============================================================ */

interface InvoiceSeed {
  number: string;
  patientId: string;
  treatmentId: string | null;
  treatment: string;
  lines: { label: string; quantity: number; unitPrice: number }[];
  issued: number;
  due: number;
  status: Invoice['status'];
  method: Invoice['paymentMethod'];
}

const invoiceSeeds: InvoiceSeed[] = [
  {
    number: '1042',
    patientId: 'pat_004',
    treatmentId: 'trt_003',
    treatment: 'Endodontic retreatment — 26',
    lines: [
      { label: 'Endodontic retreatment', quantity: 1, unitPrice: 520 },
      { label: 'Radiographic assessment', quantity: 2, unitPrice: 35 },
    ],
    issued: -48,
    due: -18,
    status: 'OVERDUE',
    method: 'UNPAID',
  },
  {
    number: '1043',
    patientId: 'pat_001',
    treatmentId: 'trt_001',
    treatment: 'Zirconia crown — 16',
    lines: [
      { label: 'Crown preparation', quantity: 1, unitPrice: 260 },
      { label: 'Zirconia crown (laboratory)', quantity: 1, unitPrice: 420 },
    ],
    issued: -30,
    due: 0,
    status: 'PENDING',
    method: 'UNPAID',
  },
  {
    number: '1044',
    patientId: 'pat_015',
    treatmentId: 'trt_011',
    treatment: 'Composite restoration — 25',
    lines: [{ label: 'Composite restoration (two surfaces)', quantity: 1, unitPrice: 160 }],
    issued: -27,
    due: -13,
    status: 'PAID',
    method: 'CARD',
  },
  {
    number: '1045',
    patientId: 'pat_002',
    treatmentId: 'trt_002',
    treatment: 'Implant — 36',
    lines: [
      { label: 'Implant placement', quantity: 1, unitPrice: 1200 },
      { label: 'CBCT planning', quantity: 1, unitPrice: 180 },
      { label: 'Healing abutment', quantity: 1, unitPrice: 90 },
    ],
    issued: -22,
    due: 8,
    status: 'PENDING',
    method: 'UNPAID',
  },
  {
    number: '1046',
    patientId: 'pat_010',
    treatmentId: 'trt_012',
    treatment: 'Periodontal maintenance',
    lines: [{ label: 'Periodontal maintenance session', quantity: 2, unitPrice: 95 }],
    issued: -19,
    due: -5,
    status: 'PAID',
    method: 'INSURANCE',
  },
  {
    number: '1047',
    patientId: 'pat_014',
    treatmentId: 'trt_006',
    treatment: 'Three-unit bridge — 34 to 36',
    lines: [
      { label: 'Abutment preparation', quantity: 2, unitPrice: 240 },
      { label: 'Bridge (laboratory)', quantity: 1, unitPrice: 960 },
    ],
    issued: -16,
    due: 14,
    status: 'PENDING',
    method: 'UNPAID',
  },
  {
    number: '1048',
    patientId: 'pat_009',
    treatmentId: 'trt_005',
    treatment: 'Clear aligner therapy — instalment 3/6',
    lines: [{ label: 'Aligner therapy instalment', quantity: 1, unitPrice: 566 }],
    issued: -12,
    due: 2,
    status: 'PENDING',
    method: 'UNPAID',
  },
  {
    number: '1049',
    patientId: 'pat_003',
    treatmentId: null,
    treatment: 'Scaling & polishing',
    lines: [{ label: 'Scaling and polishing', quantity: 1, unitPrice: 85 }],
    issued: -21,
    due: -7,
    status: 'PAID',
    method: 'CARD',
  },
  {
    number: '1050',
    patientId: 'pat_011',
    treatmentId: 'trt_009',
    treatment: 'In-office whitening',
    lines: [
      { label: 'Pre-treatment scaling', quantity: 1, unitPrice: 85 },
      { label: 'In-office whitening session', quantity: 1, unitPrice: 305 },
    ],
    issued: -9,
    due: 21,
    status: 'PENDING',
    method: 'UNPAID',
  },
  {
    number: '1051',
    patientId: 'pat_018',
    treatmentId: 'trt_007',
    treatment: 'Implant — 46 (deposit)',
    lines: [{ label: 'Treatment deposit', quantity: 1, unitPrice: 800 }],
    issued: -14,
    due: -4,
    status: 'PAID',
    method: 'TRANSFER',
  },
  {
    number: '1052',
    patientId: 'pat_006',
    treatmentId: 'trt_004',
    treatment: 'Full upper denture (stage 1)',
    lines: [
      { label: 'Extractions — upper anterior', quantity: 6, unitPrice: 110 },
      { label: 'Primary impressions', quantity: 1, unitPrice: 140 },
    ],
    issued: -26,
    due: 4,
    status: 'PENDING',
    method: 'UNPAID',
  },
  {
    number: '1053',
    patientId: 'pat_008',
    treatmentId: null,
    treatment: 'Emergency consultation',
    lines: [{ label: 'Emergency consultation', quantity: 1, unitPrice: 70 }],
    issued: -60,
    due: -46,
    status: 'OVERDUE',
    method: 'UNPAID',
  },
  {
    number: '1054',
    patientId: 'pat_016',
    treatmentId: 'trt_008',
    treatment: 'Surgical extraction — 48',
    lines: [{ label: 'Surgical extraction', quantity: 1, unitPrice: 340 }],
    issued: -6,
    due: 24,
    status: 'PENDING',
    method: 'UNPAID',
  },
  {
    number: '1055',
    patientId: 'pat_019',
    treatmentId: null,
    treatment: 'Routine check-up',
    lines: [{ label: 'Examination and advice', quantity: 1, unitPrice: 55 }],
    issued: -18,
    due: -4,
    status: 'PAID',
    method: 'CASH',
  },
];

export const invoices: Invoice[] = invoiceSeeds.map((seed, index) => {
  const patient = patients.find((p) => p.id === seed.patientId);
  const amount = seed.lines.reduce(
    (acc, line) => acc + line.quantity * line.unitPrice,
    0,
  );
  return {
    id: `inv_doc_${index + 1}`,
    clinicId: CLINIC_ID,
    number: seed.number,
    patientId: seed.patientId,
    patientName: patient?.fullName ?? 'Unknown patient',
    treatmentId: seed.treatmentId,
    treatment: seed.treatment,
    lines: seed.lines.map((line, i) => ({
      id: `line_${index}_${i}`,
      label: line.label,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
    })),
    amount,
    taxRate: 0,
    issuedDate: d(seed.issued),
    dueDate: d(seed.due),
    status: seed.status,
    paymentMethod: seed.method,
  };
});

export const payments: Payment[] = invoices
  .filter((invoice) => invoice.status === 'PAID')
  .map((invoice, index) => ({
    id: `pay_${index + 1}`,
    clinicId: CLINIC_ID,
    invoiceId: invoice.id,
    patientId: invoice.patientId,
    patientName: invoice.patientName,
    amount: invoice.amount,
    method: invoice.paymentMethod,
    date: invoice.dueDate,
    reference: `PAY-2026-${String(4100 + index)}`,
  }));

/* ============================================================
   NOTIFICATIONS
   ============================================================ */

export const notifications: Notification[] = [
  {
    id: 'ntf_01',
    clinicId: CLINIC_ID,
    kind: 'APPOINTMENT',
    severity: 'INFO',
    title: 'Appointment tomorrow at 09:30',
    body: 'Clara Nguyen — initial consultation with Dr. Léa Moreau.',
    createdAt: hoursAgo(1),
    read: false,
    href: '/dashboard/appointments',
  },
  {
    id: 'ntf_02',
    clinicId: CLINIC_ID,
    kind: 'INVENTORY',
    severity: 'WARNING',
    title: 'Gloves stock is below minimum',
    body: 'Nitrile examination gloves (size M): 6 boxes remaining, minimum 15.',
    createdAt: hoursAgo(2),
    read: false,
    href: '/dashboard/inventory',
  },
  {
    id: 'ntf_03',
    clinicId: CLINIC_ID,
    kind: 'PATIENT',
    severity: 'WARNING',
    title: 'Patient Inès Lefèvre has not returned for 8 months',
    body: 'Last visit was a composite filling. Recall contact suggested.',
    createdAt: hoursAgo(4),
    read: false,
    href: '/dashboard/patients/pat_005',
  },
  {
    id: 'ntf_04',
    clinicId: CLINIC_ID,
    kind: 'BILLING',
    severity: 'CRITICAL',
    title: 'Invoice #1042 is overdue',
    body: 'Mehdi Tazi — €590 outstanding, 18 days past the due date.',
    createdAt: hoursAgo(5),
    read: false,
    href: '/dashboard/billing',
  },
  {
    id: 'ntf_05',
    clinicId: CLINIC_ID,
    kind: 'INVENTORY',
    severity: 'CRITICAL',
    title: 'Surface disinfectant out of stock',
    body: 'Zero bottles remaining. Lead time from Medix Supply is 6 days.',
    createdAt: hoursAgo(7),
    read: false,
    href: '/dashboard/inventory',
  },
  {
    id: 'ntf_06',
    clinicId: CLINIC_ID,
    kind: 'AI',
    severity: 'INFO',
    title: 'Weekly operations digest ready',
    body: 'Chair utilisation rose to 78% and no-shows fell to 4.2% last week.',
    createdAt: hoursAgo(9),
    read: false,
    href: '/dashboard/ai',
  },
  {
    id: 'ntf_07',
    clinicId: CLINIC_ID,
    kind: 'APPOINTMENT',
    severity: 'WARNING',
    title: 'No-show recorded',
    body: 'Hugo Martin did not attend the 14:30 appointment on 11 Sep.',
    createdAt: hoursAgo(12),
    read: true,
    href: '/dashboard/appointments',
  },
  {
    id: 'ntf_08',
    clinicId: CLINIC_ID,
    kind: 'INVENTORY',
    severity: 'WARNING',
    title: 'Chlorhexidine mouthrinse expiring',
    body: '22 bottles expire in 19 days. Prioritise for dispensing.',
    createdAt: hoursAgo(20),
    read: true,
    href: '/dashboard/inventory',
  },
  {
    id: 'ntf_09',
    clinicId: CLINIC_ID,
    kind: 'PATIENT',
    severity: 'INFO',
    title: 'New patient registered',
    body: 'Amina Kettani completed online registration.',
    createdAt: hoursAgo(26),
    read: true,
    href: '/dashboard/patients/pat_013',
  },
  {
    id: 'ntf_10',
    clinicId: CLINIC_ID,
    kind: 'BILLING',
    severity: 'INFO',
    title: 'Payment received',
    body: 'Omar Ziani — €800 treatment deposit settled by bank transfer.',
    createdAt: hoursAgo(31),
    read: true,
    href: '/dashboard/billing',
  },
  {
    id: 'ntf_11',
    clinicId: CLINIC_ID,
    kind: 'SYSTEM',
    severity: 'INFO',
    title: 'Backup completed',
    body: 'Clinic data synchronised successfully at 03:00.',
    createdAt: hoursAgo(33),
    read: true,
    href: null,
  },
  {
    id: 'ntf_12',
    clinicId: CLINIC_ID,
    kind: 'APPOINTMENT',
    severity: 'INFO',
    title: 'Schedule confirmed for next week',
    body: '38 appointments confirmed between 21 and 26 September.',
    createdAt: hoursAgo(38),
    read: true,
    href: '/dashboard/appointments',
  },
  {
    id: 'ntf_13',
    clinicId: CLINIC_ID,
    kind: 'AI',
    severity: 'WARNING',
    title: 'Composite resin depletion forecast',
    body: 'Composite resin A3 reaches minimum stock in approximately 8 days.',
    createdAt: hoursAgo(44),
    read: true,
    href: '/dashboard/inventory',
  },
  {
    id: 'ntf_14',
    clinicId: CLINIC_ID,
    kind: 'PATIENT',
    severity: 'HIGH' as never,
    title: 'Medical alert added',
    body: 'Manon Faure — pregnancy recorded, radiographs deferred.',
    createdAt: hoursAgo(50),
    read: true,
    href: '/dashboard/patients/pat_019',
  },
  {
    id: 'ntf_15',
    clinicId: CLINIC_ID,
    kind: 'BILLING',
    severity: 'CRITICAL',
    title: 'Invoice #1053 is overdue',
    body: 'Hugo Martin — €70 outstanding, 46 days past the due date.',
    createdAt: hoursAgo(56),
    read: true,
    href: '/dashboard/billing',
  },
  {
    id: 'ntf_16',
    clinicId: CLINIC_ID,
    kind: 'SYSTEM',
    severity: 'INFO',
    title: 'Staff schedule updated',
    body: 'Thomas Rey marked as on leave until 28 September.',
    createdAt: hoursAgo(62),
    read: true,
    href: '/dashboard/staff',
  },
  {
    id: 'ntf_17',
    clinicId: CLINIC_ID,
    kind: 'INVENTORY',
    severity: 'INFO',
    title: 'Delivery received',
    body: 'Dentalys Europe — 24 packs of diamond burs added to stock.',
    createdAt: hoursAgo(70),
    read: true,
    href: '/dashboard/inventory',
  },
  {
    id: 'ntf_18',
    clinicId: CLINIC_ID,
    kind: 'PATIENT',
    severity: 'WARNING',
    title: 'Treatment plan awaiting decision',
    body: 'Hugo Martin has not yet accepted the occlusal splint proposal.',
    createdAt: hoursAgo(78),
    read: true,
    href: '/dashboard/treatments',
  },
  {
    id: 'ntf_19',
    clinicId: CLINIC_ID,
    kind: 'AI',
    severity: 'INFO',
    title: 'Recall opportunity identified',
    body: '12 patients have not had a follow-up appointment in six months.',
    createdAt: hoursAgo(86),
    read: true,
    href: '/dashboard/ai',
  },
  {
    id: 'ntf_20',
    clinicId: CLINIC_ID,
    kind: 'SYSTEM',
    severity: 'INFO',
    title: 'DENTRA updated to version 1.0.0',
    body: 'Odontogram annotations and AI inventory forecasting are now available.',
    createdAt: hoursAgo(96),
    read: true,
    href: null,
  },
];

/* ============================================================
   ANALYTICS SERIES
   ============================================================ */

/**
 * Daily operating series for the last 400 days. Weekly seasonality (quiet
 * Saturdays, closed Sundays) plus mild growth keeps the charts believable.
 */
function buildSeries(): TimeSeriesPoint[] {
  const rand = seededRandom(31337);
  const points: TimeSeriesPoint[] = [];

  for (let offset = -399; offset <= 0; offset += 1) {
    const date = d(offset);
    const weekday = new Date(date).getDay();
    const closed = weekday === 0;
    const saturday = weekday === 6;

    const growth = 1 + (400 + offset) / 2600;
    const noise = 0.85 + rand() * 0.3;

    const appointmentsCount = closed
      ? 0
      : Math.round((saturday ? 7 : 15) * growth * noise);
    const revenue = closed ? 0 : Math.round(appointmentsCount * (68 + rand() * 46));
    const newPatients = closed ? 0 : Math.round(rand() * (saturday ? 2 : 4));
    const returningPatients = Math.max(0, appointmentsCount - newPatients);
    const noShows = closed ? 0 : Math.round(rand() * (appointmentsCount > 10 ? 2 : 1));
    const inventoryCost = closed ? 0 : Math.round(revenue * (0.1 + rand() * 0.05));

    points.push({
      label: date,
      revenue,
      appointments: appointmentsCount,
      newPatients,
      returningPatients,
      noShows,
      inventoryCost,
    });
  }

  return points;
}

export const dailySeries: TimeSeriesPoint[] = buildSeries();

/**
 * Month-to-date revenue is pinned to the clinic's reported figure so the
 * dashboard headline and the analytics charts agree.
 */
(function calibrateMonthToDate() {
  const monthStart = `${DEMO_TODAY.slice(0, 7)}-01`;
  const mtd = dailySeries.filter((p) => p.label >= monthStart);
  const total = mtd.reduce((acc, p) => acc + p.revenue, 0);
  if (total === 0) return;

  const factor = clinicStats.monthlyRevenue / total;
  mtd.forEach((point) => {
    point.revenue = Math.round(point.revenue * factor);
    point.inventoryCost = Math.round(point.inventoryCost * factor);
  });

  // Rounding each day independently drifts by a euro or two against the
  // target. Push the remainder onto the busiest trading day so the headline
  // figure and the chart's own sum agree exactly.
  const scaled = mtd.reduce((acc, p) => acc + p.revenue, 0);
  const remainder = clinicStats.monthlyRevenue - scaled;
  if (remainder !== 0) {
    const busiest = mtd.reduce((best, p) => (p.revenue > best.revenue ? p : best), mtd[0]);
    busiest.revenue += remainder;
  }
})();

/* ============================================================
   AI INSIGHTS
   ============================================================ */

export const aiInsights: AIInsight[] = [
  {
    id: 'ins_01',
    title: 'Composite resin depletion',
    body: 'Composite resin A3 is expected to reach minimum stock in approximately 8 days based on recent usage.',
    severity: 'WARNING',
    metric: '8 DAYS',
    href: '/dashboard/inventory',
  },
  {
    id: 'ins_02',
    title: 'Expiry window',
    body: '3 products expire within 30 days. Prioritise them for dispensing or return them to the supplier.',
    severity: 'WARNING',
    metric: '3 PRODUCTS',
    href: '/dashboard/inventory',
  },
  {
    id: 'ins_03',
    title: 'Reorder suggestion',
    body: 'Consider ordering 12 units of nitrile gloves to cover the next six weeks of consumption.',
    severity: 'INFO',
    metric: '12 UNITS',
    href: '/dashboard/inventory',
  },
  {
    id: 'ins_04',
    title: 'Recall opportunity',
    body: '12 patients have not had a follow-up appointment in the last six months.',
    severity: 'INFO',
    metric: '12 PATIENTS',
    href: '/dashboard/patients',
  },
  {
    id: 'ins_05',
    title: 'Outstanding balances',
    body: 'Two invoices are overdue, representing €660 of unrecovered revenue.',
    severity: 'CRITICAL',
    metric: '€660',
    href: '/dashboard/billing',
  },
  {
    id: 'ins_06',
    title: 'Schedule pressure',
    body: 'Tuesday afternoons are running at 94% chair utilisation. Consider opening a second hygiene slot.',
    severity: 'INFO',
    metric: '94%',
    href: '/dashboard/appointments',
  },
];

/* ============================================================
   LOOKUPS
   ============================================================ */

export function patientById(id: string): Patient | undefined {
  return patients.find((p) => p.id === id);
}

export function staffById(id: string): StaffMember | undefined {
  return staff.find((s) => s.id === id);
}

export function invoicesForPatient(patientId: string): Invoice[] {
  return invoices.filter((i) => i.patientId === patientId);
}

export function paymentsForPatient(patientId: string): Payment[] {
  return payments.filter((p) => p.patientId === patientId);
}

/** Patients with no visit in the last six months — drives recall prompts. */
export function patientsNeedingFollowUp(): Patient[] {
  return patients.filter((patient) => {
    if (!patient.lastVisit) return false;
    if (patient.nextAppointment) return false;
    return daysBetween(patient.lastVisit, DEMO_TODAY) >= 180;
  });
}

export const DEMO_CREDENTIALS = {
  email: 'demo@dentra.app',
  password: 'demo123',
};

export const todayISO = DEMO_TODAY;
export const tomorrowISO = d(1);
export const yesterdayISO = d(-1);

/** Re-exported for screens that need to align their own calculations. */
export { toISODate };
