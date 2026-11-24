
// ============================================================
// LEAKENDIA — PASSWORDLESS EMAIL AUTHENTICATION
// File: backend/src/auth/email.js
// ============================================================

import {

    generateId,

    generateVerificationCode,

    hashVerificationCode,

    normalizeEmail,

    isValidEmail,

    secureCompare,

    nowISO,

    expiresIn

} from "./crypto.js";

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

import {

    sendAuthVerificationEmail

} from "../email/email.js";


// ============================================================
// CONFIGURATION
// ============================================================

export const EMAIL_AUTH_CONFIG = Object.freeze({

    CODE_DIGITS: 6,

    CODE_EXPIRY_SECONDS: 600,

    MAX_ATTEMPTS: 5

});


// ============================================================
// EMAIL AUTHENTICATION ERROR
// ============================================================

export class EmailAuthError extends Error {

    constructor(
        message,
        code,
        status = 400,
        retryAfter = null
    ) {

        super(message);

        this.name = "EmailAuthError";

        this.code = code;

        this.status = status;

        this.retryAfter = retryAfter;

    }

}


// ============================================================
// VALIDATE EMAIL ADDRESS
// ============================================================

function validateEmail(value) {

    const email = normalizeEmail(value);

    if (!isValidEmail(email)) {

        throw new EmailAuthError(

            "Please enter a valid email address.",

            "INVALID_EMAIL"

        );

    }

    return email;

}


// ============================================================
// GENERIC INVALID CHALLENGE ERROR
// ============================================================

function invalidChallenge() {

    return new EmailAuthError(

        "The verification code is invalid or expired. Please request a new code.",

        "INVALID_OR_EXPIRED_CODE",

        400

    );

}


// ============================================================
// ENFORCE RATE LIMIT
// ============================================================

async function enforceLimit(
    env,
    scope,
    identifier,
    policy
) {

    const key = await createRateKey(

        env.AUTH_SECRET,

        scope,

        identifier

    );

    const result = await consumeRateLimit(

        env.DB,

        key,

        policy

    );

    if (!result.allowed) {

        throw new EmailAuthError(

            "Too many requests. Please try again later.",

            "RATE_LIMITED",

            429,

            result.retryAfter

        );

    }

}


// ============================================================
// REQUEST EMAIL VERIFICATION CODE
// ============================================================

export async function requestEmailVerification(
    request,
    env,
    rawEmail
) {

    const email = validateEmail(rawEmail);

    const ip = getClientIP(request);

    // --------------------------------------------------------
    // RATE LIMITS
    // --------------------------------------------------------

    await enforceLimit(

        env,

        "email-send-ip",

        ip,

        AUTH_LIMITS.EMAIL_SEND_IP

    );

    await enforceLimit(

        env,

        "email-send-address",

        email,

        AUTH_LIMITS.EMAIL_SEND_ADDRESS

    );

    // --------------------------------------------------------
    // GENERATE CHALLENGE
    // --------------------------------------------------------

    const challengeId = generateId();

    const code = generateVerificationCode(

        EMAIL_AUTH_CONFIG.CODE_DIGITS

    );

    const codeHash = await hashVerificationCode(

        env.AUTH_SECRET,

        challengeId,

        email,

        code

    );

    const timestamp = nowISO();

    const expiresAt = expiresIn(

        EMAIL_AUTH_CONFIG.CODE_EXPIRY_SECONDS

    );

    // --------------------------------------------------------
    // INVALIDATE OLD CHALLENGES AND CREATE NEW CHALLENGE
    // --------------------------------------------------------

    await env.DB.batch([

        env.DB.prepare(`

            UPDATE auth_challenges

            SET consumed_at = ?

            WHERE email = ?

              AND purpose = 'sign_in'

              AND consumed_at IS NULL

        `)
            .bind(
                timestamp,
                email
            ),

        env.DB.prepare(`

            INSERT INTO auth_challenges (

                id,

                email,

                code_hash,

                purpose,

                attempts,

                max_attempts,

                expires_at,

                created_at

            )

            VALUES (

                ?, ?, ?, 'sign_in', 0, ?, ?, ?

            )

        `)
            .bind(

                challengeId,

                email,

                codeHash,

                EMAIL_AUTH_CONFIG.MAX_ATTEMPTS,

                expiresAt,

                timestamp

            )

    ]);

    // --------------------------------------------------------
    // SEND VERIFICATION EMAIL
    // --------------------------------------------------------

    try {

        await sendAuthVerificationEmail(

            env,

            {

                email,

                code,

                challengeId,

                expiresMinutes:

                    EMAIL_AUTH_CONFIG.CODE_EXPIRY_SECONDS / 60

            }

        );

    } catch {

        // Invalidate this challenge if delivery fails.
        // Never log the verification code.

        await env.DB.prepare(`

            UPDATE auth_challenges

            SET consumed_at = ?

            WHERE id = ?

              AND consumed_at IS NULL

        `)
            .bind(

                nowISO(),

                challengeId

            )
            .run();

        throw new EmailAuthError(

            "Unable to send the verification email. Please try again later.",

            "EMAIL_DELIVERY_FAILED",

            503

        );

    }

    // Do not return the code or its hash.

    return {

        challengeId,

        email,

        expiresAt,

        expiresIn:

            EMAIL_AUTH_CONFIG.CODE_EXPIRY_SECONDS

    };

}


// ============================================================
// VERIFY AND CONSUME EMAIL CHALLENGE
// ============================================================

export async function verifyEmailChallenge(
    request,
    env,
    {
        email: rawEmail,
        challengeId,
        code
    } = {}
) {

    const email = validateEmail(rawEmail);

    const ip = getClientIP(request);

    // --------------------------------------------------------
    // RATE LIMIT VERIFICATION REQUESTS
    // --------------------------------------------------------

    await enforceLimit(

        env,

        "email-verify-ip",

        ip,

        AUTH_LIMITS.EMAIL_VERIFY_IP

    );

    await enforceLimit(

        env,

        "email-verify-address",

        email,

        AUTH_LIMITS.EMAIL_VERIFY_ADDRESS

    );

    // --------------------------------------------------------
    // VALIDATE INPUT
    // --------------------------------------------------------

    if (

        typeof challengeId !== "string" ||

        !/^[a-f0-9-]{36}$/i.test(challengeId) ||

        typeof code !== "string" ||

        !/^\d{6}$/.test(code)

    ) {

        throw invalidChallenge();

    }

    // --------------------------------------------------------
    // ATOMICALLY RESERVE A VERIFICATION ATTEMPT
    //
    // Every eligible verification consumes one attempt.
    // Concurrent requests cannot bypass max_attempts.
    // --------------------------------------------------------

    const challenge = await env.DB.prepare(`

        UPDATE auth_challenges

        SET attempts = attempts + 1

        WHERE id = ?

          AND email = ?

          AND purpose = 'sign_in'

          AND consumed_at IS NULL

          AND expires_at > ?

          AND attempts < max_attempts

        RETURNING

            id,

            email,

            code_hash,

            attempts,

            max_attempts,

            expires_at

    `)
        .bind(

            challengeId,

            email,

            nowISO()

        )
        .first();

    if (!challenge) {

        throw invalidChallenge();

    }

    // --------------------------------------------------------
    // HASH SUBMITTED CODE
    // --------------------------------------------------------

    const submittedHash = await hashVerificationCode(

        env.AUTH_SECRET,

        challengeId,

        email,

        code

    );

    // --------------------------------------------------------
    // CONSTANT-TIME VERIFICATION
    // --------------------------------------------------------

    if (

        !secureCompare(

            challenge.code_hash,

            submittedHash

        )

    ) {

        throw invalidChallenge();

    }

    // --------------------------------------------------------
    // ATOMIC SINGLE-USE CONSUMPTION
    //
    // Only one request can successfully consume the challenge.
    // --------------------------------------------------------

    const consumed = await env.DB.prepare(`

        UPDATE auth_challenges

        SET consumed_at = ?

        WHERE id = ?

          AND email = ?

          AND purpose = 'sign_in'

          AND consumed_at IS NULL

          AND expires_at > ?

          AND attempts <= max_attempts

        RETURNING id

    `)
        .bind(

            nowISO(),

            challengeId,

            email,

            nowISO()

        )
        .first();

    if (!consumed) {

        throw invalidChallenge();

    }

    // --------------------------------------------------------
    // RETURN SERVER-VERIFIED IDENTITY
    // --------------------------------------------------------

    return {

        provider: "email",

        subject: email,

        email,

        emailVerified: true

    };

}


// ============================================================
// COMPLETE EMAIL AUTHENTICATION
// ============================================================

export async function authenticateWithEmail(
    request,
    env,
    payload
) {

    // Step 1: Establish email ownership.

    const verifiedIdentity = await verifyEmailChallenge(

        request,

        env,

        payload

    );

    // Step 2: Resolve or create customer account.

    const result = await resolveVerifiedCustomer(

        env,

        verifiedIdentity

    );

    // Step 3: Create secure customer session.

    const session = await createCustomerSession(

        env,

        result.account.client_id

    );

    // Internal result only.
    // API routing must attach session.token as an HttpOnly
    // cookie and must never serialize it into JSON.

    return {

        account: result.account,

        created: result.created,

        linked: result.linked,

        session

    };

}


// ============================================================
// CLEANUP EXPIRED EMAIL CHALLENGES
// ============================================================

export async function cleanupEmailChallenges(env) {

    const retentionCutoff = new Date(

        Date.now() - 24 * 60 * 60 * 1000

    ).toISOString();

    return env.DB.prepare(`

        DELETE FROM auth_challenges

        WHERE expires_at <= ?

    `)
        .bind(retentionCutoff)
        .run();

}
