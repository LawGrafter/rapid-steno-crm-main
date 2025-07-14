-- Add trial and subscription fields to leads table
ALTER TABLE public.leads 
ADD COLUMN trial_start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN trial_end_date TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '15 days'),
ADD COLUMN subscription_plan TEXT DEFAULT 'Trial User',
ADD COLUMN subscription_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN subscription_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN amount_paid NUMERIC DEFAULT 0,
ADD COLUMN next_payment_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN is_trial_active BOOLEAN DEFAULT true,
ADD COLUMN is_subscription_active BOOLEAN DEFAULT false;