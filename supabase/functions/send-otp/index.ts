import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendOTPRequest {
  email: string;
}

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const handler = async (req: Request): Promise<Response> => {
  console.log('=== Send OTP function called ===');
  console.log('Method:', req.method);
  console.log('Headers:', Object.fromEntries(req.headers.entries()));

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
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    console.log('Environment check:');
    console.log('RESEND_API_KEY exists:', !!resendApiKey);
    console.log('SUPABASE_URL exists:', !!supabaseUrl);
    console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!supabaseKey);

    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase environment variables not configured');
    }

    // Initialize Resend
    const resend = new Resend(resendApiKey);
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const body = await req.text();
    console.log('Request body:', body);
    
    let requestData: SendOTPRequest;
    try {
      requestData = JSON.parse(body);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Invalid JSON in request body');
    }

    const { email } = requestData;
    console.log('Processing OTP request for email:', email);

    if (!email) {
      throw new Error('Email is required');
    }

    // Generate OTP
    const otpCode = generateOTP();
    console.log('Generated OTP:', otpCode);

    // Clean up old OTPs for this email
    console.log('Cleaning up old OTPs for email:', email);
    const { error: deleteError } = await supabase
      .from('admin_otp')
      .delete()
      .eq('email', email);

    if (deleteError) {
      console.error('Error cleaning up old OTPs:', deleteError);
      // Don't throw here, just log
    }

    // Store OTP in database
    console.log('Storing new OTP in database');
    const { error: dbError } = await supabase
      .from('admin_otp')
      .insert({
        email: email,
        otp_code: otpCode,
      });

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Failed to store OTP: ${dbError.message}`);
    }

    console.log('OTP stored successfully, sending email...');

    // Send OTP email
    const emailResponse = await resend.emails.send({
      from: "Rapid Steno CRM <admin@rapidsteno.com>",
      to: ["info@rapidsteno.com"],
      subject: "🔐 Admin Login OTP - Rapid Steno CRM",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Admin Login OTP</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #002E2C, #004D4A); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .otp-box { background: #fff; border: 2px solid #002E2C; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #002E2C; letter-spacing: 8px; margin: 10px 0; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🛡️ Admin Login Verification</h1>
              <p>Rapid Steno CRM - Internal System Access</p>
            </div>
            <div class="content">
              <h2>Admin Login Request</h2>
              <p>Hello Administrator,</p>
              <p>A login attempt has been made to access the Rapid Steno CRM internal system for email: <strong>${email}</strong></p>
              
              <div class="otp-box">
                <h3>Your One-Time Password (OTP)</h3>
                <div class="otp-code">${otpCode}</div>
                <p><small>Valid for 10 minutes</small></p>
              </div>

              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <ul>
                  <li>This OTP is valid for 10 minutes only</li>
                  <li>Do not share this code with anyone</li>
                  <li>If you didn't attempt to login, please ignore this email</li>
                  <li>This is an internal system access attempt</li>
                </ul>
              </div>

              <p><strong>Login Details:</strong></p>
              <ul>
                <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
                <li><strong>System:</strong> Rapid Steno CRM Admin Portal</li>
                <li><strong>Email:</strong> ${email}</li>
              </ul>

              <p>Enter this OTP in the admin login form to complete your authentication.</p>
              
              <div class="footer">
                <p>© 2024 Rapid Steno. Internal CRM System.</p>
                <p><small>This is an automated message. Please do not reply to this email.</small></p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email send result:", emailResponse);

    if (emailResponse.error) {
      console.error("Resend error:", emailResponse.error);
      throw new Error(`Failed to send email: ${emailResponse.error.message}`);
    }

    console.log("Email sent successfully with ID:", emailResponse.data?.id);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'OTP sent successfully',
      emailId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("=== Error in send-otp function ===");
    console.error("Error type:", typeof error);
    console.error("Error message:", error?.message);
    console.error("Error stack:", error?.stack);
    console.error("Full error:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error?.message || 'Failed to send OTP' 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);