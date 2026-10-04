PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS client_service_interests (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    service_id TEXT NOT NULL,
    service_slug TEXT NOT NULL,
    service_title TEXT NOT NULL,
    service_number TEXT,
    service_category TEXT,
    service_type TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (client_id)
        REFERENCES clients(id)
        ON DELETE CASCADE,

    UNIQUE(client_id, service_id)
);

CREATE INDEX IF NOT EXISTS idx_client_service_interests_client
ON client_service_interests(client_id);

CREATE INDEX IF NOT EXISTS idx_client_service_interests_slug
ON client_service_interests(service_slug);
