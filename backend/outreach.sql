-- Phase 1 Complete rebuild.
-- This intentionally resets ONLY the previous broken Outreach prototype tables.
-- Client, portal, review, analytics and notification data are untouched.
DROP TABLE IF EXISTS outreach_messages;
DROP TABLE IF EXISTS outreach_events;
DROP TABLE IF EXISTS outreach_templates;
DROP TABLE IF EXISTS outreach_suppressions;
DROP TABLE IF EXISTS outreach_prospects;
DROP TABLE IF EXISTS outreach_campaigns;

CREATE TABLE IF NOT EXISTS outreach_campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active',
  start_date TEXT NOT NULL,
  daily_limit INTEGER NOT NULL DEFAULT 15,
  max_prospects INTEGER NOT NULL DEFAULT 60,
  followup_intervals TEXT NOT NULL DEFAULT '[3,4,5,7,10]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS outreach_prospects (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  sequence_no INTEGER NOT NULL,
  name TEXT DEFAULT '', email TEXT NOT NULL UNIQUE, website TEXT DEFAULT '', company TEXT DEFAULT '', role TEXT DEFAULT '',
  observation TEXT DEFAULT '', notes TEXT DEFAULT '',
  email_health TEXT NOT NULL DEFAULT 'mail_ready', email_health_reason TEXT DEFAULT '', email_checked_at TEXT,
  research_ready INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'scheduled', initial_due_date TEXT NOT NULL,
  last_sent_at TEXT, followup_step INTEGER NOT NULL DEFAULT 0, next_followup_date TEXT,
  sequence_complete INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
  FOREIGN KEY (campaign_id) REFERENCES outreach_campaigns(id)
);
CREATE TABLE IF NOT EXISTS outreach_messages (
  id TEXT PRIMARY KEY, campaign_id TEXT NOT NULL, prospect_id TEXT NOT NULL,
  sequence_step INTEGER NOT NULL, type TEXT NOT NULL, subject TEXT NOT NULL, body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'recorded', provider_message_id TEXT,
  delivered_at TEXT, opened_at TEXT, clicked_at TEXT, replied_at TEXT,
  created_at TEXT NOT NULL, sent_at TEXT,
  FOREIGN KEY (campaign_id) REFERENCES outreach_campaigns(id), FOREIGN KEY (prospect_id) REFERENCES outreach_prospects(id)
);
CREATE TABLE IF NOT EXISTS outreach_events (
  id TEXT PRIMARY KEY, campaign_id TEXT, prospect_id TEXT, type TEXT NOT NULL, detail TEXT DEFAULT '', created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS outreach_templates (
  id TEXT PRIMARY KEY, sequence_step INTEGER NOT NULL UNIQUE, name TEXT NOT NULL, subject TEXT DEFAULT '', body TEXT DEFAULT '', created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS outreach_suppressions (
  email TEXT PRIMARY KEY, reason TEXT DEFAULT '', source TEXT DEFAULT 'admin', created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_outreach_prospects_campaign ON outreach_prospects(campaign_id, sequence_no);
CREATE INDEX IF NOT EXISTS idx_outreach_prospects_due ON outreach_prospects(initial_due_date, next_followup_date, status);
CREATE INDEX IF NOT EXISTS idx_outreach_messages_prospect ON outreach_messages(prospect_id, created_at);
CREATE INDEX IF NOT EXISTS idx_outreach_events_created ON outreach_events(created_at DESC);
