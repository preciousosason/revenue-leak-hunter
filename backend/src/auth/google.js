
// ============================================================
// LEAKENDIA — GOOGLE CUSTOMER AUTHENTICATION
// File: backend/src/auth/google.js
// ============================================================

import {
    generateId,
    generateSecureToken,
    generatePKCE,
    sha256,
    normalizeEmail,
    isValidEmail,
    secureCompare,
    nowISO,
    expiresIn
} from "./crypto.js";

import {
    OAUTH_MAX_AGE,
    createOAuthCookie,
    readOAuthCookie,
    clearOAuthCookie,
    appendCookies
} from "./cookies.js";

import {
    AUTH_LIMITS,
    getClientIP,
    createRateKey,
    consumeRateLimit
} from "./rate-limit.js";

import {
    resolveVerifiedCustomer
} from "./accounts.js";

import {
    createCustomerSession
} from "./sessions.js";


// ============================================================
// GOOGLE ENDPOINTS
// ============================================================

const GOOGLE_AUTH_URL =
    "https://accounts.google.com/o/oauth2/v2/auth";

const GOOGLE_TOKEN_URL =
    "https://oauth2.googleapis.com/token";

const GOOGLE_JWKS_URL =
    "https://www.googleapis.com/oauth2/v3/certs";

const GOOGLE_ISSUERS = new Set([
    "https://accounts.google.com",
    "accounts.google.com"
]);

const decoder = new TextDecoder();


// ============================================================
// GOOGLE AUTHENTICATION ERROR
// ============================================================

export class GoogleAuthError extends Error {

    constructor(
        message,
        code,
        status = 400,
        retryAfter = null
    ) {

        super(message);

        this.name = "GoogleAuthError";
        this.code = code;
        this.status = status;
        this.retryAfter = retryAfter;

    }

}


// ============================================================
// CONFIGURATION
// ============================================================

function getGoogleConfig(env) {

    const clientId =
        env.CUSTOMER_GOOGLE_CLIENT_ID;

    const clientSecret =
        env.CUSTOMER_GOOGLE_CLIENT_SECRET;

    const redirectUri =
        env.CUSTOMER_GOOGLE_REDIRECT_URI;

    if (
        !clientId ||
        !clientSecret ||
        !redirectUri
    ) {

        throw new GoogleAuthError(
            "Google authentication is not configured.",
            "GOOGLE_NOT_CONFIGURED",
            503
        );

    }

    const url = new URL(redirectUri);

    const local =
        url.protocol === "http:" &&
        ["localhost", "127.0.0.1"]
            .includes(url.hostname);

    if (
        (!local && url.protocol !== "https:") ||
        url.username ||
        url.password ||
        url.search ||
        url.hash ||
        url.pathname !== "/api/auth/google/callback"
    ) {

        throw new GoogleAuthError(
            "Invalid Google authentication configuration.",
            "INVALID_GOOGLE_CONFIG",
            503
        );

    }

    return {
        clientId,
        clientSecret,
        redirectUri
    };

}


// ============================================================
// SAFE RETURN PATH
//
// Prevent open redirects to external websites.
// ============================================================

export function sanitizeReturnPath(value) {

    if (
        typeof value !== "string" ||
        value.length > 2048 ||
        !value.startsWith("/") ||
        value.startsWith("//") ||
        /[\\\u0000-\u0020\u007f]/.test(value)
    ) {

        return "/";

    }

    try {

        const origin = "https://leakendia.com";

        const url = new URL(value, origin);

        if (url.origin !== origin) {

            return "/";

        }

        // Prevent encoded slash/backslash ambiguities.

        const decoded = decodeURIComponent(
            url.pathname
        );

        if (
            decoded.startsWith("//") ||
            /[\\\u0000-\u0020\u007f]/.test(decoded)
        ) {

            return "/";

        }

        // Prevent redirect loops into authentication APIs.

        if (
            decoded.toLowerCase().startsWith("/api/")
        ) {

            return "/";

        }

        return (
            url.pathname +
            url.search +
            url.hash
        );

    } catch {

        return "/";

    }

}


// ============================================================
// BASE64URL DECODING
// ============================================================

function decodeBase64Url(value) {

    if (
        typeof value !== "string" ||
        !/^[A-Za-z0-9_-]+$/.test(value)
    ) {

        throw new Error("Invalid base64url value.");

    }

    const base64 = value
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const padded = base64.padEnd(
        Math.ceil(base64.length / 4) * 4,
        "="
    );

    return Uint8Array.from(
        atob(padded),
        char => char.charCodeAt(0)
    );

}


// ============================================================
// INVALID GOOGLE IDENTITY ERROR
// ============================================================

function invalidIdentity() {

    return new GoogleAuthError(
        "Google identity verification failed.",
        "INVALID_GOOGLE_IDENTITY",
        401
    );

}


// ============================================================
// START GOOGLE AUTHENTICATION
// ============================================================

export async function startGoogleAuthentication(
    request,
    env,
    returnPath = "/"
) {

    const config = getGoogleConfig(env);

    // --------------------------------------------------------
    // RATE LIMIT
    // --------------------------------------------------------

    const rateKey = await createRateKey(
        env.AUTH_SECRET,
        "google-start-ip",
        getClientIP(request)
    );

    const rate = await consumeRateLimit(
        env.DB,
        rateKey,
        AUTH_LIMITS.GOOGLE_START_IP
    );

    if (!rate.allowed) {

        throw new GoogleAuthError(
            "Too many authentication requests.",
            "RATE_LIMITED",
            429,
            rate.retryAfter
        );

    }

    // --------------------------------------------------------
    // GENERATE OAUTH SECURITY VALUES
    // --------------------------------------------------------

    const state = generateSecureToken(32);

    const nonce = generateSecureToken(32);

    const browserBinding =
        generateSecureToken(32);

    const pkce = await generatePKCE();

    const stateHash = await sha256(state);

    const browserBindingHash =
        await sha256(browserBinding);

    // --------------------------------------------------------
    // STORE TEMPORARY OAUTH STATE
    // --------------------------------------------------------

    await env.DB.prepare(`
        INSERT INTO auth_oauth_states (
            id,
            state_hash,
            browser_binding_hash,
            code_verifier,
            nonce,
            return_path,
            expires_at,
            created_at
        )

        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
        .bind(
            generateId(),
            stateHash,
            browserBindingHash,
            pkce.verifier,
            nonce,
            sanitizeReturnPath(returnPath),
            expiresIn(OAUTH_MAX_AGE),
            nowISO()
        )
        .run();

    // --------------------------------------------------------
    // BUILD GOOGLE AUTHORIZATION URL
    // --------------------------------------------------------

    const authorizationUrl =
        new URL(GOOGLE_AUTH_URL);

    authorizationUrl.search =
        new URLSearchParams({

            client_id: config.clientId,

            redirect_uri: config.redirectUri,

            response_type: "code",

            scope: "openid email profile",

            state,

            nonce,

            code_challenge: pkce.challenge,

            code_challenge_method: "S256",

            access_type: "online",

            prompt: "select_account"

        }).toString();

    const response = new Response(null, {

        status: 302,

        headers: {

            Location: authorizationUrl.href,

            "Cache-Control": "no-store",

            "Referrer-Policy": "no-referrer"

        }

    });

    return appendCookies(

        response,

        createOAuthCookie(
            request,
            browserBinding
        )

    );

}


// ============================================================
// VALIDATE AND CONSUME OAUTH STATE
// ============================================================

async function consumeOAuthState(
    request,
    env,
    state
) {

    const browserBinding =
        readOAuthCookie(request);

    const tokenPattern =
        /^[A-Za-z0-9_-]{43}$/;

    if (
        typeof state !== "string" ||
        !tokenPattern.test(state) ||
        !browserBinding ||
        !tokenPattern.test(browserBinding)
    ) {

        throw new GoogleAuthError(
            "Authentication session is invalid or expired.",
            "INVALID_OAUTH_STATE",
            400
        );

    }

    const stateHash = await sha256(state);

    const browserBindingHash =
        await sha256(browserBinding);

    // Atomic single-use state consumption.

    const result = await env.DB.prepare(`
        UPDATE auth_oauth_states

        SET consumed_at = ?

        WHERE state_hash = ?

          AND browser_binding_hash = ?

          AND consumed_at IS NULL

          AND expires_at > ?

        RETURNING
            id,
            code_verifier,
            nonce,
            return_path
    `)
        .bind(
            nowISO(),
            stateHash,
            browserBindingHash,
            nowISO()
        )
        .first();

    if (!result) {

        throw new GoogleAuthError(
            "Authentication session is invalid or expired.",
            "INVALID_OAUTH_STATE",
            400
        );

    }

    return result;

}


// ============================================================
// EXCHANGE AUTHORIZATION CODE
// ============================================================

async function exchangeGoogleCode(
    config,
    code,
    verifier
) {

    if (
        typeof code !== "string" ||
        !code ||
        code.length > 4096
    ) {

        throw new GoogleAuthError(
            "Invalid Google authorization code.",
            "INVALID_GOOGLE_CODE",
            400
        );

    }

    let response;

    try {

        response = await fetch(
            GOOGLE_TOKEN_URL,
            {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded"
                },

                body: new URLSearchParams({

                    code,

                    client_id: config.clientId,

                    client_secret: config.clientSecret,

                    redirect_uri: config.redirectUri,

                    grant_type: "authorization_code",

                    code_verifier: verifier

                }),

                redirect: "error",

                signal: AbortSignal.timeout(10000)

            }
        );

    } catch {

        throw new GoogleAuthError(
            "Google authentication is temporarily unavailable.",
            "GOOGLE_CONNECTION_FAILED",
            503
        );

    }

    if (!response.ok) {

        throw new GoogleAuthError(
            "Google authorization could not be completed.",
            "GOOGLE_TOKEN_EXCHANGE_FAILED",
            401
        );

    }

    let tokens;

    try {

        tokens = await response.json();

    } catch {

        throw invalidIdentity();

    }

    if (
        typeof tokens.id_token !== "string" ||
        !tokens.id_token
    ) {

        throw invalidIdentity();

    }

    return tokens.id_token;

}


// ============================================================
// GOOGLE PUBLIC SIGNING KEYS
// ============================================================

let cachedKeys = null;

let keysExpireAt = 0;

async function getGoogleKeys(forceRefresh = false) {

    if (
        !forceRefresh &&
        cachedKeys &&
        Date.now() < keysExpireAt
    ) {

        return cachedKeys;

    }

    const response = await fetch(
        GOOGLE_JWKS_URL,
        {
            redirect: "error",
            signal: AbortSignal.timeout(10000)
        }
    );

    if (!response.ok) {

        throw new GoogleAuthError(
            "Google signing keys are unavailable.",
            "GOOGLE_KEYS_UNAVAILABLE",
            503
        );

    }

    const data = await response.json();

    if (!Array.isArray(data.keys)) {

        throw invalidIdentity();

    }

    const cacheControl =
        response.headers.get("Cache-Control") || "";

    const match =
        cacheControl.match(/max-age=(\d+)/i);

    const maxAge = match
        ? Number(match[1])
        : 0;

    const age = Number(
        response.headers.get("Age") || 0
    );

    const ttl = Math.max(
        0,
        Math.min(maxAge - age, 3600)
    );

    cachedKeys = data.keys;

    keysExpireAt = Date.now() + ttl * 1000;

    return cachedKeys;

}


// ============================================================
// VERIFY GOOGLE ID TOKEN SIGNATURE AND CLAIMS
// ============================================================

async function verifyGoogleIdToken(
    idToken,
    config,
    expectedNonce
) {

    if (
        typeof idToken !== "string" ||
        idToken.length > 16384
    ) {

        throw invalidIdentity();

    }

    const parts = idToken.split(".");

    if (parts.length !== 3) {

        throw invalidIdentity();

    }

    const [
        encodedHeader,
        encodedPayload,
        encodedSignature
    ] = parts;

    let header;
    let payload;
    let signature;

    try {

        header = JSON.parse(
            decoder.decode(
                decodeBase64Url(encodedHeader)
            )
        );

        payload = JSON.parse(
            decoder.decode(
                decodeBase64Url(encodedPayload)
            )
        );

        signature = decodeBase64Url(
            encodedSignature
        );

    } catch {

        throw invalidIdentity();

    }

    // --------------------------------------------------------
    // VALIDATE SIGNING ALGORITHM
    // --------------------------------------------------------

    if (
        !header ||
        typeof header !== "object" ||
        header.alg !== "RS256" ||
        typeof header.kid !== "string" ||
        !header.kid ||
        header.kid.length > 256 ||
        header.crit !== undefined
    ) {

        throw invalidIdentity();

    }

    // --------------------------------------------------------
    // FIND GOOGLE SIGNING KEY
    // --------------------------------------------------------

    const matchesKey = key =>
        key.kid === header.kid &&
        key.kty === "RSA" &&
        (!key.alg || key.alg === "RS256") &&
        (!key.use || key.use === "sig");

    let keys = await getGoogleKeys();

    let jwk = keys.find(matchesKey);

    if (!jwk) {

        keys = await getGoogleKeys(true);

        jwk = keys.find(matchesKey);

    }

    if (!jwk) {

        throw invalidIdentity();

    }

    // --------------------------------------------------------
    // CRYPTOGRAPHIC SIGNATURE VERIFICATION
    // --------------------------------------------------------

    let validSignature;

    try {

        const key = await crypto.subtle.importKey(

            "jwk",

            jwk,

            {
                name: "RSASSA-PKCS1-v1_5",
                hash: "SHA-256"
            },

            false,

            ["verify"]

        );

        validSignature = await crypto.subtle.verify(

            "RSASSA-PKCS1-v1_5",

            key,

            signature,

            new TextEncoder().encode(
                `${encodedHeader}.${encodedPayload}`
            )

        );

    } catch {

        throw invalidIdentity();

    }

    if (!validSignature) {

        throw invalidIdentity();

    }

    // --------------------------------------------------------
    // VALIDATE TOKEN CLAIMS
    // --------------------------------------------------------

    if (
        !payload ||
        typeof payload !== "object"
    ) {

        throw invalidIdentity();

    }

    const now = Math.floor(Date.now() / 1000);

    const audiences = Array.isArray(payload.aud)
        ? payload.aud
        : [payload.aud];

    if (
        !GOOGLE_ISSUERS.has(payload.iss) ||

        !audiences.includes(config.clientId) ||

        (
            audiences.length > 1 &&
            payload.azp !== config.clientId
        ) ||

        (
            payload.azp !== undefined &&
            payload.azp !== config.clientId
        ) ||

        !Number.isFinite(payload.exp) ||

        payload.exp <= now ||

        !Number.isFinite(payload.iat) ||

        payload.iat > now + 60 ||

        payload.iat < now - 900 ||

        (
            payload.nbf !== undefined &&
            (
                !Number.isFinite(payload.nbf) ||
                payload.nbf > now + 60
            )
        ) ||

        typeof payload.sub !== "string" ||

        !payload.sub ||

        payload.sub.length > 255 ||

        typeof payload.nonce !== "string" ||

        !secureCompare(
            payload.nonce,
            expectedNonce
        )

    ) {

        throw invalidIdentity();

    }

    // --------------------------------------------------------
    // VALIDATE VERIFIED EMAIL
    // --------------------------------------------------------

    const email = normalizeEmail(payload.email);

    if (
        payload.email_verified !== true ||
        !isValidEmail(email)
    ) {

        throw new GoogleAuthError(
            "Google has not verified this email address.",
            "GOOGLE_EMAIL_NOT_VERIFIED",
            403
        );

    }

    // Google is authoritative for Gmail addresses and
    // verified Google Workspace hosted-domain identities.
    //
    // Other email domains require separate mailbox
    // verification before being accepted.

    const authoritativeEmail =

        email.endsWith("@gmail.com") ||

        (
            typeof payload.hd === "string" &&
            payload.hd.length > 0
        );

    if (!authoritativeEmail) {

        throw new GoogleAuthError(
            "Please verify this email address using email authentication.",
            "GOOGLE_EMAIL_VERIFICATION_REQUIRED",
            403
        );

    }

    return {

        provider: "google",

        subject: payload.sub,

        email,

        emailVerified: true,

        name: payload.name || "",

        avatarUrl: payload.picture || null

    };

}


// ============================================================
// COMPLETE GOOGLE AUTHENTICATION
// ============================================================

export async function completeGoogleAuthentication(
    request,
    env
) {

    const config = getGoogleConfig(env);

    const url = new URL(request.url);

    const state = url.searchParams.get("state");

    // Validate browser binding before handling callback.

    const oauthState = await consumeOAuthState(
        request,
        env,
        state
    );

    if (url.searchParams.has("error")) {

        throw new GoogleAuthError(
            "Google authentication was cancelled or denied.",
            "GOOGLE_AUTH_CANCELLED",
            400
        );

    }

    const code = url.searchParams.get("code");

    // --------------------------------------------------------
    // EXCHANGE CODE FOR GOOGLE ID TOKEN
    // --------------------------------------------------------

    const idToken = await exchangeGoogleCode(
        config,
        code,
        oauthState.code_verifier
    );

    // --------------------------------------------------------
    // VERIFY GOOGLE IDENTITY
    // --------------------------------------------------------

    const identity = await verifyGoogleIdToken(
        idToken,
        config,
        oauthState.nonce
    );

    // --------------------------------------------------------
    // RESOLVE OR REGISTER CUSTOMER
    // --------------------------------------------------------

    const result = await resolveVerifiedCustomer(
        env,
        identity
    );

    // --------------------------------------------------------
    // CREATE LEAKENDIA CUSTOMER SESSION
    // --------------------------------------------------------

    const session = await createCustomerSession(
        env,
        result.account.client_id
    );

    return {

        account: result.account,

        created: result.created,

        linked: result.linked,

        session,

        returnPath: sanitizeReturnPath(
            oauthState.return_path
        )

    };

}


// ============================================================
// REMOVE TEMPORARY OAUTH COOKIE
// ============================================================

export function removeGoogleOAuthCookie(
    request,
    response
) {

    return appendCookies(

        response,

        clearOAuthCookie(request)

    );

}


// ============================================================
// CLEANUP EXPIRED OAUTH STATES
// ============================================================

export async function cleanupGoogleOAuthStates(env) {

    return env.DB.prepare(`
        DELETE FROM auth_oauth_states

        WHERE expires_at <= ?

           OR consumed_at IS NOT NULL
    `)
        .bind(nowISO())
        .run();

}
