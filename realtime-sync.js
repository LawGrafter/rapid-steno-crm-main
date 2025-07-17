import { MongoClient } from 'mongodb';
import fetch from 'node-fetch';

const MONGODB_URI = 'mongodb+srv://rapidsteno:uXsGv3N8zO1mMBFi@rapidsteno.9l3v7.mongodb.net/rapidSteno?retryWrites=true&w=majority';
const SUPABASE_FUNCTION_URL = 'https://jukvyicluadgsbruyqyr.functions.supabase.co/sync-registration';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1a3Z5aWNsdWFkZ3NicnV5cXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0Njk3ODQsImV4cCI6MjA2ODA0NTc4NH0.ESxjnOB79fuWwwS2BZsSgXFBWburYTq3EmNBZD72Oi4';
const VALID_USER_ID = '99b2a8f6-a867-424b-88eb-74eeda6b5ce6';

function calculateTrialDates(user) {
  const now = new Date();
  let trialStartDate = null;
  let trialEndDate = null;
  if (user.trialStartDate || user.trial_start_date) {
    trialStartDate = new Date(user.trialStartDate || user.trial_start_date);
  }
  if (user.trialEndDate || user.trial_end_date) {
    trialEndDate = new Date(user.trialEndDate || user.trial_end_date);
  }
  if (!trialStartDate && user.createdAt) {
    trialStartDate = new Date(user.createdAt);
  } else if (!trialStartDate && user.created_at) {
    trialStartDate = new Date(user.created_at);
  } else if (!trialStartDate) {
    trialStartDate = now;
  }
  if (!trialEndDate) {
    trialEndDate = new Date(trialStartDate.getTime() + 15 * 24 * 60 * 60 * 1000);
  }
  const isTrialActive = trialEndDate > now;
  return {
    trialStartDate: trialStartDate.toISOString(),
    trialEndDate: trialEndDate.toISOString(),
    isTrialActive
  };
}

async function syncUserToSupabase(user) {
  const trialDates = calculateTrialDates(user);
  const isSubscriptionActive = user.isSubscriptionActive || user.is_subscription_active || false;
  const subscriptionPlan = user.subscriptionPlan || user.subscription_plan || (isSubscriptionActive ? 'Paid' : 'Trial');
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
    registration_source: 'mongodb_realtime',
    software_version: user.softwareVersion || user.software_version || '1.0.0',
    notes: `Realtime sync from MongoDB on ${new Date().toISOString()}. Original ID: ${user._id}. Trial Status: ${trialDates.isTrialActive ? 'Active' : 'Expired'}`,
    user_id: VALID_USER_ID,
    created_by: VALID_USER_ID
  };
  try {
    const response = await fetch(SUPABASE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(leadData)
    });
    const responseText = await response.text();
    if (response.ok) {
      const result = JSON.parse(responseText);
      console.log(`✅ Synced user: ${leadData.email} (Lead ID: ${result.lead_id})`);
    } else {
      console.error(`❌ Error syncing user: ${leadData.email} - ${response.status} - ${responseText}`);
    }
  } catch (error) {
    console.error(`❌ Exception syncing user: ${leadData.email} - ${error.message}`);
  }
}

async function startChangeStream() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db('rapidSteno');
  const usersCollection = db.collection('users');
  const changeStream = usersCollection.watch();
  console.log('🔄 Listening for real-time changes in MongoDB...');
  changeStream.on('change', async (change) => {
    try {
      if (['insert', 'update', 'replace'].includes(change.operationType)) {
        const userId = change.documentKey._id;
        const user = await usersCollection.findOne({ _id: userId });
        if (user) {
          await syncUserToSupabase(user);
        }
      }
    } catch (err) {
      console.error('❌ Error processing change stream event:', err);
    }
  });
}

startChangeStream().catch(console.error); 