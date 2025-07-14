-- Add tags column to leads table if it doesn't exist
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Create index for tags array for better performance
CREATE INDEX IF NOT EXISTS idx_leads_tags ON public.leads USING GIN(tags);