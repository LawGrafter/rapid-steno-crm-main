import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://aftzbioinhgupkyuicri.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmdHpiaW9pbmhndXBreXVpY3JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MzI0NTksImV4cCI6MjA2ODUwODQ1OX0.sgE-kx3scn3NekJ4KsrNnj6LzuSnElBrIMifgp-ianY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Types for our CRM data
export interface CRMUser {
  id: string;
  mongo_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  subscription_plan: string;
  exam_category: string;
  is_active: boolean;
  last_active_date: string;
  login_count: number;
  created_at: string;
  current_subscription_type: string;
  current_subscription_start: string;
  current_subscription_end: string;
  trial_status: string;
  total_activities: number;
  total_time_spent: number;
}

export interface UserActivity {
  id: string;
  user_id: string;
  activity_date: string;
  total_active_time: number;
  total_pages_viewed: number;
  created_at: string;
}

export interface ActivityPage {
  id: string;
  user_activity_id: string;
  page_name: string;
  time_spent: number;
  view_count: number;
  created_at: string;
}

export interface PageViewStat {
  id: string;
  user_id: string;
  page_name: string;
  view_count: number;
  created_at: string;
} 