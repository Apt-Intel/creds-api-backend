-- Update api_keys table
ALTER TABLE api_keys
ADD COLUMN IF NOT EXISTS daily_limit INTEGER,
ADD COLUMN IF NOT EXISTS monthly_limit INTEGER;

-- Modify endpoints_allowed column in api_keys table
ALTER TABLE api_keys
ALTER COLUMN endpoints_allowed TYPE TEXT[] USING ARRAY[endpoints_allowed]::TEXT[],
ALTER COLUMN endpoints_allowed SET DEFAULT '{}';

-- Create api_usage table
CREATE TABLE IF NOT EXISTS api_usage (
  id SERIAL PRIMARY KEY,
  api_key_id UUID REFERENCES api_keys(id),
  total_requests BIGINT DEFAULT 0,
  daily_requests INTEGER DEFAULT 0,
  monthly_requests INTEGER DEFAULT 0,
  last_request_date DATE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add unique constraint to api_key_id in api_usage table
ALTER TABLE api_usage
ADD CONSTRAINT unique_api_key_id UNIQUE (api_key_id);

-- Create api_requests_log table
CREATE TABLE IF NOT EXISTS api_requests_log (
  id SERIAL PRIMARY KEY,
  api_key_id UUID REFERENCES api_keys(id),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  endpoint TEXT,
  method TEXT,
  status_code INTEGER,
  response_time_ms INTEGER,
  ip_address TEXT,
  user_agent TEXT
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_usage_api_key_id ON api_usage(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_requests_log_api_key_id ON api_requests_log(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_requests_log_timestamp ON api_requests_log(timestamp);

-- Add this to your existing migrations file or create a new one
ALTER TABLE api_usage
ADD COLUMN IF NOT EXISTS daily_limit INTEGER,
ADD COLUMN IF NOT EXISTS monthly_limit INTEGER;
