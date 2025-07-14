-- Add tags field to leads table
ALTER TABLE public.leads 
ADD COLUMN tags TEXT[];

-- Add an index for better performance on tags queries
CREATE INDEX idx_leads_tags ON public.leads USING GIN(tags);