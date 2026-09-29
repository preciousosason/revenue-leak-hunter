-- Conversion Leak Hunter: first-party journey analytics

CREATE TABLE IF NOT EXISTS analytics_visitors (
    visitor_id TEXT PRIMARY KEY,
    first_seen_at TEXT NOT NULL,
    last_seen_at TEXT NOT NULL,
    first_referrer TEXT,
    first_landing_page TEXT,
    last_page TEXT,
    session_count INTEGER NOT NULL DEFAULT 0,
    event_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS analytics_sessions (
    session_id TEXT PRIMARY KEY,
    visitor_id TEXT NOT NULL,
    started_at TEXT NOT NULL,
    last_seen_at TEXT NOT NULL,
    landing_page TEXT,
    referrer TEXT,
    last_page TEXT,
    event_count INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (visitor_id) REFERENCES analytics_visitors(visitor_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS analytics_events (
    event_id TEXT PRIMARY KEY,
    visitor_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    page TEXT,
    referrer TEXT,
    metadata TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (visitor_id) REFERENCES analytics_visitors(visitor_id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES analytics_sessions(session_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at
ON analytics_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_visitor
ON analytics_events(visitor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_session
ON analytics_events(session_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_type
ON analytics_events(event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_sessions_visitor
ON analytics_sessions(visitor_id, started_at DESC);
