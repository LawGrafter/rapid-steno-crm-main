-- Create table for OTP verification
CREATE TABLE public.admin_otp (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '10 minutes'),
  used BOOLEAN NOT NULL DEFAULT false
);

-- Enable RLS
ALTER TABLE public.admin_otp ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access
CREATE POLICY "Allow admin OTP operations" 
ON public.admin_otp 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create index for performance
CREATE INDEX idx_admin_otp_email_code ON public.admin_otp(email, otp_code);
CREATE INDEX idx_admin_otp_expires_at ON public.admin_otp(expires_at);

-- Function to clean up expired OTPs
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.admin_otp 
  WHERE expires_at < now() OR used = true;
END;
$$;