import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xhdvjkgasmsaqmchfsjq.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoZHZqa2dhc21zYXFtY2hmc2pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc4NTI4MDAsImV4cCI6MjAyMzQyODgwMH0.HyS_OKDaOmdD7M9LJMGc0x0M_CZU-MI5sHABLhHXxfE';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
    },
  },
});