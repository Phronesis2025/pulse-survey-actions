import { NextRequest, NextResponse } from 'next/server';
import { createActionItem, searchActionItemsByName, getAllActionItems } from '@/lib/db';
import type { ActionItemFormData } from '@/types';

// GET - Search by user name or get all
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userName = searchParams.get('user_name');

    if (userName) {
      // Search by user name
      const items = await searchActionItemsByName(userName);
      return NextResponse.json(items);
    } else {
      // Get all items (for export)
      const items = await getAllActionItems();
      return NextResponse.json(items);
    }
  } catch (error) {
    console.error('Error fetching action items:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to fetch action items' },
      { status: 500 }
    );
  }
}

// POST - Create new action item
export async function POST(request: NextRequest) {
  try {
    const body: ActionItemFormData = await request.json();

    // Validation
    if (!body.user_name?.trim()) {
      return NextResponse.json({ message: 'User name is required' }, { status: 400 });
    }
    if (!body.site_id) {
      return NextResponse.json({ message: 'Site is required' }, { status: 400 });
    }
    if (!body.category_id) {
      return NextResponse.json({ message: 'Category is required' }, { status: 400 });
    }
    if (!body.sub_category_id) {
      return NextResponse.json({ message: 'Sub-category is required' }, { status: 400 });
    }
    if (!body.action_item?.trim()) {
      return NextResponse.json({ message: 'Action item is required' }, { status: 400 });
    }
    if (!body.status_id) {
      return NextResponse.json({ message: 'Status is required' }, { status: 400 });
    }

    const item = await createActionItem(body);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error creating action item:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to create action item' },
      { status: 500 }
    );
  }
}

