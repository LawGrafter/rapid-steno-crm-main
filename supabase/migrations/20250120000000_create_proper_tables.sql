-- Create proper tables based on MongoDB structure
-- This migration creates a clean, structured database schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE (Main user data)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mongo_id VARCHAR(255) UNIQUE, -- Store original MongoDB _id for reference
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255), -- Store hashed password
    gender VARCHAR(20),
    subscription_plan VARCHAR(50) DEFAULT 'Trial',
    exam_category VARCHAR(100),
    is_repeat_user BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    last_active_date TIMESTAMP WITH TIME ZONE,
    state VARCHAR(100),
    is_email_verified BOOLEAN DEFAULT false,
    login_count INTEGER DEFAULT 0,
    has_seen_growth_tour BOOLEAN DEFAULT false,
    has_seen_comparison_tour BOOLEAN DEFAULT false,
    terms_accepted BOOLEAN DEFAULT false,
    referral_code VARCHAR(50),
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. SUBSCRIPTION_HISTORY TABLE
CREATE TABLE subscription_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    mongo_id VARCHAR(255), -- Store original MongoDB _id
    type VARCHAR(50) NOT NULL, -- 'Trial', 'Paid', 'Unpaid'
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. USER_ACTIVITIES TABLE (Activity logs)
CREATE TABLE user_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL,
    total_active_time INTEGER DEFAULT 0, -- in seconds
    total_pages_viewed INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ACTIVITY_PAGES TABLE (Individual page activities)
CREATE TABLE activity_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_activity_id UUID REFERENCES user_activities(id) ON DELETE CASCADE,
    page_name VARCHAR(100) NOT NULL,
    time_spent INTEGER DEFAULT 0, -- in seconds
    view_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. PAGE_VIEW_STATS TABLE
CREATE TABLE page_view_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    mongo_id VARCHAR(255), -- Store original MongoDB _id
    page_name VARCHAR(100) NOT NULL,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. NOTIFICATIONS TABLE (for seenNotificationIds)
CREATE TABLE user_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    notification_id VARCHAR(255) NOT NULL,
    seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, notification_id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_mongo_id ON users(mongo_id);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_subscription_history_user_id ON subscription_history(user_id);
CREATE INDEX idx_subscription_history_dates ON subscription_history(start_date, end_date);
CREATE INDEX idx_user_activities_user_date ON user_activities(user_id, activity_date);
CREATE INDEX idx_activity_pages_activity_id ON activity_pages(user_activity_id);
CREATE INDEX idx_page_view_stats_user_id ON page_view_stats(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to users table
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_view_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for open access (for now)
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on subscription_history" ON subscription_history FOR ALL USING (true);
CREATE POLICY "Allow all operations on user_activities" ON user_activities FOR ALL USING (true);
CREATE POLICY "Allow all operations on activity_pages" ON activity_pages FOR ALL USING (true);
CREATE POLICY "Allow all operations on page_view_stats" ON page_view_stats FOR ALL USING (true);
CREATE POLICY "Allow all operations on user_notifications" ON user_notifications FOR ALL USING (true);

-- Create helper functions for data migration
CREATE OR REPLACE FUNCTION calculate_trial_status(
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE
) RETURNS TEXT AS $$
BEGIN
    IF NOW() > end_date THEN
        RETURN 'Expired';
    ELSIF NOW() BETWEEN start_date AND end_date THEN
        RETURN 'Active';
    ELSE
        RETURN 'Pending';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create view for user summary
CREATE VIEW user_summary AS
SELECT 
    u.id,
    u.mongo_id,
    u.first_name,
    u.last_name,
    u.email,
    u.phone,
    u.subscription_plan,
    u.exam_category,
    u.is_active,
    u.last_active_date,
    u.login_count,
    u.created_at,
    -- Current subscription info
    sh.type as current_subscription_type,
    sh.start_date as current_subscription_start,
    sh.end_date as current_subscription_end,
    calculate_trial_status(sh.start_date, sh.end_date) as trial_status,
    -- Activity summary
    COALESCE(ua.total_activities, 0) as total_activities,
    COALESCE(ua.total_time_spent, 0) as total_time_spent
FROM users u
LEFT JOIN LATERAL (
    SELECT 
        user_id,
        type,
        start_date,
        end_date
    FROM subscription_history 
    WHERE user_id = u.id 
    AND is_active = true
    ORDER BY start_date DESC 
    LIMIT 1
) sh ON true
LEFT JOIN LATERAL (
    SELECT 
        user_id,
        COUNT(*) as total_activities,
        SUM(total_active_time) as total_time_spent
    FROM user_activities 
    WHERE user_id = u.id
    GROUP BY user_id
) ua ON true;

-- Insert sample data for testing (optional)
-- INSERT INTO users (first_name, last_name, email, subscription_plan, exam_category) 
-- VALUES ('Test', 'User', 'test@example.com', 'Trial', 'Court Exams'); 