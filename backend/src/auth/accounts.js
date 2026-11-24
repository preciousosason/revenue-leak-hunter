
// ============================================================
// LEAKENDIA — CUSTOMER ACCOUNT MANAGEMENT
// File: backend/src/auth/accounts.js
// ============================================================

import {
    generateId,
    generateSecureToken,
    sha256,
    normalizeEmail,
    isValidEmail,
    nowISO
} from "./crypto.js";


// ============================================================
// ACCOUNT ERROR
// ============================================================

export class AccountError extends Error {

    constructor(message, code, status = 400) {

        super(message);

        this.name = "AccountError";
        this.code = code;
        this.status = status;

    }

}


// ============================================================
// CUSTOMER ACCOUNT QUERY
// ============================================================

const ACCOUNT_SELECT = `
    SELECT
        c.id AS client_id,
        c.name,
        c.email,
        c.business,
        c.website,

        a.normalized_email,
        a.email_verified_at,
        a.status,
        a.avatar_url,
        a.registered_at,
        a.last_login_at,
        a.updated_at

    FROM customer_accounts a

    INNER JOIN clients c
        ON c.id = a.client_id
`;


// ============================================================
// FIND CUSTOMER BY ID
// ============================================================

export async function getCustomerAccount(
    env,
    clientId
) {

    return env.DB.prepare(`
        ${ACCOUNT_SELECT}

        WHERE a.client_id = ?

        LIMIT 1
    `)
        .bind(clientId)
        .first();

}


// ============================================================
// FIND CUSTOMER BY EMAIL
// ============================================================

export async function findAccountByEmail(
    env,
    email
) {

    return env.DB.prepare(`
        ${ACCOUNT_SELECT}

        WHERE a.normalized_email = ?

        LIMIT 1
    `)
        .bind(normalizeEmail(email))
        .first();

}


// ============================================================
// FIND AUTHENTICATION IDENTITY
// ============================================================

export async function findIdentity(
    env,
    provider,
    subject
) {

    return env.DB.prepare(`
        SELECT
            id,
            client_id,
            provider,
            provider_subject,
            email,
            created_at,
            last_used_at

        FROM auth_identities

        WHERE provider = ?
          AND provider_subject = ?

        LIMIT 1
    `)
        .bind(provider, subject)
        .first();

}


// ============================================================
// ACCOUNT STATUS VALIDATION
// ============================================================

export function assertAccountActive(account) {

    if (!account) {

        throw new AccountError(
            "Customer account not found.",
            "ACCOUNT_NOT_FOUND",
            404
        );

    }

    if (account.status !== "active") {

        throw new AccountError(
            "This account is unavailable. Please contact Leakendia.",
            "ACCOUNT_UNAVAILABLE",
            403
        );

    }

    return account;

}


// ============================================================
// SAFE DISPLAY NAME
// ============================================================

function normalizeName(name, email) {

    const cleaned =
        typeof name === "string"
            ? name.trim().slice(0, 120)
            : "";

    if (cleaned) {

        return cleaned;

    }

    return email
        .split("@")[0]
        .slice(0, 120) || "Customer";

}


// ============================================================
// SAFE AVATAR URL
// ============================================================

function normalizeAvatar(value) {

    if (
        typeof value !== "string" ||
        value.length > 2048
    ) {

        return null;

    }

    try {

        const url = new URL(value);

        if (
            url.protocol !== "https:" ||
            url.username ||
            url.password
        ) {

            return null;

        }

        return url.href;

    } catch {

        return null;

    }

}


// ============================================================
// VALIDATE VERIFIED IDENTITY
//
// IMPORTANT:
// This function must receive identity information only from
// trusted server-side verification handlers.
//
// Never pass unverified browser request data directly here.
// ============================================================

function validateIdentity(identity) {

    if (
        !identity ||
        identity.emailVerified !== true
    ) {

        throw new AccountError(
            "Email verification is required.",
            "EMAIL_NOT_VERIFIED",
            403
        );

    }

    const provider = identity.provider;

    if (
        provider !== "google" &&
        provider !== "email"
    ) {

        throw new AccountError(
            "Unsupported authentication provider.",
            "INVALID_PROVIDER"
        );

    }

    const email = normalizeEmail(
        identity.email
    );

    if (!isValidEmail(email)) {

        throw new AccountError(
            "Invalid email address.",
            "INVALID_EMAIL"
        );

    }

    const subject =
        provider === "email"
            ? email
            : identity.subject;

    if (
        typeof subject !== "string" ||
        !subject.trim() ||
        subject.length > 255
    ) {

        throw new AccountError(
            "Invalid authentication identity.",
            "INVALID_IDENTITY"
        );

    }

    return {

        provider,

        subject,

        email,

        name: normalizeName(
            identity.name,
            email
        ),

        avatarUrl: normalizeAvatar(
            identity.avatarUrl
        )

    };

}


// ============================================================
// FIND LEGACY CUSTOMER RECORDS
// ============================================================

async function findLegacyClients(
    env,
    email
) {

    const result = await env.DB.prepare(`
        SELECT
            id,
            name,
            email

        FROM clients

        WHERE LOWER(TRIM(email)) = ?

        LIMIT 2
    `)
        .bind(email)
        .all();

    return result.results || [];

}


// ============================================================
// AUTHENTICATION ACTIVITY
// ============================================================

export async function recordAuthEvent(
    env,
    {
        clientId = null,
        eventType,
        provider = null
    }
) {

    await env.DB.prepare(`
        INSERT INTO auth_events (
            id,
            client_id,
            event_type,
            provider,
            created_at
        )

        VALUES (?, ?, ?, ?, ?)
    `)
        .bind(
            generateId(),
            clientId,
            eventType,
            provider,
            nowISO()
        )
        .run();

}


// ============================================================
// UPDATE SUCCESSFUL AUTHENTICATION
// ============================================================

async function updateLoginActivity(
    env,
    clientId,
    identityId,
    provider
) {

    const timestamp = nowISO();

    await env.DB.batch([

        env.DB.prepare(`
            UPDATE customer_accounts

            SET
                last_login_at = ?,
                updated_at = ?

            WHERE client_id = ?
              AND status = 'active'
        `)
            .bind(
                timestamp,
                timestamp,
                clientId
            ),

        env.DB.prepare(`
            UPDATE auth_identities

            SET last_used_at = ?

            WHERE id = ?
              AND client_id = ?
        `)
            .bind(
                timestamp,
                identityId,
                clientId
            ),

        env.DB.prepare(`
            INSERT INTO auth_events (
                id,
                client_id,
                event_type,
                provider,
                created_at
            )

            VALUES (?, ?, ?, ?, ?)
        `)
            .bind(
                generateId(),
                clientId,
                "identity_authenticated",
                provider,
                timestamp
            )

    ]);

}


// ============================================================
// RESOLVE EXISTING AUTHENTICATION IDENTITY
// ============================================================

async function resolveExistingIdentity(
    env,
    existingIdentity,
    verifiedIdentity
) {

    const account = assertAccountActive(
        await getCustomerAccount(
            env,
            existingIdentity.client_id
        )
    );

    // Do not silently change an account email.

    if (
        account.normalized_email !==
        verifiedIdentity.email
    ) {

        throw new AccountError(
            "Your account email has changed. Secure account recovery is required.",
            "EMAIL_CHANGE_REQUIRED",
            409
        );

    }

    await updateLoginActivity(
        env,
        account.client_id,
        existingIdentity.id,
        verifiedIdentity.provider
    );

    return {

        account: assertAccountActive(
            await getCustomerAccount(
                env,
                account.client_id
            )
        ),

        created: false,

        linked: false

    };

}


// ============================================================
// CREATE NEW CUSTOMER ACCOUNT
//
// D1 batch operations are transactional.
// If any insert fails, the registration batch rolls back.
// ============================================================

async function createCustomerAccount(
    env,
    identity
) {

    const clientId = generateId();

    const identityId = generateId();

    const timestamp = nowISO();

    // Existing clients.token_hash is NOT NULL.
    //
    // Generate an inaccessible random placeholder.
    // No legacy access code is issued or stored.

    const placeholderHash = await sha256(
        generateSecureToken(48)
    );

    await env.DB.batch([

        // ----------------------------------------------------
        // CANONICAL CUSTOMER RECORD
        // ----------------------------------------------------

        env.DB.prepare(`
            INSERT INTO clients (
                id,
                name,
                email,
                token_hash,
                created_at,
                updated_at
            )

            VALUES (?, ?, ?, ?, ?, ?)
        `)
            .bind(
                clientId,
                identity.name,
                identity.email,
                placeholderHash,
                timestamp,
                timestamp
            ),

        // ----------------------------------------------------
        // CUSTOMER ACCOUNT
        // ----------------------------------------------------

        env.DB.prepare(`
            INSERT INTO customer_accounts (
                client_id,
                normalized_email,
                email_verified_at,
                status,
                avatar_url,
                registered_at,
                last_login_at,
                updated_at
            )

            VALUES (
                ?, ?, ?, 'active', ?, ?, ?, ?
            )
        `)
            .bind(
                clientId,
                identity.email,
                timestamp,
                identity.avatarUrl,
                timestamp,
                timestamp,
                timestamp
            ),

        // ----------------------------------------------------
        // VERIFIED AUTHENTICATION IDENTITY
        // ----------------------------------------------------

        env.DB.prepare(`
            INSERT INTO auth_identities (
                id,
                client_id,
                provider,
                provider_subject,
                email,
                created_at,
                last_used_at
            )

            VALUES (?, ?, ?, ?, ?, ?, ?)
        `)
            .bind(
                identityId,
                clientId,
                identity.provider,
                identity.subject,
                identity.email,
                timestamp,
                timestamp
            ),

        // ----------------------------------------------------
        // REGISTRATION EVENT
        // ----------------------------------------------------

        env.DB.prepare(`
            INSERT INTO auth_events (
                id,
                client_id,
                event_type,
                provider,
                created_at
            )

            VALUES (?, ?, ?, ?, ?)
        `)
            .bind(
                generateId(),
                clientId,
                "account_registered",
                identity.provider,
                timestamp
            )

    ]);

    return {

        account: assertAccountActive(
            await getCustomerAccount(
                env,
                clientId
            )
        ),

        created: true,

        linked: false

    };

}


// ============================================================
// RESOLVE OR REGISTER CUSTOMER
//
// Main entry point for verified email and Google authentication.
// ============================================================

export async function resolveVerifiedCustomer(
    env,
    verifiedIdentity
) {

    const identity = validateIdentity(
        verifiedIdentity
    );

    // --------------------------------------------------------
    // 1. RETURNING AUTHENTICATION IDENTITY
    // --------------------------------------------------------

    const existingIdentity = await findIdentity(
        env,
        identity.provider,
        identity.subject
    );

    if (existingIdentity) {

        return resolveExistingIdentity(
            env,
            existingIdentity,
            identity
        );

    }

    // --------------------------------------------------------
    // 2. EXISTING REGISTERED EMAIL
    //
    // Do not automatically link an unfamiliar provider.
    // Explicit account linking will require an authenticated
    // session and fresh provider verification.
    // --------------------------------------------------------

    const existingAccount = await findAccountByEmail(
        env,
        identity.email
    );

    if (existingAccount) {

        assertAccountActive(existingAccount);

        throw new AccountError(
            "An account already exists. Sign in using your original authentication method to connect another method.",
            "ACCOUNT_LINK_REQUIRED",
            409
        );

    }

    // --------------------------------------------------------
    // 3. EXISTING LEGACY CUSTOMER
    //
    // Never expose historical customer data merely because
    // an email address matches.
    // --------------------------------------------------------

    const legacyClients = await findLegacyClients(
        env,
        identity.email
    );

    if (legacyClients.length > 0) {

        throw new AccountError(
            "An existing customer record requires secure account linking.",
            "LEGACY_LINK_REQUIRED",
            409
        );

    }

    // --------------------------------------------------------
    // 4. REGISTER NEW CUSTOMER
    // --------------------------------------------------------

    try {

        return await createCustomerAccount(
            env,
            identity
        );

    } catch (error) {

        // Handle simultaneous registration attempts.
        // Database uniqueness constraints remain authoritative.

        const concurrentIdentity = await findIdentity(
            env,
            identity.provider,
            identity.subject
        );

        if (concurrentIdentity) {

            return resolveExistingIdentity(
                env,
                concurrentIdentity,
                identity
            );

        }

        const concurrentAccount = await findAccountByEmail(
            env,
            identity.email
        );

        if (concurrentAccount) {

            assertAccountActive(concurrentAccount);

            throw new AccountError(
                "An account already exists. Secure account linking is required.",
                "ACCOUNT_LINK_REQUIRED",
                409
            );

        }

        const concurrentLegacy = await findLegacyClients(
            env,
            identity.email
        );

        if (concurrentLegacy.length > 0) {

            throw new AccountError(
                "An existing customer record requires secure account linking.",
                "LEGACY_LINK_REQUIRED",
                409
            );

        }

        throw error;

    }

}


// ============================================================
// PUBLIC CUSTOMER PROFILE
//
// Only return fields appropriate for the authenticated customer.
// ============================================================

export function serializeCustomer(account) {

    if (!account) {

        return null;

    }

    return {

        id: account.client_id,

        name: account.name,

        email: account.email,

        business: account.business || null,

        website: account.website || null,

        avatarUrl: account.avatar_url || null,

        emailVerified: Boolean(
            account.email_verified_at
        ),

        status: account.status,

        registeredAt: account.registered_at,

        lastLoginAt: account.last_login_at

    };

}
