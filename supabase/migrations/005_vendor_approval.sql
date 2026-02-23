-- ============================================================================
-- EventSwap - Vendor Approval System
-- Allows vendors/suppliers to approve reservation transfers online
-- ============================================================================

-- Vendor Approvals table
CREATE TABLE vendor_approvals (
  id SERIAL PRIMARY KEY,
  transaction_id INT NOT NULL REFERENCES transactions(id),
  listing_id INT NOT NULL REFERENCES listings(id),
  vendor_name TEXT NOT NULL,
  vendor_email TEXT NOT NULL,
  vendor_phone TEXT,
  approval_token TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  approved_at TIMESTAMPTZ,
  rejected_reason TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

-- Indexes
CREATE INDEX idx_vendor_approvals_token ON vendor_approvals(approval_token);
CREATE INDEX idx_vendor_approvals_transaction ON vendor_approvals(transaction_id);
CREATE INDEX idx_vendor_approvals_status ON vendor_approvals(status);

-- Row Level Security
ALTER TABLE vendor_approvals ENABLE ROW LEVEL SECURITY;

-- Transaction participants can read vendor approvals
CREATE POLICY "Transaction participants read" ON vendor_approvals FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM transactions t
    WHERE t.id = transaction_id
    AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())
  )
);

-- Transaction seller can create vendor approval requests
CREATE POLICY "Seller can create approval request" ON vendor_approvals FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM transactions t
    WHERE t.id = transaction_id
    AND t.seller_id = auth.uid()
  )
);

-- Service role can update (for public token-based approval endpoint)
-- Updates via token-based endpoint use the admin/service role client
