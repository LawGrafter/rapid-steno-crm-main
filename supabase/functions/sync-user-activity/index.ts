import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, activityData } = await req.json()

    console.log('Received activity sync for:', email, activityData)

    // Find user by email
    const { data: authUser, error: authError } = await supabaseClient.auth.admin.getUserByEmail(email)
    if (authError || !authUser.user) {
      throw new Error(`User not found: ${email}`)
    }

    const userId = authUser.user.id

    // Upsert user activity data
    const { data, error } = await supabaseClient
      .from('user_activities')
      .upsert({
        user_id: userId,
        login_count: activityData.login_count,
        subscription_days_left: activityData.subscription_days_left,
        daily_time_spent: activityData.daily_time_spent,
        total_time_spent: activityData.total_time_spent,
        last_active: activityData.last_active || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ success: true, message: 'User activity synced successfully', data }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error syncing user activity:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})