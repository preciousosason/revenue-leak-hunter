
// ============================================================
// LEAKENDIA — CUSTOMER SESSION MANAGEMENT
// File: backend/src/auth/sessions.js
// ============================================================

import {
    generateId,
    generateSecureToken,
    sha256,
    nowISO,
    expiresIn
} from "./crypto.js";

import {
    SESSION_MAX_AGE,
    createSessionCookie,
    readSessionCookie,
    clearSessionCookie,
    appendCookies
} from "./cookies.js";

import {
    getCustomerAccount,
    assertAccountActive
} from "./accounts.js";


// ============================================================
// SESSION CONFIGURATION
// ============================================================

const LAST_SEEN_INTERVAL_MS =
    5 * 60 * 1000;

const SESSION_TOKEN_PATTERN =
    /^[A-Za-z0-9_-]{43}$/;


// ============================================================
// CREATE CUSTOMER SESSION
//
// Raw token is returned internally only.
// It must never be included in a JSON response.
// ============================================================

export async function createCustomerSession(
    env,
    clientId
) {

    assertAccountActive(
        await getCustomerAccount(
            env,
            clientId
        )
    );

    const sessionId = generateId();

    const token = generateSecureToken(32);

    const tokenHash = await sha256(token);

    const timestamp = nowISO();

    const expiresAt = expiresIn(
        SESSION_MAX_AGE
    );

    const result = await env.DB.prepare(`
        INSERT INTO customer_sessions (
            id,
            client_id,
            token_hash,
            created_at,
            expires_at,
            last_seen_at
        )

        SELECT
            ?, client_id, ?, ?, ?, ?

        FROM customer_accounts

        WHERE client_id = ?
          AND status = 'active'
    `)
        .bind(
            sessionId,
            tokenHash,
            timestamp,
            expiresAt,
            timestamp,
            clientId
        )
        .run();

    if (result.meta?.changes !== 1) {

        throw new Error(
            "Unable to create customer session."
        );

    }

    return {

        sessionId,

        token,

        expiresAt

    };

}


// ============================================================
// AUTHENTICATE CUSTOMER SESSION
//
// This is the primary authorization function for new
// authenticated customer API endpoints.
// ============================================================

export async function authenticateCustomer(
    request,
    env
) {

    const token = readSessionCookie(
        request
    );

    if (
        !token ||
        !SESSION_TOKEN_PATTERN.test(token)
    ) {

        return null;

    }

    const tokenHash = await sha256(token);

    const timestamp = nowISO();

    const session = await env.DB.prepare(`
        SELECT
            s.id AS session_id,
            s.client_id,
            s.created_at AS session_created_at,
            s.expires_at,
            s.last_seen_at,

            a.normalized_email,
            a.email_verified_at,
            a.status,
            a.avatar_url,
            a.registered_at,
            a.last_login_at,

            c.name,
            c.email,
            c.business,
            c.website

        FROM customer_sessions s

        INNER JOIN customer_accounts a
            ON a.client_id = s.client_id

        INNER JOIN clients c
            ON c.id = s.client_id

        WHERE s.token_hash = ?

          AND s.revoked_at IS NULL

          AND s.expires_at > ?

          AND a.status = 'active'

        LIMIT 1
    `)
        .bind(
            tokenHash,
            timestamp
        )
        .first();

    if (!session) {

        return null;

    }

    // --------------------------------------------------------
    // THROTTLED ACTIVITY UPDATE
    //
    // Avoid writing to D1 on every authenticated request.
    // --------------------------------------------------------

    const lastSeen = Date.parse(
        session.last_seen_at || ""
    );

    if (
        !Number.isFinite(lastSeen) ||
        Date.now() - lastSeen >
            LAST_SEEN_INTERVAL_MS
    ) {

        await env.DB.prepare(`
            UPDATE customer_sessions

            SET last_seen_at = ?

            WHERE id = ?

              AND revoked_at IS NULL

              AND expires_at > ?
        `)
            .bind(
                timestamp,
                session.session_id,
                timestamp
            )
            .run();

    }

    return session;

}


// ============================================================
// REVOKE CURRENT CUSTOMER SESSION
// ============================================================

export async function revokeCurrentSession(
    request,
    env
) {

    const token = readSessionCookie(
        request
    );

    if (
        !token ||
        !SESSION_TOKEN_PATTERN.test(token)
    ) {

        return false;

    }

    const tokenHash = await sha256(token);

    const result = await env.DB.prepare(`
        UPDATE customer_sessions

        SET revoked_at = ?

        WHERE token_hash = ?

          AND revoked_at IS NULL
    `)
        .bind(
            nowISO(),
            tokenHash
        )
        .run();

    return (result.meta?.changes || 0) > 0;

}


// ============================================================
// REVOKE ALL CUSTOMER SESSIONS
//
// Intended for account security, suspension and
// authenticated sign-out from all devices.
//
// Callers must enforce authorization.
// ============================================================

export async function revokeAllCustomerSessions(
    env,
    clientId
) {

    const result = await env.DB.prepare(`
        UPDATE customer_sessions

        SET revoked_at = ?

        WHERE client_id = ?

          AND revoked_at IS NULL
    `)
        .bind(
            nowISO(),
            clientId
        )
        .run();

    return result.meta?.changes || 0;

}


// ============================================================
// REVOKE A SPECIFIC CUSTOMER SESSION
//
// Session ownership is enforced in the database query.
// ============================================================

export async function revokeCustomerSession(
    env,
    clientId,
    sessionId
) {

    const result = await env.DB.prepare(`
        UPDATE customer_sessions

        SET revoked_at = ?

        WHERE id = ?

          AND client_id = ?

          AND revoked_at IS NULL
    `)
        .bind(
            nowISO(),
            sessionId,
            clientId
        )
        .run();

    return (result.meta?.changes || 0) > 0;

}


// ============================================================
// LIST ACTIVE CUSTOMER SESSIONS
//
// Never expose raw tokens or token hashes.
// ============================================================

export async function listCustomerSessions(
    env,
    clientId
) {

    const result = await env.DB.prepare(`
        SELECT
            id,
            created_at,
            expires_at,
            last_seen_at

        FROM customer_sessions

        WHERE client_id = ?

          AND revoked_at IS NULL

          AND expires_at > ?

        ORDER BY created_at DESC

        LIMIT 100
    `)
        .bind(
            clientId,
            nowISO()
        )
        .all();

    return result.results || [];

}


// ============================================================
// ATTACH AUTHENTICATED SESSION COOKIE
// ============================================================

export function attachCustomerSession(
    request,
    response,
    session
) {

    if (
        !session?.token ||
        !SESSION_TOKEN_PATTERN.test(
            session.token
        )
    ) {

        throw new Error(
            "Invalid customer session."
        );

    }

    return appendCookies(

        response,

        createSessionCookie(
            request,
            session.token
        )

    );

}


// ============================================================
// REMOVE AUTHENTICATION COOKIE
// ============================================================

export function removeCustomerSession(
    request,
    response
) {

    return appendCookies(

        response,

        clearSessionCookie(
            request
        )

    );

}


// ============================================================
// CLEAN UP EXPIRED AND OLD REVOKED SESSIONS
//
// Intended for scheduled maintenance.
// ============================================================

export async function cleanupCustomerSessions(
    env
) {

    const timestamp = nowISO();

    const retentionCutoff = new Date(
        Date.now() -
        30 * 24 * 60 * 60 * 1000
    ).toISOString();

    return env.DB.prepare(`
        DELETE FROM customer_sessions

        WHERE expires_at <= ?

           OR (
                revoked_at IS NOT NULL

                AND revoked_at <= ?
           )
    `)
        .bind(
            timestamp,
            retentionCutoff
        )
        .run();

}
