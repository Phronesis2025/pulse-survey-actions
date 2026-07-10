import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, createAdminClient } from '@/lib/admin';
import { TABLES } from '@/lib/db';

// PUT - Update sub-category (admin only)
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
      .from(TABLES.SUB_CATEGORIES)
      .update({ name: name.trim() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating sub-category:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to update sub-category' },
      { status: 500 }
    );
  }
}

// DELETE - Delete sub-category (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;

    const { error } = await createAdminClient()
      .from(TABLES.SUB_CATEGORIES)
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Sub-category deleted successfully' });
  } catch (error) {
    console.error('Error deleting sub-category:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to delete sub-category' },
      { status: 500 }
    );
  }
}

