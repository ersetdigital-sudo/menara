-- Add deadline_notified_at column for dedup tracking
-- Prevents duplicate notifications when cron runs multiple times in same window
ALTER TABLE orders ADD COLUMN IF NOT EXISTS deadline_notified_at timestamptz;
