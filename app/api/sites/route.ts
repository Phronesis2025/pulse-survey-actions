import { NextRequest, NextResponse } from 'next/server';
import { getSites } from '@/lib/db';
import { requireAdmin, createAdminClient } from '@/lib/admin';
import { TABLES } from '@/lib/db';

// GET - Get all sites
export async function GET() {
  try {
    const sites = await getSites();
    return NextResponse.json(sites);
  } catch (error) {
    console.error('Error fetching sites:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to fetch sites' },
      { status: 500 }
    );
  }
}

// POST - Create new site (admin only)
export async function POST(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const { name } = body;

    if (!name?.trim()) {
      return NextResponse.json({ message: 'Name is required' }, { status: 400 });
    }

    const { data, error } = await createAdminClient()
      .from(TABLES.SITES)
      .insert({ name: name.trim() })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({ message: 'Site with this name already exists' }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating site:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to create site' },
      { status: 500 }
    );
  }
}

