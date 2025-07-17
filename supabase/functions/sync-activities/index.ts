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

    // MongoDB connection
    const MONGODB_URI = Deno.env.get('MONGODB_URI')!
    
    // Connect to MongoDB using Deno's MongoDB driver
    const mongoClient = new MongoClient()
    await mongoClient.connect(MONGODB_URI)
    
    const db = mongoClient.database('rapidSteno')
    const usersCollection = db.collection('users')
    
    // Get all users with activity logs
    const users = await usersCollection.find({
      'activity_logs': { $exists: true, $ne: [] }
    }).toArray()
    
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
        for (const activity of user.activity_logs) {
          try {
            // Convert time from seconds to minutes
            const timeSpentMinutes = Math.round(activity.time_spent / 60)
            
            const activityData = {
              user_id: userId,
              page_name: activity.page_name,
              time_spent: timeSpentMinutes,
              view_count: activity.view_count || 1,
              visit_date: activity.visit_date,
              total_active_time: Math.round(activity.total_active_time / 60),
              total_pages_viewed: activity.total_pages_viewed,
              last_active: activity.last_active,
              login_count: activity.login_count || 0,
              subscription_days_left: activity.subscription_days_left,
              daily_time_spent: Math.round((activity.daily_time_spent || 0) / 60),
              total_time_spent: Math.round((activity.total_time_spent || 0) / 60)
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
      message: 'Sync completed successfully',
      summary: {
        totalSynced,
        totalSkipped,
        totalUsers: users.length
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