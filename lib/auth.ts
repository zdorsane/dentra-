/**
 * DENTRA — Authentication
 *
 * Demo mode uses a local session stored in `localStorage`; no network calls,
 * no credentials leave the browser. When Supabase is configured the same
 * functions become thin wrappers over `supabase.auth`.
 *
 * The demo session is a convenience for evaluating the product, not a
 * security boundary — it holds no secret and grants no real access.
 */

import { DEMO_CREDENTIALS, clinic, staff } from './mock-data';
import { isSupabaseConfigured } from './supabase';

import type { AuthResult, SessionUser, StaffRole } from '@/types';

const SESSION_KEY = 'dentra.session';
const REMEMBER_KEY = 'dentra.remember';

/* ============================================================
   SESSION STORAGE
   ============================================================ */

function readStorage(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string, persist: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    const store = persist ? window.localStorage : window.sessionStorage;
    store.setItem(key, value);
  } catch {
    /* Storage unavailable (private mode) — session simply won't persist. */
  }
}

function clearStorage(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  } catch {
    /* no-op */
  }
}

/* ============================================================
   SESSION
   ============================================================ */

export const DEMO_USER: SessionUser = {
  id: staff[0].userId,
  clinicId: clinic.id,
  clinicName: clinic.name,
  fullName: staff[0].fullName,
  email: DEMO_CREDENTIALS.email,
  role: staff[0].role,
  avatarInitials: staff[0].avatarInitials,
};

export function getSession(): SessionUser | null {
  const raw = readStorage(SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as SessionUser;
    if (!parsed?.id || !parsed?.clinicId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setSession(user: SessionUser, remember = true): void {
  writeStorage(SESSION_KEY, JSON.stringify(user), remember);
  writeStorage(REMEMBER_KEY, remember ? '1' : '0', remember);
}

export function clearSession(): void {
  clearStorage(SESSION_KEY);
  clearStorage(REMEMBER_KEY);
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}

/* ============================================================
   CREDENTIAL FLOWS
   ============================================================ */

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function passwordIssues(password: string): string[] {
  const issues: string[] = [];
  if (password.length < 6) issues.push('At least 6 characters');
  if (!/[a-zA-Z]/.test(password)) issues.push('At least one letter');
  return issues;
}

export interface SignInInput {
  email: string;
  password: string;
  remember?: boolean;
}

export async function signIn({
  email,
  password,
  remember = true,
}: SignInInput): Promise<AuthResult> {
  const trimmed = email.trim().toLowerCase();

  if (!validateEmail(trimmed)) {
    return { ok: false, error: 'Enter a valid email address.' };
  }
  if (!password) {
    return { ok: false, error: 'Enter your password.' };
  }

  if (isSupabaseConfigured()) {
    // Live path — wire `supabase.auth.signInWithPassword` here.
    return {
      ok: false,
      error:
        'Supabase is configured but the auth client is not installed. Install @supabase/supabase-js to enable live sign-in.',
    };
  }

  // Demo mode.
  if (
    trimmed === DEMO_CREDENTIALS.email &&
    password === DEMO_CREDENTIALS.password
  ) {
    setSession(DEMO_USER, remember);
    return { ok: true, user: DEMO_USER };
  }

  // Any staff email also signs in, so role-based views can be explored.
  const member = staff.find((s) => s.email.toLowerCase() === trimmed);
  if (member && password === DEMO_CREDENTIALS.password) {
    const user: SessionUser = {
      id: member.userId,
      clinicId: clinic.id,
      clinicName: clinic.name,
      fullName: member.fullName,
      email: member.email,
      role: member.role,
      avatarInitials: member.avatarInitials,
    };
    setSession(user, remember);
    return { ok: true, user };
  }

  return {
    ok: false,
    error: `Invalid credentials. Use ${DEMO_CREDENTIALS.email} / ${DEMO_CREDENTIALS.password} to explore the demo.`,
  };
}

export interface SignUpInput {
  fullName: string;
  email: string;
  password: string;
  clinicName: string;
  country: string;
  phone: string;
}

export async function signUp(input: SignUpInput): Promise<AuthResult> {
  const { fullName, email, password, clinicName } = input;

  if (!fullName.trim()) return { ok: false, error: 'Enter your full name.' };
  if (!validateEmail(email)) return { ok: false, error: 'Enter a valid email address.' };

  const issues = passwordIssues(password);
  if (issues.length > 0) {
    return { ok: false, error: `Password requirements: ${issues.join(', ').toLowerCase()}.` };
  }
  if (!clinicName.trim()) return { ok: false, error: 'Enter your clinic name.' };

  if (isSupabaseConfigured()) {
    return {
      ok: false,
      error:
        'Supabase is configured but the auth client is not installed. Install @supabase/supabase-js to enable live registration.',
    };
  }

  const user: SessionUser = {
    id: `user_${Date.now()}`,
    clinicId: clinic.id,
    clinicName: clinicName.trim(),
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    role: 'OWNER',
    avatarInitials: fullName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join(''),
  };

  setSession(user, true);
  return { ok: true, user };
}

export async function requestPasswordReset(email: string): Promise<AuthResult> {
  if (!validateEmail(email)) {
    return { ok: false, error: 'Enter a valid email address.' };
  }
  // Demo mode never sends mail; the UI reports success either way so the
  // endpoint cannot be used to probe which addresses are registered.
  return { ok: true };
}

export async function signOut(): Promise<void> {
  clearSession();
}

/* ============================================================
   ROLE HELPERS
   ============================================================ */

export function sessionRole(): StaffRole {
  return getSession()?.role ?? 'OWNER';
}
