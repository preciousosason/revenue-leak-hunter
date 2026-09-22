PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY,

    client_id TEXT NOT NULL,

    conversation_id TEXT NOT NULL,

    message_id TEXT,

    original_name TEXT NOT NULL,

    storage_key TEXT NOT NULL UNIQUE,

    content_type TEXT NOT NULL,

    file_size INTEGER NOT NULL,

    uploaded_by TEXT NOT NULL,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (client_id)
        REFERENCES clients(id)
        ON DELETE CASCADE,

    FOREIGN KEY (conversation_id)
        REFERENCES conversations(id)
        ON DELETE CASCADE,

    FOREIGN KEY (message_id)
        REFERENCES messages(id)
        ON DELETE SET NULL
);


CREATE INDEX IF NOT EXISTS idx_files_client
ON files(client_id);


CREATE INDEX IF NOT EXISTS idx_files_conversation
ON files(conversation_id);


CREATE INDEX IF NOT EXISTS idx_files_message
ON files(message_id);