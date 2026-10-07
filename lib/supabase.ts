/**
 * DENTRA — Supabase integration boundary
 *
 * The application ships in **demo mode**: no backend, no credentials, no
 * network. When `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
 * are present, `isSupabaseConfigured()` flips to true and the data layer in
 * `lib/database.ts` can route reads and writes to Postgres instead of the
 * in-memory store.
 *
 * Nothing here ever throws on missing configuration — a misconfigured
 * environment degrades to demo mode rather than breaking the app.
 *
 * SECURITY: only the anon (publishable) key belongs in `NEXT_PUBLIC_*`.
 * The service-role key must never appear in client-side code; privileged
 * operations belong in route handlers or server actions reading a
 * non-public env var.
 */

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;
  if (!/^https?:\/\//.test(url)) return null;

  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig() !== null;
}

export type DataMode = 'demo' | 'supabase';

export function getDataMode(): DataMode {
  return isSupabaseConfigured() ? 'supabase' : 'demo';
}

/**
 * Lazily creates a Supabase browser client.
 *
 * `@supabase/supabase-js` is an optional dependency: it is not installed in
 * the demo build, so the import is deferred and failure is non-fatal. Install
 * it and provide the env vars to activate the live backend.
 */
export async function createSupabaseClient(): Promise<unknown | null> {
  const config = getSupabaseConfig();
  if (!config) return null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mod: any = await import(
      /* webpackIgnore: true */ '@supabase/supabase-js' as string
    ).catch(() => null);

    if (!mod?.createClient) return null;

    return mod.createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch {
    return null;
  }
}

/**
 * Human-readable status, surfaced in Settings → Integrations so the operator
 * can always see which mode the application is running in.
 */
export function describeDataMode(): {
  mode: DataMode;
  label: string;
  detail: string;
} {
  if (isSupabaseConfigured()) {
    return {
      mode: 'supabase',
      label: 'SUPABASE CONNECTED',
      detail: 'Clinic data is read from and written to your Supabase project.',
    };
  }
  return {
    mode: 'demo',
    label: 'DEMO MODE',
    detail:
      'No backend credentials detected. DENTRA is running on a local demo dataset; changes persist for this session only.',
  };
}
