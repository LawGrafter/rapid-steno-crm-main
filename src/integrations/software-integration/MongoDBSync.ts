/**
 * MongoDB to CRM Sync Integration
 * 
 * This module provides functions to sync data from your MongoDB admin panel
 * directly to your CRM system.
 */

import { crmIntegration, RegistrationData, ActivityData } from './CRMIntegration';

export interface MongoDBUser {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  state?: string;
  gender?: string;
  examCategory?: string;
  source?: string;
  plan?: string;
  isTrialActive?: boolean;
  isSubscriptionActive?: boolean;
  trialStartDate?: Date;
  trialEndDate?: Date;
  subscriptionPlan?: string;
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
  amountPaid?: number;
  loginCount?: number;
  totalTimeSpent?: number;
  lastActive?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  // Add any other fields from your MongoDB schema
}

export interface MongoDBActivityLog {
  _id: string;
  userId: string;
  email: string;
  pageName: string;
  pageUrl: string;
  timeSpent: number;
  visitDate: Date;
  timestamp: Date;
}

export interface SyncOptions {
  batchSize?: number;
  syncActivities?: boolean;
  syncOnlyNew?: boolean;
  lastSyncDate?: Date;
  dryRun?: boolean;
}

export class MongoDBSync {
  private mongoConnectionString: string;
  private crmIntegration: any;

  constructor(mongoConnectionString: string) {
    this.mongoConnectionString = mongoConnectionString;
    this.crmIntegration = crmIntegration;
  }

  /**
   * Sync all users from MongoDB to CRM
   */
  async syncAllUsers(options: SyncOptions = { batchSize: 50, syncOnlyNew: false, lastSyncDate: undefined, dryRun: false }): Promise<{
    total: number;
    synced: number;
    failed: number;
    errors: string[];
  }> {
    const results = { total: 0, synced: 0, failed: 0, errors: [] as string[] };

    try {
      console.log('🔄 Starting MongoDB to CRM sync...');

      // Get users from MongoDB
      const users = await this.getUsersFromMongoDB(options);
      results.total = users.length;

      console.log(`📊 Found ${users.length} users to sync`);

      // Process in batches
      const batchSize = options.batchSize || 50;
      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);
        
        console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(users.length / batchSize)}`);

        for (const user of batch) {
          try {
            if (!options.dryRun) {
              await this.syncUserToCRM(user, options);
            }
            results.synced++;
            console.log(`✅ Synced user: ${user.email}`);
          } catch (error) {
            results.failed++;
            const errorMsg = `Failed to sync ${user.email}: ${error}`;
            results.errors.push(errorMsg);
            console.error(`❌ ${errorMsg}`);
          }
        }

        // Add delay between batches to avoid rate limiting
        if (i + batchSize < users.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      console.log(`🎉 Sync completed: ${results.synced}/${results.total} users synced successfully`);
      return results;

    } catch (error) {
      console.error('❌ Sync failed:', error);
      throw error;
    }
  }

  /**
   * Sync a single user from MongoDB to CRM
   */
  async syncUserToCRM(mongoUser: MongoDBUser, options: SyncOptions): Promise<{
    success: boolean;
    lead_id?: string;
    action?: 'created' | 'updated';
    error?: string;
  }> {
    try {
      // Transform MongoDB user to CRM format
      const crmData: RegistrationData = {
        email: mongoUser.email,
        first_name: mongoUser.firstName,
        last_name: mongoUser.lastName,
        name: `${mongoUser.firstName || ''} ${mongoUser.lastName || ''}`.trim(),
        phone: mongoUser.phone,
        state: mongoUser.state,
        gender: mongoUser.gender,
        exam_category: mongoUser.examCategory,
        how_did_you_hear: mongoUser.source,
        plan: mongoUser.plan || 'Trial User',
        subscription_plan: mongoUser.subscriptionPlan,
        amount_paid: mongoUser.amountPaid || 0,
        is_trial_active: mongoUser.isTrialActive ?? true,
        is_subscription_active: mongoUser.isSubscriptionActive ?? false,
        trial_start_date: mongoUser.trialStartDate?.toISOString(),
        trial_end_date: mongoUser.trialEndDate?.toISOString(),
        subscription_start_date: mongoUser.subscriptionStartDate?.toISOString(),
        subscription_end_date: mongoUser.subscriptionEndDate?.toISOString(),
        registration_source: 'mongodb_sync',
        software_version: '1.0.0',
        notes: `Synced from MongoDB admin panel - User ID: ${mongoUser._id}`
      };

      // Send to CRM
      const result = await this.crmIntegration.sendRegistration(crmData);
      
      if (result.success && options.syncActivities) {
        // Also sync activity data if available
        await this.syncUserActivity(mongoUser);
      }

      return result;

    } catch (error) {
      console.error(`Error syncing user ${mongoUser.email}:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Sync user activity data
   */
  async syncUserActivity(mongoUser: MongoDBUser): Promise<void> {
    if (!mongoUser.loginCount && !mongoUser.totalTimeSpent) {
      return; // No activity data to sync
    }

    try {
      const activityData: ActivityData = {
        email: mongoUser.email,
        login_count: mongoUser.loginCount || 0,
        total_time_spent: mongoUser.totalTimeSpent || 0,
        last_active: mongoUser.lastActive?.toISOString() || new Date().toISOString()
      };

      await this.crmIntegration.updateActivity(activityData);
      console.log(`✅ Synced activity for: ${mongoUser.email}`);

    } catch (error) {
      console.error(`❌ Failed to sync activity for ${mongoUser.email}:`, error);
    }
  }

  /**
   * Sync activity logs from MongoDB
   */
  async syncActivityLogs(options: SyncOptions = { batchSize: 50, syncOnlyNew: false, lastSyncDate: undefined, dryRun: false }): Promise<{
    total: number;
    synced: number;
    failed: number;
  }> {
    const results = { total: 0, synced: 0, failed: 0 };

    try {
      console.log('🔄 Starting activity logs sync...');

      // Get activity logs from MongoDB
      const logs = await this.getActivityLogsFromMongoDB(options);
      results.total = logs.length;

      console.log(`📊 Found ${logs.length} activity logs to sync`);

      // Transform and send logs
      const crmLogs = logs.map(log => ({
        email: log.email,
        page_name: log.pageName,
        page_url: log.pageUrl,
        time_spent: log.timeSpent,
        visit_date: log.visitDate.toISOString(),
        timestamp: log.timestamp.toISOString()
      }));

      if (!options.dryRun) {
        const result = await this.crmIntegration.sendActivityLogs(crmLogs);
        if (result.success) {
          results.synced = logs.length;
        } else {
          results.failed = logs.length;
        }
      } else {
        results.synced = logs.length; // Count as synced in dry run
      }

      console.log(`🎉 Activity logs sync completed: ${results.synced}/${results.total} logs synced`);
      return results;

    } catch (error) {
      console.error('❌ Activity logs sync failed:', error);
      throw error;
    }
  }

  /**
   * Get users from MongoDB (implement based on your MongoDB setup)
   */
  private async getUsersFromMongoDB(options: SyncOptions): Promise<MongoDBUser[]> {
    // Use dynamic import for compatibility with ts-node and ESM
    const { MongoClient } = await import('mongodb');
    const client = new MongoClient(this.mongoConnectionString);

    try {
      await client.connect();
      const db = client.db('rapidSteno'); // <-- Use your actual database name if different
      const collection = db.collection('users'); // <-- Use your actual collection name if different

      let query: any = {};
      if (options.syncOnlyNew && options.lastSyncDate) {
        query = { createdAt: { $gte: options.lastSyncDate } };
      }

      const users = await collection.find(query).toArray();
      console.log(`Found ${users.length} users in MongoDB`);
      return users as unknown as MongoDBUser[];
    } finally {
      await client.close();
    }
  }

  /**
   * Get activity logs from MongoDB (implement based on your MongoDB setup)
   */
  private async getActivityLogsFromMongoDB(options: SyncOptions): Promise<MongoDBActivityLog[]> {
    // This is a placeholder - implement based on your MongoDB connection
    
    // Example with MongoDB driver:
    /*
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(this.mongoConnectionString);
    
    try {
      await client.connect();
      const db = client.db(your_database');
      const collection = db.collection(activity_logs');
      
      let query = {};
      if (options.lastSyncDate) {
        query = { timestamp: { $gte: options.lastSyncDate } };
      }
      
      const logs = await collection.find(query).toArray();
      return logs;
    } finally {
      await client.close();
    }
    */
    
    // For now, return empty array - implement based on your setup
    console.log('⚠️ Implement getActivityLogsFromMongoDB based on your MongoDB setup');
    return [];
  }

  /**
   * Create a scheduled sync job
   */
  static createScheduledSync(mongoConnectionString: string, schedule: string = '*/6 * * * *'): { stop: () => void } {
    // This can be implemented with cron jobs, setInterval, or cloud functions
    // Example with setInterval (runs every 6s):
    
    const sync = new MongoDBSync(mongoConnectionString);
    
    const runSync = async () => {
      console.log('🕐 Running scheduled MongoDB sync...');
      try {
        await sync.syncAllUsers({ 
          syncOnlyNew: true, 
          lastSyncDate: new Date(Date.now() - 6 * 60 * 60 * 1000) // Last 6 hours
        });
        console.log('✅ Scheduled sync completed');
      } catch (error) {
        console.error('❌ Scheduled sync failed:', error);
      }
    };

    // Run immediately
    runSync();
    
    // Then schedule to run every 6 hours
    setInterval(runSync, 6 * 60 * 60 * 1000);
    
    return {
      stop: () => {
        // Implement stop mechanism
        console.log('🛑 Scheduled sync stopped');
      }
    };
  }
}

// Export convenience functions
export const createMongoDBSync = (mongoConnectionString: string) => {
  return new MongoDBSync(mongoConnectionString);
};

export const startScheduledSync = (mongoConnectionString: string, schedule?: string) => {
  return MongoDBSync.createScheduledSync(mongoConnectionString, schedule);
}; 