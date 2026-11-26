PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE marketplace_categories (
 id TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
 parent_id TEXT REFERENCES marketplace_categories(id) ON DELETE RESTRICT,
 slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
 description TEXT NOT NULL DEFAULT '', sort_order INTEGER NOT NULL DEFAULT 0,
 CHECK(parent_id IS NULL OR parent_id <> id)
);
INSERT INTO "marketplace_categories" ("id","parent_id","slug","name","description","sort_order") VALUES('d71e1a8d1a5b4693be82bd011bb5db10',NULL,'search-engine-optimization','Search Engine Optimization','',0);
INSERT INTO "marketplace_categories" ("id","parent_id","slug","name","description","sort_order") VALUES('2f1152753131490f92f3bb39911b220c',NULL,'technical-seo','Technical SEO','',0);
CREATE TABLE marketplace_services (
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
INSERT INTO "marketplace_services" ("id","slug","title","summary","description","status","featured","seo_title","seo_description","created_at","updated_at","published_at") VALUES('1bb58dd32dd74bea97a34a1eeec65e7e','technical-seo-audit','Technical SEO Audit','Identify technical SEO issues affecting crawlability, indexing and organic search visibility.','A comprehensive technical SEO investigation covering crawl errors, indexing problems, canonical tags, redirects, XML sitemaps, internal linking and website architecture.','draft',1,'Technical SEO Audit Services | Leakendia','Uncover crawlability, indexing, canonical, redirect and website architecture issues with a comprehensive technical SEO audit from Leakendia.','2026-11-20T15:55:21.701Z','2026-11-24T09:34:40.098Z',NULL);
CREATE TABLE marketplace_service_categories (
 service_id TEXT NOT NULL REFERENCES marketplace_services(id) ON DELETE CASCADE,
 category_id TEXT NOT NULL REFERENCES marketplace_categories(id) ON DELETE RESTRICT,
 PRIMARY KEY(service_id,category_id)
);
INSERT INTO "marketplace_service_categories" ("service_id","category_id") VALUES('1bb58dd32dd74bea97a34a1eeec65e7e','2f1152753131490f92f3bb39911b220c');
CREATE TABLE marketplace_offers (
 id TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
 service_id TEXT NOT NULL REFERENCES marketplace_services(id) ON DELETE RESTRICT,
 name TEXT NOT NULL, model TEXT NOT NULL CHECK(model IN ('task','package','weekly','quote')),
 price_minor INTEGER, currency TEXT NOT NULL DEFAULT 'USD' CHECK(length(currency)=3),
 delivery_days INTEGER CHECK(delivery_days > 0),
 active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
 CHECK((model='quote' AND price_minor IS NULL) OR (model<>'quote' AND price_minor IS NOT NULL AND typeof(price_minor)='integer' AND price_minor>=0))
);
INSERT INTO "marketplace_offers" ("id","service_id","name","model","price_minor","currency","delivery_days","active") VALUES('f873db40678d410ba42edb71b0d4e044','1bb58dd32dd74bea97a34a1eeec65e7e','Essential','task',9900,'USD',3,1);
INSERT INTO "marketplace_offers" ("id","service_id","name","model","price_minor","currency","delivery_days","active") VALUES('74ee92e7902247eca92b6cf690ec2c7a','1bb58dd32dd74bea97a34a1eeec65e7e','Professional','task',19900,'USD',5,1);
INSERT INTO "marketplace_offers" ("id","service_id","name","model","price_minor","currency","delivery_days","active") VALUES('428b4d16c7714b1cafe2bf03845162ea','1bb58dd32dd74bea97a34a1eeec65e7e','Advanced','task',29900,'USD',7,1);
CREATE TABLE marketplace_service_content (
 id TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
 service_id TEXT NOT NULL REFERENCES marketplace_services(id) ON DELETE CASCADE,
 kind TEXT NOT NULL CHECK(kind IN ('scope','deliverable','exclusion','requirement','faq')),
 title TEXT NOT NULL, body TEXT NOT NULL DEFAULT '', sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE marketplace_media (
 id TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
 service_id TEXT NOT NULL REFERENCES marketplace_services(id) ON DELETE CASCADE,
 object_key TEXT NOT NULL UNIQUE, alt_text TEXT NOT NULL DEFAULT '',
 role TEXT NOT NULL CHECK(role IN ('thumbnail','gallery')), sort_order INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "marketplace_media" ("id","service_id","object_key","alt_text","role","sort_order") VALUES('3eb9fcbbebe8443cb7e1bc2adc93c5f0','1bb58dd32dd74bea97a34a1eeec65e7e','marketplace/1bb58dd32dd74bea97a34a1eeec65e7e/3eb9fcbbebe8443cb7e1bc2adc93c5f0','Technical SEO audit dashboard showing website crawlability and indexing analysis','thumbnail',0);
CREATE TABLE marketplace_related_services (
 service_id TEXT NOT NULL REFERENCES marketplace_services(id) ON DELETE CASCADE,
 related_id TEXT NOT NULL REFERENCES marketplace_services(id) ON DELETE CASCADE,
 PRIMARY KEY(service_id,related_id), CHECK(service_id<>related_id)
);
CREATE TABLE marketplace_slug_history (
 slug TEXT PRIMARY KEY NOT NULL,
 service_id TEXT NOT NULL REFERENCES marketplace_services(id) ON DELETE RESTRICT
);
CREATE TABLE clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    business TEXT,
    website TEXT,
    token_hash TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE conversations (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    subject TEXT NOT NULL DEFAULT 'Leak Hunt Investigation',
    status TEXT NOT NULL DEFAULT 'open',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (client_id)
        REFERENCES clients(id)
        ON DELETE CASCADE
);
CREATE TABLE messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    sender_type TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (conversation_id)
        REFERENCES conversations(id)
        ON DELETE CASCADE
);
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (client_id)
        REFERENCES clients(id)
        ON DELETE CASCADE
);
CREATE TABLE reviews (
    id TEXT PRIMARY KEY,
    client_id TEXT,
    name TEXT NOT NULL,
    business TEXT,
    rating INTEGER,
    review TEXT NOT NULL,
    approved INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (client_id)
        REFERENCES clients(id)
        ON DELETE SET NULL
);
CREATE TABLE blog_comments (
    id TEXT PRIMARY KEY,
    article_slug TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    comment TEXT NOT NULL,
    approved INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE notifications (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (client_id)
        REFERENCES clients(id)
        ON DELETE CASCADE
);
CREATE TABLE admin_sessions (
    id TEXT PRIMARY KEY,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "admin_sessions" ("id","expires_at","created_at") VALUES('10285317-d221-41af-ad1c-e592d29aa27a','2026-11-21T15:25:28.786Z','2026-11-20 15:25:28');
INSERT INTO "admin_sessions" ("id","expires_at","created_at") VALUES('04044b37-ae50-4ec0-981e-e929be20a361','2026-11-21T15:51:40.640Z','2026-11-20 15:51:40');
INSERT INTO "admin_sessions" ("id","expires_at","created_at") VALUES('633baeb9-bcf8-4a27-aa15-dd810c44cdab','2026-11-21T16:53:43.285Z','2026-11-20 16:53:43');
INSERT INTO "admin_sessions" ("id","expires_at","created_at") VALUES('103fed4b-cfa5-44db-b18b-c64797d6b417','2026-11-25T09:02:46.357Z','2026-11-24 09:02:46');
INSERT INTO "admin_sessions" ("id","expires_at","created_at") VALUES('5232325c-e607-4e99-9cd2-5582e60a1bdb','2026-11-25T10:08:41.270Z','2026-11-24 10:08:41');
CREATE TABLE client_service_interests (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    service_id TEXT NOT NULL,
    service_slug TEXT NOT NULL,
    service_title TEXT NOT NULL,
    service_number TEXT,
    service_category TEXT,
    service_type TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (client_id)
        REFERENCES clients(id)
        ON DELETE CASCADE,

    UNIQUE(client_id, service_id)
);
CREATE TABLE IF NOT EXISTS "d1_migrations"(
		id         INTEGER PRIMARY KEY AUTOINCREMENT,
		name       TEXT UNIQUE,
		applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(1,'0001_marketplace.sql','2026-11-24 15:05:45');
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(2,'0002_unified_auth.sql','2026-11-24 15:05:46');
CREATE TABLE customer_accounts (
    client_id TEXT PRIMARY KEY,

    normalized_email TEXT NOT NULL UNIQUE,

    email_verified_at TEXT NOT NULL,

    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN (
            'active',
            'suspended',
            'disabled'
        )),

    avatar_url TEXT,

    registered_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    last_login_at TEXT,

    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (client_id)
        REFERENCES clients(id)
        ON DELETE CASCADE
);
CREATE TABLE auth_identities (
    id TEXT PRIMARY KEY,

    client_id TEXT NOT NULL,

    provider TEXT NOT NULL
        CHECK (provider IN (
            'google',
            'email'
        )),

    provider_subject TEXT NOT NULL,

    email TEXT NOT NULL,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    last_used_at TEXT,

    FOREIGN KEY (client_id)
        REFERENCES customer_accounts(client_id)
        ON DELETE CASCADE,

    UNIQUE (provider, provider_subject),

    UNIQUE (client_id, provider)
);
CREATE TABLE auth_challenges (
    id TEXT PRIMARY KEY,

    email TEXT NOT NULL,

    code_hash TEXT NOT NULL,

    purpose TEXT NOT NULL DEFAULT 'sign_in'
        CHECK (purpose IN (
            'sign_in',
            'account_link',
            'email_change'
        )),

    attempts INTEGER NOT NULL DEFAULT 0,

    max_attempts INTEGER NOT NULL DEFAULT 5,

    expires_at TEXT NOT NULL,

    consumed_at TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE customer_sessions (
    id TEXT PRIMARY KEY,

    client_id TEXT NOT NULL,

    token_hash TEXT NOT NULL UNIQUE,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    expires_at TEXT NOT NULL,

    last_seen_at TEXT,

    revoked_at TEXT,

    FOREIGN KEY (client_id)
        REFERENCES customer_accounts(client_id)
        ON DELETE CASCADE
);
CREATE TABLE auth_oauth_states (
    id TEXT PRIMARY KEY,

    state_hash TEXT NOT NULL UNIQUE,

    browser_binding_hash TEXT NOT NULL,

    code_verifier TEXT NOT NULL,

    nonce TEXT NOT NULL,

    return_path TEXT NOT NULL DEFAULT '/',

    expires_at TEXT NOT NULL,

    consumed_at TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE auth_rate_limits (
    rate_key TEXT PRIMARY KEY,

    attempts INTEGER NOT NULL DEFAULT 0,

    window_started_at TEXT NOT NULL,

    expires_at TEXT NOT NULL,

    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE auth_events (
    id TEXT PRIMARY KEY,

    client_id TEXT,

    event_type TEXT NOT NULL,

    provider TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (client_id)
        REFERENCES clients(id)
        ON DELETE SET NULL
);
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('d1_migrations',2);
CREATE UNIQUE INDEX marketplace_one_thumbnail ON marketplace_media(service_id) WHERE role='thumbnail';
CREATE INDEX marketplace_categories_parent ON marketplace_categories(parent_id,sort_order);
CREATE INDEX marketplace_services_public ON marketplace_services(status,featured,published_at);
CREATE INDEX marketplace_membership_category ON marketplace_service_categories(category_id,service_id);
CREATE INDEX marketplace_offers_service ON marketplace_offers(service_id,active);
CREATE INDEX marketplace_content_service ON marketplace_service_content(service_id,kind,sort_order);
CREATE INDEX marketplace_media_service ON marketplace_media(service_id,sort_order);
CREATE INDEX idx_conversations_client
ON conversations(client_id);
CREATE INDEX idx_messages_conversation
ON messages(conversation_id);
CREATE INDEX idx_sessions_client
ON sessions(client_id);
CREATE INDEX idx_comments_article
ON blog_comments(article_slug);
CREATE INDEX idx_notifications_client
ON notifications(client_id);
CREATE INDEX idx_admin_sessions_expires
ON admin_sessions(expires_at);
CREATE INDEX idx_client_service_interests_client
ON client_service_interests(client_id);
CREATE INDEX idx_client_service_interests_slug
ON client_service_interests(service_slug);
CREATE INDEX idx_customer_accounts_status
ON customer_accounts(status);
CREATE INDEX idx_customer_accounts_registered
ON customer_accounts(registered_at);
CREATE INDEX idx_auth_identities_client
ON auth_identities(client_id);
CREATE INDEX idx_auth_challenges_email
ON auth_challenges(email, purpose, created_at);
CREATE INDEX idx_auth_challenges_expires
ON auth_challenges(expires_at);
CREATE INDEX idx_customer_sessions_client
ON customer_sessions(client_id);
CREATE INDEX idx_customer_sessions_expires
ON customer_sessions(expires_at);
CREATE INDEX idx_auth_oauth_states_expires
ON auth_oauth_states(expires_at);
CREATE INDEX idx_auth_rate_limits_expires
ON auth_rate_limits(expires_at);
CREATE INDEX idx_auth_events_client
ON auth_events(client_id, created_at);
CREATE TRIGGER marketplace_category_no_cycle BEFORE UPDATE OF parent_id ON marketplace_categories
WHEN NEW.parent_id IS NOT NULL BEGIN
 SELECT RAISE(ABORT,'category cycle') WHERE EXISTS (
 WITH RECURSIVE ancestors(id) AS (SELECT NEW.parent_id UNION SELECT c.parent_id FROM marketplace_categories c JOIN ancestors a ON c.id=a.id WHERE c.parent_id IS NOT NULL)
 SELECT 1 FROM ancestors WHERE id=NEW.id);
END;