ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users(last_seen DESC);
