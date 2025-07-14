import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyOTPRequest {
  email: string;
  otp: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('=== Verify OTP function called ===');
  console.log('Method:', req.method);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log('Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    console.log('Method not allowed:', req.method);
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  try {
    // Check environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    console.log('Environment check:');
    console.log('SUPABASE_URL exists:', !!supabaseUrl);
    console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!supabaseKey);

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase environment variables not configured');
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const body = await req.text();
    console.log('Request body:', body);
    
    let requestData: VerifyOTPRequest;
    try {
      requestData = JSON.parse(body);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Invalid JSON in request body');
    }

    const { email, otp } = requestData;
    console.log('Verifying OTP for email:', email, 'OTP:', otp);

    if (!email || !otp) {
      throw new Error('Email and OTP are required');
    }

    // Check if OTP exists and is valid
    console.log('Checking OTP in database...');
    const { data: otpRecord, error: fetchError } = await supabase
      .from('admin_otp')
      .select('*')
      .eq('email', email)
      .eq('otp_code', otp)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    console.log('OTP query result:', { otpRecord, fetchError });

    if (fetchError || !otpRecord) {
      console.log('Invalid or expired OTP');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid or expired OTP' 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Mark OTP as used
    console.log('Marking OTP as used...');
    const { error: updateError } = await supabase
      .from('admin_otp')
      .update({ used: true })
      .eq('id', otpRecord.id);

    if (updateError) {
      console.error('Error marking OTP as used:', updateError);
      throw new Error('Failed to verify OTP');
    }

    console.log('OTP verified successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'OTP verified successfully' 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("=== Error in verify-otp function ===");
    console.error("Error type:", typeof error);
    console.error("Error message:", error?.message);
    console.error("Error stack:", error?.stack);
    console.error("Full error:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error?.message || 'Failed to verify OTP' 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);