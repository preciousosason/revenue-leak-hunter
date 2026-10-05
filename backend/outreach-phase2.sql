-- Leakendia Outreach Phase 2: Google Workspace connection state.
-- Safe to run after Phase 1. Existing outreach campaigns/prospects/messages are preserved.

CREATE TABLE IF NOT EXISTS outreach_google_connection (
  id TEXT PRIMARY KEY,
  sender_email TEXT NOT NULL,
  refresh_token_encrypted TEXT NOT NULL,
  scope TEXT NOT NULL,
  connected_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS outreach_oauth_states (
  state TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_outreach_oauth_states_expiry
ON outreach_oauth_states(expires_at);
