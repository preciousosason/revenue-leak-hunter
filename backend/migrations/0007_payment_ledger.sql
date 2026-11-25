CREATE UNIQUE INDEX IF NOT EXISTS quotation_one_accepted ON quotations(request_id) WHERE status='accepted';
CREATE TRIGGER IF NOT EXISTS quotation_no_after_accept BEFORE INSERT ON quotations WHEN EXISTS(SELECT 1 FROM quotations WHERE request_id=NEW.request_id AND status='accepted') BEGIN SELECT RAISE(ABORT,'Accepted quotation already exists'); END;
CREATE TRIGGER IF NOT EXISTS quotation_accepted_immutable BEFORE UPDATE ON quotations WHEN OLD.status='accepted' BEGIN SELECT RAISE(ABORT,'Accepted quotation is immutable'); END;
CREATE TABLE IF NOT EXISTS payment_records (
 id TEXT PRIMARY KEY, quotation_id TEXT NOT NULL REFERENCES quotations(id),
 amount_minor INTEGER NOT NULL CHECK(amount_minor BETWEEN 1 AND 100000000000),
 reference TEXT NOT NULL UNIQUE CHECK(length(reference) BETWEEN 1 AND 200),
 evidence_key TEXT NOT NULL UNIQUE, status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','verified','rejected')),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, reviewed_at TEXT, review_note TEXT
);
CREATE INDEX IF NOT EXISTS payment_quote_idx ON payment_records(quotation_id,status);
CREATE TRIGGER IF NOT EXISTS payment_insert_guard BEFORE INSERT ON payment_records WHEN NEW.status!='pending' OR NOT EXISTS(SELECT 1 FROM quotations WHERE id=NEW.quotation_id AND status='accepted') BEGIN SELECT RAISE(ABORT,'Invalid payment'); END;
CREATE TRIGGER IF NOT EXISTS payment_review_guard BEFORE UPDATE ON payment_records WHEN OLD.status!='pending' OR NEW.status NOT IN ('verified','rejected') OR NEW.id!=OLD.id OR NEW.quotation_id!=OLD.quotation_id OR NEW.amount_minor!=OLD.amount_minor OR NEW.reference!=OLD.reference OR NEW.evidence_key!=OLD.evidence_key OR NEW.created_at!=OLD.created_at OR NEW.reviewed_at IS NULL BEGIN SELECT RAISE(ABORT,'Invalid payment transition'); END;
CREATE TRIGGER IF NOT EXISTS payment_no_overpay BEFORE UPDATE ON payment_records WHEN NEW.status='verified' AND NEW.amount_minor+COALESCE((SELECT SUM(amount_minor) FROM payment_records WHERE quotation_id=NEW.quotation_id AND status='verified'),0)>(SELECT subtotal_minor-discount_minor FROM quotations WHERE id=NEW.quotation_id) BEGIN SELECT RAISE(ABORT,'Payment exceeds balance'); END;
CREATE TRIGGER IF NOT EXISTS payment_no_delete BEFORE DELETE ON payment_records BEGIN SELECT RAISE(ABORT,'Payment records cannot be deleted'); END;
