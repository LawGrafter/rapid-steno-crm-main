import { MongoClient } frommongodb';

const MONGO_URI = mongodb+srv://rapidsteno:uXsGv3N8zO1mMBFi@rapidsteno.9v7.mongodb.net/rapidSteno?retryWrites=true&w=majority';
const CRM_API_URL = https://jukvyicluadgsbruyqyr.functions.supabase.co/sync-registration;

async function syncMongoDBToCRM() {
  console.log('🔄 Starting MongoDB to CRM sync...');
  
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('rapidSteno');
    const users = await db.collection('users').find().toArray();
    
    console.log(`📊 Found ${users.length} users in MongoDB`);
    
    let synced =0;
    let failed =0   
    for (const user of users) {
      try {
        // Get the latest subscription info
        const latestSubscription = user.subscriptionHistory && user.subscriptionHistory.length > 0 
          ? user.subscriptionHistory[user.subscriptionHistory.length - 1] 
          : null;
        
        const crmData = {       email: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          phone: user.phone,
          state: user.state,
          gender: user.gender,
          exam_category: user.examCategory,
          how_did_you_hear: 'MongoDB Sync',
          plan: user.subscriptionType || 'Trial User',
          subscription_plan: latestSubscription ? latestSubscription.type : 'Trial',
          amount_paid:0,
          is_trial_active: latestSubscription ? latestSubscription.type === 'Trial' : true,
          is_subscription_active: latestSubscription ? latestSubscription.type !== 'Trial' : false,
          trial_start_date: latestSubscription ? latestSubscription.startDate : new Date().toISOString(),
          trial_end_date: latestSubscription ? latestSubscription.endDate : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          registration_source: 'mongodb_sync',
          software_version: 1.0.0,
          notes: `Synced from MongoDB - User ID: ${user._id}, Login Count: ${user.loginCount}, Last Active: ${user.lastActiveDate}`
        };
        
        const response = await fetch(CRM_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(crmData)
        });
        
        if (response.ok) {
          synced++;
          console.log(`✅ Synced user: ${user.email}`);
        } else {
          failed++;
          const errorData = await response.text();
          console.log(`❌ Failed to sync user: ${user.email} - ${response.status}: ${errorData}`);
        }
        
        // Add a small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        failed++;
        console.log(`❌ Error syncing user ${user.email}:`, error.message);
      }
    }
    
    console.log(`🎉 Sync completed: ${synced} synced, ${failed} failed`);
    
  } catch (error) {
    console.error('❌ Sync failed:', error);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the sync
syncMongoDBToCRM().then(() => {
  console.log('✅ Sync process finished');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
}); 