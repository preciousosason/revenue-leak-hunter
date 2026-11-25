CREATE TABLE IF NOT EXISTS customer_payment_notifications (
 payment_id TEXT PRIMARY KEY REFERENCES payment_records(id),
 client_id TEXT NOT NULL REFERENCES clients(id),
 status TEXT NOT NULL CHECK(status IN ('verified','rejected')),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 read_at TEXT
);
CREATE INDEX IF NOT EXISTS customer_payment_notifications_owner ON customer_payment_notifications(client_id,created_at DESC);
CREATE TRIGGER IF NOT EXISTS payment_review_notification AFTER UPDATE OF status ON payment_records
WHEN OLD.status='pending' AND NEW.status IN ('verified','rejected')
BEGIN
 INSERT INTO customer_payment_notifications(payment_id,client_id,status)
 SELECT NEW.id,r.client_id,NEW.status FROM quotations q JOIN service_requests r ON r.id=q.request_id WHERE q.id=NEW.quotation_id;
END;
