-- Fix subscription_plan constraint to allow all possible values
-- Drop the existing constraint
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS check_subscription_plan;

-- Add a new constraint that allows all the values we need
ALTER TABLE public.leads 
ADD CONSTRAINT check_subscription_plan 
CHECK (subscription_plan IN ('Trial', 'Paid', 'Unpaid', 'Trial User', 'Enterprise'));

-- Update any existing leads that might have invalid values
UPDATE public.leads 
SET subscription_plan = 'Trial' 
WHERE subscription_plan NOT IN ('Trial', 'Paid', 'Unpaid', 'Trial User', 'Enterprise') 
   OR subscription_plan IS NULL;

-- Also fix the plan field to be consistent
UPDATE public.leads 
SET plan = 'Trial' 
WHERE plan = 'Trial User' OR plan IS NULL;

-- Show the current distribution of subscription plans
SELECT subscription_plan, COUNT(*) as count 
FROM public.leads 
GROUP BY subscription_plan 
ORDER BY subscription_plan; 