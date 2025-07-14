import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RegistrationData {
  // Basic Information
  email: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  phone?: string;
  state?: string;
  gender?: string;
  exam_category?: string;
  how_did_you_hear?: string;
  
  // Business Information
  company?: string;
  source?: string;
  status?: string;
  plan?: string;
  referral_code?: string;
  user_type?: string;
  subscription_plan?: string;
  
  // Financial Information
  amount_paid?: number;
  value?: number;
  
  // Dates
  trial_start_date?: string;
  trial_end_date?: string;
  subscription_start_date?: string;
  subscription_end_date?: string;
  next_payment_date?: string;
  
  // Status Flags
  is_trial_active?: boolean;
  is_subscription_active?: boolean;
  
  // Additional Information
  tags?: string[];
  notes?: string;
  
  // Activity Data
  activityData?: {
    login_count?: number;
    subscription_days_left?: number;
    daily_time_spent?: number;
    total_time_spent?: number;
    last_active?: string;
  };
  
  // Software Integration Data
  software_version?: string;
  registration_source?: string; // 'web', 'mobile', 'desktop', 'admin'
  device_info?: {
    platform?: string;
    os?: string;
    browser?: string;
  };
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

    const registrationData: RegistrationData = await req.json()

    console.log('Received registration data for:', registrationData.email)

    // Validate required fields
    if (!registrationData.email) {
      throw new Error('Email is required')
    }

    // Check if lead already exists by email
    const { data: existingLead } = await supabaseClient
      .from('leads')
      .select('id, email, status')
      .eq('email', registrationData.email)
      .single()

    if (existingLead) {
      // Update existing lead with new information
      const updateData = {
        first_name: registrationData.first_name || existingLead.first_name,
        last_name: registrationData.last_name || existingLead.last_name,
        name: registrationData.name || `${registrationData.first_name || existingLead.first_name || ''} ${registrationData.last_name || existingLead.last_name || ''}`.trim(),
        phone: registrationData.phone || existingLead.phone,
        state: registrationData.state || existingLead.state,
        gender: registrationData.gender || existingLead.gender,
        exam_category: registrationData.exam_category || existingLead.exam_category,
        how_did_you_hear: registrationData.how_did_you_hear || existingLead.how_did_you_hear,
        company: registrationData.company || existingLead.company,
        source: registrationData.source || existingLead.source || 'Software Registration',
        status: registrationData.status || existingLead.status || 'New',
        plan: registrationData.plan || existingLead.plan,
        referral_code: registrationData.referral_code || existingLead.referral_code,
        user_type: registrationData.user_type || existingLead.user_type || 'Trial User',
        subscription_plan: registrationData.subscription_plan || existingLead.subscription_plan,
        amount_paid: registrationData.amount_paid || existingLead.amount_paid || 0,
        value: registrationData.value || existingLead.value,
        trial_start_date: registrationData.trial_start_date || existingLead.trial_start_date || new Date().toISOString(),
        trial_end_date: registrationData.trial_end_date || existingLead.trial_end_date || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        subscription_start_date: registrationData.subscription_start_date || existingLead.subscription_start_date,
        subscription_end_date: registrationData.subscription_end_date || existingLead.subscription_end_date,
        next_payment_date: registrationData.next_payment_date || existingLead.next_payment_date,
        is_trial_active: registrationData.is_trial_active !== undefined ? registrationData.is_trial_active : existingLead.is_trial_active ?? true,
        is_subscription_active: registrationData.is_subscription_active !== undefined ? registrationData.is_subscription_active : existingLead.is_subscription_active ?? false,
        tags: registrationData.tags || existingLead.tags,
        notes: registrationData.notes ? `${existingLead.notes || ''}\n\n[Software Registration Update] ${registrationData.notes}` : existingLead.notes,
        updated_at: new Date().toISOString()
      }

      const { data: updatedLead, error: updateError } = await supabaseClient
        .from('leads')
        .update(updateData)
        .eq('id', existingLead.id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      console.log('Updated existing lead:', updatedLead.id)

      // Update activity data if provided
      if (registrationData.activityData) {
        await updateUserActivity(supabaseClient, updatedLead.id, registrationData.activityData)
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Lead updated successfully',
          lead_id: updatedLead.id,
          action: 'updated'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    } else {
      // Ensure Supabase Auth user exists for this email
      let userId = null;
      // Query auth.users via REST API
      const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
      const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      const userResp = await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(registrationData.email)}`, {
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
      });
      const users = await userResp.json();
      if (users.length) {
        userId = users[0].id;
      } else {
        // Create user in Supabase Auth
        const { data: createdUser, error: createUserError } = await supabaseClient.auth.admin.createUser({
          email: registrationData.email,
          password: crypto.randomUUID(), // random password, can be reset later
          email_confirm: true,
          user_metadata: {
            full_name: registrationData.name || `${registrationData.first_name || ''} ${registrationData.last_name || ''}`.trim(),
            registration_source: registrationData.registration_source || 'software',
          }
        });
        if (createUserError || !createdUser?.user?.id) {
          throw createUserError || new Error('Failed to create Supabase Auth user');
        }
        userId = createdUser.user.id;
      }
      // Create new lead
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
        source: registrationData.source || 'Software Registration',
        status: registrationData.status || 'New',
        user_type: registrationData.user_type || 'Trial User',
        subscription_plan: registrationData.subscription_plan || 'Trial User',
        plan: registrationData.plan,
        referral_code: registrationData.referral_code,
        tags: registrationData.tags,
        value: registrationData.value,
        notes: registrationData.notes ? `[Software Registration] ${registrationData.notes}` : 'Lead created from software registration',
        trial_start_date: registrationData.trial_start_date || new Date().toISOString(),
        trial_end_date: registrationData.trial_end_date || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        is_trial_active: registrationData.is_trial_active !== undefined ? registrationData.is_trial_active : true,
        is_subscription_active: registrationData.is_subscription_active || false,
        amount_paid: registrationData.amount_paid || 0,
        subscription_start_date: registrationData.subscription_start_date,
        subscription_end_date: registrationData.subscription_end_date,
        next_payment_date: registrationData.next_payment_date,
        user_id: userId // Link to Supabase Auth user
      }

      const { data: newLead, error } = await supabaseClient
        .from('leads')
        .insert(leadData)
        .select()
        .single()

      if (error) {
        throw error
      }

      console.log('Created new lead:', newLead.id)

      // Initialize user activity record if we have activity data
      if (registrationData.activityData) {
        await updateUserActivity(supabaseClient, newLead.id, registrationData.activityData)
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Lead created successfully',
          lead_id: newLead.id,
          action: 'created'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }
  } catch (error) {
    console.error('Error syncing registration:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

// Helper function to update user activity
async function updateUserActivity(supabaseClient: any, leadId: string, activityData: any) {
  try {
    const activityRecord = {
      user_id: leadId, // Use lead ID temporarily until user registers
      login_count: activityData.login_count || 0,
      subscription_days_left: activityData.subscription_days_left,
      daily_time_spent: activityData.daily_time_spent || 0,
      total_time_spent: activityData.total_time_spent || 0,
      last_active: activityData.last_active || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Upsert activity data
    await supabaseClient
      .from('user_activities')
      .upsert(activityRecord, {
        onConflict: 'user_id'
      })

    console.log('Activity data updated for lead:', leadId)
  } catch (error) {
    console.error('Error updating activity data:', error)
    // Don't throw here, just log the error
  }
}