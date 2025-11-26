import { NextRequest, NextResponse } from 'next/server';
import { getCategories } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { TABLES } from '@/lib/db';

// GET - Get all categories
export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name?.trim()) {
      return NextResponse.json({ message: 'Name is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from(TABLES.CATEGORIES)
      .insert({ name: name.trim() })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ message: 'Category with this name already exists' }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to create category' },
      { status: 500 }
    );
  }
}

