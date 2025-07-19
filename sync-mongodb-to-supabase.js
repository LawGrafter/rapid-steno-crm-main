// MongoDB to Supabase Sync Script
// Syncs all users and their activities from MongoDB to Supabase CRM
// Usage: node sync-mongodb-to-supabase.js

import { MongoClient } from 'mongodb';
import { createClient } from '@supabase/supabase-js';

// Configuration
const MONGODB_URI = 'mongodb+srv://rapidsteno:uXsGv3N8zO1mMBFi@rapidsteno.9l3v7.mongodb.net/rapidSteno?retryWrites=true&w=majority';
const SUPABASE_URL = 'https://jukvyicluadgsbruyqyr.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1a3Z5aWNsdWFkZ3NicnV5cXlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ2OTc4NCwiZXhwIjoyMDY4MDQ1Nzg0fQ.jx0sbQheJvaEYQpjlkRDibpvzZ5GXJWe89AKmh3SGJY';

async function calculateTrialDates(user) {
  const now = new Date();
  const registrationDate = new Date(user.registrationDate || user.createdAt || now);
  const trialDays = 7; // 7-day trial
  const trialEndDate = new Date(registrationDate);
  trialEndDate.setDate(trialEndDate.getDate() + trialDays);
  
  const isTrialActive = now <= trialEndDate;
  const daysLeft = Math.max(0, Math.ceil((trialEndDate - now) / (1000 * 60 * 60 * 24)));
  
  return {
    trialStartDate: registrationDate.toISOString(),
    trialEndDate: trialEndDate.toISOString(),
    isTrialActive,
    daysLeft
  };
}

async function syncUsers(mongoClient, supabase) {
  console.log('👥 STEP 1: Syncing users from MongoDB to Supabase...');
  
  const db = mongoClient.db('rapidSteno');
  const usersCollection = db.collection('users');
  
  // Get all users from MongoDB
  const users = await usersCollection.find({}).toArray();
  console.log(`📊 Found ${users.length} users in MongoDB`);
  
  let usersSynced = 0;
  let usersSkipped = 0;
  
  for (const user of users) {
    try {
      // Check if user already exists in Supabase
      const { data: existingUser } = await supabase
        .from('leads')
        .select('id')
        .ilike('email', user.email.trim())
        .single();
      
      if (existingUser) {
        console.log(`   ⏭️  User already exists: ${user.email}`);
        usersSkipped++;
        continue;
      }
      
      // Calculate trial dates
      const trialDates = await calculateTrialDates(user);
      
      // Prepare user data for Supabase
      const userData = {
        email: user.email.trim(),
        first_name: user.firstName || user.name?.split(' ')[0] || '',
        last_name: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
        phone: user.phone || user.mobile || '',
        status: trialDates.isTrialActive ? 'trial' : 'expired',
        subscription_plan: 'free',
        trial_start_date: trialDates.trialStartDate,
        trial_end_date: trialDates.trialEndDate,
        subscription_days_left: trialDates.daysLeft,
        how_did_you_hear: user.source || user.howDidYouHear || 'MongoDB Sync',
        registration_date: user.registrationDate || user.createdAt || new Date().toISOString(),
        registration_source: 'mongodb_sync',
        last_active: user.lastActiveDate || new Date().toISOString(),
        notes: `Synced from MongoDB on ${new Date().toISOString()}. Original ID: ${user._id}. Trial Status: ${trialDates.isTrialActive ? 'Active' : 'Expired'}`,
        created_at: user.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Insert user into Supabase
      const { error: insertError } = await supabase
        .from('leads')
        .insert(userData);
      
      if (insertError) {
        console.log(`   ❌ Error inserting user ${user.email}: ${insertError.message}`);
        usersSkipped++;
      } else {
        console.log(`   ✅ User synced: ${user.email}`);
        usersSynced++;
      }
      
    } catch (error) {
      console.log(`   ❌ Error processing user ${user.email}: ${error.message}`);
      usersSkipped++;
    }
  }
  
  console.log(`\n📊 USER SYNC SUMMARY:`);
  console.log(`Users Synced: ${usersSynced}`);
  console.log(`Users Skipped: ${usersSkipped}`);
  console.log(`Total Users: ${users.length}`);
  
  return usersSynced > 0;
}

async function syncActivities(mongoClient, supabase) {
  console.log('\n📊 STEP 2: Syncing user activities...');
  
  const db = mongoClient.db('rapidSteno');
  const usersCollection = db.collection('users');
  
  // Get all users with activity logs
  const users = await usersCollection.find({
    'activityLogs': { $exists: true, $ne: [] }
  }).toArray();
  
  console.log(`📊 Found ${users.length} users with activity logs`);
  
  let totalSynced = 0;
  let totalSkipped = 0;
  let totalUsers = 0;
  
  for (const user of users) {
    totalUsers++;
    console.log(`\n👤 Processing user ${totalUsers}/${users.length}: ${user.email}`);
    
    try {
      // Find matching user in Supabase by email
      const { data: supabaseUser, error } = await supabase
        .from('leads')
        .select('id')
        .ilike('email', user.email.trim())
        .single();
      
      if (error || !supabaseUser) {
        console.log(`   ❌ No matching user found in Supabase for: ${user.email}`);
        totalSkipped++;
        continue;
      }
      
      console.log(`   ✅ Found matching user in Supabase (ID: ${supabaseUser.id})`);
      const userId = supabaseUser.id;
      
      // Process each activity log
      const activityLogs = user.activityLogs || [];
      console.log(`   📅 Processing ${activityLogs.length} activity logs...`);
      
      for (const activityLog of activityLogs) {
        try {
          // Handle the new structure with pages array
          if (activityLog.pages && Array.isArray(activityLog.pages)) {
            for (const page of activityLog.pages) {
              const activityData = {
                user_id: userId,
                page_name: page.page,
                time_spent: Math.round(page.timeSpent / 60), // Convert seconds to minutes
                view_count: page.viewCount || 1,
                visit_date: activityLog.date,
                total_active_time: Math.round(activityLog.totalActiveTime / 60),
                total_pages_viewed: activityLog.totalPagesViewed,
                last_active: user.lastActiveDate,
                login_count: user.loginCount || 0,
                subscription_days_left: null,
                daily_time_spent: Math.round(activityLog.totalActiveTime / 60),
                total_time_spent: Math.round(activityLog.totalActiveTime / 60)
              };
              
              // Insert activity with conflict handling
              const { error: insertError } = await supabase
                .from('user_activities')
                .upsert(activityData, {
                  onConflict: 'user_id,page_name,visit_date,time_spent'
                });
              
              if (insertError) {
                console.log(`   ❌ Error inserting activity: ${insertError.message}`);
                totalSkipped++;
              } else {
                totalSynced++;
              }
            }
          }
        } catch (activityError) {
          console.log(`   ❌ Error processing activity: ${activityError.message}`);
          totalSkipped++;
        }
      }
      
      console.log(`   ✅ User ${user.email} processed successfully`);
      
    } catch (userError) {
      console.log(`   ❌ Error processing user ${user.email}: ${userError.message}`);
      totalSkipped++;
    }
  }
  
  return { totalSynced, totalSkipped, totalUsers };
}

async function completeSync() {
  console.log('🚀 Starting complete sync (users + activities)...');
  
  let mongoClient;
  
  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
    console.log('✅ MongoDB connected successfully');
    
    // Connect to Supabase
    console.log('📡 Connecting to Supabase...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    console.log('✅ Supabase connected successfully');
    
    // Step 1: Sync users
    const usersSynced = await syncUsers(mongoClient, supabase);
    
    // Step 2: Sync activities
    const activityResults = await syncActivities(mongoClient, supabase);
    
    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 COMPLETE SYNC SUMMARY');
    console.log('='.repeat(60));
    console.log(`Users Synced: ${usersSynced ? 'Yes' : 'No'}`);
    console.log(`Activities Synced: ${activityResults.totalSynced}`);
    console.log(`Activities Skipped: ${activityResults.totalSkipped}`);
    console.log(`Total Users Processed: ${activityResults.totalUsers}`);
    console.log(`Success Rate: ${((activityResults.totalSynced / (activityResults.totalSynced + activityResults.totalSkipped)) * 100).toFixed(2)}%`);
    console.log('='.repeat(60));
    
    if (activityResults.totalSynced > 0) {
      console.log('🎉 Complete sync finished successfully!');
    } else {
      console.log('⚠️  No activities were synced. Check the logs above for issues.');
    }
    
  } catch (error) {
    console.error('❌ Sync failed:', error);
  } finally {
    if (mongoClient) {
      await mongoClient.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
}

// Run the complete sync
completeSync().catch(console.error); 