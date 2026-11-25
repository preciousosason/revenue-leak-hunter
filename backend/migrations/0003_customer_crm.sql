CREATE TABLE IF NOT EXISTS customer_internal_notes (
 id TEXT PRIMARY KEY,
 client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
 note TEXT NOT NULL CHECK(length(trim(note)) BETWEEN 1 AND 4000),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_customer_notes_client ON customer_internal_notes(client_id, created_at DESC, id);
