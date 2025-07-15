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

    // Call the database function to check and update expired trials
    const { data, error } = await supabaseClient.rpc('daily_trial_status_check')

    if (error) {
      console.error('Error checking trial status:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to check trial status' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get statistics about the update
    const { data: expiredTrials, error: statsError } = await supabaseClient
      .from('leads')
      .select('id, name, email, trial_end_date, subscription_plan, status')
      .lt('trial_end_date', new Date().toISOString())
      .eq('subscription_plan', 'Unpaid')
      .eq('status', 'Inactive')

    if (statsError) {
      console.error('Error getting expired trials stats:', statsError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Trial status check completed',
        expiredTrialsCount: expiredTrials?.length || 0,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 