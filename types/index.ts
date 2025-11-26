// TypeScript type definitions for the application

export interface Site {
  id: string;
  name: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface SubCategory {
  id: string;
  name: string;
  category_id: string;
  created_at: string;
}

export interface Status {
  id: string;
  name: string;
  created_at: string;
}

export interface ActionItem {
  id: string;
  user_name: string;
  site_id: string;
  category_id: string;
  sub_category_id: string;
  action_item: string;
  estimated_completion_date: string | null;
  status_id: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined data (optional, for display)
  site?: Site;
  category?: Category;
  sub_category?: SubCategory;
  status?: Status;
}

export interface ActionItemFormData {
  user_name: string;
  site_id: string;
  category_id: string;
  sub_category_id: string;
  action_item: string;
  estimated_completion_date: string;
  status_id: string;
  notes: string;
}

