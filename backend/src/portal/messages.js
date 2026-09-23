import {
    json
} from "../utils/response.js";

import {
    createId
} from "../utils/ids.js";

import {
    authenticateSession
} from "../utils/auth.js";

import {
    attachFilesToMessages
} from "../utils/files.js";

export async function handlePortalMessages(
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
                .bind(
                    session.client_id
                )
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

        const messagesResult =
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
                .bind(
                    conversation.id
                )
                .all();

        const messages =
            await attachFilesToMessages(
                env,
                messagesResult.results || []
            );

        return json({
            success: true,
            conversation,
            messages
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

export async function handlePortalSendMessage(
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
                .bind(
                    session.client_id
                )
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
                .bind(
                    session.client_id
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
                        conversation_id,
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
            message: {
                ...createdMessage,
                files: []
            },
            conversation: {
                id: conversation.id
            }
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