
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aejuqvqbcxqsxnlomkwx.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!supabaseKey;
};
