import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LeadData {
  name: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  company?: string;
  state?: string;
  gender?: string;
  exam_category?: string;
  how_did_you_hear?: string;
  source?: string;
  status?: string;
  plan?: string;
  referral_code?: string;
  user_type?: string;
  notes?: string;
  value?: number;
  trial_start_date?: string;
  trial_end_date?: string;
  subscription_plan?: string;
  subscription_start_date?: string;
  subscription_end_date?: string;
  amount_paid?: number;
  next_payment_date?: string;
  is_trial_active?: boolean;
  is_subscription_active?: boolean;
  tags?: string[];
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

    const { leads, userId } = await req.json()

    if (!userId) {
      throw new Error('User ID is required')
    }

    if (!leads || !Array.isArray(leads) || leads.length === 0) {
      throw new Error('Leads data is required and must be an array')
    }

    // Transform and validate leads data
    const transformedLeads: LeadData[] = leads.map((lead: any) => ({
      name: lead.name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim(),
      first_name: lead.first_name,
      last_name: lead.last_name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company || lead.state,
      state: lead.state,
      gender: lead.gender,
      exam_category: lead.exam_category,
      how_did_you_hear: lead.how_did_you_hear,
      source: lead.source || lead.how_did_you_hear,
      status: lead.status || 'New',
      plan: lead.plan,
      referral_code: lead.referral_code,
      user_type: lead.user_type || (lead.is_subscription_active ? 'Paid User' : 'Trial User'),
      notes: lead.notes,
      value: lead.value,
      trial_start_date: lead.trial_start_date || new Date().toISOString(),
      trial_end_date: lead.trial_end_date || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      subscription_plan: lead.subscription_plan,
      subscription_start_date: lead.subscription_start_date,
      subscription_end_date: lead.subscription_end_date,
      amount_paid: lead.amount_paid || 0,
      next_payment_date: lead.next_payment_date,
      is_trial_active: lead.is_trial_active !== undefined ? lead.is_trial_active : true,
      is_subscription_active: lead.is_subscription_active || false,
      tags: lead.tags
    }))

    // Insert leads in batches to avoid hitting limits
    const batchSize = 100
    const results = []
    const errors = []

    for (let i = 0; i < transformedLeads.length; i += batchSize) {
      const batch = transformedLeads.slice(i, i + batchSize)
      
      try {
        const { data, error } = await supabaseClient
          .from('leads')
          .insert(batch.map(lead => ({ ...lead, user_id: userId })))
          .select()

        if (error) {
          errors.push({
            batch: Math.floor(i / batchSize) + 1,
            error: error.message,
            leads: batch.length
          })
        } else if (data) {
          results.push(...data)
        }
      } catch (error) {
        errors.push({
          batch: Math.floor(i / batchSize) + 1,
          error: error.message,
          leads: batch.length
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: errors.length === 0,
        imported: results.length,
        total: transformedLeads.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: errors.length === 0 ? 200 : 207 // 207 Multi-Status for partial success
      }
    )

  } catch (error) {
    console.error('Bulk import error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
}) 