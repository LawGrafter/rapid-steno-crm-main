-- Add created_by column to leads table
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS created_by UUID;

-- Create index for faster querying (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_leads_created_by ON public.leads(created_by);

-- Update existing leads to have a default created_by value
UPDATE public.leads 
SET created_by = user_id 
WHERE created_by IS NULL; 