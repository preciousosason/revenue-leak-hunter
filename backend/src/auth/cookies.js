
// ============================================================
// LEAKENDIA — AUTHENTICATION COOKIES
// File: backend/src/auth/cookies.js
// ============================================================

export const SESSION_COOKIE =
    "__Host-leakendia_session";

export const LOCAL_SESSION_COOKIE =
    "leakendia_session_local";

export const OAUTH_COOKIE =
    "__Host-leakendia_oauth";

export const LOCAL_OAUTH_COOKIE =
    "leakendia_oauth_local";

export const SESSION_MAX_AGE =
    60 * 60 * 24 * 7;

export const OAUTH_MAX_AGE =
    60 * 10;

// ============================================================
// LOCAL DEVELOPMENT DETECTION
// ============================================================

export function isLocalDevelopment(request) {
    const url = new URL(request.url);

    return (
        url.protocol === "http:" &&
        [
            "localhost",
            "127.0.0.1",
            "[::1]"
        ].includes(url.hostname)
    );
}

// ============================================================
// COOKIE NAME SELECTION
// ============================================================

export function getSessionCookieName(request) {
    return isLocalDevelopment(request)
        ? LOCAL_SESSION_COOKIE
        : SESSION_COOKIE;
}

export function getOAuthCookieName(request) {
    return isLocalDevelopment(request)
        ? LOCAL_OAUTH_COOKIE
        : OAUTH_COOKIE;
}

// ============================================================
// READ COOKIE
// ============================================================

export function readCookie(request, name) {
    const header =
        request.headers.get("Cookie") || "";

    const matches = [];

    for (const part of header.split(";")) {
        const index = part.indexOf("=");

        if (index === -1) {
            continue;
        }

        const key = part.slice(0, index).trim();

        if (key !== name) {
            continue;
        }

        try {
            matches.push(
                decodeURIComponent(
                    part.slice(index + 1).trim()
                )
            );
        } catch {
            return null;
        }
    }

    // Reject ambiguous duplicate cookies.
    return matches.length === 1
        ? matches[0]
        : null;
}

// ============================================================
// SERIALIZE COOKIE
// ============================================================

function serializeCookie(
    request,
    name,
    value,
    maxAge
) {
    const local = isLocalDevelopment(request);

    const parts = [
        `${name}=${encodeURIComponent(value)}`,
        "Path=/",
        "HttpOnly",
        "SameSite=Lax",
        `Max-Age=${Math.max(0, Math.floor(maxAge))}`
    ];

    if (!local) {
        parts.push("Secure");
    }

    if (maxAge === 0) {
        parts.push(
            "Expires=Thu, 01 Jan 1970 00:00:00 GMT"
        );
    }

    return parts.join("; ");
}

// ============================================================
// CUSTOMER SESSION COOKIE
// ============================================================

export function createSessionCookie(
    request,
    token
) {
    return serializeCookie(
        request,
        getSessionCookieName(request),
        token,
        SESSION_MAX_AGE
    );
}

export function readSessionCookie(request) {
    return readCookie(
        request,
        getSessionCookieName(request)
    );
}

export function clearSessionCookie(request) {
    return serializeCookie(
        request,
        getSessionCookieName(request),
        "",
        0
    );
}

// ============================================================
// GOOGLE OAUTH BROWSER BINDING COOKIE
// ============================================================

export function createOAuthCookie(
    request,
    token
) {
    return serializeCookie(
        request,
        getOAuthCookieName(request),
        token,
        OAUTH_MAX_AGE
    );
}

export function readOAuthCookie(request) {
    return readCookie(
        request,
        getOAuthCookieName(request)
    );
}

export function clearOAuthCookie(request) {
    return serializeCookie(
        request,
        getOAuthCookieName(request),
        "",
        0
    );
}

// ============================================================
// ATTACH COOKIE TO RESPONSE
// ============================================================

export function appendCookies(
    response,
    ...cookies
) {
    const headers = new Headers(response.headers);

    for (const cookie of cookies) {
        if (cookie) {
            headers.append("Set-Cookie", cookie);
        }
    }

    headers.set(
        "Cache-Control",
        "no-store"
    );

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
    });
}
