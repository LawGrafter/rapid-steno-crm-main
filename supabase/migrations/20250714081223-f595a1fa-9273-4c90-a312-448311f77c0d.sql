-- Add missing fields to leads table
ALTER TABLE public.leads 
ADD COLUMN first_name TEXT,
ADD COLUMN last_name TEXT,
ADD COLUMN state TEXT,
ADD COLUMN gender TEXT,
ADD COLUMN exam_category TEXT,
ADD COLUMN how_did_you_hear TEXT,
ADD COLUMN plan TEXT,
ADD COLUMN referral_code TEXT,
ADD COLUMN user_type TEXT DEFAULT 'Trial User';

-- Update the name field to be computed from first_name and last_name
-- We'll handle this in the application code