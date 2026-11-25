import { authenticateCustomer } from "../auth/sessions.js";
import { readSessionCookie } from "../auth/cookies.js";
import { assertTrustedHost, assertSameOrigin } from "../auth/security.js";

export async function authenticateSession(
    request,
    env
) {
    if (new URL(request.url).pathname.startsWith("/api/portal/")) {
        if (readSessionCookie(request)) {
            assertTrustedHost(request, env);
            if (!["GET", "HEAD"].includes(request.method)) {
                assertSameOrigin(request, env);
            }
            const customer = await authenticateCustomer(request, env);
            return customer ? { ...customer, id: customer.session_id } : null;
        }
    }
    const authorization =
        request.headers.get(
            "Authorization"
        );

    if (
        !authorization ||
        !authorization.startsWith("Bearer ")
    ) {
        return null;
    }

    const sessionId =
        authorization
            .substring(7)
            .trim();

    if (!sessionId) {
        return null;
    }

    const session =
        await env.DB
            .prepare(
                `SELECT
                    sessions.id,
                    sessions.client_id,
                    sessions.expires_at
                 FROM sessions
                 WHERE sessions.id = ?`
            )
            .bind(sessionId)
            .first();

    if (!session) {
        return null;
    }

    if (
        new Date(
            session.expires_at
        ).getTime() <= Date.now()
    ) {
        await env.DB
            .prepare(
                `DELETE FROM sessions
                 WHERE id = ?`
            )
            .bind(sessionId)
            .run();

        return null;
    }

    return session;
}

export async function authenticateAdmin(
    request,
    env
) {
    const authorization =
        request.headers.get(
            "Authorization"
        );

    if (
        !authorization ||
        !authorization.startsWith("Bearer ")
    ) {
        return null;
    }

    const sessionId =
        authorization
            .substring(7)
            .trim();

    if (!sessionId) {
        return null;
    }

    const session =
        await env.DB
            .prepare(
                `SELECT
                    id,
                    expires_at
                 FROM admin_sessions
                 WHERE id = ?`
            )
            .bind(sessionId)
            .first();

    if (!session) {
        return null;
    }

    if (
        new Date(
            session.expires_at
        ).getTime() <= Date.now()
    ) {
        await env.DB
            .prepare(
                `DELETE FROM admin_sessions
                 WHERE id = ?`
            )
            .bind(sessionId)
            .run();

        return null;
    }

    return session;
}