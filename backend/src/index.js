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
    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const randomValues = new Uint32Array(16);

    crypto.getRandomValues(randomValues);

    const groups = [];

    for (let group = 0; group < 4; group++) {
        let value = "";

        for (let i = 0; i < 4; i++) {
            const index =
                randomValues[group * 4 + i] %
                characters.length;

            value += characters[index];
        }

        groups.push(value);
    }

    return `LH-${groups.join("-")}`;
}

async function hashToken(token) {
    const encoder = new TextEncoder();
    const data = encoder.encode(token);

    const hashBuffer = await crypto.subtle.digest(
        "SHA-256",
        data
    );

    const hashArray = Array.from(
        new Uint8Array(hashBuffer)
    );

    return hashArray
        .map((byte) =>
            byte.toString(16).padStart(2, "0")
        )
        .join("");
}

/* =========================================================
   CONTACT
========================================================= */

function validateContact(data) {
    const errors = {};

    if (
        !data.name ||
        typeof data.name !== "string" ||
        data.name.trim().length < 2
    ) {
        errors.name = "Please provide your name.";
    }

    if (
        !data.email ||
        typeof data.email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            data.email.trim()
        )
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

async function createContact(data, env) {
    const name = data.name.trim();
    const email = data.email.trim().toLowerCase();

    const business = data.business
        ? data.business.trim()
        : null;

    const website = data.website
        ? data.website.trim()
        : null;

    const offer = data.offer.trim();
    const problem = data.problem.trim();

    const message = data.message
        ? data.message.trim()
        : "";

    const portalToken =
        generatePortalToken();

    const tokenHash =
        await hashToken(portalToken);

    const clientId = createId();
    const conversationId = createId();
    const messageId = createId();

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
        `Business: ${business || "Not provided"}`,
        `Website: ${website || "Not provided"}`,
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

async function handleContact(request, env) {
    let data;

    try {
        data = await request.json();
    } catch {
        return json(
            {
                success: false,
                error: "Invalid JSON request."
            },
            400
        );
    }

    const errors =
        validateContact(data);

    if (Object.keys(errors).length > 0) {
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

/* =========================================================
   CLIENT PORTAL SESSIONS
========================================================= */

async function createSession(
    clientId,
    env
) {
    const sessionId = createId();

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

async function authenticateSession(
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

/* =========================================================
   CLIENT PORTAL LOGIN
========================================================= */

async function handlePortalLogin(
    request,
    env
) {
    let data;

    try {
        data = await request.json();
    } catch {
        return json(
            {
                success: false,
                error: "Invalid JSON request."
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

/* =========================================================
   CLIENT PORTAL PROFILE
========================================================= */

async function handlePortalMe(
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
                .bind(session.client_id)
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

/* =========================================================
   CLIENT PORTAL LOGOUT
========================================================= */

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

/* =========================================================
   CLIENT PORTAL MESSAGES
========================================================= */

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
            return json(
                {
                    success: false,
                    error:
                        "No conversation found."
                },
                404
            );
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
            data = await request.json();
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
            !data.message ||
            typeof data.message !== "string"
        ) {
            return json(
                {
                    success: false,
                    error:
                        "Please enter a message."
                },
                400
            );
        }

        const message =
            data.message.trim();

        if (!message) {
            return json(
                {
                    success: false,
                    error:
                        "Please enter a message."
                },
                400
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
                    `SELECT id
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
                        "No conversation found."
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
            .bind(
                conversation.id
            )
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
                `${client?.name || "A client"} sent a new message.`
            )
            .run();

        const createdMessage =
            await env.DB
                .prepare(
                    `SELECT
                        id,
                        sender_type,
                        message,
                        created_at
                     FROM messages
                     WHERE id = ?`
                )
                .bind(messageId)
                .first();

        return json({
            success: true,
            message: createdMessage
        });
    } catch (error) {
        console.error(
            "Portal send message error:",
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

/* =========================================================
   ADMIN SESSIONS
========================================================= */

async function createAdminSession(env) {
    const sessionId = createId();

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

async function authenticateAdmin(
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

/* =========================================================
   ADMIN LOGIN
========================================================= */

async function handleAdminLogin(
    request,
    env
) {
    let data;

    try {
        data = await request.json();
    } catch {
        return json(
            {
                success: false,
                error: "Invalid JSON request."
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

/* =========================================================
   ADMIN SESSION CHECK
========================================================= */

async function handleAdminMe(
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

/* =========================================================
   ADMIN LOGOUT
========================================================= */

async function handleAdminLogout(
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

/* =========================================================
   ADMIN CLIENTS
========================================================= */

async function handleAdminClients(
    request,
    env
) {
    const admin =
        await authenticateAdmin(
            request,
            env
        );

    if (!admin) {
        return json(
            {
                success: false,
                error:
                    "Admin authentication required."
            },
            401
        );
    }

    try {
        const clients =
            await env.DB
                .prepare(
                    `SELECT
                        clients.id,
                        clients.name,
                        clients.email,
                        clients.business,
                        clients.website,
                        clients.created_at,
                        clients.updated_at,
                        conversations.id AS conversation_id,
                        conversations.subject,
                        conversations.status,
                        conversations.updated_at AS conversation_updated_at,
                        (
                            SELECT COUNT(*)
                            FROM messages
                            WHERE messages.conversation_id =
                                  conversations.id
                        ) AS message_count
                     FROM clients
                     LEFT JOIN conversations
                        ON conversations.client_id =
                           clients.id
                     ORDER BY
                        conversations.updated_at DESC,
                        clients.created_at DESC`
                )
                .all();

        return json({
            success: true,
            clients:
                clients.results || []
        });
    } catch (error) {
        console.error(
            "Admin clients error:",
            error
        );

        return json(
            {
                success: false,
                error:
                    "Unable to load clients."
            },
            500
        );
    }
}

/* =========================================================
   ADMIN CONVERSATION
========================================================= */

async function handleAdminConversation(
    request,
    env,
    conversationId
) {
    const admin =
        await authenticateAdmin(
            request,
            env
        );

    if (!admin) {
        return json(
            {
                success: false,
                error:
                    "Admin authentication required."
            },
            401
        );
    }

    try {
        const conversation =
            await env.DB
                .prepare(
                    `SELECT
                        conversations.id,
                        conversations.client_id,
                        conversations.subject,
                        conversations.status,
                        conversations.created_at,
                        conversations.updated_at,
                        clients.name,
                        clients.email,
                        clients.business,
                        clients.website
                     FROM conversations
                     INNER JOIN clients
                        ON clients.id =
                           conversations.client_id
                     WHERE conversations.id = ?`
                )
                .bind(conversationId)
                .first();

        if (!conversation) {
            return json(
                {
                    success: false,
                    error:
                        "Conversation not found."
                },
                404
            );
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
                .bind(conversationId)
                .all();

        return json({
            success: true,
            conversation,
            messages:
                messages.results || []
        });
    } catch (error) {
        console.error(
            "Admin conversation error:",
            error
        );

        return json(
            {
                success: false,
                error:
                    "Unable to load conversation."
            },
            500
        );
    }
}

/* =========================================================
   ADMIN SEND MESSAGE
========================================================= */

async function handleAdminSendMessage(
    request,
    env
) {
    const admin =
        await authenticateAdmin(
            request,
            env
        );

    if (!admin) {
        return json(
            {
                success: false,
                error:
                    "Admin authentication required."
            },
            401
        );
    }

    let data;

    try {
        data = await request.json();
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

    const conversationId =
        typeof data.conversationId ===
        "string"
            ? data.conversationId.trim()
            : "";

    const message =
        typeof data.message ===
        "string"
            ? data.message.trim()
            : "";

    if (!conversationId) {
        return json(
            {
                success: false,
                error:
                    "Conversation ID is required."
            },
            400
        );
    }

    if (!message) {
        return json(
            {
                success: false,
                error:
                    "Please enter a message."
            },
            400
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

    try {
        const conversation =
            await env.DB
                .prepare(
                    `SELECT
                        id,
                        client_id
                     FROM conversations
                     WHERE id = ?`
                )
                .bind(conversationId)
                .first();

        if (!conversation) {
            return json(
                {
                    success: false,
                    error:
                        "Conversation not found."
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
                conversationId,
                "admin",
                message
            )
            .run();

        await env.DB
            .prepare(
                `UPDATE conversations
                 SET updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?`
            )
            .bind(conversationId)
            .run();

        const client =
            await env.DB
                .prepare(
                    `SELECT name
                     FROM clients
                     WHERE id = ?`
                )
                .bind(
                    conversation.client_id
                )
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
                conversation.client_id,
                "admin_message",
                "New Message From Revenue Leak Hunter",
                "You have received a new message regarding your Leak Hunt."
            )
            .run();

        const createdMessage =
            await env.DB
                .prepare(
                    `SELECT
                        id,
                        sender_type,
                        message,
                        created_at
                     FROM messages
                     WHERE id = ?`
                )
                .bind(messageId)
                .first();

        return json({
            success: true,
            clientName:
                client?.name || "",
            message:
                createdMessage
        });
    } catch (error) {
        console.error(
            "Admin send message error:",
            error
        );

        return json(
            {
                success: false,
                error:
                    "Unable to send your reply."
            },
            500
        );
    }
}

/* =========================================================
   ADMIN NOTIFICATIONS
========================================================= */

async function handleAdminNotifications(
    request,
    env
) {
    const admin =
        await authenticateAdmin(
            request,
            env
        );

    if (!admin) {
        return json(
            {
                success: false,
                error:
                    "Admin authentication required."
            },
            401
        );
    }

    try {
        const notifications =
            await env.DB
                .prepare(
                    `SELECT
                        notifications.id,
                        notifications.client_id,
                        notifications.type,
                        notifications.title,
                        notifications.message,
                        notifications.read,
                        notifications.created_at,
                        clients.name AS client_name
                     FROM notifications
                     LEFT JOIN clients
                        ON clients.id =
                           notifications.client_id
                     ORDER BY
                        notifications.created_at DESC
                     LIMIT 100`
                )
                .all();

        return json({
            success: true,
            notifications:
                notifications.results || []
        });
    } catch (error) {
        console.error(
            "Admin notifications error:",
            error
        );

        return json(
            {
                success: false,
                error:
                    "Unable to load notifications."
            },
            500
        );
    }
}

/* =========================================================
   MARK NOTIFICATION AS READ
========================================================= */

async function handleAdminMarkNotificationRead(
    request,
    env
) {
    const admin =
        await authenticateAdmin(
            request,
            env
        );

    if (!admin) {
        return json(
            {
                success: false,
                error:
                    "Admin authentication required."
            },
            401
        );
    }

    let data;

    try {
        data = await request.json();
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
        !data.notificationId ||
        typeof data.notificationId !==
            "string"
    ) {
        return json(
            {
                success: false,
                error:
                    "Notification ID is required."
            },
            400
        );
    }

    try {
        await env.DB
            .prepare(
                `UPDATE notifications
                 SET read = 1
                 WHERE id = ?`
            )
            .bind(
                data.notificationId
            )
            .run();

        return json({
            success: true
        });
    } catch (error) {
        console.error(
            "Mark notification error:",
            error
        );

        return json(
            {
                success: false,
                error:
                    "Unable to update notification."
            },
            500
        );
    }
}

/* =========================================================
   WORKER
========================================================= */

export default {
    async fetch(request, env) {
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

        /* CLIENT PORTAL */

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

        if (
            url.pathname ===
                "/api/portal/messages" &&
            request.method === "GET"
        ) {
            return handlePortalMessages(
                request,
                env
            );
        }

        if (
            url.pathname ===
                "/api/portal/messages" &&
            request.method === "POST"
        ) {
            return handlePortalSendMessage(
                request,
                env
            );
        }

        /* ADMIN LOGIN */

        if (
            url.pathname ===
                "/api/admin/login" &&
            request.method === "POST"
        ) {
            return handleAdminLogin(
                request,
                env
            );
        }

        if (
            url.pathname ===
                "/api/admin/me" &&
            request.method === "GET"
        ) {
            return handleAdminMe(
                request,
                env
            );
        }

        if (
            url.pathname ===
                "/api/admin/logout" &&
            request.method === "POST"
        ) {
            return handleAdminLogout(
                request,
                env
            );
        }

        /* ADMIN CLIENTS */

        if (
            url.pathname ===
                "/api/admin/clients" &&
            request.method === "GET"
        ) {
            return handleAdminClients(
                request,
                env
            );
        }

        /* ADMIN CONVERSATION */

        if (
            url.pathname.startsWith(
                "/api/admin/conversations/"
            ) &&
            request.method === "GET"
        ) {
            const conversationId =
                url.pathname.split(
                    "/"
                ).pop();

            return handleAdminConversation(
                request,
                env,
                conversationId
            );
        }

        /* ADMIN SEND MESSAGE */

        if (
            url.pathname ===
                "/api/admin/messages" &&
            request.method === "POST"
        ) {
            return handleAdminSendMessage(
                request,
                env
            );
        }

        /* ADMIN NOTIFICATIONS */

        if (
            url.pathname ===
                "/api/admin/notifications" &&
            request.method === "GET"
        ) {
            return handleAdminNotifications(
                request,
                env
            );
        }

        /* MARK NOTIFICATION READ */

        if (
            url.pathname ===
                "/api/admin/notifications/read" &&
            request.method === "POST"
        ) {
            return handleAdminMarkNotificationRead(
                request,
                env
            );
        }

        /* UNKNOWN ROUTE */

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