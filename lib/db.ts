// Database schema and helper functions
import { supabase } from './supabase';
import type { ActionItem, Site, Category, SubCategory, Status, ActionItemFormData } from '@/types';

// Database table names
export const TABLES = {
  ACTION_ITEMS: 'action_items',
  SITES: 'sites',
  CATEGORIES: 'categories',
  SUB_CATEGORIES: 'sub_categories',
  STATUSES: 'statuses',
} as const;

// Helper function to get all sites
export async function getSites(): Promise<Site[]> {
  const { data, error } = await supabase
    .from(TABLES.SITES)
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data || [];
}

// Helper function to get all categories
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from(TABLES.CATEGORIES)
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data || [];
}

// Helper function to get sub-categories for a category
export async function getSubCategories(categoryId: string): Promise<SubCategory[]> {
  const { data, error } = await supabase
    .from(TABLES.SUB_CATEGORIES)
    .select('*')
    .eq('category_id', categoryId)
    .order('name');
  
  if (error) throw error;
  return data || [];
}

// Helper function to get all sub-categories
export async function getAllSubCategories(): Promise<SubCategory[]> {
  const { data, error } = await supabase
    .from(TABLES.SUB_CATEGORIES)
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data || [];
}

// Helper function to get all statuses
export async function getStatuses(): Promise<Status[]> {
  const { data, error } = await supabase
    .from(TABLES.STATUSES)
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data || [];
}

// Helper function to create an action item
export async function createActionItem(formData: ActionItemFormData): Promise<ActionItem> {
  const { data, error } = await supabase
    .from(TABLES.ACTION_ITEMS)
    .insert({
      ...formData,
      estimated_completion_date: formData.estimated_completion_date || null,
      notes: formData.notes || null,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Helper function to search action items by user name
export async function searchActionItemsByName(userName: string): Promise<ActionItem[]> {
  const { data, error } = await supabase
    .from(TABLES.ACTION_ITEMS)
    .select(`
      *,
      site:${TABLES.SITES}(*),
      category:${TABLES.CATEGORIES}(*),
      sub_category:${TABLES.SUB_CATEGORIES}(*),
      status:${TABLES.STATUSES}(*)
    `)
    .ilike('user_name', `%${userName}%`)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

// Helper function to get action item by ID
export async function getActionItemById(id: string): Promise<ActionItem | null> {
  const { data, error } = await supabase
    .from(TABLES.ACTION_ITEMS)
    .select(`
      *,
      site:${TABLES.SITES}(*),
      category:${TABLES.CATEGORIES}(*),
      sub_category:${TABLES.SUB_CATEGORIES}(*),
      status:${TABLES.STATUSES}(*)
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
}

// Helper function to update an action item
export async function updateActionItem(id: string, formData: Partial<ActionItemFormData>): Promise<ActionItem> {
  const updates: Record<string, unknown> = {
    ...formData,
    updated_at: new Date().toISOString(),
  };
  // Coerce empty strings to null for nullable columns (matches createActionItem);
  // an empty string is not valid for the DATE column
  if ('estimated_completion_date' in formData) {
    updates.estimated_completion_date = formData.estimated_completion_date || null;
  }
  if ('notes' in formData) {
    updates.notes = formData.notes || null;
  }

  const { data, error } = await supabase
    .from(TABLES.ACTION_ITEMS)
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Helper function to get all action items (for export)
export async function getAllActionItems(): Promise<ActionItem[]> {
  const { data, error } = await supabase
    .from(TABLES.ACTION_ITEMS)
    .select(`
      *,
      site:${TABLES.SITES}(*),
      category:${TABLES.CATEGORIES}(*),
      sub_category:${TABLES.SUB_CATEGORIES}(*),
      status:${TABLES.STATUSES}(*)
    `)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

