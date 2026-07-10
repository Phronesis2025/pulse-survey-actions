// Admin authentication and privileged Supabase access (server-only).
//
// Layered model: RLS denies anon UPDATE/DELETE (and all writes to the
// lookup tables) at the database level; this module gates the same
// operations at the API level and supplies the service-role client that
// those routes need to get past RLS once the caller has proven admin.
import { createHash, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { assertConfigured } from './supabase';

/**
 * Checks the x-admin-secret header against ADMIN_SECRET.
 * Returns null when authorized, or a 401 response to return as-is.
 *
 * The comparison hashes both sides before timingSafeEqual so the check is
 * constant-time regardless of length, and the same generic 401 is returned
 * whether the header is missing, wrong, or ADMIN_SECRET is unconfigured —
 * callers learn nothing about the server's state.
 */
export function requireAdmin(request: NextRequest): NextResponse | null {
  const secret = process.env.ADMIN_SECRET;
  const provided = request.headers.get('x-admin-secret');

  if (secret && provided) {
    const expected = createHash('sha256').update(secret).digest();
    const actual = createHash('sha256').update(provided).digest();
    if (timingSafeEqual(expected, actual)) {
      return null;
    }
  }

  return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
}

/**
 * Creates a service-role Supabase client for a single admin request.
 * The service role bypasses RLS, so this must only ever be called from a
 * route handler AFTER requireAdmin() has returned null. It is deliberately
 * a per-request factory, not a module-level singleton, so the privileged
 * client can never leak into public code paths.
 */
export function createAdminClient(): SupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  assertConfigured('SUPABASE_URL', supabaseUrl);
  assertConfigured('SUPABASE_SERVICE_ROLE_KEY', serviceRoleKey);

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
