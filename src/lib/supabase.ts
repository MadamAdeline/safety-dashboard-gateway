import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xhdvjkgasmsaqmchfsjq.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY;

console.log('=== Supabase Client Initialization Debug ===');
console.log('Supabase URL:', supabaseUrl);
console.log('Key present:', !!supabaseKey);

// Enhanced key validation with detailed logging
const isValidKey = (key: string | undefined): boolean => {
  if (!key) {
    console.error('Supabase key is undefined or empty');
    return false;
  }

  const validationResults = {
    length: key.length,
    startsWithEyJ: key.startsWith('eyJ'),
    hasValidChars: /^[A-Za-z0-9_-]+$/g.test(key),
    isLongEnough: key.length > 50
  };

  console.log('Key validation results:', validationResults);

  return validationResults.startsWithEyJ && 
         validationResults.hasValidChars && 
         validationResults.isLongEnough;
};

// Create client with enhanced validation and error handling
let supabaseInstance = null;
try {
  if (!supabaseKey) {
    throw new Error('Supabase key is missing');
  }

  if (!isValidKey(supabaseKey)) {
    throw new Error('Invalid Supabase key format');
  }

  supabaseInstance = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      debug: true
    }
  });

  console.log('Supabase client created successfully');
} catch (error) {
  console.error('Error creating Supabase client:', error);
  throw error; // Re-throw to ensure error propagation
}

export const supabase = supabaseInstance;

export const isSupabaseConfigured = () => {
  const configured = !!supabase;
  console.log('Supabase configured:', configured);
  return configured;
};

export const getSupabaseClient = () => {
  if (!supabase) {
    const error = new Error('Supabase client not initialized. Please ensure your anon key is valid and properly formatted.');
    console.error(error);
    throw error;
  }
  return supabase;
};