import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { TABLES } from '@/lib/db';

// PUT - Update site
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name } = body;

    if (!name?.trim()) {
      return NextResponse.json({ message: 'Name is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from(TABLES.SITES)
      .update({ name: name.trim() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ message: 'Site with this name already exists' }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating site:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to update site' },
      { status: 500 }
    );
  }
}

// DELETE - Delete site
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabase
      .from(TABLES.SITES)
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Site deleted successfully' });
  } catch (error) {
    console.error('Error deleting site:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to delete site' },
      { status: 500 }
    );
  }
}

