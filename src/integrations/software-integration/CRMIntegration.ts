/**
 * CRM Integration SDK for Software Registration
 * 
 * This SDK provides easy-to-use functions to integrate your software
 * registration system with your CRM.
 */

export interface RegistrationData {
  // Basic Information
  email: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  phone?: string;
  state?: string;
  gender?: string;
  exam_category?: string;
  how_did_you_hear?: string;
  
  // Business Information
  company?: string;
  source?: string;
  status?: string;
  plan?: string;
  referral_code?: string;
  user_type?: string;
  subscription_plan?: string;
  
  // Financial Information
  amount_paid?: number;
  value?: number;
  
  // Dates
  trial_start_date?: string;
  trial_end_date?: string;
  subscription_start_date?: string;
  subscription_end_date?: string;
  next_payment_date?: string;
  
  // Status Flags
  is_trial_active?: boolean;
  is_subscription_active?: boolean;
  
  // Additional Information
  tags?: string[];
  notes?: string;
  
  // Activity Data
  activityData?: {
    login_count?: number;
    subscription_days_left?: number;
    daily_time_spent?: number;
    total_time_spent?: number;
    last_active?: string;
  };
  
  // Software Integration Data
  software_version?: string;
  registration_source?: string; // 'web', 'mobile', 'desktop', 'admin'
  device_info?: {
    platform?: string;
    os?: string;
    browser?: string;
  };
}

export interface ActivityData {
  email: string;
  login_count?: number;
  subscription_days_left?: number;
  daily_time_spent?: number;
  total_time_spent?: number;
  last_active?: string;
}

export interface ActivityLog {
  email: string;
  page_name: string;
  page_url: string;
  time_spent: number; // in seconds
  visit_date: string;
  timestamp?: string;
}

export interface LeadUpdateData {
  email: string;
  status?: string;
  plan?: string;
  amount_paid?: number;
  is_trial_active?: boolean;
  is_subscription_active?: boolean;
  subscription_plan?: string;
  notes?: string;
  tags?: string[];
}

class CRMIntegration {
  private supabaseUrl: string;
  private apiKey: string;

  constructor(supabaseUrl: string, apiKey: string) {
    this.supabaseUrl = supabaseUrl;
    this.apiKey = apiKey;
  }

  /**
   * Send registration data to CRM
   * @param data Registration data
   * @returns Promise with success status and lead ID
   */
  async sendRegistration(data: RegistrationData): Promise<{
    success: boolean;
    message: string;
    lead_id?: string;
    action?: 'created' | 'updated';
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.supabaseUrl}/functions/v1/sync-registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          ...data,
          registration_source: data.registration_source || 'software',
          software_version: data.software_version || '1.0.0',
          device_info: data.device_info || this.getDeviceInfo()
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to sync registration');
      }

      return result;
    } catch (error) {
      console.error('Error sending registration to CRM:', error);
      return {
        success: false,
        message: 'Failed to sync registration',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update user activity data
   * @param data Activity data
   * @returns Promise with success status
   */
  async updateActivity(data: ActivityData): Promise<{
    success: boolean;
    message: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.supabaseUrl}/functions/v1/sync-user-activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          email: data.email,
          activityData: {
            login_count: data.login_count || 0,
            subscription_days_left: data.subscription_days_left,
            daily_time_spent: data.daily_time_spent || 0,
            total_time_spent: data.total_time_spent || 0,
            last_active: data.last_active || new Date().toISOString()
          }
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to sync activity');
      }

      return result;
    } catch (error) {
      console.error('Error updating activity:', error);
      return {
        success: false,
        message: 'Failed to sync activity',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send activity logs
   * @param logs Array of activity logs
   * @returns Promise with success status
   */
  async sendActivityLogs(logs: ActivityLog[]): Promise<{
    success: boolean;
    message: string;
    error?: string;
  }> {
    try {
      // Group logs by email
      const logsByEmail = logs.reduce((acc, log) => {
        if (!acc[log.email]) {
          acc[log.email] = [];
        }
        acc[log.email].push(log);
        return acc;
      }, {} as Record<string, ActivityLog[]>);

      // Send logs for each email
      const results = await Promise.allSettled(
        Object.entries(logsByEmail).map(([email, emailLogs]) =>
          fetch(`${this.supabaseUrl}/functions/v1/sync-activity-logs`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
              email,
              activityLogs: emailLogs
            })
          })
        )
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      return {
        success: failed === 0,
        message: `Synced ${successful} activity logs${failed > 0 ? `, ${failed} failed` : ''}`
      };
    } catch (error) {
      console.error('Error sending activity logs:', error);
      return {
        success: false,
        message: 'Failed to sync activity logs',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update lead information
   * @param data Lead update data
   * @returns Promise with success status
   */
  async updateLead(data: LeadUpdateData): Promise<{
    success: boolean;
    message: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.supabaseUrl}/functions/v1/sync-registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          email: data.email,
          status: data.status,
          plan: data.plan,
          amount_paid: data.amount_paid,
          is_trial_active: data.is_trial_active,
          is_subscription_active: data.is_subscription_active,
          subscription_plan: data.subscription_plan,
          notes: data.notes,
          tags: data.tags,
          registration_source: 'software_update'
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update lead');
      }

      return result;
    } catch (error) {
      console.error('Error updating lead:', error);
      return {
        success: false,
        message: 'Failed to update lead',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get device information
   * @returns Device info object
   */
  private getDeviceInfo() {
    if (typeof window !== 'undefined') {
      return {
        platform: navigator.platform,
        os: this.getOS(),
        browser: this.getBrowser()
      };
    }
    return {
      platform: 'unknown',
      os: 'unknown',
      browser: 'unknown'
    };
  }

  /**
   * Get operating system
   * @returns OS name
   */
  private getOS(): string {
    if (typeof window === 'undefined') return 'unknown';
    
    const userAgent = window.navigator.userAgent;
    if (userAgent.indexOf('Windows') !== -1) return 'Windows';
    if (userAgent.indexOf('Mac') !== -1) return 'macOS';
    if (userAgent.indexOf('Linux') !== -1) return 'Linux';
    if (userAgent.indexOf('Android') !== -1) return 'Android';
    if (userAgent.indexOf('iOS') !== -1) return 'iOS';
    return 'unknown';
  }

  /**
   * Get browser name
   * @returns Browser name
   */
  private getBrowser(): string {
    if (typeof window === 'undefined') return 'unknown';
    
    const userAgent = window.navigator.userAgent;
    if (userAgent.indexOf('Chrome') !== -1) return 'Chrome';
    if (userAgent.indexOf('Firefox') !== -1) return 'Firefox';
    if (userAgent.indexOf('Safari') !== -1) return 'Safari';
    if (userAgent.indexOf('Edge') !== -1) return 'Edge';
    if (userAgent.indexOf('Opera') !== -1) return 'Opera';
    return 'unknown';
  }
}

// Export the class and interfaces
export { CRMIntegration };

// Create a default instance with environment variables
export const createCRMIntegration = (): CRMIntegration => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !apiKey) {
    throw new Error('Missing Supabase URL or API key. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
  }
  
  return new CRMIntegration(supabaseUrl, apiKey);
};

// Export a default instance
export const crmIntegration = createCRMIntegration(); 