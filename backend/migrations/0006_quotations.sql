CREATE TABLE quotations (
 id TEXT PRIMARY KEY, request_id TEXT NOT NULL REFERENCES service_requests(id),
 revision INTEGER NOT NULL CHECK(revision>0), currency TEXT NOT NULL,
 subtotal_minor INTEGER NOT NULL CHECK(subtotal_minor>=0), discount_minor INTEGER NOT NULL CHECK(discount_minor>=0 AND discount_minor<=subtotal_minor),
 deposit_minor INTEGER NOT NULL CHECK(deposit_minor>=0 AND deposit_minor<=subtotal_minor-discount_minor),
 terms TEXT NOT NULL, expires_at TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'sent' CHECK(status IN ('sent','accepted','declined','revision_requested','superseded')),
 response_note TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, responded_at TEXT, UNIQUE(request_id,revision)
);
CREATE UNIQUE INDEX quotation_one_open ON quotations(request_id) WHERE status='sent';
CREATE TABLE quotation_items (quotation_id TEXT NOT NULL REFERENCES quotations(id), position INTEGER NOT NULL, description TEXT NOT NULL, quantity INTEGER NOT NULL CHECK(quantity>0), unit_minor INTEGER NOT NULL CHECK(unit_minor>=0), PRIMARY KEY(quotation_id,position));
