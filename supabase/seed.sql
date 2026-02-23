-- ============================================================================
-- EventSwap - Seed Data
-- Run this AFTER the user registers via the app or Supabase dashboard
-- ============================================================================

-- Promote l.simports@hotmail.com to SUPER_ADMIN
-- (Run this after the user has registered and their profile exists)
UPDATE profiles
SET
  role = 'SUPER_ADMIN',
  is_verified = true,
  kyc_status = 'APPROVED',
  display_name = 'Admin',
  updated_at = NOW()
WHERE email = 'l.simports@hotmail.com';

-- Seed platform config
INSERT INTO platform_config (commission_rate)
VALUES (0.0800)
ON CONFLICT (id) DO NOTHING;
