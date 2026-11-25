
// ============================================================
// LEAKENDIA — AUTHENTICATION HTTP SECURITY
// File: backend/src/auth/security.js
// ============================================================

const MAX_JSON_BYTES = 16 * 1024;


// ============================================================
// HTTP ERROR
// ============================================================

export class AuthHttpError extends Error {

    constructor(message, code, status = 400) {

        super(message);

        this.name = "AuthHttpError";
        this.code = code;
        this.status = status;

    }

}


// ============================================================
// TRUSTED ORIGIN
// ============================================================

export function getTrustedOrigin(env) {

    const configured =
        env.AUTH_PUBLIC_ORIGIN;

    if (!configured) {

        throw new AuthHttpError(
            "Authentication origin is not configured.",
            "AUTH_CONFIGURATION_ERROR",
            503
        );

    }

    let url;

    try {

        url = new URL(configured);

    } catch {

        throw new AuthHttpError(
            "Invalid authentication origin.",
            "AUTH_CONFIGURATION_ERROR",
            503
        );

    }

    const local =
        url.protocol === "http:" &&
        ["localhost", "127.0.0.1"]
            .includes(url.hostname);

    if (
        (!local && url.protocol !== "https:") ||
        url.username ||
        url.password ||
        url.pathname !== "/" ||
        url.search ||
        url.hash
    ) {

        throw new AuthHttpError(
            "Invalid authentication origin.",
            "AUTH_CONFIGURATION_ERROR",
            503
        );

    }

    return url.origin;

}


// ============================================================
// VERIFY REQUEST HOST
// ============================================================

export function assertTrustedHost(request, env) {

    const trustedOrigin =
        getTrustedOrigin(env);

    const requestOrigin =
        new URL(request.url).origin;

    if (requestOrigin !== trustedOrigin) {

        throw new AuthHttpError(
            "Untrusted authentication host.",
            "UNTRUSTED_HOST",
            403
        );

    }

}


// ============================================================
// CSRF PROTECTION
//
// All state-changing browser requests must originate
// from the configured Leakendia website.
// ============================================================

export function assertSameOrigin(request, env) {

    assertTrustedHost(request, env);

    const trustedOrigin =
        getTrustedOrigin(env);

    const origin =
        request.headers.get("Origin");

    if (
        !origin ||
        origin !== trustedOrigin
    ) {

        throw new AuthHttpError(
            "Request origin is not permitted.",
            "INVALID_REQUEST_ORIGIN",
            403
        );

    }

    const fetchSite =
        request.headers.get("Sec-Fetch-Site");

    if (
        fetchSite &&
        fetchSite !== "same-origin"
    ) {

        throw new AuthHttpError(
            "Cross-site request rejected.",
            "CROSS_SITE_REQUEST",
            403
        );

    }

}


// ============================================================
// REQUIRE HTTP METHOD
// ============================================================

export function requireMethod(request, method) {

    if (request.method !== method) {

        const error = new AuthHttpError(
            "HTTP method not allowed.",
            "METHOD_NOT_ALLOWED",
            405
        );

        error.allowedMethod = method;

        throw error;

    }

}


// ============================================================
// READ BOUNDED JSON REQUEST
// ============================================================

export async function readAuthJSON(request) {

    const contentType = (
        request.headers.get("Content-Type") || ""
    )
        .split(";")[0]
        .trim()
        .toLowerCase();

    if (contentType !== "application/json") {

        throw new AuthHttpError(
            "Content-Type must be application/json.",
            "INVALID_CONTENT_TYPE",
            415
        );

    }

    const contentLength =
        request.headers.get("Content-Length");

    if (
        contentLength !== null &&
        Number(contentLength) > MAX_JSON_BYTES
    ) {

        throw new AuthHttpError(
            "Request body is too large.",
            "PAYLOAD_TOO_LARGE",
            413
        );

    }

    if (!request.body) {

        throw new AuthHttpError(
            "Request body is required.",
            "MISSING_REQUEST_BODY"
        );

    }

    const reader = request.body.getReader();

    const decoder = new TextDecoder(
        "utf-8",
        { fatal: true }
    );

    let size = 0;
    let text = "";

    try {

        while (true) {

            const { done, value } =
                await reader.read();

            if (done) {

                break;

            }

            size += value.byteLength;

            if (size > MAX_JSON_BYTES) {

                await reader.cancel();

                throw new AuthHttpError(
                    "Request body is too large.",
                    "PAYLOAD_TOO_LARGE",
                    413
                );

            }

            text += decoder.decode(
                value,
                { stream: true }
            );

        }

        text += decoder.decode();

    } catch (error) {

        if (error instanceof AuthHttpError) {

            throw error;

        }

        throw new AuthHttpError(
            "Unable to read request body.",
            "INVALID_REQUEST_BODY"
        );

    } finally {

        reader.releaseLock();

    }

    let data;

    try {

        data = JSON.parse(text);

    } catch {

        throw new AuthHttpError(
            "Invalid JSON request.",
            "INVALID_JSON"
        );

    }

    if (
        !data ||
        typeof data !== "object" ||
        Array.isArray(data)
    ) {

        throw new AuthHttpError(
            "A JSON object is required.",
            "INVALID_JSON_OBJECT"
        );

    }

    return data;

}


// ============================================================
// SECURE RESPONSE HEADERS
// ============================================================

export function secureAuthHeaders(headers = {}) {

    const result = new Headers(headers);

    result.set(
        "Cache-Control",
        "no-store, private"
    );

    result.set(
        "Pragma",
        "no-cache"
    );

    result.set(
        "X-Content-Type-Options",
        "nosniff"
    );

    result.set(
        "X-Frame-Options",
        "DENY"
    );

    result.set(
        "Referrer-Policy",
        "no-referrer"
    );

    result.set(
        "Content-Security-Policy",
        "default-src 'none'; frame-ancestors 'none'; base-uri 'none'"
    );

    return result;

}


// ============================================================
// JSON RESPONSE
// ============================================================

export function authJSON(
    data,
    status = 200,
    headers = {}
) {

    const responseHeaders =
        secureAuthHeaders(headers);

    responseHeaders.set(
        "Content-Type",
        "application/json; charset=utf-8"
    );

    return new Response(
        JSON.stringify(data),
        {
            status,
            headers: responseHeaders
        }
    );

}


// ============================================================
// REDIRECT RESPONSE
// ============================================================

export function authRedirect(location) {

    return new Response(null, {

        status: 303,

        headers: secureAuthHeaders({
            Location: location
        })

    });

}
