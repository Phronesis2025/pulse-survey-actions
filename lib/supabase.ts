// Supabase client configuration
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// These will be set via environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Fail loudly at module load if the Supabase env vars are missing or still
// set to placeholder values, instead of surfacing as confusing fetch errors
// at request time.
function assertConfigured(name: string, value: string): void {
  const placeholderPatterns = [/placeholder/i, /your[-_]?project/i, /your[-_]?anon[-_]?key/i];
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. ` +
      `Set it in .env.local (see .env.example) or in your deployment's environment settings.`
    );
  }
  if (placeholderPatterns.some((p) => p.test(value))) {
    throw new Error(
      `Environment variable ${name} is still set to a placeholder value. ` +
      `Replace it with the real value from your Supabase project (Settings → API).`
    );
  }
}

assertConfigured('NEXT_PUBLIC_SUPABASE_URL', supabaseUrl);
assertConfigured('NEXT_PUBLIC_SUPABASE_ANON_KEY', supabaseAnonKey);

// Create a single supabase client for interacting with your database
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Note: Service role key is not needed for this application
// All operations use the anon key with Row Level Security policies
