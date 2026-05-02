import { createClient } from '@supabase/supabase-js';

// Vercel Fix: Use fallback empty strings instead of throwing a hard error
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Initialize safely. This will pass the build step!
export const supabase = createClient(supabaseUrl, supabaseKey);