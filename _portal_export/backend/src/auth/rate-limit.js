
// ============================================================
// LEAKENDIA — AUTHENTICATION RATE LIMITING
// File: backend/src/auth/rate-limit.js
// ============================================================

import {
    hmacSha256
} from "./crypto.js";

// ============================================================
// RATE LIMIT POLICIES
// ============================================================

export const AUTH_LIMITS = Object.freeze({
    EMAIL_SEND_IP: Object.freeze({
        limit: 20,
        windowSeconds: 3600
    }),

    EMAIL_SEND_ADDRESS: Object.freeze({
        limit: 5,
        windowSeconds: 900
    }),

    EMAIL_VERIFY_IP: Object.freeze({
        limit: 30,
        windowSeconds: 900
    }),

    EMAIL_VERIFY_ADDRESS: Object.freeze({
        limit: 10,
        windowSeconds: 900
    }),

    GOOGLE_START_IP: Object.freeze({
        limit: 30,
        windowSeconds: 900
    })
});

// ============================================================
// CLIENT IP ADDRESS
// Trust Cloudflare-provided metadata only.
// ============================================================

export function getClientIP(request) {
    return request.headers.get(
        "CF-Connecting-IP"
    ) || "unknown";
}

// ============================================================
// GENERATE PRIVATE RATE LIMIT KEY
// ============================================================

export async function createRateKey(
    secret,
    scope,
    identifier
) {
    return hmacSha256(
        secret,
        JSON.stringify([
            "auth-rate-limit-v1",
            scope,
            String(identifier)
        ])
    );
}

// ============================================================
// ATOMIC FIXED-WINDOW RATE LIMIT
// ============================================================

export async function consumeRateLimit(
    db,
    key,
    policy
) {
    const {
        limit,
        windowSeconds
    } = policy;

    if (
        !Number.isInteger(limit) ||
        limit < 1 ||
        !Number.isInteger(windowSeconds) ||
        windowSeconds < 1
    ) {
        throw new Error("Invalid rate limit policy.");
    }

    const now = new Date();

    const nowValue = now.toISOString();

    const expiresAt = new Date(
        now.getTime() + windowSeconds * 1000
    ).toISOString();

    const result = await db.prepare(`
        INSERT INTO auth_rate_limits (
            rate_key,
            attempts,
            window_started_at,
            expires_at,
            updated_at
        )
        VALUES (?, 1, ?, ?, ?)

        ON CONFLICT(rate_key) DO UPDATE SET

            attempts = CASE
                WHEN auth_rate_limits.expires_at
                    <= excluded.window_started_at
                THEN 1

                ELSE MIN(
                    auth_rate_limits.attempts + 1,
                    ?
                )
            END,

            window_started_at = CASE
                WHEN auth_rate_limits.expires_at
                    <= excluded.window_started_at
                THEN excluded.window_started_at

                ELSE auth_rate_limits.window_started_at
            END,

            expires_at = CASE
                WHEN auth_rate_limits.expires_at
                    <= excluded.window_started_at
                THEN excluded.expires_at

                ELSE auth_rate_limits.expires_at
            END,

            updated_at = excluded.updated_at

        RETURNING attempts, expires_at
    `)
        .bind(
            key,
            nowValue,
            expiresAt,
            nowValue,
            limit + 1
        )
        .first();

    if (!result) {
        throw new Error(
            "Unable to evaluate authentication rate limit."
        );
    }

    const allowed = result.attempts <= limit;

    const retryAfter = Math.max(
        1,
        Math.ceil(
            (
                Date.parse(result.expires_at) -
                Date.now()
            ) / 1000
        )
    );

    return {
        allowed,
        limit,
        remaining: Math.max(
            0,
            limit - result.attempts
        ),
        retryAfter,
        expiresAt: result.expires_at
    };
}

// ============================================================
// RATE LIMIT RESPONSE
// ============================================================

export function rateLimitResponse(result) {
    return new Response(
        JSON.stringify({
            success: false,
            error: "Too many requests. Please try again later.",
            retryAfter: result.retryAfter
        }),
        {
            status: 429,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-store",
                "Retry-After": String(
                    result.retryAfter
                )
            }
        }
    );
}

// ============================================================
// REMOVE EXPIRED RATE LIMIT RECORDS
// Intended for scheduled maintenance.
// ============================================================

export async function cleanupRateLimits(db) {
    return db.prepare(`
        DELETE FROM auth_rate_limits

        WHERE expires_at <= ?
    `)
        .bind(new Date().toISOString())
        .run();
}
