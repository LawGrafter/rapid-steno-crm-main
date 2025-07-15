-- Update existing status values to new Active/Inactive values
UPDATE leads 
SET status = CASE 
    WHEN status IN ('New', 'Contacted', 'Qualified') THEN 'Active'
    WHEN status = 'Lost' THEN 'Inactive'
    ELSE 'Active'
END;

-- Update the status column constraint to only allow 'Active' and 'Inactive'
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE leads ADD CONSTRAINT leads_status_check CHECK (status IN ('Active', 'Inactive'));

-- Update the default value for the status column
ALTER TABLE leads ALTER COLUMN status SET DEFAULT 'Active'; 