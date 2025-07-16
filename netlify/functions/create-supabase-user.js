import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import fetch from 'node-fetch';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

export async function handler(event, context) {
  // Debug: Log environment variables
  console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
  console.log('SERVICE_ROLE_KEY:', process.env.SERVICE_ROLE_KEY ? 'present' : 'missing');

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain',
      },
      body: 'ok',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Missing Supabase credentials' })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (err) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Invalid JSON' })
    };
  }

  const { email, firstName, lastName, phone } = body;
  if (!email) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Email is required' })
    };
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const fullName = `${firstName || ''} ${lastName || ''}`.trim();
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: crypto.randomBytes(16).toString('hex'),
    email_confirm: true,
    user_metadata: { full_name: fullName }
  });

  if (error) {
    console.error('Supabase createUser error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message })
    };
  }

  // --- Sync with CRM (Supabase Edge Function) ---
  let crmResponse, crmError;
  try {
    // Get the admin user ID (you need to set this in environment variables)
    const ADMIN_USER_ID = process.env.ADMIN_USER_ID;
    
    console.log('ADMIN_USER_ID:', ADMIN_USER_ID); // Debug log
    
    const crmData = {
      email,
      first_name: firstName,
      last_name: lastName,
      name: fullName,
      phone,
      source: 'Software Registration',
              status: 'Active',
      user_type: 'Trial User',
      plan: 'Trial User',
      is_trial_active: true,
      is_subscription_active: false,
      trial_start_date: new Date().toISOString(),
      trial_end_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      registration_source: 'web',
      notes: 'Lead created from software registration',
      user_id: ADMIN_USER_ID // Use admin user ID so leads appear in your CRM
    };
    
    console.log('CRM Data being sent:', JSON.stringify(crmData, null, 2)); // Debug log
    
    const crmRes = await fetch('https://jukvyicluadgsbruyqyr.functions.supabase.co/sync-registration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(crmData)
    });
    crmResponse = await crmRes.json();
    if (!crmRes.ok) {
      crmError = crmResponse;
    }
  } catch (err) {
    crmError = err.message;
  }
  // ---------------------------------------------

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({
      user: data.user,
      crm: crmError ? { error: crmError } : crmResponse
    })
  };
} 