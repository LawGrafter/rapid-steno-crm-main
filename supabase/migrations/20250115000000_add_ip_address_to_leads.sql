-- Add IP address column to leads table
ALTER TABLE leads ADD COLUMN ip_address TEXT;
 
-- Add comment to document the new column
COMMENT ON COLUMN leads.ip_address IS 'IP address of the lead when they registered or were added'; 