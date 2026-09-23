import {
    json
} from "../utils/response.js";

import {
    createId
} from "../utils/ids.js";

import {
    hashToken
} from "../utils/security.js";

import {
    authenticateSession
} from "../utils/auth.js";



async function createSession(
    clientId,
    env
) {
    const sessionId =
        createId();

    const expiresAt =
        new Date(
            Date.now() +
            7 * 24 * 60 * 60 * 1000
        ).toISOString();

    await env.DB
        .prepare(
            `INSERT INTO sessions
            (
                id,
                client_id,
                expires_at
            )
            VALUES (?, ?, ?)`
        )
        .bind(
            sessionId,
            clientId,
            expiresAt
        )
        .run();

    return {
        sessionId,
        expiresAt
    };
}

export async function handlePortalLogin(
    request,
    env
) {
    let data;

    try {
        data =
            await request.json();
    } catch {
        return json(
            {
                success: false,
                error:
                    "Invalid JSON request."
            },
            400
        );
    }

    if (
        !data.token ||
        typeof data.token !== "string"
    ) {
        return json(
            {
                success: false,
                error:
                    "Please enter your private access token."
            },
            400
        );
    }

    const token =
        data.token
            .trim()
            .toUpperCase();

    if (
        !/^LH-[A-Z0-9]{4}(?:-[A-Z0-9]{4}){3}$/.test(
            token
        )
    ) {
        return json(
            {
                success: false,
                error:
                    "Invalid private access token."
            },
            400
        );
    }

    try {
        const tokenHash =
            await hashToken(
                token
            );

        const client =
            await env.DB
                .prepare(
                    `SELECT
                        id,
                        name,
                        email,
                        business,
                        website,
                        created_at
                     FROM clients
                     WHERE token_hash = ?`
                )
                .bind(tokenHash)
                .first();

        if (!client) {
            return json(
                {
                    success: false,
                    error:
                        "Invalid private access token."
                },
                401
            );
        }

        const session =
            await createSession(
                client.id,
                env
            );

        return json({
            success: true,
            sessionToken:
                session.sessionId,
            expiresAt:
                session.expiresAt,
            client: {
                id: client.id,
                name: client.name,
                email: client.email,
                business: client.business,
                website: client.website
            }
        });
    } catch (error) {
        console.error(
            "Portal login error:",
            error
        );

        return json(
            {
                success: false,
                error:
                    "Unable to sign you in right now."
            },
            500
        );
    }
}

export async function handlePortalMe(
    request,
    env
) {
    const session =
        await authenticateSession(
            request,
            env
        );

    if (!session) {
        return json(
            {
                success: false,
                error:
                    "Authentication required."
            },
            401
        );
    }

    try {
        const client =
            await env.DB
                .prepare(
                    `SELECT
                        id,
                        name,
                        email,
                        business,
                        website
                     FROM clients
                     WHERE id = ?`
                )
                .bind(
                    session.client_id
                )
                .first();

        if (!client) {
            return json(
                {
                    success: false,
                    error:
                        "Client account not found."
                },
                404
            );
        }

        return json({
            success: true,
            client,
            expiresAt:
                session.expires_at
        });
    } catch (error) {
        console.error(
            "Portal session error:",
            error
        );

        return json(
            {
                success: false,
                error:
                    "Unable to load your portal."
            },
            500
        );
    }
}

export async function handlePortalLogout(
    request,
    env
) {
    const authorization =
        request.headers.get(
            "Authorization"
        );

    if (
        authorization &&
        authorization.startsWith("Bearer ")
    ) {
        const sessionId =
            authorization
                .substring(7)
                .trim();

        if (sessionId) {
            await env.DB
                .prepare(
                    `DELETE FROM sessions
                     WHERE id = ?`
                )
                .bind(sessionId)
                .run();
        }
    }

    return json({
        success: true
    });
}