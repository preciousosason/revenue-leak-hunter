
// ============================================================
// LEAKENDIA — AUTHENTICATION API ROUTER
// File: backend/src/auth/auth.routes.js
// ============================================================

import {

    AuthHttpError,

    assertTrustedHost,

    assertSameOrigin,

    requireMethod,

    readAuthJSON,

    authJSON,

    authRedirect

} from "./security.js";

import {

    AccountError,

    serializeCustomer

} from "./accounts.js";

import {

    EmailAuthError,

    requestEmailVerification,

    authenticateWithEmail

} from "./email.js";

import {

    GoogleAuthError,

    startGoogleAuthentication,

    completeGoogleAuthentication,

    removeGoogleOAuthCookie,

    sanitizeReturnPath

} from "./google.js";

import {

    authenticateCustomer,

    attachCustomerSession,

    removeCustomerSession,

    revokeCurrentSession,

    revokeAllCustomerSessions,

    revokeCustomerSession,

    listCustomerSessions

} from "./sessions.js";


// ============================================================
// AUTHENTICATION REQUIRED
// ============================================================

async function requireCustomer(request, env) {

    const customer =
        await authenticateCustomer(request, env);

    if (!customer) {

        throw new AuthHttpError(
            "Please sign in to continue.",
            "AUTHENTICATION_REQUIRED",
            401
        );

    }

    return customer;

}


// ============================================================
// REQUEST VERIFICATION CODE
// ============================================================

async function handleEmailRequest(request, env) {

    requireMethod(request, "POST");

    assertSameOrigin(request, env);

    const body = await readAuthJSON(request);

    const result = await requestEmailVerification(

        request,

        env,

        body.email

    );

    return authJSON({

        success: true,

        message: "Verification code sent.",

        challengeId: result.challengeId,

        email: result.email,

        expiresAt: result.expiresAt,

        expiresIn: result.expiresIn

    });

}


// ============================================================
// VERIFY EMAIL AND ESTABLISH SESSION
// ============================================================

async function handleEmailVerify(request, env) {

    requireMethod(request, "POST");

    assertSameOrigin(request, env);

    const body = await readAuthJSON(request);

    const result = await authenticateWithEmail(

        request,

        env,

        {
            email: body.email,
            challengeId: body.challengeId,
            code: body.code
        }

    );

    const response = authJSON({

        success: true,

        authenticated: true,

        created: result.created,

        linked: result.linked,

        customer: serializeCustomer(
            result.account
        ),

        returnPath: sanitizeReturnPath(
            body.returnPath
        )

    });

    // Revoke the previous browser session, if present.

    await revokeCurrentSession(request, env);

    return attachCustomerSession(

        request,

        response,

        result.session

    );

}


// ============================================================
// START GOOGLE AUTHENTICATION
// ============================================================

async function handleGoogleStart(request, env) {

    requireMethod(request, "GET");

    const fetchSite =
        request.headers.get("Sec-Fetch-Site");

    if (
        fetchSite &&
        !["same-origin", "none"].includes(fetchSite)
    ) {

        throw new AuthHttpError(
            "Cross-site authentication initiation rejected.",
            "CROSS_SITE_REQUEST",
            403
        );

    }

    const url = new URL(request.url);

    const returnPath = sanitizeReturnPath(

        url.searchParams.get("return")

    );

    return startGoogleAuthentication(

        request,

        env,

        returnPath

    );

}


// ============================================================
// COMPLETE GOOGLE AUTHENTICATION
// ============================================================

async function handleGoogleCallback(request, env) {

    requireMethod(request, "GET");

    try {

        const result =
            await completeGoogleAuthentication(
                request,
                env
            );

        await revokeCurrentSession(request, env);

        let response = authRedirect(

            sanitizeReturnPath(
                result.returnPath
            )

        );

        response = attachCustomerSession(

            request,

            response,

            result.session

        );

        return removeGoogleOAuthCookie(

            request,

            response

        );

    } catch (error) {

        // Temporary local-development error response.
        // The frontend sign-in page will handle these
        // errors through a dedicated redirect later.

        const response =
            handleAuthenticationError(error);

        return removeGoogleOAuthCookie(

            request,

            response

        );

    }

}


// ============================================================
// GET CURRENT CUSTOMER
// ============================================================

async function handleCurrentCustomer(request, env) {

    requireMethod(request, "GET");

    const customer =
        await authenticateCustomer(request, env);

    if (!customer) {

        return authJSON({

            success: true,

            authenticated: false,

            customer: null

        });

    }

    return authJSON({

        success: true,

        authenticated: true,

        customer: serializeCustomer(customer)

    });

}


// ============================================================
// LOGOUT CURRENT SESSION
// ============================================================

async function handleLogout(request, env) {

    requireMethod(request, "POST");

    assertSameOrigin(request, env);

    await revokeCurrentSession(request, env);

    return removeCustomerSession(

        request,

        authJSON({

            success: true,

            authenticated: false,

            message: "Signed out successfully."

        })

    );

}


// ============================================================
// LOGOUT ALL CUSTOMER SESSIONS
// ============================================================

async function handleLogoutAll(request, env) {

    requireMethod(request, "POST");

    assertSameOrigin(request, env);

    const customer =
        await requireCustomer(request, env);

    const revoked = await revokeAllCustomerSessions(

        env,

        customer.client_id

    );

    return removeCustomerSession(

        request,

        authJSON({

            success: true,

            authenticated: false,

            revokedSessions: revoked

        })

    );

}


// ============================================================
// LIST CUSTOMER SESSIONS
// ============================================================

async function handleSessions(request, env) {

    requireMethod(request, "GET");

    const customer =
        await requireCustomer(request, env);

    const sessions = await listCustomerSessions(

        env,

        customer.client_id

    );

    return authJSON({

        success: true,

        sessions: sessions.map(session => ({

            id: session.id,

            createdAt: session.created_at,

            expiresAt: session.expires_at,

            lastSeenAt: session.last_seen_at,

            current:
                session.id === customer.session_id

        }))

    });

}


// ============================================================
// REVOKE SPECIFIC SESSION
// ============================================================

async function handleSessionRevoke(request, env) {

    requireMethod(request, "POST");

    assertSameOrigin(request, env);

    const customer =
        await requireCustomer(request, env);

    const body = await readAuthJSON(request);

    const sessionId = body.sessionId;

    if (

        typeof sessionId !== "string" ||

        !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i
            .test(sessionId)

    ) {

        throw new AuthHttpError(
            "Invalid session identifier.",
            "INVALID_SESSION_ID"
        );

    }

    const revoked = await revokeCustomerSession(

        env,

        customer.client_id,

        sessionId

    );

    if (!revoked) {

        throw new AuthHttpError(
            "Session not found or already revoked.",
            "SESSION_NOT_FOUND",
            404
        );

    }

    const currentSession =
        sessionId === customer.session_id;

    const response = authJSON({

        success: true,

        authenticated: !currentSession,

        revoked: true

    });

    if (currentSession) {

        return removeCustomerSession(

            request,

            response

        );

    }

    return response;

}


// ============================================================
// CENTRAL AUTHENTICATION ERROR HANDLER
// ============================================================

function handleAuthenticationError(error) {

    const knownError =

        error instanceof AuthHttpError ||

        error instanceof AccountError ||

        error instanceof EmailAuthError ||

        error instanceof GoogleAuthError;

    if (knownError) {

        const headers = {};

        if (
            Number.isFinite(error.retryAfter) &&
            error.retryAfter > 0
        ) {

            headers["Retry-After"] =
                String(error.retryAfter);

        }

        if (error.allowedMethod) {

            headers.Allow =
                error.allowedMethod;

        }

        return authJSON({

            success: false,

            error: error.message,

            code: error.code,

            ...(error.retryAfter
                ? { retryAfter: error.retryAfter }
                : {})

        }, error.status, headers);

    }

    // Never log raw request bodies, tokens,
    // verification codes or OAuth credentials.

    console.error(
        "[AUTH] Unexpected authentication error:",
        error?.name || "UnknownError"
    );

    return authJSON({

        success: false,

        error: "Authentication could not be completed.",

        code: "AUTH_INTERNAL_ERROR"

    }, 500);

}


// ============================================================
// MAIN AUTHENTICATION ROUTER
// ============================================================

export async function handleAuthRoutes(request, env) {

    try {

        assertTrustedHost(request, env);

        const path =
            new URL(request.url).pathname;

        switch (path) {

            case "/api/auth/email/request":

                return await handleEmailRequest(
                    request,
                    env
                );

            case "/api/auth/email/verify":

                return await handleEmailVerify(
                    request,
                    env
                );

            case "/api/auth/google/start":

                return await handleGoogleStart(
                    request,
                    env
                );

            case "/api/auth/google/callback":

                return await handleGoogleCallback(
                    request,
                    env
                );

            case "/api/auth/me":

                return await handleCurrentCustomer(
                    request,
                    env
                );

            case "/api/auth/logout":

                return await handleLogout(
                    request,
                    env
                );

            case "/api/auth/logout-all":

                return await handleLogoutAll(
                    request,
                    env
                );

            case "/api/auth/sessions":

                return await handleSessions(
                    request,
                    env
                );

            case "/api/auth/sessions/revoke":

                return await handleSessionRevoke(
                    request,
                    env
                );

            default:

                return authJSON({

                    success: false,

                    error: "Authentication endpoint not found.",

                    code: "AUTH_ROUTE_NOT_FOUND"

                }, 404);

        }

    } catch (error) {

        return handleAuthenticationError(error);

    }

}
