
// ============================================================
// LEAKENDIA — AUTHENTICATION CRYPTOGRAPHY
// File: backend/src/auth/crypto.js
// ============================================================

const encoder = new TextEncoder();

// ============================================================
// BASE64 URL ENCODING
// ============================================================

export function base64UrlEncode(bytes) {
    const binary = Array.from(
        bytes,
        byte => String.fromCharCode(byte)
    ).join("");

    return btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
}

// ============================================================
// SECURE RANDOM TOKEN
// ============================================================

export function generateSecureToken(length = 32) {
    if (
        !Number.isInteger(length) ||
        length < 16 ||
        length > 128
    ) {
        throw new Error("Invalid token length.");
    }

    const bytes = new Uint8Array(length);

    crypto.getRandomValues(bytes);

    return base64UrlEncode(bytes);
}

// ============================================================
// UNIQUE IDENTIFIER
// ============================================================

export function generateId() {
    return crypto.randomUUID();
}

// ============================================================
// SHA-256 HASH
// Used for high-entropy session tokens.
// ============================================================

export async function sha256(value) {
    const buffer = await crypto.subtle.digest(
        "SHA-256",
        encoder.encode(String(value))
    );

    return Array.from(new Uint8Array(buffer))
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");
}

// ============================================================
// HMAC SHA-256
// Used for low-entropy verification codes.
// ============================================================

export async function hmacSha256(secret, value) {
    if (
        typeof secret !== "string" ||
        secret.length < 32
    ) {
        throw new Error(
            "Authentication secret is missing or too short."
        );
    }

    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        {
            name: "HMAC",
            hash: "SHA-256"
        },
        false,
        ["sign"]
    );

    const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(String(value))
    );

    return Array.from(new Uint8Array(signature))
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");
}

// ============================================================
// SECURE NUMERIC VERIFICATION CODE
// Rejection sampling prevents modulo bias.
// ============================================================

export function generateVerificationCode(digits = 6) {
    if (
        !Number.isInteger(digits) ||
        digits < 6 ||
        digits > 8
    ) {
        throw new Error("Invalid verification code length.");
    }

    const range = 10 ** digits;

    const limit =
        Math.floor(4294967296 / range) * range;

    const buffer = new Uint32Array(1);

    do {
        crypto.getRandomValues(buffer);
    } while (buffer[0] >= limit);

    return String(buffer[0] % range)
        .padStart(digits, "0");
}

// ============================================================
// HASH VERIFICATION CODE
// Binds the code to a specific authentication challenge.
// ============================================================

export async function hashVerificationCode(
    secret,
    challengeId,
    email,
    code
) {
    return hmacSha256(
        secret,
        JSON.stringify([
            "email-verification-v1",
            challengeId,
            normalizeEmail(email),
            String(code)
        ])
    );
}

// ============================================================
// CONSTANT-TIME HASH COMPARISON
// Cloudflare Workers native implementation.
// ============================================================

export function secureCompare(first, second) {
    if (
        typeof first !== "string" ||
        typeof second !== "string"
    ) {
        return false;
    }

    const a = encoder.encode(first);
    const b = encoder.encode(second);

    if (a.byteLength !== b.byteLength) {
        return false;
    }

    return crypto.subtle.timingSafeEqual(a, b);
}

// ============================================================
// EMAIL NORMALIZATION
// ============================================================

export function normalizeEmail(email) {
    return typeof email === "string"
        ? email.trim().toLowerCase()
        : "";
}

// ============================================================
// BASIC EMAIL VALIDATION
// Ownership must still be verified.
// ============================================================

export function isValidEmail(email) {
    const normalized = normalizeEmail(email);

    if (
        !normalized ||
        normalized.length > 254
    ) {
        return false;
    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(normalized);
}

// ============================================================
// GOOGLE OAUTH PKCE
// ============================================================

export async function generatePKCE() {
    const verifier = generateSecureToken(32);

    const digest = await crypto.subtle.digest(
        "SHA-256",
        encoder.encode(verifier)
    );

    return {
        verifier,
        challenge: base64UrlEncode(
            new Uint8Array(digest)
        ),
        method: "S256"
    };
}

// ============================================================
// TIMESTAMP UTILITIES
// ============================================================

export function nowISO() {
    return new Date().toISOString();
}

export function expiresIn(seconds) {
    if (
        !Number.isFinite(seconds) ||
        seconds <= 0
    ) {
        throw new Error("Invalid expiration duration.");
    }

    return new Date(
        Date.now() + seconds * 1000
    ).toISOString();
}

export function isExpired(timestamp) {
    const time = Date.parse(timestamp);

    return !Number.isFinite(time) ||
        time <= Date.now();
}
