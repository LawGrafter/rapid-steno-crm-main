# Software Registration to CRM Integration Guide

This guide explains how to connect your software registration system with your CRM so that user registrations automatically create leads in your CRM.

## 🚀 Quick Start

### 1. Install the Integration SDK

```bash
# Copy the CRMIntegration.ts file to your software project
# Or import it directly from your CRM project
```

### 2. Initialize the Integration

```typescript
import { crmIntegration, RegistrationData } from './path/to/CRMIntegration';

// The integration is already configured with your Supabase credentials
```

### 3. Send Registration Data

```typescript
// When a user registers in your software
const registrationData: RegistrationData = {
  email: 'user@example.com',
  first_name: 'John',
  last_name: 'Doe',
  phone: '+91-9876543210',
  state: 'Maharashtra',
  exam_category: 'Court Exams',
  how_did_you_hear: 'Google',
  plan: 'Trial User',
  software_version: '2.1.0',
  registration_source: 'desktop'
};

const result = await crmIntegration.sendRegistration(registrationData);

if (result.success) {
  console.log(`Lead ${result.action}: ${result.lead_id}`);
} else {
  console.error('Failed to sync:', result.error);
}
```

## 📋 Complete Integration Examples

### Example 1: Basic Registration Sync

```typescript
// In your software registration handler
async function handleUserRegistration(userData: any) {
  try {
    // Your existing registration logic
    const user = await createUser(userData);
    
    // Sync with CRM
    const crmData: RegistrationData = {
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      phone: user.phone,
      state: user.state,
      exam_category: user.examCategory,
      how_did_you_hear: user.source,
      plan: 'Trial User',
      is_trial_active: true,
      is_subscription_active: false,
      trial_start_date: new Date().toISOString(),
      trial_end_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      software_version: '2.1.0',
      registration_source: 'web',
      notes: `User registered via ${user.source}`
    };

    const result = await crmIntegration.sendRegistration(crmData);
    
    if (result.success) {
      console.log(`✅ Lead ${result.action} in CRM: ${result.lead_id}`);
    } else {
      console.warn(`⚠️ CRM sync failed: ${result.error}`);
    }
    
    return user;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
}
```

### Example 2: Activity Tracking

```typescript
// Track user activity and sync with CRM
async function trackUserActivity(email: string, activity: any) {
  const activityData = {
    email,
    login_count: activity.loginCount,
    subscription_days_left: activity.daysLeft,
    daily_time_spent: activity.dailyTimeSpent,
    total_time_spent: activity.totalTimeSpent,
    last_active: new Date().toISOString()
  };

  const result = await crmIntegration.updateActivity(activityData);
  
  if (result.success) {
    console.log('✅ Activity synced to CRM');
  } else {
    console.warn('⚠️ Activity sync failed:', result.error);
  }
}

// Usage
trackUserActivity('user@example.com', {
  loginCount: 5,
  daysLeft: 12,
  dailyTimeSpent: 45, // minutes
  totalTimeSpent: 180 // minutes
});
```

### Example 3: Lead Status Updates

```typescript
// Update lead status when user upgrades to paid plan
async function handleSubscriptionUpgrade(email: string, plan: string, amount: number) {
  const updateData = {
    email,
    status: 'Qualified',
    plan: plan,
    amount_paid: amount,
    is_trial_active: false,
    is_subscription_active: true,
    subscription_plan: plan,
    notes: `User upgraded to ${plan} plan`
  };

  const result = await crmIntegration.updateLead(updateData);
  
  if (result.success) {
    console.log('✅ Lead updated in CRM');
  } else {
    console.warn('⚠️ Lead update failed:', result.error);
  }
}

// Usage
handleSubscriptionUpgrade('user@example.com', 'Basic Monthly', 500);
```

### Example 4: Activity Logs Sync

```typescript
// Send detailed activity logs
async function syncActivityLogs(logs: any[]) {
  const activityLogs = logs.map(log => ({
    email: log.userEmail,
    page_name: log.pageName,
    page_url: log.pageUrl,
    time_spent: log.timeSpent, // seconds
    visit_date: log.visitDate,
    timestamp: log.timestamp
  }));

  const result = await crmIntegration.sendActivityLogs(activityLogs);
  
  if (result.success) {
    console.log('✅ Activity logs synced');
  } else {
    console.warn('⚠️ Activity logs sync failed:', result.error);
  }
}
```

## 🔧 Integration Points

### 1. Registration Flow

```typescript
// Hook into your existing registration process
class RegistrationService {
  async registerUser(userData: UserRegistrationData) {
    // 1. Create user in your system
    const user = await this.createUser(userData);
    
    // 2. Sync with CRM
    await this.syncToCRM(user);
    
    // 3. Send welcome email
    await this.sendWelcomeEmail(user);
    
    return user;
  }
  
  private async syncToCRM(user: User) {
    const crmData: RegistrationData = {
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      phone: user.phone,
      state: user.state,
      exam_category: user.examCategory,
      how_did_you_hear: user.source,
      plan: 'Trial User',
      is_trial_active: true,
      is_subscription_active: false,
      trial_start_date: new Date().toISOString(),
      trial_end_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      software_version: process.env.APP_VERSION || '1.0.0',
      registration_source: 'web',
      notes: `New user registration from ${user.source}`
    };

    try {
      const result = await crmIntegration.sendRegistration(crmData);
      console.log(`CRM sync: ${result.action} lead ${result.lead_id}`);
    } catch (error) {
      console.error('CRM sync failed:', error);
      // Don't fail registration if CRM sync fails
    }
  }
}
```

### 2. Login Tracking

```typescript
// Track user logins
class AuthService {
  async loginUser(email: string, password: string) {
    // Your existing login logic
    const user = await this.authenticateUser(email, password);
    
    // Update activity in CRM
    await this.updateCRMActivity(user);
    
    return user;
  }
  
  private async updateCRMActivity(user: User) {
    const activityData = {
      email: user.email,
      login_count: user.loginCount + 1,
      subscription_days_left: user.subscriptionDaysLeft,
      daily_time_spent: 0, // Reset daily time
      total_time_spent: user.totalTimeSpent,
      last_active: new Date().toISOString()
    };

    try {
      await crmIntegration.updateActivity(activityData);
    } catch (error) {
      console.error('Activity sync failed:', error);
    }
  }
}
```

### 3. Subscription Management

```typescript
// Handle subscription changes
class SubscriptionService {
  async upgradeUser(email: string, plan: string, amount: number) {
    // Your existing upgrade logic
    const subscription = await this.createSubscription(email, plan, amount);
    
    // Update CRM lead
    await this.updateCRMLead(email, plan, amount);
    
    return subscription;
  }
  
  private async updateCRMLead(email: string, plan: string, amount: number) {
    const updateData = {
      email,
      status: 'Qualified',
      plan: plan,
      amount_paid: amount,
      is_trial_active: false,
      is_subscription_active: true,
      subscription_plan: plan,
      subscription_start_date: new Date().toISOString(),
      subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      notes: `User upgraded to ${plan} plan`
    };

    try {
      await crmIntegration.updateLead(updateData);
    } catch (error) {
      console.error('Lead update failed:', error);
    }
  }
}
```

## 📊 Data Mapping

### Registration Data Fields

| CRM Field | Software Field | Required | Description |
|-----------|----------------|----------|-------------|
| `email` | `user.email` | ✅ | User's email address |
| `first_name` | `user.firstName` | ❌ | User's first name |
| `last_name` | `user.lastName` | ❌ | User's last name |
| `phone` | `user.phone` | ❌ | User's phone number |
| `state` | `user.state` | ❌ | User's state/location |
| `exam_category` | `user.examCategory` | ❌ | Type of exam they're preparing for |
| `how_did_you_hear` | `user.source` | ❌ | How they found your software |
| `plan` | `user.plan` | ❌ | Current plan (Trial User, Basic, etc.) |
| `amount_paid` | `payment.amount` | ❌ | Amount paid by user |
| `is_trial_active` | `user.isTrialActive` | ❌ | Whether trial is active |
| `is_subscription_active` | `user.isSubscriptionActive` | ❌ | Whether subscription is active |

### Activity Data Fields

| CRM Field | Software Field | Description |
|-----------|----------------|-------------|
| `login_count` | `user.loginCount` | Number of times user has logged in |
| `subscription_days_left` | `user.daysLeft` | Days remaining in subscription |
| `daily_time_spent` | `user.dailyTimeSpent` | Time spent today (minutes) |
| `total_time_spent` | `user.totalTimeSpent` | Total time spent (minutes) |
| `last_active` | `user.lastActive` | Last activity timestamp |

## 🔒 Security & Best Practices

### 1. Error Handling

```typescript
// Always handle errors gracefully
async function safeCRMSync(data: RegistrationData) {
  try {
    const result = await crmIntegration.sendRegistration(data);
    return result;
  } catch (error) {
    console.error('CRM sync error:', error);
    // Don't fail your main functionality if CRM sync fails
    return { success: false, error: error.message };
  }
}
```

### 2. Retry Logic

```typescript
// Implement retry logic for failed syncs
async function syncWithRetry(data: RegistrationData, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await crmIntegration.sendRegistration(data);
      if (result.success) return result;
    } catch (error) {
      console.warn(`CRM sync attempt ${i + 1} failed:`, error);
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
    }
  }
}
```

### 3. Queue System (for high-volume applications)

```typescript
// For high-volume applications, use a queue system
class CRMSyncQueue {
  private queue: RegistrationData[] = [];
  private processing = false;

  async addToQueue(data: RegistrationData) {
    this.queue.push(data);
    if (!this.processing) {
      this.processQueue();
    }
  }

  private async processQueue() {
    this.processing = true;
    
    while (this.queue.length > 0) {
      const data = this.queue.shift();
      if (data) {
        try {
          await crmIntegration.sendRegistration(data);
        } catch (error) {
          console.error('Queue sync failed:', error);
          // Re-add to queue or store for later retry
        }
      }
    }
    
    this.processing = false;
  }
}
```

## 🚀 Deployment

### 1. Environment Variables

Make sure your software has access to these environment variables:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Deploy Edge Functions

Deploy the enhanced sync functions to your Supabase project:

```bash
npx supabase functions deploy sync-registration
npx supabase functions deploy sync-user-activity
npx supabase functions deploy sync-activity-logs
```

### 3. Test Integration

```typescript
// Test the integration
async function testIntegration() {
  const testData: RegistrationData = {
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    phone: '+91-9876543210',
    state: 'Maharashtra',
    exam_category: 'Court Exams',
    how_did_you_hear: 'Google',
    plan: 'Trial User',
    software_version: '2.1.0',
    registration_source: 'test'
  };

  const result = await crmIntegration.sendRegistration(testData);
  console.log('Test result:', result);
}
```

## 📈 Monitoring & Analytics

### 1. Track Sync Success Rates

```typescript
class CRMAnalytics {
  private syncStats = {
    total: 0,
    successful: 0,
    failed: 0
  };

  async trackSync(data: RegistrationData) {
    this.syncStats.total++;
    
    try {
      const result = await crmIntegration.sendRegistration(data);
      if (result.success) {
        this.syncStats.successful++;
      } else {
        this.syncStats.failed++;
      }
    } catch (error) {
      this.syncStats.failed++;
    }
  }

  getStats() {
    return {
      ...this.syncStats,
      successRate: (this.syncStats.successful / this.syncStats.total) * 100
    };
  }
}
```

### 2. Log Sync Events

```typescript
// Log all sync events for monitoring
function logCRMEvent(event: string, data: any, result: any) {
  console.log(`[CRM Sync] ${event}:`, {
    timestamp: new Date().toISOString(),
    event,
    data: { email: data.email, source: data.registration_source },
    result: { success: result.success, action: result.action }
  });
}
```

## 🎯 Next Steps

1. **Implement the integration** in your software registration flow
2. **Test thoroughly** with sample data
3. **Monitor the sync** success rates
4. **Set up alerts** for failed syncs
5. **Optimize performance** based on your usage patterns

## 📞 Support

If you need help with the integration:

1. Check the logs in your Supabase Edge Functions
2. Verify your environment variables are correct
3. Test with the provided examples
4. Monitor the CRM for new leads

The integration is designed to be robust and handle failures gracefully, so your main software functionality won't be affected if the CRM sync fails. 