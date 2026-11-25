CREATE TABLE service_requests (
 id TEXT PRIMARY KEY, client_id TEXT NOT NULL REFERENCES customer_accounts(client_id),
 conversation_id TEXT NOT NULL UNIQUE REFERENCES conversations(id),
 submission_key TEXT NOT NULL, requirements TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'submitted' CHECK(status IN ('submitted','consultation','closed','cancelled')),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(client_id,submission_key)
);
CREATE TABLE service_request_items (
 request_id TEXT NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
 offer_id TEXT NOT NULL, service_title TEXT NOT NULL, offer_name TEXT NOT NULL,
 model TEXT NOT NULL, price_minor INTEGER, currency TEXT NOT NULL,
 quantity INTEGER NOT NULL CHECK(quantity BETWEEN 1 AND 20), PRIMARY KEY(request_id,offer_id)
);
CREATE INDEX service_requests_client_idx ON service_requests(client_id,created_at);
