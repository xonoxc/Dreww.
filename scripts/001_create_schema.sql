-- Golf Charity Subscription Platform - Database Schema
-- This schema supports the core functionality of the platform

-- 1. Profiles table (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  handicap DECIMAL(4,1),
  preferred_charity_id UUID,
  subscription_tier TEXT CHECK (subscription_tier IN ('free', 'premium', 'elite')),
  subscription_status TEXT CHECK (subscription_status IN ('active', 'paused', 'cancelled')),
  subscription_start_date TIMESTAMP,
  subscription_end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_admin BOOLEAN DEFAULT FALSE
);

-- 2. Golf Scores table
CREATE TABLE IF NOT EXISTS golf_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stableford_score INTEGER NOT NULL CHECK (stableford_score >= 0 AND stableford_score <= 45),
  course_name TEXT NOT NULL,
  course_par INTEGER CHECK (course_par > 0),
  score_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Rolling scores view (last 5 scores for each user)
CREATE VIEW rolling_scores AS
SELECT 
  user_id,
  ARRAY_AGG(stableford_score ORDER BY score_date DESC) FILTER (WHERE true) as last_five_scores,
  AVG(stableford_score) as avg_last_five,
  MAX(score_date) as latest_score_date
FROM golf_scores
GROUP BY user_id;

-- 4. Charities table
CREATE TABLE IF NOT EXISTS charities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  category TEXT,
  mission TEXT,
  total_contributed DECIMAL(12,2) DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Draws table (monthly competitions)
CREATE TABLE IF NOT EXISTS draws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  draw_type TEXT NOT NULL CHECK (draw_type IN ('random', 'algorithmic')), -- algorithmic favors higher scores
  status TEXT CHECK (status IN ('open', 'closed', 'completed')),
  prize_pool DECIMAL(12,2),
  first_place_pct DECIMAL(3,2) DEFAULT 0.40, -- 40%
  second_place_pct DECIMAL(3,2) DEFAULT 0.35, -- 35%
  third_place_pct DECIMAL(3,2) DEFAULT 0.25, -- 25%
  eligible_users_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  closed_at TIMESTAMP,
  completed_at TIMESTAMP,
  UNIQUE(month, year)
);

-- 6. Draw Results table (winners)
CREATE TABLE IF NOT EXISTS draw_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  position INTEGER NOT NULL CHECK (position IN (1, 2, 3)),
  prize_amount DECIMAL(12,2),
  score_used DECIMAL(4,1),
  status TEXT CHECK (status IN ('pending_verification', 'verified', 'claimed', 'cancelled')),
  verification_note TEXT,
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMP,
  claimed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'premium', 'elite')),
  status TEXT CHECK (status IN ('active', 'paused', 'cancelled', 'trialing')),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 8. Charity Contributions table (tracks where charity % goes)
CREATE TABLE IF NOT EXISTS charity_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  charity_id UUID NOT NULL REFERENCES charities(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  source TEXT CHECK (source IN ('prize_winnings', 'subscription_fee', 'manual_donation')),
  draw_result_id UUID REFERENCES draw_results(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 9. Admin Logs table (audit trail)
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 10. Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('draw_winner', 'draw_closed', 'verification_needed', 'system')),
  title TEXT NOT NULL,
  message TEXT,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_golf_scores_user_id ON golf_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_golf_scores_score_date ON golf_scores(score_date);
CREATE INDEX IF NOT EXISTS idx_draw_results_draw_id ON draw_results(draw_id);
CREATE INDEX IF NOT EXISTS idx_draw_results_user_id ON draw_results(user_id);
CREATE INDEX IF NOT EXISTS idx_draw_results_status ON draw_results(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_charity_contributions_charity_id ON charity_contributions(charity_id);
CREATE INDEX IF NOT EXISTS idx_charity_contributions_user_id ON charity_contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Enable RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE golf_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE charity_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public can view non-sensitive profile info" ON profiles
  FOR SELECT USING (true);

-- RLS Policies for golf_scores
CREATE POLICY "Users can view their own scores" ON golf_scores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scores" ON golf_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scores" ON golf_scores
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all scores" ON golf_scores
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

-- RLS Policies for charities
CREATE POLICY "Public can view charities" ON charities
  FOR SELECT USING (true);

-- RLS Policies for draws
CREATE POLICY "Public can view draws" ON draws
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert draws" ON draws
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

-- RLS Policies for draw_results
CREATE POLICY "Users can view their own draw results" ON draw_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Public can view verified results" ON draw_results
  FOR SELECT USING (status != 'pending_verification');

CREATE POLICY "Admins can manage draw results" ON draw_results
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for charity_contributions
CREATE POLICY "Users can view contributions to their charities" ON charity_contributions
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for admin_logs
CREATE POLICY "Admins can view admin logs" ON admin_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

CREATE POLICY "Admins can insert admin logs" ON admin_logs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );
