-- ============================================================================
-- Migration 009: Webhook Events (Idempotency Table)
-- Prevents duplicate processing of webhook events from payment gateways
-- ============================================================================

CREATE TABLE IF NOT EXISTS webhook_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookups by event_id (unique constraint already creates one)
-- Index for cleanup of old events
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events (created_at);

-- Auto-cleanup: remove events older than 30 days (run via cron or pg_cron)
-- This keeps the table small while maintaining idempotency for recent events
COMMENT ON TABLE webhook_events IS 'Tracks processed webhook events for idempotency. Events older than 30 days can be safely purged.';

-- RLS: Only service role can access (webhooks bypass auth)
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- No user-facing policies — only accessible via admin/service role client
