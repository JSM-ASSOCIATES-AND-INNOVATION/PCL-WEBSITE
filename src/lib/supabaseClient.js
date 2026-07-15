import { createClient } from '@supabase/supabase-js';

// Connected directly to the PCL ERP Supabase Instance via ENV
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
