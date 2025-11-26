import { NextRequest, NextResponse } from 'next/server';
import { getStatuses } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { TABLES } from '@/lib/db';

// GET - Get all statuses
export async function GET() {
  try {
    const statuses = await getStatuses();
    return NextResponse.json(statuses);
  } catch (error) {
    console.error('Error fetching statuses:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to fetch statuses' },
      { status: 500 }
    );
  }
}

// POST - Create new status
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name?.trim()) {
      return NextResponse.json({ message: 'Name is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from(TABLES.STATUSES)
      .insert({ name: name.trim() })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ message: 'Status with this name already exists' }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating status:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to create status' },
      { status: 500 }
    );
  }
}

