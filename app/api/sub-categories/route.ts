import { NextRequest, NextResponse } from 'next/server';
import { getAllSubCategories, getSubCategories } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { TABLES } from '@/lib/db';

// GET - Get all sub-categories or filter by category_id
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get('category_id');

    if (categoryId) {
      const subCategories = await getSubCategories(categoryId);
      return NextResponse.json(subCategories);
    } else {
      const subCategories = await getAllSubCategories();
      return NextResponse.json(subCategories);
    }
  } catch (error) {
    console.error('Error fetching sub-categories:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to fetch sub-categories' },
      { status: 500 }
    );
  }
}

// POST - Create new sub-category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category_id } = body;

    if (!name?.trim()) {
      return NextResponse.json({ message: 'Name is required' }, { status: 400 });
    }
    if (!category_id) {
      return NextResponse.json({ message: 'Category ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from(TABLES.SUB_CATEGORIES)
      .insert({ name: name.trim(), category_id })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating sub-category:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to create sub-category' },
      { status: 500 }
    );
  }
}

