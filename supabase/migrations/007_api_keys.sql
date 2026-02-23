-- ============================================================================
-- 007: API Keys & API Logs
-- Partner API authentication system for EventSwap public REST API
-- ============================================================================

-- ---------------------------------------------------------------------------
-- API Keys table
-- ---------------------------------------------------------------------------
CREATE TABLE api_keys (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id),
  key_name TEXT NOT NULL,
  api_key TEXT UNIQUE NOT NULL,
  api_secret TEXT NOT NULL,
  permissions JSONB DEFAULT '["read"]',
  rate_limit INT DEFAULT 100,
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_keys_key ON api_keys(api_key);
CREATE INDEX idx_api_keys_user ON api_keys(user_id);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own API keys" ON api_keys
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Create API key" ON api_keys
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Update API key" ON api_keys
  FOR UPDATE USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- API Request Logs table
-- ---------------------------------------------------------------------------
CREATE TABLE api_logs (
  id SERIAL PRIMARY KEY,
  api_key_id INT REFERENCES api_keys(id),
  method TEXT NOT NULL,
  path TEXT NOT NULL,
  status_code INT NOT NULL,
  response_time_ms INT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_logs_key ON api_logs(api_key_id);
CREATE INDEX idx_api_logs_created ON api_logs(created_at);
