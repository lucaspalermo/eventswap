-- ============================================================================
-- EventSwap - KYC (Know Your Customer) System
-- Identity verification for sellers
-- ============================================================================

CREATE TABLE kyc_documents (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id),
  document_type TEXT NOT NULL CHECK (document_type IN ('RG', 'CNH', 'PASSPORT')),
  document_front_url TEXT NOT NULL,
  document_back_url TEXT,
  selfie_url TEXT NOT NULL,
  cpf TEXT NOT NULL,
  full_name TEXT NOT NULL,
  birth_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'resubmit')),
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kyc_user ON kyc_documents(user_id);
CREATE INDEX idx_kyc_status ON kyc_documents(status);

ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own KYC read" ON kyc_documents FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Own KYC insert" ON kyc_documents FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE TRIGGER set_kyc_updated_at BEFORE UPDATE ON kyc_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Add verification_level to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_level TEXT DEFAULT 'none' CHECK (verification_level IN ('none', 'email', 'document', 'full'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS max_transaction_amount DECIMAL(12,2) DEFAULT 5000.00;
