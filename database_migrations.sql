-- Create api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  api_key TEXT NOT NULL,
  status TEXT NOT NULL,
  metadata JSONB,
  endpoints_allowed TEXT[],
  rate_limit INTEGER,
  daily_limit INTEGER,
  monthly_limit INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_reset_date DATE
);

-- Create api_requests_log table
CREATE TABLE IF NOT EXISTS api_requests_log (
  id SERIAL PRIMARY KEY,
  api_key_id UUID REFERENCES api_keys(id),
  timestamp TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  endpoint TEXT,
  method TEXT,
  status_code INTEGER,
  response_time_ms INTEGER,
  ip_address TEXT,
  user_agent TEXT
);

-- Create api_usage table
CREATE TABLE IF NOT EXISTS api_usage (
  id SERIAL PRIMARY KEY,
  api_key_id UUID REFERENCES api_keys(id),
  total_requests BIGINT DEFAULT 0,
  daily_requests INTEGER DEFAULT 0,
  monthly_requests INTEGER DEFAULT 0,
  last_request_date DATE,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_api_key ON api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_api_requests_log_api_key_id ON api_requests_log(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_requests_log_timestamp ON api_requests_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_api_usage_api_key_id ON api_usage(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_last_request_date ON api_usage(last_request_date);

-- Add unique constraint to api_usage
ALTER TABLE api_usage ADD CONSTRAINT unique_api_key_id UNIQUE (api_key_id);

-- Function to reset and update usage
CREATE OR REPLACE FUNCTION reset_and_update_usage(p_api_key_id UUID)
RETURNS TABLE (updated_daily_requests INTEGER, updated_monthly_requests INTEGER) AS $$
DECLARE
    v_last_request_date DATE;
    v_current_date DATE;
    v_current_month DATE;
    v_timezone TEXT;
BEGIN
    -- Get the API key's timezone
    SELECT timezone INTO v_timezone
    FROM api_keys
    WHERE id = p_api_key_id;

    IF v_timezone IS NULL THEN
        RAISE EXCEPTION 'API key not found or timezone not set for id: %', p_api_key_id;
    END IF;

    -- Set the current date and month based on the API key's timezone
    v_current_date := (CURRENT_TIMESTAMP AT TIME ZONE v_timezone)::DATE;
    v_current_month := DATE_TRUNC('month', v_current_date);

    -- Get or create the api_usage record
    INSERT INTO api_usage (api_key_id, total_requests, daily_requests, monthly_requests, last_request_date)
    VALUES (p_api_key_id, 0, 0, 0, v_current_date)
    ON CONFLICT (api_key_id) DO NOTHING;

    -- Get the last request date
    SELECT last_request_date INTO v_last_request_date
    FROM api_usage
    WHERE api_key_id = p_api_key_id;

    -- Reset daily if necessary
    IF v_last_request_date IS NULL OR v_last_request_date < v_current_date THEN
        UPDATE api_usage
        SET daily_requests = 1,
            monthly_requests = CASE
                WHEN v_last_request_date IS NULL OR DATE_TRUNC('month', v_last_request_date) < v_current_month THEN 1
                ELSE monthly_requests + 1
            END,
            total_requests = total_requests + 1,
            last_request_date = v_current_date
        WHERE api_key_id = p_api_key_id;
    ELSE
        UPDATE api_usage
        SET daily_requests = daily_requests + 1,
            monthly_requests = monthly_requests + 1,
            total_requests = total_requests + 1
        WHERE api_key_id = p_api_key_id;
    END IF;

    -- Return the updated values
    RETURN QUERY
    SELECT au.daily_requests AS updated_daily_requests, au.monthly_requests AS updated_monthly_requests
    FROM api_usage au
    WHERE au.api_key_id = p_api_key_id;
END;
$$ LANGUAGE plpgsql;
