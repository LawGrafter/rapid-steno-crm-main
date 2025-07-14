// Database-compatible interfaces
export interface Lead {
  id: string;
  user_id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  source?: string | null;
  status: 'new' | 'contacted' | 'qualified' | 'converted';
  notes?: string | null;
  value?: number | null;
  last_contact?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  type?: string | null;
  status: 'draft' | 'active' | 'paused' | 'completed';
  start_date?: string | null;
  end_date?: string | null;
  budget?: number | null;
  target_audience?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailList {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  total_subscribers: number;
  active_subscribers: number;
  created_at: string;
  updated_at: string;
}

export interface Template {
  id: string;
  user_id: string;
  name: string;
  subject?: string | null;
  content?: string | null;
  template_type: 'email' | 'sms' | 'notification';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Domain {
  id: string;
  domain: string;
  status: 'verified' | 'pending' | 'failed';
  dkimStatus: 'valid' | 'invalid' | 'pending';
  spfStatus: 'valid' | 'invalid' | 'pending';
  dmarcStatus: 'valid' | 'invalid' | 'pending';
  reputation: number;
  createdAt: Date;
}

export interface Activity {
  id: string;
  type: 'lead_created' | 'campaign_sent' | 'email_opened' | 'email_clicked';
  description: string;
  timestamp: Date;
}

export interface Analytics {
  totalLeads: number;
  totalCampaigns: number;
  totalSent: number;
  avgOpenRate: number;
  avgClickRate: number;
  revenue: number;
  recentActivity: Activity[];
}
export interface Payment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  plan: 'basic' | 'advanced';
  amount: number;
  currency: 'INR';
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  paymentMethod: 'card' | 'upi' | 'netbanking' | 'wallet';
  transactionId: string;
  invoiceNumber: string;
  paymentDate: Date;
  dueDate?: Date;
  nextBillingDate?: Date;
  subscriptionStatus: 'active' | 'trial' | 'expired' | 'cancelled';
  trialEndDate?: Date;
  planStartDate: Date;
  planEndDate: Date;
  autoRenewal: boolean;
  remindersSent: number;
  lastReminderDate?: Date;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  plan: 'basic' | 'advanced';
  amount: number;
  tax: number;
  total: number;
  currency: 'INR';
  issueDate: Date;
  dueDate: Date;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface ActivityLog {
  id: string;
  date: string;
  dailyTimeSpent: number; // in minutes
  totalTimeSpent: number; // in minutes
  activities: ActivityEntry[];
}

export interface ActivityEntry {
  id: string;
  type: 'Settings' | 'Court Dictation' | 'MyGrowth' | 'SpeedBoosterDictations';
  timeSpent: number; // in minutes
  views: number;
  timestamp: Date;
}

export interface UserActivity {
  userId: string;
  userName: string;
  userEmail: string;
  totalTimeAllTime: number; // in minutes
  lastActiveDate: Date;
  activityLogs: ActivityLog[];
  averageDailyTime: number; // in minutes
  totalSessions: number;
  favoriteActivity: string;
  loginCount: number; // number of times user has logged in
}