-- Safe to re-run. Existing v1 tables are deliberately preserved.
CREATE TABLE IF NOT EXISTS analytics_v2_sessions (
 session_id TEXT PRIMARY KEY, visitor_id TEXT NOT NULL,
 started_at TEXT NOT NULL, last_seen_at TEXT NOT NULL,
 landing_page TEXT NOT NULL, last_page TEXT NOT NULL,
 source TEXT NOT NULL DEFAULT 'direct', medium TEXT NOT NULL DEFAULT 'none',
 campaign TEXT NOT NULL DEFAULT '', referrer TEXT NOT NULL DEFAULT '',
 device TEXT NOT NULL DEFAULT 'unknown', internal INTEGER NOT NULL DEFAULT 0,
 UNIQUE(session_id, visitor_id)
);
CREATE TABLE IF NOT EXISTS analytics_v2_events (
 event_id TEXT PRIMARY KEY, session_id TEXT NOT NULL, visitor_id TEXT NOT NULL,
 event_type TEXT NOT NULL, page TEXT NOT NULL, occurred_at TEXT NOT NULL,
 received_at TEXT NOT NULL, metadata TEXT NOT NULL DEFAULT '{}',
 FOREIGN KEY(session_id, visitor_id) REFERENCES analytics_v2_sessions(session_id, visitor_id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS analytics_v2_leads (
 lead_id TEXT PRIMARY KEY REFERENCES clients(id) ON DELETE CASCADE,
 session_id TEXT, visitor_id TEXT, form_id TEXT NOT NULL DEFAULT '', attempt_id TEXT NOT NULL DEFAULT '',
 created_at TEXT NOT NULL, stage TEXT NOT NULL DEFAULT 'enquiry'
 CHECK(stage IN ('enquiry','qualified','proposal','won','lost')),
 updated_at TEXT NOT NULL,
 FOREIGN KEY(session_id, visitor_id) REFERENCES analytics_v2_sessions(session_id, visitor_id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS analytics_v2_rate_limits (
 bucket TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS av2_sessions_start ON analytics_v2_sessions(started_at, internal);
CREATE INDEX IF NOT EXISTS av2_sessions_visitor ON analytics_v2_sessions(visitor_id, started_at);
CREATE INDEX IF NOT EXISTS av2_events_session ON analytics_v2_events(session_id, occurred_at, event_id);
CREATE INDEX IF NOT EXISTS av2_events_received ON analytics_v2_events(received_at);
CREATE INDEX IF NOT EXISTS av2_leads_session ON analytics_v2_leads(session_id, created_at);
CREATE INDEX IF NOT EXISTS av2_leads_created ON analytics_v2_leads(created_at);
CREATE INDEX IF NOT EXISTS av2_rate_expiry ON analytics_v2_rate_limits(expires_at);
CREATE TRIGGER IF NOT EXISTS av2_event_updates_session AFTER INSERT ON analytics_v2_events
BEGIN
 UPDATE analytics_v2_sessions SET
  landing_page = CASE WHEN NEW.occurred_at < started_at THEN NEW.page ELSE landing_page END,
  last_page = CASE WHEN NEW.occurred_at >= last_seen_at THEN NEW.page ELSE last_page END,
  started_at = MIN(started_at, NEW.occurred_at),
  last_seen_at = MAX(last_seen_at, NEW.occurred_at)
 WHERE session_id = NEW.session_id;
END;
CREATE TRIGGER IF NOT EXISTS av2_event_identity_guard BEFORE INSERT ON analytics_v2_events
WHEN EXISTS (SELECT 1 FROM analytics_v2_events WHERE event_id=NEW.event_id AND (session_id!=NEW.session_id OR visitor_id!=NEW.visitor_id))
BEGIN
 SELECT RAISE(ABORT, 'analytics event identity constraint');
END;
