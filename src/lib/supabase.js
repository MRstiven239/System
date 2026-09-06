import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://hmczbbrwlpyeazmufarg.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtY3piYnJ3bHB5ZWF6bXVmYXJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MTY1MjcsImV4cCI6MjEwNDI5MjUyN30.KHAW7ULC-h_ggmaBitol5hbyuv0m1DaztsyvKNk9gRE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
