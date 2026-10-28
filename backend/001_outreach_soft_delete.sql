-- Apply once, after backing up remote D1.
ALTER TABLE outreach_campaigns ADD COLUMN deleted_at TEXT;
ALTER TABLE outreach_campaigns ADD COLUMN deleted_reason TEXT;
ALTER TABLE outreach_campaigns ADD COLUMN deleted_by TEXT;
ALTER TABLE outreach_prospects ADD COLUMN deleted_at TEXT;
ALTER TABLE outreach_prospects ADD COLUMN deleted_reason TEXT;
ALTER TABLE outreach_prospects ADD COLUMN deleted_by TEXT;
CREATE INDEX IF NOT EXISTS idx_outreach_campaigns_deleted ON outreach_campaigns(deleted_at);
CREATE INDEX IF NOT EXISTS idx_outreach_prospects_deleted ON outreach_prospects(deleted_at);
