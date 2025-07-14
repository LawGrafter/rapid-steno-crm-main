export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  state: string;
  hearAboutUs: 'google' | 'telegram' | 'facebook' | 'instagram' | 'youtube' | 'friend' | 'whatsapp' | 'pamphlet' | 'banner' | 'mouth-to-mouth';
  examCategory: 'court-exams' | 'ssc-other-exams';
  referralCode?: string;
  status: 'new' | 'trial' | 'converted';
  plan: 'basic' | 'advanced' | 'none';
  userType: 'unpaid' | 'trial' | 'paid';
  createdAt: Date;
  tags: string[];
  notes: string;
  trialStartDate?: Date;
  trialEndDate?: Date;
  lastActivity?: Date;
  
  // Computed field for backward compatibility
  get name(): string;
  get source(): string;
}

export interface Campaign {
  id: string;
  name: string;
  type: 'automated' | 'broadcast';
  status: 'active' | 'scheduled' | 'completed' | 'draft';
  subject: string;
  recipients: number;
  opens: number;
  clicks: number;
  createdAt: Date;
  scheduledAt: Date;
  template: string;
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

export interface EmailList {
  id: string;
  name: string;
  description: string;
  subscribers: number;
  activeSubscribers: number;
  tags: string[];
  createdAt: Date;
  lastUpdated: Date;
  status: 'active' | 'archived';
  type: 'static' | 'dynamic';
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  previewText: string;
  fromEmail: string;
  fromName: string;
  htmlContent: string;
  createdAt: Date;
  updatedAt: Date;
  category: 'welcome' | 'newsletter' | 'promotion' | 'transactional' | 'custom';
  isActive: boolean;
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