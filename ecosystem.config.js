module.exports = {
  apps: [
    {
      name: 'realtime-activity-sync',
      script: 'realtime-activity-sync.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        MONGODB_URI: 'mongodb+srv://rapidsteno:uXsGv3N8zO1mMBFi@rapidsteno.9l3v7.mongodb.net/rapidSteno?retryWrites=true&w=majority',
        SUPABASE_URL: 'https://jukvyicluadgsbruyqyr.supabase.co',
        SUPABASE_SERVICE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1a3Z5aWNsdWFkZ3NicnV5cXlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ2OTc4NCwiZXhwIjoyMDY4MDQ1Nzg0fQ.jx0sbQheJvaEYQpjlkRDibpvzZ5GXJWe89AKmh3SGJY'
      },
      error_file: './logs/realtime-sync-error.log',
      out_file: './logs/realtime-sync-out.log',
      log_file: './logs/realtime-sync-combined.log',
      time: true
    },
    {
      name: 'batch-activity-sync',
      script: 'batch-activity-sync.js',
      instances: 1,
      autorestart: false,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        MONGODB_URI: 'mongodb+srv://rapidsteno:uXsGv3N8zO1mMBFi@rapidsteno.9l3v7.mongodb.net/rapidSteno?retryWrites=true&w=majority',
        SUPABASE_URL: 'https://jukvyicluadgsbruyqyr.supabase.co',
        SUPABASE_SERVICE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1a3Z5aWNsdWFkZ3NicnV5cXlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ2OTc4NCwiZXhwIjoyMDY4MDQ1Nzg0fQ.jx0sbQheJvaEYQpjlkRDibpvzZ5GXJWe89AKmh3SGJY'
      },
      error_file: './logs/batch-sync-error.log',
      out_file: './logs/batch-sync-out.log',
      log_file: './logs/batch-sync-combined.log',
      time: true
    }
  ]
}; 