# Trial Management System Setup

This document explains how to set up the automatic trial management system for your CRM.

## Overview

The trial management system automatically:
1. **Calculates trial end dates** as 15 days from trial start date
2. **Updates expired trials** automatically by changing subscription plan to "Unpaid" and status to "Inactive"
3. **Provides real-time status updates** in the frontend

## Database Migration

### Step 1: Run the Migration

Go to your Supabase Dashboard → SQL Editor and run the following migration:

```sql
-- Trial Management System Migration
-- This migration implements automatic trial end date calculation and status updates

-- Function to calculate trial end date (15 days from trial start date)
CREATE OR REPLACE FUNCTION public.calculate_trial_end_date(trial_start_date TIMESTAMP WITH TIME ZONE)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
BEGIN
  RETURN trial_start_date + INTERVAL '15 days';
END;
$$ LANGUAGE plpgsql;

-- Function to check and update expired trials
CREATE OR REPLACE FUNCTION public.check_and_update_expired_trials()
RETURNS void AS $$
BEGIN
  -- Update leads where trial has expired and subscription is still "Trial"
  UPDATE public.leads 
  SET 
    subscription_plan = 'Unpaid',
    status = 'Inactive',
    is_trial_active = false,
    updated_at = now()
  WHERE 
    trial_end_date < now() 
    AND subscription_plan = 'Trial'
    AND status = 'Active';
END;
$$ LANGUAGE plpgsql;

-- Function to automatically set trial end date when trial start date is set
CREATE OR REPLACE FUNCTION public.set_trial_end_date()
RETURNS TRIGGER AS $$
BEGIN
  -- If trial_start_date is set and trial_end_date is not set or is different from calculated
  IF NEW.trial_start_date IS NOT NULL THEN
    NEW.trial_end_date = public.calculate_trial_end_date(NEW.trial_start_date);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically update subscription status when trial expires
CREATE OR REPLACE FUNCTION public.update_expired_trial_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If trial has expired and subscription is still "Trial", update to "Unpaid" and status to "Inactive"
  IF NEW.trial_end_date < now() AND NEW.subscription_plan = 'Trial' AND NEW.status = 'Active' THEN
    NEW.subscription_plan = 'Unpaid';
    NEW.status = 'Inactive';
    NEW.is_trial_active = false;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set trial end date when trial start date is inserted/updated
CREATE TRIGGER trigger_set_trial_end_date
  BEFORE INSERT OR UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.set_trial_end_date();

-- Create trigger to automatically update expired trial status
CREATE TRIGGER trigger_update_expired_trial_status
  BEFORE INSERT OR UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_expired_trial_status();

-- Create a scheduled function to run daily and check for expired trials
-- This will be called by a cron job or external scheduler
CREATE OR REPLACE FUNCTION public.daily_trial_status_check()
RETURNS void AS $$
BEGIN
  -- Call the function to check and update expired trials
  PERFORM public.check_and_update_expired_trials();
END;
$$ LANGUAGE plpgsql;

-- Add constraint to ensure subscription_plan values are valid
ALTER TABLE public.leads 
ADD CONSTRAINT check_subscription_plan 
CHECK (subscription_plan IN ('Trial', 'Paid', 'Unpaid'));

-- Add constraint to ensure status values are valid
ALTER TABLE public.leads 
ADD CONSTRAINT check_status 
CHECK (status IN ('Active', 'Inactive'));

-- Create index for better performance on trial date queries
CREATE INDEX IF NOT EXISTS idx_leads_trial_dates ON public.leads(trial_start_date, trial_end_date);
CREATE INDEX IF NOT EXISTS idx_leads_subscription_status ON public.leads(subscription_plan, status);

-- Update existing leads to have proper trial end dates if they don't have them
UPDATE public.leads 
SET trial_end_date = public.calculate_trial_end_date(trial_start_date)
WHERE trial_start_date IS NOT NULL AND trial_end_date IS NULL;

-- Update existing leads that have expired trials
UPDATE public.leads 
SET 
  subscription_plan = 'Unpaid',
  status = 'Inactive',
  is_trial_active = false
WHERE 
  trial_end_date < now() 
  AND subscription_plan = 'Trial'
  AND status = 'Active';
```

### Step 2: Deploy the Edge Function

Deploy the trial status check function:

```bash
supabase functions deploy check-trial-status
```

## Frontend Features

### Automatic Trial End Date Calculation
- When you set a trial start date, the trial end date is automatically calculated as 15 days later
- The trial end date field becomes read-only and shows "Auto-calculated"
- A helpful message explains the calculation

### Subscription Plan Management
- Subscription plan dropdown now has three options: "Trial", "Paid", "Unpaid"
- Selecting a plan automatically updates related fields:
  - **Trial**: Sets trial active, subscription inactive, status active
  - **Paid**: Sets trial inactive, subscription active, status active  
  - **Unpaid**: Sets trial inactive, subscription inactive, status inactive

### CSV Import Enhancements
- Trial end dates are automatically calculated during CSV import
- Subscription plans are automatically mapped to correct status flags
- Updated CSV template with new subscription plan values

## Manual Trial Status Check

You can manually check and update expired trials by calling the database function:

```sql
SELECT public.daily_trial_status_check();
```

## Setting Up Automated Checks

### Option 1: Supabase Cron Jobs (Recommended)
Set up a cron job in Supabase to run daily:

```sql
-- Create a cron job to run daily at 2 AM
SELECT cron.schedule(
  'check-expired-trials',
  '0 2 * * *',
  'SELECT public.daily_trial_status_check();'
);
```

### Option 2: External Scheduler
Use an external service like cron-job.org to call your Edge Function daily:

```
https://your-project.supabase.co/functions/v1/check-trial-status
```

## Testing the System

1. **Create a new lead** with trial start date and verify trial end date is calculated
2. **Import leads via CSV** and verify automatic calculations
3. **Manually check expired trials** by running the database function
4. **Verify status updates** for expired trials

## Troubleshooting

### Common Issues

1. **Triggers not working**: Ensure the migration ran successfully
2. **Edge function errors**: Check Supabase logs for function errors
3. **Date calculation issues**: Verify timezone settings in your database

### Useful Queries

Check current trial status:
```sql
SELECT 
  name, 
  email, 
  trial_start_date, 
  trial_end_date, 
  subscription_plan, 
  status,
  is_trial_active
FROM public.leads 
WHERE subscription_plan = 'Trial'
ORDER BY trial_end_date;
```

Check expired trials:
```sql
SELECT 
  name, 
  email, 
  trial_end_date, 
  subscription_plan, 
  status
FROM public.leads 
WHERE trial_end_date < now() 
  AND subscription_plan = 'Trial'
  AND status = 'Active';
```

## Support

If you encounter any issues, check:
1. Supabase Dashboard → Logs for error messages
2. Database → Functions to ensure all functions are created
3. Database → Triggers to ensure triggers are active 