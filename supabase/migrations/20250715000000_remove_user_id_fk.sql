-- Remove foreign key constraint on user_id in leads table
-- This allows us to sync leads from MongoDB without requiring valid auth users

-- Drop the foreign key constraint
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_user_id_fkey;
 
-- Add a comment to document the change
COMMENT ON COLUMN public.leads.user_id IS 'User ID - can be any UUID, not necessarily from auth.users'; 