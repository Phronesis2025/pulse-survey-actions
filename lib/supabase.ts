// Supabase client configuration (server-only)
//
// These env vars intentionally do NOT use the NEXT_PUBLIC_ prefix: all
// database access goes through Next.js API routes, so the browser never
// needs the Supabase URL or anon key. Keeping the prefix off prevents
// Next.js from inlining them into client bundles.
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// Fail loudly at module load if the Supabase env vars are missing or still
// set to placeholder values, instead of surfacing as confusing fetch errors
// at request time.
export function assertConfigured(name: string, value: string): void {
  const placeholderPatterns = [/placeholder/i, /^your[-_]/i, /your[-_]?project/i];
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. ` +
      `Set it in .env.local (see .env.example) or in your deployment's environment settings.`
    );
  }
  if (placeholderPatterns.some((p) => p.test(value))) {
    throw new Error(
      `Environment variable ${name} is still set to a placeholder value. ` +
      `Replace it with the real value from your Supabase project (Settings → API).`
    );
  }
}

assertConfigured('SUPABASE_URL', supabaseUrl);
assertConfigured('SUPABASE_ANON_KEY', supabaseAnonKey);

// Anon client: used by public routes (all GETs, POST /api/action-items).
// Constrained by the RLS policies in supabase/migrations/002_harden_rls.sql.
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
