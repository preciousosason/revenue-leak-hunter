import {
    json
} from "../utils/response.js";

import {
    authenticateAdmin
} from "../utils/auth.js";

export async function handleAdminClients(
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

        const clientRows = clients.results || [];

        const interests = await env.DB
            .prepare(
                `SELECT
                    client_id,
                    service_id AS id,
                    service_slug AS slug,
                    service_title AS title,
                    service_number AS number,
                    service_category AS category,
                    service_type AS type
                 FROM client_service_interests
                 ORDER BY CAST(service_number AS INTEGER), service_title`
            )
            .all();

        const servicesByClient = new Map();

        for (const service of interests.results || []) {
            if (!servicesByClient.has(service.client_id)) {
                servicesByClient.set(service.client_id, []);
            }

            const { client_id, ...publicService } = service;
            servicesByClient.get(client_id).push(publicService);
        }

        const clientsWithServices = clientRows.map(client => ({
            ...client,
            services: servicesByClient.get(client.id) || []
        }));

        return json({
            success: true,
            clients: clientsWithServices
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