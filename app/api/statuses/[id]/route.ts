import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, createAdminClient } from '@/lib/admin';
import { TABLES } from '@/lib/db';

// PUT - Update status (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const body = await request.json();
    const { name } = body;

    if (!name?.trim()) {
      return NextResponse.json({ message: 'Name is required' }, { status: 400 });
    }

    const { data, error } = await createAdminClient()
      .from(TABLES.STATUSES)
      .update({ name: name.trim() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ message: 'Status with this name already exists' }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating status:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to update status' },
      { status: 500 }
    );
  }
}

// DELETE - Delete status (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;

    const { error } = await createAdminClient()
      .from(TABLES.STATUSES)
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Status deleted successfully' });
  } catch (error) {
    console.error('Error deleting status:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to delete status' },
      { status: 500 }
    );
  }
}

