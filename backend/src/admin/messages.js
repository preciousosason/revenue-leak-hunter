import {
    json
} from "../utils/response.js";

import {
    createId
} from "../utils/ids.js";

import {
    authenticateAdmin
} from "../utils/auth.js";

import {
    attachFilesToMessages
} from "../utils/files.js";


export async function handleAdminSendMessage(
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

    const conversationId =
        typeof data.conversationId === "string"
            ? data.conversationId.trim()
            : "";

    const message =
        typeof data.message === "string"
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
                .bind(
                    conversationId
                )
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
            .bind(
                conversationId
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
                "New Message From Conversion Leak Hunter",
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
            message: {
                ...createdMessage,
                files: []
            }
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