-- ============================================================================
-- 006: Push Notifications & i18n Support
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Push Subscriptions Table
-- Stores Web Push API subscription data per user/device
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- Index for looking up subscriptions by user
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- Enable Row Level Security
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only view their own subscriptions
CREATE POLICY "Own push subs" ON push_subscriptions
  FOR SELECT USING (user_id = auth.uid());

-- Users can create their own subscriptions
CREATE POLICY "Create push sub" ON push_subscriptions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can delete their own subscriptions
CREATE POLICY "Delete push sub" ON push_subscriptions
  FOR DELETE USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Profile columns for i18n and push preferences
-- ---------------------------------------------------------------------------

-- Language preference (default Portuguese Brazil)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'pt-BR';

-- Whether the user has push notifications enabled
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS push_enabled BOOLEAN DEFAULT FALSE;
