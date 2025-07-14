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

    const { email, activityLogs } = await req.json()

    console.log('Received activity logs for:', email, `${activityLogs?.length || 0} logs`)

    // Find user by email
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const userResp = await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(email)}`, {
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
    });
    const users = await userResp.json();
    if (!users.length) {
      throw new Error(`User not found: ${email}`);
    }
    const userId = users[0].id;

    // Insert activity logs (batch insert)
    const logsToInsert = activityLogs.map((log: any) => ({
      user_id: userId,
      page_name: log.page_name,
      page_url: log.page_url,
      time_spent: log.time_spent,
      visit_date: log.visit_date,
      timestamp: log.timestamp || new Date().toISOString()
    }))

    const { data, error } = await supabaseClient
      .from('activity_logs')
      .insert(logsToInsert)

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${logsToInsert.length} activity logs synced successfully`,
        data 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error syncing activity logs:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})