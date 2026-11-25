-- Existing claims are not retroactively represented as consented.
CREATE TABLE IF NOT EXISTS project_review_consents (
 review_id TEXT PRIMARY KEY,
 client_id TEXT NOT NULL REFERENCES clients(id),
 policy_version TEXT NOT NULL CHECK(policy_version='public-review-v1'),
 consented_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER IF NOT EXISTS project_review_consent_guard BEFORE INSERT ON project_review_claims
WHEN NOT EXISTS (SELECT 1 FROM project_review_consents WHERE review_id=NEW.review_id AND client_id=NEW.client_id)
BEGIN SELECT RAISE(ABORT,'Review consent required'); END;
CREATE TRIGGER IF NOT EXISTS review_consent_immutable_update BEFORE UPDATE ON project_review_consents BEGIN SELECT RAISE(ABORT,'Consent record immutable'); END;
CREATE TRIGGER IF NOT EXISTS request_conversation_owner_insert BEFORE INSERT ON service_requests
WHEN NOT EXISTS (SELECT 1 FROM conversations WHERE id=NEW.conversation_id AND client_id=NEW.client_id)
BEGIN SELECT RAISE(ABORT,'Request conversation ownership mismatch'); END;
CREATE TRIGGER IF NOT EXISTS request_identity_immutable BEFORE UPDATE ON service_requests
WHEN NEW.client_id!=OLD.client_id OR NEW.conversation_id!=OLD.conversation_id OR NEW.id!=OLD.id
BEGIN SELECT RAISE(ABORT,'Request identity immutable'); END;
CREATE TRIGGER IF NOT EXISTS accepted_quote_items_insert BEFORE INSERT ON quotation_items
WHEN EXISTS(SELECT 1 FROM quotations WHERE id=NEW.quotation_id AND status='accepted')
BEGIN SELECT RAISE(ABORT,'Accepted quotation items immutable'); END;
CREATE TRIGGER IF NOT EXISTS accepted_quote_items_update BEFORE UPDATE ON quotation_items
WHEN EXISTS(SELECT 1 FROM quotations WHERE id IN (OLD.quotation_id,NEW.quotation_id) AND status='accepted')
BEGIN SELECT RAISE(ABORT,'Accepted quotation items immutable'); END;
CREATE TRIGGER IF NOT EXISTS accepted_quote_items_delete BEFORE DELETE ON quotation_items
WHEN EXISTS(SELECT 1 FROM quotations WHERE id=OLD.quotation_id AND status='accepted')
BEGIN SELECT RAISE(ABORT,'Accepted quotation items immutable'); END;
CREATE TRIGGER IF NOT EXISTS payment_integer_guard BEFORE INSERT ON payment_records
WHEN typeof(NEW.amount_minor)!='integer' OR NEW.reference!=upper(trim(NEW.reference))
BEGIN SELECT RAISE(ABORT,'Invalid payment amount or reference'); END;
