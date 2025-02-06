import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ykbmqhqvjvfvgzlpxwrj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrYm1xaHF2anZmdmd6bHB4d3JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc4NTI4MDAsImV4cCI6MjAyMzQyODgwMH0.HyS_OKDaOmdD7M9LJMGc0x0M_CZU-MI5sHABLhHXxfE';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});