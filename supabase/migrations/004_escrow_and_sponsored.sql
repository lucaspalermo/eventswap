-- ============================================================================
-- Migration 004: Escrow Timeout, Sponsored Listings & Seller Plans
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Escrow configuration columns on transactions
-- ---------------------------------------------------------------------------
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS escrow_release_date TIMESTAMPTZ;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS auto_release BOOLEAN DEFAULT FALSE;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS buyer_confirmed_at TIMESTAMPTZ;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS seller_transferred_at TIMESTAMPTZ;

-- ---------------------------------------------------------------------------
-- 2. Sponsored listings columns
-- ---------------------------------------------------------------------------
ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_sponsored BOOLEAN DEFAULT FALSE;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS sponsored_until TIMESTAMPTZ;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS sponsored_plan TEXT CHECK (sponsored_plan IN ('weekly', 'monthly'));
ALTER TABLE listings ADD COLUMN IF NOT EXISTS highlight_color TEXT;

-- ---------------------------------------------------------------------------
-- 3. Sponsored payments tracking
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sponsored_payments (
  id SERIAL PRIMARY KEY,
  listing_id INT NOT NULL REFERENCES listings(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  plan TEXT NOT NULL CHECK (plan IN ('weekly', 'monthly')),
  amount DECIMAL(12,2) NOT NULL,
  asaas_payment_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'expired', 'refunded')),
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sponsored_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own sponsored payments" ON sponsored_payments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Create sponsored payment" ON sponsored_payments
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 4. Premium seller plans
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS seller_plans (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id),
  plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'premium', 'business')),
  commission_rate DECIMAL(5,4) NOT NULL DEFAULT 0.0800,
  features JSONB DEFAULT '{}',
  asaas_subscription_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE seller_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own plans read" ON seller_plans
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Create plan" ON seller_plans
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 5. Indexes for performance
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_listings_sponsored ON listings (is_sponsored DESC, created_at DESC) WHERE status = 'ACTIVE';
CREATE INDEX IF NOT EXISTS idx_transactions_escrow ON transactions (escrow_release_date) WHERE auto_release = FALSE AND status = 'TRANSFER_PENDING';
CREATE INDEX IF NOT EXISTS idx_sponsored_payments_listing ON sponsored_payments (listing_id);
CREATE INDEX IF NOT EXISTS idx_seller_plans_user ON seller_plans (user_id, status);
