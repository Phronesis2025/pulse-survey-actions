import { NextRequest, NextResponse } from 'next/server';
import { getActionItemById, updateActionItem } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { TABLES } from '@/lib/db';
import type { ActionItemFormData } from '@/types';

// GET - Get action item by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await getActionItemById(id);

    if (!item) {
      return NextResponse.json({ message: 'Action item not found' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error fetching action item:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to fetch action item' },
      { status: 500 }
    );
  }
}

// PUT - Update action item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: Partial<ActionItemFormData> = await request.json();

    // Check if item exists
    const existingItem = await getActionItemById(id);
    if (!existingItem) {
      return NextResponse.json({ message: 'Action item not found' }, { status: 404 });
    }

    const updatedItem = await updateActionItem(id, body);
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating action item:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to update action item' },
      { status: 500 }
    );
  }
}

// DELETE - Delete action item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabase
      .from(TABLES.ACTION_ITEMS)
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Action item deleted successfully' });
  } catch (error) {
    console.error('Error deleting action item:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to delete action item' },
      { status: 500 }
    );
  }
}

