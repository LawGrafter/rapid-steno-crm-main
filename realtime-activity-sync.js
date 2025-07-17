import { MongoClient } from 'mongodb';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// MongoDB Configuration
const MONGODB_URI = 'mongodb://localhost:27017';
const MONGODB_DB = 'rapidSteno';
const MONGODB_COLLECTION = 'users';

// Supabase Configuration
const SUPABASE_URL = 'https://jukvyicluadgsbruyqyr.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1a3Z5aWNsdWFkZ3NicnV5cXlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ2OTc4NCwiZXhwIjoyMDY4MDQ1Nzg0fQ.jx0sbQheJvaEYQpjlkRDibpvzZ5GXJWe89AKmh3SGJY';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function findSupabaseUserByEmail(email) {
  const { data, error } = await supabase
    .from('leads')
    .select('id')
    .ilike('email', email.trim())
    .single();
  
  if (error || !data) {
    return null;
  }
  return data.id;
}

async function syncActivityToSupabase(userId, activity) {
  try {
    const { data, error } = await supabase
      .from('user_activities')
      .insert({
        user_id: userId,
        page_name: activity.page_name,
        time_spent: activity.time_spent,
        view_count: activity.view_count || 1,
        visit_date: activity.visit_date,
        total_active_time: activity.total_active_time,
        total_pages_viewed: activity.total_pages_viewed,
        last_active: activity.last_active,
        login_count: activity.login_count || 0,
        subscription_days_left: activity.subscription_days_left,
        daily_time_spent: activity.daily_time_spent || 0,
        total_time_spent: activity.total_time_spent || 0
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        console.log(`Skipping duplicate activity for user ${userId} on ${activity.page_name}`);
        return;
      }
      throw error;
    }

    console.log(`✅ Synced activity: ${activity.page_name} for user ${userId}`);
    return data;
  } catch (error) {
    console.error(`❌ Error syncing activity for user ${userId}:`, error.message);
  }
}

async function processUserActivities(user) {
  if (!user.email || !user.activity_logs || !Array.isArray(user.activity_logs)) {
    return;
  }

  const supabaseUserId = await findSupabaseUserByEmail(user.email);
  if (!supabaseUserId) {
    console.log(`⚠️ No matching user found in Supabase for email: ${user.email}`);
    return;
  }

  for (const activity of user.activity_logs) {
    await syncActivityToSupabase(supabaseUserId, activity);
  }
}

async function startRealtimeSync() {
  console.log('🚀 Starting real-time activity sync...');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(MONGODB_DB);
    const collection = db.collection(MONGODB_COLLECTION);
    
    // Set up change stream to watch for updates
    const changeStream = collection.watch([
      {
        $match: {
          'operationType': { $in: ['update', 'replace'] },
          'updateDescription.updatedFields.activity_logs': { $exists: true }
        }
      }
    ]);
    
    console.log('👀 Watching for activity log changes...');
    
    changeStream.on('change', async (change) => {
      console.log('📝 Detected activity change:', change.documentKey._id);
      
      try {
        // Get the updated user document
        const user = await collection.findOne({ _id: change.documentKey._id });
        if (user) {
          await processUserActivities(user);
        }
      } catch (error) {
        console.error('❌ Error processing change:', error);
      }
    });
    
    changeStream.on('error', (error) => {
      console.error('❌ Change stream error:', error);
    });
    
    // Keep the process running
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down real-time sync...');
      await changeStream.close();
      await client.close();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Error starting real-time sync:', error);
    await client.close();
    process.exit(1);
  }
}

// Start the real-time sync
startRealtimeSync(); 