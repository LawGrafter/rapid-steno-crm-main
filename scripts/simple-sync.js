import { MongoClient } frommongodb';

const MONGO_URI = mongodb+srv://rapidsteno:uXsGv3N8zO1mMBFi@rapidsteno.9v7.mongodb.net/rapidSteno?retryWrites=true&w=majority';
const CRM_API_URL = https://jukvyicluadgsbruyqyr.functions.supabase.co/sync-registration;

async function syncMongoDBToCRM() {
  console.log('🔄 Starting MongoDB to CRM sync...');
  
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(rapidSteno);
    const collection = db.collection(users);
    
    // Get all users from MongoDB
    const users = await collection.find().toArray();
    console.log(`📊 Found ${users.length} users in MongoDB`);
    
    let synced =0;
    let failed = 0;
    
    // Sync each user to CRM
    for (const user of users) {
      try {
        const crmData = {       email: user.email,
          first_name: user.firstName || user.first_name,
          last_name: user.lastName || user.last_name,
          name: `${user.firstName || user.first_name || ''}${user.lastName || user.last_name || ''}`.trim(),
          phone: user.phone,
          state: user.state,
          gender: user.gender,
          exam_category: user.examCategory || user.exam_category,
          how_did_you_hear: user.source,
          plan: user.plan || 'Trial User',
          subscription_plan: user.subscriptionPlan || user.subscription_plan,
          amount_paid: user.amountPaid || user.amount_paid ||0          is_trial_active: user.isTrialActive !== undefined ? user.isTrialActive : true,
          is_subscription_active: user.isSubscriptionActive !== undefined ? user.isSubscriptionActive : false,
          trial_start_date: user.trialStartDate ? new Date(user.trialStartDate).toISOString() : new Date().toISOString(),
          trial_end_date: user.trialEndDate ? new Date(user.trialEndDate).toISOString() : new Date(Date.now() +15 * 24* 60* 60 *1000).toISOString(),
          registration_source: 'mongodb_sync',
          software_version: 1.0.0,
          notes: `Synced from MongoDB admin panel - User ID: ${user._id}`
        };
        
        const response = await fetch(CRM_API_URL, {
          method:POST
          headers:{'Content-Type': 'application/json' },
          body: JSON.stringify(crmData)
        });
        
        if (response.ok) {        synced++;
          console.log(`✅ Synced user: ${user.email}`);
        } else {        failed++;
          console.log(`❌ Failed to sync user: ${user.email}`);
        }
      } catch (error) {
        failed++;
        console.log(`❌ Error syncing user ${user.email}:`, error.message);
      }
    }
    
    console.log(`🎉 Sync completed: ${synced} synced, ${failed} failed`);
    
  } catch (error) {
    console.error('❌ Sync failed:', error);
  } finally {await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the sync
syncMongoDBToCRM().then(() => { process.exit(0);
}).catch((error) =>{
  console.error('Fatal error:', error);
  process.exit(1);
}); 