import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xhdvjkgasmsaqmchfsjq.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('Supabase anon key is not set. Please add it through the project settings.');
}

export const supabase = createClient(supabaseUrl, supabaseKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});