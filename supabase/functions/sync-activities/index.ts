import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { MongoClient } from "https://deno.land/x/mongo@v0.31.1/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // MongoDB connection - try alternative approach
    const MONGODB_URI = Deno.env.get('MONGODB_URI')!
    
    // Use the exact same connection string as your working software
    const username = 'rapidsteno'
    const password = 'uXsGv3N8zO1mMBFi'
    const host = 'rapidsteno.9l3v7.mongodb.net'
    const database = 'rapidSteno'
    
    const altUri = `mongodb+srv://${username}:${password}@${host}/${database}?retryWrites=true&w=majority`
    
    // Connect to MongoDB using Deno's MongoDB driver with connection options
    const mongoClient = new MongoClient()
    await mongoClient.connect(altUri, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 1,
      retryWrites: true,
      w: 'majority',
      directConnection: false
    })
    
    const db = mongoClient.database('rapidSteno')
    const usersCollection = db.collection('users')
    
    // Get all users with activity logs (try different field names)
    let users = await usersCollection.find({
      'activityLogs': { $exists: true, $ne: [] }
    }).toArray()
    
    // If no users found with 'activityLogs', try other field names
    if (users.length === 0) {
      users = await usersCollection.find({
        'activity_logs': { $exists: true, $ne: [] }
      }).toArray()
    }
    
    if (users.length === 0) {
      users = await usersCollection.find({
        'activities': { $exists: true, $ne: [] }
      }).toArray()
    }
    
    if (users.length === 0) {
      users = await usersCollection.find({
        'user_activities': { $exists: true, $ne: [] }
      }).toArray()
    }
    
    if (users.length === 0) {
      users = await usersCollection.find({
        'logs': { $exists: true, $ne: [] }
      }).toArray()
    }
    
    let totalSynced = 0
    let totalSkipped = 0
    
    for (const user of users) {
      try {
        // Find matching user in Supabase by email
        const { data: supabaseUser, error } = await supabase
          .from('leads')
          .select('id')
          .ilike('email', user.email.trim())
          .single()
        
        if (error || !supabaseUser) {
          console.log(`No matching user found for email: ${user.email}`)
          totalSkipped++
          continue
        }
        
        const userId = supabaseUser.id
        
        // Process each activity log
        const activityLogs = user.activityLogs || user.activity_logs || []
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
                  subscription_days_left: null, // Not available in this structure
                  daily_time_spent: Math.round(activityLog.totalActiveTime / 60),
                  total_time_spent: Math.round(activityLog.totalActiveTime / 60)
                }
                
                // Insert activity with conflict handling
                const { error: insertError } = await supabase
                  .from('user_activities')
                  .upsert(activityData, {
                    onConflict: 'user_id,page_name,visit_date,time_spent'
                  })
                
                if (insertError) {
                  console.log(`Error inserting activity for ${user.email}:`, insertError.message)
                  totalSkipped++
                } else {
                  totalSynced++
                }
              }
            } else {
              // Handle old structure (fallback)
              const timeSpentMinutes = Math.round((activityLog.time_spent || 0) / 60)
              
              const activityData = {
                user_id: userId,
                page_name: activityLog.page_name,
                time_spent: timeSpentMinutes,
                view_count: activityLog.view_count || 1,
                visit_date: activityLog.visit_date,
                total_active_time: Math.round((activityLog.total_active_time || 0) / 60),
                total_pages_viewed: activityLog.total_pages_viewed,
                last_active: activityLog.last_active,
                login_count: activityLog.login_count || 0,
                subscription_days_left: activityLog.subscription_days_left,
                daily_time_spent: Math.round((activityLog.daily_time_spent || 0) / 60),
                total_time_spent: Math.round((activityLog.total_time_spent || 0) / 60)
              }
              
              // Insert activity with conflict handling
              const { error: insertError } = await supabase
                .from('user_activities')
                .upsert(activityData, {
                  onConflict: 'user_id,page_name,visit_date,time_spent'
                })
              
              if (insertError) {
                console.log(`Error inserting activity for ${user.email}:`, insertError.message)
                totalSkipped++
              } else {
                totalSynced++
              }
            }
          } catch (activityError) {
            console.log(`Error processing activity for ${user.email}:`, activityError.message)
            totalSkipped++
          }
        }
      } catch (userError) {
        console.log(`Error processing user ${user.email}:`, userError.message)
        totalSkipped++
      }
    }
    
    await mongoClient.close()
    
    const result = {
      success: true,
      message: users.length === 0 ? 'No activity data found to sync' : 'Sync completed successfully',
      summary: {
        totalSynced,
        totalSkipped,
        totalUsers: users.length,
        dataFound: users.length > 0
      }
    }
    
    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
    
  } catch (error) {
    console.error('Sync failed:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
}) 