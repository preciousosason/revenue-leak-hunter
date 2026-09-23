import {
    json
} from "../utils/response.js";

import {
    createId
} from "../utils/ids.js";

import {
    authenticateAdmin
} from "../utils/auth.js";

async function createAdminSession(env) {
    const sessionId =
        createId();

    const expiresAt =
        new Date(
            Date.now() +
            24 * 60 * 60 * 1000
        ).toISOString();

    await env.DB
        .prepare(
            `INSERT INTO admin_sessions
            (
                id,
                expires_at
            )
            VALUES (?, ?)`
        )
        .bind(
            sessionId,
            expiresAt
        )
        .run();

    return {
        sessionId,
        expiresAt
    };
}

export async function handleAdminLogin(
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
        !data.password ||
        typeof data.password !== "string"
    ) {
        return json(
            {
                success: false,
                error:
                    "Please enter your admin password."
            },
            400
        );
    }

    if (
        data.password !==
        env.ADMIN_PASSWORD
    ) {
        return json(
            {
                success: false,
                error:
                    "Invalid admin credentials."
            },
            401
        );
    }

    try {
        const session =
            await createAdminSession(
                env
            );

        return json({
            success: true,
            sessionToken:
                session.sessionId,
            expiresAt:
                session.expiresAt
        });
    } catch (error) {
        console.error(
            "Admin login error:",
            error
        );

        return json(
            {
                success: false,
                error:
                    "Unable to sign you in."
            },
            500
        );
    }
}

export async function handleAdminMe(
    request,
    env
) {
    const session =
        await authenticateAdmin(
            request,
            env
        );

    if (!session) {
        return json(
            {
                success: false,
                error:
                    "Admin authentication required."
            },
            401
        );
    }

    return json({
        success: true,
        expiresAt:
            session.expires_at
    });
}

export async function handleAdminLogout(
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
                    `DELETE FROM admin_sessions
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