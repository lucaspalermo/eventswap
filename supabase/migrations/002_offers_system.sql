-- ============================================================================
-- EventSwap - Offers / Negotiation System
-- Allows buyers to propose prices and sellers to accept/reject/counter-offer
-- ============================================================================

-- Offer status enum
CREATE TYPE offer_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'COUNTERED', 'EXPIRED', 'CANCELLED');

-- ============================================================================
-- OFFERS TABLE
-- ============================================================================
CREATE TABLE offers (
  id SERIAL PRIMARY KEY,
  listing_id INT NOT NULL REFERENCES listings(id),
  buyer_id UUID NOT NULL REFERENCES profiles(id),
  seller_id UUID NOT NULL REFERENCES profiles(id),
  amount DECIMAL(12,2) NOT NULL,
  counter_amount DECIMAL(12,2),
  message TEXT,
  counter_message TEXT,
  status offer_status DEFAULT 'PENDING',
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '48 hours'),
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_offers_listing ON offers(listing_id);
CREATE INDEX idx_offers_buyer ON offers(buyer_id);
CREATE INDEX idx_offers_seller ON offers(seller_id);
CREATE INDEX idx_offers_status ON offers(status);

-- Row Level Security
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Offer participants read" ON offers
  FOR SELECT USING (buyer_id = auth.uid() OR seller_id = auth.uid());

CREATE POLICY "Buyer create offer" ON offers
  FOR INSERT WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Participants update offer" ON offers
  FOR UPDATE USING (buyer_id = auth.uid() OR seller_id = auth.uid());

-- Updated at trigger
CREATE TRIGGER set_offers_updated_at
  BEFORE UPDATE ON offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- NOTIFICATION TRIGGER - Notify seller on new offer
-- ============================================================================
CREATE OR REPLACE FUNCTION notify_new_offer()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, channel, title, body, data, action_url)
  VALUES (
    NEW.seller_id,
    'offer',
    'Nova oferta recebida!',
    'Voce recebeu uma oferta de R$ ' || NEW.amount || ' para sua reserva.',
    jsonb_build_object('offer_id', NEW.id, 'listing_id', NEW.listing_id, 'amount', NEW.amount),
    '/my-listings'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_offer
  AFTER INSERT ON offers
  FOR EACH ROW EXECUTE FUNCTION notify_new_offer();
