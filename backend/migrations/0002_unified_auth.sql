
-- ============================================================
-- LEAKENDIA UNIFIED AUTHENTICATION
-- Migration: 0002
-- Purpose: Customer identity and authentication infrastructure
-- ============================================================

PRAGMA foreign_keys = ON;

-- ============================================================
-- 1. CUSTOMER ACCOUNTS
-- Extends existing clients without replacing their identities.
-- ============================================================

CREATE TABLE IF NOT EXISTS customer_accounts (
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

-- ============================================================
-- 2. AUTHENTICATION IDENTITIES
-- Allows multiple authentication methods for one customer.
-- ============================================================

CREATE TABLE IF NOT EXISTS auth_identities (
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

-- ============================================================
-- 3. EMAIL VERIFICATION CHALLENGES
-- Stores temporary passwordless authentication challenges.
-- Never store raw verification codes.
-- ============================================================

CREATE TABLE IF NOT EXISTS auth_challenges (
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

-- ============================================================
-- 4. CUSTOMER SESSIONS
-- Separate from legacy portal and admin sessions.
-- Store hashed session tokens only.
-- ============================================================

CREATE TABLE IF NOT EXISTS customer_sessions (
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

-- ============================================================
-- 5. GOOGLE OAUTH STATES
-- Temporary state and PKCE information for secure OAuth.
-- ============================================================

CREATE TABLE IF NOT EXISTS auth_oauth_states (
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

-- ============================================================
-- 6. AUTHENTICATION RATE LIMITS
-- Protects authentication endpoints against abuse.
-- ============================================================

CREATE TABLE IF NOT EXISTS auth_rate_limits (
    rate_key TEXT PRIMARY KEY,

    attempts INTEGER NOT NULL DEFAULT 0,

    window_started_at TEXT NOT NULL,

    expires_at TEXT NOT NULL,

    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 7. AUTHENTICATION EVENTS
-- Security and account activity history.
-- ============================================================

CREATE TABLE IF NOT EXISTS auth_events (
    id TEXT PRIMARY KEY,

    client_id TEXT,

    event_type TEXT NOT NULL,

    provider TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (client_id)
        REFERENCES clients(id)
        ON DELETE SET NULL
);

-- ============================================================
-- 8. INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_customer_accounts_status
ON customer_accounts(status);

CREATE INDEX IF NOT EXISTS idx_customer_accounts_registered
ON customer_accounts(registered_at);

CREATE INDEX IF NOT EXISTS idx_auth_identities_client
ON auth_identities(client_id);

CREATE INDEX IF NOT EXISTS idx_auth_challenges_email
ON auth_challenges(email, purpose, created_at);

CREATE INDEX IF NOT EXISTS idx_auth_challenges_expires
ON auth_challenges(expires_at);

CREATE INDEX IF NOT EXISTS idx_customer_sessions_client
ON customer_sessions(client_id);

CREATE INDEX IF NOT EXISTS idx_customer_sessions_expires
ON customer_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_auth_oauth_states_expires
ON auth_oauth_states(expires_at);

CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_expires
ON auth_rate_limits(expires_at);

CREATE INDEX IF NOT EXISTS idx_auth_events_client
ON auth_events(client_id, created_at);

-- ============================================================
-- END OF MIGRATION
-- ============================================================
