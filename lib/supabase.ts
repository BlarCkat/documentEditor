import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mfahntpajjdibotsepes.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mYWhudHBhampkaWJvdHNlcGVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0OTYxOTcsImV4cCI6MjA4NjA3MjE5N30.p0s55lOx6u4nBtqvCA18HMQoVbxg5J47BIavyzudBrM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
