// Supabase client configuration
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// These will be set via environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a function to get the supabase client
// This allows us to handle missing env vars during build time
function getSupabaseClient(): SupabaseClient {
  // During build, if env vars aren't set, use placeholder values that Supabase will accept
  // The client won't work for actual operations, but it won't crash the build
  const url = supabaseUrl || 'https://placeholder.supabase.co';
  const key = supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDAsImV4cCI6MTk2MDc2ODAwMH0.placeholder';
  
  return createClient(url, key);
}

// Create a single supabase client for interacting with your database
export const supabase = getSupabaseClient();

// Note: Service role key is not needed for this application
// All operations use the anon key with Row Level Security policies

