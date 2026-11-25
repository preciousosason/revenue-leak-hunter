CREATE TABLE IF NOT EXISTS customer_cart_items (
 client_id TEXT NOT NULL REFERENCES customer_accounts(client_id) ON DELETE CASCADE,
 offer_id TEXT NOT NULL REFERENCES marketplace_offers(id) ON DELETE CASCADE,
 quantity INTEGER NOT NULL CHECK(quantity BETWEEN 1 AND 20),
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY(client_id,offer_id)
);
