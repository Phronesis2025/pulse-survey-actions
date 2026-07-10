-- Facilities Feedback System - Initial Database Schema
-- Run this SQL in your Supabase SQL Editor
--
-- NOT idempotent — re-run with care:
--   * The DELETE statements below intentionally WIPE existing action_items
--     (this file is a full demo reset, not an additive migration).
--   * The CREATE POLICY statements at the bottom will ERROR if those
--     policies already exist (harmless if everything above already ran,
--     but the script stops there).
--   * Re-running recreates the permissive allow-all policies, so ALWAYS
--     apply 002_harden_rls.sql again afterwards.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create sites table
CREATE TABLE IF NOT EXISTS sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sub_categories table
CREATE TABLE IF NOT EXISTS sub_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category_id, name)
);

-- Create statuses table
CREATE TABLE IF NOT EXISTS statuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create action_items table
CREATE TABLE IF NOT EXISTS action_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_name TEXT NOT NULL,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE RESTRICT,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  sub_category_id UUID NOT NULL REFERENCES sub_categories(id) ON DELETE RESTRICT,
  action_item TEXT NOT NULL,
  estimated_completion_date DATE,
  status_id UUID NOT NULL REFERENCES statuses(id) ON DELETE RESTRICT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_name for faster searches
CREATE INDEX IF NOT EXISTS idx_action_items_user_name ON action_items(user_name);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_action_items_created_at ON action_items(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
-- Drop trigger if it exists first (for idempotency)
DROP TRIGGER IF EXISTS update_action_items_updated_at ON action_items;
CREATE TRIGGER update_action_items_updated_at
  BEFORE UPDATE ON action_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert data for dropdowns
-- First, clean up any old placeholder data (optional - only needed if you had old data)
-- WARNING: This will delete all existing action_items! 
-- If you want to keep existing data, comment out the DELETE statements below

-- Delete all action_items first (they reference sub_categories, sites, and statuses)
-- This allows us to clean up the reference tables
DELETE FROM action_items;

-- Now we can safely delete old placeholder data
-- Delete old placeholder sub-categories (they reference categories)
DELETE FROM sub_categories WHERE category_id IN (
  SELECT id FROM categories WHERE name NOT IN (
    'Restroom/Bathroom Issues',
    'Building Maintenance & Repairs',
    'Office/Cube Cleaning & Maintenance',
    'Indoor Environmental Quality',
    'Conference Room & Meeting Space Issues'
  )
);

-- Delete old placeholder categories
DELETE FROM categories WHERE name NOT IN (
  'Restroom/Bathroom Issues',
  'Building Maintenance & Repairs',
  'Office/Cube Cleaning & Maintenance',
  'Indoor Environmental Quality',
  'Conference Room & Meeting Space Issues'
);

-- Delete old placeholder sites
DELETE FROM sites WHERE name NOT IN (
  'Riverside Campus', 'Summit Campus', 'Cedar Valley Plant', 'Lakeshore Campus', 'Northgate Campus', 'Meridian Campus', 
  'Highland Park Campus', 'Willow Creek Campus', 'Maple Grove Campus', 
  'Bayfront Campus', 'Desert Ridge Plant', 'Southgate Campus'
);

-- Delete old placeholder statuses
DELETE FROM statuses WHERE name NOT IN (
  'Pending', 'In Progress', 'Completed', 'On Hold', 'Cancelled'
);

-- Insert sites
INSERT INTO sites (name) VALUES
  ('Riverside Campus'),
  ('Summit Campus'),
  ('Cedar Valley Plant'),
  ('Lakeshore Campus'),
  ('Northgate Campus'),
  ('Meridian Campus'),
  ('Highland Park Campus'),
  ('Willow Creek Campus'),
  ('Maple Grove Campus'),
  ('Bayfront Campus'),
  ('Desert Ridge Plant'),
  ('Southgate Campus')
ON CONFLICT (name) DO NOTHING;

-- Insert categories
INSERT INTO categories (name) VALUES
  ('Restroom/Bathroom Issues'),
  ('Building Maintenance & Repairs'),
  ('Office/Cube Cleaning & Maintenance'),
  ('Indoor Environmental Quality'),
  ('Conference Room & Meeting Space Issues')
ON CONFLICT (name) DO NOTHING;

-- Insert sub-categories for Restroom/Bathroom Issues
INSERT INTO sub_categories (category_id, name)
SELECT c.id, 'Cleanliness of the restrooms'
FROM categories c WHERE c.name = 'Restroom/Bathroom Issues'
ON CONFLICT (category_id, name) DO NOTHING;

INSERT INTO sub_categories (category_id, name)
SELECT c.id, 'Other'
FROM categories c WHERE c.name = 'Restroom/Bathroom Issues'
ON CONFLICT (category_id, name) DO NOTHING;

-- Insert sub-categories for Building Maintenance & Repairs
INSERT INTO sub_categories (category_id, name)
SELECT c.id, 'General maintenance of the building'
FROM categories c WHERE c.name = 'Building Maintenance & Repairs'
ON CONFLICT (category_id, name) DO NOTHING;

INSERT INTO sub_categories (category_id, name)
SELECT c.id, 'Cleanliness of the building exterior and the landscaping'
FROM categories c WHERE c.name = 'Building Maintenance & Repairs'
ON CONFLICT (category_id, name) DO NOTHING;

INSERT INTO sub_categories (category_id, name)
SELECT c.id, 'Cleanliness of the building lobbies'
FROM categories c WHERE c.name = 'Building Maintenance & Repairs'
ON CONFLICT (category_id, name) DO NOTHING;

INSERT INTO sub_categories (category_id, name)
SELECT c.id, 'Other'
FROM categories c WHERE c.name = 'Building Maintenance & Repairs'
ON CONFLICT (category_id, name) DO NOTHING;

-- Insert sub-categories for Office/Cube Cleaning & Maintenance
INSERT INTO sub_categories (category_id, name)
SELECT c.id, 'Cleanliness of the office areas like corridors, areas around the desks, etc.'
FROM categories c WHERE c.name = 'Office/Cube Cleaning & Maintenance'
ON CONFLICT (category_id, name) DO NOTHING;

INSERT INTO sub_categories (category_id, name)
SELECT c.id, 'Cleanliness of the kitchenettes and breakrooms'
FROM categories c WHERE c.name = 'Office/Cube Cleaning & Maintenance'
ON CONFLICT (category_id, name) DO NOTHING;

INSERT INTO sub_categories (category_id, name)
SELECT c.id, 'Other'
FROM categories c WHERE c.name = 'Office/Cube Cleaning & Maintenance'
ON CONFLICT (category_id, name) DO NOTHING;

-- Insert sub-categories for Indoor Environmental Quality
INSERT INTO sub_categories (category_id, name)
SELECT c.id, 'Other'
FROM categories c WHERE c.name = 'Indoor Environmental Quality'
ON CONFLICT (category_id, name) DO NOTHING;

-- Insert sub-categories for Conference Room & Meeting Space Issues
INSERT INTO sub_categories (category_id, name)
SELECT c.id, 'Cleanliness of the conference rooms, collaboration rooms and phone booths'
FROM categories c WHERE c.name = 'Conference Room & Meeting Space Issues'
ON CONFLICT (category_id, name) DO NOTHING;

INSERT INTO sub_categories (category_id, name)
SELECT c.id, 'Other'
FROM categories c WHERE c.name = 'Conference Room & Meeting Space Issues'
ON CONFLICT (category_id, name) DO NOTHING;

-- Insert placeholder statuses
INSERT INTO statuses (name) VALUES
  ('Pending'),
  ('In Progress'),
  ('Completed'),
  ('On Hold'),
  ('Cancelled')
ON CONFLICT (name) DO NOTHING;

-- Enable Row Level Security (RLS) for better security
-- RLS is enabled by default in Supabase, but we'll create permissive policies for internal use
-- This provides a security layer while still allowing access for your application

-- Enable RLS on all tables
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for internal use (allows all operations)
-- These policies allow anyone with the anon key to access the data
-- For more security, you could restrict these policies further
CREATE POLICY "Enable all operations for all users" ON sites FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON sub_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON statuses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON action_items FOR ALL USING (true) WITH CHECK (true);


