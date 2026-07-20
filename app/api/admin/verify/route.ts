import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';

// POST /api/admin/verify — validates the x-admin-secret header and nothing
// else. It never touches the database; it exists so the /edit page can unlock
// its admin UI up front instead of only discovering a bad secret at save time.
// The real protection stays on the mutating routes (requireAdmin on PUT/DELETE)
// and in the RLS policies — this is a convenience gate for the UI.
export async function POST(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  return NextResponse.json({ ok: true });
}
