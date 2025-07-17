# Supabase Edge Function Environment Setup

## Step 1: Set Environment Variables in Supabase Dashboard

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/jukvyicluadgsbruyqyr
2. Click on **"Settings"** in the left sidebar
3. Click on **"Edge Functions"**
4. Add these environment variables:

### Required Environment Variables:

```
MONGODB_URI=mongodb+srv://rapidsteno:uXsGv3N8zO1mMBFi@rapidsteno.9l3v7.mongodb.net/rapidSteno?retryWrites=true&w=majority
SUPABASE_URL=https://jukvyicluadgsbruyqyr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1a3Z5aWNsdWFkZ3NicnV5cXlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ2OTc4NCwiZXhwIjoyMDY4MDQ1Nzg0fQ.jx0sbQheJvaEYQpjlkRDibpvzZ5GXJWe89AKmh3SGJY
```

## Step 2: Deploy the Edge Function

Run these commands in your terminal:

```bash
# Navigate to your project directory
cd "C:\Users\khana\Downloads\Rapid Steno CRM\Main"

# Deploy the edge function
supabase functions deploy sync-activities
```

## Step 3: Test the Function

Once deployed, test it with:

```bash
curl -X POST https://jukvyicluadgsbruyqyr.supabase.co/functions/v1/sync-activities \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

## Step 4: Set Up Cron Job (Free)

Use a free service like cron-job.org to trigger the sync every 5 minutes:

1. Go to https://cron-job.org
2. Create a free account
3. Add a new cron job:
   - **URL**: `https://jukvyicluadgsbruyqyr.supabase.co/functions/v1/sync-activities`
   - **Schedule**: Every 5 minutes
   - **Method**: POST

## Benefits of This Approach:

✅ **Completely Free** - No monthly costs
✅ **Reliable** - Supabase Edge Functions are very stable
✅ **Automatic** - Runs every 5 minutes without manual intervention
✅ **Scalable** - Can handle your current and future data volume
✅ **Secure** - Environment variables are encrypted

## Alternative: Manual Trigger

You can also trigger the sync manually by calling the function URL whenever needed. 