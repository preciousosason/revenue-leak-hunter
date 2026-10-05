CREATE TABLE IF NOT EXISTS email_notifications (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    client_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('reply', 'welcome', 'custom')),
    recipient_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    custom_message TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    provider_message_id TEXT,
    error_message TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sent_at TEXT,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_email_notifications_conversation
ON email_notifications (conversation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_notifications_client
ON email_notifications (client_id, created_at DESC);
