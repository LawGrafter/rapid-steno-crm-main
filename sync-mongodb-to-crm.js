import { MongoClient } from 'mongodb';
import fetch from 'node-fetch';

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://rapidsteno:uXsGv3N8zO1mMBFi@rapidsteno.9l3v7.mongodb.net/rapidSteno?retryWrites=true&w=majority';

// Supabase function URL and auth token
const SUPABASE_FUNCTION_URL = 'https://jukvyicluadgsbruyqyr.functions.supabase.co/sync-registration';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1a3Z5aWNsdWFkZ3NicnV5cXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0Njk3ODQsImV4cCI6MjA2ODA0NTc4NH0.ESxjnOB79fuWwwS2BZsSgXFBWburYTq3EmNBZD72Oi4';

// Valid user ID from your CRM (confirmed working)
const VALID_USER_ID = '99b2a8f6-a867-424b-88eb-74eeda6b5ce6';

// Function to calculate trial dates based on user creation date
function calculateTrialDates(user) {
  const now = new Date();
  
  // Try to get existing trial dates from MongoDB
  let trialStartDate = null;
  let trialEndDate = null;
  
  // Check if user has existing trial dates
  if (user.trialStartDate || user.trial_start_date) {
    trialStartDate = new Date(user.trialStartDate || user.trial_start_date);
  }
  if (user.trialEndDate || user.trial_end_date) {
    trialEndDate = new Date(user.trialEndDate || user.trial_end_date);
  }
  
  // If no trial dates exist, calculate based on user creation date
  if (!trialStartDate && user.createdAt) {
    trialStartDate = new Date(user.createdAt);
  } else if (!trialStartDate && user.created_at) {
    trialStartDate = new Date(user.created_at);
  } else if (!trialStartDate) {
    // Fallback to current date if no creation date
    trialStartDate = now;
  }
  
  // If no trial end date, calculate 15 days from start
  if (!trialEndDate) {
    trialEndDate = new Date(trialStartDate.getTime() + 15 * 24 * 60 * 60 * 1000);
  }
  
  // Determine if trial is active
  const isTrialActive = trialEndDate > now;
  
  return {
    trialStartDate: trialStartDate.toISOString(),
    trialEndDate: trialEndDate.toISOString(),
    isTrialActive
  };
}

async function syncMongoDBToCRM() {
  let client;
  try {
    console.log('🔌 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB successfully!');

    const db = client.db('rapidSteno');
    const usersCollection = db.collection('users');

    console.log('📊 Fetching users from MongoDB...');
    const users = await usersCollection.find({}).toArray();
    console.log(`📈 Found ${users.length} users in MongoDB`);

    if (users.length === 0) {
      console.log('⚠️  No users found in MongoDB');
      return;
    }

    console.log('\n🔄 Starting sync process...');
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      console.log(`\n[${i + 1}/${users.length}] Processing user: ${user.email || user.name || 'Unknown'}`);
      
      try {
        // Calculate proper trial dates
        const trialDates = calculateTrialDates(user);
        
        // Determine subscription status
        const isSubscriptionActive = user.isSubscriptionActive || user.is_subscription_active || false;
        const subscriptionPlan = user.subscriptionPlan || user.subscription_plan || (isSubscriptionActive ? 'Paid' : 'Trial');
        
        // Prepare lead data
        const leadData = {
          email: user.email || '',
          first_name: user.firstName || user.first_name || '',
          last_name: user.lastName || user.last_name || '',
          name: user.name || `${user.firstName || user.first_name || ''} ${user.lastName || user.last_name || ''}`.trim(),
          phone: user.phone || user.phoneNumber || '',
          state: user.state || user.location || '',
          gender: user.gender || '',
          exam_category: user.examCategory || user.exam_category || 'Court Exams',
          how_did_you_hear: user.source || user.howDidYouHear || 'MongoDB Sync',
          plan: user.plan || (isSubscriptionActive ? 'Paid User' : 'Trial User'),
          subscription_plan: subscriptionPlan,
          amount_paid: user.amountPaid || user.amount_paid || 0,
          is_trial_active: trialDates.isTrialActive,
          is_subscription_active: isSubscriptionActive,
          trial_start_date: trialDates.trialStartDate,
          trial_end_date: trialDates.trialEndDate,
          registration_source: 'mongodb_sync',
          software_version: user.softwareVersion || user.software_version || '1.0.0',
          notes: `Synced from MongoDB on ${new Date().toISOString()}. Original ID: ${user._id}. Trial Status: ${trialDates.isTrialActive ? 'Active' : 'Expired'}`,
          user_id: VALID_USER_ID,
          created_by: VALID_USER_ID
        };

        console.log(`📤 Sending data for: ${leadData.name} (${leadData.email})`);
        console.log(`⏰ Trial: ${trialDates.isTrialActive ? 'Active' : 'Expired'} (${new Date(trialDates.trialEndDate).toLocaleDateString()})`);
        
        const response = await fetch(SUPABASE_FUNCTION_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify(leadData)
        });

        const responseText = await response.text();
        console.log(`📥 Response status: ${response.status}`);
        if (response.ok) {
          const result = JSON.parse(responseText);
          console.log(`✅ Success: ${result.message} (Lead ID: ${result.lead_id})`);
          successCount++;
        } else {
          console.log(`❌ Error: ${response.status} - ${responseText}`);
          errorCount++;
        }
        // Add a small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.log(`❌ Error processing user: ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n📊 Sync Summary:');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`⏭️  Skipped: ${skippedCount}`);
    console.log(`📈 Total processed: ${successCount + errorCount + skippedCount}`);
  } catch (error) {
    console.error('❌ Sync failed:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
}

// Run the sync
console.log('🚀 Starting MongoDB to CRM sync...');
syncMongoDBToCRM().then(() => {
  console.log('🏁 Sync process completed');
}).catch(error => {
  console.error('💥 Sync process failed:', error);
}); 