-- Additive Marketplace foundation. No existing tables are changed.
CREATE TABLE IF NOT EXISTS marketplace_categories (
 id TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
 parent_id TEXT REFERENCES marketplace_categories(id) ON DELETE RESTRICT,
 slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
 description TEXT NOT NULL DEFAULT '', sort_order INTEGER NOT NULL DEFAULT 0,
 CHECK(parent_id IS NULL OR parent_id <> id)
);
CREATE TABLE IF NOT EXISTS marketplace_services (
 id TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
 slug TEXT NOT NULL UNIQUE, title TEXT NOT NULL,
 summary TEXT NOT NULL DEFAULT '', description TEXT NOT NULL DEFAULT '',
 status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','archived')),
 featured INTEGER NOT NULL DEFAULT 0 CHECK(featured IN (0,1)),
 seo_title TEXT, seo_description TEXT,
 created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
 updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
 published_at TEXT,
 CHECK(status <> 'published' OR published_at IS NOT NULL)
);
CREATE TABLE IF NOT EXISTS marketplace_service_categories (
 service_id TEXT NOT NULL REFERENCES marketplace_services(id) ON DELETE CASCADE,
 category_id TEXT NOT NULL REFERENCES marketplace_categories(id) ON DELETE RESTRICT,
 PRIMARY KEY(service_id,category_id)
);
CREATE TABLE IF NOT EXISTS marketplace_offers (
 id TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
 service_id TEXT NOT NULL REFERENCES marketplace_services(id) ON DELETE RESTRICT,
 name TEXT NOT NULL, model TEXT NOT NULL CHECK(model IN ('task','package','weekly','quote')),
 price_minor INTEGER, currency TEXT NOT NULL DEFAULT 'USD' CHECK(length(currency)=3),
 delivery_days INTEGER CHECK(delivery_days > 0),
 active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
 CHECK((model='quote' AND price_minor IS NULL) OR (model<>'quote' AND price_minor IS NOT NULL AND typeof(price_minor)='integer' AND price_minor>=0))
);
CREATE TABLE IF NOT EXISTS marketplace_service_content (
 id TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
 service_id TEXT NOT NULL REFERENCES marketplace_services(id) ON DELETE CASCADE,
 kind TEXT NOT NULL CHECK(kind IN ('scope','deliverable','exclusion','requirement','faq')),
 title TEXT NOT NULL, body TEXT NOT NULL DEFAULT '', sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS marketplace_media (
 id TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
 service_id TEXT NOT NULL REFERENCES marketplace_services(id) ON DELETE CASCADE,
 object_key TEXT NOT NULL UNIQUE, alt_text TEXT NOT NULL DEFAULT '',
 role TEXT NOT NULL CHECK(role IN ('thumbnail','gallery')), sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX IF NOT EXISTS marketplace_one_thumbnail ON marketplace_media(service_id) WHERE role='thumbnail';
CREATE TABLE IF NOT EXISTS marketplace_related_services (
 service_id TEXT NOT NULL REFERENCES marketplace_services(id) ON DELETE CASCADE,
 related_id TEXT NOT NULL REFERENCES marketplace_services(id) ON DELETE CASCADE,
 PRIMARY KEY(service_id,related_id), CHECK(service_id<>related_id)
);
CREATE TABLE IF NOT EXISTS marketplace_slug_history (
 slug TEXT PRIMARY KEY NOT NULL,
 service_id TEXT NOT NULL REFERENCES marketplace_services(id) ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS marketplace_categories_parent ON marketplace_categories(parent_id,sort_order);
CREATE INDEX IF NOT EXISTS marketplace_services_public ON marketplace_services(status,featured,published_at);
CREATE INDEX IF NOT EXISTS marketplace_membership_category ON marketplace_service_categories(category_id,service_id);
CREATE INDEX IF NOT EXISTS marketplace_offers_service ON marketplace_offers(service_id,active);
CREATE INDEX IF NOT EXISTS marketplace_content_service ON marketplace_service_content(service_id,kind,sort_order);
CREATE INDEX IF NOT EXISTS marketplace_media_service ON marketplace_media(service_id,sort_order);
CREATE TRIGGER IF NOT EXISTS marketplace_category_no_cycle BEFORE UPDATE OF parent_id ON marketplace_categories
WHEN NEW.parent_id IS NOT NULL BEGIN
 SELECT RAISE(ABORT,'category cycle') WHERE EXISTS (
 WITH RECURSIVE ancestors(id) AS (SELECT NEW.parent_id UNION SELECT c.parent_id FROM marketplace_categories c JOIN ancestors a ON c.id=a.id WHERE c.parent_id IS NOT NULL)
 SELECT 1 FROM ancestors WHERE id=NEW.id);
END;
