import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const registrationData = await req.json();
  const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');

  try {
    console.log('Received registration data for:', registrationData.email);

    if (!registrationData.email) {
      throw new Error('Email is required');
    }

    // ✅ Allowed subscription plans - must match database constraint
    const allowedPlans = ['Trial', 'Paid', 'Unpaid'];
    const subscriptionPlan = allowedPlans.includes(registrationData.subscription_plan)
      ? registrationData.subscription_plan
      : 'Trial';

    let authUserId = registrationData.user_id;

    if (registrationData.create_auth_user && !authUserId) {
      console.log('Creating Supabase Auth user...');
      const fullName = `${registrationData.first_name || ''} ${registrationData.last_name || ''}`.trim();

      const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
        email: registrationData.email,
        password: crypto.randomUUID(),
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          software_version: registrationData.software_version,
          registration_source: registrationData.registration_source || 'software'
        }
      });

      if (authError) {
        console.error('Auth user creation error:', authError);
        throw new Error(`Failed to create auth user: ${authError.message}`);
      }

      authUserId = authData.user?.id;
      console.log('Auth user created successfully:', authUserId);
    }

    const { data: existingLead } = await supabaseClient
      .from('leads')
      .select('id, email, status')
      .eq('email', registrationData.email)
      .single();

    if (existingLead) {
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
        status: registrationData.status || existingLead.status || 'Active',
        plan: registrationData.plan || existingLead.plan || 'Trial',
        referral_code: registrationData.referral_code || existingLead.referral_code,
        user_type: registrationData.user_type || existingLead.user_type || 'Trial User',
        subscription_plan: subscriptionPlan || existingLead.subscription_plan,
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
      };

      const { data: updatedLead, error: updateError } = await supabaseClient
        .from('leads')
        .update(updateData)
        .eq('id', existingLead.id)
        .select()
        .single();

      if (updateError) throw updateError;

      if (registrationData.activityData) {
        await updateUserActivity(supabaseClient, updatedLead.id, registrationData.activityData);
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Lead updated successfully',
        lead_id: updatedLead.id,
        action: 'updated'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    } else {
      let userId = authUserId || registrationData.user_id || '8fd923c2-c497-4df3-8ada-7b3be64d5521';

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
        status: registrationData.status || 'Active',
        user_type: registrationData.user_type || 'Trial User',
        subscription_plan: subscriptionPlan, // ✅ Safe value here
        plan: registrationData.plan || 'Trial',
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
        user_id: userId,
        created_by: registrationData.created_by || '8fd923c2-c497-4df3-8ada-7b3be64d5521' // CRM user
      };

      const { data: newLead, error } = await supabaseClient
        .from('leads')
        .insert(leadData)
        .select()
        .single();

      if (error) throw error;

      if (registrationData.activityData) {
        await updateUserActivity(supabaseClient, newLead.id, registrationData.activityData);
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Lead created successfully',
        lead_id: newLead.id,
        action: 'created',
        auth_user_id: authUserId
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }
  } catch (error) {
    console.error('Error syncing registration:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }
});

async function updateUserActivity(supabaseClient, leadId, activityData) {
  try {
    const activityRecord = {
      user_id: leadId,
      login_count: activityData.login_count || 0,
      subscription_days_left: activityData.subscription_days_left,
      daily_time_spent: activityData.daily_time_spent || 0,
      total_time_spent: activityData.total_time_spent || 0,
      last_active: activityData.last_active || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await supabaseClient.from('user_activities').upsert(activityRecord, {
      onConflict: 'user_id'
    });

    console.log('Activity data updated for lead:', leadId);
  } catch (error) {
    console.error('Error updating activity data:', error);
  }
}
