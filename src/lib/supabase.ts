import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Notification = {
  id: string;
  title: string;
  description: string;
  category: 'Assignment' | 'Exam' | 'Placement' | 'Event';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  deadline: string;
  target_group: 'All' | 'CSE' | 'IT' | 'Final Year';
  source: 'manual' | 'email';
  status: 'active' | 'archived' | 'expired';
  is_read?: boolean;
  created_at: string;
  created_by: string | null;
  updated_at?: string;
  email_metadata: Record<string, unknown>;
};

export type User = {
  id: string;
  email: string;
  role: 'admin' | 'faculty' | 'student';
  department?: string;
  year?: number;
  created_at: string;
};
