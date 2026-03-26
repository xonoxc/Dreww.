-- Migration: Add draw participation
-- Run this after 001_create_schema.sql

-- 1. Create draw_participants table
CREATE TABLE IF NOT EXISTS draw_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  entered_at TIMESTAMP DEFAULT NOW(),
  status TEXT CHECK (status IN ('active', 'winner', 'cancelled')) DEFAULT 'active',
  UNIQUE(draw_id, user_id)
);

-- 3. Add winner submission fields to draw_results
ALTER TABLE draw_results ADD COLUMN IF NOT EXISTS proof_screenshot_url TEXT;
ALTER TABLE draw_results ADD COLUMN IF NOT EXISTS winner_photo_url TEXT;
ALTER TABLE draw_results ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMP;
ALTER TABLE draw_results ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 4. Create indexes for draw_participants
CREATE INDEX IF NOT EXISTS idx_draw_participants_draw_id ON draw_participants(draw_id);
CREATE INDEX IF NOT EXISTS idx_draw_participants_user_id ON draw_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_draw_participants_draw_user ON draw_participants(draw_id, user_id);

-- 5. Add RLS policy for draw_participants
ALTER TABLE draw_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own participation" ON draw_participants
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own participation" ON draw_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation" ON draw_participants
  FOR UPDATE USING (auth.uid() = user_id);

-- 6. Admins can view all participants
CREATE POLICY "Admins can view all participants" ON draw_participants
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

-- 7. Admins can manage participants
CREATE POLICY "Admins can manage participants" ON draw_participants
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );
