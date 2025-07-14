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

    const registrationData = await req.json()

    console.log('Received registration data:', registrationData.email)

    // Create the lead record directly (without requiring authentication)
    const leadData = {
      name: registrationData.name || `${registrationData.first_name || ''} ${registrationData.last_name || ''}`.trim(),
      email: registrationData.email,
      phone: registrationData.phone,
      first_name: registrationData.first_name,
      last_name: registrationData.last_name,
      company: registrationData.company,
      state: registrationData.state,
      gender: registrationData.gender,
      exam_category: registrationData.exam_category,
      how_did_you_hear: registrationData.how_did_you_hear,
      source: registrationData.source || 'Admin Panel',
      status: registrationData.status || 'new',
      user_type: registrationData.user_type || 'Trial User',
      subscription_plan: registrationData.subscription_plan || 'Trial User',
      plan: registrationData.plan,
      referral_code: registrationData.referral_code,
      tags: registrationData.tags,
      value: registrationData.value,
      notes: registrationData.notes,
      trial_start_date: registrationData.trial_start_date || new Date().toISOString(),
      trial_end_date: registrationData.trial_end_date || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      is_trial_active: registrationData.is_trial_active !== undefined ? registrationData.is_trial_active : true,
      is_subscription_active: registrationData.is_subscription_active || false,
      amount_paid: registrationData.amount_paid || 0,
      subscription_start_date: registrationData.subscription_start_date,
      subscription_end_date: registrationData.subscription_end_date,
      next_payment_date: registrationData.next_payment_date,
      user_id: null // Will be updated when user actually registers in CRM
    }

    // Insert lead using service role (bypasses RLS)
    const { data, error } = await supabaseClient
      .from('leads')
      .insert(leadData)
      .select()

    if (error) {
      throw error
    }

    // Initialize user activity record if we have admin panel data
    if (registrationData.activityData) {
      const activityData = {
        user_id: null, // Will be linked later when user registers
        login_count: registrationData.activityData.login_count || 0,
        subscription_days_left: registrationData.activityData.subscription_days_left,
        daily_time_spent: registrationData.activityData.daily_time_spent || 0,
        total_time_spent: registrationData.activityData.total_time_spent || 0,
        last_active: registrationData.activityData.last_active || new Date().toISOString()
      }

      // Store activity data temporarily with email reference
      await supabaseClient
        .from('user_activities')
        .insert({
          ...activityData,
          user_id: data[0].id // Use lead ID temporarily until user registers
        })
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Registration data synced successfully',
        lead_id: data[0].id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error syncing registration:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})