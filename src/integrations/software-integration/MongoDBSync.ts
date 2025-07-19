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

  async syncAllUsers(options: SyncOptions = { batchSize: 50, syncOnlyNew: false, lastSyncDate: undefined, dryRun: false }): Promise<{
    total: number;
    synced: number;
    failed: number;
    errors: string[];
  }> {
    const results = { total: 0, synced: 0, failed: 0, errors: [] as string[] };

    try {
      console.log('🔄 Starting MongoDB to CRM sync...');

      const users = await this.getUsersFromMongoDB(options);
      results.total = users.length;

      console.log(`📊 Found ${users.length} users to sync`);

      const batchSize = options.batchSize || 50;
      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);

        console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(users.length / batchSize)}`);

        for (const user of batch) {
          try {
            if (!user.email || user.email.trim() === '') {
              console.warn(`⚠️ Skipping user without email: ${user._id}`);
              continue;
            }

            if (!options.dryRun) {
              await this.syncUserToCRM(user, options);
            }

            results.synced++;
            console.log(`✅ Synced user: ${user.email}`);
          } catch (error) {
            results.failed++;
            const errorMsg = `❌ Failed to sync ${user.email}: ${error}`;
            results.errors.push(errorMsg);
            console.error(errorMsg);
          }
        }

        if (i + batchSize < users.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      console.log(`🎉 Sync completed: ${results.synced}/${results.total} users synced`);
      return results;

    } catch (error) {
      console.error('❌ Sync failed:', error);
      throw error;
    }
  }

  async syncUserToCRM(mongoUser: MongoDBUser, options: SyncOptions): Promise<{
    success: boolean;
    lead_id?: string;
    action?: 'created' | 'updated';
    error?: string;
  }> {
    try {
      if (!mongoUser.email || mongoUser.email.trim() === '') {
        console.warn(`⛔ Skipping user with missing email: _id = ${mongoUser._id}`);
        return { success: false, error: 'Missing email' };
      }

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
        notes: `Synced from MongoDB - ID: ${mongoUser._id}`
      };

      const result = await this.crmIntegration.sendRegistration(crmData);

      if (result.success && options.syncActivities) {
        await this.syncUserActivity(mongoUser);
      }

      return result;

    } catch (error) {
      console.error(`❌ Error syncing user ${mongoUser.email}:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async syncUserActivity(mongoUser: MongoDBUser): Promise<void> {
    if (!mongoUser.email || (!mongoUser.loginCount && !mongoUser.totalTimeSpent)) return;

    try {
      const activityData: ActivityData = {
        email: mongoUser.email,
        login_count: mongoUser.loginCount || 0,
        total_time_spent: mongoUser.totalTimeSpent || 0,
        last_active: mongoUser.lastActive?.toISOString() || new Date().toISOString()
      };

      await this.crmIntegration.updateActivity(activityData);
      console.log(`✅ Activity synced for: ${mongoUser.email}`);
    } catch (error) {
      console.error(`❌ Failed activity sync for ${mongoUser.email}:`, error);
    }
  }

  private async getUsersFromMongoDB(options: SyncOptions): Promise<MongoDBUser[]> {
    const { MongoClient } = await import('mongodb');
    const client = new MongoClient(this.mongoConnectionString);

    try {
      await client.connect();
      const db = client.db('rapidSteno');
      const collection = db.collection('users');

      let query: any = {};
      if (options.syncOnlyNew && options.lastSyncDate) {
        query = { createdAt: { $gte: options.lastSyncDate } };
      }

      const users = await collection.find(query).toArray();
      console.log(`📥 Pulled ${users.length} users from MongoDB`);
      return users as unknown as MongoDBUser[];

    } finally {
      await client.close();
    }
  }

  private async getActivityLogsFromMongoDB(options: SyncOptions): Promise<MongoDBActivityLog[]> {
    console.log('⚠️ Implement getActivityLogsFromMongoDB based on your setup');
    return [];
  }

  static createScheduledSync(mongoConnectionString: string, schedule: string = '*/6 * * * *'): { stop: () => void } {
    const sync = new MongoDBSync(mongoConnectionString);

    const runSync = async () => {
      console.log('🕐 Running scheduled MongoDB sync...');
      try {
        await sync.syncAllUsers({
          syncOnlyNew: true,
          syncActivities: true,
          lastSyncDate: new Date(Date.now() - 6 * 60 * 60 * 1000)
        });
        console.log('✅ Scheduled sync completed');
      } catch (error) {
        console.error('❌ Scheduled sync failed:', error);
      }
    };

    runSync();
    setInterval(runSync, 6 * 60 * 60 * 1000);

    return {
      stop: () => {
        console.log('🛑 Scheduled sync stopped');
      }
    };
  }
}

// Exports
export const createMongoDBSync = (mongoConnectionString: string) => {
  return new MongoDBSync(mongoConnectionString);
};

export const startScheduledSync = (mongoConnectionString: string, schedule?: string) => {
  return MongoDBSync.createScheduledSync(mongoConnectionString, schedule);
};
