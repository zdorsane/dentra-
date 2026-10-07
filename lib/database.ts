/**
 * DENTRA — Multi-tenant database architecture
 *
 * This module is the single description of the persistence layer. It holds:
 *
 *  1. The table catalogue (`SCHEMA`) — every table, its columns and its
 *     tenancy rule.
 *  2. The SQL migration (`MIGRATION_SQL`) that provisions the schema in
 *     Postgres, including Row Level Security.
 *  3. A thin repository API that the UI consumes, which resolves to the demo
 *     store today and to Supabase once credentials are supplied.
 *
 * TENANCY MODEL
 * -------------
 * Every domain table carries `clinic_id`. A user's clinic membership is
 * recorded in `clinic_members`. RLS policies compare `clinic_id` against the
 * caller's memberships, so a query can never cross a tenant boundary even if
 * the client sends an arbitrary filter.
 */

import { isSupabaseConfigured } from './supabase';

/* ============================================================
   SCHEMA CATALOGUE
   ============================================================ */

export interface ColumnSpec {
  name: string;
  type: string;
  nullable?: boolean;
  note?: string;
}

export interface TableSpec {
  name: string;
  description: string;
  /** False only for the tenant root itself. */
  tenantScoped: boolean;
  columns: ColumnSpec[];
}

export const SCHEMA: TableSpec[] = [
  {
    name: 'clinics',
    description: 'Tenant root. One row per dental practice.',
    tenantScoped: false,
    columns: [
      { name: 'id', type: 'uuid primary key' },
      { name: 'name', type: 'text' },
      { name: 'legal_name', type: 'text' },
      { name: 'email', type: 'text' },
      { name: 'phone', type: 'text' },
      { name: 'address_line', type: 'text' },
      { name: 'city', type: 'text' },
      { name: 'country', type: 'text' },
      { name: 'postal_code', type: 'text' },
      { name: 'tax_id', type: 'text' },
      { name: 'timezone', type: 'text' },
      { name: 'currency', type: 'text' },
      { name: 'working_hours', type: 'jsonb' },
      { name: 'services', type: 'text[]' },
      { name: 'created_at', type: 'timestamptz' },
    ],
  },
  {
    name: 'users',
    description: 'Application users, mirrored from auth.users.',
    tenantScoped: true,
    columns: [
      { name: 'id', type: 'uuid primary key', note: 'matches auth.users.id' },
      { name: 'clinic_id', type: 'uuid references clinics(id)' },
      { name: 'full_name', type: 'text' },
      { name: 'email', type: 'text' },
      { name: 'phone', type: 'text' },
      { name: 'role', type: 'staff_role' },
      { name: 'created_at', type: 'timestamptz' },
    ],
  },
  {
    name: 'staff',
    description: 'Employment records and clinical credentials.',
    tenantScoped: true,
    columns: [
      { name: 'id', type: 'uuid primary key' },
      { name: 'clinic_id', type: 'uuid references clinics(id)' },
      { name: 'user_id', type: 'uuid references users(id)' },
      { name: 'role', type: 'staff_role' },
      { name: 'specialty', type: 'text' },
      { name: 'license_number', type: 'text' },
      { name: 'status', type: 'text' },
      { name: 'weekly_hours', type: 'integer' },
      { name: 'joined_at', type: 'date' },
    ],
  },
  {
    name: 'patients',
    description: 'Patient registry and demographics.',
    tenantScoped: true,
    columns: [
      { name: 'id', type: 'uuid primary key' },
      { name: 'clinic_id', type: 'uuid references clinics(id)' },
      { name: 'file_number', type: 'text' },
      { name: 'first_name', type: 'text' },
      { name: 'last_name', type: 'text' },
      { name: 'date_of_birth', type: 'date' },
      { name: 'gender', type: 'text' },
      { name: 'phone', type: 'text' },
      { name: 'email', type: 'text' },
      { name: 'address_line', type: 'text' },
      { name: 'city', type: 'text' },
      { name: 'country', type: 'text' },
      { name: 'insurance_provider', type: 'text' },
      { name: 'insurance_number', type: 'text' },
      { name: 'status', type: 'text' },
      { name: 'assigned_dentist_id', type: 'uuid references staff(id)' },
      { name: 'medical_alerts', type: 'jsonb' },
      { name: 'medical_history', type: 'jsonb' },
      { name: 'balance', type: 'numeric(10,2)' },
      { name: 'created_at', type: 'timestamptz' },
    ],
  },
  {
    name: 'teeth',
    description: 'Odontogram state — one row per tooth per patient (FDI).',
    tenantScoped: true,
    columns: [
      { name: 'id', type: 'uuid primary key' },
      { name: 'clinic_id', type: 'uuid references clinics(id)' },
      { name: 'patient_id', type: 'uuid references patients(id)' },
      { name: 'number', type: 'smallint', note: 'FDI notation, 11–48' },
      { name: 'condition', type: 'tooth_condition' },
      { name: 'status', type: 'text' },
      { name: 'treatment', type: 'text' },
      { name: 'notes', type: 'text' },
      { name: 'last_updated', type: 'date' },
    ],
  },
  {
    name: 'appointments',
    description: 'Schedule entries across rooms and practitioners.',
    tenantScoped: true,
    columns: [
      { name: 'id', type: 'uuid primary key' },
      { name: 'clinic_id', type: 'uuid references clinics(id)' },
      { name: 'patient_id', type: 'uuid references patients(id)' },
      { name: 'dentist_id', type: 'uuid references staff(id)' },
      { name: 'treatment', type: 'text' },
      { name: 'date', type: 'date' },
      { name: 'start_time', type: 'time' },
      { name: 'end_time', type: 'time' },
      { name: 'status', type: 'appointment_status' },
      { name: 'room', type: 'text' },
      { name: 'notes', type: 'text' },
      { name: 'created_at', type: 'timestamptz' },
    ],
  },
  {
    name: 'treatments',
    description: 'Treatment plans with staged steps and pricing.',
    tenantScoped: true,
    columns: [
      { name: 'id', type: 'uuid primary key' },
      { name: 'clinic_id', type: 'uuid references clinics(id)' },
      { name: 'patient_id', type: 'uuid references patients(id)' },
      { name: 'dentist_id', type: 'uuid references staff(id)' },
      { name: 'type', type: 'text' },
      { name: 'category', type: 'text' },
      { name: 'teeth', type: 'smallint[]' },
      { name: 'start_date', type: 'date' },
      { name: 'expected_completion', type: 'date' },
      { name: 'price', type: 'numeric(10,2)' },
      { name: 'status', type: 'treatment_status' },
      { name: 'steps', type: 'jsonb' },
      { name: 'notes', type: 'text' },
    ],
  },
  {
    name: 'suppliers',
    description: 'Procurement contacts and lead times.',
    tenantScoped: true,
    columns: [
      { name: 'id', type: 'uuid primary key' },
      { name: 'clinic_id', type: 'uuid references clinics(id)' },
      { name: 'name', type: 'text' },
      { name: 'contact_name', type: 'text' },
      { name: 'email', type: 'text' },
      { name: 'phone', type: 'text' },
      { name: 'country', type: 'text' },
      { name: 'lead_time_days', type: 'integer' },
    ],
  },
  {
    name: 'inventory',
    description: 'Stock items with batch, expiry and consumption tracking.',
    tenantScoped: true,
    columns: [
      { name: 'id', type: 'uuid primary key' },
      { name: 'clinic_id', type: 'uuid references clinics(id)' },
      { name: 'name', type: 'text' },
      { name: 'sku', type: 'text' },
      { name: 'category', type: 'inventory_category' },
      { name: 'quantity', type: 'integer' },
      { name: 'minimum_quantity', type: 'integer' },
      { name: 'unit', type: 'text' },
      { name: 'unit_price', type: 'numeric(10,2)' },
      { name: 'supplier_id', type: 'uuid references suppliers(id)' },
      { name: 'expiration_date', type: 'date', nullable: true },
      { name: 'batch_number', type: 'text' },
      { name: 'daily_usage', type: 'numeric(6,2)' },
      { name: 'last_restocked', type: 'date' },
      { name: 'location', type: 'text' },
    ],
  },
  {
    name: 'invoices',
    description: 'Billing documents issued to patients.',
    tenantScoped: true,
    columns: [
      { name: 'id', type: 'uuid primary key' },
      { name: 'clinic_id', type: 'uuid references clinics(id)' },
      { name: 'number', type: 'text' },
      { name: 'patient_id', type: 'uuid references patients(id)' },
      { name: 'treatment_id', type: 'uuid references treatments(id)', nullable: true },
      { name: 'lines', type: 'jsonb' },
      { name: 'amount', type: 'numeric(10,2)' },
      { name: 'tax_rate', type: 'numeric(5,2)' },
      { name: 'issued_date', type: 'date' },
      { name: 'due_date', type: 'date' },
      { name: 'status', type: 'invoice_status' },
      { name: 'payment_method', type: 'text' },
    ],
  },
  {
    name: 'payments',
    description: 'Settlements recorded against invoices.',
    tenantScoped: true,
    columns: [
      { name: 'id', type: 'uuid primary key' },
      { name: 'clinic_id', type: 'uuid references clinics(id)' },
      { name: 'invoice_id', type: 'uuid references invoices(id)' },
      { name: 'patient_id', type: 'uuid references patients(id)' },
      { name: 'amount', type: 'numeric(10,2)' },
      { name: 'method', type: 'text' },
      { name: 'date', type: 'date' },
      { name: 'reference', type: 'text' },
    ],
  },
  {
    name: 'notifications',
    description: 'Operational alerts surfaced in the notification centre.',
    tenantScoped: true,
    columns: [
      { name: 'id', type: 'uuid primary key' },
      { name: 'clinic_id', type: 'uuid references clinics(id)' },
      { name: 'kind', type: 'text' },
      { name: 'severity', type: 'text' },
      { name: 'title', type: 'text' },
      { name: 'body', type: 'text' },
      { name: 'href', type: 'text', nullable: true },
      { name: 'read', type: 'boolean' },
      { name: 'created_at', type: 'timestamptz' },
    ],
  },
];

export const TABLE_NAMES = SCHEMA.map((table) => table.name);

/* ============================================================
   MIGRATION
   ============================================================ */

/**
 * Provisioning SQL. Run once in the Supabase SQL editor to create the schema
 * described above, then set the two `NEXT_PUBLIC_SUPABASE_*` variables.
 */
export const MIGRATION_SQL = `
-- ============================================================
-- DENTRA — multi-tenant schema
-- ============================================================

create extension if not exists "pgcrypto";

-- Enumerated domains -----------------------------------------
do $$ begin
  create type staff_role as enum ('OWNER','DENTIST','ASSISTANT','RECEPTIONIST','MANAGER');
exception when duplicate_object then null; end $$;

do $$ begin
  create type appointment_status as enum ('SCHEDULED','CONFIRMED','COMPLETED','CANCELLED','NO-SHOW');
exception when duplicate_object then null; end $$;

do $$ begin
  create type treatment_status as enum ('PROPOSED','ACCEPTED','IN PROGRESS','COMPLETED','CANCELLED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type invoice_status as enum ('PAID','PENDING','OVERDUE');
exception when duplicate_object then null; end $$;

do $$ begin
  create type inventory_category as enum ('COMPOSITE','ANESTHETIC','GLOVES','MASKS','IMPLANTS','INSTRUMENTS','DISINFECTANTS','CONSUMABLES','OTHER');
exception when duplicate_object then null; end $$;

do $$ begin
  create type tooth_condition as enum ('HEALTHY','CARIES','FILLED','CROWN','IMPLANT','ROOT CANAL','MISSING','EXTRACTION','FRACTURE');
exception when duplicate_object then null; end $$;

-- Tenant root -------------------------------------------------
create table if not exists clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  email text,
  phone text,
  address_line text,
  city text,
  country text,
  postal_code text,
  tax_id text,
  timezone text default 'Europe/Paris',
  currency text default 'EUR',
  working_hours jsonb default '[]'::jsonb,
  services text[] default '{}',
  created_at timestamptz default now()
);

create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  clinic_id uuid not null references clinics(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  role staff_role not null default 'DENTIST',
  created_at timestamptz default now()
);

-- Membership drives every RLS policy --------------------------
create table if not exists clinic_members (
  user_id uuid not null references auth.users(id) on delete cascade,
  clinic_id uuid not null references clinics(id) on delete cascade,
  role staff_role not null default 'DENTIST',
  created_at timestamptz default now(),
  primary key (user_id, clinic_id)
);

create table if not exists staff (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  role staff_role not null,
  specialty text,
  license_number text,
  status text default 'ACTIVE',
  weekly_hours integer default 35,
  joined_at date default current_date
);

create table if not exists patients (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  file_number text,
  first_name text not null,
  last_name text not null,
  date_of_birth date,
  gender text,
  phone text,
  email text,
  address_line text,
  city text,
  country text,
  insurance_provider text,
  insurance_number text,
  status text default 'ACTIVE',
  assigned_dentist_id uuid references staff(id) on delete set null,
  medical_alerts jsonb default '[]'::jsonb,
  medical_history jsonb default '[]'::jsonb,
  balance numeric(10,2) default 0,
  created_at timestamptz default now()
);

create table if not exists teeth (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  number smallint not null check (number between 11 and 48),
  condition tooth_condition not null default 'HEALTHY',
  status text default 'STABLE',
  treatment text,
  notes text,
  last_updated date default current_date,
  unique (patient_id, number)
);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  dentist_id uuid references staff(id) on delete set null,
  treatment text,
  date date not null,
  start_time time not null,
  end_time time not null,
  status appointment_status not null default 'SCHEDULED',
  room text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists treatments (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  dentist_id uuid references staff(id) on delete set null,
  type text not null,
  category text,
  teeth smallint[] default '{}',
  start_date date,
  expected_completion date,
  price numeric(10,2) default 0,
  status treatment_status not null default 'PROPOSED',
  steps jsonb default '[]'::jsonb,
  notes text
);

create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  name text not null,
  contact_name text,
  email text,
  phone text,
  country text,
  lead_time_days integer default 7
);

create table if not exists inventory (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  name text not null,
  sku text,
  category inventory_category not null default 'OTHER',
  quantity integer not null default 0,
  minimum_quantity integer not null default 0,
  unit text,
  unit_price numeric(10,2) default 0,
  supplier_id uuid references suppliers(id) on delete set null,
  expiration_date date,
  batch_number text,
  daily_usage numeric(6,2) default 0,
  last_restocked date,
  location text
);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  number text not null,
  patient_id uuid not null references patients(id) on delete cascade,
  treatment_id uuid references treatments(id) on delete set null,
  lines jsonb default '[]'::jsonb,
  amount numeric(10,2) not null default 0,
  tax_rate numeric(5,2) default 0,
  issued_date date default current_date,
  due_date date,
  status invoice_status not null default 'PENDING',
  payment_method text default 'UNPAID'
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  invoice_id uuid not null references invoices(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  amount numeric(10,2) not null,
  method text,
  date date default current_date,
  reference text
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  kind text,
  severity text default 'INFO',
  title text not null,
  body text,
  href text,
  read boolean default false,
  created_at timestamptz default now()
);

-- Indexes ------------------------------------------------------
create index if not exists idx_patients_clinic on patients(clinic_id);
create index if not exists idx_appointments_clinic_date on appointments(clinic_id, date);
create index if not exists idx_teeth_patient on teeth(patient_id);
create index if not exists idx_treatments_clinic on treatments(clinic_id);
create index if not exists idx_inventory_clinic on inventory(clinic_id);
create index if not exists idx_invoices_clinic_status on invoices(clinic_id, status);
create index if not exists idx_notifications_clinic_read on notifications(clinic_id, read);

-- ============================================================
-- ROW LEVEL SECURITY
-- A user may only touch rows belonging to a clinic they are a
-- member of. The helper is SECURITY DEFINER so the membership
-- lookup itself is not subject to RLS recursion.
-- ============================================================

create or replace function auth_clinic_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select clinic_id from clinic_members where user_id = auth.uid();
$$;

alter table clinics          enable row level security;
alter table users            enable row level security;
alter table clinic_members   enable row level security;
alter table staff            enable row level security;
alter table patients         enable row level security;
alter table teeth            enable row level security;
alter table appointments     enable row level security;
alter table treatments       enable row level security;
alter table suppliers        enable row level security;
alter table inventory        enable row level security;
alter table invoices         enable row level security;
alter table payments         enable row level security;
alter table notifications    enable row level security;

-- Tenant root: a member may read and update only their own clinic.
drop policy if exists clinic_read on clinics;
create policy clinic_read on clinics
  for select using (id in (select auth_clinic_ids()));

drop policy if exists clinic_write on clinics;
create policy clinic_write on clinics
  for update using (id in (select auth_clinic_ids()))
  with check (id in (select auth_clinic_ids()));

-- Membership: a user sees only their own membership rows.
drop policy if exists members_self on clinic_members;
create policy members_self on clinic_members
  for select using (user_id = auth.uid());

-- Every tenant-scoped table follows the same shape.
do $$
declare
  t text;
begin
  foreach t in array array[
    'users','staff','patients','teeth','appointments','treatments',
    'suppliers','inventory','invoices','payments','notifications'
  ]
  loop
    execute format('drop policy if exists %I on %I;', t || '_tenant_all', t);
    execute format($f$
      create policy %I on %I
        for all
        using (clinic_id in (select auth_clinic_ids()))
        with check (clinic_id in (select auth_clinic_ids()));
    $f$, t || '_tenant_all', t);
  end loop;
end $$;
`.trim();

/* ============================================================
   REPOSITORY BOUNDARY
   ============================================================ */

export interface RepositoryInfo {
  backend: 'demo' | 'supabase';
  tables: number;
  tenantScoped: number;
  rlsEnabled: boolean;
}

export function repositoryInfo(): RepositoryInfo {
  return {
    backend: isSupabaseConfigured() ? 'supabase' : 'demo',
    tables: SCHEMA.length,
    tenantScoped: SCHEMA.filter((t) => t.tenantScoped).length,
    rlsEnabled: true,
  };
}

/**
 * Maps a domain collection onto its physical table. Keeping this indirection
 * in one place means the UI never hardcodes a table name, so swapping the
 * backend is a change to this module alone.
 */
export const COLLECTION_TABLE: Record<string, string> = {
  clinics: 'clinics',
  users: 'users',
  staff: 'staff',
  patients: 'patients',
  teeth: 'teeth',
  appointments: 'appointments',
  treatments: 'treatments',
  suppliers: 'suppliers',
  inventory: 'inventory',
  invoices: 'invoices',
  payments: 'payments',
  notifications: 'notifications',
};
