import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xhdvjkgasmsaqmchfsjq.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  throw new Error('VITE_SUPABASE_ANON_KEY is required in environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);