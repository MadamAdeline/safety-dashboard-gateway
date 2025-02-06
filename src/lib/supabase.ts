import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xhdvjkgasmsaqmchfsjq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoZHZqa2dhc21zYXFtY2hmc2pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDcyMzI1OTUsImV4cCI6MjAyMjgwODU5NX0.PqZEwKxgUOKgqjE9G1L9k5hKk_Q1VHJxVWE_pjwbvJ4';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!supabaseKey;
};