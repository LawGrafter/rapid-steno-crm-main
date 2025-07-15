-- Fix any existing leads that have "Free" as their plan
UPDATE public.leads 
SET plan = 'Trial User' 
WHERE plan = 'Free' OR plan IS NULL;

-- Also ensure user_type is set correctly for trial users
UPDATE public.leads 
SET user_type = 'Trial User' 
WHERE (user_type = 'Free' OR user_type IS NULL) AND is_trial_active = true;

-- Show the results
SELECT plan, user_type, COUNT(*) as count 
FROM public.leads 
GROUP BY plan, user_type 
ORDER BY plan, user_type; 