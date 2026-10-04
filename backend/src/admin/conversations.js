import { authenticateAdmin } from "../utils/auth.js";
import { attachFilesToMessages } from "../utils/files.js";
import { json } from "../utils/response.js";

export async function handleAdminConversation(
    request,
    env,
    conversationId
) {
    const admin = await authenticateAdmin(request, env);

    if (!admin) {
        return json(
            { error: "Admin authentication required." },
            401
        );
    }

    if (!conversationId) {
        return json(
            { error: "Conversation ID is required." },
            400
        );
    }

    try {
        // Get conversation + client information
        const conversation = await env.DB
            .prepare(
                `SELECT
                    c.id,
                    c.client_id,
                    c.subject,
                    c.status,
                    c.created_at,
                    c.updated_at,

                    cl.name AS client_name,
                    cl.email AS client_email,
                    cl.business AS client_business,
                    cl.website AS client_website

                 FROM conversations c

                 INNER JOIN clients cl
                    ON cl.id = c.client_id

                 WHERE c.id = ?`
            )
            .bind(conversationId)
            .first();

        if (!conversation) {
            return json(
                { error: "Conversation not found." },
                404
            );
        }

        const { results: services } = await env.DB
            .prepare(
                `SELECT
                    service_id AS id,
                    service_slug AS slug,
                    service_title AS title,
                    service_number AS number,
                    service_category AS category,
                    service_type AS type
                 FROM client_service_interests
                 WHERE client_id = ?
                 ORDER BY CAST(service_number AS INTEGER), service_title`
            )
            .bind(conversation.client_id)
            .all();

        conversation.services = services || [];

        // Get all messages in chronological order
        const { results: messages } = await env.DB
            .prepare(
                `SELECT
                    id,
                    conversation_id,
                    sender_type,
                    message,
                    created_at
                 FROM messages
                 WHERE conversation_id = ?
                 ORDER BY created_at ASC`
            )
            .bind(conversationId)
            .all();

        // Attach any files belonging to those messages
        const messagesWithFiles =
            await attachFilesToMessages(
                env,
                messages || []
            );

        return json({
            success: true,
            conversation,
            messages: messagesWithFiles
        });
    } catch (error) {
        console.error(
            "Admin conversation error:",
            error
        );

        return json(
            {
                error: "Failed to load conversation."
            },
            500
        );
    }
}