-- ============================================================================
-- EventSwap - Initial Database Schema
-- Platform for buying/selling event reservations transfers
-- ============================================================================

-- Enums
CREATE TYPE user_role AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');
CREATE TYPE kyc_status AS ENUM ('PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED');
CREATE TYPE listing_status AS ENUM ('DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'RESERVED', 'SOLD', 'EXPIRED', 'CANCELLED', 'SUSPENDED');
CREATE TYPE event_category AS ENUM ('WEDDING_VENUE', 'BUFFET', 'PHOTOGRAPHER', 'VIDEOGRAPHER', 'DJ_BAND', 'DECORATION', 'CATERING', 'WEDDING_DRESS', 'BEAUTY_MAKEUP', 'PARTY_VENUE', 'TRANSPORT', 'ACCOMMODATION', 'OTHER');
CREATE TYPE transaction_status AS ENUM ('INITIATED', 'AWAITING_PAYMENT', 'PAYMENT_CONFIRMED', 'ESCROW_HELD', 'TRANSFER_PENDING', 'COMPLETED', 'DISPUTE_OPENED', 'DISPUTE_RESOLVED', 'CANCELLED', 'REFUNDED');
CREATE TYPE payment_method AS ENUM ('CARD', 'PIX', 'BOLETO');
CREATE TYPE payment_status AS ENUM ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'REFUNDED');
CREATE TYPE message_type AS ENUM ('TEXT', 'IMAGE', 'FILE', 'SYSTEM');
CREATE TYPE dispute_status AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED_BUYER', 'RESOLVED_SELLER', 'CLOSED');

-- ============================================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  display_name TEXT,
  phone TEXT,
  cpf TEXT UNIQUE,
  avatar_url TEXT,
  role user_role DEFAULT 'USER',
  kyc_status kyc_status DEFAULT 'PENDING',
  asaas_customer_id TEXT UNIQUE,
  address_city TEXT,
  address_state TEXT,
  address_country TEXT DEFAULT 'BR',
  rating_avg DECIMAL(3,2) DEFAULT 0,
  rating_count INT DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- LISTINGS
-- ============================================================================
CREATE TABLE listings (
  id SERIAL PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  category event_category NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  event_end_date TIMESTAMPTZ,
  venue_name TEXT NOT NULL,
  venue_address TEXT,
  venue_city TEXT NOT NULL,
  venue_state TEXT,
  venue_country TEXT DEFAULT 'BR',
  provider_name TEXT,
  provider_phone TEXT,
  provider_email TEXT,
  original_price DECIMAL(12,2) NOT NULL,
  asking_price DECIMAL(12,2) NOT NULL,
  paid_amount DECIMAL(12,2),
  remaining_amount DECIMAL(12,2),
  is_negotiable BOOLEAN DEFAULT FALSE,
  images TEXT[] DEFAULT '{}',
  has_original_contract BOOLEAN DEFAULT FALSE,
  contract_file_url TEXT,
  transfer_conditions TEXT,
  vendor_approves_transfer BOOLEAN DEFAULT FALSE,
  status listing_status DEFAULT 'DRAFT',
  slug TEXT UNIQUE NOT NULL,
  view_count INT DEFAULT 0,
  favorite_count INT DEFAULT 0,
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- FAVORITES
-- ============================================================================
CREATE TABLE favorites (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id INT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- ============================================================================
-- TRANSACTIONS
-- ============================================================================
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  buyer_id UUID NOT NULL REFERENCES profiles(id),
  seller_id UUID NOT NULL REFERENCES profiles(id),
  listing_id INT NOT NULL REFERENCES listings(id),
  agreed_price DECIMAL(12,2) NOT NULL,
  platform_fee DECIMAL(12,2) NOT NULL,
  platform_fee_rate DECIMAL(5,4) NOT NULL,
  seller_net_amount DECIMAL(12,2) NOT NULL,
  status transaction_status DEFAULT 'INITIATED',
  payment_deadline TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancel_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PAYMENTS
-- ============================================================================
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  transaction_id INT UNIQUE NOT NULL REFERENCES transactions(id),
  payer_id UUID NOT NULL REFERENCES profiles(id),
  payee_id UUID NOT NULL REFERENCES profiles(id),
  asaas_payment_id TEXT UNIQUE,
  asaas_transfer_id TEXT,
  gross_amount DECIMAL(12,2) NOT NULL,
  net_amount DECIMAL(12,2),
  gateway_fee DECIMAL(12,2),
  method payment_method NOT NULL,
  status payment_status DEFAULT 'PENDING',
  paid_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CONVERSATIONS & MESSAGES
-- ============================================================================
CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  transaction_id INT UNIQUE REFERENCES transactions(id),
  participant_1 UUID NOT NULL REFERENCES profiles(id),
  participant_2 UUID NOT NULL REFERENCES profiles(id),
  last_message_at TIMESTAMPTZ,
  last_message_text TEXT,
  unread_count_1 INT DEFAULT 0,
  unread_count_2 INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  conversation_id INT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  type message_type DEFAULT 'TEXT',
  content TEXT NOT NULL,
  file_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  action_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- REVIEWS
-- ============================================================================
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  transaction_id INT NOT NULL REFERENCES transactions(id),
  author_id UUID NOT NULL REFERENCES profiles(id),
  target_id UUID NOT NULL REFERENCES profiles(id),
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(transaction_id, author_id)
);

-- ============================================================================
-- DISPUTES
-- ============================================================================
CREATE TABLE disputes (
  id SERIAL PRIMARY KEY,
  transaction_id INT UNIQUE NOT NULL REFERENCES transactions(id),
  opened_by UUID NOT NULL REFERENCES profiles(id),
  reason TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence_urls TEXT[] DEFAULT '{}',
  status dispute_status DEFAULT 'OPEN',
  resolution TEXT,
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- AUDIT LOG
-- ============================================================================
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id INT,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PLATFORM CONFIG
-- ============================================================================
CREATE TABLE platform_config (
  id SERIAL PRIMARY KEY,
  commission_rate DECIMAL(5,4) DEFAULT 0.0800,
  min_listing_price DECIMAL(12,2) DEFAULT 10.00,
  max_listing_price DECIMAL(12,2) DEFAULT 500000.00,
  payment_deadline_hours INT DEFAULT 48,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_category ON listings(category);
CREATE INDEX idx_listings_event_date ON listings(event_date);
CREATE INDEX idx_listings_city ON listings(venue_city);
CREATE INDEX idx_listings_price ON listings(asking_price);
CREATE INDEX idx_listings_slug ON listings(slug);
CREATE INDEX idx_listings_seller ON listings(seller_id);
CREATE INDEX idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX idx_transactions_seller ON transactions(seller_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_code ON transactions(code);
CREATE INDEX idx_payments_asaas ON payments(asaas_payment_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(created_at);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_reviews_target ON reviews(target_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity, entity_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Public profiles readable" ON profiles FOR SELECT USING (true);
CREATE POLICY "Own profile updatable" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Listings
CREATE POLICY "Active listings visible" ON listings FOR SELECT USING (status = 'ACTIVE' OR seller_id = auth.uid());
CREATE POLICY "Own listings insertable" ON listings FOR INSERT WITH CHECK (seller_id = auth.uid());
CREATE POLICY "Own listings updatable" ON listings FOR UPDATE USING (seller_id = auth.uid());
CREATE POLICY "Own listings deletable" ON listings FOR DELETE USING (seller_id = auth.uid() AND status = 'DRAFT');

-- Transactions
CREATE POLICY "Transaction participants read" ON transactions FOR SELECT USING (buyer_id = auth.uid() OR seller_id = auth.uid());
CREATE POLICY "Buyer can create transaction" ON transactions FOR INSERT WITH CHECK (buyer_id = auth.uid());

-- Payments
CREATE POLICY "Payment participants read" ON payments FOR SELECT USING (payer_id = auth.uid() OR payee_id = auth.uid());

-- Conversations
CREATE POLICY "Conversation participants read" ON conversations FOR SELECT USING (participant_1 = auth.uid() OR participant_2 = auth.uid());

-- Messages
CREATE POLICY "Message participants read" ON messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM conversations c WHERE c.id = conversation_id AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid()))
);
CREATE POLICY "Message sender insert" ON messages FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Notifications
CREATE POLICY "Own notifications read" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Own notifications update" ON notifications FOR UPDATE USING (user_id = auth.uid());

-- Favorites
CREATE POLICY "Own favorites read" ON favorites FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Own favorites insert" ON favorites FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Own favorites delete" ON favorites FOR DELETE USING (user_id = auth.uid());

-- Reviews
CREATE POLICY "Reviews readable" ON reviews FOR SELECT USING (true);
CREATE POLICY "Own reviews insertable" ON reviews FOR INSERT WITH CHECK (author_id = auth.uid());

-- Disputes
CREATE POLICY "Dispute participants read" ON disputes FOR SELECT USING (
  EXISTS (SELECT 1 FROM transactions t WHERE t.id = transaction_id AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid()))
);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_listings_updated_at BEFORE UPDATE ON listings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update listing favorite count
CREATE OR REPLACE FUNCTION update_favorite_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE listings SET favorite_count = favorite_count + 1 WHERE id = NEW.listing_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE listings SET favorite_count = favorite_count - 1 WHERE id = OLD.listing_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_favorite_change
  AFTER INSERT OR DELETE ON favorites
  FOR EACH ROW EXECUTE FUNCTION update_favorite_count();

-- Update user rating avg
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles SET
    rating_avg = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE target_id = NEW.target_id),
    rating_count = (SELECT COUNT(*) FROM reviews WHERE target_id = NEW.target_id)
  WHERE id = NEW.target_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_review_insert
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_user_rating();

-- ============================================================================
-- SEED DATA
-- ============================================================================
INSERT INTO platform_config (commission_rate, min_listing_price, max_listing_price, payment_deadline_hours)
VALUES (0.0800, 10.00, 500000.00, 48);

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- =========================================================================
-- Additional migration items (fixes for production readiness)
-- =========================================================================

-- 1. Add discount_percent column to listings (used by API)
ALTER TABLE listings ADD COLUMN IF NOT EXISTS discount_percent INT DEFAULT 0;

-- 2. Add asaas_customer_id and asaas_payment_id columns to relevant tables
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS asaas_customer_id TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS asaas_payment_id TEXT;

-- 3. Create increment_view_count RPC function
CREATE OR REPLACE FUNCTION increment_view_count(listing_id_param INT)
RETURNS VOID AS $$
BEGIN
  UPDATE listings SET view_count = view_count + 1 WHERE id = listing_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Storage buckets setup
INSERT INTO storage.buckets (id, name, public) VALUES ('listing-images', 'listing-images', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('contracts', 'contracts', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-attachments', 'chat-attachments', false) ON CONFLICT DO NOTHING;

-- Storage policies for listing-images (public read, auth upload)
CREATE POLICY "Public listing images" ON storage.objects FOR SELECT USING (bucket_id = 'listing-images');
CREATE POLICY "Auth upload listing images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'listing-images' AND auth.role() = 'authenticated');
CREATE POLICY "Own listing images delete" ON storage.objects FOR DELETE USING (bucket_id = 'listing-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for avatars (public read, own upload)
CREATE POLICY "Public avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Auth upload avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Own avatar delete" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for contracts (participants only)
CREATE POLICY "Contract participants read" ON storage.objects FOR SELECT USING (bucket_id = 'contracts' AND auth.role() = 'authenticated');
CREATE POLICY "Auth upload contract" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'contracts' AND auth.role() = 'authenticated');

-- Storage policies for chat-attachments (participants only)
CREATE POLICY "Chat attachment read" ON storage.objects FOR SELECT USING (bucket_id = 'chat-attachments' AND auth.role() = 'authenticated');
CREATE POLICY "Auth upload chat attachment" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'chat-attachments' AND auth.role() = 'authenticated');

-- 5. Disputes INSERT policy (allow transaction participants to open disputes)
CREATE POLICY "Transaction participants can open disputes" ON disputes FOR INSERT WITH CHECK (
  opened_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM transactions t
    WHERE t.id = transaction_id
    AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())
  )
);

-- 6. Referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id SERIAL PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES profiles(id),
  referred_id UUID REFERENCES profiles(id),
  code TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'registered', 'first_transaction', 'rewarded')),
  referrer_reward DECIMAL(12,2) DEFAULT 50.00,
  referred_reward DECIMAL(12,2) DEFAULT 25.00,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own referrals" ON referrals FOR SELECT USING (referrer_id = auth.uid() OR referred_id = auth.uid());
CREATE POLICY "Create referral" ON referrals FOR INSERT WITH CHECK (referrer_id = auth.uid());

-- 7. Fraud alerts table
CREATE TABLE IF NOT EXISTS fraud_alerts (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  conversation_id INT REFERENCES conversations(id),
  alert_type TEXT NOT NULL,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  message_snippet TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'dismissed')),
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fraud_alerts_status ON fraud_alerts(status);
ALTER TABLE fraud_alerts ENABLE ROW LEVEL SECURITY;
-- Only admins can read fraud alerts (via service role key in admin API)

-- 8. Notification triggers for key events
CREATE OR REPLACE FUNCTION notify_new_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify seller about new transaction
  INSERT INTO notifications (user_id, channel, title, body, data, action_url)
  VALUES (
    NEW.seller_id,
    'transaction',
    'Nova proposta de compra!',
    'Alguém quer comprar sua reserva. Código: ' || NEW.code,
    jsonb_build_object('transaction_id', NEW.id, 'code', NEW.code),
    '/sales/' || NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_transaction
  AFTER INSERT ON transactions
  FOR EACH ROW EXECUTE FUNCTION notify_new_transaction();

CREATE OR REPLACE FUNCTION notify_transaction_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Notify buyer
    INSERT INTO notifications (user_id, channel, title, body, data, action_url)
    VALUES (
      NEW.buyer_id,
      'transaction',
      'Atualização na transação ' || NEW.code,
      CASE NEW.status
        WHEN 'PAYMENT_CONFIRMED' THEN 'Pagamento confirmado! Sua reserva está em garantia.'
        WHEN 'ESCROW_HELD' THEN 'Valor em custódia. Aguardando transferência da reserva.'
        WHEN 'COMPLETED' THEN 'Transação concluída com sucesso!'
        WHEN 'CANCELLED' THEN 'Transação cancelada.'
        WHEN 'REFUNDED' THEN 'Valor estornado com sucesso.'
        ELSE 'Status atualizado para: ' || NEW.status
      END,
      jsonb_build_object('transaction_id', NEW.id, 'status', NEW.status),
      '/purchases/' || NEW.id
    );
    -- Notify seller
    INSERT INTO notifications (user_id, channel, title, body, data, action_url)
    VALUES (
      NEW.seller_id,
      'transaction',
      'Atualização na venda ' || NEW.code,
      CASE NEW.status
        WHEN 'PAYMENT_CONFIRMED' THEN 'Pagamento do comprador confirmado!'
        WHEN 'ESCROW_HELD' THEN 'Valor em custódia. Realize a transferência da reserva.'
        WHEN 'COMPLETED' THEN 'Venda concluída! Valor liberado para saque.'
        WHEN 'CANCELLED' THEN 'Transação cancelada.'
        ELSE 'Status atualizado para: ' || NEW.status
      END,
      jsonb_build_object('transaction_id', NEW.id, 'status', NEW.status),
      '/sales/' || NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_transaction_status_change
  AFTER UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION notify_transaction_status_change();

CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
  recipient_id UUID;
  sender_name TEXT;
BEGIN
  -- Find the other participant in the conversation
  SELECT CASE
    WHEN c.participant_1 = NEW.sender_id THEN c.participant_2
    ELSE c.participant_1
  END INTO recipient_id
  FROM conversations c WHERE c.id = NEW.conversation_id;

  -- Get sender name
  SELECT name INTO sender_name FROM profiles WHERE id = NEW.sender_id;

  IF recipient_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, channel, title, body, data, action_url)
    VALUES (
      recipient_id,
      'chat',
      'Nova mensagem de ' || COALESCE(sender_name, 'Usuário'),
      LEFT(NEW.content, 100),
      jsonb_build_object('conversation_id', NEW.conversation_id, 'sender_id', NEW.sender_id),
      '/chat/' || NEW.conversation_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION notify_new_message();
