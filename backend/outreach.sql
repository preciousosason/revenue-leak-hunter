CREATE TABLE IF NOT EXISTS outreach_campaigns (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active',
  daily_limit INTEGER NOT NULL DEFAULT 15, max_prospects INTEGER NOT NULL DEFAULT 60,
  followup_intervals TEXT NOT NULL DEFAULT '[3,4,5,7,10]', created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS outreach_prospects (
  id TEXT PRIMARY KEY, campaign_id TEXT NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
  website TEXT, company TEXT, role TEXT, notes TEXT, observation TEXT,
  email_health TEXT NOT NULL DEFAULT 'unverified', email_health_reason TEXT, email_checked_at TEXT,
  research_ready INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'scheduled', queue_position INTEGER NOT NULL,
  scheduled_at TEXT, initial_sent_at TEXT, last_contacted_at TEXT, next_followup_at TEXT, followup_step INTEGER NOT NULL DEFAULT 0,
  opened_at TEXT, clicked_at TEXT, replied_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
  FOREIGN KEY(campaign_id) REFERENCES outreach_campaigns(id)
);
CREATE TABLE IF NOT EXISTS outreach_messages (
  id TEXT PRIMARY KEY, prospect_id TEXT NOT NULL, campaign_id TEXT NOT NULL, kind TEXT NOT NULL,
  followup_number INTEGER NOT NULL DEFAULT 0, subject TEXT NOT NULL, body TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL, sent_at TEXT, FOREIGN KEY(prospect_id) REFERENCES outreach_prospects(id)
);
CREATE TABLE IF NOT EXISTS outreach_events (
  id TEXT PRIMARY KEY, prospect_id TEXT NOT NULL, campaign_id TEXT NOT NULL, event_type TEXT NOT NULL,
  detail TEXT, created_at TEXT NOT NULL, FOREIGN KEY(prospect_id) REFERENCES outreach_prospects(id)
);
CREATE TABLE IF NOT EXISTS outreach_templates (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, kind TEXT NOT NULL, subject TEXT NOT NULL, body TEXT NOT NULL,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS outreach_suppressions (
  id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, reason TEXT, created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_outreach_prospects_campaign ON outreach_prospects(campaign_id);
CREATE INDEX IF NOT EXISTS idx_outreach_prospects_due ON outreach_prospects(scheduled_at,next_followup_at,status);
CREATE INDEX IF NOT EXISTS idx_outreach_messages_prospect ON outreach_messages(prospect_id,created_at);
CREATE INDEX IF NOT EXISTS idx_outreach_events_prospect ON outreach_events(prospect_id,created_at);
