const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json"
};


function json(data, status = 200) {

    return new Response(
        JSON.stringify(data),
        {
            status,
            headers: CORS_HEADERS
        }
    );

}


function createId() {

    return crypto.randomUUID();

}


function generatePortalToken() {

    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    const randomValues =
        new Uint32Array(16);

    crypto.getRandomValues(
        randomValues
    );

    const groups = [];

    for (
        let group = 0;
        group < 4;
        group++
    ) {

        let value = "";

        for (
            let i = 0;
            i < 4;
            i++
        ) {

            const index =
                randomValues[
                    group * 4 + i
                ] % characters.length;

            value += characters[index];

        }

        groups.push(value);

    }

    return `LH-${groups.join("-")}`;

}


async function hashToken(token) {

    const encoder =
        new TextEncoder();

    const data =
        encoder.encode(token);

    const hashBuffer =
        await crypto.subtle.digest(
            "SHA-256",
            data
        );

    const hashArray =
        Array.from(
            new Uint8Array(hashBuffer)
        );

    return hashArray
        .map(
            byte =>
                byte
                    .toString(16)
                    .padStart(2, "0")
        )
        .join("");

}


/* =========================================
   CONTACT VALIDATION
========================================= */

function validateContact(data) {

    const errors = {};

    if (
        !data.name ||
        typeof data.name !== "string" ||
        data.name.trim().length < 2
    ) {

        errors.name =
            "Please provide your name.";

    }


    if (
        !data.email ||
        typeof data.email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
            .test(data.email.trim())
    ) {

        errors.email =
            "Please provide a valid email address.";

    }


    if (
        !data.offer ||
        typeof data.offer !== "string" ||
        data.offer.trim().length < 3
    ) {

        errors.offer =
            "Please describe what you sell.";

    }


    if (
        !data.problem ||
        typeof data.problem !== "string"
    ) {

        errors.problem =
            "Please select where you think the leak is.";

    }


    if (
        data.website &&
        (
            typeof data.website !== "string" ||
            data.website.length > 500
        )
    ) {

        errors.website =
            "Please provide a valid website.";

    }


    if (
        data.message &&
        (
            typeof data.message !== "string" ||
            data.message.length > 5000
        )
    ) {

        errors.message =
            "Your message is too long.";

    }


    return errors;

}


/* =========================================
   CREATE CONTACT
========================================= */

async function createContact(data, env) {

    const name =
        data.name.trim();

    const email =
        data.email
            .trim()
            .toLowerCase();

    const business =
        data.business
            ? data.business.trim()
            : null;

    const website =
        data.website
            ? data.website.trim()
            : null;

    const offer =
        data.offer.trim();

    const problem =
        data.problem.trim();

    const message =
        data.message
            ? data.message.trim()
            : "";


    const portalToken =
        generatePortalToken();

    const tokenHash =
        await hashToken(
            portalToken
        );

    const clientId =
        createId();

    const conversationId =
        createId();

    const messageId =
        createId();


    const existingClient =
        await env.DB
            .prepare(
                `SELECT id
                 FROM clients
                 WHERE email = ?`
            )
            .bind(email)
            .first();


    if (existingClient) {

        return {
            error:
                "An account already exists for this email address.",
            status: 409
        };

    }


    await env.DB
        .prepare(
            `INSERT INTO clients
            (
                id,
                name,
                email,
                business,
                website,
                token_hash
            )
            VALUES (?, ?, ?, ?, ?, ?)`
        )
        .bind(
            clientId,
            name,
            email,
            business,
            website,
            tokenHash
        )
        .run();


    await env.DB
        .prepare(
            `INSERT INTO conversations
            (
                id,
                client_id,
                subject,
                status
            )
            VALUES (?, ?, ?, ?)`
        )
        .bind(
            conversationId,
            clientId,
            "Leak Hunt Investigation",
            "open"
        )
        .run();


    const firstMessage = [

        `Business: ${
            business || "Not provided"
        }`,

        `Website: ${
            website || "Not provided"
        }`,

        `What they sell: ${offer}`,

        `Suspected leak: ${problem}`,

        "",

        "Client message:",

        message ||
            "No additional message provided."

    ].join("\n");


    await env.DB
        .prepare(
            `INSERT INTO messages
            (
                id,
                conversation_id,
                sender_type,
                message
            )
            VALUES (?, ?, ?, ?)`
        )
        .bind(
            messageId,
            conversationId,
            "client",
            firstMessage
        )
        .run();


    await env.DB
        .prepare(
            `INSERT INTO notifications
            (
                id,
                client_id,
                type,
                title,
                message
            )
            VALUES (?, ?, ?, ?, ?)`
        )
        .bind(
            createId(),
            clientId,
            "new_client",
            "New Leak Hunt Request",
            `${name} submitted a new Leak Hunt request.`
        )
        .run();


    return {

        success: true,

        status: 201,

        data: {

            success: true,

            clientId,

            conversationId,

            portalToken

        }

    };

}


/* =========================================
   CONTACT HANDLER
========================================= */

async function handleContact(
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


    const errors =
        validateContact(data);


    if (
        Object.keys(errors).length > 0
    ) {

        return json(
            {
                success: false,
                errors
            },
            422
        );

    }


    try {

        const result =
            await createContact(
                data,
                env
            );


        if (result.error) {

            return json(
                {
                    success: false,
                    error: result.error
                },
                result.status
            );

        }


        return json(
            {
                success: true,
                ...result.data
            },
            result.status
        );


    } catch (error) {

        console.error(
            "Contact submission error:",
            error
        );


        return json(
            {
                success: false,
                error:
                    "Something went wrong while creating your portal."
            },
            500
        );

    }

}


/* =========================================
   CREATE SESSION
========================================= */

async function createSession(
    clientId,
    env
) {

    const sessionId =
        createId();

    /*
     * Session lasts 7 days.
     */

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


/* =========================================
   PORTAL LOGIN
========================================= */

async function handlePortalLogin(
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
        !/^LH-[A-Z0-9]{4}(?:-[A-Z0-9]{4}){3}$/
            .test(token)
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
            await hashToken(token);


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


        return json(
            {
                success: true,

                sessionToken:
                    session.sessionId,

                expiresAt:
                    session.expiresAt,

                client: {

                    id: client.id,

                    name: client.name,

                    email: client.email,

                    business:
                        client.business,

                    website:
                        client.website

                }

            }
        );


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


/* =========================================
   GET PORTAL SESSION
========================================= */

async function handlePortalMe(
    request,
    env
) {

    const authorization =
        request.headers.get(
            "Authorization"
        );


    if (
        !authorization ||
        !authorization.startsWith(
            "Bearer "
        )
    ) {

        return json(
            {
                success: false,
                error:
                    "Authentication required."
            },
            401
        );

    }


    const sessionId =
        authorization
            .substring(7)
            .trim();


    if (!sessionId) {

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

        const session =
            await env.DB
                .prepare(
                    `SELECT
                        sessions.id,
                        sessions.client_id,
                        sessions.expires_at,
                        clients.name,
                        clients.email,
                        clients.business,
                        clients.website
                     FROM sessions
                     INNER JOIN clients
                     ON clients.id =
                        sessions.client_id
                     WHERE sessions.id = ?`
                )
                .bind(sessionId)
                .first();


        if (!session) {

            return json(
                {
                    success: false,
                    error:
                        "Your session is invalid."
                },
                401
            );

        }


        if (
            new Date(session.expires_at)
            .getTime() <= Date.now()
        ) {

            await env.DB
                .prepare(
                    `DELETE FROM sessions
                     WHERE id = ?`
                )
                .bind(sessionId)
                .run();


            return json(
                {
                    success: false,
                    error:
                        "Your session has expired."
                },
                401
            );

        }


        return json(
            {
                success: true,

                client: {

                    id:
                        session.client_id,

                    name:
                        session.name,

                    email:
                        session.email,

                    business:
                        session.business,

                    website:
                        session.website

                },

                expiresAt:
                    session.expires_at

            }
        );


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


/* =========================================
   LOGOUT
========================================= */

async function handlePortalLogout(
    request,
    env
) {

    const authorization =
        request.headers.get(
            "Authorization"
        );


    if (
        authorization &&
        authorization.startsWith(
            "Bearer "
        )
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
/* =========================================
   AUTHENTICATE SESSION
========================================= */

async function authenticateSession(request, env) {

    const authorization =
        request.headers.get("Authorization");


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
        new Date(session.expires_at)
            .getTime() <= Date.now()
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


/* =========================================
   GET PORTAL MESSAGES
========================================= */

async function handlePortalMessages(
    request,
    env
) {

    try {

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


        const conversation =
            await env.DB
                .prepare(
                    `SELECT
                        id,
                        subject,
                        status,
                        created_at,
                        updated_at
                     FROM conversations
                     WHERE client_id = ?
                     ORDER BY created_at DESC
                     LIMIT 1`
                )
                .bind(session.client_id)
                .first();


        if (!conversation) {

            return json({
                success: true,
                conversation: null,
                messages: []
            });

        }


        const messages =
            await env.DB
                .prepare(
                    `SELECT
                        id,
                        sender_type,
                        message,
                        created_at
                     FROM messages
                     WHERE conversation_id = ?
                     ORDER BY created_at ASC`
                )
                .bind(conversation.id)
                .all();


        return json({

            success: true,

            conversation,

            messages:
                messages.results || []

        });


    } catch (error) {

        console.error(
            "Portal messages error:",
            error
        );


        return json(
            {
                success: false,
                error:
                    "Unable to load your messages."
            },
            500
        );

    }

}


/* =========================================
   SEND PORTAL MESSAGE
========================================= */

async function handlePortalSendMessage(
    request,
    env
) {

    try {

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


        const message =
            typeof data.message === "string"
                ? data.message.trim()
                : "";


        if (!message) {

            return json(
                {
                    success: false,
                    error:
                        "Please enter a message."
                },
                422
            );

        }


        if (message.length > 5000) {

            return json(
                {
                    success: false,
                    error:
                        "Your message is too long."
                },
                422
            );

        }


        const conversation =
            await env.DB
                .prepare(
                    `SELECT
                        id
                     FROM conversations
                     WHERE client_id = ?
                     ORDER BY created_at DESC
                     LIMIT 1`
                )
                .bind(session.client_id)
                .first();


        if (!conversation) {

            return json(
                {
                    success: false,
                    error:
                        "No active conversation was found."
                },
                404
            );

        }


        const messageId =
            createId();


        await env.DB
            .prepare(
                `INSERT INTO messages
                (
                    id,
                    conversation_id,
                    sender_type,
                    message
                )
                VALUES (?, ?, ?, ?)`
            )
            .bind(
                messageId,
                conversation.id,
                "client",
                message
            )
            .run();


        await env.DB
            .prepare(
                `UPDATE conversations
                 SET updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?`
            )
            .bind(conversation.id)
            .run();


        const client =
            await env.DB
                .prepare(
                    `SELECT name
                     FROM clients
                     WHERE id = ?`
                )
                .bind(session.client_id)
                .first();


        await env.DB
            .prepare(
                `INSERT INTO notifications
                (
                    id,
                    client_id,
                    type,
                    title,
                    message
                )
                VALUES (?, ?, ?, ?, ?)`
            )
            .bind(
                createId(),
                session.client_id,
                "new_message",
                "New Client Message",
                `${client?.name || "A client"} sent a new portal message.`
            )
            .run();


        return json({

            success: true,

            message: {
                id: messageId,
                sender_type: "client",
                message,
                created_at:
                    new Date().toISOString()
            }

        }, 201);


    } catch (error) {

        console.error(
            "Send portal message error:",
            error
        );


        return json(
            {
                success: false,
                error:
                    "Unable to send your message."
            },
            500
        );

    }

}

/* =========================================
   WORKER
========================================= */

export default {

    async fetch(
        request,
        env
        
    ) {

        const url =
            new URL(request.url);


        /* CORS */

        if (
            request.method ===
            "OPTIONS"
        ) {

            return new Response(
                null,
                {
                    status: 204,
                    headers:
                        CORS_HEADERS
                }
            );

        }


        /* API STATUS */

        if (
            url.pathname === "/" &&
            request.method === "GET"
        ) {

            return json({
                success: true,
                service:
                    "Revenue Leak Hunter API",
                status: "online"
            });

        }


        /* CONTACT */

        if (
            url.pathname ===
            "/api/contact" &&
            request.method === "POST"
        ) {

            return handleContact(
                request,
                env
            );

        }


        /* PORTAL LOGIN */

        if (
            url.pathname ===
            "/api/portal/login" &&
            request.method === "POST"
        ) {

            return handlePortalLogin(
                request,
                env
            );

        }


        /* PORTAL SESSION */

        if (
            url.pathname ===
            "/api/portal/me" &&
            request.method === "GET"
        ) {

            return handlePortalMe(
                request,
                env
            );

        }


        /* PORTAL LOGOUT */

        if (
            url.pathname ===
            "/api/portal/logout" &&
            request.method === "POST"
        ) {

            return handlePortalLogout(
                request,
                env
            );

        }


        return json(
            {
                success: false,
                error:
                    "Route not found."
            },
            404
        );

    }

};